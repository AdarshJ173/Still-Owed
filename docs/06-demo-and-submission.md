# 6. First Commit, demonstration, and submission

## Competition position

**Submit Still Owed for consideration across the event's tracks, with Ship It and Best UI as the design targets.** The complete application runs on AWS Amplify Hosting. Textract powers the screenshot-to-source interaction. The interface makes that interaction and the promise history clear enough to judge in a short recorded video.

The current official page describes one submission considered across the tracks and asks Ship It entrants for a live AWS deployment. The rules require AWS to appear in the demo and specify a public repository, short writeup, and YouTube video under three minutes. Scores are discretionary; neither this specification nor an architecture can guarantee full marks. [First Commit](https://www.wemakedevs.org/aws/first-commit), [tour rules, updated 16 September 2026](https://www.wemakedevs.org/aws/rules).

## Rules carried forward from the supplied brief

The following is the builder's operating checklist, based on the event constraints supplied in prompt.md. Recheck the official form for changed operational details before submission.

| Area | Requirement and action |
|---|---|
| Event | First Commit, event 01 of 06, Bharat Builds Tour, WeMakeDevs × AWS |
| Dates | Online 17–20 September 2026; record the announced kickoff and exact submission cutoff |
| Location | Build from Hyderabad; optional Bangalore day on 19 September, 8 am–8 pm, adds no judging advantage |
| Builder | A. Adarsh Jagannath, @aaj7, Team AAJ, currently solo; verify private registration details in the official account |
| Eligibility | Indian university student, 18+; builder must verify actual eligibility, not infer it from this document |
| Registration | WeMakeDevs account, tour registration, event check-in, AWS Builder Center profile |
| Student verification | Resolve university verification; the brief allows ongoing SheerID cases for participation/judging, while rewards/interview eligibility remain subject to verification rules |
| Team | One team per person, one submission per team, maximum four people; do not change team after submission |
| Original work | Start new implementation after opening, stop at deadline; preserve honest history |
| Third-party materials | Libraries and templates permitted; credit and licence all reused work |
| AI tools | Allowed; disclose actual tools and what they did |
| Submission | Public repo, accessible YouTube video, short writeup, official form |
| Conduct | Follow event code; no copying, harassment, cheating, or misleading evidence |
| Rights | Builder retains rights; organizers may showcase the project under entry terms |

The team code is intentionally omitted from public-ready copy. It is not a product credential or a useful repository field.

### Prize and opportunity strategy from the brief

| Opportunity | Brief-supplied award | Concrete response |
|---|---|---|
| Ship It | ₹2,00,000 + $3,000 AWS credits | AWS-hosted URL, actual OCR, explain permissions and cost |
| Build It | ₹1,50,000 + $2,000 credits | No separate local-only version; one submission is evaluated under the event's process |
| Best UI | ₹1,00,000 + $1,000 credits | Source selection, readable revisions, mobile use, and trustworthy states |
| Four runners-up | $1,000 AWS credits each | No extra submission path required |
| Top five blogs | Logitech gaming keyboard | Publish actual build experience on AWS Builder Center |
| Tour kit | For top teams under event terms | No product-design decision depends on swag |
| Amazon fast-track | Up to ten eligible students from top projects | Separate selection; neither a prize nor employment is guaranteed |

The brief lists Arkodyuti Saha, Manisha Choudhary, Jitesh Udwani, Aman Raj, Brijesh Dubey, Makendran Gunasekaran, Jatin Mehrotra, and Veeramani A. as named judges. Build for the stated criteria, not presumed personal preferences. For the interview path, the brief specifies 2027/2028 graduation cohorts and additional verification; do not claim eligibility without matching the actual registration and final terms.

## Judging-criterion mapping

| Criterion | What this product can demonstrate | Evidence to prepare | What would weaken it |
|---|---|---|---|
| Idea and Impact | One person stops reconstructing the same disputed return | Specific problem, public evidence, observed task results if obtained | National-scale claims or pretending organized evidence guarantees a refund |
| Built on AWS | Complete app hosted on Amplify; selectable screenshot text from Textract | Live URL, deployed commit, successful request and source selection | A logo with a mocked provider response |
| Learning | First AWS deployment, IAM role, OCR limits, cost control, source provenance | Actual engineering journal and one specific repaired failure | A list of services without a learning story |
| Execution | Capture, confirm, revise, export, record outcome | Unbroken logical user path in real deployed software | Half-working features or silent errors |
| Demo video | Under-three-minute explanation and visible product use | Timed storyboard, captions, working signed-out YouTube link | Architecture slides that crowd out the product |
| Best UI | Clear source selection and preserved change on a phone | Real interaction at readable zoom, error/offline clarity, printable output | Tiny text, decorative dashboard, unclear ownership of actions |

The event publishes no numerical weights in the material inspected. Do not invent a weighted score or promise “100/100.” Optimize for verifiable evidence across every criterion.

## Demo fixture

Use a fictional merchant named **Demo Store**, a fictional ₹4,800 purchase, and an invented order reference DEMO-104. Every fixture image carries a visible “Fictional example” mark. The value and dates illustrate behaviour; they are not an actual recovery or merchant allegation.

Prepare two screenshots:

1. A support message dated 12 September 2026: “We will issue the refund within 48 hours after warehouse receipt.” No warehouse receipt is shown.
2. A support message dated 15 September 2026: “Please allow five working days after warehouse receipt.” Again, no receipt confirmation is shown.

These deliberately demonstrate a missing trigger and changed wording. Do not pretend the second message proves a legal breach. The user's appropriate next question asks for the receipt date and clarification of the changed period.

Create one disposable case for deletion coverage if necessary. All operations run through actual authentication, storage, Textract, and database paths. Fixture images are input data, not precomputed “AWS” results.

## Video script: 2 minutes 55 seconds

Record at 1080p or higher with readable browser zoom. Keep the cursor deliberate. Captions use the actual narration. Trim waiting periods only with ordinary visible edits; do not alter outputs, pretend speedups are measured latency, or splice mock functionality into the product.

| Time | On-screen action | Narration |
|---|---|---|
| 0:00–0:10 | Show the two fictional messages and a phone folder of the demo inputs; title “Still Owed — fictional example” | “A return gets stuck. Each support conversation gives you another promise, and you keep rebuilding the same story. Still Owed keeps that history together.” |
| 0:10–0:22 | Google sign-in completes; create the private Demo Store case; brief privacy notice visible | “Start a private case and add the screenshots you already have. The app explains where they're stored and how text reading works.” |
| 0:22–0:42 | Upload first screenshot; actual saved/reading/ready states; select its detected sentence; image passage highlights | “Amazon Textract reads this image. I select the actual sentence, check it against the source, and save the promise.” |
| 0:42–0:59 | Confirm condition and unknown trigger; show resulting case state and open source | “The refund period starts after warehouse receipt. We don't have that date, so the app doesn't invent an overdue refund. It shows the missing confirmation.” |
| 0:59–1:23 | Add second screenshot, select passage, connect to earlier promise as changed period; show both sources | “A later message changes the waiting period. I connect it to the first promise. Both remain visible, including their wording and dates. New information doesn't erase the earlier record.” |
| 1:23–1:40 | Preview and copy follow-up; select export contents; show print preview and browser print/Save as PDF | “Now I can ask a specific question and prepare a chronology with the supporting images. I choose what to include and where to send it. The app sends nothing for me.” |
| 1:40–1:53 | Record fictional received outcome, show user-reported label, reopen case | “A message saying ‘processed’ doesn't close the case. I record the outcome after checking it myself, and I can reopen it if needed.” |
| 1:53–2:05 | Show installed PWA window; disconnect briefly; honest offline screen; reconnect | “It installs on my phone. Private cases need a connection, and the app says so instead of showing stale information.” |
| 2:05–2:22 | Download account data; delete disposable case; show recent reauthentication and deletion completion in a clearly edited account-deletion clip | “I can take my records with me, delete a case, or remove my account. Private material is kept out of the app's offline cache.” |
| 2:22–2:46 | AWS Amplify deployment and commit; production URL; sanitized CloudWatch entry matching the OCR request ID, then return to actual source-selection screen | “The complete application runs on AWS Amplify. This request went to Textract using a restricted temporary role. Supabase handles accounts, database, and private files. Per-user limits and a project cap bound OCR usage.” |
| 2:46–2:55 | Return to promise comparison and clear product title | “I learned to preserve uncertainty instead of turning every date into a deadline. Still Owed gives a stuck return a clear record and a useful next step.” |

This script reserves 175 seconds, leaving five seconds below the user's three-minute limit and additional margin relative to a strict “under three minutes” reading. Rehearse with real UI latency. If it overruns, shorten narration and incidental pointer movement; preserve the core mechanism and AWS proof.

### Recording requirements

Use only synthetic screenshots and demonstration accounts. Redact account numbers, email addresses, role-account identifiers where appropriate, secret values, browser bookmarks, and unrelated tabs from technical shots. Keep a request identifier visible so the AWS clip can be tied to the demonstrated extraction without exposing the screenshot in logs.

The user interface's “Reading” label is not by itself proof of AWS use. Pair the actual result with the deployed code/version and a sanitized successful request trace. A CloudWatch record is developer-controlled evidence, so avoid describing it as independent certification; the public implementation and reproducible deployment support the claim.

Show errors honestly if they occur. Rerecord a successful real operation after fixing the issue. A video showing a mocked response while describing a live call would violate the point of the demonstration.

### Must-ship coverage audit

M1/M2 appear at 0:10; M3/M4 at 0:22–0:59; M5 at 0:59; M6/M7 at 1:23; M8 at 1:40; M10 at 1:53; M9 at 2:05. Production safeguards are covered by release evidence and public documentation, with their user-facing effects shown where time allows. Do not claim security guarantees merely because a three-minute demonstration did not reveal a problem.

## Submission writeup draft

**Publication rule:** the following is a finished draft for the specified release. Use it only after every stated capability has been implemented and verified. At present it describes the planned product, not work already completed. The final submission must attach the actual repository, live URL, video, and actual AI-tool disclosure; do not fabricate links or usage history.

### Still Owed — a clear record for a stuck return

When an online return goes wrong, the customer often has to reconstruct the same story across support conversations. A later date replaces an earlier promise, screenshots become hard to find, and “refund processed” is easily confused with money actually received.

Still Owed is a private casebook for that situation. A user adds a screenshot, selects the relevant support statement, confirms its wording and conditions, and connects later changes without losing the original. If a refund period depends on warehouse receipt and that date is unknown, the app preserves the uncertainty. It does not invent an overdue deadline.

The user can prepare a chronological case packet with selected supporting images and a factual follow-up. Nothing is sent automatically. Outcomes are recorded by the user, and the product does not decide legal entitlement or guarantee a refund.

The complete Next.js application runs on AWS Amplify Hosting. Amazon Textract makes screenshot text selectable and links it back to its position in the image. A restricted IAM compute role provides temporary credentials. Supabase supplies authentication, Postgres, and private Storage. The same application is deployable as one Vercel project; it has no separate backend service.

The design centers on two interactions: selecting a statement while seeing its source, and comparing a changed promise with the earlier one. Our recorded example is fictional and clearly labelled. It demonstrates working software, not a claimed refund recovery.

This build taught me to connect an AWS service securely, bound OCR cost, and model dates without discarding their conditions. The most important product decision was to preserve what was said and what remains unknown.

### Required factual attachments before submission

Attach the real public repository URL, AWS production URL, accessible YouTube link, and optional published Builder Center article. State exactly which AI coding/design/research tools were actually used and how their outputs were checked. Link the attribution file. Include actual test results if available; omit any research outcome not measured.

## AWS Builder Center blog outline

**Title:** “The refund clock that must not start: building Still Owed with Amplify and Textract.”

1. **The real problem.** Explain the repeated reconstruction of support promises. Cite the official NCH report with its scope limitations and anonymized public problem patterns. Do not republish a person's screenshots without permission.
2. **The important product object.** Define a promise as wording, source, actor/channel, time, condition, and change history. Explain why a single refund-status field was insufficient.
3. **One complete application.** Show the browser → Next.js → Supabase path and the server → Textract path in plain language. Explain AWS production hosting and Vercel portability.
4. **The first AWS integration.** Describe account versus Builder ID, region, compute role, temporary credentials, and a real synthetic-image request. Include no secrets.
5. **What OCR can and cannot tell us.** Show source line selection and a correction. Explain English-only first support and why confidence is not truth.
6. **What fought back.** Use actual incidents from the engineering journal: for example an IAM issue, SSR environment mismatch, source-coordinate bug, or ambiguous date. Do not present hypothetical difficulties as experiences that happened.
7. **A better date model.** Walk through a missing warehouse-receipt trigger and a changed period. Show the repaired behaviour and its test.
8. **Design work that mattered.** Explain keyboard source selection, mobile comparison, honest states, and print output. Use actual screenshots of the implemented UI.
9. **Cost and data handling.** Report actual call counts and costs with the period and credit treatment. Explain Supabase storage, deletion, budgets, and quotas.
10. **What users actually did.** Report observed task results or candidly say the deployment has not yet been tested with affected consumers.
11. **What comes next.** Limit this to validated gaps; end with the product/demo/repository links and actual tool/asset credits.

The blog is an additional prize path. It must not delay the three required submission artifacts.

## Learning record for the four days

| Learning | Artifact demonstrating it |
|---|---|
| AWS account, region, and Builder ID distinctions | Setup notes with credentials omitted |
| Secure managed application hosting | Successful Amplify deploy and documented runtime configuration |
| IAM runtime roles versus permanent keys | Narrow permission rationale and role setup |
| OCR geometry and recognition limits | Synthetic fixtures, source-selection behaviour, correction examples |
| Date uncertainty and conditional commitments | Domain tests and visible pending-condition state |
| Auth beyond a login button | Two-user isolation tests at database and storage layers |
| Reliable external calls | Lease, quota, timeout, and duplicate-request tests |
| Honest PWA design | Installation and offline/cache inspection |
| Usability under administrative stress | Actual task observations and resulting repairs |
| Cost-aware architecture | Measured usage, caps, budget alerts, and tradeoff notes |

Write two or three sentences at the end of each build day about what was unexpected, how it was investigated, and what changed. The final learning story should come from those notes.

## Risk register and disqualification traps

| Risk | Mitigation and remaining limitation |
|---|---|
| Existing-product overlap | Explicitly acknowledge trackers and complaint managers; demonstrate conditional promise history. Global novelty is unproven |
| People prefer a folder and notes | Observe real reconstruction tasks; measure effort and errors rather than claiming demand |
| User effort outweighs benefit | Keep scope to already-stuck returns; avoid logging every purchase; test passage selection |
| Merchant does not accept the packet | Export ordinary text/images; claim organization, not guaranteed acceptance |
| Fabricated screenshot | Do not authenticate truth or produce legal claims; preserve uploaded bytes and provenance labels |
| Incorrect OCR | Mandatory review, accessible original, visible corrections, manual path |
| False deadline | Unknown trigger stays pending; business-day wording remains uncalculated without confirmed interpretation |
| Private data exposure | Private storage, RLS, no public sharing, no session replay, no private caches, isolation tests |
| Provider content use | Review terms, configure appropriate opt-out, and disclose processing accurately |
| Incomplete deletion | Tombstone access, bounded retries, monitoring, backup retention disclosure |
| Expensive public demo abuse | Auth, transactional quotas, restricted credentials, alerts, kill switch |
| AWS not visible | Show a real extraction, its deployed AWS host, and corresponding sanitized request trace |
| Vercel-only host misrepresented as Ship It | Submit the complete AWS-hosted application; portability is a separate tested property |
| Old project history | Start new implementation after kickoff; do not reuse the portfolio app as the project |
| AI-generated unlicensed assets/code | Record actual tools, inspect output, retain dependency/font/icon licences |
| Pretending a fixture is a customer result | Label fictional inputs on images, in video, and in writeup |
| Unmet production gate | Repair before real-data launch; accurately label a limited pilot if gates remain unmet |
| Deadline uncertainty | Verify exact time and form, submit early, preserve confirmation, stop at cutoff |
| Video over limit or inaccessible | Export at 2:55 maximum; test YouTube signed out and check captions/readability |
| Team or eligibility mismatch | Verify official registration, freeze team before submission, resolve student verification |
| Prize/interview overclaim | No promised score, prize, interview, job, or cumulative award eligibility beyond event terms |

## Final submission checklist

- New project history falls within the event's authorized build window.
- Public repository contains the implementation, setup instructions, licence, third-party credits, and real AI-use disclosure.
- Production URL serves the complete application from AWS.
- Sign-in works for someone outside the builder's own test-user list.
- Core data and source selection are real; fictional input data is visibly labelled.
- Privacy, authorization, deletion, and release tests have been completed or limitations are stated honestly.
- Demo is under three minutes and shows what the user does and where AWS fits.
- YouTube and repository links open signed out.
- Short writeup matches the demonstrated commit; no later feature is described as shipped.
- Official submission form is completed once before its exact deadline; confirmation is retained.
- Optional Builder Center blog reports actual work and is linked only after publication.
