# Data Visual mobile mark-scale plan

Follow-up to `data-visual-canvas-contract.md`. That work gave every migrated
Data Visual a bounded, predictable **canvas**. This plan addresses what the
screenshots then made obvious: the canvas is correct, but the **marks drawn
inside it** are still desktop-sized.

**Scope: canvas contents only.** Mark geometry, mark counts, default
selections, and how many sub-panels a canvas draws at once. Module chrome —
headers, titles, controllers, metric strips, footers — is explicitly out of
scope and must not be redesigned. Also out of scope: the global Toolbox and
SubToolbox systems, Studio Hub, Projects, Editor, generic widget primitives,
and unrelated Analytics layout.

---

## 1. The gap this closes

The canvas contract already carries `densityProfile` — *how many* marks may be
on screen at once. Three things it does not carry:

| Missing concept | Symptom in the screenshots |
| --- | --- |
| **Mark scale** — how big each mark is | Shorts Retention bubbles overlap into a single blob at 375px; Channel Progress bars are desktop-thick in a 200px-tall plot |
| **Default selection** — what the count control starts at | Engagement Pulse opens on 25 videos; Channel Vital Signs opens on *all* videos and *all 12* metrics |
| **Panel budget** — how many sub-panels share one canvas | Clock Burst draws two donuts plus two legends in a 358×201 portrait canvas |

Density, scale, selection and panel count are four independent decisions. A
module can need all four, and today it can express only one.

---

## 2. Contract extensions

Extend `src/components/dataVisualModuleContract.ts`. Every field is optional;
a module that omits one keeps today's behaviour.

```ts
/** Per-orientation multiplier applied to mark geometry. */
markScale?: DataVisualOrientationProfile      // radii, stroke widths, bar thickness, tile edges

/** Per-orientation starting value for the module's own count control. */
defaultSelection?: DataVisualOrientationProfile

/** Simultaneous sub-panels inside one canvas (donuts, stacked plot rows). */
panelBudget?: DataVisualOrientationProfile

/** Simultaneous series / metric traces. */
seriesBudget?: DataVisualOrientationProfile
```

`DataVisualOrientationProfile` is the existing `{ desktop, landscape, portrait }`
shape already used by `densityProfile`.

### Default mark scale

| Bucket | Scale | Rationale |
| --- | --- | --- |
| `desktop` | `1.0` | Unchanged — desktop is the reference, never regress it |
| `landscape` | `0.6` | Canvas is ~510–537px wide, ~287–302px tall |
| `portrait` | `0.5` | Canvas is ~343–358px wide, ~193–201px tall |

Portrait `0.5` is the "halve the radius" instruction generalised. Landscape sits
between because the canvas is roughly 1.5× the portrait area.

### Floors — scale never wins against these

Scaling is a multiplier, not a licence to render illegible or untappable marks.
Every scaled value clamps to a floor:

| Property | Floor | Why |
| --- | --- | --- |
| Interactive mark hit area | **24 × 24 CSS px** | Touch target; may be an invisible hit rect around a smaller visible mark |
| Stroke width | **1.5 px** | Below this, hairlines disappear on low-DPR phones |
| Axis / label font | **8 px** | Below this, uppercase heavy faces stop resolving |
| Heat / matrix tile edge | **10 px** | Below this a tile reads as noise, not a video |
| Bubble radius | **2 px** | Below this a bubble is a dot with no area encoding |

A module that cannot satisfy both its density budget and these floors must
**reduce density further**, never shrink below the floor.

### Shared helpers

Add to `src/components/dataVisualCanvasGeometry.ts`:

```ts
/** Active mark-scale multiplier for a registered module. */
useDataVisualMarkScale(id: RegisteredDataVisualModuleId): number

/** Scale one mark dimension and clamp it to its floor. */
scaleMark(base: number, scale: number, floor: number): number

/** Starting value for a module's count control in the active composition. */
useDataVisualDefaultSelection(id, fallback: number): number

/** Simultaneous sub-panels for the active composition. */
useDataVisualPanelBudget(id, fallback: number): number
```

`scaleMark` is the only place rounding and clamping happen, so a floor is never
re-derived per renderer.

---

## 3. Per-module specification

Modules already on the canvas contract are marked ✅. Two named modules are
**not yet migrated** and need the canvas contract applied first — that is a
prerequisite, not a separate project.

### 3.1 Shorts Retention ✅ `shorts-retention`

Bubble radii come from `buildLogBubbleRadii` / `buildLinearAreaBubbleRadii` in
`src/components/chartScaleModel.ts`, which already take `{ minRadius, maxRadius }`.
That is the seam — pass scaled values, do not fork the builders.

| Knob | Location | Desktop | Landscape | Portrait |
| --- | --- | --- | --- | --- |
| `buildLogBubbleRadii` min/max | `GraphsPageCharts.tsx` → `ShortsRetention`, `viewRadii` | `3 / 32` | `2 / 19` | `2 / 16` |
| `buildLinearAreaBubbleRadii` min/max | `GraphsPageCharts.tsx` → `ShortsRetentionWidgetModule`, `viewRadii` | `4 / 36` | `2 / 22` | `2 / 18` |
| `defaultSelection` (videos plotted) | `selectedCount` state (both modules init `100`) | `100` | `50` | `25` |
| Hover dot radius | `ViewTubeScatterBubble` callers | `6` | `4` | `3` |

`densityProfile` stays as registered. Add `markScale` and `defaultSelection`.

**Acceptance:** at 375×667 no two bubbles at the median radius fully occlude each
other; the largest bubble is at most ~⅓ of the plot's shorter edge.

### 3.2 Engagement Pulse ✅ `engagement-pulse`

| Knob | Location | Desktop | Landscape | Portrait |
| --- | --- | --- | --- | --- |
| `defaultSelection` (videos) | `EngagementLinesModule` → `useState(25)` | `25` | `15` | `10` |
| Line `strokeWidth` (selected / other) | `<Line strokeWidth>` | `5 / 3` | `3 / 2` | `2.5 / 1.5` |
| `EngagementSelectedDot` / `EngagementHoverDot` radius | `GraphsPageCharts.tsx` (`r={6}`) | `6` | `4` | `3` |
| `seriesBudget` (metric traces) | `ENGAGEMENT_METRICS` | `4` | `4` | `3` |

The existing `densityProfile` already caps *plotted* points; `defaultSelection`
changes what the control **starts** at, so the module opens readable instead of
opening dense and being clamped. Both are needed.

**Note on the count control:** changing the default changes the number the
controller displays. That is a canvas-driven default, not a controller
redesign — the control keeps its full range and the user can still reach 50.

### 3.3 Heat Matrix ✅ `heat-matrix`

| Knob | Location | Desktop | Landscape | Portrait |
| --- | --- | --- | --- | --- |
| `ROWS` | `TubeExplorerThermalImaging` → `useState<5 \| 8>(8)` | `8` | `6` | `4` |
| Preferred `TILE` edge | `ThermalImagingModuleInner` | `36 / 58` | `×0.6` | `×0.5`, floor `10` |
| Column budget | `densityProfile` (already registered) | `18` | `14` | `8` |

The `5 | 8` union widens to `4 | 5 | 6 | 8`. Portrait currently clamps to 5 —
change to 4. Tile edge stays the `min(fromHeight, fromWidth)` calculation already
in place; `markScale` caps the *preferred* edge it is clamped against.

**Acceptance:** at 375×667 the matrix reads as 4 rows × ~8 columns of square
tiles ≥ 10px with the remainder reachable by horizontal scroll.

### 3.4 Channel Vital Signs ⚠️ `channel-vital-signs` — **migration prerequisite**

`TubeExplorerChannelVitalSigns` is not on the canvas contract. Register it
(`family: "temporal"`, `canvasAspect: "16:9"`, `overflow: "clip"`), wire
`canvasModuleId`, then apply:

| Knob | Location | Desktop | Landscape | Portrait |
| --- | --- | --- | --- | --- |
| `seriesBudget` (metric traces) | `selectedVitalMetrics` init (all 12) | `12` (all) | `8` | `5` |
| `defaultSelection` (videos) | `countIndex` init → `VITAL_ROW_COUNTS` | `0` (all) | `50` | `25` |
| Trace stroke width | `TubeExplorerChannelVitalSigns` trace render | base | `×0.6` | `×0.5`, floor `1.5` |
| Point marker radius | trace render | base | `×0.6` | `×0.5`, floor `2` |

Portrait takes the **first 5** of `CHANNEL_VITAL_METRICS` — views, engaged views,
watch time, subscribers, revenue. That ordering is already the array's priority
order, so no new ranking is introduced. `VITAL_ROW_COUNTS` already contains
`25` and `50`; `defaultSelection` selects the index, it does not add options.

### 3.5 Publish Optimal Clock ✅ `publish-optimal-clock`

Portrait already folds 24 hourly columns into 12 two-hour bands. The remaining
problem is **how the cells are drawn**, not how many.

Today the grid is 168 individual `<div>` elements, each with its own border,
border-radius, transition and hover transform. At portrait cell sizes (~23 × 14
px) the 1px borders and 2px radii consume a visible fraction of each cell, and
168 transitioning nodes is the heaviest paint in the visual set.

**Replace the DOM grid with a single `<svg>`** sized to the plot box: one `<rect>`
per cell, one shared hover overlay rect, labels as `<text>`. This is what "use a
grid system instead of individual rectangles" should mean here — it is a
rendering change, not a layout change, and the visual design is preserved.

| Knob | Desktop | Landscape | Portrait |
| --- | --- | --- | --- |
| Columns (hour bands) | `24` | `24` | `12` |
| Cell stroke | `1` | `0.75` | `0.5` |
| Cell corner radius | `2` | `1.5` | `1` |
| Hour-label font | `9` | `9` | `8` (floor) |

Keep the existing keyboard focus and `aria-label` per cell — move them onto the
`<rect>` elements; do not lose them in the port.

### 3.6 Channel Progress ⚠️ `channel-progress` — **migration prerequisite**

`ComboChannelProgress` is not on the canvas contract. Register it
(`family: "temporal"`, `canvasAspect: "16:9"`), wire the canvas, then apply.

This module already scales its marks by **metric count** — that ladder is the
pattern to extend, multiplying each rung by `markScale`:

| Knob | Location | Desktop | Landscape | Portrait |
| --- | --- | --- | --- | --- |
| `barSize` (1 / 2 / n metrics) | `renderChartForMetrics` → `const barSize =` | `46 / 23 / calc` | `×0.6` | `×0.5` |
| `barSize` (individual grid) | same | `28` | `17` | `14` |
| `darkLineWidth` ladder | `renderChartForMetrics` | `8 … 3` | `×0.6`, floor `1.5` | `×0.5`, floor `1.5` |
| `dotRadius` ladder | `renderChartForMetrics` | `6 … 3.5` | `×0.6`, floor `2` | `×0.5`, floor `2` |
| `dotStrokeWidth` ladder | `renderChartForMetrics` | `3 … 2` | `×0.6`, floor `1.5` | `×0.5`, floor `1.5` |
| `seriesBudget` (overlaid metrics) | `selectedMetrics` | `5` | `3` | `2` |
| `panelBudget` (individual-grid rows) | `isIndividualGrid` rows | `5` | `3` | `2` |

> **Open question — flag before implementing.** "Maximum bar height has to be
> about 1/2 or 1/3 the desktop version" is ambiguous against this code. In a
> vertical bar chart, recharts' `barSize` is bar *thickness*; bar *height* is the
> data value mapped to the plot. This plan reads the instruction as **bar
> thickness × 0.5 (portrait) / 0.6 (landscape)**, since the plot height already
> halves with the 16:9 canvas. If the intent was instead "the tallest bar should
> occupy only ½–⅓ of the plot height", that is a Y-domain change (headroom
> multiplier), not a mark-scale change — say so and it becomes a one-line
> `buildAdaptiveZeroScale` adjustment instead.

### 3.7 Clock Burst ✅ `clock-radial-burst`

Portrait currently draws both donuts side by side (each ~165px wide) plus both
legends. Halving each donut is the wrong answer — the right answer is **one
panel at a time**.

| Knob | Desktop | Landscape | Portrait |
| --- | --- | --- | --- |
| `panelBudget` (donut + its legend) | `2` | `2` | `1` |
| Donut label font | `12` | `10` | `8` (floor) |
| Slice stroke | `3` | `2` | `1.5` (floor) |

At `panelBudget: 1` the canvas shows **one donut plus its own legend**, with a
segmented switch between `TRAFFIC SOURCES` and the active source's detail. The
switch is canvas-internal (a two-item control inside the evidence area), not a
module controller — it is how the canvas presents a panel it cannot fit, which
keeps this inside scope.

Hiding a panel behind a switch is not removing information; silently clipping it
is. Landscape keeps both panels — at 537 × 302 two square plots still clear the
floors.

### 3.8 Content Treemap ✅ `content-treemap`

Pillar count is already budgeted (12 / 9 / 6). Remaining work is label legibility:

- `TREEMAP_LABEL_EM_WIDTH` fitting stays; add a **minimum tile area** below which
  the tile drops its stat line and shows the label alone, and below which it
  shows neither (colour + hover only).
- Tile border `2` → `1.5` landscape, `1` portrait.
- Corner radius `9` → `6` landscape, `4` portrait.

### 3.9 Traffic Source Evolution ✅ `traffic-source-evolution`

Axis-tick thinning is done. Add:

- Area stroke width `×markScale`, floor `1.5`.
- `seriesBudget`: `8 / 6 / 4` visible source bands; the remainder folds into an
  "OTHER" band rather than being dropped.

---

## 4. Sweep: the remaining Data Visuals

`TUBE_EXPLORER_VISUAL_MODULES` holds 46 entries and most route through four
shared renderers. Fixing those four covers the long tail without 40 separate
migrations:

| Shared renderer | Location | Mark knobs to scale |
| --- | --- | --- |
| `VideoScatter` | `TubeExplorerVisualModules.tsx` | point radius, stroke, label font |
| `HeatGrid` | same file | `grid-cols-7` → `4` portrait / `5` landscape; border `3` → scaled; label / value font |
| `Donut` | same file | radius, slice stroke, label font |
| `TrafficBars` | same file | `slice(0, 16)` → `densityProfile`; bar thickness, label font |
| `createModule` | same file | pass `canvasModuleId` through so every wrapped module inherits the contract |

Order the sweep by family — temporal, spatial, radial, natural — and register a
contract per module as it is touched. `createModule` is the highest-leverage
single change: it wraps roughly half the registry.

---

## 5. Audit harness additions

`scripts/capture-data-visual-mobile-audit.mjs` currently asserts *canvas*
geometry. Extend it to assert *mark* geometry, so mark regressions fail CI the
same way canvas regressions do.

Per visual, per viewport, measure and assert:

| Assertion | Fails when |
| --- | --- |
| Smallest interactive mark ≥ 24 × 24 CSS px | A tap target shrank below the touch floor |
| No rendered text below 8px computed font-size | A label was scaled into illegibility |
| Mark count ≤ `densityProfile[bucket]` | A renderer ignored its density budget |
| Visible sub-panels ≤ `panelBudget[bucket]` | A canvas drew more panels than it can fit |
| Median mark spacing > 0 for scatter families | Bubbles collapsed into a single blob |

Emit a `mark-metrics.json` beside `manifest.json` recording measured mark counts,
smallest/median/largest mark size and smallest font per visual per viewport, so a
change in mark density is reviewable as a diff rather than by eye.

Keep the existing rule: **a visual is not fixed until its own rendered screenshot
has been inspected.**

---

## 6. Order of work

Each phase is independently shippable and leaves unmigrated modules untouched.

| Phase | Work | Why this order |
| --- | --- | --- |
| **1** | ✅ Contract fields, `scaleMark`, the hooks, floors table, unit tests | Nothing else can be expressed until the vocabulary exists |
| **2** | ✅ Harness mark assertions + `mark-metrics.json` | Land the ruler before moving anything, so phase 3+ is measured, not asserted |
| **3** | ✅ Already-migrated modules: Shorts Retention, Engagement Pulse, Heat Matrix, Clock Burst, Content Treemap, Traffic Source Evolution | Contract already wired; lowest risk; proves the vocabulary |
| **4** | Publish Optimal Clock SVG port | Isolated rendering change, own PR — easiest to review and revert alone |
| **5** | Channel Vital Signs + Channel Progress: canvas migration, then mark scale | Two steps in one module each; migrate first, verify, then scale |
| **6** | Shared-renderer sweep via `createModule`, `VideoScatter`, `HeatGrid`, `Donut`, `TrafficBars` | Highest leverage, but only once the pattern is proven on named modules |

---

## 7. Acceptance criteria

For every Data Visual, at 375 × 667, 390 × 844, 667 × 375, 844 × 390 and
1440 × 900:

- Marks are sized for the canvas they are in, not scaled-down desktop marks.
- No mark falls below its floor; where density and floors conflict, **density
  gives way**.
- Every count control opens at a value that is readable in that composition.
- No canvas draws more sub-panels than it can fit; a panel that does not fit is
  reachable, not clipped.
- Every interactive mark is tappable at 24 × 24 CSS px.
- Desktop is byte-identical unless a defect is being fixed there too.
- The audit harness passes, and each change was checked against its own
  rendered screenshot.

Preserve the ViewTube visual design. Do not redesign module chrome, controllers
or headers while implementing this.

---

## 8. What phases 1-3 changed against this plan

Three things the plan did not anticipate, all found by running the harness:

**`markInteraction` was added to the contract.** The touch floor as originally
written failed every dense-field visual, including ones where per-mark tapping
is an enhancement rather than the primary read. Enforcing it literally would
have forced a 4-row publish clock and destroyed the weekly pattern the visual
exists to show. Modules now declare `discrete` (each mark is its own target —
the floor applies) or `field` (read by colour or position, with hover/focus and
the active-context readout carrying the value). `field` is an explicit recorded
decision; omitting it means the floor applies.

**Clock Burst's donut wedges are `field`, and its legend rows became buttons.**
A 5% wedge cannot reach 24px in a phone-sized donut at any density, so the
legend row beside it — full width, always tappable — is now the accessible
picker for the same source.

**Two contract fields could contradict each other.** Engagement Pulse opened at
`defaultSelection: 10` but was clamped by `densityProfile: 6`, so the control
read "10" while the plot drew 6. The count control now governs outright,
`densityProfile` is a cap that must never sit below `defaultSelection`, and a
test enforces that. The same check exposed Heat Matrix registering columns in
`densityProfile` and rows in `defaultSelection` — two different units in fields
meant to be comparable. Heat Matrix now registers rows only; its column count
is an outcome of tile scale and the tile floor, and the renderer keeps its own
minimum-visible-columns constant.

**Open for review:** Heat Matrix portrait now draws ~16 columns of 18px tiles
rather than the 7-9 columns of larger tiles in section 3.3. Tile edge follows
the mark scale (36 -> 18, the same halving applied everywhere), and how many
columns that yields follows from it. It reads well, but it is denser than the
original target — say so and the column minimum can be lowered instead.
