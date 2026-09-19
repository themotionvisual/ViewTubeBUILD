import React,{useEffect,useMemo,useRef,useState} from 'react';
import {ArrowRight,Check,LayoutTemplate,Play,Save,Search,Star} from 'lucide-react';
import type {EditorStore} from '../state/editorState';
import {templateCatalog} from '../../../../editor-design-library/catalog';
import type {TemplateDefinition,TemplateElement,TemplateStyleConfig} from '../../../../editor-design-library/core/schema';
import {templateToTimelineClip} from '../../../../editor-design-library/integration/timelineAdapter';
import type {VtE1Clip} from '../../../../shared/vtE1TimelineContract';

const INK='#248b99',CYAN='#36E0F6';
const card:React.CSSProperties={border:`2px solid ${INK}`,borderRadius:7,background:'#fff',padding:7,marginBottom:7,boxShadow:'2px 2px 0 rgba(54,224,246,.22)'};
const btn=(active=false):React.CSSProperties=>({
  minHeight:30,border:`2px solid ${INK}`,borderRadius:5,background:active?CYAN:'#fff',
  color:'#111',fontSize:8,fontWeight:1000,textTransform:'uppercase',padding:'4px 6px',
  display:'inline-flex',alignItems:'center',justifyContent:'center',gap:5,
});
const field:React.CSSProperties={width:'100%',height:30,border:`2px solid ${INK}`,borderRadius:5,boxSizing:'border-box',padding:'0 7px',fontSize:9,fontWeight:900,background:'#fff'};

type TemplateStyleOverrides=Partial<Omit<TemplateStyleConfig,'colors'>>&{colors?:Partial<TemplateStyleConfig['colors']>};
type TemplateClip=VtE1Clip&{
  clipType?:string;
  templateDefinition?:TemplateDefinition;
  templateOverrides?:{
    content?:Record<string,unknown>;
    style?:TemplateStyleOverrides;
  };
};

const ICONS=[
  {id:'play',label:'Play',icon:<Play size={12}/>,svg:'<svg viewBox="0 0 100 100"><path d="M30 18 L82 50 L30 82 Z" fill="#171717"/></svg>'},
  {id:'arrow',label:'Arrow',icon:<ArrowRight size={12}/>,svg:'<svg viewBox="0 0 100 100"><path d="M16 46 H68 L48 26 L56 18 L90 50 L56 82 L48 74 L68 54 H16 Z" fill="#171717"/></svg>'},
  {id:'check',label:'Check',icon:<Check size={12}/>,svg:'<svg viewBox="0 0 100 100"><path d="M18 52 L40 74 L84 28 L75 20 L40 57 L27 43 Z" fill="#171717"/></svg>'},
  {id:'star',label:'Star',icon:<Star size={12}/>,svg:'<svg viewBox="0 0 100 100"><path d="M50 10 L61 37 L90 39 L68 57 L75 86 L50 70 L25 86 L32 57 L10 39 L39 37 Z" fill="#171717"/></svg>'},
] as const;

function selectedTemplateClip(store:EditorStore){
  return store.selectedClips.find(clip=>(clip as TemplateClip).clipType==='design-template') as TemplateClip|undefined;
}
function mergeOverrides(clip:TemplateClip,patch:TemplateClip['templateOverrides']){
  return{
    ...(clip.templateOverrides??{}),
    ...patch,
    content:{...(clip.templateOverrides?.content??{}),...(patch?.content??{})},
    style:{
      ...(clip.templateOverrides?.style??{}),
      ...(patch?.style??{}),
      colors:{
        ...((clip.templateOverrides?.style?.colors??{}) as Record<string,string>),
        ...((patch?.style?.colors??{}) as Record<string,string>),
      },
    },
  };
}
function editableElements(template?:TemplateDefinition){
  return (template?.elements??[]).filter(element=>element.editable!==false&&(element.type==='text'||element.type==='svg'));
}

export const CustomTemplatePanel:React.FC<{store:EditorStore}>=({store})=>{
  const[query,setQuery]=useState('');
  const[selectedElementId,setSelectedElementId]=useState<string|null>(null);
  const editorRef=useRef<HTMLDivElement>(null);
  const clip=selectedTemplateClip(store);
  const template=clip?.templateDefinition;
  const editables=useMemo(()=>editableElements(template),[template]);
  useEffect(()=>{
    setSelectedElementId(current=>current&&editables.some(element=>element.id===current)?current:(editables[0]?.id??null));
  },[clip?.id,template?.id,editables.length]);

  const items=useMemo(()=>{
    const q=query.trim().toLowerCase();
    return templateCatalog.filter(item=>item.customizable!==false&&(!q||[item.name,item.category,...item.tags].join(' ').toLowerCase().includes(q)));
  },[query]);

  const add=(definition:TemplateDefinition)=>{
    const trackId=store.state.project.tracks.find(track=>track.kind==='overlay')?.id
      ??store.state.project.tracks.find(track=>track.kind!=='audio')?.id
      ??store.state.project.tracks[0]?.id
      ??'t_overlay';
    const next=templateToTimelineClip(definition,{startSec:store.state.playheadSec,trackId});
    store.dispatch({type:'addClip',clip:next});
    store.dispatch({type:'selectClip',id:next.id});
  };
  const patchOverrides=(patch:TemplateClip['templateOverrides'])=>{
    if(!clip)return;
    store.dispatch({type:'updateClip',id:clip.id,patch:{templateOverrides:mergeOverrides(clip,patch)} as Partial<VtE1Clip>});
  };
  const patchContent=(element:TemplateElement,value:unknown)=>{
    if(!clip)return;
    patchOverrides({content:{[element.id]:value}});
  };
  const colors=(clip?.templateOverrides?.style?.colors??template?.style?.colors??{}) as Partial<TemplateStyleConfig['colors']>;

  return <div style={{width:'100%',minWidth:0,overflowX:'hidden'}}>
    <section style={card}>
      <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}><LayoutTemplate size={14}/><b style={{fontSize:10,textTransform:'uppercase'}}>Custom Templates</b></div>
      <label style={{position:'relative',display:'block'}}>
        <Search size={12} style={{position:'absolute',left:7,top:9,pointerEvents:'none'}}/>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search customizable templates" style={{...field,paddingLeft:24}}/>
      </label>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:5,maxHeight:190,overflowY:'auto',overflowX:'hidden',marginTop:6}}>
        {items.map(item=><button key={item.id} style={{...btn(false),display:'grid',gridTemplateColumns:'24px minmax(0,1fr)',textAlign:'left',justifyContent:'stretch'}} onClick={()=>add(item)}>
          <span style={{width:22,height:22,border:`1.5px solid ${INK}`,borderRadius:4,background:item.palette?.[0]??CYAN,display:'grid',placeItems:'center'}}><LayoutTemplate size={12}/></span>
          <span style={{minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.name}</span>
        </button>)}
      </div>
    </section>

    <section style={card}>
      <div style={{fontSize:10,fontWeight:1000,textTransform:'uppercase',marginBottom:6}}>Selected Template</div>
      {!clip||!template?<div style={{fontSize:9,fontWeight:800,opacity:.6}}>Add or select a design-template clip to customize its text, icons, and colors.</div>:<>
        <div style={{fontSize:9,fontWeight:1000,marginBottom:7}}>{template.name}</div>
        <div style={{
          position:'relative',width:'100%',aspectRatio:`${Math.max(1,template.width)} / ${Math.max(1,template.height)}`,
          border:`2px solid ${INK}`,borderRadius:6,background:String(colors.background??template.background??'#fff'),
          overflow:'hidden',marginBottom:6,
        }}>
          {editables.map(element=>{
            const left=(element.x/Math.max(1,template.width))*100;
            const top=(element.y/Math.max(1,template.height))*100;
            const width=(element.width/Math.max(1,template.width))*100;
            const height=(element.height/Math.max(1,template.height))*100;
            const active=selectedElementId===element.id;
            return <button
              key={element.id}
              title={`Edit ${element.name}`}
              aria-label={`Select template element ${element.name}`}
              onClick={()=>{
                setSelectedElementId(element.id);
                requestAnimationFrame(()=>editorRef.current?.scrollIntoView({behavior:'smooth',block:'nearest'}));
              }}
              style={{
                position:'absolute',left:`${left}%`,top:`${top}%`,width:`${Math.max(5,width)}%`,height:`${Math.max(5,height)}%`,
                transform:`rotate(${Number(element.rotation??0)}deg)`,transformOrigin:'top left',
                border:`2px solid ${active?CYAN:INK}`,borderRadius:3,
                background:active?'rgba(54,224,246,.22)':'rgba(255,255,255,.08)',
                padding:0,color:String(colors.foreground??'#111'),fontSize:6,fontWeight:1000,
                overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',
              }}
            >{element.type==='text'?String((clip.templateOverrides?.content?.[element.id] as Record<string,unknown>|undefined)?.text??element.text??element.name):element.name}</button>;
          })}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:3,marginBottom:6}}>
          {editables.map(element=><button key={element.id} style={{...btn(selectedElementId===element.id),minWidth:0,overflow:'hidden',textOverflow:'ellipsis'}} onClick={()=>setSelectedElementId(element.id)}>{element.name}</button>)}
        </div>
        <div ref={editorRef} style={{display:'grid',gap:6}}>
          {editables.filter(element=>!selectedElementId||element.id===selectedElementId).map(element=>{
            const raw=clip.templateOverrides?.content?.[element.id];
            const record=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Record<string,unknown>:null;
            if(element.type==='text'){
              const value=typeof raw==='string'?raw:String(record?.text??element.text??'');
              return <label key={element.id} style={{fontSize:8,fontWeight:1000,textTransform:'uppercase'}}>
                {element.name}
                <input style={field} value={value} onChange={e=>patchContent(element,{...(record??{}),text:e.target.value})}/>
              </label>;
            }
            if(element.type==='svg'){
              return <div key={element.id}>
                <div style={{fontSize:8,fontWeight:1000,textTransform:'uppercase',marginBottom:4}}>{element.name}</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:4}}>
                  {ICONS.map(icon=><button key={icon.id} title={icon.label} aria-label={`${element.name}: ${icon.label}`} style={btn(String(record?.iconName??'')===icon.id)} onClick={()=>patchContent(element,{...(record??{}),svg:icon.svg,iconName:icon.id})}>{icon.icon}</button>)}
                </div>
              </div>;
            }
            return null;
          })}
        </div>

        <div style={{fontSize:9,fontWeight:1000,textTransform:'uppercase',margin:'9px 0 5px'}}>Template Colors</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:5}}>
          {(['primary','accent','foreground','background'] as const).map(key=><label key={key} style={{fontSize:8,fontWeight:1000,textTransform:'uppercase'}}>
            {key}
            <input type="color" value={String(colors[key]??(key==='background'?'#ffffff':'#171717'))} onChange={e=>patchOverrides({style:{colors:{[key]:e.target.value}}})} style={{...field,padding:3,height:34}}/>
          </label>)}
        </div>
        <button style={{...btn(true),width:'100%',marginTop:7}} onClick={()=>{
          const stored=JSON.parse(localStorage.getItem('viewtube.editor.custom-templates.v1')||'[]');
          const entry={name:`${template.name} Custom`,savedAt:new Date().toISOString(),templateId:template.id,templateOverrides:clip.templateOverrides??{}};
          localStorage.setItem('viewtube.editor.custom-templates.v1',JSON.stringify([entry,...(Array.isArray(stored)?stored:[])].slice(0,40)));
        }}><Save size={13}/>Save Custom Template</button>
      </>}
    </section>
  </div>;
};
