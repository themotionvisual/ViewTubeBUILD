/** Fluid mobile preview with selection-aware direct manipulation. */
import React,{useEffect,useMemo,useRef,useState} from 'react';
import {type EditorStore,readClipVisualTransform} from '../state/editorState';
import {useDragScrub,usePinchZoom} from '../hooks/gestures';
import {TemplateCanvasRenderer} from '../../../../editor-design-library/integration/TemplateCanvasRenderer';
import {MobileProjectPreview} from './MobileProjectPreview';
import {resolveClipPreviewGeometry} from './mobilePreviewGeometry';

export interface PreviewPaneProps{
  store:EditorStore;
  renderPreview?:(info:{widthPx:number;heightPx:number})=>React.ReactNode;
  aspect?:number;
  className?:string;
  showScrubHint?:boolean;
}

const CYAN='#36E0F6',INK='#248b99';

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
  const tapStart=useRef<{x:number;y:number;t:number}|null>(null);

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

  const updateLayer=(patch:Record<string,unknown>)=>{
    if(selectedLayer)dispatch({type:'updateLayerPayload',id:selectedLayer.id,patch});
  };
  const updateClip=(patch:Parameters<typeof dispatch>[0] extends never?never:any)=>{
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
        updateClip({
          scaleX:visual.scaleX*delta,
          scaleY:visual.scaleY*delta,
        });
      }
    },
  });

  const small:React.CSSProperties={
    height:24,minWidth:28,border:'2px solid #000',borderRadius:4,
    background:'#fff',fontSize:8,fontWeight:900,padding:'0 5px',
  };

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

  return <div
    className={className}
    data-aspect={aspect}
    style={{
      position:'relative',width:'100%',height:'100%',minWidth:0,minHeight:0,
      background:'#000',overflow:'hidden',borderRadius:6,
    }}
  >
    <div
      ref={surfaceRef}
      onPointerDown={e=>{
        tapStart.current={x:e.clientX,y:e.clientY,t:e.timeStamp};
        handlers.onPointerDown(e);
        scrub.onPointerDown(e);
      }}
      onPointerMove={e=>{handlers.onPointerMove(e);scrub.onPointerMove(e)}}
      onPointerUp={e=>{
        handlers.onPointerUp(e);
        scrub.onPointerUp(e);
        if(
          tapStart.current
          &&Math.abs(e.clientX-tapStart.current.x)<8
          &&Math.abs(e.clientY-tapStart.current.y)<8
          &&e.timeStamp-tapStart.current.t<250
        )dispatch({type:'togglePlaying'});
        tapStart.current=null;
      }}
      onPointerCancel={e=>{
        handlers.onPointerCancel(e);
        scrub.onPointerCancel(e);
        tapStart.current=null;
      }}
      style={{
        position:'absolute',inset:0,background:'#111',touchAction:'none',
        userSelect:'none',display:'grid',placeItems:'center',
      }}
    >
      {renderPreview?renderPreview(size):<MobileProjectPreview store={store}/>}
      <TemplateCanvasRenderer clips={state.project.clips} playheadSec={state.playheadSec}/>
    </div>

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
        if(selectedLayer){
          updateLayer({x:drag.layerX+dxProject,y:drag.layerY+dyProject});
        }else{
          updateClip({x:drag.clipX+dxProject,y:drag.clipY+dyProject});
        }
      }}
      onPointerUp={e=>{e.stopPropagation();dragRef.current=null}}
      onPointerCancel={e=>{e.stopPropagation();dragRef.current=null}}
      style={frameStyle}
    >
      <Handle pos="nw"/>
      <Handle pos="ne"/>
      <Handle pos="sw"/>
      <Handle pos="se"/>
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
          background:'#FFFF61',touchAction:'none',
        }}
      />
    </div>:null}

    <div style={{
      position:'absolute',top:5,left:6,padding:'2px 5px',borderRadius:4,
      background:'rgba(0,0,0,.6)',color:'#fff',fontSize:8,fontWeight:800,pointerEvents:'none',
    }}>{formatTime(state.playheadSec)} / {formatTime(state.project.durationSec)}</div>

    {selected?<div style={{position:'absolute',top:5,right:5,display:'flex',gap:3}}>
      <button style={{...small,background:CYAN}} onClick={e=>{e.stopPropagation();dispatch({type:'splitClipAtPlayhead',id:selected.id})}}>SPLIT</button>
      <button style={small} onClick={e=>{e.stopPropagation();dispatch({type:'resetClipTransform',id:selected.id})}}>RESET</button>
      <button style={{...small,background:'#FA618A'}} onClick={e=>{e.stopPropagation();dispatch({type:'deleteClips',ids:[selected.id]})}}>DEL</button>
    </div>:null}

    {!state.playing?<div style={{
      position:'absolute',width:42,height:42,borderRadius:21,background:'rgba(0,0,0,.5)',
      display:'grid',placeItems:'center',color:'#fff',pointerEvents:'none',opacity:.75,
    }}>▶</div>:null}

    {showScrubHint&&state.playheadSec===0&&!state.playing?<div style={{
      position:'absolute',bottom:5,left:'50%',transform:'translateX(-50%)',
      padding:'2px 6px',borderRadius:999,background:'rgba(0,0,0,.55)',
      color:'#fff',fontSize:8,fontWeight:700,pointerEvents:'none',whiteSpace:'nowrap',
    }}>Tap · scrub · pinch · drag</div>:null}
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
