/** Mobile editor shell. Device orientation is automatic; project aspect is independent. */
import React from 'react';
import {EditorStore,useEditorState} from './state/editorState';
import {useSuppressBrowserZoom} from './hooks/gestures';
import {useViewport} from './hooks/useViewport';
import {PortraitLayout} from './layouts/PortraitLayout';
import {LandscapeLayout} from './layouts/LandscapeLayout';
import type {EditorSettingsModel} from './components/EditorNavigationPages';
import type {VtE1Clip} from '../../../shared/vtE1TimelineContract';
export type CompositionAspect='portrait'|'landscape';
export interface MobileEditorProps{seed?:{clips?:VtE1Clip[];durationSec?:number};renderPreview?:(info:{widthPx:number;heightPx:number})=>React.ReactNode;externalStore?:EditorStore;compositionAspect?:CompositionAspect;onCompositionAspectChange?:(aspect:CompositionAspect)=>void;editorSettings?:EditorSettingsModel;showViewSwitcher?:boolean;}
export const MobileEditor:React.FC<MobileEditorProps>=({seed,renderPreview,externalStore,compositionAspect:controlledAspect,onCompositionAspectChange,editorSettings})=>{const internal=useEditorState(seed),store=externalStore??internal,viewport=useViewport(),rootRef=React.useRef<HTMLDivElement>(null);useSuppressBrowserZoom(rootRef);const [localAspect]=React.useState<CompositionAspect>('portrait');const compositionAspect=controlledAspect??localAspect;void onCompositionAspectChange;const chosen=viewport.orientation;const aspectValue=compositionAspect==='portrait'?9/16:16/9;const common={store,renderPreview,height:viewport.height,compositionAspect:aspectValue,editorSettings};return <div ref={rootRef} data-phone-orientation={chosen} data-composition-aspect={compositionAspect} style={{position:'relative',width:'100%',height:'100dvh',minWidth:0,minHeight:0,overflow:'hidden',background:'#f3f3f3',WebkitTapHighlightColor:'transparent'}}>{chosen==='portrait'?<PortraitLayout {...common}/>:<LandscapeLayout {...common}/>}</div>};
export interface ResponsiveEditorShellProps extends MobileEditorProps{desktop:React.ReactElement;mode?:'auto'|'mobile'|'desktop';}
export const ResponsiveEditorShell:React.FC<ResponsiveEditorShellProps>=({desktop,mode='auto',...mobileProps})=>{const viewport=useViewport();const useMobile=mode==='mobile'||(mode==='auto'&&viewport.isMobile);return useMobile?<MobileEditor {...mobileProps}/>:desktop;};
