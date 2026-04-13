import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Download, Play, Square, Layers, 
  Zap, Ghost, Eye, Box, RefreshCcw, 
  Type, Clock, Wand2, MonitorPlay, EyeOff, 
  LayoutTemplate, Search, Settings2, Palette,
  ChevronRight, CheckCircle2, AlertCircle, FileCode
} from 'lucide-react';

const apiKey = ""; // Provided at runtime

const COLORS = {
  lime: '#C9F830', cyan: '#24D3FF', pink: '#FF7497', 
  yellow: '#FFE357', orange: '#FCAF57', purple: '#B14AED',
};

const INITIAL_ASSET = {
  title: "New Asset",
  primary: "DYNAMIC OVERLAY",
  secondary: "READY TO EXPORT",
  color: COLORS.cyan,
  showText: true,
  animationIn: 'bounceIn',
  duration: 1.0,
  delay: 0.2,
  styleVariant: 'neo-brutalist',
  shapes: [
    { type: 'rect', x: 20, y: 20, w: 60, h: 60, fill: COLORS.cyan, rx: 10 },
    { type: 'circle', cx: 50, cy: 50, r: 15, fill: '#000' }
  ]
};

const ShapeRenderer = ({ shapes, styleVariant }) => {
  if (!shapes) return null;
  return shapes.map((s, i) => {
    let fill = s.fill || '#000';
    let stroke = 'black';
    let strokeWidth = styleVariant === 'wireframe' ? 2 : 3;
    let strokeDasharray = styleVariant === 'wireframe' ? "5 5" : "none";

    if (styleVariant === 'wireframe') fill = 'transparent';
    if (styleVariant === 'minimal') strokeWidth = 0;
    if (styleVariant === 'pop') { strokeWidth = 4; stroke = '#fff'; }

    const common = { key: i, fill, stroke, strokeWidth, strokeDasharray };
    if (s.type === 'rect') return <rect {...common} x={s.x} y={s.y} width={s.w} height={s.h} rx={s.rx || 0} />;
    if (s.type === 'circle') return <circle {...common} cx={s.cx} cy={s.cy} r={s.r} />;
    if (s.type === 'path') return <path {...common} d={s.d} />;
    if (s.type === 'polygon') return <polygon {...common} points={s.points} />;
    return null;
  });
};

export default function MotionAssetStudio() {
  const [asset, setAsset] = useState(INITIAL_ASSET);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showGreenScreen, setShowGreenScreen] = useState(false);
  const [chromaColor, setChromaColor] = useState('#00FF00');
  const [isGenerating, setIsGenerating] = useState(false);
  const [refinePrompt, setRefinePrompt] = useState(true);
  const [fps, setFps] = useState('60');
  const [res, setRes] = useState('1080');
  
  // Prompts
  const [createPrompt, setCreatePrompt] = useState("");
  const [modifyPrompt, setModifyPrompt] = useState("");

  const handleAIAction = async (mode) => {
    const promptText = mode === 'create' ? createPrompt : modifyPrompt;
    if (!promptText) return;
    setIsGenerating(true);

    const systemPrompt = `You are a professional Motion Graphics Designer. 
    ${refinePrompt ? "First, analyze the user's request and improve it for visual impact." : ""}
    ${mode === 'create' ? "Generate a NEW asset from scratch." : "MODIFY the existing asset provided in the context."}
    
    Current Asset: ${JSON.stringify(asset)}
    
    Search Goal: If the user asks for a specific real-world object (flag, car, landmark, brand), use Google Search grounding to ensure accurate shape and color representation.
    
    Return ONLY a JSON object:
    {
      "title": string,
      "primary": string,
      "secondary": string,
      "color": string (hex),
      "showText": boolean,
      "animationIn": "bounceIn" | "slideUp" | "slideRight" | "dropIn" | "zoomIn" | "spinIn",
      "duration": number,
      "styleVariant": "neo-brutalist" | "pop" | "minimal" | "wireframe",
      "shapes": Array<{type, x, y, w, h, cx, cy, r, d, points, fill}>
    }`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Task: ${promptText}` }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          tools: [{ google_search: {} }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      const data = await response.json();
      const result = JSON.parse(data.candidates[0].content.parts[0].text);
      setAsset(prev => mode === 'create' ? result : { ...prev, ...result });
      setIsPlaying(false);
      setTimeout(() => setIsPlaying(true), 50);
      if (mode === 'create') setCreatePrompt(""); else setModifyPrompt("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden">
      
      {/* LEFT: Engine Controls */}
      <aside className="w-[480px] bg-[#141414] border-r-[4px] border-black flex flex-col p-5 overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#C9F830] border-2 border-black rounded-lg flex items-center justify-center shadow-[3px_3px_0px_0px_black]">
              <MonitorPlay size={24} className="text-black" />
            </div>
            <h1 className="font-[1000] text-xl uppercase tracking-tighter">MOTION ENGINE</h1>
          </div>
          <div className="flex gap-1">
             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
             <div className="w-2 h-2 rounded-full bg-yellow-500" />
             <div className="w-2 h-2 rounded-full bg-green-500" />
          </div>
        </div>

        {/* Create vs Modify Panels */}
        <div className="space-y-4 mb-6">
          <div className="bg-[#1e1e1e] border-[3px] border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_black]">
            <h3 className="text-[10px] font-black uppercase text-[#C9F830] mb-3 flex items-center gap-2">
              <Sparkles size={14} /> Creation Engine
            </h3>
            <textarea 
              value={createPrompt}
              onChange={(e) => setCreatePrompt(e.target.value)}
              placeholder="e.g. A realistic Japanese flag or a classic Traffic Light..."
              className="w-full bg-black/40 border-[2px] border-black rounded-lg p-3 text-sm font-bold focus:border-[#C9F830] outline-none"
              rows={2}
            />
            <button onClick={() => handleAIAction('create')} className="w-full mt-2 h-10 bg-[#C9F830] text-black border-2 border-black rounded-lg font-black uppercase text-xs hover:-translate-y-1 transition-all">
              Initialize New Design
            </button>
          </div>

          <div className="bg-[#1e1e1e] border-[3px] border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_black]">
            <h3 className="text-[10px] font-black uppercase text-[#24D3FF] mb-3 flex items-center gap-2">
              <RefreshCcw size={14} /> Modification Lab
            </h3>
            <textarea 
              value={modifyPrompt}
              onChange={(e) => setModifyPrompt(e.target.value)}
              placeholder="e.g. 'Make the lines thicker' or 'Add a red circle'..."
              className="w-full bg-black/40 border-[2px] border-black rounded-lg p-3 text-sm font-bold focus:border-[#24D3FF] outline-none"
              rows={2}
            />
            <button onClick={() => handleAIAction('modify')} className="w-full mt-2 h-10 bg-[#24D3FF] text-black border-2 border-black rounded-lg font-black uppercase text-xs hover:-translate-y-1 transition-all">
              Iterate Current Asset
            </button>
          </div>
        </div>

        {/* Global Settings */}
        <div className="bg-[#1e1e1e] border-[3px] border-black rounded-xl p-4 mb-6">
          <h3 className="text-[10px] font-black uppercase text-gray-500 mb-4 flex items-center gap-2">
            <Settings2 size={14} /> Render Settings
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-gray-400">Frame Rate</label>
              <div className="flex border-2 border-black rounded-lg overflow-hidden">
                {['30', '60'].map(f => (
                  <button key={f} onClick={() => setFps(f)} className={`flex-1 py-1 text-xs font-black ${fps === f ? 'bg-white text-black' : 'bg-black text-white'}`}>{f} FPS</button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-gray-400">Resolution</label>
              <div className="flex border-2 border-black rounded-lg overflow-hidden">
                {['1080', '4K'].map(r => (
                  <button key={r} onClick={() => setRes(r)} className={`flex-1 py-1 text-xs font-black ${res === r ? 'bg-white text-black' : 'bg-black text-white'}`}>{r}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-2 bg-black/20 rounded-lg">
             <span className="text-[10px] font-black uppercase">Refine Prompt for Quality</span>
             <button onClick={() => setRefinePrompt(!refinePrompt)} className={`w-10 h-5 rounded-full border-2 border-black transition-all relative ${refinePrompt ? 'bg-[#C9F830]' : 'bg-gray-600'}`}>
                <div className={`absolute top-0.5 w-3 h-3 bg-black rounded-full transition-all ${refinePrompt ? 'right-0.5' : 'left-0.5'}`} />
             </button>
          </div>
        </div>

        {/* Export Suite */}
        <div className="mt-auto pt-4">
          <h3 className="text-[10px] font-black uppercase text-gray-500 mb-3">Export Formats</h3>
          <div className="grid grid-cols-3 gap-2">
            {['HTML', 'GIF', 'MOV', 'MP4', 'SVG', 'PNG'].map(fmt => (
              <button key={fmt} className="h-10 border-2 border-black bg-[#222] rounded-lg font-black text-[10px] uppercase hover:bg-white hover:text-black transition-all flex items-center justify-center gap-1">
                <FileCode size={12} /> {fmt}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* RIGHT: Viewport */}
      <main className="flex-1 relative flex flex-col">
        {/* Top Viewport Header */}
        <header className="h-16 bg-[#141414] border-b-[4px] border-black flex items-center justify-between px-6 shrink-0">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-gray-500">Chroma Color:</span>
              <input type="color" value={chromaColor} onChange={(e) => setChromaColor(e.target.value)} className="w-8 h-8 border-2 border-black rounded-lg bg-transparent cursor-pointer" />
            </div>
            <button onClick={() => setShowGreenScreen(!showGreenScreen)} className={`px-4 h-8 border-2 border-black rounded-lg text-[10px] font-black uppercase transition-all ${showGreenScreen ? 'bg-white text-black' : 'bg-[#333] text-white'}`}>
              {showGreenScreen ? 'Disable Key' : 'Enable Key'}
            </button>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black uppercase text-[#C9F830]">{res}p @ {fps}fps</span>
            <button onClick={() => { setIsPlaying(false); setTimeout(() => setIsPlaying(true), 50); }} className="h-8 w-8 bg-[#C9F830] border-2 border-black rounded-lg flex items-center justify-center text-black shadow-[2px_2px_0px_0px_black] active:translate-y-0.5 active:shadow-none transition-all">
              <Play size={16} fill="black" />
            </button>
          </div>
        </header>

        {/* The Stage */}
        <div className={`flex-1 relative transition-colors duration-500 overflow-hidden ${showGreenScreen ? '' : 'bg-[#0a0a0a] bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]'}`} style={{ backgroundColor: showGreenScreen ? chromaColor : undefined }}>
          
          <div className="w-full h-full flex flex-col items-center justify-center p-12">
            {isPlaying && (
              <div 
                className="relative flex flex-col items-center"
                style={{
                  animation: `${asset.animationIn} ${asset.duration}s cubic-bezier(0.16, 1, 0.3, 1) both`,
                  animationDelay: `${asset.delay}s`
                }}
              >
                {/* SVG Icon */}
                <div className="relative mb-8 filter drop-shadow-[15px_15px_0px_rgba(0,0,0,0.4)]">
                  <svg viewBox="0 0 100 100" className={`${res === '4K' ? 'w-[600px] h-[600px]' : 'w-[350px] h-[350px]'}`}>
                    <ShapeRenderer shapes={asset.shapes} styleVariant={asset.styleVariant} />
                  </svg>
                </div>

                {/* Text Block */}
                {asset.showText && (
                  <div className="animate-[slideUp_0.8s_ease-out_both] delay-500">
                    <div className={`bg-white border-[6px] border-black rounded-[32px] shadow-[15px_15px_0px_0px_black] overflow-hidden ${res === '4K' ? 'min-w-[800px]' : 'min-w-[450px]'}`}>
                      <div className="h-4 w-full" style={{ backgroundColor: asset.color }} />
                      <div className="p-8 text-center">
                        <h2 className="text-black font-[1000] text-6xl uppercase tracking-tighter leading-none italic">{asset.primary}</h2>
                        <div className="mt-4 inline-block px-5 py-2 bg-black text-white font-black text-xl uppercase tracking-widest rounded-xl">{asset.secondary}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Loader Overlay */}
          {isGenerating && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center flex-col gap-4">
              <div className="w-16 h-16 border-[6px] border-[#C9F830] border-t-transparent rounded-full animate-spin shadow-[0_0_20px_#C9F830]" />
              <div className="flex items-center gap-2">
                <Search size={18} className="text-[#C9F830] animate-bounce" />
                <span className="font-black uppercase tracking-widest text-lg">AI Searching & Constructing...</span>
              </div>
            </div>
          )}
        </div>

        {/* Visual Status Bar */}
        <footer className="h-10 bg-black border-t-2 border-[#333] flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-4 text-[10px] font-black uppercase text-gray-500">
            <span>Asset: {asset.title}</span>
            <span className="text-[#24D3FF]">ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-black uppercase">
            <span className="text-[#C9F830]">Render Engine: WebGL 2.0</span>
            <span className="text-pink-500">Alpha: Premultiplied</span>
          </div>
        </footer>
      </main>

      <style>{`
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          60% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes slideUp {
          0% { transform: translateY(100px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #141414; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #222; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #333; }
      `}</style>
    </div>
  );
}