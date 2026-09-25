---
name: viewtube-mobile-widget-system
description: Enforce ViewTube dashboard phone width, deterministic height buckets, shrinkable internal grids, and bounded overflow.
---

# ViewTube Mobile Widget System

Read `.claude/skills/viewtube-mobile-widget-system/SKILL.md` as the canonical full contract before changing dashboard mobile geometry.

Non-negotiable summary:

- Below 768px every `.vt-dash-cell` renders `grid-column: 1 / -1`; persisted desktop W state is not mutated.
- S/M/L/XL/XXL map to 150/250/350/450/850px outer heights. Same H means same outer height.
- Content cannot expand the shell. Preserve `min-width: 0` and `min-height: 0` through the shell chain and use bounded internal scrolling when content does not fit.
- Use FIT, ADAPT, or SCROLL composition behavior; do not create ad-hoc per-widget mobile geometry.
- Prefer `minmax(0, 1fr)` or container-safe minimum tracks for nested grids.
- Mobile changes composition, not ViewTube primitives, colors, typography, borders, radii, shadows, or control states.
- Preserve the canonical inset/full-bleed/shadow-safe content zones; never reserve a hidden right gutter or clip edge-to-edge bands/glows.
- W−/W+ are disabled/hidden on phone; H−/H+ remain active.
- Verify 320, 375, 390, 430, 767px and a >=768px desktop restoration case.
- Fix the highest shared ownership layer and do not add new `!important` rules.
