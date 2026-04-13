import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Download, Play, Square, Layers, 
  Zap, Ghost, Eye, Trash2, Code, Box,
  MousePointer2, Palette, RefreshCcw
} from 'lucide-react';

const apiKey = ""; // Runtime handles this

// --- Design Tokens ---
const COLORS = {
  lime: '#C9F830',
  cyan: '#24D3FF',
  pink: '#FF7497',
  yellow: '#FFE357',
  orange: '#FCAF57',
  purple: '#B14AED',
};

const INITIAL_ASSET = {
  title: "Traffic Light",
  type: "ALERT",
  primary: "GO GO GO!",
  secondary: "New Stream Starting",
  color: COLORS.lime,
  shapes: [
    { type: 'rect', x: 35, y: 10, w: 30, h: 80, fill: '#333', rx: 5 }, // Housing
    { type: 'circle', cx: 50, cy: 25, r: 8, fill: '#FF4444' },         // Red
    { type: 'circle', cx: 50, cy: 50, r: 8, fill: '#FFBB00' },         // Yellow
    { type: 'circle', cx: 50, cy: 75, r: 8, fill: '#00FF00' }          // Green
  ]
};

// --- Helper to render dynamic SVG shapes ---
const ShapeRenderer = ({ shapes }) => {
  if (!shapes) return null;
  return shapes.map((s, i) => {
    const common = {
      key: i,
      fill: s.fill || '#000',
      stroke: 'black',
      strokeWidth: 2,
    };
    if (s.type === 'rect') return <rect {...common} x={s.x} y={s.y} width={s.w} height={s.h} rx={s.rx || 0} />;
    if (s.type === 'circle') return <circle {...common} cx={s.cx} cy={s.cy} r={s.r} />;
    if (s.type === 'path') return <path {...common} d={s.d} />;
    if (s.type === 'polygon') return <polygon {...common} points={s.points} />;
    return null;
  });
};

export default function GeometryStudio() {
  const [asset, setAsset] = useState(INITIAL_ASSET);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showGreenScreen, setShowGreenScreen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateWithAI = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);

    const systemPrompt = `You are a professional SVG motion designer.
    Generate a JSON object for a YouTube overlay. 
    You MUST include a "shapes" array that draws a complex icon representing the user's prompt (e.g., a flag, a car, a robot, a bicycle).
    Coordinates are 0-100.
    
    JSON Schema:
    {
      "title": string,
      "type": "LOWER_THIRD" | "ALERT" | "BANNER",
      "primary": string,
      "secondary": string,
      "color": string (hex),
      "shapes": Array<{
        "type": "rect" | "circle" | "path" | "polygon",
        "x": number, "y": number, "w": number, "h": number, "rx": number, // for rect
        "cx": number, "cy": number, "r": number, // for circle
        "d": string, // for path
        "points": string, // for polygon
        "fill": string
      }>
    }`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Create a complex visual asset for: ${aiPrompt}` }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      const data = await response.json();
      const result = JSON.parse(data.candidates[0].content.parts[0].text);
      setAsset(result);
    } catch (err) {
      console.error("AI Error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111] text-white font-sans flex flex-col md:flex-row overflow-hidden">
      
      {/* Sidebar: Subtoolbox Module Style */}
      <aside className="w-full md:w-[400px] bg-[#1a1a1a] border-r-[4px] border-black p-6 flex flex-col gap-6 z-20 overflow-y-auto">
        <header className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#B14AED] border-[3px] border-black flex items-center justify-center rounded-xl shadow-[4px_4px_0px_0px_black]">
            <Box size={28} className="text-black" />
          </div>
          <div>
            <h1 className="text-2xl font-[1000] uppercase tracking-tighter leading-none">SHAPE GEN</h1>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Geometry Engine v2</p>
          </div>
        </header>

        {/* AI Input Section */}
        <div className="bg-[#222] border-[3px] border-black p-4 rounded-2xl shadow-[6px_6px_0px_0px_black]">
          <h3 className="text-xs font-black uppercase text-[#C9F830] mb-3 flex items-center gap-2">
            <Sparkles size={14} /> Intelligent Constructor
          </h3>
          <textarea 
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="e.g. A Japanese flag with a glowing red sun..."
            className="w-full bg-[#333] border-[2px] border-black rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-[#C9F830] outline-none"
            rows={3}
          />
          <button 
            onClick={generateWithAI}
            disabled={isGenerating}
            className={`w-full mt-3 h-[50px] border-[3px] border-black rounded-xl font-[1000] uppercase text-sm flex items-center justify-center gap-3 transition-all ${isGenerating ? 'bg-gray-600' : 'bg-[#C9F830] text-black hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_black]'}`}
          >
            {isGenerating ? <RefreshCcw className="animate-spin" /> : <><Zap fill="black" size={18} /> Construct Geometry</>}
          </button>
        </div>

        {/* Live Properties */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase text-gray-500">Live Parameters</h3>
            <button onClick={() => setAsset(INITIAL_ASSET)} className="text-[10px] font-black uppercase underline">Reset</button>
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-400">Primary Headline</label>
            <input 
              value={asset.primary}
              onChange={(e) => setAsset({...asset, primary: e.target.value})}
              className="w-full bg-[#333] border-[2px] border-black p-3 rounded-lg font-black uppercase text-sm"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {Object.entries(COLORS).map(([name, hex]) => (
              <button 
                key={name}
                onClick={() => setAsset({...asset, color: hex})}
                className={`h-10 border-[2px] border-black rounded-lg transition-all ${asset.color === hex ? 'scale-110 border-white' : ''}`}
                style={{ backgroundColor: hex }}
              />
            ))}
          </div>
        </div>

        {/* Viewport Actions */}
        <div className="mt-auto flex flex-col gap-2">
          <button 
            onClick={() => setShowGreenScreen(!showGreenScreen)}
            className={`w-full h-[50px] border-[3px] border-black rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 ${showGreenScreen ? 'bg-[#00FF00] text-black' : 'bg-[#333]'}`}
          >
            {showGreenScreen ? <Eye /> : <Ghost />} Chroma Key {showGreenScreen ? 'ON' : 'OFF'}
          </button>
          <div className="flex gap-2">
            <button onClick={() => setIsPlaying(!isPlaying)} className="flex-1 h-[50px] bg-white text-black border-[3px] border-black rounded-xl font-[1000] uppercase text-xs">
              {isPlaying ? 'STOP' : 'REPLAY'}
            </button>
            <button className="flex-1 h-[50px] bg-[#FF7497] border-[3px] border-black rounded-xl font-[1000] uppercase text-xs">
              EXPORT
            </button>
          </div>
        </div>
      </aside>

      {/* Preview Engine */}
      <main className={`flex-1 relative flex items-center justify-center transition-colors duration-700 ${showGreenScreen ? 'bg-[#00FF00]' : 'bg-[#111] bg-[radial-gradient(#333_1px,transparent_1px)] bg-[size:20px_20px]'}`}>
        
        {/* Dynamic Asset Rendering */}
        <div className="w-full h-full flex items-center justify-center p-20 pointer-events-none">
          {isPlaying && (
            <div className="relative flex flex-col items-center">
              
              {/* The SVG Graphic (The "Icon") */}
              <div className="relative mb-6 animate-[bounceIn_0.8s_cubic-bezier(0.34,1.56,0.64,1)]">
                <svg viewBox="0 0 100 100" className="w-[250px] h-[250px] filter drop-shadow-[8px_8px_0px_rgba(0,0,0,1)]">
                   <ShapeRenderer shapes={asset.shapes} />
                </svg>
                {/* Style accents */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-white border-[3px] border-black rounded-full flex items-center justify-center animate-pulse">
                   <Zap size={24} fill="#FFE357" className="text-black" />
                </div>
              </div>

              {/* The Text Box (Neo-Brutalist Style) */}
              <div className="animate-[slideUp_0.6s_ease-out_0.2s_both]">
                <div className="border-[6px] border-black rounded-[24px] overflow-hidden shadow-[12px_12px_0px_0px_black] bg-white max-w-[500px]">
                  <div className="h-[12px] w-full border-b-[4px] border-black" style={{ backgroundColor: asset.color }} />
                  <div className="p-6 text-center">
                    <h2 className="text-black font-[1000] text-5xl uppercase tracking-tighter leading-tight italic">
                      {asset.primary}
                    </h2>
                    <div className="mt-2 inline-block px-4 py-1 bg-black text-white font-black text-sm uppercase tracking-[0.2em] rounded-lg">
                      {asset.secondary}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* UI Overlay Indicators */}
        <div className="absolute top-8 left-8 flex gap-2">
          <div className="px-3 py-1 bg-white border-[2px] border-black rounded-full text-[10px] font-black text-black uppercase">Alpha Channel Preview</div>
          <div className="px-3 py-1 bg-[#24D3FF] border-[2px] border-black rounded-full text-[10px] font-black text-black uppercase">Render Scale: 4K</div>
        </div>
      </main>

      <style>{`
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes slideUp {
          0% { transform: translateY(50px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes grow {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}