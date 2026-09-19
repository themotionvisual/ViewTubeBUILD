/** Phone timeline with playhead navigation, scroll, track controls, clip move/trim and contextual selection. */
import React,{useCallback,useEffect,useMemo,useRef} from 'react';
import type {EditorStore} from '../state/editorState';
import {useDragScrub,useLongPress,usePinchZoom} from '../hooks/gestures';
import type {VtE1Clip} from '../../../../shared/vtE1TimelineContract';

export interface TimelineViewport{startSec:number;endSec:number}
export interface TimelineStripProps{
  store:EditorStore;
  height?:React.CSSProperties['height'];
  onClipContextMenu?:(clip:VtE1Clip,at:{x:number;y:number})=>void;
  onEmptyContextMenu?:(at:{x:number;y:number})=>void;
  onViewportChange?:(viewport:TimelineViewport)=>void;
  scrollToSec?:number;
}

const TRACK_HEIGHT=44;
const HEADER_HEIGHT=28;
const LABEL_WIDTH=82;
const CYAN='#36E0F6';
const INK='#248b99';
const YELLOW='#FFFF61';

export const TimelineStrip:React.FC<TimelineStripProps>=({
  store,height,onClipContextMenu,onEmptyContextMenu,onViewportChange,scrollToSec,
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
    const target=Math.max(0,playX-(el.clientWidth/2));
    el.scrollTo({left:target,behavior});
    requestAnimationFrame(reportViewport);
  },[reportViewport,state.playheadSec,zoom]);

  const editPoints=useMemo(()=>{
    const points=new Set<number>([0,state.project.durationSec]);
    state.project.clips.forEach(clip=>{points.add(clip.start);points.add(clip.end)});
    return [...points].filter(Number.isFinite).sort((a,b)=>a-b);
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

  const pinch=usePinchZoom({
    onPinch:({delta})=>dispatch({type:'setZoom',pxPerSec:zoom*delta}),
  });

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
  const bodyHeight=tracks.length*TRACK_HEIGHT+HEADER_HEIGHT+8;

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
        <div style={{position:'relative',paddingTop:HEADER_HEIGHT}}>
          {tracks.map((track,index)=><TrackRow
            key={track.id}
            track={track}
            store={store}
            clips={clipsOnTrack(track.id)}
            pxPerSec={zoom}
            totalPx={totalPx}
            y={index*TRACK_HEIGHT}
            onClipContextMenu={onClipContextMenu}
            onEmptyContextMenu={onEmptyContextMenu}
          />)}
        </div>
        <Playhead playheadSec={state.playheadSec} pxPerSec={zoom} height={bodyHeight-HEADER_HEIGHT}/>
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
      position:'sticky',top:0,height:HEADER_HEIGHT,background:'#fff',zIndex:2,
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
  return <div style={{position:'absolute',top:y,left:0,right:0,height:TRACK_HEIGHT,display:'flex'}}>
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
      <div style={{display:'flex',gap:2}}>
        <button onClick={event=>{event.stopPropagation();dispatch({type:'muteTrack',id:track.id})}} style={miniBtn(track.muted?'#FA618A':'#fff')}>M</button>
        <button onClick={event=>{event.stopPropagation();dispatch({type:'lockTrack',id:track.id})}} style={miniBtn(track.locked?'#FFDA47':'#fff')}>L</button>
        <button onClick={event=>{event.stopPropagation();dispatch({type:'hideTrack',id:track.id})}} style={miniBtn('#fff')}>H</button>
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
        onContextMenu={onClipContextMenu}
      />)}
    </div>
  </div>;
};

const miniBtn=(background:string):React.CSSProperties=>({
  width:17,height:17,borderRadius:3,border:`1.5px solid ${INK}`,
  background,fontSize:7,fontWeight:900,padding:0,
});

const ClipBlock:React.FC<{
  clip:VtE1Clip;selected:boolean;color:string;pxPerSec:number;store:EditorStore;
  onContextMenu?:TimelineStripProps['onClipContextMenu'];
}>=({clip,selected,color,pxPerSec,store,onContextMenu})=>{
  const{dispatch}=store;
  const left=clip.start*pxPerSec;
  const width=Math.max(20,(clip.end-clip.start)*pxPerSec);
  const scrubbing=useRef(false);
  const drag=useDragScrub({
    pixelsPerUnit:pxPerSec,cancelIfVertical:16,guard:()=>scrubbing.current,
    onScrubStart:()=>{scrubbing.current=true},
    onScrub:deltaSec=>dispatch({type:'moveClip',id:clip.id,deltaSec}),
    onScrubEnd:()=>{scrubbing.current=false},
  });
  const longPress=useLongPress({
    onLongPress:({x,y})=>{
      dispatch({type:'selectClip',id:clip.id});
      onContextMenu?.(clip,{x,y});
    },
  });
  return <div
    onClick={event=>{event.stopPropagation();dispatch({type:'selectClip',id:clip.id})}}
    onPointerDown={event=>{longPress.onPointerDown(event);drag.onPointerDown(event)}}
    onPointerMove={event=>{longPress.onPointerMove(event);drag.onPointerMove(event)}}
    onPointerUp={event=>{longPress.onPointerUp(event);drag.onPointerUp(event)}}
    onPointerCancel={event=>{longPress.onPointerCancel(event);drag.onPointerCancel(event)}}
    onPointerLeave={longPress.onPointerLeave}
    style={{
      position:'absolute',top:4,bottom:4,left,width,borderRadius:5,background:color,
      border:selected?'3px solid #000':`2px solid ${INK}`,
      boxShadow:selected?`0 0 0 2px #fff,3px 3px 0 ${CYAN}`:'2px 2px 0 rgba(0,0,0,.12)',
      padding:'4px 8px',fontSize:9,fontWeight:900,overflow:'hidden',
      whiteSpace:'nowrap',touchAction:'none',userSelect:'none',
    }}
  >
    {String(clip.id).slice(0,18)}
    <TrimHandle side="left" clip={clip} store={store} pxPerSec={pxPerSec}/>
    <TrimHandle side="right" clip={clip} store={store} pxPerSec={pxPerSec}/>
  </div>;
};

const TrimHandle:React.FC<{
  side:'left'|'right';clip:VtE1Clip;store:EditorStore;pxPerSec:number;
}>=({side,clip,store,pxPerSec})=>{
  const drag=useDragScrub({
    pixelsPerUnit:pxPerSec,cancelIfVertical:20,
    onScrub:delta=>store.dispatch({
      type:'trimClip',id:clip.id,side,
      sec:(side==='left'?clip.start:clip.end)+delta*.02,
    }),
  });
  return <div {...drag} onClick={event=>event.stopPropagation()} style={{
    position:'absolute',top:0,bottom:0,[side]:0,width:16,touchAction:'none',
  }}>
    <div style={{
      position:'absolute',top:'50%',[side]:3,transform:'translateY(-50%)',
      width:4,height:16,borderRadius:1,background:'#000',
    }}/>
  </div>;
};

const Playhead:React.FC<{playheadSec:number;pxPerSec:number;height:number}>=({
  playheadSec,pxPerSec,height,
})=><div style={{
  position:'absolute',left:playheadSec*pxPerSec+LABEL_WIDTH,
  top:HEADER_HEIGHT-6,height:height+12,width:2,background:'#000',pointerEvents:'none',
}}>
  <div style={{
    position:'absolute',top:-6,left:-5,width:12,height:12,
    background:CYAN,border:'2px solid #000',transform:'rotate(45deg)',
  }}/>
</div>;

const PlayheadControls:React.FC<{
  onPrevious:()=>void;onCenter:()=>void;onNext:()=>void;
}>=({onPrevious,onCenter,onNext})=><div
  aria-label="Timeline playhead navigation"
  style={{
    position:'absolute',top:3,left:4,zIndex:4,width:LABEL_WIDTH-8,
    display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:2,
    background:'#fff',
  }}
>
  <button title="Previous edit point" aria-label="Previous edit point" onClick={onPrevious} style={headerBtn('#fff')}>‹</button>
  <button title="Center timeline on playhead" aria-label="Center timeline on playhead" onClick={onCenter} style={headerBtn(YELLOW)}>◎</button>
  <button title="Next edit point" aria-label="Next edit point" onClick={onNext} style={headerBtn('#fff')}>›</button>
</div>;

const ZoomControls:React.FC<{pxPerSec:number;onZoom:(value:number)=>void}>=({
  pxPerSec,onZoom,
})=><div style={{
  position:'absolute',top:3,right:4,zIndex:4,display:'flex',gap:2,
  background:'#fff',border:`2px solid ${INK}`,borderRadius:5,padding:1,
}}>
  <button onClick={()=>onZoom(pxPerSec/1.4)} style={miniBtn('#fff')}>−</button>
  <div style={{fontSize:8,alignSelf:'center',minWidth:34,textAlign:'center',fontWeight:900}}>{Math.round(pxPerSec)}px/s</div>
  <button onClick={()=>onZoom(pxPerSec*1.4)} style={miniBtn(CYAN)}>+</button>
</div>;

const headerBtn=(background:string):React.CSSProperties=>({
  height:20,minWidth:0,border:`1.5px solid ${INK}`,borderRadius:4,
  background,color:'#111',fontSize:13,fontWeight:1000,padding:0,lineHeight:1,
});
