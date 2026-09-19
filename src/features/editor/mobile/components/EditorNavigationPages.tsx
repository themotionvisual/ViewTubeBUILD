import React from 'react';
import {AudioLines,Film,FolderKanban,LayoutTemplate,ScanSearch,Settings as SettingsIcon,Shapes,Shuffle,SlidersHorizontal,Type,Upload,WandSparkles} from 'lucide-react';
import type {EditorStore} from '../state/editorState';
import {readClipVisualTransform} from '../state/editorState';
import {TemplateLibraryPanel} from './TemplateLibraryPanel';
import {renderPanelBody} from './PanelBodies';
import {EditorFeatureManifest} from './EditorFeatureManifest';
import {EditorViewSwitcher} from './EditorViewSwitcher';
import {ClipSettingsPanel} from './ClipSettingsPanel';
import {ProjectSettingsPanel} from './ProjectSettingsPanel';
import {EffectsLibrariesPanel} from './EffectsLibrariesPanel';
import {CustomTemplatePanel} from './CustomTemplatePanel';
import {capabilitiesForCategory,type EditorCapabilityStatus} from '../../editorCapabilities';

export type EditorNavPage='project'|'select'|'media'|'text'|'audio'|'graphics'|'effects'|'transitions'|'templates'|'custom-templates'|'export'|'settings';

export interface EditorSettingsModel{
  frontend:'auto'|'mobile'|'desktop';
  layout?:'auto'|'portrait'|'landscape';
  aspect:'portrait'|'landscape';
  style:string;
  styleOptions:Array<{id:string;label:string;shortLabel?:string}>;
  onFrontend:(v:'auto'|'mobile'|'desktop')=>void;
  onLayout?:(v:'auto'|'portrait'|'landscape')=>void;
  onAspect:(v:'portrait'|'landscape')=>void;
  onStyle:(v:string)=>void;
  onBackToSite?:()=>void;
}

const CYAN='#36E0F6',INK='#248b99',YELLOW='#FFFF61',PINK='#FA618A';
const card:React.CSSProperties={border:`2px solid ${INK}`,borderRadius:6,background:'#fff',padding:8,boxShadow:'2px 2px 0 rgba(54,224,246,.22)',marginBottom:6};
const title:React.CSSProperties={fontSize:10,fontWeight:900,textTransform:'uppercase',letterSpacing:.7,marginBottom:6};
const button:React.CSSProperties={minHeight:34,border:`2px solid ${INK}`,borderRadius:5,background:'#fff',color:'#000',fontSize:9,fontWeight:900,textTransform:'uppercase',padding:'5px 8px'};
const field:React.CSSProperties={width:'100%',height:34,border:`2px solid ${INK}`,borderRadius:5,background:'#fff',fontSize:10,fontWeight:800,padding:'0 7px',boxSizing:'border-box'};
const Section:React.FC<React.PropsWithChildren<{name:string}>>=({name,children})=><section style={card}><div style={title}>{name}</div>{children}</section>;
const Grid:React.FC<React.PropsWithChildren<{cols?:number}>>=({cols=2,children})=><div style={{display:'grid',gridTemplateColumns:`repeat(${cols},minmax(0,1fr))`,gap:5}}>{children}</div>;
const statusLabel:Record<EditorCapabilityStatus,string>={active:'ACTIVE',available:'AVAILABLE',planned:'PLANNED'};
const CapabilityGrid=({category}:{category:'edit'|'media'|'settings'})=><Grid>{capabilitiesForCategory(category).map(c=><div key={c.id} style={{...button,opacity:c.status==='planned'?.5:1}}>{c.label}<div style={{fontSize:6}}>{statusLabel[c.status]}</div></div>)}</Grid>;
const NumberField=({label,value,step=.01,onChange}:{label:string;value:number;step?:number;onChange:(n:number)=>void})=><label style={{fontSize:8,fontWeight:900}}>{label}<input type="number" step={step} style={field} value={Number(value.toFixed(3))} onChange={e=>{const n=Number(e.target.value);if(Number.isFinite(n))onChange(n)}}/></label>;

function Inspector({store}:{store:EditorStore}){
  const clip=store.selectedClips[0];
  const track=store.state.selection.trackId?store.trackById(store.state.selection.trackId):undefined;
  const transition=store.state.selection.transitionId?(store.state.project.transitions??[]).find((t,i)=>String((t as{id?:unknown}).id??`${t.leftClipId}-${t.rightClipId}-${i}`)===store.state.selection.transitionId):undefined;
  if(track)return <Section name="Track"><b>{track.name}</b><div>{track.kind.toUpperCase()} · {store.clipsOnTrack(track.id).length} clips</div><div style={{fontSize:8,fontWeight:800,opacity:.6,marginTop:5}}>Track mute, lock, hide and removal live in the timeline row controls.</div></Section>;
  if(transition)return <><Section name="Transition"><b>{transition.leftClipId} → {transition.rightClipId}</b></Section><Section name="Transition Controls"><Grid><button style={button} onClick={()=>store.dispatch({type:'openPanel',id:'transitions'})}>Edit</button><button style={{...button,background:PINK}} onClick={()=>store.dispatch({type:'removeTransition',id:store.state.selection.transitionId!})}>Remove</button></Grid></Section></>;
  if(!clip)return <Section name="Clip Inspector"><div style={{fontSize:10,fontWeight:800,opacity:.6,marginBottom:6}}>Select a clip, track, or transition from the timeline or Clips page.</div><CapabilityGrid category="edit"/></Section>;
  const v=readClipVisualTransform(clip),set=(patch:any)=>store.dispatch({type:'updateClipTransform',id:clip.id,patch});
  return <>
    <Section name="Clip"><b>{String(clip.id)}</b><div>{clip.start.toFixed(2)}s → {clip.end.toFixed(2)}s · {store.trackById(clip.trackId)?.kind??'clip'}</div></Section>
    <Section name="Transform"><Grid><NumberField label="X" value={v.x} step={1} onChange={x=>set({x})}/><NumberField label="Y" value={v.y} step={1} onChange={y=>set({y})}/><NumberField label="SCALE X" value={v.scaleX} onChange={scaleX=>set({scaleX})}/><NumberField label="SCALE Y" value={v.scaleY} onChange={scaleY=>set({scaleY})}/><NumberField label="ROTATION" value={v.rotation} step={1} onChange={rotation=>set({rotation})}/><NumberField label="OPACITY" value={v.opacity} onChange={opacity=>set({opacity})}/></Grid><button style={{...button,width:'100%',marginTop:5}} onClick={()=>store.dispatch({type:'resetClipTransform',id:clip.id})}>Reset Transform</button></Section>
    <Section name="Crop"><Grid><NumberField label="LEFT" value={v.cropLeft} onChange={cropLeft=>set({cropLeft})}/><NumberField label="RIGHT" value={v.cropRight} onChange={cropRight=>set({cropRight})}/><NumberField label="TOP" value={v.cropTop} onChange={cropTop=>set({cropTop})}/><NumberField label="BOTTOM" value={v.cropBottom} onChange={cropBottom=>set({cropBottom})}/></Grid></Section>
  </>;
}

function Clips({store,onNavigate}:{store:EditorStore;onNavigate?:(page:EditorNavPage)=>void}){
  return <ClipSettingsPanel store={store} onNavigate={onNavigate}/>;
}

function Settings({model}:{model?:EditorSettingsModel}){
  if(!model)return <><Section name="Editor Settings">Host-controlled settings.</Section><Section name="Feature System"><EditorFeatureManifest compact category="settings"/></Section></>;
  return <>
    <Section name="Site"><button style={{...button,width:'100%',background:CYAN,display:'inline-flex',alignItems:'center',justifyContent:'center',gap:6}} onClick={()=>model.onBackToSite?.()}><Upload size={14} style={{transform:'rotate(-90deg)'}}/>Back to Site</button></Section>
    <Section name="Interface & Phone Layout"><EditorViewSwitcher frontend={model.frontend} layout={model.layout??'auto'} onFrontend={model.onFrontend} onLayout={model.onLayout??(()=>{})}/></Section>
    <Section name="Video"><Grid>{(['portrait','landscape']as const).map(v=><button key={v} style={{...button,background:model.aspect===v?CYAN:'#fff'}} onClick={()=>model.onAspect(v)}>{v==='portrait'?'9:16':'16:9'}</button>)}</Grid></Section>
    <Section name="Editor Style"><Grid>{model.styleOptions.map(o=><button key={o.id} style={{...button,background:model.style===o.id?YELLOW:'#fff'}} onClick={()=>model.onStyle(o.id)}>{o.shortLabel||o.label}</button>)}</Grid></Section>
    <Section name="Feature System"><EditorFeatureManifest compact category="settings"/></Section>
  </>;
}

export const EditorNavigationPage:React.FC<{page:EditorNavPage;store:EditorStore;settings?:EditorSettingsModel;onNavigate?:(page:EditorNavPage)=>void}>=({page,store,settings,onNavigate})=>{
  if(page==='project')return <ProjectSettingsPanel store={store}/>;
  if(page==='select')return <Inspector store={store}/>;
  if(page==='media')return <Clips store={store} onNavigate={onNavigate}/>;
  if(page==='graphics')return <TemplateLibraryPanel store={store} initialCategory="graphic" title="Graphics & SVG"/>;
  if(page==='effects')return <EffectsLibrariesPanel store={store}/>;
  if(page==='templates')return <TemplateLibraryPanel store={store}/>;
  if(page==='custom-templates')return <CustomTemplatePanel store={store}/>;
  if(page==='settings')return <Settings model={settings}/>;
  return <div>{renderPanelBody(page,store)}</div>;
};

export const EDITOR_NAV_ITEMS:Array<{id:EditorNavPage;label:string;icon:React.ReactNode}>=[
  {id:'project',label:'Project',icon:<FolderKanban size={13}/>},
  {id:'media',label:'Clips',icon:<Film size={13}/>},
  {id:'select',label:'Inspect',icon:<ScanSearch size={13}/>},
  {id:'text',label:'Text',icon:<Type size={13}/>},
  {id:'audio',label:'Audio',icon:<AudioLines size={13}/>},
  {id:'graphics',label:'Graphics',icon:<Shapes size={13}/>},
  {id:'effects',label:'Effects',icon:<SlidersHorizontal size={13}/>},
  {id:'transitions',label:'Transitions',icon:<Shuffle size={13}/>},
  {id:'templates',label:'Templates',icon:<LayoutTemplate size={13}/>},
  {id:'custom-templates',label:'Custom',icon:<WandSparkles size={13}/>},
  {id:'export',label:'Export',icon:<Upload size={13}/>},
  {id:'settings',label:'Settings',icon:<SettingsIcon size={13}/>},
];
