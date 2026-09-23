/** Phone timeline with touch-arbitrated select/move/trim, keyframes and collision-safe tracks. */
import React,{useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {
  AlertTriangle,Eye,EyeOff,GripVertical,Layers3,ListPlus,LocateFixed,LockKeyhole,Magnet,Minus,Plus,
  SkipBack,SkipForward,StepBack,StepForward,Trash2,Type,VolumeX,X,
} from 'lucide-react';
import type {EditorStore} from '../state/editorState';
import {useLongPress,usePinchZoom} from '../hooks/gestures';
import type {VtE1Clip} from '../../../../shared/vtE1TimelineContract';

export interface TimelineViewport{startSec:number;endSec:number}
export interface TimelineStripProps{
  store:EditorStore;
  height?:React.CSSProperties['height'];
  onClipContextMenu?:(clip:VtE1Clip,at:{x:number;y:number})=>void;
  onTrackContextMenu?:(track:EditorStore['state']['project']['tracks'][number],at:{x:number;y:number})=>void;
  onKeyframeContextMenu?:(clip:VtE1Clip,keyframeId:string,at:{x:number;y:number})=>void;
  onEmptyContextMenu?:(at:{x:number;y:number})=>void;
  onViewportChange?:(viewport:TimelineViewport)=>void;
  scrollToSec?:number;
  actionLabelsVisible?:boolean;
  onToggleActionLabels?:()=>void;
}

type TimelineKeyframe={id?:string;offsetSec?:number;mode?:string;values?:Record<string,unknown>;interp?:string};
type ClipGestureMode='pending'|'move'|'trim-left'|'trim-right'|'longpress'|'multi';
type SnapStrength='off'|'soft'|'strong';
type NavMode='all'|'clip'|'keyframe'|'transition'|'frame';
type SnapKinds={edges:boolean;keyframes:boolean;playhead:boolean;seconds:boolean;transitions:boolean};

export const TIMELINE_TRACK_HEIGHT=44;
const CLIP_BODY_HEIGHT=26;
const KEYFRAME_LANE_HEIGHT=18;
export const TIMELINE_HEADER_HEIGHT=48;
export const timelinePreferredHeight=(visibleTracks:number)=>TIMELINE_HEADER_HEIGHT+Math.max(1,visibleTracks)*TIMELINE_TRACK_HEIGHT+14;

const LABEL_WIDTH=94;
const CYAN='#36E0F6';
const INK='#248b99';
const YELLOW='#FFFF61';
const PINK='#FA618A';
const EDGE_TOUCH_PX=32;
const MOVE_THRESHOLD_PX=9;
const LONG_PRESS_MS=460;
const IOS_TOUCH_SAFE:React.CSSProperties={userSelect:'none',WebkitUserSelect:'none',WebkitTouchCallout:'none',WebkitTapHighlightColor:'transparent'};
const SNAP_STORAGE='viewtube.mobile.timeline.snap.v2';

const overlaps=(a:VtE1Clip,b:VtE1Clip)=>a.trackId===b.trackId&&a.start<b.end&&a.end>b.start;

const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));
const readSnap=()=>{
  if(typeof window==='undefined')return{strength:'soft' as SnapStrength,kinds:{edges:true,keyframes:true,playhead:true,seconds:true,transitions:true} as SnapKinds};
  try{
    const raw=JSON.parse(localStorage.getItem(SNAP_STORAGE)||'{}');
    return{strength:(['off','soft','strong'].includes(raw.strength)?raw.strength:'soft') as SnapStrength,kinds:{edges:true,keyframes:true,playhead:true,seconds:true,transitions:true,...raw.kinds} as SnapKinds};
  }catch{return{strength:'soft' as SnapStrength,kinds:{edges:true,keyframes:true,playhead:true,seconds:true,transitions:true} as SnapKinds}}
};
const snapTime=(value:number,targets:number[],strength:SnapStrength,zoom:number)=>{
  if(strength==='off')return value;
  const threshold=(strength==='strong'?20:10)/Math.max(4,zoom);
  let best=value,distance=Infinity;
  for(const target of targets){const d=Math.abs(target-value);if(d<=threshold&&d<distance){best=target;distance=d}}
  return best;
};
const snapMoveStart=(value:number,duration:number,targets:number[],strength:SnapStrength,zoom:number)=>{
  const start=snapTime(value,targets,strength,zoom);
  const end=snapTime(value+duration,targets,strength,zoom)-duration;
  return Math.abs(start-value)<=Math.abs(end-value)?start:end;
};
const groupColor=(groupId:string)=>{
  const colors=['#36E0F6','#FA618A','#FFDA47','#4EE4BE','#528FFA','#C86BFA','#FF9B54'];
  let hash=0;for(let i=0;i<groupId.length;i++)hash=(hash*31+groupId.charCodeAt(i))|0;
  return colors[Math.abs(hash)%colors.length];
};
const compoundChildren=(clip:VtE1Clip)=>{
  const children=(clip as VtE1Clip&{compoundChildren?:Array<VtE1Clip&{relativeStart?:number;relativeEnd?:number}>}).compoundChildren;
  if(!Array.isArray(children))return[];
  return children.map((child,index)=>({...child,id:clip.id+'::child::'+index,start:clip.start+Number(child.relativeStart??0),end:clip.start+Number(child.relativeEnd??Math.max(.1,child.end-child.start))} as VtE1Clip));
};

export const TimelineStrip:React.FC<TimelineStripProps>=({
  store,height,onClipContextMenu,onTrackContextMenu,onKeyframeContextMenu,onEmptyContextMenu,onViewportChange,scrollToSec,
  actionLabelsVisible=true,onToggleActionLabels,
})=>{
  const{state,dispatch,clipsOnTrack}=store;
  const zoom=state.zoomPxPerSec;
  const totalPx=Math.max(state.project.durationSec*zoom,400);
  const scrollRef=useRef<HTMLDivElement>(null);
  const[snap,setSnap]=useState(readSnap);
  const[showSnap,setShowSnap]=useState(false);
  const[navMode,setNavMode]=useState<NavMode>('all');
  const[showNavigator,setShowNavigator]=useState(false);
  const[compoundFocusId,setCompoundFocusId]=useState<string|null>(null);
  const fps=Math.max(1,Number((state.project.meta as Record<string,unknown>|undefined)?.fps??30));

  useEffect(()=>{
    if(typeof window!=='undefined')localStorage.setItem(SNAP_STORAGE,JSON.stringify(snap));
  },[snap]);

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

  const navPoints=useMemo(()=>{
    const clipPoints=new Set<number>([0,state.project.durationSec]);
    const keyframePoints=new Set<number>();
    const transitionPoints=new Set<number>();
    state.project.clips.forEach(clip=>{
      clipPoints.add(clip.start);clipPoints.add(clip.end);
      (clip.keyframes as TimelineKeyframe[]|undefined)?.forEach(keyframe=>keyframePoints.add(clip.start+Math.max(0,Number(keyframe.offsetSec??0))));
    });
    (state.project.transitions??[]).forEach(transition=>{
      const left=state.project.clips.find(clip=>clip.id===transition.leftClipId);
      const right=state.project.clips.find(clip=>clip.id===transition.rightClipId);
      if(left)transitionPoints.add(left.end);
      if(right)transitionPoints.add(right.start);
    });
    const sort=(values:Set<number>)=>[...values].filter(Number.isFinite).sort((a,b)=>a-b);
    return{clip:sort(clipPoints),keyframe:sort(keyframePoints),transition:sort(transitionPoints),all:sort(new Set([...clipPoints,...keyframePoints,...transitionPoints]))};
  },[state.project.clips,state.project.transitions,state.project.durationSec]);

  const stepFrame=(direction:-1|1)=>{
    dispatch({type:'setPlaying',playing:false});
    const sec=clamp(state.playheadSec+direction/fps,0,state.project.durationSec);
    dispatch({type:'setPlayhead',sec});
    centerPlayhead(sec);
  };

  const jumpEdge=(direction:-1|1)=>{
    if(navMode==='frame'){stepFrame(direction);return}
    const points=navPoints[navMode==='all'?'all':navMode];
    const epsilon=.001;
    const target=direction<0
      ?[...points].reverse().find(value=>value<state.playheadSec-epsilon)
      :points.find(value=>value>state.playheadSec+epsilon);
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

  const focusedCompound=compoundFocusId?state.project.clips.find(clip=>clip.id===compoundFocusId):undefined;
  const focusedChildren=focusedCompound?compoundChildren(focusedCompound):[];
  const tracks=state.project.tracks.filter(track=>!focusedCompound||track.id===focusedCompound.trackId);
  const trackRows=useMemo(()=>tracks.map((track,index)=>{
    const clips=focusedCompound?focusedChildren.filter(clip=>clip.trackId===track.id||focusedCompound.trackId===track.id):clipsOnTrack(track.id);
    const selectedClip=clips.find(clip=>state.selection.clipIds.includes(clip.id));
    return{
      track,
      clips,
      y:index*TIMELINE_TRACK_HEIGHT,
      height:TIMELINE_TRACK_HEIGHT,
      selectedClip,
      hasKeyframes:Boolean(selectedClip&&(selectedClip.keyframes??[]).length),
    };
  }),[tracks,focusedCompound,focusedChildren,state.selection.clipIds,clipsOnTrack,state.project.clips]);
  const bodyHeight=trackRows.length*TIMELINE_TRACK_HEIGHT+TIMELINE_HEADER_HEIGHT+8;
  const hasOverlaps=!focusedCompound&&state.project.clips.some((clip,index,all)=>all.some((other,otherIndex)=>otherIndex>index&&overlaps(clip,other)));

  return <div style={{
    width:'100%',maxWidth:'100%',height:height??'100%',maxHeight:'100%',
    minWidth:0,minHeight:0,boxSizing:'border-box',background:'#fff',
    borderRadius:7,border:`3px solid ${INK}`,overflow:'hidden',
    position:'relative',boxShadow:'3px 3px 0 rgba(54,224,246,.22)',...IOS_TOUCH_SAFE,
  }}>
    <PlayheadControls
      navMode={navMode}
      onPrevious={()=>jumpEdge(-1)}
      onCenter={()=>centerPlayhead()}
      onNext={()=>jumpEdge(1)}
      onFrameBack={()=>stepFrame(-1)}
      onFrameForward={()=>stepFrame(1)}
      onOpenNavigator={()=>setShowNavigator(value=>!value)}
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
      {focusedCompound?<button title="Exit compound timeline" aria-label="Exit compound timeline" onClick={()=>setCompoundFocusId(null)} style={headerBtn(YELLOW)}><Layers3 size={12}/></button>:null}
      {hasOverlaps?<button
        title="Resolve overlapping clips"
        aria-label="Resolve overlapping clips"
        onClick={()=>dispatch({type:'resolveTrackOverlaps'})}
        style={headerBtn(YELLOW)}
      ><AlertTriangle size={12}/></button>:null}
    </div>
    <button
      title={'Snap: '+snap.strength}
      aria-label={'Snap strength: '+snap.strength}
      onClick={()=>setSnap(current=>({...current,strength:current.strength==='off'?'soft':current.strength==='soft'?'strong':'off'}))}
      onContextMenu={event=>{event.preventDefault();setShowSnap(value=>!value)}}
      style={{...headerBtn(snap.strength==='off'?'#fff':snap.strength==='soft'?CYAN:YELLOW),position:'absolute',top:3,right:74,zIndex:6,width:20}}
    ><Magnet size={11}/></button>
    <ZoomControls pxPerSec={zoom} onZoom={value=>dispatch({type:'setZoom',pxPerSec:value})}/>
    {showNavigator?<NavigatorPicker mode={navMode} onChange={mode=>{setNavMode(mode);setShowNavigator(false)}}/>:null}
    {showSnap?<SnapPicker snap={snap} onChange={setSnap} onClose={()=>setShowSnap(false)}/>:null}

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
        <Ruler pxPerSec={zoom} durationSec={state.project.durationSec}/>
        <PrecisionScrub store={store} pxPerSec={zoom} labelWidth={LABEL_WIDTH} scrollRef={scrollRef}/>
        <div style={{position:'relative',paddingTop:TIMELINE_HEADER_HEIGHT}}>
          {trackRows.map(row=><TrackRow
            key={row.track.id}
            track={row.track}
            store={store}
            clips={row.clips}
            pxPerSec={zoom}
            totalPx={totalPx}
            y={row.y}
            rowHeight={row.height}
            selectedClip={row.selectedClip}
            showKeyframeLane={row.hasKeyframes}
            snap={snap}
            readOnly={Boolean(focusedCompound)}
            focusParentId={focusedCompound?.id}
            onOpenCompound={setCompoundFocusId}
            onClipContextMenu={onClipContextMenu}
            onTrackContextMenu={onTrackContextMenu}
            onKeyframeContextMenu={onKeyframeContextMenu}
            onEmptyContextMenu={onEmptyContextMenu}
          />)}
        </div>
        <Playhead playheadSec={state.playheadSec} pxPerSec={zoom} height={bodyHeight-TIMELINE_HEADER_HEIGHT}/>
      </div>
    </div>
  </div>;
};

const Ruler:React.FC<{pxPerSec:number;durationSec:number}>=({pxPerSec,durationSec})=>{
  const spacing=useMemo(()=>Math.max(.1,Math.round((90/pxPerSec)*10)/10),[pxPerSec]);
  const ticks:number[]=[];
  for(let time=0;time<=durationSec;time+=spacing)ticks.push(+time.toFixed(2));
  return <div style={{
    position:'sticky',top:0,height:28,background:'#fff',zIndex:2,
    marginLeft:LABEL_WIDTH,borderBottom:`1.5px solid ${INK}`,pointerEvents:'none',
  }}>
    {ticks.map(time=><div key={time} style={{
      position:'absolute',left:time*pxPerSec,top:0,bottom:0,paddingLeft:4,
      borderLeft:'1px solid rgba(36,139,153,.35)',fontSize:8,fontWeight:900,
    }}>{time}s</div>)}
  </div>;
};

const PrecisionScrub:React.FC<{
  store:EditorStore;
  pxPerSec:number;
  labelWidth:number;
  scrollRef:React.RefObject<HTMLDivElement|null>;
}>=({store,pxPerSec,labelWidth,scrollRef})=>{
  const active=useRef<{id:number;x:number;y:number;sec:number}|null>(null);
  const[factor,setFactor]=useState(1);
  return <div
    aria-label="Precision timeline scrub strip"
    onPointerDown={event=>{
      event.stopPropagation();
      event.currentTarget.setPointerCapture?.(event.pointerId);
      const rect=event.currentTarget.getBoundingClientRect();
      const timelineX=(event.clientX-rect.left)+(scrollRef.current?.scrollLeft??0)-labelWidth;
      const sec=clamp(timelineX/Math.max(4,pxPerSec),0,store.state.project.durationSec);
      store.dispatch({type:'setPlaying',playing:false});
      store.dispatch({type:'setPlayhead',sec});
      active.current={id:event.pointerId,x:event.clientX,y:event.clientY,sec};
      setFactor(1);
    }}
    onPointerMove={event=>{
      const current=active.current;
      if(!current||current.id!==event.pointerId)return;
      const dy=Math.abs(event.clientY-current.y);
      const nextFactor=dy>62?.05:dy>30?.25:1;
      setFactor(nextFactor);
      store.dispatch({type:'setPlayhead',sec:current.sec+((event.clientX-current.x)/Math.max(4,pxPerSec))*nextFactor});
    }}
    onPointerUp={()=>{active.current=null;setFactor(1)}}
    onPointerCancel={()=>{active.current=null;setFactor(1)}}
    style={{
      position:'sticky',top:28,zIndex:3,height:20,marginLeft:LABEL_WIDTH,
      borderBottom:`2px solid ${INK}`,background:'rgba(54,224,246,.12)',
      touchAction:'none',cursor:'ew-resize',
    }}
  >
    <div style={{position:'absolute',right:4,top:4,fontSize:7,fontWeight:1000,opacity:.62}}>SCRUB {factor}×</div>
  </div>;
};

const TrackRow:React.FC<{
  store:EditorStore;
  track:EditorStore['state']['project']['tracks'][number];
  clips:VtE1Clip[];
  pxPerSec:number;
  totalPx:number;
  y:number;
  rowHeight:number;
  selectedClip?:VtE1Clip;
  showKeyframeLane?:boolean;
  snap:{strength:SnapStrength;kinds:SnapKinds};
  readOnly?:boolean;
  focusParentId?:string;
  onOpenCompound?:(id:string)=>void;
  onClipContextMenu?:TimelineStripProps['onClipContextMenu'];
  onTrackContextMenu?:TimelineStripProps['onTrackContextMenu'];
  onKeyframeContextMenu?:TimelineStripProps['onKeyframeContextMenu'];
  onEmptyContextMenu?:TimelineStripProps['onEmptyContextMenu'];
}>=({track,clips,pxPerSec,totalPx,y,rowHeight,selectedClip,showKeyframeLane=false,store,snap,readOnly=false,focusParentId,onOpenCompound,onClipContextMenu,onTrackContextMenu,onKeyframeContextMenu,onEmptyContextMenu})=>{
  const{state,dispatch}=store;
  const rowColor=track.kind==='audio'?'#4EE4BE':track.kind==='overlay'?'#528FFA':track.kind==='caption'?'#FFDA47':'#FA618A';
  const selected=state.selection.trackId===track.id;
  const rowLongPress=useLongPress({
    onLongPress:({x,y:localY})=>onEmptyContextMenu?.({x,y:localY}),
    ms:450,
  });
  const removable=!readOnly&&clips.length===0&&state.project.tracks.length>1;
  const reorder=useRef<{pointerId:number}|null>(null);
  const trackIndex=state.project.tracks.findIndex(item=>item.id===track.id);
  const finishReorder=()=>{reorder.current=null};

  return <div data-vt-track-id={track.id} style={{position:'absolute',top:y,left:0,right:0,height:rowHeight,display:'flex',opacity:track.hidden?.58:1}}>
    <div
      onClick={()=>!readOnly&&dispatch({type:'selectTrack',id:track.id})}
      onContextMenu={event=>{
        if(readOnly)return;
        event.preventDefault();event.stopPropagation();
        dispatch({type:'selectTrack',id:track.id});
        onTrackContextMenu?.(track,{x:event.clientX,y:event.clientY});
      }}
      style={{
        position:'sticky',left:0,width:LABEL_WIDTH,background:selected?CYAN:'#fff',
        zIndex:2,borderRight:`2px solid ${INK}`,borderBottom:`1px solid ${INK}`,
        display:'grid',gridTemplateRows:'17px 17px',gridTemplateColumns:'minmax(0,1fr)',alignContent:'center',gap:2,
        padding:'3px 4px',boxSizing:'border-box',fontSize:8,fontWeight:900,textTransform:'uppercase',
        ...IOS_TOUCH_SAFE,
      }}
    >
      <div style={{display:'grid',gridTemplateColumns:'16px minmax(0,1fr)',alignItems:'center',gap:3,minWidth:0}}>
        {!readOnly?<button
          title="Drag to reorder track"
          aria-label="Drag to reorder track"
          onPointerDown={event=>{event.stopPropagation();reorder.current={pointerId:event.pointerId};event.currentTarget.setPointerCapture?.(event.pointerId)}}
          onPointerMove={event=>{
            if(reorder.current?.pointerId!==event.pointerId)return;
            const node=(document.elementFromPoint(event.clientX,event.clientY) as HTMLElement|null)?.closest?.('[data-vt-track-id]') as HTMLElement|null;
            const targetId=node?.dataset.vtTrackId;
            if(!targetId||targetId===track.id)return;
            const toIndex=state.project.tracks.findIndex(item=>item.id===targetId);
            if(toIndex>=0&&toIndex!==trackIndex)dispatch({type:'reorderTrack',id:track.id,toIndex});
          }}
          onPointerUp={finishReorder}
          onPointerCancel={finishReorder}
          style={{...miniBtn('#fff'),width:15,height:17,touchAction:'none'}}
        ><GripVertical size={9}/></button>:<Layers3 size={12}/>}
        <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{readOnly?'Compound':track.name}</span>
      </div>
      {!readOnly?<div style={{display:'grid',gridTemplateColumns:'repeat(4,17px)',gap:2,justifyContent:'start'}}>
        <button title={track.muted?'Unmute track':'Mute track'} aria-label={track.muted?'Unmute track':'Mute track'}
          onClick={event=>{event.stopPropagation();dispatch({type:'muteTrack',id:track.id})}} style={miniBtn(track.muted?PINK:'#fff')}><VolumeX size={10}/></button>
        <button title={track.locked?'Unlock track':'Lock track'} aria-label={track.locked?'Unlock track':'Lock track'}
          onClick={event=>{event.stopPropagation();dispatch({type:'lockTrack',id:track.id})}} style={miniBtn(track.locked?YELLOW:'#fff')}><LockKeyhole size={10}/></button>
        <button title={track.hidden?'Show track':'Hide track'} aria-label={track.hidden?'Show track':'Hide track'}
          onClick={event=>{event.stopPropagation();dispatch({type:'hideTrack',id:track.id})}} style={miniBtn(track.hidden?CYAN:'#fff')}>{track.hidden?<Eye size={10}/>:<EyeOff size={10}/>}</button>
        <button title={removable?'Remove empty track':'Track must be empty before removal'} aria-label="Remove track"
          disabled={!removable}
          onClick={event=>{event.stopPropagation();if(removable)dispatch({type:'removeTrack',id:track.id})}}
          style={{...miniBtn(removable?'#fff':'#f2f2f2'),opacity:removable?1:.35}}><Trash2 size={10}/></button>
      </div>:<span/>}
    </div>

    <div
      {...(!readOnly?rowLongPress:{})}
      onClick={()=>!readOnly&&dispatch({type:'clearSelection'})}
      style={{
        position:'relative',width:totalPx,background:'#f7f7f7',
        borderBottom:`1px solid ${INK}`,touchAction:'pan-x pan-y',
      }}
    >
      <div style={{position:'absolute',left:0,right:0,top:0,height:CLIP_BODY_HEIGHT}}>
        {clips.map(clip=><ClipBlock
          key={clip.id}
          clip={clip}
          selected={state.selection.clipIds.includes(clip.id)}
          color={rowColor}
          pxPerSec={pxPerSec}
          store={store}
          siblings={clips}
          snap={snap}
          readOnly={readOnly}
          focusParentId={focusParentId}
          onOpenCompound={onOpenCompound}
          onContextMenu={onClipContextMenu}
        />)}
        {!readOnly?(state.project.transitions??[]).filter(transition=>{
          const left=state.project.clips.find(item=>item.id===transition.leftClipId);
          const right=state.project.clips.find(item=>item.id===transition.rightClipId);
          return left?.trackId===track.id&&right?.trackId===track.id;
        }).map((transition,index)=><TransitionChip
          key={String((transition as {id?:unknown}).id??`${transition.leftClipId}-${transition.rightClipId}-${index}`)}
          transition={transition} clips={state.project.clips} pxPerSec={pxPerSec}
          selectedId={state.selection.transitionId??undefined} onSelect={id=>dispatch({type:'selectTransition',id})}
        />):null}
      </div>
      <div style={{position:'absolute',left:0,right:0,top:CLIP_BODY_HEIGHT,height:KEYFRAME_LANE_HEIGHT,borderTop:`1px solid ${INK}`,background:'rgba(54,224,246,.035)'}}>
        {showKeyframeLane&&selectedClip&&!readOnly?<KeyframeLane clip={selectedClip} store={store} pxPerSec={pxPerSec} top={0} onContextMenu={onKeyframeContextMenu}/>:null}
      </div>
    </div>
  </div>;
};

const TransitionChip:React.FC<{
  transition:NonNullable<EditorStore['state']['project']['transitions']>[number];clips:VtE1Clip[];pxPerSec:number;selectedId?:string;onSelect:(id:string)=>void;
}>=({transition,clips,pxPerSec,selectedId,onSelect})=>{
  const left=clips.find(clip=>clip.id===transition.leftClipId),right=clips.find(clip=>clip.id===transition.rightClipId);
  if(!left||!right)return null;
  const id=String((transition as {id?:unknown}).id??`${transition.leftClipId}-${transition.rightClipId}`);
  const seam=(left.end+right.start)/2,duration=Math.max(.12,Number(transition.durationSec??.4)),width=Math.max(18,duration*pxPerSec);
  const label=String((transition as {presentation?:unknown;type?:unknown}).presentation??(transition as {type?:unknown}).type??'FX');
  return <button title={`Transition: ${label}`} aria-label={`Select transition ${label}`} onPointerDown={event=>event.stopPropagation()} onClick={event=>{event.stopPropagation();onSelect(id)}} style={{
    position:'absolute',left:seam*pxPerSec-width/2,top:2,width,height:22,zIndex:8,border:`2px solid ${selectedId===id?CYAN:INK}`,
    borderRadius:4,background:YELLOW,color:'#111',padding:'0 3px',fontSize:6,fontWeight:1000,textTransform:'uppercase',
    overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',boxShadow:selectedId===id?'0 0 0 2px #fff,2px 2px 0 rgba(36,139,153,.35)':'2px 2px 0 rgba(36,139,153,.25)',...IOS_TOUCH_SAFE,
  }}>{label}</button>;
};

const KeyframeLane:React.FC<{clip:VtE1Clip;store:EditorStore;pxPerSec:number;top:number;onContextMenu?:TimelineStripProps['onKeyframeContextMenu']}>=({clip,store,pxPerSec,top,onContextMenu})=>{
  const frames=((clip.keyframes??[]) as TimelineKeyframe[]).filter(frame=>frame.id&&Number.isFinite(Number(frame.offsetSec??0)));
  const[selected,setSelected]=useState<string[]>([]);
  const[preview,setPreview]=useState<Record<string,number>>({});
  const drag=useRef<{id:string;pointerId:number;x:number;offset:number;moved:boolean;timer:number|null}|null>(null);
  const duration=Math.max(.001,clip.end-clip.start);
  useEffect(()=>setSelected(current=>current.filter(id=>frames.some(frame=>String(frame.id)===id))),[clip.keyframes]);
  return <div
    aria-label="Expanded keyframe lane"
    onClick={event=>event.stopPropagation()}
    style={{position:'absolute',left:0,right:0,top,height:KEYFRAME_LANE_HEIGHT,background:'rgba(54,224,246,.08)',overflow:'hidden',...IOS_TOUCH_SAFE}}
  >
    {frames.map((frame,index)=>{
      const id=String(frame.id);
      const offset=preview[id]??Number(frame.offsetSec??0);
      const x=(clip.start+offset)*pxPerSec;
      const active=selected.includes(id);
      const mode=String(frame.mode??'circle');
      return <button
        key={id}
        title={`${Object.keys(frame.values??{}).join(', ')||'keyframe'} · ${String(frame.interp??'linear')}`}
        aria-label={`Keyframe ${index+1}`}
        onContextMenu={event=>{
          event.preventDefault();event.stopPropagation();
          if(!selected.includes(id))setSelected([id]);
          onContextMenu?.(clip,id,{x:event.clientX,y:event.clientY});
        }}
        onPointerDown={event=>{
          event.stopPropagation();event.currentTarget.setPointerCapture?.(event.pointerId);
          const timer=window.setTimeout(()=>setSelected(current=>current.includes(id)?current.filter(item=>item!==id):[...current,id]),420);
          drag.current={id,pointerId:event.pointerId,x:event.clientX,offset,moved:false,timer};
          if(!active&&!event.shiftKey)setSelected([id]);
        }}
        onPointerMove={event=>{
          const current=drag.current;if(!current||current.id!==id||current.pointerId!==event.pointerId)return;
          const dx=event.clientX-current.x;if(Math.abs(dx)>5){current.moved=true;if(current.timer!=null){window.clearTimeout(current.timer);current.timer=null}}
          if(current.moved)setPreview(values=>({...values,[id]:clamp(current.offset+dx/Math.max(4,pxPerSec),0,duration)}));
        }}
        onPointerUp={event=>{
          const current=drag.current;if(!current||current.pointerId!==event.pointerId)return;
          if(current.timer!=null)window.clearTimeout(current.timer);
          const next=preview[id]??current.offset;
          if(current.moved)store.dispatch({type:'moveClipKeyframe',clipId:clip.id,keyframeId:id,offsetSec:next});
          else if(active&&event.shiftKey)setSelected(items=>items.filter(item=>item!==id));
          setPreview(values=>{const copy={...values};delete copy[id];return copy});
          drag.current=null;
        }}
        onPointerCancel={()=>{const current=drag.current;if(current?.timer!=null)window.clearTimeout(current.timer);drag.current=null;setPreview(values=>{const copy={...values};delete copy[id];return copy})}}
        style={{
          position:'absolute',left:x,top:'50%',transform:'translate(-50%,-50%)',
          width:mode==='diamond'?11:10,height:mode==='diamond'?11:10,border:`2px solid ${INK}`,
          borderRadius:mode==='diamond'?2:99,background:active?CYAN:'#fff',
          padding:0,touchAction:'none',zIndex:4,
          ...(mode==='diamond'?{transform:'translate(-50%,-50%) rotate(45deg)'}:{}),
        }}
      />;
    })}
  </div>;
};

const miniBtn=(background:string):React.CSSProperties=>({
  width:17,height:17,borderRadius:3,border:`1.5px solid ${INK}`,
  background,fontSize:7,fontWeight:900,padding:0,display:'grid',placeItems:'center',...IOS_TOUCH_SAFE,
});

const ClipBlock:React.FC<{
  clip:VtE1Clip;selected:boolean;color:string;pxPerSec:number;store:EditorStore;
  siblings:VtE1Clip[];
  snap:{strength:SnapStrength;kinds:SnapKinds};
  readOnly?:boolean;
  focusParentId?:string;
  onOpenCompound?:(id:string)=>void;
  onContextMenu?:TimelineStripProps['onClipContextMenu'];
}>=({clip,selected,color,pxPerSec,store,siblings,snap,readOnly=false,focusParentId,onOpenCompound,onContextMenu})=>{
  const{dispatch}=store;
  const left=clip.start*pxPerSec;
  const width=Math.max(20,(clip.end-clip.start)*pxPerSec);
  const clipColor=String((clip as VtE1Clip&{uiColor?:string}).uiColor??color);
  const keyframes=((clip.keyframes??[]) as TimelineKeyframe[]).filter(keyframe=>Number.isFinite(Number(keyframe.offsetSec??0)));
  const duration=Math.max(.001,clip.end-clip.start);
  const hasOverlap=!readOnly&&siblings.some(other=>other.id!==clip.id&&overlaps(clip,other));
  const groupId=String((clip as VtE1Clip&{groupId?:unknown}).groupId??'');
  const isCompound=String((clip as VtE1Clip&{clipType?:unknown}).clipType??'')==='compound';
  const compoundCount=isCompound?compoundChildren(clip).length:0;
  const lastTap=useRef(0);
  const[gestureMode,setGestureMode]=useState<ClipGestureMode|null>(null);
  const gesture=useRef<{
    pointerId:number;mode:ClipGestureMode;startX:number;startY:number;
    startSec:number;endSec:number;timer:number|null;longPressFired:boolean;
    multiChanged:boolean;lastSelectedId?:string;
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
    if(readOnly){
      if(focusParentId)dispatch({type:'selectClip',id:focusParentId});
      return;
    }
    const now=event.timeStamp;
    if(isCompound&&now-lastTap.current<330){
      onOpenCompound?.(clip.id);
      lastTap.current=0;
      return;
    }
    lastTap.current=now;
    const rect=event.currentTarget.getBoundingClientRect();
    const localX=event.clientX-rect.left;
    const edge=Math.min(EDGE_TOUCH_PX,Math.max(13,rect.width*.3));
    const mode:ClipGestureMode=localX<=edge?'trim-left':localX>=rect.width-edge?'trim-right':'pending';
    const hadSelection=store.state.selection.clipIds.length>0;
    const alreadySelected=store.state.selection.clipIds.includes(clip.id);
    if(mode!=='pending'||!hadSelection||alreadySelected)dispatch({type:'selectClip',id:clip.id});
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const next={
      pointerId:event.pointerId,mode,startX:event.clientX,startY:event.clientY,
      startSec:clip.start,endSec:clip.end,timer:null as number|null,longPressFired:false,
      multiChanged:false,lastSelectedId:undefined as string|undefined,
    };
    if(mode==='pending'){
      next.timer=window.setTimeout(()=>{
        const active=gesture.current;
        if(!active||active.pointerId!==event.pointerId||active.mode!=='pending')return;
        active.mode='multi';
        active.longPressFired=true;
        setGestureMode('multi');
        const currentSelection=store.state.selection.clipIds;
        dispatch({type:'selectClip',id:clip.id,additive:currentSelection.length>0&&!currentSelection.includes(clip.id)});
        active.lastSelectedId=clip.id;
        if(typeof navigator!=='undefined'&&'vibrate' in navigator){
          (navigator as Navigator&{vibrate:(pattern:number|number[])=>boolean}).vibrate(15);
        }
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

    if(active.mode==='multi'){
      const element=document.elementFromPoint(event.clientX,event.clientY) as HTMLElement|null;
      const node=element?.closest?.('[data-vt-clip-id]') as HTMLElement|null;
      const id=node?.dataset.vtClipId;
      if(id&&id!==active.lastSelectedId&&store.state.project.clips.some(item=>item.id===id)){
        dispatch({type:'selectClip',id,additive:true});
        active.lastSelectedId=id;
        active.multiChanged=true;
      }
      return;
    }
    const targets:number[]=[];
    if(snap.kinds.edges)store.state.project.clips.forEach(item=>{if(item.id!==clip.id)targets.push(item.start,item.end)});
    if(snap.kinds.keyframes)store.state.project.clips.forEach(item=>(item.keyframes as TimelineKeyframe[]|undefined)?.forEach(k=>targets.push(item.start+Number(k.offsetSec??0))));
    if(snap.kinds.playhead)targets.push(store.state.playheadSec);
    if(snap.kinds.seconds)for(let sec=0;sec<=Math.ceil(store.state.project.durationSec);sec++)targets.push(sec);
    if(snap.kinds.transitions)(store.state.project.transitions??[]).forEach(transition=>{
      const left=store.state.project.clips.find(item=>item.id===transition.leftClipId);
      const right=store.state.project.clips.find(item=>item.id===transition.rightClipId);
      if(left)targets.push(left.end);
      if(right)targets.push(right.start);
    });
    if(active.mode==='move'){
      const desired=active.startSec+(dx/Math.max(4,pxPerSec));
      dispatch({type:'moveClipTo',id:clip.id,startSec:snapMoveStart(desired,duration,targets,snap.strength,pxPerSec)});
      return;
    }
    if(active.mode==='trim-left'){
      const desired=active.startSec+(dx/Math.max(4,pxPerSec));
      dispatch({type:'trimClip',id:clip.id,side:'left',sec:snapTime(desired,targets,snap.strength,pxPerSec)});
      return;
    }
    if(active.mode==='trim-right'){
      const desired=active.endSec+(dx/Math.max(4,pxPerSec));
      dispatch({type:'trimClip',id:clip.id,side:'right',sec:snapTime(desired,targets,snap.strength,pxPerSec)});
    }
  };

  const end=(event:React.PointerEvent<HTMLDivElement>)=>{
    const active=gesture.current;
    if(!active||active.pointerId!==event.pointerId)return;
    event.stopPropagation();
    if(active.mode==='pending'&&!active.longPressFired)dispatch({type:'selectClip',id:clip.id});
    if(active.mode==='multi'&&!active.multiChanged)onContextMenu?.(clip,{x:event.clientX,y:event.clientY});
    clearGesture();
  };

  const selectionShadow=selected?(store.state.selection.clipIds.length>1?`0 0 0 3px ${CYAN},0 0 0 5px #fff,3px 3px 0 rgba(36,139,153,.35)`:`0 0 0 2px #fff,3px 3px 0 ${CYAN}`):'2px 2px 0 rgba(0,0,0,.12)';

  return <div
    data-vt-clip-id={readOnly?undefined:clip.id}
    onPointerDown={begin}
    onPointerMove={move}
    onPointerUp={end}
    onPointerCancel={end}
    style={{
      position:'absolute',top:4,bottom:4,left,width,borderRadius:5,
      background:isCompound?`repeating-linear-gradient(135deg,${clipColor},${clipColor} 7px,#ffffff55 7px,#ffffff55 10px)`:clipColor,
      border:hasOverlap?`3px solid ${PINK}`:selected?'3px solid #111':`2px solid ${INK}`,
      boxShadow:selectionShadow,
      padding:'4px 8px',fontSize:9,fontWeight:900,overflow:'hidden',
      whiteSpace:'nowrap',touchAction:'none',userSelect:'none',WebkitUserSelect:'none',WebkitTouchCallout:'none',WebkitTapHighlightColor:'transparent',
    }}
  >
    {groupId?<div style={{position:'absolute',left:0,right:0,top:0,height:4,background:groupColor(groupId),borderBottom:'1px solid #fff',zIndex:3}}/>:null}
    <span style={{position:'relative',zIndex:1,pointerEvents:'none',display:'inline-flex',alignItems:'center',gap:3}}>{isCompound?<Layers3 size={10}/>:null}{String(clip.id).split('::').at(-1)?.slice(0,14)}{isCompound?<span style={{fontSize:7}}>×{compoundCount}</span>:null}</span>
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

    {!readOnly?<><TouchEdge side="left" active={gestureMode==='trim-left'}/><TouchEdge side="right" active={gestureMode==='trim-right'}/></>:null}
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

const NavigatorButton:React.FC<{direction:-1|1;onClick:()=>void;onLongPress:()=>void}>=({direction,onClick,onLongPress})=>{
  const timer=useRef<number|null>(null);
  const fired=useRef(false);
  const stop=()=>{if(timer.current!=null){window.clearTimeout(timer.current);timer.current=null}};
  return <button
    title={direction<0?'Previous edit point':'Next edit point'}
    aria-label={direction<0?'Previous edit point':'Next edit point'}
    onPointerDown={()=>{fired.current=false;stop();timer.current=window.setTimeout(()=>{fired.current=true;onLongPress()},420)}}
    onPointerUp={()=>{stop();if(!fired.current)onClick()}}
    onPointerCancel={stop}
    style={headerBtn('#fff')}
  >{direction<0?<SkipBack size={10}/>:<SkipForward size={10}/>}</button>;
};

const PlayheadControls:React.FC<{
  navMode:NavMode;
  onPrevious:()=>void;onCenter:()=>void;onNext:()=>void;
  onFrameBack:()=>void;onFrameForward:()=>void;onOpenNavigator:()=>void;
}>=({navMode,onPrevious,onCenter,onNext,onFrameBack,onFrameForward,onOpenNavigator})=><div
  aria-label="Timeline playhead navigation"
  style={{position:'absolute',top:3,left:4,zIndex:7,width:LABEL_WIDTH-8,display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:1,background:'#fff'}}
>
  <button title="Previous frame" aria-label="Previous frame" onClick={onFrameBack} style={headerBtn('#fff')}><StepBack size={9}/></button>
  <NavigatorButton direction={-1} onClick={onPrevious} onLongPress={onOpenNavigator}/>
  <button title={'Center playhead · '+navMode} aria-label="Center timeline on playhead" onClick={onCenter} onContextMenu={event=>{event.preventDefault();onOpenNavigator()}} style={headerBtn(YELLOW)}><LocateFixed size={9}/></button>
  <NavigatorButton direction={1} onClick={onNext} onLongPress={onOpenNavigator}/>
  <button title="Next frame" aria-label="Next frame" onClick={onFrameForward} style={headerBtn('#fff')}><StepForward size={9}/></button>
</div>;

const NavigatorPicker:React.FC<{mode:NavMode;onChange:(mode:NavMode)=>void}>=({mode,onChange})=><div style={{
  position:'absolute',top:26,left:4,zIndex:30,padding:3,display:'grid',gridTemplateColumns:'repeat(5,auto)',gap:2,
  border:`2px solid ${INK}`,borderRadius:5,background:'#fff',boxShadow:'2px 2px 0 rgba(54,224,246,.3)',
}}>
  {(['all','clip','keyframe','transition','frame'] as NavMode[]).map(item=><button key={item} onClick={()=>onChange(item)} style={{...headerBtn(mode===item?CYAN:'#fff'),padding:'0 5px',fontSize:7,textTransform:'uppercase'}}>{item}</button>)}
</div>;

const SnapPicker:React.FC<{
  snap:{strength:SnapStrength;kinds:SnapKinds};
  onChange:(value:{strength:SnapStrength;kinds:SnapKinds})=>void;
  onClose:()=>void;
}>=({snap,onChange,onClose})=><div style={{
  position:'absolute',top:26,right:4,zIndex:30,padding:5,width:178,
  border:`2px solid ${INK}`,borderRadius:6,background:'#fff',boxShadow:'2px 2px 0 rgba(54,224,246,.3)',
}}>
  <div style={{display:'grid',gridTemplateColumns:'1fr 22px',alignItems:'center',marginBottom:4}}>
    <b style={{fontSize:8,textTransform:'uppercase'}}>Magnetic Snap</b>
    <button aria-label="Close snap settings" onClick={onClose} style={headerBtn('#fff')}><X size={10}/></button>
  </div>
  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:2,marginBottom:4}}>
    {(['off','soft','strong'] as SnapStrength[]).map(value=><button key={value} onClick={()=>onChange({...snap,strength:value})} style={{...headerBtn(snap.strength===value?CYAN:'#fff'),fontSize:7,textTransform:'uppercase'}}>{value}</button>)}
  </div>
  <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:2}}>
    {(Object.keys(snap.kinds) as Array<keyof SnapKinds>).map(key=><button key={key} onClick={()=>onChange({...snap,kinds:{...snap.kinds,[key]:!snap.kinds[key]}})} style={{...headerBtn(snap.kinds[key]?YELLOW:'#fff'),fontSize:7,textTransform:'uppercase'}}>{key}</button>)}
  </div>
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
