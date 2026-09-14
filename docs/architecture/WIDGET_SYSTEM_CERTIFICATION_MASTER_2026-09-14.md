# ViewTube Widget System Certification Master

Status: ACTIVE AUDIT / IMPLEMENTATION TRACKER
Date: 2026-09-14
Branch: `audit/widget-system-certification-2026-09-14`

## Purpose

This document converts the widget-system audit into an executable certification program. It does not replace `WidgetRegistry.ts`; the registry remains canonical widget metadata. This resource defines what `ready` must eventually mean in production and provides gates for consolidating widget UI, primitives, layout, data, responsive behavior, mobile behavior, and functionality without rewriting the system from scratch.

## Canonical ownership chain

`TOKENS -> PRIMITIVES -> UI REFERENCE LIBRARY -> ARCHETYPES -> WIDGETS -> DASHBOARD LAYOUT`

Rules:

1. Tokens own dimensions, strokes, radii, spacing, shadows, timing and palette relationships.
2. Primitives own component geometry and interaction states.
3. The UI Reference Library renders production primitives; it must not maintain visually similar private copies.
4. Archetypes own repeatable widget compositions.
5. Widgets own domain-specific content, data adapters and actions, not global component styling.
6. Dashboard layout owns placement and outer widget dimensions, not widget internals.

## Frozen macro layout contract

### Width buckets

| Bucket | 24-column span | Desktop fraction |
| --- | ---: | ---: |
| quarter | 6 | 25% |
| companion | 7 | ~29.2% |
| third | 8 | 33.3% |
| between | 10 | ~41.7% |
| half | 12 | 50% |
| two-thirds | 16 | 66.7% |
| three-quarters | 18 | 75% |
| full | 24 | 100% |

Below the dashboard mobile breakpoint every widget is one full-width row regardless of persisted desktop width bucket.

### Height buckets

| Level | Bucket | Outer height |
| --- | --- | ---: |
| S | short | 150px |
| M | medium | 250px |
| L | tall | 350px |
| XL | xtall | 450px |
| XXL | massive | 850px |

Expanded widget shell height is deterministic. Content does not increase the shell height. Overflow belongs to an intentional internal scroll region. Collapsed widgets are exempt and collapse to header geometry.

## Frozen dashboard tokens

- Level 1 stroke: 4px
- Level 2 stroke: 3px
- Level 3 stroke: 2px
- Large radius: 16px
- Medium radius: 12px
- Small radius: 8px
- Outer gap: 24px
- Inner gap: 12px
- Dense gap: 8px
- Shadow offset: 6px
- Base transition: 180ms

## Certification model

The existing registry lifecycle (`ready`, `prototype`, `needs-backend`) is implementation metadata and MUST NOT be interpreted as final QA certification.

Each widget is independently evaluated on these gates:

- IMPLEMENTED — registered ID resolves to a renderer.
- DATA_CONNECTED — intended canonical/live/imported data reaches the widget.
- FUNCTIONAL — user-facing controls execute their intended actions.
- DATA_STATES — loading, ready, empty, blocked/disconnected, stale and error states are deliberate.
- RESPONSIVE — every supported width/height pair preserves composition.
- MOBILE_VERIFIED — narrow viewport and touch interaction pass.
- VISUALLY_CERTIFIED — uses canonical primitives/tokens/archetypes without private drift.
- ACCESSIBLE — keyboard, focus, labels, contrast, reduced motion and semantics pass.
- PRODUCTION_VERIFIED — verified against the deployed application with its real dependencies.
- CANONICAL — all required gates pass.

A widget must never be described as production-complete solely because its registry status is `ready`.

## Certification matrix schema

Every registered widget receives a row containing:

`ID | Display Name | Category | Release Tier | Registry Status | Renderer | Default W | Default H | Min W | Max W | Min H | Max H | Dependencies | Live Data | Imported Data | Loading | Empty | Error | Disconnected | Stale | Actions | Forms | Selects | Toggles | Internal Scroll | Mobile | Touch | Width Matrix | Height Matrix | Primitive Compliance | UI Library Match | Accessibility | Production | Open Issues | Certification`

The matrix must be generated from registry metadata wherever possible. Human/runtime verification fields remain explicit rather than being inferred.

## Widget archetypes

Canonical archetypes to extract and certify:

- KPI — metrics, deltas, compact supporting context.
- Chart — title/context, visualization canvas, legend/controls.
- Matrix — axes, cells, scale/legend.
- Table — toolbar, bounded rows, totals/summary.
- Form — fields, validation, primary action.
- Generator — inputs/settings, generation action, result/output.
- Editor — editable surface with supporting controls.
- Feed — bounded repeating records with explicit empty state.
- Preview — media/output plus copy/export/open actions.
- Upload — canonical upload target, progress, replace/remove actions.
- Controller — controls plus state/status feedback.
- Calendar — date grid and schedule state.
- Intelligence — evidence, interpretation, recommendation/action.
- Composite — explicitly composed archetypes; not a license for one-off styling.

## Primitive contract

### Component sizing

The primitive layer must expose a small deterministic component-height ladder rather than arbitrary local heights. Current target family: 18px micro, 24px compact, 32px standard, 38px large. Typography, icon geometry, radius and stroke scale with the component level.

### Color

Widget/primitive context supplies color. Components must not hardcode blue or private grayscale active/focus states. Outline, icon field, focus stroke, selected state, shadow, progress, tags and upload treatments derive from the active palette contract.

### Shadow and interaction

Shadows use the component/widget color with transparency. Hover and pressed travel are defined by the primitive interaction contract and must not be independently reimplemented per widget.

### Focus

Focus treatment travels inward and must not change the component's external dimensions. Focus color derives from the owning palette.

### Upload

Canonical upload compositions replace generic dashed drop zones. Circle and 16:9 variants are required. Outer geometry remains stable while drop/hover animation occurs inside the composition.

### Scroll

A fixed-height widget may contain an explicit bounded scroll region. Nested accidental scroll areas and content-driven shell growth fail certification.

## Responsive composition contract

Dashboard width remains macro-grid driven. Widget internals must increasingly respond to their actual container.

Canonical composition modes:

`EXPANDED -> STANDARD -> COMPACT -> STACKED`

The system must repair/verify named container ownership before relying on named `@container vt-widget` rules. A widget may change composition at a narrower container width without changing its persisted dashboard width bucket.

## Mobile contract

1. One widget per row by default.
2. Full available width.
3. Deterministic height bucket.
4. No horizontal page overflow.
5. No content-driven outer growth.
6. At most one intentional body scroll region unless an archetype explicitly requires otherwise.
7. Headers remain readable and controls remain reachable.
8. Touch targets and toggles must work without hover assumptions.
9. Split-left and other compound primitives must preserve their intended geometry.
10. Mobile fixes belong to shared contracts/primitives where the defect is systemic.

## Data contract

Preferred flow:

`SOURCE -> CANONICAL DATASET -> SELECTOR/ADAPTER -> WIDGET VIEW MODEL -> VISUAL/CONTROL`

A compatible populated imported dataset must not be ignored merely because a preferred network/API source is unavailable. Widgets must expose provenance/freshness through the data layer rather than silently rendering blank visuals.

## CSS consolidation rules

Target ordered ownership:

1. tokens
2. grid/shell
3. primitives
4. archetypes
5. widget-specific styles
6. accessibility

Priorities:

- Reduce blanket `.dashboard-barrier` specificity.
- Eliminate duplicate selector ownership.
- Remove `!important` by fixing cascade ownership rather than escalating specificity.
- Prevent toolbox/subtoolbox CSS from redefining widget primitives and vice versa.
- Move widget-specific CSS beside lazy widget modules where practical.
- Block new arbitrary palette values, dimensions and widget-local replacements for canonical primitives.

## Phase plan

### Phase 0 — Guardrails

- [x] Create isolated audit/certification branch from current main.
- [x] Record canonical width/height/token contracts.
- [x] Record certification semantics separate from registry lifecycle.
- [ ] Generate the complete 59-widget matrix directly from `WidgetRegistry.ts`.
- [ ] Add machine-readable certification types/status records.
- [ ] Add registry/renderer/dimension contract tests.

### Phase 1 — CSS and primitive stabilization

- [ ] Verify/fix `.vt-widget` container naming.
- [ ] Inventory duplicate selector ownership.
- [ ] Consolidate shell/body/header/slot ownership.
- [ ] Partition widget CSS from toolbox/subtoolbox CSS.
- [ ] Make UI Reference Library consume production primitives.
- [ ] Certify buttons, split controls, toggles, inputs, selects, sliders, checkboxes, radios, tags/badges, tabs, progress, upload frames and scrolling.

### Phase 2 — Default 30 widgets

- [ ] Certify every widget in `DEFAULT_DASHBOARD_ROWS` across data, actions, layout and mobile.
- [ ] Resolve data-present/visual-empty failures.
- [ ] Verify all default W/H settings and permitted +/- adjustments.

### Phase 3 — Remaining 29 widgets

- [ ] Certify preview widgets.
- [ ] Quarantine or reconcile divergent unreferenced drafts instead of wiring them blindly.
- [ ] Promote only widgets that pass their required gates.

### Phase 4 — Renderer modularization

- [ ] Extract inline widget implementations from `WidgetRenderer.tsx` in small tested groups.
- [ ] Replace conditional resolver growth with typed lazy loader ownership.
- [ ] Ensure hidden/collapsed widgets suspend unnecessary work.

### Phase 5 — Responsive archetypes

- [ ] Implement the archetype layer.
- [ ] Convert widget-local responsive hacks to container-responsive archetypes.
- [ ] Build automatic W x H fixtures.
- [ ] Build mobile/touch certification fixtures.

### Phase 6 — Production certification

- [ ] Verify production data/auth dependencies.
- [ ] Verify user-facing actions against production endpoints.
- [ ] Capture desktop/mobile visual baselines.
- [ ] Mark canonical widgets only after all required gates pass.

## Immediate acceptance gates

No widget-system change is complete unless:

1. Existing registered IDs remain stable or receive an explicit persistence alias/migration.
2. A widget cannot grow its shell beyond the selected height bucket because of content.
3. Mobile defaults to full width.
4. The change does not introduce a private replacement for an existing primitive.
5. The UI Reference Library and production primitive remain the same implementation.
6. Interactive components are verified for keyboard and touch behavior where applicable.
7. Data-dependent visuals distinguish no-data from disconnected/error/stale states.
8. Tests/build pass before merge.

## Next executable work

The next commit on this branch should generate the complete widget certification inventory from the canonical registry and add tests that prove: unique IDs, renderer coverage, valid min/default/max dimensions, default-layout references are registered, deterministic height values remain frozen, and mobile width collapse remains enforced.
