import type {VtE1Clip} from '../../../../shared/vtE1TimelineContract';
import type {EditorStore} from '../state/editorState';
import {readClipVisualTransform} from '../state/editorState';
import {VT_E1_ANIMATED_FX_KEYS} from '../../../../shared/vtE1FxCatalog.js';

type Keyframe={offsetSec?:number;values?:Record<string,unknown>;interp?:string};
type LayerLike={id?:string;type?:string;visible?:boolean;payload?:Record<string,unknown>};

const clamp=(v:number,min:number,max:number)=>Math.min(max,Math.max(min,v));

function eased(t:number,kind:string){
  if(kind==='easeIn')return t*t;
  if(kind==='easeOut')return 1-(1-t)*(1-t);
  if(kind==='easeInOut')return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
  return t;
}

export function keyframedValue(base:unknown,keyframes:Keyframe[]|undefined,prop:string,localSec:number){
  const items=(keyframes??[])
    .filter(k=>k.values&&Object.prototype.hasOwnProperty.call(k.values,prop))
    .sort((a,b)=>Number(a.offsetSec??0)-Number(b.offsetSec??0));
  if(!items.length)return base;
  if(localSec<=Number(items[0].offsetSec??0))return items[0].values?.[prop]??base;
  const last=items[items.length-1];
  if(localSec>=Number(last.offsetSec??0))return last.values?.[prop]??base;
  for(let i=0;i<items.length-1;i++){
    const left=items[i],right=items[i+1];
    const a=Number(left.offsetSec??0),b=Number(right.offsetSec??0);
    if(localSec<a||localSec>b)continue;
    const lv=left.values?.[prop],rv=right.values?.[prop];
    if(typeof lv==='number'&&typeof rv==='number'){
      const p=eased(clamp((localSec-a)/Math.max(.001,b-a),0,1),String(right.interp??left.interp??'linear'));
      return lv+(rv-lv)*p;
    }
    return localSec<b?lv:rv;
  }
  return base;
}

export interface ClipPreviewGeometry{
  clip:VtE1Clip;
  layer?:LayerLike;
  payload:Record<string,unknown>;
  type:string;
  projectWidth:number;
  projectHeight:number;
  x:number;
  y:number;
  width:number;
  height:number;
  scaleX:number;
  scaleY:number;
  rotation:number;
  opacity:number;
}

export function resolveClipPreviewGeometry(store:EditorStore,clip:VtE1Clip):ClipPreviewGeometry{
  const project=store.state.project as typeof store.state.project&{meta?:Record<string,unknown>;layers?:LayerLike[]};
  const layer=clip.layerId
    ?(project.layers??[]).find(entry=>String(entry.id??'')===String(clip.layerId))
    :undefined;
  const base={...((layer?.payload??{}) as Record<string,unknown>),...(clip as Record<string,unknown>)};
  const localSec=Math.max(0,store.state.playheadSec-clip.start);
  const animated={...base};
  for(const prop of ['x','y','scale','rotation','width','height','fontSize','strokeWidth',...VT_E1_ANIMATED_FX_KEYS]){
    animated[prop]=keyframedValue(animated[prop],clip.keyframes as Keyframe[]|undefined,prop,localSec);
  }
  const mobile=readClipVisualTransform(clip);
  const projectWidth=Math.max(1,Number(project.meta?.width??project.meta?.compositionWidth??1920));
  const projectHeight=Math.max(1,Number(project.meta?.height??project.meta?.compositionHeight??1080));
  const baseScale=Math.max(.0001,Number(animated.scale??1));
  return{
    clip,
    layer,
    payload:animated,
    type:String(layer?.type??animated.clipType??(animated.text?'text':'media')),
    projectWidth,
    projectHeight,
    x:Number(animated.x??0)+mobile.x,
    y:Number(animated.y??0)+mobile.y,
    width:Math.max(1,Number(animated.width??projectWidth)),
    height:Math.max(1,Number(animated.height??projectHeight)),
    scaleX:baseScale*mobile.scaleX,
    scaleY:baseScale*mobile.scaleY,
    rotation:Number(animated.rotation??0)+mobile.rotation,
    opacity:clamp(Number(animated.opacity??1)*mobile.opacity,0,1),
  };
}
