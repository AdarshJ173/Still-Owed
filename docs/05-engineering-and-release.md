# 5. Engineering and release plan

## Build sequence

The critical path is identity and isolation → a saved case → a saved image → a real AWS reading result → reviewed promise → preserved change → export → operational hardening. Build that path before secondary navigation, promotional artwork, or optional integrations.

This is a plan for one builder. It is not a four-person work allocation. The effort estimates below are planning estimates, not a guarantee of completion. The event deadline remains a hard stop even if a release gate is unfinished.

### Thursday, 17 September: prove deployment and the data boundary

**First, establish the actual kickoff time.** The date alone is not authorization to claim that earlier project implementation occurred during the competition. This specification is planning material; create the project and its history only after the official start.

1. Create the new repository, licence, README, dependency lockfile, and attribution ledger. Record event start evidence and the original project scope.
2. Create Supabase staging/production configuration, authentication, private bucket, migrations, and initial owner policies.
3. Deploy the smallest Next.js application to Amplify and sign in through the real production callback.
4. Create two test accounts and prove that neither can read the other's case or upload path. Test directly against the database and storage APIs, not only the UI.
5. Save one case, upload one synthetic screenshot, invoke Textract from the deployed app, and render selectable text.

**Target checkpoint:** by the end of the day, a real AWS-hosted URL can authenticate, persist a private case, and read a screenshot through AWS. An IAM or hosting failure is discovered now, while mentor help can still resolve it.

Planning allowance: approximately 8–10 focused hours including AWS learning. If this path is not working, work on the failed dependency rather than drawing more screens.

### Friday, 18 September: complete the product mechanism

1. Implement source review, manual correction, explicit unknowns, and typed promise fields.
2. Implement deterministic time/condition rules with tests before enabling derived dates in the interface.
3. Implement append-only confirmed records, expected-version checks, correction links, and promise comparison.
4. Add case summary, next question, factual copy, outcome recording, and reopen behaviour.
5. Build export selection and print layout against the same case snapshot used by the interface.

**Target checkpoint:** the complete fictional case works from first screenshot to changed promise to export, with no fixture values substituted for provider output or saved database data.

Planning allowance: 10–12 focused hours. Skip every “later” feature. Do not expand input formats beyond screenshots and notes.

### Saturday, 19 September: prove trustworthy use and UI quality

1. Complete consent, privacy copy, limits, deletion, maintenance retry, quotas, logging, and secret handling.
2. Implement the tokenized visual system, mobile source review, all error states, keyboard operation, and reduced motion.
3. Add manifest, installation guidance, and a static offline fallback with a strict cache allowlist.
4. Run consenting user task sessions if participants are available. Record actual observations and repair confusing date/source interactions. If no participants are available, report that limitation instead of inventing testimonials.
5. Run the security/failure test suite, restore rehearsal, and Vercel compatibility deployment with synthetic data.

**Target checkpoint:** no known cross-user access, misleading deadline, lost revision, or export mismatch; users can understand the primary flow. Attending Bangalore is optional and should not displace unresolved critical work.

Planning allowance: 10–12 focused hours. The brief's ambition does not remove the need for sleep, verification, and deadline margin.

### Sunday, 20 September: release evidence and submission

1. Recheck the official form and exact cutoff/timezone. Work backward from it; do not assume 23:59 IST.
2. Run final acceptance against the deployed commit. Freeze a tested release with a tag and record the deployment SHA.
3. Prepare the clearly labelled fictional demonstration case. Use the actual product to create it.
4. Record the video, edit to no more than 2:55, add captions, and check that every must-ship capability has an on-screen slot.
5. Publish the public/unlisted YouTube video, open it signed out, verify the repository and production URL, finalize the short writeup, and submit well before cutoff.
6. Publish the Builder Center article if the core submission is already complete; use actual engineering observations.

**Target checkpoint:** the submission links are accessible and correspond to the demonstrated release. Preserve confirmation of successful submission. Stop project changes at the deadline.

Planning allowance: 6–8 hours with at least two hours of submission/upload margin if the announced deadline permits it. Unfinished optional work is not a reason to miss submission.

## Modules and responsibilities

| Module | Owns | Must not do |
|---|---|---|
| Identity | Verified user context, consent, account lifecycle | Treat a browser-supplied owner ID as identity |
| Cases | Metadata, lifecycle, version control | Infer a refund from merchant wording |
| Sources | File reservation, validation, private retrieval, source notes | Fetch arbitrary remote files or modify evidence invisibly |
| Reading | Textract adapter, leases, quotas, normalized results | Decide truth, legal rights, or a promise's meaning |
| Promises | Confirmed fields, conditions, time interpretations, relationships | Overwrite earlier promises silently |
| Follow-up | Fixed templates from confirmed records | Send messages or introduce unsupported allegations |
| Export | Consistent snapshot, user selection, print layout | Omit failed attachments without warning |
| Operations | Secrets, logging, cleanup, backups, kill switch | Leak private content into telemetry |

These are folders/modules within one deployment, not network services.

## Proposed repository structure

The following paths describe files to create during implementation. They are not supplied application code.

| Path | Purpose |
|---|---|
| README.md | What works, how to run, architecture, limits, demo and deployment links |
| LICENSE | Chosen project licence |
| THIRD_PARTY_NOTICES.md | Libraries, fonts, icons, templates, and fixture licences |
| AI_USAGE.md | Actual AI tools, their use, and human verification |
| package.json and lockfile | Pinned runtime/dependencies and check scripts |
| .env.example | Configuration names and explanations, no values that grant access |
| .gitignore | Secrets, generated exports, logs, local credentials, personal screenshots |
| amplify.yml | Hosting build specification without secrets |
| next.config.ts | Common framework configuration and security-compatible headers |
| src/app/layout.tsx | Fonts, public shell, metadata |
| src/app/page.tsx | Public explanation and labelled fictional example |
| src/app/sign-in/page.tsx | Sign-in and recoverable errors |
| src/app/auth/callback/route.ts | Safe session callback |
| src/app/cases/page.tsx | Owner's case list |
| src/app/cases/new/page.tsx | Case creation |
| src/app/cases/[caseId]/page.tsx | Case summary and history |
| src/app/cases/[caseId]/review/[sourceId]/page.tsx | Passage selection and confirmation |
| src/app/cases/[caseId]/export/page.tsx | Packet preview and print |
| src/app/settings/page.tsx | Data control, installation help, logout |
| src/app/privacy/page.tsx and terms/page.tsx | Actual operator disclosures |
| src/app/offline/page.tsx | Public static network-unavailable page |
| src/app/manifest.ts | PWA metadata |
| src/app/api/ | Bounded route handlers listed in the technical specification |
| src/components/ui/ | Buttons, fields, dialogs, labels, notifications |
| src/components/cases/ | Case rows, history, outcome panel |
| src/components/sources/ | Image preview, text list, passage selection |
| src/components/promises/ | Review form, condition field, comparison |
| src/components/export/ | Selection list and printable case |
| src/domain/cases/ | Domain types and lifecycle validation |
| src/domain/promises/ | Date precision, condition logic, revision rules |
| src/domain/follow-up/ | Deterministic content templates |
| src/domain/export/ | Snapshot selection and source numbering |
| src/lib/supabase/ | Browser, user-server, and isolated admin clients |
| src/lib/aws/ | Credential adapter, Textract adapter, secret retrieval |
| src/lib/security/ | Origin checks, quotas, validation, idempotency helpers |
| src/lib/observability/ | Sanitized structured logging |
| src/styles/ | Tokens, foundations, print styles |
| public/ | Icons, licensed font files, public offline assets, service worker |
| supabase/migrations/ | Schema, constraints, RLS, narrowly scoped mutation functions |
| supabase/seed/ | Synthetic development fixtures only |
| tests/domain/ | Date, version, relationship, and formatting tests |
| tests/isolation/ | Two-user database, API, and storage access checks |
| tests/e2e/ | Main flow, errors, export, account deletion, offline behaviour |
| tests/fixtures/ | Labelled synthetic screenshots and expected transcriptions |
| scripts/backup.ts | Operator-invoked backup/export utility; no deployed worker |
| docs/architecture.md | Decisions and data-flow narrative |
| docs/operations.md | Setup, backup, restore, incident, rotation, cleanup runbooks |
| docs/evaluation.md | Actual test conditions, failures, and usability results |
| docs/submission.md | Final truthful writeup and exact submitted commit |

## Transaction and retry implementation order

First implement atomic case mutations and RLS. Then add the UI that calls them. Confirmed promise creation must create the source association, terms, version increment, and audit metadata together.

Use a client-generated idempotency key for each intentional operation. Retrying the same key with different content is a conflict, not a new update. Keep operation results for 24 hours; retain domain records according to case lifecycle. Transactions are short and never wait for Textract or file downloads.

External work uses a two-phase pattern: reserve and mark intent; perform bounded network work; finalize under a new transaction. On finalization, recheck deletion state. If a user deleted the case while OCR ran, discard the result and finish cleanup rather than resurrecting it.

## Test plan: failures worth finding

| Area | Required test | Failure it prevents |
|---|---|---|
| Conditional date | 48 hours after an unknown event | Fabricated overdue status |
| Precision | Date-only trigger with hour-based duration | False exact timestamp |
| Business days | Five working days without calendar | Unsupported deadline arithmetic |
| Timezone | IST timestamp crossing UTC midnight | Wrong local date |
| Revisions | New date linked to previous date | Loss of earlier promise |
| Ambiguity | Cropped message date or “tomorrow” | Assuming upload time equals message time |
| Money | Missing amount, decimals, partial total | Fake balance or incorrect full closure |
| Ownership | Account A uses B's UUID against all endpoints | Cross-user data exposure |
| Storage | Upload/read guessed path or overwrite finalized file | File leakage or evidence substitution |
| Direct database access | Client bypasses form/domain endpoint | Bypassing invariant or ownership checks |
| Duplicate request | Repeated confirm and repeated OCR trigger | Duplicate records and excessive calls |
| Timeout | Provider finishes after request budget | False success or unlimited retry spend |
| Concurrent edit | Two tabs save the same case version | Silent overwrite |
| Delete race | Delete during OCR or upload | Resurrected data |
| Cleanup | Storage deletion fails halfway | Orphaned private objects and false completion |
| Export | Selected attachment unavailable | Incomplete case packet presented as complete |
| Script-like text | HTML or instructions inside screenshot/note | XSS or prompt-driven action |
| Cache | User A logs out, user B opens app | Private case remaining in cache/history |
| PWA | Offline then reconnect with unsaved review | False save or lost state on automatic reload |
| Accessibility | Full task keyboard-only and with VoiceOver | Pointer-only source selection |

Record test results against the deployed build, including expected failures and actual errors. Screenshots of a passing test runner are supplemental evidence; the demo still needs to show the product working.

## Vercel deployment and portability check

Deploy the same repository as a single Next.js project. Use an isolated Supabase staging project with synthetic data and exact redirect URLs. Configure server environment secrets, the AWS region, and a Vercel OIDC trust restricted to the test project/environment. Route handlers remain Node-based; do not use Edge runtime for the AWS path.

Run sign-in → case → screenshot → Textract → confirmed promise → export. Record the Vercel URL, commit, and test result internally. The competition submission points to AWS production. Do not make the AWS app proxy the Vercel app or split frontend/backend across hosts.

Production middleware and route handlers must enforce identity themselves, including on Amplify. Do not rely exclusively on an edge-only authentication mechanism or a hosting-specific cache feature. Streaming, work after response, and unsupported ISR behaviours are not part of the design.

## Maintenance setup

Enable Supabase Cron and pg_net, store the maintenance secret in Vault, and configure an authenticated request to the same app's maintenance endpoint every 15 minutes. The route must compare the secret safely, deny arbitrary target URLs or user IDs, and enforce small batch/time limits. Persist retry progress in deletion_jobs. [Supabase Cron](https://supabase.com/docs/guides/cron), [pg_net](https://supabase.com/docs/guides/database/extensions/pg_net).

The operator checks last-success time and backlog daily. A scheduler configured in a console but never observed executing is not a tested deletion mechanism.

## Backup and restore contract

For an initial limited production cohort, select a Supabase paid plan with documented database backups and inspect its actual retention. In addition, once daily the operator runs the Node backup utility from an encrypted workstation to create an encrypted archive of private Storage objects and a manifest tying their hashes to a database export. This is a local operational task, not a hosted service or Python worker.

Keep at most seven daily local archives, with access restricted to the operator. Include these copies in the privacy notice and deletion/retention process. A user deletion removes online data promptly and ages out of these backups within seven days; restored backups must replay the deletion ledger before reopening access. The ledger contains only opaque IDs necessary to prevent deleted records returning.

Initial operational objectives are recovery-point loss of at most 24 hours and recovery within four hours during published support coverage. They are internal targets, not a guaranteed SLA. Test restore into staging with synthetic screenshots, not into a live production database. Verify both database rows and object bytes; retain the restore report.

If the builder cannot operate and verify this process, open only a clearly disclosed limited pilot. “Production ready” cannot be created by calling an unfinished backup plan a feature.

## Release gates

### Product gate

Every M1–M10 flow runs. Supported inputs are accurately advertised. There are no dead buttons, fake OCR responses, auto-generated legal claims, or automatic statement-to-outcome conversions. All fixtures are labelled.

### Security and data gate

Two-user isolation passes at UI, API, database, and storage layers. Secrets never appear in browser bundles, repository history, logs, or build artifacts. Consent, export, deletion, cleanup retry, backup disclosure, and restore are tested. Public previews cannot access production credentials.

### Operational gate

The AWS URL is stable, an external account can sign in, OCR limits work, errors are observable without private content, and the kill switch stops new OCR calls. Domain failures produce useful recovery states. Actual backup plan and operator contact are published.

### Submission gate

The video is under three minutes, signed-out links work, the repository reflects event-time implementation, tools/assets are credited, and the writeup describes demonstrated features. Submit by the exact official cutoff. Do not revise claims upward to hide an unmet gate.

## Incident runbook

If OCR spend or errors spike, disable new OCR calls while preserving reading of existing cases and manual entry. If private data exposure is suspected, restrict affected endpoints, rotate/revoke relevant credentials, preserve sanitized incident metadata, assess scope, and follow applicable notification duties. Do not delete the evidence of an operational incident merely to make logs look clean.

If a deployment breaks the core path, roll back application code to the last tested build only after verifying schema compatibility. Prefer additive migrations and feature flags so rollback does not require destructive database changes. Document the failing version and retest the corrected path once.

## After the event

Continue only after the competition cutoff with a clearly recorded new development phase. Measure actual task usefulness, correction rate, retention during active disputes, and operating cost. Keep the release free and small while learning whether people prefer it to a folder and notes. Do not add monetization, broad integrations, or extra AI until those observations justify the work.
