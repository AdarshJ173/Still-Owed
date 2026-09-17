# 2. Product requirements document

## Product contract

**Still Owed helps a consumer maintain an accurate, source-linked history of a stuck return and prepare their next communication.** It does not verify a merchant's conduct, guarantee a refund, or send a complaint.

The working spine is: authenticate → create case → add screenshot → confirm a promise → connect a later change → inspect what remains unresolved → export the case → record the outcome.

Every must-ship interaction belongs to that spine or is necessary to operate it safely.

## Goals and non-goals

| Goals | Explicit non-goals for first release |
|---|---|
| Reconstruct a case once and extend it incrementally | Scan every purchase or the user's inbox |
| Keep exact support statements connected to their images | Decide which participant is truthful |
| Preserve earlier promises when dates or explanations change | Promise a refund or determine legal entitlement |
| Distinguish waiting on a condition from waiting until a date | Infer a merchant's holiday calendar or unstated policy |
| Produce a useful, inspectable case packet | File complaints, send messages, or make chargebacks |
| Protect a small amount of private consumer information | Store bank statements, card data, Aadhaar, or passwords |
| Work on a phone and a desktop | Offer collaboration, a mobile native app, or an agent marketplace |

The first release is a real, free SaaS service. Real accounts, persistent private data, capacity limits, operational monitoring, deletion, and a support route define completeness. Billing is not required for software to be delivered as a service.

## Audience and personas

These are **design scenarios**, not invented interview participants.

**Primary: the student with a stuck electronics return.** They have a phone, a laptop, multiple support screenshots, and a meaningful amount of money unavailable. They need to find the last promise quickly between classes. Their first concern is whether uploading private order information is safe. They should not have to learn a case-management vocabulary.

**Secondary: the working adult handling an unresolved household purchase.** They have fifteen minutes to follow up after work. They remember contacting support but not the exact date, channel, or condition attached to the reply. They need an organized account they can read while talking to support elsewhere.

**Accessibility scenario: the person who finds repeated administrative work tiring or difficult.** The design reduces memory demands and avoids implying a diagnosis. A plain sequence, persistent draft, explicit unknowns, and one next action matter more than a large dashboard.

**Not yet served well:** people who need Hindi/Telugu screenshot OCR, those without a Google account, people who cannot read the English interface, or users needing legal representation. These are first-release limitations, not claims that those users are unimportant.

## Jobs to be done

1. When support gives me a commitment, help me save exactly what they said so I can refer to it later.
2. When someone changes the date or explanation, help me see what changed without losing the earlier conversation.
3. When the promised time depends on another event, help me identify the missing event rather than show a false countdown.
4. When I follow up, help me explain the facts and attach the relevant records without searching across my phone.
5. When the matter ends, help me record the outcome and remove the information when I no longer need it.

## Vocabulary and core objects

| Object | User-facing meaning |
|---|---|
| Case | One unresolved return, for one order/item in the first release |
| Source | A screenshot the user uploaded or a note they wrote |
| Statement | What a source says, attributed to a person/channel and date |
| Promise | A statement about a future action, possibly conditional |
| Event | Something the user records as having happened; evidence may support the report |
| Change | A user-confirmed connection between two statements |
| Check date | When the user intends to check again; distinct from a support promise |
| Outcome | What the user reports happened to the requested resolution |

“Confirmed” always means **reviewed by the user against the source**, not independently authenticated. A call note is labelled “Your note.” A screenshot is labelled “Uploaded screenshot.” A selected passage is labelled “Support statement, reviewed by you.”

## Must-ship features and acceptance

| ID | Feature and user story | Acceptance condition | Demo exposure |
|---|---|---|---|
| M1 | Sign in and understand privacy | Supabase-authenticated Google sign-in; notice before first upload; logout clears app memory | Opening sign-in and notice |
| M2 | Create and retrieve a private case | Merchant, item label, requested amount optional, order reference optional; survives reload and a second authenticated device | Create case and later reopen |
| M3 | Add screenshot and review text | PNG/JPEG upload, genuine Textract call, selectable source lines, manual correction with attribution | Upload and highlight |
| M4 | Record a conditional promise | User confirms statement, date and condition; unknown values remain unknown | Save conditional promise |
| M5 | Preserve a later change | New statement links to earlier promise; both remain visible; no silent date replacement | Second source and comparison |
| M6 | Understand the next follow-up | Shows missing condition, elapsed stated date, or user-chosen check date; copies factual text without sending | Case view and Copy |
| M7 | Export a case packet | Print-ready HTML contains selected chronology, source excerpts, approved attachments, and generation time; browser Save as PDF supported | Preview and print dialog |
| M8 | Record resolution | User records received amount or other outcome; no automatic closure from merchant status | Record outcome and reopen |
| M9 | Own and remove data | Download own data; delete case; delete account after recent sign-in; truthful pending-deletion state | Settings and disposable-case deletion |
| M10 | Install and understand offline state | PWA installed where browser supports it; offline shell states cases require connection; no private cache | Installed window and offline screen |

Production requirements such as isolation and retry safety are release gates, not extra marketing features. They must be tested, even though the three-minute video cannot inspect every security branch.

### Later features, deliberately excluded from must-ship

| Extension | Admission condition |
|---|---|
| Hindi/Telugu interface and screenshot support | Human language review, supported OCR provider evaluation, and representative accuracy tests |
| PDF and long-chat ingestion | Document security and page-limit handling; evidence that screenshots constrain use |
| Private offline case copies | Clear device-storage consent, expiration, logout/purge tests, and stale-data treatment |
| Calendar export and optional reminders | Measured demand; explicit timezone and notification reliability contract |
| Email forwarding or Gmail integration | Demonstrated capture friction; additional consent and token-deletion lifecycle |
| Revocable helper access | Real demand from family users; membership-level authorization and export attribution |
| Multi-item orders and multiple refund instalments | Tested allocation rules rather than one ambiguous order balance |
| In-product redaction | Irreversible rendering, derivative/original labelling, accessible review, and export verification |
| More consumer processes | Evidence that the same promise mechanism transfers without domain-specific advice |
| Paid plans | Validated recurring value; no paywall trapping an existing case's export or deletion |

Do not make later features visible as working controls. A waitlist is unnecessary during the event.

## State model: separate questions instead of one misleading status

### Case lifecycle

An active case can be resolved, closed without resolution, or withdrawn. It can be reopened, preserving the earlier outcome record. Deleting a case moves it immediately into a hidden, inaccessible deletion state, followed by physical cleanup.

### Promise state

A promise can need review, await a condition, have a stated window, have an elapsed window, be replaced by a linked later promise, be reported fulfilled, or be cancelled through an explicit correction. “Window elapsed” describes time; it does not prove a breach or entitlement.

### Evidence state

A source can be uploading, saved, extracting, ready, extraction failed, or deleting. Extraction failure does not invalidate an otherwise saved source. A user can create a manual note or manually transcribe that source without pretending OCR succeeded.

### Example: the defining edge case

The fictional screenshot says “Refund within 48 hours after warehouse receipt.” The screenshot is dated 12 September, but there is no receipt confirmation.

Correct display: **Waiting for warehouse receipt confirmation. Support's stated refund period starts after that.**

Incorrect display: **Refund overdue since 14 September.**

If the user later records a receipt event on 14 September at 15:00 IST, the app proposes 16 September at 15:00 IST as the end of the stated 48-hour period. The user confirms the calculation and the linked event. If only a date is known, the app asks for a chosen check date instead of inventing a precise time.

If support later says “five working days,” the old commitment stays. The new wording is saved verbatim and requires a user-selected check date unless a precise date was explicitly supplied. The interface never presents a weekend-only calculation as the merchant's business-day calendar.

## User flows

### First case

The landing page explains the product with a labelled fictional case. “Start a case” opens Google sign-in. The callback returns to case creation. A short notice explains storage, AWS text extraction, and what not to upload. Acceptance is recorded with the notice version.

The user supplies merchant and item labels. Requested amount and order reference are optional. The case is created before the first upload so a failed extraction cannot lose the case.

### Capture and confirmation

The user selects one screenshot, previews it, and checks that it contains no information they do not intend to store or send to AWS. The app offers removal and reselection. There is no fake automatic redaction.

After upload completes, the source is visibly saved. Reading starts. The user selects one or more adjacent text lines in an accessible list; a corresponding image highlight confirms the selection. The review form asks what was promised, when it was said, whether a condition applies, and what date or duration was explicitly stated.

Review requires active confirmation. Nothing becomes a promise simply because OCR found a date. Closing review leaves a saved source and an unfinished draft, not a half-confirmed commitment.

### Add a changed promise

From the case, choose “Add an update.” Select a new screenshot or write a note. After review, choose the earlier promise that the update relates to and the relationship: changed date, changed explanation, confirmed condition, or additional information.

The app shows the earlier statement beside the new one. The user confirms the relationship. “Changed explanation” is a user's classification, not an automated accusation. Exact duplicate source files in the same case offer reuse instead of another upload.

### Prepare follow-up

The case presents one suggested factual question. For the receipt example: “Could you confirm the warehouse receipt date? The refund period in your earlier message depends on that event.”

Text is assembled from confirmed fields and fixed templates. The user previews and edits it. Copying says “Copied,” never “Sent.” A supporting screenshot can be opened from each referenced statement. There is no recipient directory, outbound email, automatic complaint, or browser automation against a retailer.

### Export and leave

Choose records and attachments in a preview. Nothing is preselected merely because it was uploaded. A warning appears beside sensitive-looking material only as a general user review instruction, not as an unimplemented AI detector.

The packet contains case title, requested resolution, user-provided order reference if included, chronological statements, their relationship, open question, numbered source references, selected images, and creation time. It states that uploaded materials and events have not been independently authenticated.

Print opens the browser print interface. Save as PDF availability follows the device/browser. A mobile user whose browser cannot save a PDF can copy the text and download selected screenshots; the app must not falsely show a successful PDF download.

### Record outcome

Ask “What happened?” with Received requested refund, Received part, Resolved another way, or Closed without resolution. Ask the received amount and date only when relevant. Both requested and reported-received amounts remain visible. A partial payment does not silently mark full success.

For the first release, the user maintains the cumulative received total and can revise it with an audit entry. It is not a bank-connected ledger. No recovery-rate banner is computed from fictional cases.

## Screen and route map

| Route | Purpose | Access |
|---|---|---|
| / | Explanation and clearly labelled example | Public |
| /sign-in | Google sign-in and failure recovery | Public |
| /auth/callback | Supabase session establishment and safe return | Auth flow only |
| /cases | Active and closed cases; first-use state | Authenticated owner |
| /cases/new | Create one case | Authenticated owner |
| /cases/[caseId] | Summary, open question, promise history, sources | Owner only |
| /cases/[caseId]/sources/new | Upload or add a note | Owner only |
| /cases/[caseId]/review/[sourceId] | Select source text and confirm record | Owner only |
| /cases/[caseId]/export | Select records and preview printable packet | Owner only |
| /settings | Data download, privacy, delete account, logout | Authenticated owner |
| /privacy and /terms | Plain-language policies and operator contact | Public |
| /offline | Truthful network-unavailable screen | Public static shell |

## Content requirements

Use “Support said,” “You recorded,” “Date not known,” “Check date you selected,” and “Window has elapsed.” Avoid “Verified,” “Guaranteed,” “Fraud detected,” “Case won,” and “Money recovered by us.”

The website needs an actual operator contact, an accurate data-retention notice, a limits page, and a method to report a bug without attaching private evidence. A support request must not automatically include a screenshot or case contents.

Demo images use a fictional merchant, invented order references, and a visible “Fictional example” mark. They are not edited screenshots of real people, real complaints, or real merchants.

## Success definition and analytics

The first value event is a case with one reviewed source-backed promise and a usable next question. Counting accounts alone is insufficient.

| Measure | Definition | Interpretation |
|---|---|---|
| Activation | Consenting user creates case, confirms first promise, opens resulting summary | Product reached first value |
| Capture effort | Time from selected file to reviewed statement, excluding abandonment | Whether OCR selection earns its complexity |
| Revision comprehension | User can identify old promise, new promise, and why the date changed | Whether the unique mechanism works |
| Export completion | Preview followed by print invocation or data download | Artifact preparation, not delivery to a merchant |
| Return visit | Same real case receives a later confirmed update | Continued utility during the problem |
| User-reported outcome | Recorded separately as resolved, partial, other, unresolved | Self-report; no causal attribution |
| Error rate | Incorrect amount/date/source association in observed tests | Safety and usability signal |

First-release numeric targets are engineering or research targets: no cross-user access; no automatic deadline with an unknown trigger; no lost confirmed revision; four of five initial testers completing the core task without coaching. No results are claimed in advance.

Use aggregate operational counts by default. Optional product analytics require separate consent and contain event names, duration bands, and random identifiers, never OCR text, merchant names, amounts, order references, or screenshot URLs. Honour consent withdrawal and account deletion. No session replay.

## Privacy, legal, and abuse boundaries

This is an organizational tool, not legal or financial advice. It links to the official National Consumer Helpline as a user-controlled destination for general information; it does not claim government affiliation or prefill filings through an undocumented API. [Official NCH information](https://consumeraffairs.gov.in/pages/nch).

The initial product accepts adult users only and does not collect identity documents to prove age. It asks for adult self-attestation. Upload guidance excludes bank statements, card credentials, identity documents, medical data, and unrelated third-party information.

Before collecting real data, the operator must publish accurate purposes, processors, retention, deletion, and contact information and review applicable Indian privacy requirements and their commencement. The MeitY rules page is the primary starting point; this specification is not a legal compliance certification. [MeitY, DPDP Rules 2025](https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025-gDOxUjMtQWa?pageTitle=Digital-Personal-Data-Protection-Rules-2025).

The app never generates, repairs, or fabricates evidence. A stored-file hash shows whether the stored bytes changed; it does not prove when a screenshot was created or that its contents are true. There are no public allegations, merchant rankings, bulk complaints, or demands for compensation generated from unsupported facts.

Production-ready here means meeting the specified launch gates for this narrow service. A polished prototype that has not passed isolation, deletion, failure, and usability checks does not meet that definition.
