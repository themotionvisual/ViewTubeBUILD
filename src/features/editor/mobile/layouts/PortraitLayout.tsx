import React, { useMemo, useRef, useState } from 'react';
import { EditorStore } from '../state/editorState';
import { PreviewPane } from '../components/PreviewPane';
import { TimelineStrip, type TimelineViewport } from '../components/TimelineStrip';
import { MiniTimelineMap } from '../components/MiniTimelineMap';
import { ContextMenu, ContextMenuItem } from '../components/ContextMenu';
import { EDITOR_NAV_ITEMS, EditorNavigationPage, type EditorNavPage, type EditorSettingsModel } from '../components/EditorNavigationPages';
import type { VtE1Clip } from '../../../../shared/vtE1TimelineContract';

export interface PortraitLayoutProps { store:EditorStore; renderPreview?:(info:{widthPx:number;heightPx:number})=>React.ReactNode; height?:number; compositionAspect?:number; editorSettings?:EditorSettingsModel; }
const CYAN='#36E0F6', INK='#248b99';
export const PortraitLayout:React.FC<PortraitLayoutProps>=({store,renderPreview,height,compositionAspect=9/16,editorSettings})=>{
 const rootRef=useRef<HTMLDivElement>(null); const [menu,setMenu]=useState<{items:ContextMenuItem[];at:{x:number;y:number};title?:string}|null>(null); const [page,setPage]=useState<EditorNavPage|null>(null); const [timelineViewport,setTimelineViewport]=useState<TimelineViewport>({startSec:0,endSec:0}); const [scrollToSec,setScrollToSec]=useState(0);
 const containerHeight=height??(typeof window!=='undefined'?window.innerHeight:800); const isPortraitVideo=compositionAspect<1; const previewHeight=Math.round(containerHeight*(isPortraitVideo?0.52:0.39)); const timelineHeight=116;
 const clipMenuFor=(clip:VtE1Clip):ContextMenuItem[]=>[{label:'Inspect',onSelect:()=>setPage('select')},{label:'Split at playhead',onSelect:()=>store.dispatch({type:'splitClipAtPlayhead',id:clip.id})},{label:'Duplicate',onSelect:()=>store.dispatch({type:'duplicateClip',id:clip.id})},{label:'Delete',destructive:true,onSelect:()=>store.dispatch({type:'deleteClips',ids:[clip.id]})}];
 const emptyMenu=useMemo<ContextMenuItem[]>(()=>[{label:'Add title here',onSelect:()=>setPage('text')}],[]);
 const navButton=(active:boolean):React.CSSProperties=>({width:'100%',minHeight:38,border:`2px solid ${INK}`,borderRadius:5,background:active?CYAN:'#fff',color:'#000',fontSize:8,fontWeight:900,textTransform:'uppercase',display:'grid',placeItems:'center',padding:'3px 1px',lineHeight:1,boxShadow:active?'2px 2px 0 rgba(54,224,246,.35)':'none'});
 return <div ref={rootRef} style={{position:'relative',width:'100%',height:containerHeight,background:'#f3f3f3',color:'#000',display:'grid',gridTemplateRows:`${previewHeight}px ${timelineHeight}px 44px`,gap:4,padding:4,paddingBottom:8,boxSizing:'border-box',overflow:'hidden',touchAction:'manipulation'}}>
  <div style={{minHeight:0,minWidth:0,display:'grid',gridTemplateColumns:'minmax(0,1fr) 58px',gap:4,overflow:'hidden'}}>
   <div style={{minHeight:0,minWidth:0,display:'flex',alignItems:'flex-start',justifyContent:'flex-start',overflow:'hidden',background:'#fff',border:`3px solid ${INK}`,borderRadius:7,padding:3}}><div style={{height:'100%',width:isPortraitVideo?'auto':'100%',aspectRatio:String(compositionAspect),maxWidth:'100%',alignSelf:'flex-start'}}><PreviewPane store={store} renderPreview={renderPreview} aspect={compositionAspect}/></div></div>
   <nav aria-label="Editor tools" style={{minHeight:0,display:'flex',flexDirection:'column',gap:3,overflowY:'auto',padding:'2px 2px 4px',background:'#fff',border:`3px solid ${INK}`,borderRadius:7}}>
    <button style={{...navButton(false),background:CYAN,minHeight:42,fontSize:15}} onClick={()=>store.dispatch({type:'togglePlaying'})}>{store.state.playing?'Ⅱ':'▶'}</button><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:2}}><button style={navButton(false)} onClick={()=>store.dispatch({type:'setPlayhead',sec:store.state.playheadSec-1})}>‹</button><button style={navButton(false)} onClick={()=>store.dispatch({type:'setPlayhead',sec:store.state.playheadSec+1})}>›</button></div>
    {EDITOR_NAV_ITEMS.map(item=><button key={item.id} style={navButton(page===item.id)} aria-pressed={page===item.id} onClick={()=>setPage(current=>current===item.id?null:item.id)}><span style={{fontSize:14}}>{item.icon}</span><span>{item.label}</span></button>)}
   </nav>
   {page&&<aside style={{position:'absolute',top:4,right:66,width:'min(62vw,340px)',height:previewHeight-8,zIndex:40,overflowY:'auto',background:'#f7f7f7',border:`3px solid ${INK}`,borderRadius:7,padding:8,boxSizing:'border-box',boxShadow:'4px 4px 0 rgba(54,224,246,.28)'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:7,paddingBottom:6,borderBottom:`2px solid ${INK}`}}><strong style={{fontSize:11,textTransform:'uppercase'}}>{EDITOR_NAV_ITEMS.find(x=>x.id===page)?.label}</strong><button onClick={()=>setPage(null)} style={{width:26,height:26,border:`2px solid ${INK}`,borderRadius:4,background:'#fff',fontWeight:900}}>×</button></div><EditorNavigationPage page={page} store={store} settings={editorSettings}/></aside>}
  </div>
  <TimelineStrip store={store} height={timelineHeight} scrollToSec={scrollToSec} onViewportChange={setTimelineViewport} onClipContextMenu={(clip,at)=>setMenu({items:clipMenuFor(clip),at,title:String(clip.id)})} onEmptyContextMenu={(at)=>setMenu({items:emptyMenu,at,title:'Timeline'})}/><MiniTimelineMap store={store} height={44} viewport={timelineViewport} onViewportNavigate={setScrollToSec}/>{menu&&<ContextMenu {...menu} onDismiss={()=>setMenu(null)}/>} 
 </div>;
};
