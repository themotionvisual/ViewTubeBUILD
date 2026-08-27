/**
 * Mobile editor — public barrel.
 */
export { MobileEditor, ResponsiveEditorShell } from './MobileEditor';
export type { MobileEditorProps, ResponsiveEditorShellProps } from './MobileEditor';

export {
  useEditorState,
  editorReducer,
  initialState,
} from './state/editorState';
export type {
  EditorState,
  EditorAction,
  EditorStore,
  Track,
  TrackKind,
  Tool,
  Selection,
} from './state/editorState';

export { useViewport } from './hooks/useViewport';
export type { Viewport, Breakpoint, Orientation } from './hooks/useViewport';

export {
  usePinchZoom,
  useDragScrub,
  useLongPress,
  useSwipe,
  useSuppressBrowserZoom,
} from './hooks/gestures';

export { PortraitLayout } from './layouts/PortraitLayout';
export { LandscapeLayout } from './layouts/LandscapeLayout';

export { PreviewPane } from './components/PreviewPane';
export { TransportBar } from './components/TransportBar';
export { TimelineStrip } from './components/TimelineStrip';
export { PanelSheet } from './components/PanelSheet';
export { ToolDock } from './components/ToolDock';
export { ContextMenu } from './components/ContextMenu';
export type { ContextMenuItem, ContextMenuProps } from './components/ContextMenu';
export { PanelBodies, renderPanelBody } from './components/PanelBodies';
