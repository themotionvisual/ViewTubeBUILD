# Migration Hub

This folder is the archive-first workspace for Reference Studio consolidation and safe-prune analysis.

## Structure
- `logs/ACTION_LOG.md`: timestamped chronological execution log.
- `analysis/SYSTEM_REDESIGN_OPPORTUNITIES.md`: app-wide redesign/unification opportunities with rationale and impact.
- `manifests/USED_BY_APP_MANIFEST.md`: current runtime usage map from route entrypoints and downstream imports.
- `manifests/UNUSED_INVENTORY.md`: archive candidates with proof and restore path.
- `manifests/SOURCE_COMPONENT_MAP.md`: source-to-destination component traceability map.
- `archive_candidates/`: archive-first holding area for files moved out of active source tree.
- `sources/`: copies of source documents used during migration.

## Safety Rules
- Archive-first only in this pass (no hard deletes).
- Every archive move must be recorded in `ACTION_LOG.md` and `UNUSED_INVENTORY.md`.
- Restore path must be explicitly documented for each archived item.
