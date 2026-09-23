import React from 'react';
import type {TemplateDefinition,TemplateElement,TemplateStyleConfig,StyleTokenPath} from '../../../../editor-design-library/core/schema';

const INK='#248b99';

type StyleOverrides=Partial<Omit<TemplateStyleConfig,'colors'>>&{colors?:Partial<TemplateStyleConfig['colors']>};

export interface TemplateVisualPreviewProps{
  template:TemplateDefinition;
  styleOverrides?:StyleOverrides;
  contentOverrides?:Record<string,unknown>;
  selectedElementId?:string|null;
  interactive?:boolean;
  onSelectElement?:(element:TemplateElement)=>void;
  className?:string;
  style?:React.CSSProperties;
}

const tokenColor=(token:StyleTokenPath|undefined,template:TemplateDefinition,overrides:StyleOverrides|undefined,fallback:string)=>{
  if(!token?.startsWith('colors.'))return fallback;
  const key=token.slice('colors.'.length) as keyof TemplateStyleConfig['colors'];
  return String(overrides?.colors?.[key]??template.style?.colors?.[key]??fallback);
};

const svgDataUri=(svg:string)=>`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

function overrideElement(element:TemplateElement,content?:Record<string,unknown>):TemplateElement|null{
  const raw=content?.[element.id];
  if(raw&&typeof raw==='object'&&!Array.isArray(raw)){
    const record=raw as Record<string,unknown>;
    if(record.visible===false)return null;
    return{
      ...element,
      ...(typeof record.text==='string'?{text:record.text}:{}),
      ...(typeof record.svg==='string'?{svg:record.svg}:{}),
      ...(typeof record.fill==='string'?{fill:record.fill}:{}),
    };
  }
  if(typeof raw==='string'&&element.type==='text')return{...element,text:raw};
  return element;
}

const PreviewElement:React.FC<{
  element:TemplateElement;
  template:TemplateDefinition;
  styleOverrides?:StyleOverrides;
  contentOverrides?:Record<string,unknown>;
  selectedElementId?:string|null;
  interactive?:boolean;
  onSelectElement?:(element:TemplateElement)=>void;
}>=({element:raw,template,styleOverrides,contentOverrides,selectedElementId,interactive,onSelectElement})=>{
  const element=overrideElement(raw,contentOverrides);
  if(!element)return null;
  const left=(element.x/Math.max(1,template.width))*100;
  const top=(element.y/Math.max(1,template.height))*100;
  const width=(element.width/Math.max(1,template.width))*100;
  const height=(element.height/Math.max(1,template.height))*100;
  const selected=selectedElementId===element.id;
  const base:React.CSSProperties={
    position:'absolute',
    left:`${left}%`,top:`${top}%`,
    width:`${width}%`,height:`${height}%`,
    transform:`rotate(${Number(element.rotation??0)}deg)`,
    transformOrigin:'top left',
    opacity:element.opacity??1,
    boxSizing:'border-box',
    overflow:'hidden',
    pointerEvents:interactive?'auto':'none',
    outline:selected?`2px solid ${INK}`:undefined,
    outlineOffset:selected?1:undefined,
  };
  const fill=tokenColor(element.fillToken,template,styleOverrides,element.fill??String(styleOverrides?.colors?.foreground??template.style?.colors?.foreground??'#171717'));
  const activate=(event:React.PointerEvent)=>{
    if(!interactive)return;
    event.stopPropagation();
    onSelectElement?.(element);
  };

  if(element.type==='text'&&!String(element.text??'').trim())return null;

  if(element.type==='text')return <div
    onPointerDown={activate}
    style={{
      ...base,color:fill,
      fontFamily:element.fontFamily??template.style?.typography?.displayFamily??'Arial, sans-serif',
      fontWeight:element.fontWeight??template.style?.typography?.fontWeight??900,
      fontSize:`clamp(4px,${Math.max(2,(element.fontSize??48)/Math.max(1,template.width)*100)}vw,24px)`,
      lineHeight:template.style?.typography?.lineHeight??.95,
      display:'flex',alignItems:'center',
      whiteSpace:'pre-wrap',textAlign:'left',
    }}
  >{element.text}</div>;

  if(element.type==='svg'&&element.svg)return <div onPointerDown={activate} style={base}>
    <img alt="" draggable={false} src={svgDataUri(element.svg)} style={{width:'100%',height:'100%',display:'block',objectFit:'contain',pointerEvents:'none'}}/>
  </div>;

  if(element.children?.length)return <div onPointerDown={activate} style={base}>
    {element.children.map(child=><PreviewElement
      key={child.id}
      element={child}
      template={template}
      styleOverrides={styleOverrides}
      contentOverrides={contentOverrides}
      selectedElementId={selectedElementId}
      interactive={interactive}
      onSelectElement={onSelectElement}
    />)}
  </div>;

  return <div onPointerDown={activate} style={{...base,background:fill,border:`1px solid ${INK}`}}/>;
};

export const TemplateVisualPreview:React.FC<TemplateVisualPreviewProps>=({
  template,styleOverrides,contentOverrides,selectedElementId,interactive=false,onSelectElement,className,style,
})=>{
  const background=String(styleOverrides?.colors?.background??template.style?.colors?.background??template.background??'transparent');
  const checker='linear-gradient(45deg,#eef3f4 25%,transparent 25%),linear-gradient(-45deg,#eef3f4 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#eef3f4 75%),linear-gradient(-45deg,transparent 75%,#eef3f4 75%)';
  return <div
    className={className}
    aria-label={template.name}
    style={{
      position:'relative',width:'100%',height:'100%',overflow:'hidden',
      background:template.transparent?checker:background,
      backgroundColor:template.transparent?'#fff':undefined,
      backgroundSize:template.transparent?'12px 12px':undefined,
      backgroundPosition:template.transparent?'0 0,0 6px,6px -6px,-6px 0px':undefined,
      userSelect:'none',WebkitUserSelect:'none',WebkitTouchCallout:'none',WebkitTapHighlightColor:'transparent',
      ...style,
    }}
  >
    {template.transparent&&background!=='transparent'?<div style={{position:'absolute',inset:0,background}}/>:null}
    {template.elements.map(element=><PreviewElement
      key={element.id}
      element={element}
      template={template}
      styleOverrides={styleOverrides}
      contentOverrides={contentOverrides}
      selectedElementId={selectedElementId}
      interactive={interactive}
      onSelectElement={onSelectElement}
    />)}
  </div>;
};
