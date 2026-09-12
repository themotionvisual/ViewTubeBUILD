# Canonical Editor Shell — Source Audit

## Exact visual source resolved

The exact visual deployment source is no longer unresolved. Main's `EditorV1Page.tsx` explicitly records the linked deployment commit as:

`763cc59b3c55dae41171a1f27f87fe66bd9c354b`

Main also preserves that frontend as `src/features/editor/VT_E1_LinkedClassic.jsx` and exposes it through the `linked-classic` frontend mode. This gives the integration branch an in-repository A/B reference instead of relying on screenshots alone.

## Host invariants — KEEP FROM MAIN

`src/views/EditorV1Page.tsx` owns integration behavior that shell work must not remove:

- `EditorRouteBoundary` with visible failure/retry UI.
- `EditorFrontendSwitcher` for current-main vs linked-classic A/B testing.
- persisted frontend preference via `editorFrontendMode.ts`.
- direct `?editorStyle=current|linked` testing.
- forced `?editor=mobile|desktop` testing.
- `ResponsiveEditorShell` around current Main.
- `VTE1LinkedClassicEditor` as preserved visual reference.
- route container sizing/overflow boundary.

These are acceptance instrumentation as well as product behavior; retain them until canonical parity is approved.

## VT_E1 functional imports — KEEP FROM MAIN

The current Main and linked-classic snapshot both begin from the same critical shared contracts. The shell rebuild must not fork or inline them:

- `vtE1Shorts` normalization/interpolation/crop/smoothing utilities.
- `vtE1TimelineContract.js`: source-time mapping, transition windows/seam validation, render-output normalization/labels.
- `vtE1TimelineOperations.js`: ripple delete, slide, slip and split operations.
- JSZip project/export dependency.
- Lucide icon runtime.
- project/session/export schema constants and persistent session DB contract.

The opening source also documents implemented deterministic animation/keyframe/layer/media rules. These are functional behavior, not shell styling.

## Visual authority boundary

`VT_E1_LinkedClassic.jsx` is `REFERENCE ONLY`. It is the exact deployment snapshot and therefore authoritative for visual acceptance, but its state implementation is not to replace Main. `VT_E1.jsx` remains the functional surface to modify.

`VT_E1.css` is shared by both current and linked-classic surfaces. That means broad destructive CSS replacement would contaminate the A/B reference. First shell implementation must therefore introduce canonical-shell scoping rather than globally rewriting shared selectors.

Recommended scoping contract:

- canonical/current Main root: `[data-editor-frontend="current-main"]`
- preserved visual reference root: `[data-editor-frontend="linked-classic"]`
- shell-specific additions should be prefixed/scoped so linked-classic remains stable.

## First coding boundary

The first shell commit is allowed to change only presentation/chrome and must preserve all host/state/event/API wiring. It may:

- add canonical shell wrapper classes/data attributes;
- add scoped current-main CSS;
- align panel geometry, spacing, controls, timeline chrome, clip chrome and transition chrome with the exact linked baseline;
- add visual-only tokens.

It must not yet:

- migrate reducers/stores;
- change timeline mutation math;
- change transition timing;
- change render/export endpoints or schemas;
- remove linked-classic mode;
- change mobile gesture behavior;
- change Video Package handoff contracts.

## Source divergence note

The exact deployment commit and current Main have diverged substantially. Current Main is hundreds of commits ahead and the deployment line also has branch-only history. Therefore the deployment commit is a visual source, not a merge base. `VT_E1_LinkedClassic.jsx` exists specifically to preserve the exact frontend snapshot while current Main evolves.

## Shell acceptance checklist

- [ ] `/editor?editorStyle=linked` remains unchanged and serves as the reference.
- [ ] `/editor?editorStyle=current&editor=desktop` matches reference shell geometry without losing current functionality.
- [ ] `/editor?editorStyle=current&editor=mobile` continues to use the touch-first mobile system.
- [ ] route error boundary still catches editor mount failures.
- [ ] current/linked switch persists locally.
- [ ] no shared timeline/render contract changes in shell commit.
- [ ] no reducer/store migration in shell commit.
- [ ] no Main merge until branch deployment is tested on phone and desktop.
