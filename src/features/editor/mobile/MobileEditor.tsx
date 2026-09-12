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
}

export const MobileEditor: React.FC<MobileEditorProps> = ({
  seed,
  renderPreview,
  externalStore,
  layout = 'auto',
  compositionAspect: controlledAspect,
  onCompositionAspectChange,
}) => {
  const internal = useEditorState(seed);
  const store = externalStore ?? internal;
  const viewport = useViewport();
  const rootRef = React.useRef<HTMLDivElement>(null);
  useSuppressBrowserZoom(rootRef);

  const [localAspect, setLocalAspect] = React.useState<CompositionAspect>('portrait');
  const compositionAspect = controlledAspect ?? localAspect;
  const setCompositionAspect = React.useCallback((next: CompositionAspect) => {
    if (controlledAspect === undefined) setLocalAspect(next);
    onCompositionAspectChange?.(next);
  }, [controlledAspect, onCompositionAspectChange]);

  const chosen: 'portrait' | 'landscape' = layout === 'auto' ? viewport.orientation : layout;
  const aspectValue = compositionAspect === 'portrait' ? 9 / 16 : 16 / 9;

  return (
    <div
      ref={rootRef}
      data-phone-orientation={chosen}
      data-composition-aspect={compositionAspect}
      style={{
        position: 'relative', width: '100%', height: '100dvh', overflow: 'hidden',
        background: '#020617', WebkitTapHighlightColor: 'transparent',
      }}
    >
      {chosen === 'portrait' ? (
        <PortraitLayout store={store} renderPreview={renderPreview} height={viewport.height} compositionAspect={aspectValue} />
      ) : (
        <LandscapeLayout store={store} renderPreview={renderPreview} height={viewport.height} compositionAspect={aspectValue} />
      )}

      <div
        role="group"
        aria-label="Video aspect ratio"
        style={{
          position: 'absolute', top: 8, right: 8, zIndex: 80, display: 'flex', gap: 3,
          padding: 3, background: '#fff', border: '2px solid #111', borderRadius: 6,
          boxShadow: '2px 2px 0 rgba(0,0,0,.35)',
        }}
      >
        {(['portrait', 'landscape'] as CompositionAspect[]).map((ratio) => {
          const active = compositionAspect === ratio;
          return (
            <button
              key={ratio}
              type="button"
              aria-pressed={active}
              onClick={() => setCompositionAspect(ratio)}
              style={{
                height: 28, minWidth: 46, padding: '0 7px', border: '2px solid #111', borderRadius: 4,
                background: active ? '#36E0F6' : '#fff', color: '#111', fontSize: 9,
                fontWeight: 900, lineHeight: 1, cursor: 'pointer',
              }}
            >
              {ratio === 'portrait' ? '9:16' : '16:9'}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export interface ResponsiveEditorShellProps extends MobileEditorProps {
  desktop: React.ReactElement;
  mode?: 'auto' | 'mobile' | 'desktop';
}

export const ResponsiveEditorShell: React.FC<ResponsiveEditorShellProps> = ({
  desktop, mode = 'auto', ...mobileProps
}) => {
  const viewport = useViewport();
  const useMobile = mode === 'mobile' || (mode === 'auto' && viewport.isMobile);
  return useMobile ? <MobileEditor {...mobileProps} /> : desktop;
};
