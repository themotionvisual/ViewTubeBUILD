# ViewTube System Integration Matrix

**Generated:** 2026-09-03  
**Machine-readable companion:** [VIEWTUBE_SYSTEM_REGISTRY_2026-09-03.json](VIEWTUBE_SYSTEM_REGISTRY_2026-09-03.json)

This matrix converts the master architecture into an implementation-oriented dependency map.

## Critical spine

| Stage | Canonical owner | Input | Output | Next consumer |
|---|---|---|---|---|
| Observe | VT-SYNC | YouTube APIs / Reporting / imports | raw canonical datasets + freshness + provenance | analytics-canon |
| Normalize | analytics-canon | VT-SYNC snapshot | bounded selectors/evidence/dataset rows | Analytics UI, Brain, Anomaly |
| Personalize | Channel Profile | validated learning + creator rules | durable channel context | Brain and tools |
| Reason | Brain | bounded context + evidence | recommendation / explanation | ActionPacket / creator |
| Detect | Signal Anomaly Intelligence | analytics-canon evidence | anomaly events + confidence | Brain / Momentum |
| Prioritize | Algorithm Momentum | anomaly + profile + project + analytics | intervention/recommendation | ActionPacket |
| Route | ActionPacket / Handoff | typed goal + payload + evidence | destination-prefill work item | Studio Tool |
| Execute | Studio Tool Runtime | ActionPacket + creator input | draft/write/result | Outcome Ledger |
| Evaluate | Outcome Ledger | action lineage + observed result | outcome record | Learning Ledger |
| Learn | Learning Ledger | repeated outcomes + contradictions | candidate/validated learning | Channel Profile |
| Remember | Channel Profile | approved validated learning | durable channel-specific intelligence | next Brain/tool cycle |

## Cross-system invariants

### Data

- VT-SYNC is the raw analytics owner.
- analytics-canon is the public analytics interface.
- No feature creates its own durable analytics cache as a second truth.
- CSV/Sheets imports enrich canonical rows with provenance rather than bypassing the model.

### Intelligence

- Brain never receives unrestricted databases by default.
- Every AI answer that depends on channel data can carry evidence refs and confidence.
- Anomaly is a derived event layer, not an analytics store.
- Momentum recommends; it does not silently mutate YouTube.

### Workflow

- Cross-tool work is an ActionPacket.
- Persistent workflow state is a HandoffRecord.
- Every significant action/recommendation is traceable into an OutcomeRecord.
- Learning requires repeated evidence and contradiction handling.

### Creator control

- Brain User Control Center becomes an enforced runtime policy.
- Publishing, deletion and account/security changes remain approval gated unless explicit supported policy says otherwise.
- Per-tool Profile/Project/Analytics/Write/Events/Brain access is declarative.

### Assets and production

- Video IDs are canonical through videoAssets.
- Media uses Vault IDs/provenance.
- Project intent/state stays in Projects.
- Editor/mobile share one state owner.
- Publisher consumes approved artifacts rather than rebuilding them.

## Active branch normalization map

| Branch / PR | Valuable systems | Must normalize against | Do not carry blindly |
|---|---|---|---|
| PR #72 Brain phase five | Handoffs, Outcome Ledger, User Controls, Tool bridge, workflow recipes, Channel Profile adapter, Vault/engagement integrations | current auth, analytics-canon, project/tool contracts | stale duplicated Brain/service generations |
| PR #77 ViewTubeX consolidation | YouTube skill/reference, analytics/VT-SYNC improvements, dashboard/tool donors, quarantine evidence | current main + dedicated Brain/editor branches | quarantined legacy, duplicate auth/data paths, broad unrelated cleanup |
| PR #78 Anomaly foundation | canonical row accessor, robust detector, provenance, Brain capability | analytics-canon + Evaluation + Profile + Momentum | direct feature-owned API/cache layer |
| PR #66 VT_E1 | shared editor state/timeline, mobile, transition/render semantics | Projects + Vault + Publisher | second mobile project store or editor-local asset ownership |
| PR #75 reference | architecture, branch evidence, migration plans, prototype references | current PR/branch state | runtime code |

## Next structural coding sequence

1. Add a runtime `SystemRegistry` / `ToolCapabilityRegistry` contract mirroring this reference schema.
2. Normalize PR #72 ActionPacket/Handoff/Outcome contracts into one shared workflow namespace.
3. Persist PR #78 anomaly events and add new-entity/share/distribution/correlation detectors.
4. Connect anomaly recommendations to the Outcome Ledger rather than directly to learning.
5. Make Brain User Controls a real policy service checked by Brain and Tool Runtime.
6. Bind Learning Ledger promotion explicitly to Channel Profile writes.
7. Make Projects, Vault and VT_E1 share artifact identifiers.
8. Complete analytics-canon migration for remaining analytics consumers.
9. Add registry-governance tests for duplicate owners, orphan tools and stale documentation.
10. Generate User Guide / system status from the runtime registry where practical.

## Desired end condition

A new ViewTube capability should be able to declare:

```ts
{
  systemId,
  owner,
  reads,
  writes,
  evidenceRequirements,
  profilePermissions,
  projectPermissions,
  approvalPolicy,
  actionPacketInputs,
  actionPacketOutputs,
  outcomeEvents,
  lifecycleStatus
}
```

and immediately participate in the same data, Brain, workflow, safety, evaluation and learning architecture as every other ViewTube system.
