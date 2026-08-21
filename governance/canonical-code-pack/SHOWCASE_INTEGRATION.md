# ViewTube Hero Visual Animation Integration

This pack is written around the current ViewTube source structure:
- `src/components/GraphsPageCharts.tsx`
- `src/components/TubeExplorerVisualModules.tsx`
- `src/components/ViewTubeCartesian.tsx`

## Install

Copy:

- `heroVisualAnimations.ts`
- `HeroIntroBoundary.tsx`

into `src/components/`.

Then import:

```tsx
import { HeroIntroBoundary } from "./HeroIntroBoundary"
```

The important design rule is:

> Wrap only the visualization BODY. Do not wrap `SubToolboxChartModule`,
> `AnalyticsVisualShell`, `ModuleFrame`, the title/icon block, or the top-right
> controller.

That keeps the header/controller completely locked while the body animates.

---

## Showcase controls

Use:

```text
?vtIntro=full
?vtIntro=fast
?vtIntro=none
```

Replay any currently mounted hero visual:

```ts
window.dispatchEvent(new CustomEvent("vt:replay-hero-intro"))
```

`full` is for investor capture, `fast` is for a controller reconfiguration,
and `none` is for reduced motion / ordinary repeated viewing.

---

# 1. Traffic Source Evolution

Current component:
`TrafficSourceEvolutionModule` in `GraphsPageCharts.tsx`

Wrap the chart body:

```tsx
<HeroIntroBoundary
  visualId="traffic-source-evolution"
  replayKey={`${selectedWindow}-${selectedFormat}-${visibleKeySignature}`}
>
  <div className="h-full min-h-[470px] w-full overflow-hidden bg-[#090b16]">
    {/* existing visual body */}
  </div>
</HeroIntroBoundary>
```

The engine already targets:

```css
.tse-plot .recharts-area
```

No SVG changes required.

For the *full intro*, keep the existing Areas:

```tsx
isAnimationActive={false}
```

so Recharts does not fight the custom left/right reveal.

---

# 2. Channel Progress

Current component:
`ComboChannelProgress`

Wrap only the plot area:

```tsx
<HeroIntroBoundary
  visualId="channel-progress"
  replayKey={`${viewMode}-${metricKeys.join("-")}-${selectedWindow}`}
>
  {/* existing Channel Progress chart body */}
</HeroIntroBoundary>
```

The engine finds Recharts bar rectangles and line curves automatically.

If you use the custom engine for capture, turn off the individual Recharts line
animation during Showcase Mode to avoid double-animation:

```tsx
isAnimationActive={false}
```

Normal product mode can keep the existing animation if preferred.

---

# 3. Heat Matrix

Current component:
`ThermalImagingModuleInner`

No extra attributes are required because the engine already targets:

```css
.vt-heat-tile
```

Wrap the body of `TubeExplorerThermalImaging`:

```tsx
<HeroIntroBoundary
  visualId="heat-matrix"
  replayKey={`${metric}-${formatFilter}-${orderMode}-${rowCount}`}
>
  <ThermalImagingModuleInner ... />
</HeroIntroBoundary>
```

The engine reads actual screen positions so it works even if row count changes:
column 1 bottom→top, column 2 top→bottom, then repeats.

---

# 4. Shorts Retention + every ViewTube scatter

Add this class in `ViewTubeCartesian.tsx`.

Current inner bubble group:

```tsx
<g
  style={{
    transformOrigin: "0px 0px",
    ...
  }}
>
```

Change to:

```tsx
<g
  className="vt-scatter-bubble-core"
  style={{
    transformOrigin: "0px 0px",
    ...
  }}
>
```

Then Shorts Retention:

```tsx
<HeroIntroBoundary
  visualId="shorts-retention"
  replayKey={`${mode}-${selectedCount}-${formatFilter}`}
  seed={`shorts-retention-${mode}-${selectedCount}-${formatFilter}`}
>
  <ResponsiveContainer ...>
    {/* existing ScatterChart */}
  </ResponsiveContainer>
</HeroIntroBoundary>
```

Use the same `animateScatterBubbles` engine for every scatter/bubble visual.

The seeded random order makes repeat recordings identical.

---

# 5. Channel Vital Signs

Current component:
`TubeExplorerChannelVitalSigns`

Add the lane marker:

```tsx
<g
  key={`lane-${metric.key}`}
  className="vt-vital-lane"
  data-vt-vital-lane={metric.key}
>
```

Add the trace marker:

```tsx
<polyline
  key={`trace-${metric.key}`}
  className="vt-vital-trace"
  data-vt-vital-trace={metric.key}
  ...
/>
```

Wrap only the monitor body:

```tsx
<HeroIntroBoundary
  visualId="channel-vital-signs"
  replayKey={`${formatFilter.value}-${rowCount}-${selectedVitalMetrics.join("-")}`}
>
  <div className="flex h-full flex-col bg-[#090914]">
    {/* current vital-sign monitor */}
  </div>
</HeroIntroBoundary>
```

This draws each trace from left→right like an ECG/heart monitor while the lanes
power on first.

---

# 6. Clockburst

Current renderer:
`ClockRadialBurstRenderer`

Inside `renderDonut`, change:

```tsx
<svg ...>
```

to:

```tsx
<svg
  ...
  className="vt-clock-rotor block h-full w-full"
  data-vt-clock-rotor={hoverScope}
/>
```

Change each slice group:

```tsx
<g
  key={sliceKey}
  className="vt-clock-sector"
  data-vt-clock-sector={sliceKey}
  ...
>
```

Wrap the renderer:

```tsx
<HeroIntroBoundary
  visualId="clockburst"
  replayKey={metric}
>
  <ClockRadialBurstRenderer dataset={dataset} metric={metric} />
</HeroIntroBoundary>
```

The full composition rotates while the sectors spring into place.

---

# 7. Title Keyword Network

Current renderer:
`TitleWordNetworkCanvas`

Add to each edge:

```tsx
<line
  data-vt-network-edge={index}
  className="vt-network-edge"
  ...
/>
```

Add to each node group:

```tsx
<g
  data-vt-network-node={node.id}
  className="vt-network-node"
  ...
>
```

Then:

```tsx
<HeroIntroBoundary
  visualId="title-keyword-network"
  replayKey={`${metric}-${wordLimit}`}
  seed={`title-network-${metric}-${wordLimit}`}
>
  <TitleWordNetworkCanvas ... />
</HeroIntroBoundary>
```

The existing 0.4s whole-canvas opacity fade can be removed once this intro is
enabled; the node/edge build is much more informative.

Keep the existing 0.5s recenter transition — it becomes the *interaction*
animation after the intro.

---

# 8. Barcode Fingerprint

Current renderer:
`BarcodeFingerprintAdvancedRenderer`

Add:

```tsx
<rect
  className="vt-barcode-bar"
  data-vt-barcode-bar={index}
  ...
/>
```

Then:

```tsx
<HeroIntroBoundary
  visualId="barcode-fingerprint"
  replayKey={`${metric}-${orderMode}-${barCount}-${formatFilter}`}
>
  <BarcodeFingerprintAdvancedRenderer ... />
</HeroIntroBoundary>
```

This creates the scanner-like sequential bar construction.

Optional later enhancement: add one absolute scanner line that moves across the
SVG while the bars construct.

---

# 9. Geography Map / Geotag Circle Grid

For every quantitative map mark or grid tile:

```tsx
<circle
  className="vt-geo-mark"
  data-vt-geo-mark={countryCode}
  ...
/>
```

or:

```tsx
<path
  className="vt-geo-mark"
  data-vt-geo-mark={countryCode}
  ...
/>
```

or DOM grid tile:

```tsx
<div
  className="vt-geo-mark"
  data-vt-geo-mark={regionId}
/>
```

Wrap only the geographic body:

```tsx
<HeroIntroBoundary
  visualId="geography-map"
  replayKey={`${viewMode}-${metric}-${geoLevel}`}
  seed={`geo-${viewMode}-${metric}-${geoLevel}`}
>
  <GeographyVisual ... />
</HeroIntroBoundary>
```

Do NOT assign a geo mark to `ZZ / Unknown`.

---

# 10. Engagement Pulse

Current component:
`EngagementLinesModule`

You already have:

- 3 second primary line
- sequential secondary lines
- `animKey`

For the custom capture runner, wrap the chart body:

```tsx
<HeroIntroBoundary
  visualId="engagement-pulse"
  replayKey={animKey}
>
  <StableChartFrame ...>
    {/* LineChart */}
  </StableChartFrame>
</HeroIntroBoundary>
```

If using the new runner for the investor clip, set each `<Line>`:

```tsx
isAnimationActive={false}
```

The new runner reproduces the staged line-draw sequence deterministically.

For normal app use, keeping the existing Recharts animation is also fine.

---

# 11. Format Dominance

Current component:
`FormatComparisonDonuts`

Wrap the four-donut body:

```tsx
<HeroIntroBoundary
  visualId="format-dominance"
  replayKey={aggregationMode}
>
  <div className="flex flex-row ...">
    {/* existing donuts */}
  </div>
</HeroIntroBoundary>
```

For showcase capture, disable the default Pie animation:

```tsx
isAnimationActive={false}
```

The hero runner springs each Recharts sector independently instead of relying
on the generic Pie animation.

---

# 12. Keyword Venn

Current component:
`KeywordVennModule`

Your circles already have the excellent:

```ts
const vennTransition =
  "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)"
```

Add the class/data attribute only to the THREE main base circles:

```tsx
<circle
  className="vt-venn-circle"
  data-vt-venn-circle="0"
  cx={g0.cx}
  cy={g0.cy}
  r={g0.r}
  ...
/>
```

Repeat for `1` and `2`.

Then wrap the Venn canvas:

```tsx
<HeroIntroBoundary
  visualId="keyword-venn"
  replayKey={`${a}-${b}-${c}-${metricMode}`}
>
  {/* existing Venn SVG */}
</HeroIntroBoundary>
```

Keep the existing white swap pulse rings. They become the shorter
*reconfiguration* feedback when the cursor changes a keyword.

---

# Full intro vs controller reconfiguration

For the investor capture:

```text
?vtIntro=full
```

After the intro settles and the large cursor changes a top-right control,
either:

1. remount the body with `mode="fast"`, or
2. use the visual's existing interaction transition.

Do NOT replay a 3–4 second boot animation every time a dropdown changes.

Recommended flow:

```text
FULL INTRO
→ settle
→ cursor glides in
→ click controller
→ FAST reconfiguration
→ settle
→ cursor leaves
→ transition to next visual
```

---

# Suggested locked 12-visual sequence

1. Traffic Source Evolution
2. Channel Progress
3. Heat Matrix
4. Shorts Retention
5. Channel Vital Signs
6. Clockburst
7. Title Keyword Network
8. Barcode Fingerprint
9. Geography Map / Geotag Circle Grid
10. Engagement Pulse
11. Format Dominance
12. Keyword Venn

Keep title, icon, controller, outer module X/Y, width and height identical.
Only the visual body changes.
