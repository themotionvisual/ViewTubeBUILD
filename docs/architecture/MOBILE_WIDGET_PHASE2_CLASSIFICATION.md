# ViewTube Mobile Widget System — Phase 2 Classification

## Contract
At phone widths every dashboard widget occupies one full dashboard row. Persisted desktop width is retained but does not control rendered phone width. The outer widget height is resolved only from the shared H bucket. Content must never expand the outer shell.

## Overflow classes

### FIT
Use for compact KPI, single-chart, status, score, and small-control widgets. Reflow the internal composition inside the assigned H bucket. Do not add an independent vertical scroll viewport unless content becomes genuinely variable.

### ADAPT
Use for multi-region analytics, mixed chart/KPI, forms, generators, editors, and workspaces. Recompose internal grids first. On normal phones prefer two-up KPI cells where each component remains usable; below 360px use one column. If the adapted minimum composition still exceeds H, the body becomes the fallback scroll viewport.

### SCROLL
Use for variable-length feeds, tables, comments, reports, guides, histories, lists, libraries, logs, and catalogues. Outer H stays fixed and one explicit internal viewport owns vertical scrolling. Never create nested competing scrollbars.

## Canonical examples
- UI Reference Library: SCROLL. Existing WidgetScrollArea owns the catalogue viewport.
- Channel Overview: ADAPT. KPI matrix becomes two-up on normal phones and one-up below 360px; secondary dense grids stack/recompose.
- Item rails / feeds: SCROLL through the existing rail or WidgetScrollArea.
- Simple KPI and chart modules: FIT.

## Migration rules
1. Do not change primitive visual styling to make a widget mobile. Change composition only.
2. Do not add widget-local phone width rules. `widgetMobileContract.css` owns outer geometry.
3. Never use content-driven `height:auto` to override an expanded H bucket on phone.
4. Every flex/grid ancestor between the shell and a scroll viewport must permit shrinking with `min-height: 0`; horizontal children require `min-width: 0`.
5. A widget with WidgetScrollArea must not also scroll `.vt-widget-body`.
6. Desktop W state is never mutated by the phone override.
7. H controls remain active on phone; W controls are visually disabled while full-width override is active.
8. Prefer shared archetype classes (`widget-kpi-grid`, `widget-form-stack`, `widget-segmented-deck`, `widget-item-rail`, `widget-workflow-main`) over widget-specific media queries.

## Migration order
1. Reference/library/guide widgets — SCROLL.
2. Channel Overview and analytics overview widgets — ADAPT.
3. Comments, feeds, history, logs, tables, reports — SCROLL.
4. Generators, publishing forms, metadata tools, editors — ADAPT.
5. KPI, score, compact chart and status widgets — FIT.
6. Audit remaining widget-local `overflow`, fixed widths, fixed minimum widths, `height:auto`, viewport heights, and multi-column grids.

## Acceptance widths
320, 375, 390, 430, and 768px boundary testing. At every phone width: no dashboard horizontal overflow; every visible widget is full available width; equal H buckets have equal outer heights; long content remains reachable; only one vertical scroll owner exists per widget; controls do not clip; desktop layout state survives the round trip.
