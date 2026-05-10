# UNUSED_INVENTORY

Archive-first candidate inventory. No hard deletion in this pass.

## Candidate Rules
- Candidate must have no import/reference from route-entry graph.
- Candidate is moved to `_migration_hub/archive_candidates/...` with restore path recorded.

## Confirmed Candidates (scan timestamp: 2026-04-08 15:38 EDT)
1. `src/components/ToolboxUISystem.tsx.broken`
- Status: confirmed-unused
- Evidence: no references found in `src` or `package.json`
- Archive target: `_migration_hub/archive_candidates/src/components/ToolboxUISystem.tsx.broken`
- Current location: `_migration_hub/archive_candidates/src/components/ToolboxUISystem.tsx.broken`
- Restore path: move back to original path

2. `src/components/ToolboxUISystem.tsx.corrupted.backup`
- Status: confirmed-unused
- Evidence: no references found in `src` or `package.json`
- Archive target: `_migration_hub/archive_candidates/src/components/ToolboxUISystem.tsx.corrupted.backup`
- Current location: `_migration_hub/archive_candidates/src/components/ToolboxUISystem.tsx.corrupted.backup`
- Restore path: move back to original path

3. `src/components/_toolbox_restore_backups/`
- Status: confirmed-unused (backup-only folder)
- Evidence: no references found in `src` or `package.json`
- Archive target: `_migration_hub/archive_candidates/src/components/_toolbox_restore_backups/`
- Current location: `_migration_hub/archive_candidates/src/components/_toolbox_restore_backups/`
- Restore path: move folder back to original path

4. `src/checkAST.cjs`
- Status: confirmed-unused
- Evidence: no script reference in `package.json`; no import/use in `src`
- Archive target: `_migration_hub/archive_candidates/src/checkAST.cjs`
- Current location: `_migration_hub/archive_candidates/src/checkAST.cjs`
- Restore path: move back to original path

5. `src/checkAST2.cjs`
- Status: confirmed-unused
- Evidence: no script reference in `package.json`; no import/use in `src`
- Archive target: `_migration_hub/archive_candidates/src/checkAST2.cjs`
- Current location: `_migration_hub/archive_candidates/src/checkAST2.cjs`
- Restore path: move back to original path

6. `src/validate.cjs`
- Status: confirmed-unused
- Evidence: no script reference in `package.json`; no import/use in `src`
- Archive target: `_migration_hub/archive_candidates/src/validate.cjs`
- Current location: `_migration_hub/archive_candidates/src/validate.cjs`
- Restore path: move back to original path

7. `src/components/UIReferenceLibraryContent copy.HTML`
- Status: confirmed-unused
- Evidence: no import/reference from active route graph
- Archive target: `_migration_hub/archive_candidates/src/components/UIReferenceLibraryContent copy.HTML`
- Current location: `_migration_hub/archive_candidates/src/components/UIReferenceLibraryContent copy.HTML`
- Restore path: move back to original path

8. `GlobalDataContext.tsx` (repo root duplicate)
- Status: confirmed-unused duplicate
- Evidence: runtime context import points to `src/context/GlobalDataContext.tsx`
- Archive target: `_migration_hub/archive_candidates/GlobalDataContext.tsx`
- Current location: `_migration_hub/archive_candidates/GlobalDataContext.tsx`
- Restore path: move back to repo root

## Deferred / Requires Follow-up
- `node_modules`: do not hand-prune. Use dependency graph + clean install workflow later.
- `docs/*`: keep for now; many docs are source inputs for migration pages.
- broad historical folders/files already in a dirty git state (for example old model-tool prompt/docs bundles): defer until a clean baseline branch is created, then re-run usage proof before archive move.

## 2026-04-08 Recovery Pass Addendum
- Archive-first policy maintained in this pass.
- No additional files/folders were moved to `_migration_hub/archive_candidates` during the recovery refactor; focus was runtime correctness and data-contract repair.
- Node modules were not manually pruned (policy preserved). Dependency minimization remains deferred to package-manifest reconciliation pass.

## 2026-04-08 Safe-Prune Completion Ledger (append-only)

### not_started
- Full route-graph + dynamic-import proof pass for every file in legacy `UI`, `services`, and historical TSX bundles remains pending.

### in_progress
- Archive-first candidate expansion for unused service/data-analysis duplicates is in progress pending consumer migration checks.

### finished
- Existing archive candidates remain non-destructively staged under `_migration_hub/archive_candidates`.
- No destructive delete commands were used in this pass.

### blocked
- Manual `node_modules` pruning is intentionally blocked by policy; dependency reduction must be done via manifest reconciliation + reinstall.

## 2026-04-11 Note (append-only)
- `widget-preview.html` restored and now actively referenced by `widget-lab`; remove from unused candidate sets.

## 2026-04-11 Stabilization Addendum (append-only)
- No archive-candidate moves were performed in this UI stabilization patch.
- Archive-first policy preserved; no destructive cleanup actions taken.
