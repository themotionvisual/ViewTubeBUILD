import React,{useEffect,useMemo,useRef,useState} from 'react';
import {Command,Search,X} from 'lucide-react';
import {MOBILE_EDITOR_TOKENS as T,mobileButton} from './MobileEditorPrimitives';

export interface MobileEditorCommand{
  id:string;
  label:string;
  group:string;
  keywords?:string[];
  icon?:React.ReactNode;
  disabled?:boolean;
  active?:boolean;
  run:()=>void;
}

export const MobileCommandPalette:React.FC<{
  commands:MobileEditorCommand[];
  onClose:()=>void;
}>=({commands,onClose})=>{
  const[query,setQuery]=useState('');
  const inputRef=useRef<HTMLInputElement>(null);
  useEffect(()=>{
    inputRef.current?.focus();
    const key=(event:KeyboardEvent)=>{if(event.key==='Escape')onClose()};
    window.addEventListener('keydown',key);
    return()=>window.removeEventListener('keydown',key);
  },[onClose]);
  const filtered=useMemo(()=>{
    const q=query.trim().toLowerCase();
    return commands.filter(command=>{
      if(!q)return true;
      return[command.label,command.group,...(command.keywords??[])].join(' ').toLowerCase().includes(q);
    });
  },[commands,query]);
  const groups=useMemo(()=>Array.from(new Set(filtered.map(command=>command.group))),[filtered]);

  return <div
    role="dialog"
    aria-modal="true"
    aria-label="Editor command palette"
    onPointerDown={event=>{if(event.target===event.currentTarget)onClose()}}
    style={{position:'fixed',inset:0,zIndex:620,background:'rgba(255,255,255,.72)',padding:8,boxSizing:'border-box',display:'grid',alignItems:'start',justifyItems:'center'}}
  >
    <div style={{
      width:'min(430px,100%)',maxHeight:'min(560px,calc(100dvh - 16px))',marginTop:'max(8px,8dvh)',
      border:`3px solid ${T.ink}`,borderRadius:8,background:'#fff',boxShadow:'5px 5px 0 rgba(54,224,246,.35)',
      display:'grid',gridTemplateRows:'42px minmax(0,1fr)',overflow:'hidden',
    }}>
      <div style={{display:'grid',gridTemplateColumns:'28px minmax(0,1fr) 28px',gap:5,alignItems:'center',padding:5,borderBottom:`2px solid ${T.ink}`,background:T.cyan}}>
        <Command size={15}/>
        <label style={{position:'relative'}}>
          <Search size={12} style={{position:'absolute',left:7,top:8,pointerEvents:'none'}}/>
          <input
            ref={inputRef}
            value={query}
            onChange={event=>setQuery(event.target.value)}
            placeholder="Search editor commands"
            style={{width:'100%',height:28,border:`2px solid ${T.ink}`,borderRadius:5,background:'#fff',boxSizing:'border-box',padding:'0 7px 0 25px',fontSize:9,fontWeight:900,outline:'none'}}
          />
        </label>
        <button aria-label="Close command palette" onClick={onClose} style={{...mobileButton(false),width:28,height:28,minHeight:28,padding:0}}><X size={12}/></button>
      </div>
      <div style={{overflowY:'auto',overflowX:'hidden',padding:6,WebkitOverflowScrolling:'touch'}}>
        {groups.map(group=><section key={group} style={{marginBottom:7}}>
          <div style={{fontSize:7,fontWeight:1000,textTransform:'uppercase',opacity:.55,margin:'0 2px 3px'}}>{group}</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:3}}>
            {filtered.filter(command=>command.group===group).map(command=><button
              key={command.id}
              disabled={command.disabled}
              onClick={()=>{command.run();onClose()}}
              style={{
                ...mobileButton(Boolean(command.active)),minHeight:34,minWidth:0,justifyContent:'flex-start',
                opacity:command.disabled?.35:1,textAlign:'left',overflow:'hidden',
              }}
            >
              <span style={{width:17,height:17,display:'grid',placeItems:'center',flex:'0 0 auto'}}>{command.icon}</span>
              <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{command.label}</span>
            </button>)}
          </div>
        </section>)}
        {!filtered.length?<div style={{padding:14,textAlign:'center',fontSize:9,fontWeight:900,opacity:.55}}>No matching editor command</div>:null}
      </div>
    </div>
  </div>;
};
