# Widget Build and Responsive Design Contract

Read this reference when creating, redesigning, laying out, or certifying a widget.

## Definition First

Specify:

- stable ID and renderer key;
- title, subtitle, category, dependency, status, release tier;
- information priority and one primary action;
- default/min/max size and height;
- explicit supported size-height pairs;
- performance cost and data provenance.

Use `ready` only when the renderer exists, dependencies fail safely, all declared dimensions work, and standard states are implemented. Otherwise use `prototype` or `needs-backend`.

## Primitive Selection

Use these canonical building blocks instead of recreating them:

- `WidgetShell`
- `WidgetWorkflowMain`
- `WidgetSection` and `WidgetDivider`
- `WidgetFooter`
- `WidgetScrollArea`
- `WidgetStatePanel`
- `WidgetMetric`
- `WidgetProgressBar`
- `WidgetSelect` / `WidgetSizedSelect`
- `WidgetSizedButton`, `WidgetLeftSplitButton`
- `WidgetHeaderAction` for a header-mounted action; `WidgetHeaderToggle` only for mode selection
- `WidgetTextInput`
- video and other domain selectors from the canonical `WidgetPrimitives` public API

If a needed pattern repeats in two or more widgets, promote it to a primitive or archetype recipe. If it is feature-specific, keep it beside the widget.

## Layout Archetypes

| Archetype | Best size | Structure |
| --- | --- | --- |
| KPI/status | quarter to third | 1-3 metrics, status, one action |
| Compact list | third to half | filters, bounded list/scroll area, footer |
| Chart | half to full | KPI strip, labeled chart, legend, controls |
| Workflow | half to three-quarters | form stack, preview/state, primary action |
| Dense analysis | two-thirds to full | summary, tabs/filters, visualization/table |
| Command center | three-quarters to full | system state, steps, approvals, run log |

## Container Response

Use a mobile-first internal layout and change composition from the allocated widget width:

- narrow: one column, condensed labels, no horizontal overflow;
- standard: two-column forms or KPI rows where legible;
- wide: supporting panels may sit beside the primary visualization.

Prefer structural breakpoints near actual content failures instead of universal device widths. The page shell may still use media queries to stack the 24-column grid on small screens.

Do not rely on a widget's default grid span. Every declared dimension is a supported public state.

## Content-edge contract

Use three shared zones:

- **Inset:** normal fields/cards/prose.
- **Full bleed:** dividers, gradient bands, callout strips, horizontal rails and footers.
- **Shadow safe:** focus glows and colored shadows with equal left/right clearance.

Do not create one-sided right gutters or intermediate horizontal clipping to make room for shadows. Full-bleed elements must reach the true interior module edge; horizontal rails own their internal scroll padding. Portrait header controls must wrap before clipping and remain usable after collapse. Use icon components rather than emoji characters in widget UI.
## Data and Rendering

- Subscribe to the smallest stable selector the widget needs.
- Memoize derived arrays/objects only when they are costly or identity-sensitive.
- Do not sort/filter large arrays during every render.
- Do not fetch the same canonical data independently in several visible widgets.
- Defer heavy visualization modules and large datasets until the widget mounts or becomes visible.
- Virtualize unbounded lists/tables; use ordinary mapped lists for small bounded collections.
- Reserve chart/media space while loading to prevent layout shift.
- Pause polling, animations, observers, and media when hidden or unmounted.

## State and Accessibility Matrix

Every data widget should demonstrate:

| State | Required behavior |
| --- | --- |
| Loading | stable skeleton/progress; no layout jump |
| Ready | current values, provenance, primary action |
| Empty | explain what is missing and how to populate it |
| Blocked | name dependency/permission and recovery action |
| Stale | retain useful data, show age, offer refresh |
| Error | isolate failure, preserve dashboard, retry safely |

Controls require visible focus, labels, correct disabled state, and minimum usable touch targets. Charts require a text summary or accessible table; status cannot depend on color alone. Respect reduced motion.

## Review Checklist

- shell and primitives reused;
- no duplicate registry/renderer path;
- exact ViewTube token hierarchy and palette pairing;
- no ad hoc pixel gaps/radii/borders where a token exists;
- no clipped header/title or nested accidental scrollbar;
- all supported dimensions manually inspected;
- mobile portrait and coarse-pointer behavior checked;
- ready-widget visibility and layout migration tested;
- targeted tests, dashboard contracts, and production build pass;
- measured bundle/render impact recorded for heavy widgets.
