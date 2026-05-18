import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Download, Play, Square, Layers, 
  Zap, Ghost, Eye, Box, RefreshCcw, 
  Type, Clock, Wand2, MonitorPlay, EyeOff, 
  LayoutTemplate, Search, Settings2, Palette,
  ChevronRight, Smartphone, Monitor, Menu, X,
  FileCode, RotateCcw
} from 'lucide-react';

const apiKey = ""; // Provided at runtime

const COLORS = {
  lime: '#C9F830', cyan: '#24D3FF', pink: '#FF7497', 
  yellow: '#FFE357', orange: '#FCAF57', purple: '#B14AED',
};

const ANIMATIONS = ['bounceIn', 'slideUp', 'slideRight', 'dropIn', 'zoomIn', 'spinIn'];

const INITIAL_ASSET = {
  title: "New Asset",
  primary: "MOBILE ASSET",
  secondary: "TAP TO EDIT",
  color: COLORS.lime,
  showText: true,
  animationIn: 'bounceIn',
  duration: 1.0,
  delay: 0.2,
  styleVariant: 'neo-brutalist',
  shapes: [
    { type: 'rect', x: 20, y: 20, w: 60, h: 60, fill: COLORS.lime, rx: 10 },
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
  const [viewportMode, setViewportMode] = useState('mobile'); // 'desktop' or 'mobile'
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  
  const [createPrompt, setCreatePrompt] = useState("");
  const [modifyPrompt, setModifyPrompt] = useState("");

  const handleAIAction = async (mode) => {
    const promptText = mode === 'create' ? createPrompt : modifyPrompt;
    if (!promptText) return;
    setIsGenerating(true);

    const systemPrompt = `You are a professional Motion Graphics Designer. 
    ${refinePrompt ? "Improve the user's request for visual impact." : ""}
    ${mode === 'create' ? "Generate a NEW asset." : "MODIFY current asset."}
    Current Asset: ${JSON.stringify(asset)}
    Use Google Search grounding for accuracy. Return ONLY JSON.`;

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
      if (window.innerWidth < 768) setIsSidebarOpen(false);
    } catch (err) { console.error(err); } finally { setIsGenerating(false); }
  };

  const toggleAnimation = () => {
    setIsPlaying(false);
    setTimeout(() => setIsPlaying(true), 50);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden select-none">
      
      {/* HEADER (Mobile Only) */}
      <header className="md:hidden h-14 bg-[#141414] border-b-2 border-black flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <MonitorPlay size={20} className="text-[#C9F830]" />
          <span className="font-black text-sm uppercase tracking-tighter">MOTION ENGINE</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-black rounded-lg border-2 border-black">
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* SIDEBAR / DRAWER */}
      <aside className={`
        fixed inset-0 z-40 bg-[#141414] transition-transform duration-300 transform border-black
        md:relative md:translate-x-0 md:w-[400px] md:border-r-[4px]
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col p-5 overflow-y-auto custom-scrollbar
      `}>
        <div className="hidden md:flex items-center justify-between mb-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#C9F830] border-2 border-black rounded-lg flex items-center justify-center">
              <MonitorPlay size={24} className="text-black" />
            </div>
            <h1 className="font-[1000] text-xl uppercase tracking-tighter">MOTION ENGINE</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden"><X /></button>
        </div>

        {/* Format Selector */}
        <div className="bg-black/40 border-2 border-black rounded-xl p-2 mb-6 flex gap-2">
          <button 
            onClick={() => setViewportMode('mobile')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-xs font-black uppercase transition-all ${viewportMode === 'mobile' ? 'bg-white text-black' : 'text-gray-500'}`}
          >
            <Smartphone size={14} /> Mobile (9:16)
          </button>
          <button 
            onClick={() => setViewportMode('desktop')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-xs font-black uppercase transition-all ${viewportMode === 'desktop' ? 'bg-white text-black' : 'text-gray-500'}`}
          >
            <Monitor size={14} /> Desktop (16:9)
          </button>
        </div>

        {/* Creation Section */}
        <div className="space-y-4 mb-6">
          <div className="bg-[#1e1e1e] border-[3px] border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_black]">
            <h3 className="text-[10px] font-black uppercase text-[#C9F830] mb-3 flex items-center gap-2"><Sparkles size={14} /> Create</h3>
            <textarea 
              value={createPrompt}
              onChange={(e) => setCreatePrompt(e.target.value)}
              placeholder="A vintage rocket ship..."
              className="w-full bg-black/40 border-[2px] border-black rounded-lg p-3 text-sm font-bold focus:border-[#C9F830] outline-none"
              rows={2}
            />
            <button onClick={() => handleAIAction('create')} className="w-full mt-2 h-11 bg-[#C9F830] text-black border-2 border-black rounded-lg font-black uppercase text-xs active:scale-95 transition-all">Initialize</button>
          </div>

          <div className="bg-[#1e1e1e] border-[3px] border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_black]">
            <h3 className="text-[10px] font-black uppercase text-[#24D3FF] mb-3 flex items-center gap-2"><RefreshCcw size={14} /> Modify</h3>
            <textarea 
              value={modifyPrompt}
              onChange={(e) => setModifyPrompt(e.target.value)}
              placeholder="Change color to pink..."
              className="w-full bg-black/40 border-[2px] border-black rounded-lg p-3 text-sm font-bold focus:border-[#24D3FF] outline-none"
              rows={2}
            />
            <button onClick={() => handleAIAction('modify')} className="w-full mt-2 h-11 bg-[#24D3FF] text-black border-2 border-black rounded-lg font-black uppercase text-xs active:scale-95 transition-all">Update</button>
          </div>
        </div>

        {/* Global Controls */}
        <div className="bg-[#1e1e1e] border-[3px] border-black rounded-xl p-4 space-y-4 mb-6">
          <div className="flex justify-between items-center">
             <span className="text-[10px] font-black uppercase text-gray-400">Duration: {asset.duration}s</span>
             <input type="range" min="0.2" max="3" step="0.1" value={asset.duration} onChange={(e) => setAsset({...asset, duration: parseFloat(e.target.value)})} className="w-24 accent-[#C9F830]" />
          </div>
          <div className="flex gap-1 overflow-x-auto pb-2 no-scrollbar">
            {Object.entries(COLORS).map(([name, hex]) => (
              <button key={name} onClick={() => setAsset({...asset, color: hex})} className="w-8 h-8 rounded-full border-2 border-black shrink-0" style={{ backgroundColor: hex }} />
            ))}
          </div>
        </div>

        {/* Export Suite */}
        <div className="mt-auto grid grid-cols-2 gap-2">
          <button className="h-10 border-2 border-black bg-white text-black rounded-lg font-black text-[10px] uppercase flex items-center justify-center gap-1"><FileCode size={12}/> EXPORT JS</button>
          <button className="h-10 border-2 border-black bg-[#FF7497] text-white rounded-lg font-black text-[10px] uppercase flex items-center justify-center gap-1"><Download size={12}/> VIDEO</button>
        </div>
      </aside>

      {/* VIEWPORT AREA */}
      <main className="flex-1 relative flex flex-col bg-[#050505] p-4 md:p-8 overflow-hidden items-center justify-center">
        
        {/* Stage Container */}
        <div className={`
          relative transition-all duration-500 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-[4px] border-black rounded-[32px]
          ${viewportMode === 'mobile' ? 'h-[85%] aspect-[9/16]' : 'w-full max-w-4xl aspect-[16/9]'}
          ${showGreenScreen ? '' : 'bg-[#111] bg-[radial-gradient(#222_1px,transparent_1px)] bg-[size:20px_20px]'}
        `} style={{ backgroundColor: showGreenScreen ? chromaColor : undefined }}>
          
          <div className="w-full h-full flex flex-col items-center justify-center p-6 md:p-12 scale-[0.9] md:scale-100">
            {isPlaying && (
              <div 
                className="relative flex flex-col items-center w-full"
                style={{
                  animation: `${asset.animationIn} ${asset.duration}s cubic-bezier(0.16, 1, 0.3, 1) both`,
                  animationDelay: `${asset.delay}s`
                }}
              >
                {/* SVG Graphics */}
                <div className="relative mb-6 filter drop-shadow-[10px_10px_0px_rgba(0,0,0,0.5)]">
                  <svg viewBox="0 0 100 100" className="w-[200px] h-[200px] md:w-[300px] md:h-[300px]">
                    <ShapeRenderer shapes={asset.shapes} styleVariant={asset.styleVariant} />
                  </svg>
                </div>

                {/* Text Block */}
                {asset.showText && (
                  <div className="w-full max-w-[90%] md:max-w-md animate-[slideUp_0.8s_ease-out_both] delay-300">
                    <div className="bg-white border-[4px] md:border-[6px] border-black rounded-[24px] shadow-[8px_8px_0px_0px_black] overflow-hidden">
                      <div className="h-2 w-full" style={{ backgroundColor: asset.color }} />
                      <div className="p-4 md:p-6 text-center">
                        <h2 className="text-black font-[1000] text-2xl md:text-4xl uppercase tracking-tighter leading-none italic break-words">{asset.primary}</h2>
                        <div className="mt-2 inline-block px-3 py-1 bg-black text-white font-black text-[10px] md:text-sm uppercase tracking-widest rounded-lg">{asset.secondary}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Render Controls Floating */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/80 backdrop-blur-xl border-2 border-white/10 p-2 rounded-2xl">
             <button onClick={toggleAnimation} className="w-10 h-10 bg-[#C9F830] border-2 border-black rounded-xl flex items-center justify-center text-black shadow-[2px_2px_0px_0px_black]"><RotateCcw size={18} /></button>
             <button onClick={() => setShowGreenScreen(!showGreenScreen)} className={`px-4 h-10 border-2 border-black rounded-xl text-[10px] font-black uppercase ${showGreenScreen ? 'bg-white text-black' : 'bg-[#333] text-white'}`}>Chroma</button>
             <input type="color" value={chromaColor} onChange={(e) => setChromaColor(e.target.value)} className="w-10 h-10 border-2 border-black rounded-xl bg-transparent" />
          </div>
        </div>

        {/* Global Loading Overlay */}
        {isGenerating && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center gap-4">
             <div className="w-12 h-12 border-4 border-[#C9F830] border-t-transparent rounded-full animate-spin" />
             <span className="font-black uppercase tracking-widest text-xs">Processing Visual Request...</span>
          </div>
        )}
      </main>

      <style>{`
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          60% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes slideUp {
          0% { transform: translateY(50px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
      `}</style>
    </div>
  );
}