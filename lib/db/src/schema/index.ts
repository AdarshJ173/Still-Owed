import { pgTable, text, integer, boolean, timestamp, jsonb, index, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================================================
// 1. PROFILES
// ============================================================================
export const profilesTable = pgTable("profiles", {
  id: text("id").primaryKey(), // Supabase user UID or external user ID
  displayName: text("display_name"),
  timezone: text("timezone").notNull().default("Asia/Kolkata"),
  adultAttestedAt: timestamp("adult_attested_at", { withTimezone: true }),
  noticeVersion: text("notice_version").notNull().default("1.0"),
  consentAt: timestamp("consent_at", { withTimezone: true }),
  analyticsOptIn: boolean("analytics_opt_in").notNull().default(false),
  deletionRequestedAt: timestamp("deletion_requested_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertProfileSchema = createInsertSchema(profilesTable);
export const selectProfileSchema = createSelectSchema(profilesTable);
export type Profile = typeof profilesTable.$inferSelect;
export type InsertProfile = typeof profilesTable.$inferInsert;

// ============================================================================
// 2. CASES
// ============================================================================
export const casesTable = pgTable("cases", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  merchantLabel: text("merchant_label").notNull(),
  itemLabel: text("item_label").notNull(),
  orderReference: text("order_reference"),
  requestedAmountPaise: integer("requested_amount_paise"),
  desiredResolution: text("desired_resolution").notNull().default("refund"), // refund, replacement, cancellation, repair, other
  lifecycle: text("lifecycle").notNull().default("active"), // active, resolved, closed_without_resolution, withdrawn, deletion_pending
  version: integer("version").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletionRequestedAt: timestamp("deletion_requested_at", { withTimezone: true }),
}, (table) => [
  index("cases_owner_lifecycle_idx").on(table.ownerId, table.lifecycle),
  index("cases_owner_updated_idx").on(table.ownerId, table.updatedAt),
]);

export const insertCaseSchema = createInsertSchema(casesTable);
export const selectCaseSchema = createSelectSchema(casesTable);
export type Case = typeof casesTable.$inferSelect;
export type InsertCase = typeof casesTable.$inferInsert;

// ============================================================================
// 3. SOURCES
// ============================================================================
export const sourcesTable = pgTable("sources", {
  id: text("id").primaryKey(),
  caseId: text("case_id").notNull(),
  ownerId: text("owner_id").notNull(),
  kind: text("kind").notNull(), // 'image' | 'note'
  storagePath: text("storage_path"),
  originalFilename: text("original_filename"),
  mime: text("mime"),
  byteSize: integer("byte_size"),
  width: integer("width"),
  height: integer("height"),
  sha256: text("sha256"),
  noteText: text("note_text"),
  reportedSourceAt: timestamp("reported_source_at", { withTimezone: true }),
  sourceTimePrecision: text("source_time_precision").notNull().default("day"), // 'exact' | 'day' | 'approximate' | 'unknown'
  channel: text("channel").notNull().default("chat"), // 'chat' | 'email' | 'phone' | 'portal' | 'other'
  uploadState: text("upload_state").notNull().default("reserved"), // 'reserved' | 'uploaded' | 'finalized' | 'failed' | 'deleting'
  extractionState: text("extraction_state").notNull().default("none"), // 'none' | 'extracting' | 'ready' | 'failed'
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("sources_case_idx").on(table.caseId),
  index("sources_owner_idx").on(table.ownerId),
]);

export const insertSourceSchema = createInsertSchema(sourcesTable);
export const selectSourceSchema = createSelectSchema(sourcesTable);
export type Source = typeof sourcesTable.$inferSelect;
export type InsertSource = typeof sourcesTable.$inferInsert;

// ============================================================================
// 4. EXTRACTIONS (OCR results with geometry and line tokens)
// ============================================================================
export const extractionsTable = pgTable("extractions", {
  id: text("id").primaryKey(),
  sourceId: text("source_id").notNull(),
  ownerId: text("owner_id").notNull(),
  status: text("status").notNull().default("pending"), // 'pending' | 'processing' | 'ready' | 'failed'
  provider: text("provider").notNull().default("aws-textract"),
  modelVersion: text("model_version"),
  attemptCount: integer("attempt_count").notNull().default(1),
  leaseExpiresAt: timestamp("lease_expires_at", { withTimezone: true }),
  awsRequestId: text("aws_request_id"),
  parserVersion: text("parser_version").notNull().default("1.0"),
  lines: jsonb("lines").notNull().default([]), // array of { id, text, confidence, geometry: { boundingBox, polygon } }
  errorCode: text("error_code"),
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
}, (table) => [
  index("extractions_source_idx").on(table.sourceId),
  index("extractions_owner_idx").on(table.ownerId),
]);

export const insertExtractionSchema = createInsertSchema(extractionsTable);
export const selectExtractionSchema = createSelectSchema(extractionsTable);
export type Extraction = typeof extractionsTable.$inferSelect;
export type InsertExtraction = typeof extractionsTable.$inferInsert;

// ============================================================================
// 5. REVIEW DRAFTS (Autosaved unconfirmed work)
// ============================================================================
export const reviewDraftsTable = pgTable("review_drafts", {
  id: text("id").primaryKey(),
  sourceId: text("source_id").notNull(),
  caseId: text("case_id").notNull(),
  ownerId: text("owner_id").notNull(),
  selectedLineIds: jsonb("selected_line_ids").notNull().default([]),
  formFields: jsonb("form_fields").notNull().default({}),
  basedOnCaseVersion: integer("based_on_case_version").notNull().default(1),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("review_drafts_source_idx").on(table.sourceId),
  index("review_drafts_owner_idx").on(table.ownerId),
]);

export const insertReviewDraftSchema = createInsertSchema(reviewDraftsTable);
export const selectReviewDraftSchema = createSelectSchema(reviewDraftsTable);
export type ReviewDraft = typeof reviewDraftsTable.$inferSelect;
export type InsertReviewDraft = typeof reviewDraftsTable.$inferInsert;

// ============================================================================
// 6. RECORDS (Confirmed statements, promises, events, outcomes)
// ============================================================================
export const recordsTable = pgTable("records", {
  id: text("id").primaryKey(),
  caseId: text("case_id").notNull(),
  ownerId: text("owner_id").notNull(),
  kind: text("kind").notNull(), // 'statement' | 'promise' | 'event' | 'outcome'
  sourceId: text("source_id"),
  selectedLineIds: jsonb("selected_line_ids").notNull().default([]),
  verbatimText: text("verbatim_text").notNull(),
  correctedText: text("corrected_text"),
  authorType: text("author_type").notNull().default("support"), // 'support' | 'user'
  reportedAt: timestamp("reported_at", { withTimezone: true }),
  precision: text("precision").notNull().default("day"), // 'exact' | 'day' | 'approximate' | 'unknown'
  structuredFields: jsonb("structured_fields").notNull().default({}),
  revisionOf: text("revision_of"),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("records_case_created_idx").on(table.caseId, table.createdAt),
  index("records_owner_idx").on(table.ownerId),
]);

export const insertRecordSchema = createInsertSchema(recordsTable);
export const selectRecordSchema = createSelectSchema(recordsTable);
export type RecordItem = typeof recordsTable.$inferSelect;
export type InsertRecordItem = typeof recordsTable.$inferInsert;

// ============================================================================
// 7. PROMISE TERMS (Source-backed commitments with conditions & deadlines)
// ============================================================================
export const promiseTermsTable = pgTable("promise_terms", {
  recordId: text("record_id").primaryKey(),
  actionKind: text("action_kind").notNull().default("refund"), // 'refund' | 'replacement' | 'pickup' | 'response' | 'other'
  conditionLabel: text("condition_label"),
  triggerEventId: text("trigger_event_id"),
  rawWindow: text("raw_window"), // e.g. "48 hours", "5 working days"
  durationHours: integer("duration_hours"),
  statedDueAt: timestamp("stated_due_at", { withTimezone: true }),
  chosenCheckAt: timestamp("chosen_check_at", { withTimezone: true }),
  timezone: text("timezone").notNull().default("Asia/Kolkata"),
  dateBasis: text("date_basis").notNull().default("calendar"), // 'calendar' | 'business_days' | 'user_chosen' | 'unknown'
  userDisposition: text("user_disposition").notNull().default("pending"), // 'pending' | 'condition_unmet' | 'window_elapsed' | 'fulfilled' | 'superseded' | 'cancelled'
});

export const insertPromiseTermSchema = createInsertSchema(promiseTermsTable);
export const selectPromiseTermSchema = createSelectSchema(promiseTermsTable);
export type PromiseTerm = typeof promiseTermsTable.$inferSelect;
export type InsertPromiseTerm = typeof promiseTermsTable.$inferInsert;

// ============================================================================
// 8. RECORD LINKS (Revision & relationship graph between records)
// ============================================================================
export const recordLinksTable = pgTable("record_links", {
  id: text("id").primaryKey(),
  caseId: text("case_id").notNull(),
  ownerId: text("owner_id").notNull(),
  earlierRecordId: text("earlier_record_id").notNull(),
  laterRecordId: text("later_record_id").notNull(),
  relation: text("relation").notNull(), // 'changed_date' | 'changed_explanation' | 'confirms_condition' | 'additional_info' | 'correction'
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("record_links_case_idx").on(table.caseId),
]);

export const insertRecordLinkSchema = createInsertSchema(recordLinksTable);
export const selectRecordLinkSchema = createSelectSchema(recordLinksTable);
export type RecordLink = typeof recordLinksTable.$inferSelect;
export type InsertRecordLink = typeof recordLinksTable.$inferInsert;

// ============================================================================
// 9. CASE OUTCOMES (Confirmed final or partial resolutions)
// ============================================================================
export const caseOutcomesTable = pgTable("case_outcomes", {
  id: text("id").primaryKey(),
  caseId: text("case_id").notNull(),
  ownerId: text("owner_id").notNull(),
  kind: text("kind").notNull(), // 'full_refund' | 'partial_refund' | 'replacement_received' | 'closed_without_resolution' | 'withdrawn' | 'other'
  receivedTotalPaise: integer("received_total_paise"),
  receivedDate: text("received_date"),
  note: text("note"),
  supersedesId: text("supersedes_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("case_outcomes_case_idx").on(table.caseId),
]);

export const insertCaseOutcomeSchema = createInsertSchema(caseOutcomesTable);
export const selectCaseOutcomeSchema = createSelectSchema(caseOutcomesTable);
export type CaseOutcome = typeof caseOutcomesTable.$inferSelect;
export type InsertCaseOutcome = typeof caseOutcomesTable.$inferInsert;

// ============================================================================
// 10. AUDIT EVENTS (Audit trail without private screenshot or message text)
// ============================================================================
export const auditEventsTable = pgTable("audit_events", {
  id: text("id").primaryKey(),
  caseId: text("case_id"),
  ownerId: text("owner_id").notNull(),
  action: text("action").notNull(),
  targetId: text("target_id").notNull(),
  targetVersion: integer("target_version"),
  requestId: text("request_id").notNull(),
  timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("audit_events_owner_idx").on(table.ownerId),
  index("audit_events_case_idx").on(table.caseId),
]);

export const insertAuditEventSchema = createInsertSchema(auditEventsTable);
export const selectAuditEventSchema = createSelectSchema(auditEventsTable);
export type AuditEvent = typeof auditEventsTable.$inferSelect;

// ============================================================================
// 11. OPERATION KEYS (Idempotency and deduplication)
// ============================================================================
export const operationKeysTable = pgTable("operation_keys", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  operation: text("operation").notNull(),
  idempotencyKey: text("idempotency_key").notNull(),
  requestHash: text("request_hash").notNull(),
  resultId: text("result_id"),
  status: text("status").notNull().default("in_progress"), // 'in_progress' | 'completed' | 'failed'
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
}, (table) => [
  uniqueIndex("operation_keys_unique_idx").on(table.ownerId, table.operation, table.idempotencyKey),
]);

export const insertOperationKeySchema = createInsertSchema(operationKeysTable);
export const selectOperationKeySchema = createSelectSchema(operationKeysTable);
export type OperationKey = typeof operationKeysTable.$inferSelect;

// ============================================================================
// 12. USAGE COUNTERS (Transactional rate limits and OCR quotas)
// ============================================================================
export const usageCountersTable = pgTable("usage_counters", {
  id: text("id").primaryKey(),
  scope: text("scope").notNull(), // 'user' | 'project'
  subjectId: text("subject_id").notNull(),
  utcDate: text("utc_date").notNull(), // 'YYYY-MM-DD'
  reservedAttempts: integer("reserved_attempts").notNull().default(0),
  successfulAttempts: integer("successful_attempts").notNull().default(0),
  uploadBytes: integer("upload_bytes").notNull().default(0),
}, (table) => [
  uniqueIndex("usage_counters_scope_subject_date_idx").on(table.scope, table.subjectId, table.utcDate),
]);

export const insertUsageCounterSchema = createInsertSchema(usageCountersTable);
export const selectUsageCounterSchema = createSelectSchema(usageCountersTable);
export type UsageCounter = typeof usageCountersTable.$inferSelect;

// ============================================================================
// 13. DELETION JOBS (Tombstoned records and storage object cleanup)
// ============================================================================
export const deletionJobsTable = pgTable("deletion_jobs", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  caseId: text("case_id"),
  status: text("status").notNull().default("pending"), // 'pending' | 'processing' | 'completed' | 'failed'
  objectPaths: jsonb("object_paths").notNull().default([]),
  attempts: integer("attempts").notNull().default(0),
  nextAttemptAt: timestamp("next_attempt_at", { withTimezone: true }).defaultNow().notNull(),
  lastErrorCode: text("last_error_code"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("deletion_jobs_status_next_idx").on(table.status, table.nextAttemptAt),
]);

export const insertDeletionJobSchema = createInsertSchema(deletionJobsTable);
export const selectDeletionJobSchema = createSelectSchema(deletionJobsTable);
export type DeletionJob = typeof deletionJobsTable.$inferSelect;

// ============================================================================
// RELATIONS
// ============================================================================
export const casesRelations = relations(casesTable, ({ many }) => ({
  sources: many(sourcesTable),
  records: many(recordsTable),
  links: many(recordLinksTable),
  outcomes: many(caseOutcomesTable),
  reviewDrafts: many(reviewDraftsTable),
}));

export const sourcesRelations = relations(sourcesTable, ({ one, many }) => ({
  case: one(casesTable, { fields: [sourcesTable.caseId], references: [casesTable.id] }),
  extractions: many(extractionsTable),
  records: many(recordsTable),
  reviewDrafts: many(reviewDraftsTable),
}));

export const recordsRelations = relations(recordsTable, ({ one, many }) => ({
  case: one(casesTable, { fields: [recordsTable.caseId], references: [casesTable.id] }),
  source: one(sourcesTable, { fields: [recordsTable.sourceId], references: [sourcesTable.id] }),
  promiseTerm: one(promiseTermsTable, { fields: [recordsTable.id], references: [promiseTermsTable.recordId] }),
  outgoingLinks: many(recordLinksTable, { relationName: "earlierRecord" }),
  incomingLinks: many(recordLinksTable, { relationName: "laterRecord" }),
}));

export const promiseTermsRelations = relations(promiseTermsTable, ({ one }) => ({
  record: one(recordsTable, { fields: [promiseTermsTable.recordId], references: [recordsTable.id] }),
}));

export const recordLinksRelations = relations(recordLinksTable, ({ one }) => ({
  case: one(casesTable, { fields: [recordLinksTable.caseId], references: [casesTable.id] }),
  earlierRecord: one(recordsTable, { fields: [recordLinksTable.earlierRecordId], references: [recordsTable.id], relationName: "earlierRecord" }),
  laterRecord: one(recordsTable, { fields: [recordLinksTable.laterRecordId], references: [recordsTable.id], relationName: "laterRecord" }),
}));
