# VT-E1 Desktop Timeline Adapter Map

Branch: `feat/editor-desktop-adapter-pass-2026-09-12`

## Current finding

`VT_E1.jsx` already imports all four canonical timeline operations from `src/shared/vtE1TimelineOperations.js` and advertises feature flags for slip edit, slide edit, ripple delete and split/delete variants. The desktop file is intentionally not being replaced by the mobile reducer.

## Adapter boundary

`src/features/editor/shared/desktopTimelineAdapter.js` now provides one normalized desktop-facing API:

- `split(clips, clipId, playheadSec, makeRightId)`
- `slip(clips, clipId, deltaSec, sourceDurationSec)`
- `slide(clips, clipId, deltaSec)`
- `rippleDelete(clips, clipIds)`

Each method delegates mutation math to the canonical shared operations. It does not own React state, selection, history, gestures, feature flags, transition state, rendering, or persistence.

## Why this layer exists

The mobile reducer now exposes explicit split/slip/slide/ripple actions. Desktop has a much larger local state system and should not be reducer-swapped simply to achieve API symmetry. This adapter lets desktop commands converge on the same operation vocabulary first.

## Preservation rules

1. Keep `VT_E1.jsx` as desktop state/interaction authority during this phase.
2. Keep normal drag/move, edge trim and ordinary delete behavior unchanged.
3. Advanced slip, slide and ripple delete remain explicit modes/actions.
4. Keep shared timeline operations as the sole math authority.
5. Do not move transition-window or source-time mapping out of `vtE1TimelineContract.js`.
6. Do not change render/export, Remotion, Video Package, session persistence, shell CSS or the linked-classic reference.
7. Integrate one desktop command path at a time and preserve its existing history/selection side effects around the adapter call.

## Next integration order

1. Locate the concrete desktop split command and replace only its direct math call with `desktopTimelineAdapter.split`.
2. Verify ID generation, selection, history and transition cleanup remain identical.
3. Repeat for slip.
4. Repeat for slide, preserving rejected-slide feedback/reason handling.
5. Repeat for ripple delete, preserving transition cleanup and selection clearing.
6. Run the shared operation tests + desktop adapter tests + mobile reducer tests before declaring clips/trimming parity.

## Gate

The adapter is safe to land independently because it is not imported by `VT_E1.jsx` yet. This creates a testable checkpoint before editing the giant desktop file.
