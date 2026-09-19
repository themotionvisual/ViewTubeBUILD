import React,{useEffect,useMemo,useRef,useState} from 'react';
import {
  Columns2,Copy,LayoutTemplate,Map as MapIcon,PanelRight,Palette,
  Redo2,Rows3,ScanSearch,Scissors,Trash2,Type,Undo2,
} from 'lucide-react';
import type {EditorStore} from '../state/editorState';
import {PREVIEW_TRANSPORT_HEIGHT,PreviewPane} from '../components/PreviewPane';
import {TimelineStrip,type TimelineViewport} from '../components/TimelineStrip';
import {MiniTimelineMap} from '../components/MiniTimelineMap';
import {ContextMenu,type ContextMenuItem} from '../components/ContextMenu';
import {EDITOR_NAV_ITEMS,EditorNavigationPage,type EditorNavPage,type EditorSettingsModel} from '../components/EditorNavigationPages';
import {pageForSelection} from '../components/EditorQuickActions';
import type {VtE1Clip} from '../../../../shared/vtE1TimelineContract';
import type {MobileWorkspaceMode} from '../MobileEditor';

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

const CYAN='#36E0F6',INK='#248b99';
const CLIP_COLORS=[
  {label:'Cyan',value:'#36E0F6'},
  {label:'Pink',value:'#FA618A'},
  {label:'Yellow',value:'#FFDA47'},
  {label:'Green',value:'#4EE4BE'},
  {label:'Blue',value:'#528FFA'},
  {label:'Purple',value:'#C86BFA'},
  {label:'Orange',value:'#FF9B54'},
];

const navButton=(active:boolean):React.CSSProperties=>({
  minWidth:52,minHeight:34,border:`2px solid ${INK}`,borderRadius:5,
  background:active?CYAN:'#fff',color:'#000',fontSize:7,fontWeight:900,
  textTransform:'uppercase',display:'grid',placeItems:'center',padding:'2px 5px',
  lineHeight:1,flex:'0 0 auto',
});

const FitPreview:React.FC<{
  store:EditorStore;
  renderPreview?:MobileWorkspaceLayoutProps['renderPreview'];
  aspect:number;
}>=({store,renderPreview,aspect})=>{
  const hostRef=useRef<HTMLDivElement>(null);
  const[bounds,setBounds]=useState({width:0,height:0});

  useEffect(()=>{
    const node=hostRef.current;
    if(!node)return;
    const measure=()=>setBounds({width:node.clientWidth,height:node.clientHeight});
    measure();
    if(typeof ResizeObserver==='undefined')return;
    const observer=new ResizeObserver(measure);
    observer.observe(node);
    return()=>observer.disconnect();
  },[]);

  const fit=useMemo(()=>{
    const width=Math.max(0,bounds.width);
    const height=Math.max(0,bounds.height);
    if(!width||!height)return{width:'100%',height:'100%'} as React.CSSProperties;
    const canvasHeight=Math.max(1,height-PREVIEW_TRANSPORT_HEIGHT);
    const availableAspect=width/canvasHeight;
    if(availableAspect>aspect){
      const canvasWidth=Math.max(1,canvasHeight*aspect);
      return{width:canvasWidth,height:canvasHeight+PREVIEW_TRANSPORT_HEIGHT};
    }
    const canvasWidth=width;
    return{width:canvasWidth,height:Math.max(1,canvasWidth/aspect)+PREVIEW_TRANSPORT_HEIGHT};
  },[bounds,aspect]);

  return <div
    ref={hostRef}
    style={{
      width:'100%',height:'100%',minWidth:0,minHeight:0,overflow:'hidden',
      display:'grid',placeItems:'start',WebkitOverflowScrolling:'touch',
      overscrollBehavior:'contain',boxSizing:'border-box',
    }}
  >
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
  const[showTimeline,setShowTimeline]=useState(true);
  const[showMap,setShowMap]=useState(false);
  const[timelineViewport,setTimelineViewport]=useState<TimelineViewport>({startSec:0,endSec:0});
  const[scrollToSec,setScrollToSec]=useState(0);

  const containerHeight=height??(typeof window!=='undefined'?window.innerHeight:(orientation==='portrait'?800:480));
  const isPortraitVideo=compositionAspect<1;
  const portraitPhonePortraitVideo=orientation==='portrait'&&isPortraitVideo;

  const selectionKey=`${store.state.selection.clipIds.join(',')}|${store.state.selection.trackId??''}|${store.state.selection.transitionId??''}`;
  useEffect(()=>{
    const contextual=pageForSelection(store);
    if(contextual)setPage(contextual);
  },[selectionKey]);

  const openPage=(next:EditorNavPage)=>setPage(next);

  const setClipColor=(clip:VtE1Clip,color:string)=>{
    store.dispatch({
      type:'updateClip',
      id:clip.id,
      patch:{uiColor:color} as Partial<VtE1Clip>,
    });
  };

  const clipMenuFor=(clip:VtE1Clip):ContextMenuItem[]=>[
    {label:'Inspect',icon:<ScanSearch size={14}/>,onSelect:()=>{setPage('select');onWorkspaceModeChange('edit')}},
    {label:'Split at playhead',icon:<Scissors size={14}/>,onSelect:()=>store.dispatch({type:'splitClipAtPlayhead',id:clip.id})},
    {label:'Duplicate',icon:<Copy size={14}/>,onSelect:()=>store.dispatch({type:'duplicateClip',id:clip.id})},
    ...CLIP_COLORS.map(color=>({
      label:`Clip color: ${color.label}`,
      swatch:color.value,
      onSelect:()=>setClipColor(clip,color.value),
    })),
    {label:'Delete',icon:<Trash2 size={14}/>,destructive:true,onSelect:()=>store.dispatch({type:'deleteClips',ids:[clip.id]})},
  ];

  const emptyMenu=useMemo<ContextMenuItem[]>(()=>[
    {label:'Add text here',icon:<Type size={14}/>,onSelect:()=>{setPage('text');onWorkspaceModeChange('edit')}},
    {label:'Open clips',icon:<Rows3 size={14}/>,onSelect:()=>{setPage('media');onWorkspaceModeChange('edit')}},
    {label:'Open templates',icon:<LayoutTemplate size={14}/>,onSelect:()=>{setPage('templates');onWorkspaceModeChange('edit')}},
  ],[onWorkspaceModeChange]);

  const navHeight=orientation==='portrait'
    ?'clamp(72px,11dvh,94px)'
    :'clamp(64px,18dvh,80px)';

  const topChrome=<section style={{
    width:'100%',height:'100%',minWidth:0,minHeight:0,
    background:'#fff',border:`3px solid ${INK}`,borderRadius:7,
    boxSizing:'border-box',overflow:'hidden',
  }}>
    <div style={{
      width:'100%',height:'100%',minWidth:0,minHeight:0,overflow:'auto',
      WebkitOverflowScrolling:'touch',overscrollBehavior:'contain',
      padding:4,boxSizing:'border-box',display:'grid',gap:3,alignContent:'start',
    }}>
      <div style={{display:'flex',gap:3,minWidth:'max-content',overflow:'visible'}}>
        {EDITOR_NAV_ITEMS.map(item=><button
          key={item.id}
          style={navButton(page===item.id)}
          onClick={()=>openPage(item.id)}
        >
          <span style={{height:14,display:'grid',placeItems:'center'}}>{item.icon}</span>
          <span>{item.label}</span>
        </button>)}
      </div>

      <div style={{display:'flex',gap:3,minWidth:'max-content',alignItems:'center'}}>
        <button
          style={{...navButton(workspaceMode==='split'),minWidth:58,minHeight:28}}
          onClick={()=>onWorkspaceModeChange('split')}
        ><Columns2 size={13}/><span>Split</span></button>
        <button
          style={{...navButton(workspaceMode==='edit'),minWidth:58,minHeight:28}}
          onClick={()=>onWorkspaceModeChange('edit')}
        ><PanelRight size={13}/><span>Edit</span></button>
        <span style={{width:1,height:22,background:INK,opacity:.35,flex:'0 0 auto'}}/>
        <button
          style={{...navButton(showTimeline),minWidth:38,minHeight:28}}
          onClick={()=>setShowTimeline(value=>!value)}
        ><Rows3 size={13}/><span>TL</span></button>
        <button
          style={{...navButton(showMap),minWidth:42,minHeight:28}}
          onClick={()=>setShowMap(value=>!value)}
        ><MapIcon size={13}/><span>Map</span></button>
        <span style={{width:1,height:22,background:INK,opacity:.35,flex:'0 0 auto'}}/>
        <button
          style={{...navButton(false),minWidth:42,minHeight:28,opacity:store.canUndo?1:.4}}
          disabled={!store.canUndo}
          onClick={()=>store.dispatch({type:'undo'})}
        ><Undo2 size={13}/><span>Undo</span></button>
        <button
          style={{...navButton(false),minWidth:42,minHeight:28,opacity:store.canRedo?1:.4}}
          disabled={!store.canRedo}
          onClick={()=>store.dispatch({type:'redo'})}
        ><Redo2 size={13}/><span>Redo</span></button>
      </div>
    </div>
  </section>;

  const pageSurface=<section style={{
    width:'100%',height:'100%',minWidth:0,minHeight:0,
    display:'flex',flexDirection:'column',background:'#fff',
    border:`3px solid ${INK}`,borderRadius:7,padding:4,
    boxSizing:'border-box',overflow:'hidden',
  }}>
    <div style={{
      minWidth:0,minHeight:0,overflowY:'auto',overflowX:'hidden',
      WebkitOverflowScrolling:'touch',overscrollBehavior:'contain',
      flex:1,paddingRight:1,
    }}>
      <EditorNavigationPage page={page} store={store} settings={editorSettings} onNavigate={openPage}/>
    </div>
  </section>;

  const previewSurface=<section style={{
    width:'100%',height:'100%',minWidth:0,minHeight:0,
    overflow:'hidden',background:'#fff',border:`3px solid ${INK}`,
    borderRadius:7,padding:3,boxSizing:'border-box',
  }}>
    <FitPreview store={store} renderPreview={renderPreview} aspect={compositionAspect}/>
  </section>;

  const rightEditorRail=<div style={{
    width:'100%',height:'100%',minWidth:0,minHeight:0,
    display:'grid',gap:4,gridTemplateColumns:'minmax(0,1fr)',
    gridTemplateRows:'minmax(74px,22%) minmax(0,1fr)',overflow:'hidden',
  }}>
    {topChrome}
    {pageSurface}
  </div>;

  const regularSplitTemplate=orientation==='portrait'
    ?{
      gridTemplateColumns:'minmax(0,1fr)',
      gridTemplateRows:isPortraitVideo?'minmax(0,4fr) minmax(0,6fr)':'minmax(0,3fr) minmax(0,7fr)',
    }
    :{
      gridTemplateRows:'minmax(0,1fr)',
      gridTemplateColumns:isPortraitVideo?'minmax(0,3fr) minmax(0,7fr)':'minmax(0,5fr) minmax(0,5fr)',
    };

  const regularMainSurface=workspaceMode==='edit'
    ?pageSurface
    :<div style={{
      width:'100%',height:'100%',minWidth:0,minHeight:0,
      display:'grid',gap:4,...regularSplitTemplate,
    }}>
      {previewSurface}
      {pageSurface}
    </div>;

  const portraitMainSurface=workspaceMode==='edit'
    ?rightEditorRail
    :<div style={{
      width:'100%',height:'100%',minWidth:0,minHeight:0,
      display:'grid',gap:4,gridTemplateRows:'minmax(0,1fr)',
      gridTemplateColumns:'minmax(0,52fr) minmax(0,48fr)',overflow:'hidden',
    }}>
      {previewSurface}
      {rightEditorRail}
    </div>;

  const mainSurface=portraitPhonePortraitVideo?portraitMainSurface:regularMainSurface;

  const timeline=showTimeline?<div style={{
    width:'100%',height:'100%',minWidth:0,minHeight:0,overflow:'hidden',
  }}>
    <TimelineStrip
      store={store}
      height="100%"
      scrollToSec={scrollToSec}
      onViewportChange={setTimelineViewport}
      onClipContextMenu={(clip,at)=>setMenu({items:clipMenuFor(clip),at,title:String(clip.id)})}
      onEmptyContextMenu={at=>setMenu({items:emptyMenu,at,title:'Timeline'})}
    />
  </div>:null;

  const map=showMap?<div style={{
    width:'100%',height:'100%',minWidth:0,minHeight:0,overflow:'hidden',
  }}>
    <MiniTimelineMap
      store={store}
      height="100%"
      viewport={timelineViewport}
      onViewportNavigate={setScrollToSec}
    />
  </div>:null;

  const contentWeight=workspaceMode==='edit'?7:6;
  const regularRows=[
    navHeight,
    `minmax(0,${contentWeight}fr)`,
    ...(showTimeline?['minmax(0,3fr)']:[]),
    ...(showMap?['minmax(0,1fr)']:[]),
  ].join(' ');
  const portraitRows=[
    'minmax(0,6fr)',
    ...(showTimeline?['minmax(0,3fr)']:[]),
    ...(showMap?['minmax(0,1fr)']:[]),
  ].join(' ');
  const rows=portraitPhonePortraitVideo?portraitRows:regularRows;

  return <div
    ref={rootRef}
    data-layout={`${orientation}-phone-${isPortraitVideo?'portrait':'landscape'}-video`}
    data-workspace-mode={workspaceMode}
    data-timeline-visible={showTimeline?'true':'false'}
    data-map-visible={showMap?'true':'false'}
    style={{
      position:'relative',width:'100%',height:containerHeight,
      maxWidth:'100%',maxHeight:'100%',minWidth:0,minHeight:0,
      background:'#f3f3f3',color:'#000',display:'grid',gap:4,
      padding:4,paddingBottom:6,boxSizing:'border-box',
      overflow:'hidden',touchAction:'manipulation',
      gridTemplateColumns:'minmax(0,1fr)',gridTemplateRows:rows,
    }}
  >
    {!portraitPhonePortraitVideo&&topChrome}
    <div style={{width:'100%',height:'100%',minWidth:0,minHeight:0,overflow:'hidden'}}>{mainSurface}</div>
    {timeline}
    {map}
    {menu?<ContextMenu {...menu} onDismiss={()=>setMenu(null)}/>:null}
  </div>;
};
