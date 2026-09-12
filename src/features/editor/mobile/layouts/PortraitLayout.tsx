import React, { useMemo, useRef, useState } from 'react';
import { EditorStore } from '../state/editorState';
import { PreviewPane } from '../components/PreviewPane';
import { TransportBar } from '../components/TransportBar';
import { TimelineStrip } from '../components/TimelineStrip';
import { MiniTimelineMap } from '../components/MiniTimelineMap';
import { PanelSheet } from '../components/PanelSheet';
import { ToolDock } from '../components/ToolDock';
import { ContextMenu, ContextMenuItem } from '../components/ContextMenu';
import { renderPanelBody } from '../components/PanelBodies';
import type { VtE1Clip } from '../../../../shared/vtE1TimelineContract';

export interface PortraitLayoutProps {
  store: EditorStore;
  renderPreview?: (info: { widthPx: number; heightPx: number }) => React.ReactNode;
  height?: number;
  compositionAspect?: number;
}

export const PortraitLayout: React.FC<PortraitLayoutProps> = ({ store, renderPreview, height, compositionAspect = 9 / 16 }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState<{ items: ContextMenuItem[]; at: { x: number; y: number }; title?: string } | null>(null);
  const containerHeight = height ?? (typeof window !== 'undefined' ? window.innerHeight : 800);
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
  const previewHeight = Math.round(containerHeight * (isPortraitVideo ? 0.40 : 0.31));

  return (
    <div ref={rootRef} style={{
      position: 'relative', width: '100%', height: containerHeight, background: '#020617', color: '#f8fafc',
      display: 'grid', gridTemplateRows: `${previewHeight}px 52px 58px minmax(0, 1fr) 48px`, gap: 4, padding: 4,
      paddingBottom: 66, boxSizing: 'border-box', overflow: 'hidden', touchAction: 'manipulation',
    }}>
      <div style={{ minHeight: 0, minWidth: 0, display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: isPortraitVideo ? 'auto' : '100%', aspectRatio: String(compositionAspect), maxWidth: '100%' }}>
          <PreviewPane store={store} renderPreview={renderPreview} aspect={compositionAspect} />
        </div>
      </div>
      <TransportBar store={store} compact />
      <ToolDock store={store} orientation="row" />
      <div style={{ minHeight: 0, overflow: 'hidden' }}>
        <TimelineStrip store={store}
          onClipContextMenu={(clip, at) => setMenu({ items: clipMenuFor(clip), at, title: String(clip.id) })}
          onEmptyContextMenu={(at) => setMenu({ items: emptyMenu, at, title: 'Timeline' })} />
      </div>
      <MiniTimelineMap store={store} />
      <PanelSheet store={store} render={renderPanelBody} containerHeight={containerHeight} />
      {menu && <ContextMenu {...menu} onDismiss={() => setMenu(null)} />}
    </div>
  );
};