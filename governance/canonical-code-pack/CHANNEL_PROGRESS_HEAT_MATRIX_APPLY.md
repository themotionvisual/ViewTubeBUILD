# ViewTube Wave Animation Update

Target local project:

`/Users/cwb/ViewTube-branch-check`

This patch was produced against the uploaded Branch Check copy dated 2026-08-19.

## Changes

### Channel Progress
- Longer outbound bar wave.
- Starts slower and gradually accelerates.
- Smooth bell-shaped overshoot envelope.
- Overshoot is dynamically capped by each bar's available headroom so peaks do not slam into the chart ceiling.
- Secondary half-wave returns from the opposite edge.
- Dots begin at scale 0 / opacity 0 and spring up on the return wave.
- The cumulative line is revealed behind the dot wave.
- 2 metrics: simultaneous starts from LEFT and RIGHT.
- 3 metrics: LEFT at 0.0s, RIGHT at 0.3s, LEFT at 0.6s.
- 4+ metrics continue alternating sides every 0.3s.
- Built-in Recharts Bar/Line intro animation is disabled only for Channel Progress to prevent double-animation.

### Heat Matrix
- Wider/smoother wave with substantially more tiles active at once.
- Tile sequence: 0.14 → 1.50 → 0.75 → 1.075 → 1.00.
- Slower recovery from 0.75 to 1.075.
- Primary wave remains column-serpentine.
- Secondary rebound travels right-to-left across rows.
- Softer hover transform to reduce jitter.

### Format Dominance
- Deliberately NOT wrapped in the custom hero animation.
- The existing native Recharts Pie animation is preserved/reverted as requested.

## Apply with Git

From:

`/Users/cwb/ViewTube-branch-check`

run:

```bash
git apply /path/to/channel-progress-heat-matrix.patch
```

Or copy the two replacement files over:

- `src/components/GraphsPageCharts.tsx`
- `src/components/TubeExplorerVisualModules.tsx`

Then run your normal typecheck/build/tests.

## Important
Before applying, commit or stash the current local versions if they have changed since the uploaded Branch Check archive.
