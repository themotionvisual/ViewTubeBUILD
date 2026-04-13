import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Download, Play, Square, Layers, 
  Type, Palette, Zap, Ghost, Eye, Maximize, 
  MousePointer2, Share2, Youtube, Heart
} from 'lucide-react';

const apiKey = ""; // Runtime handles this

// --- Theme Constants ---
const COLORS = {
  lime: '#C9F830',
  cyan: '#24D3FF',
  pink: '#FF7497',
  yellow: '#FFE357',
  orange: '#FCAF57',
  purple: '#B14AED',
};

const PRESETS = {
  lowerThird: {
    title: "Lower Third",
    type: "LOWER_THIRD",
    primary: "ALEX CREATOR",
    secondary: "@YT_HANDLE",
    color: COLORS.cyan,
    style: "neo-brutalist"
  },
  subscribe: {
    title: "Sub Alert",
    type: "ALERT",
    primary: "SUBSCRIBE",
    secondary: "JOIN THE SQUAD",
    color: COLORS.pink,
    style: "pop"
  },
  glitch: {
    title: "Glitch Banner",
    type: "BANNER",
    primary: "NEW VIDEO LIVE",
    secondary: "CLICK THE LINK",
    color: COLORS.purple,
    style: "glitch"
  }
};

export default function OverlayStudio() {
  const [asset, setAsset] = useState(PRESETS.lowerThird);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showGreenScreen, setShowGreenScreen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  // --- AI Generation Logic ---
  const generateWithAI = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    setError(null);

    const systemPrompt = `You are a professional motion graphics designer for YouTube. 
    Return ONLY a JSON object representing a video overlay configuration.
    Schema: {
      type: "LOWER_THIRD" | "ALERT" | "BANNER",
      primary: string,
      secondary: string,
      color: string (hex),
      style: "neo-brutalist" | "pop" | "minimal" | "glitch",
      animation: "slide" | "bounce" | "fade"
    }`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Generate a YouTube overlay configuration for: ${aiPrompt}` }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (!response.ok) throw new Error("API Limit Reached");
      const data = await response.json();
      const result = JSON.parse(data.candidates[0].content.parts[0].text);
      setAsset({ ...result, title: "AI Generated" });
    } catch (err) {
      setError("AI generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111] text-white font-sans overflow-hidden flex flex-col md:flex-row">
      
      {/* Sidebar Controls */}
      <aside className="w-full md:w-[400px] border-r-[4px] border-black bg-[#1a1a1a] p-6 overflow-y-auto flex flex-col gap-6 z-20">
        <header className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-[#C9F830] rounded-lg border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_black]">
            <Layers className="text-black" />
          </div>
          <h1 className="text-2xl font-[1000] uppercase tracking-tighter">ASSET STUDIO</h1>
        </header>

        {/* AI Generator Box */}
        <div className="bg-[#222] border-[3px] border-black p-4 rounded-xl shadow-[6px_6px_0px_0px_black]">
          <h3 className="font-black uppercase text-xs mb-3 flex items-center gap-2 text-[#C9F830]">
            <Sparkles size={14} /> Design with AI
          </h3>
          <textarea 
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="e.g. A neon blue lower third for a gaming channel..."
            className="w-full bg-[#333] border-[2px] border-black rounded-lg p-3 text-sm font-bold placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#C9F830]"
            rows={3}
          />
          <button 
            onClick={generateWithAI}
            disabled={isGenerating}
            className={`w-full mt-3 h-[44px] border-[3px] border-black rounded-lg font-black uppercase text-sm flex items-center justify-center gap-2 transition-all ${isGenerating ? 'bg-gray-600 opacity-50' : 'bg-[#C9F830] text-black hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_black]'}`}
          >
            {isGenerating ? 'Analyzing Style...' : <><Zap size={16} fill="black" /> Generate Asset</>}
          </button>
          {error && <p className="text-red-500 text-[10px] mt-2 font-bold uppercase">{error}</p>}
        </div>

        {/* Manual Controls */}
        <div className="space-y-4">
          <h3 className="font-black uppercase text-xs text-gray-500">Asset Parameters</h3>
          
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(PRESETS).map(([key, p]) => (
              <button 
                key={key}
                onClick={() => setAsset(p)}
                className={`p-2 border-[2px] border-black rounded-lg font-black text-[10px] uppercase transition-all ${asset.type === p.type ? 'bg-white text-black' : 'bg-[#333] text-gray-400'}`}
              >
                {p.title}
              </button>
            ))}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-500">Primary Text</label>
            <input 
              value={asset.primary}
              onChange={(e) => setAsset({...asset, primary: e.target.value})}
              className="w-full bg-[#333] border-[2px] border-black p-2 rounded font-bold uppercase text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-500">Secondary Text</label>
            <input 
              value={asset.secondary}
              onChange={(e) => setAsset({...asset, secondary: e.target.value})}
              className="w-full bg-[#333] border-[2px] border-black p-2 rounded font-bold uppercase text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-500">Accent Color</label>
            <div className="flex gap-2">
              {Object.values(COLORS).map(c => (
                <button 
                  key={c}
                  onClick={() => setAsset({...asset, color: c})}
                  className={`w-8 h-8 rounded-full border-2 border-black ${asset.color === c ? 'scale-125 ring-2 ring-white' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Viewport Toggles */}
        <div className="mt-auto pt-6 flex flex-col gap-2">
          <button 
            onClick={() => setShowGreenScreen(!showGreenScreen)}
            className={`w-full h-[50px] border-[3px] border-black rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 transition-all ${showGreenScreen ? 'bg-[#00FF00] text-black' : 'bg-gray-800 text-white'}`}
          >
            {showGreenScreen ? <Eye size={16} /> : <Ghost size={16} />} 
            {showGreenScreen ? 'Chroma Key: ON' : 'Toggle Transparency'}
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex-1 h-[50px] bg-white text-black border-[3px] border-black rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2"
            >
              {isPlaying ? <Square size={16} fill="black" /> : <Play size={16} fill="black" />}
              {isPlaying ? 'Stop' : 'Replay'}
            </button>
            <button className="flex-1 h-[50px] bg-[#B14AED] text-white border-[3px] border-black rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2">
              <Download size={16} /> Export Code
            </button>
          </div>
        </div>
      </aside>

      {/* Main Preview Area */}
      <main className={`flex-1 relative flex items-center justify-center transition-colors duration-500 ${showGreenScreen ? 'bg-[#00FF00]' : 'bg-[url("https://www.transparenttextures.com/patterns/carbon-fibre.png")] bg-[#111]'}`}>
        
        {/* Overlay Rendering Engine */}
        <div className="relative w-full h-full flex items-center justify-center p-20 pointer-events-none">
          {isPlaying && (
            <div className={`transition-all duration-1000 ${asset.style === 'glitch' ? 'animate-pulse' : ''}`}>
              
              {/* Type: LOWER THIRD */}
              {asset.type === 'LOWER_THIRD' && (
                <div className="absolute bottom-20 left-20 flex items-center animate-[slideIn_0.8s_cubic-bezier(0.16,1,0.3,1)]">
                  <div className="h-[100px] w-[100px] border-[6px] border-black bg-white rounded-2xl flex items-center justify-center shadow-[10px_10px_0px_0px_black] z-10 overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${asset.primary}`} alt="avatar" className="w-full h-full" />
                  </div>
                  <div className="flex flex-col -ml-4 pl-8 pr-12 py-3 border-[6px] border-black rounded-r-2xl shadow-[10px_10px_0px_0px_black]" style={{ backgroundColor: asset.color }}>
                    <h2 className="text-black font-[1000] text-4xl uppercase tracking-tighter leading-none">{asset.primary}</h2>
                    <p className="text-black/70 font-black text-xl uppercase tracking-widest mt-1">{asset.secondary}</p>
                  </div>
                </div>
              )}

              {/* Type: ALERT */}
              {asset.type === 'ALERT' && (
                <div className="flex flex-col items-center animate-[bounceIn_0.6s_cubic-bezier(0.34,1.56,0.64,1)]">
                  <div className="w-[300px] bg-white border-[6px] border-black rounded-3xl p-8 shadow-[15px_15px_0px_0px_black] relative">
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-[#FFE357] border-[4px] border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_black] animate-bounce">
                      <Youtube size={40} fill="black" className="text-black" />
                    </div>
                    <div className="text-center mt-6">
                      <h2 className="text-black font-[1000] text-5xl uppercase tracking-tighter leading-none">{asset.primary}</h2>
                      <p className="text-gray-500 font-black text-sm uppercase tracking-widest mt-2">{asset.secondary}</p>
                    </div>
                    <div className="mt-6 h-4 w-full bg-gray-100 border-[3px] border-black rounded-full overflow-hidden">
                      <div className="h-full border-r-[3px] border-black animate-[grow_2s_ease-in-out_infinite]" style={{ backgroundColor: asset.color }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Type: BANNER */}
              {asset.type === 'BANNER' && (
                <div className="absolute top-20 right-0 left-0 flex justify-center animate-[dropIn_1s_ease]">
                  <div className="w-[80%] max-w-[800px] flex items-center gap-6 p-4 border-[6px] border-black rounded-2xl shadow-[12px_12px_0px_0px_black] relative overflow-hidden" style={{ backgroundColor: asset.color }}>
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')]" />
                    <div className="w-20 h-20 bg-white border-[4px] border-black rounded-xl flex items-center justify-center shrink-0">
                      <Zap size={40} fill="black" className="text-black" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-black font-[1000] text-3xl uppercase tracking-tighter leading-none">{asset.primary}</h2>
                      <p className="text-black/60 font-black text-lg uppercase">{asset.secondary}</p>
                    </div>
                    <div className="px-6 py-2 bg-black text-white font-black uppercase text-xl rounded-xl border-[4px] border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)]">
                      LIVE
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Safe Area Labels */}
        <div className="absolute inset-10 border-[2px] border-dashed border-white/20 pointer-events-none rounded-xl flex items-start justify-center">
          <span className="bg-black/50 px-2 py-1 text-[8px] font-black uppercase tracking-widest -translate-y-full">Video Safe Area (16:9)</span>
        </div>
      </main>

      <style>{`
        @keyframes slideIn {
          0% { transform: translateX(-100%) skewX(-20deg); opacity: 0; }
          100% { transform: translateX(0) skewX(0); opacity: 1; }
        }
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes dropIn {
          0% { transform: translateY(-200%); }
          100% { transform: translateY(0); }
        }
        @keyframes grow {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-pulse {
          animation: glitch 0.2s infinite;
        }
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }
      `}</style>
    </div>
  );
}