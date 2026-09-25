# Vault-Tool Full Donor Re-Harvest — 2026-09-24

**Status:** current donor-harvest authority  
**Source:** uploaded `Vault-Tool-main.zip` plus current `themotionvisual/Vault-Tool` repository  
**Target:** ViewTubeBUILD current main  
**Policy:** donor behavior, information architecture, workflows and interaction patterns are reference material. Rebuild against current ViewTube owners, contracts, Toolbox/SubToolbox UI and CSS. Do not transplant legacy state stores, provider calls, simulated processors, or donor styling wholesale.

## Executive finding

The donor is not just a Vault prototype. It is a broad creator-workflow reference containing useful ideas for:

- Creator Vault
- Project Builder / Project Board
- Editor / Shorts
- Hook / Storyboard / Video Director
- End Screen / Packaging / Publisher
- Pre-Launch Priming
- Video Manager
- Analytics / Brain reports

The correct merge strategy is therefore an **owner-by-owner harvest**, not a repository merge and not a monolithic Vault PR.

## Classification vocabulary

- **EXISTS** — current ViewTube already owns an equivalent capability; do not rebuild.
- **IMPROVE** — current owner exists but donor has a useful interaction/workflow improvement.
- **MISSING** — useful capability not materially present on current main.
- **HANDOFF** — Vault should launch/receive results but another system owns execution.
- **REFERENCE** — keep interaction/design idea only.
- **REJECT** — mock-only, duplicate authority, obsolete architecture, or otherwise not suitable.

# 1. Creator Vault harvest

## 1.1 Library and navigation

| Donor behavior | Source | Target | Status | Disposition |
|---|---|---|---|---|
| Grid/list asset presentation | VaultOS | Vault Asset Matrix | EXISTS/IMPROVE | Continue canonical implementation |
| Split-pane explorer with logical directory rail | VaultOS | Vault Library / Smart Collections | MISSING | Rebuild using saved logical views, not physical folders |
| Chronological upload timeline | VaultOS | Vault Library | MISSING | Add TIMELINE view |
| 2-column / 3-column workspace density | VaultOS | Vault workspace preferences | MISSING | Add responsive density/layout preference where useful |
| Module visibility controls | VaultOS | Vault workspace customization | MISSING | Add per-workspace module visibility preferences |
| Reorderable Vault modules | VaultOS | Vault workspace customization | MISSING | Add optional Arrange Mode using canonical reorder primitive |
| Persistent SubToolbox open state | VaultOS | Toolbox system | EXISTS | Use existing workspaceUiPersistence |
| User-created scratchpad panels | VaultOS | Vault Notes / Workspace panels | MISSING | Rebuild as lightweight saved scratchpad/checklist panels tied to workspace/project |
| Folder-style quick views | VaultOS | Smart Collections | IMPROVE | Express as saved rule-backed views |

## 1.2 Selection and keyboard UX

| Behavior | Status | Target |
|---|---|---|
| Cmd/Ctrl-click multi-select | PARTIAL | Vault Asset Matrix |
| Shift-click contiguous range selection over visible order | MISSING | Vault Asset Matrix |
| Sticky selection action rail | PLANNED/PARTIAL | Batch Processor |
| Cmd/Ctrl+K focus Vault search / invoke commands | MISSING | Vault command UX |
| Cmd/Ctrl+G create project/bundle from selection | MISSING | Vault → Projects handoff |
| Spacebar Quick Look | MISSING | Quick Look |
| Escape closes active overlay/preview | MISSING | Vault page interaction contract |
| M toggles audio preview mute | MISSING | Quick Look/media preview |
| Context-sensitive per-asset tool launcher | MISSING | Vault action menu filtered by asset kind |
| transient operation HUD/toast | EXISTS generically / MISSING in Vault | canonical toast/status primitive |

## 1.3 Import Station — pre-canonical batching

The donor proves intake batching is a separate subsystem from post-ingest batch processing.

Accepted behaviors:

- global drag/drop capture from the Vault workspace;
- file picker batch selection;
- intake fork: **Import Directly** vs **Review in Staging**;
- pending ingestion queue;
- selected pending item inspector;
- per-item editable name;
- per-item type reclassification;
- per-item Spectrum Tags;
- size/spec display;
- accept / reject per item;
- accept all;
- real background task statuses;
- retry/error state;
- optional destination Project/Collection;
- content-hash duplicate preflight;
- metadata extraction;
- generated proxy/thumbnail state where supported.

### Newly promoted missing intake capabilities

1. **Local metadata extraction before ingest**
   - image dimensions;
   - video duration;
   - video width/height/resolution;
   - generated video thumbnail frame;
   - MIME/type;
   - formatted byte size.

2. **Ingest routing choice**
   - Direct → canonical Vault record with minimal preprocessing.
   - Staged → editable intake draft, scanners/jobs, then canonical record.

3. **Independent scanner/task lanes**
   - voice/transcript;
   - visual indexing / suggested tags;
   - EXIF/media metadata.
   
   Donor timer simulations are REJECTED. Implement only when backed by real worker/provider/job APIs.

4. **Per-item proxy job**
   - queued / processing / completed / failed;
   - proxy becomes a derivative/alternate representation, never silent mutation.

## 1.4 Post-ingest Batch Processor

Accepted operations:

- mass tag/untag;
- rename prefix/suffix/pattern;
- project assignment;
- collection assignment;
- lifecycle changes;
- custom metadata;
- favorite/archive/trash/restore;
- metadata export;
- ZIP/package export;
- Send To;
- clear selection.

### Newly separated capability: transform macro batching

Donor MediaClipper can apply one configured set of color/crop/media settings across multiple assets.

**Decision:** do not implement this inside metadata Batch Processor. Add a separate **Batch Transform Request** contract that hands selected asset IDs + transform settings to Editor/media-processing owner and returns derivative asset IDs.

## 1.5 Asset preview, inspector and versions

Newly promoted interactions:

- inline version carousel on an asset card;
- explicit **Detach Version as Independent Asset** action;
- parent/child relation preserved when detached;
- Quick Look from selection;
- image/video/audio/document-aware preview;
- asset-type-specific quick actions;
- logical folder/collection context in split explorer;
- chronological upload timeline.

The existing plan already covers version/derivative/duplicate semantics, lineage, rights and usage; this re-harvest adds the concrete card/preview interactions above.

## 1.6 Transcript and caption asset workflow

Previous plan only described transcription as a handoff. Donor code shows a useful Vault-facing workflow:

- open transcript/caption asset from a video/audio asset;
- timestamped caption-line editor;
- save captions back as a linked caption asset/version;
- export real SRT/VTT when supported;
- **Convert transcript/captions into a new Script document asset**;
- preserve source media relationship;
- Send To Script Architect / Storyboard / Editor.

Execution remains owned by caption/transcription services; Vault owns linked artifacts and light editing.

## 1.7 Project Bundler / dependency projection

Donor Project Bundler should not become another project store.

Rebuild as a **ContentBuild Dependency / Readiness projection**:

- asset counts by role/type;
- selected/final asset slots;
- missing required dependencies;
- package readiness;
- estimated package size where real storage metadata exists;
- export manifest JSON;
- create project/content build from current selection;
- attach current selection to existing project;
- dependency graph links to Vault assets.

This belongs across Vault + Asset Engine + Projects.

## 1.8 Storage telemetry

Donor shows storage usage and media-type breakdown.

Add only if backed by real provider facts:
- total bytes;
- provider quota if available;
- bytes by asset type;
- proxy/derivative storage;
- largest assets;
- cleanup candidates.

Do not fabricate capacity.

# 2. Projects / Kanban harvest

Current ViewTube already owns Project Builder, Project Board, Calendar, ContentBuild and Content Asset Engine. Donor state arrays are REJECTED.

## Newly confirmed useful gaps

- priority on project card/details;
- due date separate from publish target when needed;
- nine creator-facing lanes mapped onto canonical ContentBuild lifecycle;
- search/filter board;
- detail workspace tabs:
  OVERVIEW / NOTES / SCRIPT / STORYBOARD / ASSETS / PACKAGING / CHECKLIST;
- core promise;
- target audience;
- estimated runtime;
- phase progress:
  research / script / shoot / edit / package;
- storyboard shot records with type + description + optional thumbnail;
- multiple title drafts with explicit Set Primary;
- pre-production / production / post-production checklists;
- checklist completion automatically recomputes phase progress;
- linked Vault asset picker using canonical asset IDs;
- script word count + estimated read time;
- published stats projection from analytics truth;
- project-scoped AI Topic Researcher that writes a reviewed result into project notes/evidence;
- create project from selected Vault assets;
- project readiness/dependency view.

## Merge rule

Board drag/drop may remain where current ViewTube already implements it. Every movement must call canonical Project/ContentBuild transitions. No donor local stage store.

# 3. MediaClipper / Editor harvest

Target owner: VT_E1 / media-processing services. Vault only initiates handoffs and receives derivatives.

Useful donor interaction contracts:

- trim timeline/waveform;
- explicit in/out trim bounds;
- brightness / contrast / saturation;
- LUT/look preview;
- manual crop edges;
- aspect/output target;
- volume / mute preview;
- AI highlight proposal as a reviewable suggestion;
- apply configured settings to selected assets as a batch transform request;
- **Save as new derivative** vs **destructive overwrite** choice;
- generated alias/filename before derivative creation.

### Critical rule

Destructive overwrite must be disallowed for FINAL/GOLDEN/protected assets and must require explicit confirmation elsewhere. Default action is **create derivative**.

# 4. Rich document editor harvest

Target: Vault document workbench + Script Architect handoff.

Useful additions beyond old plan:

- reusable script structure templates;
- lightweight formatting controls;
- AI Brain refine;
- word count / reading-time metadata;
- Save as new version;
- real TXT/Markdown export;
- PDF/DOCX only when an actual serializer exists.

Donor fake PDF/DOCX blob export is REJECTED.

# 5. End Screen / Packaging harvest

Target: Packaging / End Screen / Publisher, not Vault.

Useful donor ideas:

- enforce/reference preview at 16:9;
- ingest reference image by drop/picker;
- multiple style selection with bounded count;
- editable brand color palette;
- end-screen layout presets (video/subscriber slot arrangements);
- dark/light shape theme;
- optional shape border;
- concept auto-refinement through BrainRuntime;
- generated background saved to Vault/Asset Engine;
- provider/engine choice belongs to Video Director/provider policy, not local page state.

# 6. Hook / Storyboard / Video Director harvest

Current ViewTube Hook Generator already creates ContentBuild-linked hook candidates and per-beat generated images/videos.

New donor improvements worth harvesting:

- niche/genre presets;
- tone dial;
- target hook duration;
- CTA/ending cue;
- per-result polish transforms:
  punch / controversy / curiosity / direct-callout;
- word count + estimated spoken duration;
- timed word-by-word preview simulator;
- explicit Copy / Save candidate / Send to Script actions;
- selected visual beats grouped into a downstream storyboard/generation handoff.

Do not duplicate current hook asset-generation pipeline.

# 7. Shorts / Editor donor harvest

Most donor ShortsStudio editing capability overlaps current VT_E1 and Video Director.

Potential improvements to audit against current editor before scheduling:

- explicit layer types: media/text/audio;
- keyframe records per layer;
- auto-keyframe when editing properties away from frame zero;
- toggle keyframe at playhead;
- snapping during drag/resize;
- prompt-driven caption generation;
- TTS generation;
- prompt-driven smart color grade;
- AI-generated media layers.

These are **REFERENCE / CONDITIONAL** until compared against the current editor master and code. Do not create a second Shorts editor.

# 8. Pre-Launch harvest

Current ViewTube already has PreLaunchPriming.

Donor concepts to retain only if missing in current implementation:
- audience-interest seeding poll blueprint;
- funnel teaser / Shorts concept tied to long-form title;
- use algorithm/channel diagnosis as context;
- persist generated launch artifacts into the active ContentBuild.

Likely IMPROVE, not new owner.

# 9. Video Manager harvest

Potential matching-tool improvements:

- editable tag badges;
- per-tag quality/score analysis;
- ranked suggested tags;
- add/remove/edit tag interactions;
- playlist membership diff (add/remove only changed memberships);
- thumbnail drag/drop replacement;
- debounced video search.

Audit current Video Manager before scheduling each item.

# 10. Analytics / report harvest

Useful reference ideas, subject to current Analytics master:

- compact tabular/CSV evidence sent to model instead of verbose JSON;
- AI result sections that include chart suggestions as structured config;
- strategy matrices / mini-spreadsheets;
- keyword momentum table;
- expandable chart detail view;
- saved report artifact.

Current analytics-canon and Brain remain truth owners.

# 11. Reject / do not port

- donor local Project/Vault arrays as truth;
- BrainBank localStorage as knowledge authority;
- browser-side provider keys / direct provider calls;
- timer/random simulated scanners;
- timer-simulated proxy/transcode;
- fake PDF/DOCX exports;
- fake processing actions that only show alerts;
- black-border donor visual system;
- duplicate editor/media engines;
- duplicate publishing state;
- duplicate analytics truth;
- random telemetry/quota values;
- hard-coded asset IDs and project IDs.

# 12. Merge decision summary

## Promote to revised Vault core
- Split-pane explorer
- Timeline view
- range selection
- keyboard contract
- direct-vs-staged intake
- local metadata/thumbnail extraction
- editable pending intake drafts
- real background task lanes
- version carousel + detach-version action
- asset-aware tool launcher
- transcript/caption linked-artifact workflow
- create Project/ContentBuild from selected assets
- dependency/readiness manifest projection
- optional workspace arrange/module visibility
- custom scratchpad/checklist panels
- storage telemetry when factual

## Promote to matching tools
- Project detail workspace + checklist-driven progress
- Editor derivative-vs-overwrite and macro batch transforms
- End Screen layout/reference/palette controls
- Hook polish modes + timed simulator
- conditional Shorts keyframe/snap improvements
- Video Manager tag/playlist interaction improvements
- analytics structured report ideas

## Already represented by current ViewTube / old plan
- canonical Toolbox/SubToolbox UI
- Spectrum Tags
- basic Vault search/filter
- current Project/ContentBuild identity
- Content Asset Engine
- hook visual asset generation
- workspace SubToolbox open persistence
- editor/Storyboard/Publisher canonical ownership
