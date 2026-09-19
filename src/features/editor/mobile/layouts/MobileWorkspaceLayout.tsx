import React,{useEffect,useMemo,useRef,useState} from 'react';
import {
  Activity,AudioLines,CircleHelp,Columns2,Combine,Copy,Focus,Group,LayoutTemplate,Map as MapIcon,
  Maximize2,PanelRight,Palette,Pencil,Redo2,Rows3,ScanSearch,Scissors,Trash2,Type,Undo2,Ungroup,Zap,
} from 'lucide-react';
import type {EditorStore} from '../state/editorState';
import {PREVIEW_TRANSPORT_HEIGHT,PreviewPane} from '../components/PreviewPane';
import {TimelineStrip,timelinePreferredHeight,type TimelineViewport} from '../components/TimelineStrip';
import {MiniTimelineMap} from '../components/MiniTimelineMap';
import {ContextMenu,type ContextMenuItem} from '../components/ContextMenu';
import {EDITOR_NAV_ITEMS,EditorNavigationPage,type EditorNavPage,type EditorSettingsModel} from '../components/EditorNavigationPages';
import {pageForSelection} from '../components/EditorQuickActions';
import type {VtE1Clip} from '../../../../shared/vtE1TimelineContract';
import type {MobileWorkspaceMode} from '../MobileEditor';
import {TouchEditorGuide} from '../components/TouchEditorGuide';
import {WorkspaceDivider} from './WorkspaceDivider';
import {WORKSPACE_PRESETS,presetPatch,useMobileWorkspacePreferences,type WorkspaceFocus} from './mobileWorkspacePreferences';

export interface MobileWorkspaceLayoutProps{
  orientation:'portrait'|'landscape';
  store:EditorStore;
  renderPreview?:(info:{widthPx:number;heightPx:number})=>React.ReactNode;
  height?:number;
  compositionAspect?:number;
  editorSettings?:EditorSettingsModel;
  workspaceMode:MobileWorkspaceMode;
  onWorkspaceModeChange:(mode:MobileWorkspaceMode)=>void;
}

const CYAN='#36E0F6',INK='#248b99',PINK='#FA618A',YELLOW='#FFFF61';
const NAV_ROW_HEIGHT=42;
const MAP_HEIGHT=42;
const CLIP_COLORS=[
  {label:'Cyan',value:'#36E0F6'},
  {label:'Pink',value:'#FA618A'},
  {label:'Yellow',value:'#FFDA47'},
  {label:'Green',value:'#4EE4BE'},
  {label:'Blue',value:'#528FFA'},
  {label:'Purple',value:'#C86BFA'},
  {label:'Orange',value:'#FF9B54'},
];

const toolbarButton=(active=false,showLabel=true):React.CSSProperties=>({
  minWidth:0,width:'100%',height:'100%',border:`2px solid ${INK}`,borderRadius:5,
  background:active?CYAN:'#fff',color:'#000',fontSize:6,fontWeight:900,
  textTransform:'uppercase',display:'grid',
  gridTemplateRows:showLabel?'14px auto':'1fr',
  placeItems:'center',padding:showLabel?'2px 1px':0,lineHeight:1,boxSizing:'border-box',
});

const FitPreview:React.FC<{
  store:EditorStore;
  renderPreview?:MobileWorkspaceLayoutProps['renderPreview'];
  aspect:number;
}>=({store,renderPreview,aspect})=>{
  const hostRef=useRef<HTMLDivElement>(null);
  const[bounds,setBounds]=useState({width:0,height:0});
  useEffect(()=>{
    const node=hostRef.current;if(!node)return;
    const measure=()=>setBounds({width:node.clientWidth,height:node.clientHeight});
    measure();
    if(typeof ResizeObserver==='undefined')return;
    const observer=new ResizeObserver(measure);observer.observe(node);
    return()=>observer.disconnect();
  },[]);
  const fit=useMemo(()=>{
    const width=Math.max(0,bounds.width),height=Math.max(0,bounds.height);
    if(!width||!height)return{width:'100%',height:'100%'} as React.CSSProperties;
    const canvasHeight=Math.max(1,height-PREVIEW_TRANSPORT_HEIGHT);
    if(width/canvasHeight>aspect){
      const canvasWidth=Math.max(1,canvasHeight*aspect);
      return{width:canvasWidth,height:canvasHeight+PREVIEW_TRANSPORT_HEIGHT};
    }
    return{width,height:Math.max(1,width/aspect)+PREVIEW_TRANSPORT_HEIGHT};
  },[bounds,aspect]);
  return <div ref={hostRef} style={{
    width:'100%',height:'100%',minWidth:0,minHeight:0,overflow:'hidden',
    display:'grid',placeItems:'start',boxSizing:'border-box',
  }}>
    <div style={{...fit,minWidth:0,minHeight:0,flex:'0 0 auto'}}>
      <PreviewPane store={store} renderPreview={renderPreview} aspect={aspect}/>
    </div>
  </div>;
};

export const MobileWorkspaceLayout:React.FC<MobileWorkspaceLayoutProps>=({
  orientation,store,renderPreview,height,compositionAspect=16/9,editorSettings,
  workspaceMode,onWorkspaceModeChange,
})=>{
  const rootRef=useRef<HTMLDivElement>(null);
  const[menu,setMenu]=useState<{items:ContextMenuItem[];at:{x:number;y:number};title?:string}|null>(null);
  const[page,setPage]=useState<EditorNavPage>('media');
  const[timelineViewport,setTimelineViewport]=useState<TimelineViewport>({startSec:0,endSec:0});
  const[scrollToSec,setScrollToSec]=useState(0);
  const[showGuide,setShowGuide]=useState(false);

  const containerHeight=height??(typeof window!=='undefined'?window.innerHeight:(orientation==='portrait'?800:480));
  const isPortraitVideo=compositionAspect<1;
  const portraitPhonePortraitVideo=orientation==='portrait'&&isPortraitVideo;
  const[prefs,patchPrefs]=useMobileWorkspacePreferences(orientation,isPortraitVideo);
  const showTimeline=prefs.showTimeline;
  const showMap=prefs.showMap;
  const showActionLabels=prefs.showActionLabels;
  const focus=prefs.focus;
  const visibleTrackCount=store.state.project.tracks.filter(track=>!track.hidden).length;
  const timelineHeight=Math.min(timelinePreferredHeight(visibleTrackCount)*prefs.timelineScale,Math.max(96,containerHeight*.52));

  const selectionKey=`${store.state.selection.clipIds.join(',')}|${store.state.selection.trackId??''}|${store.state.selection.transitionId??''}`;
  useEffect(()=>{
    const contextual=pageForSelection(store);
    const clip=store.selectedClips[0] as (VtE1Clip&{clipType?:unknown})|undefined;
    const layer=store.selectedLayer;
    let next:EditorNavPage|undefined=contextual;
    if(clip?.clipType==='design-template')next='custom-templates';
    else if(layer?.type==='text')next='text';
    else if(layer?.type==='audio')next='audio';
    else if(layer?.type==='shape')next='graphics';
    else if(layer?.type==='remotion-asset')next='effects';
    if(next){
      setPage(next);
      patchPrefs({lastPage:next});
    }
  },[selectionKey]);

  const openPage=(next:EditorNavPage)=>{
    setPage(next);
    patchPrefs({lastPage:next});
  };
  useEffect(()=>{
    const valid=EDITOR_NAV_ITEMS.some(item=>item.id===prefs.lastPage);
    if(valid)setPage(prefs.lastPage as EditorNavPage);
  },[orientation,isPortraitVideo]);

  const selected=store.selectedClips[0];
  const selectedIds=store.state.selection.clipIds;
  const selectedClips=store.selectedClips;
  const selectedGroupId=selectedClips.map(clip=>String((clip as VtE1Clip&{groupId?:unknown}).groupId??'')).find(Boolean)??'';
  const selectedCompound=selectedClips.length===1&&String((selectedClips[0] as VtE1Clip&{clipType?:unknown}).clipType??'')==='compound';
  const canCombine=selectedClips.length>=2&&selectedClips.every(clip=>clip.trackId===selectedClips[0].trackId);

  const setClipColor=(clip:VtE1Clip,color:string)=>store.dispatch({
    type:'updateClip',id:clip.id,patch:{uiColor:color} as Partial<VtE1Clip>,
  });

  const clipMenuFor=(clip:VtE1Clip):ContextMenuItem[]=>[
    {label:'Inspect',icon:<ScanSearch size={14}/>,onSelect:()=>{setPage('select');onWorkspaceModeChange('edit')}},
    {label:'Split at playhead',icon:<Scissors size={14}/>,onSelect:()=>store.dispatch({type:'splitClipAtPlayhead',id:clip.id})},
    {label:'Duplicate',icon:<Copy size={14}/>,onSelect:()=>store.dispatch({type:'duplicateClip',id:clip.id})},
    {label:'Clip color',swatches:CLIP_COLORS.map(color=>({label:color.label,value:color.value,onSelect:()=>setClipColor(clip,color.value)}))},
    {label:'Delete',icon:<Trash2 size={14}/>,destructive:true,onSelect:()=>store.dispatch({type:'deleteClips',ids:[clip.id]})},
  ];
  const emptyMenu=useMemo<ContextMenuItem[]>(()=>[
    {label:'Add text here',icon:<Type size={14}/>,onSelect:()=>{setPage('text');onWorkspaceModeChange('edit')}},
    {label:'Open clips',icon:<Rows3 size={14}/>,onSelect:()=>{setPage('media');onWorkspaceModeChange('edit')}},
    {label:'Open templates',icon:<LayoutTemplate size={14}/>,onSelect:()=>{setPage('templates');onWorkspaceModeChange('edit')}},
  ],[onWorkspaceModeChange]);

  const navigationRow=<section style={{
    width:'100%',height:'100%',minWidth:0,minHeight:0,padding:3,
    background:'#fff',border:`3px solid ${INK}`,borderRadius:7,
    boxSizing:'border-box',overflow:'hidden',
    display:'grid',gridTemplateColumns:`repeat(${EDITOR_NAV_ITEMS.length},minmax(0,1fr))`,gap:2,
  }}>
    {EDITOR_NAV_ITEMS.map(item=><button key={item.id} style={toolbarButton(page===item.id)} onClick={()=>openPage(item.id)}>
      <span style={{height:13,display:'grid',placeItems:'center'}}>{item.icon}</span>
      <span style={{maxWidth:'100%',overflow:'hidden',textOverflow:'ellipsis'}}>{item.label}</span>
    </button>)}
  </section>;

  const actionItems=[
    {key:'undo',label:'Undo',icon:<Undo2 size={13}/>,enabled:store.canUndo,onClick:()=>store.dispatch({type:'undo' as const})},
    {key:'redo',label:'Redo',icon:<Redo2 size={13}/>,enabled:store.canRedo,onClick:()=>store.dispatch({type:'redo' as const})},
    {key:'split',label:'Split',icon:<Scissors size={13}/>,enabled:!!selected&&!selectedCompound,onClick:()=>selected&&store.dispatch({type:'splitClipAtPlayhead',id:selected.id})},
    {key:'duplicate',label:'Duplicate',icon:<Copy size={13}/>,enabled:!!selected,onClick:()=>selected&&store.dispatch({type:'duplicateClip',id:selected.id})},
    {key:'ripple',label:'Ripple',icon:<Zap size={13}/>,enabled:selectedIds.length>0,onClick:()=>selectedIds.length&&store.dispatch({type:'rippleDeleteClips',ids:selectedIds})},
    {key:'delete',label:'Delete',icon:<Trash2 size={13}/>,enabled:selectedIds.length>0,danger:true,onClick:()=>selectedIds.length&&store.dispatch({type:'deleteClips',ids:selectedIds})},
    {key:'group',label:selectedGroupId?'Ungroup':'Group',icon:selectedGroupId?<Ungroup size={13}/>:<Group size={13}/>,enabled:selectedGroupId?selectedIds.length>0:selectedIds.length>=2,onClick:()=>selectedGroupId?store.dispatch({type:'ungroupClips',ids:selectedIds}):store.dispatch({type:'groupClips',ids:selectedIds})},
    {key:'combine',label:selectedCompound?'Uncombine':'Combine',icon:<Combine size={13}/>,enabled:selectedCompound||canCombine,onClick:()=>selectedCompound&&selected?store.dispatch({type:'uncombineClip',id:selected.id}):store.dispatch({type:'combineClips',ids:selectedIds})},
    {key:'split-ui',label:'Split UI',icon:<Columns2 size={13}/>,enabled:true,active:workspaceMode==='split',onClick:()=>onWorkspaceModeChange('split')},
    {key:'edit-ui',label:'Edit UI',icon:<PanelRight size={13}/>,enabled:true,active:workspaceMode==='edit',onClick:()=>onWorkspaceModeChange('edit')},
    {key:'timeline',label:'Timeline',icon:<Rows3 size={13}/>,enabled:true,active:showTimeline,onClick:()=>patchPrefs({showTimeline:!showTimeline})},
    {key:'map',label:'Map',icon:<MapIcon size={13}/>,enabled:true,active:showMap,onClick:()=>patchPrefs({showMap:!showMap})},
    {key:'guide',label:'Guide',icon:<CircleHelp size={13}/>,enabled:true,onClick:()=>setShowGuide(true)},
  ];

  const actionRow=<section style={{
    width:'100%',height:'100%',minWidth:0,minHeight:0,padding:3,
    background:'#fff',border:`3px solid ${INK}`,borderRadius:7,
    boxSizing:'border-box',overflow:'hidden',
    display:'grid',
    gridTemplateColumns:showActionLabels?`repeat(${actionItems.length},minmax(0,1fr))`:`repeat(${actionItems.length},26px)`,
    justifyContent:showActionLabels?'stretch':'space-between',gap:showActionLabels?2:1,
  }}>
    {actionItems.map(item=><button
      key={item.key}
      title={item.label}
      aria-label={item.label}
      disabled={!item.enabled}
      style={{
        ...toolbarButton(Boolean(item.active),showActionLabels),
        width:showActionLabels?'100%':26,
        opacity:item.enabled?1:.32,
        background:item.danger&&item.enabled?PINK:item.key==='map'&&item.active?YELLOW:toolbarButton(Boolean(item.active),showActionLabels).background,
      }}
      onClick={item.onClick}
    >
      {item.icon}
      {showActionLabels?<span style={{maxWidth:'100%',overflow:'hidden',textOverflow:'ellipsis'}}>{item.label}</span>:null}
    </button>)}
  </section>

  const pageSurface=<section style={{
    width:'100%',height:'100%',minWidth:0,minHeight:0,display:'flex',flexDirection:'column',
    background:'#fff',border:`3px solid ${INK}`,borderRadius:7,padding:4,
    boxSizing:'border-box',overflow:'hidden',
  }}>
    <div style={{
      minWidth:0,minHeight:0,overflowY:'auto',overflowX:'hidden',
      WebkitOverflowScrolling:'touch',overscrollBehavior:'contain',flex:1,paddingRight:1,
    }}>
      <EditorNavigationPage page={page} store={store} settings={editorSettings} onNavigate={openPage}/>
    </div>
  </section>;

  const previewSurface=<section style={{
    width:'100%',height:'100%',minWidth:0,minHeight:0,overflow:'hidden',
    background:'#fff',border:`3px solid ${INK}`,borderRadius:7,padding:3,boxSizing:'border-box',
  }}>
    <FitPreview store={store} renderPreview={renderPreview} aspect={compositionAspect}/>
  </section>;

  const regularSplitTemplate=orientation==='portrait'
    ?{gridTemplateColumns:'minmax(0,1fr)',gridTemplateRows:isPortraitVideo?'minmax(0,4fr) minmax(0,6fr)':'minmax(0,3fr) minmax(0,7fr)'}
    :{gridTemplateRows:'minmax(0,1fr)',gridTemplateColumns:isPortraitVideo?'minmax(0,3fr) minmax(0,7fr)':'minmax(0,5fr) minmax(0,5fr)'};

  const regularMainSurface=workspaceMode==='edit'
    ?pageSurface
    :<div style={{width:'100%',height:'100%',minWidth:0,minHeight:0,display:'grid',gap:4,...regularSplitTemplate}}>
      {previewSurface}{pageSurface}
    </div>;

  const portraitMainSurface=workspaceMode==='edit'
    ?pageSurface
    :<div style={{
      width:'100%',height:'100%',minWidth:0,minHeight:0,display:'grid',gap:4,
      gridTemplateRows:'minmax(0,1fr)',gridTemplateColumns:'minmax(0,52fr) minmax(0,48fr)',overflow:'hidden',
    }}>
      {previewSurface}{pageSurface}
    </div>;

  const portraitLandscapeMainSurface=workspaceMode==='edit'
    ?pageSurface
    :<div style={{
      width:'100%',height:'100%',minWidth:0,minHeight:0,display:'grid',gap:4,
      gridTemplateColumns:'minmax(0,1fr)',
      gridTemplateRows:`minmax(0,1fr) calc((100vw - 14px) * ${1/compositionAspect} + ${PREVIEW_TRANSPORT_HEIGHT+8}px)`,
      overflow:'hidden',
    }}>
      {pageSurface}
      {previewSurface}
    </div>;

  const mainSurface=portraitPhonePortraitVideo
    ?portraitMainSurface
    :orientation==='portrait'&&!isPortraitVideo
      ?portraitLandscapeMainSurface
      :regularMainSurface;

  const timeline=showTimeline?<div style={{width:'100%',height:'100%',minWidth:0,minHeight:0,overflow:'hidden'}}>
    <TimelineStrip
      store={store}
      height="100%"
      scrollToSec={scrollToSec}
      onViewportChange={setTimelineViewport}
      onClipContextMenu={(clip,at)=>setMenu({items:clipMenuFor(clip),at,title:String(clip.id)})}
      onEmptyContextMenu={at=>setMenu({items:emptyMenu,at,title:'Timeline'})}
      actionLabelsVisible={showActionLabels}
      onToggleActionLabels={()=>patchPrefs({showActionLabels:!showActionLabels})
    />
  </div>:null;

  const map=showMap?<div style={{width:'100%',height:'100%',minWidth:0,minHeight:0,overflow:'hidden'}}>
    <MiniTimelineMap store={store} height="100%" viewport={timelineViewport} onViewportNavigate={setScrollToSec}/>
  </div>:null;

  const rows=[
    'minmax(0,1fr)',
    `${NAV_ROW_HEIGHT}px`,
    `${showActionLabels?40:34}px`,
    ...(showTimeline?[`${timelineHeight}px`]:[]),
    ...(showMap?[`${MAP_HEIGHT}px`]:[]),
  ].join(' ');

  return <div
    ref={rootRef}
    data-layout={`${orientation}-phone-${isPortraitVideo?'portrait':'landscape'}-video`}
    data-workspace-mode={workspaceMode}
    data-timeline-visible={showTimeline?'true':'false'}
    data-map-visible={showMap?'true':'false'}
    style={{
      position:'relative',width:'100%',height:containerHeight,maxWidth:'100%',maxHeight:'100%',
      minWidth:0,minHeight:0,background:'#f3f3f3',color:'#000',display:'grid',gap:4,
      padding:4,paddingBottom:6,boxSizing:'border-box',overflow:'hidden',touchAction:'manipulation',
      gridTemplateColumns:'minmax(0,1fr)',gridTemplateRows:rows,
    }}
  >
    <div style={{width:'100%',height:'100%',minWidth:0,minHeight:0,overflow:'hidden'}}>{mainSurface}</div>
    {navigationRow}
    {actionRow}
    {timeline}
    {map}
    {menu?<ContextMenu {...menu} onDismiss={()=>setMenu(null)}/>:null}
    {showGuide?<TouchEditorGuide onClose={()=>setShowGuide(false)}/>:null}
  </div>;
};
