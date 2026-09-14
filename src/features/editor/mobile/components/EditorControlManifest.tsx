import React from'react';
import type{EditorStore}from'../state/editorState';
import{readClipVisualTransform}from'../state/editorState';
import{capabilitiesForCategory,type EditorCapabilityCategory}from'../../editorCapabilities';

const INK='#248b99',CYAN='#36E0F6',YELLOW='#FFFF61',PINK='#FA618A';
const box:React.CSSProperties={border:`2px solid ${INK}`,borderRadius:6,background:'#fff',padding:6,boxShadow:'2px 2px 0 rgba(54,224,246,.2)'};
const btn:React.CSSProperties={minHeight:28,border:`2px solid ${INK}`,borderRadius:5,background:'#fff',fontSize:8,fontWeight:900,textTransform:'uppercase',padding:'4px 6px'};
const grid:React.CSSProperties={display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:4};
const Label=({children}:{children:React.ReactNode})=><div style={{fontSize:8,fontWeight:950,textTransform:'uppercase',letterSpacing:.5,marginBottom:5}}>{children}</div>;
const statusBg={active:CYAN,available:YELLOW,planned:'#eee'} as const;

/** Compact, user-facing representation of the controls that belong to an editor page. */
export const EditorControlManifest:React.FC<{store:EditorStore;category:EditorCapabilityCategory}>=({store,category})=>{const clip=store.selectedClips[0],v=clip?readClipVisualTransform(clip):null,caps=capabilitiesForCategory(category);return <div aria-label={`${category} controls`} style={{display:'grid',gap:5}}>
 <section style={box}><Label>Controls</Label><div style={grid}>{caps.map(c=><button key={c.id} disabled={c.status!=='active'} title={`${c.label} · ${c.status}`} style={{...btn,background:statusBg[c.status],opacity:c.status==='planned'?.55:1}}>{c.label}<small style={{display:'block',fontSize:6}}>{c.status}</small></button>)}</div></section>
 {category==='edit'&&<section style={box}><Label>Selection</Label>{clip&&v?<><b style={{fontSize:9}}>{String(clip.id)}</b><div style={{...grid,marginTop:5}}><div style={btn}>X <b>{Math.round(v.x)}</b></div><div style={btn}>Y <b>{Math.round(v.y)}</b></div><div style={btn}>Scale <b>{v.scaleX.toFixed(2)}</b></div><div style={btn}>Rotate <b>{Math.round(v.rotation)}°</b></div><button style={{...btn,background:CYAN}} onClick={()=>store.dispatch({type:'splitClipAtPlayhead',id:clip.id})}>Split</button><button style={btn} onClick={()=>store.dispatch({type:'duplicateClip',id:clip.id})}>Duplicate</button><button style={{...btn,background:PINK}} onClick={()=>store.dispatch({type:'deleteClips',ids:[clip.id]})}>Delete</button><button style={btn} onClick={()=>store.dispatch({type:'resetClipTransform',id:clip.id})}>Reset</button></div></>:<div style={{fontSize:9,fontWeight:800,opacity:.55}}>Select a clip to expose contextual controls.</div>}</section>}
 {category==='media'&&<section style={box}><Label>Timeline Media</Label><b style={{fontSize:18}}>{store.state.project.clips.length}</b><div style={{fontSize:8,fontWeight:800}}>clips currently represented in the project</div></section>}
 {category==='audio'&&<section style={box}><Label>Audio Tracks</Label><div style={{fontSize:9,fontWeight:800}}>{store.state.project.tracks.filter(t=>t.kind==='audio').length} audio tracks · select one for volume/rate controls</div></section>}
 {category==='transitions'&&<section style={box}><Label>Transitions</Label><div style={{fontSize:9,fontWeight:800}}>{(store.state.project.transitions??[]).length} transitions · select two clips to add one</div></section>}
 {category==='export'&&<section style={box}><Label>Project Output</Label><div style={{fontSize:9,fontWeight:800}}>{store.state.project.durationSec.toFixed(1)}s · {store.state.project.clips.length} clips</div></section>}
 </div>};
