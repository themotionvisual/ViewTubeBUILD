import React from 'react';
import type {EditorStore} from '../state/editorState';
import {readClipVisualTransform} from '../state/editorState';
import {TemplateLibraryPanel} from './TemplateLibraryPanel';
import {renderPanelBody} from './PanelBodies';
import {EditorFeatureManifest} from './EditorFeatureManifest';
import {capabilitiesForCategory,type EditorCapabilityStatus} from '../../editorCapabilities';

export type EditorNavPage='select'|'media'|'text'|'audio'|'graphics'|'effects'|'transitions'|'templates'|'export'|'settings';

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
  if(track)return <><Section name="Track"><b>{track.name}</b><div>{track.kind.toUpperCase()} · {store.clipsOnTrack(track.id).length} clips</div></Section><Section name="Track Controls"><Grid cols={3}><button style={button} onClick={()=>store.dispatch({type:'muteTrack',id:track.id})}>{track.muted?'Unmute':'Mute'}</button><button style={button} onClick={()=>store.dispatch({type:'lockTrack',id:track.id})}>{track.locked?'Unlock':'Lock'}</button><button style={button} onClick={()=>store.dispatch({type:'hideTrack',id:track.id})}>{track.hidden?'Show':'Hide'}</button></Grid></Section></>;
  if(transition)return <><Section name="Transition"><b>{transition.leftClipId} → {transition.rightClipId}</b></Section><Section name="Transition Controls"><Grid><button style={button} onClick={()=>store.dispatch({type:'openPanel',id:'transitions'})}>Edit</button><button style={{...button,background:PINK}} onClick={()=>store.dispatch({type:'removeTransition',id:store.state.selection.transitionId!})}>Remove</button></Grid></Section></>;
  if(!clip)return <Section name="Clip Inspector"><div style={{fontSize:10,fontWeight:800,opacity:.6,marginBottom:6}}>Select a clip, track, or transition from the timeline or Clips page.</div><CapabilityGrid category="edit"/></Section>;
  const v=readClipVisualTransform(clip),set=(patch:any)=>store.dispatch({type:'updateClipTransform',id:clip.id,patch});
  return <>
    <Section name="Clip"><b>{String(clip.id)}</b><div>{clip.start.toFixed(2)}s → {clip.end.toFixed(2)}s · {store.trackById(clip.trackId)?.kind??'clip'}</div></Section>
    <Section name="Transform"><Grid><NumberField label="X" value={v.x} step={1} onChange={x=>set({x})}/><NumberField label="Y" value={v.y} step={1} onChange={y=>set({y})}/><NumberField label="SCALE X" value={v.scaleX} onChange={scaleX=>set({scaleX})}/><NumberField label="SCALE Y" value={v.scaleY} onChange={scaleY=>set({scaleY})}/><NumberField label="ROTATION" value={v.rotation} step={1} onChange={rotation=>set({rotation})}/><NumberField label="OPACITY" value={v.opacity} onChange={opacity=>set({opacity})}/></Grid><button style={{...button,width:'100%',marginTop:5}} onClick={()=>store.dispatch({type:'resetClipTransform',id:clip.id})}>Reset Transform</button></Section>
    <Section name="Crop"><Grid><NumberField label="LEFT" value={v.cropLeft} onChange={cropLeft=>set({cropLeft})}/><NumberField label="RIGHT" value={v.cropRight} onChange={cropRight=>set({cropRight})}/><NumberField label="TOP" value={v.cropTop} onChange={cropTop=>set({cropTop})}/><NumberField label="BOTTOM" value={v.cropBottom} onChange={cropBottom=>set({cropBottom})}/></Grid></Section>
    <Section name="Clip Actions"><Grid cols={3}><button style={button} onClick={()=>store.dispatch({type:'splitClipAtPlayhead',id:clip.id})}>Split</button><button style={button} onClick={()=>store.dispatch({type:'duplicateClip',id:clip.id})}>Duplicate</button><button style={button} onClick={()=>store.dispatch({type:'openPanel',id:'trim'})}>Trim</button><button style={{...button,background:PINK}} onClick={()=>store.dispatch({type:'deleteClips',ids:[clip.id]})}>Delete</button></Grid></Section>
  </>;
}

function Clips({store,onNavigate}:{store:EditorStore;onNavigate?:(page:EditorNavPage)=>void}){
  const addText=()=>{
    const id=`text_${Date.now().toString(36)}`;
    store.dispatch({type:'addClip',clip:{id,trackId:'t_overlay',start:store.state.playheadSec,end:Math.min(store.state.project.durationSec,store.state.playheadSec+2),text:'New text'}});
    store.dispatch({type:'selectClip',id});
    onNavigate?.('text');
  };
  return <>
    <Section name="Add To Project">
      <Grid cols={4}>
        <button style={button} disabled title="Connect the canonical media importer/Vault handoff first">Video</button>
        <button style={button} disabled title="Connect the canonical media importer/Vault handoff first">Image</button>
        <button style={button} disabled title="Connect the canonical media importer/Vault handoff first">Audio</button>
        <button style={{...button,background:CYAN}} onClick={addText}>Text</button>
        <button style={button} disabled title="Shape layer adapter still needs canonical layer serialization">Shape</button>
        <button style={button} onClick={()=>onNavigate?.('graphics')}>SVG</button>
        <button style={{...button,background:YELLOW}} onClick={()=>onNavigate?.('templates')}>Background</button>
        <button style={button} disabled title="Vault-to-editor asset handoff is the canonical source path">Vault</button>
      </Grid>
      <div style={{fontSize:8,fontWeight:800,marginTop:6,opacity:.65}}>Disabled source buttons are intentionally not fake imports. They activate when the canonical media/Vault handoff is connected.</div>
    </Section>
    <Section name="Project Clips">
      <div style={{display:'grid',gap:5}}>
        {store.state.project.clips.map(c=><button key={c.id} style={{...button,textAlign:'left',background:store.state.selection.clipIds.includes(c.id)?CYAN:'#fff'}} onClick={()=>store.dispatch({type:'selectClip',id:c.id})}><b>{String(c.id)}</b><small style={{display:'block',fontSize:7}}>{store.trackById(c.trackId)?.kind??'clip'} · {c.start.toFixed(1)}–{c.end.toFixed(1)}s</small></button>)}
        {!store.state.project.clips.length&&<div style={{fontSize:10,fontWeight:800,opacity:.55}}>No timeline clips yet.</div>}
      </div>
    </Section>
    <Section name="Media Capabilities"><CapabilityGrid category="media"/></Section>
  </>;
}

function Settings({model}:{model?:EditorSettingsModel}){
  if(!model)return <><Section name="Editor Settings">Host-controlled settings.</Section><Section name="Feature System"><EditorFeatureManifest compact category="settings"/></Section></>;
  return <>
    <Section name="Interface"><Grid cols={3}>{(['auto','mobile','desktop']as const).map(v=><button key={v} style={{...button,background:model.frontend===v?CYAN:'#fff'}} onClick={()=>model.onFrontend(v)}>{v}</button>)}</Grid></Section>
    <Section name="Phone Layout"><b>Automatic · follows device orientation</b></Section>
    <Section name="Video"><Grid>{(['portrait','landscape']as const).map(v=><button key={v} style={{...button,background:model.aspect===v?CYAN:'#fff'}} onClick={()=>model.onAspect(v)}>{v==='portrait'?'9:16':'16:9'}</button>)}</Grid></Section>
    <Section name="Editor Style"><Grid>{model.styleOptions.map(o=><button key={o.id} style={{...button,background:model.style===o.id?YELLOW:'#fff'}} onClick={()=>model.onStyle(o.id)}>{o.shortLabel||o.label}</button>)}</Grid></Section>
    <Section name="Feature System"><EditorFeatureManifest compact category="settings"/></Section>
  </>;
}

export const EditorNavigationPage:React.FC<{page:EditorNavPage;store:EditorStore;settings?:EditorSettingsModel;onNavigate?:(page:EditorNavPage)=>void}>=({page,store,settings,onNavigate})=>{
  if(page==='select')return <Inspector store={store}/>;
  if(page==='media')return <Clips store={store} onNavigate={onNavigate}/>;
  if(page==='graphics')return <TemplateLibraryPanel store={store} initialCategory="graphic" title="Graphics & SVG"/>;
  if(page==='templates')return <TemplateLibraryPanel store={store}/>;
  if(page==='settings')return <Settings model={settings}/>;
  return <div>{renderPanelBody(page,store)}</div>;
};

export const EDITOR_NAV_ITEMS:Array<{id:EditorNavPage;label:string;icon:string}>=[
  {id:'media',label:'Clips',icon:'▣'},
  {id:'select',label:'Inspect',icon:'⌖'},
  {id:'text',label:'Text',icon:'T'},
  {id:'audio',label:'Audio',icon:'♫'},
  {id:'graphics',label:'Graphics',icon:'◆'},
  {id:'effects',label:'Effects',icon:'✧'},
  {id:'transitions',label:'Transitions',icon:'⋈'},
  {id:'templates',label:'Templates',icon:'▦'},
  {id:'export',label:'Export',icon:'⇧'},
  {id:'settings',label:'Settings',icon:'⚙'},
];
