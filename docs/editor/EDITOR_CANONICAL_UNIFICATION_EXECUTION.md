# Editor Canonical Unification — Execution Ledger

## Safety baseline

Integration branch: `feat/editor-canonical-unification-2026-09-11`

Created from Main SHA `8c2a21d9fe2523ec8ca2fe8be5ea78b7a1abf659` on 2026-09-12. Main is not to be edited by this work until the integration branch has passed desktop/mobile acceptance and explicit merge approval.

Machine-readable ledger: `docs/editor/EDITOR_FEATURE_PRESERVATION_MANIFEST.json`.

## Authority model

- **Functional/integration authority:** current Main.
- **Visual acceptance authority:** the chosen editor deployment/reference artifact.
- **Selective source:** `feat/vt-e1-unification-2026-08-27` for shared-store, transition-presentation and historical unification work.
- **Reference-only hardening:** `codex/vt-e1-renderer-v2` and `codex/vt-e1-temporal-envelope` until their branch-only deltas are proven missing from Main.
- Do not begin by cherry-picking historical `VT_E1.jsx`. Rebuild the shell on Main's architecture.

## Current audit snapshot

Main already contains the mobile editor, render-worker architecture, Remotion engine, current VT_E1 route/shell, timeline contracts and Video Package production contract. The older unification branch is now 371 commits behind Main and 40 ahead; its useful deltas must therefore be selectively reconciled rather than merged wholesale. Its branch-only editor work includes the historical VT_E1 delta, mobile package, transition presentations, captions, shared editor-store contract, Remotion composition work, animation math, SVG paths and timeline tests. Some of those capabilities are already present or evolved on Main and are marked accordingly in the JSON manifest.

The shared-store contract from the older unification branch is intentionally narrow: desktop and mobile consume one state/action boundary while timeline mutation math remains owned by `src/shared/vtE1TimelineOperations.js` and preview/render timing remains owned by the shared timeline contract. This is the intended convergence direction, not permission to replace Main's timeline internals.

## Layer execution order

1. **Shell** — recreate the accepted layout/panels/controls/spacing on top of Main's route, state, events and APIs.
2. **Timeline** — preserve timing contract, playhead, zoom, selection and history; establish shared-store adapter without moving timeline math.
3. **Clips + trimming** — prove add/update/move/trim/split/duplicate/delete and track controls before visual refinements are considered complete.
4. **Transitions** — reconcile transition presentations with Main runtime and render timing.
5. **Preview** — converge desktop/mobile preview timing while retaining the mobile renderer slot and gestures.
6. **Audio / media / text** — retain engine audio, captions, media, SVG/vector and text capabilities.
7. **Mobile** — preserve portrait/landscape layouts, all documented gestures, >=44px targets and 50-step undo/redo while removing duplicate state ownership only after parity.
8. **Render / export** — keep same-origin proxying and canonical Remotion MP4; MOV/WebM remain worker transcodes. Validate the full engine feature map.
9. **Video Package / handoff** — preserve Vault asset IDs, timeline ID, editor handoff and render IDs.

## No-loss rule

After each layer, compare the integration branch against current Main and every source branch relevant to that layer. A source feature may be removed only when the manifest says `SUPERSEDED` and its acceptance behavior has a passing replacement. `REFERENCE ONLY` code is never copied merely because it exists on an older branch.

## First implementation checkpoint

Before shell coding begins:

- [ ] Resolve the exact commit behind the chosen visual deployment and record it in the manifest if available.
- [ ] Inventory Main `VT_E1.jsx` symbols/state/event/API dependencies.
- [ ] Inventory Main `VT_E1.css` layout and interaction selectors separately from visual-material selectors.
- [ ] Map mobile reducer actions to the proposed shared-store contract.
- [ ] Map Video Package handoff entry/exit points into the editor route.
- [ ] Record desktop and mobile visual baseline screenshots.

Then implement the shell only. Do not mix shell work with timeline/state migrations in the first coding commit.
