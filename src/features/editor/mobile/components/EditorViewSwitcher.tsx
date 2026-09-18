import React from 'react';

export type EditorFrontend='auto'|'mobile'|'desktop';
export type EditorLayoutChoice='auto'|'portrait'|'landscape';

const INK='#248b99',CYAN='#36E0F6';
const button:React.CSSProperties={minHeight:32,minWidth:62,border:`2px solid ${INK}`,borderRadius:5,background:'#fff',color:'#000',fontSize:8,fontWeight:900,textTransform:'uppercase',padding:'4px 8px'};

export interface EditorViewSwitcherProps{
  frontend:EditorFrontend;
  layout:EditorLayoutChoice;
  onFrontend:(value:EditorFrontend)=>void;
  onLayout:(value:EditorLayoutChoice)=>void;
}

/** Canonical segmented interface/layout control used by editor settings surfaces. */
export const EditorViewSwitcher:React.FC<EditorViewSwitcherProps>=({frontend,layout,onFrontend,onLayout})=><div style={{display:'grid',gap:5}}>
  <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:4}}>
    {(['auto','mobile','desktop'] as const).map(value=><button key={value} style={{...button,background:frontend===value?CYAN:'#fff'}} onClick={()=>onFrontend(value)}>{value}</button>)}
  </div>
  <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:4}}>
    {(['auto','portrait','landscape'] as const).map(value=><button key={value} style={{...button,background:layout===value?CYAN:'#fff'}} onClick={()=>onLayout(value)}>{value}</button>)}
  </div>
</div>;
