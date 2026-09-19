/** Mobile editor shell. Device orientation is automatic; project aspect stays independent. */
import React from 'react';
import {EditorStore,useEditorState} from './state/editorState';
import {useSuppressBrowserZoom} from './hooks/gestures';
import {useViewport} from './hooks/useViewport';
import {usePlaybackClock} from './hooks/usePlaybackClock';
import {MobileWorkspaceLayout} from './layouts/MobileWorkspaceLayout';
import type {EditorSettingsModel} from './components/EditorNavigationPages';
import type {VtE1Clip} from '../../../shared/vtE1TimelineContract';

export type CompositionAspect='portrait'|'landscape';
export type MobileWorkspaceMode='preview'|'edit'|'split';

export interface MobileEditorProps{
  seed?:{clips?:VtE1Clip[];durationSec?:number};
  renderPreview?:(info:{widthPx:number;heightPx:number})=>React.ReactNode;
  externalStore?:EditorStore;
  compositionAspect?:CompositionAspect;
  onCompositionAspectChange?:(aspect:CompositionAspect)=>void;
  editorSettings?:EditorSettingsModel;
  layout?:'auto'|'portrait'|'landscape';
  showViewSwitcher?:boolean;
  workspaceMode?:MobileWorkspaceMode;
  onWorkspaceModeChange?:(mode:MobileWorkspaceMode)=>void;
}

export const MobileEditor:React.FC<MobileEditorProps>=({
  seed,
  renderPreview,
  externalStore,
  compositionAspect:controlledAspect,
  editorSettings,
  layout='auto',
  workspaceMode:controlledWorkspaceMode,
  onWorkspaceModeChange,
})=>{
  const internal=useEditorState(seed);
  const store=externalStore??internal;
  const viewport=useViewport();
  const rootRef=React.useRef<HTMLDivElement>(null);
  useSuppressBrowserZoom(rootRef);
  usePlaybackClock(store);

  const [localAspect]=React.useState<CompositionAspect>('portrait');
  const [localWorkspaceMode,setLocalWorkspaceMode]=React.useState<MobileWorkspaceMode>('split');
  const compositionAspect=controlledAspect??localAspect;
  const workspaceMode=controlledWorkspaceMode??localWorkspaceMode;
  const setWorkspaceMode=React.useCallback((mode:MobileWorkspaceMode)=>{
    if(onWorkspaceModeChange)onWorkspaceModeChange(mode);
    else setLocalWorkspaceMode(mode);
  },[onWorkspaceModeChange]);

  const chosen=layout==='auto'?viewport.orientation:layout;
  const aspectValue=compositionAspect==='portrait'?9/16:16/9;
  const common={
    store,
    renderPreview,
    height:viewport.height,
    compositionAspect:aspectValue,
    editorSettings,
    workspaceMode,
    onWorkspaceModeChange:setWorkspaceMode,
  };

  return <div
    ref={rootRef}
    data-phone-orientation={chosen}
    data-composition-aspect={compositionAspect}
    data-workspace-mode={workspaceMode}
    style={{position:'relative',width:'100%',height:'100dvh',minWidth:0,minHeight:0,overflow:'hidden',background:'#f3f3f3',WebkitTapHighlightColor:'transparent'}}
  >
    <MobileWorkspaceLayout orientation={chosen} {...common}/>
  </div>;
};

export interface ResponsiveEditorShellProps extends MobileEditorProps{
  desktop:React.ReactElement;
  mode?:'auto'|'mobile'|'desktop';
}

export const ResponsiveEditorShell:React.FC<ResponsiveEditorShellProps>=({desktop,mode='auto',...mobileProps})=>{
  const viewport=useViewport();
  const useMobile=mode==='mobile'||(mode==='auto'&&viewport.isMobile);
  return useMobile?<MobileEditor {...mobileProps}/>:desktop;
};
