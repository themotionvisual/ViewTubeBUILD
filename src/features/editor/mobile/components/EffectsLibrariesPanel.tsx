import React,{useMemo,useState} from 'react';
import {
  Aperture,ArrowDown,ArrowUp,Boxes,Eye,EyeOff,Heart,History,RotateCcw,Search,Settings2,Sparkles,WandSparkles,
} from 'lucide-react';
import type {EditorStore} from '../state/editorState';
import {assetRegistry} from '../../../../remotion-editor/src/assets/catalog';
import {createAssetTimelineObject} from '../../../../remotion-editor/src/assets/editorAdapter';
import type {AssetDefinition} from '../../../../remotion-editor/src/assets/types';
import {AcceleratingStepper as HoldStepper} from './MobileEditorPrimitives';

const INK='#248b99',CYAN='#36E0F6',YELLOW='#FFFF61',PINK='#FA618A';
const card:React.CSSProperties={border:`2px solid ${INK}`,borderRadius:7,background:'#fff',padding:7,marginBottom:7,boxShadow:'2px 2px 0 rgba(54,224,246,.22)'};
const btn=(active=false):React.CSSProperties=>({
  minHeight:30,border:`2px solid ${INK}`,borderRadius:5,background:active?CYAN:'#fff',
  color:'#111',fontSize:8,fontWeight:1000,textTransform:'uppercase',padding:'4px 6px',
  display:'inline-flex',alignItems:'center',justifyContent:'center',gap:5,
});

function uid(prefix:string){return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`}

const FX_DEFS=[
  {key:'blur',label:'Blur',min:0,max:40,step:.25,precision:2,defaultValue:0},
  {key:'saturation',label:'Saturation',min:0,max:3,step:.05,precision:2,defaultValue:1},
  {key:'brightness',label:'Brightness',min:0,max:3,step:.05,precision:2,defaultValue:1},
  {key:'hue',label:'Hue',min:-180,max:180,step:2,precision:0,defaultValue:0},
  {key:'opacity',label:'Opacity',min:0,max:1,step:.02,precision:2,defaultValue:1},
] as const;
const DEFAULT_FX_ORDER=FX_DEFS.map(def=>def.key);
const FAVORITES_KEY='viewtube.editor.asset-favorites.v1';
const RECENTS_KEY='viewtube.editor.asset-recents.v1';

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
  const bypass=Boolean(payload.fxBypass);
  const disabled=(payload.fxDisabled&&typeof payload.fxDisabled==='object'?payload.fxDisabled:{}) as Record<string,boolean>;
  const rawOrder=Array.isArray(payload.fxOrder)?payload.fxOrder.map(String):DEFAULT_FX_ORDER;
  const order=[...rawOrder.filter(key=>DEFAULT_FX_ORDER.includes(key as typeof DEFAULT_FX_ORDER[number])),...DEFAULT_FX_ORDER.filter(key=>!rawOrder.includes(key))];
  const moveFx=(key:string,direction:-1|1)=>{
    const index=order.indexOf(key);if(index<0)return;
    const next=[...order],target=Math.max(0,Math.min(next.length-1,index+direction));
    if(target===index)return;
    const[moved]=next.splice(index,1);next.splice(target,0,moved);
    patch({fxOrder:next});
  };
  const toggleFx=(key:string)=>patch({fxDisabled:{...disabled,[key]:!disabled[key]}});
  return <>
    <section style={card}>
      <div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) auto',alignItems:'center',gap:5,marginBottom:6}}>
        <div style={{display:'flex',alignItems:'center',gap:6}}><Settings2 size={14}/><b style={{fontSize:10,textTransform:'uppercase'}}>Unified FX Rack</b></div>
        <button style={{...btn(bypass),background:bypass?PINK:'#fff',minHeight:26,padding:'2px 5px'}} onClick={()=>patch({fxBypass:!bypass})}>{bypass?<EyeOff size={11}/>:<Eye size={11}/>}Bypass</button>
      </div>
      <div style={{display:'grid',gap:3,marginBottom:6}}>
        {order.map((key,index)=>{
          const def=FX_DEFS.find(item=>item.key===key)!;
          const off=Boolean(disabled[key]);
          return <div key={key} style={{display:'grid',gridTemplateColumns:'24px minmax(0,1fr) 22px 22px',gap:3,alignItems:'center',border:`1.5px solid ${INK}`,borderRadius:5,padding:3,background:off?'#f4f4f4':'#fff'}}>
            <button title={off?`Enable ${def.label}`:`Disable ${def.label}`} aria-label={off?`Enable ${def.label}`:`Disable ${def.label}`} onClick={()=>toggleFx(key)} style={{...btn(!off),minHeight:22,width:22,padding:0}}>{off?<EyeOff size={10}/>:<Eye size={10}/>}</button>
            <span style={{fontSize:8,fontWeight:1000,textTransform:'uppercase',opacity:off?.45:1}}>{index+1}. {def.label}</span>
            <button disabled={index===0} title="Move effect up" aria-label="Move effect up" onClick={()=>moveFx(key,-1)} style={{...btn(false),minHeight:22,width:22,padding:0,opacity:index===0?.3:1}}><ArrowUp size={9}/></button>
            <button disabled={index===order.length-1} title="Move effect down" aria-label="Move effect down" onClick={()=>moveFx(key,1)} style={{...btn(false),minHeight:22,width:22,padding:0,opacity:index===order.length-1?.3:1}}><ArrowDown size={9}/></button>
          </div>;
        })}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:5}}>
        {CLIP_PRESETS.map(preset=><button key={preset.name} style={btn(false)} onClick={()=>patch({...preset.patch,fxBypass:false,fxDisabled:{}})}>{preset.name}</button>)}
      </div>
      <button style={{...btn(false),width:'100%',marginTop:5}} onClick={()=>patch({blur:0,saturation:1,brightness:1,hue:0,opacity:1,fxBypass:false,fxDisabled:{},fxOrder:DEFAULT_FX_ORDER})}><RotateCcw size={12}/>Reset FX</button>
    </section>
    <section style={card}>
      <div style={{fontSize:9,fontWeight:1000,textTransform:'uppercase',marginBottom:6}}>Adjust</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:'0 8px'}}>
        {order.map(key=>{
          const def=FX_DEFS.find(item=>item.key===key)!;
          return <div key={key} style={{opacity:bypass||disabled[key]?.42:1}}>
            <HoldStepper label={def.label} value={number(def.key,def.defaultValue)} min={def.min} max={def.max} step={def.step} precision={def.precision} defaultValue={def.defaultValue} onChange={value=>patch({[def.key]:value})}/>
          </div>;
        })}
      </div>
    </section>
  </>;
}

function AssetMiniPreview({asset}:{asset:AssetDefinition}){
  const d=asset.defaults;
  const accent=d.accentColor,primary=d.primaryColor,secondary=d.secondaryColor,bg=d.backgroundColor;
  const family=asset.family;
  const lines=Array.from({length:6},(_,index)=>index);
  return <div style={{height:48,borderRadius:4,border:`1.5px solid ${INK}`,background:bg,position:'relative',overflow:'hidden',display:'grid',placeItems:'center'}}>
    <svg viewBox="0 0 100 56" width="100%" height="100%" preserveAspectRatio="none" aria-label={asset.name}>
      <rect width="100" height="56" fill={bg}/>
      {family.includes('grid')||family==='technical'||family==='hud'?<>
        {lines.map(i=><line key={'v'+i} x1={10+i*16} y1="0" x2={10+i*16} y2="56" stroke={i%2?primary:secondary} strokeWidth=".7" opacity=".65"/>)}
        {lines.map(i=><line key={'h'+i} x1="0" y1={6+i*10} x2="100" y2={6+i*10} stroke={i%2?secondary:primary} strokeWidth=".5" opacity=".55"/>)}
        <circle cx="50" cy="28" r="12" fill="none" stroke={accent} strokeWidth="2"/>
      </>:family.includes('orbit')||family==='rings'||family==='radial-light'?<>
        {[8,14,20,26].map(r=><circle key={r} cx="50" cy="28" r={r} fill="none" stroke={r%16?primary:secondary} strokeWidth=".8" opacity=".7"/>)}
        <circle cx="50" cy="28" r="4" fill={accent}/>
      </>:family==='dot-matrix'||family==='halftone'||family==='particles'||family==='star-field'?<>
        {Array.from({length:24},(_,i)=><circle key={i} cx={5+(i*17)%92} cy={5+(i*13)%48} r={i%5===0?2:1} fill={i%3===0?accent:i%2?primary:secondary}/>)}
      </>:family==='stripes'||family==='line-field'||family==='wave-field'?<>
        {lines.map(i=><path key={i} d={`M -5 ${7+i*9} Q 28 ${i%2?2:16+i*6} 52 ${7+i*9} T 105 ${7+i*9}`} fill="none" stroke={i%3===0?accent:i%2?primary:secondary} strokeWidth={i%3===0?2:1}/>)}
      </>:family==='editorial'||family==='kinetic-layout'||family==='split-screen'?<>
        <rect x="7" y="7" width="52" height="10" fill={primary}/><rect x="7" y="22" width="31" height="5" fill={accent}/>
        <rect x="44" y="22" width="49" height="25" fill={secondary} opacity=".55"/><rect x="7" y="32" width="30" height="15" fill={primary} opacity=".25"/>
      </>:<>
        <defs><linearGradient id={'g'+asset.id.replace(/-/g,'')} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={primary}/><stop offset=".55" stopColor={secondary}/><stop offset="1" stopColor={accent}/></linearGradient></defs>
        <rect x="5" y="5" width="90" height="46" rx="10" fill={`url(#g${asset.id.replace(/-/g,'')})`} opacity=".9"/>
      </>}
    </svg>
    <span style={{position:'absolute',right:3,bottom:3,width:16,height:16,border:`1.5px solid ${INK}`,borderRadius:4,background:'rgba(255,255,255,.88)',display:'grid',placeItems:'center'}}>{iconForAsset(asset)}</span>
  </div>;
}

function iconForAsset(asset:AssetDefinition){
  if(asset.category==='technical'||asset.category==='data')return <Aperture size={14}/>;
  if(asset.type==='motion')return <WandSparkles size={14}/>;
  return <Boxes size={14}/>;
}

function VisualEffects({store}:{store:EditorStore}){
  const[kind,setKind]=useState<'all'|'static'|'motion'>('all');
  const[collection,setCollection]=useState<'all'|'favorites'|'recent'>('all');
  const[query,setQuery]=useState('');
  const[favorites,setFavorites]=useState<string[]>(()=>{
    if(typeof window==='undefined')return[];
    try{const raw=JSON.parse(localStorage.getItem(FAVORITES_KEY)||'[]');return Array.isArray(raw)?raw:[]}catch{return[]}
  });
  const[recent,setRecent]=useState<string[]>(()=>{
    if(typeof window==='undefined')return[];
    try{const raw=JSON.parse(localStorage.getItem(RECENTS_KEY)||'[]');return Array.isArray(raw)?raw:[]}catch{return[]}
  });
  const filtered=useMemo(()=>assetRegistry.filter(asset=>{
    if(kind!=='all'&&asset.type!==kind)return false;
    if(collection==='favorites'&&!favorites.includes(asset.id))return false;
    if(collection==='recent'&&!recent.includes(asset.id))return false;
    const hay=[asset.name,asset.category,asset.family,...asset.tags].join(' ').toLowerCase();
    return hay.includes(query.trim().toLowerCase());
  }).sort((a,b)=>collection==='recent'?recent.indexOf(a.id)-recent.indexOf(b.id):a.name.localeCompare(b.name)),[kind,collection,query,favorites,recent]);
  const toggleFavorite=(id:string)=>{
    const next=favorites.includes(id)?favorites.filter(item=>item!==id):[id,...favorites];
    setFavorites(next);if(typeof window!=='undefined')localStorage.setItem(FAVORITES_KEY,JSON.stringify(next));
  };
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
    const next=[asset.id,...recent.filter(id=>id!==asset.id)].slice(0,24);
    setRecent(next);if(typeof window!=='undefined')localStorage.setItem(RECENTS_KEY,JSON.stringify(next));
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
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:3,marginBottom:5}}>
      <button style={btn(collection==='all')} onClick={()=>setCollection('all')}><Boxes size={10}/>All</button>
      <button style={btn(collection==='favorites')} onClick={()=>setCollection('favorites')}><Heart size={10}/>Favorites</button>
      <button style={btn(collection==='recent')} onClick={()=>setCollection('recent')}><History size={10}/>Recent</button>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:5,maxHeight:360,overflowY:'auto',overflowX:'hidden'}}>
      {filtered.map(asset=><div key={asset.id} style={{
        minWidth:0,border:`2px solid ${INK}`,borderRadius:6,background:'#fff',padding:5,textAlign:'left',
        boxShadow:'2px 2px 0 rgba(54,224,246,.22)',position:'relative',
      }}>
        <button title={favorites.includes(asset.id)?'Remove favorite':'Add favorite'} aria-label={favorites.includes(asset.id)?'Remove favorite':'Add favorite'} onClick={()=>toggleFavorite(asset.id)} style={{position:'absolute',right:8,top:8,zIndex:3,...btn(favorites.includes(asset.id)),width:22,height:22,minHeight:22,padding:0}}><Heart size={10}/></button>
        <button onClick={()=>add(asset)} style={{width:'100%',border:0,background:'transparent',padding:0,textAlign:'left'}}>
          <AssetMiniPreview asset={asset}/>
          <div style={{fontSize:8,fontWeight:1000,textTransform:'uppercase',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',marginTop:4}}>{asset.name}</div>
          <div style={{fontSize:6,fontWeight:900,opacity:.55,textTransform:'uppercase'}}>{asset.type} · {asset.family}</div>
        </button>
      </div>)}
      {!filtered.length?<div style={{gridColumn:'1/-1',fontSize:9,fontWeight:900,opacity:.55,padding:8}}>No visual effects match this view.</div>:null}
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
