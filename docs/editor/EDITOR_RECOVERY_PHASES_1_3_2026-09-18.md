# Editor Recovery Phases 1–3 — 2026-09-18

## Authority
Current main remains the sole integration baseline. Donor branches are archaeological sources only; no stale branch is merged wholesale.

## Phase 1 — Recovery branch and preservation gate
Status: COMPLETE on `feat/editor-recovery-phases-1-3-2026-09-18`.

| Donor capability | Main before recovery | Disposition |
|---|---|---|
| Shared timeline operations | PRESENT | Keep canonical |
| Desktop timeline adapter | MISSING | PORT |
| Desktop adapter tests | MISSING | PORT |
| Gradient primitives | PRESENT | Reuse |
| SVG pattern primitives | PRESENT | Reuse |
| Gradient/pattern template definitions | MISSING | PORT |
| Template canvas renderer | MISSING | PORT |
| Template catalog registration | MISSING | PORT |
| Template library categories | PARTIAL | EXTEND |
| Preview template rendering | PARTIAL | EXTEND |

## Phase 2 — Engine and timeline contract recovery
The desktop adapter now delegates split, slip, slide, and ripple-delete to `src/shared/vtE1TimelineOperations.js`. It does not introduce a second timeline model or reducer. Tests preserve source offsets/keyframes, seam behavior, and per-track ripple deletion.

## Phase 3 — SVG templates, gradients, and backgrounds
The design library now registers ViewTube palette gradient backgrounds and SVG pattern backgrounds generated from the existing canonical background primitives. The mobile template library exposes Backgrounds and Patterns, converts selections through the existing `templateToTimelineClip` bridge, and the preview renders active design-template clips through `TemplateCanvasRenderer`.

## Verification gate
Required before integration:
- Type/build validation.
- Desktop timeline adapter tests.
- Existing timeline operation tests.
- Template catalog imports resolve.
- Background and pattern categories appear in the template library.
- Added template clips render in preview.
