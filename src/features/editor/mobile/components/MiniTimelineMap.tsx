import React, { useCallback, useMemo, useRef, useState } from 'react';
import type { EditorStore, TrackKind } from '../state/editorState';

export interface MiniTimelineMapProps {
  store: EditorStore;
  height?: number;
  ariaLabel?: string;
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
 * Tap or drag to seek. The white viewport window represents the approximate
 * timeline span visible at the current zoom, centred around the playhead.
 */
export const MiniTimelineMap: React.FC<MiniTimelineMapProps> = ({
  store,
  height = 48,
  ariaLabel = 'Mini timeline map',
}) => {
  const { state, dispatch, clipsOnTrack } = store;
  const ref = useRef<HTMLDivElement>(null);
  const [widthPx, setWidthPx] = useState(320);
  const duration = Math.max(0.001, state.project.durationSec);
  const tracks = useMemo(() => state.project.tracks.filter((track) => !track.hidden), [state.project.tracks]);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setWidthPx(Math.max(1, el.clientWidth));
    update();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    observer?.observe(el);
    window.addEventListener('resize', update);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  const seekFromClientX = useCallback((clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = clamp((clientX - rect.left) / Math.max(1, rect.width), 0, 1);
    dispatch({ type: 'setPlayhead', sec: ratio * duration });
  }, [dispatch, duration]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    seekFromClientX(event.clientX);
  };
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.buttons || event.pointerType === 'touch') seekFromClientX(event.clientX);
  };

  const playheadPct = clamp((state.playheadSec / duration) * 100, 0, 100);
  const visibleSeconds = widthPx / Math.max(4, state.zoomPxPerSec);
  const viewportPct = clamp((visibleSeconds / duration) * 100, 4, 100);
  const viewportLeft = clamp(playheadPct - viewportPct / 2, 0, 100 - viewportPct);

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
      onKeyDown={(event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        dispatch({ type: 'setPlayhead', sec: state.playheadSec + (event.key === 'ArrowRight' ? 0.5 : -0.5) });
      }}
      style={{
        position: 'relative',
        height,
        minHeight: height,
        border: '2px solid #111',
        borderRadius: 5,
        background: '#fff',
        padding: '4px 5px',
        display: 'grid',
        alignContent: 'center',
        gap: 2,
        overflow: 'hidden',
        cursor: 'ew-resize',
        touchAction: 'none',
        boxSizing: 'border-box',
      }}
    >
      {tracks.slice(0, 5).map((track) => (
        <div key={track.id} style={{ position: 'relative', height: 5, background: 'rgba(17,17,17,.07)', overflow: 'hidden' }}>
          {clipsOnTrack(track.id).map((clip) => {
            const left = clamp((clip.start / duration) * 100, 0, 100);
            const width = Math.max(0.8, clamp(((clip.end - clip.start) / duration) * 100, 0, 100 - left));
            return (
              <i
                key={clip.id}
                title={String(clip.id)}
                style={{
                  position: 'absolute',
                  left: `${left}%`,
                  width: `${width}%`,
                  top: 0,
                  bottom: 0,
                  display: 'block',
                  background: track.color || TRACK_COLORS[track.kind],
                }}
              />
            );
          })}
        </div>
      ))}

      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: `${viewportLeft}%`,
          width: `${viewportPct}%`,
          top: 2,
          bottom: 2,
          border: '2px solid #111',
          borderRadius: 3,
          background: 'rgba(255,255,255,.16)',
          pointerEvents: 'none',
          boxSizing: 'border-box',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: `calc(${playheadPct}% - 1px)`,
          top: 0,
          bottom: 0,
          width: 2,
          background: '#111',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};
