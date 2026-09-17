import React from 'react';
import {EDITOR_CAPABILITIES,type EditorCapabilityCategory,type EditorCapabilityStatus} from '../../editorCapabilities';

const INK='#248b99',CYAN='#36E0F6',YELLOW='#FFFF61',PINK='#FA618A';
const categories:EditorCapabilityCategory[]=['media','edit','text','audio','transitions','effects','templates','export','settings'];
const labels:Record<EditorCapabilityCategory,string>={media:'Media',edit:'Edit',text:'Text',audio:'Audio',transitions:'Transitions',effects:'Effects',templates:'Templates',export:'Export',settings:'Settings'};
const statusColor:Record<EditorCapabilityStatus,string>={active:CYAN,available:YELLOW,planned:'#ececec'};

export interface EditorFeatureManifestProps{compact?:boolean;category?:EditorCapabilityCategory;}

/** Visual source-of-truth surface for every registered editor capability. */
export const EditorFeatureManifest:React.FC<EditorFeatureManifestProps>=({compact=false,category})=>{
 const groups=(category?[category]:categories).map(id=>({id,items:EDITOR_CAPABILITIES.filter(c=>c.category===id)}));
 const counts=EDITOR_CAPABILITIES.reduce((a,c)=>(a[c.status]++,a),{active:0,available:0,planned:0} as Record<EditorCapabilityStatus,number>);
 return <div aria-label="Editor feature manifest" style={{display:'grid',gap:6,minWidth:0}}>
  {!compact&&<div style={{border:`3px solid ${INK}`,borderRadius:8,background:'#fff',boxShadow:'4px 4px 0 rgba(54,224,246,.28)',overflow:'hidden'}}>
   <div style={{padding:'7px 8px',background:CYAN,borderBottom:`2px solid ${INK}`,fontSize:11,fontWeight:950,textTransform:'uppercase'}}>Editor System Map</div>
   <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:4,padding:6}}>{(['active','available','planned'] as EditorCapabilityStatus[]).map(s=><div key={s} style={{border:`2px solid ${INK}`,borderRadius:5,padding:5,background:statusColor[s],textAlign:'center'}}><b style={{display:'block',fontSize:14}}>{counts[s]}</b><span style={{fontSize:7,fontWeight:900,textTransform:'uppercase'}}>{s}</span></div>)}</div>
  </div>}
  {groups.map(group=><section key={group.id} style={{border:`2px solid ${INK}`,borderRadius:6,background:'#fff',overflow:'hidden',boxShadow:'2px 2px 0 rgba(54,224,246,.2)'}}>
   <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'5px 7px',borderBottom:`2px solid ${INK}`,background:'#f8f8f8'}}><b style={{fontSize:9,textTransform:'uppercase'}}>{labels[group.id]}</b><span style={{fontSize:7,fontWeight:900}}>{group.items.length}</span></div>
   <div style={{display:'grid',gridTemplateColumns:compact?'repeat(2,minmax(0,1fr))':'repeat(auto-fit,minmax(88px,1fr))',gap:4,padding:5}}>{group.items.map(item=><div key={item.id} title={item.id} style={{minHeight:34,border:`2px solid ${INK}`,borderRadius:5,background:statusColor[item.status],padding:'4px 5px',display:'flex',flexDirection:'column',justifyContent:'space-between',opacity:item.status==='planned'?.7:1}}><b style={{fontSize:8,lineHeight:1.05,textTransform:'uppercase'}}>{item.label}</b><span style={{fontSize:6,fontWeight:900,textTransform:'uppercase'}}>{item.status}{item.action?' · action':''}</span></div>)}</div>
  </section>)}
  {!compact&&<div style={{border:`2px solid ${INK}`,borderRadius:6,padding:6,background:'#fff',fontSize:8,fontWeight:800}}><span style={{background:CYAN,padding:'2px 4px',borderRadius:3}}>ACTIVE</span> wired UI/state &nbsp; <span style={{background:YELLOW,padding:'2px 4px',borderRadius:3}}>AVAILABLE</span> engine/contract exists &nbsp; <span style={{background:'#ececec',padding:'2px 4px',borderRadius:3}}>PLANNED</span> visible roadmap, no fake control <span style={{color:PINK}}>●</span></div>}
 </div>;
};
