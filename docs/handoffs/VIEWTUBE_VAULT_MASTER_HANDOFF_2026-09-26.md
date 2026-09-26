# ViewTube Creator Vault — Master Handoff & Continuation Map

**Status:** MASTER HANDOFF / CURRENT CONTINUATION AUTHORITY  
**Created:** 2026-09-26  
**Repository:** `themotionvisual/ViewTubeBUILD`  
**Current main at handoff:** `3ddd86bab7593cfa1eff868024268f69c7bd9e74`  
**Primary route:** `/vault`  
**Current live Vault preview:** `https://viewtube-vault-wave2-live.onrender.com/vault`  
**Preview branch:** `feat/vault-wave2-organization-2026-09-25`  
**Latest live preview commit at handoff:** `481c1b94095344aa6992c8661cd99e42d986df95`  
**Planning workspace:** `tasks/viewtube-vault/`  
**Canonical page:** `src/views/CreatorVaultOS.tsx`

---

## 0. Why this document exists

This document is the single handoff intended to let the next agent continue the ViewTube Creator Vault work without rediscovering the product, donor history, architecture, finished work, incomplete work, UI decisions, source files, tests, standalone HTML references, merged PR history, and current mobile UX problems.

It consolidates the work from the long Creator Vault conversation, the donor re-harvest, current `main`, the Vault task workspace, the six latest iPhone screenshots, Library HTML references, and the completed implementation PRs.

This document is a **handoff map**, not a replacement for the canonical subsystem authorities. When there is a conflict, use this order:

1. **Current `main` code and tests**
2. `docs/architecture/VIEWTUBE_TOOLBOX_UI_MASTER_RESOURCE.md`
3. `docs/architecture/VIEWTUBE_ASSET_ENGINE_MASTER_RESOURCE.md`
4. `docs/architecture/VIEWTUBE_PROJECTS_CONTENTBUILD_WORKFLOW_MASTER_RESOURCE.md`
5. `docs/architecture/VIEWTUBE_CREATOR_VAULT_IMPLEMENTATION_PLAN_2026-09-24.md`
6. `docs/migration/reference/VAULT_TOOL_DONOR_REHARVEST_2026-09-24.md`
7. `tasks/viewtube-vault/todo.md`
8. this handoff for continuity, context, history, and next-agent sequencing.

The donor Vault app and old standalone HTML files are **reference/provenance only**. They are not production authorities.

---

# 1. Executive state at handoff

The Creator Vault is no longer a prototype. It now has a real `/vault` route, canonical Vault asset identity, a large production feature set, extensive regression coverage, and integration with Projects/ContentBuild, Asset Engine, ActionPacket handoffs, canonical media primitives, and the Toolbox/SubToolbox UI system.

The **largest remaining Vault-native problem is now UX architecture and density**, especially on mobile.

The six latest iPhone screenshots show that the code is functionally rich but difficult to use because too many configuration, navigation, creation, and handoff concepts occupy equal full-width visual space. The current page makes users scroll through “how the workspace is configured” before reaching the actual workspace.

The immediate implementation priority should therefore be the already-defined **Lane UX — compact Vault information architecture redesign** in `tasks/viewtube-vault/todo.md`, not another wave of unrelated features.

### Current high-level status

**Strong / substantially implemented**
- canonical Vault route and shell;
- asset library;
- real image/video previews;
- editable titles, tags and notes;
- direct vs staged import;
- metadata/hash/duplicate preflight;
- EXIF;
- local perceptual image similarity;
- local image palette extraction;
- Quick Look;
- Compare + Before/After;
- Grid / Masonry / Filmstrip / List / Timeline / Lineage;
- Smart Collections and manual Collections;
- Brand Kit;
- Favorites / Inbox / Recent / Generated / Archive / Trash;
- lifecycle and protected/GOLDEN semantics;
- rights metadata;
- typed custom fields and schema columns;
- versions / detach / lineage / usage;
- captions editor + SRT/VTT;
- transcript → Script derivative;
- YouTube-linked transcript acquisition;
- Project/ContentBuild creation/attachment from selection;
- readiness/dependency projection;
- manifest/metadata export;
- workspace persistence;
- task center;
- Import & Tags combined tool;
- standalone Text Editor;
- asset-aware ViewTube handoffs.

**Still incomplete / blocked**
- full current-main certification pass (`RH-A019`);
- real vision/suggested-tag provider path;
- arbitrary local-file speech-to-text;
- durable proxy derivative creation/storage;
- the complete Projects donor-upgrade lane;
- Editor/media derivative/overwrite/batch-transform lane;
- Packaging/Hook/Video Manager/Analytics matching-tool donor lanes;
- compact mobile Vault UX redesign (`RH-UX120`–`RH-UX135`);
- factual provider-backed storage telemetry beyond factual sizes already present;
- secure sharing remains future/security-design work.

---

# 2. Non-negotiable product definition

ViewTube Vault is the creator’s **durable asset workspace**.

A useful mental model is:

> Finder + Lightroom/DAM + project asset browser + creative version history + workflow router, rebuilt through the ViewTube Toolbox/SubToolbox system and integrated with canonical Project/ContentBuild and Asset Engine identity.

Vault is not:
- a second video editor;
- a second Photoshop;
- a second Projects database;
- a second Brain memory system;
- a browser-side provider client;
- a simulated processing toy.

Vault must remain the creator-facing authority for durable asset identity, organization, metadata, preview, versions/lineage views, lightweight document/caption editing, and routing.

---

# 3. Canonical ownership model

| Capability | Canonical owner |
|---|---|
| durable asset identity, creator-facing organization, metadata refs | **Vault** |
| production semantics, versions, derivatives, selections, relationships | **Asset Engine / ContentBuild** |
| project intent, workflow state, board/calendar | **Projects / ContentBuild** |
| generation runs and candidates | **Generation Store / Video Director** |
| AI reasoning, research, refinement | **BrainRuntime** |
| timeline/media edit state | **VT_E1** |
| deterministic render | **Remotion** |
| publishing actions | **Publisher** |
| analytics facts | **analytics-canon** |
| cross-tool movement | **ActionPacket / Handoff** |

### Core architectural rules

- Physical storage is separate from logical organization.
- Do not turn physical folders into the primary Vault data model.
- Collections group canonical asset IDs; they do not clone assets.
- Project assignment must use canonical Project/ContentBuild identity, not arbitrary project-name strings.
- “Version”, “derivative”, and “duplicate” are different relationships.
- Vault can launch specialist work, but processing owned by Editor/Video Director/etc. remains there.
- Outputs return to Vault as canonical derivative/version assets with provenance.
- Brain may search/reason over Vault metadata; Brain does not own the assets.
- “Send To” transports IDs/references, not copied blobs.

---

# 4. Correct current module ownership

The user explicitly corrected this during the build. **Do not regress it.**

Current `main` correctly has:

- `Asset Operations`
- `Import & Tags`
- `Text Editor`
- `Asset Library`
- `Task Center`
- `Inspector`
- plus the still-existing `Navigator`, `Explorer`, `Workspace Notes`, and workspace controls that are targeted by the UX redesign.

## Asset Operations

Current internal modes:
- `SEARCH`
- `BATCH`
- `GROUPS`
- `TOOLS`

It must **not** own TAGS, IMPORT, or TEXT.

Longer-term UX plan: the persistent Asset Operations module itself should be reduced/replaced by a **contextual Selection Action Bar**.

## Import & Tags

This is one independent SubToolbox.

Internal modes:
- `TAGS`
- `IMPORT`

This ownership is deliberate:
- Spectrum Tags;
- Zone Tag drop ingestion;
- direct/staged file intake;
- pending-file edits;
- per-item tags;
- duplicate review;
- canonical ingest.

It should default collapsed/contextual in the compact UX redesign.

## Text Editor

This is its **own independent SubToolbox**, not a tab inside Asset Operations.

It creates/edits canonical plain-text and Markdown Vault document assets.

It must remain separate from:
- Import & Tags;
- Asset Operations;
- Script Architect.

It is a lightweight Vault document workbench, not a second full script editor.

## Asset Library

The Asset Library is the browsing/results canvas.

It currently supports:
- Grid;
- Masonry;
- Filmstrip;
- Finder-style List;
- Timeline;
- Lineage.

The next UX wave should make it the **primary page surface visible immediately**.

## Task Center

Persistent background task record:
- queued;
- processing;
- completed;
- failed;
- retry when a real durable source/context exists.

Next UX wave: compact status entry when idle; expand only for active/failed work.

## Inspector

Deep selected-asset details:
- project;
- tags;
- attention;
- collections;
- custom fields;
- lifecycle/protection;
- EXIF;
- rights;
- palette;
- similarity;
- versions;
- lineage;
- usage;
- captions/transcript;
- readiness context.

Next UX wave: bottom sheet/contextual surface on mobile; persistent right rail only on wide desktop.

---

# 5. Current persisted workspace contract

File:
`src/services/vaultWorkspaceState.ts`

Current module IDs:
- `navigator`
- `explorer`
- `workspace-notes`
- `asset-operations`
- `import-tags`
- `text-editor`
- `asset-library`
- `task-center`
- `inspector`

Current view modes:
- `grid`
- `masonry`
- `filmstrip`
- `lineage`
- `list`
- `timeline`

Current library states:
- `active`
- `recent`
- `generated`
- `inbox`
- `favorites`
- `archive`
- `trash`

Persisted filters include:
- query;
- selected tag;
- kind;
- source;
- sort;
- library state;
- lifecycle;
- orientation;
- updated-from / updated-to;
- MIME;
- min width / height;
- min / max duration;
- min / max bytes;
- Asset Operations internal mode;
- Import & Tags internal mode;
- view mode;
- density;
- Arrange Mode;
- visible modules;
- module order.

The workspace-state reader includes migration from older:
- `spectrum-tags`;
- `import-station`;
- `batch-processor`;
- the earlier incorrectly unified Asset Operations model.

Do not delete migration logic casually.

---

# 6. Latest mobile screenshot audit — immediate design priority

Durable audit:
`tasks/viewtube-vault/UI-DENSITY-AUDIT-2026-09-25.md`

Evidence:
- six user-supplied iPhone screenshots (`IMG_4346.png` through `IMG_4351.png`);
- current `CreatorVaultOS.tsx`;
- SubToolbox primitives;
- Vault asset CSS;
- workspace state.

Audit verdict already recorded:
- **interaction architecture: FAIL**
- **component/system reuse: PASS**
- score: **9/20**

## 6.1 Workspace Controls consumes the product

The screenshot shows a full stack of:
- Comfortable / Compact;
- Enter Arrange Mode;
- Hide Navigator;
- Hide Explorer;
- Hide Workspace Notes;
- Hide Asset Operations;
- Hide Import & Tags;
- Hide Text Editor;
- Hide Asset Library;
- Hide Task Center;
- etc.

This is configuration UI taking an entire mobile viewport.

It is confusing because:
- each module already has collapse;
- visibility and arrangement are rare settings;
- the user must scroll through workspace-management UI to reach actual assets;
- “configure the page” visually dominates “use the page.”

**Required fix:** move Workspace Controls completely out of normal page flow into a Workspace/Layout popover or mobile sheet.

## 6.2 Navigator is too many concepts at once

Current Navigator visibly includes:
- Grid/Masonry/Filmstrip/Lineage/List/Timeline;
- asset kind;
- Library/Recent/Generated/Inbox/Favorites/Archive/Trash;
- source;
- sort;
- All Spectrum Tags;
- advanced metadata filters;
- Smart Collection naming/saving.

Problems visible in the screenshots:
- segmented controls wrap to multiple rows;
- library-state options clip/overflow;
- too much pre-library vertical height;
- “Navigator” has no single clear meaning;
- tag behavior duplicates Import & Tags.

**Required fix:** remove Navigator as a persistent SubToolbox.

Replace with compact **Library Toolbar**:
- Search;
- current library state;
- Filters;
- Sort;
- View;
- Workspace menu.

Put advanced filters in a sheet/popover.
Show applied filter chips only when active.

## 6.3 Explorer duplicates navigation and creation

Current Explorer mixes:
- All Assets;
- Unassigned;
- Collections;
- Brand Kit creation;
- collection filtering.

This overlaps Navigator and Group Builder.

**Required fix:** Explorer becomes:
- mobile Library drawer;
- optional compact desktop left rail.

It should contain logical navigation only:
- Projects;
- Collections;
- Brand Kit;
- Unassigned;
- Saved Smart Collections.

Creation actions move to Group Builder.

## 6.4 Asset Operations makes external tools look like Vault tools

The screenshot shows giant equal-weight buttons:
- Video Manager;
- Video Publisher;
- Projects + Calendar;
- Storyboard Studio;
- VT_E1 Video Editor;
- ViewTube Brain;
alongside Vault-native:
- Quick Look;
- Compare;
- Filmstrip;
- Lineage.

This makes it unclear which tools are “inside Vault” and which leave Vault.

**Required fix:**
- replace persistent Asset Operations with contextual Selection Action Bar;
- Vault-native selection actions remain visible;
- all external destinations move under clearly labeled:
  **Send to ViewTube…**
- use handoff/external iconography;
- never render external destinations as equal full-width Vault-native tool buttons.

## 6.5 Asset cards waste space around media

The screenshots show:
- fixed preview region;
- large colored empty space around images;
- fixed two-column body;
- large Notes region even when notes are empty;
- documents dominated by a blank icon preview;
- media often smaller than the surrounding card chrome.

Current asset-card implementation reserves fixed mobile body geometry and permanently divides space between preview, tags, and notes.

**Required redesign:**
- media-first;
- preview respects source ratio;
- preview uses width efficiently;
- one-line editable title;
- compact metadata line;
- 2–3 tags + `+N`;
- notes hidden by default;
- notes/deep metadata belong in Inspector;
- document card shows actual text excerpt;
- audio card shows waveform/compact audio representation;
- video shows extracted still;
- generic icons only as fallback;
- empty regions do not reserve height.

Target:
**default compact card non-media chrome <= 96 CSS px.**

## 6.6 Too much equal visual weight

Problems:
- every secondary action is a large full-width button;
- thick borders on nested interior layers;
- repeated heavy shadows;
- large all-caps labels;
- disabled actions still consume full rows;
- module headers take a large fraction of the viewport.

**Direction:**
keep neo-brutalist identity, but create hierarchy:
- one strong shell border;
- lighter interior separation;
- compact controls for secondary actions;
- full-width actions only for primary commits;
- contextual actions only when eligible.

---

# 7. Target compact Vault information architecture

## Mobile persistent flow

1. ViewTube / Vault header
2. **Library Toolbar**
3. Applied filter chips only if active
4. **Asset Library immediately**

The first real asset content should be visible in the first viewport on a normal return visit.

### Library Toolbar

Compact controls for:
- search;
- current state;
- filter;
- sort;
- view;
- workspace/layout.

Default pre-library chrome target:
**<= 180 CSS px.**

### Contextual surfaces

**Library Drawer**
- Projects
- Collections
- Brand Kit
- Unassigned
- Saved Smart Collections

**Selection Action Bar**
Appears only when one or more assets are selected:
- Tag
- Batch
- Group
- Compare
- Metadata
- Export
- Send to ViewTube…

**Workspace/Layout sheet**
- density;
- module/tool visibility;
- Arrange Mode;
- rare display preferences.

**Inspector**
- bottom sheet / scroll target on mobile;
- right rail at wide desktop.

**Task Center**
- compact status row/badge by default;
- expands for active/failed/reviewed work.

### Independent tools preserved

- Import & Tags — one SubToolbox, TAGS / IMPORT
- Text Editor — its own SubToolbox

Both should default collapsed unless explicitly opened or contextually invoked.

---

# 8. Lane UX — exact unfinished tasks

These are already in `tasks/viewtube-vault/todo.md` and are the recommended next implementation wave.

- [ ] `RH-UX120` Remove Workspace Controls from normal page flow; replace with Workspace/Layout popover/sheet.
- [ ] `RH-UX121` Replace standalone Navigator with compact Library toolbar: search, state, filters, sort, view.
- [ ] `RH-UX122` Replace standalone mobile Explorer with Library drawer; keep optional compact desktop rail.
- [ ] `RH-UX123` Move Brand Kit / collection creation out of Explorer and into Group Builder.
- [ ] `RH-UX124` Replace persistent Asset Operations module with contextual Selection Action Bar.
- [ ] `RH-UX125` Split Vault-native utilities from external handoffs; external destinations live under “Send to ViewTube…”.
- [ ] `RH-UX126` Keep Import & Tags as one independent collapsed-by-default SubToolbox.
- [ ] `RH-UX127` Keep Text Editor as one independent collapsed-by-default SubToolbox.
- [ ] `RH-UX128` Redesign `SubToolboxVaultAsset` to media-first compact card with no always-reserved Notes panel.
- [ ] `RH-UX129` Add document text-excerpt preview, compact audio representation, and ratio-aware image/video previews.
- [ ] `RH-UX130` Make Task Center compact when idle and expand only for active/failed jobs.
- [ ] `RH-UX131` Make Inspector contextual on mobile and persistent right rail only at wide desktop.
- [ ] `RH-UX132` Remove duplicate tag/filter affordances from Navigator/Library once Import & Tags owns tag management.
- [ ] `RH-UX133` Reduce nested border/shadow hierarchy and full-width secondary actions while preserving neo-brutalist identity.
- [ ] `RH-UX134` Add mobile density acceptance tests for first-asset visibility, control-height budget, overflow and clipping.
- [ ] `RH-UX135` Verify portrait, landscape and desktop screenshots; re-run UI audit after fixes.

### Lane UX checkpoint

Do not call the redesign complete until:
- Asset Library is reachable without scrolling through configuration modules.
- Workspace configuration is off-canvas/contextual.
- navigation/filtering has one obvious owner.
- selection actions appear only when relevant.
- external ViewTube tools are visibly handoff destinations.
- default asset cards prioritize media over chrome.

---

# 9. Completed Vault implementation inventory

## Lane A — foundation

Completed:
- `/vault` production route;
- Toolbox/SubToolbox shell;
- search/kind/source/sort basics;
- Spectrum Tags;
- Import Station baseline;
- multi-select / Batch Processor baseline;
- Shift range selection;
- direct vs staged ingestion;
- current media primitives integration.

Still open:
- `RH-A019` full tests/build/browser verification on the current main baseline.

## Lane B — interaction / organization

Completed:
- Space Quick Look;
- Escape close behavior;
- Cmd/Ctrl+K search;
- Cmd/Ctrl+G Project/ContentBuild handoff;
- split explorer;
- timeline;
- Smart Collections;
- Favorites/Inbox/Archive/Trash;
- Arrange Mode;
- module visibility;
- density preference;
- scratchpads/checklists;
- asset-aware Send To / ActionPackets;
- lifecycle + GOLDEN/protection;
- manual Collections;
- two-asset Compare;
- Finder-style List;
- structured metadata filters;
- typed custom fields;
- archive/trash recovery;
- guarded permanent delete;
- exact duplicate resolution;
- local image perceptual fingerprints / Find Similar;
- local image dominant-color palette;
- Before/After;
- editable rights/license;
- Masonry;
- advanced-filter persistence;
- Brand Kit;
- collection rename;
- asset collection-membership Inspector;
- full Smart Collection state;
- Recent / Generated;
- custom fields as Finder schema columns;
- Needs Attention reasons;
- manual review flag and note;
- 1–9 Spectrum Tag hotkeys;
- Enter → Inspector;
- orientation filtering;
- updated-date range filtering;
- Filmstrip;
- Lineage;
- Asset Operations corrected to Search / Batch / Groups / Tools;
- Import Station + Spectrum Tags consolidated into `Import & Tags`;
- Text Editor separated into its own SubToolbox;
- persisted internal modes and legacy workspace migration;
- Project / Asset Group Builder;
- asset-aware tool handoffs;
- removal of noncanonical batch project-name assignment;
- Quick Look/Compare/Filmstrip/Lineage/Copy Asset ID utility shelf;
- Send To + metadata export centralized away from Inspector duplicates.

## Lane C — intake/jobs

Completed:
- global drag/drop;
- MIME/type/size;
- image dimensions;
- video duration/resolution;
- video thumbnail extraction;
- direct import;
- editable staged drafts;
- content hash / duplicate preflight;
- EXIF;
- durable task center;
- retry/error;
- per-item staged tags;
- Zone Tag ingestion.

Incomplete:
- `RH-C049` real Vision/suggested-tag task;
- `RH-C050` arbitrary local-file speech-to-text;
- `RH-C051` durable proxy derivative task.

Important nuance:
YouTube-linked transcript acquisition is already real and durable-retry capable. Only arbitrary local file STT remains.

## Lane D — versions/captions/dependencies

Completed:
- version carousel;
- detach preserving lineage;
- lineage/usage/rights;
- caption editor;
- SRT/VTT;
- transcript → Script;
- selected assets → new Project/ContentBuild;
- selected assets → existing Project;
- dependency/readiness projection;
- manifest JSON;
- factual package/storage sizing.

---

# 10. Incomplete cross-owner donor work

These are intentionally **not** Vault-owned catch-all tasks.

## Lane E — Projects

All still pending unless a newer Projects-specific effort has superseded them:

- nine-stage creator-lane mapping;
- priority;
- due date;
- detail tabs;
- core promise/audience/runtime;
- phase progress;
- storyboard shots;
- title drafts + primary;
- phase checklists;
- checklist-derived progress;
- script word/read time;
- linked Vault picker;
- Brain project research handoff;
- published stats projection.

Target owner:
current Projects / Project Builder / ContentBuild.

## Lane F — Editor/media

Pending:
- audit VT_E1 first;
- Create Derivative vs Overwrite;
- protected overwrite guard;
- Batch Transform Request;
- fill only verified trim/crop/color/LUT gaps.

Vault launches the handoff. VT_E1/media-processing executes.

## Lane G — matching tools

Pending/audit:
- End Screen / Packaging donor slice;
- Hook polish modes;
- Hook timed preview simulator;
- Video Manager donor interaction audit;
- Analytics report donor audit;
- Shorts/VT_E1 conditional donor audit.

Do not expand Vault to absorb these.

---

# 11. Real-processing blockers and explicit non-solutions

## Vision / suggested tags

The repository has older image-analysis code that directly calls the provider client through legacy Gemini plumbing.

Do **not** connect Vault to that architecture.

Required future solution:
- server/provider-owned vision adapter;
- reviewable suggestions;
- Accept Selected / Accept All / Dismiss;
- no silent metadata mutation.

## Arbitrary local-file transcription

Current real transcript path works only when an asset resolves to a YouTube video ID through the existing acquisition path.

Do not simulate local transcription.

Future solution:
- real speech-to-text backend;
- durable source bytes;
- linked transcript/caption asset;
- task lifecycle.

## Proxy derivatives

A real FFmpeg server compression path exists, but the current Vault still lacks a clean durable binary-write/storage seam for arbitrary output blobs.

Do not persist a temporary browser object URL and call it durable.

Future solution:
- Vault storage interface/provider;
- durable output write;
- derivative record preserving source relation;
- queued/processing/completed/failed task state.

## Drive upload caution

Older browser-token Google Drive upload code exists.

Do not revive browser-owned Drive auth for Vault.
Use the current server-owned account/auth architecture when a supported write seam exists.

---

# 12. Donor Vault-Tool harvest

Original donor:
`Vault-Tool-main.zip`

It was unpacked and audited as a **multi-owner donor**, not a Vault-only repository.

Major donor files inspected included:
- `components/VaultOS.tsx` — 2795 LOC
- `views/ResearchLab.tsx` — 2096
- `services/gemini.ts` — 1954
- `views/AnalyticsLab.tsx` — 1280
- `components/ProjectKanban.tsx` — 1132
- `views/ThumbnailStudio.tsx` — 1117
- `views/VideoManager.tsx` — 1011
- `views/Projects.tsx` — 967
- `components/MediaClipper.tsx` — 984
- `views/SeoGenerator.tsx` — 896
- `views/ScriptArchitect.tsx` — 887
- `components/ShortsStudio.tsx` — 877
- `components/EndScreenStudio.tsx` — 849
- `views/HookGenerator.tsx` — 828
- `views/MediaAnalyzer.tsx` — 789
- `components/BrainBankManager.tsx` — 559
- `components/IntakeDesk.tsx` — 469
- `components/ReportViewer.tsx` — 373
- `views/StudioHub.tsx` — 366

## High-value behaviors harvested

- Grid/List/Timeline/Split concepts;
- logical Explorer;
- workspace reorder/visibility;
- scratchpads/checklists;
- true Shift range selection;
- Cmd/Ctrl+K;
- Cmd/Ctrl+G;
- Space Quick Look;
- M mute;
- Escape close;
- drag/drop intake;
- real local metadata extraction;
- video frame thumbnail;
- direct vs staged import;
- pending drafts;
- post-ingest batching;
- version carousel;
- detach version;
- timestamped transcript/caption editor;
- transcript → Script;
- readiness/dependency projection;
- manifest;
- asset-type-aware tool launcher;
- typed tool families;
- project stages/details/checklists;
- derivative vs overwrite interaction;
- editor batch-transform idea;
- End Screen / Hook / Video Manager / Analytics reference ideas.

## Rejected donor patterns

Never port:
- donor local Vault arrays as production truth;
- donor local Project arrays;
- BrainBank localStorage authority;
- browser-side provider API keys/direct calls;
- fake/random/timer scanners;
- fake proxy/transcode timers;
- fake PDF/DOCX files;
- alert-only pretend processing;
- hardcoded storage quotas;
- hardcoded asset/project IDs;
- donor black-border CSS wholesale;
- duplicate editor/publisher/analytics authorities.

---

# 13. Three distinct batch systems

Do not merge these conceptually.

## 1. Pre-ingest intake batching

Files not yet canonical:
- staged queue;
- name/type/tag edits;
- metadata/hash/duplicate checks;
- accept/reject;
- direct vs staged.

Owner:
Import & Tags.

## 2. Post-ingest organizational batching

Canonical assets:
- tag;
- rename;
- favorite;
- archive/trash/restore;
- group;
- metadata;
- exports.

Owner:
Vault selection/action surface.

## 3. Media transform macro batching

Selected canonical asset IDs + media transform settings:
- trim;
- crop;
- color;
- LUT;
- etc.

Owner:
VT_E1/media processor.

Vault creates a **Batch Transform Request** handoff and receives derivative IDs.

---

# 14. Lifecycle/protection semantics

Lifecycle vocabulary:
- `DRAFT`
- `CANDIDATE`
- `APPROVED`
- `FINAL`
- `GOLDEN`
- `SUPERSEDED`
- `ARCHIVED`
- `TRASHED`

Rules:
- GOLDEN defaults protected.
- protected/GOLDEN assets cannot be silently archived/trashed/deleted.
- destructive state is enforced at the adapter/service layer, not only hidden in UI.
- explicit unlock is required before destructive actions.
- archive/trash preserves the prior lifecycle for restore.
- permanent delete only from Trash and only when allowed.
- Editor destructive overwrite should later reuse the same protection semantics.

---

# 15. Search/filter/organization capabilities

Current search/filter dimensions include:
- names;
- projects;
- tags;
- kinds;
- metadata text;
- source;
- MIME;
- lifecycle;
- width;
- height;
- orientation;
- duration;
- file size;
- updated date range;
- special state;
- custom fields via metadata search.

Organization:
- manual Collections;
- Smart Collections;
- Brand Kit role;
- Favorites;
- Recent;
- Generated;
- Inbox / Needs Attention;
- Archive;
- Trash;
- Project relation.

Smart Collections persist the advanced filter state.

---

# 16. Keyboard interaction contract

Implemented:
- Space → Quick Look
- Cmd/Ctrl+K → Vault search
- Cmd/Ctrl+G → Project/ContentBuild selection workflow
- Escape → close transient surface
- M → mute/unmute compatible preview where not typing
- 1–9 → visible Spectrum Tag shortcut
- Enter → selected asset Inspector
- Shift-click → contiguous range selection

Do not fire number/M shortcuts while typing in text inputs.

---

# 17. Current code inventory — Vault-specific production files

## Main view / component

- `src/views/CreatorVaultOS.tsx`
- `src/components/subtoolbox/VaultAssetModule.tsx`
- `src/styles/vault-asset-module.css`
- `src/components/subtoolbox/SubToolboxPrimitives.tsx`
- `src/components/subtoolbox/SubToolboxMediaPrimitives.tsx`
- `src/components/subtoolbox/SubToolboxSplitPrimitives.tsx`
- `src/components/subtoolbox/SubToolboxWorkflowPrimitives.tsx`
- `src/components/Toolbox.tsx`

`CreatorVaultOS.tsx` is currently very large and is a refactor candidate after the UX ownership is stable. Do not split it blindly before the compact IA is finalized.

## Vault service files

- `src/services/vaultAdapter.ts`
- `src/services/vaultAttention.ts`
- `src/services/vaultCaptions.ts`
- `src/services/vaultChecklists.ts`
- `src/services/vaultCollections.ts`
- `src/services/vaultCompare.ts`
- `src/services/vaultCustomFields.ts`
- `src/services/vaultExif.ts`
- `src/services/vaultExplorer.ts`
- `src/services/vaultFileHash.ts`
- `src/services/vaultFileMetadata.ts`
- `src/services/vaultImagePalette.ts`
- `src/services/vaultImagePreview.ts`
- `src/services/vaultImageSimilarity.ts`
- `src/services/vaultImport.ts`
- `src/services/vaultKeyboard.ts`
- `src/services/vaultManifest.ts`
- `src/services/vaultManualCollections.ts`
- `src/services/vaultMetadataExport.ts`
- `src/services/vaultProjectHandoff.ts`
- `src/services/vaultReadiness.ts`
- `src/services/vaultScratchpads.ts`
- `src/services/vaultSelection.ts`
- `src/services/vaultTaskCenter.ts`
- `src/services/vaultTextDocuments.ts`
- `src/services/vaultToolLauncher.ts`
- `src/services/vaultTranscriptTask.ts`
- `src/services/vaultUsage.ts`
- `src/services/vaultVersions.ts`
- `src/services/vaultVideoThumbnail.ts`
- `src/services/vaultWorkspaceState.ts`

## Canonical related owners

- `src/services/asset-engine/ContentBuildRepository.ts`
- `src/services/asset-engine/ProjectContentBuildBridge.ts`
- `src/services/asset-engine/contracts.ts`
- `src/services/assetEngine.ts`
- `src/services/superToolActionPackets.ts`
- `src/services/brain/BrainVaultAdapter.ts`
- `src/services/brain/BrainHandoffInbox.ts`
- `src/components/projects/ContentAssetEngine.tsx`
- `src/components/projects/ProjectBuilder.tsx`
- `src/views/ProjectCalendarPage.tsx`

---

# 18. Vault regression test inventory

## Route / navigation
- `src/app/__tests__/vaultRoute.production.test.ts`
- `src/components/navigation/__tests__/navigationVault.test.ts`
- `src/views/CreatorVaultOS.production.test.ts`

## Vault service tests
- `src/services/__tests__/vaultAdvancedFilterPersistence.test.ts`
- `src/services/__tests__/vaultAssetOperationsWorkspace.test.ts`
- `src/services/__tests__/vaultAttention.test.ts`
- `src/services/__tests__/vaultAttentionState.test.ts`
- `src/services/__tests__/vaultBatchOperations.test.ts`
- `src/services/__tests__/vaultBatchOrganization.test.ts`
- `src/services/__tests__/vaultBrainSearch.test.ts`
- `src/services/__tests__/vaultBrandKit.test.ts`
- `src/services/__tests__/vaultCaptions.test.ts`
- `src/services/__tests__/vaultChecklists.test.ts`
- `src/services/__tests__/vaultCollections.test.ts`
- `src/services/__tests__/vaultCompare.test.ts`
- `src/services/__tests__/vaultCreateBrandKit.test.ts`
- `src/services/__tests__/vaultCustomFields.test.ts`
- `src/services/__tests__/vaultDateFilter.test.ts`
- `src/services/__tests__/vaultDetachVersion.test.ts`
- `src/services/__tests__/vaultDuplicatePreflight.test.ts`
- `src/services/__tests__/vaultExif.test.ts`
- `src/services/__tests__/vaultExplorer.test.ts`
- `src/services/__tests__/vaultFileMetadata.test.ts`
- `src/services/__tests__/vaultFilmstripView.test.ts`
- `src/services/__tests__/vaultImagePalette.test.ts`
- `src/services/__tests__/vaultImagePreview.test.ts`
- `src/services/__tests__/vaultImageSimilarity.test.ts`
- `src/services/__tests__/vaultImport.test.ts`
- `src/services/__tests__/vaultImportedAsset.test.ts`
- `src/services/__tests__/vaultKeyboard.test.ts`
- `src/services/__tests__/vaultLifecycle.test.ts`
- `src/services/__tests__/vaultLineageView.test.ts`
- `src/services/__tests__/vaultManifest.test.ts`
- `src/services/__tests__/vaultManualCollectionRename.test.ts`
- `src/services/__tests__/vaultManualCollections.test.ts`
- `src/services/__tests__/vaultMasonryView.test.ts`
- `src/services/__tests__/vaultMetadataExport.test.ts`
- `src/services/__tests__/vaultMetadataFilters.test.ts`
- `src/services/__tests__/vaultOrganizationStates.test.ts`
- `src/services/__tests__/vaultOrientationFilter.test.ts`
- `src/services/__tests__/vaultProjectAttachment.test.ts`
- `src/services/__tests__/vaultProjectHandoff.test.ts`
- `src/services/__tests__/vaultReadiness.test.ts`
- `src/services/__tests__/vaultRecentGenerated.test.ts`
- `src/services/__tests__/vaultRecovery.test.ts`
- `src/services/__tests__/vaultScratchpads.test.ts`
- `src/services/__tests__/vaultSelection.test.ts`
- `src/services/__tests__/vaultSmartCollectionAdvanced.test.ts`
- `src/services/__tests__/vaultSmartFilters.test.ts`
- `src/services/__tests__/vaultTaskCenter.test.ts`
- `src/services/__tests__/vaultTaskRetry.test.ts`
- `src/services/__tests__/vaultTextDocuments.test.ts`
- `src/services/__tests__/vaultToolLauncher.test.ts`
- `src/services/__tests__/vaultTranscriptTask.test.ts`
- `src/services/__tests__/vaultTranscriptVideoId.test.ts`
- `src/services/__tests__/vaultUsage.test.ts`
- `src/services/__tests__/vaultVersions.test.ts`
- `src/services/__tests__/vaultVideoThumbnail.test.ts`
- `src/services/__tests__/vaultWorkspaceCustomization.test.ts`
- `src/services/__tests__/vaultWorkspaceState.test.ts`

## CreatorVaultOS source-contract/UI tests
- `src/views/CreatorVaultOS.assetCardControls.test.ts`
- `src/views/CreatorVaultOS.assetEditing.test.ts`
- `src/views/CreatorVaultOS.assetOperations.test.ts`
- `src/views/CreatorVaultOS.assetOperationsTools.test.ts`
- `src/views/CreatorVaultOS.assetUtilityTools.test.ts`
- `src/views/CreatorVaultOS.attentionReasons.test.ts`
- `src/views/CreatorVaultOS.beforeAfter.test.ts`
- `src/views/CreatorVaultOS.brandKit.test.ts`
- `src/views/CreatorVaultOS.captions.test.ts`
- `src/views/CreatorVaultOS.collectionMembership.test.ts`
- `src/views/CreatorVaultOS.collectionRename.test.ts`
- `src/views/CreatorVaultOS.collections.test.ts`
- `src/views/CreatorVaultOS.compare.test.ts`
- `src/views/CreatorVaultOS.createBrandKit.test.ts`
- `src/views/CreatorVaultOS.customFields.test.ts`
- `src/views/CreatorVaultOS.duplicateReview.test.ts`
- `src/views/CreatorVaultOS.enterInspector.test.ts`
- `src/views/CreatorVaultOS.exif.test.ts`
- `src/views/CreatorVaultOS.exifSingleSection.test.ts`
- `src/views/CreatorVaultOS.filmstrip.test.ts`
- `src/views/CreatorVaultOS.findSimilar.test.ts`
- `src/views/CreatorVaultOS.finderList.test.ts`
- `src/views/CreatorVaultOS.globalDrop.test.ts`
- `src/views/CreatorVaultOS.laneA.test.ts`
- `src/views/CreatorVaultOS.laneB.test.ts`
- `src/views/CreatorVaultOS.lifecycle.test.ts`
- `src/views/CreatorVaultOS.lineageView.test.ts`
- `src/views/CreatorVaultOS.manualCollections.test.ts`
- `src/views/CreatorVaultOS.masonry.test.ts`
- `src/views/CreatorVaultOS.metadataExport.test.ts`
- `src/views/CreatorVaultOS.metadataFilterUi.test.ts`
- `src/views/CreatorVaultOS.metadataFilters.test.ts`
- `src/views/CreatorVaultOS.mobileCardDensity.test.ts`
- `src/views/CreatorVaultOS.palette.test.ts`
- `src/views/CreatorVaultOS.pendingTags.test.ts`
- `src/views/CreatorVaultOS.previewRepair.test.ts`
- `src/views/CreatorVaultOS.production.test.ts`
- `src/views/CreatorVaultOS.recentGenerated.test.ts`
- `src/views/CreatorVaultOS.recovery.test.ts`
- `src/views/CreatorVaultOS.reviewFlag.test.ts`
- `src/views/CreatorVaultOS.rightsEditor.test.ts`
- `src/views/CreatorVaultOS.schemaColumns.test.ts`
- `src/views/CreatorVaultOS.sendTo.test.ts`
- `src/views/CreatorVaultOS.smartCollectionAdvanced.test.ts`
- `src/views/CreatorVaultOS.tagHotkeys.test.ts`
- `src/views/CreatorVaultOS.toolOwnership.test.ts`
- `src/views/CreatorVaultOS.transcriptAcquisition.test.ts`
- `src/views/CreatorVaultOS.zoneTag.test.ts`

Also relevant:
- `src/components/subtoolbox/VaultAssetModule.test.tsx`
- `src/components/Toolbox.chevronRuntime.test.ts`

---

# 19. Canonical Vault planning/document inventory

## Architecture / implementation authority

- `docs/architecture/VIEWTUBE_CREATOR_VAULT_IMPLEMENTATION_PLAN_2026-09-24.md`
- `docs/architecture/VIEWTUBE_ASSET_ENGINE_MASTER_RESOURCE.md`
- `docs/architecture/VIEWTUBE_PROJECTS_CONTENTBUILD_WORKFLOW_MASTER_RESOURCE.md`
- `docs/architecture/VIEWTUBE_TOOLBOX_UI_MASTER_RESOURCE.md`
- `docs/architecture/PROJECT_CONTENTBUILD_ASSET_ENGINE_VIDEO_PACKAGE_CONSOLIDATION_2026-09-22.md`
- `docs/architecture/ASSET_ENGINE_CONTENTBUILD_IMPLEMENTATION_PLAN_2026-09-20.md`

## Donor/reference authority

- `docs/migration/reference/VAULT_TOOL_DONOR_REHARVEST_2026-09-24.md`
- `docs/migration/reference/VAULT_TOOL_DONOR_FEATURE_MAP_2026-09-24.md`

## UI references

- `docs/ui/VAULT_ASSET_MODULE_REFERENCE_PARITY.md`
- `docs/architecture/SUBTOOLBOX_PRIMITIVE_SYSTEM_V1.md`
- `docs/ui/toolbox-system/README.md`
- `docs/ui/toolbox-system/MANIFEST.md`

## Vault task workspace

- `tasks/viewtube-vault/CAPABILITY-MAP.md`
- `tasks/viewtube-vault/REHARVEST-GAP-REGISTRY.md`
- `tasks/viewtube-vault/REVISED-MERGE-PLAN.md`
- `tasks/viewtube-vault/SPEC-vault.md`
- `tasks/viewtube-vault/UI-DENSITY-AUDIT-2026-09-25.md`
- `tasks/viewtube-vault/plan.md`
- `tasks/viewtube-vault/todo.md`

The gap registry is historical discovery evidence. The living `todo.md` is more current for implementation status.

---

# 20. Standalone HTML / Library reference inventory

A Library-wide HTML inventory was consulted. Vault references should be retained as design/behavior provenance until production parity is confirmed.

## Core Vault module family

- `viewtube-vault-modules.html`
- `viewtube-vault-modules-updated.html`
- `viewtube-vault-modules-mobile-fixed.html`
- `viewtube_vault_paired_asset_modules.html`
- `viewtube_vault_compact_modules_adjusted.html`
- `viewtube_compact_modules_exact_ratios.html`
- `viewtube_matching_landscape_portrait_modules.html`
- `viewtube_matching_modules_refined.html`
- `viewtube_exact_media_adaptive_portrait_header.html`
- `viewtube_vault_30_color_module_variations.html`

Disposition:
preserve mobile-fixed / exact-ratio ideas, but consolidate them into the canonical `SubToolboxVaultAsset` component rather than creating parallel production components.

## Tags / notes / scrollbar family

- `viewtube_vault_refined_tag_controls.html`
- `viewtube_vault_shared_alphabetical_tags.html`
- `viewtube_vault_tag_controls_corrected.html`
- `viewtube_vault_audio_docs_rows_spectrum_fixed.html`
- `viewtube_vault_ranked_spectrum_swapped_landscape.html`
- `viewtube_vault_landscape_notes_side_tags_bottom_editable_titles.html`
- `viewtube_vault_scrollbar_exact_palette_tags.html`
- `viewtube_vault_flush_scrollbars_editable_titles_tag_header.html`
- `viewtube_vault_fixed_notes_scrollbars_inline_tag_plus.html`
- `viewtube_vault_with_audio_document_modules.html`

Disposition:
behavior/style provenance until tag editing, title editing, media ratios, document/audio presentation, notes ownership, and scroll behavior are all represented in production.

## Vault toolbox/dashboard family

- `viewtube_vault_toolbox.html`
- `viewtube_vault_toolbox_functional.html`
- `viewtube_vault_toolbox_WORKING.html`
- `viewtube_vault_mega_dashboard (1).html`
- `viewtube_studio_vault_FIXED_with_designs.html`

Disposition:
working/fixed versions are recovery references, not authorities.

## New compact asset-module concept

- `ViewTube_Vault_10_Compact_Grid_Asset_Module_Concepts_2026-09-25.html`

This is especially relevant to `RH-UX128`/`RH-UX129`.

## Other Library inventory resources

- `STANDALONE_HTML_PROTOTYPE_INVENTORY_LIBRARY_WIDE.md`
- `STANDALONE_HTML_PROTOTYPE_INVENTORY_LIBRARY_WIDE.html`
- `STANDALONE_HTML_PROTOTYPE_INVENTORY_LIBRARY_WIDE.docx`

Use the inventory before deleting or renaming old HTML references.

---

# 21. PR / merge history

## PR #425
**SUPERSEDED — Plan ViewTube Creator Vault production build**  
Merged: `3c3754dec0d47a8e87e913fd10519794ac972a74`  
Historical planning provenance only. Donor analysis superseded by #428.

## PR #426
**Build Creator Vault production route and Import Station**  
Merged: `51feb45754d7216befe65afc37aa95f2a4d89274`  
Lane A baseline.

## PR #427
**Add canonical media player and 15 media UI primitives**  
Merged: `c4a00f0c5960f9d3bb6cc6bec6c410911f2b283c`  
Important because Vault Quick Look/media preview should use canonical media primitives.

## PR #428
**Re-harvest Vault-Tool donor and reset Vault merge plan**  
Merged: `2f4ca01ba34e74a73c42b6bbb038a30318126f60`  
Current donor-harvest authority.

## PR #429
**Repair Vault Lane A selection, import modes, and Quick Look**  
Merged: `9ef7d669c1514edc91653824f3ecd9c2d3387e0e`

## PR #439
**Fix shared Toolbox ChevronDown runtime crash**  
Merged: `4c54969188375713752940f5ce6e47f3d6dd6a7b`

This fixed the phone runtime crash:
`Can't find variable: ChevronDown`

Root cause:
`Toolbox.tsx` rendered `<ChevronDown>` without importing it.

## PR #440
**Vault Wave 2 — unified asset operations and organization workflows**  
Merged: `f3898dc3f7199d7f0433b16641f618b9c6d04b36`

## PR #441
**Vault Wave 2B — unify Asset Operations and add editor/group tools**  
Merged: `52f655a5d3cb5bc2d16fc8a285a8b129bb3b9f1a`

Important:
the final corrected module ownership was subsequently brought into main:
- Asset Operations = Search/Batch/Groups/Tools
- Import & Tags = separate combined tool
- Text Editor = separate tool

---

# 22. Render / preview state

Vault Wave 2 preview:
`https://viewtube-vault-wave2-live.onrender.com/vault`

Service:
`viewtube-vault-wave2-live`

At handoff the latest recorded live preview deployment was:
- commit `481c1b94095344aa6992c8661cd99e42d986df95`
- message: `docs(vault): add compact Vault UX redesign task lane`
- status: `live`

This preview is useful for visual testing but is tied to the Vault Wave 2 branch and should not be assumed to equal the newest unrelated changes on `main`.

Past preview issue:
Vite blocked a Render host until it was added to `preview.allowedHosts`.

Do not repeat that failure when creating a new preview service.

---

# 23. Important resolved incidents

### `listVaultScratchpads` runtime failure
Earlier mobile preview crashed because a referenced Vault function was unavailable.
This was repaired during the build.

### Vault missing from navigation
The mobile nav initially had no Vault link.
Vault was added between Editor and Settings with regression coverage.

### thumbnails missing
Asset modules initially showed generic placeholders.
Image/video preview extraction was added and imported preview metadata is now used.

### asset card editing
Editable:
- title;
- tags;
- notes;
- project association;
- lifecycle;
- protection;
- rights;
- custom fields.

### Vite Render host block
Render preview originally showed:
`Blocked request. This host ... is not allowed.`
The preview host was added to `vite.config.ts`.

### `ChevronDown` main runtime crash
See PR #439 above.

---

# 24. Toolbox/SubToolbox UI authority that the Vault must obey

Current production hierarchy:

- T0 Main Toolbox: 80px header / 5px stroke / radius 16 / shadow 10 / title 26px
- T1 SubToolbox: 56px / 4px / radius 12 / shadow 6 / title 20px
- T2: 48px / 3px / radius 8 / shadow 4 / title 18px
- T3: 32px / 2px / radius 6 / shadow 2 / title 12px

Mobile shell density may shrink geometry, but **module titles do not get reduced into unreadable type; they wrap**.

Canonical 12-color spectrum:
- `#FA618A`
- `#FF7F6B`
- `#FFA85C`
- `#FFDA47`
- `#C0F240`
- `#3FEE56`
- `#4EE4BE`
- `#36E0F6`
- `#528FFA`
- `#A467F4`
- `#F55EFC`
- `#FF7AC8`

Current design authority also says:
- avoid production black text/borders where current VT Ink tokens should be used;
- pair colors through canonical palette variables;
- split-left rails stay square;
- one strong module shell, not endless nested heavy outlines;
- module titles wrap rather than ellipsize;
- dense controls may resize internally, module titles may not;
- portrait/landscape must preserve function and state.

The latest Vault audit explicitly notes that Vault asset CSS still hard-codes black/white too heavily. Treat this as a cleanup target during the compact redesign.

---

# 25. Recommended next-agent execution sequence

## Startup — do this before changing code

1. Read this handoff.
2. Read:
   - `tasks/viewtube-vault/UI-DENSITY-AUDIT-2026-09-25.md`
   - `tasks/viewtube-vault/todo.md`
   - `docs/architecture/VIEWTUBE_TOOLBOX_UI_MASTER_RESOURCE.md`
   - `docs/architecture/VIEWTUBE_CREATOR_VAULT_IMPLEMENTATION_PLAN_2026-09-24.md`
3. Inspect current `main`, not an old PR branch.
4. Verify current `CreatorVaultOS.tsx` ownership:
   - Import & Tags combined;
   - Text Editor separate;
   - Asset Operations only Search/Batch/Groups/Tools.
5. Load the Test-Driven Development skill before behavior/code changes.
6. Create a new branch from current main.
7. Never commit directly to main.

## Next implementation wave: Compact UX A

### UX-A1 — Workspace settings
Implement `RH-UX120`.

- remove Workspace Controls from document flow;
- add Workspace/Layout menu button;
- mobile sheet / desktop popover;
- move density, Arrange Mode, visibility there;
- preserve persisted state.

Regression requirement:
default page no longer renders the giant Hide/Show button stack.

### UX-A2 — Library toolbar
Implement `RH-UX121`.

Replace persistent Navigator module with one compact toolbar:
- search;
- state;
- Filters;
- Sort;
- View;
- Workspace.

Advanced metadata filters open a sheet/popover.
Smart Collection save belongs inside filter context.

### UX-A3 — Library drawer
Implement `RH-UX122` and `RH-UX123`.

Mobile drawer / desktop rail:
- Projects;
- Collections;
- Brand Kit;
- Unassigned;
- Smart Collections.

Remove creation actions from navigation.
Collection/Brand Kit creation remains Group Builder responsibility.

## Compact UX B — selection actions and handoffs

Implement `RH-UX124` and `RH-UX125`.

When selection count > 0:
show contextual Selection Action Bar:
- Tag
- Batch
- Group
- Compare
- Metadata
- Export
- Send to ViewTube…

Move external destinations into `Send to ViewTube…`.

External destinations must never look like native Vault tools.

## Compact UX C — asset cards

Implement `RH-UX128`, `RH-UX129`.

Target compact card:
- edge-to-edge media;
- natural ratio;
- title;
- one compact metadata row;
- 2–3 tags + overflow;
- no permanent Notes block;
- selected card only gets a tiny contextual action strip;
- document: excerpt;
- audio: waveform/compact representation;
- image/video: ratio-aware preview.

Use:
- `docs/ui/VAULT_ASSET_MODULE_REFERENCE_PARITY.md`
- Library HTML Vault module families
- `ViewTube_Vault_10_Compact_Grid_Asset_Module_Concepts_2026-09-25.html`

Do not copy prototype CSS wholesale.

## Compact UX D — Task Center and Inspector

Implement:
- `RH-UX130`
- `RH-UX131`
- `RH-UX132`
- `RH-UX133`

Task Center:
compact when idle.

Inspector:
mobile bottom sheet / contextual reveal.
Desktop wide right rail.

Remove duplicate tag/filter affordances and heavy nested framing.

## Compact UX E — certification

Implement:
- `RH-UX134`
- `RH-UX135`

Acceptance:
- first assets visible in first viewport;
- pre-library chrome <= 180 CSS px;
- no clipped segmented controls 320–430 px;
- portrait/landscape preserve selection/filter/scroll;
- screenshot pass portrait, landscape, desktop;
- no external handoff looks Vault-native;
- asset media region dominates card chrome.

Only after this UX wave should the next agent return to low-priority Vault feature additions.

---

# 26. Processing work after UX

After the compact UX is stable:

1. `RH-A019` full current-main certification.
2. Design real provider/storage interfaces for:
   - Vision suggestions;
   - local speech-to-text;
   - durable proxy derivatives.
3. Do not implement these until the backend seam is genuine.
4. Continue Projects donor work in Projects owner.
5. Continue Editor donor work only after VT_E1 audit.
6. Continue Packaging/Hook/Video Manager/Analytics donor slices in their owners.

---

# 27. Required verification commands

Repository scripts at handoff:

```text
npm run typecheck
npm run test
npm run build
npm run lint:runtime
npm run check:architecture
npm run check:css
```

For Vault changes:
- run focused Vault Vitest files first;
- then relevant full suite;
- then typecheck;
- then build;
- then browser/mobile verification.

Render compilation has been used as a practical integration gate, but it is not a replacement for tests.

A GitHub Macroscope correctness check was skipped previously because of external billing state; do not count a skipped external check as code verification.

---

# 28. TDD rule for the next agent

Behavior changes should follow:

1. add/update a regression test that fails for the missing behavior;
2. implement the smallest production change;
3. run focused tests;
4. expand verification;
5. keep the feature in its canonical owner.

For source-architecture changes, the project has several source-contract tests that intentionally inspect `CreatorVaultOS.tsx`. Preserve or improve them rather than deleting tests merely because the file is being refactored.

---

# 29. Things the next agent must not do

- Do not rebuild old standalone Navigator/Explorer behavior under new names.
- Do not put Text Editor back inside Asset Operations.
- Do not split Import Station and Spectrum Tags into separate first-class tools.
- Do not make external ViewTube destinations look Vault-native.
- Do not reintroduce free-text fake Project assignment.
- Do not invent another Vault asset store.
- Do not duplicate Project/ContentBuild.
- Do not silently mutate tags from AI suggestions.
- Do not simulate processing with timers/random values.
- Do not persist temporary browser object URLs as durable proxies.
- Do not add fake PDF/DOCX exports.
- Do not transplant donor CSS or state wholesale.
- Do not commit directly to `main`.
- Do not call UX complete because it technically “fits” on a phone; the acceptance criteria are about natural use and information priority.

---

# 30. Definition of done for the Creator Vault

Vault is complete when:

### Identity / organization
- canonical assets stay stable across views/actions;
- Projects/Collections/Brand Kit are relationships, not clones;
- lifecycle/protection rules are enforced at service level;
- versions/derivatives/duplicates are explicit.

### Intake
- real direct/staged ingestion;
- factual metadata;
- durable file/storage architecture;
- duplicates;
- real background jobs;
- no pretend processing.

### Browsing
- fast Grid/Masonry/Filmstrip/List/Timeline/Lineage;
- useful logical navigation;
- compact mobile experience;
- first asset visible quickly;
- media-first cards.

### Search
- metadata-rich filtering;
- Smart Collections;
- custom schema columns;
- text/transcript/OCR integration when real.

### Editing
- lightweight metadata/tags/notes/rights/text/captions;
- specialist edits handed to owning tools.

### Cross-tool
- canonical ActionPackets;
- Project/ContentBuild integration;
- external tools clearly presented as handoff destinations.

### Responsive UX
- mobile portrait;
- mobile landscape;
- desktop;
- no clipped controls;
- no giant configuration wall;
- no duplicate ownership;
- preserved selection/filter/view/scroll state.

### Verification
- regression coverage;
- typecheck;
- build;
- browser screenshots;
- no simulated processor represented as real.

---

# 31. One-paragraph handoff to the next agent

Start from the latest `main`. Do **not** spend another cycle discovering Vault features: most Vault-native capability is already implemented. The immediate problem is the mobile information architecture documented in `UI-DENSITY-AUDIT-2026-09-25.md`. Begin with `RH-UX120`–`RH-UX135`: remove Workspace Controls from the page, collapse Navigator into a compact Library toolbar, turn Explorer into a drawer/rail, convert Asset Operations into contextual selection actions, separate external destinations under “Send to ViewTube…”, and redesign `SubToolboxVaultAsset` into a media-first compact card. Preserve the corrected ownership that already exists on main: **Import & Tags is one tool, Text Editor is its own tool.** Use tests first, keep all existing canonical asset/Project/ContentBuild/handoff contracts, and only return to Vision/STT/proxy work after the compact Vault passes mobile portrait/landscape acceptance.

---

# 32. Quick reference paths

**Live Vault preview**  
`https://viewtube-vault-wave2-live.onrender.com/vault`

**Primary code**  
`src/views/CreatorVaultOS.tsx`

**Current UX audit**  
`tasks/viewtube-vault/UI-DENSITY-AUDIT-2026-09-25.md`

**Living task ledger**  
`tasks/viewtube-vault/todo.md`

**Re-harvest authority**  
`docs/migration/reference/VAULT_TOOL_DONOR_REHARVEST_2026-09-24.md`

**Vault implementation plan**  
`docs/architecture/VIEWTUBE_CREATOR_VAULT_IMPLEMENTATION_PLAN_2026-09-24.md`

**Toolbox UI authority**  
`docs/architecture/VIEWTUBE_TOOLBOX_UI_MASTER_RESOURCE.md`

**Asset Engine authority**  
`docs/architecture/VIEWTUBE_ASSET_ENGINE_MASTER_RESOURCE.md`

**Projects/ContentBuild authority**  
`docs/architecture/VIEWTUBE_PROJECTS_CONTENTBUILD_WORKFLOW_MASTER_RESOURCE.md`

**Asset module parity**  
`docs/ui/VAULT_ASSET_MODULE_REFERENCE_PARITY.md`

---

## Final handoff principle

The Vault has reached the point where **adding more controls can make it worse even when the features are good**.

The next phase is not “more modules.” It is:
- clearer ownership;
- fewer persistent surfaces;
- contextual actions;
- compact navigation;
- media-first assets;
- obvious internal-vs-external tool boundaries;
- preserving all the power already built while making that power feel natural.
