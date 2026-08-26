# Mobile Editor

Self-contained mobile editor for ViewTube — a fresh, touch-first component
tree that lives beside the existing desktop editor (`VT_E1.jsx`) without
touching it. Both portrait and landscape are first-class.

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

## Quick start

```tsx
import { ResponsiveEditorShell } from '@/features/editor/mobile';
import { DesktopEditor } from '@/features/editor/VT_E1';

export default function EditorRoute() {
  return (
    <ResponsiveEditorShell
      desktop={<DesktopEditor />}
      seed={{ durationSec: 60 }}
      renderPreview={({ widthPx, heightPx }) => (
        <MyRemotionPlayer width={widthPx} height={heightPx} />
      )}
    />
  );
}
```

The shell decides mobile vs desktop from `useViewport().isMobile`
(`< 1024px` wide). Force one side with `mode="mobile"` or `mode="desktop"`.

## What the four gestures do

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

Every hit target is ≥ 44×44 CSS px (WCAG target-size AAA). `useSuppressBrowserZoom`
attached at the root disables the browser's own pinch-zoom and double-tap-zoom
so all gestures reach the editor.

## Sharing state with the desktop editor

The mobile editor keeps its own `useEditorState` reducer by default so it can
run standalone. If you're ready to unify:

1. Lift the reducer's `EditorStore` into a shared context.
2. Have both `MobileEditor` and `VT_E1` consume it via `useContext`.
3. Pass `externalStore={store}` to `<MobileEditor>` so it uses the shared one.

The reducer already handles: clips (add/update/move/trim/split/duplicate/delete),
tracks (mute/lock/hide), transitions (add/remove), playhead, playback,
zoom, selection, panel state, and 50-step undo/redo.

## Renderer slot

`<PreviewPane renderPreview={...}>` is a slot — pass any renderer:

- The existing desktop preview canvas
- The engine's `<Player composition={…} />` from
  `src/remotion-editor/src/engine/cloud/player`
- A `<video>` tag
- A `<canvas>` you paint into

If omitted, the pane falls back to a plain "no clip / clip id at playhead"
message that's still fully interactive.

## Panel bodies

Default bodies live in `components/PanelBodies.tsx`. They're deliberately
compact — enough to be immediately useful on mobile but not a full port of the
desktop panels. Override any of them by passing your own `render` prop to
`<PanelSheet>` (composable through `PortraitLayout` / `LandscapeLayout`).
