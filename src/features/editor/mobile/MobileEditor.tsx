/**
 * MobileEditor — orientation-responsive shell with independent UI layout and project ratio.
 * The view switcher lets users move between editor front ends without coupling video format to device orientation.
 */
import React from 'react';
import { EditorStore, useEditorState } from './state/editorState';
import { useSuppressBrowserZoom } from './hooks/gestures';
import { useViewport } from './hooks/useViewport';
import { PortraitLayout } from './layouts/PortraitLayout';
import { LandscapeLayout } from './layouts/LandscapeLayout';
import { EditorViewSwitcher, EditorFrontend, EditorLayoutChoice } from './components/EditorViewSwitcher';
import type { VtE1Clip } from '../../../shared/vtE1TimelineContract';

export type CompositionAspect = 'portrait' | 'landscape';

export interface MobileEditorProps {
  seed?: { clips?: VtE1Clip[]; durationSec?: number };
  renderPreview?: (info: { widthPx: number; heightPx: number }) => React.ReactNode;
  externalStore?: EditorStore;
  layout?: EditorLayoutChoice;
  compositionAspect?: CompositionAspect;
  onCompositionAspectChange?: (aspect: CompositionAspect) => void;
  onLayoutChange?: (layout: EditorLayoutChoice) => void;
  showViewSwitcher?: boolean;
}

export const MobileEditor: React.FC<MobileEditorProps> = ({
  seed, renderPreview, externalStore, layout: controlledLayout = 'auto',
  compositionAspect: controlledAspect, onCompositionAspectChange, onLayoutChange,
  showViewSwitcher = true,
}) => {
  const internal = useEditorState(seed);
  const store = externalStore ?? internal;
  const viewport = useViewport();
  const rootRef = React.useRef<HTMLDivElement>(null);
  useSuppressBrowserZoom(rootRef);

  const [localAspect, setLocalAspect] = React.useState<CompositionAspect>('portrait');
  const [localLayout, setLocalLayout] = React.useState<EditorLayoutChoice>(controlledLayout);
  const compositionAspect = controlledAspect ?? localAspect;
  const layout = onLayoutChange ? controlledLayout : localLayout;

  const setCompositionAspect = React.useCallback((next: CompositionAspect) => {
    if (controlledAspect === undefined) setLocalAspect(next);
    onCompositionAspectChange?.(next);
  }, [controlledAspect, onCompositionAspectChange]);

  const setLayout = React.useCallback((next: EditorLayoutChoice) => {
    if (!onLayoutChange) setLocalLayout(next);
    onLayoutChange?.(next);
  }, [onLayoutChange]);

  const chosen: 'portrait' | 'landscape' = layout === 'auto' ? viewport.orientation : layout;
  const aspectValue = compositionAspect === 'portrait' ? 9 / 16 : 16 / 9;

  return (
    <div ref={rootRef} data-phone-orientation={chosen} data-composition-aspect={compositionAspect}
      data-editor-layout={layout} style={{ position: 'relative', width: '100%', height: '100dvh', overflow: 'hidden', background: '#020617', WebkitTapHighlightColor: 'transparent' }}>
      {chosen === 'portrait' ? (
        <PortraitLayout store={store} renderPreview={renderPreview} height={viewport.height} compositionAspect={aspectValue} />
      ) : (
        <LandscapeLayout store={store} renderPreview={renderPreview} height={viewport.height} compositionAspect={aspectValue} />
      )}

      {showViewSwitcher && (
        <div style={{ position: 'absolute', top: 6, right: 6, zIndex: 90 }}>
          <EditorViewSwitcher compact layout={layout} onLayoutChange={setLayout}
            aspect={compositionAspect} onAspectChange={setCompositionAspect} />
        </div>
      )}
    </div>
  );
};

export interface ResponsiveEditorShellProps extends MobileEditorProps {
  desktop: React.ReactElement;
  mode?: EditorFrontend;
  onModeChange?: (mode: EditorFrontend) => void;
}

export const ResponsiveEditorShell: React.FC<ResponsiveEditorShellProps> = ({
  desktop, mode: controlledMode = 'auto', onModeChange,
  layout: controlledLayout = 'auto', onLayoutChange,
  compositionAspect: controlledAspect, onCompositionAspectChange,
  ...mobileProps
}) => {
  const viewport = useViewport();
  const [localMode, setLocalMode] = React.useState<EditorFrontend>(controlledMode);
  const [localLayout, setLocalLayout] = React.useState<EditorLayoutChoice>(controlledLayout);
  const [localAspect, setLocalAspect] = React.useState<CompositionAspect>(controlledAspect ?? 'portrait');

  const mode = onModeChange ? controlledMode : localMode;
  const layout = onLayoutChange ? controlledLayout : localLayout;
  const aspect = controlledAspect ?? localAspect;
  const useMobile = mode === 'mobile' || (mode === 'auto' && viewport.isMobile);

  const changeMode = (next: EditorFrontend) => { if (!onModeChange) setLocalMode(next); onModeChange?.(next); };
  const changeLayout = (next: EditorLayoutChoice) => { if (!onLayoutChange) setLocalLayout(next); onLayoutChange?.(next); };
  const changeAspect = (next: CompositionAspect) => { if (controlledAspect === undefined) setLocalAspect(next); onCompositionAspectChange?.(next); };

  return (
    <div data-editor-frontend={useMobile ? 'mobile' : 'desktop'} style={{ position: 'relative', width: '100%', height: '100%' }}>
      {useMobile ? (
        <MobileEditor {...mobileProps} layout={layout} onLayoutChange={changeLayout}
          compositionAspect={aspect} onCompositionAspectChange={changeAspect} showViewSwitcher={false} />
      ) : desktop}
      <div style={{ position: 'absolute', top: 6, right: 6, zIndex: 999 }}>
        <EditorViewSwitcher compact allowDesktop frontend={mode} onFrontendChange={changeMode}
          layout={layout} onLayoutChange={changeLayout} aspect={aspect} onAspectChange={changeAspect} />
      </div>
    </div>
  );
};
