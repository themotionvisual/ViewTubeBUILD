# System Convergence — To Do

**Created:** 2026-09-26  
**Last edited:** 2026-09-26

## Foundation

- [x] Create convergence master architecture.
- [x] Define six canonical target systems.
- [x] Define KEEP / MERGE / PROJECT / ADAPTER / PAIR / QUARANTINE / REMOVE vocabulary.
- [x] Establish donor-harvest-before-removal rule.
- [ ] Complete production caller inventory for every classified subsystem.
- [ ] Add exact current-main SHA and reachability evidence to every classification row.
- [ ] Identify duplicate persistent stores separately from duplicate APIs.

## Creator Context & Knowledge

- [x] Inventory ChannelProfileAdapter callers.
- [x] Inventory ChannelKnowledgeProjection callers.
- [x] Inventory StyleProfile callers.
- [x] Inventory BrainMemoryClaims/NicheKnowledge callers.
- [x] Inventory BrainProjectContext callers.
- [x] Inventory BrainSurfaceContext/Selection callers.
- [x] Define CreatorContextEnvelope.
- [x] Implement read-only CreatorContextResolver.
- [x] Add channel-scope/privacy tests.
- [ ] Add project/no-project tests.
- [x] Add personalization-disabled tests.
- [x] Migrate BrainContextBroker.
- [ ] Migrate SidebarChatbot context assembly.
- [ ] Migrate BrainHubWidget context assembly.
- [ ] Classify now-redundant adapter behavior.

## Evidence & Intelligence

- [x] Inventory all analytics-canon consumers in Brain.
- [x] Implement unified EvidenceRecord projection. Contract: `tasks/system-convergence/EVIDENCE-RECORD-DERIVED-SIGNAL-CONTRACT.md`.
- [x] Map BrainAnalyticsEvidence.
- [x] Map BrainStatisticsBridge.
- [x] Map BrainAudienceBridge.
- [x] Map AudienceEvidenceCollector.
- [x] Map AnomalySignalBridge.
- [x] Map OpportunityEvidenceAdapter.
- [x] Preserve Statistics/Audience/Channel/Opportunity specialists.
- [ ] Audit Algorithm Intelligence helper/ledger sprawl.
- [x] Add metric comparability guard.
- [ ] Certify evidence IDs end-to-end.

## Project / Content / Asset Graph

- [ ] Inventory Project↔ContentBuild identity writes.
- [ ] Inventory VideoPackage mutable fields.
- [ ] Inventory PublishingPackage mutable fields.
- [ ] Identify fields that can become projections.
- [ ] Define one-write-owner matrix.
- [ ] Reduce VideoPackageContentBuildBridge responsibilities.
- [ ] Reduce ProjectVideoPackageBridge responsibilities.
- [ ] Define Asset Engine/Vault shared asset identity contract.
- [ ] Certify version/variant lineage across Project/Vault/Editor/Publisher.

## Creator Operations

- [ ] Inventory AssetGenerator production callers.
- [ ] Inventory GenerationWorkflow production callers.
- [ ] Inventory ActionPacket/ToolReceipt/GenerationRecord overlap.
- [ ] Define OperationRecord v1.
- [ ] Map BrainTrace onto operation lineage.
- [ ] Define media-provider operation contract.
- [ ] Define approval/undo/irreversibility metadata.
- [ ] Add operation idempotency tests.

## Outcomes / Evaluation / Learning

- [ ] Inventory BrainOutcomeLedger writers/readers.
- [ ] Inventory algorithm ledgers and observations.
- [ ] Inventory assetOutcomes producers.
- [ ] Inventory publish/project/editor/community outcomes.
- [ ] Define shared producer identity contract.
- [ ] Define idempotency keys.
- [ ] Build coverage matrix.
- [ ] Preserve specialist evaluators.
- [ ] Preserve governed learning promotion.
- [ ] Prove no direct model→durable-knowledge write.

## Brain Runtime & Experience

- [ ] Inventory all creator-facing AI surfaces.
- [ ] Confirm every reasoning call uses BrainRuntime.
- [ ] Confirm every model call uses BrainModelGateway/governed generator or documented media gateway.
- [ ] Unify conversation/context envelope across Sidebar/Brain Hub/Studio/Widgets/Editor.
- [ ] Create widget intelligence/context adapter.
- [ ] Complete Editor typed proposal integration.
- [ ] Complete Studio Hub operation handoff integration.

## Legacy donor harvest

- [ ] Inventory all production `gemini.ts` imports/calls.
- [ ] Separate provider helpers from creator-generation behavior.
- [ ] Harvest prompt rules.
- [ ] Harvest schemas.
- [ ] Harvest validation/error behavior.
- [ ] Harvest tests/fixtures.
- [ ] Harvest useful UI behavior.
- [ ] Migrate family-by-family.
- [ ] Quarantine only after zero production reachability.

## Certification

- [ ] No duplicate canonical owner.
- [ ] No duplicate writable package field.
- [ ] No direct analytics truth bypass.
- [ ] No direct creator-reasoning provider bypass.
- [ ] No untraceable consequential generation.
- [ ] No outcome producer without identity/idempotency contract.
- [ ] No promoted learning without evidence/outcome provenance.
- [ ] All quarantined paths have successor and donor-harvest receipts.
- [ ] Fresh reachability audit passes before removal.

## Creator Context first runtime seam — 2026-09-26

- [x] Migrate BrainOrchestrator Channel Knowledge read through CreatorContextResolver.
- [x] Migrate BrainOrchestrator bounded algorithm Project context through CreatorContextResolver.
- [x] Preserve existing canonical stores; no new persistence introduced.
- [x] Prove RED→GREEN architecture tests in CI.
- [x] Replace visibleContext-derived Project details with canonical Project + ContentBuild resolution.
- [ ] Add explicit no-project and canonical-ContentBuild resolver fixtures.


## Evidence & Intelligence first runtime seam — 2026-09-27

- [x] Complete runtime caller classification for BrainStatisticsBridge, BrainAudienceBridge, BrainAnalyticsEvidence, AudienceEvidenceCollector, AnomalySignalBridge and OpportunityEvidenceAdapter.
- [x] Add `EvidenceIntelligenceResolver` as a read-only runtime projection facade.
- [x] Prove resolver RED contract before implementation.
- [x] Route one canonical analytics snapshot to evidence quality, Statistics Intelligence and optional Audience Intelligence.
- [x] Route Opportunity evidence through the same Brain runtime facade while preserving its deterministic builder.
- [x] Verify BrainOrchestrator migration GREEN in CI.
- [ ] Prove BrainStatisticsBridge and BrainAudienceBridge have zero production callers after merge.
- [ ] Donor-harvest BrainAnalyticsEvidence evidence-explanation behavior before quarantine decision.
- [x] Define the broader `EvidenceRecord / DerivedSignal` cross-domain contract.
- [x] Add metric-comparability guard before cross-window/cross-population comparisons.


## Evaluation comparability seam — 2026-09-27

- [x] Promote MetricComparabilityPolicy into `analytics-canon` while preserving the legacy import path as a compatibility re-export.
- [x] Add metric-key mismatch protection to the canonical policy.
- [x] Project analytics evidence into typed `EvidenceRecord[]` from the same canonical snapshot used by Brain evidence intelligence.
- [x] Normalize Anomaly and Opportunity evidence through shared `DerivedSignal` contracts.
- [x] Carry source-field unit/aggregation/entity/format/window/availability metadata into canonical Algorithm observations.
- [x] Carry canonical baseline comparison context into evaluation targets without overwriting explicit baseline values.
- [x] Reject semantically incompatible canonical baseline/current comparisons before relative-change calculation.
- [x] Preserve legacy/lifecycle evaluation behavior until those baseline producers gain typed comparison contexts.
- [x] Prove 7/7 AlgorithmEvaluationEngine tests and 6/6 CanonicalAlgorithmEvaluation tests GREEN.
- [ ] Extend comparability to experiment and data-visual consumers (VT-024).
