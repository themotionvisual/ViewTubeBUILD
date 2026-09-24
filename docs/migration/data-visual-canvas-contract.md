# Data Visual canvas contract

**Status:** CANONICAL SCOPED PRODUCTION CONTRACT / migration still in progress  
**Last audited main:** `e8313cceb2b6ab1fbcff6ff28a9648192f559854`  
**Scope:** Analytics Data Visual evidence-canvas ownership and bounded geometry only.  
**Executable authority:** `src/components/DataVisualCanvas.tsx`, `src/components/dataVisualModuleContract.ts`, canvas CSS and contract tests.  
**Current state:** `DataVisualCanvas` is production and 8 module contracts are registered. Legacy preview/title-matching compatibility still exists, so migration/deletion gates below remain active.

Scope: the individual Analytics **Data Visual** modules and their canvas /
evidence regions. Nothing here applies to the Toolbox or SubToolbox systems,
Studio Hub, Projects, the Editor, generic widget primitives, or the rest of the
Analytics page layout.

## Ownership

```
DATA VISUAL MODULE   header · title/subtitle · controls · metrics · legend · explanation
        ↓
DataVisualCanvas     registered identity · family · density · overflow policy · plot policy
        ↓
VisualCanvasViewport width · aspect ratio · bounded height · orientation behaviour
        ↓
Renderer             drawing only — fills the viewport, never sets module height
        ↓
SVG / Canvas / Recharts
```

The rule this refactor enforces: **exactly one owner per canvas.** Before it,
`ModuleFrame`'s inline pixel height, `StableChartFrame`'s min-height, the
shell's body min/preferred heights, `perf.css`,
`public/mobile-visual-responsive-system.css` and
`public/data-visual-preview-16x9.{css,js}` could all size the same canvas, and
the winner depended on stylesheet order.

## Registering a module

Add a contract to `src/components/dataVisualModuleContract.ts`:

```ts
"heat-matrix": {
  id: "heat-matrix",
  family: "spatial",          // temporal | spatial | radial | natural
  canvasAspect: "16:9",       // 16:9 | 1:1 | natural
  plotAspect: "natural",      // internal plot — a separate concept
  density: "dense",
  overflow: "clip",           // clip | scroll | natural
  densityProfile: { desktop: 18, landscape: 14, portrait: 8 },
}
```

`canvasAspect` is the **outer evidence canvas**. `plotAspect` is the **internal
plot** and is independent: `clock-radial-burst` keeps a `1:1` plot centred
inside a `16:9` canvas, and the module never becomes square.

`densityProfile` is a budget of *simultaneous primary marks* per composition —
columns, pillars, series points, axis ticks. Phones show fewer marks; they do
not show the same marks smaller.

## Migrating one module

Migrate one real Data Visual at a time; unmigrated modules keep working.

1. Register the canvas contract (above).
2. Wrap the renderer: `ModuleFrame` takes `canvasModuleId={...}`; a module on
   `SubToolboxChartModule` wraps its body in `<DataVisualCanvas id={...}>` and
   passes `layout={{ moduleMinHeight: "0px" }}`.
3. Let `VisualCanvasViewport` own geometry — delete that module's `height={...}`,
   `min-h-[...]`, `h-[400px]`, internal stage heights and so on.
4. Consume the density budget with `useDataVisualDensityBudget(id, fallback)`
   where the renderer decides how many marks to draw.
5. Test desktop, portrait and landscape (below).
6. Only then remove that module's legacy compatibility rule.

The `data-vt-data-visual-canvas-owned` marker on the chart body is what stands
the legacy sheets down, per module. It is set automatically by `ModuleFrame`
when `canvasModuleId` is present.

### Renderer rules

- Recharts: `<ResponsiveContainer width="100%" height="100%" minWidth={1}
  minHeight={1}>` inside a measurable viewport. Never a second fixed height.
- Native `<canvas>`: `useHiDPICanvas` from `dataVisualCanvasGeometry.ts`. It
  observes the **container**, not `window.resize`.
- Secondary chrome (legends, explanations, control strips) inside a canvas
  should carry `data-vt-data-visual-secondary="compact"` and compact or scroll
  before the evidence area gives up any space.

## Reference implementations

| Module | Family | Why it is the reference |
| --- | --- | --- |
| Shorts Retention | temporal | Recharts renderer in a bounded canvas |
| Clock Radial Burst | radial | `16:9` canvas, `1:1` internal plot, portrait recomposition |
| Publish Optimal Clock | spatial | 24 hourly columns fold to 12 two-hour bands in portrait |
| Heat Matrix | spatial (dense) | Tile size derived from row count and column budget |
| Content Treemap | spatial | Pillar count reduces per composition |
| Traffic Source Evolution | temporal | Axis-tick thinning |
| Engagement Pulse | temporal | Plotted-point budget |

> Note: `publish-optimal-clock` renders a day × hour grid, not a dial, so its
> internal plot is `natural`. The radial wide-canvas/square-plot pattern lives
> on `clock-radial-burst`.

## Verification

```bash
npm run build
npm run preview -- --host 127.0.0.1 --port 4173 &
PREVIEW_URL=http://127.0.0.1:4173 node scripts/capture-data-visual-mobile-audit.mjs
```

The harness renders every registered visual against deterministic fixture data
(`src/views/bench/dataVisualAuditFixture.ts`) on the bare bench route
`/render-bench/data-visual-audit`, with the browser clock pinned so runs are
comparable. It captures

```
artifacts/data-visual-mobile-audit/
  portrait-375x667/   portrait-390x844/
  landscape-667x375/  landscape-844x390/
  desktop-1440x900/
```

one PNG per visual per viewport. Each module is captured individually rather
than as one full-page shot, because hero intros are gated on the module
entering the viewport. The harness **fails** on a contract breach: wrong aspect, collapsed or runaway canvas,
page-level horizontal overflow, a `1:1` plot that stopped being square, or a
`clip` module that scrolls sideways. `.github/workflows/data-visual-mobile-audit.yml`
runs it in CI and uploads the screenshots.

A visual is not fixed until its own rendered screenshot has been looked at.
