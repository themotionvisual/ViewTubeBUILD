# ViewTube Vault Donor Re-Harvest — Revised Merge Plan

**Status:** implementation gate  
**Base:** current main after PR #427  
**Replaces:** the earlier single-owner donor merge assumption.

## Rule 1 — Do not merge the donor repository

No git merge, subtree merge, or wholesale file transplant from Vault-Tool.

Every donor capability is reimplemented in the current canonical owner.

## Rule 2 — Pause feature expansion in PR #426 until reconciliation

PR #426 contains useful Wave-1 Vault work. It should not be discarded, but it must be reconciled against this plan before merge.

Keep if compatible:
- production /vault route;
- Toolbox/SubToolbox shell;
- Asset Library / Navigator / Inspector;
- canonical Spectrum Tags;
- initial Import Station;
- workspace query/filter persistence;
- identity-safe Vault mutations;
- multi-select and basic batch tagging/rename/project assignment.

Rework before merge where required:
- add current-main changes from PR #427;
- align media preview with newly merged media-player primitives;
- separate pre-ingest intake batching from post-ingest Batch Processor;
- ensure direct/staged ingest contract;
- add range selection behavior;
- ensure route/tests still match newest main.

Do not add more unrelated owner features to #426.

## Merge lanes

### Lane A — Vault foundation
PR #426 after rebase/reconciliation.
Scope:
- route/shell;
- library;
- search/filter/Spectrum Tags;
- base inspector;
- first Import Station;
- base Batch Processor.

### Lane B — Vault interaction + organization
New PR.
Scope:
- Shift range selection;
- keyboard commands;
- Quick Look using canonical media player;
- split explorer;
- timeline view;
- Smart Collections;
- Favorites/Archive/Trash/Inbox;
- workspace layout/module preferences;
- scratchpads.

### Lane C — Intake jobs + metadata
New PR.
Scope:
- local image/video metadata extraction;
- generated video thumbnail;
- direct vs staged ingest;
- content hash;
- real job model for EXIF/vision/transcript/proxy;
- retry/error/progress;
- duplicate preflight.

### Lane D — Versions / lineage / captions / dependency projection
New PR.
Scope:
- version carousel;
- detach version;
- lineage/usage/rights;
- transcript/caption linked assets;
- caption→script derivative;
- Project/ContentBuild readiness projection;
- manifest export.

### Lane E — Projects donor upgrades
Dedicated Projects PR.
Scope:
- priority/due date;
- phase progress;
- detail tabs;
- storyboard shots;
- title drafts;
- phased checklist;
- checklist-derived progress;
- linked Vault picker;
- project AI research handoff;
- published stats projection.

### Lane F — Editor/media transform donor upgrades
Dedicated Editor PR after editor-master comparison.
Scope:
- derivative-vs-overwrite UI/guard;
- batch transform request;
- crop/color/LUT/trim gaps only if missing.

### Lane G — Packaging/Hook/other matching-tool harvests
Separate scoped PRs:
- End Screen/Packaging;
- Hook polish/simulator;
- Video Manager interaction upgrades;
- conditional Shorts/editor improvements;
- analytics report ideas.

## Merge order

1. Merge this planning/re-harvest authority.
2. Rebase PR #426 on newest main.
3. Run focused tests/typecheck/build and browser certification.
4. Merge Lane A only if green.
5. Build Lanes B/C in parallel after Lane A contracts are stable.
6. Build Lane E independently against current Projects contracts.
7. Build Lane D after Asset Engine/version relation audit.
8. Schedule F/G only after owner-specific current-code gap checks.

## Completion guard

No donor feature is considered complete merely because equivalent UI is visible.

Each feature must have:
- canonical owner;
- canonical IDs;
- persistence semantics;
- test;
- loading/empty/error state;
- mobile portrait + landscape behavior;
- accessibility;
- real processing or explicit handoff;
- provenance for created derivative assets.
