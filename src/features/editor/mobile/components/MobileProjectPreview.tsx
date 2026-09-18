import React from 'react';
import type {EditorStore} from '../state/editorState';
import {readClipVisualTransform} from '../state/editorState';
import type {VtE1Clip} from '../../../../shared/vtE1TimelineContract';

type LayerRecord={id?:string;type?:string;trackId?:string;visible?:boolean;payload?:Record<string,unknown>};
type Keyframe={offsetSec?:number;values?:Record<string,unknown>;interp?:string};

const clamp=(v:number,min:number,max:number)=>Math.min(max,Math.max(min,v));
const isVideo=(src:string)=>/\.(mp4|webm|mov|m4v|ogg)(\?|#|$)/i.test(src);

function eased(t:number,kind:string){
  if(kind==='easeIn')return t*t;
  if(kind==='easeOut')return 1-(1-t)*(1-t);
  if(kind==='easeInOut')return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
  return t;
}

function keyframed(base:unknown,keyframes:Keyframe[]|undefined,prop:string,localSec:number){
  const items=(keyframes??[]).filter(k=>k.values&&Object.prototype.hasOwnProperty.call(k.values,prop)).sort((a,b)=>Number(a.offsetSec??0)-Number(b.offsetSec??0));
  if(!items.length)return base;
  if(localSec<=Number(items[0].offsetSec??0))return items[0].values?.[prop]??base;
  const last=items[items.length-1];
  if(localSec>=Number(last.offsetSec??0))return last.values?.[prop]??base;
  for(let i=0;i<items.length-1;i++){
    const left=items[i],right=items[i+1],a=Number(left.offsetSec??0),b=Number(right.offsetSec??0);
    if(localSec<a||localSec>b)continue;
    const lv=left.values?.[prop],rv=right.values?.[prop];
    if(typeof lv==='number'&&typeof rv==='number'){
      const p=eased(clamp((localSec-a)/Math.max(.001,b-a),0,1),String(right.interp??left.interp??'linear'));
      return lv+(rv-lv)*p;
    }
    return localSec<b?lv:rv;
  }
  return base;
}

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
  const project=state.project as typeof state.project&{layers?:LayerRecord[];meta?:Record<string,unknown>};
  const layers=Array.isArray(project.layers)?project.layers:[];
  const layerById=new Map(layers.map(l=>[String(l.id??''),l]));
  const trackOrder=new Map(state.project.tracks.map((t,i)=>[t.id,i]));
  const active=state.project.clips
    .filter(c=>state.playheadSec>=c.start&&state.playheadSec<c.end)
    .filter(c=>!store.trackById(c.trackId)?.hidden)
    .sort((a,b)=>(trackOrder.get(a.trackId)??0)-(trackOrder.get(b.trackId)??0));

  if(!active.length)return <div style={{position:'absolute',inset:0,display:'grid',placeItems:'center',color:'#e2e8f0'}}>
    <div style={{textAlign:'center',opacity:.58}}><div style={{fontSize:9,letterSpacing:1,textTransform:'uppercase'}}>Preview</div><div style={{fontSize:16,fontWeight:800,marginTop:3}}>No clip</div></div>
  </div>;

  const width=Number(project.meta?.width??project.meta?.compositionWidth??1920);
  const height=Number(project.meta?.height??project.meta?.compositionHeight??1080);

  return <div style={{position:'absolute',inset:0,overflow:'hidden',background:'#111'}}>
    {active.map((clip,index)=>{
      const layer=clip.layerId?layerById.get(String(clip.layerId)):undefined;
      if(layer?.visible===false)return null;
      const base={...((layer?.payload??{}) as Record<string,unknown>),...(clip as Record<string,unknown>)};
      const localSec=Math.max(0,state.playheadSec-clip.start);
      const animated={...base};
      for(const prop of ['x','y','scale','rotation','opacity','width','height','fontSize','strokeWidth','blur','saturation','brightness','hue']){
        animated[prop]=keyframed(animated[prop],clip.keyframes as Keyframe[]|undefined,prop,localSec);
      }
      const mobile=readClipVisualTransform(clip);
      const x=Number(animated.x??0)+mobile.x,y=Number(animated.y??0)+mobile.y;
      const w=Math.max(1,Number(animated.width??width)),h=Math.max(1,Number(animated.height??height));
      const scale=Number(animated.scale??1)*mobile.scaleX;
      const rotation=Number(animated.rotation??0)+mobile.rotation;
      const opacity=clamp(Number(animated.opacity??1)*mobile.opacity,0,1);
      const blur=Math.max(0,Number(animated.blur??0)),sat=Math.max(0,Number(animated.saturation??1)),bright=Math.max(0,Number(animated.brightness??1)),hue=Number(animated.hue??0);
      const style:React.CSSProperties={
        position:'absolute',left:`${50+(x/Math.max(1,width))*100}%`,top:`${50+(y/Math.max(1,height))*100}%`,
        width:`${(w/Math.max(1,width))*100}%`,height:`${(h/Math.max(1,height))*100}%`,
        transform:`translate(-50%,-50%) scale(${scale},${Number(animated.scale??1)*mobile.scaleY}) rotate(${rotation}deg)`,
        transformOrigin:'center',opacity,zIndex:index+1,overflow:'hidden',
        filter:`${blur?`blur(${blur}px) `:''}saturate(${sat}) brightness(${bright}) ${hue?`hue-rotate(${hue}deg)`:''}`,
        display:'grid',placeItems:'center',
      };
      const type=String(layer?.type??animated.clipType??(animated.text?'text':'media'));
      const src=String(animated.mediaUrl??animated.src??animated.url??'');
      if(type==='audio')return null;
      if(type==='text'||animated.text)return <div key={clip.id} style={style}><div style={{width:'100%',color:String(animated.fillColor??animated.fill??'#fff'),fontFamily:String(animated.fontFamily??'Arial Black, Arial, sans-serif'),fontSize:`clamp(10px,${Math.max(2,Number(animated.fontSize??48)/20)}vw,${Math.max(12,Number(animated.fontSize??48))}px)`,fontWeight:Number(animated.fontWeight??900),textAlign:String(animated.textAlign??'center') as React.CSSProperties['textAlign'],lineHeight:1.05,whiteSpace:'pre-wrap',wordBreak:'break-word',WebkitTextStroke:`${Math.max(0,Number(animated.strokeWidth??0))}px ${String(animated.strokeColor??'#111')}`}}>{String(animated.text??'')}</div></div>;
      if(type==='shape')return <div key={clip.id} style={style}><div style={{width:'100%',height:'100%',background:String(animated.fillColor??'#fff'),border:`${Math.max(0,Number(animated.strokeWidth??0))}px solid ${String(animated.strokeColor??'#111')}`,borderRadius:String(animated.shape)==='circle'?'50%':Math.max(0,Number(animated.cornerRadius??0))}}/></div>;
      if(src)return <div key={clip.id} style={style}>{isVideo(src)||String(animated.mediaKind??'')==='video'?<VideoPreview src={src} clip={clip} playheadSec={state.playheadSec} playing={state.playing} playbackRate={state.playbackRate} payload={animated}/>:<img alt="" src={src} draggable={false} style={{width:'100%',height:'100%',objectFit:String(animated.fit||'cover') as React.CSSProperties['objectFit'],display:'block'}}/>}</div>;
      return <div key={clip.id} style={{...style,border:'1px dashed rgba(255,255,255,.35)',color:'#fff',fontSize:10,fontWeight:900}}>{String(clip.id).slice(0,18)}</div>;
    })}
  </div>;
};
