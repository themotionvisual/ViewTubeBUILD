import React, { useCallback, useMemo, useRef } from 'react';
import type { EditorStore, TrackKind } from '../state/editorState';
import type { TimelineViewport } from './TimelineStrip';

export interface MiniTimelineMapProps {
  store: EditorStore;
  height?: React.CSSProperties['height'];
  ariaLabel?: string;
  viewport?: TimelineViewport;
  onViewportNavigate?: (startSec: number) => void;
}

const TRACK_COLORS: Record<TrackKind, string> = {
  video: '#FA618A',
  audio: '#4EE4BE',
  overlay: '#528FFA',
  caption: '#FFDA47',
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

/**
 * Compact whole-project navigator based on the canonical ViewTube mini-map.
 * Each visible timeline track is represented by a 5px clip lane with 2px gaps.
 *
 * Tap empty map space to seek the playhead. Drag the viewport window to move the
 * main timeline without changing the playhead. The viewport is driven by the
 * real TimelineStrip scroll position rather than an estimate.
 */
export const MiniTimelineMap: React.FC<MiniTimelineMapProps> = ({
  store,
  height = 48,
  ariaLabel = 'Mini timeline map',
  viewport,
  onViewportNavigate,
}) => {
  const { state, dispatch, clipsOnTrack } = store;
  const ref = useRef<HTMLDivElement>(null);
  const dragMode = useRef<'seek' | 'viewport' | null>(null);
  const viewportGrabOffsetSec = useRef(0);
  const duration = Math.max(0.001, state.project.durationSec);
  const tracks = useMemo(() => state.project.tracks.filter((track) => !track.hidden), [state.project.tracks]);

  const realViewport = viewport ?? {
    startSec: Math.max(0, state.playheadSec - duration * 0.1),
    endSec: Math.min(duration, state.playheadSec + duration * 0.1),
  };
  const viewportStart = clamp(realViewport.startSec, 0, duration);
  const viewportEnd = clamp(Math.max(viewportStart, realViewport.endSec), viewportStart, duration);
  const viewportWidthSec = Math.max(0, viewportEnd - viewportStart);
  const viewportLeftPct = clamp((viewportStart / duration) * 100, 0, 100);
  const viewportPct = clamp((viewportWidthSec / duration) * 100, 2, 100);
  const playheadPct = clamp((state.playheadSec / duration) * 100, 0, 100);

  const secFromClientX = useCallback((clientX: number) => {
    const el = ref.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    return clamp((clientX - rect.left) / Math.max(1, rect.width), 0, 1) * duration;
  }, [duration]);

  const seekFromClientX = useCallback((clientX: number) => {
    dispatch({ type: 'setPlayhead', sec: secFromClientX(clientX) });
  }, [dispatch, secFromClientX]);

  const viewportContains = useCallback((sec: number) => sec >= viewportStart && sec <= viewportEnd, [viewportStart, viewportEnd]);

  const navigateViewportFromClientX = useCallback((clientX: number) => {
    if (!onViewportNavigate) return;
    const pointerSec = secFromClientX(clientX);
    const maxStart = Math.max(0, duration - viewportWidthSec);
    const nextStart = clamp(pointerSec - viewportGrabOffsetSec.current, 0, maxStart);
    onViewportNavigate(nextStart);
  }, [duration, onViewportNavigate, secFromClientX, viewportWidthSec]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const pointerSec = secFromClientX(event.clientX);
    if (onViewportNavigate && viewportContains(pointerSec)) {
      dragMode.current = 'viewport';
      viewportGrabOffsetSec.current = pointerSec - viewportStart;
      navigateViewportFromClientX(event.clientX);
    } else {
      dragMode.current = 'seek';
      seekFromClientX(event.clientX);
    }
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragMode.current) return;
    if (dragMode.current === 'viewport') navigateViewportFromClientX(event.clientX);
    else seekFromClientX(event.clientX);
  };

  const endPointer = () => {
    dragMode.current = null;
  };

  return (
    <div
      ref={ref}
      role="slider"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={Math.round(duration * 100) / 100}
      aria-valuenow={Math.round(state.playheadSec * 100) / 100}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          dispatch({ type: 'setPlayhead', sec: state.playheadSec + (event.key === 'ArrowRight' ? 0.5 : -0.5) });
          return;
        }
        if ((event.key === '[' || event.key === ']') && onViewportNavigate) {
          event.preventDefault();
          const step = Math.max(0.25, viewportWidthSec * 0.15);
          onViewportNavigate(viewportStart + (event.key === ']' ? step : -step));
        }
      }}
      style={{
        position: 'relative', width: '100%', maxWidth: '100%', height, maxHeight: '100%', minWidth: 0, minHeight: 0, border: '2px solid #111', borderRadius: 5,
        background: '#fff', padding: '4px 5px', display: 'grid', alignContent: 'center', gap: 2,
        overflow: 'auto', cursor: 'ew-resize', touchAction: 'none', boxSizing: 'border-box', userSelect: 'none', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain',
      }}
    >
      {tracks.map((track) => (
        <div key={track.id} style={{ position: 'relative', height: 5, background: 'rgba(17,17,17,.07)', overflow: 'hidden' }}>
          {clipsOnTrack(track.id).map((clip) => {
            const left = clamp((clip.start / duration) * 100, 0, 100);
            const width = Math.max(0.8, clamp(((clip.end - clip.start) / duration) * 100, 0, 100 - left));
            return (
              <i key={clip.id} title={String(clip.id)} style={{ position: 'absolute', left: `${left}%`, width: `${width}%`, top: 0, bottom: 0, display: 'block', background: track.color || TRACK_COLORS[track.kind] }} />
            );
          })}
        </div>
      ))}

      <div
        aria-hidden="true"
        style={{
          position: 'absolute', left: `${viewportLeftPct}%`, width: `${viewportPct}%`, top: 2, bottom: 2,
          border: '2px solid #111', borderRadius: 3, background: 'rgba(255,255,255,.20)',
          boxSizing: 'border-box', pointerEvents: 'none', boxShadow: '0 0 0 1px rgba(54,224,246,.75) inset',
        }}
      />
      <div aria-hidden="true" style={{ position: 'absolute', left: `calc(${playheadPct}% - 1px)`, top: 0, bottom: 0, width: 2, background: '#111', pointerEvents: 'none' }} />
    </div>
  );
};
