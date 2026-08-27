/**
 * Landscape layout — tuned for short-height phones and small tablets.
 *
 *   ┌────┬─────────────────────────────┐
 *   │Dock│    Preview                  │
 *   │ ▉  │                             │
 *   │ ▉  ├─────────────────────────────┤
 *   │ ▉  │    Transport                │
 *   │ ▉  ├─────────────────────────────┤
 *   │ ▉  │    Timeline                 │
 *   └────┴─────────────────────────────┘
 *   ── + a bottom sheet slides up from the right two columns ──
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

export interface LandscapeLayoutProps {
  store: EditorStore;
  renderPreview?: (info: { widthPx: number; heightPx: number }) => React.ReactNode;
  height?: number;
}

export const LandscapeLayout: React.FC<LandscapeLayoutProps> = ({ store, renderPreview, height }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState<{ items: ContextMenuItem[]; at: { x: number; y: number }; title?: string } | null>(null);
  const containerHeight = height ?? (typeof window !== 'undefined' ? window.innerHeight : 480);

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
        gridTemplateColumns: '72px minmax(0, 1fr)',
        // preview gets the top ~55%, transport is compact, timeline eats the rest.
        gridTemplateRows: `minmax(0, 1fr) 54px ${Math.round(containerHeight * 0.32)}px`,
        gap: 6,
        padding: 6,
        paddingBottom: 66,
        boxSizing: 'border-box',
        overflow: 'hidden',
        touchAction: 'manipulation',
      }}
    >
      {/* Dock — spans the full column height */}
      <div style={{ gridRow: '1 / span 3' }}>
        <ToolDock store={store} orientation="column" />
      </div>

      {/* Preview */}
      <div style={{ gridColumn: 2, minHeight: 0 }}>
        <PreviewPane store={store} renderPreview={renderPreview} aspect={16 / 9} />
      </div>

      {/* Transport under preview */}
      <div style={{ gridColumn: 2 }}>
        <TransportBar store={store} compact />
      </div>

      {/* Timeline — bottom row */}
      <div style={{ gridColumn: 2, minHeight: 0, overflow: 'hidden' }}>
        <TimelineStrip
          store={store}
          onClipContextMenu={(clip, at) => setMenu({ items: clipMenuFor(clip), at, title: String(clip.id) })}
          onEmptyContextMenu={(at) => setMenu({ items: emptyMenu, at, title: 'Timeline' })}
        />
      </div>

      {/* Panel sheet */}
      <PanelSheet store={store} render={renderPanelBody} containerHeight={containerHeight} />

      {menu && <ContextMenu {...menu} onDismiss={() => setMenu(null)} />}
    </div>
  );
};
