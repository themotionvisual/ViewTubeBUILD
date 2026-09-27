# Toolbox Promotion + Workflow Chain Convergence — To Do

**Status:** PROPOSAL / RECONCILIATION WORKSPACE  
**Permanent VT task IDs:** NOT ALLOCATED  
**Baseline:** main at 3ed2bc91f324338fd110a160d65ddbed93806142

## Phase 0 — Current-main reconciliation

- [ ] Re-audit current main immediately before implementation.
- [ ] Build capability matrices for the twenty promotion/consolidation candidates.
- [ ] Classify each as KEEP_WIDGET / PROMOTE_TOOLBOX / WIDGET_PLUS_TOOLBOX / MERGE_WORKBENCH / RETIRE_AFTER_PARITY.
- [ ] Verify every proposed owner against Product Architecture and Domain Authorities.
- [ ] Identify all existing persisted widget IDs affected by merge/rename.
- [x] Audit the core ActionPacket/SendToMenu runtime foundation (capability registry, SendToMenu, ThumbnailHandoffBar, workflow learning, WorkflowChainBuilder).
- [ ] Complete the exhaustive producer/consumer inventory across all tools/widgets.
- [ ] Identify overlap with system-convergence OperationRecord work.
- [ ] Produce no-loss donor map for existing widget consolidation plans.

### Checkpoint 0

- [ ] No candidate is based only on file size.
- [ ] No new backend owner is proposed for an already-owned capability.
- [ ] Existing tasks/plans have been linked instead of duplicated.

## Phase 1 — Shared promotion + handoff contracts

- [ ] C1 define compact-widget → Toolbox open/resume context contract.
- [ ] C1 add return/resume behavior contract.
- [x] C2 confirm accepts / produces already exist in VIEWTUBE_TOOL_CAPABILITIES.
- [ ] C2 extend metadata with requiredContext / mutationClass / resumable destination / explicit suggested handoffs where needed.
- [ ] C2 bridge universal tool capability metadata with WidgetRegistry rather than duplicating fields.
- [ ] C2 add mutation/external-write classification.
- [ ] C2 add registry validation tests.
- [ ] C3 reconcile operation/workflow identity with system-convergence plan.
- [ ] C10 add identity-continuity fixtures.

### Checkpoint 1

- [ ] Two unrelated widget/tool pairs can use the same promotion contract.
- [ ] Tool compatibility can be determined without bespoke hard-coded branching.
- [ ] Project/ContentBuild/video/asset/evidence identity survives a test handoff.

## Phase 2 — Five pilot chains

### Pilot A — Thumbnail Refresh Experiment
- [ ] Manager → Thumbnail Studio handoff.
- [ ] variant provenance + selected/used variant.
- [ ] return to Manager.
- [ ] analytics/evaluation binding.
- [ ] preserve baseline package snapshot.

### Pilot B — Comment → New Video
- [ ] Comment Operations audience-request packet.
- [ ] Brain opportunity interpretation.
- [ ] Project creation handoff.
- [ ] preserve source comment evidence IDs.

### Pilot C — Editor Missing-Shot Recovery
- [ ] Editor selection/range context packet.
- [ ] Video Director generation request.
- [ ] Asset Engine canonical output/lineage.
- [ ] return selected candidate to Editor.
- [ ] no direct provider-only durable asset path.

### Pilot D — 72-Hour Launch Review
- [ ] ApprovedPublishSnapshot handoff.
- [ ] comparable analytics evidence.
- [ ] Daily Oracle / Autopsy interpretation.
- [ ] Video Manager intervention proposal.
- [ ] explicit no-change path.

### Pilot E — Missing Asset Finder
- [ ] package-slot requirement packet.
- [ ] Vault existing-asset lookup first.
- [ ] conditional generator/research handoff.
- [ ] Asset Engine slot assignment.
- [ ] readiness refresh.

### Checkpoint 2

- [ ] All five pilots use the same packet vocabulary.
- [ ] At least three materially different asset/evidence types are supported.
- [ ] External writes remain behind creator approval.
- [ ] Every generated artifact retains provenance.

## Phase 3 — Workflow registry + chain viewer

- [x] C4 confirm existing VIEWTUBE_SUGGESTED_TOOL_CHAINS foundation (8 templates).
- [ ] C4 generalize the existing suggested-chain model into the structured workflow-recipe schema.
- [ ] Encode the forty recipes from the specification.
- [ ] Validate tool IDs and payload compatibility.
- [ ] Mark external-write boundaries.
- [ ] Mark required Project/ContentBuild/video/asset/evidence context per recipe.
- [x] C5 confirm existing WorkflowChainBuilder/workflowEngine chain, step, status, artifact and provenance foundation.
- [ ] C5 converge existing chain builder with universal ActionPacket/GenerationRecord/ContentBuild receipts.
- [ ] Show source, transformations, destinations, artifacts, evidence, approval state and outcomes.
- [ ] Extend/normalize paused/stopped/failed/complete states without creating a second workflow store.

### Checkpoint 3

- [ ] Recipe catalog is a reusable projection, not a hidden task ledger.
- [ ] Chain viewer can reconstruct one full pilot from receipts/packets.
- [ ] Missing provenance is displayed as missing rather than invented.

## Phase 4 — Core promotion wave

- [ ] Video Director capability matrix.
- [ ] Video Publisher capability matrix.
- [ ] Video Manager capability matrix.
- [ ] Video Autopsy capability matrix.
- [ ] Daily Oracle capability matrix.
- [ ] Brain Hub capability matrix.
- [ ] Comment Operations capability matrix.
- [ ] Longform Optimization capability matrix.
- [ ] Video Asset Engine capability matrix.
- [ ] Thumbnail Studio family capability matrix.
- [ ] Define compact Dashboard signature for every WIDGET_PLUS_TOOLBOX candidate.
- [ ] Define internal Toolbox pages/modes for promoted workstations.
- [ ] Add persisted-layout migration plans before any widget ID retirement.

### Checkpoint 4

- [ ] No promoted Toolbox embeds WidgetShell.
- [ ] No Dashboard widget mounts a full Studio Toolbox as a shortcut.
- [ ] Capability parity is explicit where Dashboard and Studio expose the same job.

## Phase 5 — Domain workbench consolidation

- [ ] Metadata / SEO Workbench consolidation matrix.
- [ ] Retention Lab consolidation matrix.
- [ ] Keyword Intelligence consolidation matrix.
- [ ] Publishing Calendar consolidation matrix.
- [ ] Audience Intelligence consolidation matrix.
- [ ] Discovery & Distribution consolidation matrix.
- [ ] Monetization Intelligence consolidation matrix.
- [ ] Harvest unique behavior from every donor widget before retirement.
- [ ] Migrate persisted IDs/layout state where required.
- [ ] Remove old implementations only after parity + zero reachability.

## Phase 6 — Brain ranking + creator preference

- [ ] C6 rank destinations using packet type + Project context + evidence + User Controls.
- [ ] Always expose compatible manual destinations.
- [ ] Never suggest destinations lacking required context.
- [x] C7 accepted/rejected handoff preference signals are already creator-learning gated.
- [ ] Certify privacy/retention/freshness semantics for the existing preference store.
- [ ] Route any broader promotion of preference feedback through governed outcome/evaluation learning rather than direct model memory.

## Phase 7 — Outcome / evaluation closure

- [ ] C11 define expected outcome/evaluation fields for consequential recipes.
- [ ] Attach exact used variant or approved snapshot where relevant.
- [ ] Reuse canonical metric-comparability guard.
- [ ] Add evaluation checkpoint semantics.
- [ ] Prove one packaging pilot closes action → outcome → evaluation → learning-candidate path.

## Phase 8 — Responsive + accessibility certification

- [ ] C12 desktop.
- [ ] C12 narrow desktop/tablet.
- [ ] C12 mobile portrait.
- [ ] C12 mobile landscape.
- [ ] loading.
- [ ] empty.
- [ ] disconnected.
- [ ] stale.
- [ ] error.
- [ ] keyboard/focus.
- [ ] touch target / scroll / overflow.
- [ ] screenshot analysis under Verification contract.

## Final checkpoint

- [ ] Dashboard acts as compact instrument panel rather than a set of mini-apps.
- [ ] Promoted workstations use canonical Toolbox/SubToolbox primitives.
- [ ] Forty workflows reuse shared contracts rather than forty bespoke integrations.
- [ ] Project/ContentBuild/asset/evidence identities survive supported chains.
- [ ] External writes are creator-controlled.
- [ ] Generated assets and AI outputs retain operation/prompt/model/provenance receipts.
- [ ] No duplicate canonical persistence owner was introduced.
- [ ] Any removed widgets have capability-parity and layout-migration evidence.
- [ ] Exact Task Authority identities are reconciled before permanent VT task allocation.
