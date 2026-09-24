# Mobile Visual Responsive Contract

**Status:** CANONICAL SCOPED ANALYTICS DATA VISUAL RESPONSIVE CONTRACT  
**Last audited main:** `0c4610629bfba98ffc0703a42e422352d5f31514`  
**Canonical owner / concern:** portrait-phone, landscape-phone and desktop responsive intent for registered Analytics/VT-SYNC Data Visuals.  
**Executable authority:** `VtSyncVisualFrame` + `mobileVisualResponsiveContract.ts` + visual registry/test contracts.  
**Authority boundary:** This contract does not define Studio Toolbox shell heights or Dashboard widget buckets.

This document is the implementation contract for Data Visuals on phone portrait, phone landscape, and desktop.

## Ownership

`VtSyncVisualFrame` owns responsive intent. A registered visual declares portrait, landscape, and desktop behavior through `responsive`. Subject-specific renderers own marks and data encoding, not their outer phone height.

Legacy `ModuleFrame` pixel heights are desktop compatibility values. On phones, `[data-vt-visual-frame]` and `[data-vt-chart-body]` are authoritative.

## Default states

| State | Span | Canvas | Controls | Legend | Explanation | Density |
| --- | --- | --- | --- | --- | --- | --- |
| Portrait phone | 1 | 16:9 | menu/compact | compact | collapsed | compact |
| Landscape phone | 1 | 16:9 | inline | compact | collapsed | normal |
| Desktop | registry | 16:9 default | inline | full | full | normal |

Not every visual must be 16:9. Radial plots may declare `1:1`; list/hierarchical modules may declare `natural`. The registry is the source of truth.

## Reference visual: Heat Matrix

Heat Matrix is the first reference spatial visual. On portrait phones its evidence canvas remains 16:9, legacy 300px child minimums are neutralized, and dense KPI/controller rows must scroll horizontally instead of increasing card height. On landscape phones the available viewport height is the limiting dimension and the 16:9 canvas centers within the available width.

## Migration rules

1. Do not add new title/text-matching responsive behavior.
2. Do not add new fixed mobile chart heights to individual renderers.
3. Add stable `data-vt-*` hooks for controls, KPI strips, legends, and explanations as each renderer is migrated.
4. Keep essential evidence available without hover. Touch inspection must be possible.
5. Portrait modules are always one visual per row.
6. If a visual is dense, reduce labels/marks or make secondary rows swipe; do not make the module arbitrarily tall.
7. Once priority visuals are registry-native, remove `data-visual-preview-16x9.js` and its MutationObserver/title matching.

## Priority migration order

1. Heat Matrix
2. Shorts Retention
3. Publish Optimal Clock
4. Traffic Source Evolution
5. Engagement Pulse
6. Content Treemap
7. Remaining spatial/radial/time-series families

## QA sizes

- 375 × 667 portrait
- 390 × 844 portrait
- 667 × 375 landscape
- 844 × 390 landscape

Check: one-column containment, exact declared canvas ratio, no clipped essential evidence, no runaway card height, no overlapping controls, touch-legible controls, and no horizontal page overflow.
