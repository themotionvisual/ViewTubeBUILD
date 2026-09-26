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

- [ ] Inventory ChannelProfileAdapter callers.
- [ ] Inventory ChannelKnowledgeProjection callers.
- [ ] Inventory StyleProfile callers.
- [ ] Inventory BrainMemoryClaims/NicheKnowledge callers.
- [ ] Inventory BrainProjectContext callers.
- [ ] Inventory BrainSurfaceContext/Selection callers.
- [ ] Define CreatorContextEnvelope.
- [ ] Implement read-only CreatorContextResolver.
- [ ] Add channel-scope/privacy tests.
- [ ] Add project/no-project tests.
- [ ] Add personalization-disabled tests.
- [ ] Migrate BrainContextBroker.
- [ ] Migrate SidebarChatbot context assembly.
- [ ] Migrate BrainHubWidget context assembly.
- [ ] Classify now-redundant adapter behavior.

## Evidence & Intelligence

- [ ] Inventory all analytics-canon consumers in Brain.
- [ ] Define unified EvidenceRecord projection.
- [ ] Map BrainAnalyticsEvidence.
- [ ] Map BrainStatisticsBridge.
- [ ] Map BrainAudienceBridge.
- [ ] Map AudienceEvidenceCollector.
- [ ] Map AnomalySignalBridge.
- [ ] Map OpportunityEvidenceAdapter.
- [ ] Preserve Statistics/Audience/Channel/Opportunity specialists.
- [ ] Audit Algorithm Intelligence helper/ledger sprawl.
- [ ] Add metric comparability guard.
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
