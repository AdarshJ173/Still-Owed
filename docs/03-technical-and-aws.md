# 3. Technical requirements, system design, and AWS

## Architecture decision

Build one TypeScript Next.js application. Pages, authenticated route handlers, domain rules, exports, and the maintenance endpoint live in one repository and deployment. Use Supabase for Postgres, authentication, and every user-uploaded file.

Deploy the competition production application to **AWS Amplify Hosting**. Maintain a working Vercel deployment recipe for the identical application. The Vercel compatibility deployment is a test environment with synthetic data, not a second backend the production application calls.

AWS Amplify's current documented compute support includes Next.js 12–15 and excludes streaming and some other features. Choose the latest security-patched Next.js 15 release available and supported when implementation begins; pin its exact version and compatible React dependencies in the lockfile. Use Node.js 22. Do not adopt an unsupported framework feature merely because it works on Vercel. [Amplify framework support](https://docs.aws.amazon.com/amplify/latest/userguide/ssr-amplify-support.html), [runtime support](https://docs.aws.amazon.com/amplify/latest/userguide/ssr-supported-features.html).

This is one modular application using managed services. Amplify's internal hosting infrastructure is not a separately maintained microservice system. There is no Render deployment, Python runtime, custom worker, DynamoDB application database, Cognito login, or S3 user-file bucket.

## System diagram, described in words

**Browser → Next.js application → Supabase.** The browser presents the interface. Next.js verifies the session and implements domain operations. Supabase owns user identity, case data, and private screenshots.

**Browser → Supabase Storage.** An authorized upload goes directly to a specific private storage path. This avoids passing image bodies through hosting request limits.

**Next.js → Textract → Next.js → Supabase.** For one authorized source, the server reads saved image bytes, calls text detection, validates the response, and saves lines with image coordinates. Only the screenshot selected for reading is sent to AWS. No direct browser-to-Textract call exists.

**Next.js → Secrets Manager.** On AWS, a narrow IAM role allows runtime retrieval of the application's server secret bundle. A short in-memory cache reduces calls. Public configuration remains separate.

**Next.js → CloudWatch.** Logs contain request identifiers, operation names, timing, and sanitized errors. They contain no screenshots, source text, user messages, or credentials.

**Supabase Cron → the same Next.js maintenance route.** A bounded periodic request retries deletion and removes abandoned uploads. It is housekeeping within the same app, not a separately deployed backend.

## Stack and dependencies

| Layer | Decision | Responsibility |
|---|---|---|
| Application | Next.js 15, React, TypeScript, Node 22 | Pages, route handlers, shared domain modules |
| Styling | CSS custom properties and CSS Modules | Explicit design tokens and component styles |
| Accessible primitives | Radix Dialog, AlertDialog, Tabs, Tooltip as individually needed | Focus handling; native elements used where sufficient |
| Icons | Lucide, small explicitly imported set | Supporting labels, never replacing them |
| Validation | Zod | Server request and third-party response boundaries |
| Forms | React Hook Form | Draft preservation and field errors |
| Database/auth/files | Supabase JS and Supabase SSR | RLS-scoped clients, sessions, private file access |
| AWS reading | AWS SDK v3 client-textract | DetectDocumentText only |
| AWS secrets | AWS SDK v3 client-secrets-manager | Runtime server configuration on AWS |
| Vercel AWS identity | Vercel OIDC AWS credentials provider | Temporary credentials in compatibility deployment |
| Date operations | date-fns and a tested timezone utility | Display and strict confirmed-duration arithmetic |
| Image validation | Sharp in Node runtime | Decode/format/dimension checks; no AI image modification |
| Identifiers and hashes | Platform crypto | UUIDs, SHA-256, constant-time secret comparison |
| Export | Semantic HTML and print CSS | Browser print/Save as PDF; no headless-browser service |
| Tests | Vitest, Playwright, axe-core | Domain, isolation, end-to-end, accessibility checks |
| PWA | Web manifest and narrowly scoped service worker | Static shell cache and offline explanation |

Pin dependencies, record licences, and audit vulnerabilities before release. Do not use floating “latest” in the committed build. OCR is the sole machine-learning capability; OpenRouter, Groq, Bedrock, embeddings, vector storage, and agent frameworks are unnecessary for the initial product.

## Nonfunctional requirements

| Area | Release requirement, not an observed result |
|---|---|
| Reliability | Saving a reviewed statement is atomic; a failed save leaves the draft recoverable |
| Data isolation | User A cannot list, read, modify, export, process, or delete user B's resources |
| Case latency | Target p95 under 1.5 seconds for an already authenticated case read under the defined pilot load |
| OCR interaction | Show upload/saved/reading states; one attempt has a 12-second provider budget and the route an 18-second application budget |
| Page experience | Target mobile LCP ≤2.5 seconds, INP ≤200 ms, CLS ≤0.1 on representative pages; report measured conditions |
| Capacity | Initial limit: 5 active cases, 30 source images per case, 3 MiB per image, 20 OCR attempts per user per day |
| Global spend guard | Reserve OCR allowance transactionally before calls; initially 1,000 attempts per project per UTC day |
| Responsive use | Usable at 320 CSS pixels and 200% zoom; no critical horizontal overflow |
| Accessibility | WCAG 2.2 AA target, keyboard task completion, tested screen-reader labels |
| Export | Complete source references; no silently omitted selected attachment |
| Compatibility | Core flow verified on current Chrome/Android and Safari/iOS, plus desktop keyboard use |

OCR latency depends on the provider and screenshot. The UI must never display fabricated progress percentages. Long operations are bounded and retryable; no work continues invisibly after the response.

## Data model

All identifiers are UUIDs unless a field requires another type. All server times are UTC timestamps. Money is integer paise with currency fixed to INR in the first release. Raw user-reported dates retain their timezone and precision.

| Table | Fields and relations | Access |
|---|---|---|
| profiles | id → auth.users; display_name optional; timezone default Asia/Kolkata; adult_attested_at; notice_version; consent_at; analytics_opt_in; deletion_requested_at; created_at | Owner reads; limited owner updates; account-state fields server-only |
| cases | id; owner_id; merchant_label; item_label; order_reference optional; requested_amount_paise optional; desired_resolution; lifecycle; version; created_at; updated_at; deletion_requested_at | Owner reads active rows; validated domain mutations only |
| sources | id; case_id; owner_id; kind image/note; storage_path nullable; original_filename optional; mime; byte_size; width; height; sha256; note_text nullable; reported_source_at; source_time_precision; channel; upload_state; extraction_state; created_at | Owner reads; writes through bounded operations; files are immutable after finalization |
| extractions | id; source_id; owner_id; status; provider; model_version if supplied; attempt_count; lease_expires_at; aws_request_id; parser_version; lines JSON; error_code; started_at; finished_at | Owner can read result for own source; server writes; client cannot invent AWS success |
| review_drafts | id; source_id; case_id; owner_id; selected_line_ids; form_fields JSON; based_on_case_version; updated_at | Owner-only mutable draft; never included in exports or treated as a confirmed promise |
| records | id; case_id; owner_id; kind statement/promise/event/outcome; source_id nullable; selected_line_ids; verbatim_text; corrected_text optional; author_type support/user; reported_at; precision; structured_fields JSON; revision_of nullable; confirmed_at; created_at | Owner reads; append/correct via transaction; no silent in-place rewrite of confirmed content |
| promise_terms | record_id → records; action_kind; condition_label optional; trigger_event_id nullable; raw_window; duration_hours nullable; stated_due_at nullable; chosen_check_at nullable; timezone; date_basis; user_disposition | Owner reads; validated transactional mutations |
| record_links | id; case_id; owner_id; earlier_record_id; later_record_id; relation changed_date/changed_explanation/confirms_condition/additional_info/correction; confirmed_at | Owner reads; same-case validated inserts; corrections retained |
| case_outcomes | id; case_id; owner_id; kind; received_total_paise nullable; received_date optional; note optional; supersedes_id optional; created_at | Owner reads; append-only outcome changes |
| audit_events | id; case_id nullable; owner_id; action; target_id; target_version; request_id; timestamp | Owner can read own case history; server writes; no copied source text |
| operation_keys | owner_id; operation; idempotency_key; request_hash; result_id; status; expires_at | Server only; narrow deduplication lifetime |
| usage_counters | scope user/project; subject_id; UTC date; reserved_attempts; successful_attempts; upload_bytes | Server only; atomic reservation |
| deletion_jobs | id; owner_id; case_id nullable; status; object_paths; attempts; next_attempt_at; last_error_code; created_at | Server only; no screenshots or note bodies |

Structured fields have versioned Zod schemas and database constraints for essential enums, amounts, and relationships. JSON is used for bounded OCR lines and kind-specific metadata, not as an excuse to omit validation.

### Relational integrity

Every case child carries owner_id and case_id, with composite foreign keys tying those to the same parent. A record cannot link to another user's source or a different case. A trigger event must belong to the same case. Unique constraints reject duplicate idempotency keys and duplicate source hashes within a case when both sources are finalized.

Records, links, and outcomes use explicit correction entries. Their protection is an application/database invariant for ordinary users, not a claim of a legally immutable or administrator-proof ledger. Account deletion intentionally removes them.

Indexes cover owner_id plus lifecycle/updated_at; case_id plus reported_at/created_at; source_id; pending lease expiry; deletion retry time; and operation-key uniqueness. Paginate long histories at 50 records and cap OCR line payloads at a documented size.

No collaboration role is hidden in this schema. The owner is the only product-level reader. A future helper feature would require membership policies, not sharing owner credentials.

## Authorization design

Use Supabase Auth with Google OAuth and a cookie-based SSR session. Verify identity server-side for every protected operation with the current supported verification method; do not authorize from an unverified session object. Authenticated database clients carry the user's access token so RLS still applies. [Supabase SSR guidance](https://supabase.com/docs/guides/auth/server-side), [client configuration and verification](https://supabase.com/docs/guides/auth/server-side/creating-a-client).

| Actor | Cases and records | Screenshot files | Operational data |
|---|---|---|---|
| Signed-out visitor | No access | No access | Public status only |
| Owner | Own active cases only | Own finalized files and authorized new upload slots | Own processing status, no secrets |
| Different signed-in user | No access, including guessed UUIDs | No access | No access |
| Next.js using user session | Same owner limits | Same owner limits | Cannot directly write trusted provider status |
| Server service-role client | Only explicit operations after independent ownership/session checks | Bounded cleanup and extraction work | Extraction records, quotas, deletion, account administration |
| Public repo contributor/preview | Synthetic development project only | Synthetic fixtures only | No production role or secrets |

Enable RLS on every exposed table before creating client access. Deny anonymous policies. Owner-select policies require auth.uid equal to owner_id and the parent/account not deleting. Revoke direct insert/update/delete privileges on confirmed record tables; expose narrowly scoped database functions for domain mutations. Those functions derive the actor from the verified JWT, validate parents, lock the case row, enforce expected_version, and commit all changes together.

If a SECURITY DEFINER database function is needed, pin its search path, restrict execution, fully qualify tables, and explicitly check auth.uid and ownership. Never accept a caller-supplied owner_id as identity. Ordinary functions should remain security-invoker where possible.

The service-role client bypasses RLS, so isolate it in a server-only module. A request first verifies the user, looks up the owned case with the user-scoped client, then invokes only the corresponding privileged operation. The privileged operation repeats ownership/deletion checks within its transaction to close races. Do not expose a generic admin query endpoint.

### Storage policies

Use one private Supabase bucket named case-sources. Paths use owner UUID / case UUID / source UUID / fixed safe filename. Never derive paths from merchant names, user filenames, or request-supplied arbitrary URLs.

Upload slots are reserved through the server, enforce capacity, and have short lifetimes. The browser receives authorization for the one generated object path. New uploads cannot overwrite finalized objects. Finalization downloads and decodes the file to verify signature, dimensions, actual byte count, and image type. Invalid content is deleted before it can be processed or displayed.

Read operations check both owner and parent state. Prefer authenticated downloads converted to temporary browser object URLs. If a short-lived signed URL is necessary, use a 60-second lifetime, never log it, and acknowledge that an issued URL is a bearer capability until expiry or underlying object removal. Do not promise instantaneous revocation of downloaded material. [Supabase storage policies](https://supabase.com/docs/guides/storage/security/access-control), [private buckets](https://supabase.com/docs/guides/storage/buckets/fundamentals), [download methods](https://supabase.com/docs/guides/storage/serving/downloads).

## Authentication setup

1. Create a Supabase project in an appropriate nearby region; choose Mumbai when offered and record the actual region.
2. In Google Cloud, configure an OAuth application for basic identity only. Request no Gmail, Drive, contacts, or other sensitive scopes.
3. Configure the Supabase callback URL as Google's authorized redirect; enter the Google client ID and secret in Supabase's provider configuration.
4. Add exact production and development redirect URLs in Supabase. Do not allow arbitrary wildcard redirects for production.
5. Set the consent app's production publishing status correctly and test with a person who is not a project test user. A login that works only for the builder is not a launch-ready service.
6. Implement callback error handling, safe same-origin return paths, logout, expired session recovery, and recent reauthentication for account deletion.

Provider setup follows [Supabase's Google guide](https://supabase.com/docs/guides/auth/social-login/auth-google) and [redirect configuration](https://supabase.com/docs/guides/auth/redirect-urls). If sign-in prerequisites fail, repair them; do not substitute a fake session for the demo.

## Server routes and contracts

All mutation routes accept a bounded body, verify origin and session, validate inputs, use idempotency keys where effects can repeat, and return a stable request ID. Authenticate before returning resource-specific errors. Cross-owner resources return the same not-found response as nonexistent IDs.

| Endpoint | Contract |
|---|---|
| POST /api/cases | Validate fields and active-case limit; create owner-bound case |
| POST /api/cases/[id]/upload-slot | Reserve source capacity; return exact storage upload target |
| POST /api/sources/[id]/finalize | Verify object and ownership; lock immutable hash/metadata |
| POST /api/sources/[id]/read | Reserve OCR quota, acquire lease, call Textract, commit result |
| PUT /api/sources/[id]/draft | Owner-scoped validated autosave; preserve unconfirmed review fields separately |
| POST /api/cases/[id]/records | Expected case version plus reviewed record fields; atomic confirmation |
| POST /api/cases/[id]/links | Validate both records and relationship; atomic case-version increment |
| POST /api/cases/[id]/outcomes | Append user-reported outcome, update lifecycle |
| GET /api/cases/[id]/snapshot | Owner-only consistent export snapshot with source references |
| POST /api/cases/[id]/delete | Hide case immediately and start bounded deletion |
| GET /api/account/export | Owner's machine-readable structured data; source downloads separately accessible |
| POST /api/account/delete | Require recent sign-in; tombstone account access, initiate complete cleanup |
| POST /api/internal/maintenance | Shared-secret authentication; bounded cleanup, no public caller control over targets |

Read-only UI routes can use server-side data loading, but no private response is statically generated or shared-cacheable. Use private, no-store response policies and exclude all private routes from CDN/service-worker caches.

## Main data flows

### Screenshot to source-backed promise

1. Verify account, consent, ownership, and quota; create a reserved source row.
2. Browser uploads bytes to the private generated path.
3. Server verifies the actual image and stores its hash, size, and dimensions.
4. User triggers reading; server atomically reserves an OCR attempt and acquires an extraction lease.
5. Server downloads bytes itself and calls Textract with Bytes, not an S3 location.
6. Store provider request ID, model version if returned, normalized lines, coordinates, and timing. Return only the owner's result.
7. Browser displays line selection and review fields. It does not modify canonical records yet.
8. Confirming creates the record and promise terms in one transaction, increments case version, and records a metadata-only audit event.

Review drafts autosave on field completion while online, with explicit Saving/Saved/Not saved feedback. On a temporary network or session failure, keep the current draft in memory and warn before leaving; do not claim it is durably saved. Resuming review loads the last saved draft and checks its case version. Confirmation removes the draft in the same transaction. Logout clears in-memory draft content.

### Update to changed promise

The second source follows the same pipeline. The user links the new confirmed statement to an earlier one. A single transaction validates case membership, preserves both records, adds the relationship, and updates the current display projection. The earliest promise does not disappear when the current check date changes.

### Follow-up and export

The server loads a consistent case version. A deterministic formatter creates the chronology and plain-language question. Exports use selected confirmed records only. Each included attachment must load successfully before printing is enabled; otherwise the UI names the missing attachment and offers retry or explicit exclusion.

The export is a user-selected snapshot with a version and generation time. Later edits mark an open export preview stale and require regeneration. A previously downloaded PDF cannot be revoked; tell the user this before sharing.

## AI specification: bounded OCR

Textract DetectDocumentText returns text blocks and positions. It is appropriate because selectable source text and its location are central to this product. A general multimodal model could paraphrase or misread the image without providing the same source-selection interaction. [API reference](https://docs.aws.amazon.com/textract/latest/APIReference/API_DetectDocumentText.html).

The first release accepts only PNG/JPEG images up to 3 MiB, with no dimension over 8,000 pixels and a decoded-pixel limit of 20 megapixels. These are product limits below provider limits, chosen to bound memory and upload costs. Reject SVG, HTML, HEIC, animated files, PDFs, and videos with clear guidance.

Use English typed screenshots initially. Textract's published language list does not include Hindi or Telugu; do not claim multilingual Indian OCR. Handwriting and poor-quality photos are outside the supported first-release promise. [Textract limits and languages](https://docs.aws.amazon.com/textract/latest/dg/limits-document.html).

Retain original detected text and selected line IDs. Manual correction is stored separately and visibly labelled. A user can confirm a passage even when the model's confidence is high only after reviewing it. Confidence refers to text recognition, not truth or legal validity.

There is no generative prompt, tool-calling agent, model routing, embedding index, or hidden LLM fallback. A screenshot containing instructions is treated as text. No extracted link is fetched automatically. Source text cannot become HTML, an executable instruction, or an outbound request.

Evaluation fixtures must cover rupee amounts, small fonts, dark-mode chats, repeated dates, cropped timestamps, blurred images, non-English text, and intentionally misleading instructions inside screenshots. Measure transcription error and correct source selection. User confirmation is mandatory even if an accuracy target is met.

## Date and state rules

Store the verbatim duration and its interpretation separately. Permit exact timestamps, date-only values, user-chosen check dates, and unknowns. Do not coerce all of them into one timestamp.

“Within 48 hours” may be converted only when the user confirms an exact triggering time and the intended interpretation. “By 20 September” remains a date in the chosen timezone. “Soon,” “working days,” or an ambiguous “tomorrow” require clarification or a user-chosen check date. The date shown in a screenshot is not necessarily the message's date.

Derive elapsed state on authorized reads from server time. There is no need for a background job to flip every promise at midnight. On an open page, local display timers may refresh, but a server recheck resolves uncertain clock differences. No notification reliability is implied.

The priority display is deterministic: unresolved condition first; then elapsed explicit window; then upcoming explicit window; then user check date; otherwise “Choose when to check.” The user can record multiple open promises. The app does not infer that the newest statement invalidates earlier terms.

## AWS integration: first-time implementation guide

### What AWS actually does

| Service | Necessary responsibility | Visible proof |
|---|---|---|
| Amplify Hosting | Serves the complete web application and route handlers | Production URL plus successful deployment for the submitted commit |
| Amazon Textract | Converts selected screenshots into source-linked text | User selects detected lines on an uploaded image |
| IAM and STS | Restrict runtime access and issue temporary credentials | Restricted compute role shown briefly in technical evidence |
| Secrets Manager | Holds Supabase server secret bundle and maintenance secret outside build artifacts | Configuration proof only; never show values |
| CloudWatch Logs | Diagnoses failures and correlates a reading request | Sanitized log with matching request ID |
| AWS Budgets | Warns the builder about expenditure | Budget configured; not a user feature or hard spending cap |

This uses AWS cloud services. It does not need AWS open-source components just to increase the service count.

### Account and region

AWS Builder ID/Builder Center and an AWS billing account are different things. Create the required Builder Center profile and separately create/secure the AWS account for hosting. Enable MFA, avoid root access keys, and use an appropriate administrative identity for setup.

Use ap-south-1 (Mumbai) for the selected AWS regional services where available. Verify Textract and Amplify availability in that account before processing real data. Record Supabase's actual region separately; do not imply all processing remains in India merely because one endpoint is in Mumbai. Cloud hosting, support access, and provider terms can have additional data-transfer implications.

Apply for the team credits and check the billing console to confirm they were issued and cover the chosen services. The brief/event advertises credits; that is not proof that this account has a zero bill. AWS credits do not pay Supabase or Vercel charges.

### Deployment steps

1. After the event opens, create the new public repository and connect its production branch to Amplify Hosting.
2. Select the standard Next.js SSR hosting path. Do not create an Amplify database or authentication backend.
3. Pin Node 22 and the supported Next.js release. Configure the build and .next artifact according to the SSR deployment guide.
4. Create the Supabase project, schema, policies, private bucket, Google sign-in, and exact redirect allowlist.
5. Store public Supabase URL/publishable key and nonsecret configuration in the app's permitted build/runtime environment.
6. Create one Secrets Manager secret for the server-only Supabase service-role key and maintenance authentication secret. Use the AWS-managed encryption key for this initial deployment.
7. Create a restricted IAM runtime policy and an SSR compute role, attach it only to the trusted production branch, and configure separate logging permissions.
8. Make only the selected nonsecret configuration available to the SSR runtime. Retrieve server secrets at runtime; do not copy all build variables into .env.production.
9. Deploy, open the AWS URL, sign in with an external test account, save a case, and process a synthetic screenshot through the deployed route.
10. Configure logs, retention, budget alerts, cleanup, and the application OCR cap. Run the release tests before accepting real screenshots.

Amplify build variables do not automatically imply correct server runtime availability. Follow [SSR environment handling](https://docs.aws.amazon.com/amplify/latest/userguide/ssr-environment-variables.html); keep secret retrieval separate from those build artifacts.

### IAM permissions and credentials

The runtime role trusts the Amplify service to assume it. Its permissions allow textract:DetectDocumentText and secretsmanager:GetSecretValue for exactly the one application secret. DetectDocumentText has no resource-level resource type in the service authorization table, so its Resource must be wildcard; constrain the requested region and grant no other Textract actions. Do not mistake that required wildcard for permission to grant every AWS action. [Textract IAM reference](https://docs.aws.amazon.com/service-authorization/latest/reference/list_textract.html).

Use the standard SDK credential chain on Amplify. The role supplies short-lived credentials; do not add permanent AWS keys to the browser or repository. Attach the role to production rather than every pull-request branch. [Amplify compute roles](https://docs.aws.amazon.com/amplify/latest/userguide/amplify-SSR-compute-role.html).

Use a separate local developer identity/profile with temporary credentials. On Vercel, configure OIDC federation for the exact team, project, and environment and use the official AWS credentials provider to assume an equivalently limited role. Do not trust arbitrary preview deployments. [Vercel OIDC reference](https://vercel.com/docs/oidc/reference).

### Environment and secret names

| Name | Purpose and location |
|---|---|
| NEXT_PUBLIC_SUPABASE_URL | Public project endpoint; build and runtime |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | Public client key; relies on RLS, never substitute service role |
| APP_ORIGIN | Exact canonical origin for redirects and mutation-origin checks |
| APP_ENV | development, staging, production; controls fixture access and telemetry labels |
| TEXTRACT_REGION | Explicit region passed to AWS client; choose ap-south-1 after availability check |
| APP_SECRET_ARN | Nonsecret pointer to server secret bundle on AWS |
| SUPABASE_SERVICE_ROLE_KEY | Server-only credential inside Secrets Manager on AWS; encrypted server environment for Vercel test deployment |
| MAINTENANCE_AUTH_SECRET | Server-only random secret; also stored in Supabase Vault for scheduled requests |
| AWS_ROLE_ARN | Vercel federation role identifier; no long-lived key |
| OCR_ENABLED | Operator kill switch for new provider calls |
| OCR_DAILY_PROJECT_LIMIT | Initial 1,000-attempt cap; enforced in database, not just the UI |
| OCR_DAILY_USER_LIMIT | Initial 20-attempt cap |
| SOURCE_MAX_BYTES | Initial 3 MiB; mirrored in bucket and server validation |
| BUILD_COMMIT_SHA | Provenance for deployed build and operational proof, not private data |

Google's OAuth secret lives in Supabase provider configuration, not browser environment. Do not create unused OpenRouter or Groq environment entries. No secret name starts with NEXT_PUBLIC.

### Exact runtime request

The authorized server reads the finalized private screenshot. AWS SDK v3's Textract client invokes DetectDocumentText with its bytes. The SDK handles the request encoding. Save the returned LINE/WORD relationships needed for selection, normalized geometry, and provider metadata. The application database remains Supabase; a temporary in-memory byte array is not another storage system. [Document text detection](https://docs.aws.amazon.com/textract/latest/dg/detecting-document-text.html).

Before real-user processing, inspect AWS's AI service content policies and configure the applicable Organizations AI-services opt-out for Textract. Disclose processor use accurately; do not claim zero retention or end-to-end encryption. [AWS content-policy announcement](https://aws.amazon.com/about-aws/whats-new/2020/07/easily-manage-content-policies-ai-services-aws-organizations/), [Textract data protection](https://docs.aws.amazon.com/textract/latest/dg/data-protection.html).

### Failure modes

| Failure | User behaviour | Operator diagnosis |
|---|---|---|
| Missing role/credentials | Screenshot remains saved; reading failed; manual transcription available | Check compute role attachment and credential provider |
| Wrong region | Same recoverable failure; no invented result | Compare endpoint region and policy condition |
| IAM denial | No repeated automatic hammering | Verify exact DetectDocumentText and secret permissions |
| Secret unavailable | Protected write fails closed; clear retry message | Secret ARN, role access, secret version |
| Browser upload/CORS failure | No false “saved”; allow reselection/retry | Check generated target, origin, bucket restrictions; never make bucket public |
| Textract throttle | Keep source; retry with bounded backoff only | Inspect quotas and reserved allowance |
| Timeout | Mark attempt uncertain/failed; source remains | Request may have been billed; avoid unlimited retries |
| Unsupported/blurred image | Explain limit, preserve manual path | Validate format and review OCR fixture results |
| Duplicate click | Reuse in-progress/result operation | Idempotency key and processing lease |
| Session expires during review | Retain in-memory draft; require sign-in before saving | No mutation under stale or missing identity |

An OCR processing lease expires after 60 seconds. A crashed operation can be retried by a fresh authorized request. A second concurrent request does not create a second successful record. The system cannot promise exactly-once Textract billing across a network timeout; each allowed attempt consumes quota, and retry count is capped.

## Costs and architecture tradeoffs

No always-on VM, NAT gateway, search cluster, AI conversation history, or independent queue is necessary. Work scales with actual screenshot reading and app use. Tradeoffs are explicit: two vendors hold application dependencies, screenshots are limited, synchronous OCR has latency constraints, and the PWA does not process offline.

For orientation, AWS's published Oregon example prices DetectDocumentText at $0.0015 per page for the first million pages. At that example rate, 1,000 images would be $1.50. **This is not a Mumbai quote**; check the selected region's current calculator before launch. [Textract pricing](https://aws.amazon.com/textract/pricing/).

Amplify's public paid rates include $0.01 per standard build minute, $0.30 per million SSR requests, $0.20 per GB-hour of SSR duration, and $0.15 per GB served. An illustrative 150 build minutes, 20,000 SSR requests, 2 GB-hours, and 2 GB transfer total about $2.21 before storage, OCR, secrets, logs, tax, and free-tier/credit adjustments. These are planning inputs, not measured usage. [Amplify pricing](https://aws.amazon.com/amplify/pricing/).

A Secrets Manager secret is approximately $0.40 per month at the published base rate, plus API calls and any applicable region/tax differences. Cache it briefly in server memory; do not fetch it once per rendered field. [Secrets Manager pricing](https://aws.amazon.com/secrets-manager/pricing/).

Set AWS budget alerts at $5, $10, and $20 for the pilot. Alerts are delayed warnings, not enforced hard caps. The application's transactional OCR cap and kill switch limit its own calls; they do not cap hosting traffic, compromised credentials, or all account spend. Review billing daily during the event. Configure log retention, avoid verbose request bodies, and disable unnecessary preview builds.

Plan Supabase production capacity and backup charges separately. Do not promise a permanently free production system. A free-tier development project may be useful, but its limits and durability must be reviewed before real-user launch.

## Deletion, retention, and maintenance

Active cases remain until the user deletes them; show this plainly. Set an explicit bounded retention policy for closed cases only after implementing its notice and purge mechanism. Do not claim an automatic expiry that does not run.

Delete requests immediately hide the case and deny new reads, uploads, and OCR. Cleanup deletes Storage objects through the Storage API, then child rows and case rows. Account deletion also removes all cases and finally the Supabase Auth user. Existing downloaded exports cannot be recalled.

A deletion job holds the minimal paths required for retry. The initiating request attempts bounded cleanup. Supabase Cron invokes the same application's maintenance endpoint every 15 minutes through a secret-authenticated request; keep the secret in Supabase Vault. Each run processes a small batch and persists progress so an interrupted run is safe. Clean abandoned upload slots after 24 hours. No provider call is placed in a database transaction that waits on the network.

This managed scheduling pattern uses Supabase's documented HTTP scheduling capability; it does not require deploying a Supabase Edge Function. [Supabase Cron](https://supabase.com/docs/guides/cron), [asynchronous HTTP extension](https://supabase.com/docs/guides/database/extensions/pg_net).

User-facing deletion text distinguishes “Access removed” from “Deletion complete.” Target cleanup within 24 hours; alert on failures beyond that. Backups follow the selected provider plan's actual retention and cannot honestly be described as instantly erased. Record and disclose that duration before launch.

## Observability and operational acceptance

Log operation, request_id, internal error class, duration, attempt number, deployment commit, and AWS request ID where relevant. Avoid stable user identifiers when unnecessary. Keep logs for seven days during the pilot; longer retention requires a reason.

Monitor failed sign-ins, failed saves, OCR errors/timeouts, quota denials, cleanup backlog, and export attachment failures. Alert on repeated deletion failures and unusual OCR volume. Logs and support tools must not become an alternative private-data browser.

A production-ready release requires a tested restore procedure for the selected Supabase database backup plan and a separate Storage-object recovery plan. Database backups alone do not restore object bytes. Use encrypted, access-controlled exports/backups of files as appropriate to the purchased plan, and validate restoration with synthetic data. If this has not been arranged and tested, label the deployment a limited pilot rather than claiming general production readiness.
