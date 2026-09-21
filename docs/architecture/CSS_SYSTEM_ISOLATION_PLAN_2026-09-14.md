# ViewTube CSS System Isolation Plan — 2026-09-14

## Objective
Separate Dashboard/Widget styling from Toolbox/Subtoolbox and page styling so a change in one UI system cannot silently restyle another.

## Ownership model

`FOUNDATION -> { TOOLBOX, PAGE, WIDGET, EDITOR }`

Horizontal dependencies between TOOLBOX and WIDGET are forbidden. Shared visual DNA must be expressed through foundation palette/spacing/motion values, not shared component selectors.

### FOUNDATION
Owns reset, fonts, semantic application tokens, accessibility helpers, application shell and truly global utilities. `src/index.css` must progressively lose component selectors and component-system imports.

### TOOLBOX
Owns Toolbox shell, Subtoolbox shell, Toolbox controls and Toolbox responsive behavior. Canonical roots are `src/styles/toolbox-system.css`, `src/styles/subtoolbox-system.css` and their eventual primitive modules. Toolbox CSS must never target `.widget-*`, `.vt-widget*` or `.dashboard-barrier`.

### PAGE
Owns composition only. Pages may position canonical components but may not redefine Widget or Toolbox primitives.

### WIDGET
Owns Dashboard grid, WidgetShell, Widget primitives, data states, archetypes, widget-specific compositions, mobile behavior and internal scrolling. Dashboard styles must live behind DashboardBarrier and must never target Toolbox/Subtoolbox namespaces.

### EDITOR
Owns editor shell, timeline, preview, panels and editor responsive behavior independently of Dashboard and Toolbox.

## Known migration exception
`src/views/dashboard/toolboxWidgetSystem.css` is a legacy dashboard monolith. Its name does not make it Toolbox authority. It remains temporarily permitted while its rules are classified and extracted. No new cross-system rules may be added to it.

## Target layer order

```css
@layer reset, foundation, app, toolbox, pages, widgets, editor, utilities, accessibility;
```

## Phase 1 — inventory
- Run `node scripts/css-network-audit.mjs`.
- Commit `docs/architecture/css-network.json` and `css-network.md` when generated locally/CI.
- Track file owner, imports, selector roots, variables, `!important`, media/container blocks and cross-system namespace violations.

## Phase 2 — ownership
- Classify every active CSS file as FOUNDATION / TOOLBOX / PAGE / WIDGET / EDITOR / LEGACY.
- Treat backups/quarantine as non-runtime evidence only.
- Establish explicit system entry points.

## Phase 3 — guardrails
- `src/styles/cssOwnershipContract.test.ts` prevents new Toolbox -> Widget and Widget -> Toolbox selector leaks.
- Keep the single legacy `toolboxWidgetSystem.css` exception explicit until decomposition completes.
- Add future checks for global component selectors and page-owned primitive declarations after baseline exceptions are catalogued.

## Phase 4 — Dashboard isolation
- Keep DashboardBarrier as the Widget scope root, not a specificity weapon.
- Move all dashboard imports behind that boundary.
- Establish `@layer widgets` ownership.
- Remove dependence on globally loaded Toolbox/Subtoolbox rules.
- Preserve current widget visuals during extraction.

## Phase 5 — Toolbox isolation
- Stop loading `toolbox-system.css` globally from `main.tsx`.
- Stop importing `subtoolbox-system.css` from global `index.css`.
- Add a Toolbox boundary/entry point used by Toolbox-owning pages.
- Confirm Studio Hub, Projects, Vault and Publisher explicitly consume the Toolbox system.

## Phase 6 — decompose dashboard monolith
Extract `toolboxWidgetSystem.css` without changing rendered output, in this order:
1. `dashboardGrid.css`
2. `widgetShell.css`
3. `widgetHeader.css`
4. `widgetControls.css`
5. `widgetDataStates.css`
6. `widgetVisuals.css`
7. `widgetForms.css`
8. `widgetResponsive.css`
9. widget-specific CSS

Delete a rule from the monolith only after its canonical owner exists and contract/screenshot tests pass.

## Phase 7 — specificity cleanup
- Replace legacy high-specificity ownership with low-specificity scope roots and cascade layers.
- Remove `!important` only after its competing selector has been eliminated or re-owned.
- Remove global `:not(.dashboard-barrier ...)` exclusions once the systems no longer overlap.
- Delete dead/duplicate selectors only after search + visual certification.

## Acceptance gates
1. Dashboard renders correctly without Toolbox CSS loaded.
2. Toolbox pages render correctly without Dashboard CSS loaded.
3. No Widget stylesheet targets Toolbox/Subtoolbox namespaces.
4. No Toolbox stylesheet targets Widget/Dashboard namespaces.
5. Page CSS does not own primitive definitions.
6. Mobile Widget contract remains full-width and fixed-height-bucket compliant.
7. UI Reference Library primitives match production Widget primitives.
8. No new `!important` is introduced to solve ownership.
9. CSS ownership contract and existing dashboard tests pass.
10. Production screenshots are compared before each destructive cleanup wave.

## Immediate next implementation wave
Run the inventory script, freeze the resulting baseline, then create explicit Dashboard and Toolbox stylesheet entry points. Do not begin deleting legacy CSS until both systems can be loaded independently in tests.
