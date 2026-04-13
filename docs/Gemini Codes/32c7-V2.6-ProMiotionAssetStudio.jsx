import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Download, Play, Square, Layers, 
  Zap, Ghost, Eye, Box, RefreshCcw, 
  Type, Clock, Wand2, MonitorPlay, EyeOff, 
  LayoutTemplate, Search, Settings2, Palette,
  Smartphone, Monitor, Menu, X, RotateCcw, 
  AlertTriangle, FileCode, CheckCircle2
} from 'lucide-react';

const apiKey = ""; // Provided at runtime

const COLORS = {
  lime: '#C9F830', cyan: '#24D3FF', pink: '#FF7497', 
  yellow: '#FFE357', orange: '#FCAF57', purple: '#B14AED',
};

const INITIAL_ASSET = {
  title: "Pro Asset",
  primary: "ENGINE RESTORED",
  secondary: "SEARCH ENABLED",
  color: COLORS.cyan,
  showText: true,
  animationIn: 'bounceIn',
  duration: 1.0,
  delay: 0.2,
  styleVariant: 'neo-brutalist',
  shapes: [
    { type: 'rect', x: 10, y: 10, w: 80, h: 80, fill: COLORS.cyan, rx: 20 },
    { type: 'circle', cx: 50, cy: 50, r: 25, fill: '#000' }
  ]
};

const ShapeRenderer = ({ shapes, styleVariant }) => {
  if (!shapes) return null;
  return shapes.map((s, i) => {
    let fill = s.fill || '#000';
    let stroke = 'black';
    let strokeWidth = styleVariant === 'wireframe' ? 2 : 3;
    if (styleVariant === 'minimal') strokeWidth = 0;
    if (styleVariant === 'pop') { strokeWidth = 4; stroke = '#fff'; }

    const common = { key: i, fill, stroke, strokeWidth };
    if (s.type === 'rect') return <rect {...common} x={s.x} y={s.y} width={s.w} height={s.h} rx={s.rx || 0} />;
    if (s.type === 'circle') return <circle {...common} cx={s.cx} cy={s.cy} r={s.r} />;
    if (s.type === 'path') return <path {...common} d={s.d} />;
    if (s.type === 'polygon') return <polygon {...common} points={s.points} />;
    return null;
  });
};

export default function App() {
  const [asset, setAsset] = useState(INITIAL_ASSET);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showGreenScreen, setShowGreenScreen] = useState(false);
  const [chromaColor, setChromaColor] = useState('#00FF00');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [viewportMode, setViewportMode] = useState('mobile'); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  
  // Advanced Settings
  const [fps, setFps] = useState('60');
  const [res, setRes] = useState('1080');
  const [refinePrompt, setRefinePrompt] = useState(true);
  const [createPrompt, setCreatePrompt] = useState("");
  const [modifyPrompt, setModifyPrompt] = useState("");

  const callGemini = async (promptText, mode, retryCount = 0) => {
    const systemPrompt = `You are a professional Motion Designer. 
    ${refinePrompt ? "First, analyze the user's request and improve it for visual impact. " : ""}
    ${mode === 'create' ? "Generate a NEW asset. " : "MODIFY current asset: " + JSON.stringify(asset)}
    
    SEARCH REQUIREMENT: If the user asks for a specific real-world object (brand, flag, vehicle, landmark), use Google Search to find accurate colors and proportions.
    
    Return ONLY a JSON object:
    {
      "title": string,
      "primary": string,
      "secondary": string,
      "color": string (hex),
      "showText": boolean,
      "animationIn": "bounceIn" | "slideUp" | "zoomIn" | "dropIn",
      "duration": number,
      "styleVariant": "neo-brutalist" | "pop" | "minimal" | "wireframe",
      "shapes": Array<{type, x, y, w, h, cx, cy, r, d, points, fill}>
    }`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          tools: [{ google_search: {} }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return JSON.parse(text);
    } catch (err) {
      if (retryCount < 3) {
        await new Promise(r => setTimeout(r, Math.pow(2, retryCount) * 1000));
        return callGemini(promptText, mode, retryCount + 1);
      }
      throw err;
    }
  };

  const handleAIAction = async (mode) => {
    const p = mode === 'create' ? createPrompt : modifyPrompt;
    if (!p) return;
    setIsGenerating(true);
    setError(null);
    try {
      const result = await callGemini(p, mode);
      setAsset(prev => mode === 'create' ? result : { ...prev, ...result });
      setIsPlaying(false);
      setTimeout(() => setIsPlaying(true), 50);
      if (mode === 'create') setCreatePrompt(""); else setModifyPrompt("");
      if (window.innerWidth < 768) setIsSidebarOpen(false);
    } catch (err) {
      setError("AI Engine Timeout. Trying simpler shapes...");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden">
      
      {/* MOBILE HEADER */}
      <header className="md:hidden h-14 bg-[#141414] border-b-2 border-black flex items-center justify-between px-4 z-50 shrink-0">
        <div className="flex items-center gap-2">
          <MonitorPlay size={20} className="text-[#C9F830]" />
          <span className="font-black text-sm uppercase tracking-tighter">MOTION ENGINE</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-black rounded-lg">
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* SIDEBAR */}
      <aside className={`
        fixed inset-0 z-40 bg-[#141414] transition-transform duration-300 md:relative md:translate-x-0 md:w-[420px] md:border-r-4 border-black
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col p-5 overflow-y-auto custom-scrollbar
      `}>
        <div className="hidden md:flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Zap size={24} className="text-[#C9F830]" />
            <h1 className="font-black text-xl uppercase italic">STUDIO PRO</h1>
          </div>
          <div className="flex gap-1">
             <div className="w-2 h-2 rounded-full bg-red-500" />
             <div className="w-2 h-2 rounded-full bg-yellow-500" />
          </div>
        </div>

        {/* Viewport Toggle */}
        <div className="flex bg-black p-1 rounded-xl mb-6 border-2 border-black">
          <button onClick={() => setViewportMode('mobile')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all flex items-center justify-center gap-2 ${viewportMode === 'mobile' ? 'bg-white text-black' : 'text-gray-500'}`}>
            <Smartphone size={14} /> Mobile
          </button>
          <button onClick={() => setViewportMode('desktop')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all flex items-center justify-center gap-2 ${viewportMode === 'desktop' ? 'bg-white text-black' : 'text-gray-500'}`}>
            <Monitor size={14} /> Desktop
          </button>
        </div>

        {/* Boxes */}
        <div className="space-y-4 mb-6">
          <div className="bg-[#1e1e1e] border-2 border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_black]">
            <h3 className="text-[10px] font-black uppercase text-[#C9F830] mb-2 flex items-center gap-2"><Sparkles size={14}/> Create Engine</h3>
            <textarea value={createPrompt} onChange={(e) => setCreatePrompt(e.target.value)} placeholder="e.g. Classic 80s arcade cabinet..." className="w-full bg-black/50 border-2 border-black rounded-lg p-3 text-sm focus:border-[#C9F830] outline-none h-16 resize-none" />
            <button onClick={() => handleAIAction('create')} className="w-full mt-2 h-10 bg-[#C9F830] text-black border-2 border-black rounded-lg font-black uppercase text-xs active:translate-y-0.5 transition-all">Generate Asset</button>
          </div>

          <div className="bg-[#1e1e1e] border-2 border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_black]">
            <h3 className="text-[10px] font-black uppercase text-[#24D3FF] mb-2 flex items-center gap-2"><RefreshCcw size={14}/> Modify Lab</h3>
            <textarea value={modifyPrompt} onChange={(e) => setModifyPrompt(e.target.value)} placeholder="e.g. Add glowing neon outlines..." className="w-full bg-black/50 border-2 border-black rounded-lg p-3 text-sm focus:border-[#24D3FF] outline-none h-16 resize-none" />
            <button onClick={() => handleAIAction('modify')} className="w-full mt-2 h-10 bg-[#24D3FF] text-black border-2 border-black rounded-lg font-black uppercase text-xs active:translate-y-0.5 transition-all">Iterate Design</button>
          </div>
        </div>

        {/* Render Settings */}
        <div className="bg-[#1e1e1e] border-2 border-black rounded-xl p-4 mb-6 space-y-4">
          <h3 className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-2"><Settings2 size={14}/> Render Configuration</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[8px] font-black uppercase text-gray-400">Target FPS</label>
              <div className="flex border-2 border-black rounded-lg overflow-hidden h-8">
                {['30', '60'].map(f => (
                  <button key={f} onClick={() => setFps(f)} className={`flex-1 text-[10px] font-black ${fps === f ? 'bg-white text-black' : 'bg-black text-white'}`}>{f}</button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-black uppercase text-gray-400">Resolution</label>
              <div className="flex border-2 border-black rounded-lg overflow-hidden h-8">
                {['1080', '4K'].map(r => (
                  <button key={r} onClick={() => setRes(r)} className={`flex-1 text-[10px] font-black ${res === r ? 'bg-white text-black' : 'bg-black text-white'}`}>{r}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-2 bg-black/30 rounded-lg">
             <span className="text-[9px] font-black uppercase">Refine Prompt</span>
             <button onClick={() => setRefinePrompt(!refinePrompt)} className={`w-10 h-5 rounded-full border-2 border-black relative transition-all ${refinePrompt ? 'bg-[#C9F830]' : 'bg-gray-600'}`}>
                <div className={`absolute top-0.5 w-3 h-3 bg-black rounded-full transition-all ${refinePrompt ? 'right-0.5' : 'left-0.5'}`} />
             </button>
          </div>
        </div>

        {/* Export Suite */}
        <div className="mt-auto pt-4">
          <h3 className="text-[10px] font-black uppercase text-gray-500 mb-2">Export Queue</h3>
          <div className="grid grid-cols-3 gap-2">
            {['HTML', 'GIF', 'SVG', 'MOV', 'MP4', 'JS'].map(fmt => (
              <button key={fmt} className="h-8 border-2 border-black bg-[#222] rounded-lg font-black text-[9px] uppercase hover:bg-white hover:text-black transition-all flex items-center justify-center gap-1">
                <FileCode size={10} /> {fmt}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* VIEWPORT */}
      <main className="flex-1 relative flex flex-col items-center justify-center bg-[#050505] p-4 md:p-8 overflow-hidden">
        <div className={`
          relative transition-all duration-500 overflow-hidden border-[6px] border-black rounded-[40px] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)]
          ${viewportMode === 'mobile' ? 'h-[85vh] aspect-[9/16]' : 'w-full max-w-5xl aspect-[16/9]'}
          ${showGreenScreen ? '' : 'bg-[#0a0a0a] bg-[linear-gradient(rgba(255,255,255,0.03)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(255,255,255,0.03)_1.5px,transparent_1.5px)] bg-[size:30px_30px]'}
        `} style={{ backgroundColor: showGreenScreen ? chromaColor : undefined }}>
          
          <div className="w-full h-full flex flex-col items-center justify-center p-6 scale-[0.85] md:scale-100">
            {isPlaying && (
              <div 
                className="relative flex flex-col items-center w-full"
                style={{
                  animation: `${asset.animationIn} ${asset.duration}s cubic-bezier(0.16, 1, 0.3, 1) both`,
                  animationDelay: `${asset.delay}s`
                }}
              >
                <div className="relative mb-12 filter drop-shadow-[20px_20px_0px_rgba(0,0,0,0.3)]">
                  <svg viewBox="0 0 100 100" className={`${res === '4K' ? 'w-[450px] h-[450px]' : 'w-[250px] h-[250px] md:w-[350px] md:h-[350px]'}`}>
                    <ShapeRenderer shapes={asset.shapes} styleVariant={asset.styleVariant} />
                  </svg>
                </div>

                {asset.showText && (
                  <div className="bg-white border-[6px] border-black rounded-[30px] shadow-[12px_12px_0px_0px_black] p-6 text-center min-w-[320px] max-w-[90%]">
                    <h2 className="text-black font-[1000] text-3xl md:text-5xl uppercase italic tracking-tighter leading-none">{asset.primary}</h2>
                    <div className="mt-3 inline-block px-4 py-1.5 bg-black text-white font-black text-sm uppercase tracking-widest rounded-xl">{asset.secondary}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Floating UI HUD */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/70 backdrop-blur-2xl p-3 rounded-3xl border-2 border-white/10 shadow-2xl">
            <button onClick={() => {setIsPlaying(false); setTimeout(() => setIsPlaying(true), 50);}} className="w-12 h-12 bg-white text-black border-2 border-black rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all"><RotateCcw size={20} /></button>
            <div className="h-8 w-[2px] bg-white/10 mx-1" />
            <button onClick={() => setShowGreenScreen(!showGreenScreen)} className={`px-5 h-12 border-2 border-black rounded-2xl text-[11px] font-black uppercase transition-all ${showGreenScreen ? 'bg-[#C9F830] text-black' : 'bg-gray-800 text-white'}`}>Chroma Key</button>
            <input type="color" value={chromaColor} onChange={(e) => setChromaColor(e.target.value)} className="w-12 h-12 border-2 border-black rounded-2xl bg-transparent cursor-pointer" title="Pick Chroma Color" />
          </div>
        </div>

        {isGenerating && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center gap-6">
             <div className="relative">
               <div className="w-20 h-20 border-[8px] border-[#C9F830] border-t-transparent rounded-full animate-spin" />
               <Search className="absolute inset-0 m-auto text-[#C9F830] animate-pulse" size={24} />
             </div>
             <div className="text-center">
               <p className="font-black uppercase tracking-[0.2em] text-xl text-[#C9F830]">Researching Reference</p>
               <p className="text-gray-500 font-bold text-xs mt-2 uppercase">Building Geometry via Google Search Grounding</p>
             </div>
          </div>
        )}
      </main>

      <style>{`
        @keyframes bounceIn { 
          0% { transform: scale(0.3) translateY(100px); opacity: 0; } 
          60% { transform: scale(1.05) translateY(-10px); } 
          100% { transform: scale(1) translateY(0); opacity: 1; } 
        }
        @keyframes slideUp { 
          0% { transform: translateY(200px); opacity: 0; } 
          100% { transform: translateY(0); opacity: 1; } 
        }
        @keyframes zoomIn { 
          0% { transform: scale(3); opacity: 0; filter: blur(20px); } 
          100% { transform: scale(1); opacity: 1; filter: blur(0); } 
        }
        @keyframes dropIn {
          0% { transform: translateY(-500px); opacity: 0; }
          60% { transform: translateY(30px); }
          100% { transform: translateY(0); opacity: 1; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
}