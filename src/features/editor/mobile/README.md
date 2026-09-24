# Mobile Editor

Self-contained mobile editor for ViewTube — a touch-first component tree that lives beside the canonical desktop editor (`VT_E1.jsx`). Both portrait and landscape are first-class.

```
mobile/
├── MobileEditor.tsx         Top-level shell + <ResponsiveEditorShell>
├── state/editorState.ts     useEditorState reducer (project, playhead,
│                            selection, tool, panel, undo/redo)
├── hooks/
│   ├── useViewport.ts       breakpoint / orientation / safe-area
│   └── gestures.ts          usePinchZoom, useDragScrub, useLongPress,
│                            useSwipe, useSuppressBrowserZoom
├── layouts/
│   ├── PortraitLayout.tsx   preview → transport → dock → timeline → sheet
│   └── LandscapeLayout.tsx  side dock + preview / transport / timeline / sheet
└── components/
    ├── PreviewPane.tsx      video preview with tap-to-play + drag-to-scrub + pinch
    ├── TransportBar.tsx     44px hit-target play/skip/undo/redo/speed
    ├── TimelineStrip.tsx    horizontal scroll, pinch-zoom, drag clips, long-press
    ├── PanelSheet.tsx       bottom sheet with swipe-between-tabs + drag-handle
    ├── ToolDock.tsx         tool bar (row in portrait, column in landscape)
    ├── ContextMenu.tsx      long-press menu, auto-flipped near screen edges
    └── PanelBodies.tsx      default panel bodies (select, trim, text, audio,
                             transitions, effects, export)
```

## Current host ownership

`EditorV1Page` owns the mobile `EditorStore` and passes it into `ResponsiveEditorShell` through `externalStore`. The store therefore survives switching the **Editor UI** preference away from the responsive/mobile host and back again for the lifetime of the editor route.

The route also uses `editorProjectBridge.ts` to persist the compatible mobile project payload. On route mount, a previous mobile bridge snapshot can seed the store. While the mobile host is active, project changes are written back through the versioned bridge.

Current bridge status:

- mobile -> shared bridge: implemented
- shared bridge -> mobile project seed on route mount: implemented
- route-owned mobile store survives frontend switching: implemented
- desktop VT_E1 -> shared bridge adapter: implemented through `useDesktopProjectBridge`
- shared bridge -> live desktop VT_E1 apply: implemented for newer mobile snapshots through the same hook

The canonical `VT_E1.jsx` model is connected to the shared bridge. Remaining work is parity/round-trip certification and schema-capability coverage, not initial desktop bridge wiring.

## Quick start

```tsx
import { ResponsiveEditorShell, useEditorState } from '@/features/editor/mobile';
import VTE1Editor from '@/features/editor/VT_E1';

export default function EditorRoute() {
  const mobileStore = useEditorState();

  return (
    <ResponsiveEditorShell
      desktop={<VTE1Editor />}
      externalStore={mobileStore}
      renderPreview={({ widthPx, heightPx }) => (
        <MyRemotionPlayer width={widthPx} height={heightPx} />
      )}
    />
  );
}
```

The shell decides mobile vs desktop from `useViewport().isMobile` (`< 1024px` wide). Force one side with `mode="mobile"` or `mode="desktop"`.

## What the gestures do

| Gesture | Where | Effect |
|---|---|---|
| **Pinch** | Timeline strip | Zooms `state.zoomPxPerSec` in/out |
| **Pinch** | Preview pane | Visual-only zoom of the canvas |
| **Drag horizontal** | Preview pane | Scrubs the playhead |
| **Drag horizontal** | Clip block | Moves the clip; trim handles resize |
| **Long-press** | Clip block | Opens contextual menu (split/dup/trim/delete) |
| **Long-press** | Empty timeline area | Opens contextual menu (paste/add title) |
| **Swipe** | Panel-sheet header | Advances between tool tabs |
| **Vertical drag** | Panel-sheet handle | Resizes the sheet (peek / half / full) |

Every hit target is ≥ 44×44 CSS px. `useSuppressBrowserZoom` attached at the root disables the browser's own pinch-zoom and double-tap-zoom so all gestures reach the editor.

## State boundary

The mobile reducer owns presentation/interactivity state such as playhead, playback, zoom, selection, active tool, panel state, and 50-step undo/redo. The shared project bridge intentionally stores the compatible `VtE1Project` payload rather than those mobile-only UI details.

That separation lets the next desktop adapter exchange clips, transitions, and compatible project fields without forcing the desktop and mobile interfaces to share every piece of UI state.

## Renderer slot

`<PreviewPane renderPreview={...}>` is a slot — pass any renderer:

- the existing desktop preview canvas
- the engine's `<Player composition={…} />` from `src/remotion-editor/src/engine/cloud/player`
- a `<video>` tag
- a `<canvas>` you paint into

If omitted, the pane falls back to a plain "no clip / clip id at playhead" message that's still fully interactive.

## Panel bodies

Default bodies live in `components/PanelBodies.tsx`. They're deliberately compact — enough to be immediately useful on mobile but not a full port of the desktop panels. Override any of them by passing your own `render` prop to `<PanelSheet>` (composable through `PortraitLayout` / `LandscapeLayout`).
