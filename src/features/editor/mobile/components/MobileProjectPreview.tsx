import React from 'react';
import type {EditorStore} from '../state/editorState';
import type {VtE1Clip} from '../../../../shared/vtE1TimelineContract';
import {resolveClipPreviewGeometry} from './mobilePreviewGeometry';
import {expandCompoundClips} from '../../../../shared/vtE1CompoundClips.js';
import {vtE1FilterCss,vtE1FxOpacity} from '../../../../shared/vtE1FxCatalog.js';

const clamp=(v:number,min:number,max:number)=>Math.min(max,Math.max(min,v));
const isVideo=(src:string)=>/\.(mp4|webm|mov|m4v|ogg)(\?|#|$)/i.test(src);

function VideoPreview({src,clip,playheadSec,playing,playbackRate,payload}:{src:string;clip:VtE1Clip;playheadSec:number;playing:boolean;playbackRate:number;payload:Record<string,unknown>}){
  const ref=React.useRef<HTMLVideoElement>(null);
  React.useEffect(()=>{
    const el=ref.current;if(!el)return;
    const sourceIn=Number(clip.sourceInSec??0);
    const target=Math.max(0,sourceIn+Math.max(0,playheadSec-clip.start));
    if(!playing||Math.abs((el.currentTime||0)-target)>.35){
      try{el.currentTime=target}catch{}
    }
    el.playbackRate=Math.max(.1,Math.min(4,playbackRate));
    el.muted=Boolean(payload.muted);
    el.volume=clamp(Number(payload.volume??1),0,1);
    if(playing){void el.play().catch(()=>{})}else el.pause();
  },[src,clip.start,clip.sourceInSec,playheadSec,playing,playbackRate,payload.muted,payload.volume]);
  return <video ref={ref} src={src} playsInline preload="metadata" style={{width:'100%',height:'100%',objectFit:String(payload.fit||'cover') as React.CSSProperties['objectFit'],display:'block'}}/>;
}

export const MobileProjectPreview:React.FC<{store:EditorStore}>=({store})=>{
  const {state}=store;
  const trackOrder=new Map(state.project.tracks.map((t,i)=>[t.id,i]));
  const active=expandCompoundClips(state.project.clips)
    .filter(c=>state.playheadSec>=c.start&&state.playheadSec<c.end)
    .filter(c=>!store.trackById(c.trackId)?.hidden)
    .sort((a,b)=>(trackOrder.get(a.trackId)??0)-(trackOrder.get(b.trackId)??0));

  if(!active.length)return <div style={{position:'absolute',inset:0,display:'grid',placeItems:'center',color:'#e2e8f0'}}>
    <div style={{textAlign:'center',opacity:.58}}><div style={{fontSize:9,letterSpacing:1,textTransform:'uppercase'}}>Preview</div><div style={{fontSize:16,fontWeight:800,marginTop:3}}>No clip</div></div>
  </div>;

  return <div style={{position:'absolute',inset:0,overflow:'hidden',background:'#111'}}>
    {active.map((clip,index)=>{
      const geometry=resolveClipPreviewGeometry(store,clip);
      const {layer,payload,type,projectWidth,projectHeight,x,y,width,height,scaleX,scaleY,rotation,opacity}=geometry;
      if(layer?.visible===false)return null;
      const filter=vtE1FilterCss(payload);
      const fxOpacity=vtE1FxOpacity(payload);
      const style:React.CSSProperties={
        position:'absolute',
        left:`${50+(x/projectWidth)*100}%`,
        top:`${50+(y/projectHeight)*100}%`,
        width:`${(width/projectWidth)*100}%`,
        height:`${(height/projectHeight)*100}%`,
        transform:`translate(-50%,-50%) scale(${scaleX},${scaleY}) rotate(${rotation}deg)`,
        transformOrigin:'center',
        opacity:opacity*fxOpacity,
        zIndex:index+1,
        overflow:'hidden',
        filter,
        display:'grid',
        placeItems:'center',
      };
      const src=String(payload.mediaUrl??payload.src??payload.url??'');
      if(type==='audio')return null;
      if(type==='text'||payload.text)return <div key={clip.id} style={style}><div style={{
        width:'100%',color:String(payload.fillColor??payload.fill??'#fff'),
        fontFamily:String(payload.fontFamily??'Arial Black, Arial, sans-serif'),
        fontSize:`clamp(10px,${Math.max(2,Number(payload.fontSize??48)/20)}vw,${Math.max(12,Number(payload.fontSize??48))}px)`,
        fontWeight:Number(payload.fontWeight??900),
        textAlign:String(payload.textAlign??'center') as React.CSSProperties['textAlign'],
        lineHeight:1.05,whiteSpace:'pre-wrap',wordBreak:'break-word',
        WebkitTextStroke:`${Math.max(0,Number(payload.strokeWidth??0))}px ${String(payload.strokeColor??'#111')}`,
      }}>{String(payload.text??'')}</div></div>;
      if(type==='shape')return <div key={clip.id} style={style}><div style={{
        width:'100%',height:'100%',background:String(payload.fillColor??'#fff'),
        border:`${Math.max(0,Number(payload.strokeWidth??0))}px solid ${String(payload.strokeColor??'#111')}`,
        borderRadius:String(payload.shape)==='circle'?'50%':Math.max(0,Number(payload.cornerRadius??0)),
      }}/></div>;
      if(src)return <div key={clip.id} style={style}>{isVideo(src)||String(payload.mediaKind??'')==='video'
        ?<VideoPreview src={src} clip={clip} playheadSec={state.playheadSec} playing={state.playing} playbackRate={state.playbackRate} payload={payload}/>
        :<img alt="" src={src} draggable={false} style={{width:'100%',height:'100%',objectFit:String(payload.fit||'cover') as React.CSSProperties['objectFit'],display:'block'}}/>
      }</div>;
      return <div key={clip.id} style={{...style,border:'1px dashed rgba(255,255,255,.35)',color:'#fff',fontSize:10,fontWeight:900}}>{String(clip.id).slice(0,18)}</div>;
    })}
  </div>;
};
