import React,{useEffect,useRef} from 'react';
import {Circle,RectangleHorizontal,Sparkles,Upload,Video} from 'lucide-react';
import type {EditorLayer,EditorStore} from '../state/editorState';
import type {EditorNavPage} from './EditorNavigationPages';
import type {VtE1Clip} from '../../../../shared/vtE1TimelineContract';

const BLACK='#111111';
const MAGENTA='#ff00ff';
const ORANGE='#ffb570';
const YELLOW='#ffff61';
const GREEN='#00ff00';
const BLUE='#579aff';
const PURPLE='#cc00ff';
const INK='#248b99';
const CYAN='#36E0F6';

type Payload=Record<string,unknown>;

const addButtonBase:React.CSSProperties={
  boxSizing:'border-box',border:`2px solid ${BLACK}`,margin:0,padding:'4px 8px',
  fontWeight:900,fontSize:9,letterSpacing:'.01em',color:'#111',borderRadius:7,
  touchAction:'manipulation',textTransform:'uppercase',justifyContent:'center',
  alignItems:'center',gap:6,minHeight:38,display:'inline-flex',position:'relative',
  overflow:'hidden',boxShadow:'2px 2px 0 rgba(0,0,0,.18)',width:60,cursor:'pointer',
};

const miniButton:React.CSSProperties={
  minHeight:28,border:`2px solid ${BLACK}`,borderRadius:6,background:'#fff',
  color:'#111',fontSize:8,fontWeight:900,textTransform:'uppercase',padding:'3px 6px',
};

const sectionLabel:React.CSSProperties={
  fontSize:10,fontWeight:900,textTransform:'uppercase',opacity:.7,margin:'4px 0 6px',
};

const valueInput:React.CSSProperties={
  boxSizing:'border-box',border:`2px solid ${INK}`,margin:0,padding:'2px 6px',
  fontWeight:800,fontSize:9,color:'inherit',background:'#fff',borderRadius:6,textAlign:'center',
  minWidth:36,width:'100%',height:24,caretColor:INK,outline:'none',
};

const stepperButton:React.CSSProperties={
  width:28,minWidth:28,height:28,border:`2px solid ${INK}`,borderRadius:6,
  background:CYAN,color:'#111',fontSize:15,fontWeight:1000,lineHeight:1,
  display:'grid',placeItems:'center',padding:0,touchAction:'none',userSelect:'none',
  boxShadow:'2px 2px 0 rgba(36,139,153,.22)',cursor:'pointer',
};

const stepperValue:React.CSSProperties={
  minWidth:0,height:28,borderTop:`2px solid ${INK}`,borderBottom:`2px solid ${INK}`,
  background:'#fff',display:'grid',placeItems:'center',fontSize:10,fontWeight:1000,
  fontVariantNumeric:'tabular-nums',letterSpacing:'-.02em',padding:'0 5px',boxSizing:'border-box',
};

const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));
const number=(value:unknown,fallback:number)=>Number.isFinite(Number(value))?Number(value):fallback;
const uid=(prefix:string)=>`${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`;

function targetTrack(store:EditorStore,kind:'video'|'overlay'|'audio'){
  return store.state.project.tracks.find(track=>track.kind===kind)
    ??store.state.project.tracks.find(track=>kind==='audio'?track.kind==='audio':track.kind!=='audio')
    ??store.state.project.tracks[0];
}

function defaultPayload(type:'text'|'shape'|'media'|'audio',index:number):Payload{
  return{
    layerName:`${type.toUpperCase()}_${index+1}`,
    x:0,y:0,scale:1,rotation:0,opacity:1,
    blur:0,saturation:1,brightness:1,hue:0,
    fillColor:index%2? '#36E0F6':MAGENTA,
    strokeColor:BLACK,strokeWidth:type==='audio'?0:2,
    width:type==='text'?960:type==='media'?960:260,
    height:type==='text'?120:type==='media'?540:140,
    cornerRadius:type==='shape'?10:0,
    polygonSides:5,polygonInnerRadius:0,
    text:type==='text'?`TEXT_${index+1}`:'',
    fontSize:type==='text'?44:24,fontFamily:'Outfit',textAlign:'center',
    shape:type==='shape'?'rect':'rect',
    mediaUrl:'',mediaName:'',mediaKind:type==='audio'?'audio':'',
    fit:'cover',volume:type==='audio' ? 0.6 : 1,muted:false,audioSrcType:type==='audio'?'file':'',
    effects:[],
  };
}

function createLayerClip(store:EditorStore,type:'text'|'shape',payloadPatch:Payload={}){
  const track=targetTrack(store,'overlay');
  if(!track)return;
  const layerId=uid('layer');
  const clipId=uid('clip');
  const payload={...defaultPayload(type,store.state.project.layers.length),...payloadPatch};
  const layer:EditorLayer={id:layerId,trackId:track.id,type,visible:true,payload};
  const start=store.state.playheadSec;
  const end=Math.min(Math.max(store.state.project.durationSec,start+4),start+4);
  const clip:VtE1Clip={id:clipId,trackId:track.id,layerId,start,end,keyframes:[]};
  store.dispatch({type:'addLayerClip',layer,clip});
}

function fitMediaSize(width:number,height:number){
  const w=Math.max(1,width),h=Math.max(1,height);
  const scale=Math.min(960/w,540/h,1);
  return{width:Math.max(1,Math.round(w*scale)),height:Math.max(1,Math.round(h*scale))};
}

async function addFileClip(store:EditorStore,file:File,kind:'image'|'video'|'audio'){
  const url=URL.createObjectURL(file);
  const index=store.state.project.layers.length;
  const track=targetTrack(store,kind==='audio'?'audio':'video');
  if(!track)return;
  const layerId=uid('layer'),clipId=uid('clip');
  let durationSec=kind==='image'?4:0;
  let size={width:960,height:540};

  if(kind==='image'){
    await new Promise<void>(resolve=>{
      const img=new window.Image();
      img.onload=()=>{size=fitMediaSize(img.naturalWidth||1920,img.naturalHeight||1080);resolve()};
      img.onerror=()=>resolve();
      img.src=url;
    });
  }else{
    await new Promise<void>(resolve=>{
      const media=document.createElement(kind==='audio'?'audio':'video');
      media.preload='metadata';
      media.onloadedmetadata=()=>{
        durationSec=Number.isFinite(media.duration)&&media.duration>0?media.duration:4;
        if(kind==='video')size=fitMediaSize((media as HTMLVideoElement).videoWidth||1920,(media as HTMLVideoElement).videoHeight||1080);
        resolve();
      };
      media.onerror=()=>{durationSec=4;resolve()};
      media.src=url;
    });
  }

  const type=kind==='audio'?'audio':'media';
  const payload={
    ...defaultPayload(type,index),
    layerName:file.name||`${kind.toUpperCase()}_${index+1}`,
    mediaUrl:url,mediaName:file.name||'',mediaMime:file.type||'',
    mediaKind:kind,
    sourceDurationSec:kind==='image'?undefined:durationSec,
    mediaDurationSec:kind==='image'?undefined:durationSec,
    sourceDurationUnknown:kind!=='image'&&!durationSec,
    width:size.width,height:size.height,
    strokeWidth:0,fillColor:'#111111',
    audioSrcType:kind==='audio'?'file':'',
  };
  const layer:EditorLayer={id:layerId,trackId:track.id,type,visible:true,payload};
  const start=store.state.playheadSec;
  const len=clamp(durationSec||4,.25,Math.max(4,store.state.project.durationSec||30));
  const clip:VtE1Clip={
    id:clipId,trackId:track.id,layerId,start,end:start+len,keyframes:[],
    sourceInSec:kind==='image'?undefined:0,
    sourceOutSec:kind==='image'?undefined:len,
    sourceDurationSec:kind==='image'?undefined:durationSec||undefined,
    sourceDurationUnknown:kind==='image'?undefined:!durationSec,
  };
  store.dispatch({type:'addLayerClip',layer,clip});
}

interface SettingDef{
  prop:string;
  label:string;
  min:number;
  max:number;
  step:number;
  fallback:number;
  toDisplay?:(value:number)=>number;
  fromDisplay?:(value:number)=>number;
}

const SETTINGS:SettingDef[]=[
  {prop:'x',label:'X PLACE',min:-5000,max:5000,step:1,fallback:0},
  {prop:'y',label:'Y PLACE',min:-5000,max:5000,step:1,fallback:0},
  {prop:'scale',label:'SCALE',min:.1,max:10,step:.01,fallback:1},
  {prop:'rotation',label:'ROTATION',min:-3000,max:3000,step:1,fallback:0},
  {prop:'opacity',label:'OPACITY',min:0,max:100,step:1,fallback:1,toDisplay:v=>v*100,fromDisplay:v=>v/100},
  {prop:'fontSize',label:'FONT SIZE',min:10,max:220,step:1,fallback:24},
  {prop:'blur',label:'BLUR',min:0,max:40,step:.1,fallback:0},
  {prop:'saturation',label:'SATURATION',min:0,max:3,step:.01,fallback:1},
  {prop:'hue',label:'HUE',min:-3000,max:3000,step:1,fallback:0},
  {prop:'brightness',label:'BRIGHTNESS',min:0,max:3,step:.01,fallback:1},
  {prop:'width',label:'WIDTH',min:1,max:5000,step:1,fallback:100},
  {prop:'height',label:'HEIGHT',min:1,max:5000,step:1,fallback:100},
  {prop:'strokeWidth',label:'STROKE WIDTH',min:0,max:20,step:.01,fallback:0},
  {prop:'cornerRadius',label:'CORNER RADIUS',min:0,max:80,step:1,fallback:0},
];

function keyframeState(clip:VtE1Clip,prop:string,playheadSec:number){
  const keyframes=Array.isArray(clip.keyframes)?clip.keyframes:[];
  const hasAny=keyframes.some(k=>Object.prototype.hasOwnProperty.call((k.values??{}) as object,prop));
  if(!hasAny)return'none' as const;
  const local=Math.max(0,playheadSec-clip.start);
  const active=keyframes.some(k=>Math.abs(Number(k.offsetSec??0)-local)<=.03&&Object.prototype.hasOwnProperty.call((k.values??{}) as object,prop));
  return active?'active' as const:'attached' as const;
}

interface HoldStepperProps{
  label:string;
  value:number;
  min:number;
  max:number;
  step:number;
  onChange:(value:number)=>void;
  keyframeState?:'none'|'attached'|'active';
  onKeyframe?:()=>void;
  suffix?:string;
  precision?:number;
}

const HoldStepper:React.FC<HoldStepperProps>=({
  label,value,min,max,step,onChange,keyframeState='none',onKeyframe,suffix='',precision,
})=>{
  const valueRef=useRef(value);
  const timerRef=useRef<number|null>(null);
  const holdStartRef=useRef(0);
  valueRef.current=value;

  const stop=()=>{
    if(timerRef.current!=null){
      window.clearTimeout(timerRef.current);
      timerRef.current=null;
    }
  };

  useEffect(()=>stop,[]);

  const nudge=(direction:-1|1,elapsed=0)=>{
    const multiplier=elapsed>=2800?10:elapsed>=1700?5:elapsed>=900?2:1;
    const next=clamp(valueRef.current+(direction*step*multiplier),min,max);
    const decimals=precision??(step<.01?3:step<1?2:0);
    const snapped=Number(next.toFixed(decimals));
    valueRef.current=snapped;
    onChange(snapped);
  };

  const schedule=(direction:-1|1)=>{
    const elapsed=performance.now()-holdStartRef.current;
    nudge(direction,elapsed);
    const interval=Math.max(42,210-(elapsed/18));
    timerRef.current=window.setTimeout(()=>schedule(direction),interval);
  };

  const start=(direction:-1|1,event:React.PointerEvent<HTMLButtonElement>)=>{
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    stop();
    holdStartRef.current=performance.now();
    nudge(direction,0);
    timerRef.current=window.setTimeout(()=>schedule(direction),340);
  };

  const decimals=precision??(step<.01?3:step<1?2:0);
  const display=`${Number(value.toFixed(decimals))}${suffix}`;

  return <div style={{width:126,marginBottom:8}}>
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:6,marginBottom:3}}>
      <span style={{fontSize:8,fontWeight:1000,textTransform:'uppercase',opacity:.72,lineHeight:1}}>{label}</span>
      {onKeyframe?<button
        title={`Add circle keyframe for ${label}`}
        onClick={onKeyframe}
        style={{
          width:18,height:18,border:`2px solid ${INK}`,borderRadius:99,padding:0,
          background:keyframeState==='active'?BLUE:keyframeState==='attached'?'#a8caff':'#fff',
          color:'#111',fontSize:13,fontWeight:1000,lineHeight:1,display:'grid',placeItems:'center',
          opacity:keyframeState==='attached'?.72:1,
        }}
      >○</button>:null}
    </div>
    <div style={{display:'grid',gridTemplateColumns:'28px 70px 28px',alignItems:'stretch',width:'126px'}}>
      <button
        aria-label={`Decrease ${label}`}
        style={{...stepperButton,background:CYAN,borderTopRightRadius:0,borderBottomRightRadius:0}}
        onPointerDown={e=>start(-1,e)}
        onPointerUp={stop}
        onPointerCancel={stop}
        onLostPointerCapture={stop}
      >−</button>
      <div aria-live="polite" style={stepperValue}>{display}</div>
      <button
        aria-label={`Increase ${label}`}
        style={{...stepperButton,background:CYAN,borderTopLeftRadius:0,borderBottomLeftRadius:0}}
        onPointerDown={e=>start(1,e)}
        onPointerUp={stop}
        onPointerCancel={stop}
        onLostPointerCapture={stop}
      >+</button>
    </div>
  </div>;
};

const SettingRow:React.FC<{
  def:SettingDef;
  payload:Payload;
  clip:VtE1Clip;
  store:EditorStore;
  onPatch:(patch:Payload)=>void;
}>=({def,payload,clip,store,onPatch})=>{
  const raw=number(payload[def.prop],def.fallback);
  const display=def.toDisplay?def.toDisplay(raw):raw;
  const state=keyframeState(clip,def.prop,store.state.playheadSec);
  const commit=(nextDisplay:number)=>{
    const snapped=Math.round(clamp(nextDisplay,def.min,def.max)/def.step)*def.step;
    const next=def.fromDisplay?def.fromDisplay(snapped):snapped;
    onPatch({[def.prop]:next});
  };
  return <HoldStepper
    label={def.label}
    value={display}
    min={def.min}
    max={def.max}
    step={def.step}
    precision={def.step<1?2:0}
    suffix={def.prop==='opacity'?'%':''}
    onChange={commit}
    keyframeState={state}
    onKeyframe={()=>store.dispatch({type:'addClipKeyframeValue',clipId:clip.id,prop:def.prop,value:raw})}
  />;
};

const ColorControl:React.FC<{
  label:string;
  prop:'fillColor'|'strokeColor';
  payload:Payload;
  clip:VtE1Clip;
  store:EditorStore;
  onPatch:(patch:Payload)=>void;
}>=({label,prop,payload,clip,store,onPatch})=>{
  const value=String(payload[prop]??'#10152a');
  const state=keyframeState(clip,prop,store.state.playheadSec);
  return <label style={{fontSize:11,fontWeight:900}}>
    {label}
    <div style={{display:'flex',alignItems:'center',gap:8,marginTop:4}}>
      <input type="color" value={/^#[0-9a-f]{6}$/i.test(value)?value:'#10152a'} onChange={e=>onPatch({[prop]:e.target.value})}
        style={{boxSizing:'border-box',border:`2px solid ${BLACK}`,padding:3,width:'100%',height:36,cursor:'pointer',background:'#fff',borderRadius:5}}/>
      <button
        onClick={e=>{e.preventDefault();store.dispatch({type:'addClipKeyframeValue',clipId:clip.id,prop,value})}}
        style={{
          boxSizing:'border-box',border:`2px solid ${BLACK}`,padding:0,fontWeight:900,fontSize:14,lineHeight:1,
          color:BLACK,background:state==='active'?BLUE:state==='attached'?'#a8caff':'#fff',borderRadius:999,
          width:18,height:18,display:'inline-flex',alignItems:'center',justifyContent:'center',flex:'0 0 auto',
        }}
      >○</button>
    </div>
  </label>;
};

function SelectedClipSettings({store,onNavigate}:{store:EditorStore;onNavigate?:(page:EditorNavPage)=>void}){
  const clip=store.selectedClips[0];
  const layer=store.selectedLayer;
  if(!clip)return <div style={{width:196,border:`2px solid ${BLACK}`,borderRadius:7,padding:8,background:'#fff',fontSize:9,fontWeight:900,textTransform:'uppercase'}}>Select a clip in the timeline or Project Clips list to edit every clip setting.</div>;

  if(!layer){
    const isTemplate=(clip as VtE1Clip&{clipType?:string}).clipType==='design-template';
    return <div style={{width:196,border:`2px solid ${BLACK}`,borderRadius:7,padding:8,background:'#fff',fontSize:9,fontWeight:900}}>
      <div style={{textTransform:'uppercase',marginBottom:6}}>{String(clip.id)}</div>
      <div style={{opacity:.65,marginBottom:8}}>{isTemplate?'This design-template clip is edited in Templates.':'This legacy clip has no linked VT_E1 layer payload yet.'}</div>
      {isTemplate?<button style={{...miniButton,width:'100%',background:PURPLE,color:'#fff'}} onClick={()=>onNavigate?.('templates')}>Open Templates</button>:null}
    </div>;
  }

  const payload=layer.payload??{};
  const patch=(next:Payload)=>store.dispatch({type:'updateLayerPayload',id:layer.id,patch:next});
  const type=String(layer.type||'clip');
  const isText=type==='text';
  const isShape=type==='shape';
  const isMedia=type==='media';
  const isAudio=type==='audio';
  const audioVolume=number(payload.volume,.6);
  const audioRate=number(payload.playbackRate,1);

  return <div style={{width:196,minWidth:196}}>
    <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:4,alignItems:'center',marginBottom:8}}>
      <div style={{minWidth:0}}>
        <div style={{fontSize:9,fontWeight:900,textTransform:'uppercase',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{String(payload.layerName||clip.id)}</div>
        <div style={{fontSize:7,fontWeight:900,opacity:.55,textTransform:'uppercase'}}>{type} · {clip.start.toFixed(2)}–{clip.end.toFixed(2)}s</div>
      </div>
      <button style={{...miniButton,minWidth:34,background:layer.visible===false?'#fff':GREEN}} onClick={()=>store.dispatch({type:'setLayerVisible',id:layer.id,visible:layer.visible===false})}>{layer.visible===false?'SHOW':'ON'}</button>
    </div>

    <div style={sectionLabel}>TIMING</div>
    <HoldStepper
      label="START"
      value={clip.start}
      min={0}
      max={Math.max(0,clip.end-.1)}
      step={.05}
      precision={2}
      suffix="s"
      onChange={sec=>store.dispatch({type:'trimClip',id:clip.id,side:'left',sec})}
    />
    <HoldStepper
      label="END"
      value={clip.end}
      min={Math.min(store.state.project.durationSec,clip.start+.1)}
      max={store.state.project.durationSec}
      step={.05}
      precision={2}
      suffix="s"
      onChange={sec=>store.dispatch({type:'trimClip',id:clip.id,side:'right',sec})}
    />
    <HoldStepper
      label="DURATION"
      value={Math.max(.1,clip.end-clip.start)}
      min={.1}
      max={Math.max(.1,store.state.project.durationSec-clip.start)}
      step={.05}
      precision={2}
      suffix="s"
      onChange={duration=>store.dispatch({type:'trimClip',id:clip.id,side:'right',sec:clip.start+duration})}
    />

    <div style={sectionLabel}>TRANSFORM + TIMING</div>
    {SETTINGS.map(def=><SettingRow key={def.prop} def={def} payload={payload} clip={clip} store={store} onPatch={patch}/>)}

    <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:8,width:196,marginTop:3}}>
      <div style={{gridColumn:'1/-1',...sectionLabel,marginBottom:0}}>APPEARANCE</div>
      <ColorControl label="Fill" prop="fillColor" payload={payload} clip={clip} store={store} onPatch={patch}/>
      <ColorControl label="Stroke" prop="strokeColor" payload={payload} clip={clip} store={store} onPatch={patch}/>
    </div>

    {isText?<div style={{marginTop:10}}>
      <div style={sectionLabel}>TEXT</div>
      <textarea value={String(payload.text??'')} onChange={e=>patch({text:e.target.value})} style={{...valueInput,height:54,textAlign:'left',resize:'vertical'}}/>
      <select value={String(payload.fontFamily??'Outfit')} onChange={e=>patch({fontFamily:e.target.value})} style={{...valueInput,height:30,marginTop:4}}>
        {['Outfit','Inter','Arial','Arial Black','Helvetica','Georgia','Times New Roman','Courier New','Impact'].map(font=><option key={font}>{font}</option>)}
      </select>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:4,marginTop:4}}>
        {(['left','center','right'] as const).map(align=><button key={align} style={{...miniButton,background:String(payload.textAlign??'center')===align?BLUE:'#fff'}} onClick={()=>patch({textAlign:align})}>{align}</button>)}
      </div>
    </div>:null}

    {isShape?<div style={{marginTop:10}}>
      <div style={sectionLabel}>SHAPE</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:4}}>
        {['rect','circle','polygon'].map(shape=><button key={shape} style={{...miniButton,background:String(payload.shape??'rect')===shape?ORANGE:'#fff'}} onClick={()=>patch({shape})}>{shape}</button>)}
      </div>
    </div>:null}

    {isMedia?<div style={{marginTop:10}}>
      <div style={sectionLabel}>MEDIA</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:4}}>
        {['cover','contain'].map(fit=><button key={fit} style={{...miniButton,background:String(payload.fit??'cover')===fit?YELLOW:'#fff'}} onClick={()=>patch({fit})}>{fit}</button>)}
      </div>
      {String(payload.mediaKind??'')==='video'?<button style={{...miniButton,width:'100%',marginTop:4,background:Boolean(payload.muted)?'#fff':GREEN}} onClick={()=>patch({muted:!Boolean(payload.muted)})}>{Boolean(payload.muted)?'UNMUTE VIDEO':'MUTE VIDEO'}</button>:null}
    </div>:null}

    {isAudio?<div style={{marginTop:10}}>
      <div style={sectionLabel}>AUDIO</div>
      <HoldStepper label="VOLUME" value={audioVolume} min={0} max={1} step={.01} precision={2} onChange={volume=>patch({volume})}/>
      <HoldStepper label="PLAYBACK RATE" value={audioRate} min={.1} max={4} step={.1} precision={1} suffix="×" onChange={playbackRate=>patch({playbackRate})}/>
      <button style={{...miniButton,width:'100%',marginTop:4,background:Boolean(payload.muted)?'#fff':BLUE}} onClick={()=>patch({muted:!Boolean(payload.muted)})}>{Boolean(payload.muted)?'UNMUTE':'MUTE'}</button>
    </div>:null}

    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:4,marginTop:10}}>
      <button style={miniButton} onClick={()=>store.dispatch({type:'splitClipAtPlayhead',id:clip.id})}>Split</button>
      <button style={miniButton} onClick={()=>store.dispatch({type:'duplicateClip',id:clip.id})}>Duplicate</button>
      <button style={{...miniButton,background:'#fa618a'}} onClick={()=>store.dispatch({type:'deleteClips',ids:[clip.id]})}>Delete</button>
    </div>
  </div>;
}

export const ClipSettingsPanel:React.FC<{store:EditorStore;onNavigate?:(page:EditorNavPage)=>void}>=({store,onNavigate})=>{
  const imageRef=useRef<HTMLInputElement>(null);
  const videoRef=useRef<HTMLInputElement>(null);
  const audioRef=useRef<HTMLInputElement>(null);

  return <div style={{minWidth:196,width:'100%',display:'grid',alignContent:'start',justifyItems:'start'}}>
    <div style={{
      boxSizing:'border-box',border:`2px solid ${BLACK}`,padding:12,position:'relative',
      background:'#fff',borderRadius:8,width:220,minWidth:220,overflow:'visible',
    }}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:8,width:196,marginBottom:12}}>
        <button style={{...addButtonBase,background:MAGENTA}} onClick={()=>createLayerClip(store,'text')}>TEXT</button>
        <button style={{...addButtonBase,background:ORANGE}} onClick={()=>createLayerClip(store,'shape')}><RectangleHorizontal size={14}/>SHAPE</button>
        <button style={{...addButtonBase,background:YELLOW}} onClick={()=>imageRef.current?.click()}><Circle size={14}/>IMAGE</button>
        <button style={{...addButtonBase,background:GREEN}} onClick={()=>videoRef.current?.click()}><Video size={14}/>VIDEO</button>
        <button style={{...addButtonBase,background:BLUE}} onClick={()=>audioRef.current?.click()}><Upload size={14}/>AUDIO</button>
        <button style={{...addButtonBase,background:PURPLE,color:'#fff'}} onClick={()=>onNavigate?.('templates')}><Sparkles size={14}/>TEMPLATE</button>
      </div>

      <input ref={imageRef} type="file" accept="image/*" hidden onChange={e=>{const file=e.target.files?.[0];e.target.value='';if(file)void addFileClip(store,file,'image')}}/>
      <input ref={videoRef} type="file" accept="video/*,.mp4,.mov,.webm,.m4v" hidden onChange={e=>{const file=e.target.files?.[0];e.target.value='';if(file)void addFileClip(store,file,'video')}}/>
      <input ref={audioRef} type="file" accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg" hidden onChange={e=>{const file=e.target.files?.[0];e.target.value='';if(file)void addFileClip(store,file,'audio')}}/>

      <SelectedClipSettings store={store} onNavigate={onNavigate}/>
    </div>

    <div style={{boxSizing:'border-box',border:`2px solid ${BLACK}`,padding:8,background:'#fff',borderRadius:8,width:220,minWidth:220,marginTop:8}}>
      <div style={{fontSize:10,fontWeight:900,textTransform:'uppercase',marginBottom:6}}>PROJECT CLIPS</div>
      <div style={{display:'grid',gap:4,maxHeight:140,overflow:'auto'}}>
        {store.state.project.clips.map(clip=>{
          const layer=clip.layerId?store.layerById(String(clip.layerId)):undefined;
          const selected=store.state.selection.clipIds.includes(clip.id);
          return <button key={clip.id} style={{...miniButton,textAlign:'left',background:selected?BLUE:'#fff',overflow:'hidden'}} onClick={()=>store.dispatch({type:'selectClip',id:clip.id})}>
            <span style={{display:'block',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{String(layer?.payload?.layerName??clip.id)}</span>
            <span style={{display:'block',fontSize:7,opacity:.65}}>{String(layer?.type??store.trackById(clip.trackId)?.kind??'clip').toUpperCase()} · {clip.start.toFixed(1)}–{clip.end.toFixed(1)}s</span>
          </button>;
        })}
        {!store.state.project.clips.length?<div style={{fontSize:9,fontWeight:900,opacity:.55}}>NO CLIPS YET</div>:null}
      </div>
    </div>
  </div>;
};
