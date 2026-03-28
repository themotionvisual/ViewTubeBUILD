import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { removeBackground } from '@imgly/background-removal';
import { 
  Image as ImageIcon, 
  Wand2, 
  Mic, 
  Type, 
  Sliders, 
  Play, 
  Pause, 
  Zap, 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  UploadCloud,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';
import { ToolHeader } from '../components/ToolHeader';
import { ProjectStudio } from '../components/ProjectStudio';

import { useBrain } from '../context/GlobalDataContext';

interface Keyframe {
  time: number; // 0 to 1
  props: Partial<Omit<Layer, 'id' | 'name' | 'url' | 'isVisible'>>;
}

interface Layer {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video';
  isVisible: boolean;
  // Transformation
  width: number;
  height: number;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  zIndex: number;
  // Look & Feel
  hsb: { hue: number; sat: number; bri: number };
  blur: number;
  // AI State
  hasBgRemoved: boolean;
  bgRemovedUrl?: string;
  // Dynamic
  keyframes: Keyframe[];
}

export const ShortsStudio = () => {
  const { addProject } = useBrain();
  const layerRefs = useRef<Record<string, React.RefObject<HTMLDivElement | null>>>({});
  const [isMainToolOpen, setIsMainToolOpen] = useState(true);
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9'>('9:16');
  const [currentTime, setCurrentTime] = useState(0); // 0 to 1
  const [activeTool, setActiveTool] = useState<'media' | 'ai' | 'audio' | 'captions' | 'fx'>('media');
  
  const [layers, setLayers] = useState<Layer[]>([
    { 
      id: '1', name: 'Base Atmosphere', 
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop', 
      type: 'image', isVisible: true,
      x: 0, y: 0, scale: 1.1, rotation: 0, opacity: 1, zIndex: 1,
      hsb: { hue: 0, sat: 100, bri: 100 }, blur: 0, width: 400, height: 711,
      hasBgRemoved: false, keyframes: []
    },
    { 
      id: '2', name: 'Foreground Subject', 
      url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2576&auto=format&fit=crop', 
      type: 'image', isVisible: true,
      x: 0, y: 0, scale: 1, rotation: 0, opacity: 1, zIndex: 10,
      hsb: { hue: 0, sat: 100, bri: 100 }, blur: 0, width: 400, height: 711,
      hasBgRemoved: false, keyframes: []
    },
  ]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(layers[1].id);
  const [_, _setShowAssetSelector] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isRemovingBg, setIsRemovingBg] = useState<string | null>(null);

  const addLayer = (name: string, url: string) => {
    const topZ = Math.max(...layers.map(l => l.zIndex), 0);
    const newLayer: Layer = {
      id: Math.random().toString(36).substr(2, 9),
      name, url, type: 'image',
      isVisible: true, width: 400, height: 711,
      x: 0, y: 0, scale: 1, rotation: 0, opacity: 1, zIndex: topZ + 1,
      hsb: { hue: 0, sat: 100, bri: 100 }, blur: 0,
      hasBgRemoved: false, keyframes: []
    };
    setLayers([newLayer, ...layers]);
    setActiveLayerId(newLayer.id);
    _setShowAssetSelector(false);
  };

  const updateLayer = (id: string, updates: any) => {
    setLayers(layers.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const moveLayer = (id: string, direction: 'up' | 'down') => {
    const sorted = [...layers].sort((a,b) => b.zIndex - a.zIndex);
    const idx = sorted.findIndex(l => l.id === id);
    if (idx < 0) return;
    if (direction === 'up' && idx > 0) {
      const temp = sorted[idx].zIndex; sorted[idx].zIndex = sorted[idx-1].zIndex; sorted[idx-1].zIndex = temp;
    } else if (direction === 'down' && idx < sorted.length - 1) {
      const temp = sorted[idx].zIndex; sorted[idx].zIndex = sorted[idx+1].zIndex; sorted[idx+1].zIndex = temp;
    }
    setLayers([...sorted]);
  };

  const handleBgRemove = async (layerId: string) => {
    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;
    setIsRemovingBg(layerId);
    try {
      const blob = await fetch(layer.url).then(r => r.blob());
      const removedBgBlob = await removeBackground(blob);
      const removedBgUrl = URL.createObjectURL(removedBgBlob);
      updateLayer(layerId, { hasBgRemoved: true, bgRemovedUrl: removedBgUrl });
    } catch (e) {
      console.error("Background removal failed", e);
      alert("Background removal failed. Please check the console.");
    } finally {
      setIsRemovingBg(null);
    }
  };


  const getInterpolatedProps = (layer: Layer) => {
    if (layer.keyframes.length === 0) return layer;

    const sortedKeyframes = layer.keyframes.sort((a, b) => a.time - b.time);
    let startFrame = sortedKeyframes.find(k => k.time <= currentTime) || sortedKeyframes[0];
    let endFrame = sortedKeyframes.find(k => k.time >= currentTime) || sortedKeyframes[sortedKeyframes.length - 1];

    if (!startFrame) startFrame = endFrame;
    if (!endFrame) endFrame = startFrame;

    const timeDiff = endFrame.time - startFrame.time;
    const progress = timeDiff === 0 ? 1 : (currentTime - startFrame.time) / timeDiff;

    const interpolated: any = {};
    for (const key in startFrame.props) {
      const startVal = (startFrame.props as any)[key];
      const endVal = (endFrame.props as any)[key];
      if (typeof startVal === 'number' && typeof endVal === 'number') {
        interpolated[key] = startVal + (endVal - startVal) * progress;
      }
    }
    return { ...layer, ...interpolated };
  };

  const activeLayer = layers.find(l => l.id === activeLayerId);

  const handlePublish = () => {
    const projectName = `Shorts: ${layers.find(l => l.zIndex === 10)?.name || 'New Project'}`;
    addProject({
      id: Math.random().toString(36).substr(2, 9),
      name: projectName,
      videoTitle: projectName,
      status: 'ideation',
      color: '#FF3399',
      publishDate: new Date().toISOString(),
      tasks: [],
      script: '',
      description: 'Nexus-Generated Logic',
      notes: '',
      tags: '',
      thumbnailUrl: layers[0].url,
      plan: { topic: '', description: '', length: '', audience: '', vision: '', hook: '' },
      storyboard: []
    });
    alert(`🚀 PROJECT SAVED TO BRAIN: "${projectName}" is now in your Vault.`);
  };

  return (
    <div className="min-h-screen w-full bg-[#f3f4f6] flex flex-col p-4 overflow-y-auto custom-scrollbar animate-fade-in relative">
      
      {/* ❓ THE MASTER GUIDE MODAL */}
      {showHelp && (
        <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-xl flex items-center justify-center p-10">
          <div className="bg-[#ccff00] border-[6px] border-black rounded-[48px] shadow-[24px_24px_0px_0px_black] w-full max-w-2xl p-12 text-black animate-slide-up">
             <div className="flex justify-between items-center mb-8">
                <h2 className="text-4xl font-[1000] uppercase italic tracking-tighter">Nexus Master Guide</h2>
                <button onClick={() => setShowHelp(false)} className="bg-black text-[#ccff00] w-12 h-12 rounded-full border-[4px] border-black font-black text-2xl">X</button>
             </div>
             
             <div className="space-y-8">
                <div className="flex gap-6 items-start">
                   <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center font-black text-xl shrink-0">1</div>
                   <div>
                      <h3 className="font-black uppercase text-xl">Ingest Assets</h3>
                      <p className="font-bold opacity-70">Use <span className="underline">Assemble & Generate</span> to pick images or trigger AI generation for your base media layers.</p>
                   </div>
                </div>
                <div className="flex gap-6 items-start">
                   <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center font-black text-xl shrink-0">2</div>
                   <div>
                      <h3 className="font-black uppercase text-xl">Perfect the Look</h3>
                      <p className="font-bold opacity-70">Switch to <span className="underline">Studio & Edit</span> to apply HSB filters, keyframe motions, and background removal.</p>
                   </div>
                </div>
                <div className="flex gap-6 items-start">
                   <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center font-black text-xl shrink-0">3</div>
                   <div>
                      <h3 className="font-black uppercase text-xl">Ship the Vision</h3>
                      <p className="font-bold opacity-70">Review the Master Canvas and hit <span className="underline">PUBLISH</span> to sync this logic to your Workspace Brain.</p>
                   </div>
                </div>
             </div>
             
             <button 
               onClick={() => setShowHelp(false)}
               className="mt-12 w-full bg-black text-white py-5 rounded-3xl font-black uppercase text-xl hover:bg-white hover:text-black transition-all border-[4px] border-black shadow-[8px_8px_0px_0px_white]"
             >
                I am ready to Create
             </button>
          </div>
        </div>
      )}

      {/* ⚡ THE CREATOR NEXUS (UNIFIED WORKBENCH) */}
      <div className="w-full max-w-[1800px] mx-auto mb-40 bg-white border-[6px] border-black rounded-[48px] shadow-[24px_24px_0px_0px_black] flex flex-col overflow-hidden">
        
        <div onClick={() => setIsMainToolOpen(!isMainToolOpen)} className="cursor-pointer">
          <ToolHeader 
            title="THE CREATOR NEXUS v2.5" 
            icon="zap" 
            titleBgColor="bg-[#FF3399]" 
            iconBgColor="bg-[#ccff00]" 
          />
        </div>

        <div className={`grid transition-all duration-1000 ease-in-out ${isMainToolOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
          <main className="overflow-hidden flex bg-white min-h-[850px] border-t-[6px] border-black relative">
                
            {/* 🛠️ LEFT PANE: NARROW TOOLBAR (z-30 to be above canvas) */}
            <div className="w-24 bg-black flex flex-col items-center py-8 gap-6 z-30 shrink-0 shadow-[8px_0_20px_rgba(0,0,0,0.3)]">
              {[
                { id: 'media', icon: ImageIcon, label: 'Media' },
                { id: 'ai', icon: Wand2, label: 'Veo AI' },
                { id: 'audio', icon: Mic, label: 'Audio' },
                { id: 'captions', icon: Type, label: 'Text' },
                { id: 'fx', icon: Sliders, label: 'Effects' }
              ].map(tool => (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id as any)}
                  title={tool.label}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all group relative ${
                    activeTool === tool.id 
                      ? 'bg-[#CCFF00] text-black border-[3px] border-black shadow-[4px_4px_0px_0px_#FF3399] translate-x-1' 
                      : 'bg-white/10 text-white hover:bg-white/20 border-2 border-transparent hover:border-white/30'
                  }`}
                >
                  <tool.icon strokeWidth={activeTool === tool.id ? 3 : 2} size={24} />
                  <div className="absolute left-20 bg-black text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-lg border-2 border-white/20 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {tool.label} {tool.id === 'audio' || tool.id === 'captions' ? '(SOON)' : ''}
                  </div>
                </button>
              ))}
            </div>

            {/* 🎛️ LEFT PANE: TOOL CONFIG (RESOURCE STUDIO STYLE) */}
            <div className="w-96 bg-[#f8fafc] border-r-[6px] border-black flex flex-col z-20 shrink-0">
              <div className="h-20 bg-white border-b-[4px] border-black flex items-center px-8 shrink-0">
                <h2 className="font-[1000] text-2xl uppercase tracking-tighter text-black">
                  {activeTool === 'media' && 'Media Pool'}
                  {activeTool === 'ai' && 'AI Generation'}
                  {activeTool === 'audio' && 'Sound Engine'}
                  {activeTool === 'captions' && 'Text & Captions'}
                  {activeTool === 'fx' && 'Visual FX'}
                </h2>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                {activeTool === 'media' && (
                  <>
                    <button className="w-full h-16 bg-[#CCFF00] border-[4px] border-black rounded-2xl shadow-[6px_6px_0px_0px_black] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-3 font-[1000] uppercase text-lg text-black">
                      <UploadCloud size={24} strokeWidth={3} /> Upload Asset
                    </button>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-black/40 tracking-widest">Nexus Library</span>
                        <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full font-black">8</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { name: "Neon City", url: "https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=2544&auto=format&fit=crop" },
                          { name: "Cyber Armor", url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2670&auto=format&fit=crop" },
                          { name: "Scarlet Dye", url: "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=2670&auto=format&fit=crop" },
                          { name: "Abstract Flow", url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop" },
                          { name: "Vaporwave Sun", url: "https://images.unsplash.com/photo-1614850523296-e8c041df43a6?q=80&w=2670&auto=format&fit=crop" },
                          { name: "Digital Grit", url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop" },
                          { name: "Lancer Crest", url: "https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?q=80&w=2574&auto=format&fit=crop" },
                          { name: "Studio Portrait", url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2576&auto=format&fit=crop" },
                        ].map((asset, i) => (
                          <div 
                            key={i} 
                            onClick={() => addLayer(asset.name, asset.url)}
                            className="aspect-square bg-gray-100 border-[4px] border-black rounded-[20px] overflow-hidden group cursor-pointer shadow-[4px_4px_0px_0px_black] hover:shadow-[6px_6px_0px_0px_#FF3399] transition-all relative"
                          >
                            <img src={asset.url} alt={asset.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                              <Plus size={32} className="text-[#CCFF00]" strokeWidth={3} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {activeTool === 'ai' && (
                  <div className="space-y-6">
                    <div className="bg-[#00CCFF]/10 border-[4px] border-[#00CCFF] p-5 rounded-2xl text-black">
                      <Zap size={24} className="text-[#00CCFF] mb-2" />
                      <h4 className="font-black uppercase tracking-tight text-sm mb-1">Veo 3.1 Integration</h4>
                      <p className="text-xs font-bold opacity-60">Generate 3-second B-Roll directly into the timeline.</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-black/40 tracking-widest ml-1">Video Prompt</label>
                      <textarea 
                        className="w-full h-40 p-4 border-[4px] border-black rounded-2xl font-bold text-sm resize-none focus:bg-[#00CCFF]/5 outline-none transition-colors"
                        placeholder="Describe the cinematic b-roll..."
                      />
                    </div>
                    <button className="w-full py-4 bg-black text-[#00CCFF] border-[4px] border-black rounded-2xl font-[1000] uppercase text-xl shadow-[6px_6px_0px_0px_#00CCFF] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2">
                      <Wand2 size={20} /> Synthesize
                    </button>
                  </div>
                )}

                {activeTool === 'audio' && (
                  <div className="space-y-6 opacity-40 grayscale pointer-events-none">
                    <div className="bg-[#FF3399]/10 border-[4px] border-[#FF3399] p-5 rounded-2xl text-black">
                      <Mic size={24} className="text-[#FF3399] mb-2" />
                      <h4 className="font-black uppercase tracking-tight text-sm mb-1">ElevenLabs & Auphonic</h4>
                      <p className="text-xs font-bold opacity-60">Generate and polish voiceovers.</p>
                    </div>
                    <button className="w-full py-4 bg-black text-white border-[4px] border-black rounded-2xl font-[1000] uppercase text-xl">
                      COMING SOON
                    </button>
                  </div>
                )}

                {activeTool === 'fx' && activeLayer && (
                  <div className="space-y-8">
                    <div className="bg-[#FFDD00] border-[4px] border-black p-4 rounded-xl flex justify-between items-center shadow-[4px_4px_0px_0px_black]">
                      <span className="font-black uppercase text-sm">Background Removal</span>
                      <button 
                        onClick={() => handleBgRemove(activeLayer.id)}
                        disabled={isRemovingBg === activeLayer.id || activeLayer.hasBgRemoved}
                        className={`px-4 py-2 border-[3px] border-black rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2 ${activeLayer.hasBgRemoved ? 'bg-black text-[#FFDD00]' : 'bg-white'}`}
                      >
                        {isRemovingBg === activeLayer.id && <Loader2 size={12} className="animate-spin" />}
                        {isRemovingBg === activeLayer.id ? 'Processing...' : activeLayer.hasBgRemoved ? 'Removed' : 'Isolate'}
                      </button>
                    </div>

                    <div className="space-y-6 bg-white border-[4px] border-black p-6 rounded-2xl shadow-[4px_4px_0px_0px_black]">
                      <h4 className="font-black uppercase tracking-widest text-xs border-b-[3px] border-black pb-2">Color Matrix</h4>
                      {['hue', 'sat', 'bri'].map(prop => (
                        <div key={prop} className="flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black uppercase text-black/50">{prop}</label>
                            <span className="text-[10px] font-black">{(activeLayer.hsb as any)[prop]}</span>
                          </div>
                          <input 
                            type="range" min="0" max={prop === 'hue' ? 360 : 200}
                            value={(activeLayer.hsb as any)[prop] || 0}
                            onChange={(e) => updateLayer(activeLayer.id, { hsb: { ...activeLayer.hsb, [prop]: parseInt(e.target.value) } })}
                            className="w-full accent-black h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-6 bg-white border-[4px] border-black p-6 rounded-2xl shadow-[4px_4px_0px_0px_black]">
                      <h4 className="font-black uppercase tracking-widest text-xs border-b-[3px] border-black pb-2">Transform</h4>
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black uppercase text-black/50">Scale</label>
                          <span className="text-[10px] font-black">{activeLayer.scale.toFixed(2)}x</span>
                        </div>
                        <input 
                          type="range" min="0.1" max="3" step="0.01"
                          value={activeLayer.scale || 1}
                          onChange={(e) => updateLayer(activeLayer.id, { scale: parseFloat(e.target.value) })}
                          className="w-full accent-[#FF3399] h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black uppercase text-black/50">Rotation</label>
                          <span className="text-[10px] font-black">{activeLayer.rotation}°</span>
                        </div>
                        <input 
                          type="range" min="0" max="360"
                          value={activeLayer.rotation || 0}
                          onChange={(e) => updateLayer(activeLayer.id, { rotation: parseInt(e.target.value) })}
                          className="w-full accent-[#00CCFF] h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 📺 CENTER PANE: THE CANVAS */}
            <div className="flex-1 bg-gray-200 flex flex-col relative overflow-hidden z-10" style={{ backgroundImage: 'radial-gradient(#d1d5db 2px, transparent 0)', backgroundSize: '30px 30px' }}>
              
              {/* Master Command Bar (Top of Canvas) */}
              <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-50 pointer-events-none">
                <div className="flex bg-white border-[4px] border-black rounded-[20px] overflow-hidden shadow-[6px_6px_0px_0px_black] pointer-events-auto">
                  {['9:16', '16:9'].map(ratio => (
                    <button 
                      key={ratio}
                      onClick={() => setAspectRatio(ratio as any)}
                      className={`px-6 py-3 font-[1000] uppercase text-sm transition-colors ${aspectRatio === ratio ? 'bg-[#FF3399] text-white' : 'bg-white text-black hover:bg-gray-100'}`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
                
                <div className="flex gap-4 pointer-events-auto">
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="h-14 bg-white border-[4px] border-black rounded-[20px] px-6 shadow-[6px_6px_0px_0px_black] hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-3 font-[1000] uppercase text-lg"
                  >
                    {isPlaying ? <Pause size={24} className="text-[#FF3399]" /> : <Play size={24} className="text-[#00CCFF]" />}
                    {isPlaying ? 'Halt' : 'Preview'}
                  </button>
                  <button 
                    onClick={handlePublish}
                    className="h-14 bg-[#CCFF00] border-[4px] border-black rounded-[20px] px-8 shadow-[6px_6px_0px_0px_black] hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-3 font-[1000] uppercase text-lg"
                  >
                    <UploadCloud size={24} /> Publish
                  </button>
                </div>
              </div>

              <div className="flex-1 flex items-center justify-center p-12 mt-12 pb-24">
                <div className={`relative transition-all duration-700 ease-in-out bg-black border-[12px] border-black rounded-[40px] shadow-[32px_32px_0px_0px_rgba(0,0,0,0.5)] overflow-hidden ${aspectRatio === '9:16' ? 'aspect-[9/16] h-full max-h-[800px]' : 'aspect-[16:9] w-full max-w-[1000px]'}`}>
                  
                  {/* UNIVERSAL STACK - NOW INTERACTIVE */}
                  <div className="absolute inset-0">
                    {[...layers].sort((a, b) => a.zIndex - b.zIndex).filter(l => l.isVisible).map((layer) => {
                      const animatedProps = getInterpolatedProps(layer);
                      if (!layerRefs.current[layer.id]) {
                        layerRefs.current[layer.id] = React.createRef<HTMLDivElement>();
                      }
                      const nodeRef = layerRefs.current[layer.id];

                      return (
                        <Draggable
                          key={layer.id}
                          nodeRef={nodeRef as any}
                          position={{ x: animatedProps.x, y: animatedProps.y }}
                          onStop={(_e, data) => updateLayer(layer.id, { x: data.x, y: data.y })}
                          onStart={() => setActiveLayerId(layer.id)}
                        >
                          <div ref={nodeRef}>
                            <ResizableBox
                            width={animatedProps.width || 400}
                            height={animatedProps.height || 711}
                            onResizeStop={(_e, { size }) => {
                              updateLayer(layer.id, { width: size.width, height: size.height });
                            }}
                            className={`absolute transition-all ${activeLayerId === layer.id ? 'ring-[6px] ring-[#00CCFF] ring-inset z-[100]' : ''}`}
                            style={{
                              transform: `scale(${animatedProps.scale}) rotate(${animatedProps.rotation}deg)`,
                              opacity: animatedProps.opacity,
                              filter: `hue-rotate(${animatedProps.hsb.hue}deg) saturate(${animatedProps.hsb.sat}%) brightness(${animatedProps.hsb.bri}%) blur(${animatedProps.blur}px)`
                            }}
                          >
                            <img
                              src={layer.hasBgRemoved && layer.bgRemovedUrl ? layer.bgRemovedUrl : layer.url}
                              alt={layer.name}
                              className="w-full h-full object-contain"
                              draggable="false"
                            />
                          </ResizableBox>
                        </div>
                      </Draggable>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Timeline Scrubber (Bottom of Canvas) */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-white/90 backdrop-blur-md border-t-[6px] border-black px-8 flex flex-col justify-center gap-2">
                <div className="flex justify-between items-center px-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-black/50">Timeline ({(currentTime * 15).toFixed(1)}s)</span>
                  <div className="flex gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#FF3399]">15.0s Total</span>
                  </div>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.001"
                  value={currentTime} 
                  onChange={e => setCurrentTime(parseFloat(e.target.value))}
                  className="w-full accent-[#00CCFF] h-4 bg-gray-200 rounded-full border-[3px] border-black cursor-pointer shadow-[2px_2px_0px_0px_black]"
                />
              </div>
            </div>

            {/* 📑 RIGHT PANE: Z-INDEX STACK */}
            <div className="w-96 bg-[#f8fafc] border-l-[6px] border-black flex flex-col z-20 shrink-0">
              <div className="h-20 bg-[#FFDD00] border-b-[4px] border-black flex items-center px-8 shrink-0">
                <h2 className="font-[1000] text-2xl uppercase tracking-tighter text-black">Layer Stack</h2>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
                {[...layers].sort((a,b) => b.zIndex - a.zIndex).map((layer) => (
                  <div 
                    key={layer.id}
                    onClick={() => setActiveLayerId(layer.id)}
                    className={`p-3 border-[4px] border-black rounded-2xl flex items-center gap-4 transition-all cursor-pointer shadow-[4px_4px_0px_0px_black] ${activeLayerId === layer.id ? 'bg-[#00CCFF] text-black translate-x-1' : 'bg-white hover:bg-gray-50'}`}
                  >
                    <div className="w-12 h-12 rounded-lg border-[3px] border-black overflow-hidden shrink-0 bg-black">
                      <img src={layer.url} className="w-full h-full object-cover opacity-80" alt="thumb" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black uppercase tracking-tight text-sm truncate">{layer.name}</h4>
                      <span className="text-[9px] font-black uppercase opacity-50 tracking-widest">Z-Index: {layer.zIndex}</span>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); moveLayer(layer.id, 'up'); }} className="hover:text-white bg-black/5 rounded hover:bg-black p-0.5"><ArrowUp size={14} strokeWidth={4} /></button>
                      <button onClick={(e) => { e.stopPropagation(); moveLayer(layer.id, 'down'); }} className="hover:text-white bg-black/5 rounded hover:bg-black p-0.5"><ArrowDown size={14} strokeWidth={4} /></button>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); updateLayer(layer.id, { isVisible: !layer.isVisible }); }}
                      className={`p-2 rounded-lg border-2 border-black transition-colors ${layer.isVisible ? 'bg-white' : 'bg-black text-white'}`}
                    >
                      {layer.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="p-6 border-t-[4px] border-black bg-white space-y-4">
                <button className="w-full py-4 bg-[#FF3399] text-white border-[4px] border-black rounded-2xl font-[1000] uppercase text-lg shadow-[6px_6px_0px_0px_black] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2">
                  <Wand2 size={20} /> Auto-Parallax Fix
                </button>
              </div>
            </div>

          </main>
        </div>
      </div>

      {/* 🔴 Project Integration View */}
      <div className="w-full max-w-[1600px] mx-auto mb-40">
        <ProjectStudio />
      </div>
    </div>
  );
};

export default ShortsStudio;
