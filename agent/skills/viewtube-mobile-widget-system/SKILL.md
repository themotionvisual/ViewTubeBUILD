---
name: viewtube-mobile-widget-system
description: Build, review, and migrate ViewTube dashboard widgets under the canonical phone width, height-bucket, internal-grid, and overflow contracts. Use whenever changing dashboard widget mobile layout, responsive geometry, height controls, scrolling, or widget composition.
---

# ViewTube Mobile Widget System

## Authority

Use this order of authority:

1. `WidgetPrimitives` and primitive CSS own visual component language.
2. `widgetMobileContract.css` owns phone-level widget geometry.
3. `WidgetShell` owns header/body shell structure.
4. responsive/archetype recipes own reusable internal composition.
5. individual widgets may specialize content but must not defeat 1-4.

Do not solve a systemic mobile problem with per-widget width or height patches.

## Phone width contract

At phone widths below 768px every `.vt-dash-cell` renders across the complete 24-column dashboard row (`grid-column: 1 / -1`). The persisted desktop size bucket remains unchanged. A saved `quarter`, `third`, or `half` widget must therefore render FULL on phone and restore its saved fractional width on larger viewports.

All nested grid/flex children must be shrinkable: use `min-width: 0`; for flexible tracks use `minmax(0, 1fr)` or `minmax(min(100%, <preferred-min>), 1fr)` when a preferred minimum is required. Never hide horizontal overflow as a substitute for fixing a track that cannot shrink.

## Height contract

Height buckets are deterministic outer geometry at a given breakpoint:

- S / `short`: 150px
- M / `medium`: 250px
- L / `tall`: 350px
- XL / `xtall`: 450px
- XXL / `massive`: 850px

Widgets with the same H bucket at the same breakpoint must have the same outer height. Content must never change the shell height. Collapsed widgets are exempt and collapse to header geometry.

The shell must preserve `min-height: 0` through cell → widget → content → body so internal content can shrink within the height budget.

## Content behavior

Classify each widget composition as one of these behaviors:

- FIT: KPI/status/chart composition reflows or reduces columns to fit the assigned height.
- ADAPT: a complex composition changes internal layout first, then scrolls when it reaches its minimum viable composition.
- SCROLL: libraries, guides, feeds, tables, reports, long forms, and catalogs keep the H bucket and scroll inside the body.

Scrolling belongs inside the bounded widget body or an explicit `WidgetScrollArea`; it must never expand the outer shell. Keep nested scrolling to one intentional vertical viewport whenever possible.

## Internal grids

Mobile changes composition, not the ViewTube design language. Keep the established 12-color spectrum, primitive heights, typography mapping, strokes, radii, colored shadows, controls, states, and spacing tokens.

Prefer reusable container-query recipes for widget internals. Media queries are for page/dashboard geometry. Internal compositions should respond to the widget container, not assume the viewport equals the widget width.

Common mobile recipes:

- `KPI_GRID_2`: two shrinkable equal tracks.
- `KPI_GRID_1`: one track when labels/values cannot remain legible in two.
- `CHART_STACK`: summary → chart → legend.
- `CONTROL_STACK`: controls wrap/stack without increasing shell height.
- `TABLE_SCROLL`: fixed widget shell with internal table viewport.
- `LIBRARY_SCROLL`: fixed widget shell with catalog sections in a vertical viewport.
- `FEED_SCROLL`: fixed controls/header plus scrolling items.
- `DASHBOARD_COMPACT`: summary first; secondary panels compact/reflow.
- `FORM_STACK`: fields become one readable column.
- `MEDIA_STACK`: media preserves aspect ratio and supporting controls stack below it.

## Resize controls

On phone, W− and W+ do not change rendered geometry because every widget is FULL. Keep the persisted desktop width state intact. Disable or hide width controls while the phone contract is active. H− and H+ remain active and must step only through the widget's supported height buckets.

## Acceptance matrix

Verify 320, 375, 390, 430, and 767px widths, then at least one >=768px width to prove desktop width restoration.

Reject a change if any of these occur:

- widget occupies less than the available dashboard row on phone;
- horizontal page overflow or clipped content;
- a child forces its grid track wider than the widget;
- two widgets with the same H bucket have different outer heights;
- content grows the outer widget beyond its H bucket;
- a content-heavy widget becomes an unbounded page-length module;
- header controls overlap or become unreachable;
- a scroll-required widget has unreachable content;
- returning to desktop loses the persisted width bucket.

## Implementation rule

Fix the highest shared layer that owns the defect. Do not add `!important` to beat legacy rules; repair cascade ownership or add the rule to the later canonical ownership layer. Preserve widget IDs, persisted layout schema, data behavior, and existing desktop dimensions unless the task explicitly changes them.
