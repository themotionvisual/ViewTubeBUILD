# Mobile Editor Workspace Repair — 2026-09-18

## Scope
Repair the phone editor without creating a second editor engine. The mobile surface continues to use the shared VT_E1 project/store/timeline bridge.

## Problems addressed
- Play/pause toggled state but did not advance the shared playhead.
- Portrait/landscape preview geometry could cover or starve tool pages.
- Primary navigation and quick actions duplicated Media/Text/Settings.
- Tool pages were trapped in narrow rails rather than receiving a full mobile workspace.
- The mobile fallback preview only displayed a clip id even when bridged desktop layers/media were present.
- EditorV1Page referenced a missing EditorViewSwitcher type contract.

## Implementation
- Added a requestAnimationFrame playback clock tied to shared playing/playbackRate/playhead state.
- Added persistent Preview / Edit / Split workspace modes.
- Added one unified orientation-aware mobile workspace so page/mode state survives rotation.
- Primary nav is now singular and horizontally scrollable.
- Quick actions are contextual only: undo, redo, split, duplicate, inspect, delete.
- Clips is now the project-entry page and exposes project clips plus truthful asset entry state.
- Added Graphics & SVG page and retained Templates including gradients/pattern backgrounds.
- Restored the interface/layout switcher contract and made phone layout overrides functional.
- Added a browser-safe mobile project preview for bridged media, text, shapes, keyframed visual properties and template overlays.

## Acceptance gates
- Play advances playhead and stops at project end.
- Timeline follows the advancing playhead.
- 9:16 and 16:9 canvases remain visible without covering tool pages.
- Preview can be hidden entirely in Edit mode.
- All tool pages scroll vertically.
- Navigation has no duplicate Media/Text/Settings quick actions.
- Existing bridged media/text/shape layers appear in mobile preview.
- Templates/SVG/backgrounds remain reachable from the navigation.


## Containment and elastic module sizing
- Navigation, preview/tool workspace, timeline, and mini-map are bounded by the editor viewport and may not extend outside it.
- Each module owns an internal overflow surface; oversized contents scroll inside the module instead of enlarging the page.
- Preview canvas dimensions are calculated with an aspect-fit observer so 9:16 and 16:9 compositions remain completely inside the allocated preview module.
- Timeline and map use fractional grid rows instead of fixed pixel rows. Removing either module redistributes its space across the remaining preview/tool and timeline/map modules.
- Split workspace uses only minmax(0, fr) tracks; it has no fixed-width or fixed-height minimum that can force a phone viewport overflow.
