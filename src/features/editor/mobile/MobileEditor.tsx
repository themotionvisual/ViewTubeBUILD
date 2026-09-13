/**
 * MobileEditor — orientation-responsive shell with an independent project ratio.
 * Phone orientation controls the UI layout; compositionAspect controls the video canvas.
 */
import React from 'react';
import { EditorStore, useEditorState } from './state/editorState';
import { useSuppressBrowserZoom } from './hooks/gestures';
import { useViewport } from './hooks/useViewport';
import { PortraitLayout } from './layouts/PortraitLayout';
import { LandscapeLayout } from './layouts/LandscapeLayout';
import type { VtE1Clip } from '../../../shared/vtE1TimelineContract';

export type CompositionAspect = 'portrait' | 'landscape';

export interface MobileEditorProps {
  seed?: { clips?: VtE1Clip[]; durationSec?: number };
  renderPreview?: (info: { widthPx: number; heightPx: number }) => React.ReactNode;
  externalStore?: EditorStore;
  layout?: 'auto' | 'portrait' | 'landscape';
  /** Video/project ratio. This is intentionally independent from how the phone is held. */
  compositionAspect?: CompositionAspect;
  onCompositionAspectChange?: (aspect: CompositionAspect) => void;
  /** Route-owned interface/layout/style controls rendered inside the editor Settings page. */
  editorSettings?: React.ReactNode;
}

export const MobileEditor: React.FC<MobileEditorProps> = ({ seed, renderPreview, externalStore, layout = 'auto', compositionAspect: controlledAspect, onCompositionAspectChange, editorSettings }) => {
  const internal = useEditorState(seed);
  const store = externalStore ?? internal;
  const viewport = useViewport();
  const rootRef = React.useRef<HTMLDivElement>(null);
  useSuppressBrowserZoom(rootRef);

  const [localAspect] = React.useState<CompositionAspect>('portrait');
  const compositionAspect = controlledAspect ?? localAspect;
  const chosen: 'portrait' | 'landscape' = layout === 'auto' ? viewport.orientation : layout;
  const aspectValue = compositionAspect === 'portrait' ? 9 / 16 : 16 / 9;

  return (
    <div ref={rootRef} data-phone-orientation={chosen} data-composition-aspect={compositionAspect} style={{ position: 'relative', width: '100%', height: '100dvh', overflow: 'hidden', background: '#f3f3f3', WebkitTapHighlightColor: 'transparent' }}>
      {chosen === 'portrait' ? (
        <PortraitLayout store={store} renderPreview={renderPreview} height={viewport.height} compositionAspect={aspectValue} editorSettings={editorSettings} />
      ) : (
        <LandscapeLayout store={store} renderPreview={renderPreview} height={viewport.height} compositionAspect={aspectValue} />
      )}
    </div>
  );
};

export interface ResponsiveEditorShellProps extends MobileEditorProps {
  desktop: React.ReactElement;
  mode?: 'auto' | 'mobile' | 'desktop';
}

export const ResponsiveEditorShell: React.FC<ResponsiveEditorShellProps> = ({ desktop, mode = 'auto', ...mobileProps }) => {
  const viewport = useViewport();
  const useMobile = mode === 'mobile' || (mode === 'auto' && viewport.isMobile);
  return useMobile ? <MobileEditor {...mobileProps} /> : desktop;
};
