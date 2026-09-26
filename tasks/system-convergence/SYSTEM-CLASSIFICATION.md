# ViewTube System Convergence — Initial Classification

**Status:** WORKING REGISTRY — requires production-caller certification before destructive action  
**Created:** 2026-09-26  
**Last edited:** 2026-09-26  
**Audited main:** `86a41a68d92983e16d11d885262dab97462dab2f`

## Legend

- KEEP — canonical/specialist responsibility remains.
- MERGE — semantics move into stronger canonical domain.
- PROJECT — read-model/projection over canonical state.
- ADAPTER — temporary/intentional boundary adapter.
- PAIR — separate owners retained behind shared contract.
- QUARANTINE — zero callers; retained temporarily.
- REMOVE — deletion allowed only after certification.

## Creator Context & Knowledge

| Current subsystem | Proposed destination | Disposition | Reason |
| --- | --- | --- | --- |
| BrainContextBroker | Creator Context resolver | KEEP / SIMPLIFY | Correct context-assembly seam; should consume unified context facade. |
| ChannelProfileAdapter | Creator Context | PAIR | Useful persistence adapter; stop exposing it as an independent product concept. |
| ChannelKnowledgeProjection | Creator Context | KEEP | Valuable typed knowledge/provenance semantics. |
| StyleProfile + styleMetrics | Creator Context | KEEP | Unique creator-style semantics and validation. |
| BrainMemoryClaims | Creator Context / Learning input | MERGE semantics | Claims should be one knowledge input class, not a parallel memory worldview. |
| NicheKnowledge | Creator Context | PAIR / PROJECT | Domain knowledge should resolve through context with provenance. |
| BrainProjectContext | Creator Context | ADAPTER → MERGE | Current helper is useful but should read canonical Project/ContentBuild through the resolver. |
| BrainSurfaceContext | Creator Context | KEEP adapter | Surface metadata is a legitimate boundary adapter. |
| BrainSurfaceSelection | Creator Context | KEEP adapter | Selection state is transient context, not durable knowledge. |
| OnboardingBootstrap | Creator Context/Profile | KEEP producer | Creator-declared profile facts remain useful inputs. |

## Evidence & Intelligence

| Current subsystem | Proposed destination | Disposition | Reason |
| --- | --- | --- | --- |
| analytics-canon | Evidence | KEEP | Canonical analytics truth owner. |
| BrainAnalyticsEvidence | Evidence projection | ADAPTER → PROJECT | Brain-specific conversion should shrink behind shared evidence contract. |
| BrainStatisticsBridge | Evidence/derived signals | ADAPTER → PROJECT | Translation layer, not separate owner. |
| BrainAudienceBridge | Evidence/intelligence | ADAPTER → PROJECT | Translation layer, not separate owner. |
| AudienceEvidenceCollector | Evidence intake | PAIR / MERGE pending callers | Likely reusable collector semantics. |
| BrainEvidenceQuality | Evidence quality | KEEP | Unique cross-cutting epistemic responsibility. |
| AnomalySignalBridge | Derived signals | ADAPTER | Preserve compatibility while signal contract converges. |
| OpportunityEvidenceAdapter | Derived signals | ADAPTER | Provenance-preserving deterministic builder; may fold later. |
| StatisticsIntelligence | Specialist intelligence | KEEP | Legitimate deterministic specialist. |
| AudienceIntelligence | Specialist intelligence | KEEP | Legitimate specialist. |
| ChannelIntelligence | Specialist intelligence | KEEP | Legitimate specialist. |
| OpportunityIntelligence | Specialist intelligence | KEEP | Legitimate specialist. |
| AlgorithmIntelligenceOrchestrator | Specialist portfolio | KEEP | Portfolio/orchestration role is distinct. |
| AlgorithmStrategyEngine | Specialist intelligence | KEEP | Strategy engine, not evidence owner. |
| AlgorithmPrimingEngine | Specialist intelligence/action planning | KEEP | Distinct lifecycle planner. |
| AlgorithmIntelligenceAccess | Evidence/intelligence facade candidate | REVIEW | May become public facade for a subset of specialist portfolio. |
| BrainIntelligencePersistence | Intelligence cache/projection | REVIEW | Persistence ownership must be checked for duplication. |
| BrainIntelligenceBackfill | Migration/backfill | ADAPTER | Expected to become operational/migration-only. |

## Project / Content / Asset Graph

| Current subsystem | Proposed destination | Disposition | Reason |
| --- | --- | --- | --- |
| ProjectContentIdentityService | Project identity | KEEP | Stable cross-system identity is fundamental. |
| ContentBuildRepository | ContentBuild | KEEP | Canonical content-work persistence. |
| ProjectContentBuildBridge | Project↔ContentBuild integration | ADAPTER / possible shrink | May become thinner once identity is native everywhere. |
| VideoPackageRepository | ContentBuild video projection | PROJECT / ADAPTER | Useful API today; reduce separate mutable authority. |
| VideoPackageContentBuildBridge | ContentBuild migration seam | ADAPTER → QUARANTINE | Sync layer should disappear if projection becomes canonical. |
| ProjectVideoPackageBridge | ContentBuild migration seam | ADAPTER → QUARANTINE | Same reason. |
| PublishingPackageProjection | ContentBuild publishing projection | KEEP / PROJECT | Projection is the desired architecture. |
| ApprovedPublishSnapshot | Publishing boundary | KEEP | Immutable side-effect input is unique. |
| PublishTransaction | Publishing operation | KEEP | External side-effect/idempotency owner. |
| Asset Engine contracts | Asset Graph | KEEP | Canonical lineage/version/variant semantics. |
| vaultAdapter + Vault services | Asset Graph/Vault UX | PAIR | Retain Vault responsibilities but share one asset identity. |
| Vault project handoff | Project/Asset integration | ADAPTER | Should use shared operation/identity contracts. |
| Vault versions/usage/readiness | Asset Graph | KEEP where unique | Preserve mature asset-library capabilities. |

## Creator Operations & Generation

| Current subsystem | Proposed destination | Disposition | Reason |
| --- | --- | --- | --- |
| AssetGenerator | Creator Operations | KEEP / EXPAND | Strong governed generator architecture. |
| assetModelRunner | Model execution | PAIR with gateway | Provider-neutral operation runner role. |
| GenerationWorkflow | Creator Operations | PAIR / MERGE contract | Workflow identity should share operation lifecycle. |
| BrainModelGateway | Model boundary | KEEP | Correct provider-neutral seam. |
| BrainSuperToolBridge | Operations/handoffs | ADAPTER | Convenience layer over canonical handoff system. |
| BrainWorkflowRecipes | Operations | KEEP recipes | Task/workflow knowledge can remain declarative. |
| AlgorithmWorkflowRecipes | Operations/specialist | KEEP recipes | Specialist workflows remain declarative. |
| ActionPacket system | Operation handoff | PAIR / CONSOLIDATE | Candidate lifecycle view of OperationRecord. |
| ToolReceipt | Operation receipt | PAIR / CONSOLIDATE | Candidate lifecycle view of OperationRecord. |
| GenerationRecord/store | Operation provenance | PAIR / CONSOLIDATE | Candidate lifecycle view of OperationRecord. |
| BrainTrace | Operation provenance/debug | KEEP / PROJECT | Trace remains critical; durable storage should join operation identity. |
| legacy gemini creator generators | Creator Operations | ADAPTER → QUARANTINE → REMOVE | Preserve provider helpers only as compatibility during migration. |

## Outcomes / Evaluation / Learning

| Current subsystem | Proposed destination | Disposition | Reason |
| --- | --- | --- | --- |
| BrainOutcomeLedger | Outcome producer/store | KEEP temporarily / CONSOLIDATE | Useful contract but browser-local storage and partial coverage remain. |
| assetOutcomes | Outcome producer | MERGE producer contract | Should emit canonical outcome identity. |
| AlgorithmIntelligenceEventLedger | Outcome/event system | PAIR / CONSOLIDATE | Avoid parallel identity for same actions. |
| AlgorithmLifecycleObservationStore | Evaluation observations | KEEP / PAIR | Specialist observations useful; join common identity. |
| AlgorithmEvaluationEngine | Evaluation | KEEP | Specialist evaluator. |
| CanonicalAlgorithmEvaluation | Evaluation | KEEP | Canonical specialist evaluation contract. |
| AlgorithmFinalEvaluationResolver | Evaluation | KEEP | Resolver role remains. |
| AlgorithmLearningCandidates | Learning | KEEP | Candidate stage is valuable. |
| AlgorithmLearningGovernance | Learning | KEEP | Critical safety/governance boundary. |
| AlgorithmLearningProfilePromotion | Learning→Knowledge | KEEP / PAIR | Must integrate with shared Channel Knowledge promotion rules. |
| AlgorithmRecommendationCalibration | Evaluation | KEEP | Distinct calibration responsibility. |
| BrainEvaluationLoop / Inbox | Evaluation workflow | PAIR | UI/workflow around common outcome/evaluation identity. |

## Brain Runtime & Experience

| Current subsystem | Proposed destination | Disposition | Reason |
| --- | --- | --- | --- |
| BrainRuntime | Brain runtime | KEEP | Canonical creator-facing facade. |
| BrainOrchestrator | Brain runtime | KEEP / SIMPLIFY | Core orchestrator; should consume consolidated context/evidence APIs. |
| BrainCapabilityRegistry | Brain runtime | KEEP | Capability selection is legitimate. |
| BrainTaskProfileRegistry | Brain runtime | KEEP | Task/prompt/context policy seam. |
| BrainConversationController | Brain experience | KEEP | Shared conversation continuity owner. |
| BrainEngineControls | Brain experience/control | KEEP | Engine policy. |
| BrainUserControls | Brain experience/control | KEEP | User permissions/privacy. |
| SidebarChatbot | Brain experience | PROJECT/surface | UI surface over same runtime. |
| BrainHubWidget | Brain experience | PROJECT/surface | UI/control surface over same runtime. |
| AIBrainCommandInterface | Brain experience | REVIEW / surface | Audit overlap with Brain Hub/Sidebar; retain unique command UX only. |
| BrainVaultAdapter | Creator Context/Asset retrieval | ADAPTER | Read-only canonical Vault boundary is good; integrate with resolver. |
| Editor Brain assistant plan | Brain experience | PROJECT/surface | Same runtime, typed proposal capability. |
| AI-aware dashboard widgets | Brain experience | PROJECT/surface | Require shared widget intelligence adapter. |

## Immediate certification targets

Before any first quarantine:

1. exact import/caller graph;
2. runtime caller evidence, not docs only;
3. persistence/storage ownership;
4. parity tests;
5. donor harvest;
6. canonical successor API;
7. migration/rollback path;
8. architecture guard preventing regression.
