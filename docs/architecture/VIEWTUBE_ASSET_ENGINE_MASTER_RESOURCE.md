# ViewTube Asset Engine — Master Resource & Reference

**Status:** Canonical architecture / product reference  
**Date:** 2026-09-20  
**Scope:** Asset Engine, ContentBuild, Video Package, creator assets, generation, provenance, variants, publishing, handoffs, frontend manifestations, post-publish learning

## 1. Purpose

The **ViewTube Asset Engine** is the canonical creator-facing system for creating, organizing, generating, versioning, comparing, selecting, packaging, handing off, retrieving, publishing, and evaluating all durable work associated with a piece of content.

It is not merely:

- a file manager,
- a Vault browser,
- an AI generator,
- a publishing checklist,
- a metadata editor,
- or a media gallery.

It is the **content-production substrate and connective facade** that lets all ViewTube creator workflows operate on one durable content identity without passing anonymous blobs or creating disconnected copies.

The central product rule is:

> **A Project, Video Package, Asset Engine workspace, Vault collection, editor project, publishing package, and eventually the published YouTube video are manifestations of the same ContentBuild.**

The representation may change. The identity, selected assets, provenance, package state, and outcome attribution must not.

---

## 2. Relationship to existing canonical ownership

This document expands the existing `docs/brain/ASSET_ENGINE_CANONICAL_BACKBONE.md`. It does not replace the ownership boundaries already established there.

Canonical ownership remains:

- **BrainRuntime** — reasoning, routing, context/evidence planning, orchestration.
- **analytics-canon** — normalized analytical evidence.
- **Channel Profile** — durable creator/channel knowledge.
- **Projects** — project-management state, workflow planning, tasks, scheduling, notes.
- **Vault** — canonical artifact identity, durable media/artifact persistence, provenance storage.
- **Asset Engine** — canonical creator-facing content-production graph/facade that resolves, creates, versions, selects, packages, and hands off those artifacts under one ContentBuild identity.
- **ActionPacket / Handoff** — cross-tool work transport.
- **Outcome / Evaluation** — measured results.
- **Learning** — governed promotion of observations into durable knowledge.

The Asset Engine therefore does **not** create a competing file store, project store, analytics store, or Brain store. It coordinates them through stable identities and relationships.

---

## 3. The ContentBuild principle

A ContentBuild is the durable identity of a creator workstream.

Example:

```text
CB-037
Napoleon — The Last Charge
```

Every relevant ViewTube surface should resolve to that same ID.

A conceptual structure is:

```ts
ContentBuild {
  id
  identity
  concept

  evidence
  research
  intelligence

  assets
  variants
  selections

  narrative
  storyboard
  media

  publishingPackage
  launchPackage

  experiments
  outcomes
  findings

  workflowState
  readiness
  provenance

  createdAt
  updatedAt
}
```

This is an architectural model, not a requirement that all fields live in one physical database row. Individual domains may remain owned by their canonical services.

The invariant is:

> **one ContentBuild identity across every manifestation and handoff.**

---

## 4. What counts as an Asset Engine asset

An Asset Engine asset is broader than a traditional file.

### Creative assets

Examples:

- concept drafts,
- outlines,
- hooks,
- scripts,
- scene plans,
- storyboards,
- images,
- illustrations,
- photographs,
- video clips,
- Shorts clips,
- voiceovers,
- music,
- sound effects,
- audio mixes,
- SVG compositions,
- Remotion compositions,
- text compositions,
- thumbnail candidates,
- title candidates.

### Publishing/package assets

Examples:

- selected title,
- selected thumbnail,
- description,
- tags,
- category,
- chapters,
- timestamps,
- education questions,
- captions/subtitles,
- playlist choice,
- related video choice,
- cards,
- end-screen layout,
- end-screen destinations,
- visibility,
- publish date/time,
- language settings,
- pinned comment,
- community posts,
- launch assets.

### Knowledge/evidence assets

Examples:

- research sources,
- source excerpts,
- audience findings,
- search findings,
- packaging findings,
- thumbnail intelligence,
- historical channel performance evidence,
- experiment hypotheses,
- experiment results,
- post-publish findings,
- creator instructions,
- AI generation context,
- recommendations converted into durable work.

Not every analytical explanation needs to become an asset. Durable, reusable, editable, transportable, publishable, or evaluable work should.

---

## 5. Canonical asset identity

Every durable asset should have a stable identity rather than relying only on filename, URL, component state, or array index.

Conceptual record:

```ts
AssetRecord {
  id
  contentBuildId

  assetType
  subtype
  format

  title
  description

  state
  status

  version
  variantGroupId
  parentAssetIds[]

  source
  provenance

  generatedBy
  generationRecordId

  storageLocation
  previewLocation

  metadata
  dimensions
  duration
  aspectRatio

  evidenceIds[]
  intelligenceIds[]

  isSelected
  isFinal
  isArchived

  createdAt
  updatedAt
}
```

The exact implementation may remain split between Asset Engine, Vault, generation records, Projects, Publishing Package, and other canonical stores.

---

## 6. Asset lineage and provenance

The Asset Engine must preserve where an asset came from and how it relates to other work.

Example:

```text
Research Set 03
      ↓
Script V6
      ↓
Title V4
      ↓
Thumbnail Variant B2
      ↓
Final Thumbnail
      ↓
Published Video
      ↓
CTR / Browse / Suggested outcomes
```

Relationships may include:

- derived-from,
- generated-from,
- edited-from,
- supports,
- used-by,
- selected-as,
- published-as,
- belongs-to,
- adapted-from,
- forked-from,
- evaluated-by,
- resulted-in.

A single asset may have multiple parents.

### AI-generated asset provenance

Where available, preserve:

- source tool,
- generation record ID,
- model/pipeline identity,
- generation time,
- creator instructions,
- ContentBuild ID,
- parent asset IDs,
- evidence IDs,
- selected title/script/context,
- channel/audience context,
- later creator edits.

### Uploaded asset provenance

Preserve:

- original filename,
- upload/import source,
- checksum when available,
- original dimensions,
- file type,
- creation/import time,
- owning ContentBuild/project scope.

---

## 7. Versions and variants are different

The Asset Engine must distinguish **versions** from **variants**.

### Version

A version is a revision of the same direction.

```text
Script V1
→ Script V2
→ Script V3
→ Script V6 FINAL
```

### Variant

A variant is an alternative direction.

```text
Thumbnail A — portrait
Thumbnail B — cavalry
Thumbnail C — map
Thumbnail D — eyewitness
Thumbnail E — silhouette
```

Each variant may itself have versions:

```text
Thumbnail B
├── B1
├── B2
└── B3 FINAL
```

The data model and UI must preserve both concepts.

---

## 8. Selection and finalization

Creation does not imply approval.

A common lifecycle is:

```text
Missing
→ Draft
→ Generated
→ Candidate
→ Edited
→ Selected
→ Approved
→ Final
→ Published
→ Archived
```

Not every asset type needs every state.

The system must explicitly know which candidate is selected/final.

Example:

```text
selectedTitle       = title-v4
selectedThumbnail   = null
selectedScript      = script-v6
selectedNarration   = narration-v2
```

A final selection in one manifestation must propagate everywhere that consumes that asset.

---

## 9. Standard Asset Engine path

The standard durable creator-work path is:

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

Direct ephemeral values remain acceptable inside one deterministic function or UI component. They must not become the durable cross-tool contract.

---

# Backend Reference

## 10. Backend responsibility map

The Asset Engine backend should be composed of cooperating modules/services rather than one monolithic service.

| Area | Responsibility |
|---|---|
| **ContentBuild coordination** | Resolve the shared build identity and domain relationships |
| **Asset Registry** | Create, resolve, update, classify, archive and query durable asset records |
| **Version / Variant service** | Lineage, branches, alternatives, selected/final state |
| **Vault adapter** | Durable artifact identity/storage integration |
| **Generation service** | Generation records, job state, generated asset attachment |
| **Context Resolver** | Build the relevant context package for a destination tool |
| **Provenance service** | Preserve source, parents, generation, edits and evidence |
| **Evidence linker** | Associate research/evidence identities with durable work |
| **Intelligence linker** | Connect audience, SEO, packaging and historical findings |
| **Workflow service** | Stage state, dependencies, blockers, transitions |
| **Readiness engine** | Validate completion without duplicating source data |
| **Publishing Package service** | YouTube-facing metadata/configuration |
| **Launch Package service** | Community, priming, launch and sustain assets |
| **Experiment integration** | Reference exact variants used in tests |
| **Analytics linker** | Connect the published video and outcomes to exact assets |
| **Search/index service** | Structured + semantic retrieval |
| **Event system** | Broadcast canonical state changes |
| **Handoff service** | ActionPacket-based cross-tool transport |

These may remain modules inside the current application architecture. This document does not require microservices.

---

## 11. Current service contract

The existing canonical Asset Engine service is:

```text
src/services/assetEngine.ts
```

Public creator workflows should converge on:

- `resolveAssets(...)`
- `createAsset(...)`
- `handoffAsset(...)`
- `createAndHandoffAsset(...)`
- `getAssetLineage(...)`

Existing generation, Vault, ActionPacket, workflow, Brain handoff, and tool-chain infrastructure remains valid lower-level infrastructure and should be reused rather than duplicated.

---

## 12. Generation requests

The Asset Engine should standardize generation around an explicit request object.

Conceptually:

```ts
GenerationRequest {
  contentBuildId

  requestedAsset: {
    type
    quantity
    format
  }

  currentContext: {
    concept
    selectedScript
    selectedTitle
    research
    storyboard
    existingVisuals
    existingVariants
  }

  creatorContext: {
    channelProfile
    audienceProfile
    stylePreferences
    historicalPerformance
  }

  intelligence: {
    packagingFindings
    thumbnailFindings
    searchFindings
    audienceFindings
  }

  destination
  requestedAction
}
```

Example:

```text
Generate 5 thumbnail directions
using:
CB-037
Script V6
Title V4
12 research sources
27 visual assets
audience profile
thumbnail intelligence
```

The receiving tool generates candidates and attaches them back to the same ContentBuild as versioned/variant assets.

---

## 13. Context Resolver

The Context Resolver determines what a tool needs to know without dumping the entire ContentBuild into every operation.

### Thumbnail Studio may receive

- concept,
- selected script,
- selected title,
- audience profile,
- relevant research,
- visual assets,
- existing thumbnails,
- thumbnail performance history,
- packaging intelligence.

### Script Engine may receive

- concept,
- evidence/research,
- audience,
- prior script versions,
- creator voice/style,
- related channel knowledge.

### Community composer may receive

- final title,
- selected thumbnail,
- script summary,
- publish time,
- launch strategy,
- audience context.

The principle is:

> **Complete enough context for the task, scoped enough to remain understandable and efficient.**

---

## 14. Brain relationship

The Brain does not become the asset store.

The Asset Engine does not become the reasoning engine.

The Brain:

- reasons over ContentBuild state,
- selects evidence,
- produces recommendations,
- identifies missing work,
- proposes actions,
- helps prepare GenerationRequests.

The Asset Engine:

- creates/resolves durable work,
- preserves identity and provenance,
- attaches outputs,
- manages variants/selections,
- exposes current state,
- carries work across tools,
- links later outcomes.

Consequential recommendations should retain stable recommendation identity; when converted into durable creator work, the resulting work enters the Asset Engine.

---

## 15. Workflow state

The Asset Engine should understand the production lifecycle without forcing creators through a rigid wizard.

Recommended lifecycle:

```text
IDEA
→ RESEARCH
→ SCRIPT
→ STORYBOARD
→ MEDIA
→ PACKAGE
→ EDIT
→ PUBLISH
→ LAUNCH
→ LEARN
```

Creators may move non-linearly.

The engine should understand dependencies such as:

- captions may require a sufficiently final edit,
- analytics evaluation requires publication,
- experiment results require real exposure,
- thumbnail generation benefits from sufficient narrative/package context,
- publishing requires approved package fields.

---

## 16. Readiness Engine

Readiness is a derived validation layer, never a second store.

Example:

```text
READY 11 / 13

Title                 ✓
Thumbnail             !
Description           ✓
Tags                  ✓
Category              ✓
Chapters              ✓
Education questions   ✓
End screen            ✓
Related video         ✓
Playlist              ✓
Pinned comment        ✓
Community posts       ✓
Captions              !
```

It should distinguish:

- complete,
- incomplete,
- blocked,
- warning,
- unavailable/not-yet-applicable.

It should explain **why** a build is not ready and provide a direct contextual action.

Format-specific rules should be supported for Long, Short, Live, and future formats.

---

## 17. Publishing Package

Every video ContentBuild should expose one canonical Publishing Package consumed by Projects, Asset Engine, Video Manager, and Publisher.

### Packaging

- title,
- thumbnail,
- title variants,
- thumbnail variants,
- selected/final variants.

### Metadata

- description,
- tags,
- category,
- chapters/timestamps,
- education questions where required,
- audience setting,
- language,
- title/description language,
- caption/subtitle state and linked asset.

### Discovery / routing

- end-screen layout,
- end-screen links,
- related video,
- playlists,
- cards,
- card destinations.

### Publishing

- date/time,
- timezone,
- visibility,
- scheduling,
- Premiere configuration where supported.

### Audience activation

- pinned comment,
- community posts.

The final package must preserve what was actually sent to YouTube.

---

## 18. SEO and Entity Intelligence

SEO/entity intelligence feeds the Publishing Package but is not itself the publishing form.

It may include:

- primary topic,
- topical entities,
- target queries/search concepts,
- audience vocabulary,
- script entities,
- historical metadata evidence,
- title/description/tag recommendations,
- evidence and confidence.

Approved outputs can become package assets while retaining provenance.

---

## 19. Launch / Priming Package

Launch work remains connected to the same ContentBuild.

Possible assets:

- pre-publish community post,
- launch post,
- teaser Short,
- pinned-comment strategy,
- early post-launch actions,
- sustain actions,
- timing/dependency relationships.

These remain individually identifiable assets.

---

## 20. Experiment integration

Experiments should reference exact Asset Engine identities.

Examples:

- title A/B,
- thumbnail A/B,
- title × thumbnail combinations,
- publish-time tests,
- metadata/discovery strategy tests,
- launch/priming tests.

Store:

- hypothesis,
- variants,
- selected/used assets,
- comparison window,
- target metrics,
- confidence/result,
- final outcome.

The Publishing Package must identify which variant was actually published.

---

## 21. Post-publish evaluation

The ContentBuild survives publication.

Before publishing, it may carry an evaluation contract such as:

- CTR/impressions,
- Browse/Suggested reach,
- opening retention,
- AVP/AVD,
- subscriber conversion,
- search performance,
- end-screen/related-video routing,
- playlist contribution,
- launch/community response,
- experiment metrics.

Possible checkpoints:

```text
1h
6h
24h
72h
7d
28d
90d
```

Results must link back to the exact title, thumbnail, package, launch assets, and variants that were actually used.

---

## 22. Event-driven synchronization

Important Asset Engine changes should emit events rather than relying on manual multi-screen synchronization.

Conceptual events:

```text
asset.created
asset.updated
asset.archived

variant.created
asset.selected
asset.finalized

generation.started
generation.completed
generation.failed

build.stageChanged
build.readinessChanged

publishingPackage.updated

video.published

analytics.received
experiment.completed
```

Example:

```text
thumbnail V3 selected
        ↓
asset.selected
        ↓
Project manifestation updates
Asset Engine widget updates
Publisher updates
Readiness recalculates
Experiment builder updates
Vault state updates
```

---

## 23. Storage model

The Asset Engine coordinates identity and relationships. Large binary media should remain in the appropriate durable storage/Vault layer.

```text
Asset Engine relationship/state
           ↓
Canonical Vault artifact identity
           ↓
Storage object / media URL / generated artifact
```

UI actions should distinguish:

- hide,
- archive,
- detach from build,
- delete record,
- delete underlying media.

Destructive operations remain approval-gated.

---

## 24. Search and retrieval

The Asset Engine should support structured and semantic retrieval.

### Structured

- all thumbnails,
- all final assets,
- all 9:16 visuals,
- all assets in CB-037,
- all generated assets from Thumbnail Studio,
- all assets missing a final selection,
- all published variants,
- all assets with missing provenance.

### Semantic

Examples:

- “dramatic cavalry images”
- “research about Davout”
- “thumbnails with Napoleon facing left”
- “assets used in my best-performing history videos”

Search should resolve canonical assets rather than create duplicate indexes of ownership.

---

## 25. Duplicate and similarity handling

Where practical, the system should identify:

- exact duplicate,
- derived asset,
- probable duplicate,
- visually/semantically similar asset,
- new asset.

Signals may include:

- file hash,
- parent lineage,
- generation record,
- metadata,
- semantic similarity.

Similarity does not imply automatic deletion.

---

# Frontend Reference

## 26. The Asset Engine is not one screen

The frontend should expose different **manifestations** of the same ContentBuild depending on context.

The user should not encounter separate competing copies of:

- Project data,
- Asset Engine data,
- Video Package data,
- Vault package data,
- Publisher package data.

Each UI is a renderer/operator over the same canonical identities.

---

## 27. Dashboard Asset Engine

The dashboard manifestation should answer:

> **What is happening with this ContentBuild, and what should I do next?**

It should prioritize:

- ContentBuild identity,
- current stage,
- readiness,
- selected/final assets,
- blockers,
- next useful action,
- direct contextual handoffs.

The dashboard should not become a miniature Studio Hub.

---

## 28. Studio Hub Asset Engine

The Studio manifestation is the expanded operating environment.

Recommended major sections:

- Overview,
- Assets,
- Generation,
- Variants,
- Lineage,
- Publishing Package,
- Launch Package,
- Experiments,
- Evaluation,
- History.

Dashboard and Studio share backend contracts but use their appropriate ViewTube UI systems.

---

# 15 Canonical Frontend Manifestations

## 29. Manifestation 01 — Content Build Command Module

Purpose: high-level command center.

It should answer:

- What am I making?
- What exists?
- What is complete?
- What is blocked?
- What comes next?

Core visual:

```text
             84%
          BUILD READY

IDEA       ✓
RESEARCH   ✓
SCRIPT     ✓
MEDIA      ✓
PACKAGE    !
EDIT       →
PUBLISH    →
LEARN      →
```

The central component must be operational, not merely descriptive.

---

## 30. Manifestation 02 — Adaptive Presence Package

Purpose: dynamically prioritize the domains that matter now.

Examples:

- final script can compress,
- unresolved thumbnail becomes prominent,
- missing captions appear when they become relevant,
- complete metadata recedes,
- new generated variants can temporarily expand.

The layout should communicate work priority through composition, not just colored badges.

---

## 31. Manifestation 03 — Vault Asset Manifestation

Purpose: asset-first browsing and inspection.

Asset geometry should represent real media:

- thumbnail: 16:9,
- vertical video/Short: 9:16,
- square/social: 1:1,
- portrait: 4:5,
- script/document: document representation,
- audio: waveform,
- video: preview + duration,
- Remotion/SVG: preview frame + motion metadata,
- metadata: structured package module.

Each asset should expose:

- type,
- state,
- version,
- selection/final state,
- provenance,
- lineage,
- contextual actions.

---

## 32. Manifestation 04 — Micro Package Strip

Purpose: portable compact representation of a ContentBuild.

Use in:

- Kanban,
- Calendar,
- Video Manager,
- Editor,
- Publisher,
- Vault,
- search results,
- Brain recommendations,
- recent builds.

Example:

```text
[37] NAPOLEON — LAST CHARGE
SCRIPT V6 ✓ | THUMB 5 ! | META ✓ | PUB 11/13 | 84%
```

It is a renderer, not another data model.

---

## 33. Manifestation 05 — Tool Launcher / Generation Handoff

Purpose: open specialized tools with resolved ContentBuild context.

Example:

```text
OPEN THUMBNAIL STUDIO

with:
CB-037
Script V6
Title V4
Audience Profile
12 Research Sources
27 Visual Assets
Existing Thumbnail Variants
Packaging Intelligence
```

Outputs return to the same ContentBuild automatically.

---

## 34. Manifestation 06 — One-Touch Generation Console

Purpose: quickly create missing or useful assets.

Possible actions:

- Generate 5 thumbnails,
- Generate 10 titles,
- Create description,
- Create chapters,
- Create captions,
- Create 3 community posts,
- Create Shorts directions,
- Generate storyboard,
- Generate scene imagery,
- Generate narration,
- Generate music directions.

The user should be able to inspect the context supplied before generation.

---

## 35. Manifestation 07 — Pipeline Rail

Purpose: visualize the content lifecycle and allow stage-level inspection.

Each stage should expose:

- assets,
- state,
- blockers,
- requirements,
- outputs,
- tools,
- next transitions.

The rail is operational navigation, not decoration.

---

## 36. Manifestation 08 — Asset Graph / Neural Map

Purpose: expose relationships and lineage.

Graph relationships may show:

```text
Research
   ↓
Script V6
 /       \
Title V4  Scene 12
   ↓        ↓
Thumb V3  Image 27
   \       /
    Package
```

Useful relations include:

- generated-from,
- derived-from,
- supports,
- used-by,
- selected-as,
- published-as,
- evaluated-by.

---

## 37. Manifestation 09 — Inspector / Property Sheet

Purpose: precise advanced inspection/editing.

For an asset, expose:

- identity,
- type/subtype,
- format,
- version,
- variant group,
- state,
- selected/final state,
- dimensions,
- aspect ratio,
- duration,
- parent assets,
- generation record,
- evidence,
- source tool,
- storage reference,
- created/updated time,
- published usage.

---

## 38. Manifestation 10 — Package Matrix

Purpose: dense package management.

Example:

| Asset | State | Variants | Selected | Evidence | Destination |
|---|---|---:|---|---|---|
| Thumbnail | Action | 5 | — | Audience + visuals | Thumbnail Studio |
| Title | Ready | 8 | V4 | Search + audience | Title Lab |
| Script | Ready | 6 | V6 | Research | Script Engine |
| Captions | Missing | 0 | — | Final edit | Caption Tool |

This is especially appropriate for the expanded Studio environment.

---

## 39. Manifestation 11 — Readiness Board

Purpose: turn build state into actionable completion information.

Example:

```text
84% READY

BLOCKERS

THUMBNAIL
5 variants exist
→ SELECT FINAL

CAPTIONS
Not generated
→ CREATE FROM FINAL EDIT
```

A blocker should route directly to the correct tool/action with context.

---

## 40. Manifestation 12 — Creator Cockpit

Purpose: broad operating picture.

Recommended four-part model:

```text
CREATE
Narrative + Media

PACKAGE
Title + Thumbnail + Metadata

PUBLISH
Schedule + YouTube Configuration

LEARN
Experiments + Analytics + Findings
```

This is a strong candidate for the expanded Studio Asset Engine default.

---

## 41. Manifestation 13 — Variant Stack / Version Laboratory

Purpose: compare alternatives and revision history.

Per variant/version, show as appropriate:

- visual/text/audio preview,
- version,
- parent,
- generation origin,
- evidence,
- creator edits,
- recommendation context,
- selection state,
- final state.

The layout should adapt to asset type.

---

## 42. Manifestation 14 — Contextual Action Deck

Purpose: answer:

> **What useful things can I do to this ContentBuild right now?**

Actions should be derived from real state.

Example:

```text
NEXT BEST ACTION
Select final thumbnail

QUICK GENERATION
Generate 5 more directions

PREPARE
Create captions

EXPERIMENT
Build title × thumbnail test
```

Avoid hardcoded recommendations where the underlying state can determine the action.

---

## 43. Manifestation 15 — Universal ContentBuild Object

Purpose: formalize the fact that one ContentBuild can have many UI representations.

Supported representation modes may include:

- Micro,
- Card,
- Widget,
- Toolbox,
- Inspector,
- Matrix,
- Vault,
- Pipeline,
- Graph,
- Cockpit.

The representation changes. The canonical object does not.

---

# Frontend Interaction Rules

## 44. Contextual actions

Selecting an asset should expose actions relevant to its type and state.

### Thumbnail

- Preview,
- Compare,
- Set Final,
- Generate Variant,
- Edit,
- Send to Editor,
- View Provenance,
- View Parent Assets,
- Attach to Experiment,
- Archive.

### Script

- Open,
- Revise,
- Generate Variant,
- Compare Versions,
- Extract Scenes,
- Generate Storyboard,
- Generate Visuals,
- View Sources,
- Set Final.

### Entire ContentBuild

- Open Asset Engine,
- Generate Missing Assets,
- Check Readiness,
- Open Publisher,
- Open Editor,
- Build Experiment,
- Archive Build.

---

## 45. Drag and drop

Meaningful drag/drop behavior should manipulate canonical references and relationships.

Examples:

- image → storyboard scene = attach asset,
- thumbnail → final slot = select/finalize,
- asset → another ContentBuild = reference/fork/copy according to explicit action,
- media → Editor = handoff/import canonical asset,
- research → Script Engine = add to generation context,
- title + thumbnail → Experiment Builder = create combination.

Avoid silent unnecessary duplication.

---

## 46. Asset states

Common UI states may include:

- EMPTY,
- DRAFT,
- GENERATING,
- READY,
- CANDIDATE,
- SELECTED,
- FINAL,
- BLOCKED,
- STALE,
- MISSING,
- FAILED,
- ARCHIVED,
- PUBLISHED.

State must be communicated with text/icon/pattern semantics, not color alone.

---

# ViewTube UI / Design System Rules

## 47. Dashboard widget implementation

The dashboard version must use the canonical ViewTube widget system.

Required principles:

- standard WidgetShell,
- colored header and left icon rail meeting the outer edge,
- no third decorative strip,
- title-derived shadow,
- 4px shell / 3px module / 2px control hierarchy where applicable,
- 24px dashboard grid,
- standard widget primitives for generic controls,
- custom compound components for domain-specific operations,
- bounded explicit scroll areas,
- no arbitrary generic SaaS visual language.

Custom Asset Engine components are expected for:

- asset previews,
- variant stacks,
- provenance graphs,
- pipeline nodes,
- generation context,
- readiness visualization,
- lineage,
- package matrix,
- media selectors.

---

## 48. Studio implementation

The Studio Hub manifestation must use the canonical Toolbox / Subtoolbox system.

The Asset Engine should not render dashboard widget primitives inside Studio as a substitute for Toolbox primitives.

Use the canonical structural hierarchy and current implementation authority:

- T0 Toolbox,
- L0 Subtoolbox,
- L1 interior,
- L2 dense controls,
- canonical split controls,
- bounded text/media regions,
- inherited accent color,
- responsive Toolbox recipes.

---

## 49. Media geometry

Preview geometry should communicate asset type.

- 16:9 — thumbnails / landscape video,
- 9:16 — Shorts / portrait media,
- 1:1 — square media,
- 4:5 — portrait social media,
- waveform — audio,
- document sheet — scripts/research/text,
- preview frame — SVG/Remotion/motion compositions,
- structured panel — metadata/package objects.

Avoid rendering every asset as the same generic rectangle.

---

## 50. Mobile behavior

The Asset Engine must follow the ViewTube mobile contracts.

On phone:

- top-level dashboard widgets become full width,
- internal grids collapse deterministically,
- nested grid/flex children use `min-width: 0`,
- flexible tracks use `minmax(0, 1fr)`,
- wide matrices/tables use bounded internal scrolling,
- headers never become the scroll region,
- widget height remains controlled by the registered bucket,
- module titles wrap instead of becoming unreadably small,
- the most important state appears first.

The mobile Content Build Command view should prioritize:

1. identity,
2. readiness,
3. current blocker,
4. next action,
5. secondary intelligence.

---

# Cross-System Integration

## 51. Projects

Projects are the planning/work-management manifestation of a ContentBuild.

Projects may own:

- tasks,
- notes,
- assignments,
- deadlines,
- planning,
- calendar/schedule state,
- workflow coordination.

Durable creator artifacts such as script, thumbnail, title, media, and publishing package should resolve through the Asset Engine/Vault contracts rather than remain permanently duplicated as project-local copies.

Legacy project fields may remain during migration through compatibility adapters.

---

## 52. Vault

Vault is not replaced by the Asset Engine.

Vault owns durable artifact identity/storage/provenance infrastructure.

The Asset Engine adds creator-work meaning:

- why the asset exists,
- which ContentBuild it belongs to,
- what generated it,
- which variant/version it is,
- whether it is selected/final,
- what depends on it,
- where it was used,
- what outcome followed.

The Vault manifestation specializes in browsing, previewing, filtering, retrieving, organizing, and reuse.

---

## 53. Editor

The Editor should consume canonical Asset Engine/Vault references where possible.

Example:

```text
Scene 08
→ Image Asset 017
→ Narration Segment 08
→ Motion Composition 04
```

Assets generated from inside the Editor should still be registered under the same ContentBuild rather than becoming editor-only files.

---

## 54. Publisher and Video Manager

Publisher operates the canonical Publishing Package.

Video Manager operates the uploaded/published video manifestation.

After publication:

```text
ContentBuild CB-037
        ↓
YouTube Video ID XYZ
```

Analytics can then be attributed back to the exact published assets and variants.

---

## 55. Analytics and learning loop

The Asset Engine closes the loop between creative choices and outcomes.

```text
CONCEPT
   ↓
RESEARCH
   ↓
CREATE
   ↓
PACKAGE
   ↓
PUBLISH
   ↓
MEASURE
   ↓
LEARN
   ↓
BRAIN
   ↓
NEXT CONTENTBUILD
```

This lets ViewTube retain facts such as:

- which thumbnail was published,
- which title was published,
- which experiment ran,
- what traffic sources responded,
- what CTR/retention/subscriber outcomes followed,
- what finding became reusable evidence.

---

# Product Experience

## 56. What the Asset Engine should feel like

A creator should be able to open a ContentBuild and understand:

```text
Here is the concept.

Here is the research.

Here is the final script and its older versions.

Here are the scenes.

Here are all visual and audio assets.

Here are the thumbnails and why they were created.

Here are the titles and which one is final.

Here is the complete publishing package.

Here are the missing pieces.

Here is what I should do next.

Here is what the Brain knows about this build.

Here is where each asset came from.

Here is what was actually published.

Here is what happened after publication.

Here is what ViewTube learned.
```

The Asset Engine should make the entire video/package feel like **one living object** rather than a collection of disconnected tools and files.

---

# Implementation Rules

## 57. Non-negotiable architectural rules

1. One durable `contentBuildId` follows the work through all major systems.
2. Tools must not create their own permanent parallel asset universes.
3. Durable cross-tool work receives stable asset identity.
4. Vault remains the canonical durable artifact/storage/provenance layer.
5. Brain remains the reasoning/orchestration layer.
6. Projects remain the planning/work-management owner.
7. ActionPacket/Handoff remains the transport contract.
8. Versions and variants are modeled separately.
9. Generated candidates never silently become final.
10. Final/selected state propagates to all manifestations.
11. Readiness is derived; it does not duplicate package data.
12. Publishing Package is one canonical package consumed by all publishing surfaces.
13. Experiments reference exact asset identities.
14. Published outcomes link back to the exact assets actually used.
15. Frontend manifestations share identity/state but may use different compositions appropriate to their location.
16. Dashboard and Studio use their respective canonical UI systems.
17. Asset-specific custom compound components are encouraged where generic primitives cannot communicate the workflow.
18. Mobile behavior follows the ViewTube widget/Toolbox contracts.
19. Missing evidence remains missing; no system fabricates provenance or evidence.
20. Destructive and external publishing actions remain approval-gated.

---

## 58. Migration direction

Recommended migration sequence:

1. Normalize ContentBuild identity resolution.
2. Move durable Brain creation actions through Asset Engine contracts.
3. Normalize project-to-asset relationships.
4. Connect Script/Hook/Thumbnail/Community/Metadata generators.
5. Connect storyboard/media generation.
6. Connect Editor handoffs.
7. Consolidate Publishing Package consumption.
8. Implement Readiness and Launch Package against canonical fields.
9. Attach experiment variants.
10. Attach published video identity.
11. Link Outcome/Evaluation.
12. Feed governed findings into Learning/Brain.
13. Remove superseded duplicate blob/prefill pathways only after parity tests.

---

## 59. Acceptance criteria

The Asset Engine architecture is functioning when all of the following are true:

- One ContentBuild can be opened from Projects, Dashboard, Studio, Vault, Editor, Publisher, and Video Manager without losing identity.
- A Brain-created script can move through Projects → Storyboard → Editor with evidence/provenance intact.
- A Vault media asset can be reused without creating a second canonical identity.
- Generated thumbnail/title candidates form explicit variant groups.
- Selecting a final title/thumbnail updates all consuming manifestations.
- Publishing Package contains the approved YouTube-facing configuration.
- Readiness detects missing requirements without duplicating fields.
- A launch asset remains traceable to the ContentBuild.
- Experiments reference the exact variants being tested.
- The actually published asset identities are recorded.
- Post-publish analytics can be attributed to those identities.
- The Brain can later use evaluated outcomes as governed evidence.
- Dashboard and Studio present different compositions without creating different backend truth.
- Mobile compositions preserve the same operational capability with deterministic responsive behavior.

---

## 60. Existing implementation and related authority

Current implementation and architecture references include:

- `src/services/assetEngine.ts` — canonical Asset Engine service facade.
- `docs/brain/ASSET_ENGINE_CANONICAL_BACKBONE.md` — canonical cross-system workflow and ownership contract.
- `src/components/projects/ContentAssetEngine.tsx` — current Projects manifestation.
- `src/views/dashboard/widgets/VideoAssetEngineWidget.tsx` — current dashboard manifestation.
- `docs/architecture/VIDEO_ASSET_ENGINE_WIDGET_IDEAS_2026-09-20.md` — dashboard widget idea consolidation.
- `src/views/dashboard/WidgetRegistry.ts` — dashboard widget registration/help contract.
- `docs/architecture/VIEWTUBE_TOOLBOX_UI_MASTER_RESOURCE.md` — Studio Toolbox UI authority.
- `.claude/skills/viewtube-widget-dashboard-system/` — dashboard widget implementation/design authority.
- `.claude/skills/viewtube-ai-system-governor/` — AI ownership/integration authority.

This document should be treated as the **master product/system definition** for what the Asset Engine is intended to become. The lower-level backbone remains authoritative for cross-system ownership boundaries and current service contracts.
