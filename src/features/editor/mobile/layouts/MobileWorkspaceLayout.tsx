import React,{useEffect,useMemo,useRef,useState} from 'react';
import {
  Activity,CircleHelp,Command,Combine,Copy,EyeOff,Focus,Group,LayoutTemplate,LockKeyhole,Map as MapIcon,
  Maximize2,PanelRight,Redo2,Rows3,ScanSearch,Scissors,Trash2,Type,Undo2,Ungroup,VolumeX,Zap,
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
import {MobileCommandPalette,type MobileEditorCommand} from '../components/MobileCommandPalette';
import {EditorCoachOverlay,type EditorCoachStep} from '../components/EditorCoachOverlay';
import {WorkspaceDivider} from './WorkspaceDivider';
import {useMobileWorkspacePreferences,type WorkspaceFocus} from './mobileWorkspacePreferences';

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
  userSelect:'none',WebkitUserSelect:'none',WebkitTouchCallout:'none',WebkitTapHighlightColor:'transparent',
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
    const FRAME=12;
    const width=Math.max(0,bounds.width),height=Math.max(0,bounds.height);
    if(!width||!height)return{width:'100%',height:'100%'} as React.CSSProperties;
    const contentWidth=Math.max(1,width-FRAME);
    const canvasHeight=Math.max(1,height-FRAME-PREVIEW_TRANSPORT_HEIGHT);
    if(contentWidth/canvasHeight>aspect){
      const canvasWidth=Math.max(1,canvasHeight*aspect);
      return{width:canvasWidth+FRAME,height:canvasHeight+PREVIEW_TRANSPORT_HEIGHT+FRAME};
    }
    const nextCanvasHeight=Math.max(1,contentWidth/aspect);
    return{width:contentWidth+FRAME,height:nextCanvasHeight+PREVIEW_TRANSPORT_HEIGHT+FRAME};
  },[bounds,aspect]);
  return <div ref={hostRef} style={{
    width:'100%',height:'100%',minWidth:0,minHeight:0,overflow:'hidden',
    display:'grid',placeItems:'center',boxSizing:'border-box',
    userSelect:'none',WebkitUserSelect:'none',WebkitTouchCallout:'none',WebkitTapHighlightColor:'transparent',
  }}>
    <div style={{
      ...fit,minWidth:0,minHeight:0,boxSizing:'border-box',
      border:`3px solid ${INK}`,borderRadius:7,padding:3,background:'#fff',
      boxShadow:'3px 3px 0 rgba(54,224,246,.22)',overflow:'hidden',
    }}>
      <PreviewPane store={store} renderPreview={renderPreview} aspect={aspect}/>
    </div>
  </div>;
};

export const MobileWorkspaceLayout:React.FC<MobileWorkspaceLayoutProps>=({
  orientation,store,renderPreview,height,compositionAspect=16/9,editorSettings,
  workspaceMode,onWorkspaceModeChange,
})=>{
  const rootRef=useRef<HTMLDivElement>(null);
  const[menu,setMenu]=useState<{items:ContextMenuItem[];at:{x:number;y:number};title?:string;layout?:'list'|'tray'}|null>(null);
  const[page,setPage]=useState<EditorNavPage>('media');
  const[timelineViewport,setTimelineViewport]=useState<TimelineViewport>({startSec:0,endSec:0});
  const[scrollToSec,setScrollToSec]=useState(0);
  const[showGuide,setShowGuide]=useState(false);
  const[showCoach,setShowCoach]=useState(false);
  const[showCommands,setShowCommands]=useState(false);
  const previewPress=useRef<{pointerId:number;x:number;y:number;timer:number|null}|null>(null);

  const containerHeight=height??(typeof window!=='undefined'?window.innerHeight:(orientation==='portrait'?800:480));
  const isPortraitVideo=compositionAspect<1;
  const[prefs,patchPrefs]=useMobileWorkspacePreferences(orientation,isPortraitVideo);
  const showTimeline=prefs.showTimeline;
  const showMap=prefs.showMap;
  const showActionLabels=prefs.showActionLabels;
  const focus=prefs.focus;
  const moduleDraggingEnabled=prefs.layoutDraggingEnabled;
  const effectiveMainSplit=moduleDraggingEnabled
    ?prefs.mainSplit
    :orientation==='portrait'&&isPortraitVideo
      ?.72
      :orientation==='landscape'&&isPortraitVideo
        ?.46
        :orientation==='portrait'
          ?.42
          :.62;
  const resolvedEditorSettings=useMemo<EditorSettingsModel|undefined>(()=>editorSettings?{
    ...editorSettings,
    layoutDraggingEnabled:moduleDraggingEnabled,
    onLayoutDraggingEnabled:(enabled:boolean)=>patchPrefs({layoutDraggingEnabled:enabled}),
  }:undefined,[editorSettings,moduleDraggingEnabled,patchPrefs]);
  const effectiveTimelineScale=moduleDraggingEnabled?prefs.timelineScale:1;
  const actionHeight=showActionLabels?40:34;
  const timelineCoreHeight=timelinePreferredHeight(Math.max(1,store.state.project.tracks.length))*effectiveTimelineScale;
  const timelineHeight=Math.min(timelineCoreHeight+actionHeight+(showMap?MAP_HEIGHT:0)+4,Math.max(132,containerHeight*.58));

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
  const touchPoints=useRef(new Map<number,{x:number;y:number}>());
  const touchPeak=useRef(0);
  const touchStartedAt=useRef(0);
  const touchMoved=useRef(false);
  const timelineResize=useRef<{y:number;scale:number}|null>(null);

  const setFocus=(next:WorkspaceFocus)=>patchPrefs({focus:focus===next?null:next});

  const rootPointerDown=(event:React.PointerEvent<HTMLDivElement>)=>{
    if(event.pointerType!=='touch')return;
    if(touchPoints.current.size===0){
      touchStartedAt.current=event.timeStamp;
      touchPeak.current=0;
      touchMoved.current=false;
    }
    touchPoints.current.set(event.pointerId,{x:event.clientX,y:event.clientY});
    touchPeak.current=Math.max(touchPeak.current,touchPoints.current.size);
  };
  const rootPointerMove=(event:React.PointerEvent<HTMLDivElement>)=>{
    const start=touchPoints.current.get(event.pointerId);
    if(!start)return;
    if(Math.hypot(event.clientX-start.x,event.clientY-start.y)>10)touchMoved.current=true;
  };
  const rootPointerEnd=(event:React.PointerEvent<HTMLDivElement>)=>{
    if(event.pointerType!=='touch')return;
    touchPoints.current.delete(event.pointerId);
    if(touchPoints.current.size)return;
    const elapsed=event.timeStamp-touchStartedAt.current;
    if(!touchMoved.current&&elapsed<360){
      if(touchPeak.current===2&&store.canUndo)store.dispatch({type:'undo'});
      if(touchPeak.current>=3&&store.canRedo)store.dispatch({type:'redo'});
    }
  };

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

  const trackMenuFor=(track:EditorStore['state']['project']['tracks'][number]):ContextMenuItem[]=>[
    {label:track.muted?'Unmute':'Mute',icon:<VolumeX size={14}/>,onSelect:()=>store.dispatch({type:'muteTrack',id:track.id})},
    {label:track.locked?'Unlock':'Lock',icon:<LockKeyhole size={14}/>,onSelect:()=>store.dispatch({type:'lockTrack',id:track.id})},
    {label:track.hidden?'Show':'Hide',icon:<EyeOff size={14}/>,onSelect:()=>store.dispatch({type:'hideTrack',id:track.id})},
    {label:'Inspect',icon:<ScanSearch size={14}/>,onSelect:()=>{store.dispatch({type:'selectTrack',id:track.id});openPage('select')}},
    {label:'Delete empty',icon:<Trash2 size={14}/>,destructive:true,disabled:store.clipsOnTrack(track.id).length>0||store.state.project.tracks.length<=1,onSelect:()=>store.dispatch({type:'removeTrack',id:track.id})},
  ];

  const keyframeMenuFor=(clip:VtE1Clip,keyframeId:string):ContextMenuItem[]=>{
    const frame=(clip.keyframes??[]).find(keyframe=>String(keyframe.id??'')===keyframeId);
    const modes=['linear','easeIn','easeOut','easeInOut','springy','bell'];
    const current=String((frame as {interp?:unknown}|undefined)?.interp??'linear');
    const next=modes[(modes.indexOf(current)+1)%modes.length];
    return[
      {label:'Go to keyframe',icon:<Focus size={14}/>,onSelect:()=>{
        store.dispatch({type:'setPlaying',playing:false});
        store.dispatch({type:'setPlayhead',sec:clip.start+Number(frame?.offsetSec??0)});
      }},
      {label:'Duplicate',icon:<Copy size={14}/>,onSelect:()=>store.dispatch({type:'duplicateClipKeyframes',clipId:clip.id,keyframeIds:[keyframeId]})},
      {label:`Ease: ${next}`,icon:<Activity size={14}/>,onSelect:()=>store.dispatch({type:'setClipKeyframeInterpolation',clipId:clip.id,keyframeIds:[keyframeId],interp:next})},
      {label:'Delete',icon:<Trash2 size={14}/>,destructive:true,onSelect:()=>store.dispatch({type:'deleteClipKeyframes',clipId:clip.id,keyframeIds:[keyframeId]})},
    ];
  };

  const previewMenu=():ContextMenuItem[]=>[
    {label:'Focus preview',icon:<Maximize2 size={14}/>,onSelect:()=>patchPrefs({focus:'preview'})},
    {label:'Inspect clip',icon:<ScanSearch size={14}/>,disabled:!selected,onSelect:()=>openPage('select')},
    {label:'Clip settings',icon:<Rows3 size={14}/>,disabled:!selected,onSelect:()=>openPage('media')},
    {label:'Effects',icon:<Activity size={14}/>,disabled:!selected,onSelect:()=>openPage('effects')},
    {label:'Reset transform',icon:<Focus size={14}/>,disabled:!selected,onSelect:()=>selected&&store.dispatch({type:'resetClipTransform',id:selected.id})},
  ];

  const navigationRow=<section data-guide-id="navigation" style={{
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
    {key:'map',label:'Map',icon:<MapIcon size={13}/>,enabled:true,active:showMap,onClick:()=>patchPrefs({showMap:!showMap})},
    {key:'command',label:'Commands',icon:<Command size={13}/>,enabled:true,onClick:()=>setShowCommands(true)},
    {key:'guide',label:'Guide',icon:<CircleHelp size={13}/>,enabled:true,onClick:()=>setShowCoach(true)},
  ];

  const actionRow=<section data-guide-id="actions" style={{
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

  const moduleFocusButton=(kind:WorkspaceFocus)=>kind?<button
    title={focus===kind?'Restore workspace':`Focus ${kind}`}
    aria-label={focus===kind?'Restore workspace':`Focus ${kind}`}
    onClick={event=>{event.stopPropagation();setFocus(kind)}}
    style={{
      position:'absolute',top:3,right:3,zIndex:20,width:24,height:24,
      border:`2px solid ${INK}`,borderRadius:5,background:focus===kind?YELLOW:'#fff',
      display:'grid',placeItems:'center',padding:0,
    }}
  ><Maximize2 size={12}/></button>:null;

  const pageSurface=<section
    data-guide-id="inspector"
    onDoubleClick={()=>setFocus('inspector')}
    style={{
      position:'relative',width:'100%',height:'100%',minWidth:0,minHeight:0,display:'flex',flexDirection:'column',
      background:'#fff',border:`3px solid ${INK}`,borderRadius:7,padding:4,
      boxSizing:'border-box',overflow:'hidden',
    }}
  >
    {moduleFocusButton('inspector')}
    <div style={{
      minWidth:0,minHeight:0,overflowY:'auto',overflowX:'hidden',
      WebkitOverflowScrolling:'touch',overscrollBehavior:'contain',flex:1,paddingRight:1,
    }}>
      <EditorNavigationPage page={page} store={store} settings={resolvedEditorSettings} onNavigate={openPage}/>
    </div>
  </section>;

  const previewSurface=<section
    data-guide-id="preview"
    onContextMenu={event=>{
      event.preventDefault();
      setMenu({items:previewMenu(),at:{x:event.clientX,y:event.clientY},title:'Preview',layout:'tray'});
    }}
    onPointerDownCapture={event=>{
      if(event.pointerType!=='touch')return;
      const current={pointerId:event.pointerId,x:event.clientX,y:event.clientY,timer:null as number|null};
      current.timer=window.setTimeout(()=>{
        setMenu({items:previewMenu(),at:{x:current.x,y:current.y},title:'Preview',layout:'tray'});
        if(typeof navigator!=='undefined'&&'vibrate' in navigator)(navigator as Navigator&{vibrate:(value:number)=>boolean}).vibrate(12);
      },520);
      previewPress.current=current;
    }}
    onPointerMoveCapture={event=>{
      const current=previewPress.current;if(!current||current.pointerId!==event.pointerId)return;
      if(Math.hypot(event.clientX-current.x,event.clientY-current.y)>9){
        if(current.timer!=null)window.clearTimeout(current.timer);previewPress.current=null;
      }
    }}
    onPointerUpCapture={()=>{
      const current=previewPress.current;if(current?.timer!=null)window.clearTimeout(current.timer);previewPress.current=null;
    }}
    onPointerCancelCapture={()=>{
      const current=previewPress.current;if(current?.timer!=null)window.clearTimeout(current.timer);previewPress.current=null;
    }}
    onDoubleClick={()=>setFocus('preview')}
    style={{
      position:'relative',width:'100%',height:'100%',minWidth:0,minHeight:0,overflow:'hidden',
      background:'transparent',boxSizing:'border-box',
      userSelect:'none',WebkitUserSelect:'none',WebkitTouchCallout:'none',WebkitTapHighlightColor:'transparent',
    }}
  >
    {moduleFocusButton('preview')}
    <FitPreview store={store} renderPreview={renderPreview} aspect={compositionAspect}/>
  </section>;

  const splitHorizontal=<div style={{
    position:'relative',width:'100%',height:'100%',minWidth:0,minHeight:0,
    display:'grid',gap:4,
    gridTemplateColumns:`minmax(0,${effectiveMainSplit}fr) minmax(0,${1-effectiveMainSplit}fr)`,
    overflow:'hidden',
  }}>
    {previewSurface}{pageSurface}
    {moduleDraggingEnabled?<WorkspaceDivider axis="x" value={prefs.mainSplit} onChange={mainSplit=>patchPrefs({mainSplit})}/>:null}
  </div>;

  const splitVertical=<div style={{
    position:'relative',width:'100%',height:'100%',minWidth:0,minHeight:0,
    display:'grid',gap:4,
    gridTemplateRows:`minmax(0,${effectiveMainSplit}fr) minmax(0,${1-effectiveMainSplit}fr)`,
    overflow:'hidden',
  }}>
    {pageSurface}{previewSurface}
    {moduleDraggingEnabled?<WorkspaceDivider axis="y" value={prefs.mainSplit} onChange={mainSplit=>patchPrefs({mainSplit})}/>:null}
  </div>;

  const normalMainSurface=workspaceMode==='edit'
    ?pageSurface
    :orientation==='portrait'&&!isPortraitVideo
      ?splitVertical
      :splitHorizontal;

  const mainSurface=focus==='preview'
    ?previewSurface
    :focus==='inspector'
      ?pageSurface
      :normalMainSurface;

  const timeline=(showTimeline||focus==='timeline')?<div
    data-guide-id="timeline"
    style={{
      position:'relative',width:'100%',height:'100%',minWidth:0,minHeight:0,overflow:'hidden',
      display:'grid',gridTemplateRows:`${actionHeight}px minmax(0,1fr) ${showMap?MAP_HEIGHT:0}px`,gap:showMap?3:0,
    }}
  >
    <div style={{minWidth:0,minHeight:0}}>{actionRow}</div>
    <div style={{position:'relative',minWidth:0,minHeight:0,overflow:'hidden'}}>
      {moduleDraggingEnabled?<div
        role="separator"
        aria-label="Resize timeline"
        onPointerDown={event=>{
          event.stopPropagation();
          event.currentTarget.setPointerCapture?.(event.pointerId);
          timelineResize.current={y:event.clientY,scale:prefs.timelineScale};
        }}
        onPointerMove={event=>{
          const active=timelineResize.current;
          if(!active)return;
          patchPrefs({timelineScale:active.scale+(active.y-event.clientY)/120});
        }}
        onPointerUp={()=>{timelineResize.current=null}}
        onPointerCancel={()=>{timelineResize.current=null}}
        style={{position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',zIndex:25,width:34,height:12,display:'grid',placeItems:'start center',touchAction:'none'}}
      ><span style={{width:24,height:5,border:`1.5px solid ${INK}`,borderRadius:4,background:CYAN}}/></div>:null}
      <TimelineStrip
        store={store}
        height="100%"
        scrollToSec={scrollToSec}
        onViewportChange={setTimelineViewport}
        onClipContextMenu={(clip,at)=>setMenu({items:clipMenuFor(clip),at,title:String(clip.id),layout:'tray'})}
        onTrackContextMenu={(track,at)=>setMenu({items:trackMenuFor(track),at,title:track.name,layout:'tray'})}
        onKeyframeContextMenu={(clip,keyframeId,at)=>setMenu({items:keyframeMenuFor(clip,keyframeId),at,title:'Keyframe',layout:'tray'})}
        onEmptyContextMenu={at=>setMenu({items:emptyMenu,at,title:'Timeline',layout:'tray'})}
        actionLabelsVisible={showActionLabels}
        onToggleActionLabels={()=>patchPrefs({showActionLabels:!showActionLabels})}
      />
    </div>
    {showMap?<div data-guide-id="map" style={{width:'100%',height:MAP_HEIGHT,minWidth:0,minHeight:0,overflow:'hidden'}}>
      <MiniTimelineMap store={store} height="100%" viewport={timelineViewport} onViewportNavigate={setScrollToSec}/>
    </div>:null}
  </div>:null;

  const rows=focus
    ?'minmax(0,1fr)'
    :[
      'minmax(0,1fr)',
      `${NAV_ROW_HEIGHT}px`,
      ...(showTimeline?[`${timelineHeight}px`]:[]),
    ].join(' ');

  const commands:MobileEditorCommand[]=[
    {id:'undo',label:'Undo',group:'Edit',icon:<Undo2 size={12}/>,disabled:!store.canUndo,run:()=>store.dispatch({type:'undo'})},
    {id:'redo',label:'Redo',group:'Edit',icon:<Redo2 size={12}/>,disabled:!store.canRedo,run:()=>store.dispatch({type:'redo'})},
    {id:'split',label:'Split at playhead',group:'Edit',icon:<Scissors size={12}/>,disabled:!selected||selectedCompound,run:()=>selected&&store.dispatch({type:'splitClipAtPlayhead',id:selected.id})},
    {id:'duplicate',label:'Duplicate clip',group:'Edit',icon:<Copy size={12}/>,disabled:!selected,run:()=>selected&&store.dispatch({type:'duplicateClip',id:selected.id})},
    {id:'delete',label:'Delete selection',group:'Edit',icon:<Trash2 size={12}/>,disabled:!selectedIds.length,run:()=>store.dispatch({type:'deleteClips',ids:selectedIds})},
    {id:'group',label:selectedGroupId?'Ungroup clips':'Group clips',group:'Edit',icon:selectedGroupId?<Ungroup size={12}/>:<Group size={12}/>,disabled:selectedGroupId?!selectedIds.length:selectedIds.length<2,run:()=>selectedGroupId?store.dispatch({type:'ungroupClips',ids:selectedIds}):store.dispatch({type:'groupClips',ids:selectedIds})},
    {id:'combine',label:selectedCompound?'Uncombine clip':'Combine clips',group:'Edit',icon:<Combine size={12}/>,disabled:!selectedCompound&&!canCombine,run:()=>selectedCompound&&selected?store.dispatch({type:'uncombineClip',id:selected.id}):store.dispatch({type:'combineClips',ids:selectedIds})},
    ...EDITOR_NAV_ITEMS.map(item=>({id:'page-'+item.id,label:'Open '+item.label,group:'Pages',icon:item.icon,active:page===item.id,keywords:['page','panel'],run:()=>openPage(item.id)})),
    {id:'timeline',label:showTimeline?'Hide Timeline':'Show Timeline',group:'Workspace',icon:<Rows3 size={12}/>,active:showTimeline,run:()=>patchPrefs({showTimeline:!showTimeline})},
    {id:'map',label:showMap?'Hide Map':'Show Map',group:'Workspace',icon:<MapIcon size={12}/>,active:showMap,run:()=>patchPrefs({showMap:!showMap})},
    {id:'focus-preview',label:'Focus Preview',group:'Workspace',icon:<Maximize2 size={12}/>,active:focus==='preview',run:()=>patchPrefs({focus:'preview'})},
    {id:'focus-inspector',label:'Focus Inspector',group:'Workspace',icon:<PanelRight size={12}/>,active:focus==='inspector',run:()=>patchPrefs({focus:'inspector'})},
    {id:'focus-timeline',label:'Focus Timeline',group:'Workspace',icon:<Rows3 size={12}/>,active:focus==='timeline',run:()=>patchPrefs({focus:'timeline',showTimeline:true})},
    {id:'restore',label:'Restore Full Workspace',group:'Workspace',icon:<Focus size={12}/>,disabled:!focus,run:()=>patchPrefs({focus:null})},
    {id:'coach',label:'Start Interactive Guide',group:'Help',icon:<CircleHelp size={12}/>,run:()=>setShowCoach(true)},
    {id:'full-guide',label:'Open Full Touch Guide',group:'Help',icon:<CircleHelp size={12}/>,run:()=>setShowGuide(true)},
  ];

  const occupancyStrip=<div style={{
    position:'absolute',right:7,bottom:7,zIndex:70,display:'flex',gap:3,
  }}>
    {!showTimeline&&focus==null?<button title="Restore timeline" aria-label="Restore timeline" onClick={()=>patchPrefs({showTimeline:true})} style={{...toolbarButton(false,false),width:26,height:26}}><Rows3 size={12}/></button>:null}
    {focus?<button title="Restore workspace" aria-label="Restore workspace" onClick={()=>patchPrefs({focus:null})} style={{...toolbarButton(true,false),width:26,height:26}}><Focus size={12}/></button>:null}
  </div>;

  const prepareCoachStep=(step:EditorCoachStep)=>{
    if(step.target==='timeline')patchPrefs({showTimeline:true,focus:null});
    if(step.target==='map')patchPrefs({showMap:true,focus:null});
    if(step.target==='inspector')patchPrefs({focus:null});
    if(step.target==='preview')patchPrefs({focus:null});
  };

  return <div
    ref={rootRef}
    data-guide-id="workspace"
    onPointerDownCapture={rootPointerDown}
    onPointerMoveCapture={rootPointerMove}
    onPointerUpCapture={rootPointerEnd}
    onPointerCancelCapture={rootPointerEnd}
    data-layout={`${orientation}-phone-${isPortraitVideo?'portrait':'landscape'}-video`}
    data-workspace-mode={workspaceMode}
    data-timeline-visible={showTimeline?'true':'false'}
    data-map-visible={showMap?'true':'false'}
    style={{
      position:'relative',width:'100%',height:containerHeight,maxWidth:'100%',maxHeight:'100%',
      minWidth:0,minHeight:0,background:'#f3f3f3',color:'#000',display:'grid',gap:4,
      padding:4,paddingBottom:6,boxSizing:'border-box',overflow:'hidden',touchAction:'manipulation',
      WebkitTapHighlightColor:'transparent',
      gridTemplateColumns:'minmax(0,1fr)',gridTemplateRows:rows,
    }}
  >
    {focus!=='timeline'?<div style={{width:'100%',height:'100%',minWidth:0,minHeight:0,overflow:'hidden'}}>{mainSurface}</div>:null}
    {!focus?navigationRow:null}
    {focus==='timeline'||(!focus&&showTimeline)?timeline:null}
    {occupancyStrip}
    {menu?<ContextMenu {...menu} onDismiss={()=>setMenu(null)}/>:null}
    {showCommands?<MobileCommandPalette commands={commands} onClose={()=>setShowCommands(false)}/>:null}
    {showCoach?<EditorCoachOverlay
      onClose={()=>setShowCoach(false)}
      onStepChange={prepareCoachStep}
      onOpenFullGuide={()=>{setShowCoach(false);setShowGuide(true)}}
    />:null}
    {showGuide?<TouchEditorGuide onClose={()=>setShowGuide(false)} onStartCoach={()=>{setShowGuide(false);setShowCoach(true)}}/>:null}
  </div>;
};
