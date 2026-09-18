# Primitives, color, layout

Production primitives own geometry and states. UI Reference Library must import/render those same primitives. Promote useful library-only controls into production before using them as canonical.

Target component ladder: 18/24/32/38px. Frozen token baseline from certification: strokes 4/3/2px; radii 16/12/8px; gaps 24/12/8px; shadow offset 6px; base transition 180ms. Re-read current tokens before editing because code may supersede this snapshot.

Use the 12-color widget palette and ViewTube Ink rather than pure black. Components inherit palette context. Widgets stay mostly monochromatic; extra colors encode status/category/comparison/anomaly/selection or other meaning. Preserve A-Z spectrum tag/badge behavior where applicable.

Macro grid: 24 columns. Width buckets: quarter 6, companion 7, third 8, between 10, half 12, two-thirds 16, three-quarters 18, full 24. Heights: short 150, medium 250, tall 350, xtall 450, massive 850. On phone every widget is full width; persisted desktop width survives. Use container responsiveness internally and page media queries for macro layout.

Use FIT, ADAPT, or SCROLL. Shell height is deterministic; overflow belongs to explicit bounded content.