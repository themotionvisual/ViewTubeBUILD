> **MIGRATION NOTICE — 2026-09-26:** Permanent application-integration program authority moved to `docs/programs/INTEGRATED_APPLICATION.md`. This dated plan remains an implementation/consolidation source until all open work is reconciled into the Task Index and Removed Archive.

# ViewTube Finish Program — Current-Main Completion Plan

**Date:** 2026-09-24  
**Audited main:** `e8313cceb2b6ab1fbcff6ff28a9648192f559854`  
**Mode:** completion/convergence, not redesign  
**Primary rule:** finish existing systems by connecting canonical owners, hardening contracts, adding missing outcome/evaluation writers, certifying behavior, and removing superseded paths.

## Executive Summary

ViewTube is no longer in a stage where the main risk is missing foundations. Most major systems now exist: BrainRuntime, Channel/Algorithm/Anomaly intelligence, governed asset generation, Project/ContentBuild identity, Video Package synchronization, publishing transactions, editor/mobile foundations, canonical analytics registries, Toolbox primitives, and Dashboard widget infrastructure.

The highest-value remaining work is therefore concentrated in **completion seams**:

1. active Project + Opportunity Intelligence are not consistently supplied to Brain portfolio construction;
2. outcome/evaluation writers are still uneven outside governed creator assets and algorithm-specific paths;
3. consequential actions need consistent evaluation targets/checkpoints;
4. publish inputs are not yet frozen in an immutable ApprovedPublishSnapshot;
5. post-publish ContentBuild → analytics → outcome/evaluation continuity needs deeper production writers;
6. metric comparisons need one canonical compatibility guard for scope/unit/window/format;
7. editor/render and several major UI systems need final parity/certification rather than new architecture;
8. old bypasses and stale documentation/task claims need removal after parity.

This plan intentionally avoids creating a second Brain, analytics store, Project store, Asset Engine, Publisher, editor state owner, or learning ledger.

## Intended Features To Finish

### F1. Brain Portfolio Has Real Project Context
- resolve active `projectId`, `contentBuildId`, and relevant project metadata through existing project/runtime owners;
- pass bounded project context into `readAlgorithmIntelligenceForBrain()` / BrainRuntime;
- respect `allowProjects`;
- never persist transient visible UI context as durable memory automatically.

### F2. Opportunity Intelligence Gets a Production Evidence Feed
- define a deterministic opportunity-evidence builder over canonical data;
- include provenance/evidence IDs, freshness, confidence, scope, and missing-evidence behavior;
- feed opportunities into Algorithm Intelligence only when enabled;
- keep Opportunity Intelligence separate from Anomaly Intelligence.

### F3. Unified Outcome Coverage
Priority producers:
- Publisher / publish transactions;
- editor render/export/use decisions;
- Project workflow completion/abandonment;
- Comment Responder / community reply decisions;
- experiments / variant decisions;
- Brain recommendation accept/reject/correct/complete;
- packaging selection/use.

Finish rules:
- use existing `BrainOutcomeLedger`, Algorithm event ledger, ContentBuild events, or canonical domain outcome owner as appropriate;
- never create a second generic outcome store;
- include channel/project/contentBuild/action/artifact/evidence IDs where available.

### F4. Evaluation Targets For Every Consequential Algorithm Action
- recommendation/priming/action events define metrics, checkpoints, scope, and expected direction;
- explicit `insufficient_data` / `not_measurable` states are allowed;
- canonical VT-SYNC/analytics evidence performs measurement;
- learning candidates are produced only after evaluation.

### F5. Governed Learning Promotion Coverage
- preserve current `AlgorithmLearningProfilePromotion`;
- ensure additional outcome producers flow into candidate generation when valid;
- add contradiction/expiry handling where currently absent;
- prevent direct memory/profile writes from comments, anomalies, or one-off actions.

### F6. Immutable ApprovedPublishSnapshot
Snapshot must include:
- ContentBuild ID + revision;
- Video Package ID/revision;
- final render/title/thumbnail/caption asset IDs;
- description/tags/category/chapters/education metadata;
- routing/playlists/visibility/audience;
- schedule/timezone/premiere configuration where applicable;
- approver + timestamp;
- stable hash/idempotency identity.

Finish rules:
- PublishTransaction references snapshot ID/hash;
- retries use the same snapshot;
- later edits do not silently mutate an in-flight transaction.

### F7. Publish Retry / Recovery Hardening
- every step idempotent or guarded by durable receipts;
- remote YouTube video ID survives retry/reload;
- failed optional steps can retry independently;
- remote verification reconciles local state;
- manual-recovery states are explicit.

### F8. Post-Publish ContentBuild Continuity
- write published YouTube binding and publish lifecycle events;
- create analytics checkpoints against the same ContentBuild;
- reference exact selected title/thumbnail/render/package variants;
- link later outcomes/evaluations back to those assets.

### F9. Canonical Metric Comparability Guard
Guard dimensions:
- unit;
- metric aggregation semantics;
- channel vs video vs geo/demographic/traffic scope;
- Short-only vs long-only vs shared format;
- time window / lifecycle window;
- rate/percent normalization;
- missingness and sample/coverage requirements.

Finish rules:
- one reusable validator;
- callers get structured incompatibility reasons;
- tests cover invalid and valid comparisons.

### F10. Brain Evidence / Provenance Consistency
- evidence IDs survive specialist engines → BrainRuntime → response;
- evidence drawer and Intelligence panels use canonical typed evidence projections;
- confidence and caveats derive from actual evidence quality;
- no invented provenance labels.

### F11. Comment / Audience Outcome Loop
- record draft/refine/post/suggested-video outcomes;
- aggregate repeated themes before promotion;
- connect posted reply outcomes to Audience/Channel Intelligence;
- preserve comment/video/channel/project scope.

### F12. Editor → Asset Engine → Outcome Closure
- render/export produces canonical derived asset/version;
- selected render identity flows into Publishing Package;
- editor use/export outcomes recorded;
- preview/render transform/transition/template parity certified.

### F13. Remotion Preview / Final Render Parity
- one composition interpretation path;
- representative parity fixtures;
- deterministic render/export errors and progress;
- no legacy parallel timing model.

### F14. Analytics/Data Visual Comparison Safety + Certification
- integrate F9 comparability guard;
- certify exact canvas/aspect-ratio rules;
- complete current Analytics/Data Visual docs consolidation Wave 4;
- mobile/narrow/desktop visual regression certification.

### F15. Dead-Path / Duplicate-Authority Removal
Targets:
- remaining direct provider creator-generation calls;
- old Project/package mutation paths;
- duplicate editor state/timing paths;
- duplicate analytics selectors/caches;
- legacy widget/toolbox CSS that shadows canonical primitives;
- stale task/docs claims that describe already-landed gaps.

### F16. Agent Readiness / Public Machine-Readable Surface

Agent Ready scan of `https://viewtube.live` on 2026-09-24 scored **31/100**, with **llms.txt 0/100**. Accessibility checks were strong, but agent-readable public content is weak because the root is JS-dependent and missing discovery metadata.

Finish requirements:
- add `/llms.txt` and optionally `/llms-full.txt`;
- improve `/AGENTS.md` with recognizable Installation/Configuration/Usage sections;
- create/fix `sitemap.xml` and structure `sitemap.md`;
- canonical/meta description/OpenGraph/JSON-LD on public page(s);
- markdown alternate discovery and canonical headers where practical;
- add `<main>`/heading structure to public shell;
- ensure public content is prerendered or has an agent-readable static/markdown equivalent;
- only publish protocol endpoints such as OpenAPI/UCP when valid.

## Architecture Decisions

1. Current main is authority.
2. Connect before rebuilding.
3. One identity chain.
4. One outcome/evaluation loop.
5. No silent learning.
6. Publishing freezes intent.
7. Comparisons must be semantically valid.
8. UI certification follows system fixes.
9. Deletion is part of completion.

## Dependency Graph

```
Metric comparability guard ───────────────┐
                                         ├─> evaluation correctness
Project context resolver ──> Brain portfolio
Opportunity evidence builder ────────────┘
Brain/Algorithm actions ─> evaluation targets ─> measured outcomes ─> learning candidates ─> governed promotion

ContentBuild + Video Package
        └─> ApprovedPublishSnapshot
                └─> PublishTransaction hardening
                        └─> YouTube binding
                                └─> analytics checkpoints
                                        └─> post-publish evaluation/learning

Editor/Remotion parity ─> canonical final render asset ─> ApprovedPublishSnapshot

All completed slices ─> responsive/runtime certification ─> dead-path removal ─> docs/status closeout
```

## Implementation Phases

### Phase 1 — Brain Context and Intelligence Inputs
1. Active Project Context Adapter
2. Canonical Opportunity Evidence Builder

Checkpoint A:
- Brain portfolio contains project/anomaly/opportunity data when allowed.
- No new Brain/store/provider owner introduced.
- Brain focused tests + build pass versus baseline.

### Phase 2 — Outcome and Evaluation Coverage
3. Outcome Writer Contract
4. Publisher + Project Outcome Writers
5. Comment / Community Outcome Writers
6. Editor / Render Outcome Writers

Checkpoint B:
- Outcome coverage matrix shows production callers for all priority producers.
- Channel Intelligence observes non-asset outcomes.

### Phase 3 — Evaluation and Learning Completion
7. Evaluation Target Coverage Audit
8. Canonical Metric Comparability Guard
9. Learning Candidate Coverage

Checkpoint C:
- Full algorithm loop fixture reaches measured outcome and governed promotion.
- Invalid comparisons cannot reach evaluation.
- No direct memory promotion bypass found.

### Phase 4 — Publishing Freeze and Recovery
10. Implement ApprovedPublishSnapshot
11. Bind PublishTransaction to Snapshot
12. Retry/Recovery Certification

Checkpoint D:
- simulated interruption fixtures pass;
- same remote video ID survives retry;
- exact approved inputs are reproducible from snapshot.

### Phase 5 — Post-Publish Identity and Measurement
13. Post-Publish ContentBuild Writers
14. Analytics Checkpoint → Evaluation Bridge

Checkpoint E:
- one integration fixture runs Project → package → approved snapshot → publish transaction → YouTube binding → analytics checkpoint → measured outcome.

### Phase 6 — Editor / Remotion Completion
15. Canonical Final Render Asset
16. Preview/Render Parity Fixtures
17. Four-Layout Editor Certification

### Phase 7 — Analytics/Data Visual Safety
18. Integrate Metric Guard Into Visual Controllers
19. Analytics/Data Visual Documentation Wave 4

### Phase 8 — Agent Readiness
20. Public Agent Discovery Files
21. Public Metadata / Static Readability
22. Protocol Endpoint Cleanup

Checkpoint F:
- re-run Agent Ready;
- llms.txt no longer scores 0;
- no private/authenticated app content is exposed.

### Phase 9 — Convergence Cleanup and Final Certification
23. Direct Provider / Duplicate Runtime Audit
24. Duplicate State/Mutation Path Audit
25. Full Responsive + State Matrix
26. End-to-End Creator Loop Certification
27. Dead-Path + Documentation Closeout

## Recommended Execution Order

`1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12 → 13 → 14 → 15 → 16 → 17 → 18 → 19 → 20 → 21 → 22 → 23 → 24 → 25 → 26 → 27`

Safe parallel groups after contracts settle:
- Tasks 4, 5, 6;
- Tasks 13 and 15;
- Tasks 19 and 20;
- Tasks 23 and 25 after feature implementation stops moving shared contracts.

## What Is Already Finished Enough To Exclude

Do not reopen these as greenfield programs unless a regression is found:
- BrainRuntime canonical creator reasoning entry seam;
- anomaly scanner production reachability;
- typed Brain evidence projection in Brain Hub;
- channel-scoped Brain controls/capability selection;
- Video Package → ContentBuild production synchronization;
- governed creator AssetGenerator foundation;
- creator-asset → BrainOutcomeLedger integration;
- measured Algorithm evaluation infrastructure;
- governed learning review + creator-approved promotion;
- Project → ContentBuild identity foundation;
- resumable PublishTransaction foundation;
- core Comment Responder real-data workflow;
- Studio Toolbox primitive/component authority;
- mobile editor orientation preservation/viewport containment.

## Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Main moves rapidly | High | small PRs; re-audit every slice |
| Outcome writers double-record | High | idempotency keys + mapping tests |
| Opportunity engine invents evidence | High | deterministic evidence builder |
| Metric comparison remains wrong | High | central guard before broad rollout |
| Publish retries mutate approved intent | Critical | immutable ApprovedPublishSnapshot |
| Learning overfits one action/comment | High | thresholds + contradiction + approval |
| UI certification patches symptoms locally | Medium | fix canonical system layer first |
| Public agent files leak private data | Critical | strict public-doc allowlist |
| Cleanup deletes unique behavior | High | parity + reachability verification first |

## Definition Of Done

The finish program is complete when:
- every major creator workflow is production-reachable through its canonical owner;
- Project/ContentBuild/VideoPackage/Asset/Action/Evidence identity survives applicable handoffs;
- consequential actions produce outcomes and evaluation targets;
- post-publish analytics joins back to exact used assets/variants;
- durable learning is governed and creator-approved;
- publication executes from an immutable approved snapshot with safe retry;
- metric comparisons cannot silently combine incompatible values;
- editor preview/render/export share one interpretation contract;
- changed surfaces pass desktop/narrow/portrait/landscape certification;
- obsolete production paths are removed/quarantined;
- living docs reflect current code;
- ViewTube's public agent-readiness surface is materially improved from the 31/100 baseline.

## Tooling Notes

The agent.spot workflow search surfaced optional third-party products for codebase completion and QA, but none is required and no integration between them is implied. ViewTube's existing GitHub, tests, browser/runtime tooling, deployment tooling, Agent Skills, and Herald process remain the primary execution environment.


## PR #241 Brain/Product Donor Candidates

The 2026-09-12 PR #241 brainstorm is preserved historically, but several ideas remain useful against today's stronger backend. These are **candidate finish features**, not automatically approved scope.

| Donor concept | Current disposition | Dependency / rationale |
| --- | --- | --- |
| Editable Channel Knowledge / Knowledge Map | KEEP / evaluate for Brain Hub | Channel Knowledge projection/runtime now exists; UI should expose source, confidence, contradiction, confirmation/correction and expiry. |
| Style Fingerprint | KEEP | StyleProfile/styleMetrics already exist; a creator-facing comparison/teaching view would make the backend legible. |
| Diff-as-teaching | KEEP | asset edit outcomes already capture high-value correction signal; expose it only with creator controls and clear provenance. |
| Variant Comparator | KEEP | fits governed AssetGenerator and package-first generation; should compare evidence/style/rubric dimensions without fake precision. |
| Universal “Why?” / evidence trace | KEEP | aligns with BrainTrace + evidence quality + assistant continuity; use current toolbox/UI primitives. |
| Evidence Explorer / evidence-health view | KEEP | evidence quality backend now exists; surface freshness, missingness, scope and permission blocks. |
| Impact Cards / Calibration Chart | DEFER UNTIL OUTCOME COVERAGE | only meaningful when prediction/recommendation identity joins enough measured outcomes. |
| Trace Timeline | KEEP, operator-first | BrainTrace exists; creator view should be simplified and never expose hidden chain-of-thought. |
| Activity Feed | DEFER / integrate with canonical action history | do not create a second action log. |
| Autonomy Matrix / Schedule Builder | DEFER | requires server-side scheduling, approval tiers, budgets/quiet hours and reversible action semantics. |
| Opportunity Radar | MERGE WITH CURRENT OPPORTUNITY/WIDGET WORK | retain the spatial impact/effort idea only if it fits current Opportunity Intelligence and widget standards. |

Detailed provenance and file-level decisions live in `docs/brain/PR241_DONOR_HARVEST_AUDIT_2026-09-24.md`.


## 2026-09-24 Expanded Completion Registry

The post-#322/#360 re-audit identified a broader set of still-open capabilities than the original 27-task execution list. The canonical detailed registry now lives at:

- `tasks/viewtube-finish-program/BACKLOG-REGISTRY.md`
- `tasks/viewtube-finish-program/plan.md`
- `tasks/viewtube-finish-program/todo.md`

The work is grouped into four completion programs:

1. **Project / Asset / Publish** — Asset Engine Studio, Launch Package, Asset Slot Registry, complete Project facade, destination Context Resolver recipes, ApprovedPublishSnapshot, publish recovery, post-publish identity, Editor→Asset closure, eventual durable server authority.
2. **Publishing / Analytics / Evaluation / Learning** — outcome coverage, evaluation targets, metric comparability, comment/audience learning, analytics/data-visual certification, AI observability/evals.
3. **Brain / Context / Intelligence / Prompts** — active Project context, Opportunity evidence, Daily Command, AI registries, Project-grounded retrieval, provider experiments, AI editor sidecar and Prompt System modernization.
4. **UI / Editor / Analytics / Cleanup** — Remotion parity, four-layout editor certification, 10-widget cohort, duplicate-authority cleanup, full responsive/state matrix and public agent readiness.

### Prompt System completion authority

Prompt modernization is now a named Finish Program capability rather than an implicit AI-cleanup task.

References:
- `docs/brain/VIEWTUBE_PROMPT_SYSTEM_AUTHORITY_2026-09-24.md`
- `docs/brain/VIEWTUBE_PROMPT_IMPROVEMENT_PROGRAM_2026-09-24.md`
- `docs/brain/VIEWTUBE_PROMPT_REGISTRY_2026-09-24.json`

Finish requirements:
- every production prompt/generator registered and reachability-classified;
- shared evidence/uncertainty/creator-control constitution;
- prompt-family versions;
- task-specific context recipes;
- bounded Channel/Profile/Project personalization;
- deterministic calculations/validators outside prompts;
- structured outputs for high-value assets;
- model/prompt/context/evidence provenance;
- rich/sparse/empty/stale/disabled fixture evals;
- legacy `prompts.ts` / `gemini.ts` generation strangled incrementally after parity.

### Highest-leverage current order

1. ApprovedPublishSnapshot.
2. Publish retry/recovery binding.
3. post-publish ContentBuild identity + outcome coverage.
4. metric comparability/evaluation targets.
5. Brain Project/Opportunity context.
6. Prompt System modernization/evals.
7. Asset/Project UX completion.
8. editor/widgets/analytics certification.
9. server durability + dead-path cleanup + agent readiness.

## System Convergence Prerequisite

The Finish Program now has an explicit pre-integration convergence layer:

- `docs/architecture/VIEWTUBE_SYSTEM_CONVERGENCE_AND_CONSOLIDATION.md`
- `tasks/system-convergence/plan.md`
- `tasks/system-convergence/SYSTEM-CLASSIFICATION.md`

Reason: current main contains several mature but overlapping adapters, projections, ledgers and package boundaries. Completing every existing subsystem independently would preserve avoidable duplication. Before broad Brain/Studio/widget/Project integration, classify each overlapping system and converge it toward six canonical domains:

1. Creator Context & Knowledge;
2. Evidence & Intelligence;
3. Project / Content / Asset Graph;
4. Creator Operations & Generation;
5. Outcomes / Evaluation / Learning;
6. Brain Runtime & Experience.

This is a strangler program, not permission for destructive rewrites. Existing canonical data owners remain authoritative until caller migration, parity, donor harvest and zero-reachability certification are complete.
