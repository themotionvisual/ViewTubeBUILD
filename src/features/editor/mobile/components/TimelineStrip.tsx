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
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
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
        background: '#0b1220',
        borderRadius: 14,
        border: '1px solid #1e293b',
        overflow: 'hidden',
        height: rendered,
        minHeight: Math.min(bodyHeight, 130),
        position: 'relative',
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
          height: '100%',
          overflowX: 'auto',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'thin',
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
    <div style={{ position: 'sticky', top: 0, height: HEADER_HEIGHT, background: '#0f172a', zIndex: 2, marginLeft: LABEL_WIDTH }}>
      {ticks.map((t) => (
        <div
          key={t}
          style={{
            position: 'absolute',
            left: t * pxPerSec,
            top: 0,
            bottom: 0,
            paddingLeft: 4,
            borderLeft: '1px solid #334155',
            color: '#94a3b8',
            fontSize: 10,
            fontVariantNumeric: 'tabular-nums',
            fontWeight: 700,
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
          background: '#111827',
          zIndex: 2,
          borderRight: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 6px',
          fontSize: 10,
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          color: rowColor,
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track.name}</span>
        <div style={{ display: 'flex', gap: 3 }}>
          <button
            onClick={() => dispatch({ type: 'muteTrack', id: track.id })}
            style={miniBtn(track.muted ? '#ef4444' : '#334155')}
            aria-label={track.muted ? 'Unmute' : 'Mute'}
          >M</button>
          <button
            onClick={() => dispatch({ type: 'lockTrack', id: track.id })}
            style={miniBtn(track.locked ? '#f59e0b' : '#334155')}
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
          background: '#0f172a',
          borderBottom: '1px solid #111827',
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
  width: 18, height: 18, borderRadius: 4,
  border: 'none', background: bg, color: '#fff',
  fontSize: 9, fontWeight: 800,
  cursor: 'pointer',
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
        background: `linear-gradient(180deg, ${color}, ${color}cc)`,
        border: selected ? '2px solid #f8fafc' : '1px solid rgba(0,0,0,0.2)',
        boxShadow: selected ? '0 0 0 2px #0f172a, 0 0 0 4px #22d3ee' : 'none',
        color: '#0f172a',
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
          background: 'rgba(15,23,42,0.55)',
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
        background: '#f43f5e',
        pointerEvents: 'none',
        boxShadow: '0 0 6px rgba(244,63,94,0.7)',
      }}
    >
      <div style={{ position: 'absolute', top: -6, left: -6, width: 14, height: 14, borderRadius: 7, background: '#f43f5e' }} />
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
      background: 'rgba(15,23,42,0.85)',
      borderRadius: 8,
      padding: 3,
    }}
  >
    <button
      onClick={() => onZoom(pxPerSec / 1.4)}
      style={{ width: 26, height: 22, borderRadius: 5, border: 'none', background: '#334155', color: '#fff', fontWeight: 800 }}
      aria-label="Zoom out timeline"
    >−</button>
    <div style={{ color: '#cbd5e1', fontSize: 10, alignSelf: 'center', minWidth: 40, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
      {Math.round(pxPerSec)}px/s
    </div>
    <button
      onClick={() => onZoom(pxPerSec * 1.4)}
      style={{ width: 26, height: 22, borderRadius: 5, border: 'none', background: '#334155', color: '#fff', fontWeight: 800 }}
      aria-label="Zoom in timeline"
    >+</button>
  </div>
);
