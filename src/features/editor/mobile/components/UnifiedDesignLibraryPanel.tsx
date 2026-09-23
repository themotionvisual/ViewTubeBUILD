import React,{useState} from 'react';
import {LayoutTemplate,WandSparkles} from 'lucide-react';
import type {EditorStore} from '../state/editorState';
import {TemplateLibraryPanel} from './TemplateLibraryPanel';
import {CustomTemplatePanel} from './CustomTemplatePanel';

const INK='#248b99',CYAN='#36E0F6';
const button=(active:boolean):React.CSSProperties=>({
  minHeight:30,border:`2px solid ${INK}`,borderRadius:5,background:active?CYAN:'#fff',
  color:'#111',fontSize:8,fontWeight:1000,textTransform:'uppercase',padding:'4px 6px',
  display:'inline-flex',alignItems:'center',justifyContent:'center',gap:5,
});
export const UnifiedDesignLibraryPanel:React.FC<{store:EditorStore}>=({store})=>{
  const[tab,setTab]=useState<'designs'|'custom'>('designs');
  return <div style={{width:'100%',minWidth:0,overflowX:'hidden'}}>
    <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:4,marginBottom:6}}>
      <button style={button(tab==='designs')} onClick={()=>setTab('designs')}><LayoutTemplate size={12}/>Designs + SVG</button>
      <button style={button(tab==='custom')} onClick={()=>setTab('custom')}><WandSparkles size={12}/>Custom</button>
    </div>
    {tab==='designs'?<TemplateLibraryPanel store={store} title="Design + Template Library"/>:<CustomTemplatePanel store={store}/>}
  </div>;
};
