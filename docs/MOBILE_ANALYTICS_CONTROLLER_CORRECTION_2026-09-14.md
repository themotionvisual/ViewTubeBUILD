# Mobile Analytics Controller Correction — 2026-09-14

## Scope

This correction addresses the Analytics visual controller collisions visible on phone portrait and short phone landscape layouts after the Master Data mobile geometry pass.

## Root cause

`SubToolboxChartModule` already stacks its controller area below the title on narrow screens, but a later `perf.css` compatibility override forces the header back into one horizontal row and forces every `data-controller-root` into a fixed 170px two-column grid. That older rule competes with the current responsive component contract and is especially destructive for Channel Progress, whose metric, time-window, mode, and layout controls require more width.

## Corrected contract

- Portrait: title/icon band remains intact; controller becomes a full-width rail below it.
- Portrait controller rows use a bounded two-column grid with consistent 30px cells.
- Landscape short viewport: title and controller remain siblings; controller uses a horizontally scrollable single rail rather than compressing labels.
- The visual body remains governed by the existing aspect-ratio contract.
- Analytics controller geometry remains isolated from Toolbox/Subtoolbox business geometry.

## Follow-up

The older mobile controller block in `src/styles/perf.css` should be removed after visual regression verification. The high-specificity responsive contract in `public/mobile-visual-responsive-system.css` is currently authoritative so production behavior is corrected without rewriting unrelated performance rules in the same change.