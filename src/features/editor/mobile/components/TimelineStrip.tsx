/**
 * TimelineStrip — horizontal-scrolling multitrack timeline sized for phones.
 */
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { EditorStore } from '../state/editorState';
import { useDragScrub, useLongPress, usePinchZoom } from '../hooks/gestures';
import type { VtE1Clip } from '../../../../shared/vtE1TimelineContract';

export interface TimelineViewport { startSec: number; endSec: number; }
export interface TimelineStripProps {
  store: EditorStore;
  height?: number;
  onClipContextMenu?: (clip: VtE1Clip, at: { x: number; y: number }) => void;
  onEmptyContextMenu?: (at: { x: number; y: number }) => void;
  onViewportChange?: (viewport: TimelineViewport) => void;
  scrollToSec?: number;
}

const TRACK_HEIGHT = 44;
const HEADER_HEIGHT = 26;
const LABEL_WIDTH = 68;
const CYAN = '#36E0F6';
const INK = '#248b99';

export const TimelineStrip: React.FC<TimelineStripProps> = ({ store, height, onClipContextMenu, onEmptyContextMenu, onViewportChange, scrollToSec }) => {
  const { state, dispatch, clipsOnTrack } = store;
  const zoom = state.zoomPxPerSec;
  const totalPx = Math.max(state.project.durationSec * zoom, 400);
  const scrollRef = useRef<HTMLDivElement>(null);

  const reportViewport = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !onViewportChange) return;
    const duration = Math.max(0, state.project.durationSec);
    const visiblePx = Math.max(1, el.clientWidth - LABEL_WIDTH);
    const startSec = Math.max(0, Math.min(duration, el.scrollLeft / Math.max(4, zoom)));
    const endSec = Math.max(startSec, Math.min(duration, startSec + visiblePx / Math.max(4, zoom)));
    onViewportChange({ startSec, endSec });
  }, [onViewportChange, state.project.durationSec, zoom]);

  const pinch = usePinchZoom({ onPinch: ({ delta }) => dispatch({ type: 'setZoom', pxPerSec: zoom * delta }) });

  useEffect(() => {
    if (!state.playing || !scrollRef.current) return;
    const el = scrollRef.current;
    const playX = state.playheadSec * zoom + LABEL_WIDTH;
    if (playX < el.scrollLeft + 40 || playX > el.scrollLeft + el.clientWidth - 40) el.scrollTo({ left: playX - el.clientWidth / 3, behavior: 'smooth' });
  }, [state.playheadSec, state.playing, zoom]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || scrollToSec == null) return;
    const maxStart = Math.max(0, state.project.durationSec - Math.max(0, (el.clientWidth - LABEL_WIDTH) / Math.max(4, zoom)));
    const nextStart = Math.max(0, Math.min(maxStart, scrollToSec));
    el.scrollTo({ left: nextStart * zoom, behavior: 'auto' });
    requestAnimationFrame(reportViewport);
  }, [scrollToSec, zoom, state.project.durationSec, reportViewport]);

  useEffect(() => {
    reportViewport();
    const el = scrollRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(reportViewport);
    observer.observe(el);
    return () => observer.disconnect();
  }, [reportViewport, totalPx]);

  const tracks = state.project.tracks.filter((t) => !t.hidden);
  const bodyHeight = tracks.length * TRACK_HEIGHT + HEADER_HEIGHT + 8;
  const rendered: number | string = height ?? '100%';

  return (
    <div style={{ background: '#f7f7f7', borderRadius: 7, border: `3px solid ${INK}`, overflow: 'hidden', height: rendered, minHeight: Math.min(bodyHeight, 130), position: 'relative', boxShadow: '3px 3px 0 rgba(54,224,246,.28)' }}>
      <ZoomControls pxPerSec={zoom} onZoom={(v) => dispatch({ type: 'setZoom', pxPerSec: v })} />
      <div ref={scrollRef} data-vt-timeline-scroll="true" onScroll={reportViewport} onPointerDown={pinch.handlers.onPointerDown} onPointerMove={pinch.handlers.onPointerMove} onPointerUp={pinch.handlers.onPointerUp} onPointerCancel={pinch.handlers.onPointerCancel} style={{ height: '100%', overflowX: 'auto', overflowY: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'thin', background: '#fff' }}>
        <div style={{ position: 'relative', width: totalPx + LABEL_WIDTH, minHeight: '100%' }}>
          <Ruler pxPerSec={zoom} durationSec={state.project.durationSec} />
          <div style={{ position: 'relative', paddingTop: HEADER_HEIGHT }}>
            {tracks.map((track, i) => <TrackRow key={track.id} track={track} store={store} clips={clipsOnTrack(track.id)} pxPerSec={zoom} totalPx={totalPx} y={i * TRACK_HEIGHT} onClipContextMenu={onClipContextMenu} onEmptyContextMenu={onEmptyContextMenu} />)}
          </div>
          <Playhead playheadSec={state.playheadSec} pxPerSec={zoom} height={bodyHeight - HEADER_HEIGHT} />
        </div>
      </div>
    </div>
  );
};

const Ruler: React.FC<{ pxPerSec: number; durationSec: number }> = ({ pxPerSec, durationSec }) => {
  const spacing = useMemo(() => Math.max(0.1, Math.round((90 / pxPerSec) * 10) / 10), [pxPerSec]);
  const ticks: number[] = [];
  for (let t = 0; t <= durationSec; t += spacing) ticks.push(+t.toFixed(2));
  return <div style={{ position: 'sticky', top: 0, height: HEADER_HEIGHT, background: '#fff', zIndex: 2, marginLeft: LABEL_WIDTH, borderBottom: `2px solid ${INK}` }}>{ticks.map((t) => <div key={t} style={{ position: 'absolute', left: t * pxPerSec, top: 0, bottom: 0, paddingLeft: 4, borderLeft: '1px solid rgba(0,0,0,.25)', color: '#000', fontSize: 9, fontVariantNumeric: 'tabular-nums', fontWeight: 900 }}>{t}s</div>)}</div>;
};

interface TrackRowProps {
  store: EditorStore;
  track: EditorStore['state']['project']['tracks'][number];
  clips: VtE1Clip[];
  pxPerSec: number;
  totalPx: number;
  y: number;
  onClipContextMenu?: (clip: VtE1Clip, at: { x: number; y: number }) => void;
  onEmptyContextMenu?: (at: { x: number; y: number }) => void;
}

const TrackRow: React.FC<TrackRowProps> = ({ track, clips, pxPerSec, totalPx, y, store, onClipContextMenu, onEmptyContextMenu }) => {
  const { state, dispatch } = store;
  const rowColor = track.kind === 'audio' ? '#4EE4BE' : track.kind === 'overlay' ? '#528FFA' : track.kind === 'caption' ? '#FFDA47' : '#FA618A';
  const rowLongPress = useLongPress({ onLongPress: ({ x, y: ly }) => onEmptyContextMenu?.({ x, y: ly }), ms: 450 });
  return (
    <div style={{ position: 'absolute', top: y, left: 0, right: 0, height: TRACK_HEIGHT, display: 'flex', alignItems: 'stretch' }}>
      <div style={{ position: 'sticky', left: 0, width: LABEL_WIDTH, background: '#fff', zIndex: 2, borderRight: `2px solid ${INK}`, borderBottom: `1px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 6px', fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5, color: '#000' }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track.name}</span>
        <div style={{ display: 'flex', gap: 3 }}>
          <button onClick={() => dispatch({ type: 'muteTrack', id: track.id })} style={miniBtn(track.muted ? '#FA618A' : '#fff')} aria-label={track.muted ? 'Unmute' : 'Mute'}>M</button>
          <button onClick={() => dispatch({ type: 'lockTrack', id: track.id })} style={miniBtn(track.locked ? '#FFDA47' : '#fff')} aria-label={track.locked ? 'Unlock' : 'Lock'}>L</button>
        </div>
      </div>
      <div {...rowLongPress} onClick={() => dispatch({ type: 'clearSelection' })} style={{ position: 'relative', width: totalPx, background: '#f7f7f7', borderBottom: `1px solid ${INK}`, touchAction: 'pan-x pan-y' }}>
        {clips.map((clip) => <ClipBlock key={clip.id} clip={clip} selected={state.selection.clipIds.includes(clip.id)} color={rowColor} pxPerSec={pxPerSec} store={store} onContextMenu={onClipContextMenu} />)}
      </div>
    </div>
  );
};

const miniBtn = (bg: string): React.CSSProperties => ({ width: 18, height: 18, borderRadius: 3, border: `1.5px solid ${INK}`, background: bg, color: '#000', fontSize: 8, fontWeight: 900, cursor: 'pointer', padding: 0 });

interface ClipBlockProps { clip: VtE1Clip; selected: boolean; color: string; pxPerSec: number; store: EditorStore; onContextMenu?: (clip: VtE1Clip, at: { x: number; y: number }) => void; }

const ClipBlock: React.FC<ClipBlockProps> = ({ clip, selected, color, pxPerSec, store, onContextMenu }) => {
  const { dispatch } = store;
  const left = clip.start * pxPerSec;
  const width = Math.max(20, (clip.end - clip.start) * pxPerSec);
  const scrubbing = useRef(false);
  const drag = useDragScrub({ pixelsPerUnit: pxPerSec, cancelIfVertical: 16, guard: () => scrubbing.current, onScrubStart: () => { scrubbing.current = true; }, onScrub: (deltaSec) => dispatch({ type: 'moveClip', id: clip.id, deltaSec }), onScrubEnd: () => { scrubbing.current = false; } });
  const longPress = useLongPress({ onLongPress: ({ x, y }) => { dispatch({ type: 'selectClip', id: clip.id }); onContextMenu?.(clip, { x, y }); } });
  return (
    <div onClick={(ev) => { ev.stopPropagation(); dispatch({ type: 'selectClip', id: clip.id }); }} onPointerDown={(ev) => { longPress.onPointerDown(ev); drag.onPointerDown(ev); }} onPointerMove={(ev) => { longPress.onPointerMove(ev); drag.onPointerMove(ev); }} onPointerUp={(ev) => { longPress.onPointerUp(ev); drag.onPointerUp(ev); }} onPointerCancel={(ev) => { longPress.onPointerCancel(ev); drag.onPointerCancel(ev); }} onPointerLeave={longPress.onPointerLeave} style={{ position: 'absolute', top: 4, bottom: 4, left, width, borderRadius: 5, background: color, border: selected ? '3px solid #000' : `2px solid ${INK}`, boxShadow: selected ? `0 0 0 2px #fff, 3px 3px 0 ${CYAN}` : '2px 2px 0 rgba(0,0,0,.12)', color: '#000', padding: '4px 8px', fontSize: 9, fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', touchAction: 'none', userSelect: 'none' }}>
      {String(clip.id).slice(0, 18)}
      <TrimHandle side="left" clip={clip} store={store} pxPerSec={pxPerSec} />
      <TrimHandle side="right" clip={clip} store={store} pxPerSec={pxPerSec} />
    </div>
  );
};

const TrimHandle: React.FC<{ side: 'left' | 'right'; clip: VtE1Clip; store: EditorStore; pxPerSec: number }> = ({ side, clip, store, pxPerSec }) => {
  const { dispatch } = store;
  const drag = useDragScrub({ pixelsPerUnit: pxPerSec, cancelIfVertical: 20, onScrub: (deltaSec) => { const anchor = side === 'left' ? clip.start : clip.end; dispatch({ type: 'trimClip', id: clip.id, side, sec: anchor + deltaSec * 0.02 }); } });
  return <div {...drag} onClick={(ev) => ev.stopPropagation()} style={{ position: 'absolute', top: 0, bottom: 0, [side]: 0, width: 16, cursor: 'ew-resize', touchAction: 'none' }}><div style={{ position: 'absolute', top: '50%', [side]: 3, transform: 'translateY(-50%)', width: 4, height: 16, borderRadius: 1, background: '#000' }} /></div>;
};

const Playhead: React.FC<{ playheadSec: number; pxPerSec: number; height: number }> = ({ playheadSec, pxPerSec, height }) => {
  const x = playheadSec * pxPerSec + LABEL_WIDTH;
  return <div style={{ position: 'absolute', left: x, top: HEADER_HEIGHT - 6, height: height + 12, width: 2, background: '#000', pointerEvents: 'none' }}><div style={{ position: 'absolute', top: -6, left: -5, width: 12, height: 12, background: CYAN, border: '2px solid #000', transform: 'rotate(45deg)' }} /></div>;
};

const ZoomControls: React.FC<{ pxPerSec: number; onZoom: (v: number) => void }> = ({ pxPerSec, onZoom }) => (
  <div style={{ position: 'absolute', top: 3, right: 4, zIndex: 3, display: 'flex', gap: 3, background: '#fff', border: `2px solid ${INK}`, borderRadius: 5, padding: 2, boxShadow: '2px 2px 0 rgba(54,224,246,.35)' }}>
    <button onClick={() => onZoom(pxPerSec / 1.4)} style={{ width: 24, height: 20, borderRadius: 3, border: `1.5px solid ${INK}`, background: '#fff', color: '#000', fontWeight: 900 }} aria-label="Zoom out timeline">−</button>
    <div style={{ color: '#000', fontSize: 9, alignSelf: 'center', minWidth: 40, textAlign: 'center', fontVariantNumeric: 'tabular-nums', fontWeight: 900 }}>{Math.round(pxPerSec)}px/s</div>
    <button onClick={() => onZoom(pxPerSec * 1.4)} style={{ width: 24, height: 20, borderRadius: 3, border: `1.5px solid ${INK}`, background: CYAN, color: '#000', fontWeight: 900 }} aria-label="Zoom in timeline">+</button>
  </div>
);
