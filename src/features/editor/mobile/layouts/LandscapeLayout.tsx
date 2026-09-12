import React, { useMemo, useRef, useState } from 'react';
import { EditorStore } from '../state/editorState';
import { PreviewPane } from '../components/PreviewPane';
import { TransportBar } from '../components/TransportBar';
import { TimelineStrip, type TimelineViewport } from '../components/TimelineStrip';
import { MiniTimelineMap } from '../components/MiniTimelineMap';
import { PanelSheet } from '../components/PanelSheet';
import { ToolDock } from '../components/ToolDock';
import { ContextMenu, ContextMenuItem } from '../components/ContextMenu';
import { renderPanelBody } from '../components/PanelBodies';
import type { VtE1Clip } from '../../../../shared/vtE1TimelineContract';

export interface LandscapeLayoutProps {
  store: EditorStore;
  renderPreview?: (info: { widthPx: number; heightPx: number }) => React.ReactNode;
  height?: number;
  compositionAspect?: number;
}

export const LandscapeLayout: React.FC<LandscapeLayoutProps> = ({ store, renderPreview, height, compositionAspect = 16 / 9 }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState<{ items: ContextMenuItem[]; at: { x: number; y: number }; title?: string } | null>(null);
  const [timelineViewport, setTimelineViewport] = useState<TimelineViewport>({ startSec: 0, endSec: 0 });
  const [scrollToSec, setScrollToSec] = useState(0);
  const containerHeight = height ?? (typeof window !== 'undefined' ? window.innerHeight : 480);
  const isPortraitVideo = compositionAspect < 1;

  const clipMenuFor = (clip: VtE1Clip): ContextMenuItem[] => ([
    { label: 'Split at playhead', onSelect: () => store.dispatch({ type: 'splitClipAtPlayhead', id: clip.id }) },
    { label: 'Duplicate', onSelect: () => store.dispatch({ type: 'duplicateClip', id: clip.id }) },
    { label: 'Trim panel', onSelect: () => store.dispatch({ type: 'openPanel', id: 'trim' }) },
    { label: 'Delete', destructive: true, onSelect: () => store.dispatch({ type: 'deleteClips', ids: [clip.id] }) },
  ]);
  const emptyMenu = useMemo<ContextMenuItem[]>(() => ([
    { label: 'Add title here', onSelect: () => store.dispatch({ type: 'openPanel', id: 'text' }) },
  ]), [store]);

  return (
    <div ref={rootRef} style={{
      position: 'relative', width: '100%', height: containerHeight, background: '#020617', color: '#f8fafc',
      display: 'grid', gridTemplateColumns: '58px minmax(0, 1fr)',
      gridTemplateRows: `minmax(0, 1fr) 46px ${Math.round(containerHeight * 0.24)}px 44px`,
      gap: 4, padding: 4, paddingBottom: 60, boxSizing: 'border-box', overflow: 'hidden', touchAction: 'manipulation',
    }}>
      <div style={{ gridRow: '1 / span 4', minHeight: 0 }}><ToolDock store={store} orientation="column" /></div>
      <div style={{ gridColumn: 2, minHeight: 0, minWidth: 0, display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: isPortraitVideo ? 'auto' : '100%', aspectRatio: String(compositionAspect), maxWidth: '100%' }}>
          <PreviewPane store={store} renderPreview={renderPreview} aspect={compositionAspect} />
        </div>
      </div>
      <div style={{ gridColumn: 2 }}><TransportBar store={store} compact /></div>
      <div style={{ gridColumn: 2, minHeight: 0, overflow: 'hidden' }}>
        <TimelineStrip
          store={store}
          scrollToSec={scrollToSec}
          onViewportChange={setTimelineViewport}
          onClipContextMenu={(clip, at) => setMenu({ items: clipMenuFor(clip), at, title: String(clip.id) })}
          onEmptyContextMenu={(at) => setMenu({ items: emptyMenu, at, title: 'Timeline' })}
        />
      </div>
      <div style={{ gridColumn: 2 }}>
        <MiniTimelineMap
          store={store}
          height={44}
          viewport={timelineViewport}
          onViewportNavigate={setScrollToSec}
        />
      </div>
      <PanelSheet store={store} render={renderPanelBody} containerHeight={containerHeight} />
      {menu && <ContextMenu {...menu} onDismiss={() => setMenu(null)} />}
    </div>
  );
};
