# Mobile Visual QA Matrix

**Status:** ACTIVE CERTIFICATION EVIDENCE MATRIX  
**Current authority:** `MOBILE_VISUAL_RESPONSIVE_CONTRACT.md`  
**Last re-audited:** 2026-09-24 against main `e8313cceb2b6ab1fbcff6ff28a9648192f559854`

Use this matrix for each migrated Data Visual renderer.

| Viewport | Orientation | Required result |
| --- | --- | --- |
| 375 × 667 | portrait | full-width card; no page-x overflow; declared canvas ratio; compact controls |
| 390 × 844 | portrait | full-width card; no runaway height; KPI row remains usable by touch |
| 667 × 375 | landscape | height-bounded centered canvas; inline controls where space permits |
| 844 × 390 | landscape | wide evidence workspace; no clipped essential marks |

## Heat Matrix acceptance

- Matrix evidence area is 16:9 in both phone orientations.
- Legacy 300px minimum-height wrappers cannot enlarge the portrait canvas.
- Metric/KPI rows may scroll horizontally but cannot widen the page.
- The module remains one column in portrait.
- Landscape uses available viewport height as its limiting dimension.
- The matrix remains legible; cells are not vertically stretched to fill the card.
- Essential information is available without hover.

## Regression gates

Reject a change when any of the following occurs:

- a visual becomes half-width on a phone;
- a fixed renderer height overrides the responsive frame;
- a module grows to the natural height of all of its internal content;
- controls overlap the title or chart;
- the page gains horizontal overflow;
- an SVG/canvas escapes its chart body;
- a visual relies on title matching for new responsive behavior.
