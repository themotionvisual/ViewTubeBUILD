import React, { useMemo, useRef, useState } from 'react';
import { EditorStore, Tool } from '../state/editorState';
import { PreviewPane } from '../components/PreviewPane';
import { TimelineStrip, type TimelineViewport } from '../components/TimelineStrip';
import { MiniTimelineMap } from '../components/MiniTimelineMap';
import { PanelSheet } from '../components/PanelSheet';
import { ContextMenu, ContextMenuItem } from '../components/ContextMenu';
import { renderPanelBody } from '../components/PanelBodies';
import type { VtE1Clip } from '../../../../shared/vtE1TimelineContract';

export interface PortraitLayoutProps {
  store: EditorStore;
  renderPreview?: (info: { widthPx: number; heightPx: number }) => React.ReactNode;
  height?: number;
  compositionAspect?: number;
  editorSettings?: React.ReactNode;
}

const CYAN = '#36E0F6';
const INK = '#248b99';

export const PortraitLayout: React.FC<PortraitLayoutProps> = ({ store, renderPreview, height, compositionAspect = 9 / 16, editorSettings }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState<{ items: ContextMenuItem[]; at: { x: number; y: number }; title?: string } | null>(null);
  const [timelineViewport, setTimelineViewport] = useState<TimelineViewport>({ startSec: 0, endSec: 0 });
  const [scrollToSec, setScrollToSec] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const containerHeight = height ?? (typeof window !== 'undefined' ? window.innerHeight : 800);
  const isPortraitVideo = compositionAspect < 1;
  const { state, dispatch } = store;

  const clipMenuFor = (clip: VtE1Clip): ContextMenuItem[] => ([
    { label: 'Split at playhead', onSelect: () => dispatch({ type: 'splitClipAtPlayhead', id: clip.id }) },
    { label: 'Duplicate', onSelect: () => dispatch({ type: 'duplicateClip', id: clip.id }) },
    { label: 'Trim panel', onSelect: () => dispatch({ type: 'openPanel', id: 'trim' }) },
    { label: 'Delete', destructive: true, onSelect: () => dispatch({ type: 'deleteClips', ids: [clip.id] }) },
  ]);
  const emptyMenu = useMemo<ContextMenuItem[]>(() => ([{ label: 'Add title here', onSelect: () => dispatch({ type: 'openPanel', id: 'text' }) }]), [dispatch]);

  // The preview is now the dominant upper-left workspace. The old transport and
  // always-visible tool modules are replaced by a compact right-side control rail.
  const upperHeight = Math.max(330, Math.round(containerHeight * 0.57));
  const timelineHeight = 118; // ruler + two 44px layers; additional tracks scroll vertically.

  const openPage = (id: Tool) => { setSettingsOpen(false); dispatch({ type: 'openPanel', id, height: 0.58 }); };
  const railButton = (active = false): React.CSSProperties => ({ width: '100%', minHeight: 38, border: `2px solid ${INK}`, borderRadius: 5, background: active ? CYAN : '#fff', color: '#000', fontSize: 9, fontWeight: 900, textTransform: 'uppercase', lineHeight: 1, padding: '4px 2px', boxShadow: '2px 2px 0 rgba(54,224,246,.28)', touchAction: 'manipulation' });

  return (
    <div ref={rootRef} style={{ position: 'relative', width: '100%', height: containerHeight, background: '#f3f3f3', color: '#000', display: 'grid', gridTemplateRows: `${upperHeight}px ${timelineHeight}px 48px`, gap: 4, padding: 4, boxSizing: 'border-box', overflow: 'hidden', touchAction: 'manipulation' }}>
      <div style={{ minHeight: 0, minWidth: 0, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 76px', gap: 4 }}>
        <div style={{ minHeight: 0, minWidth: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', overflow: 'hidden', background: '#fff', border: `3px solid ${INK}`, borderRadius: 7, padding: 4 }}>
          <div style={{ height: '100%', width: isPortraitVideo ? 'auto' : '100%', aspectRatio: String(compositionAspect), maxWidth: '100%', transformOrigin: 'top left' }}>
            <PreviewPane store={store} renderPreview={renderPreview} aspect={compositionAspect} />
          </div>
        </div>
        <nav aria-label="Editor controls and pages" style={{ minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4, padding: 4, background: '#fff', border: `3px solid ${INK}`, borderRadius: 7, boxShadow: '3px 3px 0 rgba(54,224,246,.28)' }}>
          <button style={railButton()} onClick={() => dispatch({ type: 'togglePlaying' })} aria-label={state.playing ? 'Pause' : 'Play'}>{state.playing ? 'Ⅱ' : '▶'}<br />{state.playing ? 'Pause' : 'Play'}</button>
          <button style={railButton()} onClick={() => dispatch({ type: 'setPlayhead', sec: state.playheadSec - state.playbackRate })}>◀<br />Back</button>
          <button style={railButton()} onClick={() => dispatch({ type: 'setPlayhead', sec: state.playheadSec + state.playbackRate })}>▶<br />Next</button>
          <button style={railButton(settingsOpen)} onClick={() => { dispatch({ type: 'closePanel' }); setSettingsOpen(v => !v); }}>⚙<br />Settings</button>
          <div style={{ height: 2, background: INK, flex: '0 0 auto' }} />
          <button style={railButton(state.panel.open && state.panel.id === 'select')} onClick={() => openPage('select')}>Select</button>
          <button style={railButton(state.panel.open && state.panel.id === 'text')} onClick={() => openPage('text')}>Text</button>
          <button style={railButton(state.panel.open && state.panel.id === 'audio')} onClick={() => openPage('audio')}>Audio</button>
          <button style={railButton(state.panel.open && state.panel.id === 'effects')} onClick={() => openPage('effects')}>FX</button>
          <button style={railButton(state.panel.open && state.panel.id === 'export')} onClick={() => openPage('export')}>Export</button>
        </nav>
      </div>

      <div style={{ minHeight: 0, overflow: 'hidden' }}>
        <TimelineStrip store={store} height={timelineHeight} scrollToSec={scrollToSec} onViewportChange={setTimelineViewport} onClipContextMenu={(clip, at) => setMenu({ items: clipMenuFor(clip), at, title: String(clip.id) })} onEmptyContextMenu={(at) => setMenu({ items: emptyMenu, at, title: 'Timeline' })} />
      </div>
      <MiniTimelineMap store={store} viewport={timelineViewport} onViewportNavigate={setScrollToSec} />

      {settingsOpen && <div role="dialog" aria-label="Editor settings" style={{ position: 'absolute', top: 4, right: 84, width: 'min(300px, calc(100% - 92px))', maxHeight: upperHeight - 8, overflowY: 'auto', zIndex: 40, background: '#fff', border: `3px solid ${INK}`, borderRadius: 7, padding: 8, boxShadow: '4px 4px 0 rgba(54,224,246,.32)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `2px solid ${INK}`, paddingBottom: 5, marginBottom: 8 }}><strong style={{ fontSize: 10, textTransform: 'uppercase' }}>Editor Settings</strong><button onClick={() => setSettingsOpen(false)} style={{ width: 24, height: 24, border: `2px solid ${INK}`, borderRadius: 4, background: '#fff', fontWeight: 900 }}>×</button></div>
        {editorSettings ?? <div style={{ fontSize: 10, fontWeight: 800 }}>Editor display settings.</div>}
      </div>}

      <PanelSheet store={store} render={renderPanelBody} containerHeight={containerHeight} navigationOnly />
      {menu && <ContextMenu {...menu} onDismiss={() => setMenu(null)} />}
    </div>
  );
};
