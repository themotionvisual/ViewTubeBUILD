# ViewTube Widget Dashboard Architecture Baseline

Read this reference for architecture audits, migrations, performance work, code merging, or removal.

## Verified September 2026 Baseline

- Runtime: React 19 + Vite 8, not a deployed Module Federation system.
- Grid: 24 columns with eight width buckets and six persisted data states.
- Registry: `WidgetRegistry.ts` is canonical metadata; `WidgetRenderer.tsx` resolves renderer keys.
- Loading: most substantial widgets are `React.lazy`; below-fold widget mounting is deferred with `IntersectionObserver`.
- Persistence: local layout schema v9 normalizes old IDs/dimensions and hides non-ready widgets.
- Safety: widget error boundaries, certification contracts, and 50 dashboard tests currently pass.
- Data: `useDashboardData.ts` still merges canonical analytics, VT-SYNC snapshots, legacy selectors/cache, brain context, video catalog, and bootstrap data.
- Styling: `toolboxWidgetSystem.css` is 7,713 lines / about 232 KB source. A September 2026 scan found 1,442 selector occurrences, 134 repeated selector names, 185 `!important` declarations, 15 media queries, and 16 container queries.
- Build snapshot: Dashboard route about 94 KB JS / 27 KB gzip and 189 KB CSS / 26 KB gzip, plus shared chunks. Production build passes.
- Concentration: `WidgetRenderer.tsx` is 1,345 lines; `WidgetRegistry.ts` 1,218; `useDashboardData.ts` 665; `DashboardCanvas.tsx` 499.

Re-measure these values before using them as acceptance baselines on another branch.

## How to Use the Supplied PDF Audit

The PDF correctly emphasizes:

- container queries for component-level responsiveness;
- virtualization for large tables/media galleries;
- narrow state subscriptions;
- design tokens, fixed aspect ratios, loading-space reservation, and accessibility.

Treat these claims as proposals requiring repository evidence:

- The current ViewTube dashboard is not verified as a micro-frontend or Module Federation system.
- A 1,500-node DOM threshold is a heuristic, not a universal failure point.
- Widget-local fetching is not automatically superior; shared canonical queries can prevent duplicate requests.
- Container query units should be used selectively; scaling all typography with `cqw` can harm readability.
- Scroll-state/style queries need browser-support and fallback review.

## Target Architecture

1. `WidgetRegistry.ts`: declarative metadata only.
2. `WidgetRenderer.tsx`: typed lazy renderer map, Suspense/error fallback, common props only.
3. `widgets/<WidgetName>.tsx`: one feature implementation.
4. `WidgetShell.tsx`: header, controls, subtitle, collapse/edit behavior, error-safe frame.
5. `WidgetPrimitives*.tsx`: reusable interaction and data-state primitives.
6. CSS layers:
   - tokens and palette;
   - shell/grid;
   - primitives;
   - archetype recipes;
   - isolated widget modules;
   - accessibility and motion.
7. Data selectors:
   - canonical query/read layer;
   - stable per-widget selectors;
   - feature-owned actions;
   - explicit provenance/freshness state.

## Safe Migration Order

1. Add measurements and regression tests.
2. Split inline renderer implementations into lazy modules without visual changes.
3. Stabilize registry/renderer typing and generate certification from the registry where possible.
4. Introduce narrow data selectors; remove legacy fallbacks only after CSV and VT-SYNC parity.
5. Extract CSS by layer, preserving cascade order; delete duplicate rules after visual comparison.
6. Convert remaining widget-scoped media queries to container queries.
7. Virtualize confirmed large lists/tables.
8. Remove dead implementations and compatibility paths after consumer and persisted-layout audits.

Do not combine data-source migration, CSS rewrite, registry ID changes, and visual redesign in one pull request.

## Performance Budgets

Establish baselines first, then use budgets such as:

- no regression in dashboard route gzip without documented value;
- hidden/below-fold widgets do not execute feature data work before mount;
- large lists maintain a bounded mounted-row count;
- layout editing does not remount unchanged widgets;
- CLS remains near zero through stable skeleton/widget heights;
- INP and long-task traces improve on the target iPhone profile;
- CSS duplication and `!important` counts trend down each migration phase.

## Removal Gate

Before deleting a file, selector, renderer, or ID, search:

- imports and dynamic imports;
- `WidgetRegistry`, guide registries, certification, assistant intelligence, tests;
- local-storage migration keys and exported layouts;
- CSS class construction and data attributes;
- route-level and preview/reference surfaces.

Quarantine only when uncertainty remains. Delete when coverage and rollback are clear.
