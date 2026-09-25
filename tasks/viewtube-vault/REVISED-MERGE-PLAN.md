# ViewTube Vault Donor Re-Harvest — Revised Merge Plan

**Status:** implementation gate  
**Base:** current main after PR #427  
**Replaces:** the earlier single-owner donor merge assumption.

## Rule 1 — Do not merge the donor repository

No git merge, subtree merge, or wholesale file transplant from Vault-Tool.

Every donor capability is reimplemented in the current canonical owner.

## Rule 2 — Treat merged PR #426 as Lane A baseline

PR #426 merged before this re-harvest plan was finalized. Its code is now part of current main and must be audited, not rebased.

Baseline retained from #426:
- production /vault route;
- Toolbox/SubToolbox shell;
- Asset Library / Navigator / Inspector;
- canonical Spectrum Tags;
- initial Import Station;
- workspace query/filter persistence;
- identity-safe Vault mutations;
- multi-select and basic batch tagging/rename/project assignment.

Required follow-up audit on current main:
- align media preview with PR #427 media-player primitives;
- separate pre-ingest intake batching from post-ingest Batch Processor;
- add direct/staged ingest contract;
- add Shift range selection;
- verify tests/build/browser behavior;
- repair any merge interaction introduced by #427 or newer main.

Do not reopen #426 as a catch-all donor branch. Follow-on owner features move through Lanes B-G.

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

1. Merge this planning/re-harvest authority (#428).
2. Audit the already-merged Lane A baseline from #426 on current main.
3. Repair Lane A gaps in a small follow-up PR: range selection, direct/staged ingest, media-player alignment, verification.
4. Build Lanes B/C in parallel after Lane A contracts are stable.
5. Build Lane E independently against current Projects contracts.
6. Build Lane D after Asset Engine/version relation audit.
7. Schedule F/G only after owner-specific current-code gap checks.

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
