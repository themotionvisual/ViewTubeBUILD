# Primitives, color, and layout — compatibility summary

This short file remains for older links. The detailed current authority is:

- `primitives-tokens-color.md`
- `composition-mathematics-and-resizing.md`
- `design-doctrine-and-utility.md`

Production primitives own reusable geometry and interaction states. The UI Reference Library must render those same primitives.

Current component ladder: 18 / 24 / 32 / 38px.

Current production type/icon values should be read from `widgetPrimitiveSystem.ts`; as of 2026-09-19 the intended type scale is approximately 8 / 16 / 21 / 26px.

Dashboard macro tokens remain based on 4/3/2px strokes, 16/12/8px radii, 24/12/8px gaps, 6px shadow offset, and 180ms base transition unless current code supersedes them.

Use the 12-color spectrum and ViewTube Ink rather than pure black in the widget system. Widgets are predominantly monochromatic; additional colors must communicate meaning.

Macro grid: 24 columns. Width buckets: quarter 6, companion 7, third 8, between 10, half 12, two-thirds 16, three-quarters 18, full 24. Height buckets: short 150, medium 250, tall 350, xtall 450, massive 850.

Use FIT / ADAPT / SCROLL intentionally.

### Adaptive 24px text fit

A canonical 24px control may opt into adaptive type to preserve dense row geometry.

- `textFit="adaptive"`
- control remains 24px high;
- type scales from 16px toward 10px;
- complete words must remain visible;
- do not use ellipsis/cropping as fitting.

### Header rule

Primary widget header mode/page toggles remain visible in portrait. They may compact, but they are not removed simply because the widget becomes narrow.

Widget titles remain the canonical title size and may wrap to two lines. They never shrink or ellipsize to save header room.
