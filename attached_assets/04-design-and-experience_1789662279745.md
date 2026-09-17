# 4. Design system, interface, and PWA

## Design direction: a calm, legible casebook

The user arrives irritated, tired, or unsure. The interface should feel like laying the right papers on a clear desk. It gives the matter a shape without dramatizing it.

Choose an editorial, document-oriented visual language: warm paper, dark ink, restrained blue, dates in a narrow rail, and source references at the point of use. Premium means precision, legibility, and considerate behaviour. Luxury styling would be inappropriate for someone worried about a refund.

A dense banking dashboard would overemphasize totals. A playful assistant would undercut trust. A messenger imitation would hide the durable record inside yet another conversation. The selected casebook direction makes chronology and evidence the interface itself.

There are no purple gradients, glass panels, decorative analytics, bento grids, avatar-led chatbot entry points, or floating AI sparkle controls. A modest amount of whitespace separates information; it must not turn a short case into endless scrolling.

## Five design principles

1. **Keep the original within reach.** Every source-backed statement opens the corresponding passage in one action.
2. **Show what is unknown.** Unknown dates and unconfirmed conditions remain explicit.
3. **Make changes inspectable.** New information joins the history; it does not conceal earlier information.
4. **Ask for one decision at a time.** Selection, interpretation, confirmation, and export are distinct steps.
5. **Leave the user in control.** Nothing is sent, closed, or deleted through an ambiguous action.

## Typography

Use **Source Sans 3** for functional UI and body copy, **Newsreader** for the wordmark and short editorial headings, and **IBM Plex Mono** only for compact source numbers and technical request identifiers. These families provide a distinction between reading a human account and operating controls. They are choices for this document-heavy product, not novelty for its own sake.

Self-host licensed WOFF2 subsets and preserve their licence files. Load Source Sans 3 first. Newsreader is optional for rendering; its fallback is Georgia. Mono identifiers fall back to the system monospace stack. Limit font files and weights; do not delay the first actionable UI for the display font. Verify the selected distributions' actual licences when adding them.

| Token | Font, size / line height | Weight | Tracking | Usage |
|---|---|---:|---|---|
| Brand | Newsreader, 26 / 30 px | 500 | -0.02em | Wordmark |
| Landing headline | Newsreader, 48 / 52 desktop; 34 / 39 mobile | 500 | -0.025em | Maximum two short lines |
| Page title | Source Sans 3, 30 / 36 desktop; 26 / 32 mobile | 600 | -0.015em | Case title and main screens |
| Section title | Source Sans 3, 20 / 27 | 600 | -0.005em | History, sources, export |
| Main body | Source Sans 3, 17 / 26 | 400 | 0 | Statements and explanation |
| UI body | Source Sans 3, 16 / 23 | 400 | 0 | Inputs, labels, list content |
| Supporting copy | Source Sans 3, 14 / 20 | 400 | 0 | Context and timestamps |
| Button | Source Sans 3, 16 / 20 | 600 | 0 | Action labels |
| Small identifier | IBM Plex Mono, 12 / 18 | 400 | 0 | Source 01, request ID |
| Amount | Source Sans 3, 28 / 34, tabular numbers | 600 | -0.01em | Requested and received amounts |

Never reduce essential instructions below 14 px. Input text remains at least 16 px on mobile. Dates use tabular numerals and a readable format such as “17 Sep 2026, 3:00 pm IST.” Show exact dates alongside relative text. Use sentence case. Avoid long all-caps labels and dense monospaced paragraphs.

## Color system

First release is light theme only. A tokenized implementation supports a later dark theme, but shipping two untested palettes adds little value. Browser dark preference must not invert screenshots or alter evidence. Respect forced-colors mode and platform contrast preferences.

| Token | Value | Role |
|---|---|---|
| canvas | #F5F3EE | Application background |
| surface | #FFFFFF | Inputs, source viewer, focused work areas |
| surface-muted | #ECE9E2 | Group background and secondary strips |
| ink | #202A2E | Main text |
| ink-muted | #536168 | Secondary text |
| border | #D2D5D2 | Dividers, nonessential boundaries |
| control-border | #7B878B | Inputs requiring visible boundaries |
| accent | #24566D | Primary actions and active selection |
| accent-hover | #1B4457 | Primary hover |
| accent-active | #153747 | Pressed state |
| accent-soft | #E7F0F4 | Selected row background |
| focus | #174EA6 | Keyboard focus ring |
| success-ink | #286044 | Confirmed user outcome |
| success-surface | #EAF3EC | Outcome panel |
| warning-ink | #795000 | Date or condition needing review |
| warning-surface | #FFF2D4 | Review-needed context |
| danger-ink | #9C332C | Failed save or deletion action |
| danger-surface | #FBECE8 | Error context |
| disabled-ink | #687278 | Unavailable control text |
| disabled-surface | #E6E8E7 | Unavailable control background |

Validate all actual foreground/background combinations with a contrast tool. Tokens are a proposed palette, not evidence of a completed accessibility audit. Meet 4.5:1 for normal text and 3:1 for applicable large text and UI boundaries. Status always includes an icon or text label, never color alone.

“Elapsed” uses a restrained amber label, not an alarming red screen. Red is reserved for errors and destructive actions. Success color indicates the user's recorded outcome; it does not certify a legal result.

## Geometry, space, and elevation

Spacing scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 px. Use 8 px within tightly related content, 16–24 px between fields, and 32–40 px between sections. Do not create arbitrary per-screen spacing.

Radii: 4 px for inline source labels; 8 px for controls; 12 px for panels; 16 px for a modal. Status labels use a subtle 6 px corner rather than every element becoming a pill.

Elevation: the page and panels mostly use borders. Menus may use a soft 0 / 4 / 16 px shadow at approximately 8% dark opacity. Dialogs use 0 / 12 / 40 px at approximately 14%. Neither screenshots nor evidence passages receive decorative glows.

Focus: 2 px solid focus ring with 3 px offset; ensure the ring is visible over all surfaces and not clipped by overflow. Hover never substitutes for focus.

## Layout and responsive rules

Desktop content max-width is 1,200 px with 32 px side padding. A 12-column conceptual grid organizes the case. The main chronology uses 7 columns, a 1-column gutter, and a 4-column source/context area. Reading paragraphs should usually remain between 55 and 75 characters wide.

At 1,024 px and below, source review becomes a vertically stacked layout unless both panes can remain readable. At 640 px and below, use 16 px side padding, single-column content, and a full-screen source view. Do not preserve a desktop split screen by shrinking the screenshot until nobody can read it.

Desktop navigation is a compact top bar: wordmark, Cases, and account/settings. Mobile uses the same information hierarchy with a short top bar; no five-item bottom navigation for a three-area app. The main action can sit in a bottom action bar during review only. Respect safe-area insets and avoid covering the keyboard or focused field.

Case lists use ordinary rows with date, merchant/item, current question, and status. They do not use oversized cards with repeated labels. A requested amount is secondary until the user opens the case; the homepage does not total speculative “money owed.”

## Components

| Component | Required behaviour and states |
|---|---|
| Primary button | Solid accent, minimum 44 px height; stable width during loading; verb label such as “Save promise” |
| Secondary button | Surface background with clear border; available for Cancel, Back, and source inspection |
| Destructive action | Explicit text, separate from main progress action; confirmation names the affected case |
| Text input | Permanent label, supporting instruction below, error connected to field; no placeholder-only labels |
| Money input | INR prefix, decimals limited to two, optional unknown state; negative or invalid amounts rejected |
| Date input | Accessible native or proven date control; manual entry allowed; date precision and timezone visible |
| Unknown toggle | A real option next to date fields; selecting it clears inferred values rather than saving hidden defaults |
| Source picker | Upload button plus drag/drop enhancement; keyboard, touch, and screen-reader path equally complete |
| Screenshot viewer | Preserve aspect ratio, zoom controls, selectable text list, source metadata, Close/Back |
| Passage selector | Checkbox/range selection in text list; visual highlight on image; no drag-only interaction |
| Promise panel | Original text, interpretation, condition, date basis, provenance; compact until expanded |
| Revision comparison | Earlier and later statements with explicit relationship label; no dependence on red/green diff colors |
| Timeline row | Reported event date separate from recorded date; source link and correction history |
| Status label | Plain-language text; elapsed/condition/review states distinct |
| Toast | Noncritical completion only, polite announcement; never sole location for a failed save |
| Inline error | Explains what happened, whether data is saved, and one recovery action |
| Confirmation dialog | Focus trapped, return focus to trigger; destructive action not default focus |
| Export checklist | Per-record and per-image inclusion; none silently added; warns about missing attachment |
| Empty state | Describes the next useful action with real copy, no illustration required |
| Skeleton | Matches layout without displaying invented amounts or fake progress |

## The two signature interactions

### 1. Select the sentence; keep its source

On desktop, text lines and image appear together. Selecting a detected sentence places a quiet amber highlight over its original image location and fills the “Original wording” field. The user immediately understands what will be saved and can inspect the exact source.

On mobile, the text list is primary. A “See on screenshot” action opens the image at the selected passage. Back returns to the same selection and form scroll position. Tapping small text inside an image is an enhancement, never the only way to act.

Bounding boxes map normalized source-image coordinates to the displayed image content rectangle, accounting for aspect-ratio letterboxing and zoom. Test this with tall screenshots and rotated inputs. If coordinates cannot be trusted, keep the text selectable and identify the whole source instead of drawing a misleading highlight.

### 2. A changed promise joins the earlier promise

The user chooses “This updates an earlier promise.” The earlier passage and the new passage appear together. Saving adds a compact connector labelled “Changed date” or “Changed explanation,” with both dates readable.

A brief 160 ms reveal makes the new relationship understandable. The earlier record remains in place; it never shrinks into an unreadable archive. With reduced motion enabled, the new relationship appears without movement and is announced in text.

These interactions embody the product's distinction. They deserve more attention than a marketing animation.

## Screen-by-screen experience

### Landing page

Headline: **“Keep what they promised.”** Supporting sentence explains that the app organizes support statements and uploaded records. Body copy clarifies that uploads are not independently authenticated.

Prefer the more precise supporting line: **“One clear history for a return that keeps changing.”** The main action is “Start a case.” A small labelled fictional example shows an earlier promise, a changed date, and a source reference. No fabricated testimonial or refund total appears.

Below the fold, three plain steps explain capture, review, and export. A short privacy statement appears before sign-in. The page does not demand installing the app.

### Sign-in and notice

Explain why an account is needed: private cases that survive switching devices. Use the official Google sign-in treatment. A failed or cancelled sign-in returns to a stable page with retry. Do not show a case list before verification completes.

The notice says where screenshots are stored, that reading sends the selected image to Amazon Textract, and that the user can enter a note without OCR. Require adult self-attestation and a separate explicit processing acknowledgement before the first OCR call. Analytics consent is optional and off by default.

### Cases list

First use: **“You haven't added a case yet.”** Supporting copy: “Start with the return you're following up on.” Primary action: “Add a case.”

Returning use: Active and Closed tabs, simple rows sorted by recent activity or next check. Show an elapsed date as “Check again — stated window elapsed.” Show a missing condition as “Waiting for receipt confirmation.” No unread badge is invented from elapsed time.

### Create case

Only merchant and item label are required. Optional fields are visibly optional. “Amount requested” includes “I don't know yet.” Case creation produces immediate saved feedback and moves to adding evidence. Back preserves the saved case.

If save fails, the form remains with all values. If the account has reached the active-case cap, show the cap and allow existing cases to be opened or closed; do not upsell a payment flow that does not exist.

### Upload

Show supported format and size before file selection. Preview the actual chosen image at a useful size. Copy: **“Check this image before reading it. Remove bank details, identity documents, or unrelated conversations first.”** The user may reselect a cropped/redacted copy prepared on their device; the app records whatever was supplied and does not call it an original forensic image.

States are “Uploading,” “Saved,” “Reading text,” “Ready to review,” and “Couldn't read text.” Distinguish a lost upload from a saved image whose OCR failed. Manual transcription remains available after OCR failure.

### Review

Title: **“What did they promise?”** Show source text and image; a short numbered sequence leads from passage selection to time/condition fields to confirmation.

The timestamp is never prefilled from file-upload time as though it were the conversation time. Missing dates say “Not known.” If the user enters a corrected transcription, both original OCR and corrected text remain accessible.

The confirmation button states “Save reviewed promise.” A supporting sentence explains that this confirms the transcription, not the merchant's commitment or the evidence's authenticity.

### Case detail

Top area: merchant/item, lifecycle, requested amount if supplied, and one current question. Below it, open promises and chronology. The case can have more than one unresolved promise; the priority display must not erase the rest.

“Open source” reveals the selected passage. “Add an update” is the principal action. Copy follow-up is adjacent to a preview. Export is visible but secondary until there is confirmed material.

If a date elapses while open, update the label without moving content or stealing focus. On server refresh, indicate the current check time if needed.

### Changed-promise review

Earlier statement and new statement are labelled, with their source dates and channels. The relationship is a user-selected category. Require a deliberate selection of the earlier record; do not guess from whichever screenshot was uploaded most recently.

If the earlier record was corrected in another tab, explain the conflict and reload it while keeping the new draft. Never overwrite silently.

### Export

Use a two-step screen: select contents, then inspect output. Default only the structured chronology to selected after the user explicitly enters export; attachments require individual approval. Show source thumbnails large enough to inspect. Avoid a collapsed “include everything” switch.

The print version uses black text, white paper, 11–12 pt body, clear headings, a case version, source numbers, and page-break rules that keep a passage and its label together. Tall images can use dedicated pages with aspect ratio preserved. A date is printed as an absolute date, not “yesterday.”

Copy says **“Prepared, not sent.”** If an attachment fails to load, the packet does not silently omit it. The user either retries or actively excludes it.

### Outcome

The heading asks “What happened?” and does not celebrate before an answer. A partial refund leaves the remaining concern visible. No confetti, victory sound, or automatically calculated success story.

After a completed outcome, offer “View record,” “Reopen,” and “Delete case” in their appropriate hierarchy. A resolved case is still exportable.

### Settings and deletion

Settings focuses on privacy, data download, installation help, contact, logout, and deletion. No billing, team, integrations, or API-key controls appear when those features do not exist.

A deletion confirmation names the case and says whether exported files remain on the device. Account deletion requires recent sign-in and clearly explains that it includes all cases. Pending cleanup is shown honestly. Do not ask a user to contact support merely to initiate ordinary deletion.

## Cross-screen states

| State | Copy and behaviour |
|---|---|
| Loading | Keep screen structure; label the current operation; no invented percentages |
| Empty | Explain the next action, not an unhelpful “No data” |
| Save error | “This change wasn't saved. Your draft is still here.” with Retry |
| OCR failure after saved upload | “Your image is saved. We couldn't read its text.” with Retry and Enter text |
| No detected text | “No readable text found. Try a clearer screenshot or enter the passage.” |
| Access denied/nonexistent case | “This case isn't available to this account.” without leaking its owner/title |
| Version conflict | “This case changed in another window. Review the latest version before saving.” |
| Offline | “You're offline. Connect to open or update private cases.” |
| Successful save | Persistent updated record and subtle “Saved”; toast is supplemental |
| Quota reached | Exact reset time and manual-entry path; no paid upgrade promise |
| Deleted source referenced in draft | Stop confirmation; ask to select an available source or save a user note |

## Scrolling, motion, sound, and haptics

Use ordinary document scrolling. No scroll hijacking, parallax, horizontal narrative rail, or mandatory swiping. Desktop source panes may scroll independently only while the surrounding record and heading remain easy to locate. Mobile uses a full-screen source view rather than nested scrolling.

Motion durations: 100–120 ms for hover/pressed feedback, 160 ms for source focus or new relationship appearance, 180 ms for dialog transitions. Use opacity and minimal transforms; no layout bounce. Respect prefers-reduced-motion by removing movement. Loading remains perceivable through text.

The product is silent. No sound effects, automatic vibration, or synthetic assistant voice. The problem does not benefit from sensory interruption.

## Accessibility acceptance

Target WCAG 2.2 AA. In addition to color contrast, verify keyboard order, meaningful landmarks, focus visibility, focus not being obscured, accessible names, error associations, reflow, and screen-reader operation. Use 44 × 44 px targets as a product baseline; the standard's minimum criterion has more nuanced allowances. [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [target-size guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum).

Every screenshot has a plain description and adjacent extracted or manually entered text. Do not dump hundreds of OCR words into alt text. Source selection works through a text list and keyboard checkboxes. Selection updates use a polite live region, not an announcement on every pointer movement.

Dialogs return focus to their trigger. The app preserves heading order. Inline alerts announce failed saves. At 200% zoom and narrow widths, controls remain reachable without losing the source/statement relationship. Test at least one full case with VoiceOver and keyboard-only interaction.

## PWA behaviour

Use a real manifest with name Still Owed, short name Still Owed, start URL /cases, appropriate scope, standalone display, theme color, and 192/512 px icons including a maskable icon. The icon is a simple ink-blue page with two aligned statement marks and a small connection line. It must remain recognizable at 32 px; avoid scales of justice, currency piles, and AI stars.

The splash/background uses the canvas color and simple mark. Do not create a fake timed splash screen. Browser and operating-system behaviour determine launch presentation.

The service worker caches only explicitly allowlisted public shell assets, fonts, icons, and the static offline page. It never caches authenticated HTML, case APIs, auth callbacks, screenshots, signed URLs, or exports. Offline navigation shows the static explanation; network failure must not masquerade as an empty case list.

There is no background upload, queued private mutation, push notification, or automatic reminder in the first release. A downloaded packet may be read offline through the device's own viewer; that is different from claiming the app has offline case access.

Offer installation after the first saved case, without blocking use. Show platform-specific help only when relevant. Install prompts are enhancements; an unsupported browser remains fully usable online. Service-worker updates must not reload an unsaved review draft. [Next.js PWA guidance](https://nextjs.org/docs/app/guides/progressive-web-apps).

## Best UI proof

The visual argument is the working source selection and the preserved promise change. Show those at phone size in the demo. Judges should see readable content, obvious provenance, a useful empty/error state, and an output they could actually send. An attractive landing page alone is not evidence of usable software.
