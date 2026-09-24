# ViewTube Finish Program — Execution Plan

This task workspace is the execution companion to the architectural Finish Program. It deliberately does not replace the active Settings-specific `tasks/plan.md`.

## Four-program model

### A. Finish the unified Project / Asset workflow
Build the missing creator-facing facade and the contracts that make ContentBuild, Asset Engine, Publishing Package, Launch Package, Editor and Publisher feel like one continuous project.

Critical path:
`AssetSlotRegistry → ApprovedPublishSnapshot → PublishTransaction binding/recovery → post-publish ContentBuild identity → Asset Engine Studio / Project facade`.

### B. Close publishing → analytics → evaluation → learning
Fill outcome writers, measurement targets and comparability guards so recommendations and published assets can be evaluated without false comparisons or broken identity.

Critical path:
`Outcome writer contract → metric comparability → evaluation target coverage → analytics checkpoint → measured evaluation → governed learning`.

### C. Finish Brain / context / intelligence / prompt convergence
Complete active Project context, Opportunity evidence, prompt modernization, Project-grounded retrieval, AI observability and remaining creator-generation migrations.

Critical path:
`Project context → Opportunity evidence → Prompt System Authority → family migrations/evals → assistant continuity / RAG`.

### D. Certify and clean UI / editor / analytics
Finish editor/render parity, responsive/state certification, the 10-widget cohort, data-visual safety, duplicate-owner cleanup and public agent readiness.

## Immediate implementation sequence

### Wave 1 — Publish identity freeze
- ApprovedPublishSnapshot contract + canonical owner.
- stable hash/idempotency key.
- exact ContentBuild/Video Package/asset/metadata revisions.
- PublishTransaction snapshot binding.
- tests proving later edits cannot alter an in-flight transaction.

### Wave 2 — Recovery + post-publish identity
- durable step receipts.
- remote YouTube ID recovery.
- optional-step independent retry.
- manual recovery state.
- published binding + selected asset/variant event writers.

### Wave 3 — Measurement correctness
- metric comparability guard.
- action evaluation targets.
- analytics checkpoint event writer.
- output/asset/recommendation → measured outcome linkage.

### Wave 4 — Brain context and Prompt System
- project/contentBuild context into Brain portfolio.
- Opportunity canonical evidence builder.
- Prompt Registry + Prompt Constitution migration.
- deterministic calculations moved out of prompts.
- structured outputs + validators + eval baselines.

### Wave 5 — Project/Asset UX completion
- Asset Slot Registry.
- Launch Package.
- full Asset Engine Studio workspace.
- Project Overview→Plan→Create→Package→Publish→Performance facade.
- readiness/Continue routing.

### Wave 6 — Editor / widgets / certification
- editor derived-asset closure.
- Remotion parity.
- four-layout certification.
- 10-widget cohort.
- Analytics/Data Visual certification.
- full responsive/state matrix.

### Wave 7 — convergence / durability
- server-authoritative persistence where required.
- dead/duplicate path removal.
- AI source-of-truth registries.
- agent readiness.
- final end-to-end creator-loop certification.

## Merge policy

- one canonical owner per concern;
- small reversible PRs;
- current main always wins over stale branch architecture;
- no deletion without parity/reachability proof;
- backend contract PRs before large UI consumers;
- every UI wave includes mobile/narrow certification;
- every AI wave includes prompt/context/model/evidence provenance and focused evals.
