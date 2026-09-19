import React,{useEffect,useLayoutEffect,useState} from 'react';
import {ChevronLeft,ChevronRight,CircleHelp,X} from 'lucide-react';
import {MOBILE_EDITOR_TOKENS as T,mobileButton} from './MobileEditorPrimitives';

export interface EditorCoachStep{
  id:string;
  target:string;
  title:string;
  body:string;
}

export const DEFAULT_EDITOR_COACH_STEPS:EditorCoachStep[]=[
  {id:'workspace',target:'workspace',title:'Adaptive workspace',body:'Preview, settings, timeline, and map share the phone viewport. Drag module dividers or use workspace presets to redistribute space.'},
  {id:'navigation',target:'navigation',title:'Editor pages',body:'Choose Clips, Inspect, Text, Audio, Graphics, Effects, Templates, Project, Export, or Settings. Selecting a clip can automatically bring the relevant page forward.'},
  {id:'actions',target:'actions',title:'Editing shortcuts',body:'Undo, redo, split, duplicate, group, combine, timeline, map, command search, and guide actions live together in one compact row.'},
  {id:'preview',target:'preview',title:'Preview and direct manipulation',body:'Drag a selected layer to position it, pinch to scale, use its rotation handle, and drag motion-path keyframe points when position is animated.'},
  {id:'inspector',target:'inspector',title:'Touch controls',body:'Property controls use accelerating steppers. Hold longer for speed, move your finger vertically while holding for precision, and double-tap the value to reset.'},
  {id:'timeline',target:'timeline',title:'Timeline touch editing',body:'Tap to select, drag clip centers to move, drag edges to trim, long-press to multi-select, pinch to zoom, and use the dedicated scrub strip for precision seeking.'},
  {id:'keyframes',target:'timeline',title:'Keyframes',body:'An active animated clip expands a keyframe lane. Select or long-press keyframes, drag them in time, duplicate them, delete them, or cycle interpolation.'},
  {id:'map',target:'map',title:'Timeline map',body:'The map shows the whole project. Drag the viewport, resize its edges, or pinch it to change the visible timeline range.'},
  {id:'presets',target:'presets',title:'Workspace presets',body:'Edit, Animate, Audio, Color, Template, and Timeline presets reorganize the same editor modules without creating a second editor state.'},
];

export const EditorCoachOverlay:React.FC<{
  steps?:EditorCoachStep[];
  onClose:()=>void;
  onStepChange?:(step:EditorCoachStep,index:number)=>void;
  onOpenFullGuide?:()=>void;
}>=({steps=DEFAULT_EDITOR_COACH_STEPS,onClose,onStepChange,onOpenFullGuide})=>{
  const[index,setIndex]=useState(0);
  const[rect,setRect]=useState<DOMRect|null>(null);
  const step=steps[Math.max(0,Math.min(index,steps.length-1))];

  useEffect(()=>{onStepChange?.(step,index)},[step.id,index,onStepChange]);

  useLayoutEffect(()=>{
    const measure=()=>{
      const node=document.querySelector(`[data-guide-id="${step.target}"]`) as HTMLElement|null;
      setRect(node?.getBoundingClientRect()??null);
    };
    const timer=window.setTimeout(measure,40);
    measure();
    window.addEventListener('resize',measure);
    window.addEventListener('scroll',measure,true);
    return()=>{window.clearTimeout(timer);window.removeEventListener('resize',measure);window.removeEventListener('scroll',measure,true)};
  },[step.target,index]);

  const box=rect?{
    left:Math.max(4,rect.left-4),top:Math.max(4,rect.top-4),
    width:Math.min(window.innerWidth-8,rect.width+8),height:Math.min(window.innerHeight-8,rect.height+8),
  }:null;
  const cardTop=box
    ?(box.top+box.height+148<window.innerHeight?Math.min(window.innerHeight-144,box.top+box.height+8):Math.max(8,box.top-140))
    :Math.max(8,window.innerHeight*.55);

  return <div role="dialog" aria-modal="true" aria-label="Interactive editor guide" style={{position:'fixed',inset:0,zIndex:650,pointerEvents:'none'}}>
    <div style={{position:'absolute',inset:0,background:'rgba(255,255,255,.18)',pointerEvents:'auto'}} onClick={onClose}/>
    {box?<div aria-hidden="true" style={{
      position:'fixed',left:box.left,top:box.top,width:box.width,height:box.height,
      border:`3px solid ${T.cyan}`,borderRadius:8,boxSizing:'border-box',pointerEvents:'none',
      boxShadow:'0 0 0 9999px rgba(17,17,17,.46),4px 4px 0 rgba(36,139,153,.5)',
    }}/>:null}
    <div style={{
      position:'fixed',left:8,right:8,top:cardTop,zIndex:2,maxWidth:430,margin:'0 auto',
      border:`3px solid ${T.ink}`,borderRadius:8,background:'#fff',padding:7,
      boxShadow:'4px 4px 0 rgba(54,224,246,.38)',pointerEvents:'auto',
    }}>
      <div style={{display:'grid',gridTemplateColumns:'24px minmax(0,1fr) 26px',gap:5,alignItems:'center'}}>
        <CircleHelp size={16}/>
        <div>
          <div style={{fontSize:7,fontWeight:1000,textTransform:'uppercase',opacity:.55}}>Step {index+1} / {steps.length}</div>
          <div style={{fontSize:11,fontWeight:1000,textTransform:'uppercase'}}>{step.title}</div>
        </div>
        <button aria-label="Close interactive guide" onClick={onClose} style={{...mobileButton(false),width:26,height:26,minHeight:26,padding:0}}><X size={12}/></button>
      </div>
      <div style={{fontSize:9,fontWeight:760,lineHeight:1.35,margin:'7px 0'}}>{step.body}</div>
      <div style={{display:'grid',gridTemplateColumns:'28px minmax(0,1fr) 28px',gap:4}}>
        <button disabled={index===0} aria-label="Previous guide step" onClick={()=>setIndex(value=>Math.max(0,value-1))} style={{...mobileButton(false),width:28,padding:0,opacity:index===0?.35:1}}><ChevronLeft size={12}/></button>
        {onOpenFullGuide?<button onClick={onOpenFullGuide} style={{...mobileButton(false),width:'100%'}}>Full Touch Guide</button>:<span/>}
        <button disabled={index===steps.length-1} aria-label="Next guide step" onClick={()=>setIndex(value=>Math.min(steps.length-1,value+1))} style={{...mobileButton(true),width:28,padding:0,opacity:index===steps.length-1?.35:1}}><ChevronRight size={12}/></button>
      </div>
    </div>
  </div>;
};
