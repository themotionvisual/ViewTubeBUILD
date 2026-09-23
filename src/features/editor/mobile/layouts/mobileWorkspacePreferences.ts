import React from 'react';

export type WorkspaceFocus='preview'|'timeline'|'inspector'|null;
export type WorkspacePreset='edit'|'animate'|'audio'|'color'|'template'|'timeline';

export interface MobileWorkspacePreferences{
  mainSplit:number;
  timelineScale:number;
  showTimeline:boolean;
  showMap:boolean;
  showActionLabels:boolean;
  layoutDraggingEnabled:boolean;
  preset:WorkspacePreset;
  focus:WorkspaceFocus;
  lastPage:string;
}

const DEFAULTS:MobileWorkspacePreferences={
  mainSplit:.52,
  timelineScale:1,
  showTimeline:true,
  showMap:false,
  showActionLabels:false,
  layoutDraggingEnabled:false,
  preset:'edit',
  focus:null,
  lastPage:'media',
};

const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));
const storageKey=(orientation:'portrait'|'landscape',isPortraitVideo:boolean)=>
  `viewtube.mobile.workspace.v2.${orientation}.${isPortraitVideo?'9x16':'16x9'}`;

function read(orientation:'portrait'|'landscape',isPortraitVideo:boolean):MobileWorkspacePreferences{
  if(typeof window==='undefined')return DEFAULTS;
  try{
    const raw=JSON.parse(localStorage.getItem(storageKey(orientation,isPortraitVideo))||'{}');
    return{
      ...DEFAULTS,
      ...raw,
      mainSplit:clamp(Number(raw.mainSplit??DEFAULTS.mainSplit),.28,.72),
      timelineScale:clamp(Number(raw.timelineScale??DEFAULTS.timelineScale),.55,1.65),
      showTimeline:raw.showTimeline!==false,
      showMap:Boolean(raw.showMap),
      showActionLabels:Boolean(raw.showActionLabels),
      layoutDraggingEnabled:Boolean(raw.layoutDraggingEnabled),
      focus:['preview','timeline','inspector'].includes(raw.focus)?raw.focus:null,
    };
  }catch{return DEFAULTS}
}

export function useMobileWorkspacePreferences(
  orientation:'portrait'|'landscape',
  isPortraitVideo:boolean,
){
  const key=storageKey(orientation,isPortraitVideo);
  const[saved,setSaved]=React.useState<{key:string;value:MobileWorkspacePreferences}>(
    ()=>({key,value:read(orientation,isPortraitVideo)}),
  );
  // A rotation renders with a new key before effects run. Never expose the
  // previous orientation's settings under that key, even for one render.
  const prefs=saved.key===key?saved.value:read(orientation,isPortraitVideo);

  React.useEffect(()=>{
    setSaved(current=>current.key===key?current:{key,value:read(orientation,isPortraitVideo)});
  },[key,orientation,isPortraitVideo]);
  React.useEffect(()=>{
    if(typeof window==='undefined'||saved.key!==key)return;
    try{localStorage.setItem(key,JSON.stringify(saved.value))}catch{/* Private browsing can block storage. */}
  },[key,saved]);

  const patch=React.useCallback((next:Partial<MobileWorkspacePreferences>)=>{
    setSaved(current=>{
      const base=current.key===key?current.value:read(orientation,isPortraitVideo);
      return{key,value:{
        ...base,
        ...next,
        mainSplit:next.mainSplit==null?base.mainSplit:clamp(next.mainSplit,.28,.72),
        timelineScale:next.timelineScale==null?base.timelineScale:clamp(next.timelineScale,.55,1.65),
      }};
    });
  },[key,orientation,isPortraitVideo]);

  return[prefs,patch] as const;
}

export const WORKSPACE_PRESETS:Array<{id:WorkspacePreset;label:string}>=([
  {id:'edit',label:'Edit'},
  {id:'animate',label:'Animate'},
  {id:'audio',label:'Audio'},
  {id:'color',label:'Color'},
  {id:'template',label:'Template'},
  {id:'timeline',label:'Timeline'},
]);

export function presetPatch(preset:WorkspacePreset):Partial<MobileWorkspacePreferences>{
  switch(preset){
    case'animate':return{preset,mainSplit:.48,timelineScale:1.2,showTimeline:true,showMap:true,focus:null,lastPage:'effects'};
    case'audio':return{preset,mainSplit:.42,timelineScale:1.25,showTimeline:true,showMap:true,focus:null,lastPage:'audio'};
    case'color':return{preset,mainSplit:.5,timelineScale:.9,showTimeline:true,showMap:false,focus:null,lastPage:'effects'};
    case'template':return{preset,mainSplit:.5,timelineScale:.9,showTimeline:true,showMap:false,focus:null,lastPage:'custom-templates'};
    case'timeline':return{preset,mainSplit:.5,timelineScale:1.55,showTimeline:true,showMap:true,focus:'timeline',lastPage:'media'};
    default:return{preset:'edit',mainSplit:.52,timelineScale:1,showTimeline:true,showMap:false,focus:null,lastPage:'media'};
  }
}
