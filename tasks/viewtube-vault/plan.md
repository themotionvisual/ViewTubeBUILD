# ViewTube Creator Vault — Revised Implementation Plan

## Reset reason

The uploaded donor ZIP proved the earlier plan captured the large systems but missed several interaction/workflow details and cross-tool donor opportunities. This plan replaces the previous single-owner merge assumption.

## Phase 0 — planning and merge reset

- merge the re-harvest authority documents;
- PR #425 is historical planning provenance; this plan supersedes its donor analysis;
- PR #426 already merged and is the Lane A implementation baseline;
- do not wholesale merge Vault-Tool;
- audit current main against this revised plan before continuing follow-on donor features.

## Phase 1 — Lane A: Vault foundation

- real /vault route;
- canonical Toolbox/SubToolbox shell;
- Asset Library / Navigator / Inspector;
- search/filter/sort;
- Spectrum Tags;
- base workspace persistence;
- multi-select;
- base Batch Processor;
- base Import Station.

Follow-up repairs on the merged baseline:
- Shift range selection;
- direct/staged intake distinction;
- compatibility with PR #427 media-player primitives;
- route + service tests and rendered verification.

## Phase 2 — Lane B: interaction and organization

- Space Quick Look using canonical media-player primitives;
- Esc close behavior;
- Cmd/Ctrl+K Vault command/search action;
- Cmd/Ctrl+G create/attach project from selection;
- split-pane explorer;
- chronological timeline;
- Smart Collections;
- Favorites / Inbox / Archive / Trash;
- workspace Arrange Mode;
- module visibility preferences;
- optional 2/3-column density preference;
- saved scratchpad/checklist panels.

## Phase 3 — Lane C: intake and processing jobs

- global drag/drop capture;
- file metadata extraction;
- image dimensions;
- video duration/resolution;
- video thumbnail frame extraction;
- direct import;
- staged editable intake drafts;
- content hash;
- duplicate check;
- per-item accept/reject;
- real scanner/job lanes for EXIF/vision/transcript only when backed;
- proxy derivative job;
- progress/retry/error/task center.

## Phase 4 — Lane D: versions, captions, dependency projection

- version carousel;
- detach version preserving lineage;
- lineage/usage/rights;
- transcript/caption linked artifact;
- timestamped caption editor;
- real SRT/VTT export when available;
- transcript → Script derivative;
- project/content-build creation from selected assets;
- dependency/readiness projection;
- manifest JSON;
- factual package/storage size.

## Phase 5 — Lane E: Project Builder / Board donor upgrades

- map donor nine-stage creator lanes to canonical ContentBuild lifecycle;
- priority;
- due date;
- detail tabs;
- core promise/audience/runtime;
- phase progress;
- storyboard shot records;
- title drafts + primary selection;
- phased checklists;
- derive phase progress from checklist completion;
- script word/read-time;
- linked Vault picker;
- BrainRuntime project research handoff;
- published metric projection.

## Phase 6 — Lane F: Editor/media donor upgrades

Only after VT_E1 gap audit:
- default Create Derivative;
- explicit overwrite guard;
- batch transform request;
- trim/crop/color/LUT gaps;
- alias filename;
- protected asset enforcement.

## Phase 7 — Lane G: other matching-tool harvests

Separate PRs:
- End Screen/Packaging reference image + 16:9 + layout/palette controls;
- Hook polish modes + timing simulator;
- Video Manager tag/playlist UX if missing;
- Analytics report structured chart suggestions if useful;
- Shorts/keyframe/snapping only if current VT_E1 lacks equivalent.

## Testing and certification

Every lane:
- tests first for behavior changes;
- typecheck;
- focused Vitest;
- full relevant suite;
- build;
- changed-file lint;
- browser verification;
- desktop/mobile portrait/mobile landscape;
- keyboard/touch/accessibility;
- no simulated processor presented as real.

## Definition of done

The donor is fully harvested when every useful behavior has one of:
- implemented in canonical owner;
- explicitly scheduled in gap registry;
- verified already present;
- explicitly rejected with reason.

No valuable donor capability should remain discoverable only inside the donor ZIP.


## Phase 2B — Vault mobile density / information architecture redesign

This phase is a UX architecture reset driven by the 2026-09-25 mobile screenshot audit. It does not remove Vault capabilities; it changes where they live and when they are visible.

### Architecture decisions
- Asset Library becomes the primary surface and should appear immediately after a compact Library toolbar.
- Workspace Controls leaves normal document flow and becomes a Workspace/Layout popover or mobile sheet.
- Navigator stops being a standalone SubToolbox. Search, state, view, filter, and sort move into the Library toolbar; advanced metadata filters move into a sheet/popover.
- Explorer stops being a standalone mobile SubToolbox. Logical browsing becomes a Library drawer/desktop rail containing Projects, Collections, Brand Kit, Unassigned, and saved Smart Collections.
- Asset Operations stops being a persistent full-page module. Selection-dependent actions become a contextual Selection Action Bar.
- External destinations are labeled **Send to ViewTube…** and separated visually from Vault-native actions.
- Import & Tags remains one independent SubToolbox with TAGS / IMPORT modes.
- Text Editor remains its own independent SubToolbox.
- Task Center defaults to a compact status entry unless work is running, failed, or explicitly opened.
- Inspector is contextual: bottom sheet / scroll target on mobile, persistent right rail on wide desktop.

### Asset-card redesign
- replace the fixed preview + always-visible tags/notes split with a media-first card;
- use source aspect ratio and remove unnecessary preview letterboxing;
- default card shows media, title, compact metadata, and a small tag summary;
- notes and deep metadata move to Inspector;
- document cards show text excerpts, audio shows waveform/metadata, video shows extracted still;
- selected cards may expose a small contextual action row, not a second Inspector.

### Responsive targets
- portrait mobile: toolbar + asset browser first, drawers/sheets for secondary controls;
- landscape mobile: asset browser plus optional Inspector/detail rail;
- desktop: compact left Library rail + center Asset Library + right Inspector;
- preserve selection, filters, view mode, scroll position and workspace state across orientation changes.

### Verification targets
- first asset content is visible in the first viewport on a normal return visit;
- pre-library default control chrome is <= 180 CSS px;
- no full-width module-visibility button stack in page flow;
- no clipped segmented controls at 320–430 CSS px;
- no duplicated ownership between Library toolbar, Library drawer, Selection Action Bar and Inspector;
- external ViewTube destinations cannot be mistaken for Vault-native tools;
- empty notes/status areas do not reserve card height;
- asset-card non-media chrome <= 96px in compact mode;
- desktop, portrait and landscape screenshots pass a single bounded UI audit.
