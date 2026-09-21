# Asset Engine ContentBuild Spine — Implementation Plan

Date: 2026-09-20
Status: ACTIVE IMPLEMENTATION
Parent: docs/architecture/VIEWTUBE_ASSET_ENGINE_MASTER_RESOURCE.md

## Goal

Make the Asset Engine the durable lifecycle vehicle that lets every ViewTube tool operate on the same piece of content from first idea through creation, editing, publication, YouTube identity, analytics, community activity, experiments, mutations, evaluation and learning.

## Governing invariant

One piece of content = one ContentBuild identity = one durable history = many ViewTube manifestations.

Projects, tools, Vault, Editor, Video Package, Publisher, Video Manager, Analytics, Comment Responder and Brain may own different responsibilities. They must not create parallel identities for the same creator work.

## Current code reality

The repository already contains useful foundations:

- src/services/assetEngine.ts — durable asset creation, Vault ingestion, provenance/evidence metadata and ActionPacket handoff.
- src/services/video-package/contracts.ts — package status, strategy, creative artifacts, title/thumbnail variants, production assets, workflow, provenance and publishedVideoId.
- src/services/analytics/DataStore.ts — canonical video rows keyed by videoId plus broad metric coverage.
- src/services/brain/BrainWorkflowRecipes.ts — cross-tool workflow recipes.
- src/features/creator-engagement/useCommentResponderController.ts — typed YouTube comment/reply workflow.
- src/views/dashboard/widgets/VideoAssetEngineWidget.tsx — first dashboard Asset Engine manifestation.
- src/components/projects/ContentAssetEngine.tsx — Projects manifestation.

The missing layer is a durable ContentBuild lifecycle identity that joins these systems.

## Wave 0 — inventory and contract freeze

Audit each creator-facing tool for:

- current persistence owner,
- project/video identifiers,
- reads,
- writes,
- generated asset types,
- cross-tool payloads,
- external side effects,
- existing Vault/ActionPacket use.

Do not remove legacy pathways until parity is demonstrated.

Initial migration order:

1. Projects
2. Creator Canvas / idea tools
3. Research
4. Script Architect
5. Hook Generator
6. Storyboard
7. Thumbnail Studio
8. Packaging Lab
9. Visual / audio / video generation
10. Video Director
11. Editor
12. Publisher
13. Video Manager
14. Comment Responder
15. Analytics
16. Brain / Learning

## Wave 1 — ContentBuild spine

Implemented foundation on feature/asset-engine-contentbuild-spine:

- src/services/asset-engine/contracts.ts
- src/services/asset-engine/ContentBuildRepository.ts
- src/services/asset-engine/VideoPackageContentBuildBridge.ts

Responsibilities:

- stable contentBuildId,
- current projection,
- creative/strategy/style profile,
- lifecycle stage,
- asset membership,
- selected/final asset slots,
- asset relationships,
- YouTube binding,
- compatibility identity derived from legacy project/video scope.

The first repository adapter uses browser persistence for compatibility. The repository API is deliberately storage-agnostic so a server-authoritative implementation can replace it without changing callers.

## Wave 2 — append-only event history

Implemented foundation event families:

- build.created
- profile.updated
- stage.changed
- asset.created
- asset.attached
- asset.selected
- asset.finalized
- asset.relation.created
- handoff.created
- youtube.bound
- youtube.state.changed

Next event families:

- workflow step/blocker changes,
- editor timeline/render events,
- publish transaction receipts,
- YouTube remote-state diffs,
- analytics checkpoints,
- comments/replies,
- experiments,
- learning candidates.

The projection answers what is true now. The ledger answers what happened.

## Wave 3 — explicit asset graph

Implemented foundation:

- asset membership,
- selected/final slots,
- typed asset relationships,
- version/variant-ready event vocabulary,
- parent asset lineage from Asset Engine creation calls.

Next:

- first-class VariantGroup records,
- explicit version sequence records,
- final-selection receipts,
- migrate dashboard fuzzy package-slot discovery to explicit selections.

## Wave 4 — shared tool context SDK

Build ContentBuildToolContext and standard hooks/services.

Every compatible tool should receive:

- contentBuildId,
- subject/topic/niche,
- intention and audience promise,
- style and creative rules,
- strategy,
- current stage,
- relevant evidence,
- selected/final assets,
- relevant variants,
- workflow state.

Every tool should return a durable output receipt that attaches its work to the same ContentBuild.

First migration set:

- Creator Canvas
- Script Architect
- Hook Generator
- Thumbnail Studio
- Packaging Lab

This set is the first proof that several formerly separate tools can operate on one durable piece of content.

## Wave 5 — workflows and templates

Promote workflow definitions and workflow instances into ContentBuild-aware records.

Track:

- workflow definition/version,
- instantiated steps,
- dependencies,
- blockers,
- outputs,
- creator overrides,
- completed/failed/skipped state.

Template-derived work retains template ID/version in provenance.

## Wave 6 — production assets

Migrate Storyboard, image generation, audio, video generation, Video Director, Remotion and design assets.

All durable outputs become ContentBuild assets with lineage.

## Wave 7 — Editor

Carry contentBuildId into Editor project metadata.

Timeline clips retain Asset Engine IDs when available.

Final render becomes a canonical Asset Engine asset with lineage to timeline state and source assets.

## Wave 8 — Publisher transaction

Complete the real publishing sequence:

1. validate canonical package,
2. explicit approval,
3. resumable upload,
4. capture YouTube video ID,
5. bind ContentBuild to YouTube video,
6. apply metadata,
7. apply thumbnail,
8. apply captions,
9. apply playlists/routing,
10. apply schedule/privacy,
11. verify remote state,
12. record receipts.

A retry after a later-stage failure must not duplicate the uploaded video.

## Wave 9 — YouTube lifecycle

Maintain remote-state snapshots and emit diffs for:

- title,
- description,
- tags/category,
- thumbnail,
- visibility/status,
- playlists,
- captions,
- publishing/premiere state.

Changes performed outside ViewTube become historical events rather than disappearing.

## Wave 10 — analytics binding

Join ContentBuild to PublicationBinding.videoId to CanonicalVideoRow.videoId.

analytics-canon remains the metric source of truth.

Asset Engine stores identity links and historical checkpoint references for:

- 1h
- 6h
- 24h
- 72h
- 7d
- 28d
- 90d
- 365d
- lifetime

Metrics may include views, watch time, AVD, AVP, impressions, CTR, likes, comments, shares, subscriber gains/losses, revenue, RPM/CPM, traffic, search, retention, geography, audience, devices, cards, end screens and playlist behavior as supported by canonical analytics.

## Wave 11 — community binding

Attach Comment Responder observations/actions through videoId to contentBuildId.

Track supported comment, reply and moderation events. For YouTube Studio-only operations that cannot be programmatically verified, retain explicit manual-confirmation/intended state instead of claiming an API action occurred.

## Wave 12 — package mutation + experiments

Persist active intervals and history for:

- title replacements,
- thumbnail replacements,
- description/metadata changes,
- playlist/routing changes,
- visibility changes,
- experiment windows.

Experiments reference exact Asset Engine variants and valid measurement periods.

## Wave 13 — evaluation + Brain learning

Create ContentBuild evaluation packets combining:

- original intent/strategy,
- final creative assets,
- published package,
- package mutations,
- performance,
- traffic,
- retention,
- community response,
- subscriber conversion,
- revenue,
- experiment results.

Brain creates governed learning candidates. It does not rewrite historical truth.

## Wave 14 — complete frontend manifestations

Dashboard:

- Command Module
- Readiness
- Next Actions
- Micro Package
- performance pulse

Studio:

- Creator Cockpit
- Assets
- Workflow / Pipeline
- Variant Lab
- Inspector
- Matrix
- Graph
- Publishing
- YouTube state
- Analytics
- Community
- Experiments
- complete History

## Wave 15 — retire duplicate pathways

Only after parity:

- project-local duplicate content fields,
- permanent tool-local prefill blobs,
- fuzzy package-slot discovery,
- duplicate generated-output stores,
- direct durable cross-tool blobs.

## First vertical-slice acceptance test

Prove one real ContentBuild end to end:

One-sentence idea
→ Project
→ Script
→ Thumbnail
→ Editor
→ Final Render
→ Publisher
→ YouTube video ID
→ Analytics
→ Comments
→ Evaluation

At every stage, the same contentBuildId must be recoverable and its complete event history must remain queryable.
