/** Shared mobile-editor state. Both layouts mount this reducer. */
import {useCallback,useMemo,useReducer} from 'react';
import type {VtE1Clip,VtE1Project,VtE1Transition} from '../../../../shared/vtE1TimelineContract';
import {rippleDeleteTimelineClips,slideTimelineClip,slipTimelineClip,splitTimelineClip} from '../../../../shared/vtE1TimelineOperations.js';

export type TrackKind='video'|'audio'|'overlay'|'caption';
export interface Track{id:string;name:string;kind:TrackKind;muted?:boolean;locked?:boolean;hidden?:boolean;color?:string}
export interface EditorLayer{id:string;trackId:string;type:string;visible?:boolean;payload:Record<string,unknown>}
export interface Selection{clipIds:string[];trackId:string|null;transitionId:string|null}
const emptySelection:Selection={clipIds:[],trackId:null,transitionId:null};
export type Tool='select'|'trim'|'split'|'text'|'audio'|'transitions'|'effects'|'export';

export interface ClipVisualTransform{
  x:number;y:number;scaleX:number;scaleY:number;rotation:number;opacity:number;
  cropLeft:number;cropRight:number;cropTop:number;cropBottom:number
}
export const DEFAULT_CLIP_VISUAL_TRANSFORM:ClipVisualTransform={
  x:0,y:0,scaleX:1,scaleY:1,rotation:0,opacity:1,
  cropLeft:0,cropRight:0,cropTop:0,cropBottom:0,
};
export const readClipVisualTransform=(clip:VtE1Clip):ClipVisualTransform=>{
  const raw=(clip as VtE1Clip&{transform?:Partial<ClipVisualTransform>;cropLeft?:number;cropRight?:number;cropTop?:number;cropBottom?:number}).transform??{};
  const c=clip as VtE1Clip&Partial<ClipVisualTransform>;
  return {
    ...DEFAULT_CLIP_VISUAL_TRANSFORM,
    ...raw,
    cropLeft:c.cropLeft??raw.cropLeft??0,
    cropRight:c.cropRight??raw.cropRight??0,
    cropTop:c.cropTop??raw.cropTop??0,
    cropBottom:c.cropBottom??raw.cropBottom??0,
  };
};

export type EditorProject=VtE1Project&{tracks:Track[];layers:EditorLayer[];durationSec:number};
export interface EditorState{
  project:EditorProject;
  playheadSec:number;
  playing:boolean;
  playbackRate:number;
  zoomPxPerSec:number;
  selection:Selection;
  tool:Tool;
  panel:{open:boolean;id:Tool;height:number};
  history:{past:string[];future:string[]};
}

export type EditorAction=
  |{type:'setPlayhead';sec:number}
  |{type:'setPlaying';playing:boolean}
  |{type:'togglePlaying'}
  |{type:'setPlaybackRate';rate:number}
  |{type:'setZoom';pxPerSec:number}
  |{type:'selectClip';id:string;additive?:boolean}
  |{type:'selectTrack';id:string|null}
  |{type:'selectTransition';id:string|null}
  |{type:'clearSelection'}
  |{type:'setTool';tool:Tool}
  |{type:'openPanel';id:Tool;height?:number}
  |{type:'closePanel'}
  |{type:'setPanelHeight';height:number}
  |{type:'setPanelId';id:Tool}
  |{type:'addClip';clip:VtE1Clip}
  |{type:'addLayerClip';layer:EditorLayer;clip:VtE1Clip}
  |{type:'updateClip';id:string;patch:Partial<VtE1Clip>}
  |{type:'updateLayerPayload';id:string;patch:Record<string,unknown>}
  |{type:'setLayerVisible';id:string;visible:boolean}
  |{type:'addClipKeyframeValue';clipId:string;prop:string;value:unknown}
  |{type:'updateClipTransform';id:string;patch:Partial<ClipVisualTransform>}
  |{type:'resetClipTransform';id:string}
  |{type:'moveClip';id:string;deltaSec:number}
  |{type:'moveClipTo';id:string;startSec:number}
  |{type:'trimClip';id:string;side:'left'|'right';sec:number}
  |{type:'splitClipAtPlayhead';id:string}
  |{type:'slipClip';id:string;deltaSec:number;sourceDurationSec?:number}
  |{type:'slideClip';id:string;deltaSec:number}
  |{type:'deleteClips';ids:string[]}
  |{type:'rippleDeleteClips';ids:string[]}
  |{type:'duplicateClip';id:string}
  |{type:'muteTrack';id:string;muted?:boolean}
  |{type:'lockTrack';id:string;locked?:boolean}
  |{type:'hideTrack';id:string;hidden?:boolean}
  |{type:'addTrack';kind:TrackKind;name?:string}
  |{type:'removeTrack';id:string}
  |{type:'addTransition';transition:VtE1Transition}
  |{type:'removeTransition';id:string}
  |{type:'undo'}
  |{type:'redo'};

const ANIMATABLE_LAYER_PROPS=new Set([
  'x','y','scale','rotation','opacity','fontSize','blur','saturation','hue','brightness',
  'width','height','strokeWidth','cornerRadius','fillColor','strokeColor',
]);

const snapshot=(s:EditorState)=>JSON.stringify({project:s.project,playhead:s.playheadSec,selection:s.selection});
const withHistory=(p:EditorState,n:EditorState):EditorState=>({
  ...n,
  history:{past:[...p.history.past.slice(-49),snapshot(p)],future:[]},
});
const clampSec=(v:number,max:number)=>Math.max(0,Math.min(v,max));
const withoutTransitionsForClips=(t:VtE1Transition[]|undefined,ids:string[])=>{
  const removed=new Set(ids);
  return(t??[]).filter(x=>!removed.has(x.leftClipId)&&!removed.has(x.rightClipId));
};
const makeId=(prefix:string)=>`${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`;
const cloneLayer=(layer:EditorLayer,id:string):EditorLayer=>({
  ...layer,id,payload:{...(layer.payload??{})},
});

const MIN_CLIP_DURATION=.1;
const clipsOnSameTrack=(clips:VtE1Clip[],clip:VtE1Clip)=>
  clips.filter(other=>other.id!==clip.id&&other.trackId===clip.trackId).sort((a,b)=>a.start-b.start);

function orderedNeighbors(clips:VtE1Clip[],clip:VtE1Clip){
  const siblings=clipsOnSameTrack(clips,clip);
  const before=siblings.filter(other=>other.start<clip.start).at(-1);
  const after=siblings.find(other=>other.start>clip.start);
  return{before,after};
}

function clampClipMoveStart(clips:VtE1Clip[],clip:VtE1Clip,desiredStart:number,projectDuration:number){
  const duration=Math.max(MIN_CLIP_DURATION,clip.end-clip.start);
  const{before,after}=orderedNeighbors(clips,clip);
  const minStart=Math.max(0,before?.end??0);
  const maxByNeighbor=(after?.start??Math.max(projectDuration,desiredStart+duration))-duration;
  const maxStart=Math.max(minStart,maxByNeighbor);
  return Math.max(minStart,Math.min(desiredStart,maxStart));
}

function clampTrimEdge(clips:VtE1Clip[],clip:VtE1Clip,side:'left'|'right',desired:number,projectDuration:number){
  const{before,after}=orderedNeighbors(clips,clip);
  if(side==='left'){
    return Math.max(before?.end??0,Math.min(desired,clip.end-MIN_CLIP_DURATION));
  }
  return Math.min(after?.start??projectDuration,Math.max(desired,clip.start+MIN_CLIP_DURATION));
}

function placeClipAfterCollisions(clips:VtE1Clip[],clip:VtE1Clip){
  const duration=Math.max(MIN_CLIP_DURATION,clip.end-clip.start);
  const siblings=clips.filter(other=>other.trackId===clip.trackId).sort((a,b)=>a.start-b.start);
  let start=Math.max(0,clip.start);
  for(const other of siblings){
    if(start+duration<=other.start)break;
    if(start<other.end&&start+duration>other.start)start=other.end;
  }
  return{...clip,start,end:start+duration};
}

export function initialState(project?:Partial<EditorProject>):EditorState{
  const p:EditorProject={
    clips:[],
    transitions:[],
    tracks:[
      {id:'t_video',name:'Video',kind:'video'},
      {id:'t_overlay',name:'Overlay',kind:'overlay'},
      {id:'t_audio',name:'Audio',kind:'audio'},
    ],
    layers:[],
    durationSec:30,
    ...(project??{}),
    layers:Array.isArray(project?.layers)?project.layers:[],
  };
  return{
    project:p,
    playheadSec:0,
    playing:false,
    playbackRate:1,
    zoomPxPerSec:40,
    selection:emptySelection,
    tool:'select',
    panel:{open:false,id:'select',height:.55},
    history:{past:[],future:[]},
  };
}

export function editorReducer(state:EditorState,action:EditorAction):EditorState{
  switch(action.type){
    case'setPlayhead':
      return{...state,playheadSec:clampSec(action.sec,state.project.durationSec)};
    case'setPlaying':
      return{...state,playing:action.playing};
    case'togglePlaying':
      return{...state,playing:!state.playing};
    case'setPlaybackRate':
      return{...state,playbackRate:Math.max(.1,Math.min(4,action.rate))};
    case'setZoom':
      return{...state,zoomPxPerSec:Math.max(4,Math.min(400,action.pxPerSec))};
    case'selectClip':{
      const clipIds=action.additive
        ?(state.selection.clipIds.includes(action.id)
          ?state.selection.clipIds.filter(id=>id!==action.id)
          :[...state.selection.clipIds,action.id])
        :[action.id];
      return{...state,selection:{...emptySelection,clipIds}};
    }
    case'selectTrack':
      return{...state,selection:{...emptySelection,trackId:action.id}};
    case'selectTransition':
      return{...state,selection:{...emptySelection,transitionId:action.id}};
    case'clearSelection':
      return{...state,selection:emptySelection};
    case'setTool':
      return{...state,tool:action.tool};
    case'openPanel':
      return{...state,panel:{open:true,id:action.id,height:action.height??state.panel.height}};
    case'closePanel':
      return{...state,panel:{...state.panel,open:false}};
    case'setPanelHeight':
      return{...state,panel:{...state.panel,height:Math.max(.15,Math.min(1,action.height))}};
    case'setPanelId':
      return{...state,panel:{...state.panel,id:action.id}};
    case'addClip':
      return withHistory(state,{...state,project:{...state.project,clips:[...state.project.clips,action.clip]}});
    case'addLayerClip':{
      const placed=placeClipAfterCollisions(state.project.clips,action.clip);
      return withHistory(state,{
        ...state,
        project:{
          ...state.project,
          layers:[...state.project.layers,action.layer],
          clips:[...state.project.clips,placed],
          durationSec:Math.max(state.project.durationSec,Number(placed.end||0)),
        },
        selection:{...emptySelection,clipIds:[placed.id]},
      });
    }
    case'updateClip':
      return withHistory(state,{
        ...state,
        project:{...state.project,clips:state.project.clips.map(c=>c.id===action.id?{...c,...action.patch}:c)},
      });
    case'updateLayerPayload':{
      const nextLayers=state.project.layers.map(layer=>
        layer.id===action.id?{...layer,payload:{...(layer.payload??{}),...action.patch}}:layer
      );
      const animProps=Object.keys(action.patch).filter(prop=>ANIMATABLE_LAYER_PROPS.has(prop));
      const nextClips=!animProps.length?state.project.clips:state.project.clips.map(clip=>{
        if(String(clip.layerId??'')!==action.id)return clip;
        if(state.playheadSec<clip.start||state.playheadSec>clip.end)return clip;
        const keyframes=Array.isArray(clip.keyframes)?clip.keyframes:[];
        if(!keyframes.length)return clip;
        const offsetSec=Math.max(0,state.playheadSec-clip.start);
        const existing=keyframes.find(k=>Math.abs(Number(k.offsetSec??0)-offsetSec)<=.03);
        if(existing){
          return{
            ...clip,
            keyframes:keyframes.map(k=>{
              if(k!==existing)return k;
              const values={...((k.values??{}) as Record<string,unknown>)};
              animProps.forEach(prop=>{values[prop]=action.patch[prop]});
              return{...k,values};
            }),
          };
        }
        const values:Record<string,unknown>={};
        animProps.forEach(prop=>{values[prop]=action.patch[prop]});
        return{
          ...clip,
          keyframes:[...keyframes,{id:makeId('kf'),offsetSec,values,mode:animProps.length>1?'diamond':'circle',interp:'linear'}].sort((a,b)=>Number(a.offsetSec??0)-Number(b.offsetSec??0)),
        };
      });
      return withHistory(state,{...state,project:{...state.project,layers:nextLayers,clips:nextClips}});
    }
    case'setLayerVisible':
      return withHistory(state,{
        ...state,
        project:{...state.project,layers:state.project.layers.map(l=>l.id===action.id?{...l,visible:action.visible}:l)},
      });
    case'addClipKeyframeValue':{
      const clips=state.project.clips.map(clip=>{
        if(clip.id!==action.clipId)return clip;
        const offsetSec=Math.max(0,Math.min(clip.end-clip.start,state.playheadSec-clip.start));
        const keyframes=Array.isArray(clip.keyframes)?clip.keyframes:[];
        const existing=keyframes.find(k=>Math.abs(Number(k.offsetSec??0)-offsetSec)<=.03);
        if(existing){
          return{
            ...clip,
            keyframes:keyframes.map(k=>k!==existing?k:{
              ...k,
              mode:k.mode==='diamond'?'diamond':'circle',
              values:{...((k.values??{}) as Record<string,unknown>),[action.prop]:action.value},
            }),
          };
        }
        return{
          ...clip,
          keyframes:[...keyframes,{id:makeId('kf'),offsetSec,values:{[action.prop]:action.value},mode:'circle',interp:'linear'}].sort((a,b)=>Number(a.offsetSec??0)-Number(b.offsetSec??0)),
        };
      });
      return withHistory(state,{...state,project:{...state.project,clips}});
    }
    case'updateClipTransform':{
      const clips=state.project.clips.map(c=>{
        if(c.id!==action.id)return c;
        const current=readClipVisualTransform(c),next={...current,...action.patch};
        next.opacity=Math.max(0,Math.min(1,next.opacity));
        next.scaleX=Math.max(.05,next.scaleX);
        next.scaleY=Math.max(.05,next.scaleY);
        for(const k of ['cropLeft','cropRight','cropTop','cropBottom'] as const)next[k]=Math.max(0,Math.min(.95,next[k]));
        if(next.cropLeft+next.cropRight>.98)next.cropRight=.98-next.cropLeft;
        if(next.cropTop+next.cropBottom>.98)next.cropBottom=.98-next.cropTop;
        return{
          ...c,
          transform:{x:next.x,y:next.y,scaleX:next.scaleX,scaleY:next.scaleY,rotation:next.rotation,opacity:next.opacity},
          cropLeft:next.cropLeft,cropRight:next.cropRight,cropTop:next.cropTop,cropBottom:next.cropBottom,
        } as VtE1Clip;
      });
      return withHistory(state,{...state,project:{...state.project,clips}});
    }
    case'resetClipTransform':
      return editorReducer(state,{type:'updateClipTransform',id:action.id,patch:DEFAULT_CLIP_VISUAL_TRANSFORM});
    case'moveClip':{
      const clip=state.project.clips.find(c=>c.id===action.id);
      if(!clip)return state;
      const duration=clip.end-clip.start;
      const start=clampClipMoveStart(state.project.clips,clip,clip.start+action.deltaSec,state.project.durationSec);
      const clips=state.project.clips.map(c=>c.id===clip.id?{...c,start,end:start+duration}:c);
      return withHistory(state,{...state,project:{...state.project,clips}});
    }
    case'moveClipTo':{
      const clip=state.project.clips.find(c=>c.id===action.id);
      if(!clip)return state;
      const duration=clip.end-clip.start;
      const start=clampClipMoveStart(state.project.clips,clip,action.startSec,state.project.durationSec);
      const clips=state.project.clips.map(c=>c.id===clip.id?{...c,start,end:start+duration}:c);
      return withHistory(state,{...state,project:{...state.project,clips}});
    }
    case'trimClip':{
      const clip=state.project.clips.find(c=>c.id===action.id);
      if(!clip)return state;
      const edge=clampTrimEdge(state.project.clips,clip,action.side,action.sec,state.project.durationSec);
      const clips=state.project.clips.map(c=>c.id!==action.id
        ?c
        :action.side==='left'?{...c,start:edge}:{...c,end:edge}
      );
      return withHistory(state,{...state,project:{...state.project,clips}});
    }
    case'splitClipAtPlayhead':{
      const clip=state.project.clips.find(c=>c.id===action.id);
      if(!clip)return state;
      const split=splitTimelineClip(clip,state.playheadSec);
      if(!split)return state;
      const right:VtE1Clip={...split.right,id:makeId(`${clip.id}_r`)};
      return withHistory(state,{
        ...state,
        project:{...state.project,clips:state.project.clips.flatMap(c=>c.id===clip.id?[split.left,right]:[c])},
      });
    }
    case'slipClip':{
      const clip=state.project.clips.find(c=>c.id===action.id);
      if(!clip)return state;
      const slipped=slipTimelineClip(clip,action.deltaSec,action.sourceDurationSec??Infinity);
      if(!slipped)return state;
      return withHistory(state,{
        ...state,
        project:{...state.project,clips:state.project.clips.map(c=>c.id===action.id?slipped:c)},
      });
    }
    case'slideClip':{
      const r=slideTimelineClip(state.project.clips,action.id,action.deltaSec);
      return!r.appliedDeltaSec?state:withHistory(state,{...state,project:{...state.project,clips:r.clips}});
    }
    case'deleteClips':{
      const removed=new Set(action.ids);
      const clips=state.project.clips.filter(c=>!removed.has(c.id));
      const liveLayerIds=new Set(clips.map(c=>String(c.layerId??'')).filter(Boolean));
      return withHistory(state,{
        ...state,
        project:{
          ...state.project,
          clips,
          layers:state.project.layers.filter(l=>liveLayerIds.has(l.id)),
          transitions:withoutTransitionsForClips(state.project.transitions,action.ids),
        },
        selection:emptySelection,
      });
    }
    case'rippleDeleteClips':{
      if(!action.ids.length)return state;
      const clips=rippleDeleteTimelineClips(state.project.clips,action.ids);
      const liveLayerIds=new Set(clips.map(c=>String(c.layerId??'')).filter(Boolean));
      return withHistory(state,{
        ...state,
        project:{
          ...state.project,
          clips,
          layers:state.project.layers.filter(l=>liveLayerIds.has(l.id)),
          transitions:withoutTransitionsForClips(state.project.transitions,action.ids),
        },
        selection:emptySelection,
      });
    }
    case'duplicateClip':{
      const c=state.project.clips.find(x=>x.id===action.id);
      if(!c)return state;
      const d=c.end-c.start;
      const copyId=makeId(`${c.id}_dup`);
      const sourceLayer=state.project.layers.find(l=>l.id===String(c.layerId??''));
      const copyLayer=sourceLayer?cloneLayer(sourceLayer,makeId('layer')):null;
      const copy:VtE1Clip={
        ...c,
        id:copyId,
        layerId:copyLayer?.id??c.layerId,
        start:c.end,
        end:c.end+d,
        keyframes:(c.keyframes??[]).map(k=>({...k,id:makeId('kf'),values:{...((k.values??{}) as Record<string,unknown>)}})),
      };
      return withHistory(state,{
        ...state,
        project:{
          ...state.project,
          layers:copyLayer?[...state.project.layers,copyLayer]:state.project.layers,
          clips:[...state.project.clips,copy],
          durationSec:Math.max(state.project.durationSec,copy.end),
        },
        selection:{...emptySelection,clipIds:[copy.id]},
      });
    }
    case'muteTrack':
      return{...state,project:{...state.project,tracks:state.project.tracks.map(t=>t.id===action.id?{...t,muted:action.muted??!t.muted}:t)}};
    case'lockTrack':
      return{...state,project:{...state.project,tracks:state.project.tracks.map(t=>t.id===action.id?{...t,locked:action.locked??!t.locked}:t)}};
    case'hideTrack':
      return{...state,project:{...state.project,tracks:state.project.tracks.map(t=>t.id===action.id?{...t,hidden:action.hidden??!t.hidden}:t)}};
    case'addTrack':{
      const id=makeId(`track_${action.kind}`);
      const ordinal=state.project.tracks.filter(track=>track.kind===action.kind).length+1;
      const track:Track={id,name:action.name??`${action.kind[0].toUpperCase()}${action.kind.slice(1)} ${ordinal}`,kind:action.kind};
      return withHistory(state,{...state,project:{...state.project,tracks:[...state.project.tracks,track]},selection:{...emptySelection,trackId:id}});
    }
    case'removeTrack':{
      const hasClips=state.project.clips.some(clip=>clip.trackId===action.id);
      if(hasClips||state.project.tracks.length<=1)return state;
      const tracks=state.project.tracks.filter(track=>track.id!==action.id);
      return withHistory(state,{...state,project:{...state.project,tracks},selection:state.selection.trackId===action.id?emptySelection:state.selection});
    }
    case'addTransition':
      return withHistory(state,{...state,project:{...state.project,transitions:[...(state.project.transitions??[]),action.transition]}});
    case'removeTransition':
      return withHistory(state,{...state,project:{...state.project,transitions:(state.project.transitions??[]).filter(t=>(t as{id?:string}).id!==action.id)}});
    case'undo':{
      const last=state.history.past.at(-1);
      if(!last)return state;
      const p=JSON.parse(last);
      return{
        ...state,project:p.project,playheadSec:p.playhead,selection:p.selection,
        history:{past:state.history.past.slice(0,-1),future:[snapshot(state),...state.history.future]},
      };
    }
    case'redo':{
      const next=state.history.future[0];
      if(!next)return state;
      const p=JSON.parse(next);
      return{
        ...state,project:p.project,playheadSec:p.playhead,selection:p.selection,
        history:{past:[...state.history.past,snapshot(state)],future:state.history.future.slice(1)},
      };
    }
    default:
      return state;
  }
}

export interface EditorStore{
  state:EditorState;
  dispatch:React.Dispatch<EditorAction>;
  selectedClips:VtE1Clip[];
  selectedLayer:EditorLayer|undefined;
  trackById:(id:string)=>Track|undefined;
  layerById:(id:string)=>EditorLayer|undefined;
  clipsOnTrack:(trackId:string)=>VtE1Clip[];
  activeClipAtPlayhead:(trackId?:string)=>VtE1Clip|undefined;
  canUndo:boolean;
  canRedo:boolean;
}

export function useEditorState(seed?:Partial<EditorProject>):EditorStore{
  const[state,dispatch]=useReducer(editorReducer,undefined,()=>initialState(seed));
  const selectedClips=useMemo(
    ()=>state.project.clips.filter(c=>state.selection.clipIds.includes(c.id)),
    [state.project.clips,state.selection.clipIds],
  );
  const trackById=useCallback(
    (id:string)=>state.project.tracks.find(t=>t.id===id),
    [state.project.tracks],
  );
  const layerById=useCallback(
    (id:string)=>state.project.layers.find(l=>l.id===id),
    [state.project.layers],
  );
  const selectedLayer=useMemo(()=>{
    const clip=selectedClips[0];
    return clip?.layerId?state.project.layers.find(l=>l.id===String(clip.layerId)):undefined;
  },[selectedClips,state.project.layers]);
  const clipsOnTrack=useCallback(
    (id:string)=>state.project.clips.filter(c=>c.trackId===id).sort((a,b)=>a.start-b.start),
    [state.project.clips],
  );
  const activeClipAtPlayhead=useCallback(
    (id?:string)=>state.project.clips.find(c=>state.playheadSec>=c.start&&state.playheadSec<c.end&&(!id||c.trackId===id)),
    [state.project.clips,state.playheadSec],
  );
  return{
    state,dispatch,selectedClips,selectedLayer,trackById,layerById,clipsOnTrack,activeClipAtPlayhead,
    canUndo:state.history.past.length>0,canRedo:state.history.future.length>0,
  };
}
