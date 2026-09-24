# Data Visual controller unification — plan

**Status:** ACTIVE IMPLEMENTATION PLAN — partially landed  
**Current authority:** `../analytics/VIEWTUBE_ANALYTICS_VT_SYNC_MASTER_RESOURCE.md`  
**Last re-audited:** 2026-09-24 against main `0c4610629bfba98ffc0703a42e422352d5f31514`

Code-backed state: both declarative Analytics shells use `VisualControllerRail`; controller width-floor infrastructure is present; row-order authority has moved to module-authored order. The migration is still open because live `controllerSpec` metadata remains and the later vocabulary/orientation phases are not fully retired. The inventory below describes the original baseline where noted, not a guarantee about every current file.

## 2026-09-21 verification

- 90 controller width, rendered shape and empty-state tests pass; production build passes.
- The user supplied a private version-1 analytics bundle with 34 datasets. It passed the production import validator. The production import/snapshot/visual adapters retained all 1,446 video rows, and all 77 registered visual renderers mounted without throwing (78 temporary checks passed). Neither the private data nor the local audit test is committed.
- Live anonymous Analytics was inspected: opening the Data Visuals section rendered the older sync/import-only empty panel. This does not certify deployment of PR #289. Authenticated data, real browser geometry with the uploaded data, loading/error captures, and production commit identity remain unverified.
- This phase preserves existing row DOM, row order, width, density, handlers, legacy controlBox actions and custom rows. It centralizes placement and width floors in preparation for the vocabulary and responsive-layout migrations.
Scope: the controller column, its rows, and the shells that lay it out, for the
Analytics **Data Visual modules** only. Out of scope, unchanged: the global
Toolbox and SubToolbox systems, Studio Hub, Projects, Editor, dashboard widget
primitives, and the canvas geometry contract (`data-visual-canvas-contract.md`),
which already owns the evidence area and is not re-opened here.

---

## 1. What is actually there today

Counted from the tree, not from memory.

### 1.1 Five shells render a Data Visual

| Shell | Direct uses | Notes |
|---|---|---|
| `SubToolboxChartModule` | 59 | The de-facto standard. Takes `controllerRows`. |
| `ModuleFrame` (Tube Explorer) | 18 | Wraps `AnalyticsVisualShell`; 29 more modules reach it through `createModule`. |
| `AnalyticsVisualShell` | 4 direct | `shellMode: "standard" | "vt2-preserved" | "compact-row"`. |
| `UnifiedAnalyticsVisualModule` | 3 | |
| `VtSyncVisualFrame` | 5 | Not a shell — a data/responsive boundary that renders the module. |

`UnifiedChartModule` and `DataVisuals/ChartModule` also consume the data-source
prefix, so they are on the same subtitle path but a different chrome path.

### 1.2 Two live controller authorities, and one dead one

**Live A — declarative rows.** `ControllerRow[]` in `VisualModuleController.tsx`,
ten variants: `number`, `text`, `label`, `dropdown`, `split`, `rankedBy`,
`metricMultiSelect`, `toggle`, `statement`, `custom`. Usage across the module
files:

```
dropdown 30   number 19   text 15   label 13   split 5   toggle 4
custom 4      metricMultiSelect 2   rankedBy 1   statement 0
```

`statement` is never authored by a module — it is only ever injected by the
shell (§1.4). `rankedBy` has exactly one caller and duplicates what `dropdown`
with a `labelPrefix` already does.

**Live B — bespoke JSX.** `AnalyticsVisualShell` with `shellMode:
"vt2-preserved"` takes `vt2.controlBlock`, an arbitrary `<Controller>`
component written per module. The Data Visuals 2 modules (`modules2/*`) use
this. Nothing in the row vocabulary applies to them: no shared row height, no
shared width, no shared tone handling, no shared overflow behaviour.

**Dead — the registry spec.** `VtSyncVisualModuleSpec` declares
`controllerSpec: { rows, width, density, denseLegacy }` and
`controls: VtSyncVisualControlSpec[]`. `controllerSpecForVisual()` populates
rows with `noop` handlers, and `controlsForVisual()` returns `kind` descriptors.
**`VtSyncVisualFrame` renders neither.** It reads only `sourceTableIds`,
`iconKey`, `headerColorPair` and `controllerColors`. So there is a second,
fictional description of every controller sitting beside the real one, and
nothing keeps the two in step.

### 1.3 `type: "custom"` is the escape hatch that defeats the vocabulary

Four uses, all in Channel Progress. Each hand-writes a row at `h-[30px]` while
every declarative row is `h-[26px]`, so the controller column is visibly
misaligned in exactly the module that uses the escape hatch most.

### 1.4 The row budget depends on which door you came through

`AnalyticsVisualShell.normalizedRows()` does three things nobody else does:

1. **Reorders** rows — every `dropdown`, `metricMultiSelect` and `rankedBy` is
   moved after all other rows. A module that authors `[dropdown, number]` gets
   `[number, dropdown]`.
2. **Injects** a `statement` row carrying `controllerExplanation` at the top,
   unless the module already has one.
3. **Truncates** to `slice(0, 4)` unless `denseLegacy` is set (one caller sets
   it).

A module rendering `SubToolboxChartModule` **directly** gets none of this: no
reorder, no statement, no cap. So the same `controllerRows` array produces two
different controllers depending on the shell above it, and a module with five
rows silently loses its fifth only on one of the two paths.

### 1.5 Width, density and row height are set in four places

- `VisualModuleController`: `controllerBaseWidth = 195`, `controllerMinWidth = 195`, row height `h-[26px]`.
- `ModuleFrame`: hardcodes `width: 220, density: "compact"`.
- `GraphsPageCharts`: `controllerWidth={210}` ×6, `controllerWidth={300}` ×1.
- `VtSyncVisualModuleSpec.controllerSpec.width` / `.density`: never read.

`controllerDensity` is a real prop on `SubToolboxChartModule` and is passed by
exactly one caller (`AnalyticsVisualShell`, from the spec that is otherwise
dead). No module passes it.

### 1.6 The responsive layer is declared but not wired

`VtSyncVisualFrame` emits per-orientation attributes for `span`, `aspect`,
`controls` (`inline | compact | menu`), `legend`, `explanation` and `density`.
Of the six, **only `data-vt-portrait-controls` is referenced by any stylesheet**,
and that reference lives in `public/mobile-visual-responsive-system.css`, which
now stands down for every canvas-owned module. In practice the controller
column has no orientation behaviour at all: it is the same column at 375px as
at 1440px.

### 1.7 So: the actual defects

1. Two live controller systems, and a third that is fiction.
2. The same row array renders differently depending on the shell above it.
3. Row order is silently rewritten by one path.
4. Row 5+ is silently dropped by one path.
5. Four different width authorities; a density knob nothing turns.
6. A custom-row escape hatch whose only user is misaligned by 4px per row.
7. A declared responsive contract that no CSS consumes.

---

## 2. Target

**One controller contract, one renderer, one layout authority, per-orientation
compositions — the same shape the canvas contract already uses.**

Concretely:

```
MODULE            -> declares intent: which controls, in which order, with what values
ControllerContract-> registered per visual: row budget, width, density, orientation plan
VisualModuleController -> the only thing that draws a control row
Shell             -> places the column; never reorders, injects or truncates
```

### 2.1 Row vocabulary, reduced

Ten variants collapse to **six**, chosen so nothing in the tree loses a
capability:

| Keep | Absorbs | Why |
|---|---|---|
| `stepper` | `number`, `text`, `split` | All three are "value with ◀ ▶". `split` becomes `stepper` with two value segments. |
| `select` | `dropdown`, `rankedBy` | `rankedBy` is `select` with `labelPrefix`; it has one caller. |
| `multiSelect` | `metricMultiSelect` | Unchanged, renamed for symmetry. |
| `toggle` | `toggle` | Unchanged. |
| `label` | `label`, `statement` | A statement is a full-width label with a tone. |
| `custom` | `custom` | Kept, but constrained — see §2.2. |

This is a mechanical migration: 19 `number` + 15 `text` + 5 `split` → 45
`stepper`; 30 `dropdown` + 1 `rankedBy` → 31 `select`.

### 2.2 `custom` stops being an escape hatch

`custom` keeps existing, but its render callback is handed the row chrome
rather than replacing it:

```ts
{ type: "custom", render: (slot: ControllerSlot) => React.ReactNode }
```

`ControllerSlot` supplies the row height, tones and segment boxes, so a custom
row cannot drift from `h-[26px]` again. The four Channel Progress rows become
`stepper` (time window), `toggle` (progress/delta), `toggle` (combo/grid) and
one genuine `custom`; the 30px misalignment disappears with them.

### 2.3 Layout: column × row combinations become a named set

Today the combinations are emergent (any width × any row count × two truncation
rules). Replace with a small closed set registered per visual, the way
`dataVisualModuleContract` registers canvas policy:

```ts
export type ControllerLayout =
  | "rail"     // one column beside the canvas   (desktop default)
  | "band"     // one row above the canvas       (landscape phone)
  | "sheet"    // a disclosure under the header  (portrait phone)
```

with a per-orientation budget, exactly parallel to the canvas contract's
`densityProfile`:

```ts
controllerProfile: {
  desktop:   { layout: "rail",  rows: 5, width: 210 },
  landscape: { layout: "band",  rows: 3, width: "100%" },
  portrait:  { layout: "sheet", rows: 2, width: "100%" },
}
```

The budget **selects**, it does not truncate: rows carry a `priority`, and the
composition keeps the highest-priority N. A dropped row is still reachable — in
`sheet` it is behind the disclosure, in `band` it scrolls. Nothing is silently
lost, which is the current `slice(0, 4)` behaviour's real problem.

### 2.4 Ordering is the module's, always

Delete the reorder in `normalizedRows`. If dropdowns should come last for a
given module, that module authors them last. One authority, visible at the call
site.

### 2.5 The dead spec is deleted, not implemented

`controllerSpecForVisual()` and `controlsForVisual()` are removed, along with
`controllerSpec` and `controls` on `VtSyncVisualModuleSpec`. The registry keeps
what it actually feeds: `sourceTableIds`, `iconKey`, `headerColorPair`,
`controllerColors`. A registry that describes something it does not render is
worse than no registry, because it reads as truth.

---

## 3. Sequence

Each phase lands on its own and leaves the tree working. No phase depends on a
later one.

**Phase 0 — freeze the current behaviour in a test.**
Snapshot, per registered visual, the rows it authors and the rows that reach
`VisualModuleController` after the shell is done with them. This is the diff
that every later phase must not change except where the phase says so. Without
it, §1.4's reorder-and-truncate will be "fixed" invisibly and something will
lose a control.

**Phase 1 — delete the fiction.** Remove `controllerSpecForVisual`,
`controlsForVisual`, and the two dead fields. Pure subtraction; ~120 lines.
Risk: none — nothing reads them. Do this first because it halves the surface
every later phase has to reason about.

**Phase 2 — one row renderer, one width authority.** Move `195/210/220/300`
into `ControllerLayout` defaults. Make `SubToolboxChartModule` and
`AnalyticsVisualShell` route through one code path so the same array yields the
same controller. Keep the reorder and the cap for now, behind a flag, so
Phase 0's snapshot still passes.

**Phase 3 — collapse the vocabulary.** `number|text|split → stepper`,
`dropdown|rankedBy → select`, `statement → label`. Mechanical, ~50 call sites.
Snapshot must be unchanged.

**Phase 4 — turn off reorder and truncation.** Now the snapshot changes, once,
deliberately, with the diff reviewed: the modules whose row order was being
rewritten, and the modules that were losing row 5. Fix the call sites that were
relying on the reorder by authoring the order they want.

**Phase 5 — register `controllerProfile` per visual and land `band` / `sheet`.**
This is the only phase that changes what a phone shows. Verify it the way the
canvas work was verified: the Playwright audit harness at 375×667, 390×844,
667×375, 844×390, with the contact sheets inspected before anything is called
done.

**Phase 6 — retire `vt2-preserved`.** Port the seven `modules2` controllers
from bespoke `<Controller>` JSX onto the row vocabulary, one module per PR.
Delete `shellMode: "vt2-preserved"` and `vt2.controlBlock` when the last one
lands. This is last because it is the only phase that is a rewrite rather than
a migration, and it is worth doing only once the vocabulary it targets has
stopped moving.

**Phase 7 — either wire the responsive attributes or delete them.** Five of the
six emitted attributes are consumed by nothing. Once `controllerProfile` exists,
`controls`/`density` are redundant and should go; `legend` and `explanation`
should either get CSS or follow them out.

---

## 4. What could go wrong

- **Phase 4 is the risky one.** Turning off reorder and truncation changes what
  ~50 modules show. Mitigated by Phase 0's snapshot: the diff is reviewable
  module by module, and anything surprising is a call-site fix, not a revert.
- **`denseLegacy` hides a real requirement.** One caller sets it, meaning at
  least one visual genuinely needs more than four rows. Phase 5's priority
  ordering must be in place before the cap is removed, or that visual gets a
  five-row rail on a portrait phone.
- **`modules2` may not fit the vocabulary.** The Multi-Metric Timeline
  controller carries compare-mode state (`cmpType`, `videoIdxA/B`) that has no
  row equivalent. If Phase 6 needs a seventh row type, add it — the goal is one
  vocabulary, not a small one.

## 5. Not in this plan

- Canvas geometry, mark scale and density budgets — owned by
  `data-visual-canvas-contract.md` and already migrated for seven visuals.
- Header, title, icon and metric-badge layout.
- The subtitle and data-source line, which are a separate change already landed
  alongside this document.
