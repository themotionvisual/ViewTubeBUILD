# ViewTube recovered visual animation files

These files were reconstructed from the uploaded `ViewTube-branch-check.zip`
after the local copies were accidentally deleted.

## Recovered / merged

- `GraphsPageCharts.tsx`
- `TubeExplorerVisualModules.tsx`
- `ViewTubeCartesian.tsx`
- `HeroIntroBoundary.tsx`
- `heroVisualAnimations.ts`

## Animation work included

- Channel Progress:
  - longer outbound wave
  - slow start that gains speed
  - smooth bell-shaped height envelope
  - peak overshoot protected from the chart ceiling
  - returning half-wave
  - dots appear from 0 size / 0 opacity on the return wave
  - dots spring before the cumulative line follows
  - 2 metrics start simultaneously from opposite sides
  - 3 metrics: left 0.0s, right 0.3s, left 0.6s

- Heat Matrix:
  - wider/smoother overlapping wave
  - more tiles active at once
  - scale sequence 0.14 → 1.50 → 0.75 → 1.075 → 1.00
  - slower recovery
  - secondary right-to-left row rebound

- Traffic Source Evolution:
  - stacked areas animate one at a time
  - alternating left→right / right→left

- Scatter / bubble charts:
  - shared `ViewTubeScatterBubble` now gets deterministic pseudo-random spring entrances
  - applies across charts using the shared bubble component

- Channel Vital Signs:
  - heart-monitor trace/lane animation hooks

- Clockburst:
  - rotating rotor + spring-sector animation hooks
  - Clockburst total-value typo repaired to `compact(totalValue)`

- Title Keyword Network:
  - node constellation + delayed edge-draw hooks

- Barcode Fingerprint:
  - scanner/sequential bar build hooks

- Geography / Region visual:
  - propagation animation wrapper

- Engagement Pulse:
  - replayable hero-animation wrapper while keeping its staged line behavior

- Keyword Venn:
  - spring-circle intro hooks

- Format Dominance:
  - deliberately kept on its native/original Recharts animation
  - custom sector animation is not used

- Replay:
  - `HeroIntroBoundary` includes a replay/play control
  - visual-specific replay event support is included

## Restore locally

Copy the contents of `src/components/` into:

`/Users/cwb/ViewTube-branch-check/src/components/`

If you have recreated any of these files since deleting them, back those up first.

## Syntax validation

All five reconstructed TypeScript/TSX files pass the TypeScript parser.
