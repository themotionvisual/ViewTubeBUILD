import React,{useEffect,useMemo,useRef,useState} from 'react';
import type {EditorStore} from '../state/editorState';
import {PreviewPane} from '../components/PreviewPane';
import {TimelineStrip,type TimelineViewport} from '../components/TimelineStrip';
import {MiniTimelineMap} from '../components/MiniTimelineMap';
import {ContextMenu,type ContextMenuItem} from '../components/ContextMenu';
import {EDITOR_NAV_ITEMS,EditorNavigationPage,type EditorNavPage,type EditorSettingsModel} from '../components/EditorNavigationPages';
import {EditorQuickActions,pageForSelection} from '../components/EditorQuickActions';
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
  const [bounds,setBounds]=useState({width:0,height:0});

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
    if(!width||!height)return {width:'100%',height:'100%'} as React.CSSProperties;
    const availableAspect=width/height;
    if(availableAspect>aspect)return {height:'100%',width:Math.max(1,height*aspect)};
    return {width:'100%',height:Math.max(1,width/aspect)};
  },[bounds,aspect]);

  return <div
    ref={hostRef}
    style={{
      width:'100%',height:'100%',minWidth:0,minHeight:0,overflow:'auto',
      display:'grid',placeItems:'center',WebkitOverflowScrolling:'touch',
      overscrollBehavior:'contain',boxSizing:'border-box',
    }}
  >
    <div style={{...fit,aspectRatio:String(aspect),minWidth:0,minHeight:0,flex:'0 0 auto'}}>
      <PreviewPane store={store} renderPreview={renderPreview} aspect={aspect}/>
    </div>
  </div>;
};

export const MobileWorkspaceLayout:React.FC<MobileWorkspaceLayoutProps>=({
  orientation,store,renderPreview,height,compositionAspect=16/9,editorSettings,
  workspaceMode,onWorkspaceModeChange,
})=>{
  const rootRef=useRef<HTMLDivElement>(null);
  const [menu,setMenu]=useState<{items:ContextMenuItem[];at:{x:number;y:number};title?:string}|null>(null);
  const [page,setPage]=useState<EditorNavPage>('media');
  const [showTimeline,setShowTimeline]=useState(true);
  const [showMap,setShowMap]=useState(false);
  const [timelineViewport,setTimelineViewport]=useState<TimelineViewport>({startSec:0,endSec:0});
  const [scrollToSec,setScrollToSec]=useState(0);

  const selectionKey=`${store.state.selection.clipIds.join(',')}|${store.state.selection.trackId??''}|${store.state.selection.transitionId??''}`;
  useEffect(()=>{
    const contextual=pageForSelection(store);
    if(contextual)setPage(contextual);
  },[selectionKey]);

  const openPage=(next:EditorNavPage)=>{
    setPage(next);
    if(workspaceMode==='preview')onWorkspaceModeChange('edit');
  };

  const containerHeight=height??(typeof window!=='undefined'?window.innerHeight:(orientation==='portrait'?800:480));
  const isPortraitVideo=compositionAspect<1;

  const clipMenuFor=(clip:VtE1Clip):ContextMenuItem[]=>[
    {label:'Inspect',onSelect:()=>{setPage('select');onWorkspaceModeChange('edit')}},
    {label:'Split at playhead',onSelect:()=>store.dispatch({type:'splitClipAtPlayhead',id:clip.id})},
    {label:'Duplicate',onSelect:()=>store.dispatch({type:'duplicateClip',id:clip.id})},
    {label:'Delete',destructive:true,onSelect:()=>store.dispatch({type:'deleteClips',ids:[clip.id]})},
  ];
  const emptyMenu=useMemo<ContextMenuItem[]>(()=>[
    {label:'Add text here',onSelect:()=>{setPage('text');onWorkspaceModeChange('edit')}},
    {label:'Open clips',onSelect:()=>{setPage('media');onWorkspaceModeChange('edit')}},
    {label:'Open templates',onSelect:()=>{setPage('templates');onWorkspaceModeChange('edit')}},
  ],[onWorkspaceModeChange]);

  const navHeight=orientation==='portrait'
    ?'clamp(72px, 11dvh, 94px)'
    :'clamp(64px, 18dvh, 80px)';

  const topChrome=<section style={{
    width:'100%',height:'100%',minWidth:0,minHeight:0,
    background:'#fff',border:`3px solid ${INK}`,borderRadius:7,
    boxSizing:'border-box',overflow:'hidden',
  }}>
    <div style={{
      width:'100%',height:'100%',minWidth:0,minHeight:0,overflow:'auto',
      WebkitOverflowScrolling:'touch',overscrollBehavior:'contain',padding:4,boxSizing:'border-box',
      display:'grid',gap:3,alignContent:'start',
    }}>
      <div style={{display:'flex',gap:3,minWidth:'max-content',overflow:'visible'}}>
        <button style={{...navButton(false),background:CYAN,minWidth:44,fontSize:14}} onClick={()=>store.dispatch({type:'togglePlaying'})} aria-label={store.state.playing?'Pause':'Play'}>{store.state.playing?'Ⅱ':'▶'}</button>
        {EDITOR_NAV_ITEMS.map(item=><button key={item.id} style={navButton(page===item.id)} onClick={()=>openPage(item.id)}><span style={{fontSize:11}}>{item.icon}</span><span>{item.label}</span></button>)}
      </div>
      <div style={{display:'flex',gap:3,minWidth:'max-content',alignItems:'center'}}>
        {(['preview','edit','split'] as const).map(mode=><button key={mode} style={{...navButton(workspaceMode===mode),minWidth:58,minHeight:28}} onClick={()=>onWorkspaceModeChange(mode)}>{mode}</button>)}
        <span style={{width:1,height:22,background:INK,opacity:.35,flex:'0 0 auto'}}/>
        <button style={{...navButton(showTimeline),minWidth:34,minHeight:28}} onClick={()=>setShowTimeline(v=>!v)}>TL</button>
        <button style={{...navButton(showMap),minWidth:38,minHeight:28}} onClick={()=>setShowMap(v=>!v)}>MAP</button>
        <span style={{fontSize:8,fontWeight:900,whiteSpace:'nowrap',padding:'0 4px'}}>{store.state.playheadSec.toFixed(2)}s / {store.state.project.durationSec.toFixed(2)}s</span>
      </div>
    </div>
  </section>;

  const pageSurface=<section style={{
    width:'100%',height:'100%',minWidth:0,minHeight:0,display:'flex',flexDirection:'column',
    background:'#fff',border:`3px solid ${INK}`,borderRadius:7,padding:4,boxSizing:'border-box',overflow:'hidden',
  }}>
    <EditorQuickActions store={store} onOpenPage={openPage}/>
    <div style={{
      minWidth:0,minHeight:0,overflow:'auto',WebkitOverflowScrolling:'touch',
      overscrollBehavior:'contain',flex:1,paddingRight:1,
    }}>
      <EditorNavigationPage page={page} store={store} settings={editorSettings} onNavigate={openPage}/>
    </div>
  </section>;

  const previewSurface=<section style={{
    width:'100%',height:'100%',minWidth:0,minHeight:0,
    overflow:'hidden',background:'#fff',border:`3px solid ${INK}`,borderRadius:7,padding:3,boxSizing:'border-box',
  }}>
    <FitPreview store={store} renderPreview={renderPreview} aspect={compositionAspect}/>
  </section>;

  const splitTemplate=orientation==='portrait'
    ?{
      gridTemplateColumns:'minmax(0,1fr)',
      gridTemplateRows:isPortraitVideo?'minmax(0,4fr) minmax(0,6fr)':'minmax(0,3fr) minmax(0,7fr)',
    }
    :{
      gridTemplateRows:'minmax(0,1fr)',
      gridTemplateColumns:isPortraitVideo?'minmax(0,3fr) minmax(0,7fr)':'minmax(0,5fr) minmax(0,5fr)',
    };

  const mainSurface=workspaceMode==='preview'
    ?previewSurface
    :workspaceMode==='edit'
      ?pageSurface
      :<div style={{
        width:'100%',height:'100%',minWidth:0,minHeight:0,display:'grid',gap:4,...splitTemplate,
      }}>
        {previewSurface}
        {pageSurface}
      </div>;

  const timeline=showTimeline?<div style={{width:'100%',height:'100%',minWidth:0,minHeight:0,overflow:'hidden'}}>
    <TimelineStrip
      store={store}
      height="100%"
      scrollToSec={scrollToSec}
      onViewportChange={setTimelineViewport}
      onClipContextMenu={(clip,at)=>setMenu({items:clipMenuFor(clip),at,title:String(clip.id)})}
      onEmptyContextMenu={at=>setMenu({items:emptyMenu,at,title:'Timeline'})}
    />
  </div>:null;

  const map=showMap?<div style={{width:'100%',height:'100%',minWidth:0,minHeight:0,overflow:'hidden'}}>
    <MiniTimelineMap store={store} height="100%" viewport={timelineViewport} onViewportNavigate={setScrollToSec}/>
  </div>:null;

  const contentWeight=workspaceMode==='edit'?7:6;
  const rows=[
    navHeight,
    `minmax(0,${contentWeight}fr)`,
    ...(showTimeline?['minmax(0,3fr)']:[]),
    ...(showMap?['minmax(0,1fr)']:[]),
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
    {topChrome}
    <div style={{width:'100%',height:'100%',minWidth:0,minHeight:0,overflow:'hidden'}}>{mainSurface}</div>
    {timeline}
    {map}
    {menu&&<ContextMenu {...menu} onDismiss={()=>setMenu(null)}/>}
  </div>;
};
