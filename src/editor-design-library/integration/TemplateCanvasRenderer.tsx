import React from 'react';
import type {VtE1Clip} from '../../shared/vtE1TimelineContract';
import type {TemplateDefinition,TemplateElement} from '../core/schema';

type DesignClip=VtE1Clip&{templateDefinition?:TemplateDefinition};
export interface TemplateElementSelection {clipId:string;elementId:string}
export interface TemplateCanvasRendererProps {clips:VtE1Clip[];playheadSec:number;selected?:TemplateElementSelection|null;onSelectElement?:(selection:TemplateElementSelection)=>void}

const styleFor=(element:TemplateElement,template:TemplateDefinition):React.CSSProperties=>({position:'absolute',left:`${element.x/template.width*100}%`,top:`${element.y/template.height*100}%`,width:`${element.width/template.width*100}%`,height:`${element.height/template.height*100}%`,opacity:element.opacity??1,rotate:element.rotation?`${element.rotation}deg`:undefined,color:element.fill,boxSizing:'border-box'});

export const TemplateCanvasRenderer:React.FC<TemplateCanvasRendererProps>=({clips,playheadSec,selected,onSelectElement})=>{
 const active=clips.filter(c=>playheadSec>=c.start&&playheadSec<c.end&&(c as DesignClip).templateDefinition);
 return <div data-viewtube-template-canvas style={{position:'absolute',inset:0,pointerEvents:onSelectElement?'auto':'none'}}>{active.map(clip=>{const template=(clip as DesignClip).templateDefinition!;return <div key={clip.id} style={{position:'absolute',inset:0,background:template.background??'transparent',overflow:'hidden'}}>{template.elements.map(element=><TemplateElementView key={element.id} element={element} template={template} selected={selected?.clipId===clip.id&&selected.elementId===element.id} onSelect={()=>onSelectElement?.({clipId:clip.id,elementId:element.id})}/>)}</div>})}</div>;
};

const TemplateElementView:React.FC<{element:TemplateElement;template:TemplateDefinition;selected?:boolean;onSelect:()=>void}>=({element,template,selected,onSelect})=>{
 const selection:React.CSSProperties=selected?{outline:'3px solid #34cdea',outlineOffset:2}:{};
 if(element.type==='text')return <div onPointerDown={e=>{e.stopPropagation();onSelect()}} style={{...styleFor(element,template),...selection,fontFamily:element.fontFamily??'Arial, sans-serif',fontSize:`clamp(10px, ${(element.fontSize??48)/template.width*100}vw, ${element.fontSize??48}px)`,fontWeight:element.fontWeight??900,lineHeight:.95,color:element.fill??'#171717',whiteSpace:'pre-wrap',transformOrigin:'top left',cursor:element.editable?'pointer':'default'}}>{element.text}</div>;
 if(element.type==='svg'&&element.svg)return <div onPointerDown={e=>{e.stopPropagation();onSelect()}} style={{...styleFor(element,template),...selection,cursor:element.editable?'pointer':'default'}}><img alt="" draggable={false} src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(element.svg)}`} style={{width:'100%',height:'100%',display:'block',pointerEvents:'none'}}/></div>;
 return null;
};
