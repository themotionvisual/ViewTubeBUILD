import React from 'react';
import type {EditorStore} from '../state/editorState';
import type {EditorNavPage} from './EditorNavigationPages';

const INK='#248b99',CYAN='#36E0F6',PINK='#FA618A';
const button:React.CSSProperties={
  minWidth:48,minHeight:30,border:`2px solid ${INK}`,borderRadius:5,
  background:'#fff',color:'#000',fontSize:8,fontWeight:900,
  textTransform:'uppercase',padding:'3px 7px',flex:'0 0 auto',
};

export function pageForSelection(store:EditorStore):EditorNavPage|null{
  if(store.state.selection.transitionId)return 'transitions';
  const clip=store.selectedClips[0];
  if(clip){
    const kind=store.trackById(clip.trackId)?.kind;
    if(kind==='audio')return 'audio';
    if(kind==='overlay'||kind==='caption')return 'text';
    return 'select';
  }
  const trackId=store.state.selection.trackId;
  if(trackId)return store.trackById(trackId)?.kind==='audio'?'audio':'select';
  return null;
}

/** Context commands only. Primary page navigation lives in one dedicated nav strip. */
export const EditorQuickActions:React.FC<{store:EditorStore;onOpenPage:(page:EditorNavPage)=>void}>=({store,onOpenPage})=>{
  const clip=store.selectedClips[0];
  return <div aria-label="Context actions" style={{display:'flex',gap:3,overflowX:'auto',padding:'3px 0',flex:'0 0 auto',scrollbarWidth:'thin'}}>
    <button style={button} disabled={!store.canUndo} onClick={()=>store.dispatch({type:'undo'})}>Undo</button>
    <button style={button} disabled={!store.canRedo} onClick={()=>store.dispatch({type:'redo'})}>Redo</button>
    {clip&&<>
      <button style={{...button,background:CYAN}} onClick={()=>store.dispatch({type:'splitClipAtPlayhead',id:clip.id})}>Split</button>
      <button style={button} onClick={()=>store.dispatch({type:'duplicateClip',id:clip.id})}>Duplicate</button>
      <button style={button} onClick={()=>onOpenPage('select')}>Inspect</button>
      <button style={{...button,background:PINK}} onClick={()=>store.dispatch({type:'deleteClips',ids:[clip.id]})}>Delete</button>
    </>}
  </div>;
};
