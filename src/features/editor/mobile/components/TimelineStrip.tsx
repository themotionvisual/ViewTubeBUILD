/** Phone timeline with touch-arbitrated select/move/trim, keyframes and collision-safe tracks. */
import React,{useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {
  AlertTriangle,EyeOff,ListPlus,LocateFixed,LockKeyhole,Minus,Plus,
  SkipBack,SkipForward,Trash2,Type,VolumeX,
} from 'lucide-react';
import type {EditorStore} from '../state/editorState';
import {useLongPress,usePinchZoom} from '../hooks/gestures';
import type {VtE1Clip} from '../../../../shared/vtE1TimelineContract';

export interface TimelineViewport{startSec:number;endSec:number}
export interface TimelineStripProps{
  store:EditorStore;
  height?:React.CSSProperties['height'];
  onClipContextMenu?:(clip:VtE1Clip,at:{x:number;y:number})=>void;
  onEmptyContextMenu?:(at:{x:number;y:number})=>void;
  onViewportChange?:(viewport:TimelineViewport)=>void;
  scrollToSec?:number;
  actionLabelsVisible?:boolean;
  onToggleActionLabels?:()=>void;
}

type TimelineKeyframe={id?:string;offsetSec?:number;mode?:string;values?:Record<string,unknown>};
type ClipGestureMode='pending'|'move'|'trim-left'|'trim-right'|'longpress';

export const TIMELINE_TRACK_HEIGHT=44;
export const TIMELINE_HEADER_HEIGHT=28;
export const timelinePreferredHeight=(visibleTracks:number)=>TIMELINE_HEADER_HEIGHT+Math.max(1,visibleTracks)*TIMELINE_TRACK_HEIGHT+14;

const LABEL_WIDTH=82;
const CYAN='#36E0F6';
const INK='#248b99';
const YELLOW='#FFFF61';
const PINK='#FA618A';
const EDGE_TOUCH_PX=32;
const MOVE_THRESHOLD_PX=9;
const LONG_PRESS_MS=460;

const overlaps=(a:VtE1Clip,b:VtE1Clip)=>a.trackId===b.trackId&&a.start<b.end&&a.end>b.start;

export const TimelineStrip:React.FC<TimelineStripProps>=({
  store,height,onClipContextMenu,onEmptyContextMenu,onViewportChange,scrollToSec,
  actionLabelsVisible=true,onToggleActionLabels,
})=>{
  const{state,dispatch,clipsOnTrack}=store;
  const zoom=state.zoomPxPerSec;
  const totalPx=Math.max(state.project.durationSec*zoom,400);
  const scrollRef=useRef<HTMLDivElement>(null);

  const reportViewport=useCallback(()=>{
    const el=scrollRef.current;
    if(!el||!onViewportChange)return;
    const duration=Math.max(0,state.project.durationSec);
    const visiblePx=Math.max(1,el.clientWidth-LABEL_WIDTH);
    const startSec=Math.max(0,Math.min(duration,el.scrollLeft/Math.max(4,zoom)));
    const endSec=Math.max(startSec,Math.min(duration,startSec+visiblePx/Math.max(4,zoom)));
    onViewportChange({startSec,endSec});
  },[onViewportChange,state.project.durationSec,zoom]);

  const centerPlayhead=useCallback((sec=state.playheadSec,behavior:ScrollBehavior='smooth')=>{
    const el=scrollRef.current;
    if(!el)return;
    const playX=sec*zoom+LABEL_WIDTH;
    el.scrollTo({left:Math.max(0,playX-el.clientWidth/2),behavior});
    requestAnimationFrame(reportViewport);
  },[reportViewport,state.playheadSec,zoom]);

  const editPoints=useMemo(()=>{
    const points=new Set<number>([0,state.project.durationSec]);
    state.project.clips.forEach(clip=>{
      points.add(clip.start);
      points.add(clip.end);
      (clip.keyframes as TimelineKeyframe[]|undefined)?.forEach(keyframe=>{
        points.add(clip.start+Math.max(0,Number(keyframe.offsetSec??0)));
      });
    });
    return[...points].filter(Number.isFinite).sort((a,b)=>a-b);
  },[state.project.clips,state.project.durationSec]);

  const jumpEdge=(direction:-1|1)=>{
    const now=state.playheadSec;
    const epsilon=.001;
    const target=direction<0
      ?[...editPoints].reverse().find(value=>value<now-epsilon)
      :editPoints.find(value=>value>now+epsilon);
    if(target==null)return;
    dispatch({type:'setPlaying',playing:false});
    dispatch({type:'setPlayhead',sec:target});
    centerPlayhead(target);
  };

  const pinch=usePinchZoom({onPinch:({delta})=>dispatch({type:'setZoom',pxPerSec:zoom*delta})});

  useEffect(()=>{
    if(!state.playing||!scrollRef.current)return;
    const el=scrollRef.current;
    const playX=state.playheadSec*zoom+LABEL_WIDTH;
    if(playX<el.scrollLeft+40||playX>el.scrollLeft+el.clientWidth-40){
      el.scrollTo({left:Math.max(0,playX-el.clientWidth/3),behavior:'smooth'});
    }
  },[state.playheadSec,state.playing,zoom]);

  useEffect(()=>{
    const el=scrollRef.current;
    if(!el||scrollToSec==null)return;
    const maxStart=Math.max(0,state.project.durationSec-Math.max(0,(el.clientWidth-LABEL_WIDTH)/Math.max(4,zoom)));
    el.scrollTo({left:Math.max(0,Math.min(maxStart,scrollToSec))*zoom,behavior:'auto'});
    requestAnimationFrame(reportViewport);
  },[scrollToSec,zoom,state.project.durationSec,reportViewport]);

  useEffect(()=>{
    reportViewport();
    const el=scrollRef.current;
    if(!el||typeof ResizeObserver==='undefined')return;
    const observer=new ResizeObserver(reportViewport);
    observer.observe(el);
    return()=>observer.disconnect();
  },[reportViewport,totalPx]);

  const tracks=state.project.tracks.filter(track=>!track.hidden);
  const bodyHeight=tracks.length*TIMELINE_TRACK_HEIGHT+TIMELINE_HEADER_HEIGHT+8;
  const hasOverlaps=state.project.clips.some((clip,index,all)=>all.some((other,otherIndex)=>otherIndex>index&&overlaps(clip,other)));

  return <div style={{
    width:'100%',maxWidth:'100%',height:height??'100%',maxHeight:'100%',
    minWidth:0,minHeight:0,boxSizing:'border-box',background:'#fff',
    borderRadius:7,border:`3px solid ${INK}`,overflow:'hidden',
    position:'relative',boxShadow:'3px 3px 0 rgba(54,224,246,.22)',
  }}>
    <PlayheadControls
      onPrevious={()=>jumpEdge(-1)}
      onCenter={()=>centerPlayhead()}
      onNext={()=>jumpEdge(1)}
    />
    <div style={{position:'absolute',top:3,left:LABEL_WIDTH+4,zIndex:4,display:'flex',gap:2}}>
      <button
        title="Add overlay track"
        aria-label="Add overlay track"
        onClick={()=>dispatch({type:'addTrack',kind:'overlay'})}
        style={headerBtn(CYAN)}
      ><ListPlus size={12}/></button>
      {onToggleActionLabels?<button
        title={actionLabelsVisible?'Hide action button labels':'Show action button labels'}
        aria-label={actionLabelsVisible?'Hide action button labels':'Show action button labels'}
        onClick={onToggleActionLabels}
        style={headerBtn(actionLabelsVisible?CYAN:'#fff')}
      ><Type size={12}/></button>:null}
      {hasOverlaps?<button
        title="Resolve overlapping clips"
        aria-label="Resolve overlapping clips"
        onClick={()=>dispatch({type:'resolveTrackOverlaps'})}
        style={headerBtn(YELLOW)}
      ><AlertTriangle size={12}/></button>:null}
    </div>
    <ZoomControls pxPerSec={zoom} onZoom={value=>dispatch({type:'setZoom',pxPerSec:value})}/>

    <div
      ref={scrollRef}
      data-vt-timeline-scroll="true"
      onScroll={reportViewport}
      onPointerDown={pinch.handlers.onPointerDown}
      onPointerMove={pinch.handlers.onPointerMove}
      onPointerUp={pinch.handlers.onPointerUp}
      onPointerCancel={pinch.handlers.onPointerCancel}
      style={{
        width:'100%',maxWidth:'100%',height:'100%',minWidth:0,minHeight:0,
        boxSizing:'border-box',overflow:'auto',WebkitOverflowScrolling:'touch',
        overscrollBehavior:'contain',scrollbarWidth:'thin',background:'#fff',
      }}
    >
      <div style={{position:'relative',width:totalPx+LABEL_WIDTH,minHeight:Math.max(bodyHeight,1)}}>
        <Ruler
          pxPerSec={zoom}
          durationSec={state.project.durationSec}
          onSeek={sec=>{
            dispatch({type:'setPlaying',playing:false});
            dispatch({type:'setPlayhead',sec});
          }}
        />
        <div style={{position:'relative',paddingTop:TIMELINE_HEADER_HEIGHT}}>
          {tracks.map((track,index)=><TrackRow
            key={track.id}
            track={track}
            store={store}
            clips={clipsOnTrack(track.id)}
            pxPerSec={zoom}
            totalPx={totalPx}
            y={index*TIMELINE_TRACK_HEIGHT}
            onClipContextMenu={onClipContextMenu}
            onEmptyContextMenu={onEmptyContextMenu}
          />)}
        </div>
        <Playhead playheadSec={state.playheadSec} pxPerSec={zoom} height={bodyHeight-TIMELINE_HEADER_HEIGHT}/>
      </div>
    </div>
  </div>;
};

const Ruler:React.FC<{pxPerSec:number;durationSec:number;onSeek:(sec:number)=>void}>=({
  pxPerSec,durationSec,onSeek,
})=>{
  const spacing=useMemo(()=>Math.max(.1,Math.round((90/pxPerSec)*10)/10),[pxPerSec]);
  const ticks:number[]=[];
  for(let time=0;time<=durationSec;time+=spacing)ticks.push(+time.toFixed(2));
  return <div
    onPointerDown={event=>{
      const rect=event.currentTarget.getBoundingClientRect();
      const sec=Math.max(0,Math.min(durationSec,(event.clientX-rect.left)/Math.max(4,pxPerSec)));
      onSeek(sec);
    }}
    style={{
      position:'sticky',top:0,height:TIMELINE_HEADER_HEIGHT,background:'#fff',zIndex:2,
      marginLeft:LABEL_WIDTH,borderBottom:`2px solid ${INK}`,cursor:'crosshair',
      touchAction:'pan-x',
    }}
  >
    {ticks.map(time=><div key={time} style={{
      position:'absolute',left:time*pxPerSec,top:0,bottom:0,paddingLeft:4,
      borderLeft:'1px solid rgba(0,0,0,.25)',fontSize:9,fontWeight:900,
    }}>{time}s</div>)}
  </div>;
};

const TrackRow:React.FC<{
  store:EditorStore;
  track:EditorStore['state']['project']['tracks'][number];
  clips:VtE1Clip[];
  pxPerSec:number;
  totalPx:number;
  y:number;
  onClipContextMenu?:TimelineStripProps['onClipContextMenu'];
  onEmptyContextMenu?:TimelineStripProps['onEmptyContextMenu'];
}>=({track,clips,pxPerSec,totalPx,y,store,onClipContextMenu,onEmptyContextMenu})=>{
  const{state,dispatch}=store;
  const rowColor=track.kind==='audio'?'#4EE4BE':track.kind==='overlay'?'#528FFA':track.kind==='caption'?'#FFDA47':'#FA618A';
  const selected=state.selection.trackId===track.id;
  const rowLongPress=useLongPress({
    onLongPress:({x,y:localY})=>onEmptyContextMenu?.({x,y:localY}),
    ms:450,
  });
  const removable=clips.length===0&&state.project.tracks.length>1;

  return <div style={{position:'absolute',top:y,left:0,right:0,height:TIMELINE_TRACK_HEIGHT,display:'flex'}}>
    <div
      onClick={()=>dispatch({type:'selectTrack',id:track.id})}
      style={{
        position:'sticky',left:0,width:LABEL_WIDTH,background:selected?CYAN:'#fff',
        zIndex:2,borderRight:`2px solid ${INK}`,borderBottom:`1px solid ${INK}`,
        display:'grid',gridTemplateColumns:'1fr auto',alignItems:'center',gap:2,
        padding:'0 4px',fontSize:8,fontWeight:900,textTransform:'uppercase',
      }}
    >
      <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{track.name}</span>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,17px)',gap:2}}>
        <button title={track.muted?'Unmute track':'Mute track'} aria-label={track.muted?'Unmute track':'Mute track'}
          onClick={event=>{event.stopPropagation();dispatch({type:'muteTrack',id:track.id})}} style={miniBtn(track.muted?PINK:'#fff')}><VolumeX size={10}/></button>
        <button title={track.locked?'Unlock track':'Lock track'} aria-label={track.locked?'Unlock track':'Lock track'}
          onClick={event=>{event.stopPropagation();dispatch({type:'lockTrack',id:track.id})}} style={miniBtn(track.locked?YELLOW:'#fff')}><LockKeyhole size={10}/></button>
        <button title="Hide track" aria-label="Hide track"
          onClick={event=>{event.stopPropagation();dispatch({type:'hideTrack',id:track.id})}} style={miniBtn('#fff')}><EyeOff size={10}/></button>
        <button title={removable?'Remove empty track':'Track must be empty before removal'} aria-label="Remove track"
          disabled={!removable}
          onClick={event=>{event.stopPropagation();if(removable)dispatch({type:'removeTrack',id:track.id})}}
          style={{...miniBtn(removable?'#fff':'#f2f2f2'),opacity:removable?1:.35}}><Trash2 size={10}/></button>
      </div>
    </div>

    <div
      {...rowLongPress}
      onClick={()=>dispatch({type:'clearSelection'})}
      style={{
        position:'relative',width:totalPx,background:'#f7f7f7',
        borderBottom:`1px solid ${INK}`,touchAction:'pan-x pan-y',
      }}
    >
      {clips.map(clip=><ClipBlock
        key={clip.id}
        clip={clip}
        selected={state.selection.clipIds.includes(clip.id)}
        color={rowColor}
        pxPerSec={pxPerSec}
        store={store}
        siblings={clips}
        onContextMenu={onClipContextMenu}
      />)}
    </div>
  </div>;
};

const miniBtn=(background:string):React.CSSProperties=>({
  width:17,height:17,borderRadius:3,border:`1.5px solid ${INK}`,
  background,fontSize:7,fontWeight:900,padding:0,display:'grid',placeItems:'center',
});

const ClipBlock:React.FC<{
  clip:VtE1Clip;selected:boolean;color:string;pxPerSec:number;store:EditorStore;
  siblings:VtE1Clip[];
  onContextMenu?:TimelineStripProps['onClipContextMenu'];
}>=({clip,selected,color,pxPerSec,store,siblings,onContextMenu})=>{
  const{dispatch}=store;
  const left=clip.start*pxPerSec;
  const width=Math.max(20,(clip.end-clip.start)*pxPerSec);
  const clipColor=String((clip as VtE1Clip&{uiColor?:string}).uiColor??color);
  const keyframes=((clip.keyframes??[]) as TimelineKeyframe[]).filter(keyframe=>Number.isFinite(Number(keyframe.offsetSec??0)));
  const duration=Math.max(.001,clip.end-clip.start);
  const hasOverlap=siblings.some(other=>other.id!==clip.id&&overlaps(clip,other));
  const[gestureMode,setGestureMode]=useState<ClipGestureMode|null>(null);
  const gesture=useRef<{
    pointerId:number;mode:ClipGestureMode;startX:number;startY:number;
    startSec:number;endSec:number;timer:number|null;longPressFired:boolean;
  }|null>(null);

  const clearGesture=()=>{
    const current=gesture.current;
    if(current?.timer!=null)window.clearTimeout(current.timer);
    gesture.current=null;
    setGestureMode(null);
  };

  useEffect(()=>clearGesture,[]);

  const begin=(event:React.PointerEvent<HTMLDivElement>)=>{
    if(event.pointerType==='mouse'&&event.button!==0)return;
    event.stopPropagation();
    const rect=event.currentTarget.getBoundingClientRect();
    const localX=event.clientX-rect.left;
    const edge=Math.min(EDGE_TOUCH_PX,Math.max(12,rect.width*.3));
    const mode:ClipGestureMode=localX<=edge?'trim-left':localX>=rect.width-edge?'trim-right':'pending';
    const hadSelection=store.state.selection.clipIds.length>0;
    const alreadySelected=store.state.selection.clipIds.includes(clip.id);
    if(mode!=='pending'||!hadSelection||alreadySelected)dispatch({type:'selectClip',id:clip.id});
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const next={
      pointerId:event.pointerId,mode,startX:event.clientX,startY:event.clientY,
      startSec:clip.start,endSec:clip.end,timer:null as number|null,longPressFired:false,
    };
    if(mode==='pending'){
      next.timer=window.setTimeout(()=>{
        const active=gesture.current;
        if(!active||active.pointerId!==event.pointerId||active.mode!=='pending')return;
        active.mode='longpress';
        active.longPressFired=true;
        setGestureMode('longpress');
        const currentSelection=store.state.selection.clipIds;
        dispatch({type:'selectClip',id:clip.id,additive:currentSelection.length>0&&!currentSelection.includes(clip.id)});
        if(typeof navigator!=='undefined'&&'vibrate' in navigator){
          (navigator as Navigator&{vibrate:(pattern:number|number[])=>boolean}).vibrate(15);
        }
        onContextMenu?.(clip,{x:event.clientX,y:event.clientY});
      },LONG_PRESS_MS);
    }
    gesture.current=next;
    setGestureMode(mode);
  };

  const move=(event:React.PointerEvent<HTMLDivElement>)=>{
    const active=gesture.current;
    if(!active||active.pointerId!==event.pointerId)return;
    const dx=event.clientX-active.startX;
    const dy=event.clientY-active.startY;

    if(active.mode==='pending'){
      const distance=Math.hypot(dx,dy);
      if(distance<MOVE_THRESHOLD_PX)return;
      if(active.timer!=null){window.clearTimeout(active.timer);active.timer=null}
      if(Math.abs(dx)<=Math.abs(dy)){
        clearGesture();
        return;
      }
      active.mode='move';
      dispatch({type:'selectClip',id:clip.id});
      setGestureMode('move');
    }

    if(active.mode==='move'){
      dispatch({type:'moveClipTo',id:clip.id,startSec:active.startSec+(dx/Math.max(4,pxPerSec))});
      return;
    }
    if(active.mode==='trim-left'){
      dispatch({type:'trimClip',id:clip.id,side:'left',sec:active.startSec+(dx/Math.max(4,pxPerSec))});
      return;
    }
    if(active.mode==='trim-right'){
      dispatch({type:'trimClip',id:clip.id,side:'right',sec:active.endSec+(dx/Math.max(4,pxPerSec))});
    }
  };

  const end=(event:React.PointerEvent<HTMLDivElement>)=>{
    const active=gesture.current;
    if(!active||active.pointerId!==event.pointerId)return;
    event.stopPropagation();
    if(active.mode==='pending'&&!active.longPressFired)dispatch({type:'selectClip',id:clip.id});
    clearGesture();
  };

  return <div
    onPointerDown={begin}
    onPointerMove={move}
    onPointerUp={end}
    onPointerCancel={end}
    style={{
      position:'absolute',top:4,bottom:4,left,width,borderRadius:5,background:clipColor,
      border:hasOverlap?`3px solid ${PINK}`:selected?'3px solid #000':`2px solid ${INK}`,
      boxShadow:selected?`0 0 0 2px #fff,3px 3px 0 ${CYAN}`:'2px 2px 0 rgba(0,0,0,.12)',
      padding:'4px 8px',fontSize:9,fontWeight:900,overflow:'hidden',
      whiteSpace:'nowrap',touchAction:'none',userSelect:'none',
    }}
  >
    <span style={{position:'relative',zIndex:1,pointerEvents:'none'}}>{String(clip.id).slice(0,18)}</span>
    {gestureMode==='trim-left'||gestureMode==='trim-right'?<div style={{
      position:'absolute',top:2,right:3,zIndex:4,padding:'1px 4px',
      background:'#fff',border:`1.5px solid ${INK}`,borderRadius:3,
      fontSize:7,fontWeight:900,pointerEvents:'none',
    }}>{clip.start.toFixed(2)}–{clip.end.toFixed(2)}s</div>:null}

    <div aria-label="Clip keyframes" style={{
      position:'absolute',left:7,right:7,bottom:3,height:10,pointerEvents:'none',zIndex:2,
    }}>
      {keyframes.map((keyframe,index)=>{
        const offset=Math.max(0,Math.min(duration,Number(keyframe.offsetSec??0)));
        return <KeyframeMarker key={String(keyframe.id??`${offset}-${index}`)}
          mode={String(keyframe.mode??'circle')} leftPercent={(offset/duration)*100}/>;
      })}
    </div>

    <TouchEdge side="left" active={gestureMode==='trim-left'}/>
    <TouchEdge side="right" active={gestureMode==='trim-right'}/>
  </div>;
};

const TouchEdge:React.FC<{side:'left'|'right';active:boolean}>=({side,active})=><div style={{
  position:'absolute',top:0,bottom:0,[side]:0,width:EDGE_TOUCH_PX,pointerEvents:'none',
  background:active?'rgba(54,224,246,.22)':'transparent',
}}>
  <div style={{
    position:'absolute',top:'50%',[side]:5,transform:'translateY(-50%)',
    width:5,height:20,borderRadius:2,background:active?CYAN:'#000',
    boxShadow:active?'0 0 0 2px #fff':undefined,
  }}/>
</div>;

const KeyframeMarker:React.FC<{mode:string;leftPercent:number}>=({mode,leftPercent})=>{
  if(mode==='diamond')return <span style={{
    position:'absolute',left:`${leftPercent}%`,top:'50%',
    width:12,height:10,transform:'translate(-50%,-50%)',
  }}>
    <span style={{position:'absolute',left:1,top:2,width:6,height:6,background:'#fff',border:'1.5px solid #111',transform:'rotate(45deg)',boxSizing:'border-box'}}/>
    <span style={{position:'absolute',right:1,top:2,width:6,height:6,background:CYAN,border:'1.5px solid #111',transform:'rotate(45deg)',boxSizing:'border-box'}}/>
  </span>;
  return <span style={{
    position:'absolute',left:`${leftPercent}%`,top:'50%',width:8,height:8,
    borderRadius:'50%',background:'#fff',border:'1.5px solid #111',
    transform:'translate(-50%,-50%)',boxSizing:'border-box',
  }}/>;
};

const Playhead:React.FC<{playheadSec:number;pxPerSec:number;height:number}>=({playheadSec,pxPerSec,height})=><div style={{
  position:'absolute',left:playheadSec*pxPerSec+LABEL_WIDTH,
  top:TIMELINE_HEADER_HEIGHT-6,height:height+12,width:2,background:'#000',pointerEvents:'none',
}}>
  <div style={{position:'absolute',top:-6,left:-5,width:12,height:12,background:CYAN,border:'2px solid #000',transform:'rotate(45deg)'}}/>
</div>;

const PlayheadControls:React.FC<{onPrevious:()=>void;onCenter:()=>void;onNext:()=>void}>=({onPrevious,onCenter,onNext})=><div
  aria-label="Timeline playhead navigation"
  style={{position:'absolute',top:3,left:4,zIndex:4,width:LABEL_WIDTH-8,display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:2,background:'#fff'}}
>
  <button title="Previous edit point or keyframe" aria-label="Previous edit point or keyframe" onClick={onPrevious} style={headerBtn('#fff')}><SkipBack size={12}/></button>
  <button title="Center timeline on playhead" aria-label="Center timeline on playhead" onClick={onCenter} style={headerBtn(YELLOW)}><LocateFixed size={12}/></button>
  <button title="Next edit point or keyframe" aria-label="Next edit point or keyframe" onClick={onNext} style={headerBtn('#fff')}><SkipForward size={12}/></button>
</div>;

const ZoomControls:React.FC<{pxPerSec:number;onZoom:(value:number)=>void}>=({pxPerSec,onZoom})=><div style={{
  position:'absolute',top:3,right:4,zIndex:4,display:'flex',gap:2,
  background:'#fff',border:`2px solid ${INK}`,borderRadius:5,padding:1,
}}>
  <button title="Zoom out" aria-label="Zoom out" onClick={()=>onZoom(pxPerSec/1.4)} style={miniBtn('#fff')}><Minus size={10}/></button>
  <div style={{fontSize:8,alignSelf:'center',minWidth:34,textAlign:'center',fontWeight:900}}>{Math.round(pxPerSec)}px/s</div>
  <button title="Zoom in" aria-label="Zoom in" onClick={()=>onZoom(pxPerSec*1.4)} style={miniBtn(CYAN)}><Plus size={10}/></button>
</div>;

const headerBtn=(background:string):React.CSSProperties=>({
  height:20,minWidth:0,border:`1.5px solid ${INK}`,borderRadius:4,
  background,color:'#111',fontSize:13,fontWeight:1000,padding:0,lineHeight:1,
  display:'grid',placeItems:'center',
});
