import React,{useMemo,useRef,useState} from 'react';
import {Download,FilePlus2,FolderOpen,Save,Trash2,Upload} from 'lucide-react';
import type {EditorProject,EditorStore} from '../state/editorState';

const STORAGE_KEY='viewtube.editor.projects.v1';
const INK='#248b99',CYAN='#36E0F6',YELLOW='#FFFF61',PINK='#FA618A';
const btn=(bg='#fff'):React.CSSProperties=>({
  minHeight:34,border:`2px solid ${INK}`,borderRadius:6,background:bg,color:'#111',
  fontSize:8,fontWeight:1000,textTransform:'uppercase',padding:'5px 7px',
  display:'inline-flex',alignItems:'center',justifyContent:'center',gap:5,
});
const card:React.CSSProperties={border:`2px solid ${INK}`,borderRadius:7,background:'#fff',padding:8,marginBottom:7,boxShadow:'2px 2px 0 rgba(54,224,246,.22)'};
const input:React.CSSProperties={width:'100%',height:32,border:`2px solid ${INK}`,borderRadius:5,boxSizing:'border-box',padding:'0 7px',fontSize:10,fontWeight:900,background:'#fff'};

interface SavedProject{name:string;savedAt:string;project:EditorProject}

function readSaved():SavedProject[]{
  try{
    const parsed=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');
    return Array.isArray(parsed)?parsed:[];
  }catch{return[]}
}
function writeSaved(items:SavedProject[]){localStorage.setItem(STORAGE_KEY,JSON.stringify(items.slice(0,30)))}
function downloadJson(name:string,value:unknown){
  const blob=new Blob([JSON.stringify(value,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download=`${name.replace(/[^a-z0-9_-]+/gi,'_')||'viewtube-project'}.json`;a.click();
  setTimeout(()=>URL.revokeObjectURL(url),0);
}

export const ProjectSettingsPanel:React.FC<{store:EditorStore}>=({store})=>{
  const importRef=useRef<HTMLInputElement>(null);
  const[revision,setRevision]=useState(0);
  const[message,setMessage]=useState('');
  const saved=useMemo(()=>readSaved(),[revision]);
  const meta=(store.state.project.meta??{}) as Record<string,unknown>;
  const name=String(meta.name??meta.projectName??'Untitled Project');

  const save=()=>{
    const next=[{name,savedAt:new Date().toISOString(),project:store.state.project},...readSaved().filter(item=>item.name!==name)];
    writeSaved(next);setRevision(v=>v+1);setMessage('Project saved on this device.');
  };
  const newProject=()=>{
    store.dispatch({type:'replaceProject',project:{
      clips:[],transitions:[],layers:[],durationSec:30,
      tracks:[
        {id:'t_video',name:'Video',kind:'video'},
        {id:'t_overlay',name:'Overlay',kind:'overlay'},
        {id:'t_audio',name:'Audio',kind:'audio'},
      ],
      meta:{name:'Untitled Project',aspectRatio:'9:16'},
    }});
    setMessage('New project created.');
  };
  const importProject=async(file:File)=>{
    try{
      const parsed=JSON.parse(await file.text()) as Partial<EditorProject>;
      if(!Array.isArray(parsed.clips)||!Array.isArray(parsed.tracks))throw new Error('Project JSON needs clips and tracks arrays.');
      store.dispatch({type:'replaceProject',project:parsed});
      setMessage('Project imported.');
    }catch(error){setMessage(error instanceof Error?error.message:String(error))}
  };

  return <div style={{width:'100%',minWidth:0,overflowX:'hidden'}}>
    <section style={card}>
      <div style={{fontSize:10,fontWeight:1000,textTransform:'uppercase',marginBottom:6}}>Project</div>
      <label style={{fontSize:8,fontWeight:900,textTransform:'uppercase'}}>Name
        <input style={input} value={name} onChange={e=>store.dispatch({type:'updateProjectMeta',patch:{name:e.target.value,projectName:e.target.value}})}/>
      </label>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:5,marginTop:6}}>
        <button style={btn(CYAN)} onClick={newProject}><FilePlus2 size={13}/>New</button>
        <button style={btn(YELLOW)} onClick={save}><Save size={13}/>Save</button>
        <button style={btn()} onClick={()=>downloadJson(name,store.state.project)}><Download size={13}/>Export JSON</button>
        <button style={btn()} onClick={()=>importRef.current?.click()}><Upload size={13}/>Import JSON</button>
      </div>
      <input ref={importRef} hidden type="file" accept=".json,application/json" onChange={e=>{const file=e.target.files?.[0];e.target.value='';if(file)void importProject(file)}}/>
      {message?<div style={{fontSize:8,fontWeight:900,marginTop:6,opacity:.7}}>{message}</div>:null}
    </section>

    <section style={card}>
      <div style={{fontSize:10,fontWeight:1000,textTransform:'uppercase',marginBottom:6}}>Saved Projects</div>
      <div style={{display:'grid',gap:4,maxHeight:180,overflowY:'auto',overflowX:'hidden'}}>
        {saved.map(item=><div key={item.name} style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) 34px',gap:4}}>
          <button style={{...btn('#fff'),justifyContent:'flex-start',minWidth:0,overflow:'hidden'}} onClick={()=>store.dispatch({type:'replaceProject',project:item.project})}>
            <FolderOpen size={13}/><span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.name}</span>
          </button>
          <button aria-label={`Delete saved project ${item.name}`} style={{...btn(PINK),padding:0}} onClick={()=>{
            writeSaved(readSaved().filter(entry=>entry.name!==item.name));setRevision(v=>v+1);
          }}><Trash2 size={13}/></button>
        </div>)}
        {!saved.length?<div style={{fontSize:9,fontWeight:900,opacity:.5}}>No saved projects on this device.</div>:null}
      </div>
    </section>

    <section style={card}>
      <div style={{fontSize:10,fontWeight:1000,textTransform:'uppercase',marginBottom:5}}>Project Summary</div>
      <div style={{fontSize:9,fontWeight:900,lineHeight:1.5}}>
        {store.state.project.clips.length} clips · {store.state.project.tracks.length} tracks · {store.state.project.durationSec.toFixed(1)}s
      </div>
    </section>
  </div>;
};
