import { Router, type Request, type Response } from "express";
import fs from "fs/promises";
import {
  db,
  extractionsTable,
  sourcesTable,
  deletionJobsTable,
  casesTable,
  recordsTable,
  recordLinksTable,
  promiseTermsTable,
  caseOutcomesTable,
  reviewDraftsTable,
  profilesTable,
} from "@workspace/db";
import { eq, and, lt, inArray } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

const MAINTENANCE_SECRET = process.env.MAINTENANCE_AUTH_SECRET || "still-owed-dev-maintenance-secret-2026";

// ============================================================================
// POST /api/internal/maintenance - Housekeeping and cleanup handler
// ============================================================================
router.post("/", async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization;
  const headerSecret = req.headers["x-maintenance-secret"];

  let providedSecret = "";
  if (authHeader && authHeader.startsWith("Bearer ")) {
    providedSecret = authHeader.slice(7).trim();
  } else if (typeof headerSecret === "string") {
    providedSecret = headerSecret.trim();
  }

  if (providedSecret !== MAINTENANCE_SECRET) {
    res.status(403).json({ error: "Forbidden: invalid maintenance secret" });
    return;
  }

  const now = new Date();
  const results = {
    expiredLeasesReset: 0,
    abandonedSlotsCleaned: 0,
    deletionJobsProcessed: 0,
    filesRemoved: 0,
  };

  try {
    // 1. Reset expired OCR leases (processing with leaseExpiresAt in the past)
    const expiredExtractions = await db
      .select({ id: extractionsTable.id, sourceId: extractionsTable.sourceId })
      .from(extractionsTable)
      .where(
        and(
          eq(extractionsTable.status, "processing"),
          lt(extractionsTable.leaseExpiresAt, now),
        ),
      );

    for (const ext of expiredExtractions) {
      await db
        .update(extractionsTable)
        .set({ status: "failed", errorCode: "lease_expired" })
        .where(eq(extractionsTable.id, ext.id));

      await db
        .update(sourcesTable)
        .set({ extractionState: "failed" })
        .where(eq(sourcesTable.id, ext.sourceId));

      results.expiredLeasesReset++;
    }

    // 2. Clean abandoned upload slots older than 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const abandonedSlots = await db
      .select({ id: sourcesTable.id, storagePath: sourcesTable.storagePath })
      .from(sourcesTable)
      .where(
        and(
          eq(sourcesTable.uploadState, "reserved"),
          lt(sourcesTable.createdAt, oneDayAgo),
        ),
      );

    for (const slot of abandonedSlots) {
      if (slot.storagePath) {
        try {
          await fs.unlink(slot.storagePath);
          results.filesRemoved++;
        } catch {
          // ignore if file does not exist
        }
      }
      await db.delete(sourcesTable).where(eq(sourcesTable.id, slot.id));
      results.abandonedSlotsCleaned++;
    }

    // 3. Process pending deletion jobs
    const pendingJobs = await db
      .select()
      .from(deletionJobsTable)
      .where(eq(deletionJobsTable.status, "pending"))
      .limit(10);

    for (const job of pendingJobs) {
      const paths = (job.objectPaths as string[]) || [];
      for (const filePath of paths) {
        if (filePath) {
          try {
            await fs.unlink(filePath);
            results.filesRemoved++;
          } catch {
            // file may already be removed
          }
        }
      }

      // If job is for a specific case, delete child records and case row
      if (job.caseId) {
        const caseId = job.caseId;
        const caseRecords = await db
          .select({ id: recordsTable.id })
          .from(recordsTable)
          .where(eq(recordsTable.caseId, caseId));

        const recordIds = caseRecords.map((r) => r.id);
        if (recordIds.length > 0) {
          await db.delete(promiseTermsTable).where(inArray(promiseTermsTable.recordId, recordIds));
        }

        await db.delete(recordLinksTable).where(eq(recordLinksTable.caseId, caseId));
        await db.delete(recordsTable).where(eq(recordsTable.caseId, caseId));
        await db.delete(reviewDraftsTable).where(eq(reviewDraftsTable.caseId, caseId));
        await db.delete(sourcesTable).where(eq(sourcesTable.caseId, caseId));
        await db.delete(caseOutcomesTable).where(eq(caseOutcomesTable.caseId, caseId));
        await db.delete(casesTable).where(eq(casesTable.id, caseId));
      } else {
        // Account-wide deletion: delete all cases and profile
        const userCases = await db
          .select({ id: casesTable.id })
          .from(casesTable)
          .where(eq(casesTable.ownerId, job.ownerId));

        for (const c of userCases) {
          const caseRecords = await db
            .select({ id: recordsTable.id })
            .from(recordsTable)
            .where(eq(recordsTable.caseId, c.id));

          const recordIds = caseRecords.map((r) => r.id);
          if (recordIds.length > 0) {
            await db.delete(promiseTermsTable).where(inArray(promiseTermsTable.recordId, recordIds));
          }
          await db.delete(recordLinksTable).where(eq(recordLinksTable.caseId, c.id));
          await db.delete(recordsTable).where(eq(recordsTable.caseId, c.id));
          await db.delete(sourcesTable).where(eq(sourcesTable.caseId, c.id));
          await db.delete(caseOutcomesTable).where(eq(caseOutcomesTable.caseId, c.id));
          await db.delete(casesTable).where(eq(casesTable.id, c.id));
        }

        await db.delete(profilesTable).where(eq(profilesTable.id, job.ownerId));
      }

      await db
        .update(deletionJobsTable)
        .set({ status: "completed" })
        .where(eq(deletionJobsTable.id, job.id));

      results.deletionJobsProcessed++;
    }

    logger.info({ results }, "Maintenance completed");
    res.json({ success: true, results });
  } catch (err: unknown) {
    logger.error({ err }, "Maintenance task failed");
    res.status(500).json({ error: "Maintenance task failed" });
  }
});

export default router;
