/** Fluid mobile preview with selection-aware direct manipulation and one transport surface. */
import React,{useEffect,useMemo,useRef,useState} from 'react';
import {FastForward,Pause,Play,Rewind,RotateCcw} from 'lucide-react';
import {type ClipVisualTransform,type EditorStore,readClipVisualTransform} from '../state/editorState';
import {useDragScrub,usePinchZoom} from '../hooks/gestures';
import {TemplateCanvasRenderer} from '../../../../editor-design-library/integration/TemplateCanvasRenderer';
import {MobileProjectPreview} from './MobileProjectPreview';
import {resolveClipPreviewGeometry} from './mobilePreviewGeometry';
import {expandCompoundClips} from '../../../../shared/vtE1CompoundClips.js';

export interface PreviewPaneProps{
  store:EditorStore;
  renderPreview?:(info:{widthPx:number;heightPx:number})=>React.ReactNode;
  aspect?:number;
  className?:string;
  showScrubHint?:boolean;
}

export const PREVIEW_TRANSPORT_HEIGHT=36;
const CYAN='#36E0F6',INK='#248b99',YELLOW='#FFFF61';

const transportButton=(active=false):React.CSSProperties=>({
  height:28,minWidth:38,border:`2px solid ${INK}`,borderRadius:5,
  background:active?CYAN:'#fff',color:'#111',fontSize:11,fontWeight:1000,
  padding:'0 8px',display:'grid',placeItems:'center',touchAction:'manipulation',
  boxShadow:'2px 2px 0 rgba(36,139,153,.18)',
});

export const PreviewPane:React.FC<PreviewPaneProps>=({
  store,renderPreview,aspect=16/9,className,showScrubHint=true,
})=>{
  const{state,dispatch}=store;
  const selected=store.selectedClips[0];
  const selectedLayer=store.selectedLayer;
  const surfaceRef=useRef<HTMLDivElement>(null);
  const [size,setSize]=useState({widthPx:0,heightPx:0});
  const dragRef=useRef<{
    clientX:number;clientY:number;
    layerX:number;layerY:number;
    clipX:number;clipY:number;
  }|null>(null);
  const rotateRef=useRef<{angle:number;layerRotation:number;clipRotation:number}|null>(null);
  const snapBackRef=useRef(0);
  const[motionPreview,setMotionPreview]=useState<Record<string,{x:number;y:number}>>({});
  const motionDragRef=useRef<{id:string;pointerId:number;clientX:number;clientY:number;x:number;y:number}|null>(null);

  useEffect(()=>{
    const node=surfaceRef.current;
    if(!node)return;
    const measure=()=>setSize({widthPx:node.clientWidth,heightPx:node.clientHeight});
    measure();
    const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(measure):null;
    observer?.observe(node);
    return()=>observer?.disconnect();
  },[]);

  const visual=selected?readClipVisualTransform(selected):null;
  const geometry=useMemo(
    ()=>selected?resolveClipPreviewGeometry(store,selected):null,
    [selected,selectedLayer?.payload,state.playheadSec,state.project,state.selection.clipIds],
  );

  const motionPoints=useMemo(()=>{
    if(!selected||!geometry)return[];
    const baseX=Number(selectedLayer?.payload?.x??visual?.x??0);
    const baseY=Number(selectedLayer?.payload?.y??visual?.y??0);
    return(selected.keyframes??[])
      .filter(keyframe=>keyframe.id&&keyframe.values&&(
        Object.prototype.hasOwnProperty.call(keyframe.values,'x')
        ||Object.prototype.hasOwnProperty.call(keyframe.values,'y')
      ))
      .map(keyframe=>{
        const id=String(keyframe.id);
        const preview=motionPreview[id];
        const x=preview?.x??Number(keyframe.values?.x??baseX);
        const y=preview?.y??Number(keyframe.values?.y??baseY);
        return{id,x,y,offsetSec:Number(keyframe.offsetSec??0)};
      })
      .sort((a,b)=>a.offsetSec-b.offsetSec);
  },[selected,geometry,selectedLayer?.payload,visual?.x,visual?.y,motionPreview]);

  const updateLayer=(patch:Record<string,unknown>)=>{
    if(selectedLayer)dispatch({type:'updateLayerPayload',id:selectedLayer.id,patch});
  };
  const updateClip=(patch:Partial<ClipVisualTransform>)=>{
    if(selected)dispatch({type:'updateClipTransform',id:selected.id,patch});
  };

  const scrub=useDragScrub({
    pixelsPerUnit:6,
    cancelIfVertical:24,
    onScrubStart:()=>dispatch({type:'setPlaying',playing:false}),
    onScrub:d=>dispatch({type:'setPlayhead',sec:state.playheadSec+(d/30)*.02}),
  });

  const{handlers}=usePinchZoom({
    onPinch:({delta})=>{
      if(!selected||!visual||!geometry)return;
      if(selectedLayer){
        const layerScale=geometry.scaleX/Math.max(.0001,visual.scaleX);
        updateLayer({scale:Math.max(.01,layerScale*delta)});
      }else{
        updateClip({scaleX:visual.scaleX*delta,scaleY:visual.scaleY*delta});
      }
    },
  });

  const frameStyle:React.CSSProperties|undefined=geometry?{
    position:'absolute',
    left:`${50+(geometry.x/geometry.projectWidth)*100}%`,
    top:`${50+(geometry.y/geometry.projectHeight)*100}%`,
    width:`${(geometry.width/geometry.projectWidth)*100}%`,
    height:`${(geometry.height/geometry.projectHeight)*100}%`,
    transform:`translate(-50%,-50%) scale(${geometry.scaleX},${geometry.scaleY}) rotate(${geometry.rotation}deg)`,
    transformOrigin:'center',
    border:`2px solid ${CYAN}`,
    boxShadow:'0 0 0 1px #000',
    touchAction:'none',
    pointerEvents:'auto',
    boxSizing:'border-box',
  }:undefined;

  const togglePlay=()=>{
    if(!state.playing)snapBackRef.current=state.playheadSec;
    dispatch({type:'togglePlaying'});
  };
  const seekBy=(delta:number)=>dispatch({
    type:'setPlayhead',
    sec:Math.max(0,Math.min(state.project.durationSec,state.playheadSec+delta)),
  });
  const snapBack=()=>{
    dispatch({type:'setPlaying',playing:false});
    dispatch({type:'setPlayhead',sec:Math.max(0,Math.min(state.project.durationSec,snapBackRef.current))});
  };

  return <div
    className={className}
    data-aspect={aspect}
    style={{
      position:'relative',width:'100%',height:'100%',minWidth:0,minHeight:0,
      background:'#fff',overflow:'hidden',borderRadius:6,
      display:'grid',gridTemplateRows:`minmax(0,1fr) ${PREVIEW_TRANSPORT_HEIGHT}px`,
    }}
  >
    <div
      ref={surfaceRef}
      onPointerDown={e=>{handlers.onPointerDown(e);scrub.onPointerDown(e)}}
      onPointerMove={e=>{handlers.onPointerMove(e);scrub.onPointerMove(e)}}
      onPointerUp={e=>{handlers.onPointerUp(e);scrub.onPointerUp(e)}}
      onPointerCancel={e=>{handlers.onPointerCancel(e);scrub.onPointerCancel(e)}}
      style={{
        position:'relative',width:'100%',height:'100%',minWidth:0,minHeight:0,
        background:'#111',touchAction:'none',userSelect:'none',
        display:'grid',placeItems:'center',overflow:'hidden',
      }}
    >
      {renderPreview?renderPreview(size):<MobileProjectPreview store={store}/>}
      <TemplateCanvasRenderer clips={expandCompoundClips(state.project.clips)} playheadSec={state.playheadSec}/>

      {geometry&&motionPoints.length>1?<svg
        aria-label="Motion path"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{position:'absolute',inset:0,width:'100%',height:'100%',zIndex:12,pointerEvents:'none',overflow:'visible'}}
      >
        <polyline
          points={motionPoints.map(point=>`${50+(point.x/geometry.projectWidth)*100},${50+(point.y/geometry.projectHeight)*100}`).join(' ')}
          fill="none"
          stroke={CYAN}
          strokeWidth="0.7"
          strokeDasharray="2 1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>:null}
      {geometry?motionPoints.map((point,index)=>{
        const left=50+(point.x/geometry.projectWidth)*100;
        const top=50+(point.y/geometry.projectHeight)*100;
        return <button
          key={point.id}
          title={`Motion keyframe ${index+1}`}
          aria-label={`Drag motion keyframe ${index+1}`}
          onPointerDown={event=>{
            event.stopPropagation();event.currentTarget.setPointerCapture?.(event.pointerId);
            motionDragRef.current={id:point.id,pointerId:event.pointerId,clientX:event.clientX,clientY:event.clientY,x:point.x,y:point.y};
          }}
          onPointerMove={event=>{
            const active=motionDragRef.current;if(!active||active.id!==point.id||active.pointerId!==event.pointerId)return;
            event.stopPropagation();
            const x=active.x+((event.clientX-active.clientX)/Math.max(1,size.widthPx))*geometry.projectWidth;
            const y=active.y+((event.clientY-active.clientY)/Math.max(1,size.heightPx))*geometry.projectHeight;
            setMotionPreview(current=>({...current,[point.id]:{x,y}}));
          }}
          onPointerUp={event=>{
            const active=motionDragRef.current;if(!active||active.id!==point.id)return;
            event.stopPropagation();
            const final=motionPreview[point.id]??{x:point.x,y:point.y};
            if(selected)dispatch({type:'updateClipKeyframeValues',clipId:selected.id,keyframeId:point.id,patch:{x:final.x,y:final.y}});
            setMotionPreview(current=>{const next={...current};delete next[point.id];return next});
            motionDragRef.current=null;
          }}
          onPointerCancel={()=>{setMotionPreview(current=>{const next={...current};delete next[point.id];return next});motionDragRef.current=null}}
          style={{
            position:'absolute',left:`${left}%`,top:`${top}%`,zIndex:18,
            width:14,height:14,transform:'translate(-50%,-50%) rotate(45deg)',
            border:`2px solid ${INK}`,borderRadius:2,background:index===0?YELLOW:CYAN,
            padding:0,touchAction:'none',boxShadow:'0 0 0 2px rgba(255,255,255,.8)',
          }}
        />;
      }):null}

      {selected&&visual&&geometry&&frameStyle?<div
        aria-label="Selected clip transform"
        onPointerDown={e=>{
          e.stopPropagation();
          e.currentTarget.setPointerCapture(e.pointerId);
          dragRef.current={
            clientX:e.clientX,
            clientY:e.clientY,
            layerX:geometry.x-visual.x,
            layerY:geometry.y-visual.y,
            clipX:visual.x,
            clipY:visual.y,
          };
        }}
        onPointerMove={e=>{
          const drag=dragRef.current;
          if(!drag)return;
          e.stopPropagation();
          const dxProject=(e.clientX-drag.clientX)/Math.max(1,size.widthPx)*geometry.projectWidth;
          const dyProject=(e.clientY-drag.clientY)/Math.max(1,size.heightPx)*geometry.projectHeight;
          if(selectedLayer)updateLayer({x:drag.layerX+dxProject,y:drag.layerY+dyProject});
          else updateClip({x:drag.clipX+dxProject,y:drag.clipY+dyProject});
        }}
        onPointerUp={e=>{e.stopPropagation();dragRef.current=null}}
        onPointerCancel={e=>{e.stopPropagation();dragRef.current=null}}
        style={frameStyle}
      >
        <Handle pos="nw"/><Handle pos="ne"/><Handle pos="sw"/><Handle pos="se"/>
        <div
          aria-label="Rotate selected clip"
          onPointerDown={e=>{
            e.stopPropagation();
            const rect=(e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
            const cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
            rotateRef.current={
              angle:Math.atan2(e.clientY-cy,e.clientX-cx)*180/Math.PI,
              layerRotation:geometry.rotation-visual.rotation,
              clipRotation:visual.rotation,
            };
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={e=>{
            const rotation=rotateRef.current;
            if(!rotation)return;
            e.stopPropagation();
            const rect=(e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
            const angle=Math.atan2(
              e.clientY-(rect.top+rect.height/2),
              e.clientX-(rect.left+rect.width/2),
            )*180/Math.PI;
            const delta=angle-rotation.angle;
            if(selectedLayer)updateLayer({rotation:rotation.layerRotation+delta});
            else updateClip({rotation:rotation.clipRotation+delta});
          }}
          onPointerUp={e=>{e.stopPropagation();rotateRef.current=null}}
          onPointerCancel={e=>{e.stopPropagation();rotateRef.current=null}}
          style={{
            position:'absolute',left:'50%',top:-25,transform:'translateX(-50%)',
            width:16,height:16,borderRadius:8,border:'2px solid #000',
            background:YELLOW,touchAction:'none',
          }}
        />
      </div>:null}

      <div style={{
        position:'absolute',top:5,left:6,padding:'2px 5px',borderRadius:4,
        background:'rgba(0,0,0,.6)',color:'#fff',fontSize:8,fontWeight:800,pointerEvents:'none',
      }}>{formatTime(state.playheadSec)} / {formatTime(state.project.durationSec)}</div>

      {showScrubHint&&state.playheadSec===0&&!state.playing?<div style={{
        position:'absolute',bottom:5,left:'50%',transform:'translateX(-50%)',
        padding:'2px 6px',borderRadius:999,background:'rgba(0,0,0,.55)',
        color:'#fff',fontSize:8,fontWeight:700,pointerEvents:'none',whiteSpace:'nowrap',
      }}>Scrub · pinch · drag</div>:null}
    </div>

    <div
      aria-label="Preview transport"
      style={{
        width:'100%',height:PREVIEW_TRANSPORT_HEIGHT,minWidth:0,
        display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',
        gap:3,padding:3,boxSizing:'border-box',
        background:'#fff',borderTop:`2px solid ${INK}`,
      }}
    >
      <button style={transportButton()} onClick={()=>seekBy(-1)} aria-label="Rewind one second" title="Rewind 1 second"><Rewind size={15}/></button>
      <button style={transportButton(state.playing)} onClick={togglePlay} aria-label={state.playing?'Pause':'Play'} title={state.playing?'Pause':'Play'}>{state.playing?<Pause size={15}/>:<Play size={15}/>}</button>
      <button style={transportButton()} onClick={()=>seekBy(1)} aria-label="Fast forward one second" title="Fast forward 1 second"><FastForward size={15}/></button>
      <button style={{...transportButton(),background:YELLOW}} onClick={snapBack} aria-label="Snap back to playback start" title="Snap back to playback start"><RotateCcw size={15}/></button>
    </div>
  </div>;
};

const Handle=({pos}:{pos:'nw'|'ne'|'sw'|'se'})=><div style={{
  position:'absolute',width:10,height:10,background:'#fff',border:`2px solid ${INK}`,
  borderRadius:2,left:pos.endsWith('w')?-6:undefined,right:pos.endsWith('e')?-6:undefined,
  top:pos.startsWith('n')?-6:undefined,bottom:pos.startsWith('s')?-6:undefined,
  pointerEvents:'none',
}}/>;

function formatTime(sec:number){
  const s=Math.max(0,sec);
  return`${Math.floor(s/60).toString().padStart(2,'0')}:${Math.floor(s%60).toString().padStart(2,'0')}.${Math.floor((s*100)%100).toString().padStart(2,'0')}`;
}
