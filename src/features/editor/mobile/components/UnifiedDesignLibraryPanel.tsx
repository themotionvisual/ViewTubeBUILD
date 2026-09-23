import React,{useState} from 'react';
import {LayoutTemplate,Shapes,WandSparkles} from 'lucide-react';
import type {EditorStore} from '../state/editorState';
import {TemplateLibraryPanel} from './TemplateLibraryPanel';
import {CustomTemplatePanel} from './CustomTemplatePanel';

const INK='#248b99',CYAN='#36E0F6';
const button=(active:boolean):React.CSSProperties=>({
  minHeight:30,minWidth:0,border:`2px solid ${INK}`,borderRadius:5,
  background:active?CYAN:'#fff',color:'#111',fontSize:8,fontWeight:1000,
  textTransform:'uppercase',padding:'3px 4px',display:'inline-flex',
  alignItems:'center',justifyContent:'center',gap:4,
});

export const UnifiedDesignLibraryPanel:React.FC<{
  store:EditorStore;
  initialView?:'all'|'graphics'|'custom';
}>=({store,initialView='all'})=>{
  const[view,setView]=useState(initialView);
  return <div style={{width:'100%',minWidth:0,overflowX:'hidden'}}>
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:4,marginBottom:6}}>
      <button style={button(view==='all')} onClick={()=>setView('all')}><LayoutTemplate size={12}/>Designs</button>
      <button style={button(view==='graphics')} onClick={()=>setView('graphics')}><Shapes size={12}/>SVG + Graphics</button>
      <button style={button(view==='custom')} onClick={()=>setView('custom')}><WandSparkles size={12}/>Custom</button>
    </div>
    {view==='all'?<TemplateLibraryPanel store={store} title="Design Library"/>:null}
    {view==='graphics'?<TemplateLibraryPanel store={store} initialCategory="graphic" title="SVG + Graphics"/>:null}
    {view==='custom'?<CustomTemplatePanel store={store}/>:null}
  </div>;
};
