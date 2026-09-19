import React from 'react';
import type {EditorStore} from '../state/editorState';

/**
 * Advances the shared mobile-editor playhead from the same playing/playbackRate
 * state used by the transport, timeline and preview.
 */
export function usePlaybackClock(store:EditorStore){
  const {state,dispatch}=store;
  const playheadRef=React.useRef(state.playheadSec);
  const rateRef=React.useRef(state.playbackRate);
  const durationRef=React.useRef(state.project.durationSec);

  React.useEffect(()=>{playheadRef.current=state.playheadSec},[state.playheadSec]);
  React.useEffect(()=>{rateRef.current=state.playbackRate},[state.playbackRate]);
  React.useEffect(()=>{durationRef.current=state.project.durationSec},[state.project.durationSec]);

  React.useEffect(()=>{
    if(!state.playing)return;
    const duration=Math.max(0,durationRef.current);
    if(duration<=0){
      dispatch({type:'setPlaying',playing:false});
      return;
    }
    if(playheadRef.current>=duration-.001){
      playheadRef.current=0;
      dispatch({type:'setPlayhead',sec:0});
    }

    let frame=0;
    let last=typeof performance!=='undefined'?performance.now():Date.now();
    const tick=(now:number)=>{
      const elapsed=Math.max(0,Math.min(.1,(now-last)/1000));
      last=now;
      const next=Math.min(durationRef.current,playheadRef.current+elapsed*Math.max(.1,rateRef.current));
      playheadRef.current=next;
      dispatch({type:'setPlayhead',sec:next});
      if(next>=durationRef.current-.001){
        dispatch({type:'setPlaying',playing:false});
        return;
      }
      frame=requestAnimationFrame(tick);
    };
    frame=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(frame);
  },[state.playing,dispatch]);
}
