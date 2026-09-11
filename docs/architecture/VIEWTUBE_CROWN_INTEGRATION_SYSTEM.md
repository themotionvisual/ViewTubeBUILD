# ViewTube Crown Integration System

## Purpose
Join the Kingdom product/mission pack and Republic engineering/governance pack without creating two competing supreme agents.

## Constitutional split
- **KING** governs desired state: creator intent, mission, product meaning, plans, UX, artifacts, acceptance, tradeoffs.
- **EMPEROR** governs executable state: repository truth, work orders, implementation, tests, services, previews, production receipts.
- **Creator** remains final authority for unresolved consequential product, permission, billing, publishing or irreversible decisions.
- **Grand Artifact Compiler** is a shared knowledge bridge, not a code or Task Index authority.

## Five shared record types
1. `VT_MISSION` — objective, why, non-goals, owners, evidence, authorization, acceptance, rollback.
2. `VT_WORK_ORDER` — checkout/base/head, ordered steps, writer paths, reviewers, tests, release requirement.
3. `VT_RECEIPT` — changed paths, checks, observed results, artifacts, limitations, status.
4. `VT_DECISION` — conflict/question, evidence, recommendation, alternatives, risk, decision state.
5. `VT_ARTIFACT_RECORD` — artifact identity, provenance, type, task/mission links, canonical target and verification.

## Crown lifecycle
`DISCOVER -> SYNTHESIZE -> DECIDE -> PLAN EXECUTION -> EXECUTE -> VERIFY -> LEARN/ARCHIVE`

### 1. Discover
KING defines the creator outcome. Republic Intelligence and specialist finders inspect main, Task Index, current docs, branches and artifacts.

### 2. Synthesize
Grand Artifact Compiler assembles a mission dossier with provenance and identifies contradictions, reuse opportunities and missing evidence.

### 3. Decide
KING plus the smallest relevant Prince set define desired behavior and acceptance criteria. No execution claim is made here.

### 4. Plan execution
EMPEROR resolves actual code owners from the current checkout, creates a work order and schedules non-overlapping writer scopes.

### 5. Execute
The narrowest specialist set implements the work. Existing repo skills are preferred over duplicate Crown roles.

### 6. Verify
Verification Chancellor and relevant Republic Marshals inspect diff, tests, build, runtime, responsive behavior, service boundaries and preview/production state as required.

### 7. Learn and archive
KING compares outcome to intent. Task Authority may update Task Index only from supported receipts. Docs Archivist/Grand Compiler register artifacts and decisions. Brain learning remains revisable and source-linked.

## Current specialist routing
- Dashboard/widget/layout work -> `.claude/skills/viewtube-widget-dashboard`.
- YouTube Data/Analytics/Reporting API work -> `.claude/skills/youtube-api-expert`.
- Analytics raw/canonical data -> VT-SYNC owners; consumer parity -> analytics-canon owners.
- Brain work -> current Brain capability/evidence/user-control owners; do not create a parallel memory store.
- Auth/account/billing -> server-authoritative service owners; client state is explanatory, not authoritative.
- Editor/content/publishing -> current editor/project/video-package owners, with render/publish checks separated.

## Prince ↔ Marshal alliances
| Kingdom Prince | Republic partner | Joint boundary |
|---|---|---|
| Observatory | Intelligence + Design System | dashboard, analytics, UI, visualization |
| Citadel | Service Membrane | auth, session, sync, APIs, Stripe, account |
| Brain | Brain Cognition | evidence, memory, context, tool connections |
| Forge | Video Studio | projects, editor, assets, render, publishing |
| Compass | Task Authority + Docs Archivist | mission, roadmap, philosophy, decisions, artifacts |

## Conflict levels
- L0 specialist ↔ specialist: resolve from canonical owner and mission acceptance.
- L1 specialist ↔ Marshal: Marshal establishes operational constraint; specialist records product impact.
- L2 Prince ↔ Marshal: KING and EMPEROR reconcile desired state with executable state.
- L3 KING ↔ EMPEROR: creator decides unresolved consequential conflict.

## Non-negotiable rules
- One writer per path at a time.
- Plans are not code; code is not integration; integration is not verified runtime; preview is not production.
- Never treat prototype/demo behavior as canonical runtime behavior.
- Preserve null vs zero, provenance, channel/window/grain and partial coverage in analytics evidence.
- Do not broaden OAuth scopes, billing authority, publishing authorization or external writes because implementation is easier.
- Main is production; Crown work follows branch -> PR -> preview -> deliberate merge.
- Recovery material is reviewed and classified before cleanup.

## Adoption plan
Phase A (this PR): instruction skills + protocol/schema + offline demo, no runtime wiring.
Phase B: add a small file-backed `.viewtube/exchange/` mission/receipt reference implementation outside runtime-critical paths.
Phase C: connect Task Index and Master Index readers to Crown records in read-only mode.
Phase D: add optional builder UI for mission/receipt inspection.
Phase E: after contract tests, allow selected developer workflows to emit Crown records automatically.
