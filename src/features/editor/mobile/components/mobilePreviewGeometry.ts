import type {VtE1Clip} from '../../../../shared/vtE1TimelineContract';
import type {EditorStore} from '../state/editorState';
import {resolveVtE1VisualFrame} from '../../../../shared/vtE1VisualFrame.js';

type LayerLike={id?:string;type?:string;visible?:boolean;payload?:Record<string,unknown>};

export {evaluateVtE1KeyframedValue as keyframedValue} from '../../../../shared/vtE1VisualFrame.js';

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
  const projectWidth=Math.max(1,Number(project.meta?.width??project.meta?.compositionWidth??1920));
  const projectHeight=Math.max(1,Number(project.meta?.height??project.meta?.compositionHeight??1080));
  const visual=resolveVtE1VisualFrame(base,clip,localSec,projectWidth,projectHeight);
  return{
    clip,
    layer,
    payload:visual.payload,
    type:String(layer?.type??visual.payload.clipType??(visual.payload.text?'text':'media')),
    projectWidth,
    projectHeight,
    x:visual.x,
    y:visual.y,
    width:visual.width,
    height:visual.height,
    scaleX:visual.scaleX,
    scaleY:visual.scaleY,
    rotation:visual.rotation,
    opacity:visual.opacity,
  };
}
