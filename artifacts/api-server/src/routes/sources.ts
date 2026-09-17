import { Router, type Request, type Response } from "express";
import { z } from "zod";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import {
  db,
  sourcesTable,
  extractionsTable,
  reviewDraftsTable,
  usageCountersTable,
} from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { authMiddleware } from "../middlewares/auth";
import { detectScreenshotText, type NormalizedLine } from "../lib/textract";
import { logger } from "../lib/logger";

function getParam(param: unknown): string {
  if (Array.isArray(param)) return String(param[0] ?? "");
  return typeof param === "string" ? param : String(param ?? "");
}

const router = Router();
router.use(authMiddleware);

// Storage directory for uploaded images
const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");
fs.mkdir(UPLOADS_DIR, { recursive: true }).catch((err) =>
  logger.error({ err }, "Failed to create uploads directory"),
);

const MAX_BYTES = 3 * 1024 * 1024; // 3 MiB strictly per TRD specification

const uploadJsonSchema = z.object({
  base64: z.string().optional(),
  dataUrl: z.string().optional(),
  noteText: z.string().optional(),
  originalFilename: z.string().optional(),
  mime: z.string().optional(),
});

const draftSchema = z.object({
  selectedLineIds: z.array(z.string()).default([]),
  formFields: z.record(z.unknown()).default({}),
  basedOnCaseVersion: z.number().int().default(1),
});

// ============================================================================
// 1. POST /api/sources/:id/upload - Upload image bytes or manual note
// ============================================================================
router.post("/:id/upload", async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const sourceId = getParam(req.params.id);

  try {
    const [source] = await db
      .select()
      .from(sourcesTable)
      .where(and(eq(sourcesTable.id, sourceId), eq(sourcesTable.ownerId, userId)))
      .limit(1);

    if (!source) {
      res.status(404).json({ error: "Source slot not found" });
      return;
    }

    let buffer: Buffer | null = null;
    let mime = "application/octet-stream";
    let filename = source.originalFilename || `upload-${sourceId}.png`;
    let noteText = source.noteText;

    if (Buffer.isBuffer(req.body) && req.body.length > 0) {
      buffer = req.body;
      const reqMime = req.headers["content-type"];
      if (reqMime) mime = reqMime.split(";")[0].trim();
    } else if (req.body && typeof req.body === "object") {
      const parse = uploadJsonSchema.safeParse(req.body);
      if (parse.success) {
        if (parse.data.noteText) {
          noteText = parse.data.noteText;
        }
        if (parse.data.dataUrl) {
          const parts = parse.data.dataUrl.split(",");
          const mimeMatch = parts[0]?.match(/:(.*?);/);
          if (mimeMatch && mimeMatch[1]) mime = mimeMatch[1];
          if (parts[1]) buffer = Buffer.from(parts[1], "base64");
        } else if (parse.data.base64) {
          buffer = Buffer.from(parse.data.base64, "base64");
          if (parse.data.mime) mime = parse.data.mime;
        }
        if (parse.data.originalFilename) filename = parse.data.originalFilename;
      }
    }

    // Size limit check: max 3 MiB
    if (buffer && buffer.length > MAX_BYTES) {
      res.status(413).json({
        error: `File size ${buffer.length} bytes exceeds maximum allowed limit of 3 MiB (3,145,728 bytes).`,
      });
      return;
    }

    let sha256: string | null = null;
    let filePath: string | null = null;

    if (buffer && buffer.length > 0) {
      sha256 = crypto.createHash("sha256").update(buffer).digest("hex");
      const ext = mime.includes("jpeg") || mime.includes("jpg") ? ".jpg" : ".png";
      const safeFilename = `${sourceId}-${sha256.slice(0, 12)}${ext}`;
      filePath = path.join(UPLOADS_DIR, safeFilename);
      await fs.writeFile(filePath, buffer);
    }

    // Update source
    const [updatedSource] = await db
      .update(sourcesTable)
      .set({
        storagePath: filePath || source.storagePath,
        originalFilename: filename,
        mime: buffer ? mime : source.mime,
        byteSize: buffer ? buffer.length : source.byteSize,
        sha256: sha256 || source.sha256,
        noteText: noteText || source.noteText,
        uploadState: "finalized",
      })
      .where(eq(sourcesTable.id, sourceId))
      .returning();

    res.json({
      success: true,
      source: updatedSource,
      hasImageBytes: !!buffer,
    });
  } catch (err: unknown) {
    logger.error({ err, sourceId, userId }, "Failed to upload source file");
    res.status(500).json({ error: "Upload failed" });
  }
});

// ============================================================================
// 2. POST /api/sources/:id/finalize - Lock metadata and mark source finalized
// ============================================================================
router.post("/:id/finalize", async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const sourceId = getParam(req.params.id);

  try {
    const [source] = await db
      .select()
      .from(sourcesTable)
      .where(and(eq(sourcesTable.id, sourceId), eq(sourcesTable.ownerId, userId)))
      .limit(1);

    if (!source) {
      res.status(404).json({ error: "Source not found" });
      return;
    }

    const [finalized] = await db
      .update(sourcesTable)
      .set({ uploadState: "finalized" })
      .where(eq(sourcesTable.id, sourceId))
      .returning();

    res.json({ source: finalized });
  } catch (err: unknown) {
    logger.error({ err, sourceId, userId }, "Failed to finalize source");
    res.status(500).json({ error: "Could not finalize source" });
  }
});

// ============================================================================
// 3. POST /api/sources/:id/read - Trigger AWS Textract OCR & acquire lease
// ============================================================================
router.post("/:id/read", async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const sourceId = getParam(req.params.id);

  try {
    const [source] = await db
      .select()
      .from(sourcesTable)
      .where(and(eq(sourcesTable.id, sourceId), eq(sourcesTable.ownerId, userId)))
      .limit(1);

    if (!source) {
      res.status(404).json({ error: "Source not found" });
      return;
    }

    // 1. Quota check: Daily limits (User limit: 20, Project limit: 1000)
    const today = new Date().toISOString().split("T")[0]!;

    // Check user quota
    const [userCounter] = await db
      .select()
      .from(usageCountersTable)
      .where(
        and(
          eq(usageCountersTable.scope, "user"),
          eq(usageCountersTable.subjectId, userId),
          eq(usageCountersTable.utcDate, today),
        ),
      );

    if (userCounter && userCounter.reservedAttempts >= 20) {
      res.status(429).json({
        error: "User OCR quota reached: maximum 20 reading attempts allowed per day.",
      });
      return;
    }

    // Reserve attempt
    if (userCounter) {
      await db
        .update(usageCountersTable)
        .set({ reservedAttempts: userCounter.reservedAttempts + 1 })
        .where(eq(usageCountersTable.id, userCounter.id));
    } else {
      await db.insert(usageCountersTable).values({
        id: `usage-${crypto.randomUUID()}`,
        scope: "user",
        subjectId: userId,
        utcDate: today,
        reservedAttempts: 1,
      });
    }

    // 2. Acquire extraction lease
    const extractionId = `ext-${crypto.randomUUID()}`;
    const leaseExpires = new Date(Date.now() + 60 * 1000); // 60s lease per specification

    await db.insert(extractionsTable).values({
      id: extractionId,
      sourceId,
      ownerId: userId,
      status: "processing",
      leaseExpiresAt: leaseExpires,
      startedAt: new Date(),
    });

    await db
      .update(sourcesTable)
      .set({ extractionState: "extracting" })
      .where(eq(sourcesTable.id, sourceId));

    // 3. Read image bytes if stored locally
    let imageBytes: Buffer | undefined;
    if (source.storagePath) {
      try {
        imageBytes = await fs.readFile(source.storagePath);
      } catch (fileErr: unknown) {
        logger.warn({ fileErr, path: source.storagePath }, "Could not read local file bytes, using text hint");
      }
    }

    // 4. Call Textract DetectDocumentText (or deterministic synthetic fixture)
    const textractResult = await detectScreenshotText(imageBytes, {
      filename: source.originalFilename || undefined,
      textHint: source.noteText || undefined,
    });

    // 5. Commit extraction results
    const [completedExtraction] = await db
      .update(extractionsTable)
      .set({
        status: "ready",
        provider: textractResult.provider,
        awsRequestId: textractResult.awsRequestId,
        lines: textractResult.lines,
        finishedAt: new Date(),
      })
      .where(eq(extractionsTable.id, extractionId))
      .returning();

    // Mark source as ready
    await db
      .update(sourcesTable)
      .set({ extractionState: "ready" })
      .where(eq(sourcesTable.id, sourceId));

    res.json({
      success: true,
      extraction: completedExtraction,
      lines: textractResult.lines,
    });
  } catch (err: unknown) {
    logger.error({ err, sourceId, userId }, "Failed to perform OCR reading");
    await db
      .update(sourcesTable)
      .set({ extractionState: "failed" })
      .where(eq(sourcesTable.id, sourceId));
    res.status(500).json({ error: "Text reading failed" });
  }
});

// ============================================================================
// 4. GET /api/sources/:id/extraction - Retrieve latest extraction results
// ============================================================================
router.get("/:id/extraction", async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const sourceId = getParam(req.params.id);

  try {
    const [extraction] = await db
      .select()
      .from(extractionsTable)
      .where(and(eq(extractionsTable.sourceId, sourceId), eq(extractionsTable.ownerId, userId)))
      .orderBy(desc(extractionsTable.startedAt))
      .limit(1);

    if (!extraction) {
      res.status(404).json({ error: "No extraction found for this source" });
      return;
    }

    const typedLines = extraction.lines as NormalizedLine[];
    res.json({
      extraction,
      lines: typedLines,
    });
  } catch (err: unknown) {
    logger.error({ err, sourceId, userId }, "Failed to fetch extraction");
    res.status(500).json({ error: "Could not retrieve extraction" });
  }
});

// ============================================================================
// 5. PUT /api/sources/:id/draft - Autosave review draft
// ============================================================================
router.put("/:id/draft", async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const sourceId = getParam(req.params.id);

  const parse = draftSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Validation error", details: parse.error.format() });
    return;
  }

  try {
    const [source] = await db
      .select()
      .from(sourcesTable)
      .where(and(eq(sourcesTable.id, sourceId), eq(sourcesTable.ownerId, userId)))
      .limit(1);

    if (!source) {
      res.status(404).json({ error: "Source not found" });
      return;
    }

    const [existingDraft] = await db
      .select()
      .from(reviewDraftsTable)
      .where(and(eq(reviewDraftsTable.sourceId, sourceId), eq(reviewDraftsTable.ownerId, userId)))
      .limit(1);

    let draft;
    if (existingDraft) {
      [draft] = await db
        .update(reviewDraftsTable)
        .set({
          selectedLineIds: parse.data.selectedLineIds,
          formFields: parse.data.formFields,
          basedOnCaseVersion: parse.data.basedOnCaseVersion,
          updatedAt: new Date(),
        })
        .where(eq(reviewDraftsTable.id, existingDraft.id))
        .returning();
    } else {
      [draft] = await db
        .insert(reviewDraftsTable)
        .values({
          id: `draft-${crypto.randomUUID()}`,
          sourceId,
          caseId: source.caseId,
          ownerId: userId,
          selectedLineIds: parse.data.selectedLineIds,
          formFields: parse.data.formFields,
          basedOnCaseVersion: parse.data.basedOnCaseVersion,
          updatedAt: new Date(),
        })
        .returning();
    }

    res.json({ draft, savedAt: new Date().toISOString() });
  } catch (err: unknown) {
    logger.error({ err, sourceId, userId }, "Failed to autosave review draft");
    res.status(500).json({ error: "Could not autosave draft" });
  }
});

// ============================================================================
// 6. GET /api/sources/:id/draft - Retrieve review draft
// ============================================================================
router.get("/:id/draft", async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const sourceId = getParam(req.params.id);

  try {
    const [draft] = await db
      .select()
      .from(reviewDraftsTable)
      .where(and(eq(reviewDraftsTable.sourceId, sourceId), eq(reviewDraftsTable.ownerId, userId)))
      .limit(1);

    res.json({ draft: draft || null });
  } catch (err: unknown) {
    logger.error({ err, sourceId, userId }, "Failed to retrieve draft");
    res.status(500).json({ error: "Could not retrieve draft" });
  }
});

// ============================================================================
// 7. GET /api/sources/:id/file - Stream image file
// ============================================================================
router.get("/:id/file", async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const sourceId = getParam(req.params.id);

  try {
    const [source] = await db
      .select()
      .from(sourcesTable)
      .where(and(eq(sourcesTable.id, sourceId), eq(sourcesTable.ownerId, userId)))
      .limit(1);

    if (!source || !source.storagePath) {
      res.status(404).json({ error: "Image file not found" });
      return;
    }

    const buffer = await fs.readFile(source.storagePath);
    res.setHeader("Content-Type", source.mime || "image/png");
    res.setHeader("Cache-Control", "private, no-cache");
    res.send(buffer);
  } catch (err: unknown) {
    logger.error({ err, sourceId, userId }, "Failed to stream source file");
    res.status(404).json({ error: "File not accessible" });
  }
});

export default router;
