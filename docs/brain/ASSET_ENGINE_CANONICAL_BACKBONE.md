# Asset Engine — Canonical Workflow Backbone

## Decision

The Creator Asset Engine is the standard vehicle for durable work moving between ViewTube tools and systems.

This does **not** replace canonical ownership:

- BrainRuntime owns reasoning, routing, context/evidence planning and orchestration.
- analytics-canon owns normalized analytical evidence.
- Channel Profile owns durable creator/channel knowledge.
- Projects own project state and workflow phase.
- Vault owns canonical artifact identity and provenance.
- ActionPacket/Handoff owns cross-tool transport.
- Outcome/Evaluation owns measured results.
- Learning owns governed promotion of observations into durable knowledge.

The Asset Engine is the connective facade that ensures work crossing a system boundary becomes an identifiable, evidence-bearing, provenance-bearing asset rather than an anonymous blob.

## Standard path

```text
User / Widget / Tool / Project
          ↓
      BrainRuntime
 Intent → Capability → Evidence
          ↓
  Knowledge + Evidence + Research
          ↓
     Intelligence / Reasoning
          ↓
       Asset Engine
          ↓
 AssetGenerationRecord + Vault Asset
          ↓
      ActionPacket / Handoff
          ↓
 Destination Tool / Workflow / Editor
          ↓
       Used Variant / Action
          ↓
     Outcome / Evaluation
          ↓
          Learning
```

## Boundary rule

When useful work moves from one ViewTube system to another, prefer:

1. Resolve existing canonical assets when possible.
2. Create an Asset Engine record when new work is produced.
3. Attach evidence IDs, provenance, project/video/channel scope, trace ID and parent asset IDs.
4. Persist the generated artifact into Vault.
5. Move it across a tool boundary with an ActionPacket/Handoff.
6. Record which final asset/variant was used.
7. Link later outcomes/evaluations back to that identity.

Direct ephemeral values are still acceptable inside one deterministic function or component. They must not become the durable cross-tool integration contract.

## Asset graph

The intended provenance graph is:

```text
Evidence / Research
  → Idea
  → Audience Promise / Concept
  → Outline
  → Script / Hook
  → Visual Plan / B-roll / Storyboard
  → Thumbnail / Image / Media
  → Metadata / Community / Shorts
  → Editor Package / Publish Package
  → Published Video
  → Analytics / Audience Response
  → Evaluation
  → Learning Candidate
```

Every node may link to multiple parent assets and evidence references. This permits branching variants without losing lineage.

## Brain integration

Brain capabilities should create or resolve assets through `src/services/assetEngine.ts` whenever their output is intended for reuse, approval, editing, transport, publishing, evaluation or learning.

Analytical answers that are purely explanatory do not need to become assets. Consequential recommendations should receive stable recommendation identity; when converted into work, the resulting work should enter the Asset Engine.

The Evidence Planner remains upstream. The Asset Engine preserves the evidence references selected by the Brain; it does not independently decide what evidence is sufficient.

## Tool integration

All public creator tools should converge on these contracts:

- `resolveAssets(...)` to locate reusable Vault artifacts.
- `createAsset(...)` for a new durable creator artifact.
- `handoffAsset(...)` to send an existing asset to another compatible tool.
- `createAndHandoffAsset(...)` for a single creation + transport workflow.
- `getAssetLineage(...)` to inspect provenance.

Existing `viewTubeToolChains`, `generationStore`, `vaultAdapter`, `brainHandoffInbox`, workflow engine and live-tool integration remain valid lower-level infrastructure. Migrate callers incrementally; do not duplicate them.

## Required metadata

Durable asset workflows should carry, when available:

- channel ID
- project ID / project name
- video ID
- project/workflow stage
- source tool
- payload/asset type
- evidence IDs and evidence metadata
- provenance
- parent asset IDs
- Brain trace ID
- generation record ID
- creator instructions / selected variant (generation layer)
- later outcome/evaluation links (evaluation layer)

## Migration order

1. Brain Command Center / AI Brain creation actions.
2. Intelligence Hub create-from-insight actions.
3. Analytics/widget copilot create/send actions.
4. Projects and project workflow assets.
5. Script, Hook, Thumbnail, Community and Metadata tools.
6. Storyboard and Editor packages.
7. Publisher and Video Manager handoffs.
8. Outcome/Evaluation attribution.
9. Experiment variants and Learning candidates.
10. Remove superseded direct cross-tool blob/prefill pathways only after parity tests.

## Acceptance tests

- A widget insight can become a project asset with the exact evidence IDs preserved.
- A Brain-generated script can be handed to Projects → Storyboard → Editor without re-entry or lost provenance.
- A Vault image can be handed to Community or Editor with one stable asset identity.
- A title/thumbnail variant can be identified later as the actually used version and evaluated against valid metrics.
- A tool receiving an ActionPacket can resolve the underlying Vault asset and its lineage.
- Missing evidence remains missing; the Asset Engine never fabricates evidence.
- Publishing, destructive edits and consequential external communication remain approval-gated.

## Implementation status

Phase A foundation is implemented on the integration branch with `src/services/assetEngine.ts`. It wraps the existing generation, Vault and ActionPacket systems instead of creating a competing store or transport layer.
