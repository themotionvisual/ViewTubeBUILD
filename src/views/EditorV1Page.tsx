import React from "react";
import VTE1Editor from "../features/editor/VT_E1.jsx";
import { ResponsiveEditorShell, useEditorState } from "../features/editor/mobile";
import type { CompositionAspect } from "../features/editor/mobile/MobileEditor";
import type { EditorFrontend, EditorLayoutChoice } from "../features/editor/mobile/components/EditorViewSwitcher";
import { EDITOR_FRONTEND_MODES, editorHostModeFor, readEditorFrontendMode, writeEditorFrontendMode, type EditorFrontendMode } from "../features/editor/editorFrontendMode";
import { readEditorProjectBridgeSnapshot, writeEditorProjectBridgeSnapshot } from "../features/editor/editorProjectBridge";
import { mobileSeedFromBridgeSnapshot } from "../features/editor/editorDesktopBridgeRuntime";

interface EditorRouteBoundaryState { error: Error | null; }
class EditorRouteBoundary extends React.Component<React.PropsWithChildren, EditorRouteBoundaryState> {
  state: EditorRouteBoundaryState = { error: null };
  static getDerivedStateFromError(error: Error): EditorRouteBoundaryState { return { error }; }
  componentDidCatch(error: Error, info: React.ErrorInfo) { console.error("[VT_E1] Editor route failed to render", error, info); }
  render() {
    if (!this.state.error) return this.props.children;
    return <section className="flex h-full min-h-[520px] w-full items-center justify-center rounded-[10px] border-[4px] border-black bg-[#f0f0f4] p-6"><div className="max-w-3xl rounded-[14px] border-[4px] border-black bg-white p-6 shadow-[8px_8px_0_#000]"><div className="mb-2 text-[11px] font-black uppercase tracking-[0.2em] text-black/60">VT_E1 Route Boundary</div><h1 className="mb-3 text-3xl font-black uppercase leading-none">Editor failed to load</h1><pre className="max-h-56 overflow-auto rounded-[10px] border-[3px] border-black bg-[#fff7f7] p-3 text-xs font-bold text-[#7a1010]">{this.state.error.message || String(this.state.error)}</pre><button className="mt-4 rounded-[10px] border-[3px] border-black bg-[#40C6E9] px-4 py-2 text-xs font-black uppercase shadow-[4px_4px_0_#000]" onClick={() => this.setState({ error: null })} type="button">Retry Editor</button></div></section>;
  }
}

const MiniGroup = <T extends string,>({ label, value, options, onChange }: { label: string; value: T; options: Array<{ value: T; label: string }>; onChange: (value: T) => void }) => <div className="grid gap-1"><span className="text-[7px] font-black uppercase tracking-[0.12em] text-black/55">{label}</span><div className="flex gap-0.5 rounded-[5px] border-[2px] border-black bg-white p-0.5" role="group" aria-label={label}>{options.map(option => <button key={option.value} type="button" aria-pressed={value === option.value} onClick={() => onChange(option.value)} className="h-6 min-w-[34px] flex-1 rounded-[3px] border-[1.5px] border-black px-1.5 text-[8px] font-black uppercase leading-none" style={{background:value===option.value?'#36E0F6':'#fff'}}>{option.label}</button>)}</div></div>;

const EditorSettings: React.FC<{legacyMode:EditorFrontendMode;onLegacyModeChange:(v:EditorFrontendMode)=>void;frontend:EditorFrontend;onFrontendChange:(v:EditorFrontend)=>void;layout:EditorLayoutChoice;onLayoutChange:(v:EditorLayoutChoice)=>void;aspect:CompositionAspect;onAspectChange:(v:CompositionAspect)=>void;}> = ({legacyMode,onLegacyModeChange,frontend,onFrontendChange,layout,onLayoutChange,aspect,onAspectChange}) => {
  const activeLegacy=EDITOR_FRONTEND_MODES.find(item=>item.id===legacyMode)??EDITOR_FRONTEND_MODES[0];
  return <div className="grid gap-2 text-black"><MiniGroup label="Interface" value={frontend} onChange={onFrontendChange} options={[{value:'auto',label:'Auto'},{value:'mobile',label:'Mobile'},{value:'desktop',label:'Desktop'}]}/><MiniGroup label="Layout" value={layout} onChange={onLayoutChange} options={[{value:'auto',label:'Auto'},{value:'portrait',label:'Upright'},{value:'landscape',label:'Sideways'}]}/><MiniGroup label="Video" value={aspect} onChange={onAspectChange} options={[{value:'portrait',label:'9:16'},{value:'landscape',label:'16:9'}]}/><div className="border-t-2 border-black/15 pt-2"><div className="mb-1 text-[7px] font-black uppercase tracking-[0.12em] text-black/55">Editor Style</div><div className="grid grid-cols-2 gap-1">{EDITOR_FRONTEND_MODES.map(item=><button key={item.id} type="button" onClick={()=>onLegacyModeChange(item.id)} aria-pressed={item.id===legacyMode} className="min-h-8 rounded-[5px] border-2 border-black px-2 text-left text-[8px] font-black uppercase" style={{background:item.id===legacyMode?'#FFFF61':'#fff'}}>{item.shortLabel||item.label}</button>)}</div><div className="mt-1 text-[7px] font-bold text-black/45">{activeLegacy.label} · saved on this device</div></div></div>;
};

const EditorV1Page:React.FC=()=>{
  const forced=React.useMemo(()=>{if(typeof window==='undefined')return 'auto' as const;const v=new URLSearchParams(window.location.search).get('editor');return v==='mobile'||v==='desktop'?v:'auto' as const},[]);
  const [frontendMode,setFrontendMode]=React.useState<EditorFrontendMode>(()=>readEditorFrontendMode());
  const [interfaceChoice,setInterfaceChoice]=React.useState<EditorFrontend>('mobile');
  const [layoutChoice,setLayoutChoice]=React.useState<EditorLayoutChoice>('auto');
  const [compositionAspect,setCompositionAspect]=React.useState<CompositionAspect>('portrait');
  const restoredMobileProject=React.useMemo(()=>mobileSeedFromBridgeSnapshot(readEditorProjectBridgeSnapshot()),[]);
  const mobileStore=useEditorState(restoredMobileProject);
  const switchFrontend=React.useCallback((next:EditorFrontendMode)=>{writeEditorFrontendMode(next);setFrontendMode(next)},[]);
  const legacyShellMode=editorHostModeFor(frontendMode,forced);
  const shellMode=forced==='desktop'?'desktop':forced==='mobile'?'mobile':interfaceChoice==='auto'?legacyShellMode:interfaceChoice;
  React.useEffect(()=>{if(shellMode!=='mobile')return;writeEditorProjectBridgeSnapshot('mobile',mobileStore.state.project)},[shellMode,mobileStore.state.project]);
  const settings=<EditorSettings legacyMode={frontendMode} onLegacyModeChange={switchFrontend} frontend={interfaceChoice} onFrontendChange={setInterfaceChoice} layout={layoutChoice} onLayoutChange={setLayoutChoice} aspect={compositionAspect} onAspectChange={setCompositionAspect}/>;
  return <section data-editor-frontend={frontendMode} data-editor-interface={interfaceChoice} data-editor-layout={layoutChoice} data-editor-aspect={compositionAspect} className="relative h-full min-h-0 w-full overflow-hidden bg-[#f3f3f3] flex flex-col rounded-[10px] border-[2px] border-black landscape:max-[932px]:border-0 landscape:max-[932px]:rounded-none max-[560px]:border-0 max-[560px]:rounded-none"><EditorRouteBoundary><ResponsiveEditorShell mode={shellMode} desktop={<VTE1Editor/>} externalStore={mobileStore} layout={layoutChoice} compositionAspect={compositionAspect} onCompositionAspectChange={setCompositionAspect} editorSettings={settings}/></EditorRouteBoundary></section>;
};
export default EditorV1Page;
