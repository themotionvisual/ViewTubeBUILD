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
  → Editor Package / Publishing Package
  → Published Video
  → Analytics / Audience Response
  → Evaluation
  → Learning Candidate
```

Every node may link to multiple parent assets and evidence references. This permits branching variants without losing lineage.

## Video Package — Publishing Package subtoolbox

Every Video Package and Asset Engine video workflow should expose a dedicated `Publishing Package` subtoolbox. It is the canonical collection of YouTube-facing metadata and publishing configuration for the video. The same package should be consumed by Video Manager and Publisher rather than maintaining disconnected copies of these values.

### Packaging

- title
- thumbnail
- alternate title / thumbnail variants
- selected/final title and thumbnail

### Metadata

- description
- tags
- YouTube category choice
- chapters / timestamps
- time-marked educational questions when the Education category requires them
- audience setting / Made for Kids designation
- video language
- title / description language
- caption / subtitle status and linked caption asset

### Discovery, routing and in-video navigation

- end-screen frame/layout
- end-screen link choices
- related video selection
- playlist selection(s)
- timestamped cards / in-video routing plan
- card destination videos or playlists

### Publishing

- publishing date and time
- timezone
- visibility: private / unlisted / public / scheduled
- Premiere configuration where supported

### Audience activation

- pinned comment
- related community posts

### Field state and provenance

Publishing fields should support `Missing → Draft → Generated → Edited → Approved → Final → Published` state. Where available, retain source/provenance, generation record, selected variant, creator edits, evidence references and the final value actually sent to YouTube. This lets evaluation distinguish generated candidates from the asset that was truly published.

## SEO and Entity Intelligence

SEO/entity intelligence is a separate intelligence section feeding the Publishing Package rather than another publishing form. It should preserve:

- primary topic and topical entities
- target search concepts / queries
- audience vocabulary
- script-context terms and entities
- historical metadata evidence
- recommended title/description/tag/search strategy
- evidence and confidence behind recommendations

The Publishing Package consumes approved outputs from this section while retaining their evidence and provenance.

## Publish Readiness

Add a dedicated readiness section/status surface for each Video Package. It should evaluate the package without duplicating the fields themselves.

Examples:

- readiness score such as `12/15 READY`
- missing / incomplete / unapproved publishing fields
- missing thumbnail or invalid final asset
- missing end screen, cards, playlists or audience settings
- missing category-specific requirements
- unresolved scheduling / visibility settings
- warnings versus hard blockers
- one-click navigation to the incomplete source section

Readiness is a validation layer, not a second metadata store.

## Launch and Priming Package

Maintain launch/priming as its own package connected to the video and Publishing Package. It can contain:

- pre-publish community post
- launch community post
- Shorts teaser / derivative
- pinned-comment strategy
- audience priming actions
- early post-launch actions
- sustain actions
- timing/dependency relationships to the scheduled publish time

Each launch asset remains an Asset Engine artifact with its own identity and provenance.

## Experiment and Variant System

Experiments belong in the Experiment Engine and should reference Publishing Package assets rather than live inside the publishing metadata form. Support experiments such as:

- title A/B or multivariate variants
- thumbnail A/B or multivariate variants
- title × thumbnail packaging combinations
- publishing-time tests
- metadata / discovery strategy tests
- launch/priming tests

Record hypothesis, variant identities, selected/used variant, valid comparison window, target metrics, confidence and result. The final Publishing Package points to the variant actually used.

## Post-Publish Evaluation Contract

Every Video Package should be able to carry an evaluation contract before publication. The contract tells Outcome/Evaluation what to measure after publication without turning the Publishing Package into an analytics dashboard.

Possible evaluation targets include:

- CTR / impressions
- Browse and Suggested reach
- opening retention
- average percentage viewed / average view duration
- subscriber conversion
- search performance
- related-video / end-screen routing
- playlist contribution
- community / launch response
- experiment-specific target metrics

Support checkpoint windows such as `1h`, `6h`, `24h`, `72h`, `7d` and longer windows when appropriate. Evaluation results link back to the exact published asset identities and then feed governed learning.

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
7. Publishing Package, Publisher and Video Manager handoffs.
8. Publish Readiness and Launch/Priming connections.
9. Experiment variants and Outcome/Evaluation attribution.
10. Learning candidates and removal of superseded direct cross-tool blob/prefill pathways only after parity tests.

## Acceptance tests

- A widget insight can become a project asset with the exact evidence IDs preserved.
- A Brain-generated script can be handed to Projects → Storyboard → Editor without re-entry or lost provenance.
- A Vault image can be handed to Community or Editor with one stable asset identity.
- A title/thumbnail variant can be identified later as the actually used version and evaluated against valid metrics.
- A Publishing Package contains the approved YouTube-facing metadata, routing, scheduling, audience, language/caption and card configuration for its video.
- Publish Readiness detects missing or unresolved requirements without creating duplicate metadata.
- Launch/Priming, Experiment and Evaluation systems reference the same canonical video/package assets.
- A tool receiving an ActionPacket can resolve the underlying Vault asset and its lineage.
- Missing evidence remains missing; the Asset Engine never fabricates evidence.
- Publishing, destructive edits and consequential external communication remain approval-gated.

## Implementation status

Phase A foundation is implemented on the integration branch with `src/services/assetEngine.ts`. It wraps the existing generation, Vault and ActionPacket systems instead of creating a competing store or transport layer.

The Publishing Package, SEO/Entity Intelligence, Publish Readiness, Launch/Priming, Experiment references and Post-Publish Evaluation Contract are now defined as canonical architecture requirements. Their UI and service-schema implementation remains part of the next integration phases.
