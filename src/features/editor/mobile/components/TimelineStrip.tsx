/**
 * TimelineStrip — horizontal-scrolling multitrack timeline sized for phones.
 *
 * Features:
 *   - Pinch-to-zoom the timeline (updates `state.zoomPxPerSec`).
 *   - Momentum-friendly horizontal scroll via native overflow-x.
 *   - Drag a clip to move it (touch-first, but works with mouse too).
 *   - Long-press a clip to open the context menu.
 *   - Tap a clip to select; tap empty space to clear.
 *   - Playhead line stays visible; scrolls into view when playing.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EditorStore } from '../state/editorState';
import { useDragScrub, useLongPress, usePinchZoom } from '../hooks/gestures';
import type { VtE1Clip } from '../../../../shared/vtE1TimelineContract';

export interface TimelineStripProps {
  store: EditorStore;
  height?: number;
  onClipContextMenu?: (clip: VtE1Clip, at: { x: number; y: number }) => void;
  onEmptyContextMenu?: (at: { x: number; y: number }) => void;
}

const TRACK_HEIGHT = 44;
const HEADER_HEIGHT = 26;
const LABEL_WIDTH = 68;

export const TimelineStrip: React.FC<TimelineStripProps> = ({
  store,
  height,
  onClipContextMenu,
  onEmptyContextMenu,
}) => {
  const { state, dispatch, clipsOnTrack } = store;
  const zoom = state.zoomPxPerSec;
  const totalPx = Math.max(state.project.durationSec * zoom, 400);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({ scrollLeft: 0, clientWidth: 1 });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const sync = () => setViewport({ scrollLeft: el.scrollLeft, clientWidth: Math.max(1, el.clientWidth) });
    sync();
    el.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync, { passive: true });
    return () => {
      el.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, []);

  /* Pinch — apply exponential zoom */
  const pinch = usePinchZoom({
    onPinch: ({ delta }) => {
      dispatch({ type: 'setZoom', pxPerSec: zoom * delta });
    },
  });

  /* Follow the playhead when playing. */
  useEffect(() => {
    if (!state.playing || !scrollRef.current) return;
    const el = scrollRef.current;
    const playX = state.playheadSec * zoom + LABEL_WIDTH;
    if (playX < el.scrollLeft + 40 || playX > el.scrollLeft + el.clientWidth - 40) {
      el.scrollTo({ left: playX - el.clientWidth / 3, behavior: 'smooth' });
    }
  }, [state.playheadSec, state.playing, zoom]);

  const tracks = state.project.tracks.filter((t) => !t.hidden);
  const bodyHeight = tracks.length * TRACK_HEIGHT + HEADER_HEIGHT + 8;
  // Default: fill our container. Consumers can override with an explicit height.
  const rendered: number | string = height ?? '100%';

  return (
    <div
      style={{
        background: '#f8f8f8',
        borderRadius: 10,
        border: '2px solid #111',
        overflow: 'hidden',
        height: rendered,
        minHeight: Math.min(bodyHeight + 42, 176),
        position: 'relative',
        boxShadow: '3px 3px 0 rgba(17,17,17,0.18)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Zoom controls (visible affordance beyond the pinch) */}
      <ZoomControls
        pxPerSec={zoom}
        onZoom={(v) => dispatch({ type: 'setZoom', pxPerSec: v })}
      />

      <div
        ref={scrollRef}
        onPointerDown={pinch.handlers.onPointerDown}
        onPointerMove={pinch.handlers.onPointerMove}
        onPointerUp={pinch.handlers.onPointerUp}
        onPointerCancel={pinch.handlers.onPointerCancel}
        style={{
          flex: 1,
          minHeight: 0,
          overflowX: 'auto',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'thin',
          background: '#f8f8f8',
        }}
      >
        <div style={{ position: 'relative', width: totalPx + LABEL_WIDTH, minHeight: '100%' }}>
          <Ruler pxPerSec={zoom} durationSec={state.project.durationSec} />
          <div style={{ position: 'relative', paddingTop: HEADER_HEIGHT }}>
            {tracks.map((track, i) => (
              <TrackRow
                key={track.id}
                track={track}
                store={store}
                clips={clipsOnTrack(track.id)}
                pxPerSec={zoom}
                totalPx={totalPx}
                y={i * TRACK_HEIGHT}
                onClipContextMenu={onClipContextMenu}
                onEmptyContextMenu={onEmptyContextMenu}
              />
            ))}
          </div>
          <Playhead
            playheadSec={state.playheadSec}
            pxPerSec={zoom}
            height={bodyHeight - HEADER_HEIGHT}
          />
        </div>
      </div>

      <TimelineMinimap
        store={store}
        tracks={tracks}
        scrollRef={scrollRef}
        totalPx={totalPx}
        labelWidth={LABEL_WIDTH}
        viewport={viewport}
      />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Ruler                                                              */
/* ------------------------------------------------------------------ */

const Ruler: React.FC<{ pxPerSec: number; durationSec: number }> = ({ pxPerSec, durationSec }) => {
  const spacing = useMemo(() => {
    // Try to keep ticks 60-120 px apart.
    const desired = 90;
    const step = Math.max(0.1, Math.round((desired / pxPerSec) * 10) / 10);
    return step;
  }, [pxPerSec]);
  const ticks: number[] = [];
  for (let t = 0; t <= durationSec; t += spacing) ticks.push(+t.toFixed(2));

  return (
    <div style={{ position: 'sticky', top: 0, height: HEADER_HEIGHT, background: '#ffffff', zIndex: 2, marginLeft: LABEL_WIDTH, borderBottom: '2px solid #111' }}>
      {ticks.map((t) => (
        <div
          key={t}
          style={{
            position: 'absolute',
            left: t * pxPerSec,
            top: 0,
            bottom: 0,
            paddingLeft: 4,
            borderLeft: '1px solid rgba(17,17,17,0.35)',
            color: '#111',
            fontSize: 10,
            fontVariantNumeric: 'tabular-nums',
            fontWeight: 900,
          }}
        >
          {t}s
        </div>
      ))}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Track row                                                          */
/* ------------------------------------------------------------------ */

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

const TrackRow: React.FC<TrackRowProps> = ({
  track, clips, pxPerSec, totalPx, y, store, onClipContextMenu, onEmptyContextMenu,
}) => {
  const { state, dispatch } = store;
  const rowColor = track.kind === 'audio' ? '#f59e0b'
    : track.kind === 'overlay' ? '#a855f7'
    : track.kind === 'caption' ? '#22d3ee'
    : '#3b82f6';

  const rowLongPress = useLongPress({
    onLongPress: ({ x, y: ly }) => onEmptyContextMenu?.({ x, y: ly }),
    ms: 450,
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: y,
        left: 0,
        right: 0,
        height: TRACK_HEIGHT,
        display: 'flex',
        alignItems: 'stretch',
      }}
    >
      <div
        style={{
          position: 'sticky',
          left: 0,
          width: LABEL_WIDTH,
          background: '#ffffff',
          zIndex: 2,
          borderRight: '2px solid #111',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 6px',
          fontSize: 10,
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          color: '#111',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track.name}</span>
        <div style={{ display: 'flex', gap: 3 }}>
          <button
            onClick={() => dispatch({ type: 'muteTrack', id: track.id })}
            style={miniBtn(track.muted ? '#ff5d73' : '#ffffff')}
            aria-label={track.muted ? 'Unmute' : 'Mute'}
          >M</button>
          <button
            onClick={() => dispatch({ type: 'lockTrack', id: track.id })}
            style={miniBtn(track.locked ? '#ffd84d' : '#ffffff')}
            aria-label={track.locked ? 'Unlock' : 'Lock'}
          >L</button>
        </div>
      </div>
      <div
        {...rowLongPress}
        onClick={() => dispatch({ type: 'clearSelection' })}
        style={{
          position: 'relative',
          width: totalPx,
          background: '#f8f8f8',
          borderBottom: '1px solid rgba(17,17,17,0.18)',
          touchAction: 'pan-x pan-y',
        }}
      >
        {clips.map((clip) => (
          <ClipBlock
            key={clip.id}
            clip={clip}
            selected={state.selection.clipIds.includes(clip.id)}
            color={rowColor}
            pxPerSec={pxPerSec}
            store={store}
            onContextMenu={onClipContextMenu}
          />
        ))}
      </div>
    </div>
  );
};

const miniBtn = (bg: string): React.CSSProperties => ({
  width: 20, height: 20, borderRadius: 4,
  border: '2px solid #111', background: bg, color: '#111',
  fontSize: 9, fontWeight: 900,
  cursor: 'pointer', padding: 0,
});

/* ------------------------------------------------------------------ */
/* Clip block                                                          */
/* ------------------------------------------------------------------ */

interface ClipBlockProps {
  clip: VtE1Clip;
  selected: boolean;
  color: string;
  pxPerSec: number;
  store: EditorStore;
  onContextMenu?: (clip: VtE1Clip, at: { x: number; y: number }) => void;
}

const ClipBlock: React.FC<ClipBlockProps> = ({ clip, selected, color, pxPerSec, store, onContextMenu }) => {
  const { dispatch } = store;
  const left = clip.start * pxPerSec;
  const width = Math.max(20, (clip.end - clip.start) * pxPerSec);
  const scrubbing = useRef(false);

  const drag = useDragScrub({
    pixelsPerUnit: pxPerSec,
    cancelIfVertical: 16,
    guard: () => scrubbing.current,
    onScrubStart: () => { scrubbing.current = true; },
    onScrub: (deltaSec) => {
      dispatch({ type: 'moveClip', id: clip.id, deltaSec });
    },
    onScrubEnd: () => { scrubbing.current = false; },
  });

  const longPress = useLongPress({
    onLongPress: ({ x, y }) => {
      dispatch({ type: 'selectClip', id: clip.id });
      onContextMenu?.(clip, { x, y });
    },
  });

  return (
    <div
      onClick={(ev) => { ev.stopPropagation(); dispatch({ type: 'selectClip', id: clip.id }); }}
      onPointerDown={(ev) => { longPress.onPointerDown(ev); drag.onPointerDown(ev); }}
      onPointerMove={(ev) => { longPress.onPointerMove(ev); drag.onPointerMove(ev); }}
      onPointerUp={(ev) => { longPress.onPointerUp(ev); drag.onPointerUp(ev); }}
      onPointerCancel={(ev) => { longPress.onPointerCancel(ev); drag.onPointerCancel(ev); }}
      onPointerLeave={longPress.onPointerLeave}
      style={{
        position: 'absolute',
        top: 4,
        bottom: 4,
        left,
        width,
        borderRadius: 8,
        background: clip.color || color,
        border: '2px solid #111',
        boxShadow: selected ? 'inset 0 0 0 2px #fff, 0 0 0 2px #528FFA' : 'none',
        color: '#111',
        padding: '4px 8px',
        fontSize: 11,
        fontWeight: 800,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        touchAction: 'none',
        userSelect: 'none',
      }}
    >
      {String(clip.id).slice(0, 18)}
      {/* trim handles */}
      <TrimHandle side="left" clip={clip} store={store} pxPerSec={pxPerSec} />
      <TrimHandle side="right" clip={clip} store={store} pxPerSec={pxPerSec} />
    </div>
  );
};

const TrimHandle: React.FC<{ side: 'left' | 'right'; clip: VtE1Clip; store: EditorStore; pxPerSec: number }> = ({
  side, clip, store, pxPerSec,
}) => {
  const { dispatch } = store;
  const drag = useDragScrub({
    pixelsPerUnit: pxPerSec,
    cancelIfVertical: 20,
    onScrub: (deltaSec) => {
      const anchor = side === 'left' ? clip.start : clip.end;
      dispatch({ type: 'trimClip', id: clip.id, side, sec: anchor + deltaSec * 0.02 });
    },
  });
  return (
    <div
      {...drag}
      onClick={(ev) => ev.stopPropagation()}
      style={{
        position: 'absolute',
        top: 0, bottom: 0,
        [side]: 0,
        width: 16,
        cursor: 'ew-resize',
        touchAction: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '50%',
          [side]: 3,
          transform: 'translateY(-50%)',
          width: 4,
          height: 16,
          borderRadius: 2,
          background: 'rgba(17,17,17,0.62)',
        }}
      />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Playhead                                                            */
/* ------------------------------------------------------------------ */

const Playhead: React.FC<{ playheadSec: number; pxPerSec: number; height: number }> = ({
  playheadSec, pxPerSec, height,
}) => {
  const x = playheadSec * pxPerSec + LABEL_WIDTH;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: HEADER_HEIGHT - 6,
        height: height + 12,
        width: 2,
        background: '#ff5d73',
        pointerEvents: 'none',
        boxShadow: '0 0 0 1px #fff',
      }}
    >
      <div style={{ position: 'absolute', top: -6, left: -6, width: 14, height: 14, borderRadius: 7, background: '#ff5d73', border: '2px solid #111' }} />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Zoom controls                                                       */
/* ------------------------------------------------------------------ */

const ZoomControls: React.FC<{ pxPerSec: number; onZoom: (v: number) => void }> = ({ pxPerSec, onZoom }) => (
  <div
    style={{
      position: 'absolute',
      top: 4,
      right: 6,
      zIndex: 3,
      display: 'flex',
      gap: 4,
      background: '#ffffff',
      borderRadius: 6,
      border: '2px solid #111',
      padding: 2,
    }}
  >
    <button
      onClick={() => onZoom(pxPerSec / 1.4)}
      style={{ width: 26, height: 22, borderRadius: 5, border: 'none', background: '#ffd84d', color: '#111', border: '2px solid #111', fontWeight: 800 }}
      aria-label="Zoom out timeline"
    >−</button>
    <div style={{ color: '#111', fontSize: 10, alignSelf: 'center', minWidth: 40, textAlign: 'center', fontVariantNumeric: 'tabular-nums', fontWeight: 900 }}>
      {Math.round(pxPerSec)}px/s
    </div>
    <button
      onClick={() => onZoom(pxPerSec * 1.4)}
      style={{ width: 26, height: 22, borderRadius: 5, border: 'none', background: '#ffd84d', color: '#111', border: '2px solid #111', fontWeight: 800 }}
      aria-label="Zoom in timeline"
    >+</button>
  </div>
);

interface TimelineMinimapProps {
  store: EditorStore;
  tracks: EditorStore['state']['project']['tracks'];
  scrollRef: React.RefObject<HTMLDivElement | null>;
  totalPx: number;
  labelWidth: number;
  viewport: { scrollLeft: number; clientWidth: number };
}

const TimelineMinimap: React.FC<TimelineMinimapProps> = ({
  store, tracks, scrollRef, totalPx, labelWidth, viewport,
}) => {
  const duration = Math.max(0.001, store.state.project.durationSec);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapHeight = Math.max(13, tracks.length * 7 + 4);
  const timelineViewportPx = Math.max(1, totalPx);
  const visibleStartPx = Math.max(0, viewport.scrollLeft - labelWidth);
  const visibleWidthPx = Math.min(timelineViewportPx, viewport.clientWidth);
  const leftPct = Math.max(0, Math.min(100, (visibleStartPx / timelineViewportPx) * 100));
  const widthPct = Math.max(1.2, Math.min(100 - leftPct, (visibleWidthPx / timelineViewportPx) * 100));

  const seekMap = (clientX: number, grabRatio = 0.5) => {
    const map = mapRef.current;
    const scroller = scrollRef.current;
    if (!map || !scroller) return;
    const rect = map.getBoundingClientRect();
    const local = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const visibleSec = (visibleWidthPx / timelineViewportPx) * duration;
    const centerSec = (local / Math.max(1, rect.width)) * duration;
    const desiredStart = Math.max(0, Math.min(duration - visibleSec, centerSec - visibleSec * grabRatio));
    scroller.scrollLeft = Math.max(0, desiredStart / duration * timelineViewportPx);
  };

  return (
    <div
      ref={mapRef}
      className="vt-mobile-timeline-minimap"
      style={{
        flex: '0 0 auto',
        height: mapHeight,
        position: 'relative',
        background: '#fff',
        borderTop: '2px solid #111',
        overflow: 'hidden',
        touchAction: 'none',
        cursor: 'pointer',
      }}
      onPointerDown={(event) => {
        const target = event.currentTarget;
        const rect = target.getBoundingClientRect();
        const localPct = ((event.clientX - rect.left) / Math.max(1, rect.width)) * 100;
        const inside = localPct >= leftPct && localPct <= leftPct + widthPct;
        const grabRatio = inside ? Math.max(0, Math.min(1, (localPct - leftPct) / Math.max(0.01, widthPct))) : 0.5;
        target.setPointerCapture?.(event.pointerId);
        seekMap(event.clientX, grabRatio);
        const move = (ev: PointerEvent) => seekMap(ev.clientX, grabRatio);
        const end = (ev: PointerEvent) => {
          target.releasePointerCapture?.(ev.pointerId);
          target.removeEventListener('pointermove', move);
          target.removeEventListener('pointerup', end);
          target.removeEventListener('pointercancel', end);
        };
        target.addEventListener('pointermove', move);
        target.addEventListener('pointerup', end);
        target.addEventListener('pointercancel', end);
      }}
      aria-label="Timeline minimap"
    >
      {tracks.map((track, trackIndex) =>
        store.clipsOnTrack(track.id).map((clip) => {
          const left = Math.max(0, Math.min(100, (clip.start / duration) * 100));
          const width = Math.max(0.15, Math.min(100 - left, ((clip.end - clip.start) / duration) * 100));
          return (
            <div
              key={`mini-${clip.id}`}
              style={{
                position: 'absolute',
                top: 2 + trackIndex * 7,
                left: `${left}%`,
                width: `${width}%`,
                height: 5,
                background: clip.color || '#528FFA',
                borderRadius: 1,
                pointerEvents: 'none',
              }}
            />
          );
        })
      )}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: `${leftPct}%`,
          width: `${widthPct}%`,
          border: '2px solid #111',
          background: 'rgba(255,255,255,0.34)',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.75)',
          pointerEvents: 'none',
          zIndex: 5,
        }}
      />
    </div>
  );
};
