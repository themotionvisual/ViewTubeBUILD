import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Download, Play, Square, Layers, 
  Zap, Ghost, Eye, Box, RefreshCcw, 
  Type, Clock, Wand2, MonitorPlay, EyeOff, LayoutTemplate
} from 'lucide-react';

const apiKey = ""; // Runtime handles this

// --- Design Tokens & Libraries ---
const COLORS = {
  lime: '#C9F830',
  cyan: '#24D3FF',
  pink: '#FF7497',
  yellow: '#FFE357',
  orange: '#FCAF57',
  purple: '#B14AED',
};

const ANIMATIONS = [
  { id: 'bounceIn', label: 'Bounce' },
  { id: 'slideUp', label: 'Slide Up' },
  { id: 'slideRight', label: 'Slide Right' },
  { id: 'dropIn', label: 'Drop In' },
  { id: 'zoomIn', label: 'Zoom In' },
  { id: 'spinIn', label: 'Spin In' },
];

const STYLES = [
  { id: 'neo-brutalist', label: 'Neo-Brutal' },
  { id: 'pop', label: 'Pop Art' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'wireframe', label: 'Wireframe' },
];

const INITIAL_ASSET = {
  title: "Traffic Light",
  type: "ALERT",
  primary: "GO GO GO!",
  secondary: "New Stream Starting",
  color: COLORS.lime,
  showText: true,
  animationIn: 'bounceIn',
  duration: 0.8,
  delay: 0.2,
  styleVariant: 'neo-brutalist',
  shapes: [
    { type: 'rect', x: 35, y: 10, w: 30, h: 80, fill: '#333', rx: 5 },
    { type: 'circle', cx: 50, cy: 25, r: 8, fill: '#FF4444' },
    { type: 'circle', cx: 50, cy: 50, r: 8, fill: '#FFBB00' },
    { type: 'circle', cx: 50, cy: 75, r: 8, fill: '#00FF00' }
  ]
};

// --- Dynamic SVG Shape Renderer ---
const ShapeRenderer = ({ shapes, styleVariant }) => {
  if (!shapes) return null;
  return shapes.map((s, i) => {
    // Dynamic styling based on the selected variant
    let fill = s.fill || '#000';
    let stroke = 'black';
    let strokeWidth = 2;
    let strokeDasharray = "none";

    if (styleVariant === 'wireframe') {
      fill = 'transparent';
      strokeWidth = 3;
      strokeDasharray = "6 4";
      stroke = s.fill === '#000' || s.fill === '#333' ? 'white' : s.fill;
    } else if (styleVariant === 'minimal') {
      strokeWidth = 0;
    } else if (styleVariant === 'pop') {
      strokeWidth = 4;
      stroke = '#fff';
    }

    const common = { key: i, fill, stroke, strokeWidth, strokeDasharray };

    if (s.type === 'rect') return <rect {...common} x={s.x} y={s.y} width={s.w} height={s.h} rx={styleVariant === 'pop' ? 15 : (s.rx || 0)} />;
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

  // Retrigger animation when settings change
  useEffect(() => {
    if (isPlaying) {
      setIsPlaying(false);
      setTimeout(() => setIsPlaying(true), 50);
    }
  }, [asset.animationIn, asset.duration, asset.delay]);

  const generateWithAI = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);

    const systemPrompt = `You are a Remotion React SVG motion designer.
    The user will provide a prompt to EITHER create a new asset OR modify the current one.
    
    Current Asset State:
    ${JSON.stringify(asset)}

    Instructions:
    1. If the prompt asks for a modification (e.g., "make the circles blue", "change animation to dropIn"), UPDATE the current state.
    2. If the prompt asks for a new object (e.g., "a bicycle", "a french flag"), CREATE new shapes.
    3. Return ONLY a valid JSON object matching this schema. Coordinates are 0-100.

    JSON Schema:
    {
      "title": string,
      "primary": string,
      "secondary": string,
      "color": string (hex),
      "showText": boolean,
      "animationIn": "bounceIn" | "slideUp" | "slideRight" | "dropIn" | "zoomIn" | "spinIn",
      "duration": number (0.2 to 3.0),
      "delay": number (0.0 to 2.0),
      "styleVariant": "neo-brutalist" | "pop" | "minimal" | "wireframe",
      "shapes": Array<{
        "type": "rect" | "circle" | "path" | "polygon",
        "x": number, "y": number, "w": number, "h": number, "rx": number,
        "cx": number, "cy": number, "r": number,
        "d": string, "points": string, "fill": string
      }>
    }`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Request: ${aiPrompt}` }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      const data = await response.json();
      const result = JSON.parse(data.candidates[0].content.parts[0].text);
      setAsset({ ...asset, ...result }); // Merge to preserve any missing fields
      setIsPlaying(false);
      setTimeout(() => setIsPlaying(true), 50);
    } catch (err) {
      console.error("AI Error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111] text-white font-sans flex flex-col md:flex-row overflow-hidden">
      
      {/* Sidebar Controls */}
      <aside className="w-full md:w-[450px] bg-[#1a1a1a] border-r-[4px] border-black p-4 flex flex-col gap-5 z-20 overflow-y-auto custom-scrollbar">
        <header className="flex items-center gap-4 shrink-0 pb-2 border-b-[3px] border-[#333]">
          <div className="w-12 h-12 bg-[#C9F830] border-[3px] border-black flex items-center justify-center rounded-xl shadow-[4px_4px_0px_0px_black]">
            <MonitorPlay size={28} className="text-black" />
          </div>
          <div>
            <h1 className="text-2xl font-[1000] uppercase tracking-tighter leading-none">REMOTION FX</h1>
            <p className="text-[10px] font-black text-[#24D3FF] uppercase tracking-widest">Asset Builder Studio</p>
          </div>
        </header>

        {/* AI Iteration Engine */}
        <div className="bg-gradient-to-br from-[#222] to-[#111] border-[3px] border-black p-4 rounded-xl shadow-[4px_4px_0px_0px_black] shrink-0">
          <h3 className="text-xs font-black uppercase text-[#FCAF57] mb-3 flex items-center gap-2">
            <Wand2 size={16} /> Prompt & Iterate
          </h3>
          <textarea 
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="e.g. 'Make it a rocket ship', or 'Change animation to Drop In and make it pink'"
            className="w-full bg-[#111] border-[2px] border-black rounded-lg p-3 text-sm font-bold focus:ring-2 focus:ring-[#FCAF57] outline-none resize-none"
            rows={2}
          />
          <button 
            onClick={generateWithAI}
            disabled={isGenerating}
            className={`w-full mt-3 h-[44px] border-[3px] border-black rounded-lg font-[1000] uppercase text-sm flex items-center justify-center gap-2 transition-all ${isGenerating ? 'bg-gray-600 text-gray-400' : 'bg-[#FCAF57] text-black hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_black]'}`}
          >
            {isGenerating ? <RefreshCcw className="animate-spin" size={16} /> : <><Sparkles size={16} /> Generate / Modify</>}
          </button>
        </div>

        {/* Configuration Tabs */}
        <div className="flex-1 flex flex-col gap-5">
          
          {/* Style & Animation Panel */}
          <div className="bg-[#222] border-[3px] border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_black]">
            <h3 className="text-xs font-black uppercase text-gray-400 flex items-center gap-2 mb-3">
              <LayoutTemplate size={14} /> Global Styling
            </h3>
            
            <div className="grid grid-cols-2 gap-2 mb-4">
              {STYLES.map(s => (
                <button 
                  key={s.id}
                  onClick={() => setAsset({...asset, styleVariant: s.id})}
                  className={`py-2 border-[2px] border-black rounded-lg font-black text-[10px] uppercase transition-all ${asset.styleVariant === s.id ? 'bg-[#24D3FF] text-black shadow-[2px_2px_0px_0px_black]' : 'bg-[#333] hover:bg-[#444]'}`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <h3 className="text-xs font-black uppercase text-gray-400 flex items-center gap-2 mb-3">
              <Zap size={14} /> Entrance Animation
            </h3>
            
            <div className="grid grid-cols-3 gap-2">
              {ANIMATIONS.map(a => (
                <button 
                  key={a.id}
                  onClick={() => setAsset({...asset, animationIn: a.id})}
                  className={`py-2 border-[2px] border-black rounded-lg font-black text-[10px] uppercase transition-all ${asset.animationIn === a.id ? 'bg-[#FF7497] text-black shadow-[2px_2px_0px_0px_black]' : 'bg-[#333] hover:bg-[#444]'}`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Timing Panel */}
          <div className="bg-[#222] border-[3px] border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_black]">
            <h3 className="text-xs font-black uppercase text-gray-400 flex items-center gap-2 mb-3">
              <Clock size={14} /> Timeline & Speed
            </h3>
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between font-black text-[10px] uppercase">
                  <span>Duration</span>
                  <span className="text-[#C9F830]">{asset.duration}s</span>
                </div>
                <input 
                  type="range" min="0.2" max="3.0" step="0.1" 
                  value={asset.duration} 
                  onChange={(e) => setAsset({...asset, duration: parseFloat(e.target.value)})}
                  className="w-full accent-[#C9F830] h-2 bg-black rounded-full appearance-none outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between font-black text-[10px] uppercase">
                  <span>Delay Start</span>
                  <span className="text-[#C9F830]">{asset.delay}s</span>
                </div>
                <input 
                  type="range" min="0.0" max="2.0" step="0.1" 
                  value={asset.delay} 
                  onChange={(e) => setAsset({...asset, delay: parseFloat(e.target.value)})}
                  className="w-full accent-[#C9F830] h-2 bg-black rounded-full appearance-none outline-none"
                />
              </div>
            </div>
          </div>

          {/* Text & Color Panel */}
          <div className="bg-[#222] border-[3px] border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_black] relative">
             <button 
                onClick={() => setAsset({...asset, showText: !asset.showText})}
                className={`absolute top-3 right-3 px-3 py-1 border-[2px] border-black rounded-md font-black text-[10px] uppercase flex items-center gap-1 transition-all ${asset.showText ? 'bg-[#C9F830] text-black' : 'bg-gray-600 text-black'}`}
              >
                {asset.showText ? <Eye size={12} /> : <EyeOff size={12} />}
                {asset.showText ? 'Text ON' : 'Text OFF'}
              </button>

            <h3 className="text-xs font-black uppercase text-gray-400 flex items-center gap-2 mb-3">
              <Type size={14} /> Overlay Copy
            </h3>
            <div className={`space-y-3 transition-opacity ${asset.showText ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
              <input 
                value={asset.primary}
                onChange={(e) => setAsset({...asset, primary: e.target.value})}
                placeholder="Primary Text"
                className="w-full bg-[#111] border-[2px] border-black p-3 rounded-lg font-black uppercase text-sm outline-none focus:border-white"
              />
              <input 
                value={asset.secondary}
                onChange={(e) => setAsset({...asset, secondary: e.target.value})}
                placeholder="Secondary Text"
                className="w-full bg-[#111] border-[2px] border-black p-3 rounded-lg font-black uppercase text-xs outline-none focus:border-white"
              />
            </div>

            <div className="mt-4 flex gap-2 justify-between">
              {Object.entries(COLORS).map(([name, hex]) => (
                <button 
                  key={name}
                  onClick={() => setAsset({...asset, color: hex})}
                  className={`h-8 w-full border-[2px] border-black rounded-md transition-all ${asset.color === hex ? 'scale-110 shadow-[2px_2px_0px_0px_white] z-10' : ''}`}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>

        </div>

        {/* Viewport Actions */}
        <div className="pt-4 flex flex-col gap-2 shrink-0">
          <button 
            onClick={() => setShowGreenScreen(!showGreenScreen)}
            className={`w-full h-[44px] border-[3px] border-black rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 transition-colors ${showGreenScreen ? 'bg-[#00FF00] text-black shadow-[4px_4px_0px_0px_black]' : 'bg-[#333] hover:bg-[#444]'}`}
          >
            {showGreenScreen ? <Eye size={16} /> : <Ghost size={16} />} 
            Transparency: {showGreenScreen ? 'Chroma ON' : 'Checkerboard'}
          </button>
          <div className="flex gap-2">
            <button 
              onClick={() => { setIsPlaying(false); setTimeout(() => setIsPlaying(true), 50); }} 
              className="flex-1 h-[44px] bg-white text-black border-[3px] border-black rounded-xl font-[1000] uppercase text-xs flex items-center justify-center gap-2 hover:bg-gray-200"
            >
              <Play fill="black" size={14} /> REPLAY
            </button>
            <button className="flex-1 h-[44px] bg-[#B14AED] border-[3px] border-black rounded-xl font-[1000] uppercase text-xs flex items-center justify-center gap-2 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_black] transition-all">
              <Download size={14} /> EXPORT JS
            </button>
          </div>
        </div>
      </aside>

      {/* Viewport / Rendering Engine */}
      <main className={`flex-1 relative flex items-center justify-center transition-colors duration-500 overflow-hidden ${showGreenScreen ? 'bg-[#00FF00]' : 'bg-[#111] bg-[radial-gradient(#333_2px,transparent_2px)] bg-[size:30px_30px]'}`}>
        
        <div className="w-full h-full flex flex-col items-center justify-center p-10 pointer-events-none">
          {isPlaying && (
            <div 
              className={`relative flex flex-col items-center justify-center`}
              style={{
                animationName: asset.animationIn,
                animationDuration: `${asset.duration}s`,
                animationDelay: `${asset.delay}s`,
                animationFillMode: 'both',
                animationTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' // Springy default
              }}
            >
              
              {/* Dynamic SVG Icon Layer */}
              <div className="relative z-10 filter drop-shadow-[8px_8px_0px_rgba(0,0,0,1)]">
                <svg viewBox="0 0 100 100" className="w-[300px] h-[300px] md:w-[400px] md:h-[400px]">
                   <ShapeRenderer shapes={asset.shapes} styleVariant={asset.styleVariant} />
                </svg>
                
                {/* Pop Style Accents */}
                {asset.styleVariant === 'pop' && (
                  <div className="absolute -top-10 -right-10 w-20 h-20 bg-white border-[4px] border-black rounded-full flex items-center justify-center animate-pulse shadow-[4px_4px_0px_0px_black]">
                    <Sparkles size={36} className="text-black" />
                  </div>
                )}
              </div>

              {/* Dynamic Text Layer */}
              {asset.showText && (
                <div 
                  className={`mt-4 z-20 animate-[slideUp_0.5s_ease-out_both]`}
                  style={{ animationDelay: `${asset.delay + (asset.duration * 0.5)}s` }}
                >
                  <div 
                    className={`max-w-[600px] text-center transition-all ${
                      asset.styleVariant === 'neo-brutalist' ? 'border-[6px] border-black rounded-[24px] bg-white shadow-[12px_12px_0px_0px_black] overflow-hidden' :
                      asset.styleVariant === 'pop' ? 'border-[4px] border-white rounded-full bg-black shadow-[8px_8px_0px_0px_rgba(255,255,255,0.5)] p-2 px-8' :
                      asset.styleVariant === 'minimal' ? 'border-b-4 border-white pb-4' :
                      'border-[3px] border-dashed border-white bg-black/50 p-6 backdrop-blur-sm'
                    }`}
                  >
                    {/* Top Color Bar for Neo-Brutalist */}
                    {asset.styleVariant === 'neo-brutalist' && (
                      <div className="h-[16px] w-full border-b-[4px] border-black" style={{ backgroundColor: asset.color }} />
                    )}

                    <div className={`${asset.styleVariant === 'neo-brutalist' ? 'p-6' : 'p-2'}`}>
                      <h2 
                        className={`font-[1000] uppercase tracking-tighter leading-none whitespace-nowrap ${
                          asset.styleVariant === 'neo-brutalist' ? 'text-black text-4xl md:text-6xl italic' :
                          asset.styleVariant === 'pop' ? 'text-white text-3xl md:text-5xl' :
                          'text-white text-4xl md:text-6xl'
                        }`}
                        style={asset.styleVariant === 'pop' ? { color: asset.color } : {}}
                      >
                        {asset.primary}
                      </h2>
                      
                      {asset.secondary && (
                        <div className={`mt-3 inline-block font-black text-sm md:text-lg uppercase tracking-[0.2em] ${
                          asset.styleVariant === 'neo-brutalist' ? 'px-4 py-1 bg-black text-white rounded-lg' :
                          asset.styleVariant === 'pop' ? 'text-white/80' :
                          'text-white/60'
                        }`}>
                          {asset.secondary}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Environment Indicators */}
        <div className="absolute top-6 left-6 flex flex-col gap-2 pointer-events-none">
          <div className="px-3 py-1.5 bg-black/80 border-[2px] border-white/20 rounded-md text-[10px] font-black text-white uppercase flex items-center gap-2 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            Preview: 1080x1080 60fps
          </div>
          <div className="px-3 py-1.5 bg-black/80 border-[2px] border-white/20 rounded-md text-[10px] font-black text-white uppercase backdrop-blur-md">
            Mode: {asset.styleVariant}
          </div>
        </div>

        {/* Global Keyframes for the dynamic animationName injection */}
        <style>{`
          @keyframes bounceIn {
            0% { transform: scale(0.1); opacity: 0; }
            60% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes slideUp {
            0% { transform: translateY(150px) scale(0.9); opacity: 0; }
            100% { transform: translateY(0) scale(1); opacity: 1; }
          }
          @keyframes slideRight {
            0% { transform: translateX(-200px) skewX(-15deg); opacity: 0; }
            100% { transform: translateX(0) skewX(0); opacity: 1; }
          }
          @keyframes dropIn {
            0% { transform: translateY(-300px) rotate(-10deg); opacity: 0; }
            60% { transform: translateY(20px) rotate(5deg); opacity: 1; }
            100% { transform: translateY(0) rotate(0deg); opacity: 1; }
          }
          @keyframes zoomIn {
            0% { transform: scale(3); opacity: 0; filter: blur(10px); }
            100% { transform: scale(1); opacity: 1; filter: blur(0px); }
          }
          @keyframes spinIn {
            0% { transform: scale(0) rotate(-180deg); opacity: 0; }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #1a1a1a;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #333;
            border-radius: 10px;
          }
        `}</style>
      </main>
    </div>
  );
}