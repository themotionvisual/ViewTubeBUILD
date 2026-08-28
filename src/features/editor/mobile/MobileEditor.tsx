/**
 * MobileEditor — top-level entry.
 *
 * Automatically picks the portrait vs landscape layout based on the current
 * viewport, and mounts a single shared `useEditorState` reducer so state
 * survives orientation changes. The viewport gate is deliberate — mount a
 * `<MobileEditor />` above the desktop editor and let it decide:
 *
 *     const vp = useViewport();
 *     return vp.isMobile ? <MobileEditor /> : <VT_E1 />;
 *
 * or wrap them together in the exported `<ResponsiveEditorShell />` below.
 */
import React from 'react';
import { EditorStore, useEditorState } from './state/editorState';
import { useSuppressBrowserZoom } from './hooks/gestures';
import { useViewport } from './hooks/useViewport';
import { PortraitLayout } from './layouts/PortraitLayout';
import { LandscapeLayout } from './layouts/LandscapeLayout';
import type { VtE1Clip } from '../../../shared/vtE1TimelineContract';

export interface MobileEditorProps {
  /** Initial clips/tracks/duration seed. */
  seed?: {
    clips?: VtE1Clip[];
    durationSec?: number;
  };
  /** Optional preview slot — pass the same renderer the desktop uses. */
  renderPreview?: (info: { widthPx: number; heightPx: number }) => React.ReactNode;
  /** If provided, wires the internal store to an external editor state so
   *  desktop and mobile can share edits. Advanced consumers only. */
  externalStore?: EditorStore;
  /** Force a specific layout regardless of viewport (useful for testing). */
  layout?: 'auto' | 'portrait' | 'landscape';
}

export interface MobileEditorSurfaceProps {
  store: EditorStore;
  renderPreview?: MobileEditorProps['renderPreview'];
  layout?: 'auto' | 'portrait' | 'landscape';
}

export const MobileEditorSurface: React.FC<MobileEditorSurfaceProps> = ({
  store,
  renderPreview,
  layout = 'auto',
}) => {
  const viewport = useViewport();
  const rootRef = React.useRef<HTMLDivElement>(null);
  useSuppressBrowserZoom(rootRef);

  const chosen: 'portrait' | 'landscape' =
    layout === 'auto' ? viewport.orientation : layout;

  return (
    <div
      ref={rootRef}
      style={{
        width: '100%',
        height: '100dvh',
        overflow: 'hidden',
        background: '#ffffff',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {chosen === 'portrait' ? (
        <PortraitLayout store={store} renderPreview={renderPreview} height={viewport.height} />
      ) : (
        <LandscapeLayout store={store} renderPreview={renderPreview} height={viewport.height} />
      )}
    </div>
  );
};

export const MobileEditor: React.FC<MobileEditorProps> = ({
  seed,
  renderPreview,
  externalStore,
  layout = 'auto',
}) => {
  const internal = useEditorState(seed);
  const store = externalStore ?? internal;
  return <MobileEditorSurface store={store} renderPreview={renderPreview} layout={layout} />;
};

/* ------------------------------------------------------------------ */
/* ResponsiveEditorShell — swaps between mobile & desktop editors      */
/* ------------------------------------------------------------------ */

export interface ResponsiveEditorShellProps extends MobileEditorProps {
  /** Desktop editor to fall back to on wider viewports. */
  desktop: React.ReactElement;
  /** Force one side regardless of viewport. */
  mode?: 'auto' | 'mobile' | 'desktop';
}

export const ResponsiveEditorShell: React.FC<ResponsiveEditorShellProps> = ({
  desktop, mode = 'auto', ...mobileProps
}) => {
  const viewport = useViewport();
  const useMobile = mode === 'mobile' || (mode === 'auto' && viewport.isMobile);
  return useMobile ? <MobileEditor {...mobileProps} /> : desktop;
};
