import { Router, type Request, type Response } from "express";
import crypto from "crypto";
import {
  db,
  profilesTable,
  casesTable,
  sourcesTable,
  recordsTable,
  promiseTermsTable,
  recordLinksTable,
  caseOutcomesTable,
  deletionJobsTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../middlewares/auth";
import { logger } from "../lib/logger";

const router = Router();
router.use(authMiddleware);

// ============================================================================
// 1. GET /api/account/export - Full structured export of owner's data
// ============================================================================
router.get("/export", async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;

  try {
    const [profile] = await db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.id, userId))
      .limit(1);

    const cases = await db
      .select()
      .from(casesTable)
      .where(eq(casesTable.ownerId, userId));

    const sources = await db
      .select({
        id: sourcesTable.id,
        caseId: sourcesTable.caseId,
        kind: sourcesTable.kind,
        originalFilename: sourcesTable.originalFilename,
        mime: sourcesTable.mime,
        byteSize: sourcesTable.byteSize,
        sha256: sourcesTable.sha256,
        noteText: sourcesTable.noteText,
        reportedSourceAt: sourcesTable.reportedSourceAt,
        sourceTimePrecision: sourcesTable.sourceTimePrecision,
        channel: sourcesTable.channel,
        uploadState: sourcesTable.uploadState,
        extractionState: sourcesTable.extractionState,
        createdAt: sourcesTable.createdAt,
      })
      .from(sourcesTable)
      .where(eq(sourcesTable.ownerId, userId));

    const records = await db
      .select()
      .from(recordsTable)
      .where(eq(recordsTable.ownerId, userId));

    const promiseTerms = await db
      .select()
      .from(promiseTermsTable);

    const termsMap: Record<string, typeof promiseTerms[0]> = {};
    for (const pt of promiseTerms) {
      termsMap[pt.recordId] = pt;
    }

    const enrichedRecords = records.map((r) => ({
      ...r,
      promise: termsMap[r.id] || null,
    }));

    const links = await db
      .select()
      .from(recordLinksTable)
      .where(eq(recordLinksTable.ownerId, userId));

    const outcomes = await db
      .select()
      .from(caseOutcomesTable)
      .where(eq(caseOutcomesTable.ownerId, userId));

    const exportData = {
      exportVersion: "1.0",
      generatedAt: new Date().toISOString(),
      user: profile || { id: userId },
      cases,
      sources,
      records: enrichedRecords,
      links,
      outcomes,
    };

    res.setHeader("Content-Disposition", `attachment; filename="still-owed-export-${userId}.json"`);
    res.json(exportData);
  } catch (err: unknown) {
    logger.error({ err, userId }, "Failed to export account data");
    res.status(500).json({ error: "Could not export account data" });
  }
});

// ============================================================================
// 2. POST /api/account/delete - Tombstone account and queue complete cleanup
// ============================================================================
router.post("/delete", async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;

  try {
    // 1. Tombstone user profile
    await db
      .update(profilesTable)
      .set({ deletionRequestedAt: new Date() })
      .where(eq(profilesTable.id, userId));

    // 2. Mark all cases as deletion_pending
    await db
      .update(casesTable)
      .set({ lifecycle: "deletion_pending", deletionRequestedAt: new Date() })
      .where(eq(casesTable.ownerId, userId));

    // 3. Collect all storage paths
    const sources = await db
      .select({ storagePath: sourcesTable.storagePath })
      .from(sourcesTable)
      .where(eq(sourcesTable.ownerId, userId));

    const paths = sources.map((s) => s.storagePath).filter(Boolean);

    // 4. Create deletion job
    await db.insert(deletionJobsTable).values({
      id: `del-acc-${crypto.randomUUID()}`,
      ownerId: userId,
      status: "pending",
      objectPaths: paths,
      nextAttemptAt: new Date(),
    });

    res.json({
      success: true,
      message: "Account access removed; all personal cases and files queued for deletion.",
    });
  } catch (err: unknown) {
    logger.error({ err, userId }, "Failed to initiate account deletion");
    res.status(500).json({ error: "Could not process account deletion" });
  }
});

export default router;
