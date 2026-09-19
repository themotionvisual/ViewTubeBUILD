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
  const dragMode = useRef<'seek'|'viewport'|'resize-left'|'resize-right'|'pinch'|null>(null);
  const viewportGrabOffsetSec = useRef(0);
  const pointers = useRef(new Map<number,{x:number;y:number}>());
  const pinchStart = useRef<{distance:number;zoom:number;centerSec:number;widthSec:number}|null>(null);
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
    pointers.current.set(event.pointerId,{x:event.clientX,y:event.clientY});
    if(pointers.current.size===2){
      const values=[...pointers.current.values()];
      const distance=Math.hypot(values[1].x-values[0].x,values[1].y-values[0].y);
      pinchStart.current={
        distance:Math.max(1,distance),
        zoom:state.zoomPxPerSec,
        centerSec:(secFromClientX(values[0].x)+secFromClientX(values[1].x))/2,
        widthSec:Math.max(.05,viewportWidthSec),
      };
      dragMode.current='pinch';
      return;
    }
    const pointerSec = secFromClientX(event.clientX);
    const edgeHit=Math.max(.08,viewportWidthSec*.12);
    if(onViewportNavigate&&Math.abs(pointerSec-viewportStart)<=edgeHit){
      dragMode.current='resize-left';
      return;
    }
    if(onViewportNavigate&&Math.abs(pointerSec-viewportEnd)<=edgeHit){
      dragMode.current='resize-right';
      return;
    }
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
    if(pointers.current.has(event.pointerId))pointers.current.set(event.pointerId,{x:event.clientX,y:event.clientY});
    if(dragMode.current==='pinch'&&pointers.current.size>=2&&pinchStart.current){
      const values=[...pointers.current.values()].slice(0,2);
      const distance=Math.max(1,Math.hypot(values[1].x-values[0].x,values[1].y-values[0].y));
      const scale=distance/pinchStart.current.distance;
      const zoom=Math.max(4,Math.min(400,pinchStart.current.zoom*scale));
      dispatch({type:'setZoom',pxPerSec:zoom});
      const nextWidth=pinchStart.current.widthSec*(pinchStart.current.zoom/zoom);
      onViewportNavigate?.(clamp(pinchStart.current.centerSec-nextWidth/2,0,Math.max(0,duration-nextWidth)));
      return;
    }
    if (!dragMode.current) return;
    if (dragMode.current === 'viewport')navigateViewportFromClientX(event.clientX);
    else if(dragMode.current==='resize-left'){
      const pointer=clamp(secFromClientX(event.clientX),0,viewportEnd-.05);
      const nextWidth=Math.max(.05,viewportEnd-pointer);
      dispatch({type:'setZoom',pxPerSec:state.zoomPxPerSec*(viewportWidthSec/nextWidth)});
      onViewportNavigate?.(pointer);
    }else if(dragMode.current==='resize-right'){
      const pointer=clamp(secFromClientX(event.clientX),viewportStart+.05,duration);
      const nextWidth=Math.max(.05,pointer-viewportStart);
      dispatch({type:'setZoom',pxPerSec:state.zoomPxPerSec*(viewportWidthSec/nextWidth)});
      onViewportNavigate?.(viewportStart);
    }else seekFromClientX(event.clientX);
  };

  const endPointer = (event?:React.PointerEvent<HTMLDivElement>) => {
    if(event)pointers.current.delete(event.pointerId);
    if(pointers.current.size<2)pinchStart.current=null;
    if(pointers.current.size===0)dragMode.current=null;
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
          position:'absolute',left:`${viewportLeftPct}%`,width:`${viewportPct}%`,top:2,bottom:2,
          border:'2px solid #248b99',borderRadius:3,background:'rgba(255,255,255,.20)',
          boxSizing:'border-box',pointerEvents:'none',boxShadow:'0 0 0 1px rgba(54,224,246,.75) inset',
        }}
      >
        <i style={{position:'absolute',left:-3,top:'25%',bottom:'25%',width:5,borderRadius:2,background:'#36E0F6',border:'1px solid #248b99'}}/>
        <i style={{position:'absolute',right:-3,top:'25%',bottom:'25%',width:5,borderRadius:2,background:'#36E0F6',border:'1px solid #248b99'}}/>
      </div>
      <div aria-hidden="true" style={{ position: 'absolute', left: `calc(${playheadPct}% - 1px)`, top: 0, bottom: 0, width: 2, background: '#111', pointerEvents: 'none' }} />
    </div>
  );
};
