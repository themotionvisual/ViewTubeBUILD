// VIEWTUBE NEO-BRUTALIST DESIGN SYSTEM
// "Video Game Console" Interface & "Tactile Portal" Dashboards
// 30+ Wild Components with Strict Grid Laws

import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, SkipForward, Volume2, VolumeX, Maximize2, 
  TrendingUp, Eye, ThumbsUp, Share2, Bell, Settings,
  Zap, Activity, BarChart2, PieChart, Layers, Grid,
  Circle, Square, Triangle, Star, Heart, Bookmark,
  User, Users, MessageCircle, Send, Search, Filter,
  Upload, Download, RefreshCw, Power, Wifi, WifiOff
} from 'lucide-react';

// --- GRID SYSTEM CONSTANTS ---
const GRID_UNIT = 60; // px
const GAP = 24; // px between items
const PADDING = 24; // px inside containers
const BORDER_WIDTH = 6; // px
const SHADOW = 'shadow-[6px_6px_0px_0px_black]';

// --- NEON COLOR PALETTE ---
const COLORS = {
  cyan: '#24D3FF',
  orange: '#FCAF57',
  pink: '#FF7497',
  lime: '#C9F830',
  purple: '#B565FF',
  yellow: '#FFE547',
  mint: '#7FFFD4',
  coral: '#FF6B6B',
};

// --- UTILITY: Calculate height based on grid units ---
const gridHeight = (units: number) => units * GRID_UNIT - GAP;

// --- SUB TOOLBOX CONTAINER ---
interface SubToolboxProps {
  children: React.ReactNode;
  openUnits: number;
  className?: string;
  bgColor?: string;
  noBorder?: boolean;
}

const SubToolbox: React.FC<SubToolboxProps> = ({ 
  children, 
  openUnits, 
  className = '',
  bgColor = 'bg-white',
  noBorder = false
}) => {
  const height = gridHeight(openUnits);
  
  return (
    <div 
      className={`${bgColor} ${noBorder ? '' : `border-[${BORDER_WIDTH}px] border-black ${SHADOW}`} rounded-2xl p-[${PADDING}px] ${className}`}
      style={{ minHeight: `${height}px` }}
    >
      {children}
    </div>
  );
};

// ==========================================
// TASK 1: ATOMIC COMPONENTS (VARIANTS)
// ==========================================

// --- SLIDERS (3 Versions) ---

// Slider V1: Thin Pill
const SliderThinPill: React.FC<{ value?: number; label?: string; color?: string; inverted?: boolean }> = ({ 
  value = 50, 
  label = 'VOLUME',
  color = COLORS.cyan,
  inverted = false
}) => {
  const [val, setVal] = useState(value);
  const bg = inverted ? 'bg-black' : 'bg-white';
  const text = inverted ? 'text-white' : 'text-black';
  
  return (
    <div className="space-y-2">
      <div className={`flex justify-between items-center ${text} font-black text-xs`}>
        <span>{label}</span>
        <span>{val}%</span>
      </div>
      <div className={`relative h-3 ${bg} border-4 border-black rounded-full overflow-hidden`}>
        <div 
          className="absolute h-full transition-all duration-200 border-r-4 border-black"
          style={{ width: `${val}%`, backgroundColor: color }}
        />
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={val}
          onChange={(e) => setVal(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
        />
      </div>
    </div>
  );
};

// Slider V2: Thick Chunky Track
const SliderChunky: React.FC<{ value?: number; label?: string; color?: string }> = ({ 
  value = 70, 
  label = 'BASS',
  color = COLORS.orange
}) => {
  const [val, setVal] = useState(value);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-black font-black text-xs">
        <span>{label}</span>
        <span className="text-2xl font-[1000]">{val}</span>
      </div>
      <div className="relative h-10 bg-gray-200 border-6 border-black rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_black]">
        <div 
          className="absolute h-full transition-all duration-200"
          style={{ width: `${val}%`, backgroundColor: color }}
        />
        {/* Grip Pattern */}
        <div className="absolute inset-0 flex items-center gap-1 px-2 pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="w-1 h-6 bg-black/20 rounded-full" />
          ))}
        </div>
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={val}
          onChange={(e) => setVal(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
        />
      </div>
    </div>
  );
};

// Slider V3: Multi-Handle Indicator
const SliderMultiHandle: React.FC<{ label?: string }> = ({ label = 'TRIM RANGE' }) => {
  const [start, setStart] = useState(20);
  const [end, setEnd] = useState(80);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-black font-black text-xs">
        <span>{label}</span>
        <span>{start}% - {end}%</span>
      </div>
      <div className="relative h-12 bg-white border-6 border-black rounded-2xl overflow-hidden shadow-[6px_6px_0px_0px_black]">
        {/* Selected Range */}
        <div 
          className="absolute h-full bg-gradient-to-r from-pink-400 to-purple-500 border-x-4 border-black"
          style={{ 
            left: `${start}%`, 
            width: `${end - start}%` 
          }}
        />
        {/* Start Handle */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-6 h-10 bg-white border-4 border-black rounded-lg cursor-grab active:cursor-grabbing shadow-[2px_2px_0px_0px_black] flex items-center justify-center"
          style={{ left: `calc(${start}% - 12px)` }}
        >
          <div className="w-1 h-6 bg-black rounded-full" />
        </div>
        {/* End Handle */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-6 h-10 bg-white border-4 border-black rounded-lg cursor-grab active:cursor-grabbing shadow-[2px_2px_0px_0px_black] flex items-center justify-center"
          style={{ left: `calc(${end}% - 12px)` }}
        >
          <div className="w-1 h-6 bg-black rounded-full" />
        </div>
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={start}
          onChange={(e) => setStart(Math.min(Number(e.target.value), end - 10))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer z-20"
        />
      </div>
    </div>
  );
};

// --- TOGGLE SWITCHES (3 Versions) ---

// Toggle V1: Mechanical Lever
const ToggleMechanical: React.FC<{ label?: string; defaultOn?: boolean }> = ({ 
  label = 'POWER',
  defaultOn = false 
}) => {
  const [on, setOn] = useState(defaultOn);
  
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => setOn(!on)}
        className={`relative w-24 h-12 border-6 border-black rounded-full transition-all ${
          on ? 'bg-lime-400' : 'bg-gray-300'
        } shadow-[4px_4px_0px_0px_black] overflow-hidden`}
      >
        {/* Track Grooves */}
        <div className="absolute inset-0 flex items-center justify-around px-2">
          <div className="w-2 h-8 bg-black/20 rounded-full" />
          <div className="w-2 h-8 bg-black/20 rounded-full" />
          <div className="w-2 h-8 bg-black/20 rounded-full" />
        </div>
        {/* Handle */}
        <div 
          className={`absolute top-1 transition-all duration-300 ease-out w-10 h-10 bg-white border-4 border-black rounded-full shadow-[2px_2px_0px_0px_black] flex items-center justify-center ${
            on ? 'left-[calc(100%-44px)]' : 'left-1'
          }`}
        >
          <div className="w-3 h-6 bg-gradient-to-b from-gray-200 to-gray-400 rounded-full" />
        </div>
      </button>
      <span className="font-black text-sm uppercase">{label}: {on ? 'ON' : 'OFF'}</span>
    </div>
  );
};

// Toggle V2: Glowing Circle Button
const ToggleGlowCircle: React.FC<{ label?: string; color?: string }> = ({ 
  label = 'LIVE',
  color = COLORS.pink 
}) => {
  const [on, setOn] = useState(false);
  
  return (
    <button
      onClick={() => setOn(!on)}
      className="flex items-center gap-3 group"
    >
      <div className={`relative w-14 h-14 rounded-full border-6 border-black transition-all ${
        on ? 'shadow-[0_0_20px_rgba(255,116,151,0.8)]' : 'shadow-[4px_4px_0px_0px_black]'
      }`}
      style={{ backgroundColor: on ? color : '#e5e5e5' }}
      >
        {on && (
          <div className="absolute inset-0 rounded-full animate-ping opacity-50" style={{ backgroundColor: color }} />
        )}
        <div className={`absolute inset-2 rounded-full border-4 border-black ${on ? 'bg-white' : 'bg-gray-300'}`} />
      </div>
      <span className="font-black text-sm uppercase group-hover:translate-x-1 transition-transform">
        {label}
      </span>
    </button>
  );
};

// Toggle V3: Text-Based Sliding Pill
const ToggleTextPill: React.FC<{ labelOff?: string; labelOn?: string }> = ({ 
  labelOff = 'OFF',
  labelOn = 'ON' 
}) => {
  const [on, setOn] = useState(false);
  
  return (
    <button
      onClick={() => setOn(!on)}
      className="relative w-32 h-12 border-6 border-black rounded-full bg-white shadow-[6px_6px_0px_0px_black] overflow-hidden"
    >
      {/* Sliding Background */}
      <div 
        className={`absolute inset-0 transition-all duration-300 ease-out rounded-full ${
          on ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: COLORS.lime }}
      />
      {/* Text Labels */}
      <div className="absolute inset-0 flex items-center justify-between px-3">
        <span className={`font-black text-xs transition-all ${on ? 'text-white' : 'text-black/30'}`}>
          {labelOff}
        </span>
        <span className={`font-black text-xs transition-all ${on ? 'text-black' : 'text-black/30'}`}>
          {labelOn}
        </span>
      </div>
    </button>
  );
};

// --- CHECKBOXES (3 Versions) ---

// Checkbox V1: Chunky Square with X
const CheckboxChunky: React.FC<{ label?: string; defaultChecked?: boolean }> = ({ 
  label = 'SUBSCRIBE',
  defaultChecked = false 
}) => {
  const [checked, setChecked] = useState(defaultChecked);
  
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div 
        className={`relative w-10 h-10 border-6 border-black rounded-xl transition-all ${
          checked ? 'bg-cyan-400' : 'bg-white'
        } shadow-[4px_4px_0px_0px_black] group-hover:shadow-[6px_6px_0px_0px_black] group-hover:translate-y-[-2px]`}
        onClick={() => setChecked(!checked)}
      >
        {checked && (
          <svg className="absolute inset-1 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
            <path d="M6 12l4 4 8-8" />
          </svg>
        )}
      </div>
      <span className="font-black text-sm uppercase">{label}</span>
    </label>
  );
};

// Checkbox V2: Circle with Dot
const CheckboxCircleDot: React.FC<{ label?: string }> = ({ label = 'NOTIFY ME' }) => {
  const [checked, setChecked] = useState(false);
  
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div 
        className={`relative w-10 h-10 border-6 border-black rounded-full transition-all ${
          checked ? 'bg-pink-400' : 'bg-white'
        } shadow-[4px_4px_0px_0px_black] flex items-center justify-center`}
        onClick={() => setChecked(!checked)}
      >
        {checked && (
          <div className="w-4 h-4 bg-black rounded-full" />
        )}
      </div>
      <span className="font-black text-sm uppercase">{label}</span>
    </label>
  );
};

// Checkbox V3: Indented Depth Box
const CheckboxIndented: React.FC<{ label?: string }> = ({ label = 'AGREE TO TERMS' }) => {
  const [checked, setChecked] = useState(false);
  
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div 
        className={`relative w-10 h-10 border-6 border-black rounded-lg transition-all ${
          checked ? 'bg-gradient-to-br from-orange-300 to-orange-500' : 'bg-gradient-to-br from-gray-100 to-gray-300'
        } ${checked ? 'shadow-inner' : 'shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,0.2)]'}`}
        onClick={() => setChecked(!checked)}
      >
        {checked && (
          <div className="absolute inset-2 bg-white/90 rounded border-2 border-black flex items-center justify-center">
            <div className="w-2 h-2 bg-black rotate-45" />
          </div>
        )}
      </div>
      <span className="font-black text-xs uppercase">{label}</span>
    </label>
  );
};

// --- KNOBS/DIALS (3 Versions) ---

// Knob V1: Nested Ring
const KnobNestedRing: React.FC<{ label?: string; value?: number }> = ({ 
  label = 'GAIN',
  value = 65 
}) => {
  const [val, setVal] = useState(value);
  const angle = (val / 100) * 270 - 135; // -135° to 135°
  
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20">
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border-6 border-black bg-gradient-to-br from-gray-200 to-gray-400 shadow-[6px_6px_0px_0px_black]" />
        {/* Middle Ring */}
        <div className="absolute inset-2 rounded-full border-4 border-black bg-white" />
        {/* Inner Dial */}
        <div 
          className="absolute inset-4 rounded-full border-4 border-black bg-gradient-to-br from-purple-400 to-purple-600 cursor-pointer"
          style={{ transform: `rotate(${angle}deg)` }}
        >
          {/* Pointer */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-3 bg-white rounded-full" />
        </div>
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={val}
          onChange={(e) => setVal(Number(e.target.value))}
          className="absolute inset-0 opacity-0 cursor-pointer rounded-full"
        />
      </div>
      <div className="text-center">
        <div className="font-black text-xs uppercase text-black/60">{label}</div>
        <div className="font-[1000] text-2xl">{val}</div>
      </div>
    </div>
  );
};

// Knob V2: Dial Pointer
const KnobDialPointer: React.FC<{ label?: string; color?: string }> = ({ 
  label = 'FREQ',
  color = COLORS.cyan 
}) => {
  const [val, setVal] = useState(50);
  const angle = (val / 100) * 270 - 135;
  
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24 rounded-full border-6 border-black shadow-[6px_6px_0px_0px_black]" style={{ backgroundColor: color }}>
        {/* Tick Marks */}
        {Array.from({ length: 11 }).map((_, i) => {
          const tickAngle = (i / 10) * 270 - 135;
          return (
            <div
              key={i}
              className="absolute w-1 h-3 bg-black rounded-full origin-bottom"
              style={{
                top: '8px',
                left: '50%',
                transform: `translateX(-50%) rotate(${tickAngle}deg) translateY(28px)`,
              }}
            />
          );
        })}
        {/* Center Dial */}
        <div className="absolute inset-6 rounded-full bg-white border-4 border-black flex items-center justify-center">
          <div 
            className="absolute w-2 h-6 bg-black rounded-full origin-bottom"
            style={{ transform: `rotate(${angle}deg) translateY(-12px)` }}
          />
        </div>
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={val}
          onChange={(e) => setVal(Number(e.target.value))}
          className="absolute inset-0 opacity-0 cursor-pointer rounded-full"
        />
      </div>
      <div className="font-black text-xs uppercase">{label}: {val}Hz</div>
    </div>
  );
};

// Knob V3: Numeric Scroll Wheel
const KnobScrollWheel: React.FC<{ label?: string; min?: number; max?: number }> = ({ 
  label = 'BPM',
  min = 60,
  max = 200 
}) => {
  const [val, setVal] = useState(120);
  
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-32 border-6 border-black rounded-2xl bg-gradient-to-b from-gray-800 to-black shadow-[6px_6px_0px_0px_black] overflow-hidden">
        {/* Window */}
        <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-12 bg-lime-400 border-4 border-black rounded-lg flex items-center justify-center">
          <span className="font-[1000] text-2xl">{val}</span>
        </div>
        {/* Scroll Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 pointer-events-none">
          <div className="text-white/30 font-black text-sm">{val + 10}</div>
          <div className="h-12" />
          <div className="text-white/30 font-black text-sm">{val - 10}</div>
        </div>
        <input 
          type="range" 
          min={min} 
          max={max} 
          value={val}
          onChange={(e) => setVal(Number(e.target.value))}
          className="absolute inset-0 opacity-0 cursor-pointer"
          orient="vertical"
        />
      </div>
      <div className="font-black text-xs uppercase text-black/60">{label}</div>
    </div>
  );
};

// ==========================================
// ADDITIONAL ATOMIC COMPONENTS
// ==========================================

// --- BUTTONS (Variant Collection) ---

const ButtonPrimary: React.FC<{ label: string; icon?: React.ReactNode; color?: string }> = ({ 
  label, 
  icon,
  color = COLORS.cyan 
}) => (
  <button 
    className="px-6 py-3 border-6 border-black rounded-xl font-black uppercase text-sm shadow-[6px_6px_0px_0px_black] hover:shadow-[8px_8px_0px_0px_black] hover:translate-y-[-2px] active:shadow-[2px_2px_0px_0px_black] active:translate-y-[2px] transition-all flex items-center gap-2"
    style={{ backgroundColor: color }}
  >
    {icon}
    {label}
  </button>
);

const ButtonIcon: React.FC<{ icon: React.ReactNode; color?: string }> = ({ 
  icon,
  color = COLORS.pink 
}) => (
  <button 
    className="w-14 h-14 border-6 border-black rounded-xl font-black shadow-[6px_6px_0px_0px_black] hover:shadow-[8px_8px_0px_0px_black] hover:translate-y-[-2px] active:shadow-[2px_2px_0px_0px_black] active:translate-y-[2px] transition-all flex items-center justify-center"
    style={{ backgroundColor: color }}
  >
    {icon}
  </button>
);

// --- PROGRESS INDICATORS ---

const ProgressBar: React.FC<{ value: number; label?: string; color?: string }> = ({ 
  value,
  label = 'UPLOAD',
  color = COLORS.lime 
}) => (
  <div className="space-y-2">
    <div className="flex justify-between font-black text-xs">
      <span>{label}</span>
      <span>{value}%</span>
    </div>
    <div className="h-8 border-6 border-black rounded-full bg-white overflow-hidden shadow-[4px_4px_0px_0px_black]">
      <div 
        className="h-full transition-all duration-500 border-r-4 border-black flex items-center justify-end pr-2"
        style={{ width: `${value}%`, backgroundColor: color }}
      >
        {value > 20 && <span className="font-black text-xs">{value}%</span>}
      </div>
    </div>
  </div>
);

// --- STATUS LEDs ---

const StatusLED: React.FC<{ active?: boolean; color?: string; label?: string }> = ({ 
  active = true,
  color = COLORS.lime,
  label 
}) => (
  <div className="flex items-center gap-2">
    <div className={`w-6 h-6 rounded-full border-4 border-black ${active ? 'shadow-[0_0_20px_rgba(201,248,48,0.8)]' : ''}`}
      style={{ backgroundColor: active ? color : '#666' }}
    >
      {active && (
        <div className="absolute inset-0 rounded-full animate-ping opacity-50" style={{ backgroundColor: color }} />
      )}
    </div>
    {label && <span className="font-black text-xs uppercase">{label}</span>}
  </div>
);

// --- STAT CARD ---

const StatCard: React.FC<{ value: string; label: string; icon?: React.ReactNode; color?: string }> = ({ 
  value,
  label,
  icon,
  color = COLORS.cyan 
}) => (
  <div 
    className="border-6 border-black rounded-2xl p-4 shadow-[6px_6px_0px_0px_black] flex flex-col gap-2"
    style={{ backgroundColor: color }}
  >
    <div className="flex items-center justify-between">
      <span className="font-black text-xs uppercase text-black/70">{label}</span>
      {icon && <div className="text-black/70">{icon}</div>}
    </div>
    <div className="font-[1000] text-4xl">{value}</div>
  </div>
);

// --- INPUT FIELD ---

const InputField: React.FC<{ placeholder?: string; label?: string; icon?: React.ReactNode }> = ({ 
  placeholder = 'Enter text...',
  label = 'USERNAME',
  icon 
}) => (
  <div className="space-y-2">
    <label className="font-black text-xs uppercase text-black/60">{label}</label>
    <div className="relative">
      <input 
        type="text"
        placeholder={placeholder}
        className="w-full px-4 py-3 pl-12 border-6 border-black rounded-xl font-bold placeholder:text-black/30 shadow-[4px_4px_0px_0px_black] focus:shadow-[6px_6px_0px_0px_black] focus:outline-none transition-all"
      />
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-black/50">
          {icon}
        </div>
      )}
    </div>
  </div>
);

// --- DROPDOWN SELECT ---

const DropdownSelect: React.FC<{ options: string[]; label?: string }> = ({ 
  options,
  label = 'SELECT' 
}) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(options[0]);
  
  return (
    <div className="relative space-y-2">
      <label className="font-black text-xs uppercase text-black/60">{label}</label>
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 border-6 border-black rounded-xl font-black bg-white shadow-[4px_4px_0px_0px_black] flex items-center justify-between hover:shadow-[6px_6px_0px_0px_black] transition-all"
      >
        <span>{selected}</span>
        <div className={`transition-transform ${open ? 'rotate-180' : ''}`}>▼</div>
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 border-6 border-black rounded-xl bg-white shadow-[6px_6px_0px_0px_black] overflow-hidden z-50">
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => { setSelected(opt); setOpen(false); }}
              className="w-full px-4 py-3 font-black text-left hover:bg-cyan-200 border-b-4 border-black last:border-0 transition-colors"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// --- BADGE ---

const Badge: React.FC<{ label: string; color?: string }> = ({ 
  label,
  color = COLORS.orange 
}) => (
  <div 
    className="inline-flex px-3 py-1 border-4 border-black rounded-full font-black text-xs uppercase shadow-[2px_2px_0px_0px_black]"
    style={{ backgroundColor: color }}
  >
    {label}
  </div>
);

// ==========================================
// TASK 2: GROUPED COMPOSITIONS
// ==========================================

// --- COMPOSITION 1: Analytics Matrix (4 Units Tall) ---

const AnalyticsMatrix: React.FC = () => {
  const stats = [
    { label: 'VIEWS', value: '1.2M', color: COLORS.cyan },
    { label: 'LIKES', value: '45K', color: COLORS.pink },
    { label: 'SHARES', value: '892', color: COLORS.orange },
    { label: 'SUBS', value: '12K', color: COLORS.lime },
  ];
  
  return (
    <SubToolbox openUnits={4} bgColor="bg-gradient-to-br from-purple-100 to-pink-100">
      <div className="h-full flex flex-col gap-4">
        <h2 className="font-black text-xl uppercase">ANALYTICS MATRIX</h2>
        
        {/* Mini KPI Grid */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, i) => (
            <div 
              key={i}
              className="border-6 border-black rounded-xl p-3 shadow-[4px_4px_0px_0px_black]"
              style={{ backgroundColor: stat.color }}
            >
              <div className="font-black text-xs uppercase text-black/70">{stat.label}</div>
              <div className="font-[1000] text-3xl">{stat.value}</div>
            </div>
          ))}
        </div>
        
        {/* Histogram */}
        <div className="flex-1 border-6 border-black rounded-xl bg-white p-4 shadow-[6px_6px_0px_0px_black]">
          <div className="h-full flex items-end justify-around gap-2">
            {[60, 85, 45, 95, 70, 55, 80].map((height, i) => (
              <div 
                key={i}
                className="flex-1 border-4 border-black rounded-t-lg transition-all hover:opacity-80 cursor-pointer"
                style={{ 
                  height: `${height}%`,
                  backgroundColor: i === 3 ? COLORS.pink : COLORS.cyan
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Vibe Heatmap + Sentiment Slider */}
        <div className="grid grid-cols-2 gap-4">
          <div className="border-6 border-black rounded-xl bg-white p-3 shadow-[4px_4px_0px_0px_black]">
            <div className="font-black text-xs uppercase mb-2">ENGAGEMENT HEAT</div>
            <div className="grid grid-cols-4 gap-1">
              {Array.from({ length: 16 }).map((_, i) => {
                const intensity = Math.random();
                return (
                  <div 
                    key={i}
                    className="aspect-square border-2 border-black rounded"
                    style={{ 
                      backgroundColor: intensity > 0.7 ? COLORS.pink : 
                                       intensity > 0.4 ? COLORS.orange : 
                                       intensity > 0.2 ? COLORS.yellow : '#eee'
                    }}
                  />
                );
              })}
            </div>
          </div>
          
          <div className="border-6 border-black rounded-xl bg-white p-3 shadow-[4px_4px_0px_0px_black]">
            <SliderThinPill label="SENTIMENT" value={75} color={COLORS.lime} />
          </div>
        </div>
      </div>
    </SubToolbox>
  );
};

// --- COMPOSITION 2: Content Controller (3 Units Tall) ---

const ContentController: React.FC = () => {
  const [joyX, setJoyX] = useState(50);
  const [joyY, setJoyY] = useState(50);
  
  return (
    <SubToolbox openUnits={3} bgColor="bg-gradient-to-br from-cyan-100 to-blue-100">
      <div className="h-full flex flex-col gap-4">
        <h2 className="font-black text-xl uppercase">CONTENT CONTROLLER</h2>
        
        <div className="flex-1 grid grid-cols-3 gap-4">
          {/* Mechanical Joystick XY-Pad */}
          <div className="col-span-2 border-6 border-black rounded-2xl bg-gradient-to-br from-gray-700 to-gray-900 p-4 shadow-[6px_6px_0px_0px_black] relative">
            <div className="absolute top-3 left-3 font-black text-xs text-white/50 uppercase">XY PAD</div>
            <div className="w-full h-full relative bg-white/10 border-4 border-white/20 rounded-xl overflow-hidden">
              {/* Grid Pattern */}
              <div className="absolute inset-0" style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }} />
              
              {/* Crosshair */}
              <div className="absolute inset-0">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/30" />
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/30" />
              </div>
              
              {/* Joystick Handle */}
              <div 
                className="absolute w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 border-6 border-white rounded-full cursor-grab active:cursor-grabbing shadow-[0_0_20px_rgba(255,116,151,0.6)] flex items-center justify-center"
                style={{ 
                  left: `calc(${joyX}% - 24px)`,
                  top: `calc(${joyY}% - 24px)` 
                }}
              >
                <div className="w-4 h-4 bg-white rounded-full" />
              </div>
              
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={joyX}
                onChange={(e) => setJoyX(Number(e.target.value))}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            
            {/* Coordinates Display */}
            <div className="absolute bottom-3 right-3 flex gap-2">
              <div className="px-2 py-1 bg-black/80 border-2 border-white/50 rounded font-black text-xs text-white">
                X: {joyX}
              </div>
              <div className="px-2 py-1 bg-black/80 border-2 border-white/50 rounded font-black text-xs text-white">
                Y: {joyY}
              </div>
            </div>
          </div>
          
          {/* Dial Knobs */}
          <div className="flex flex-col justify-around items-center gap-3">
            <KnobDialPointer label="DEPTH" color={COLORS.purple} />
            <KnobNestedRing label="CLARITY" value={80} />
          </div>
        </div>
        
        {/* Status LED Bank */}
        <div className="flex items-center justify-around border-6 border-black rounded-xl bg-gray-800 p-3 shadow-[6px_6px_0px_0px_black]">
          <StatusLED active={true} color={COLORS.lime} label="LIVE" />
          <StatusLED active={false} color={COLORS.orange} label="REC" />
          <StatusLED active={true} color={COLORS.cyan} label="SYNC" />
        </div>
      </div>
    </SubToolbox>
  );
};

// --- COMPOSITION 3: Media Strip (2 Units Tall) ---

const MediaStrip: React.FC = () => {
  const [playhead, setPlayhead] = useState(35);
  const keyframes = [10, 25, 45, 70, 85];
  
  return (
    <SubToolbox openUnits={2} bgColor="bg-gradient-to-br from-yellow-100 to-orange-100">
      <div className="h-full flex flex-col gap-4">
        <h2 className="font-black text-xl uppercase">MEDIA TIMELINE</h2>
        
        {/* Video Scrubber with Keyframe Markers */}
        <div className="space-y-3">
          <div className="relative h-16 border-6 border-black rounded-2xl bg-white overflow-hidden shadow-[6px_6px_0px_0px_black]">
            {/* Timeline Background */}
            <div className="absolute inset-0 flex">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="flex-1 border-r-2 border-black/10" />
              ))}
            </div>
            
            {/* Keyframe Markers */}
            {keyframes.map((pos, i) => (
              <div 
                key={i}
                className="absolute top-2 w-3 h-3 bg-orange-400 border-2 border-black rounded-sm cursor-pointer hover:scale-125 transition-transform"
                style={{ left: `${pos}%` }}
              />
            ))}
            
            {/* Playhead */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-pink-500 border-x-2 border-black"
              style={{ left: `${playhead}%` }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-pink-500 border-2 border-black rotate-45" />
            </div>
            
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={playhead}
              onChange={(e) => setPlayhead(Number(e.target.value))}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <ButtonIcon icon={<Play size={20} />} color={COLORS.lime} />
              <ButtonIcon icon={<Pause size={20} />} color={COLORS.orange} />
              <ButtonIcon icon={<SkipForward size={20} />} color={COLORS.cyan} />
            </div>
            
            <div className="flex gap-2">
              <button className="px-4 py-2 border-4 border-black rounded-lg font-black uppercase text-xs bg-purple-300 shadow-[4px_4px_0px_0px_black] hover:shadow-[6px_6px_0px_0px_black] transition-all">
                TRIM
              </button>
              <button className="px-4 py-2 border-4 border-black rounded-lg font-black uppercase text-xs bg-cyan-300 shadow-[4px_4px_0px_0px_black] hover:shadow-[6px_6px_0px_0px_black] transition-all">
                + MARKER
              </button>
            </div>
          </div>
        </div>
      </div>
    </SubToolbox>
  );
};

// --- COMPOSITION 4: User Portal (3 Units Tall) ---

const UserPortal: React.FC = () => {
  return (
    <SubToolbox openUnits={3} bgColor="bg-gradient-to-br from-pink-100 to-purple-100">
      <div className="h-full flex flex-col gap-4">
        <h2 className="font-black text-xl uppercase">USER PORTAL</h2>
        
        {/* Profile Card */}
        <div className="border-6 border-black rounded-2xl bg-white p-4 shadow-[6px_6px_0px_0px_black] flex items-center gap-4">
          <div className="w-20 h-20 border-6 border-black rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
            <User size={40} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-black text-xl">PLAYER_001</h3>
            <div className="flex gap-2 mt-2">
              <Badge label="PRO" color={COLORS.lime} />
              <Badge label="VERIFIED" color={COLORS.cyan} />
            </div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard value="156" label="POSTS" icon={<MessageCircle size={16} />} color={COLORS.pink} />
          <StatCard value="2.4K" label="FOLLOWS" icon={<Users size={16} />} color={COLORS.cyan} />
          <StatCard value="98%" label="SCORE" icon={<Star size={16} />} color={COLORS.yellow} />
        </div>
        
        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <ButtonPrimary label="MESSAGE" icon={<Send size={18} />} color={COLORS.purple} />
          <ButtonPrimary label="FOLLOW" icon={<Heart size={18} />} color={COLORS.pink} />
        </div>
      </div>
    </SubToolbox>
  );
};

// --- COMPOSITION 5: System Monitor (3 Units Tall) - INVERTED ---

const SystemMonitor: React.FC = () => {
  return (
    <SubToolbox openUnits={3} bgColor="bg-black">
      <div className="h-full flex flex-col gap-4">
        <h2 className="font-black text-xl uppercase text-lime-400">SYSTEM MONITOR</h2>
        
        {/* CPU/RAM Meters */}
        <div className="space-y-3">
          <SliderThinPill label="CPU LOAD" value={68} color={COLORS.cyan} inverted={true} />
          <SliderThinPill label="RAM USAGE" value={42} color={COLORS.pink} inverted={true} />
          <SliderThinPill label="GPU TEMP" value={85} color={COLORS.orange} inverted={true} />
        </div>
        
        {/* Network Status */}
        <div className="border-6 border-lime-400 rounded-xl bg-gray-900 p-4 shadow-[6px_6px_0px_0px_rgba(201,248,48,0.5)]">
          <div className="flex items-center justify-between mb-3">
            <span className="font-black text-sm text-white uppercase">NETWORK</span>
            <Wifi className="text-lime-400" size={24} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs font-black text-white/50">UPLOAD</div>
              <div className="text-2xl font-[1000] text-lime-400">↑ 2.4MB/s</div>
            </div>
            <div>
              <div className="text-xs font-black text-white/50">DOWNLOAD</div>
              <div className="text-2xl font-[1000] text-cyan-400">↓ 15MB/s</div>
            </div>
          </div>
        </div>
        
        {/* Status Indicators */}
        <div className="flex justify-around">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full border-4 border-lime-400 bg-lime-400 shadow-[0_0_20px_rgba(201,248,48,0.8)]" />
            <span className="font-black text-xs text-white">ONLINE</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full border-4 border-cyan-400 bg-cyan-400 shadow-[0_0_20px_rgba(36,211,255,0.8)]" />
            <span className="font-black text-xs text-white">SYNCED</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full border-4 border-pink-400 bg-pink-400 shadow-[0_0_20px_rgba(255,116,151,0.8)]" />
            <span className="font-black text-xs text-white">ACTIVE</span>
          </div>
        </div>
      </div>
    </SubToolbox>
  );
};

// --- COMPOSITION 6: Audio Mixer (4 Units Tall) ---

const AudioMixer: React.FC = () => {
  return (
    <SubToolbox openUnits={4} bgColor="bg-gradient-to-br from-orange-100 to-yellow-100">
      <div className="h-full flex flex-col gap-4">
        <h2 className="font-black text-xl uppercase">AUDIO MIXER</h2>
        
        <div className="flex-1 grid grid-cols-4 gap-3">
          {/* Channel Strips */}
          {[
            { label: 'VOCALS', color: COLORS.pink },
            { label: 'GUITAR', color: COLORS.cyan },
            { label: 'DRUMS', color: COLORS.orange },
            { label: 'BASS', color: COLORS.purple },
          ].map((channel, i) => (
            <div key={i} className="flex flex-col gap-2 border-6 border-black rounded-xl bg-white p-3 shadow-[4px_4px_0px_0px_black]">
              <div className="font-black text-xs uppercase text-center" style={{ color: channel.color }}>
                {channel.label}
              </div>
              
              {/* Vertical Fader */}
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="relative w-12 h-full min-h-[120px] border-6 border-black rounded-full bg-gray-200 overflow-hidden">
                  <div 
                    className="absolute bottom-0 left-0 right-0 transition-all"
                    style={{ 
                      height: '60%',
                      backgroundColor: channel.color 
                    }}
                  />
                  <div className="absolute top-[40%] left-0 right-0 h-4 bg-white border-y-4 border-black cursor-grab active:cursor-grabbing" />
                </div>
              </div>
              
              {/* Mute/Solo */}
              <div className="flex gap-1">
                <button className="flex-1 py-1 border-4 border-black rounded font-black text-xs bg-red-300 hover:bg-red-400">
                  M
                </button>
                <button className="flex-1 py-1 border-4 border-black rounded font-black text-xs bg-yellow-300 hover:bg-yellow-400">
                  S
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Master Section */}
        <div className="border-6 border-black rounded-xl bg-gradient-to-r from-purple-300 to-pink-300 p-4 shadow-[6px_6px_0px_0px_black] flex items-center gap-4">
          <div className="flex-1">
            <div className="font-black text-sm uppercase mb-2">MASTER OUTPUT</div>
            <SliderChunky value={75} label="VOLUME" color={COLORS.purple} />
          </div>
          <div className="flex flex-col gap-2">
            <ButtonIcon icon={<Volume2 size={20} />} color={COLORS.lime} />
            <ButtonIcon icon={<Settings size={20} />} color={COLORS.cyan} />
          </div>
        </div>
      </div>
    </SubToolbox>
  );
};

// ==========================================
// MAIN VIEWTUBE APP
// ==========================================

export default function ViewTubeNeoBrutalist() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-200 to-cyan-200 p-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* Hero Header */}
        <div className="border-6 border-black rounded-3xl bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 p-8 shadow-[12px_12px_0px_0px_black]">
          <h1 className="font-black text-6xl uppercase mb-2">VIEWTUBE</h1>
          <p className="font-bold text-xl">Neo-Brutalist Design System • Video Game Console Aesthetics</p>
        </div>
        
        {/* Atomic Components Showcase */}
        <div className="border-6 border-black rounded-3xl bg-white p-8 shadow-[8px_8px_0px_0px_black]">
          <h2 className="font-black text-3xl uppercase mb-6">ATOMIC COMPONENTS</h2>
          
          {/* Sliders */}
          <div className="mb-8">
            <h3 className="font-black text-xl uppercase mb-4 text-cyan-600">SLIDERS</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border-4 border-black rounded-xl bg-gray-50 p-4">
                <SliderThinPill label="THIN PILL" value={65} color={COLORS.cyan} />
              </div>
              <div className="border-4 border-black rounded-xl bg-gray-50 p-4">
                <SliderChunky label="CHUNKY TRACK" value={80} color={COLORS.orange} />
              </div>
              <div className="border-4 border-black rounded-xl bg-gray-50 p-4">
                <SliderMultiHandle label="MULTI-HANDLE" />
              </div>
            </div>
          </div>
          
          {/* Toggles */}
          <div className="mb-8">
            <h3 className="font-black text-xl uppercase mb-4 text-pink-600">TOGGLE SWITCHES</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border-4 border-black rounded-xl bg-gray-50 p-4 flex items-center justify-center">
                <ToggleMechanical label="MECHANICAL" />
              </div>
              <div className="border-4 border-black rounded-xl bg-gray-50 p-4 flex items-center justify-center">
                <ToggleGlowCircle label="GLOW CIRCLE" color={COLORS.pink} />
              </div>
              <div className="border-4 border-black rounded-xl bg-gray-50 p-4 flex items-center justify-center">
                <ToggleTextPill labelOff="DISABLED" labelOn="ENABLED" />
              </div>
            </div>
          </div>
          
          {/* Checkboxes */}
          <div className="mb-8">
            <h3 className="font-black text-xl uppercase mb-4 text-purple-600">CHECKBOXES</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border-4 border-black rounded-xl bg-gray-50 p-4 flex items-center justify-center">
                <CheckboxChunky label="CHUNKY SQUARE" />
              </div>
              <div className="border-4 border-black rounded-xl bg-gray-50 p-4 flex items-center justify-center">
                <CheckboxCircleDot label="CIRCLE DOT" />
              </div>
              <div className="border-4 border-black rounded-xl bg-gray-50 p-4 flex items-center justify-center">
                <CheckboxIndented label="DEPTH BOX" />
              </div>
            </div>
          </div>
          
          {/* Knobs */}
          <div className="mb-8">
            <h3 className="font-black text-xl uppercase mb-4 text-orange-600">KNOBS & DIALS</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border-4 border-black rounded-xl bg-gray-50 p-4 flex items-center justify-center">
                <KnobNestedRing label="NESTED RING" value={65} />
              </div>
              <div className="border-4 border-black rounded-xl bg-gray-50 p-4 flex items-center justify-center">
                <KnobDialPointer label="DIAL POINTER" color={COLORS.cyan} />
              </div>
              <div className="border-4 border-black rounded-xl bg-gray-50 p-4 flex items-center justify-center">
                <KnobScrollWheel label="SCROLL WHEEL" />
              </div>
            </div>
          </div>
          
          {/* Additional Components */}
          <div>
            <h3 className="font-black text-xl uppercase mb-4 text-lime-600">ADDITIONAL ELEMENTS</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border-4 border-black rounded-xl bg-gray-50 p-4">
                <InputField label="USERNAME" placeholder="Enter username..." icon={<User size={20} />} />
              </div>
              <div className="border-4 border-black rounded-xl bg-gray-50 p-4">
                <DropdownSelect label="QUALITY" options={['1080p', '720p', '480p', '360p']} />
              </div>
              <div className="border-4 border-black rounded-xl bg-gray-50 p-4">
                <ProgressBar value={68} label="ENCODING" color={COLORS.lime} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Grouped Compositions */}
        <div className="space-y-6">
          <h2 className="font-black text-3xl uppercase border-6 border-black rounded-2xl bg-yellow-300 p-4 shadow-[8px_8px_0px_0px_black]">
            FUNCTIONAL PORTALS
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnalyticsMatrix />
            <ContentController />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MediaStrip />
            <UserPortal />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SystemMonitor />
            <AudioMixer />
          </div>
        </div>
        
        {/* Footer */}
        <div className="border-6 border-black rounded-3xl bg-gradient-to-r from-lime-400 to-cyan-400 p-6 shadow-[8px_8px_0px_0px_black] text-center">
          <p className="font-black text-2xl uppercase">30+ WILD COMPONENTS • STRICT GRID LAWS • VIDEO PORTAL AESTHETICS</p>
          <div className="flex justify-center gap-3 mt-4">
            <Badge label="60PX GRID" color={COLORS.pink} />
            <Badge label="24PX GAPS" color={COLORS.cyan} />
            <Badge label="6PX BORDERS" color={COLORS.orange} />
            <Badge label="NEON VIBES" color={COLORS.purple} />
          </div>
        </div>
      </div>
    </div>
  );
}
