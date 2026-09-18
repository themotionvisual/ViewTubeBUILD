import React, {useMemo, useState} from 'react';
import type {EditorStore} from '../state/editorState';
import {filterTemplateCatalog, templateCatalog} from '../../../../editor-design-library/catalog';
import type {TemplateCategory, TemplateDefinition} from '../../../../editor-design-library/core/schema';
import {templateToTimelineClip} from '../../../../editor-design-library/integration/timelineAdapter';

interface Props {store: EditorStore}
const categories: Array<{label:string; value?:TemplateCategory}> = [{label:'All'},{label:'Backgrounds',value:'background'},{label:'Patterns',value:'pattern'},{label:'Text',value:'text'},{label:'Graphics',value:'graphic'},{label:'Scenes',value:'scene'}];

const TemplateCard:React.FC<{template:TemplateDefinition; onAdd:()=>void}> = ({template,onAdd}) => {
  const accent = template.palette?.[0] ?? '#34cdea';
  return <button onClick={onAdd} style={{textAlign:'left',padding:0,border:'2px solid #171717',borderRadius:10,overflow:'hidden',background:'#fff',color:'#171717',boxShadow:`4px 4px 0 ${accent}88`,cursor:'pointer'}}>
    <div style={{aspectRatio:'16 / 9',background:template.background ?? `${accent}55`,display:'flex',alignItems:'center',justifyContent:'center',padding:10,overflow:'hidden'}}>
      <strong style={{fontSize:template.category==='text'?16:12,lineHeight:.95,fontWeight:900,textTransform:'uppercase'}}>{template.elements.find(e=>e.type==='text')?.text ?? template.name}</strong>
    </div>
    <div style={{padding:'7px 8px',borderTop:'2px solid #171717'}}><div style={{fontSize:10,fontWeight:900,textTransform:'uppercase'}}>{template.name}</div><div style={{fontSize:8,opacity:.6,textTransform:'uppercase'}}>{template.category}</div></div>
  </button>;
};

export const TemplateLibraryPanel:React.FC<Props> = ({store}) => {
  const [category,setCategory] = useState<TemplateCategory|undefined>();
  const [query,setQuery] = useState('');
  const items = useMemo(()=>filterTemplateCatalog(category,query),[category,query]);
  return <div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:8}}><strong style={{fontSize:12,textTransform:'uppercase'}}>Design Library</strong><span style={{fontSize:9,opacity:.55}}>{templateCatalog.length} templates</span></div>
    <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search templates…" style={{width:'100%',padding:'9px 10px',borderRadius:8,border:'1px solid #334155',background:'#1e293b',color:'#e2e8f0',marginBottom:8}}/>
    <div style={{display:'flex',gap:5,overflowX:'auto',paddingBottom:9}}>{categories.map(c=><button key={c.label} onClick={()=>setCategory(c.value)} style={{flex:'0 0 auto',padding:'5px 9px',borderRadius:999,border:'1px solid #334155',background:category===c.value?'#22d3ee':'#1e293b',color:category===c.value?'#0f172a':'#e2e8f0',fontSize:9,fontWeight:900,textTransform:'uppercase'}}>{c.label}</button>)}</div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:9}}>{items.map(template=><TemplateCard key={template.id} template={template} onAdd={()=>store.dispatch({type:'addClip',clip:templateToTimelineClip(template,{startSec:store.state.playheadSec})})}/>)}</div>
  </div>;
};
