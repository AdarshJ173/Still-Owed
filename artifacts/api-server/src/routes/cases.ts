import { Router, type Request, type Response } from "express";
import { z } from "zod";
import crypto from "crypto";
import {
  db,
  casesTable,
  sourcesTable,
  recordsTable,
  promiseTermsTable,
  recordLinksTable,
  caseOutcomesTable,
  auditEventsTable,
  deletionJobsTable,
} from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { authMiddleware } from "../middlewares/auth";
import { logger } from "../lib/logger";

function getParam(param: unknown): string {
  if (Array.isArray(param)) return String(param[0] ?? "");
  return typeof param === "string" ? param : String(param ?? "");
}

const router = Router();
router.use(authMiddleware);

// ============================================================================
// SCHEMAS
// ============================================================================
const createCaseSchema = z.object({
  merchantLabel: z.string().min(1, "Merchant or store name is required").max(100),
  itemLabel: z.string().min(1, "Item description is required").max(200),
  orderReference: z.string().max(100).optional(),
  requestedAmountPaise: z.number().int().nonnegative().optional(),
  desiredResolution: z.enum(["refund", "replacement", "cancellation", "repair", "other"]).default("refund"),
});

const uploadSlotSchema = z.object({
  kind: z.enum(["image", "note"]),
  originalFilename: z.string().max(255).optional(),
  mime: z.string().max(100).optional(),
  channel: z.enum(["chat", "email", "phone", "portal", "other"]).default("chat"),
  noteText: z.string().max(10000).optional(),
  reportedSourceAt: z.string().optional(),
});

const createRecordSchema = z.object({
  expectedCaseVersion: z.number().int().positive().optional(),
  kind: z.enum(["statement", "promise", "event", "outcome"]),
  sourceId: z.string().optional(),
  selectedLineIds: z.array(z.string()).default([]),
  verbatimText: z.string().min(1, "Verbatim text is required").max(5000),
  correctedText: z.string().max(5000).optional(),
  authorType: z.enum(["support", "user"]).default("support"),
  reportedAt: z.string().optional(),
  precision: z.enum(["exact", "day", "approximate", "unknown"]).default("day"),
  revisionOf: z.string().optional(),
  // Promise-specific fields if kind === 'promise'
  promise: z
    .object({
      actionKind: z.enum(["refund", "replacement", "pickup", "response", "other"]).default("refund"),
      conditionLabel: z.string().max(200).optional(),
      triggerEventId: z.string().optional(),
      rawWindow: z.string().max(100).optional(), // e.g. "48 hours", "5 working days"
      durationHours: z.number().int().positive().optional(),
      statedDueAt: z.string().optional(),
      chosenCheckAt: z.string().optional(),
      timezone: z.string().default("Asia/Kolkata"),
      dateBasis: z.enum(["calendar", "business_days", "user_chosen", "unknown"]).default("calendar"),
      userDisposition: z
        .enum(["pending", "condition_unmet", "window_elapsed", "fulfilled", "superseded", "cancelled"])
        .default("pending"),
    })
    .optional(),
});

const createLinkSchema = z.object({
  earlierRecordId: z.string().min(1),
  laterRecordId: z.string().min(1),
  relation: z.enum([
    "changed_date",
    "changed_explanation",
    "confirms_condition",
    "additional_info",
    "correction",
  ]),
});

const createOutcomeSchema = z.object({
  kind: z.enum([
    "full_refund",
    "partial_refund",
    "replacement_received",
    "closed_without_resolution",
    "withdrawn",
    "other",
  ]),
  receivedTotalPaise: z.number().int().nonnegative().optional(),
  receivedDate: z.string().optional(),
  note: z.string().max(2000).optional(),
});

// ============================================================================
// 1. GET /api/cases - List cases for authenticated user
// ============================================================================
router.get("/", async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  try {
    const cases = await db
      .select()
      .from(casesTable)
      .where(
        and(
          eq(casesTable.ownerId, userId),
          eq(casesTable.lifecycle, "active"),
        ),
      )
      .orderBy(desc(casesTable.updatedAt));

    const closedCases = await db
      .select()
      .from(casesTable)
      .where(
        and(
          eq(casesTable.ownerId, userId),
          eq(casesTable.lifecycle, "resolved"),
        ),
      )
      .orderBy(desc(casesTable.updatedAt));

    res.json({ active: cases, closed: closedCases, total: cases.length + closedCases.length });
  } catch (err: unknown) {
    logger.error({ err, userId }, "Failed to fetch cases");
    res.status(500).json({ error: "Could not retrieve cases" });
  }
});

// ============================================================================
// 2. POST /api/cases - Create new case with limit check (max 5 active cases)
// ============================================================================
router.post("/", async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const parse = createCaseSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Validation error", details: parse.error.format() });
    return;
  }

  try {
    // Check active cases capacity limit (max 5 active cases per user)
    const existingActive = await db
      .select()
      .from(casesTable)
      .where(
        and(
          eq(casesTable.ownerId, userId),
          eq(casesTable.lifecycle, "active"),
        ),
      );

    if (existingActive.length >= 5) {
      res.status(403).json({
        error: "Capacity limit reached: maximum of 5 active cases allowed per user in the initial release.",
      });
      return;
    }

    const caseId = `case-${crypto.randomUUID()}`;
    const [newCase] = await db
      .insert(casesTable)
      .values({
        id: caseId,
        ownerId: userId,
        merchantLabel: parse.data.merchantLabel,
        itemLabel: parse.data.itemLabel,
        orderReference: parse.data.orderReference,
        requestedAmountPaise: parse.data.requestedAmountPaise,
        desiredResolution: parse.data.desiredResolution,
        lifecycle: "active",
        version: 1,
      })
      .returning();

    // Log audit event
    await db.insert(auditEventsTable).values({
      id: `audit-${crypto.randomUUID()}`,
      caseId: newCase.id,
      ownerId: userId,
      action: "case.created",
      targetId: newCase.id,
      targetVersion: 1,
      requestId: req.id ? String(req.id) : crypto.randomUUID(),
    });

    res.status(201).json(newCase);
  } catch (err: unknown) {
    logger.error({ err, userId }, "Failed to create case");
    res.status(500).json({ error: "Could not create case" });
  }
});
// ============================================================================
// 2b. POST /api/cases/seed-demo - Ensure Fictional Demo Store case exists
// ============================================================================
router.post("/seed-demo", async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;

  try {
    // Check if demo case already exists for this user
    const [existingDemo] = await db
      .select()
      .from(casesTable)
      .where(
        and(
          eq(casesTable.ownerId, userId),
          eq(casesTable.merchantLabel, "Demo Store"),
          eq(casesTable.lifecycle, "active"),
        ),
      )
      .limit(1);

    let caseId: string;

    if (existingDemo) {
      const existingRecords = await db
        .select({ id: recordsTable.id })
        .from(recordsTable)
        .where(eq(recordsTable.caseId, existingDemo.id));

      if (existingRecords.length >= 2) {
        res.json({ success: true, caseId: existingDemo.id, alreadyExisted: true });
        return;
      }
      caseId = existingDemo.id;
    } else {
      caseId = `case-demo-${crypto.randomUUID()}`;
      await db.insert(casesTable).values({
        id: caseId,
        ownerId: userId,
        merchantLabel: "Demo Store",
        itemLabel: "Noise-Cancelling Headphones",
        orderReference: "DEMO-104",
        requestedAmountPaise: 480000, // ₹4,800
        desiredResolution: "refund",
        lifecycle: "active",
        version: 3,
      });
    }

    // 2. Source 1 (12 Sep 2026)
    const source1Id = `source-${crypto.randomUUID()}`;
    await db.insert(sourcesTable).values({
      id: source1Id,
      caseId,
      ownerId: userId,
      kind: "image",
      originalFilename: "demo-store-chat-12sep.png",
      mime: "image/png",
      channel: "chat",
      noteText: "Support Agent: We will issue the refund within 48 hours after warehouse receipt.",
      reportedSourceAt: new Date("2026-09-12T14:32:00Z"),
      uploadState: "finalized",
      extractionState: "ready",
    });

    // Record 1 & PromiseTerm 1
    const record1Id = `record-${crypto.randomUUID()}`;
    await db.insert(recordsTable).values({
      id: record1Id,
      caseId,
      ownerId: userId,
      kind: "promise",
      sourceId: source1Id,
      selectedLineIds: ["line-4"],
      verbatimText: "We will issue the refund within 48 hours after warehouse receipt.",
      authorType: "support",
      reportedAt: new Date("2026-09-12T14:32:00Z"),
      precision: "exact",
      confirmedAt: new Date("2026-09-12T14:35:00Z"),
    });

    await db.insert(promiseTermsTable).values({
      recordId: record1Id,
      actionKind: "refund",
      conditionLabel: "Warehouse receipt confirmation",
      rawWindow: "48 hours",
      durationHours: 48,
      dateBasis: "calendar",
      userDisposition: "condition_unmet",
    });

    // 3. Source 2 (15 Sep 2026)
    const source2Id = `source-${crypto.randomUUID()}`;
    await db.insert(sourcesTable).values({
      id: source2Id,
      caseId,
      ownerId: userId,
      kind: "image",
      originalFilename: "demo-store-chat-15sep.png",
      mime: "image/png",
      channel: "chat",
      noteText: "Support Agent: Please allow five working days after warehouse receipt.",
      reportedSourceAt: new Date("2026-09-15T11:15:00Z"),
      uploadState: "finalized",
      extractionState: "ready",
    });

    // Record 2 & PromiseTerm 2
    const record2Id = `record-${crypto.randomUUID()}`;
    await db.insert(recordsTable).values({
      id: record2Id,
      caseId,
      ownerId: userId,
      kind: "promise",
      sourceId: source2Id,
      selectedLineIds: ["line-3"],
      verbatimText: "Please allow five working days after warehouse receipt.",
      authorType: "support",
      reportedAt: new Date("2026-09-15T11:15:00Z"),
      precision: "exact",
      confirmedAt: new Date("2026-09-15T11:20:00Z"),
    });

    await db.insert(promiseTermsTable).values({
      recordId: record2Id,
      actionKind: "refund",
      conditionLabel: "Warehouse receipt confirmation",
      rawWindow: "5 working days",
      dateBasis: "business_days",
      userDisposition: "condition_unmet",
    });

    // 4. RecordLink: Record 1 -> Record 2 with relation 'changed_date'
    await db.insert(recordLinksTable).values({
      id: `link-${crypto.randomUUID()}`,
      caseId,
      ownerId: userId,
      earlierRecordId: record1Id,
      laterRecordId: record2Id,
      relation: "changed_date",
    });

    res.status(201).json({ success: true, caseId, alreadyExisted: false });
  } catch (err: unknown) {
    logger.error({ err, userId }, "Failed to seed demo case");
    res.status(500).json({ error: "Could not seed demo case" });
  }
});


// ============================================================================
// 3. GET /api/cases/:id - Get full case details with sources, records & promises
// ============================================================================
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const caseId = getParam(req.params.id);

  try {
    const [caseItem] = await db
      .select()
      .from(casesTable)
      .where(
        and(
          eq(casesTable.id, caseId),
          eq(casesTable.ownerId, userId),
        ),
      )
      .limit(1);

    if (!caseItem) {
      res.status(404).json({ error: "Case not found" });
      return;
    }

    // Load sources
    const sources = await db
      .select()
      .from(sourcesTable)
      .where(
        and(
          eq(sourcesTable.caseId, caseId),
          eq(sourcesTable.ownerId, userId),
        ),
      )
      .orderBy(desc(sourcesTable.createdAt));

    // Load records
    const records = await db
      .select()
      .from(recordsTable)
      .where(
        and(
          eq(recordsTable.caseId, caseId),
          eq(recordsTable.ownerId, userId),
        ),
      )
      .orderBy(recordsTable.createdAt);

    // Load promise terms for records
    const promiseTerms = await db
      .select()
      .from(promiseTermsTable);

    const promiseTermsMap = new Map(promiseTerms.map((pt) => [pt.recordId, pt]));

    const enrichedRecords = records.map((r) => ({
      ...r,
      promise: promiseTermsMap.get(r.id) || null,
    }));

    // Load record links
    const links = await db
      .select()
      .from(recordLinksTable)
      .where(
        and(
          eq(recordLinksTable.caseId, caseId),
          eq(recordLinksTable.ownerId, userId),
        ),
      );

    // Load outcomes
    const outcomes = await db
      .select()
      .from(caseOutcomesTable)
      .where(
        and(
          eq(caseOutcomesTable.caseId, caseId),
          eq(caseOutcomesTable.ownerId, userId),
        ),
      );

    res.json({
      case: caseItem,
      sources,
      records: enrichedRecords,
      links,
      outcomes,
    });
  } catch (err: unknown) {
    logger.error({ err, caseId, userId }, "Failed to retrieve case detail");
    res.status(500).json({ error: "Could not retrieve case details" });
  }
});

// ============================================================================
// 4. POST /api/cases/:id/upload-slot - Reserve upload capacity (max 30 sources)
// ============================================================================
router.post("/:id/upload-slot", async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const caseId = getParam(req.params.id);

  const parse = uploadSlotSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Validation error", details: parse.error.format() });
    return;
  }

  try {
    // Verify case ownership
    const [caseItem] = await db
      .select()
      .from(casesTable)
      .where(
        and(
          eq(casesTable.id, caseId),
          eq(casesTable.ownerId, userId),
        ),
      )
      .limit(1);

    if (!caseItem) {
      res.status(404).json({ error: "Case not found" });
      return;
    }

    // Check source capacity limit (max 30 sources per case)
    const existingSources = await db
      .select()
      .from(sourcesTable)
      .where(
        and(
          eq(sourcesTable.caseId, caseId),
          eq(sourcesTable.ownerId, userId),
        ),
      );

    if (existingSources.length >= 30) {
      res.status(403).json({
        error: "Capacity limit reached: maximum of 30 sources allowed per case in the initial release.",
      });
      return;
    }

    const sourceId = `source-${crypto.randomUUID()}`;
    const storagePath = `cases/${userId}/${caseId}/${sourceId}`;

    const [source] = await db
      .insert(sourcesTable)
      .values({
        id: sourceId,
        caseId,
        ownerId: userId,
        kind: parse.data.kind,
        storagePath,
        originalFilename: parse.data.originalFilename,
        mime: parse.data.mime,
        channel: parse.data.channel,
        noteText: parse.data.noteText,
        reportedSourceAt: parse.data.reportedSourceAt ? new Date(parse.data.reportedSourceAt) : new Date(),
        uploadState: parse.data.kind === "note" ? "finalized" : "reserved",
        extractionState: "none",
      })
      .returning();

    res.status(201).json({
      source,
      uploadTargetUrl: `/api/sources/${sourceId}/upload`,
      maxBytes: 3 * 1024 * 1024, // 3 MiB per specification
    });
  } catch (err: unknown) {
    logger.error({ err, caseId, userId }, "Failed to reserve upload slot");
    res.status(500).json({ error: "Could not reserve upload slot" });
  }
});

// ============================================================================
// 5. POST /api/cases/:id/records - Atomic record and promise confirmation
// ============================================================================
router.post("/:id/records", async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const caseId = getParam(req.params.id);

  const parse = createRecordSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Validation error", details: parse.error.format() });
    return;
  }

  try {
    const [caseItem] = await db
      .select()
      .from(casesTable)
      .where(
        and(
          eq(casesTable.id, caseId),
          eq(casesTable.ownerId, userId),
        ),
      )
      .limit(1);

    if (!caseItem) {
      res.status(404).json({ error: "Case not found" });
      return;
    }

    // Expected version validation to prevent stale concurrent writes
    if (parse.data.expectedCaseVersion && parse.data.expectedCaseVersion !== caseItem.version) {
      res.status(409).json({
        error: `Conflict: expected case version ${parse.data.expectedCaseVersion} does not match current version ${caseItem.version}. Please refresh.`,
      });
      return;
    }

    const recordId = `record-${crypto.randomUUID()}`;

    // Insert record
    const [record] = await db
      .insert(recordsTable)
      .values({
        id: recordId,
        caseId,
        ownerId: userId,
        kind: parse.data.kind,
        sourceId: parse.data.sourceId,
        selectedLineIds: parse.data.selectedLineIds,
        verbatimText: parse.data.verbatimText,
        correctedText: parse.data.correctedText,
        authorType: parse.data.authorType,
        reportedAt: parse.data.reportedAt ? new Date(parse.data.reportedAt) : new Date(),
        precision: parse.data.precision,
        revisionOf: parse.data.revisionOf,
        confirmedAt: new Date(),
      })
      .returning();

    // If promise term supplied, insert it
    let promiseTerm = null;
    if (parse.data.kind === "promise" && parse.data.promise) {
      const pData = parse.data.promise;
      const [pt] = await db
        .insert(promiseTermsTable)
        .values({
          recordId: record.id,
          actionKind: pData.actionKind,
          conditionLabel: pData.conditionLabel,
          triggerEventId: pData.triggerEventId,
          rawWindow: pData.rawWindow,
          durationHours: pData.durationHours,
          statedDueAt: pData.statedDueAt ? new Date(pData.statedDueAt) : undefined,
          chosenCheckAt: pData.chosenCheckAt ? new Date(pData.chosenCheckAt) : undefined,
          timezone: pData.timezone,
          dateBasis: pData.dateBasis,
          userDisposition: pData.userDisposition,
        })
        .returning();
      promiseTerm = pt;
    }

    // Increment case version & updatedAt
    const nextVersion = caseItem.version + 1;
    await db
      .update(casesTable)
      .set({
        version: nextVersion,
        updatedAt: new Date(),
      })
      .where(eq(casesTable.id, caseId));

    // Audit event
    await db.insert(auditEventsTable).values({
      id: `audit-${crypto.randomUUID()}`,
      caseId,
      ownerId: userId,
      action: "record.confirmed",
      targetId: record.id,
      targetVersion: nextVersion,
      requestId: req.id ? String(req.id) : crypto.randomUUID(),
    });

    res.status(201).json({
      record,
      promiseTerm,
      newCaseVersion: nextVersion,
    });
  } catch (err: unknown) {
    logger.error({ err, caseId, userId }, "Failed to confirm record");
    res.status(500).json({ error: "Could not save confirmed record" });
  }
});

// ============================================================================
// 6. POST /api/cases/:id/links - Link records (revisions, changed date/terms)
// ============================================================================
router.post("/:id/links", async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const caseId = getParam(req.params.id);

  const parse = createLinkSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Validation error", details: parse.error.format() });
    return;
  }

  try {
    const [caseItem] = await db
      .select()
      .from(casesTable)
      .where(
        and(
          eq(casesTable.id, caseId),
          eq(casesTable.ownerId, userId),
        ),
      )
      .limit(1);

    if (!caseItem) {
      res.status(404).json({ error: "Case not found" });
      return;
    }

    const linkId = `link-${crypto.randomUUID()}`;
    const [link] = await db
      .insert(recordLinksTable)
      .values({
        id: linkId,
        caseId,
        ownerId: userId,
        earlierRecordId: parse.data.earlierRecordId,
        laterRecordId: parse.data.laterRecordId,
        relation: parse.data.relation,
      })
      .returning();

    // Increment case version
    const nextVersion = caseItem.version + 1;
    await db
      .update(casesTable)
      .set({ version: nextVersion, updatedAt: new Date() })
      .where(eq(casesTable.id, caseId));

    res.status(201).json({ link, newCaseVersion: nextVersion });
  } catch (err: unknown) {
    logger.error({ err, caseId, userId }, "Failed to link records");
    res.status(500).json({ error: "Could not link records" });
  }
});

// ============================================================================
// 7. POST /api/cases/:id/outcomes - Record resolution outcome
// ============================================================================
router.post("/:id/outcomes", async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const caseId = getParam(req.params.id);

  const parse = createOutcomeSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Validation error", details: parse.error.format() });
    return;
  }

  try {
    const [caseItem] = await db
      .select()
      .from(casesTable)
      .where(
        and(
          eq(casesTable.id, caseId),
          eq(casesTable.ownerId, userId),
        ),
      )
      .limit(1);

    if (!caseItem) {
      res.status(404).json({ error: "Case not found" });
      return;
    }

    const outcomeId = `outcome-${crypto.randomUUID()}`;
    const [outcome] = await db
      .insert(caseOutcomesTable)
      .values({
        id: outcomeId,
        caseId,
        ownerId: userId,
        kind: parse.data.kind,
        receivedTotalPaise: parse.data.receivedTotalPaise,
        receivedDate: parse.data.receivedDate,
        note: parse.data.note,
      })
      .returning();

    // Map outcome to lifecycle
    let newLifecycle = "resolved";
    if (parse.data.kind === "closed_without_resolution") {
      newLifecycle = "closed_without_resolution";
    } else if (parse.data.kind === "withdrawn") {
      newLifecycle = "withdrawn";
    }

    const nextVersion = caseItem.version + 1;
    await db
      .update(casesTable)
      .set({
        lifecycle: newLifecycle,
        version: nextVersion,
        updatedAt: new Date(),
      })
      .where(eq(casesTable.id, caseId));

    res.status(201).json({ outcome, newLifecycle });
  } catch (err: unknown) {
    logger.error({ err, caseId, userId }, "Failed to record outcome");
    res.status(500).json({ error: "Could not record outcome" });
  }
});

// ============================================================================
// 8. GET /api/cases/:id/snapshot - Export snapshot
// ============================================================================
router.get("/:id/snapshot", async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const caseId = getParam(req.params.id);

  try {
    const [caseItem] = await db
      .select()
      .from(casesTable)
      .where(
        and(
          eq(casesTable.id, caseId),
          eq(casesTable.ownerId, userId),
        ),
      )
      .limit(1);

    if (!caseItem) {
      res.status(404).json({ error: "Case not found" });
      return;
    }

    const sources = await db
      .select()
      .from(sourcesTable)
      .where(
        and(
          eq(sourcesTable.caseId, caseId),
          eq(sourcesTable.ownerId, userId),
        ),
      );

    const records = await db
      .select()
      .from(recordsTable)
      .where(
        and(
          eq(recordsTable.caseId, caseId),
          eq(recordsTable.ownerId, userId),
        ),
      )
      .orderBy(recordsTable.createdAt);

    const promiseTerms = await db.select().from(promiseTermsTable);
    const promiseTermsMap = new Map(promiseTerms.map((pt) => [pt.recordId, pt]));

    const enrichedRecords = records.map((r) => ({
      ...r,
      promise: promiseTermsMap.get(r.id) || null,
    }));

    const links = await db
      .select()
      .from(recordLinksTable)
      .where(
        and(
          eq(recordLinksTable.caseId, caseId),
          eq(recordLinksTable.ownerId, userId),
        ),
      );

    const outcomes = await db
      .select()
      .from(caseOutcomesTable)
      .where(
        and(
          eq(caseOutcomesTable.caseId, caseId),
          eq(caseOutcomesTable.ownerId, userId),
        ),
      );

    const snapshot = {
      snapshotVersion: "1.0",
      generatedAt: new Date().toISOString(),
      case: caseItem,
      chronology: enrichedRecords,
      sources,
      links,
      outcomes,
      summary: {
        totalRecords: enrichedRecords.length,
        totalSources: sources.length,
        lastUpdated: caseItem.updatedAt,
      },
    };

    res.json(snapshot);
  } catch (err: unknown) {
    logger.error({ err, caseId, userId }, "Failed to generate snapshot");
    res.status(500).json({ error: "Could not generate case snapshot" });
  }
});

// ============================================================================
// 9. POST /api/cases/:id/delete - Hide case immediately & schedule cleanup
// ============================================================================
router.post("/:id/delete", async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const caseId = getParam(req.params.id);

  try {
    const [caseItem] = await db
      .select()
      .from(casesTable)
      .where(
        and(
          eq(casesTable.id, caseId),
          eq(casesTable.ownerId, userId),
        ),
      )
      .limit(1);

    if (!caseItem) {
      res.status(404).json({ error: "Case not found" });
      return;
    }

    // Immediately mark lifecycle as deletion_pending
    await db
      .update(casesTable)
      .set({
        lifecycle: "deletion_pending",
        deletionRequestedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(casesTable.id, caseId));

    // Get all storage paths for sources
    const sources = await db
      .select({ storagePath: sourcesTable.storagePath })
      .from(sourcesTable)
      .where(eq(sourcesTable.caseId, caseId));

    const paths = sources.map((s) => s.storagePath).filter(Boolean);

    // Enqueue deletion job
    await db.insert(deletionJobsTable).values({
      id: `del-${crypto.randomUUID()}`,
      ownerId: userId,
      caseId,
      status: "pending",
      objectPaths: paths,
      nextAttemptAt: new Date(),
    });

    res.json({ success: true, message: "Case access removed; scheduled for cleanup" });
  } catch (err: unknown) {
    logger.error({ err, caseId, userId }, "Failed to delete case");
    res.status(500).json({ error: "Could not delete case" });
  }
});

export default router;
