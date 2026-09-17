# Still Owed

## A casebook for the return that became a second job

**One product. Research and complete product specification. Prepared 17 September 2026 for A. Adarsh Jagannath, @aaj7, Team AAJ.**

Still Owed helps someone dealing with a disputed online-shopping return preserve what support said, see what changed, and prepare their next follow-up without reconstructing the story again.

Add a screenshot. Select the promise. Confirm what it means. When a later message moves the date or changes the explanation, keep both statements together. Export a concise chronology with its supporting screenshots. Close the case when you confirm the outcome.

The product's defining object is a **promise with a source and a history**. A newer support message never silently erases an earlier one.

### Read the specification

1. [The idea, evidence, competition, and selection](</Users/vansitaaddanki/My portfolio 2026 - code/first-commit-product-spec/01-idea-and-research.md>)
2. [Product requirements, features, flows, and success measures](</Users/vansitaaddanki/My portfolio 2026 - code/first-commit-product-spec/02-product-requirements.md>)
3. [Technical requirements, architecture, data, authorization, and AWS](</Users/vansitaaddanki/My portfolio 2026 - code/first-commit-product-spec/03-technical-and-aws.md>)
4. [Design system, screen specifications, accessibility, and PWA](</Users/vansitaaddanki/My portfolio 2026 - code/first-commit-product-spec/04-design-and-experience.md>)
5. [Engineering sequence, folder structure, testing, and operations](</Users/vansitaaddanki/My portfolio 2026 - code/first-commit-product-spec/05-engineering-and-release.md>)
6. [Event alignment, three-minute demo, writeup, blog, learning, and risks](</Users/vansitaaddanki/My portfolio 2026 - code/first-commit-product-spec/06-demo-and-submission.md>)

### Decisions that govern every file

| Decision | Specification |
|---|---|
| First audience | Adults in India with an online-shopping return already stuck in repeated support conversations |
| First supported evidence | English-language PNG/JPEG screenshots; manually entered notes in Unicode |
| Product mechanism | Source-linked promises, explicit revisions, conditional waiting periods, and a portable case packet |
| Application | One TypeScript / Next.js monolith with its own route handlers; no separately deployed backend |
| Database, authentication, files | Supabase Postgres, Supabase Auth, Supabase Storage |
| Competition production hosting | AWS Amplify Hosting, serving the complete application at one URL |
| Vercel compatibility | The same application can deploy as one Vercel project; portability is tested, not assumed |
| AWS product function | Amazon Textract turns screenshot text into selectable lines linked to their image positions |
| Other AWS responsibilities | IAM for permissions, Secrets Manager for server secrets, CloudWatch for operational logs, Budgets for alerts |
| AI boundary | OCR only. No generative model decides facts, rights, escalation, or refund eligibility |
| First release | Free, quota-limited SaaS with real accounts and private persistent cases; no checkout or subscription theatre |
| Offline behaviour | Installable PWA with a truthful offline screen; private cases require a connection |
| Submission strategy | Ship It and Best UI; evidence of the working product rather than prize predictions |

**Hosting interpretation:** “Vercel-deployable” is treated as a compatibility requirement, not a requirement that the competition URL be hosted on Vercel. This allows the complete application to run on AWS for Ship It while preserving the one-app architecture. If Vercel must instead be the exclusive production host, the current event wording leaves Ship It eligibility uncertain; do not silently claim eligibility on that basis.

**Evidence boundary:** This is a specification, not implemented software or a completed customer trial. Public complaints demonstrate a problem pattern, not the truth of every allegation. The research does not establish global novelty, adoption, willingness to pay, faster refunds, or guaranteed judging scores. Proposed test thresholds are labelled as targets. Fictional demonstration material must be labelled on screen.

### Coverage of the requested deliverables

| Requested section | Location |
|---|---|
| Idea; why this idea | 01 |
| First Commit mapping | 06 |
| Full PRD; complete features; must-ship and later | 02 |
| Full TRD; system architecture and design | 03 |
| Engineering plan; folder structure | 05 |
| Stack, dependencies, external services | 03 and 05 |
| Data model, data flow, user flows | 02 and 03 |
| First-time AWS implementation | 03 |
| Auth, authorization, database, storage | 03 |
| AI specification | 03, OCR boundary |
| Detailed design system and screen-by-screen UX | 04 |
| PWA behaviour | 04 |
| Demo script; submission draft; Builder Center blog | 06 |
| Four-day learning; risks and disqualification traps | 05 and 06 |

