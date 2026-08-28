/**
 * Portrait layout.
 *
 *   ┌──────────────────┐
 *   │  Preview (9:16)  │  ← 55% of remaining height
 *   ├──────────────────┤
 *   │  Transport bar   │
 *   ├──────────────────┤
 *   │  Tool dock (row) │
 *   ├──────────────────┤
 *   │  Timeline strip  │  ← fills whatever's left
 *   ├──────────────────┤
 *   │  Panel sheet     │  ← peeks; drag up to expand
 *   └──────────────────┘
 */
import React, { useMemo, useRef, useState } from 'react';
import { EditorStore } from '../state/editorState';
import { PreviewPane } from '../components/PreviewPane';
import { TransportBar } from '../components/TransportBar';
import { TimelineStrip } from '../components/TimelineStrip';
import { PanelSheet } from '../components/PanelSheet';
import { ToolDock } from '../components/ToolDock';
import { ContextMenu, ContextMenuItem } from '../components/ContextMenu';
import { renderPanelBody } from '../components/PanelBodies';
import type { VtE1Clip } from '../../../../shared/vtE1TimelineContract';

export interface PortraitLayoutProps {
  store: EditorStore;
  renderPreview?: (info: { widthPx: number; heightPx: number }) => React.ReactNode;
  /** Container height (excluding OS chrome). Defaults to `100dvh`. */
  height?: number;
}

export const PortraitLayout: React.FC<PortraitLayoutProps> = ({ store, renderPreview, height }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState<{ items: ContextMenuItem[]; at: { x: number; y: number }; title?: string } | null>(null);
  const containerHeight = height ?? (typeof window !== 'undefined' ? window.innerHeight : 800);

  const clipMenuFor = (clip: VtE1Clip): ContextMenuItem[] => ([
    { label: 'Split at playhead', icon: '⤴', onSelect: () => store.dispatch({ type: 'splitClipAtPlayhead', id: clip.id }) },
    { label: 'Duplicate', icon: '⧉', onSelect: () => store.dispatch({ type: 'duplicateClip', id: clip.id }) },
    { label: 'Trim panel…', icon: '✂', onSelect: () => store.dispatch({ type: 'openPanel', id: 'trim' }) },
    { label: 'Delete', icon: '✕', destructive: true, onSelect: () => store.dispatch({ type: 'deleteClips', ids: [clip.id] }) },
  ]);

  const emptyMenu = useMemo<ContextMenuItem[]>(() => ([
    { label: 'Paste clip', icon: '⧉', onSelect: () => { /* wire clipboard later */ } },
    { label: 'Add title here', icon: 'T', onSelect: () => store.dispatch({ type: 'openPanel', id: 'text' }) },
  ]), [store]);

  return (
    <div
      ref={rootRef}
      style={{
        position: 'relative',
        width: '100%',
        height: containerHeight,
        background: '#020617',
        color: '#f8fafc',
        display: 'grid',
        // Preview takes ~38% of the viewport; transport + dock are their own
        // rows; timeline gets the remainder above the peeking panel sheet.
        gridTemplateRows: `${Math.round(containerHeight * 0.38)}px 60px 68px minmax(0, 1fr)`,
        gap: 8,
        padding: 8,
        paddingBottom: 70, // reserve space for the sheet's peek strip
        boxSizing: 'border-box',
        overflow: 'hidden',
        touchAction: 'manipulation',
      }}
    >
      {/* 1. Preview */}
      <div style={{ minHeight: 0 }}>
        <PreviewPane store={store} renderPreview={renderPreview} aspect={9 / 16} />
      </div>

      {/* 2. Transport */}
      <TransportBar store={store} compact />

      {/* 3. Tool dock */}
      <ToolDock store={store} orientation="row" />

      {/* 4. Timeline (fills remaining space above the sheet) */}
      <div style={{ minHeight: 0, overflow: 'hidden' }}>
        <TimelineStrip
          store={store}
          onClipContextMenu={(clip, at) => setMenu({ items: clipMenuFor(clip), at, title: String(clip.id) })}
          onEmptyContextMenu={(at) => setMenu({ items: emptyMenu, at, title: 'Timeline' })}
        />
      </div>

      {/* Panel sheet */}
      <PanelSheet store={store} render={renderPanelBody} containerHeight={containerHeight} />

      {/* Context menu overlay */}
      {menu && <ContextMenu {...menu} onDismiss={() => setMenu(null)} />}
    </div>
  );
};
