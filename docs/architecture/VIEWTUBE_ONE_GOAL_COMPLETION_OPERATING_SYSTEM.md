# ViewTube One-Goal Completion Operating System

**Status:** CANONICAL LIVING COMPLETION / AUDIT / STATUS / AGENT-HANDOFF AUTHORITY  
**Date:** 2026-09-24  
**Goal:** Finish ViewTube as one coherent production YouTube creator operating system by converging existing capabilities onto canonical owners, closing measurable workflow loops, eliminating duplicate authorities, and continuously proving production readiness.  
**Current-main audit basis:** main after PRs #382, #385, #386 and #387.  
**Companion task ledger:** `tasks/viewtube-one-goal-status.md`  
**Companion agent skill:** `.claude/skills/viewtube-one-goal-completion/SKILL.md`

> This document is deliberately both a plan and an operating artifact. Every agent that works on the completion program must read it first, update status/evidence after meaningful work, and leave the next agent a bounded handoff. Current code/tests outrank prose when they disagree.

## 1. One Goal

ViewTube should behave as one continuous creator system:

```
YouTube account/data
→ VT-SYNC
→ analytics-canon
→ evidence/intelligence
→ BrainRuntime
→ Project + ContentBuild
→ generation/assets
→ Video Package
→ Editor/Remotion
→ Approved Publish
→ YouTube
→ post-publish analytics
→ outcomes/evaluation
→ governed learning
→ improved future decisions
```

Completion means the loop is production-reachable, attributable, recoverable, measurable and governed—not merely that classes, registries or UI prototypes exist.

## 2. Non-Negotiable Architecture

| Concern | Canonical owner |
|---|---|
| YouTube raw acquisition/freshness | VT-SYNC |
| normalized analytics consumption | analytics-canon |
| dashboard presentation | Widget/Data Visual system |
| Studio/Projects UI chrome | Toolbox/SubToolbox primitives |
| creator workflow state | Projects |
| cross-system content identity | ContentBuild |
| durable creator assets/provenance | Vault / Asset Engine |
| generated run/candidate provenance | Generation records |
| creator reasoning/orchestration | BrainRuntime |
| creator text/reasoning model boundary | BrainModelGateway |
| durable channel knowledge | Channel Profile / governed Channel Knowledge |
| specialist intelligence | Statistics, Audience, Channel, Anomaly, Opportunity, Algorithm |
| editor state/timeline | VTE1 |
| composition/preview/render | Remotion |
| approved external YouTube writes | Publisher / PublishTransaction |
| repository-work governance | Herald |
| program continuity | this artifact + task ledger + Create State mirror |

**Rule:** unionize capabilities, not owners.

## 3. Current Strengths

Current main already contains substantial production foundations:
- canonical BrainRuntime creator entry path and BrainModelGateway seam;
- channel-scoped capability/control handling;
- evidence-quality and typed Channel Knowledge projection;
- Statistics/Audience/Channel/Algorithm/Anomaly/Opportunity intelligence modules;
- algorithm evaluation checkpoints, lifecycle cohorts, learning candidates and governed promotion;
- Project → ContentBuild identity;
- Video Package → ContentBuild synchronization;
- versioned Asset Engine and editor render/export Asset Engine integration;
- resumable PublishTransaction foundation;
- canonical Analytics/VT-SYNC authority, standard windows, analytics-canon imperative evidence access;
- DataVisualCanvas, responsive frame and controller foundations;
- Toolbox/SubToolbox component authority;
- Herald repository governance and exchange artifacts.

These are foundations to converge, not reasons to rebuild.

## 4. Weakness Audit

### W1 — Capability existence exceeds production reachability
Several systems are well-designed in isolation but not uniformly supplied to every production surface. Project context and Opportunity evidence are examples. This creates a false-completion risk: tests can prove a module while users never reach it.

**Remedy:** every feature requires a production-caller test or runtime certification, not only unit tests.

### W2 — Outcome coverage is asymmetric
Asset outcomes and Algorithm evaluation are comparatively mature, while Publisher, Projects, comments/community, experiments and some creator-generation paths do not yet provide equally strong outcome lineage.

**Remedy:** define a domain-to-existing-ledger mapping; do not invent a second generic outcome store.

### W3 — The learning loop is not uniformly closed
Evaluation infrastructure exists, but an action without a target/checkpoint cannot become trustworthy measured learning.

**Remedy:** every consequential recommendation/action is either measurable with explicit scope/window/metric or explicitly marked non-measurable.

### W4 — Publication intent is mutable too late
The architecture documents still identify `ApprovedPublishSnapshot` as open. A resumable transaction without immutable approved inputs can recover execution while still publishing changed intent.

**Remedy:** freeze exact approved ContentBuild/package/assets/metadata/routing/schedule into a hashed snapshot before external side effects.

### W5 — Metric semantic safety is decentralized
Metric registries know units/scopes, but there is no single reusable compatibility policy covering unit + aggregation + entity scope + format + window + coverage.

**Remedy:** one typed MetricComparabilityPolicy used by evaluation, experiments, Brain comparisons and configurable visuals.

### W6 — Provider strangler migration remains incomplete
The canonical Brain gateway exists, but Hook Generator, Script Architect and compatibility paths still reach legacy generation/provider surfaces.

**Remedy:** migrate capability-by-capability with parity tests; shrink the provider architecture allowlist after each migration.

### W7 — Some user-control reads remain implicit/global
Targeted audit still finds `readBrainUserControls()` without explicit channel scope in Core, Vault, analytics evidence and Comment Responder paths. Some may intentionally use active-channel fallback, but implicit scope is a hidden coupling.

**Remedy:** classify every call. Explicitly pass channelId when known; document the few intentional active-channel fallbacks.

### W8 — Analytics migration debt remains
The new Analytics master still records legacy selectors/cache consumers, controllerSpec compatibility, legacy preview JS, incomplete controller vocabulary/orientation and mark-scale migration, and missing portal implementation for Master Data menus.

**Remedy:** finish the migration in bounded slices and delete compatibility code only after reachability is zero.

### W9 — Editor completion is stronger than older plans imply, but certification lags
Editor export already creates versioned assets and ContentBuild selections, but parity across preview/render, transitions, templates, device orientation and final publication identity needs systematic certification.

**Remedy:** golden fixtures + four-layout runtime matrix + exact final-render identity test.

### W10 — Documentation authority is improving but still distributed
The registry has multiple scoped canonical documents and many historical/reference artifacts. Without a single program entry point, agents can still start from a stale plan.

**Remedy:** this document becomes the completion-program index, while domain masters retain domain authority.

### W11 — Agent continuity is not repository-enforced
Herald governs repository work and Create State can preserve context, but a new agent is not yet forced to read one completion status source before editing.

**Remedy:** add repository agent instructions pointing to this artifact; require status/evidence/handoff updates as Definition of Done.

### W12 — Quality gates contain known debt
`CLAUDE.md` records substantial pre-existing lint debt and routine admin bypass. This weakens the meaning of a green/failed global quality gate.

**Remedy:** use changed-file/no-new-debt gates now, establish a lint-debt burn-down separately, and progressively make release gates blocking.

### W13 — Local persistence and browser state are architectural risk areas
The application has substantial browser/local persistence patterns. These are useful for offline UX but can cause stale cross-channel state, schema drift and multi-tab divergence.

**Remedy:** inventory persistence by owner, version schemas, namespace channel/project state, define migration/expiry rules and distinguish cache from truth.

### W14 — Idempotency is not a universal cross-system invariant yet
Publishing emphasizes recovery, but other event/outcome/projection writers can also double-write during retries or repeated agent actions.

**Remedy:** stable command/event idempotency keys for cross-system writes and replay-safe projection tests.

### W15 — Observability is not yet a first-class completion gate
Production behavior spans OAuth, YouTube APIs, local/browser state, analytics sync, Brain calls, render jobs and publishing. Tests alone cannot diagnose real-user failures.

**Remedy:** correlation IDs across Project/ContentBuild/Brain task/publish transaction; structured error taxonomy; visible diagnostics; actionable logs without secrets.

### W16 — State-of-the-art evaluation needs offline regression sets
The Brain has evaluation machinery, but model/prompt/intelligence changes need deterministic benchmark cases so quality can be compared before deployment.

**Remedy:** versioned golden evaluation corpus covering analytics reasoning, packaging, project context, evidence attribution, refusal/missing-data behavior and tool selection.

## 5. State-of-the-Art Practices To Adopt

### P1. Architecture fitness functions
Automated tests enforce canonical boundaries:
- creator reasoning cannot bypass BrainRuntime/Gateway;
- analytics consumers cannot bypass analytics-canon without allowlist;
- publishing external writes require approved snapshot;
- ContentBuild identity is required for project-scoped generated/rendered/published artifacts;
- durable learning cannot bypass governance.

### P2. Contract-first cross-system events
Use typed event envelopes with:
`eventId, eventType, schemaVersion, channelId, projectId, contentBuildId, actor, correlationId, causationId, idempotencyKey, occurredAt, evidenceRefs, artifactRefs`.

### P3. Idempotent command handling
Every cross-system mutation should be safe to retry. Prefer stable command IDs and receipts over "hope this only runs once."

### P4. Provenance as data, not prose
Recommendations, generations, variants and outcomes carry machine-readable evidence/artifact references through the full lifecycle.

### P5. Evaluation-driven AI development
Before changing prompts/models/intelligence composition:
1. add representative cases;
2. record baseline;
3. change;
4. compare quality/cost/latency;
5. require no critical regressions.

### P6. Shadow/strangler migrations
New canonical paths run beside legacy paths long enough to prove parity; legacy reachability is measured, then removed.

### P7. Progressive delivery
Small PRs, preview deployment, targeted runtime checks, then production. No giant integration branches.

### P8. Golden-path + failure-path E2E
Certify the creator loop plus interrupted auth, stale analytics, missing permissions, model failure, render failure and publish retry.

### P9. Observability by correlation
One creator action should be traceable through Brain task → ContentBuild → generation/render → publish transaction → analytics checkpoint → outcome.

### P10. Explicit state machines
Use typed states for publishing, sync, render, evaluation and long-running workflows instead of scattered booleans.

### P11. Semantic metric types
Metrics should carry unit, entity scope, format scope, aggregation, window and coverage as types/metadata so invalid comparisons fail before presentation.

### P12. Changed-surface quality budgets
Until global lint debt is retired, no PR may increase lint/type/test debt in files it touches.

### P13. ADR-lite decisions
Any new canonical owner, persistent schema, external dependency, or cross-system contract requires a short decision entry in this artifact or the owning master.

### P14. Agent work receipts
Every agent leaves:
- task ID;
- branch/PR;
- files changed;
- tests/run evidence;
- architecture decisions;
- blockers;
- next action;
- status change.

## 6. Program Workstreams

### A. Brain / Intelligence Convergence
**Target:** every creator AI surface uses the same runtime/context/evidence rules.
- active Project/ContentBuild adapter;
- production Opportunity evidence builder;
- classify/fix implicit Brain control scope;
- migrate Hook + Script legacy generation;
- shrink provider allowlist;
- benchmark/evaluation corpus.

### B. Outcome / Evaluation / Learning
**Target:** every consequential action is attributable and evaluable.
- producer coverage matrix;
- Publisher/Project/Comment/Editor/Experiment outcome writers;
- evaluation target policy;
- governed candidate generation;
- contradiction/expiry handling;
- no one-interaction memory promotion.

### C. Publishing Integrity
**Target:** exact approved intent, recoverable execution.
- ApprovedPublishSnapshot;
- snapshot-bound PublishTransaction;
- idempotent step receipts;
- remote reconciliation/manual recovery;
- post-publish ContentBuild events.

### D. Analytics / Data Semantics
**Target:** one trustworthy evidence layer.
- MetricComparabilityPolicy;
- legacy selector/cache migration;
- controllerSpec/legacy preview retirement;
- controller/mark-scale completion;
- Master Data portal;
- missingness/freshness/coverage semantics.

### E. Project / ContentBuild / Asset Continuity
**Target:** one identity from idea through measured outcome.
- identity invariants at every handoff;
- final render/package selection;
- exact used-variant attribution;
- analytics checkpoint linkage.

### F. Editor / Remotion
**Target:** one interpretation from preview to final render.
- canonical final-render asset;
- parity fixtures;
- transition/template/audio/crop/transform parity;
- render progress/error contract;
- four-layout certification.

### G. UI / Widget / Toolbox Convergence
**Target:** system-level consistency without erasing unique tool interiors.
- canonical primitive migration;
- intrinsic sizing and split-left geometry;
- eliminate nested duplicate shells;
- visual/data controller uniformity;
- desktop/narrow/portrait/landscape state matrix.

### H. Reliability / Security / Observability
**Target:** failures are diagnosable and safe.
- auth/API state machine;
- correlation IDs;
- structured errors;
- secrets/log hygiene;
- retry/idempotency policy;
- persistence schema/version audit;
- no-new-debt gates.

### I. Agent / Documentation Operating System
**Target:** every AI agent works from the same goal/status/evidence.
- this artifact as entry point;
- task ledger;
- repository skill;
- CLAUDE/agent guidance pointer;
- Herald receipts;
- Create State mirror;
- domain-master links;
- automatic stale-status detection where feasible.

## 7. Priority Order

### P0 — correctness and identity
1. MetricComparabilityPolicy contract.
2. ApprovedPublishSnapshot contract.
3. Project/Opportunity Brain context.
4. Outcome writer coverage contract.
5. idempotency/correlation envelope.

### P1 — close loops
6. Publisher/Project/Comment/Editor outcomes.
7. evaluation target coverage.
8. post-publish analytics checkpoint linkage.
9. governed learning coverage.
10. final render/package identity.

### P1 — retire parallel paths
11. Hook migration.
12. Script migration.
13. implicit Brain-control scope cleanup.
14. analytics legacy selector/cache migration.

### P2 — certification
15. Remotion parity.
16. data visual/controller completion.
17. Toolbox/widget responsive certification.
18. auth/reliability failure matrix.
19. full creator-loop E2E.

### P2 — cleanup
20. dead-path reachability audit.
21. delete/quarantine only after parity.
22. docs/status closeout.
23. tighten release gates.

## 8. Task Protocol

Every task must be S or M scope and have:
- stable task ID;
- one owning workstream;
- explicit current evidence;
- acceptance criteria;
- focused test command;
- runtime/manual verification if user-facing;
- dependencies;
- likely files;
- branch/PR;
- status;
- handoff note.

Statuses:
`NOT_STARTED | READY | IN_PROGRESS | BLOCKED | VERIFYING | DONE | DEFERRED | SUPERSEDED`.

**DONE requires evidence.** A merged file or passing unit test alone does not prove a user-facing path.

## 9. Agent Start Protocol

Every agent/conversation:
1. read `CLAUDE.md`;
2. read this document;
3. read `tasks/viewtube-one-goal-status.md`;
4. read the owning domain master;
5. inspect current main for the task's exact paths;
6. inspect existing tests and production caller;
7. create a short-lived branch;
8. implement only the bounded task;
9. test + runtime-certify;
10. update task status/evidence;
11. update this document only for architectural/status changes;
12. leave a Herald/Create State handoff.

Never infer status from an old PR description.

## 10. Agent Handoff Contract

```yaml
task_id:
status:
main_sha_checked:
branch:
pr:
canonical_owner:
files_changed: []
tests:
  commands: []
  result:
runtime_verification:
evidence_refs: []
decisions: []
blockers: []
remaining:
next_action:
updated_at:
```

## 11. Verification Matrix

Every implementation PR is reviewed on:
1. correctness;
2. readability/simplicity;
3. architecture;
4. security;
5. performance;
6. provenance/identity;
7. idempotency/recovery;
8. observability;
9. tests;
10. runtime UX where applicable.

For AI changes additionally:
- evidence attribution;
- missing-data honesty;
- evaluation regression;
- latency/cost impact;
- creator-control compliance.

For UI changes additionally:
- desktop;
- narrow desktop;
- mobile portrait;
- mobile landscape;
- keyboard/focus/touch;
- loading/empty/error/disconnected/permission states.

## 12. Definition of Done — One Goal

ViewTube completion is achieved when:
- all creator reasoning enters canonical BrainRuntime;
- all creator text/reasoning model calls cross BrainModelGateway;
- analytics evidence comes from canonical owners;
- every Project-scoped artifact preserves ContentBuild identity;
- publish executes from immutable approved intent;
- cross-system writes are replay-safe;
- important actions have outcome/evaluation lineage;
- post-publish analytics joins to exact used variants;
- durable learning is evidence-backed, governed and creator-approved;
- preview and final render agree;
- invalid metric comparisons are impossible by contract;
- responsive UI/state certification passes;
- failures are observable and recoverable;
- duplicate authorities have zero production reachability;
- living docs/status match current main;
- a new AI agent can resume work without reconstructing project history.

## 13. Current Status Snapshot

| Workstream | Status | Evidence | Next |
|---|---|---|---|
| Brain runtime convergence | NEARLY_FINISHED | canonical runtime/gateway + recent Brain docs consolidation | Project/Opportunity uniformity + legacy generator migration |
| Channel Knowledge | NEARLY_FINISHED | typed projection/retrieval merged in PR #386 | connect broader evaluated outcomes |
| Analytics/VT-SYNC | IN_PROGRESS | canonical master + 34 visible datasets + 27 report definitions | legacy migration + comparability |
| Project/ContentBuild | NEARLY_FINISHED | identity/persistence/package sync present | approved publish + post-publish linkage |
| Asset Engine | NEARLY_FINISHED | versioning/provenance/editor export integration | exact used-variant evaluation |
| Publisher | IN_PROGRESS | resumable transaction foundation | immutable snapshot + recovery certification |
| Editor/Remotion | IN_PROGRESS | timeline/mobile/render foundations | parity + four-layout certification |
| UI primitives/toolboxes | IN_PROGRESS | canonical authorities and large migration | remaining production consumers/certification |
| Outcome/evaluation/learning | IN_PROGRESS | asset outcomes + algorithm evaluation/governance | producer coverage |
| Reliability/observability | PARTIAL | diagnostics/release patterns exist | correlation/idempotency/failure matrix |
| Agent continuity | STARTED | Herald + docs registry + this program | wire repository entrypoint + task receipts |

## 14. Update Rules

Update this artifact when:
- canonical ownership changes;
- a weakness is closed or newly discovered;
- a workstream status changes materially;
- a state-of-the-art practice becomes an enforced contract;
- a task uncovers architecture that invalidates the plan.

Do not copy implementation logs here. Put detailed execution evidence in the task ledger and domain masters.

**Last updated:** 2026-09-24
