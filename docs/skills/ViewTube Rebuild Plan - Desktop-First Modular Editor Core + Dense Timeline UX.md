## ViewTube Rebuild Plan: Desktop-First Modular Editor Core + Dense Timeline UX

### Summary
Rebuild the video editor from scratch as a **real editor engine** (not a UI mock), with:
- A **single canonical timeline model** powering all edits
- A **toolbox-style shell** (MainToolbox/SubToolbox) for progressive complexity
- A **desktop-first interaction system** implementing hold/drag/split/delete/trim behavior
- **Viewport-aware track tapering + gravity stacking** to eliminate empty vertical space
- A shared AI layer that drafts edits but applies only through explicit timeline actions

### Implementation Changes
- **Editor architecture**
  - Introduce `EditorEngine` with immutable timeline state + command reducer (`insert/trim/move/split/delete/group/transition/keyframe`).
  - Use a single source of truth: `Project -> Tracks -> Clips -> Keyframes -> Links/Transitions`.
  - Add history stack for undo/redo and deterministic replays.
- **Toolbox shell + layout**
  - Keep toolbox grammar: `MainToolbox` sections with nested `SubToolbox` modules.
  - Primary layout: top workspace/player + inspector/actions, bottom high-density timeline.
- **Timeline core (desktop interactions)**
  - Thin, tightly stacked tracks; slight corner radius; long horizontal timeline.
  - Hold-to-grab: mousedown clip body + 500ms -> drag mode (X/Y/both).
  - Edge trim/extend handles with snapping.
  - `ArrowDown+click` split at pointer time.
  - `ArrowLeft+click` split+delete left segment.
  - `ArrowRight+click` split+delete right segment.
  - Transparent blue guide line follows pointer with exact time mapping.
  - Cursor state machine: default / trim / drag.
- **Viewport-aware compaction**
  - Empty tracks collapse to fine lines.
  - Out-of-view tracks taper near nearest visible boundary.
  - Active tracks gravity-stack while preserving order and drop targets.
- **Grouping + seam transitions**
  - Double-click seam toggles grouping.
  - Right-click seam converts group <-> transition.
  - Double-click transition can ungroup.
- **Contextual pills + AI contract**
  - Double-click clip opens clip pill menu (color, speed, easing, grouping/transition).
  - Double-click empty timeline opens context insert menu.
  - AI only returns draft artifacts and preview patches; explicit user confirm before apply.

### Public APIs / Interfaces / Types
- `TimelineCommand`
  - `moveClip | trimClipStart | trimClipEnd | splitClip | deleteSegment | groupSeam | setTransition | setClipColor | setSpeed | setEasing | ...`
- `PointerInteractionState`
  - `idle | pressing | dragging | trimmingStart | trimmingEnd | seamEditing`
- `ViewportCompactionState`
  - `visibleTimeRange`, `trackDisplayMode: full | tapered`, `expandOnHover`
- `SeamLink`
  - `leftClipId`, `rightClipId`, `kind: group | transition`, `transitionType`
- AI contracts: `AIGenerateDraftRequest/Response`, `TimelineApplyRequest`

### Test Plan
- **Interaction correctness**: hold-drag threshold, trim edge behavior, arrow split/delete semantics.
- **Timeline math**: snapping correctness, boundary handling, move/trim integrity.
- **Compaction**: taper + gravity stack behavior across long scroll ranges.
- **Seam behavior**: group/transition toggles and persistence through edits.
- **Context menus**: clip vs empty-space actions.
- **Performance**: responsiveness with 100+ tracks and long timelines.

### Assumptions
- Desktop-only input model.
- Timeline is canonical source of truth.
- UI stays toolbox/neobrutalist; timeline remains denser and calmer.
- V1 focus is engine + interaction stability before distribution/publishing layers.
