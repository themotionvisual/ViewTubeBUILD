import React,{useEffect,useMemo,useRef,useState} from 'react';
import {
  Aperture,Boxes,Minus,Plus,RotateCcw,Search,Settings2,Sparkles,WandSparkles,
} from 'lucide-react';
import type {EditorStore} from '../state/editorState';
import {assetRegistry} from '../../../remotion-editor/src/assets/catalog';
import {createAssetTimelineObject} from '../../../remotion-editor/src/assets/editorAdapter';
import type {AssetDefinition} from '../../../remotion-editor/src/assets/types';

const INK='#248b99',CYAN='#36E0F6',YELLOW='#FFFF61',PINK='#FA618A';
const card:React.CSSProperties={border:`2px solid ${INK}`,borderRadius:7,background:'#fff',padding:7,marginBottom:7,boxShadow:'2px 2px 0 rgba(54,224,246,.22)'};
const btn=(active=false):React.CSSProperties=>({
  minHeight:30,border:`2px solid ${INK}`,borderRadius:5,background:active?CYAN:'#fff',
  color:'#111',fontSize:8,fontWeight:1000,textTransform:'uppercase',padding:'4px 6px',
  display:'inline-flex',alignItems:'center',justifyContent:'center',gap:5,
});

function uid(prefix:string){return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`}

const HoldStepper:React.FC<{
  label:string;value:number;min:number;max:number;step:number;precision?:number;
  onChange:(value:number)=>void;
}>=({label,value,min,max,step,precision=2,onChange})=>{
  const timer=useRef<number|null>(null);
  const start=useRef(0);
  const valueRef=useRef(value);
  valueRef.current=value;
  const stop=()=>{if(timer.current!=null){window.clearTimeout(timer.current);timer.current=null}};
  useEffect(()=>stop,[]);
  const nudge=(dir:-1|1,elapsed=0)=>{
    const mult=elapsed>2800?10:elapsed>1700?5:elapsed>900?2:1;
    const next=Math.max(min,Math.min(max,valueRef.current+dir*step*mult));
    const fixed=Number(next.toFixed(precision));
    valueRef.current=fixed;onChange(fixed);
  };
  const repeat=(dir:-1|1)=>{
    const elapsed=performance.now()-start.current;
    nudge(dir,elapsed);
    timer.current=window.setTimeout(()=>repeat(dir),Math.max(42,210-elapsed/18));
  };
  const begin=(dir:-1|1,e:React.PointerEvent<HTMLButtonElement>)=>{
    e.preventDefault();e.currentTarget.setPointerCapture?.(e.pointerId);stop();
    start.current=performance.now();nudge(dir,0);timer.current=window.setTimeout(()=>repeat(dir),340);
  };
  return <div style={{width:'100%',maxWidth:136,marginBottom:6}}>
    <div style={{fontSize:8,fontWeight:1000,textTransform:'uppercase',marginBottom:2}}>{label}</div>
    <div style={{display:'grid',gridTemplateColumns:'26px minmax(48px,1fr) 26px'}}>
      <button style={{...btn(true),minHeight:26,padding:0,borderTopRightRadius:0,borderBottomRightRadius:0}} onPointerDown={e=>begin(-1,e)} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop}><Minus size={12}/></button>
      <div style={{height:26,borderTop:`2px solid ${INK}`,borderBottom:`2px solid ${INK}`,display:'grid',placeItems:'center',fontSize:9,fontWeight:1000,boxSizing:'border-box'}}>{value.toFixed(precision)}</div>
      <button style={{...btn(true),minHeight:26,padding:0,borderTopLeftRadius:0,borderBottomLeftRadius:0}} onPointerDown={e=>begin(1,e)} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop}><Plus size={12}/></button>
    </div>
  </div>;
};

const CLIP_PRESETS=[
  {name:'Clean',patch:{blur:0,saturation:1,brightness:1,hue:0,opacity:1}},
  {name:'Soft',patch:{blur:2,saturation:.9,brightness:1.04,hue:0,opacity:1}},
  {name:'Punch',patch:{blur:0,saturation:1.35,brightness:1.08,hue:0,opacity:1}},
  {name:'Muted',patch:{blur:0,saturation:.35,brightness:.96,hue:0,opacity:1}},
  {name:'Cool',patch:{blur:0,saturation:1.08,brightness:1,hue:20,opacity:1}},
  {name:'Warm',patch:{blur:0,saturation:1.12,brightness:1.03,hue:-18,opacity:1}},
] as const;

function ClipEffects({store}:{store:EditorStore}){
  const clip=store.selectedClips[0];
  const layer=store.selectedLayer;
  if(!clip||!layer)return <section style={card}><div style={{fontSize:10,fontWeight:1000,textTransform:'uppercase'}}>Clip FX</div><div style={{fontSize:9,fontWeight:800,opacity:.6,marginTop:5}}>Select a text, shape, image, video, audio-visual, or generated layer clip.</div></section>;
  const payload=layer.payload??{};
  const patch=(next:Record<string,unknown>)=>store.dispatch({type:'updateLayerPayload',id:layer.id,patch:next});
  const number=(key:string,fallback:number)=>Number.isFinite(Number(payload[key]))?Number(payload[key]):fallback;
  return <>
    <section style={card}>
      <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}><Settings2 size={14}/><b style={{fontSize:10,textTransform:'uppercase'}}>Engine Clip FX</b></div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:5}}>
        {CLIP_PRESETS.map(preset=><button key={preset.name} style={btn(false)} onClick={()=>patch({...preset.patch})}>{preset.name}</button>)}
      </div>
      <button style={{...btn(false),width:'100%',marginTop:5}} onClick={()=>patch({blur:0,saturation:1,brightness:1,hue:0,opacity:1})}><RotateCcw size={12}/>Reset FX</button>
    </section>
    <section style={card}>
      <div style={{fontSize:9,fontWeight:1000,textTransform:'uppercase',marginBottom:6}}>Adjust</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:'0 8px'}}>
        <HoldStepper label="Blur" value={number('blur',0)} min={0} max={40} step={.25} precision={2} onChange={blur=>patch({blur})}/>
        <HoldStepper label="Saturation" value={number('saturation',1)} min={0} max={3} step={.05} precision={2} onChange={saturation=>patch({saturation})}/>
        <HoldStepper label="Brightness" value={number('brightness',1)} min={0} max={3} step={.05} precision={2} onChange={brightness=>patch({brightness})}/>
        <HoldStepper label="Hue" value={number('hue',0)} min={-180} max={180} step={2} precision={0} onChange={hue=>patch({hue})}/>
        <HoldStepper label="Opacity" value={number('opacity',1)} min={0} max={1} step={.02} precision={2} onChange={opacity=>patch({opacity})}/>
      </div>
    </section>
  </>;
}

function iconForAsset(asset:AssetDefinition){
  if(asset.category==='technical'||asset.category==='data')return <Aperture size={14}/>;
  if(asset.type==='motion')return <WandSparkles size={14}/>;
  return <Boxes size={14}/>;
}

function VisualEffects({store}:{store:EditorStore}){
  const[kind,setKind]=useState<'all'|'static'|'motion'>('all');
  const[query,setQuery]=useState('');
  const filtered=useMemo(()=>assetRegistry.filter(asset=>{
    if(kind!=='all'&&asset.type!==kind)return false;
    const hay=[asset.name,asset.category,asset.family,...asset.tags].join(' ').toLowerCase();
    return hay.includes(query.trim().toLowerCase());
  }),[kind,query]);
  const add=(asset:AssetDefinition)=>{
    const trackId=store.state.project.tracks.find(track=>track.kind==='overlay')?.id
      ??store.state.project.tracks.find(track=>track.kind!=='audio')?.id
      ??store.state.project.tracks[0]?.id;
    if(!trackId)return;
    const token=uid(asset.id);
    const {layer,clip}=createAssetTimelineObject({
      assetId:asset.id,trackId,startSec:store.state.playheadSec,
      layerId:`asset_layer_${token}`,clipId:`asset_clip_${token}`,
      width:960,height:540,
    });
    store.dispatch({type:'addLayerClip',layer,clip});
  };
  return <section style={card}>
    <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}><Sparkles size={14}/><b style={{fontSize:10,textTransform:'uppercase'}}>Visual FX Library</b><span style={{marginLeft:'auto',fontSize:8,fontWeight:900,opacity:.55}}>{assetRegistry.length}</span></div>
    <div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) auto',gap:4,marginBottom:5}}>
      <label style={{position:'relative'}}>
        <Search size={12} style={{position:'absolute',left:6,top:9,pointerEvents:'none'}}/>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search FX" style={{width:'100%',height:30,border:`2px solid ${INK}`,borderRadius:5,boxSizing:'border-box',padding:'0 6px 0 23px',fontSize:9,fontWeight:900}}/>
      </label>
      <div style={{display:'flex',gap:3}}>
        {(['all','static','motion'] as const).map(value=><button key={value} style={{...btn(kind===value),padding:'3px 5px'}} onClick={()=>setKind(value)}>{value}</button>)}
      </div>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:5,maxHeight:320,overflowY:'auto',overflowX:'hidden'}}>
      {filtered.map(asset=><button key={asset.id} onClick={()=>add(asset)} style={{
        minWidth:0,border:`2px solid ${INK}`,borderRadius:6,background:'#fff',padding:6,textAlign:'left',
        boxShadow:'2px 2px 0 rgba(54,224,246,.22)',
      }}>
        <div style={{height:30,borderRadius:4,background:`linear-gradient(135deg,${asset.defaults.primaryColor},${asset.defaults.secondaryColor},${asset.defaults.accentColor})`,border:`1.5px solid ${INK}`,display:'grid',placeItems:'center',marginBottom:5}}>{iconForAsset(asset)}</div>
        <div style={{fontSize:8,fontWeight:1000,textTransform:'uppercase',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{asset.name}</div>
        <div style={{fontSize:6,fontWeight:900,opacity:.55,textTransform:'uppercase'}}>{asset.type} · {asset.family}</div>
      </button>)}
    </div>
  </section>;
}

export const EffectsLibrariesPanel:React.FC<{store:EditorStore}>=({store})=>{
  const[tab,setTab]=useState<'clip'|'visual'>('clip');
  return <div style={{width:'100%',minWidth:0,overflowX:'hidden'}}>
    <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:4,marginBottom:6}}>
      <button style={btn(tab==='clip')} onClick={()=>setTab('clip')}><Settings2 size={13}/>Clip FX</button>
      <button style={btn(tab==='visual')} onClick={()=>setTab('visual')}><Sparkles size={13}/>Visual FX</button>
    </div>
    {tab==='clip'?<ClipEffects store={store}/>:<VisualEffects store={store}/>}
  </div>;
};
