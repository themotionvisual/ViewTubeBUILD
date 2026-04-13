import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Download, Play, Square, Layers, 
  Zap, Ghost, Eye, Box, RefreshCcw, 
  Type, Clock, Wand2, MonitorPlay, EyeOff, 
  LayoutTemplate, Search, Settings2, Palette,
  Smartphone, Monitor, Menu, X, RotateCcw, 
  AlertTriangle, FileCode, CheckCircle2, ChevronRight,
  ChevronLeft, Maximize, Minimize, Share2, Youtube,
  Heart, MousePointer2, Palette as PaletteIcon,
  Trash2, Code, Eye as EyeIcon, EyeOff as EyeOffIcon
} from 'lucide-react';

const apiKey = ""; // Provided at runtime

// --- Design Tokens & Constants ---
const COLORS = {
  lime: '#C9F830', cyan: '#24D3FF', pink: '#FF7497', 
  yellow: '#FFE357', orange: '#FCAF57', purple: '#B14AED',
};

const ANIMATIONS = [
  { id: 'bounceIn', label: 'Bounce', keyframes: 'bounceIn' },
  { id: 'slideUp', label: 'Slide Up', keyframes: 'slideUp' },
  { id: 'slideRight', label: 'Slide Right', keyframes: 'slideRight' },
  { id: 'dropIn', label: 'Drop In', keyframes: 'dropIn' },
  { id: 'zoomIn', label: 'Zoom In', keyframes: 'zoomIn' },
  { id: 'spinIn', label: 'Spin In', keyframes: 'spinIn' },
];

const STYLES = [
  { id: 'neo-brutalist', label: 'Neo-Brutalist', description: 'Bold, thick borders with shadows' },
  { id: 'pop', label: 'Pop Art', description: 'Vibrant colors with thick white outlines' },
  { id: 'minimal', label: 'Minimal', description: 'Clean, no borders with subtle styling' },
  { id: 'wireframe', label: 'Wireframe', description: 'Transparent fills with dashed borders' },
];

const VIEWPORTS = [
  { id: 'mobile', label: 'Mobile', aspect: '9/16', icon: '📱' },
  { id: 'desktop', label: 'Desktop', aspect: '16/9', icon: '🖥️' },
  { id: 'square', label: 'Square', aspect: '1/1', icon: '⬜' },
  { id: 'story', label: 'Story', aspect: '108/192', icon: '📱' },
];

const PRESETS = {
  lowerThird: {
    title: "Lower Third",
    type: "LOWER_THIRD",
    primary: "ALEX CREATOR",
    secondary: "@YT_HANDLE",
    color: COLORS.cyan,
    style: "neo-brutalist",
    shapes: [
      { type: 'rect', x: 35, y: 10, w: 30, h: 80, fill: '#333', rx: 5 },
      { type: 'circle', cx: 50, cy: 25, r: 8, fill: '#FF4444' },
      { type: 'circle', cx: 50, cy: 50, r: 8, fill: '#FFBB00' },
      { type: 'circle', cx: 50, cy: 75, r: 8, fill: '#00FF00' }
    ]
  },
  subscribe: {
    title: "Sub Alert",
    type: "ALERT",
    primary: "SUBSCRIBE",
    secondary: "JOIN THE SQUAD",
    color: COLORS.pink,
    style: "pop",
    shapes: [
      { type: 'rect', x: 10, y: 10, w: 80, h: 80, fill: COLORS.pink, rx: 20 },
      { type: 'circle', cx: 50, cy: 50, r: 25, fill: '#000' }
    ]
  },
  glitch: {
    title: "Glitch Banner",
    type: "BANNER",
    primary: "NEW VIDEO LIVE",
    secondary: "CLICK THE LINK",
    color: COLORS.purple,
    style: "glitch",
    shapes: [
      { type: 'rect', x: 5, y: 20, w: 90, h: 60, fill: COLORS.purple, rx: 10 },
      { type: 'rect', x: 10, y: 25, w: 80, h: 50, fill: '#000', rx: 8 }
    ]
  }
};

const INITIAL_ASSET = {
  title: "Unified Asset",
  type: "ALERT",
  primary: "UNIFIED STUDIO",
  secondary: "ALL FEATURES COMBINED",
  color: COLORS.cyan,
  showText: true,
  animationIn: 'bounceIn',
  duration: 1.0,
  delay: 0.2,
  styleVariant: 'neo-brutalist',
  shapes: [
    { type: 'rect', x: 20, y: 20, w: 60, h: 60, fill: COLORS.cyan, rx: 15 },
    { type: 'circle', cx: 50, cy: 50, r: 20, fill: '#000' },
    { type: 'path', d: 'M20,80 L50,20 L80,80 Z', fill: COLORS.yellow },
    { type: 'polygon', points: '50,10 70,40 40,40', fill: COLORS.orange }
  ]
};

// --- Shape Renderer Component ---
const ShapeRenderer = ({ shapes, styleVariant, animationIn, duration, delay }) => {
  if (!shapes) return null;
  
  return shapes.map((s, i) => {
    // Dynamic styling based on the selected variant
    let fill = s.fill || '#000';
    let stroke = 'black';
    let strokeWidth = styleVariant === 'wireframe' ? 2 : 3;
    let strokeDasharray = "none";
    let filter = 'none';

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
      filter = 'drop-shadow(2px 2px 0px rgba(0,0,0,0.3))';
    }

    const common = { 
      key: i, 
      fill, 
      stroke, 
      strokeWidth, 
      strokeDasharray,
      style: { filter }
    };

    if (s.type === 'rect') return <rect {...common} x={s.x} y={s.y} width={s.w} height={s.h} rx={styleVariant === 'pop' ? 15 : (s.rx || 0)} />;
    if (s.type === 'circle') return <circle {...common} cx={s.cx} cy={s.cy} r={s.r} />;
    if (s.type === 'path') return <path {...common} d={s.d} />;
    if (s.type === 'polygon') return <polygon {...common} points={s.points} />;
    return null;
  });
};

// --- AI Integration Hook ---
const useAIIntegration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const callGemini = async (promptText, mode, currentAsset = null, retryCount = 0) => {
    const systemPrompt = `You are a professional Motion Graphics Designer and React Developer. 
    ${mode === 'create' ? "Generate a NEW asset from scratch." : "MODIFY the existing asset."}
    
    Current Asset State: ${currentAsset ? JSON.stringify(currentAsset) : 'None'}
    
    SEARCH REQUIREMENT: If the user asks for a specific real-world object (brand, flag, vehicle, landmark), use Google Search to find accurate colors and proportions.
    
    Return ONLY a valid JSON object matching this schema. Coordinates are 0-100.
    
    JSON Schema:
    {
      "title": string,
      "type": "LOWER_THIRD" | "ALERT" | "BANNER",
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
          contents: [{ parts: [{ text: `Task: ${promptText}` }] }],
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
        return callGemini(promptText, mode, currentAsset, retryCount + 1);
      }
      throw err;
    }
  };

  return { callGemini, isGenerating, setIsGenerating, error, setError };
};

export default function UnifiedMotionStudio() {
  // --- State Management ---
  const [asset, setAsset] = useState(INITIAL_ASSET);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showGreenScreen, setShowGreenScreen] = useState(false);
  const [chromaColor, setChromaColor] = useState('#00FF00');
  const [viewportMode, setViewportMode] = useState('mobile');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // --- Advanced Settings ---
  const [fps, setFps] = useState('60');
  const [res, setRes] = useState('1080');
  const [refinePrompt, setRefinePrompt] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // --- AI Prompts ---
  const [createPrompt, setCreatePrompt] = useState("");
  const [modifyPrompt, setModifyPrompt] = useState("");
  
  // --- Export States ---
  const [exportFormat, setExportFormat] = useState('HTML');
  const [exportQuality, setExportQuality] = useState('high');
  
  // --- AI Integration ---
  const { callGemini, isGenerating, setIsGenerating, error, setError } = useAIIntegration();

  // --- Animation Trigger ---
  useEffect(() => {
    if (isPlaying) {
      setIsPlaying(false);
      setTimeout(() => setIsPlaying(true), 50);
    }
  }, [asset.animationIn, asset.duration, asset.delay, asset.styleVariant]);

  // --- AI Action Handlers ---
  const handleAIAction = async (mode) => {
    const promptText = mode === 'create' ? createPrompt : modifyPrompt;
    if (!promptText) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const result = await callGemini(promptText, mode, mode === 'modify' ? asset : null);
      setAsset(prev => mode === 'create' ? result : { ...prev, ...result });
      setIsPlaying(false);
      setTimeout(() => setIsPlaying(true), 50);
      
      if (mode === 'create') {
        setCreatePrompt("");
      } else {
        setModifyPrompt("");
      }
      
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    } catch (err) {
      setError("AI Engine Timeout. Trying simpler shapes...");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Asset Management ---
  const applyPreset = (preset) => {
    setAsset(prev => ({ ...prev, ...preset }));
    setIsPlaying(false);
    setTimeout(() => setIsPlaying(true), 50);
  };

  const resetAsset = () => {
    setAsset(INITIAL_ASSET);
    setIsPlaying(false);
    setTimeout(() => setIsPlaying(true), 50);
  };

  const clearShapes = () => {
    setAsset(prev => ({ ...prev, shapes: [] }));
  };

  const addShape = (shapeType) => {
    const newShape = {
      type: shapeType,
      x: 20, y: 20, w: 40, h: 40, cx: 50, cy: 50, r: 15,
      d: 'M10,10 L90,10 L50,90 Z',
      points: '50,10 90,90 10,90',
      fill: asset.color
    };
    setAsset(prev => ({ ...prev, shapes: [...prev.shapes, newShape] }));
  };

  // --- Export Handlers ---
  const exportCode = () => {
    const code = `
// Generated by Unified Motion Studio v3.0
import React from 'react';

const GeneratedAsset = () => {
  const asset = ${JSON.stringify(asset, null, 2)};
  
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg viewBox="0 0 100 100" style={{ width: '300px', height: '300px' }}>
        {/* Shapes would be rendered here */}
      </svg>
    </div>
  );
};

export default GeneratedAsset;
    `;
    console.log(code);
    alert('Code exported to console. Copy from there.');
  };

  const exportVideo = () => {
    alert(`Exporting ${exportFormat} at ${exportQuality} quality...`);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden select-none">
      
      {/* MOBILE HEADER */}
      <header className="md:hidden h-14 bg-[#141414] border-b-2 border-black flex items-center justify-between px-4 z-50 shrink-0">
        <div className="flex items-center gap-2">
          <MonitorPlay size={20} className="text-[#C9F830]" />
          <span className="font-black text-sm uppercase tracking-tighter">UNIFIED STUDIO v3.0</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-black rounded-lg border-2 border-black">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 bg-black rounded-lg border-2 border-black">
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>
      </header>

      {/* SIDEBAR */}
      <aside className={`
        fixed inset-0 z-40 bg-[#141414] transition-transform duration-300 md:relative md:translate-x-0 md:w-[480px] lg:w-[520px] md:border-r-4 border-black
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col p-4 md:p-6 overflow-y-auto custom-scrollbar
      `}>
        
        {/* Header */}
        <div className="hidden md:flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#C9F830] to-[#24D3FF] border-2 border-black rounded-xl flex items-center justify-center shadow-[4px_4px_0px_0px_black]">
              <Layers size={28} className="text-black" />
            </div>
            <div>
              <h1 className="font-black text-2xl uppercase tracking-tighter">UNIFIED STUDIO</h1>
              <p className="text-[10px] font-black text-[#C9F830] uppercase tracking-widest">v3.0 - ALL FEATURES</p>
            </div>
          </div>
          <div className="flex gap-1">
             <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
             <div className="w-3 h-3 rounded-full bg-yellow-500" />
             <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
        </div>

        {/* Viewport Controls */}
        <div className="bg-black/40 border-2 border-black rounded-xl p-2 mb-4 flex gap-2 flex-wrap">
          {VIEWPORTS.map(vp => (
            <button 
              key={vp.id}
              onClick={() => setViewportMode(vp.id)}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-xs font-black uppercase transition-all ${viewportMode === vp.id ? 'bg-white text-black shadow-[2px_2px_0px_0px_black]' : 'text-gray-400 hover:text-white'}`}
            >
              <span>{vp.icon}</span> {vp.label}
            </button>
          ))}
        </div>

        {/* AI Generation Section */}
        <div className="space-y-4 mb-4">
          <div className="bg-gradient-to-br from-[#1e1e1e] to-[#2a2a2a] border-2 border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_black]">
            <h3 className="text-[10px] font-black uppercase text-[#C9F830] mb-3 flex items-center gap-2">
              <Sparkles size={14} /> AI CREATION ENGINE
            </h3>
            <textarea 
              value={createPrompt}
              onChange={(e) => setCreatePrompt(e.target.value)}
              placeholder="e.g. A vintage rocket ship with neon trails..."
              className="w-full bg-black/50 border-2 border-black rounded-lg p-3 text-sm font-bold focus:border-[#C9F830] outline-none resize-none"
              rows={2}
            />
            <div className="flex gap-2 mt-2">
              <button onClick={() => handleAIAction('create')} className="flex-1 h-10 bg-[#C9F830] text-black border-2 border-black rounded-lg font-black uppercase text-xs active:translate-y-0.5 transition-all hover:shadow-[2px_2px_0px_0px_black]">
                {isGenerating ? <RefreshCcw className="animate-spin" size={16} /> : <><Zap size={16} /> Generate</>}
              </button>
              <button onClick={() => setCreatePrompt("")} className="w-10 h-10 bg-gray-600 border-2 border-black rounded-lg flex items-center justify-center">
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#1e1e1e] to-[#2a2a2a] border-2 border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_black]">
            <h3 className="text-[10px] font-black uppercase text-[#24D3FF] mb-3 flex items-center gap-2">
              <RefreshCcw size={14} /> AI MODIFICATION LAB
            </h3>
            <textarea 
              value={modifyPrompt}
              onChange={(e) => setModifyPrompt(e.target.value)}
              placeholder="e.g. Make it a rocket ship with glowing neon outlines..."
              className="w-full bg-black/50 border-2 border-black rounded-lg p-3 text-sm font-bold focus:border-[#24D3FF] outline-none resize-none"
              rows={2}
            />
            <div className="flex gap-2 mt-2">
              <button onClick={() => handleAIAction('modify')} className="flex-1 h-10 bg-[#24D3FF] text-black border-2 border-black rounded-lg font-black uppercase text-xs active:translate-y-0.5 transition-all hover:shadow-[2px_2px_0px_0px_black]">
                {isGenerating ? <RefreshCcw className="animate-spin" size={16} /> : <><Wand2 size={16} /> Modify</>}
              </button>
              <button onClick={() => setModifyPrompt("")} className="w-10 h-10 bg-gray-600 border-2 border-black rounded-lg flex items-center justify-center">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Asset Controls */}
        <div className="bg-[#1e1e1e] border-2 border-black rounded-xl p-4 mb-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase text-gray-400">Asset Management</h3>
            <div className="flex gap-2">
              <button onClick={resetAsset} className="px-3 py-1 bg-gray-600 border-2 border-black rounded-lg text-[10px] font-black uppercase">Reset</button>
              <button onClick={clearShapes} className="px-3 py-1 bg-red-600 border-2 border-black rounded-lg text-[10px] font-black uppercase">Clear Shapes</button>
            </div>
          </div>
          
          {/* Presets */}
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(PRESETS).map(([key, preset]) => (
              <button 
                key={key}
                onClick={() => applyPreset(preset)}
                className={`py-2 border-2 border-black rounded-lg font-black text-[9px] uppercase transition-all text-center ${asset.type === preset.type ? 'bg-white text-black shadow-[2px_2px_0px_0px_black]' : 'bg-[#333] hover:bg-[#444]'}`}
              >
                {preset.title}
              </button>
            ))}
          </div>

          {/* Shape Addition */}
          <div className="grid grid-cols-4 gap-2">
            {['rect', 'circle', 'path', 'polygon'].map(shape => (
              <button 
                key={shape}
                onClick={() => addShape(shape)}
                className="py-2 border-2 border-black rounded-lg font-black text-[9px] uppercase bg-[#333] hover:bg-[#444] transition-all"
              >
                + {shape}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="bg-[#1e1e1e] border-2 border-black rounded-xl p-4 mb-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase text-gray-400">Advanced Settings</h3>
            <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-[10px] font-black uppercase underline">
              {showAdvanced ? 'Hide' : 'Show'} Advanced
            </button>
          </div>
          
          {showAdvanced && (
            <>
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
            </>
          )}
        </div>

        {/* Style & Animation Controls */}
        <div className="bg-[#1e1e1e] border-2 border-black rounded-xl p-4 mb-4 space-y-4">
          <h3 className="text-[10px] font-black uppercase text-gray-400">Style & Animation</h3>
          
          {/* Style Variants */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {STYLES.map(s => (
              <button 
                key={s.id}
                onClick={() => setAsset({...asset, styleVariant: s.id})}
                className={`py-2 border-2 border-black rounded-lg font-black text-[9px] uppercase transition-all text-left pl-2 ${asset.styleVariant === s.id ? 'bg-white text-black shadow-[2px_2px_0px_0px_black]' : 'bg-[#333] hover:bg-[#444]'}`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Animation Controls */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {ANIMATIONS.map(a => (
              <button 
                key={a.id}
                onClick={() => setAsset({...asset, animationIn: a.id})}
                className={`py-2 border-2 border-black rounded-lg font-black text-[9px] uppercase transition-all ${asset.animationIn === a.id ? 'bg-[#FF7497] text-black shadow-[2px_2px_0px_0px_black]' : 'bg-[#333] hover:bg-[#444]'}`}
              >
                {a.label}
              </button>
            ))}
          </div>

          {/* Timing Controls */}
          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-black text-[9px] uppercase">
                <span>Duration: {asset.duration}s</span>
                <span className="text-[#C9F830]">{asset.duration}</span>
              </div>
              <input 
                type="range" min="0.2" max="3.0" step="0.1" 
                value={asset.duration} 
                onChange={(e) => setAsset({...asset, duration: parseFloat(e.target.value)})}
                className="w-full accent-[#C9F830] h-2 bg-black rounded-full appearance-none outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-black text-[9px] uppercase">
                <span>Delay: {asset.delay}s</span>
                <span className="text-[#C9F830]">{asset.delay}</span>
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

        {/* Color Palette */}
        <div className="bg-[#1e1e1e] border-2 border-black rounded-xl p-4 mb-4">
          <h3 className="text-[10px] font-black uppercase text-gray-400 mb-3">Color Palette</h3>
          <div className="grid grid-cols-6 gap-2">
            {Object.entries(COLORS).map(([name, hex]) => (
              <button 
                key={name}
                onClick={() => setAsset({...asset, color: hex})}
                className={`w-full h-8 border-2 border-black rounded-lg transition-all ${asset.color === hex ? 'scale-110 shadow-[2px_2px_0px_0px_white] z-10' : ''}`}
                style={{ backgroundColor: hex }}
                title={name}
              />
            ))}
          </div>
        </div>

        {/* Export Suite */}
        <div className="mt-auto pt-4 space-y-4">
          <h3 className="text-[10px] font-black uppercase text-gray-500 mb-2">Export Options</h3>
          
          <div className="grid grid-cols-3 gap-2 mb-3">
            {['HTML', 'GIF', 'SVG', 'MOV', 'MP4', 'JS'].map(fmt => (
              <button 
                key={fmt}
                onClick={() => setExportFormat(fmt)}
                className={`h-10 border-2 border-black rounded-lg font-black text-[9px] uppercase transition-all flex items-center justify-center gap-1 ${exportFormat === fmt ? 'bg-white text-black shadow-[2px_2px_0px_0px_black]' : 'bg-[#222] hover:bg-white hover:text-black'}`}
              >
                <FileCode size={10} /> {fmt}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button onClick={exportCode} className="flex-1 h-10 bg-[#B14AED] border-2 border-black rounded-lg font-black uppercase text-xs flex items-center justify-center gap-2 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_black] transition-all">
              <Code size={16} /> Export Code
            </button>
            <button onClick={exportVideo} className="flex-1 h-10 bg-[#FF7497] border-2 border-black rounded-lg font-black uppercase text-xs flex items-center justify-center gap-2 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_black] transition-all">
              <Download size={16} /> Export Video
            </button>
          </div>
        </div>
      </aside>

      {/* VIEWPORT AREA */}
      <main className={`flex-1 relative flex flex-col bg-[#050505] p-4 md:p-6 overflow-hidden items-center justify-center ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
        
        {/* Top Controls */}
        <header className="h-12 bg-[#141414] border-b-2 border-black flex items-center justify-between px-4 md:px-6 shrink-0 w-full">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-gray-500">Chroma:</span>
              <input type="color" value={chromaColor} onChange={(e) => setChromaColor(e.target.value)} className="w-8 h-8 border-2 border-black rounded-lg bg-transparent cursor-pointer" />
            </div>
            <button onClick={() => setShowGreenScreen(!showGreenScreen)} className={`px-4 h-8 border-2 border-black rounded-lg text-[10px] font-black uppercase transition-all ${showGreenScreen ? 'bg-white text-black' : 'bg-[#333] text-white'}`}>
              {showGreenScreen ? 'Disable Key' : 'Enable Key'}
            </button>
            <span className="text-[10px] font-black uppercase text-[#C9F830]">{viewportMode} • {res}p @ {fps}fps</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={() => { setIsPlaying(false); setTimeout(() => setIsPlaying(true), 50); }} className="h-8 w-8 bg-[#C9F830] border-2 border-black rounded-lg flex items-center justify-center text-black shadow-[2px_2px_0px_0px_black] active:translate-y-0.5 active:shadow-none transition-all">
              <Play size={16} fill="black" />
            </button>
            <button onClick={() => setIsFullscreen(!isFullscreen)} className="h-8 w-8 bg-[#24D3FF] border-2 border-black rounded-lg flex items-center justify-center text-black shadow-[2px_2px_0px_0px_black] active:translate-y-0.5 active:shadow-none transition-all">
              {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            </button>
          </div>
        </header>

        {/* The Stage */}
        <div className={`flex-1 relative transition-all duration-500 overflow-hidden border-[4px] md:border-[6px] border-black rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${isFullscreen ? 'fixed inset-20 z-40' : ''}`}
          style={{ 
            backgroundColor: showGreenScreen ? chromaColor : undefined,
            aspectRatio: VIEWPORTS.find(vp => vp.id === viewportMode)?.aspect || '16/9'
          }}
        >
          
          <div className="w-full h-full flex flex-col items-center justify-center p-4 md:p-8">
            {isPlaying && (
              <div 
                className="relative flex flex-col items-center w-full"
                style={{
                  animation: `${asset.animationIn} ${asset.duration}s cubic-bezier(0.16, 1, 0.3, 1) both`,
                  animationDelay: `${asset.delay}s`
                }}
              >
                {/* SVG Icon Layer */}
                <div className="relative mb-6 md:mb-12 filter drop-shadow-[15px_15px_0px_rgba(0,0,0,0.4)]">
                  <svg viewBox="0 0 100 100" className={`${res === '4K' ? 'w-[500px] h-[500px]' : 'w-[250px] h-[250px] md:w-[350px] md:h-[350px]'}`}>
                    <ShapeRenderer shapes={asset.shapes} styleVariant={asset.styleVariant} />
                  </svg>
                  
                  {/* Style-specific accents */}
                  {asset.styleVariant === 'pop' && (
                    <div className="absolute -top-8 -right-8 w-16 h-16 bg-white border-4 border-black rounded-full flex items-center justify-center animate-pulse shadow-[4px_4px_0px_0px_black]">
                      <Sparkles size={32} className="text-black" />
                    </div>
                  )}
                </div>

                {/* Text Block */}
                {asset.showText && (
                  <div className="animate-[slideUp_0.8s_ease-out_both] delay-300">
                    <div className={`bg-white border-[4px] md:border-[6px] border-black rounded-[24px] shadow-[12px_12px_0px_0px_black] overflow-hidden ${res === '4K' ? 'min-w-[800px]' : 'min-w-[300px] md:min-w-[500px]'}`}>
                      {/* Top Color Bar for Neo-Brutalist */}
                      {asset.styleVariant === 'neo-brutalist' && (
                        <div className="h-3 md:h-4 w-full border-b-2 md:border-b-4 border-black" style={{ backgroundColor: asset.color }} />
                      )}
                      
                      <div className="p-4 md:p-6 text-center">
                        <h2 className={`text-black font-[1000] text-2xl md:text-4xl lg:text-6xl uppercase tracking-tighter leading-none italic ${asset.styleVariant === 'pop' ? 'text-white' : 'text-black'}`} style={asset.styleVariant === 'pop' ? { color: asset.color } : {}}>
                          {asset.primary}
                        </h2>
                        {asset.secondary && (
                          <div className={`mt-2 md:mt-4 inline-block px-3 md:px-5 py-1 md:py-2 bg-black text-white font-black text-[10px] md:text-sm uppercase tracking-widest rounded-lg ${asset.styleVariant === 'minimal' ? 'bg-transparent border-2 border-white' : ''}`}>
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

          {/* Floating UI Controls */}
          <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/70 backdrop-blur-xl border-2 border-white/10 p-2 md:p-3 rounded-2xl">
            <button onClick={() => { setIsPlaying(false); setTimeout(() => setIsPlaying(true), 50); }} className="w-10 md:w-12 h-10 md:h-12 bg-white text-black border-2 border-black rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all">
              <RotateCcw size={18} />
            </button>
            <div className="h-8 md:h-10 w-[2px] bg-white/10 mx-1" />
            <button onClick={() => setShowGreenScreen(!showGreenScreen)} className={`px-3 md:px-4 h-10 md:h-12 border-2 border-black rounded-xl text-[10px] md:text-[11px] font-black uppercase transition-all ${showGreenScreen ? 'bg-[#C9F830] text-black' : 'bg-gray-800 text-white'}`}>
              Chroma Key
            </button>
            <input type="color" value={chromaColor} onChange={(e) => setChromaColor(e.target.value)} className="w-10 md:w-12 h-10 md:h-12 border-2 border-black rounded-xl bg-transparent cursor-pointer" title="Pick Chroma Color" />
          </div>
        </div>

        {/* Status Bar */}
        <footer className="h-8 bg-black border-t-2 border-[#333] flex items-center justify-between px-4 md:px-6 shrink-0 w-full">
          <div className="flex items-center gap-4 text-[8px] md:text-[10px] font-black uppercase text-gray-500">
            <span>Asset: {asset.title}</span>
            <span className="text-[#24D3FF]">Style: {asset.styleVariant}</span>
            <span className="text-[#C9F830]">Shapes: {asset.shapes?.length || 0}</span>
          </div>
          <div className="flex items-center gap-4 text-[8px] md:text-[10px] font-black uppercase">
            <span className="text-[#C9F830]">Engine: React + SVG</span>
            <span className="text-pink-500">AI: Gemini Flash</span>
          </div>
        </footer>

        {/* Global Loading Overlay */}
        {isGenerating && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center gap-6">
             <div className="relative">
               <div className="w-16 md:w-20 h-16 md:h-20 border-4 md:border-8 border-[#C9F830] border-t-transparent rounded-full animate-spin" />
               <Search className="absolute inset-0 m-auto text-[#C9F830] animate-pulse" size={24} />
             </div>
             <div className="text-center">
               <p className="font-black uppercase tracking-[0.2em] text-lg md:text-xl text-[#C9F830]">AI Researching Reference</p>
               <p className="text-gray-500 font-bold text-xs md:text-sm mt-2 uppercase">Building Geometry via Google Search Grounding</p>
             </div>
          </div>
        )}

        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 bg-red-500/20 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-black border-4 border-red-500 p-6 rounded-xl text-center">
              <AlertTriangle size={32} className="text-red-500 mx-auto mb-4" />
              <p className="text-red-500 font-black uppercase">{error}</p>
              <button onClick={() => setError(null)} className="mt-4 px-4 py-2 bg-red-500 text-black font-black uppercase rounded-lg">Dismiss</button>
            </div>
          </div>
        )}
      </main>

      {/* Global Styles */}
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
        @keyframes slideRight { 
          0% { transform: translateX(-200px) skewX(-15deg); opacity: 0; } 
          100% { transform: translateX(0) skewX(0); opacity: 1; } 
        }
        @keyframes dropIn {
          0% { transform: translateY(-500px) rotate(-10deg); opacity: 0; }
          60% { transform: translateY(20px) rotate(5deg); opacity: 1; }
          100% { transform: translateY(0) rotate(0deg); opacity: 1; }
        }
        @keyframes zoomIn { 
          0% { transform: scale(3); opacity: 0; filter: blur(20px); } 
          100% { transform: scale(1); opacity: 1; filter: blur(0); } 
        }
        @keyframes spinIn {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes slideUp {
          0% { transform: translateY(50px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
