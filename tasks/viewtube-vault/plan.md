# ViewTube Creator Vault — Revised Implementation Plan

## Reset reason

The uploaded donor ZIP proved the earlier plan captured the large systems but missed several interaction/workflow details and cross-tool donor opportunities. This plan replaces the previous single-owner merge assumption.

## Phase 0 — planning and merge reset

- merge the re-harvest authority documents;
- mark PR #425 as superseded by this newer current-main plan;
- do not wholesale merge Vault-Tool;
- reconcile PR #426 against this plan;
- keep PR #426 limited to Lane A.

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

Before merge add:
- Shift range selection;
- direct/staged intake distinction or explicit follow-up contract;
- compatibility with current main and media-player primitives;
- route + service tests.

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
