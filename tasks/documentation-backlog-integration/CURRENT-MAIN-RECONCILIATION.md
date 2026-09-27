# Current Main Reconciliation Audit

**Production Date:** 2026-09-27  
**Class:** AUDIT / task-workspace evidence  
**Status:** ACTIVE RECONCILIATION EVIDENCE  
**Audited Main SHA:** `3ed2bc91f324338fd110a160d65ddbed93806142`  
**Purpose:** eliminate work already completed or superseded before integrating unfinished work into governed artifacts.

## Execution refresh — 2026-09-27

Current main advanced substantially beyond the original `76519e3d…` planning baseline before this execution wave.

Newly proven changes that shrink the unfinished interpretation:

- **VT-001 MetricComparabilityPolicy is DONE.** Canonical policy now lives in analytics-canon with compatibility routing.
- **VT-023 evaluation integration is DONE.** PR #511 routes Algorithm evaluation through canonical metric comparability and fails incompatible evidence closed as `insufficient_data`.
- **VT-024 remains open.** Visual/experiment consumer integration is now the remaining comparability follow-on.
- **Conversation Handoff + Work Reconciliation is on current main.** Long conversations now have governed `handoff.md`, `worklog.json`, and `review.md` intake packages; do not create another conversation backlog store.
- **Evidence/intelligence convergence advanced.** Current main contains `EvidenceRecord`, derived-signal convergence work, Evidence Intelligence auditing and additional Brain evidence-quality integration tests. Older Brain/evidence backlog claims must be rechecked before leaf task promotion.
- **Task Index VNext writer/storage remains unresolved on current main.** Canonical task mutation therefore stays proposal-only.
- **Project package asset selection authority advanced in PR #512.** Project thumbnail/package selection now keeps canonical ContentBuild selection reversible and idempotent, preserves VariantGroup selection without implicit finalization, and reserves `asset.finalized` for explicit later finalization. Do not retain “fix contradictory package selection/finalization provenance” as open greenfield work.

This refresh does not erase the original baseline; it supersedes its current-state claims for execution.

## Evidence policy

Classification follows `docs/governance/TASK_AUTHORITY.md` and `VERIFICATION.md`.

- **ELIMINATE FROM UNFINISHED** — current main contains the implementation foundation and appropriate focused evidence; do not recreate the capability.
- **VERIFYING / FOLLOW-ON ONLY** — implementation exists, but remaining runtime/integration/certification work is narrower than the historical task.
- **KEEP OPEN** — a required production caller, integration, durability, certification, or system still does not exist.
- **SUPERSEDED SOURCE** — prose/plan is not current authority and should be harvested/archived, not copied forward as active work.

This audit is not a canonical task mutation.

## A. Eliminate from the reconstructed unfinished backlog

### Documentation / agent operating system

1. **Document System foundation A/B** — implemented.
   - Governance, Verification, Work Objects, registry, Product Completion Constitution, Product Architecture, capabilities registry, Integrated Application Program and Removed Archive structure exist.
   - Evidence: `tasks/document-system-foundation/PHASE-A-B-RECEIPT.md`.

2. **Conversation OS / Crown / Task Authority Phase C** — implemented.
   - Current authorities and skills exist.
   - Evidence: `docs/governance/CONVERSATION_OS.md`, `TASK_AUTHORITY.md`, `tasks/conversation-os-phase-c/PHASE-C-RECEIPT.md`.

3. **“Create one documentation governance system”** — completed as a foundation.
   - Follow-on work is migration/consolidation, not building another governance system.

4. **“Create Conversation OS”** — completed as a foundation.
   - Follow-on work is adoption, receipts, stale-state reconciliation and VNext task storage.

### Settings / workspace usability

5. **Settings frontend primitive redesign** — implementation landed.
   - `SettingsWorkspace`, dedicated panel modules, primitive-governance tests and compact layout exist on main.
   - Old Settings mini-design-system was removed.

6. **Global Quick Switcher foundation** — implemented.
   - `GlobalQuickSwitcher.tsx`, command catalog, recent destination history, pinned destination store and Settings controls exist.

7. **Navigation personalization** — implemented.
   - Top / Wide / Thin / Rail live layout preference exists.

8. **Workspace UX preference store** — implemented foundation.
   - Compact mobile bar, page/orientation persistence, keyboard restore, sticky headers, toolbox state, nav auto-hide, edge swipe, thumb zone and related preferences exist.
   - Remaining app-wide certification/state-manager ideas are follow-ons, not a new preference system.

### Toolbox / Studio UI

9. **Video Manager canonical primitive migration** — implementation exists with contract tests.
   - `VideoManager.contract.test.ts` requires canonical SubToolbox controls and rejects raw button/textarea/table patterns.

10. **Toolbox responsive CSS ownership consolidation** — specific migration landed.
    - Recent main commits include “Consolidate Toolbox responsive CSS ownership” and mobile allocation certification.
    - Do not reopen this as a foundation; keep any remaining primitive-specific defects/certification tasks only.

11. **Canonical editable field focus/default state unification** — specific migration landed.
    - Recent commits unify canonical field/search states and remove raw dashboard field divergence.

12. **Known dashboard white-lane / interior clipping / negative-margin footer ownership defects** — specific defects landed.
    - Keep only new defects reproduced against current main.

13. **Toolbox mobile header allocation certification** — specific contract landed.
    - Do not retain the old “mathematically impossible header allocation” as an open task unless it reproduces on current main.

### Resource Library / creator education

14. **Resource Library production reader foundation** — implemented.
    - `ResourceLibrary.tsx` + registry + Toolbox document renderer tests exist.

15. **Creator-first Recommendation / Algorithm guide** — implemented and published in the resource registry.

16. **Creator-first Analytics / Metrics & Dimensions guide** — implemented and published.

17. **Shorts vs Long-Form creator guide** — implemented and published.

These should be removed from “build Resource Library / write first guides” tasks. Remaining Resource Library work should be concrete missing guides/features only.

### Analytics / publishing / Brain foundations

18. **Metric comparability policy foundation** — implemented.
    - Focused contract exists in `MetricComparabilityPolicy.test.ts`.
    - Remaining work is consumer integration and full certification, corresponding to VT-023/VT-024.

19. **ApprovedPublishSnapshot contract + deterministic identity + local persistence foundation** — implemented.
    - `ApprovedPublishSnapshot.ts` + focused tests exist.
    - Remaining work is durable/server authority, transaction binding/recovery and end-to-end certification, not “design snapshot schema”.

20. **Publishing Package projection** — implemented foundation.
    - `PublishingPackageProjection.ts` + tests exist.

21. **PublishTransaction foundation** — implemented.
    - Keep retry/recovery/idempotency and snapshot-binding completion tasks only.

22. **Video Package → ContentBuild bridge** — implemented foundation with tests.
    - Do not retain “add bridge” as open; retain caller/identity/certification gaps only if current evidence shows them.

23. **Project → ContentBuild identity foundation** — implemented foundation with repository + bridge tests.

24. **GenerationRequest / ToolReceipt workflow foundation** — implemented in Generation Workflow / Brain Runtime snapshot paths.
    - Remaining work is destination-specific resolver recipes, observability and migrations.

25. **Brain active Project context adapter foundation** — implemented.
    - `BrainProjectContext.ts` + focused tests exist.
    - Keep only uniform runtime supply/integration verification (VT-003).

26. **Opportunity evidence adapter foundation** — implemented.
    - `OpportunityEvidenceAdapter.ts` + focused tests exist.
    - Keep production-feed integration/verification (VT-004/C13), not a new evidence subsystem.

27. **Channel Overview donut + traffic area visualization addition** — implemented.
    - `ChannelOverviewCharts.tsx` renders Audience and Devices donuts plus discovery traffic area composition with focused data tests.

28. **Global portrait/landscape position preservation foundation** — implemented.
    - `usePreserveOrientationPosition.ts` exists and is preference-controlled.
    - Keep full responsive certification / editor-specific layout tasks, not “create orientation preservation”.

## B. Demote broad historical items to VERIFYING / narrower follow-on work

These foundations exist, but current evidence does not justify deleting all related work:

- VT-001 Metric comparability → **DONE** on current main; do not retain as unfinished.
- VT-002 ApprovedPublishSnapshot → **VERIFYING**; durable persistence/recovery remains VT-014/015/016.
- VT-003 Brain Project context → **VERIFYING**; uniform runtime integration remains.
- VT-004 Opportunity evidence → **VERIFYING**; canonical production evidence feed remains.
- VT-023 evaluation integration → **DONE**; VT-024 visual/experiment consumer integration remains.
- VT-029 canonical final render asset → **VERIFYING** per current One-Goal ledger.
- Settings responsive/visual certification → implementation is complete; only missing screenshot/runtime certification should remain if not already evidenced.
- Toolbox/Studio primitives → substantial migration is complete; keep only specifically reproduced/certification gaps.
- Resource Library → reader + first three creator guides are complete; keep specific missing resource-library features/guides, not the generic page build.
- Video Manager → canonical primitive migration landed; keep only current reproduced functional/responsive issues.

## C. Keep open — current high-level unfinished programs

Current main and active program authorities still support these unfinished programs:

### Program A — Project / Asset / Publish
- Full Asset Engine Studio workspace.
- Launch Package.
- canonical Asset Slot Registry.
- complete Project Workspace facade + Continue/readiness routing.
- destination-specific Context Resolver recipes.
- PublishTransaction durable retry/recovery/idempotency certification.
- post-publish ContentBuild → analytics → evaluation identity chain.
- Editor → Asset Engine → selected publishing asset → outcome closure.
- server-authoritative durable persistence migration.

### Program B — Outcome / Evaluation / Learning
- production outcome writers across Publisher, Projects, Editor, Community, experiments, packaging and Brain.
- evaluation-target coverage.
- comparability-policy integration into visual/experiment consumers; evaluation integration is DONE (VT-023).
- Comment/Audience governed learning loop.
- Analytics/Data Visual full safety + responsive/state certification.
- AI generation observability/evals.

### Program C — Brain / Intelligence / Prompts
- finish uniform active Project/ContentBuild context across all Brain surfaces.
- finish Opportunity Intelligence canonical production feed.
- Daily Creator Command Center / Daily Oracle completion.
- AI system source-of-truth/registry reachability program.
- Project-grounded RAG.
- NVIDIA experiment lane.
- Google/Veo media-provider adapter.
- AI editor sidecar / typed edit patches.
- Prompt System modernization and family migrations/evals.

### Program D — UI / Editor / Widgets / Certification
- Remotion preview/final-render parity certification.
- editor four-layout certification.
- ten-widget production cohort.
- dead-path / duplicate-authority cleanup.
- full responsive/state matrix.
- public agent-discovery/readability program.

### Data / VT-SYNC / Analytics-specific open work
- dataset expansion and exact window/dimension rules.
- traffic-source/geography dataset completion.
- city/DMA error handling and certification.
- manual import/channel scoping failures.
- sync controller/status accuracy and batch-control completion.
- analytics checkpoint → evaluation bridge.
- full monetization / deep-video / audience intelligence surfaces where not already represented by current capabilities.

### Vault-specific open work
- Asset Matrix / Inspector maturity.
- batch/import/collections/versions/lineage/provenance.
- Project/ContentBuild/Vault/Editor/Publisher handoffs.
- durable storage/search/similarity/metadata extraction/AI tagging/derivative pipelines.
- huge-library performance and responsive certification.

## D. Source artifacts that should stop acting like active backlog truth

The following should be treated as audit/donor/history and reconciled into current authorities/task projections:

- `docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md`
- `docs/VIEWTUBE_UNFINISHED_WORK_MASTER_RESOURCE_2026-09-11.md`
- this conversation’s reconstructed 410-item list
- dated Finish Program source files superseded by `docs/programs/INTEGRATED_APPLICATION.md`
- root `DOCUMENTATION_GOVERNANCE.md` / `DOCUMENTATION_REGISTRY.md` baselines superseded by `docs/governance/DOCUMENTATION.md` + `docs/registry.json`
- completed Settings `tasks/plan.md` / `tasks/todo.md` once a completion receipt/no-loss status reconciliation is recorded.

## E. Important governance finding

**Task Index VNext canonical writer/storage is still unresolved.**

Therefore:
- do not allocate hundreds of permanent VT IDs from conversation memory;
- do not directly mark tasks DONE from this audit;
- emit task mutation proposals referencing existing VT / A-D / P / S aliases;
- keep `tasks/viewtube-one-goal-status.md` and Finish Program registries as projections until VNext writer is positively resolved.

## F. 80 page-feature opportunities merged on 2026-09-27

Commit `76519e3d` integrates 80 page feature opportunities into living architecture.

Governance treatment:
- accepted capability/opportunity architecture is not automatically 80 implementation tasks;
- reconcile each opportunity against existing capabilities, current main and Task Index before task allocation;
- route duplicates to existing capabilities/tasks;
- only accepted concrete gaps become task mutation proposals.
