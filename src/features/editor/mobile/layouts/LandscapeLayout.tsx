import React from 'react';
import type {EditorStore} from '../state/editorState';
import type {EditorSettingsModel} from '../components/EditorNavigationPages';
import type {MobileWorkspaceMode} from '../MobileEditor';
import {MobileWorkspaceLayout} from './MobileWorkspaceLayout';

export interface LandscapeLayoutProps{
  store:EditorStore;
  renderPreview?:(info:{widthPx:number;heightPx:number})=>React.ReactNode;
  height?:number;
  compositionAspect?:number;
  editorSettings?:EditorSettingsModel;
  workspaceMode?:MobileWorkspaceMode;
  onWorkspaceModeChange?:(mode:MobileWorkspaceMode)=>void;
}

export const LandscapeLayout:React.FC<LandscapeLayoutProps>=({workspaceMode:controlled,onWorkspaceModeChange,...props})=>{
  const [local,setLocal]=React.useState<MobileWorkspaceMode>('split');
  const mode=controlled??local;
  const setMode=onWorkspaceModeChange??setLocal;
  return <MobileWorkspaceLayout orientation="landscape" workspaceMode={mode} onWorkspaceModeChange={setMode} {...props}/>;
};
