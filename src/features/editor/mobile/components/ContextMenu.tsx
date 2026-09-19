/** Long-press context menu / tool tray. */
import React,{useEffect,useLayoutEffect,useRef,useState} from 'react';

export interface ContextMenuItem{
  label:string;
  icon?:React.ReactNode;
  swatch?:string;
  onSelect:()=>void;
  destructive?:boolean;
  disabled?:boolean;
}

export interface ContextMenuProps{
  items:ContextMenuItem[];
  at:{x:number;y:number};
  onDismiss:()=>void;
  title?:string;
}

const CYAN='#36E0F6';
const INK='#248b99';

export const ContextMenu:React.FC<ContextMenuProps>=({items,at,onDismiss,title})=>{
  const ref=useRef<HTMLDivElement>(null);
  const[pos,setPos]=useState(at);

  useLayoutEffect(()=>{
    if(!ref.current)return;
    const rect=ref.current.getBoundingClientRect();
    const pad=8,vw=window.innerWidth,vh=window.innerHeight;
    let x=at.x-rect.width/2;
    let y=at.y-rect.height-12;
    if(y<pad)y=at.y+12;
    if(x+rect.width+pad>vw)x=vw-rect.width-pad;
    if(x<pad)x=pad;
    if(y+rect.height+pad>vh)y=vh-rect.height-pad;
    setPos({x,y});
  },[at]);

  useEffect(()=>{
    const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape')onDismiss()};
    const onDown=(event:PointerEvent)=>{
      if(ref.current&&!ref.current.contains(event.target as Node))onDismiss();
    };
    window.addEventListener('keydown',onKey);
    window.addEventListener('pointerdown',onDown,{capture:true});
    return()=>{
      window.removeEventListener('keydown',onKey);
      window.removeEventListener('pointerdown',onDown,{capture:true} as EventListenerOptions);
    };
  },[onDismiss]);

  return <div
    ref={ref}
    role="menu"
    style={{
      position:'fixed',top:pos.y,left:pos.x,width:'min(220px,calc(100vw - 16px))',
      maxHeight:'min(440px,calc(100dvh - 16px))',overflowY:'auto',overflowX:'hidden',
      background:'#fff',border:`3px solid ${INK}`,borderRadius:7,
      boxShadow:'4px 4px 0 rgba(54,224,246,.4)',padding:5,zIndex:200,color:'#000',
    }}
  >
    {title?<div style={{
      padding:'6px 8px',fontSize:9,fontWeight:900,color:'#000',
      textTransform:'uppercase',letterSpacing:.6,borderBottom:`2px solid ${INK}`,
      marginBottom:4,background:CYAN,
    }}>{title}</div>:null}
    {items.map((item,index)=><button
      key={`${item.label}-${index}`}
      role="menuitem"
      disabled={item.disabled}
      onClick={()=>{item.onSelect();onDismiss()}}
      style={{
        display:'grid',gridTemplateColumns:'22px minmax(0,1fr)',alignItems:'center',gap:8,
        width:'100%',padding:'7px 8px',borderRadius:4,border:`1.5px solid ${INK}`,
        marginTop:index?3:0,background:'#fff',color:item.destructive?'#b91c1c':'#000',
        fontSize:10,fontWeight:900,textAlign:'left',cursor:item.disabled?'not-allowed':'pointer',
        opacity:item.disabled ? .4 : 1,touchAction:'manipulation',boxSizing:'border-box',
      }}
      onPointerEnter={event=>{if(!item.disabled)event.currentTarget.style.background=CYAN}}
      onPointerLeave={event=>{event.currentTarget.style.background='#fff'}}
    >
      <span style={{width:20,height:20,display:'grid',placeItems:'center'}}>
        {item.swatch?<span style={{
          width:14,height:14,borderRadius:3,background:item.swatch,
          border:'1.5px solid #111',boxSizing:'border-box',
        }}/>:item.icon??null}
      </span>
      <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.label}</span>
    </button>)}
  </div>;
};
