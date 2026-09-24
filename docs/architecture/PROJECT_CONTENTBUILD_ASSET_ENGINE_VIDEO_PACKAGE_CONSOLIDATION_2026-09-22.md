# ViewTube Unified Project / ContentBuild / Video Package / Asset Engine Consolidation Authority

Date: 2026-09-22  
Status: Active implementation authority  
Branch: `integration/projects-contentbuild-asset-engine-video-package-2026-09-22`

## Final product rule

> **One Project on the surface. One ContentBuild identity underneath. Video Package specifies the video. Asset Engine creates and evolves its durable work. Specialized tools operate on that shared identity automatically.**

The creator should experience one continuous Project lifecycle:

```text
PLAN -> RESEARCH -> CREATE -> PACKAGE -> PUBLISH -> PROMOTE -> PERFORMANCE
```

The codebase may retain specialized internal systems, but ordinary creators should not be required to understand those system boundaries.

## Governing architecture rule

> **References may be repeated. Authority may not.**

A system may cache or project another system's identifier for convenience. It may not become a second source of truth.

Examples:

- Video Package may reference `selectedThumbnailAssetId`.
- ContentBuild / Asset Engine remains authoritative for the selected durable asset.
- Project may display ContentBuild stage.
- ContentBuild remains authoritative for lifecycle stage.
- Publish UI may display approved title/thumbnail/render.
- Approved Publish Snapshot freezes the exact assets that publication will execute.

## Canonical ownership matrix

| Concern | Canonical owner | Other systems may |
| --- | --- | --- |
| Project name, priority, target date, tasks, goals, notes | Project | Read/reference |
| Durable content identity | ContentBuild | Carry `contentBuildId` |
| Lifecycle stage | ContentBuild | Project maps/display |
| Asset membership | ContentBuild / Asset Engine | Reference |
| Artifact/media storage | Vault | Store Vault IDs |
| Asset versions | ContentBuild / Asset Engine | Reference/display |
| Asset options/variants | ContentBuild / Asset Engine | Reference/display |
| Selected/final asset identity | ContentBuild / Asset Engine | Project into package/UI |
| Structured video specification | Video Package | Link canonical assets |
| Publication configuration | Video Package + Publishing projection | Publisher executes |
| Publishing execution | PublishTransaction | Project displays status |
| YouTube binding | ContentBuild | Resolve through it |
| Analytics metric truth | Analytics Canon | ContentBuild records checkpoints/receipts |
| Reasoning / recommendations | BrainRuntime | Durable outputs return as assets/findings |
| Readiness | Derived Project projection | Never become an independent store |
| Next action | Derived Project application service | Brain may augment |

## Core identity invariant

Where each object exists:

```text
Project.contentBuildId
=
VideoPackage.contentBuildId
=
Asset.contentBuildId
=
EditorProject.contentBuildId
=
PublishTransaction.contentBuildId
=
YouTubeBinding.contentBuildId
=
Evaluation.contentBuildId
```

A mismatch is an error condition. ViewTube must never silently create or choose a second identity.

## Selection lifecycle

A selected asset is not automatically final.

```text
CANDIDATE -> SELECTED -> APPROVED -> FINAL -> PUBLISHED
```

Rules:

- Selection is reversible.
- Finalization is explicit.
- Artifact approval or an explicit finalization command may promote an asset to final.
- Publication freezes exact final selections in an immutable approved snapshot.
- A published selection receipt is immutable historical attribution.

## Backend responsibilities

### Project

Creator-facing planning and management:

- name;
- target date;
- priority;
- color;
- tasks;
- goals;
- notes;
- board/calendar state;
- creator-facing status.

Project is the primary object creators create, open, search, archive, publish and analyze.

### ContentBuild

Durable identity and lifecycle spine:

- stable identity;
- channel / Project association;
- lifecycle stage;
- asset membership;
- relations;
- versions;
- option groups;
- selections;
- workflow state;
- YouTube binding;
- event/history references.

Do not rename `contentBuildId` during consolidation. A later isolated migration may rename the engineering concept to ContentIdentity/ContentRecord.

### Video Package

Structured video specification:

- strategy;
- hooks;
- script/storyboard references;
- scenes;
- title options;
- thumbnail options;
- description/tags;
- production references;
- publishing configuration;
- workflow blockers/handoffs.

It references durable assets rather than becoming an independent asset-history database.

Creator-facing terminology should generally be **Video**, **Package** and **Publish**, not “Video Package.”

### Asset Engine

Application/domain service over ContentBuild + Vault + generation records.

It creates, versions, branches, relates, selects, finalizes and hands off durable work.

There is one Asset Engine backend with multiple manifestations:

- Project Simple Assets;
- Project Full Assets;
- Dashboard readiness/asset view;
- Studio advanced Asset workspace;
- Editor media manifestation;
- Publisher approved-assets manifestation;
- Analytics attribution manifestation.

These are views, never separate engines.

### Vault

Durable artifact/media identity and storage.

### Publishing Package

Derived projection of approved publication configuration. Not another database.

### Launch Package

Derived projection of launch/promotion configuration. Not another database.

### Project Workspace View

Creator-facing read model assembled from canonical owners. It is not a fifth store.

Initially build this projection on demand. Materialize/cache it only if profiling later proves necessary.

## Creator-facing vocabulary

| Engineering term | Creator-facing term |
| --- | --- |
| Project | Project |
| ContentBuild | Usually invisible |
| ContentBuild lifecycle | Progress |
| Video Package | Video / Package |
| Asset Engine | Assets |
| VariantGroup | Options |
| AssetVersion | Version |
| Lineage | History / Made from |
| Provenance | Created with / Source |
| GenerationRequest | Generate |
| ActionPacket / Handoff | Continue in / Open in |
| Publishing Package | Publish |
| Launch Package | Launch / Promote |
| Outcome Evaluation | Performance |
| Learning Candidate | Insight |

## Project Workspace information architecture

Normal creator navigation should converge toward:

```text
OVERVIEW
PLAN
CREATE
PACKAGE
PUBLISH
PERFORMANCE
```

with **ASSETS** as an advanced/utility workspace.

Inside CREATE:

```text
Research -> Write -> Storyboard -> Media -> Edit
```

Launch/Promote appears contextually when relevant.

Overview is the command surface:

```text
AUSTERLITZ
Long-form · Packaging
81% READY

SCRIPT         FINAL
THUMBNAIL      NEEDS SELECTION
FINAL VIDEO    FINAL
CAPTIONS       MISSING
PUBLISH        7 / 9 READY

NEXT
Choose Thumbnail

[ CONTINUE ]
```

Readiness and Continue route the creator to the correct subsystem without exposing its architecture.

## Command boundaries

Creator-facing UI should migrate away from arbitrary direct store mutation toward application commands such as:

```text
createProjectWorkspace
updateProjectPlan

saveVideoSpecification

attachAsset
createAssetVersion
createAssetOption
selectAsset
finalizeAsset

preparePublishingPackage
approvePublishingPackage

beginPublishTransaction
resumePublishTransaction

recordAnalyticsCheckpoint
recordEvaluation
```

Commands enforce identity, authority, validation and event history.

## Tool context architecture

Current ToolContext remains a useful lower-level foundation.

Build destination-specific Context Resolver recipes for:

- Script Architect;
- Storyboard Studio;
- Thumbnail Studio;
- Video Director;
- Editor;
- Publisher;
- Community / Launch.

Each recipe resolves only the context appropriate to the destination while preserving the same Project / ContentBuild scope.

## GenerationRequest

Generative tools should converge on a common contract containing:

- request ID;
- Project ID;
- ContentBuild ID;
- channel ID;
- tool ID;
- operation;
- target asset slot;
- create / new-option / new-version / transform mode;
- source asset IDs;
- evidence IDs;
- context snapshot/revision;
- creator intent;
- constraints;
- output specification;
- parent asset / option group when applicable;
- trace ID;
- requested timestamp.

## ToolReceipt

Every important specialist operation should record:

- request ID;
- Project ID;
- ContentBuild ID;
- tool ID;
- input asset IDs;
- output asset IDs;
- evidence IDs;
- generation record;
- created version IDs;
- option group;
- relationships;
- trace ID;
- timestamps.

Existing ContentBuild tool input/output event vocabulary should become the durable history for these receipts.

# Implementation program

## Wave 0 — Preserve donor work

Goal: no valuable branch work disappears during consolidation.

Maintain a capability ledger containing:

```text
branch
commit
capability
canonical owner
disposition
replacement
verification test
```

Dispositions:

- already-main;
- port;
- rewrite;
- superseded;
- archive.

Branch rules:

- PR #302 is already merged; current `main` is the Projects baseline.
- `feature/projects-contentbuild-workflow-authority-v2-2026-09-22` is now documentation/parity reference unless a fresh diff proves unique capability.
- `feature/asset-engine-contentbuild-spine` is a selective publishing donor only.
- `codex/feat/video-package-store-v1` is a storage/migration/recovery concept donor only.
- Older Projects / Asset Engine branches are capability-by-capability parity sources only.
- Never merge stale donors wholesale.

Exit gate: every unique capability has a known disposition.

## Wave 1 — Identity, authority and persistence hardening

Priority order:

1. enforce selected != final;
2. require canonical `contentBuildId` in normal package persistence;
3. reject Project / ContentBuild / channel scope mismatches;
4. guarantee one Video Package per Project + ContentBuild scope;
5. keep legacy identity fallback migration-only;
6. preserve malformed package data before repair;
7. introduce versioned repository/storage adapters and migration registry;
8. add optimistic revision/stale-write protection.

The production save path must be strict. Compatibility code may still read legacy data and migrate it once.

Exit gate:

- identity cannot fork;
- selected does not imply final;
- one current Video Package repository exists;
- recovery and migration are testable.

### Wave 1 implementation started

The consolidation branch now includes:

- explicit strict/legacy Video Package -> ContentBuild synchronization mode;
- strict package save rejection when `contentBuildId` is absent;
- Project package conflict rejection across different ContentBuilds;
- existing ContentBuild channel / Project mismatch rejection;
- title/thumbnail selection through canonical VariantGroups;
- explicit approval required before selected title/thumbnail becomes final;
- preserved malformed package recovery snapshot;
- regression tests for strict identity and selected-vs-final authority.

## Wave 2 — Asset / Video Package convergence

Create a canonical asset-slot registry.

Initial slots:

```text
idea
research
hook
outline
script
storyboard
media
title
thumbnail
description
tags
captions
end-screen
final-render
community-launch
```

Each slot defines cardinality, accepted kinds, finalization behavior, preferred tools and readiness requirements.

Apply Version vs Option consistently:

- **Version** = revision of one creative direction.
- **Option** = alternate creative direction.

Migrate legacy raw URL/string fields toward asset references. Keep compatibility fields temporarily as derived projections.

Replace generic two-way sync with directional reconciliation:

```text
Video Package owned state -> ContentBuild
ContentBuild canonical selections -> Video Package projection
```

Selection commands mutate ContentBuild first.

Add stale-write protection so an older Video Package cannot overwrite newer canonical selection state.

Exit gate: one selected asset has one authoritative identity everywhere.

## Wave 3 — Project read facade, Context Resolver and specialist tools

Build a non-persistent Project Workspace read model resolving:

- Project;
- ContentBuild identity;
- progress;
- video;
- assets;
- packaging;
- publishing;
- launch;
- performance;
- readiness;
- next action.

Then implement Context Resolver + GenerationRequest + ToolReceipt.

Migrate in order:

1. Script;
2. Storyboard;
3. Thumbnail;
4. Video Director;
5. Editor;
6. Publisher;
7. Community / launch.

Each specialist tool keeps its unique interface but carries persistent Project context.

Exit gate: the specialist-tool chain can execute without identity/context loss.

## Wave 4 — Publishing and Launch

Publishing Package is a projection.

Before execution, create immutable:

```text
ApprovedPublishSnapshot
- ContentBuild ID + revision
- final render asset ID
- title asset ID
- thumbnail asset ID
- caption asset IDs
- exact metadata/routing/visibility/schedule
- approver/timestamp
- snapshot hash
```

Port and strengthen PublishTransaction as a persisted state machine:

```text
PREPARE
-> VALIDATE
-> APPROVAL
-> UPLOAD PRIVATE
-> BIND YOUTUBE ID
-> APPLY METADATA
-> APPLY THUMBNAIL
-> APPLY CAPTIONS
-> APPLY ROUTING
-> VERIFY
-> APPLY SCHEDULE/VISIBILITY
-> VERIFY
-> COMPLETE
```

Idempotency identity:

```text
contentBuildId + approvedPublishSnapshotId/hash
```

The production transaction should ultimately be server-authoritative and preserve resumable upload state, receipts, retry state, errors and verification results.

Record immutable PublishedSelectionReceipt for exact creative attribution.

Launch Package is also a projection; launch creative remains Asset Engine assets.

Exit gate: retries cannot duplicate publication and the published video is attributable to exact assets.

## Wave 5 — Published lifecycle, evaluation and learning

Implement real application writers for:

- analytics.checkpoint;
- comment.observed;
- comment.reply.posted;
- experiment.started;
- experiment.completed;
- evaluation.completed;
- learning.candidate.created.

Analytics checkpoints reference Analytics Canon rather than becoming a second metric database.

Experiments reference exact option/version asset IDs.

Learning candidates preserve scope, evidence, sample/window, confidence and contradictions. Learning is governed rather than automatically promoted.

Exit gate: one published Project traces from exact creative assets through measured outcomes to a governed learning candidate.

## Wave 6 — Creator UX convergence

Do this after ownership is stable enough to avoid another redesign.

Requirements:

- Project is the dominant creator-facing object.
- ContentBuild terminology is removed from ordinary UI.
- Specialist tools feel like rooms inside the Project.
- Project identity/header persists across tools.
- Readiness routes directly to unresolved work.
- One deterministic Continue action exists per Project state.
- Advanced Asset workspace exposes Options, Versions, History, Generation and experiments without burdening normal mode.

Exit gate: a creator completes the representative workflow without understanding ContentBuild, VariantGroup, GenerationRequest or PublishingPackageProjection.

## Wave 7 — Vertical-slice certification and merge

Use one deterministic fixture:

```text
Idea
-> Project
-> ContentBuild
-> Video Package
-> Research
-> Script V1 -> V2 -> V3 -> V4 FINAL
-> Thumbnail A / B1 / B2 / B3 / C
-> B3 SELECTED -> FINAL
-> Storyboard
-> Video Director
-> Editor
-> FinalRender V2
-> Publishing projection
-> Approved Publish Snapshot
-> PublishTransaction
-> private resumable upload
-> YouTube ID
-> metadata/thumbnail/captions/routing
-> remote verification
-> Published
-> Launch
-> 1h checkpoint
-> 24h checkpoint
-> comment/reply
-> experiment
-> evaluation
-> learning candidate
```

At every transition assert:

- same `contentBuildId`;
- correct Project ID;
- correct channel ID;
- exact input/output asset IDs;
- correct Option/Version relationships;
- selected/final distinction;
- complete provenance;
- correct YouTube ID after binding;
- no duplicate canonical record.

# Migration strategy

Migrations are additive before destructive:

```text
READ OLD + NEW
-> MIGRATE / NORMALIZE
-> WRITE NEW
-> VERIFY PARITY
-> STOP WRITING OLD
-> OBSERVE
-> REMOVE OLD
```

Rules:

- existing Project with ContentBuild keeps the exact ID;
- legacy Project without one gets one canonical mapping;
- legacy Video Package without ContentBuild may use migration mode only;
- conflicting mappings are quarantined/reported rather than silently chosen;
- old compatibility fields/stores are not removed in the same change that introduces replacements.

# Event architecture

Use strong consistency inside command boundaries and events for downstream projections.

Example:

```text
select thumbnail
-> ContentBuild selection changes synchronously
-> command succeeds

asset.selected event
-> Project view refresh
-> Publish readiness refresh
-> experiment view refresh
```

Consumers must be idempotent.

Never create circular choreography such as:

```text
Project updates ContentBuild
-> ContentBuild updates Package
-> Package updates Project
-> repeat
```

# No-parallel-system acceptance rules

A change fails consolidation if it introduces:

- a second ContentBuild identity for one Project;
- a second Video Package repository/store;
- a separate Publishing Package database;
- a separate Launch Package database;
- tool-local permanent copies of canonical selections;
- fuzzy title/name identity matching when `contentBuildId` exists;
- publication state not traceable to one PublishTransaction and YouTube binding;
- asset versions/options not traceable to ContentBuild;
- a persisted Project Facade mega-object;
- a readiness database;
- a second analytics truth store.

# Architecture tests / governance rules

Add static or behavioral checks where practical:

- no new Project store;
- no second Video Package store;
- no second ContentBuild store;
- no direct creator UI mutation of ContentBuild internals;
- no canonical asset represented solely by URL when identity exists;
- no new ordinary user-facing “ContentBuild” terminology;
- no Publisher upload outside canonical publish transport;
- no post-publish analytics record without YouTube/content identity.

# Certification suites

## Identity

- Project / Build / Package IDs align.
- Editor preserves identity.
- Publisher preserves identity.
- analytics resolves YouTube ID to the same build.

## Concurrency

- stale package cannot overwrite a newer selection;
- two-tab selection conflict resolves predictably;
- duplicate event produces one effective result.

## Versions / Options

- new Version does not create a new Option;
- new Option does not increment another Option's version chain;
- Selected is reversible;
- Final is explicit;
- published receipt is immutable.

## Migration

- legacy Project;
- legacy package;
- legacy thumbnail URL;
- legacy script;
- corrupt package storage;
- duplicate package;
- conflicting ContentBuild.

## Publishing

- explicit approval required;
- retry does not duplicate video;
- resumable upload resumes;
- same approved snapshot resumes same transaction;
- changed snapshot creates an intentional new transaction;
- thumbnail/caption step can resume after failure;
- failed verification blocks public transition.

## Post-publish

- checkpoint carries exact YouTube ID;
- checkpoint links PublishedSelectionReceipt;
- experiment references exact assets;
- evaluation does not rewrite Analytics Canon;
- learning remains a candidate until governed promotion.

# Final merge gates

| Gate | Requirement |
| --- | --- |
| Identity | No tested workflow forks ContentBuild |
| Ownership | Every important field has one canonical owner |
| Persistence | One Video Package repository + migration path |
| Assets | Options/Versions/selections survive cross-tool movement |
| Context | Priority tools use Project-scoped resolved context |
| Publishing | Approved, resumable, idempotent, verified transaction |
| Attribution | Exact published assets recorded |
| Lifecycle | Analytics/evaluation resolves published ContentBuild |
| UX | Project is dominant creator-facing concept |
| Compatibility | Existing Projects/assets/packages survive |
| Branches | Every donor has a preservation disposition |
| Build | Focused architecture/release gates pass |

# Decisive implementation order

```text
PRESERVE DONOR WORK
-> FIX AUTHORITY SEMANTICS
-> HARDEN IDENTITY
-> CONSOLIDATE VIDEO PACKAGE PERSISTENCE
-> CORRECT PACKAGE <-> CONTENTBUILD RECONCILIATION
-> STANDARDIZE ASSET SLOTS / OPTIONS / VERSIONS
-> BUILD PROJECT READ FACADE
-> BUILD CONTEXT RESOLVER
-> BUILD GENERATIONREQUEST + TOOL RECEIPTS
-> MIGRATE SPECIALIST TOOLS
-> BUILD PUBLISHING + LAUNCH PROJECTIONS
-> PORT / IMPROVE PUBLISH TRANSACTION
-> BIND EXACT PUBLISHED SELECTIONS
-> CONNECT ANALYTICS / COMMENTS / EXPERIMENTS
-> EVALUATION / LEARNING
-> SIMPLIFY PROJECT UX
-> FULL VERTICAL-SLICE CERTIFICATION
-> ONE CONSOLIDATION PR
-> MAIN
```

The next phase is not another architecture redesign or another Project reassembly. Current main already contains the beginnings of the unified content object. The work now is to make those foundations authoritative, directional, transactional, cross-tool and complete through post-publication.
