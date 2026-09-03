# ViewTube Unified Systems Architecture

**Master resource refresh:** 2026-09-03  
**Purpose:** consolidate the systems being developed across ViewTube conversations, branches, PRs, prototypes, skills, and resource documents into one structural code direction.

## North star

ViewTube should become one creator operating system, not a collection of disconnected dashboards and AI tools.

```text
SYNC
  ↓
UNDERSTAND
  ↓
DECIDE
  ↓
CREATE
  ↓
PRODUCE
  ↓
PUBLISH
  ↓
ENGAGE
  ↓
MEASURE
  ↓
LEARN
  └────────────→ back into SYNC / PROFILE / BRAIN
```

## Canonical ownership

| Owner | Owns | Must not duplicate |
|---|---|---|
| VT-SYNC | raw YouTube/Data/Analytics/Reporting/imported facts, freshness, provenance | Brain memory, project intent, UI-local analytics truth |
| analytics-canon | normalized selectors, bounded intelligence evidence, canonical dataset access | second caches or feature-specific analytics stores |
| Channel Profile | niche, pillars, formats, goals, creator rules, durable baselines, validated learnings | transient anomalies or raw datasets |
| Projects | creator intent, audience, hypotheses, workflow state, project assets and decisions | channel-wide identity |
| Brain | context assembly, orchestration, evidence reasoning, recommendations, reflection and learning proposals | raw-source ownership or silent profile rewrites |
| Evaluation / Learning | recommendation lineage, creator choice, outcomes, corrections, confidence evolution | analytics ownership |
| Video Assets / Vault | canonical video/media identities and provenance | project strategy or analytics truth |
| Tool Runtime | tool-specific controls and actions | separate brains, separate channel profiles, separate analytics caches |

## Current system atlas

### Platform and governance

- App Shell / routing / navigation / feature registry
- Auth / account / billing / entitlements
- diagnostics and observability
- Task Index / recovery / branch governance
- User Guide / documentation registries
- Studio Hub / tool registry
- shared design tokens and widget shell

### Data and analytics

- VT-SYNC
- analytics-canon
- Analytics / Data Explorer
- video-level analytics
- traffic/search/external/playback datasets
- geography/demographics/audience/device/revenue
- retention
- CSV/Sheets augmentation
- visual analytics module system
- canonical video catalog

### Brain and adaptive intelligence

- persistent Brain chat
- Brain orchestrator
- Brain capability registry
- Brain Context Broker
- evidence drawer
- confidence labels
- prompt library
- Brain User Control Center
- Handoff Inbox
- Outcome Ledger
- Learning Ledger
- Adaptive Brain Orchestrator
- workflow recipes
- Super Tool bridge / ActionPackets
- Signal Anomaly Intelligence
- Algorithm Momentum / opportunity engine
- channel-specific strategy learning

### Creator workflow

- Creator Canvas / Creator OS
- Projects
- Video Manager
- Media Analyzer / Content Analysis
- Script Studio
- Storyboard Studio
- Vault / Asset system
- ViewTube Editor (VT_E1)
- Thumbnail Studio / Packaging Lab
- metadata / title / description / tag systems
- Video Publisher
- Pre-Launch Priming
- Community Posts
- Shorts generator / bridge
- Comment Responder
- End-Screen Architect
- Actionable Tactics
- derivative-content workflows

## Shared structural contracts

### EvidenceRef

Carries dataset/source/snapshot/time-window/entity provenance into Brain and tools.

### ActionPacket

Universal typed handoff between tools:

```ts
type ActionPacket = {
  id: string
  sourceTool: string
  destinationTool: string
  goal: string
  payload: unknown
  evidenceRefs: string[]
  confidence?: number
  missingInputs?: string[]
  approvalRequirement?: string
}
```

### HandoffRecord

Persists the ActionPacket lifecycle:

`queued → opened → accepted → completed`

with reject/correct/dismiss branches.

### RecommendationRecord

Connects Brain/Anomaly/Momentum recommendations to predicted outcomes and later evaluation.

### OutcomeRecord

Records creator choice, completion, measurable results, corrections and evaluation window.

### LearningCandidate

Stores a possible channel-specific lesson with evidence, outcome references, contradictions, confidence, status and promotion controls.

### ToolCapabilityDefinition

Every Studio tool declares:

- what it can read
- what it can write
- project/profile/analytics access
- required capabilities
- approval gates
- ActionPacket input/output types
- outcome events

### DiagnosticEvent

One event shape for auth, sync, Brain, tools and production health.

## Core integrated loops

### Analytics intelligence loop

```text
VT-SYNC
 → analytics-canon
 → Analytics / Brain Evidence
 → Signal Anomaly Intelligence
 → Algorithm Momentum
 → Recommendation
 → ActionPacket
 → Tool
 → Outcome Ledger
 → Learning Ledger
 → approved Channel Profile learning
```

### Creator production loop

```text
Channel Profile + Project
 → Brain
 → Creator Canvas
 → Script / Storyboard
 → Vault
 → Editor
 → Packaging
 → Publisher
 → YouTube
 → VT-SYNC
 → Evaluation
```

### Tool-chain loop

```text
Tool A
 → ActionPacket
 → Handoff Inbox
 → Tool B prefilled state
 → creator accepts / corrects / completes
 → Outcome Ledger
 → tool-chain ranking per channel
```

### Safety loop

```text
Brain User Control policy
 → context/read permission
 → tool/action permission
 → approval gate
 → write
 → audit + evaluation
```

## Brain User Control Center as runtime policy

The User Control Center should govern:

- Brain on/off
- autonomy mode
- evidence-first responses
- external research
- code execution
- Channel Profile access
- project context access
- historical analytics access
- creator feedback use
- learning mode
- auto-promotion threshold
- brand-change approval
- external publish/delete/account-change confirmation
- internal draft/analysis permissions
- retention and forgetting
- per-tool PROFILE / PROJECT / ANALYTICS / WRITE / EVENTS / BRAIN permissions

This policy must be enforced by Brain and Tool Runtime, not stored only in UI state.

## Latest branch / PR consolidation

### PR #72 — Brain phase five production chains

The branch now spans the production-chain architecture: Handoff Inbox, Outcome Ledger, User Controls, Channel Profile adapter, Brain Analytics Evidence, Super Tool bridge, workflow recipes/execution/learning, Vault adapter, evaluation ledger, tool-chain ranking, live-tool inbox and several mounted/partially mounted UI surfaces.

**Consolidation rule:** treat it as the richest Brain donor branch but normalize it onto current canonical analytics/auth/project/tool contracts in separable slices.

### PR #77 — ViewTubeX clean consolidation

This branch contains a large consolidation/cleanup pass and preserves useful references, YouTube API expert skill material, current analytics/Brain/VT-SYNC changes, dashboard systems and quarantined legacy material.

**Consolidation rule:** compare by subsystem; do not replace main wholesale.

### PR #78 — Signal Anomaly Intelligence foundation

This branch establishes the anomaly-intelligence service seam against `analytics-canon`.

**Consolidation rule:** continue it as a derived-intelligence subsystem; raw analytics remain owned by VT-SYNC.

### PR #66 — VT_E1 unification

Editor work has a canonical shared timeline/store direction, mobile subtree, transition presentation and render integration.

**Consolidation rule:** use one editor state owner; Vault/project artifact identities must be shared rather than copied.

### PR #75 — this reference branch

This branch should remain documentation/reference only and become the current evidence-backed consolidation index for all of the above branches and systems.

## Recommended production spine

```text
src/
  app-shell/
  auth/
  services/
    vt-sync/
    analytics-canon/
    channel-profile/
    projects/
    video-assets/
    vault/
    brain/
      context/
      orchestrator/
      capabilities/
      skills/
      policy/
      evidence/
      reflection/
    intelligence/
      anomaly/
      momentum/
      evaluation/
      learning/
    workflows/
      action-packets/
      handoffs/
      outcomes/
    diagnostics/
  tools/
    registry.ts
    <tool>/adapter.ts
  components/
    system/
    analytics/
    brain/
    vault/
    editor/
  design/
    tokens.ts
  docs/
    system-registry.ts
```

## Consolidation rules

1. One canonical owner per durable fact.
2. A new feature gets an adapter to the owner, not a new cache/store.
3. All AI-capable tools use Brain capability/context contracts.
4. All cross-tool work uses ActionPackets/Handoffs.
5. All meaningful recommendations are evaluable through Outcome records.
6. Channel Profile receives only validated durable learning.
7. Prototypes remain explicit references until mounted through production services.
8. Legacy and replacement systems must be labeled; they cannot remain silently active together.
9. Mobile shares the same state/contracts and changes composition only.
10. Documentation should be generated from or checked against route/tool/system registries.

## Unification roadmap

1. Freeze canonical ownership and system registry.
2. Finalize shared contracts.
3. Complete Signal Anomaly Intelligence persistence/correlation.
4. Complete ActionPacket → Handoff → destination-tool prefill.
5. Complete Outcome Ledger → Learning Ledger → Profile promotion.
6. Enforce Brain User Control policy in runtime.
7. Unify Projects/Vault/Editor/Packaging/Publisher artifact identities.
8. Stabilize one auth/session/account owner and preserve diagnostics.
9. Complete analytics-canon migration and eliminate duplicate data paths.
10. Mount responsive UI over shared services.
11. Retire legacy duplicates only after parity verification.
12. Make User Guide / Task Index / reference atlas self-updating from registries.

## End state

The strongest ViewTube is a closed-loop creator operating system:

**VT-SYNC observes. Analytics Canon makes evidence trustworthy. Channel Profile remembers what is durable. Projects preserve intent. Brain decides what matters. Anomaly and Momentum identify change and opportunity. Studio tools execute. Vault and Editor produce. Publisher acts through approval gates. Audience systems close the human loop. Evaluation measures the result. Learning improves the next decision.**
