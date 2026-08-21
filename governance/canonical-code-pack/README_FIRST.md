# READ THIS FIRST

This ZIP is a recovery/consolidation pack, not an instruction to overwrite the entire current GitHub branch blindly.

## If `GraphsPageCharts.tsx` and `TubeExplorerVisualModules.tsx` are missing locally
Copy the canonical files from `src/components/` into your project first so Vite stops returning 404s.

## If the Visual Time Windows branch already has newer versions
Diff/merge these files surgically. Do not replace newer controller, time-window, data-source, Play button, auth, or visual-context work without comparing it first.

## Mobile CSV regression
Apply `patches/mobile-csv-rehydration-fix.patch` to the current Visual Time Windows branch. The fix is intentionally branch-specific and protects locally imported CSV rows from account/channel hydration races.

## Format Dominance
Keep its native/original Recharts animation. The custom hero animation is not intended to replace it.

## Recommended merge order
1. Restore missing visual component files if necessary.
2. Reconcile current Visual Time Windows changes into the recovered files (or vice versa) with a diff.
3. Apply the mobile CSV rehydration fix.
4. Run typecheck/build/tests.
5. Test CSV import on mobile through refresh/navigation.
6. Test Channel Progress with 1, 2, and 3 metrics.
7. Test Heat Matrix rebound behavior.
8. Test visual replay/Play controls.
