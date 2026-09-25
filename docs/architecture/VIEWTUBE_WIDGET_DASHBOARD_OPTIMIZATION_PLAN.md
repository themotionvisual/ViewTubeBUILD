# ViewTube Widget Dashboard Optimization Plan

Status: implementation-ready / active optimization plan
Last audited documentation baseline: `988098840050f4b658a266e1a7d6fe1c4d939c81`
Authority boundary: Dashboard widget optimization only. It may reuse shared visual principles but does not own Studio Toolbox/SubToolbox geometry.
Living coordination authority: `docs/architecture/VIEWTUBE_WIDGET_DASHBOARD_MASTER_RESOURCE.md`. This file remains the measured optimization/execution plan; do not use its older counts as current inventory without remeasurement.
Measured: 2026-09-11, branch `fix/deploy-topology-and-widget-skill` (base `origin/main` @ `1a863c98`)
Owner skill: `.claude/skills/viewtube-widget-dashboard/`

Scope: dashboard widget shell, registry, renderer, data access, primitives, CSS layers,
grid/layout contract, persistence, accessibility, and route performance.

## Outcome

One fast, predictable widget platform in which every finished widget is discoverable,
every `ready` widget can be shown, every widget uses the same shell/primitives/tokens,
and expensive code and data work happen only when needed.

This plan favours incremental extraction and deletion over a ground-up rewrite. The
existing system already has the foundations worth keeping: a canonical registry, lazy
widget modules, deferred below-fold mounting, a 24-column grid, persisted-layout
normalization, six standard data states, error boundaries, and a passing contract suite.

## Measured Baseline

Re-measure at any time with `npm run report:dashboard-baseline`, and gate a change
against the committed figures in `docs/architecture/dashboard-baseline.json` with
`npm run check:dashboard-baseline`.

Every number below was measured on this branch on 2026-09-11. Where it differs from the
figures in the supplied architecture baseline and PDF audit, **the measured number wins** —
the supplied documents are a September snapshot of a different branch and they instruct
re-measurement before use as acceptance criteria.

### Source concentration

| File | Lines | Note |
| --- | --- | --- |
| `WidgetRenderer.tsx` | 1,347 | 41 `React.lazy` calls plus 4 inline widget implementations |
| `WidgetRegistry.ts` | 1,218 | 59 widget definitions, canonical metadata |
| `WidgetPrimitives.tsx` | 702 | core primitives |
| `useDashboardData.ts` | 665 | joins canonical, VT-SYNC, legacy selectors, cache, brain context |
| `WidgetPrimitiveExtensions.tsx` | 512 | domain selectors plus the v12 matrix primitives |
| `DashboardCanvas.tsx` | 499 | DnD, layout, persistence, visibility, deferred mount |
| `WidgetShell.tsx` | 280 | header, icon rail, collapse, edit affordances |
| `storage.ts` | 257 | layout schema v9, normalization, size/height class helpers |

### CSS

| Metric | Measured | Supplied doc said | Delta |
| --- | --- | --- | --- |
| Dashboard CSS lines (6 files) | **8,903** | 7,713 (1 file) | +1,190; 5 satellite files were not counted |
| `toolboxWidgetSystem.css` alone | 7,713 / ~226 KB | 7,713 / ~232 KB | matches |
| `!important` declarations | **267** occurrences (263 lines) | 185 | **+82** |
| `@media` blocks | **21** | 15 | +6 |
| `@container` blocks | **18** | 16 | +2 |
| Approx. rule count in `toolboxWidgetSystem.css` | 855 | 1,442 occurrences | different metric |
| Distinct top-level selector roots | 113 | — | — |
| Roots defined more than once | **69** | 134 repeated names | different metric |

`!important` by file: `toolboxWidgetSystem.css` 183, `widgetPrimitiveTones.css` 39,
`widgetPrimitiveExactHeights.css` 23, `widgetPrimitiveVariants.css` 19,
`widgetMatrixPrimitives.css` 0, `widgetScrollbar.css` 0.

The 62 `!important` uses in the three primitive files are structural, not accidental: the
tone and exact-height lattices must beat the `.dashboard-barrier`-prefixed rules in
`toolboxWidgetSystem.css`. Fixing the prefix (below) is what makes them removable.

### The `.dashboard-barrier` prefix

953 of the rules in `toolboxWidgetSystem.css` begin with `.dashboard-barrier `. This is a
blanket specificity boost, not a scoping need — it adds one class of specificity to
essentially the whole dashboard stylesheet, which is the direct cause of both the
`!important` count in the primitive files and the difficulty of overriding anything from a
widget module. It is the single highest-leverage CSS change available.

### Registry and renderer

- 59 widget definitions, unique IDs, no duplicates.
- Status mix: `ready` 57, `prototype` 2.
- Categories: analytics 26, creation 11, system 6, core 6, ai 5, community 5.
- Release tiers derived from `DEFAULT_DASHBOARD_ROWS`: 30 supported, 29 preview.
- Renderer coverage: 40 lazy + 19 inline = full coverage of all 59; **no uncovered IDs**.
- **19** renderer keys are implemented inline inside `WidgetRenderer.tsx`, listed in its
  `INLINE_WIDGET_RENDERER_KEYS` array: `app-verification-explainer`, `reach-funnel`,
  `relative-retention-benchmark`, `consistency-heatmap`, `ad-stack-intelligence`,
  `kpi-cluster`, `channel-overview`, `mini-calendar`, `quick-actions`, `recent-uploads`,
  `top-performer`, `goals-tracker`, `alerts-feed`, `ai-prompt-box`, `revenue-momentum`,
  `superfan-card`, `system-micro-stack`, `task-stack`, `alerts-ticker`.
  Only 3 of them are top-level `const …Widget` declarations; the other 16 are
  `if (widget.id === "…")` branches inside the resolver body, which is why a
  declaration-only scan undercounts them.
- 3 widget files are unreferenced anywhere in `src/`: `AdStackWidget`, `ReachFunnelWidget`,
  `ThumbAIWidget`. Their IDs *are* registered — `thumb-ai` resolves to `ThumbnailLabWidget`,
  while `reach-funnel` and `ad-stack-intelligence` are served by inline branches. The files
  are divergent drafts, not extractions: `ReachFunnelWidget.tsx` adds a CTR simulator whose
  button is inert. Wiring them up would ship dead UI, so they are quarantine candidates,
  not Phase 2 inputs. They are unimported, so they cost nothing in the bundle.

### Grid and responsive contract

Size buckets map to **Tailwind viewport breakpoints**, in `storage.ts:235-244`:

```
full            -> col-span-24
three-quarters  -> col-span-24 md:col-span-18
two-thirds      -> col-span-24 md:col-span-16
half            -> col-span-24 md:col-span-12
between         -> col-span-24 md:col-span-10
third           -> col-span-24 md:col-span-8
companion       -> col-span-24 md:col-span-7
quarter         -> col-span-24 md:col-span-6
```

Height buckets are fixed pixel heights (`storage.ts:246-254`): short 150, medium 250,
tall 350, xtall 450, massive 850.

Two consequences follow, and both are real:

1. Below the Tailwind `md` breakpoint **every widget is full width regardless of its size
   bucket**. Widget width is therefore viewport-driven, not container-driven, which is the
   concrete blocker for the container-responsive goal.
2. A widget's outer height is fixed in pixels independent of its allocated width, so a
   `quarter`/`short` widget and a `full`/`short` widget get the same 150px to work in.

### Confirmed defect: dead container queries

`.vt-widget` declares `container-type: inline-size` (`toolboxWidgetSystem.css:65`) but sets
no `container-name`. `widgetPrimitiveVariants.css:429` and `:435` query
`@container vt-widget (max-width: 520px)` and `(max-width: 360px)`. A **named** container
query never matches an **unnamed** container, so both rules are dead and the reference
library's variant grid does not collapse from 3 columns to 2 to 1 at narrow widths.

Repo-wide there are only two named containers: `video-uploader` and `sync-ctrl`. The other
16 `@container` blocks are unnamed and resolve against the nearest container, which on this
markup is `.vt-widget` — correct, but only by proximity.

### Duplicate ownership example

`.dashboard-widget-slot` is defined twice in the same file:

- `toolboxWidgetSystem.css:1913` — `content-visibility: auto; contain-intrinsic-size: auto 250px;`
- `toolboxWidgetSystem.css:4335` — `padding: 4px !important;`

The second block sits inside an ad-hoc "shadow clearance" section that also styles
`.flex-1.flex.flex-col.gap-2.overflow-y-auto` — a Tailwind utility chain used as a selector.
That is brittle against any markup change and is a removal candidate.

### Build output

| Chunk | Raw | Gzip |
| --- | --- | --- |
| `Dashboard-*.css` | 189,462 B | 26,443 B |
| `UIReferenceLibraryWidget-*.css` | 25 KB | 3 KB |
| `index-*.css` | 299 KB | 42 KB |
| `VtSyncLocalAnalyticsPage-*.css` | 337 KB | 69 KB |
| lucide (shared JS) | 613 KB | — |
| `EditorV1Page` JS | 557 KB | — |
| recharts (shared JS) | 454 KB | — |
| `GraphsPageCharts` JS | 321 KB | — |

### Tests

`npx vitest run src/views/dashboard/__tests__ src/views/dashboard/useDashboardData.vtSync.test.ts`
— **7 files, 50 tests, all passing**, 5.5s. This is the refactor safety net.

## Reconciliation with the Supplied PDF Audit

**Adopt:** component-level container queries; DOM virtualization for genuinely unbounded
collections; narrow state subscriptions and cached canonical reads; intrinsic media ratios
and reserved loading space; tokens and accessibility; performance budgets and Core Web
Vitals measurement.

**Modify:** keep shared canonical data fetching where it prevents duplicate requests —
widgets own feature actions and selectors, not necessarily network clients. Use `cqw`
selectively, never for all typography. Retain macro media queries for page navigation and
top-level grid stacking.

**Reject for now:** Module Federation / micro-frontends. This is a single React 19 + Vite 8
application with no independently deployable widget requirement. Federation would add
configuration, dependency-alignment and runtime failure modes before solving any measured
bottleneck. Also reject adding Zustand/Jotai purely on the PDF's atomic-state argument —
split the existing contexts first and only add a selector-capable store where profiling
proves broadcast re-renders.

Also treat as unverified: the PDF's 1,500-node DOM threshold is a heuristic, not a failure
point on this app; scroll-state and style container queries need browser-support review
before use.

## Target Code Shape

```
dashboard/
  registry/
    widgetDefinitions.ts      # metadata only
    widgetLoaders.ts          # id -> lazy import, typed and exhaustive
    widgetCertification.ts    # derived from definitions
  shell/
    WidgetShell.tsx
    WidgetErrorBoundary.tsx
  primitives/
    layout.tsx  controls.tsx  dataStates.tsx  selectors.tsx
  data/
    dashboardSelectors.ts     # narrow, per-domain
    widgetQueries.ts          # canonical read layer
  layout/
    DashboardCanvas.tsx       # visual only
    dashboardLayoutController.ts
    storage.ts                # schema + migration
  widgets/
    <WidgetName>/<WidgetName>.tsx
    <WidgetName>/<WidgetName>.css
  styles/
    01-tokens.css  02-shell.css  03-primitives.css
    04-archetypes.css  05-widgets.css  06-accessibility.css
```

A destination map, not a demand to move every file at once.

## Phases

### Phase 0 — Guardrails and quick wins

1. Land the three zero-risk fixes proven above:
   - add `container-name: vt-widget` to `.vt-widget` so the two dead container queries live;
   - merge the two `.dashboard-widget-slot` blocks into one and drop its `!important`;
   - run the Removal Gate on `AdStackWidget`, `ReachFunnelWidget`, `ThumbAIWidget`.
     Confirmed: zero importers in `src/`, and their IDs are already served by other
     implementations. They are unimported so they cost no bundle; quarantine and let
     the owner decide, rather than deleting unshipped drafts.
2. Add a repeatable dashboard build report emitting route JS/CSS raw and gzip figures.
3. Add development render counters around canvas, slot, shell, and one light plus one heavy widget.
4. Capture DOM node counts at 10 / 100 / 1,000 / 10,000-row table and gallery fixtures.
5. Capture mobile traces on the target iPhone profile: LCP, CLS, INP, long tasks, memory, scroll FPS.
6. Extend the contract suite: all `ready` widgets revealable; registry↔renderer coverage;
   unique IDs; persisted-layout migration; hidden widgets do not mount; all six data states render.

Exit: checked-in baseline and budgets; the three fixes shipped; no other behaviour changed.

### Phase 1 — Registry as the single source of truth

1. Split base definitions, lazy loaders, descriptions and certification intent into typed
   modules behind one registry boundary.
2. Remove manually synchronized lists wherever they can be derived safely.
3. Require every definition to declare a valid loader and valid supported dimension pairs;
   make an unregistered widget file a type error rather than dead code.
4. Keep public IDs stable. Any ID change needs an explicit alias in `storage.ts`.
5. Clarify lifecycle: `ready` = complete and visible-capable; `prototype` = coded, not
   certified; `needs-backend` = UI complete, dependency unavailable.
6. Make picker and settings copy distinguish "all ready widgets visible" from hidden prototypes.

Exit: one definition drives dashboard, picker, guide, certification and assistant inventory.

### Phase 2 — Renderer and mount cost

1. Extract the 19 inline implementations from `WidgetRenderer.tsx` into widget modules,
   in small groups. This is the phase's bulk: they currently sit in the eagerly loaded
   Dashboard route chunk, so extraction moves real bytes off first paint.
2. Replace the conditional chain with a typed lazy loader map.
3. Keep exactly one Suspense fallback and one `WidgetErrorBoundary` per slot.
4. Memoize slots/shells only after profiling shows benefit.
5. Stabilize callback identities emitted by the canvas.
6. Keep `DeferredDashboardWidget`; verify root margin and placeholder height against real
   scroll traces rather than the current `contain-intrinsic-size: auto 250px` guess.
7. Ensure hidden and collapsed widgets pause polling, observers, media and animations.
8. Load DnD and motion only in edit mode if the route trace shows material savings.

Exit: unrelated dashboard state changes do not re-render unchanged widgets; hidden and
below-fold feature code stays dormant.

### Phase 3 — Data simplification

1. Decompose `useDashboardData.ts` into narrow per-domain selectors: channel totals, period
   summary, daily series, video catalog, sync state, palette.
2. Complete the CSV/Sheets integration into analytics-canon **before** deleting the legacy
   `Selectors`/`DataStore` fallbacks.
3. Move sorting, aggregation and normalization into cached selectors outside render paths.
4. Use `useSyncExternalStore` with fine-grained selectors so unrelated snapshot changes do
   not invalidate every widget.
5. Deduplicate API reads across visible widgets; attach provenance and freshness to every result.
6. Standardize recovery actions for blocked, stale and error states.

Exit: each widget consumes a small typed data contract; every legacy fallback has an
explicit deletion gate.

### Phase 4 — CSS consolidation without visual regression

1. Freeze screenshots at quarter, half, full and mobile widths for each archetype.
2. Inventory selectors by owner; mark each override canonical, compatibility, or dead.
3. **Remove the `.dashboard-barrier` prefix from the 953 rules that carry it**, scoping via
   a single `@layer` or one wrapper rule instead. Do this first — it is what makes the
   remaining steps possible.
4. Split into ordered layers: tokens, grid/shell, primitives, archetypes, widget CSS, accessibility.
5. Consolidate the repeated `.vt-widget-body`, content, form/control, tab and slot definitions
   (69 selector roots are currently defined more than once).
6. Replace `!important` by fixing cascade ownership. Keep only documented accessibility and
   third-party exceptions.
7. Move per-widget styles beside their lazy component so Vite code-splits them.
8. Add lint checks blocking new raw palette values, spacing drift, and widget-scoped media queries.

Exit targets: at least **40% fewer `!important`** in the first pass (267 → ≤160); repeated
selector ownership documented or reduced; visuals match baselines; `Dashboard-*.css` gzip
does not regress from 26,443 B and preferably falls.

### Phase 5 — Container-responsive contract

1. Keep the 24-column shell and the eight size / five height buckets.
2. **Replace the `md:col-span-*` viewport breakpoints with a container-driven span**, so a
   widget's internal composition follows its allocated width rather than the viewport.
   Until this lands, every widget is full width below `md` and no amount of widget-internal
   container work can be correct.
3. Ensure each `.dashboard-widget-slot` establishes an inline-size container; name containers
   only where nesting makes resolution ambiguous, and name them consistently — the
   `vt-widget` defect above is what happens otherwise.
4. Convert widget-internal media queries to container queries.
5. Define shared compact / standard / wide archetype recipes instead of one-off breakpoints.
6. Use exact `aspect-ratio` for media and chart canvases; reserve height while loading.
7. Replace the fixed pixel height buckets with min-heights plus intrinsic content sizing, or
   document why fixed heights are intended.
8. Validate every declared size-height pair; remove unsupported combinations from the registry.
9. Test mobile portrait and coarse pointer, not only desktop resizing.

Exit: no `ready` widget depends on global viewport width for internal composition.

### Phase 6 — Virtualize the correct surfaces

Candidates: video catalogs, media/Vault galleries, data tables, diagnostics logs,
comment/reply streams, unbounded evidence lists.

1. Benchmark native rendering first; set an activation threshold from the measurement.
2. Add `@tanstack/react-virtual` only if existing utilities cannot meet the need.
3. Preserve keyboard order, screen-reader counts, focus restoration, sticky headers, row measurement.
4. Leave small bounded lists unvirtualized.
5. Re-test DnD where virtualized content is sortable.

Exit: mounted row count stays bounded and scroll performance holds at the largest fixture.

### Phase 7 — Accessibility, motion, mobile

1. Automated checks for names, roles, focus, contrast, state announcements.
2. Chart text summaries or table equivalents; non-colour status encoding.
3. 44px coarse-pointer targets without bloating desktop controls. Note the 18px primitive
   height tier is below this and must never be the only interactive affordance on touch.
4. Respect reduced motion in Framer Motion, loaders, chart transitions, widget animations.
5. Replace continuous offscreen animation with visibility-aware pause/resume — the
   `widget-live-pulse` keyframe is the current example and already has a reduced-motion guard.
6. Confirm focus behaviour after collapse, remove, reorder and lazy mount.

Exit: keyboard and VoiceOver flows work for layout editing and core widget actions.

### Phase 8 — Remove legacy and duplicates

Candidates, none approved until gated: inline renderers after extraction; redundant CSS and
undocumented `!important`; the `.flex-1.flex.flex-col.gap-2.overflow-y-auto` utility-chain
selector; `widgetcss.txt` if it has no build or reference consumer; legacy analytics
selector/cache fallback after CSV and VT-SYNC parity; duplicate status/control components
superseded by primitives; dead renderer keys, definitions, guide copies and preview-only
implementations.

For each deletion: search static and dynamic imports; account for persisted layout IDs and
migrations; retain a rollback commit; run the dashboard suite and a production build;
compare screenshots and the performance baseline.

Exit: one production path per widget behaviour.

## Queued Post-Current Consolidation Program

After the currently active widget redesign/certification phases complete, continue with:

**[VIEWTUBE_WIDGET_POST_CURRENT_CONSOLIDATION_PLAN_2026-09-24.md](./VIEWTUBE_WIDGET_POST_CURRENT_CONSOLIDATION_PLAN_2026-09-24.md)**

That follow-on program is authoritative for these queued changes:

1. rename the Dashboard `video-uploader` widget to **Video Publisher** through an explicit persisted-layout/schema migration;
2. bring Dashboard + Studio Hub Video Publisher to functional parity against the same canonical publishing backend;
3. bring Dashboard + Studio Hub Video Manager to functional parity against the same canonical video-management backend;
4. upgrade Daily Oracle from mostly channel-level advice to evidence-backed channel-, video-, project-, and content-specific advice;
5. absorb the useful backend capabilities of `next-best-action` — including the stronger Algorithm Intelligence/project/evidence work preserved in PR #413 — into Daily Oracle;
6. retire `next-best-action` only after feature-parity tests and persisted-layout migration are proven.

This work is deliberately sequenced **after** the current widget program so it does not destabilize the active signature-component, primitive, CSS-ownership, responsive, and visual-certification work.

## Pull Request Sequence

1. Baseline measurements, tests, and the three Phase 0 quick wins.
2. Registry typing and derived metadata.
3. Inline renderer extraction, in small groups.
4. Data selector split, no source deletion.
5. `.dashboard-barrier` removal plus CSS layer scaffolding.
6. First duplicate-selector consolidation and `!important` reduction.
7. Container span conversion, by archetype.
8. Virtualization for one measured large surface.
9. Canonical data cutover and legacy removal.
10. Final CSS and renderer dead-code removal.

Do not combine phases. Merge slowly, preserve `main`, keep every commit reversible.

## Acceptance Criteria

- every `ready` widget can appear through "show all ready widgets";
- registry, renderer, guide, picker and certification cannot silently disagree;
- hidden and below-fold widgets start no expensive work;
- all widgets use canonical shell, primitives and token spacing;
- every declared size-height pair renders without clipping or horizontal overflow;
- large lists keep bounded DOM size;
- unrelated state updates do not repaint the full grid;
- all six data states are consistent across widgets;
- `npx vitest run src/views/dashboard/__tests__ src/views/dashboard/useDashboardData.vtSync.test.ts` stays at 50/50;
- `npm run build` passes;
- dashboard JS/CSS, Core Web Vitals and mobile interaction are no worse than the baseline above;
- removed code has a migration and a rollback record.

## Immediate First Sprint

1. Ship the three Phase 0 quick wins and the baseline report.
2. Extract the first five of the 19 inline widgets from `WidgetRenderer.tsx`.
3. Create typed per-domain selectors without deleting fallbacks.
4. Remove `.dashboard-barrier` and establish CSS layers; consolidate the top repeated shell/body selectors.
5. Convert one light, one chart and one workflow widget to the full container contract.
6. Re-run the 50 dashboard tests, a production build, screenshots and a mobile trace.

Measurable improvement without the risk of an all-at-once rewrite.
