/** PreviewPane — video canvas, template compositions, and scrub overlay. */
import React,{useRef} from 'react';
import {EditorStore} from '../state/editorState';
import {useDragScrub,usePinchZoom} from '../hooks/gestures';
import {TemplateCanvasRenderer} from '../../../../editor-design-library/integration/TemplateCanvasRenderer';

export interface PreviewPaneProps{store:EditorStore;renderPreview?:(info:{widthPx:number;heightPx:number})=>React.ReactNode;aspect?:number;className?:string;showScrubHint?:boolean}
export const PreviewPane:React.FC<PreviewPaneProps>=({store,renderPreview,aspect=16/9,className,showScrubHint=true})=>{
 const{state,dispatch}=store;const surfaceRef=useRef<HTMLDivElement>(null);
 const scrub=useDragScrub({pixelsPerUnit:6,cancelIfVertical:24,onScrubStart:()=>dispatch({type:'setPlaying',playing:false}),onScrub:(deltaFrames)=>dispatch({type:'setPlayhead',sec:state.playheadSec+deltaFrames/30*.02})});
 const{pinch,handlers:pinchHandlers}=usePinchZoom({onPinch:()=>{}});const tapStart=useRef<{x:number;y:number;t:number}|null>(null);
 return <div className={className} style={{position:'relative',width:'100%',height:'100%',background:'#000',overflow:'hidden',borderRadius:12,minHeight:140}} data-aspect={aspect}>
  <div ref={surfaceRef} onPointerDown={ev=>{tapStart.current={x:ev.clientX,y:ev.clientY,t:ev.timeStamp};pinchHandlers.onPointerDown(ev);scrub.onPointerDown(ev)}} onPointerMove={ev=>{pinchHandlers.onPointerMove(ev);scrub.onPointerMove(ev)}} onPointerUp={ev=>{pinchHandlers.onPointerUp(ev);scrub.onPointerUp(ev);if(tapStart.current){const dx=Math.abs(ev.clientX-tapStart.current.x),dy=Math.abs(ev.clientY-tapStart.current.y),dt=ev.timeStamp-tapStart.current.t;if(dx<8&&dy<8&&dt<250)dispatch({type:'togglePlaying'});tapStart.current=null}} onPointerCancel={ev=>{pinchHandlers.onPointerCancel(ev);scrub.onPointerCancel(ev);tapStart.current=null}} style={{position:'absolute',inset:0,background:'#111',touchAction:'none',userSelect:'none',transform:pinch.active?`scale(${pinch.scale})`:undefined,transformOrigin:'center',transition:pinch.active?'none':'transform 200ms ease',display:'grid',placeItems:'center'}}>
   {renderPreview?renderPreview({widthPx:0,heightPx:0}):<FallbackPreview state={state}/>} 
   <TemplateCanvasRenderer clips={state.project.clips} playheadSec={state.playheadSec}/>
  </div>
  <div style={{position:'absolute',top:8,left:12,padding:'4px 8px',borderRadius:6,background:'rgba(0,0,0,.55)',color:'#fff',fontSize:12,fontVariantNumeric:'tabular-nums',fontWeight:600,pointerEvents:'none'}}>{formatTime(state.playheadSec)} / {formatTime(state.project.durationSec)}</div>
  {!state.playing&&<div style={{position:'absolute',width:68,height:68,borderRadius:34,background:'rgba(0,0,0,.5)',display:'grid',placeItems:'center',color:'#fff',pointerEvents:'none',opacity:.7}}><PlayIcon size={28}/></div>}
  {showScrubHint&&state.playheadSec===0&&!state.playing&&<div style={{position:'absolute',bottom:10,left:'50%',transform:'translateX(-50%)',padding:'4px 10px',borderRadius:999,background:'rgba(0,0,0,.5)',color:'#fff',fontSize:11,fontWeight:600,pointerEvents:'none'}}>Tap to play · drag to scrub · pinch to zoom</div>}
 </div>;
};
function formatTime(sec:number){const s=Math.max(0,sec),mm=Math.floor(s/60).toString().padStart(2,'0'),ss=Math.floor(s%60).toString().padStart(2,'0'),cs=Math.floor((s*100)%100).toString().padStart(2,'0');return`${mm}:${ss}.${cs}`}
const FallbackPreview:React.FC<{state:EditorStore['state']}>=({state})=>{const clip=state.project.clips.find(c=>state.playheadSec>=c.start&&state.playheadSec<c.end);return <div style={{position:'absolute',inset:0,display:'grid',placeItems:'center',color:'#e2e8f0'}}><div style={{textAlign:'center',opacity:.6}}><div style={{fontSize:12,letterSpacing:2,textTransform:'uppercase'}}>Preview</div><div style={{fontSize:28,fontWeight:700,marginTop:6}}>{clip?String(clip.id).slice(0,20):'No clip'}</div></div></div>};
const PlayIcon:React.FC<{size:number}>=({size})=><svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>;
