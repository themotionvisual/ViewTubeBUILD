# ViewTube Canonical Owner Migration Plan

**Date:** 2026-09-03  
**Purpose:** turn the unified architecture into an incremental code-consolidation sequence.

## Rule

A subsystem is not considered consolidated merely because a newer implementation exists. Consolidation is complete only when:

1. the canonical owner is named;
2. all active consumers use its public adapter/contract;
3. parity tests cover the behavior that older paths provided;
4. diagnostics can distinguish unavailable, stale, partial and failed states;
5. the old path is no longer a runtime authority;
6. documentation/registry status changes from migration to canonical/retired.

## Migration table

| Concern | Canonical target | Donor / compatibility sources | Required proof before retirement |
|---|---|---|---|
| account/session identity | server-owned Simple Auth/account snapshot | legacy browser auth, older unified-account projections | fresh login, reload persistence, logout, reconnect, expired session, mobile |
| Google read/write requests | canonical YouTube transports | older direct token reads/fallbacks | proxy success, fallback only for true transport unavailability, genuine scope failure isolation |
| analytics raw data | VT-SYNC | older Performance Hub/DataStore/cache paths | synced + cached + partial + imported data parity |
| analytics consumer API | analytics-canon | feature-specific selectors/ad-hoc VT-SYNC access | tables, visuals, Brain and exports read identical canonical values/provenance |
| channel durable intelligence | Channel Profile | ad-hoc Brain memory / tool preferences | explicit schema, provenance, promotion/forget controls |
| project intent/state | Projects | tool-local project context | open/resume project across Creator OS, Vault, Editor, Publisher |
| video identity/catalog | services/videoAssets | tool-local video arrays | same video ID/metadata used by analytics, Brain, comments and publishing |
| media asset identity | Vault | editor/thumbnail/tool-local assets | asset IDs, provenance and project relationships survive cross-tool handoffs |
| AI orchestration | Brain Orchestrator | feature-specific AI calls | capability routing, context bounds, evidence/confidence, user policy enforcement |
| creator AI policy | Brain User Controls service | prototype/local component state | every Brain/tool read/write path checks policy; persisted creator settings |
| cross-tool workflow | ActionPacket + Handoff Inbox | one-off navigation/prefill glue | source packet opens destination with correct controls and evidence |
| recommendation evaluation | Outcome Ledger | unlinked completion flags | recommendation/action ID survives into measured outcome |
| adaptive learning | Learning Ledger | direct AI memory writes | candidate → evidence → contradiction → approval → Profile |
| anomaly intelligence | anomaly-intelligence service | dashboard-only anomaly calculations | persistent derived events, correlation, evidence, evaluation links |
| strategy interventions | Algorithm Momentum | isolated tactic suggestions | recommendation lineage, approval, outcome measurement |
| editor state | shared VT_E1 store/timeline contract | desktop/mobile transitional stores | desktop/mobile/render parity and project persistence |
| tool metadata | Tool Capability Registry | manual Studio Hub/help lists | every mounted tool has declared permissions, inputs/outputs, lifecycle |
| product/system metadata | System Registry | scattered docs/task indexes | governance tests detect duplicate owners/orphan systems/stale lifecycle |
| diagnostics | shared DiagnosticEvent | auth/sync/tool-specific logging shapes | correlation IDs and common severity/system fields visible in dev tooling |

## Donor branch map

### PR #72 — Brain phase five production chains

Harvest/normalize:

- BrainHandoffInbox
- BrainOutcomeLedger
- BrainSuperToolBridge
- BrainUserControls
- BrainWorkflowRecipes / execution / learning
- ChannelProfileAdapter
- BrainAnalyticsEvidence
- BrainVaultAdapter
- evaluation and tool-chain services
- SendTo/Handoff/Live Tool UI components

Do not preserve multiple generations of similar Brain workflow/handoff services merely because they coexist on the branch. Choose one contract namespace and port behavior/tests into it.

### PR #77 — ViewTubeX clean consolidation

Harvest by subsystem only:

- YouTube API expert skill/reference
- proven VT-SYNC/storage improvements
- analytics/visual donor behavior
- dashboard/tool donor components
- feature-gating concepts
- creator-engagement behavior where current main lacks parity

Exclude/quarantine:

- duplicate legacy auth authorities
- quarantined Performance Hub generations
- backup copies / scratch scripts as production dependencies
- broad cleanup changes unrelated to the subsystem being ported

### PR #78 — Signal Anomaly Intelligence

Continue as the canonical derived anomaly subsystem.

Next slices:

1. persistent anomaly event store;
2. new-entity detector;
3. share/distribution shift detector;
4. cross-dataset correlation;
5. event-driven scan trigger from canonical sync updates;
6. Brain evidence/context injection;
7. Outcome Ledger integration;
8. Algorithm Momentum handoff;
9. mounted Radar UI;
10. validated channel-pattern learning.

### PR #66 — VT_E1 unification

Normalize the editor around one state contract.

Required connections:

- Projects owns project intent/state.
- Vault owns media identity/provenance.
- Editor owns timeline/edit state.
- Publisher consumes the approved render/package.
- Mobile and desktop are responsive surfaces over the same underlying owner.

## Implementation order

### Wave 1 — contracts and ownership

- Runtime System Registry
- Tool Capability Registry
- EvidenceRef
- ActionPacket
- RecommendationRecord
- OutcomeRecord
- LearningCandidate
- DiagnosticEvent

**Exit:** new features can identify their owner and interfaces without inventing parallel storage.

### Wave 2 — analytics / intelligence spine

- finish analytics-canon consumer migration
- persist anomaly events
- wire anomaly evidence into Brain
- connect Momentum recommendations to Outcome lineage

**Exit:** data → derived signal → recommendation is traceable.

### Wave 3 — workflow spine

- normalize ActionPacket services from PR #72
- automatically enqueue Handoff records
- destination adapters prefill tools
- accept/reject/correct/complete UI
- write outcomes

**Exit:** tool-to-tool work is a real persistent workflow.

### Wave 4 — adaptive learning

- Outcome Ledger aggregation
- Learning Ledger candidate management
- contradiction and confidence model
- Channel Profile promotion/forget/retest

**Exit:** ViewTube learns channel-specific lessons without silently rewriting identity.

### Wave 5 — creator production identity

- Projects artifact contract
- Vault asset IDs
- VT_E1 project adapter
- packaging/publisher artifact contract

**Exit:** a project can move from idea to publish without copying state between products.

### Wave 6 — platform stabilization

- finish one auth/session authority
- transport parity tests
- diagnostics/event schema
- production/mobile login verification
- entitlement and capability projection cleanup

**Exit:** every tool sees the same account/channel/capability truth.

### Wave 7 — self-documenting product

- User Guide consumes Tool/System registries
- Task Index can reference system IDs/owners/status
- reference branch generated/refreshed from GitHub + registries
- lifecycle labels enforced in tests

**Exit:** documentation drift becomes testable.

## Retirement gate template

Before deleting or disabling any legacy path, record:

```text
Legacy system:
Canonical replacement:
Active consumers remaining:
Parity tests:
Migration adapter:
Fallback behavior:
Diagnostics:
Production verification:
Rollback:
Registry status after cutover:
```

## Non-negotiable consolidation safeguards

- Never retire a legacy population path until a real-data parity test proves the replacement fills the same tools.
- Never allow cached analytics to grant authentication/API capability.
- Never make an anomaly/hypothesis a durable Channel Profile fact directly.
- Never let ActionPacket execution bypass creator approval policy.
- Never merge a donor branch wholesale simply because it contains several desirable systems.
- Never maintain a second mobile state owner for the same editor/project.
- Never let documentation call a coded service a mounted production UI unless it is actually mounted and verified.
