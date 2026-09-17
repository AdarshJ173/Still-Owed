# 1. The idea and the evidence

## What the person is dealing with

An online purchase is returned. Support says the refund will arrive after the warehouse receives it. Another conversation says pickup never happened. The customer has a pickup screenshot, a chat promising a refund, and several new dates spread across their phone.

The next representative asks them to explain everything again.

The work is no longer simply remembering to return an item. It is maintaining a coherent account of a process controlled by other people. Each new promise creates more work: save it, remember its conditions, calculate when to follow up, notice whether it contradicts an earlier statement, and reconstruct the evidence when the conversation restarts.

Still Owed is for that moment. Its name describes the customer's unresolved concern; the interface always calls the money **“Amount requested”**, never a legally established debt.

## The solution in ordinary language

You open a case for a stuck return and add screenshots from the support conversations you already have. The app makes the text selectable. You choose the actual sentence that matters and record what support promised, when they said it, and what must happen first.

For example: “Refund within 48 hours after warehouse receipt.”

The app asks whether warehouse receipt has been confirmed. If not, it shows **“Waiting for receipt confirmation”**, rather than inventing a refund deadline. If a later message says something different, you connect it to the earlier message. The app shows both and preserves the original date.

When you contact support again, a single page shows the sequence, the unresolved question, and the exact screenshots behind each statement. You can copy a factual follow-up or print a case packet. You decide where to send it. The app does not contact anyone for you.

After you check your payment account, you record whether the money arrived, partly arrived, or the case ended another way. A support message saying “processed” cannot close the case automatically.

## Who it serves first

Adults in India who already have a disputed e-commerce return involving at least two support interactions. The first release is designed for people who can use an English interface and upload English screenshots.

Students and salaried consumers with one expensive purchase at stake are plausible early users, but their adoption has not been measured. Someone helping a parent may organize information they are authorized to handle in their own account; shared accounts and delegated access are not first-release features.

This does not begin with all purchases, all financial disputes, all customer support, or a business help desk. It begins after the normal return process has stopped being understandable.

## What changes after using it

Before: “I think someone promised Friday. I need to find the chat.”

After: “On 12 September, support said Friday, conditional on warehouse receipt. On 15 September, another message gave Monday. Both screenshots are attached. Warehouse receipt remains unconfirmed.”

The immediate outcome is a usable record and a clearer next question. A refund is a downstream outcome controlled by other parties, and the product must not claim otherwise.

## Why this is useful beyond a demo

The same case remains useful across repeated support conversations. The user does not need a merchant integration, inbox access, a legal relationship, or the other party to adopt the app. They can leave with a printable document and their files. A screenshot that took time to save becomes something they can actually retrieve and explain.

The product earns repeat use while a case is active. Once the problem is resolved, infrequent use is appropriate. Daily engagement, streaks, and time spent in the app would be poor success measures.

## Research method and limits

Research was conducted on 17 September 2026 using public web search, accessible source pages, official reports, product descriptions, community accounts, and current vendor documentation. No private messages, authenticated Discord discussions, proprietary consumer datasets, customer interviews, or merchant records were inspected.

Searches covered refund and pickup disputes, support promises, administrative burden, existing return products, complaint tools, and implementation constraints. Healthcare transition research was also examined during problem selection; the final direction avoids a clinical decision surface and hospital integration dependence. This does not imply that the consumer problem is more important than a health problem.

Search results can be incomplete and their crawl timestamps unreliable. Publication dates are used where available; undated product pages are treated as observations at research time. Repeated cross-posts count as one account. Product claims are not independently tested capabilities.

### Evidence ledger

| Evidence | What it establishes | What it does not establish | Design consequence |
|---|---|---|---|
| Indian government's February 2026 NCH report | Refund grievances are substantial in a real redressal channel; e-commerce is prominent | Population prevalence, unresolved national total, or demand for this app | Focus the initial domain and measure actual usefulness |
| Indian return-pickup complaint posted in April 2023 | One person describes losing the ability to demonstrate a pickup without a receipt | That the merchant or courier acted as alleged | Label evidence provenance and missing acknowledgments |
| August 2026 refund account with pickup photos and a support confirmation | A customer reports conflicting accounts despite retaining material | Independent confirmation of the dispute | Preserve statements, actor, date, conditions, and changes |
| June 2025 laptop-return account | A person describes changing explanations across contacts | Legal entitlement or the ultimate resolution | Do not replace earlier explanations with the latest status |
| Public LinkedIn account of refund marked complete but not received | Reported mismatch between merchant status and customer's observed receipt | Bank settlement truth | Keep “support says processed” separate from “I received it” |
| OECD sludge review and consumer research proceedings | Friction has time, cognitive, and emotional dimensions | A causal estimate of this product's benefit | Measure reconstruction effort rather than promise recovery |
| Existing refund trackers and Resolver | The broad category already exists | Exhaustive coverage of every competitor | Differentiate at the promise-history level; do not claim category invention |

### Quantitative anchor

The Ministry of Consumer Affairs reported 79,521 refund-related grievances addressed through NCH across 31 sectors for the reported April 2025–January 2026 period, with approximately ₹52 crore facilitated in refunds. Its e-commerce row lists 47,743 grievances and ₹36,79,86,191 refunded. Those are administrative results from that channel, not the number of people nationally who need Still Owed. [PIB, 17 February 2026](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2229099&lang=1&reg=3).

| Measure from that report | Value | Appropriate interpretation |
|---|---:|---|
| Refund grievances across reported sectors | 79,521 | Cases addressed in the described NCH programme period |
| E-commerce refund grievances | 47,743 | About 60% of the reported grievance count; calculated from the two counts |
| E-commerce refunds facilitated | Approximately ₹36.8 crore | Reported recovered value, not our market size or product impact |

No market-size extrapolation is justified by this table. There is no measured conversion rate from a grievance to an app user.

### Lived accounts

A 2023 account describes a return collected without a pickup confirmation, followed by support saying nothing had been collected. This illustrates why missing acknowledgment is its own state, rather than evidence that a refund is already overdue. [Original Reddit account](https://www.reddit.com/r/india/comments/12z4eux/myntra_scam_return_pick_up/).

A 2026 account describes a photographed handover, a written support confirmation, and later inconsistent explanations. Still Owed would preserve the sequence without determining which participant was correct. [Original Reddit account](https://www.reddit.com/r/amazonindia/comments/1vnbz9q/amazon_india_denied_my_refund_after_confirming/).

A 2025 account reports being told first that a returned laptop was lost and later that a different item arrived. The useful product response is to link the two source statements and help the customer ask for clarification. It is not to label a merchant fraudulent. [Original Reddit account](https://www.reddit.com/r/LegalAdviceIndia/comments/1libi66/amazon_india_refused_85k_refund_for_hp_victus/).

A public LinkedIn post describes repeating supporting information after an application showed a refund as complete. Its value here is qualitative: merchant status and observed receipt must be different fields. The account is not independently verified. [Public LinkedIn post](https://www.linkedin.com/posts/mark-pekel_almost-nobody-talks-about-this-but-your-activity-7481744719191060480-M-0o).

The selection is not an allegation against a particular retailer. The product accepts any merchant name as user-entered text and uses a fictional merchant in its demonstration.

### Research on the mechanism

The OECD's review of sludge audits provides a framework for examining unnecessary process friction and unequal burdens. That supports assessing the repeated work around a return, but it does not validate this app. [OECD, Fixing frictions](https://www.oecd.org/content/dam/oecd/en/publications/reports/2024/06/fixing-frictions-sludge-audits-around-the-world_1b4bbf1a/5e9bb35c-en.pdf).

The Association for Consumer Research proceedings describe research involving administrative tasks and experimental phone-bill-refund scenarios. Treat this as mechanism-level background, with the limitations of proceedings evidence and hypothetical tasks, not an India-specific recovery trial. [Advances in Consumer Research, volume 50, page 519](https://acr.memberclicks.net/assets/Proceedings/vol50.pdf).

The practical need to preserve contacts, dates, and commitments is also reflected in official consumer guidance. This US source supports the recordkeeping mechanism only; its legal remedies are not imported into the Indian product. [FTC consumer guidance](https://consumer.ftc.gov/articles/solving-problems-business-returns-refunds-and-other-resolutions).

### Coverage of the requested research surfaces

| Surface | Result and confidence |
|---|---|
| Reddit | Several accessible first-person dispute accounts; strong qualitative signal, substantial selection bias |
| LinkedIn | Accessible public refund-continuity account; supplemental anecdotal evidence |
| X/Twitter | Targeted public searches did not yield sufficiently usable original material for a supported claim |
| Threads | Targeted public searches did not yield sufficiently usable original material for a supported claim |
| Independent forums | A MoneySavingExpert thread describes confusion about whether uploaded evidence reached a company through Resolver |
| Product Hunt | Searches did not provide usable, directly relevant user-comment evidence |
| App stores | A ReturnNotice listing was discovered through its maker's post, but direct listing access failed; no review findings are claimed |
| GitHub issues | Search did not yield a sufficiently relevant consumer complaint sample; software documentation is used separately |
| Discord | No private or authenticated community access; no Discord findings claimed |
| Academic literature | Consumer administrative-burden work, with scope limitations stated above |
| Government and major reports | India NCH outcomes; OECD friction research; FTC enforcement record |
| Datasets and charts | Official NCH table is the quantitative anchor; no original survey or scraped complaint dataset was assembled |
| Failed-product lessons | A documented failed marketing claim from DoNotPay; not a claim that its entire business failed |

Coverage is reported honestly instead of manufacturing quotations to fill every channel. Research across these surfaces is not equivalent to validated product demand.

## What already exists

| Existing product or substitute | Publicly described overlap | The distinction Still Owed must earn |
|---|---|---|
| Return Window | Forward purchase emails; calculate return windows; receive reminders | Begin with an already-disputed return and preserve evolving support statements |
| ReturnRadar | Deadlines, refunds, reminders, user confirmation of recovery | Conditional commitments, separate source statements, and explicit relationships between revisions |
| OrderTracker | Screenshot/Gmail import, pending human review, attention queue | A source-preserving case packet and non-overwriting promise history; “human reviewed screenshots” is not novel |
| Resolver UK | Consumer complaint assistance, case management, documentation | A portable record that does not require routing the complaint through the product |
| Notes, folders, spreadsheet, calendar | Can store the entire story with enough manual effort | Reduce the joins between a statement, its screenshot, its condition, and its successor |
| General AI chat | Can summarize an uploaded conversation | Deterministic dates, durable source links, explicit uncertainty, and no invented case facts |

Sources: [Return Window workflow](https://returnwindow.app/get-started/), [ReturnRadar description](https://getreturnradar.com/), [OrderTracker maker's post](https://www.reddit.com/r/SideProject/comments/1vwemjc/i_built_a_tracker_for_online_orders_and_refunds/), [Resolver UK](https://www.resolver.co.uk/?v=1.0.24).

The closest warning is OrderTracker: its published description already includes screenshot ingestion, review, and stale-refund attention. Building those features alone would be a reskin. The defining release test for Still Owed is whether a person can preserve an earlier promise, connect a changed promise, distinguish an unmet condition, and export both with their sources.

Resolver also demonstrates that organizing a complaint is established territory. A forum user specifically described uncertainty about delivery of uploaded evidence; this motivates clear export status and avoiding “sent” claims when a file has only been generated. It does not establish a systemic defect in Resolver. [MoneySavingExpert discussion](https://forums.moneysavingexpert.com/discussion/6444792/sending-file-to-company-through-resolver-complaints-service-a-bit-of-help-needed-please).

**Novelty claim:** the proposed differentiation is a narrow workflow combining source selection, conditional waiting, and non-destructive promise revision for consumer return disputes. This research does not prove that no product already implements that combination. The business cannot rely on a permanent technical moat. It must earn trust and preference through less work, accurate records, and usable exports.

## What unsuccessful approaches teach us

The FTC finalized an order concerning DoNotPay's unsupported AI-lawyer claims. The relevant lesson is about substantiation and the boundary between assistance and professional authority. Still Owed makes no prediction of legal success, drafts no legal notice, and does not describe itself as a lawyer. [FTC case record](https://www.ftc.gov/legal-library/browse/cases-proceedings/donotpay).

No verified shutdown analysis of a directly equivalent promise-ledger product was found. It would be misleading to invent one. Foreseeable commercial failures remain: low willingness to pay, episodic demand, distrust of uploading screenshots, and the possibility that a phone folder is good enough.

## Why this direction survives selection

The evidence supports a recurring, describable task performed by a person who can use a standalone website today. The full outcome does not depend on a hospital, school, government, bank, or merchant integrating software. The system does not need to make clinical decisions, move money, establish legal truth, or automate an adversarial interaction.

Broader tracking concepts were discarded because the competition already offers them. Generative advice surfaces were discarded because the difficult part is preserving and verifying facts. Institution-dependent workflows were discarded because the builder cannot demonstrate their complete operational loop alone. SME automation was not selected: this evidence concerns an individual carrying an unresolved consumer process.

The ambition lies in treating a repeated promise as a first-class record with conditions, attribution, version history, and a useful exit artifact. That is a complete product mechanism, small enough to demonstrate and deep enough to require careful engineering.

## Validation before making impact claims

Recruit five consenting adults who have handled a stuck return recently. This is a proposed initial test, not research already completed. Ask for redacted material or let them use the app privately without sharing their screenshots with the builder.

Observe each person reconstruct a case using their current method, then use Still Owed with comparable material. Counterbalance task order where feasible. Record time, missing facts, mistaken dates, and whether the exported chronology is understandable to another person. Avoid treating the second attempt's speedup as purely caused by the product.

The initial release target is that four of five can create a source-backed promise and a correct revision without coaching, and none mistakes an unconfirmed condition for a guaranteed refund deadline. Five participants cannot establish a population effect; failures identify design repairs.

Ask whether they would use it again when a dispute occurs, not whether they “like the idea.” Test whether source selection saves enough work to justify another account. If the promise/history distinction proves unhelpful, the novelty hypothesis has failed even if the interface is attractive.

The strongest permissible first claim is modest: **“In this observed task, these participants reconstructed their return history with these errors and this completion time.”** Publish the actual results and limitations, including negative ones.
