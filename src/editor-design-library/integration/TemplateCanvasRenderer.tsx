import React from 'react';
import type {VtE1Clip} from '../../shared/vtE1TimelineContract';
import type {TemplateDefinition,TemplateElement,TemplateStyleConfig,StyleTokenPath} from '../core/schema';

type TemplateStyleOverrides=Partial<Omit<TemplateStyleConfig,'colors'>>&{colors?:Partial<TemplateStyleConfig['colors']>};
type TemplateOverrides={
  content?:Record<string,unknown>;
  style?:TemplateStyleOverrides;
};
type DesignClip=VtE1Clip&{
  templateDefinition?:TemplateDefinition;
  templateOverrides?:TemplateOverrides;
};
export interface TemplateElementSelection{clipId:string;elementId:string}
export interface TemplateCanvasRendererProps{
  clips:VtE1Clip[];
  playheadSec:number;
  selected?:TemplateElementSelection|null;
  onSelectElement?:(selection:TemplateElementSelection)=>void;
}

const elementStyle=(e:TemplateElement,t:TemplateDefinition):React.CSSProperties=>({
  position:'absolute',
  left:`${e.x/t.width*100}%`,
  top:`${e.y/t.height*100}%`,
  width:`${e.width/t.width*100}%`,
  height:`${e.height/t.height*100}%`,
  opacity:e.opacity??1,
  rotate:e.rotation?`${e.rotation}deg`:undefined,
  boxSizing:'border-box',
});

function overrideFor(element:TemplateElement,clip:DesignClip){
  return clip.templateOverrides?.content?.[element.id];
}
function overriddenElement(element:TemplateElement,clip:DesignClip):TemplateElement|null{
  const override=overrideFor(element,clip);
  if(override&&typeof override==='object'&&!Array.isArray(override)){
    const record=override as Record<string,unknown>;
    if(record.visible===false)return null;
    return{
      ...element,
      ...(typeof record.text==='string'?{text:record.text}:{}),
      ...(typeof record.svg==='string'?{svg:record.svg}:{}),
      ...(typeof record.fill==='string'?{fill:record.fill}:{}),
    };
  }
  if(typeof override==='string'&&element.type==='text')return{...element,text:override};
  return element;
}
function tokenColor(token:StyleTokenPath|undefined,template:TemplateDefinition,clip:DesignClip,fallback:string){
  if(!token?.startsWith('colors.'))return fallback;
  const key=token.slice('colors.'.length) as keyof TemplateStyleConfig['colors'];
  const fromClip=clip.templateOverrides?.style?.colors?.[key];
  const fromTemplate=template.style?.colors?.[key];
  return String(fromClip??fromTemplate??fallback);
}

export const TemplateCanvasRenderer:React.FC<TemplateCanvasRendererProps>=({
  clips,playheadSec,selected,onSelectElement,
})=>{
  const active=clips.filter(c=>playheadSec>=c.start&&playheadSec<c.end&&(c as DesignClip).templateDefinition);
  return <div
    data-viewtube-template-canvas
    style={{position:'absolute',inset:0,pointerEvents:onSelectElement?'auto':'none'}}
  >
    {active.map(rawClip=>{
      const clip=rawClip as DesignClip;
      const t=clip.templateDefinition!;
      const background=String(clip.templateOverrides?.style?.colors?.background??t.background??'transparent');
      return <div key={clip.id} style={{position:'absolute',inset:0,background,overflow:'hidden'}}>
        {t.elements.map(raw=>{
          const e=overriddenElement(raw,clip);
          if(!e)return null;
          return <Element
            key={e.id}
            element={e}
            template={t}
            clip={clip}
            selected={selected?.clipId===clip.id&&selected.elementId===e.id}
            onSelect={()=>onSelectElement?.({clipId:clip.id,elementId:e.id})}
          />;
        })}
      </div>;
    })}
  </div>;
};

const Element:React.FC<{
  element:TemplateElement;
  template:TemplateDefinition;
  clip:DesignClip;
  selected:boolean;
  onSelect:()=>void;
}>=({element:e,template:t,clip,selected,onSelect})=>{
  const outline=selected?{outline:'3px solid #36E0F6',outlineOffset:2}:{};
  const fill=tokenColor(e.fillToken,t,clip,e.fill??'#171717');
  if(e.type==='text')return <div
    onPointerDown={ev=>{ev.stopPropagation();onSelect()}}
    style={{
      ...elementStyle(e,t),...outline,
      fontFamily:e.fontFamily??'Arial, sans-serif',
      fontSize:`clamp(10px, ${(e.fontSize??48)/t.width*100}vw, ${e.fontSize??48}px)`,
      fontWeight:e.fontWeight??900,lineHeight:.95,color:fill,
      whiteSpace:'pre-wrap',cursor:e.editable?'pointer':'default',
    }}
  >{e.text}</div>;
  if(e.type==='svg'&&e.svg)return <div
    onPointerDown={ev=>{ev.stopPropagation();onSelect()}}
    style={{...elementStyle(e,t),...outline,cursor:e.editable?'pointer':'default',color:fill}}
  >
    <img alt="" draggable={false} src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(e.svg)}`} style={{width:'100%',height:'100%',display:'block',pointerEvents:'none'}}/>
  </div>;
  return null;
};
