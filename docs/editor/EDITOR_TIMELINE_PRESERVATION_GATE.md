# VT-E1 Timeline Preservation Gate

Branch: `feat/editor-timeline-pass-2026-09-12`
Parent shell checkpoint: `d246bf39270d4a0079398a211371436ff2b7b3aa`

## Purpose

This gate prevents the shared-store migration from replacing working timeline behavior with a smaller abstraction. The new `src/features/editor/shared/editorStoreContract.ts` is a UI/runtime vocabulary only. It does not own mutation math or render timing.

## Canonical ownership

| Capability | Current owner | Migration rule |
| --- | --- | --- |
| Split clip including source ranges + keyframes | `src/shared/vtE1TimelineOperations.js` | KEEP FROM MAIN |
| Slip edit | `src/shared/vtE1TimelineOperations.js` | KEEP FROM MAIN |
| Slide edit with adjacent seam constraints | `src/shared/vtE1TimelineOperations.js` | KEEP FROM MAIN |
| Ripple delete by track | `src/shared/vtE1TimelineOperations.js` | KEEP FROM MAIN |
| Minimum clip duration | shared operations/contract | KEEP FROM MAIN |
| Transition seam validation | `src/shared/vtE1TimelineContract.js` | KEEP FROM MAIN |
| Transition window math | `src/shared/vtE1TimelineContract.js` | KEEP FROM MAIN |
| Timeline -> source time mapping | `src/shared/vtE1TimelineContract.js` | KEEP FROM MAIN |
| Desktop VT_E1 state/commands | `src/features/editor/VT_E1.jsx` | MERGE THROUGH ADAPTER; DO NOT REPLACE YET |
| Mobile reducer/store | `src/features/editor/mobile/state/editorState.ts` | MERGE THROUGH CONTRACT; DO NOT REPLACE YET |
| Shared UI/runtime vocabulary | `src/features/editor/shared/editorStoreContract.ts` | PORT / CANONICAL CONTRACT |

## Mobile reducer parity inventory

The current mobile reducer already exposes the contract's core state: project, playhead, playing, playback rate, timeline zoom, selection, active tool, panel state and history. It exposes clip add/update/move/trim/split/delete/duplicate; track mute/lock/hide; transition add/remove; and undo/redo.

Do not mark mobile state `SUPERSEDED` until all of the following are true:

- [ ] orientation changes preserve the same store instance
- [ ] 50-step history behavior remains intact
- [ ] selection semantics remain identical
- [ ] playhead clamps to project duration
- [ ] playback rate remains clamped to 0.1–4
- [ ] zoom remains clamped to 4–400 px/sec
- [ ] panel height remains clamped to 0.15–1
- [ ] track mute/lock/hide behavior remains intact
- [ ] transition deletion behavior remains intact when clips are deleted
- [ ] mobile gestures dispatch equivalent actions without regressions

## Critical no-loss discrepancy

The current mobile reducer implements several timeline mutations locally. In particular its split implementation divides the visible start/end range but does not itself reproduce all of Main's canonical `splitTimelineClip` source-range/keyframe behavior. Its move/trim/delete implementations also do not automatically inherit Main's slip/slide/ripple-delete algorithms.

Therefore the next implementation step is **not** to make desktop consume the mobile reducer. The safe direction is the opposite: migrate mobile mutation cases to thin adapters around the canonical shared timeline operations, preserving the existing action API used by mobile gestures/components.

## Timeline acceptance gate

Before advancing to clips/trimming, prove:

- [ ] `splitClipAtPlayhead` preserves `sourceInSec`, `sourceOutSec`, and keyframe offsets using `splitTimelineClip`
- [ ] normal move behavior remains unchanged
- [ ] normal trim behavior remains unchanged
- [ ] slip uses `slipTimelineClip`
- [ ] slide uses `slideTimelineClip`
- [ ] ripple delete uses `rippleDeleteTimelineClips`
- [ ] transition seam validation still uses the shared timeline contract
- [ ] preview source-time mapping still uses the shared timeline contract
- [ ] undo/redo snapshots still restore project + playhead + selection
- [ ] no render/export files change in this layer
- [ ] no visual shell files change in this layer

## Implementation sequence

1. Land the type-only shared contract.
2. Add/extend timeline operation tests for source-range/keyframe-preserving split, slide boundaries and ripple delete.
3. Refactor mobile split to call `splitTimelineClip` without changing the public action shape.
4. Add explicit mobile actions/adapters for slip, slide and ripple delete only when the UI needs them; do not overload normal move/trim/delete semantics.
5. Build a desktop adapter inventory mapping existing `VT_E1.jsx` commands to the shared action vocabulary.
6. Only after parity is green, decide whether one reducer can own both surfaces.
