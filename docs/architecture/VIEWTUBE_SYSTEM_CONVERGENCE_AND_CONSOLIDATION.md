# ViewTube System Convergence & Consolidation

**Status:** ACTIVE ARCHITECTURE / CONSOLIDATION PLAN  
**Created:** 2026-09-26  
**Last edited:** 2026-09-26  
**Audited main:** `86a41a68d92983e16d11d885262dab97462dab2f`  
**Scope:** AI/Brain, context, channel knowledge, creator profile/style, evidence/intelligence, analytics integration, Projects/ContentBuild, Asset Engine/Vault, generation/tool execution, publishing projections, outcomes/evaluation/learning, chat/widgets/Studio/Editor integration.

## 1. Purpose

ViewTube has reached the point where adding more independent systems would increase integration cost faster than product capability. Many current systems are useful and well-tested, but several now overlap in responsibility, translate between equivalent concepts, duplicate context assembly, or preserve historical boundaries that no longer need to be product-level boundaries.

This program reduces the architecture to a smaller set of strong canonical domains without throwing away useful work.

The objective is not a monolith. The objective is:

- fewer canonical owners;
- stronger contracts;
- specialist modules behind those owners;
- fewer bridges and duplicate stores;
- less UI-specific reasoning;
- continuous identity from channel → project → content → asset → action → outcome → learning;
- safe donor harvesting before any system is quarantined or removed.

## 2. Non-negotiable convergence rules

1. **Current main wins.** Historical docs, PRs and prototypes are donor evidence only.
2. **No deletion before donor harvest.** Extract useful schemas, algorithms, prompt rules, edge cases, tests, UI ideas and migration behavior first.
3. **No deletion before zero production reachability.** Search results or definitions are not proof; callers and runtime tests are.
4. **One canonical owner per fact class.** Adapters and projections may expose data but may not create competing truth.
5. **Do not merge semantics merely because filenames overlap.** Analytics truth, creator knowledge and inferred intelligence must remain distinguishable.
6. **Prefer projection over synchronization.** Video Package, Publishing Package and similar views should derive from ContentBuild where possible rather than copy state.
7. **Prefer shared contracts over giant files.** Consolidation is conceptual/API ownership, not necessarily file-count minimization.
8. **External side effects keep strict owners.** Publishing, uploads, edits and destructive actions retain approval/idempotency/rollback boundaries.
9. **Models do not own calculations, durable knowledge or permissions.**
10. **Quarantine before deletion.** A superseded path gets a compatibility period and explicit removal receipt.

## 3. Target architecture: six canonical systems

### System 1 — Creator Context & Knowledge

Answers: **Who is this creator/channel, what is currently true about them, and what are they working on right now?**

Owns one resolved context contract over:

- Channel Profile / creator-declared preferences;
- Channel Knowledge / validated learnings;
- Style Profile and creator-authored exemplars;
- niche/domain knowledge;
- active Project and ContentBuild identity;
- selected asset/video/comment/chart/tool;
- current route/surface context;
- creator goals and constraints;
- permission/personalization controls.

Candidate existing modules to converge behind this system:

- `ChannelProfileAdapter`
- `ChannelKnowledgeProjection`
- `StyleProfile`
- `BrainMemoryClaims`
- `NicheKnowledge`
- `BrainProjectContext`
- `BrainSurfaceContext`
- `BrainSurfaceSelection`
- relevant onboarding/profile persistence

Target facade:

```ts
resolveCreatorContext({
  channelId,
  projectId,
  contentBuildId,
  surface,
  selection,
  task,
  permissions,
})
```

Important distinction: context may reference evidence, but it does not become the evidence owner.

### System 2 — Evidence & Intelligence

Answers: **What has been observed, what deterministic signals can be derived, and what higher-level intelligence can responsibly interpret those signals?**

Three layers:

1. **Evidence**
   - analytics-canon evidence;
   - comments/search/transcripts;
   - project and asset outcomes;
   - experiments;
   - current research where allowed.

2. **Deterministic derived signals**
   - comparisons;
   - cohorts;
   - trends;
   - anomalies;
   - outliers;
   - metric aggregates;
   - opportunity candidates;
   - audience-language frequencies.

3. **Specialist intelligence**
   - Statistics;
   - Audience;
   - Channel;
   - Opportunity;
   - Algorithm;
   - Packaging/SEO/content strategy modules.

Likely adapters/projections to shrink or fold:

- `BrainAnalyticsEvidence`
- `BrainStatisticsBridge`
- `BrainAudienceBridge`
- `AudienceEvidenceCollector`
- `AnomalySignalBridge`
- `OpportunityEvidenceAdapter`

Specialists remain modules, not separate truth owners:

- `StatisticsIntelligence`
- `AudienceIntelligence`
- `ChannelIntelligence`
- `OpportunityIntelligence`
- Algorithm Intelligence family

`analytics-canon` remains the analytics-truth owner and is **not** absorbed into Brain.

### System 3 — Project / Content / Asset Graph

Answers: **What are we making, what state is it in, and what artifacts/variants belong to it?**

Canonical concepts:

#### Project
Human/workflow container:
- goal;
- status;
- schedule;
- tasks;
- planning;
- collaboration;
- ContentBuild reference.

#### ContentBuild
The evolving content object:
- concept/research;
- outline/script/storyboard;
- packaging;
- title/thumbnail/description/tags;
- video/audio/captions;
- publishing configuration;
- launch/community assets;
- selected/final variants;
- revision identity.

#### Asset Graph
Artifact identity, lineage, provenance, versions, variants, dependencies and durable retrieval.

Convergence direction:

- Project remains a distinct owner.
- ContentBuild remains the canonical content-work identity.
- Asset Engine owns artifact lifecycle/relationships.
- Vault becomes the canonical browse/search/manage/storage experience over the same asset identities.
- Video Package becomes primarily a ContentBuild projection.
- Publishing Package becomes a publication-readiness projection.
- Launch Package becomes a launch projection.
- Editor/thumbnail/tool packages become task projections instead of competing state universes.

Bridges such as `VideoPackageContentBuildBridge` and `ProjectVideoPackageBridge` are migration seams, not desired permanent architecture.

### System 4 — Creator Operations & Generation

Answers: **What is ViewTube doing on the creator's behalf, what did it consume, and what did it produce?**

Unifies the operational contract around:

- reasoning operations;
- structured text generation;
- media generation;
- analysis;
- transformations;
- edits;
- internal tool handoffs;
- render jobs;
- research;
- publishing execution.

Converging concepts:

- `AssetGenerator`
- `GenerationWorkflow`
- BrainModelGateway
- future media-provider gateways
- ToolContext / ContextManifest
- GenerationRecord
- ActionPacket
- ToolReceipt
- workflow chains
- BrainSuperToolBridge

Long-term possibility: ActionPacket, GenerationRecord and ToolReceipt become different lifecycle views over one **Operation Record**, while retaining compatibility types during migration.

Minimum operation identity:

```text
operationId
channelId
projectId
contentBuildId
task/capability
inputAssetIds
evidenceIds
contextFingerprint
prompt/version
requested/served model
provider/job
outputAssetIds
permissions
status
receipt
rollback/undo metadata
```

### System 5 — Outcomes, Evaluation & Learning

Answers: **What happened after a recommendation/action, how should it be evaluated, and what—if anything—deserves to become durable learning?**

Canonical lifecycle:

```text
Recommendation / Generation / Action
→ Creator decision
→ Outcome
→ Evaluation
→ Learning candidate
→ Hold / reject / reinforce / promote / supersede
→ Channel Knowledge
```

Candidates for convergence:

- `BrainOutcomeLedger`
- `assetOutcomes`
- Algorithm event/outcome ledgers
- lifecycle observation store
- evaluation engine family
- learning candidate/promotion/governance modules
- recommendation calibration

Specialized evaluators remain, but identity, producer contracts and lifecycle become unified.

No one-off success, edit, click or correlation may silently become Channel Knowledge.

### System 6 — Brain Runtime & Experience

Answers: **How does the creator interact with all of the above intelligence and operations?**

Canonical runtime:

```text
UI / Chat / Tool / Widget
→ BrainRuntime
→ intent + task/capability
→ Creator Context resolver
→ Evidence & Intelligence
→ Prompt/task policy
→ BrainModelGateway or media operation
→ response / asset / action
→ trace + receipt
```

Keep:

- `BrainRuntime`
- `BrainModelGateway`
- `BrainOrchestrator`
- `BrainTaskProfileRegistry`
- `BrainCapabilityRegistry`
- shared conversation controller
- user controls

Converge all creator-facing surfaces onto the same experience contract:

- Sidebar Chatbot
- Brain Hub
- AI Brain Command Interface
- Studio Hub assistants/tools
- Dashboard AI widgets
- Editor sidecar
- Project assistants
- Vault AI operations

UI requests capabilities; UI does not assemble a bespoke provider stack.

## 4. System boundaries that must remain distinct

### Analytics vs Intelligence

- Analytics = measured/normalized truth.
- Intelligence = interpretation of evidence.

Do not collapse them into one mutable store.

### Creator Knowledge vs Evidence

- “Creator prefers concise titles” can be confirmed knowledge.
- “Short titles had higher CTR in cohort X” is evidence.
- One may influence the other only through evaluation/learning governance.

### Project vs ContentBuild

- Project = workflow container.
- ContentBuild = evolving content object.
- They should share identity continuously but not become one ambiguous record.

### Asset Engine vs Vault

- Asset Engine = lineage/lifecycle/version/variant semantics.
- Vault = storage/library/search/manage UX.
- They should share one asset identity contract.

### Brain vs specialist intelligence

BrainRuntime orchestrates specialists; it does not erase them.

### Publishing vs AI

Publishing retains immutable approval, external side-effect and retry/idempotency boundaries.

## 5. Classification vocabulary

Every candidate system/file/contract receives one primary disposition:

- **KEEP** — unique canonical responsibility remains.
- **MERGE** — responsibility moves directly into a stronger canonical system.
- **PROJECT** — becomes a read model/projection over canonical state.
- **ADAPTER** — retained temporarily as a compatibility or boundary adapter.
- **PAIR** — distinct ownership remains but a shared facade/contract removes duplicated integration.
- **QUARANTINE** — production callers migrated; retained temporarily for rollback/provenance.
- **REMOVE** — zero reachability, parity certified, donor harvest complete.

A subsystem may move through multiple lifecycle states, for example:

`KEEP → PAIR` or `ADAPTER → QUARANTINE → REMOVE`.

## 6. Initial consolidation hypotheses

These are starting hypotheses, not deletion approvals.

| Current area | Target | Initial disposition |
| --- | --- | --- |
| Channel Profile + Channel Knowledge + Style resolution | Creator Context & Knowledge | PAIR / shared facade |
| BrainMemoryClaims | Creator Context & Knowledge / governed learning input | MERGE semantics; keep persistence until migration |
| BrainProjectContext | Creator Context resolver | ADAPTER → MERGE |
| BrainSurfaceContext + BrainSurfaceSelection | Creator Context resolver | KEEP as surface adapters |
| BrainContextBroker | Creator Context assembler | KEEP, then simplify around new facade |
| analytics-canon | Evidence & Intelligence | KEEP canonical evidence owner |
| BrainAnalyticsEvidence | Evidence & Intelligence | ADAPTER → PROJECT |
| BrainStatisticsBridge | Evidence & Intelligence | ADAPTER → PROJECT |
| BrainAudienceBridge | Evidence & Intelligence | ADAPTER → PROJECT |
| AudienceEvidenceCollector | Evidence intake | MERGE/PPAIR after caller audit |
| AnomalySignalBridge | Derived signal layer | ADAPTER / possible MERGE |
| OpportunityEvidenceAdapter | Derived signal layer | ADAPTER / possible MERGE |
| StatisticsIntelligence | Specialist intelligence | KEEP |
| AudienceIntelligence | Specialist intelligence | KEEP |
| ChannelIntelligence | Specialist intelligence | KEEP |
| OpportunityIntelligence | Specialist intelligence | KEEP |
| Algorithm Intelligence family | Specialist portfolio | KEEP but consolidate ledgers/helpers |
| Project | Project/Content/Asset Graph | KEEP |
| ContentBuildRepository | Project/Content/Asset Graph | KEEP |
| ProjectContentIdentityService | Project/Content/Asset Graph | KEEP |
| VideoPackageRepository | ContentBuild projection/compatibility | PROJECT / ADAPTER |
| VideoPackageContentBuildBridge | migration compatibility | ADAPTER → QUARANTINE |
| ProjectVideoPackageBridge | migration compatibility | ADAPTER → QUARANTINE |
| PublishingPackageProjection | ContentBuild projection | KEEP as projection |
| Asset Engine contracts | Asset Graph | KEEP |
| Vault adapter/services | Asset Graph + Vault UX | PAIR with Asset Engine identity |
| AssetGenerator | Creator Operations | KEEP, expand |
| GenerationWorkflow | Creator Operations | PAIR/MERGE contract |
| BrainModelGateway | Creator Operations/Brain boundary | KEEP |
| BrainSuperToolBridge | Creator Operations | ADAPTER over shared operation/handoff API |
| ActionPacket / ToolReceipt / GenerationRecord | Creator Operations | CONSOLIDATE contract; no immediate storage merge |
| BrainTrace | Operation provenance | KEEP; project over durable operation lineage |
| BrainOutcomeLedger | Outcomes/Evaluation/Learning | KEEP temporarily; converge producer contract |
| Algorithm event ledgers | Outcomes/Evaluation/Learning | PAIR / consolidate storage semantics after audit |
| assetOutcomes | Outcomes/Evaluation/Learning | MERGE producer contract |
| evaluation engines | Outcomes/Evaluation/Learning | KEEP specialist evaluators |
| learning governance/promotion | Outcomes/Evaluation/Learning | KEEP |
| Sidebar/Brain Hub/AIBrain UI | Brain Runtime & Experience | PAIR on shared controller/context |
| direct creator `gemini.ts` generators | Creator Operations/Brain | ADAPTER → QUARANTINE → REMOVE per family |

## 7. Phase Zero — convergence before broad integration

### 0A — Responsibility and reachability audit

For every candidate subsystem:

- exact responsibility;
- public API;
- persistence owner;
- production producers;
- production consumers;
- tests;
- data model;
- overlap;
- donor value;
- current reachability;
- migration risk.

Deliverable: `tasks/system-convergence/SYSTEM-CLASSIFICATION.md`.

### 0B — Shared contracts

Define additive contracts first:

1. CreatorContextEnvelope
2. EvidenceRecord / DerivedSignal
3. ContentObjectRef / AssetRef
4. OperationRecord lifecycle
5. OutcomeRecord / EvaluationTarget / LearningCandidate identity
6. BrainSurfaceRequest

No current behavior is removed in this step.

### 0C — Canonical facades

Add one facade per convergence system and migrate callers behind it gradually.

### 0D — Donor harvest

Before replacing any subsystem, preserve:

- algorithms;
- prompts;
- schemas;
- error handling;
- tests;
- edge cases;
- UI behaviors;
- migration utilities;
- performance optimizations;
- comments/docs explaining non-obvious decisions.

### 0E — Strangler migration

Migrate one caller family at a time.

Required sequence for each family:

```text
inventory
→ parity tests
→ new facade
→ dual-read/compatibility if needed
→ caller migration
→ observability
→ zero-reachability proof
→ quarantine
→ removal
```

### 0F — Quarantine

Quarantine requires:

- zero known production callers;
- parity/eval suite green;
- migration receipt;
- donor-harvest receipt;
- fallback decision;
- canonical successor recorded.

### 0G — Removal

Removal requires a fresh reachability audit after quarantine and no persistent data that is only readable through the old path.

## 8. Recommended convergence waves

### Wave 1 — Creator Context

Lowest destructive risk and highest leverage.

Unify access to Channel Knowledge/Profile/Style/Project/surface context behind a shared resolver while preserving existing stores.

### Wave 2 — Evidence adapters

Create one evidence projection API and reduce Brain-specific bridges. Keep analytics-canon untouched as truth owner.

### Wave 3 — Project/Content package projections

Make Video Package and Publishing Package increasingly projection-based. Reduce bidirectional synchronization and duplicate mutable state.

### Wave 4 — Operations contract

Normalize generation, tool handoff, media jobs and receipts around one operation identity.

### Wave 5 — Outcomes/learning contract

Normalize outcome producers and identity before changing storage.

### Wave 6 — Creator-facing AI migration

Move remaining direct `gemini.ts` caller families behind the canonical operation/runtime paths.

### Wave 7 — Quarantine and delete

Remove only after the previous waves prove parity.

## 9. High-risk anti-patterns to eliminate

- UI assembling its own analytics truth.
- UI assembling its own creator profile.
- project identity derived only from transient visible context.
- multiple mutable copies of title/thumbnail/metadata package state.
- direct provider calls from creator-facing views.
- model-generated metric calculations replacing deterministic code.
- multiple outcome ledgers recording the same action without shared identity.
- model writes directly into durable learning.
- Vault and Asset Engine producing different identities for the same artifact.
- “bridge” code becoming permanent architecture by default.

## 10. Acceptance criteria for the convergence program

The architecture is converged when:

1. Every canonical concept has exactly one owning domain.
2. All creator-facing reasoning enters BrainRuntime.
3. All creator text/reasoning model calls cross BrainModelGateway or the governed AssetGenerator path.
4. All analytics truth comes through analytics-canon.
5. Creator/channel/project/style context is resolved through one bounded context API.
6. Video/Publishing/Launch packages are projections where duplication is unnecessary.
7. Vault and Asset Engine share canonical asset identity.
8. Every generation/action has stable operation/provenance identity.
9. Every consequential action can connect to an outcome/evaluation.
10. Learning reaches Channel Knowledge only through governance.
11. No quarantined system has a production caller.
12. Architecture guards prevent old parallel paths from returning.

## 11. Relationship to existing authorities

This document coordinates convergence; it does not replace bounded canonical authorities.

Still authoritative:

- `docs/brain/VIEWTUBE_AI_SYSTEMS_MASTER_RESOURCE.md`
- `docs/brain/UNIFIED_AI_SYSTEM_CANONICAL_CONSOLIDATION_CONTRACT_2026-09-17.md`
- `docs/brain/VIEWTUBE_PROMPT_SYSTEM_AUTHORITY_2026-09-24.md`
- `docs/analytics/VIEWTUBE_ANALYTICS_VT_SYNC_MASTER_RESOURCE.md`
- `docs/architecture/VIEWTUBE_PROJECTS_CONTENTBUILD_WORKFLOW_MASTER_RESOURCE.md`
- `docs/architecture/VIEWTUBE_ASSET_ENGINE_MASTER_RESOURCE.md`
- `docs/architecture/VIEWTUBE_FINISH_PROGRAM_2026-09-24.md`
- `docs/handoffs/VIEWTUBE_VAULT_MASTER_HANDOFF_2026-09-26.md`

This plan becomes the convergence layer that explains how those authorities should interact and where redundant integration infrastructure should shrink.

## 12. Immediate next implementation slice

Begin with **Creator Context convergence**, because it can be additive and immediately improves Brain, Studio Hub, Projects, widgets, Vault and Editor without deleting anything.

Initial slice:

1. inventory all callers of ChannelProfileAdapter, ChannelKnowledgeProjection, StyleProfile, BrainProjectContext, BrainSurfaceContext and BrainSurfaceSelection;
2. define CreatorContextEnvelope;
3. implement a read-only CreatorContextResolver facade over existing owners;
4. migrate BrainContextBroker to consume the facade;
5. add rich/sparse/disabled/project/no-project tests;
6. migrate Sidebar and Brain Hub context assembly;
7. verify no personalization/project leakage when controls are disabled;
8. only then identify obsolete adapter responsibilities.

No existing persistence owner is removed in this slice.
