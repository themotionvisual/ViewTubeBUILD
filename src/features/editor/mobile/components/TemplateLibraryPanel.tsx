import React, {useMemo, useState} from 'react';
import type {EditorStore} from '../state/editorState';
import {filterTemplateCatalog, templateCatalog} from '../../../../editor-design-library/catalog';
import type {TemplateCategory, TemplateDefinition} from '../../../../editor-design-library/core/schema';
import {templateToTimelineClip} from '../../../../editor-design-library/integration/timelineAdapter';
import {TemplateVisualPreview} from './TemplateVisualPreview';

interface Props {store: EditorStore; initialCategory?:TemplateCategory; title?:string}
const categories: Array<{label:string; value?:TemplateCategory}> = [{label:'All'},{label:'Backgrounds',value:'background'},{label:'Patterns',value:'pattern'},{label:'Text',value:'text'},{label:'Graphics',value:'graphic'},{label:'Scenes',value:'scene'}];

const TemplateCard:React.FC<{template:TemplateDefinition; onAdd:()=>void}> = ({template,onAdd}) => {
  const accent=template.palette?.[0]??'#36E0F6';
  return <button
    onClick={onAdd}
    title={template.name}
    aria-label={`Add template: ${template.name}`}
    style={{
      position:'relative',textAlign:'left',padding:0,border:'2px solid #248b99',borderRadius:7,
      overflow:'hidden',background:'#fff',color:'#171717',boxShadow:`3px 3px 0 ${accent}55`,
      cursor:'pointer',aspectRatio:'16 / 9',minWidth:0,
      userSelect:'none',WebkitUserSelect:'none',WebkitTouchCallout:'none',WebkitTapHighlightColor:'transparent',
    }}
  >
    <TemplateVisualPreview template={template}/>
  </button>;
};

export const TemplateLibraryPanel:React.FC<Props> = ({store,initialCategory,title='Design Library'}) => {
  const [category,setCategory] = useState<TemplateCategory|undefined>(initialCategory);
  const [query,setQuery] = useState('');
  const items = useMemo(()=>filterTemplateCatalog(category,query),[category,query]);
  return <div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:8}}><strong style={{fontSize:12,textTransform:'uppercase'}}>{title}</strong><span style={{fontSize:9,opacity:.55}}>{templateCatalog.length} templates</span></div>
    <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search templates…" style={{width:'100%',padding:'9px 10px',borderRadius:8,border:'1px solid #334155',background:'#1e293b',color:'#e2e8f0',marginBottom:8}}/>
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:4,paddingBottom:9}}>{categories.map(c=><button key={c.label} onClick={()=>setCategory(c.value)} style={{minWidth:0,padding:'5px 4px',borderRadius:5,border:'2px solid #248b99',background:category===c.value?'#36E0F6':'#fff',color:'#111',fontSize:8,fontWeight:900,textTransform:'uppercase'}}>{c.label}</button>)}</div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:9}}>{items.map(template=><TemplateCard key={template.id} template={template} onAdd={()=>{
      const trackId=store.state.project.tracks.find(track=>track.kind==='overlay')?.id
        ??store.state.project.tracks.find(track=>track.kind!=='audio')?.id
        ??store.state.project.tracks[0]?.id
        ??'t_overlay';
      const clip=templateToTimelineClip(template,{startSec:store.state.playheadSec,trackId});
      store.dispatch({type:'addClip',clip});
      store.dispatch({type:'selectClip',id:clip.id});
    }}/>)}</div>
  </div>;
};
