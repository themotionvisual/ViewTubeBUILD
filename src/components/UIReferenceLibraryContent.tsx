import React, { useState } from "react"
import { CustomIcon } from "../components/CustomIcon"
import { AccordionContainer } from "./Toolbox"
import { ErrorBoundary } from "../components/ErrorBoundary"
import { NativeUIKit } from "../components/NativeUIKit"
import { SprocketHoles } from "../components/SprocketHoles"
import {
 Box,
 Check,
 ChevronDown,
 Upload,
 Activity,
 Sparkles,
 X,
 Settings2,
 Image as ImageIcon,
 TrendingUp,
 Trash2,
 Search,
 Zap,
 AlertTriangle,
 Info,
 Layers,
 BarChart3,
 Globe,
 Smartphone,
 PieChart,
 DollarSign,
 Palette,
 MessageSquare,
 RefreshCw,
 FileCode,
 Layout,
 MousePointer2,
 Calendar,
 CheckSquare,
 Type,
 List,
 ChevronRight,
 Star,
 Copy,
 Sliders,
 Database,
 AlignLeft,
} from "lucide-react"
import {
 referenceStudioImportPacks,
 externalStyleReferences,
 curatedTopPicks,
 toolboxBaselineCoverage,
} from "../data/referenceStudioImports"
import {
 getLiveCanvasOptions,
 getLiveCanvasSpec,
} from "../data/liveCanvasRegistry"
import {
 StyleChipRow,
 Toggle,
 Checkbox,
 Radio,
 FormField,
 KPIStatRow,
 DailyStats,
 Sidebar,
 ChannelTree,
 TooltipSimple,
 Modal,
 VideoCardGrid,
} from "./ui"
import { StandardInput } from "./StandardInput"
import { StandardDropdown } from "./StandardDropdown"
import { StandardKPI } from "./StandardKPI"
import { StandardButton } from "./StandardButton"

interface LibraryManifestEntry {
 group: string
 path: string
 url: string
 ext: string
}

interface LibraryManifest {
 generatedAt: string
 totals: {
  local: number
  imported: number
  all: number
 }
 external: LibraryManifestEntry[]
 local: LibraryManifestEntry[]
 imported: LibraryManifestEntry[]
}

// ============================================================================
// ELITE TOOL BLOCK (Standardized Neo-Brutalist Tool Wrapper)
// ============================================================================
const EliteToolBlock = ({
 title,
 icon: Icon,
 headerColor,
 iconBgColor,
 headerText = "text-black",
 children,
}: any) => {
 const [isOpen, setIsOpen] = useState(true)
 return (
  <>
   <div className="w-full bg-white border-[5px] border-black rounded-2xl shadow-[12px_12px_0px_0px_black] overflow-hidden flex flex-col transition-all duration-700 mb-12">
    <header
     className={`${headerColor} h-[80px] flex items-center justify-between px-0 overflow-hidden transition-all duration-700 ${isOpen ? "border-b-[5px] border-black" : ""}`}>
     <div
      onClick={() => setIsOpen(!isOpen)}
      className="flex items-center h-full cursor-pointer flex-1 min-w-0">
      <div
       className={`${iconBgColor} h-full w-[80px] flex items-center justify-center border-r-[5px] border-black flex-shrink-0`}>
       <Icon size={40} strokeWidth={3} className="text-black" />
      </div>
      <h1
       className={`text-[30px] md:text-[50px] font-[1000] uppercase tracking-tighter pl-8 leading-none truncate ${headerText}`}>
       {title}
      </h1>
     </div>
     <div className="flex items-center gap-6 pr-6 flex-shrink-0">
      <div
       onClick={() => setIsOpen(!isOpen)}
       className={`cursor-pointer transition-all duration-700 ease-in-out transform ${isOpen ? "rotate-180 scale-110" : "rotate-0 scale-100"}`}>
       <CustomIcon
        name={isOpen ? "SYMBOLS 19" : "SYMBOLS 22"}
        size={48}
        className="opacity-80 hover:opacity-100 transition-opacity hidden md:block"
       />
      </div>
     </div>
    </header>
    <div
     className={`grid transition-all duration-1000 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
     <div className="overflow-hidden">
      <div className="p-8 bg-gray-50 flex flex-col gap-8">{children}</div>
     </div>
    </div>
   </div>
  </>
 )
}

// ============================================================================
// FUNCTIONAL SUB-COMPONENTS FOR SECTION E
// ============================================================================

const ColorPaletteSelector = () => {
 const [colors, setColors] = useState([
  "#FF3399",
  "#CCFF00",
  "#00CCFF",
  "#FFDD00",
  "#B14AED",
 ])
 return (
  <div className="flex justify-between items-start gap-4">
   {colors.map((c, i) => (
   <div key={i} className="flex flex-col items-center gap-3 flex-1">
     <div
      style={{ backgroundColor: c }}
      className="w-full aspect-square border-[4px] border-black rounded-2xl shadow-[6px_6px_0px_0px_black] relative overflow-hidden group cursor-pointer hover:-translate-y-1 transition-transform">
      <input
       type="color"
       value={c}
       onChange={(e) => {
        const n = [...colors]
        n[i] = e.target.value
        setColors(n)
       }}
       className="absolute inset-0 opacity-0 cursor-pointer"
      />
      <div className="absolute inset-x-0 bottom-0 bg-black/20 h-1/3 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-black text-white text-[10px]">
       EDIT
      </div>
     </div>
     <input
      value={c}
      onChange={(e) => {
       const n = [...colors]
       n[i] = e.target.value
       setColors(n)
      }}
      className="w-full bg-white border-[3px] border-black rounded-lg p-2 text-xs font-black text-center uppercase shadow-[2px_2px_0px_0px_black]"
   />
  </div>
 ))}
 </div>
 )
}

const StyleCategoryGrid = () => {
 const styles = [
  "Neo-Brutalist",
  "Cyberpunk",
  "Minimalist",
  "Corporate",
  "Vibrant",
  "Dark Mode",
  "Cinematic",
  "Clickbait",
 ]
 const [selected, setSelected] = useState<string[]>(["Neo-Brutalist"])
 const toggle = (s: string) =>
  setSelected((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]))
 return (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
   {styles.map((s) => (
    <button
     key={s}
     onClick={() => toggle(s)}
     className={`p-4 border-[4px] border-black rounded-2xl font-[1000] uppercase text-sm transition-all ${selected.includes(s) ? "bg-black text-[#CCFF00] shadow-none translate-y-1 translate-x-1" : "bg-white text-black shadow-[6px_6px_0px_0px_black] hover:bg-gray-50"}`}>
     {s}
    </button>
   ))}
  </div>
 )
}

const CustomChartsEngine = () => {
 const [barData, setBarData] = useState([40, 70, 45, 90, 65, 80, 55, 95])
 const randomize = () =>
  setBarData(barData.map(() => Math.floor(Math.random() * 80) + 20))
 return (
  <div className="space-y-8">
   <div className="flex justify-between items-center bg-black text-white p-4 border-[4px] border-black rounded-2xl shadow-[8px_8px_0px_0px_#00CCFF]">
    <h4 className="font-black uppercase tracking-widest text-sm text-[#00CCFF]">
     HTML/CSS Bar Chart Engine
    </h4>
    <button
     onClick={randomize}
     className="bg-[#00CCFF] text-black px-4 py-2 rounded-lg font-black text-xs uppercase shadow-[2px_2px_0_0_white] hover:shadow-none hover:translate-y-1 transition-all">
     Randomize
    </button>
   </div>
   <div className="h-48 flex items-end gap-3 px-2 border-b-[4px] border-l-[4px] border-black pb-1 pl-4 relative">
    {barData.map((h, i) => (
     <div
      key={i}
      className="flex-1 bg-[#FF3399] border-[3px] border-black rounded-t-xl transition-all duration-500 hover:bg-[#CCFF00] group relative"
      style={{ height: `${h}%` }}>
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white font-black text-[10px] px-2 py-1 rounded border-2 border-black opacity-0 group-hover:opacity-100 transition-opacity shadow-[2px_2px_0_0_#CCFF00] z-10">
       {h}%
      </div>
     </div>
    ))}
   </div>
   <div className="h-48 border-[4px] border-black rounded-2xl bg-gray-50 relative overflow-hidden shadow-inner">
    <div className="absolute top-4 left-4 font-black uppercase text-xs text-black/40">
     Scatter Matrix
    </div>
    {barData.map((h, i) => (
     <div
      key={i}
      className="absolute w-6 h-6 rounded-full bg-[#00CCFF] border-[3px] border-black shadow-[2px_2px_0_0_black] hover:scale-125 transition-transform"
      style={{ left: `${(i / barData.length) * 100 + 5}%`, bottom: `${h}%` }}
     />
    ))}
    <svg
     className="absolute inset-0 w-full h-full pointer-events-none"
     viewBox="0 0 100 100"
     preserveAspectRatio="none">
     <polyline
      points={barData
       .map((h, i) => `${(i / barData.length) * 100 + 5},${100 - h}`)
       .join(" ")}
      fill="none"
      stroke="black"
      strokeWidth="4"
      strokeLinejoin="round"
      strokeDasharray="8 8"
      className="opacity-20"
     />
    </svg>
   </div>
  </div>
 )
}

const CalendarAndTasks = () => {
 const [tasks, setTasks] = useState([
  { id: 1, text: "Review Script Draft", done: true },
  { id: 2, text: "Generate Thumbnail A/B", done: false },
 ])
 const toggleTask = (id: number) =>
  setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
 return (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
   <div className="bg-white border-[4px] border-black rounded-3xl p-6 shadow-[8px_8px_0px_0px_black]">
    <h4 className="font-black uppercase tracking-widest text-sm mb-4 border-b-4 border-black pb-2">
     Sector Grid
    </h4>
    <div className="grid grid-cols-7 gap-2">
     {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
      <div key={i} className="text-center font-black text-[10px] text-black/40">
       {d}
      </div>
     ))}
     {Array.from({ length: 14 }).map((_, i) => (
      <div
       key={i}
       className={`aspect-square border-[3px] border-black rounded-lg flex items-center justify-center font-bold text-xs cursor-pointer hover:scale-110 transition-transform ${i === 4 ? "bg-black text-[#CCFF00] shadow-[2px_2px_0_0_#CCFF00]" : i === 8 ? "bg-[#FF3399] text-white shadow-[2px_2px_0_0_black]" : "bg-gray-50"}`}>
       {i + 1}
      </div>
     ))}
    </div>
   </div>
    <div className="space-y-4">
      <EliteToolBlock 
        title="Standard Component Set" 
        icon={Box} 
        headerColor="bg-[#CCFF00]" 
        iconBgColor="bg-white"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
             <label className="text-[10px] font-black uppercase tracking-widest text-black/50">Standard Input</label>
             <StandardInput placeholder="Type something..." />
          </div>
          <div className="space-y-4">
             <label className="text-[10px] font-black uppercase tracking-widest text-black/50">Standard Dropdown</label>
             <StandardDropdown 
                value="1" 
                onChange={() => {}} 
                options={[{label: "Option 1", value: "1"}, {label: "Option 2", value: "2"}]} 
              />
          </div>
          <div className="space-y-4">
             <label className="text-[10px] font-black uppercase tracking-widest text-black/50">Standard KPI</label>
             <StandardKPI label="Viral Score" value="88" trend="↑ 12%" />
          </div>
          <div className="space-y-4">
             <label className="text-[10px] font-black uppercase tracking-widest text-black/50">Standard Button</label>
             <StandardButton>Action Button</StandardButton>
          </div>
        </div>
      </EliteToolBlock>
    </div>
  </div>
 )
}

const NestedTables = () => {
 const [expanded, setExpanded] = useState<number | null>(1)
 return (
  <div className="bg-white border-[5px] border-black rounded-[24px] overflow-hidden shadow-[12px_12px_0px_0px_black]">
   <div className="bg-[#B14AED] p-6 border-b-[5px] border-black flex justify-between items-center text-white">
    <h3 className="font-[1000] uppercase text-2xl tracking-tighter">
     Deep Data Hierarchy
    </h3>
   </div>
   <table className="w-full text-left border-collapse">
    <thead className="bg-black text-[#CCFF00] font-black uppercase text-xs tracking-widest">
     <tr>
      <th className="p-4 border-r-2 border-white/20">Master Project</th>
      <th className="p-4 border-r-2 border-white/20">Status</th>
      <th className="p-4">Action</th>
     </tr>
    </thead>
    <tbody>
     {[1, 2].map((i) => (
      <React.Fragment key={i}>
       <tr
        className="border-b-[4px] border-black bg-white hover:bg-gray-50 transition-colors cursor-pointer"
        onClick={() => setExpanded(expanded === i ? null : i)}>
        <td className="p-4 border-r-[4px] border-black font-[1000] uppercase text-lg">
         Campaign Alpha {i}
        </td>
        <td className="p-4 border-r-[4px] border-black">
         <span className="bg-[#CCFF00] border-2 border-black px-3 py-1 rounded-lg text-[10px] font-black uppercase">
          Active
         </span>
        </td>
        <td className="p-4">
         <ChevronRight
          className={`transition-transform ${expanded === i ? "rotate-90" : ""}`}
         />
        </td>
       </tr>
       {expanded === i && (
        <tr className="border-b-[4px] border-black bg-gray-100">
         <td colSpan={3} className="p-6">
          <div className="bg-white border-[3px] border-black rounded-xl overflow-hidden shadow-[4px_4px_0_0_black]">
           <div className="bg-[#00CCFF] p-3 border-b-[3px] border-black font-black uppercase text-[10px]">
            Sub-Assets
           </div>
           <table className="w-full text-[10px] font-bold uppercase">
            <tbody>
             <tr className="border-b-2 border-black/10">
              <td className="p-3 border-r-2 border-black/10">Thumbnail.png</td>
              <td className="p-3">2.4MB</td>
             </tr>
             <tr>
              <td className="p-3 border-r-2 border-black/10">Script_V2.txt</td>
              <td className="p-3">12KB</td>
             </tr>
            </tbody>
           </table>
          </div>
         </td>
        </tr>
       )}
      </React.Fragment>
     ))}
    </tbody>
   </table>
  </div>
 )
}

const InputAndTextFoundry = () => {
 const [copied, setCopied] = useState(false)
 const handleCopy = () => {
  setCopied(true)
  setTimeout(() => setCopied(false), 2000)
 }
 return (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
   <div className="space-y-6">
    <div className="space-y-2">
     <label className="text-[10px] font-black uppercase tracking-widest text-black/50 ml-2">
      Floating Label Input
     </label>
     <input
      type="text"
      placeholder="FOCUS OUTLINE..."
      className="w-full bg-white border-[4px] border-black rounded-2xl p-5 font-black uppercase text-lg outline-none focus:ring-4 focus:ring-[#FF3399]/30 transition-all shadow-[6px_6px_0px_0px_black]"
     />
    </div>
    <div className="space-y-2">
     <label className="text-[10px] font-black uppercase tracking-widest text-black/50 ml-2">
      Search with Adornment
     </label>
     <div className="relative">
      <Search
       className="absolute left-5 top-1/2 -translate-y-1/2 text-black/40"
       size={24}
      />
      <input
       type="text"
       placeholder="QUERY DATABANK..."
       className="w-full bg-gray-100 border-[4px] border-black rounded-2xl p-5 pl-14 font-black uppercase text-lg outline-none focus:bg-white transition-all shadow-[6px_6px_0px_0px_black]"
      />
     </div>
    </div>
   </div>
   <div className="space-y-6">
    <div className="space-y-2">
     <label className="text-[10px] font-black uppercase tracking-widest text-black/50 ml-2">
      Copy Button Input
     </label>
     <div className="flex bg-white border-[4px] border-black rounded-2xl shadow-[6px_6px_0px_0px_black] p-1 overflow-hidden">
      <input
       type="text"
       value="https://viewtube.os/sync/alpha"
       readOnly
       className="flex-1 bg-transparent p-4 font-bold text-sm outline-none text-black/60"
      />
      <button
       onClick={handleCopy}
       className="bg-black text-[#CCFF00] px-6 rounded-xl font-black uppercase text-xs hover:bg-gray-800 transition-colors flex items-center gap-2 m-1">
       {copied ? <Check size={16} /> : <Copy size={16} />}{" "}
       {copied ? "COPIED" : "COPY"}
      </button>
     </div>
    </div>
    <div className="space-y-2">
     <div className="flex justify-between items-end ml-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-black/50">
       Auto-Expanding Area
      </label>
      <span className="text-[10px] font-black opacity-30">HTML / MD</span>
     </div>
     <textarea
      placeholder="Write documentation here..."
      className="w-full h-32 bg-[#CCFF00]/10 border-[4px] border-black rounded-2xl p-5 font-medium text-sm outline-none resize-none focus:bg-[#CCFF00]/20 transition-all shadow-[6px_6px_0px_0px_black]"
     />
    </div>
   </div>
  </div>
 )
}

const VisualSlidersAndRings = () => {
 const [val1, setVal1] = useState(65)
 const [val2, setVal2] = useState(30)
 return (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center ui-library-slider-scope">
   <style>{`
           .ui-library-slider-scope .vt-slider { -webkit-appearance: none; appearance: none; background: transparent; outline: none; }
           .ui-library-slider-scope .vt-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 32px; height: 32px; border: 4px solid black; border-radius: 50%; background: #FF3399; cursor: pointer; box-shadow: 2px 2px 0 0 black; margin-top: -12px; }
           .ui-library-slider-scope .vt-slider::-webkit-slider-runnable-track { width: 100%; height: 8px; cursor: pointer; background: black; border-radius: 4px; border: 2px solid black; }
        `}</style>   <div className="space-y-12 bg-white border-[4px] border-black rounded-3xl p-8 shadow-[8px_8px_0_0_black]">
    <div className="space-y-6">
     <div className="flex justify-between font-[1000] text-2xl uppercase tracking-tighter">
      <span className="text-black">Velocity</span>
      <span className="text-[#FF3399]">{val1}%</span>
     </div>
     <input
      type="range"
      min="0"
      max="100"
      value={val1}
      onChange={(e) => setVal1(Number(e.target.value))}
      className="vt-slider w-full"
     />
    </div>
    <div className="space-y-4">
     <div className="flex justify-between font-black text-xs uppercase tracking-widest text-black/50">
      <span>Storage Limit</span>
      <span>{val2} / 100 GB</span>
     </div>
     <div className="h-8 bg-gray-200 border-[4px] border-black rounded-full overflow-hidden shadow-inner flex relative">
      <div
       className="bg-[#00CCFF] h-full border-r-[4px] border-black transition-all duration-300"
       style={{ width: `${val2}%` }}
      />
     </div>
    </div>
   </div>
   <div className="flex justify-center items-center gap-12 bg-black border-[4px] border-black rounded-3xl p-8 shadow-[8px_8px_0_0_#CCFF00]">
    <div className="relative w-40 h-40 flex items-center justify-center">
     <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
      <circle
       cx="50"
       cy="50"
       r="40"
       fill="none"
       stroke="#333"
       strokeWidth="12"
      />
      <circle
       cx="50"
       cy="50"
       r="40"
       fill="none"
       stroke="#CCFF00"
       strokeWidth="12"
       strokeLinecap="round"
       strokeDasharray={`${2 * Math.PI * 40}`}
       strokeDashoffset={`${2 * Math.PI * 40 * (1 - val1 / 100)}`}
       className="transition-all duration-500"
      />
     </svg>
     <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
      <span className="text-3xl font-[1000] leading-none tracking-tighter">
       {val1}%
      </span>
      <span className="text-[8px] font-black uppercase tracking-widest mt-1 text-[#CCFF00]">
       System Load
      </span>
     </div>
    </div>
   </div>
  </div>
 )
}

const LoaderAndSkeletonBay = () => {
 return (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 ui-library-loader-scope">
   <style>{`
           @keyframes vt-load { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
           .ui-library-loader-scope .vt-loading-bar::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); animation: vt-load 1.5s infinite; }
        `}</style>   <div className="space-y-6 bg-white border-[4px] border-black p-8 rounded-[24px] shadow-[8px_8px_0_0_black]">
    <h4 className="font-black uppercase tracking-widest text-sm border-b-4 border-black pb-2 mb-6">
     Skeletons
    </h4>
    <div className="flex gap-4 items-center">
     <div className="w-16 h-16 rounded-full bg-gray-200 border-[3px] border-black animate-pulse shrink-0" />
     <div className="flex-1 space-y-3">
      <div className="h-6 bg-gray-200 border-[3px] border-black rounded-lg animate-pulse w-3/4" />
      <div className="h-4 bg-gray-200 border-[3px] border-black rounded-lg animate-pulse w-1/2" />
     </div>
    </div>
    <div className="h-32 bg-gray-200 border-[4px] border-black rounded-xl animate-pulse mt-4" />
   </div>
   <div className="space-y-8 bg-black border-[4px] border-black p-8 rounded-[24px] shadow-[8px_8px_0_0_#FF3399]">
    <h4 className="font-black uppercase tracking-widest text-sm border-b-4 border-white/20 pb-2 mb-6 text-white">
     Active Loaders
    </h4>
    <div className="flex items-center gap-6">
     <div className="w-12 h-12 border-[6px] border-white/20 border-t-[#FF3399] rounded-full animate-spin" />
     <span className="font-[1000] uppercase text-xl text-[#FF3399] animate-pulse italic">
      Thinking...
     </span>
    </div>
    <div className="space-y-2">
     <span className="font-black uppercase text-[10px] text-white/50 tracking-[0.2em]">
      Indeterminate Progress
     </span>
     <div className="h-8 bg-white/10 border-[3px] border-white/20 rounded-xl overflow-hidden relative vt-loading-bar">
      <div className="w-1/3 h-full bg-[#00CCFF] border-r-[3px] border-black" />
     </div>
    </div>
   </div>
  </div>
 )
}

const MenuAndTreeNav = () => {
 const [menuOpen, setMenuOpen] = useState(false)
 const [treeOpen, setTreeOpen] = useState(true)
 return (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
   <div className="space-y-4">
    <h4 className="font-black uppercase tracking-widest text-sm mb-4">
     Dropdown Action Menu
    </h4>
    <div className="relative">
     <button
      onClick={() => setMenuOpen(!menuOpen)}
      className="w-full bg-[#CCFF00] border-[4px] border-black rounded-2xl p-5 font-[1000] uppercase text-xl shadow-[6px_6px_0_0_black] flex justify-between items-center hover:translate-y-1 hover:shadow-[2px_2px_0_0_black] transition-all">
      Select Protocol{" "}
      <ChevronDown
       className={`transition-transform ${menuOpen ? "rotate-180" : ""}`}
       strokeWidth={4}
      />
     </button>
     {menuOpen && (
      <div className="absolute top-full left-0 mt-4 w-full bg-white border-[4px] border-black rounded-2xl shadow-[12px_12px_0_0_black] overflow-hidden z-20 flex flex-col">
       {["Launch Engine", "Analyze Data", "Settings"].map((o, i) => (
        <button
         key={o}
         className={`p-5 text-left font-black uppercase text-lg hover:bg-[#FF3399] hover:text-white transition-colors ${i !== 2 ? "border-b-[4px] border-black" : ""}`}>
         {o}
        </button>
       ))}
      </div>
     )}
    </div>
   </div>
   <div className="space-y-4">
    <h4 className="font-black uppercase tracking-widest text-sm mb-4">
     Expanding Tree List
    </h4>
    <div className="bg-white border-[4px] border-black rounded-2xl shadow-[6px_6px_0_0_black] overflow-hidden">
     <button
      onClick={() => setTreeOpen(!treeOpen)}
      className="w-full p-4 bg-black text-white font-black uppercase text-left flex items-center justify-between hover:bg-gray-800 transition-colors">
      <div className="flex items-center gap-3">
       <List size={20} /> Root Directory
      </div>
      <ChevronRight
       className={`transition-transform ${treeOpen ? "rotate-90" : ""}`}
      />
     </button>
     {treeOpen && (
      <div className="flex flex-col border-t-[4px] border-black bg-gray-50">
       <div className="p-4 pl-12 font-bold text-sm uppercase border-b-2 border-black/10 hover:bg-white cursor-pointer transition-colors flex items-center gap-2">
        <div className="w-2 h-2 bg-[#00CCFF] border-2 border-black rounded-full" />{" "}
        Sub-Folder A
       </div>
       <div className="p-4 pl-12 font-bold text-sm uppercase hover:bg-white cursor-pointer transition-colors flex items-center gap-2">
        <div className="w-2 h-2 bg-[#FF3399] border-2 border-black rounded-full" />{" "}
        Sub-Folder B
       </div>
      </div>
     )}
    </div>
   </div>
  </div>
 )
}

const DashboardWidgets = () => {
 const [rating, setRating] = useState(3)
 return (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
   <div className="bg-[#00CCFF] border-[4px] border-black p-6 rounded-3xl shadow-[8px_8px_0_0_black] flex flex-col justify-between h-40 transform hover:scale-105 transition-transform cursor-pointer">
    <div className="flex justify-between items-start">
     <div className="bg-white p-2 rounded-xl border-[3px] border-black shadow-[4px_4px_0_0_black]">
      <Activity size={24} />
     </div>
     <span className="bg-black text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase">
      LIVE
     </span>
    </div>
    <div>
     <h3 className="text-4xl font-[1000] tracking-tighter text-black">8,402</h3>
     <span className="text-[10px] font-black uppercase tracking-widest text-black/60">
      Active Sessions
     </span>
    </div>
   </div>
   <div className="bg-[#FFDD00] border-[4px] border-black p-6 rounded-3xl shadow-[8px_8px_0_0_black] flex flex-col justify-between h-40 transform hover:scale-105 transition-transform cursor-pointer">
    <h4 className="font-black uppercase tracking-tighter text-xl">
     Conversion
    </h4>
    <div className="flex items-end gap-4">
     <span className="text-5xl font-[1000] tracking-tighter text-black leading-none">
      12<span className="text-2xl">%</span>
     </span>
     <span className="text-sm font-black text-green-600 mb-1">↑ 2.4%</span>
    </div>
   </div>
   <div className="bg-white border-[4px] border-black p-6 rounded-3xl shadow-[8px_8px_0_0_black] flex flex-col justify-between h-40">
    <h4 className="font-black uppercase tracking-tighter text-sm">
     Rate Algorithm
    </h4>
    <div className="flex gap-2">
     {[1, 2, 3, 4, 5].map((i) => (
      <button
       key={i}
       onClick={() => setRating(i)}
       className="hover:scale-125 transition-transform">
       <Star
        size={32}
        strokeWidth={3}
        className={
         i <= rating
          ? "fill-[#FF3399] text-black"
          : "fill-gray-100 text-black/20"
        }
       />
      </button>
     ))}
    </div>
    <span className="text-[10px] font-black uppercase tracking-widest text-black/40">
     {rating} out of 5 stars
    </span>
   </div>
  </div>
 )
}

const DialoguePopouts = () => {
 const [showDialog, setShowDialog] = useState(false)
 return (
  <div className="relative bg-white border-[5px] border-black rounded-[32px] p-12 text-center shadow-[12px_12px_0_0_black] min-h-[300px] flex flex-col items-center justify-center">
   <h3 className="text-3xl font-[1000] uppercase tracking-tighter mb-6">
    Dialogue & Popout Engine
   </h3>
   <button
    onClick={() => setShowDialog(true)}
    className="bg-[#FF3399] text-white border-[4px] border-black px-10 py-5 rounded-2xl font-[1000] text-2xl uppercase tracking-tighter shadow-[8px_8px_0_0_black] hover:translate-y-1 hover:shadow-none transition-all">
    Trigger Modal
   </button>

   {showDialog && (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-10 flex items-center justify-center p-6 rounded-[28px] animate-in zoom-in-95 duration-200">
     <div className="bg-white border-[5px] border-black w-full max-w-sm rounded-[32px] overflow-hidden shadow-[16px_16px_0_0_#CCFF00] flex flex-col text-left">
      <div className="bg-[#CCFF00] p-5 border-b-[5px] border-black flex justify-between items-center">
       <span className="font-[1000] uppercase tracking-tighter text-2xl">
        Confirm Action
       </span>
       <button
        onClick={() => setShowDialog(false)}
        className="bg-black text-white p-2 rounded-xl hover:scale-110 transition-transform">
        <X size={20} strokeWidth={4} />
       </button>
      </div>
      <div className="p-6">
       <p className="font-bold text-lg leading-snug">
        Are you sure you want to execute this protocol? This action is
        irreversible.
       </p>
      </div>
      <div className="p-6 pt-0 flex gap-4">
       <button
        onClick={() => setShowDialog(false)}
        className="flex-1 bg-black text-white border-[4px] border-black py-4 rounded-xl font-black uppercase">
        Execute
       </button>
       <button
        onClick={() => setShowDialog(false)}
        className="flex-1 bg-white text-black border-[4px] border-black py-4 rounded-xl font-black uppercase hover:bg-gray-100">
        Cancel
       </button>
      </div>
     </div>
    </div>
   )}
  </div>
 )
}

export const UIReferenceLibraryContent: React.FC = () => {
 const [isModalOpen, setIsModalOpen] = useState(false)
 const [isChecked1, setIsChecked1] = useState(true)
 const [isChecked2, setIsChecked2] = useState(false)
 const [isToggled, setIsToggled] = useState(true)
 const [dropdownValue, setDropdownValue] = useState("option1")
 const [sliderValue, setSliderValue] = useState(75)
 const [radioSelection, setRadioSelection] = useState("Standard")
 const [activeTab, setActiveTab] = useState("Weekly")
 const [libraryManifest, setLibraryManifest] = useState<LibraryManifest | null>(
  null,
 )
 const [librarySearch, setLibrarySearch] = useState("")
 const [selectedLibraryUrl, setSelectedLibraryUrl] = useState("")
 const [selectedLibraryPath, setSelectedLibraryPath] = useState("")
 const [selectedLibraryExt, setSelectedLibraryExt] = useState("")
 const [selectedLibraryText, setSelectedLibraryText] = useState("")
 const [isLibraryLoading, setIsLibraryLoading] = useState(false)
 const [libraryError, setLibraryError] = useState<string | null>(null)
 const [previewMode, setPreviewMode] = useState<"source" | "live">("source")

 React.useEffect(() => {
  let mounted = true
  fetch("/reference-studio/library-manifest.json")
   .then((res) => res.json())
   .then((manifest: LibraryManifest) => {
    if (!mounted) return
    setLibraryManifest(manifest)
    const firstEntry = [
     ...manifest.local,
     ...manifest.imported,
     ...manifest.external,
    ][0]
    if (firstEntry) {
     setSelectedLibraryUrl(firstEntry.url)
     setSelectedLibraryPath(firstEntry.path)
     setSelectedLibraryExt(firstEntry.ext)
    }
   })
   .catch(() => {
    if (!mounted) return
    setLibraryError("Failed to load local library manifest.")
   })
  return () => {
   mounted = false
  }
 }, [])

 const allLibraryEntries = React.useMemo<LibraryManifestEntry[]>(() => {
  if (!libraryManifest) return []
  return [
   ...libraryManifest.local,
   ...libraryManifest.imported,
   ...libraryManifest.external,
  ]
 }, [libraryManifest])

 const filteredLibraryEntries = React.useMemo(() => {
  const query = librarySearch.trim().toLowerCase()
  if (!query) return allLibraryEntries
  return allLibraryEntries.filter(
   (entry) =>
    entry.path.toLowerCase().includes(query) ||
    entry.group.toLowerCase().includes(query),
  )
 }, [allLibraryEntries, librarySearch])

 const liveCanvasSpec = React.useMemo(
  () => (selectedLibraryPath ? getLiveCanvasSpec(selectedLibraryPath) : null),
  [selectedLibraryPath],
 )

 React.useEffect(() => {
  if (!selectedLibraryUrl) return
  const isImageExt = [
   "png",
   "jpg",
   "jpeg",
   "webp",
   "gif",
   "bmp",
   "ico",
  ].includes(selectedLibraryExt)
  const isHtml = selectedLibraryExt === "html"
  const isZip = selectedLibraryExt === "zip"
  if (isImageExt || isHtml || isZip) {
   setSelectedLibraryText("")
   return
  }

  let mounted = true
  setIsLibraryLoading(true)
  setLibraryError(null)
  fetch(selectedLibraryUrl)
   .then((res) => {
    if (!res.ok) throw new Error("Unable to load file")
    return res.text()
   })
   .then((text) => {
    if (!mounted) return
    setSelectedLibraryText(text)
   })
   .catch(() => {
    if (!mounted) return
    setLibraryError("Failed to preview selected file.")
    setSelectedLibraryText("")
   })
   .finally(() => {
    if (!mounted) return
    setIsLibraryLoading(false)
   })

  return () => {
   mounted = false
  }
 }, [selectedLibraryExt, selectedLibraryUrl])

 return (
  <div className="bg-transparent pb-60">
   {/* ------------------------------------------------------------- */}
   {/* SECTION -1: COMPLETE LOCAL LIBRARY EXPLORER */}
   {/* ------------------------------------------------------------- */}
   <div className="p-12 border-b-[12px] border-black bg-white mb-20">
    <div className="max-w-7xl mx-auto text-center">
     <h2 className="text-4xl font-[1000] uppercase italic tracking-tighter bg-[#FF3399] text-white inline-block px-10 py-4 rounded-2xl shadow-[8px_8px_0px_0px_black]">
      SECTION -1: Full Library Explorer
     </h2>
     <p className="mt-6 font-black uppercase text-sm opacity-60 tracking-widest">
      Browse every local component/tool file and imported pack file directly
      in-app.
     </p>
    </div>
   </div>

   <div className="max-w-[1400px] mx-auto px-4 space-y-8 mb-20 text-black">
    <div className="bg-white border-[5px] border-black rounded-[28px] p-8 shadow-[10px_10px_0px_0px_black]">
     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <div className="bg-[#F8FAFC] border-[3px] border-black rounded-2xl p-4">
       <div className="text-[10px] font-black uppercase opacity-50">
        Local Source Files
       </div>
       <div className="text-3xl font-[1000] mt-1">
        {libraryManifest?.totals.local ?? 0}
       </div>
      </div>
      <div className="bg-[#F8FAFC] border-[3px] border-black rounded-2xl p-4">
       <div className="text-[10px] font-black uppercase opacity-50">
        Imported Pack Files
       </div>
       <div className="text-3xl font-[1000] mt-1">
        {libraryManifest?.totals.imported ?? 0}
       </div>
      </div>
      <div className="bg-black text-[#CCFF00] border-[3px] border-black rounded-2xl p-4">
       <div className="text-[10px] font-black uppercase opacity-70">
        Total Library Items
       </div>
       <div className="text-3xl font-[1000] mt-1">
        {libraryManifest?.totals.all ?? 0}
       </div>
      </div>
     </div>

     <div className="relative mb-5">
      <Search
       className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30"
       size={18}
      />
      <input
       value={librarySearch}
       onChange={(e) => setLibrarySearch(e.target.value)}
       placeholder="Search files, folders, or groups..."
       className="w-full border-[3px] border-black rounded-2xl py-3 pl-11 pr-4 font-bold text-sm bg-white shadow-[4px_4px_0px_0px_black] outline-none"
      />
     </div>

     <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className="border-[4px] border-black rounded-2xl overflow-hidden shadow-[6px_6px_0px_0px_black]">
       <div className="bg-[#00CCFF] border-b-[4px] border-black px-4 py-3 font-black uppercase text-xs tracking-widest">
        File Inventory ({filteredLibraryEntries.length})
       </div>
       <div className="max-h-[600px] overflow-auto bg-white p-3 space-y-2">
        {filteredLibraryEntries.map((entry) => (
         <button
          key={`${entry.group}:${entry.path}`}
          onClick={() => {
           setSelectedLibraryUrl(entry.url)
           setSelectedLibraryPath(entry.path)
           setSelectedLibraryExt(entry.ext)
           setPreviewMode("source")
          }}
          className={`w-full text-left border-[3px] border-black rounded-xl p-3 transition-all shadow-[3px_3px_0px_0px_black] ${
           selectedLibraryUrl === entry.url
            ? "bg-[#CCFF00]"
            : "bg-white hover:bg-gray-50"
          }`}>
          <div className="text-[10px] font-black uppercase opacity-60">
           {entry.group}
          </div>
          <div className="font-[1000] text-[12px] break-all">{entry.path}</div>
          <div className="text-[10px] font-black uppercase opacity-40 mt-1">
           .{entry.ext}
          </div>
         </button>
        ))}
       </div>
      </div>

      <div className="border-[4px] border-black rounded-2xl overflow-hidden shadow-[6px_6px_0px_0px_black]">
       <div className="bg-[#CCFF00] border-b-[4px] border-black px-4 py-3 flex items-center justify-between gap-3">
        <div className="font-black uppercase text-xs tracking-widest truncate">
         {selectedLibraryPath || "Select a file"}
        </div>
        <div className="flex items-center gap-2 shrink-0">
         <button
          onClick={() => setPreviewMode("source")}
          className={`border-2 border-black rounded-lg px-2 py-1 font-black uppercase text-[10px] ${previewMode === "source" ? "bg-black text-white" : "bg-white text-black"}`}>
          Source
         </button>
         <button
          onClick={() => setPreviewMode("live")}
          className={`border-2 border-black rounded-lg px-2 py-1 font-black uppercase text-[10px] ${previewMode === "live" ? "bg-[#00CCFF] text-black" : "bg-white text-black"}`}>
          Live Canvas
         </button>
         {selectedLibraryUrl && (
          <a
           href={selectedLibraryUrl}
           target="_blank"
           rel="noreferrer"
           className="bg-black text-white border-2 border-black rounded-lg px-3 py-1 font-black uppercase text-[10px]">
           Open
          </a>
         )}
        </div>
       </div>
       {previewMode === "live" ? (
        <div className="h-[600px] overflow-auto bg-[#f8fafc] p-4">
         {liveCanvasSpec ? (
          <div className="border-[3px] border-black rounded-2xl p-4 bg-white shadow-[4px_4px_0px_0px_black]">
           <div className="text-[10px] font-black uppercase opacity-60 mb-3">
            Live Renderer: {liveCanvasSpec.label}
           </div>
           <div className="min-h-[520px] overflow-auto">
            {liveCanvasSpec.render()}
           </div>
          </div>
         ) : (
          <div className="border-[3px] border-black rounded-2xl p-6 bg-white shadow-[4px_4px_0px_0px_black]">
           <div className="text-lg font-[1000] uppercase tracking-tight">
            No live renderer yet for this file.
           </div>
           <p className="mt-2 text-sm font-bold opacity-70">
            This file is still available in Source mode. I can add a live
            wrapper for it next.
           </p>
          </div>
         )}
        </div>
       ) : (
        <div className="h-[600px] overflow-auto bg-[#0b1220] text-[#e8f7ff] p-4">
         {libraryError ? (
          <div className="font-black text-sm text-[#ff7497]">
           {libraryError}
          </div>
         ) : isLibraryLoading ? (
          <div className="font-black text-sm uppercase opacity-70">
           Loading file preview...
          </div>
         ) : ["png", "jpg", "jpeg", "webp", "gif", "bmp", "ico"].includes(
            selectedLibraryExt,
           ) ? (
          <img
           src={selectedLibraryUrl}
           alt={selectedLibraryPath}
           className="max-w-full rounded-xl border-2 border-black bg-white"
          />
         ) : selectedLibraryExt === "html" ? (
          <iframe
           src={selectedLibraryUrl}
           title={selectedLibraryPath}
           className="w-full h-full rounded-xl border-2 border-black bg-white"
          />
         ) : selectedLibraryExt === "zip" ? (
          <div className="space-y-3">
           <div className="font-black uppercase text-sm">
            Zip preview is file-download only.
           </div>
           <a
            href={selectedLibraryUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-block bg-[#00CCFF] text-black border-2 border-black rounded-lg px-4 py-2 font-black uppercase text-xs">
            Download / Open Zip
           </a>
          </div>
         ) : (
          <pre className="text-[12px] leading-5 whitespace-pre-wrap break-words">
           {selectedLibraryText || "No preview available."}
          </pre>
         )}
        </div>
       )}
      </div>
     </div>
    </div>
   </div>

   {/* ------------------------------------------------------------- */}
   {/* SECTION 0: IMPORTED STYLE PACKS + CURATION BOARD */}
   {/* ------------------------------------------------------------- */}
   <div className="p-12 border-b-[12px] border-black bg-white mb-20">
    <div className="max-w-7xl mx-auto text-center">
     <h2 className="text-4xl font-[1000] uppercase italic tracking-tighter bg-[#111827] text-[#CCFF00] inline-block px-10 py-4 rounded-2xl shadow-[8px_8px_0px_0px_#00CCFF]">
      SECTION 0: Imported Style Packs
     </h2>
     <p className="mt-6 font-black uppercase text-sm opacity-60 tracking-widest">
      New references added first. Core sections below remain intact.
     </p>
    </div>
   </div>

   <div className="max-w-[1400px] mx-auto px-4 space-y-8 mb-20 text-black">
    <div className="bg-white border-[5px] border-black rounded-[28px] p-8 shadow-[10px_10px_0px_0px_black]">
     <div className="flex items-center gap-3 mb-6">
      <Database size={24} />
      <h3 className="text-2xl font-[1000] uppercase tracking-tight">
       Imported References
      </h3>
     </div>
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {referenceStudioImportPacks.map((pack) => (
       <div
        key={pack.id}
        className="bg-[#F8FAFC] border-[4px] border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_black]">
        <div className="flex items-center justify-between gap-4">
         <h4 className="text-lg font-[1000] uppercase tracking-tight">
          {pack.label}
         </h4>
         <span className="bg-[#CCFF00] border-2 border-black px-3 py-1 rounded-lg text-[10px] font-black uppercase">
          {pack.addedOn}
         </span>
        </div>
        <p className="mt-3 text-xs font-bold break-all opacity-70">
         {pack.source}
        </p>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
         <div className="bg-white border-2 border-black rounded-xl p-2">
          <div className="text-xl font-[1000]">{pack.totalFiles}</div>
          <div className="text-[9px] font-black uppercase opacity-50">
           Files
          </div>
         </div>
         <div className="bg-white border-2 border-black rounded-xl p-2">
          <div className="text-xl font-[1000]">{pack.uiComponentFiles}</div>
          <div className="text-[9px] font-black uppercase opacity-50">
           UI Parts
          </div>
         </div>
         <div className="bg-white border-2 border-black rounded-xl p-2">
          <div className="text-xl font-[1000]">{pack.variantFiles}</div>
          <div className="text-[9px] font-black uppercase opacity-50">
           Variants
          </div>
         </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
         {pack.highlights.map((highlight) => (
          <span
           key={highlight}
           className="text-[10px] font-black uppercase bg-black text-[#CCFF00] px-2 py-1 rounded-md border border-black">
           {highlight}
          </span>
         ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
         <a
          className="inline-flex items-center gap-2 bg-[#00CCFF] border-[3px] border-black rounded-xl px-4 py-2 font-black uppercase text-[10px] shadow-[4px_4px_0px_0px_black] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
          href={pack.path}
          target="_blank"
          rel="noreferrer">
          <FileCode size={14} />
          Open Extracted Pack
         </a>
         <a
          className="inline-flex items-center gap-2 bg-[#CCFF00] border-[3px] border-black rounded-xl px-4 py-2 font-black uppercase text-[10px] shadow-[4px_4px_0px_0px_black] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
          href={pack.source}
          target="_blank"
          rel="noreferrer">
          <FileCode size={14} />
          Open Source Zip
         </a>
        </div>
       </div>
      ))}
      <div className="bg-black text-white border-[4px] border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_#CCFF00]">
       <h4 className="text-lg font-[1000] uppercase tracking-tight text-[#CCFF00]">
        External Style Benchmarks
       </h4>
       <div className="mt-4 space-y-4">
        {externalStyleReferences.map((ref) => (
         <div
          key={ref.id}
          className="border-2 border-white/20 rounded-xl p-4 bg-white/5">
          <div className="font-black uppercase text-sm">{ref.label}</div>
          <p className="text-[10px] font-bold uppercase opacity-70 mt-1">
           {ref.note}
          </p>
          <a
           className="mt-3 inline-flex items-center gap-2 bg-[#CCFF00] text-black border-2 border-black rounded-lg px-3 py-1.5 text-[10px] font-black uppercase"
           href={ref.path}
           target="_blank"
           rel="noreferrer">
           Open Reference
          </a>
         </div>
        ))}
       </div>
      </div>
     </div>
    </div>

    <div className="bg-white border-[5px] border-black rounded-[28px] p-8 shadow-[10px_10px_0px_0px_black]">
     <div className="flex items-center gap-3 mb-6">
      <Sparkles size={24} />
      <h3 className="text-2xl font-[1000] uppercase tracking-tight">
       Curated Best-Of Picks
      </h3>
     </div>
     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {curatedTopPicks.map((pick) => (
       <div
        key={pick.category}
        className="border-[3px] border-black rounded-2xl p-4 bg-gray-50 shadow-[4px_4px_0px_0px_black]">
        <div className="flex items-center justify-between gap-2">
         <div className="text-xs font-black uppercase opacity-50">
          {pick.category}
         </div>
         <span
          className={`text-[10px] font-black uppercase px-2 py-1 rounded-md border-2 border-black ${pick.status === "integrated" ? "bg-[#CCFF00]" : "bg-[#FFDD00]"}`}>
          {pick.status}
         </span>
        </div>
        <div className="mt-2 text-sm font-[1000] uppercase tracking-tight">
         {pick.chosen}
        </div>
        <div className="mt-2 text-[10px] font-bold uppercase opacity-60">
         Source: {pick.source}
        </div>
       </div>
      ))}
     </div>
    </div>

    <div className="bg-white border-[5px] border-black rounded-[28px] p-8 shadow-[10px_10px_0px_0px_black]">
     <div className="flex items-center gap-3 mb-6">
      <Layout size={24} />
      <h3 className="text-2xl font-[1000] uppercase tracking-tight">
       Toolbox Baseline Coverage
      </h3>
     </div>
     <p className="text-xs font-bold uppercase opacity-60 mb-5">
      One starter component mapped for each top-level tool.
     </p>
     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {toolboxBaselineCoverage.map((item) => (
       <div
        key={item.tool}
        className="border-[3px] border-black rounded-2xl p-4 bg-white shadow-[4px_4px_0px_0px_black]">
        <div className="flex items-center justify-between gap-2">
         <div className="text-sm font-[1000] uppercase tracking-tight">
          {item.tool}
         </div>
         <span
          className={`text-[10px] font-black uppercase px-2 py-1 rounded-md border-2 border-black ${item.status === "integrated" ? "bg-[#00CCFF]" : "bg-[#FFB158]"}`}>
          {item.status}
         </span>
        </div>
        <div className="mt-2 text-[11px] font-bold uppercase opacity-70">
         {item.baselineComponent}
        </div>
       </div>
      ))}
     </div>
    </div>
   </div>

   {/* ------------------------------------------------------------- */}
   {/* SECTION A: ASSISTANT NEU-BRUTALIST DESIGN (FROM FIRST TURN) */}
   {/* ------------------------------------------------------------- */}
   <div className="p-12 border-b-[12px] border-black bg-white mb-20">
    <div className="max-w-7xl mx-auto text-center">
     <h2 className="text-4xl font-[1000] uppercase italic tracking-tighter bg-black text-white inline-block px-10 py-4 rounded-2xl shadow-[8px_8px_0px_0px_#ff3399]">
      SECTION A: Assistant Design V1
     </h2>
     <p className="mt-6 font-black uppercase text-sm opacity-50 tracking-widest">
      A clean, unified approach to the Neo-Brutalist brand tokens.
     </p>
    </div>
   </div>

   <div className="max-w-7xl mx-auto mb-32 px-12">
    <div className="pop-box bg-[#ff3399] p-10 -m-2 mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
     <div className="flex items-center gap-6">
      <div className="w-20 h-20 bg-white border-[6px] border-black rounded-3xl flex items-center justify-center shadow-[8px_8px_0px_0px_black] animate-pop-rotate shrink-0">
       <CustomIcon name="!!!ANALYTICS" size={48} />
      </div>
      <div className="text-center md:text-left">
       <h1 className="text-6xl font-[1000] italic uppercase tracking-tighter text-white">
        UI Reference
       </h1>
       <p className="text-white font-black uppercase text-sm tracking-widest opacity-80 mt-2">
        v2.1 Assistant Original
       </p>
      </div>
     </div>
     <div className="pop-module-id bg-white px-6 py-3 text-2xl shrink-0">
      LAB-001
     </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
     {/* 1. COLOR PALETTE */}
     <div className="pop-box">
      <div className="pop-header bg-[#ccff00]">
       <div className="flex items-center gap-3 text-black">
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
         <Zap size={18} className="text-[#ccff00]" />
        </div>
        <span>Color Palette</span>
       </div>
      </div>
      <div className="pop-content grid grid-cols-3 gap-6 bg-white">
       {[
        { name: "Neon Pink", hex: "#ff3399", use: "Primary Action" },
        { name: "Neon Green", hex: "#ccff00", use: "Success / Goal" },
        { name: "Cyber Cyan", hex: "#00ccff", use: "Info / Data" },
        { name: "Bright Yellow", hex: "#ffdd00", use: "Accent / Pop" },
        { name: "Deep Black", hex: "#000000", use: "Borders / Shadows" },
        { name: "Pure White", hex: "#ffffff", use: "Card Backgrounds" },
       ].map((color) => (
        <div key={color.hex} className="flex flex-col gap-3">
         <div
          className="aspect-square border-[4px] border-black rounded-2xl shadow-[6px_6px_0px_0px_black]"
          style={{ backgroundColor: color.hex }}
         />
         <div className="overflow-hidden">
          <div className="text-xs font-black uppercase tracking-tight truncate">
           {color.name}
          </div>
          <div className="text-[10px] font-bold opacity-50">{color.hex}</div>
          <div className="text-[9px] font-black uppercase tracking-widest text-[#ff3399] mt-1 line-clamp-1">
           {color.use}
          </div>
         </div>
        </div>
       ))}
      </div>
     </div>

     {/* 2. TYPOGRAPHY */}
     <div className="pop-box">
      <div className="pop-header bg-[#00ccff]">
       <div className="flex items-center gap-3 text-black">
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
         <Sparkles size={18} className="text-[#00ccff]" />
        </div>
        <span>Typography</span>
       </div>
      </div>
      <div className="pop-content space-y-8 bg-white text-black">
       <div className="border-b-[4px] border-black/5 pb-6">
        <div className="text-[10px] font-black uppercase opacity-40 mb-2">
         Display 01
        </div>
        <h2 className="text-5xl font-[1000] italic uppercase tracking-tighter">
         Ultra Impact
        </h2>
       </div>
       <div className="border-b-[4px] border-black/5 pb-6">
        <div className="text-[10px] font-black uppercase opacity-40 mb-2">
         Display 02
        </div>
        <h3 className="text-3xl font-[1000] uppercase tracking-tight">
         Bold Section Title
        </h3>
       </div>
      </div>
     </div>

     {/* 3. BUTTONS & INTERACTION */}
     <div className="pop-box lg:col-span-2">
      <div className="pop-header bg-[#ffdd00]">
       <div className="flex items-center gap-3 text-black">
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
         <TrendingUp size={18} className="text-[#ffdd00]" />
        </div>
        <span>Interaction Tokens</span>
       </div>
      </div>
      <div className="pop-content grid grid-cols-1 md:grid-cols-4 gap-8 bg-white">
       <div className="space-y-4">
        <div className="text-[10px] font-black uppercase opacity-40 text-black">
         Primary Action
        </div>
        <button className="pop-button bg-[#ff3399] w-full text-white flex items-center justify-center">
         Deploy Studio
        </button>
       </div>
       <div className="space-y-4">
        <div className="text-[10px] font-black uppercase opacity-40 text-black">
         Success Action
        </div>
        <button className="pop-button bg-[#ccff00] w-full text-black flex items-center justify-center">
         Finalize Goal
        </button>
       </div>
       <div className="space-y-4">
        <div className="text-[10px] font-black uppercase opacity-40 text-black">
         Destructive
        </div>
        <button className="pop-button bg-black w-full text-[#ff3399] flex items-center justify-center gap-3">
         <Trash2 size={20} /> Wipe Data
        </button>
       </div>
      </div>
     </div>
    </div>
   </div>

   <div className="w-full border-b-[24px] border-[#ccff00] my-20 shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative overflow-hidden">
    <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_20px,rgba(0,0,0,0.05)_20px,rgba(0,0,0,0.05)_40px)]" />
   </div>

   {/* ------------------------------------------------------------- */}
   {/* SECTION B: USER EXACT TEMPLATE (FROM SECOND TURN) */}
   {/* ------------------------------------------------------------- */}
   <div className="p-12 border-b-[12px] border-black bg-white mb-20 text-black">
    <div className="max-w-7xl mx-auto text-center">
     <h2 className="text-4xl font-[1000] uppercase italic tracking-tighter bg-[#ffdd00] text-black inline-block px-10 py-4 rounded-2xl border-[4px] border-black shadow-[8px_8px_0px_0px_black]">
      SECTION B: Exact User Template
     </h2>
     <p className="mt-6 font-black uppercase text-sm opacity-50 tracking-widest">
      The original implementation properties and styles exactly as you sent
      them.
     </p>
    </div>
   </div>

   <div className="max-w-[1400px] mx-auto animate-fade-in px-4 pt-8 space-y-12 text-black">
    {/* --- PAGE HEADER --- */}
    <div className="w-full bg-white border-[5px] border-black rounded-2xl shadow-[12px_12px_0px_0px_black] overflow-hidden flex flex-col">
     <header className="bg-[#B14AED] h-[80px] border-b-[5px] border-black flex items-center justify-between px-0 overflow-hidden text-black">
      <div className="flex items-center h-full">
       <div className="bg-[#ccff00] h-full w-[80px] flex items-center justify-center border-r-[5px] border-black flex-shrink-0">
        <Box size={40} strokeWidth={3} className="text-black" />
       </div>
       <h1 className="text-[50px] font-[1000] uppercase tracking-tighter text-white pl-8 leading-none">
        UI REFERENCE STUDIO
       </h1>
      </div>
     </header>
     <div className="p-8 bg-gray-50">
      <p className="font-bold text-lg text-black/60 uppercase tracking-widest">
       Master Component Library for Tokyo-Pop / Neo-Brutalist Design
      </p>
     </div>
    </div>

    {/* --- GRID LAYOUTS --- */}
    <div className="space-y-6">
     <h2 className="text-3xl font-[1000] uppercase tracking-tighter flex items-center gap-3">
      <Sparkles className="text-[#ff3399]" /> Grid Systems & Containers
     </h2>

     <div className="w-full bg-white border-[4px] border-black rounded-3xl p-10 shadow-[8px_8px_0px_0px_black]">
      <h3 className="font-black uppercase text-xl mb-2 text-[#00d2ff]">
       1-Column Container
      </h3>
      <p className="font-bold text-black/50">
       Full width standard block for primary content.
      </p>
     </div>

     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white border-[4px] border-black rounded-3xl p-10 shadow-[8px_8px_0px_0px_black]">
       <h3 className="font-black uppercase text-xl mb-2 text-[#ff3399]">
        2-Column Left
       </h3>
       <p className="font-bold text-black/50">50% width container.</p>
      </div>
      <div className="bg-black text-white border-[4px] border-black rounded-3xl p-10 shadow-[8px_8px_0px_0px_#ccff00]">
       <h3 className="font-black uppercase text-xl mb-2 text-[#ccff00]">
        2-Column Right (Inverted)
       </h3>
       <p className="font-bold text-white/50">
        High contrast variant with neon shadow.
       </p>
      </div>
     </div>
    </div>

    {/* --- BUTTONS & INTERACTIVE ELEMENTS --- */}
    <div className="space-y-8">
     <h2 className="text-3xl font-[1000] uppercase tracking-tighter flex items-center gap-3">
      <Settings2 className="text-[#ccff00] fill-black" size={32} /> Inputs &
      Controls
     </h2>

     <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Buttons Panel */}
      <div className="bg-white border-[4px] border-black rounded-[24px] p-8 shadow-[8px_8px_0px_0px_black] space-y-6">
       <h3 className="font-black uppercase text-xl border-b-4 border-black pb-2">
        Buttons
       </h3>
       <div className="flex flex-wrap gap-4">
        <button className="bg-[#ccff00] text-black px-8 py-3 rounded-xl border-[3px] border-black shadow-[4px_4px_0_0_black] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_black] transition-all font-black uppercase text-sm">
         Primary Action
        </button>
        <button className="bg-[#ff3399] text-white px-8 py-3 rounded-xl border-[3px] border-black shadow-[4px_4px_0_0_black] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_black] transition-all font-black uppercase text-sm">
         Danger / Highlight
        </button>
       </div>
      </div>

      {/* Form Controls Panel */}
      <div className="bg-white border-[4px] border-black rounded-[24px] p-8 shadow-[8px_8px_0px_0px_black] space-y-8">
       <h3 className="font-black uppercase text-xl border-b-4 border-black pb-2">
        Form Elements
       </h3>

       <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-widest text-black/50 ml-1">
         Dropdown Menu
        </label>
        <div className="relative text-black">
         <select
          value={dropdownValue}
          onChange={(e) => setDropdownValue(e.target.value)}
          className="w-full bg-white border-[3px] border-black rounded-xl p-4 font-black uppercase text-sm appearance-none outline-none focus:border-[#ff3399] shadow-[4px_4px_0px_0px_black] cursor-pointer">
          <option value="option1">Auto-Detect Algorithm</option>
          <option value="option2">Long-form Data Sync</option>
         </select>
         <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none bg-[#ccff00] border-2 border-black rounded-md p-1">
          <ChevronDown size={16} strokeWidth={4} />
         </div>
        </div>
       </div>
      </div>
     </div>
    </div>

    {/* --- TABLES & DATA --- */}
    <div className="space-y-8">
     <h2 className="text-3xl font-[1000] uppercase tracking-tighter">
      Brutalist Data Table
     </h2>

     <div className="bg-white border-[5px] border-black rounded-2xl overflow-hidden shadow-[12px_12px_0px_0px_black]">
      <div className="bg-[#00d2ff] p-6 border-b-[5px] border-black flex justify-between items-center text-black">
       <h3 className="font-black uppercase tracking-tighter text-2xl">
        Data Matrix Header
       </h3>
       <span className="bg-white text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-[3px] border-black shadow-[4px_4px_0px_0px_black]">
        3 Records
       </span>
      </div>
      <div className="overflow-x-auto text-black">
       <table className="w-full text-left border-collapse whitespace-nowrap">
        <thead className="bg-black text-white">
         <tr>
          <th className="p-5 font-black uppercase tracking-widest text-xs border-r-[3px] border-white/20">
           Video Title
          </th>
          <th className="p-5 font-black uppercase tracking-widest text-xs border-r-[3px] border-white/20">
           Views
          </th>
         </tr>
        </thead>
        <tbody>
         <tr className="border-b-[3px] border-black/10 hover:bg-[#ccff00]/20 transition-colors">
          <td className="p-5 font-bold border-r-[3px] border-black/10">
           I Survived 50 Hours In A Box
          </td>
          <td className="p-5 font-bold">1,204,550</td>
         </tr>
        </tbody>
       </table>
      </div>
     </div>
    </div>

    {/* --- OVERLAYS & MODALS --- */}
    <div className="space-y-8 pb-40">
     <h2 className="text-3xl font-[1000] uppercase tracking-tighter">
      Modals & Overlays
     </h2>
     <div className="bg-white border-[4px] border-black rounded-3xl p-12 text-center shadow-[8px_8px_0px_0px_black]">
      <button
       onClick={() => setIsModalOpen(true)}
       className="bg-[#B14AED] text-white px-10 py-4 rounded-xl border-[4px] border-black shadow-[6px_6px_0_0_black] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_black] transition-all font-black uppercase text-lg">
       Trigger Pop-Up Box
      </button>
     </div>
    </div>
   </div>

   {/* --- MODAL IMPLEMENTATION --- */}
   {isModalOpen && (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-6 backdrop-blur-sm animate-fade-in">
     <div className="bg-white border-[6px] border-black rounded-[3rem] w-full max-w-2xl flex flex-col shadow-[20px_20px_0px_0px_#ccff00] transform animate-in zoom-in-95 duration-200">
      <button
       onClick={() => setIsModalOpen(false)}
       className="absolute -top-6 -right-6 bg-[#ff3399] text-white p-3 rounded-full border-[4px] border-black hover:rotate-90 transition-all z-50 shadow-[4px_4px_0px_0px_black]">
       <X size={24} strokeWidth={4} />
      </button>

      <div className="bg-[#ccff00] p-8 border-b-[6px] border-black rounded-t-[2.6rem]">
       <h3 className="text-4xl font-[1000] uppercase tracking-tighter text-black">
        System Alert
       </h3>
      </div>

      <div className="p-10 space-y-6 text-black">
       <p className="font-bold text-xl leading-relaxed">
        This is a standard Pop-Up Box. It uses a heavily rounded border, thick
        strokes, and a massive drop shadow.
       </p>
      </div>

      <div className="p-8 border-t-[4px] border-black bg-gray-50 rounded-b-[2.6rem] flex justify-end gap-4">
       <button
        onClick={() => setIsModalOpen(false)}
        className="pop-button bg-black text-[#ccff00] px-8 py-3 rounded-xl border-[3px] border-black shadow-[4px_4px_0_0_#ccff00] hover:translate-y-1 hover:shadow-none transition-all font-black uppercase text-sm">
        Confirm
       </button>
      </div>
     </div>
    </div>
   )}

   {/* ------------------------------------------------------------- */}
   {/* SECTION C: COMPREHENSIVE INTERACTIVE LIBRARY */}
   {/* ------------------------------------------------------------- */}
   <div className="p-12 border-b-[12px] border-black bg-white mb-20 text-black">
    <div className="max-w-[1400px] mx-auto text-center">
     <h2 className="text-4xl font-[1000] uppercase italic tracking-tighter bg-[#00CCFF] text-black inline-block px-10 py-4 rounded-2xl border-[4px] border-black shadow-[8px_8px_0px_0px_black]">
      SECTION C: Interactive Component Library
     </h2>
     <p className="mt-6 font-black uppercase text-sm opacity-50 tracking-widest text-black">
      Every UI component, input, and visualization tool designed in the true
      Neo-Brutalist Studio style.
     </p>
    </div>
   </div>

   <ErrorBoundary componentName="Ultimate Component Showcase">
    <div className="max-w-[1400px] mx-auto px-4 space-y-6">
     {/* Module 1: Analytics Protocol */}
     <AccordionContainer
      title="Analytics Protocol"
      icon="analytics"
      headerColor="bg-[#00CCFF]"
      iconBoxColor="bg-white">
      <div className="space-y-6">
       <div className="bg-gray-50 border-[3px] border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_black]">
        <div className="h-40 flex items-end gap-2 px-4">
         {[40, 70, 45, 90, 65, 80, 55, 95].map((h, i) => (
          <div
           key={i}
           className="flex-1 bg-[#00CCFF] border-2 border-black rounded-t-lg shadow-[2px_2px_0px_0px_black]"
           style={{ height: `${h}%` }}
          />
         ))}
        </div>
        <div className="mt-4 border-t-2 border-black/10 pt-4 flex justify-between font-black uppercase text-[10px]">
         <span>Mon</span>
         <span>Tue</span>
         <span>Wed</span>
         <span>Thu</span>
         <span>Fri</span>
         <span>Sat</span>
         <span>Sun</span>
        </div>
       </div>
       <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border-[3px] border-black p-4 rounded-xl shadow-[4px_4px_0px_0px_black] text-center">
         <div className="text-[10px] font-black opacity-40 uppercase">
          Views
         </div>
         <div className="text-2xl font-[1000]">1.2M</div>
        </div>
        <div className="bg-white border-[3px] border-black p-4 rounded-xl shadow-[4px_4px_0px_0px_black] text-center">
         <div className="text-[10px] font-black opacity-40 uppercase">CTR</div>
         <div className="text-2xl font-[1000]">12.4%</div>
        </div>
        <div className="bg-white border-[3px] border-black p-4 rounded-xl shadow-[4px_4px_0px_0px_black] text-center">
         <div className="text-[10px] font-black opacity-40 uppercase">AVD</div>
         <div className="text-2xl font-[1000]">4:12</div>
        </div>
       </div>
      </div>
     </AccordionContainer>

     {/* Module 2: Viral Pathing */}
     <AccordionContainer
      title="Viral Pathing"
      icon="!!!GENERATE2"
      headerColor="bg-[#CCFF00]"
      iconBoxColor="bg-white">
      <div className="space-y-6">
       <div className="bg-black p-6 rounded-2xl">
        <div className="h-32 bg-[repeating-linear-gradient(90deg,transparent,transparent_40px,rgba(204,255,0,0.1)_40px,rgba(204,255,0,0.1)_80px)] border-l-4 border-b-4 border-[#CCFF00] flex items-end">
         <div className="w-full h-full relative">
          <svg viewBox="0 0 400 100" className="w-full h-full preserve-3d">
           <path
            d="M0,80 L50,70 L100,85 L150,40 L200,50 L250,10 L300,30 L350,5 L400,20"
            fill="none"
            stroke="#CCFF00"
            strokeWidth="4"
            className="drop-shadow-[0_0_8px_rgba(204,255,0,0.5)]"
           />
          </svg>
         </div>
        </div>
       </div>
       <div className="bg-[#CCFF00]/10 border-[3px] border-black p-4 rounded-xl flex items-center justify-between">
        <span className="font-black uppercase text-xs italic">
         Viral Threshold Detected
        </span>
        <span className="bg-[#CCFF00] border-2 border-black px-3 py-1 rounded-full text-[10px] font-black uppercase">
         Active
        </span>
       </div>
      </div>
     </AccordionContainer>

     {/* Module 3: Audience Matrix */}
     <AccordionContainer
      title="Audience Matrix"
      icon="search"
      headerColor="bg-[#FFDD00]"
      iconBoxColor="bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       <div className="bg-white border-[3px] border-black rounded-xl p-4 flex flex-col items-center justify-center min-h-[200px] shadow-[4px_4px_0px_0px_black]">
        <Globe size={80} className="text-[#FFDD00]/20 absolute" />
        <div className="z-10 grid grid-cols-4 gap-2 w-full">
         {[...Array(16)].map((_, i) => (
          <div
           key={i}
           className="aspect-square bg-[#FFDD00] border-2 border-black rounded-lg shadow-sm"
           style={{ opacity: Math.random() * 0.8 + 0.2 }}
          />
         ))}
        </div>
       </div>
       <div className="bg-white border-[3px] border-black rounded-xl overflow-hidden shadow-[4px_4px_0px_0px_black]">
        <table className="w-full text-left text-[10px] font-black border-collapse">
         <thead className="bg-[#FFDD00] border-b-2 border-black">
          <tr>
           <th className="p-2 border-r-2 border-black">Region</th>
           <th className="p-2">Share</th>
          </tr>
         </thead>
         <tbody>
          <tr className="border-b-2 border-black/5">
           <td className="p-2 border-r-2 border-black/5">United States</td>
           <td className="p-2">42%</td>
          </tr>
          <tr className="border-b-2 border-black/5">
           <td className="p-2 border-r-2 border-black/5">United Kingdom</td>
           <td className="p-2">18%</td>
          </tr>
          <tr className="border-b-2 border-black/5">
           <td className="p-2 border-r-2 border-black/5">India</td>
           <td className="p-2">12%</td>
          </tr>
         </tbody>
        </table>
       </div>
      </div>
     </AccordionContainer>

     {/* Module 4: Device Immersion */}
     <AccordionContainer
      title="Device Immersion"
      icon="!!!COLLECTION"
      headerColor="bg-[#FFB158]"
      iconBoxColor="bg-white">
      <div className="flex items-center justify-around p-6 bg-gray-50 border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_0px_black]">
       <div className="flex flex-col items-center gap-3">
        <Smartphone size={40} />
        <div className="h-20 w-8 bg-gray-200 border-2 border-black rounded-lg relative overflow-hidden flex flex-col justify-end">
         <div className="w-full bg-[#FFB158] border-t-2 border-black h-[70%]" />
        </div>
        <span className="font-black text-xs uppercase">Mobile (70%)</span>
       </div>
       <div className="flex flex-col items-center gap-3">
        <Box size={40} />
        <div className="h-20 w-8 bg-gray-200 border-2 border-black rounded-lg relative overflow-hidden flex flex-col justify-end">
         <div className="w-full bg-[#FFB158] border-t-2 border-black h-[25%]" />
        </div>
        <span className="font-black text-xs uppercase">Desktop (25%)</span>
       </div>
      </div>
     </AccordionContainer>

     {/* Module 5: Retention Pulse */}
     <AccordionContainer
      title="Retention Pulse"
      icon="!!!ANALYTICS"
      headerColor="bg-[#FF7497]"
      iconBoxColor="bg-white">
      <div className="space-y-6">
       <div className="h-4 bg-gray-200 border-3 border-black rounded-full overflow-hidden shadow-[4px_4px_0px_0px_black] relative">
        <div
         className="absolute inset-y-0 left-0 bg-[#FF7497] border-r-3 border-black"
         style={{ width: "68%" }}
        />
       </div>
       <div className="flex justify-between font-black uppercase text-xs">
        <span>Average Retention: 68%</span>
        <span className="text-[#FF7497]">Viral Range</span>
       </div>
       <div className="bg-white border-[3px] border-black p-6 rounded-2xl shadow-[4px_4px_0px_0px_black]">
        <div className="h-40 relative">
         <div className="absolute inset-0 border-l-2 border-b-2 border-black/10" />
         {[...Array(20)].map((_, i) => (
          <div
           key={i}
           className="absolute w-3 h-3 bg-[#FF7497] border-2 border-black rounded-full shadow-sm"
           style={{
            left: `${i * 5}%`,
            bottom: `${Math.sin(i * 0.5) * 30 + 40}%`,
           }}
          />
         ))}
        </div>
       </div>
      </div>
     </AccordionContainer>

     {/* Module 6: Revenue Stream */}
     <AccordionContainer
      title="Revenue Stream"
      icon="!!!GENERATE1"
      headerColor="bg-[#B14AED]"
      iconBoxColor="bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
       <div className="bg-white border-[4px] border-black rounded-3xl p-8 shadow-[8px_8px_0px_0px_black] flex flex-col items-center justify-center">
        <div className="text-6xl font-[1000] text-[#B14AED] mb-2">$12.4K</div>
        <div className="font-black uppercase text-sm tracking-widest opacity-40">
         Monthly Earnings
        </div>
       </div>
       <div className="space-y-4">
        <div className="pop-box p-4 bg-white border-[3px] flex items-center gap-4">
         <div className="w-10 h-10 bg-[#B14AED] border-2 border-black rounded-lg flex items-center justify-center">
          <DollarSign className="text-white" />
         </div>
         <div className="flex-1">
          <div className="text-[10px] font-black opacity-30 uppercase">
           Ad Revenue
          </div>
          <div className="text-xl font-black">$8,240</div>
         </div>
        </div>
        <div className="pop-box p-4 bg-white border-[3px] flex items-center gap-4">
         <div className="w-10 h-10 bg-[#ccff00] border-2 border-black rounded-lg flex items-center justify-center">
          <Sparkles className="text-black" />
         </div>
         <div className="flex-1">
          <div className="text-[10px] font-black opacity-30 uppercase">
           Membership
          </div>
          <div className="text-xl font-black">$4,160</div>
         </div>
        </div>
       </div>
      </div>
     </AccordionContainer>

     {/* Module 7: Thumbnail Studio */}
     <AccordionContainer
      title="Thumbnail Studio"
      icon="image"
      headerColor="bg-[#00CCFF]"
      iconBoxColor="bg-white">
      <div className="space-y-8">
       <div className="w-full bg-gray-50 border-[5px] border-dashed border-black/20 rounded-[40px] p-20 flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-[#00CCFF]/5 transition-all">
        <div className="w-20 h-20 bg-white border-[4px] border-black rounded-3xl flex items-center justify-center shadow-[6px_6px_0px_0px_black] group-hover:scale-110 transition-transform mb-6">
         <Upload size={40} className="text-[#00CCFF]" />
        </div>
        <h4 className="text-2xl font-[1000] uppercase tracking-tighter">
         Drop Thumbnail Draft
        </h4>
        <p className="font-black uppercase text-[10px] opacity-40 mt-2">
         Analysis will be performed automatically
        </p>
       </div>
       <div className="grid grid-cols-4 gap-4">
        {["Cinematic", "Clickbait", "Saturated", "Gaming"].map((s) => (
         <button
          key={s}
          className="bg-white border-[3px] border-black p-3 rounded-xl font-black uppercase text-[10px] shadow-[4px_4px_0px_0px_black] active:translate-y-1 active:shadow-none transition-all">
          {s}
         </button>
        ))}
       </div>
      </div>
     </AccordionContainer>

     {/* Module 8: SEO Generator */}
     <AccordionContainer
      title="SEO Generator"
      icon="!!!TEXT"
      headerColor="bg-[#CCFF00]"
      iconBoxColor="bg-white">
      <div className="space-y-6">
       <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest opacity-30">
         Auto-Detect Algorithm
        </label>
        <div className="relative text-black">
         <select className="w-full bg-white border-[4px] border-black rounded-[24px] p-6 font-black uppercase text-xl shadow-[8px_8px_0px_0px_black] appearance-none outline-none focus:bg-[#CCFF00]/5">
          <option>Viral Optimization v2.1</option>
          <option>Retention Priority v3</option>
          <option>Search Discovery Engine</option>
         </select>
         <ChevronDown
          className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none"
          size={32}
          strokeWidth={3}
         />
        </div>
       </div>
       <div className="bg-black text-[#CCFF00] p-6 rounded-[24px] font-mono text-xs shadow-[8px_8px_0px_0px_black] border-2 border-[#CCFF00]/20">
        {">"} ANALYSIS_KEYWORD: "MRBEAST" DETECTED
        <br />
        {">"} SCORE: 98% VIRALITY_PROBABILITY
        <br />
        {">"} OPTIMIZING... DONE.
       </div>
      </div>
     </AccordionContainer>

     {/* Module 9: Storyboard Planner */}
     <AccordionContainer
      title="Storyboard Planner"
      icon="!!!COLLECTION"
      headerColor="bg-[#FFDD00]"
      iconBoxColor="bg-white">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
       {[1, 2, 3].map((i) => (
        <div
         key={i}
         className="aspect-video bg-gray-100 border-[4px] border-black rounded-[24px] shadow-[8px_8px_0px_0px_black] relative overflow-hidden group">
         <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-black/20" />
         <div className="absolute bottom-4 left-4 bg-[#FFDD00] px-3 py-1 border-2 border-black font-black uppercase text-[10px] rounded-full shadow-[2px_2px_0px_0px_black]">
          Scene 0{i}
         </div>
         <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
          <button className="bg-white border-3 border-black p-3 rounded-full text-black">
           <ImageIcon size={24} />
          </button>
         </div>
        </div>
       ))}
      </div>
     </AccordionContainer>

     {/* Module 10: Project Roadmap */}
     <AccordionContainer
      title="Project Roadmap"
      icon="!!!PALETTE"
      headerColor="bg-[#FFB158]"
      iconBoxColor="bg-white">
      <div className="bg-white border-[5px] border-black rounded-2xl overflow-hidden shadow-[12px_12px_0px_0px_black]">
       <div className="p-6 border-b-4 border-black font-black uppercase tracking-tighter text-xl bg-gray-50">
        Sprint Cycle 44
       </div>
       <div className="overflow-x-auto">
        <table className="w-full text-black">
         <tbody>
          {[
           { task: "Initial Research", status: "100%", color: "bg-[#ccff00]" },
           { task: "Asset Creation", status: "65%", color: "bg-[#FFB158]" },
           { task: "Final Polish", status: "12%", color: "bg-[#ff3399]" },
          ].map((t, i) => (
           <tr key={i} className="border-b-2 border-black/5">
            <td className="p-4 font-black uppercase text-xs w-2/5">{t.task}</td>
            <td className="p-4 w-3/5">
             <div className="h-4 bg-gray-100 border-2 border-black rounded-full overflow-hidden">
              <div
               className={`h-full border-r-2 border-black ${t.color}`}
               style={{ width: t.status }}
              />
             </div>
            </td>
            <td className="p-4 font-black text-[10px] opacity-40">
             {t.status}
            </td>
           </tr>
          ))}
         </tbody>
        </table>
       </div>
      </div>
     </AccordionContainer>

     {/* Module 11: Hook Architect */}
     <AccordionContainer
      title="Hook Architect"
      icon="!!!COLLECTION"
      headerColor="bg-[#FF7497]"
      iconBoxColor="bg-white">
      <div className="space-y-6">
       <div className="relative">
        <textarea
         className="w-full h-48 bg-gray-50 border-[4px] border-black rounded-[32px] p-8 font-bold text-xl outline-none focus:bg-white transition-all shadow-[8px_8px_0px_0px_black] placeholder:opacity-20"
         placeholder="Paste your script hook here..."
        />
        <button className="absolute bottom-6 right-6 bg-black text-[#FF7497] border-2 border-black px-6 py-3 rounded-2xl font-black uppercase text-xs shadow-[4px_4px_0px_0px_black] hover:translate-x-1 hover:translate-y-1 transition-all">
         ✨ Refine Hook
        </button>
       </div>
       <div className="flex gap-4">
        <span className="bg-[#FF7497]/20 border-2 border-[#FF7497] text-[#FF7497] px-3 py-1 rounded-full text-[10px] font-black uppercase">
         Controversial
        </span>
        <span className="bg-[#ccff00]/20 border-2 border-[#ccff00] text-[#ccff00] px-3 py-1 rounded-full text-[10px] font-black uppercase">
         High Retention
        </span>
       </div>
      </div>
     </AccordionContainer>

     {/* Module 12: Keyword Intelligence */}
     <AccordionContainer
      title="Keyword Intelligence"
      icon="search"
      headerColor="bg-[#B14AED]"
      iconBoxColor="bg-white">
      <div className="space-y-6">
       <div className="relative">
        <Search
         className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20"
         size={24}
        />
        <input
         className="w-full bg-white border-[4px] border-black rounded-full p-6 pl-16 font-black uppercase text-lg shadow-[8px_8px_0px_0px_black] outline-none"
         placeholder="Search Global Data..."
        />
       </div>
       <div className="bg-white border-[4px] border-black rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_black]">
        <div className="grid grid-cols-3 bg-black text-white p-4 font-black uppercase text-[10px] tracking-widest">
         <span>Keyword</span>
         <span>Volume</span>
         <span>Rank</span>
        </div>
        <div className="divide-y-2 divide-black/5">
         {[
          { k: "AI Coding", v: "1.2M", r: "#1" },
          { k: "Agentic Workflow", v: "890K", r: "#4" },
          { k: "Tokyo Pop UI", v: "45K", r: "#12" },
         ].map((row) => (
          <div
           key={row.k}
           className="grid grid-cols-3 p-4 font-bold text-xs hover:bg-[#B14AED]/5 cursor-pointer">
           <span>{row.k}</span>
           <span>{row.v}</span>
           <span className="text-[#B14AED]">{row.r}</span>
          </div>
         ))}
        </div>
       </div>
      </div>
     </AccordionContainer>

     {/* Module 13: Brand Identity */}
     <AccordionContainer
      title="Brand Identity"
      icon="!!!PALETTE"
      headerColor="bg-[#00CCFF]"
      iconBoxColor="bg-white">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
       {[
        { c: "#ff3399", l: "Pink" },
        { c: "#ccff00", l: "Green" },
        { c: "#00ccff", l: "Cyan" },
        { c: "#ffdd00", l: "Yellow" },
        { c: "#ffb158", l: "Orange" },
        { c: "#b14aed", l: "Purple" },
       ].map((p) => (
        <div key={p.l} className="flex flex-col gap-2 group">
         <div
          className="aspect-[4/5] border-[4px] border-black rounded-2xl shadow-[6px_6px_0px_0px_black] relative overflow-hidden transition-all group-hover:-translate-y-2"
          style={{ backgroundColor: p.c }}>
          <div className="absolute inset-x-0 bottom-0 h-12 bg-black/10 backdrop-blur-md border-t-2 border-black/10 p-2 text-[8px] font-black text-white/50 flex items-center justify-center uppercase">
           {p.c}
          </div>
         </div>
         <span className="text-center font-black uppercase text-[10px] opacity-40">
          {p.l}
         </span>
        </div>
       ))}
      </div>
     </AccordionContainer>

     {/* Module 14: System Status */}
     <AccordionContainer
      title="System Status"
      icon="!!!GENERATE2"
      headerColor="bg-[#CCFF00]"
      iconBoxColor="bg-white">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
       {[
        { l: "API Nexus", s: "Online", c: "#00ff99", a: true },
        { l: "Neural Core", s: "Syncing", c: "#ff3399", a: false },
        { l: "DB Cluster", s: "Stable", c: "#00ccff", a: false },
        { l: "Worker_01", s: "Busy", c: "#ffdd00", a: true },
       ].map((sys) => (
        <div
         key={sys.l}
         className="bg-white border-[3px] border-black p-6 rounded-2xl shadow-[4px_4px_0px_0px_black] flex flex-col items-center gap-4">
         <div
          className={`w-12 h-12 rounded-full border-[4px] border-black ${sys.a ? "animate-pulse" : ""}`}
          style={{ backgroundColor: sys.c }}
         />
         <div className="text-center">
          <div className="font-black uppercase text-[10px]">{sys.l}</div>
          <div className="text-[9px] font-bold opacity-40 uppercase tracking-widest">
           {sys.s}
          </div>
         </div>
        </div>
       ))}
      </div>
     </AccordionContainer>

     {/* Module 15: User Feedback */}
     <AccordionContainer
      title="User Feedback"
      icon="search"
      headerColor="bg-[#FFDD00]"
      iconBoxColor="bg-white">
      <div className="space-y-4">
       <div className="flex gap-4">
        <div className="w-12 h-12 bg-black border-[3px] border-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_#FFDD00]">
         <MessageSquare className="text-white" />
        </div>
        <div className="flex-1 bg-white border-[3px] border-black rounded-3xl p-4 shadow-[4px_4px_0px_0px_black] relative">
         <p className="font-bold text-sm">
          "The new analytics protocol is completely game-changing. 10/10."
         </p>
         <div className="absolute -left-2 top-4 w-4 h-4 bg-white border-l-[3px] border-b-[3px] border-black rotate-45" />
        </div>
       </div>
       <div className="flex gap-4 flex-row-reverse">
        <div className="w-12 h-12 bg-[#CCFF00] border-[3px] border-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_black]">
         <Zap />
        </div>
        <div className="flex-1 bg-black text-white border-[3px] border-black rounded-3xl p-4 shadow-[4px_4px_0px_0px_#CCFF00] relative">
         <p className="font-bold text-sm">
          Agreed. The viral pathing logic is very accurate this week.
         </p>
         <div className="absolute -right-2 top-4 w-4 h-4 bg-black border-r-[3px] border-t-[3px] border-black rotate-45" />
        </div>
       </div>
      </div>
     </AccordionContainer>

     {/* Module 16: Media Analyzer */}
     <AccordionContainer
      title="Media Analyzer"
      icon="!!!COLLECTION"
      headerColor="bg-[#FFB158]"
      iconBoxColor="bg-white">
      <div className="space-y-6">
       <div className="bg-white border-[4px] border-black rounded-[32px] p-10 flex items-center gap-10 shadow-[8px_8px_0px_0px_black]">
        <div className="w-32 h-32 bg-gray-100 border-[3px] border-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_black] shrink-0">
         <RefreshCw className="animate-spin text-black/20" size={48} />
        </div>
        <div className="flex-1 space-y-4">
         <div className="flex justify-between font-black uppercase text-xs">
          <span>Analyzing Footage...</span>
          <span className="text-[#FFB158]">74%</span>
         </div>
         <div className="h-6 bg-gray-100 border-[3px] border-black rounded-full overflow-hidden">
          <div
           className="h-full bg-[#FFB158] border-r-[3px] border-black transition-all duration-500"
           style={{ width: "74%" }}
          />
         </div>
         <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
          Parsing frames for retention triggers
         </p>
        </div>
       </div>
      </div>
     </AccordionContainer>

     {/* Module 17: Viral Predictor */}
     <AccordionContainer
      title="Viral Predictor"
      icon="!!!ANALYTICS"
      headerColor="bg-[#FF7497]"
      iconBoxColor="bg-white">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
       {[
        { l: "Hook Strength", v: "92", c: "#FF7497" },
        { l: "Pacing Score", v: "78", c: "#ccff00" },
        { l: "Thumbnail CTR", v: "85", c: "#00ccff" },
       ].map((stat) => (
        <div
         key={stat.l}
         className="bg-white border-[4px] border-black rounded-[40px] p-8 flex flex-col items-center shadow-[8px_8px_0px_0px_black] relative overflow-hidden">
         <div
          className="absolute top-0 inset-x-0 h-2"
          style={{ backgroundColor: stat.c }}
         />
         <div className="text-5xl font-[1000] tracking-tighter mb-2">
          {stat.v}%
         </div>
         <div className="font-black uppercase text-[10px] opacity-40">
          {stat.l}
         </div>
        </div>
       ))}
      </div>
     </AccordionContainer>

     {/* Module 18: Asset Vault */}
     <AccordionContainer
      title="Asset Vault"
      icon="!!!GENERATE1"
      headerColor="bg-[#B14AED]"
      iconBoxColor="bg-white">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
       {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div
         key={i}
         className="bg-white border-[3px] border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_black] flex flex-col items-center gap-3 group hover:-translate-y-1 transition-all">
         <div className="w-12 h-12 bg-gray-100 border-2 border-black rounded-xl flex items-center justify-center group-hover:bg-[#B14AED]/10">
          <FileCode className="text-black/30 group-hover:text-[#B14AED]" />
         </div>
         <span className="font-black text-[9px] uppercase tracking-widest text-center line-clamp-1">
          Asset_Protocol_{i}.ts
         </span>
         <button className="text-black/20 hover:text-red-500 transition-colors">
          <Trash2 size={14} />
         </button>
        </div>
       ))}
      </div>
     </AccordionContainer>

     {/* Module 19: Algorithm Sync */}
     <AccordionContainer
      title="Algorithm Sync"
      icon="image"
      headerColor="bg-[#00CCFF]"
      iconBoxColor="bg-white">
      <div className="space-y-6">
       <div className="bg-black p-6 rounded-[24px] shadow-[8px_8px_0px_0px_black] border-2 border-white/10 font-mono text-[10px] text-[#00CCFF] min-h-[12rem]">
        {">"} INITIATING_NEURAL_LINK... OK
        <br />
        {">"} SYNCING_AUDIENCE_PROFILES... [32,442 RECORDS]
        <br />
        {">"} PARSING_RETENTION_GRAPHS... DONE
        <br />
        {">"} WARNING: UNUSUAL_SPIKE_IN_SPAIN
        <br />
        {">"} SUGGESTING_LOCALIZED_CAPTIONING
        <br />
        {">"} IDLE.
       </div>
       <button className="w-full bg-[#00CCFF] border-[4px] border-black rounded-2xl p-5 font-[1000] uppercase tracking-tighter text-2xl shadow-[8px_8px_0px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
        Invoke Oracle
       </button>
      </div>
     </AccordionContainer>

     {/* Module 20: Global Settings */}
     <AccordionContainer
      title="Global Settings"
      icon="!!!TEXT"
      headerColor="bg-[#CCFF00]"
      iconBoxColor="bg-white">
      <div className="space-y-10">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-4">
         <h5 className="font-black uppercase text-xs opacity-40 ml-1">
          Protocol Toggles
         </h5>
         <div className="space-y-4">
          {[
           { l: "Auto-Pathing", v: true },
           { l: "Strict Branding", v: false },
           { l: "Haptic Feedback", v: true },
          ].map((t) => (
           <div
            key={t.l}
            className="flex justify-between items-center bg-white border-[3px] border-black p-4 rounded-2xl shadow-[4px_4px_0px_0px_black]">
            <span className="font-black uppercase text-xs">{t.l}</span>
            <div
             className={`w-14 h-8 border-[3px] border-black rounded-full p-1 cursor-pointer transition-colors ${t.v ? "bg-[#ccff00]" : "bg-gray-200"}`}>
             <div
              className={`w-5 h-5 bg-white border-[3px] border-black rounded-full transform transition-transform ${t.v ? "translate-x-6" : "translate-x-0"}`}
             />
            </div>
           </div>
          ))}
         </div>
        </div>
        <div className="space-y-4">
         <h5 className="font-black uppercase text-xs opacity-40 ml-1">
          Segmented Controls
         </h5>
         <div className="bg-black p-2 rounded-2xl flex gap-2 border-[3px] border-black shadow-[4px_4px_0px_0px_black]">
          {["Fast", "Normal", "Deep"].map((s) => (
           <button
            key={s}
            className={`flex-1 py-3 font-black uppercase text-[10px] rounded-xl transition-all ${s === "Normal" ? "bg-[#ccff00] text-black shadow-inner" : "text-white/40 hover:text-white"}`}>
            {s}
           </button>
          ))}
         </div>
        </div>
       </div>
      </div>
     </AccordionContainer>
    </div>
   </ErrorBoundary>
   {/* ------------------------------------------------------------- */}
   {/* SECTION D: ADVANCED TOOL ARCHITECTURES */}
   {/* ------------------------------------------------------------- */}
   <div className="p-12 border-b-[12px] border-black bg-white mb-20 text-black mt-40">
    <div className="max-w-[1400px] mx-auto text-center">
     <h2 className="text-4xl font-[1000] uppercase italic tracking-tighter bg-[#FF3399] text-white inline-block px-10 py-4 rounded-2xl border-[4px] border-black shadow-[8px_8px_0px_0px_black]">
      SECTION D: Advanced Tool Architectures
     </h2>
     <p className="mt-6 font-black uppercase text-sm opacity-50 tracking-widest text-black">
      Deep-dive into multi-column layouts, workflow dropzones, and complex data
      matrices.
     </p>
    </div>
   </div>

   <div className="max-w-[1400px] mx-auto px-4 space-y-20">
    <ErrorBoundary componentName="Advanced Tool Architectures">
     {/* 1. SYSTEM */}
     <div className="w-full bg-white border-[5px] border-black rounded-2xl shadow-[12px_12px_0px_0px_black] overflow-hidden flex flex-col">
      <header className="bg-[#ccff00] h-[80px] border-b-[5px] border-black flex items-center px-0 text-black">
       <div className="bg-[#ff3399] h-full w-[80px] flex items-center justify-center border-r-[5px] border-black">
        <Settings2 size={40} className="text-white" />
       </div>
       <h1 className="text-[40px] font-black uppercase tracking-tighter pl-8 text-black">
        SYSTEM CONFIGURATION
       </h1>
      </header>
      <div className="p-8 bg-gray-50 grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
       <div className="bg-white border-[4px] border-black rounded-3xl p-8 shadow-[8px_8px_0_0_black] space-y-6">
        <h3 className="font-black uppercase text-xl border-b-4 border-black pb-2 flex items-center gap-2">
         <Settings2 size={20} /> Inputs
        </h3>
        <div className="space-y-4">
         <input
          type="text"
          placeholder="Title..."
          className="w-full bg-white border-4 border-black rounded-xl p-4 font-bold shadow-[4px_4px_0_0_black] outline-none"
         />
         <textarea
          placeholder="Description..."
          className="w-full h-32 bg-white border-4 border-black rounded-xl p-4 font-bold shadow-[4px_4px_0_0_black] outline-none"
         />
        </div>
       </div>
       <div className="bg-white border-[4px] border-black rounded-3xl p-8 shadow-[8px_8px_0_0_black] space-y-6">
        <h3 className="font-black uppercase text-xl border-b-4 border-black pb-2 flex items-center gap-2">
         <MousePointer2 size={20} /> Controls
        </h3>
        <div className="flex items-center justify-between bg-gray-100 p-4 border-2 border-black rounded-xl shadow-[4px_4px_0_0_black]">
         <span className="font-black uppercase text-sm text-black">
          Strict Mode
         </span>
         <div
          onClick={() => setIsToggled(!isToggled)}
          className={`w-14 h-8 border-4 border-black rounded-full p-1 cursor-pointer ${isToggled ? "bg-[#ccff00]" : "bg-gray-300"}`}>
          <div
           className={`w-5 h-5 bg-white border-[3px] border-black rounded-full transition-transform ${isToggled ? "translate-x-6" : "translate-x-0"}`}
          />
         </div>
        </div>
       </div>
       <div className="bg-white border-[4px] border-black rounded-3xl p-8 shadow-[8px_8px_0_0_black] space-y-6">
        <h3 className="font-black uppercase text-xl border-b-4 border-black pb-2 flex items-center gap-2">
         <Zap size={20} /> Params
        </h3>
        <div className="p-1 bg-black rounded-xl flex gap-1">
         {["Daily", "Weekly"].map((tab) => (
          <button
           key={tab}
           onClick={() => setActiveTab(tab)}
           className={`flex-1 py-3 font-black uppercase text-[10px] rounded-lg ${activeTab === tab ? "bg-[#ccff00] text-black" : "text-white"}`}>
           {tab}
          </button>
         ))}
        </div>
       </div>
      </div>
     </div>

     {/* 2. MEDIA */}
     <div className="w-full bg-white border-[5px] border-black rounded-2xl shadow-[12px_12px_0_0_black] overflow-hidden flex flex-col">
      <header className="bg-[#B14AED] h-[80px] border-b-5 border-black flex items-center text-white">
       <div className="bg-[#FFDD00] h-full w-[80px] flex items-center justify-center border-r-5 border-black">
        <Layout size={40} className="text-black" />
       </div>
       <h1 className="text-[40px] font-black uppercase tracking-tighter pl-8">
        MEDIA HUB
       </h1>
      </header>
      <div className="p-8 bg-gray-50">
       <div className="bg-black p-0 rounded-3xl overflow-hidden border-4 border-black relative">
        <div className="h-6 opacity-60 text-white">
         <SprocketHoles count={24} color="white" />
        </div>
        <div className="bg-gray-900 p-20 flex flex-col items-center justify-center text-center">
         <div className="w-20 h-20 bg-white border-4 border-black rounded-2xl flex items-center justify-center shadow-[6px_6px_0_0_#00ccff] mb-4">
          <ImageIcon className="text-[#00ccff]" size={40} />
         </div>
         <h4 className="text-white font-black uppercase text-2xl italic">
          Roll Assets
         </h4>
        </div>
        <div className="h-6 opacity-60 text-white">
         <SprocketHoles count={24} color="white" />
        </div>
       </div>
      </div>
     </div>

     {/* 3. ANALYTICS */}
     <div className="w-full bg-white border-5 border-black rounded-2xl shadow-[12px_12px_0_0_black] overflow-hidden flex flex-col">
      <header className="bg-black h-80 border-b-5 border-black flex items-center text-[#00ccff]">
       <div className="bg-[#00ccff] h-full w-[80px] flex items-center justify-center border-r-5 border-black">
        <BarChart3 size={40} className="text-black" />
       </div>
       <h1 className="text-[40px] font-black uppercase tracking-tighter pl-8 text-[#00ccff]">
        ANALYTICS
       </h1>
      </header>
      <div className="p-8 bg-gray-50 grid grid-cols-2 lg:grid-cols-4 gap-6">
       {[
        { l: "Views", v: "1.2M", c: "#00ccff" },
        { l: "CTR", v: "8.4%", c: "#ff3399" },
       ].map((s, i) => (
        <div
         key={i}
         className="bg-white border-4 border-black rounded-2xl p-6 shadow-[6px_6px_0_0_black] text-left">
         <span className="text-[10px] font-black uppercase opacity-50 block text-black">
          {s.l}
         </span>
         <span className="text-4xl font-black tracking-tighter text-black">
          {s.v}
         </span>
        </div>
       ))}
      </div>
     </div>

     {/* 4. OVERLAYS */}
     <div className="w-full bg-white border-5 border-black rounded-2xl shadow-[12px_12px_0_0_black] overflow-hidden flex flex-col mb-40">
      <header className="bg-[#ffb158] h-80 border-b-5 border-black flex items-center text-black">
       <div className="bg-black h-full w-[80px] flex items-center justify-center border-r-5 border-black">
        <Layers size={40} className="text-[#ffb158]" />
       </div>
       <h1 className="text-[40px] font-black uppercase tracking-tighter pl-8">
        WIDGETS
       </h1>
      </header>
      <div className="p-8 bg-gray-50 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
       <div className="bg-white border-4 border-black rounded-3xl p-8 shadow-[8px_8px_0_0_black] text-black">
        <button className="bg-black text-white px-8 py-4 rounded-xl font-black uppercase shadow-[8px_8px_0_0_#ccff00]">
         Action Hook
        </button>
       </div>
       <div className="bg-white border-4 border-black rounded-3xl p-8 shadow-[8px_8px_0_0_black] text-black">
        <div className="border-4 border-black rounded-2xl overflow-hidden shadow-[6px_6px_0_0_black]">
         <div className="p-5 font-black uppercase bg-[#00ccff] border-b-4 border-black text-left">
          Protocol Status
         </div>
         <div className="bg-white p-6 font-bold text-sm text-left">
          Operational.
         </div>
        </div>
       </div>
      </div>
     </div>

     {/* ------------------------------------------------------------- */}
     {/* SECTION E: ELITE NEO-BRUTALIST TOOL ARCHITECTURES (10 TOOLS) */}
     {/* ------------------------------------------------------------- */}
     <div className="p-12 border-b-[12px] border-black bg-white mb-20 text-black mt-40">
      <div className="max-w-[1400px] mx-auto text-center">
       <h2 className="text-4xl font-[1000] uppercase italic tracking-tighter bg-[#ccff00] text-black inline-block px-10 py-4 rounded-2xl border-[4px] border-black shadow-[8px_8px_0px_0px_black]">
        SECTION E: 10 Elite Tool Architectures
       </h2>
       <p className="mt-8 font-black uppercase text-sm opacity-50 tracking-[0.2em] text-black">
        The definitive library of interactive, perfectly formatted Neo-Brutalist
        components.
       </p>
      </div>
     </div>

     {/* Tool 1: Color & Style Matrix */}
     <EliteToolBlock
      title="Color & Style Matrix"
      icon={Palette}
      headerColor="bg-[#00CCFF]"
      iconBgColor="bg-[#FF3399]">
      <div className="space-y-12">
       <div className="space-y-4">
        <h3 className="font-black uppercase text-sm tracking-widest text-black/40 mb-2 border-b-[4px] border-black/10 pb-2">
         Palette Integrator
        </h3>
        <ColorPaletteSelector />
       </div>
       <div className="space-y-4">
        <h3 className="font-black uppercase text-sm tracking-widest text-black/40 mb-2 border-b-[4px] border-black/10 pb-2">
         Style Classification
        </h3>
        <StyleCategoryGrid />
       </div>
      </div>
     </EliteToolBlock>

     {/* Tool 2: Calendar & Task Engine */}
     <EliteToolBlock
      title="Calendar & Task Engine"
      icon={Calendar}
      headerColor="bg-[#CCFF00]"
      iconBgColor="bg-black">
      <CalendarAndTasks />
     </EliteToolBlock>

     {/* Tool 3: Deep Data Hierarchy */}
     <EliteToolBlock
      title="Deep Data Hierarchy"
      icon={Database}
      headerColor="bg-[#FF3399]"
      iconBgColor="bg-[#CCFF00]"
      headerText="text-white">
      <NestedTables />
     </EliteToolBlock>

     {/* Tool 4: Input & Text Foundry */}
     <EliteToolBlock
      title="Input & Text Foundry"
      icon={Type}
      headerColor="bg-[#FFDD00]"
      iconBgColor="bg-[#00CCFF]">
      <InputAndTextFoundry />
     </EliteToolBlock>

     {/* Tool 5: Visual Ranges & Sliders */}
     <EliteToolBlock
      title="Visual Ranges & Sliders"
      icon={Sliders}
      headerColor="bg-[#B14AED]"
      iconBgColor="bg-[#FFDD00]"
      headerText="text-white">
      <VisualSlidersAndRings />
     </EliteToolBlock>

     {/* Tool 6: Loader & Skeleton Bay */}
     <EliteToolBlock
      title="Loader & Skeleton Bay"
      icon={RefreshCw}
      headerColor="bg-black"
      iconBgColor="bg-[#FF3399]"
      headerText="text-white">
      <LoaderAndSkeletonBay />
     </EliteToolBlock>

     {/* Tool 7: Graph & Chart Sandbox */}
     <EliteToolBlock
      title="Graph & Chart Sandbox"
      icon={BarChart3}
      headerColor="bg-[#00CCFF]"
      iconBgColor="bg-[#FFB158]">
      <CustomChartsEngine />
     </EliteToolBlock>

     {/* Tool 8: Menu & Tree Navigation */}
     <EliteToolBlock
      title="Menu & Tree Navigation"
      icon={List}
      headerColor="bg-[#FFB158]"
      iconBgColor="bg-[#B14AED]">
      <MenuAndTreeNav />
     </EliteToolBlock>

     {/* Tool 9: Dashboard Widget Array */}
     <EliteToolBlock
      title="Dashboard Widget Array"
      icon={Layout}
      headerColor="bg-[#CCFF00]"
      iconBgColor="bg-[#FF7497]">
      <DashboardWidgets />
     </EliteToolBlock>

     {/* Tool 10: Dialogue & Pop-out Engine */}
     <EliteToolBlock
      title="Dialogue & Pop-out Engine"
      icon={MessageSquare}
      headerColor="bg-[#FF7497]"
      iconBgColor="bg-[#00CCFF]">
      <DialoguePopouts />
     </EliteToolBlock>
    </ErrorBoundary>

    {/* ------------------------------------------------------------- */}
    {/* SECTION G: NATIVE NEO-BRUTALIST UI KIT (React/Tailwind) */}
    {/* ------------------------------------------------------------- */}
    <EliteToolBlock
     title="Section G: Native UI Kit"
     icon={Palette}
     headerColor="bg-[#CCFF00]"
     iconBgColor="bg-[#FF3399]">
     <NativeUIKit />
    </EliteToolBlock>

    {/* ------------------------------------------------------------- */}
    {/* SECTION H: CLAUDE UI COMPONENT LIBRARY (Neo-Brutalist v2) */}
    {/* ------------------------------------------------------------- */}
    <div className="mb-20">
     {/* 02 - Style Chips & KPI Stats */}
     <EliteToolBlock
      title="02 — Style Chips & Filters"
      icon={Sliders}
      headerColor="bg-[#00CCFF]"
      iconBgColor="bg-black"
      headerText="text-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
       {/* KPI Stats on Left */}
       <div className="bg-white border-[4px] border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_black]">
        <div className="grid grid-cols-3 gap-4">
         <div className="bg-white border-[3px] border-black rounded-xl p-4 text-center">
          <div className="text-[10px] font-black uppercase opacity-40 mb-2">
           Subscribers
          </div>
          <div className="text-2xl font-[1000]">9.3K</div>
          <div className="text-[10px] font-black uppercase text-pink-500 mt-1">
           +12% this week
          </div>
         </div>
         <div className="bg-white border-[3px] border-black rounded-xl p-4 text-center">
          <div className="text-[10px] font-black uppercase opacity-40 mb-2">
           Avg CTR
          </div>
          <div className="text-2xl font-[1000]">6.8%</div>
          <div className="text-[10px] font-black uppercase text-lime-500 mt-1">
           +0.4%
          </div>
         </div>
         <div className="bg-white border-[3px] border-black rounded-xl p-4 text-center">
          <div className="text-[10px] font-black uppercase opacity-40 mb-2">
           Watch Time
          </div>
          <div className="text-2xl font-[1000]">4.2h</div>
          <div className="text-[10px] font-black uppercase text-cyan-500 mt-1">
           -5%
          </div>
         </div>
        </div>
       </div>

       {/* Style Chips on Right */}
       <div className="bg-white border-[4px] border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_black]">
        <StyleChipRow
         chips={[
          { label: "Graphic", color: "pink", active: true },
          { label: "Minimalist", color: "lime", active: true },
          { label: "Cinematic", color: "cyan", active: true },
          { label: "Vibrant", color: "yellow", active: true },
          { label: "Futuristic", color: "orange", active: true },
          { label: "Mysterious", color: "purple", active: true },
          { label: "Dark & Moody", color: "pink", active: true },
          { label: "Retro/Vintage", color: "lime", active: true },
          { label: "Simplified", color: "cyan", active: true },
         ]}
        />
       </div>
      </div>
     </EliteToolBlock>

     {/* 04 - Toggles, Checkboxes, Radios */}
     <EliteToolBlock
      title="04 — Toggles · Checkboxes · Radios"
      icon={Settings2}
      headerColor="bg-[#CCFF00]"
      iconBgColor="bg-black">
      <div className="grid grid-cols-3 gap-6">
       {/* Toggles Column */}
       <div className="bg-white border-[4px] border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_black]">
        <div className="font-black uppercase text-sm mb-4 text-center border-b-[3px] border-black pb-2">
         Toggles
        </div>
        <div className="space-y-3">
         <Toggle active={true} color="pink" />
         <Toggle active={true} color="lime" />
         <Toggle active={true} color="cyan" />
         <Toggle active={false} color="white" />
        </div>
       </div>

       {/* Checkboxes Column */}
       <div className="bg-white border-[4px] border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_black]">
        <div className="font-black uppercase text-sm mb-4 text-center border-b-[3px] border-black pb-2">
         Checkboxes
        </div>
        <div className="space-y-3">
         <Checkbox active={true} color="pink" />
         <Checkbox active={true} color="lime" />
         <Checkbox active={true} color="cyan" />
         <Checkbox active={false} color="white" />
        </div>
       </div>

       {/* Radios Column */}
       <div className="bg-white border-[4px] border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_black]">
        <div className="font-black uppercase text-sm mb-4 text-center border-b-[3px] border-black pb-2">
         Radios
        </div>
        <div className="space-y-3">
         <Radio active={true} groupName="rg1" color="pink" />
         <Radio active={true} groupName="rg1" color="lime" />
         <Radio active={true} groupName="rg1" color="cyan" />
         <Radio active={false} groupName="rg1" color="white" />
        </div>
       </div>
      </div>
     </EliteToolBlock>

     {/* 05 - Form Fields */}
     <EliteToolBlock
      title="05 — Text Inputs & Form Fields"
      icon={Type}
      headerColor="bg-black"
      iconBgColor="bg-[#00CCFF]"
      headerText="text-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
       {/* Form Fields on Left */}
       <div className="bg-white border-[4px] border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_black]">
        <div className="space-y-4">
         <FormField label="Channel URL" placeholder="https://youtube.com/…" />
         <FormField label="Channel Goal" value="Reach 10K Subscribers" />
         <FormField
          label="Category"
          type="select"
          options={["Growth", "Analytics", "Content", "Monetization"]}
         />
        </div>
       </div>

       {/* Daily Stats on Right */}
       <div className="bg-white border-[4px] border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_black]">
        <DailyStats
         title="Daily Stats"
         data={[
          {
           metric: "Views",
           today: "3,214",
           delta: "+14%",
           deltaDirection: "up",
          },
          {
           metric: "Clicks",
           today: "261",
           delta: "+7%",
           deltaDirection: "up",
          },
          {
           metric: "Watch Time",
           today: "2.1h",
           delta: "-3%",
           deltaDirection: "down",
          },
          {
           metric: "Revenue",
           today: "$48",
           delta: "+21%",
           deltaDirection: "up",
          },
         ]}
        />
       </div>
      </div>
     </EliteToolBlock>

     {/* 09 - KPI Stat Cards */}
     <EliteToolBlock
      title="09 — KPI Stat Cards"
      icon={TrendingUp}
      headerColor="bg-[#FF3399]"
      iconBgColor="bg-[#CCFF00]"
      headerText="text-white">
      <KPIStatRow
       stats={[
        {
         label: "Subscribers",
         value: "9.3K",
         delta: "12% this week",
         deltaDirection: "up",
         color: "pink",
        },
        {
         label: "Avg CTR",
         value: "6.8%",
         delta: "0.4%",
         deltaDirection: "up",
         color: "lime",
        },
        {
         label: "Watch Time",
         value: "4.2h",
         delta: "5%",
         deltaDirection: "down",
         color: "cyan",
        },
        {
         label: "Revenue",
         value: "$912",
         delta: "18%",
         deltaDirection: "up",
         color: "yellow",
        },
        {
         label: "Impressions",
         value: "56K",
         delta: "8%",
         deltaDirection: "up",
         color: "orange",
        },
        { label: "Videos", value: "248", delta: "All time", color: "purple" },
       ]}
      />
     </EliteToolBlock>

     {/* 10 - Daily Stats */}
     <EliteToolBlock
      title="10 — Daily Stats"
      icon={BarChart3}
      headerColor="bg-[#CCFF00]"
      iconBgColor="bg-black">
      <DailyStats
       title="Daily Stats"
       data={[
        {
         metric: "Views",
         today: "3,214",
         delta: "+14%",
         deltaDirection: "up",
        },
        { metric: "Clicks", today: "261", delta: "+7%", deltaDirection: "up" },
        {
         metric: "Watch Time",
         today: "2.1h",
         delta: "-3%",
         deltaDirection: "down",
        },
        {
         metric: "Revenue",
         today: "$48",
         delta: "+21%",
         deltaDirection: "up",
        },
       ]}
      />
     </EliteToolBlock>

     {/* 13 - Sidebar */}
     <EliteToolBlock
      title="13 — Sidebar Navigation"
      icon={List}
      headerColor="bg-[#FFDD00]"
      iconBgColor="bg-black">
      <div className="max-w-md mx-auto">
       <Sidebar
        logo="UsTube"
        badges={[
         { label: "AI Powered", color: "lime" },
         { label: "Beta", color: "black" },
        ]}
        links={[
         { icon: "📊", label: "Studio Hub" },
         { icon: "🔬", label: "Research Lab", active: true },
         { icon: "🎬", label: "Video Manager" },
         { icon: "⚡", label: "Growth Ideas" },
         { icon: "📈", label: "Dashboard" },
         { icon: "📖", label: "User Guide" },
         { icon: "⚙", label: "Settings" },
        ]}
        statusBadge={{ label: "GEMINI API ACTIVE", active: true }}
       />
      </div>
     </EliteToolBlock>

     {/* 14 - Channel Tree */}
     <EliteToolBlock
      title="14 — Collapsible Tree"
      icon={List}
      headerColor="bg-[#FFB158]"
      iconBgColor="bg-black"
      headerText="text-white">
      <div className="max-w-md mx-auto bg-white border-[4px] border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_black]">
       <ChannelTree
        items={[
         {
          label: "Channel Assets",
          icon: "📁",
          children: [
           {
            label: "Videos",
            icon: "🎬",
            children: [
             { label: "Episode 1 — Beach Day", isLeaf: true },
             { label: "Episode 2 — Sunset Hike", isLeaf: true },
             { label: "AI Tools Review (Draft)", isLeaf: true },
            ],
           },
           {
            label: "Thumbnails",
            icon: "🖼",
            children: [
             { label: "thumb_ep1_v3.png", isLeaf: true },
             { label: "thumb_ep2_final.png", isLeaf: true },
            ],
           },
           { label: "📊 Analytics Export", isLeaf: true },
           { label: "📝 Script Templates", isLeaf: true },
          ],
         },
        ]}
       />
      </div>
     </EliteToolBlock>

     {/* 17 - Tooltips */}
     <EliteToolBlock
      title="17 — Tooltips"
      icon={Info}
      headerColor="bg-[#00CCFF]"
      iconBgColor="bg-black"
      headerText="text-white">
      <div className="flex flex-wrap gap-6 justify-center">
       <TooltipSimple content="AI-powered daily actions">
        <button className="px-5 py-2.5 bg-[#FF3399] text-white border-[3px] border-black rounded-md font-black text-[13px] uppercase tracking-wide shadow-[4px_4px_0_black] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all">
         ⚡ Generate
        </button>
       </TooltipSimple>
       <TooltipSimple content="Sync channel data now">
        <button className="px-5 py-2.5 bg-[#CCFF00] border-[3px] border-black rounded-md font-black text-[13px] uppercase tracking-wide shadow-[4px_4px_0_black] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all">
         ↗ Sync
        </button>
       </TooltipSimple>
       <TooltipSimple content="Copies to clipboard">
        <button className="px-5 py-2.5 bg-black text-white border-[3px] border-black rounded-md font-black text-[13px] uppercase tracking-wide shadow-[4px_4px_0_black] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all">
         Copy
        </button>
       </TooltipSimple>
      </div>
     </EliteToolBlock>

     {/* 18 - Modal */}
     <EliteToolBlock
      title="18 — Modal Dialog"
      icon={MessageSquare}
      headerColor="bg-[#FF3399]"
      iconBgColor="bg-[#00CCFF]"
      headerText="text-white">
      <div className="text-center">
       <button
        onClick={() => setIsModalOpen(true)}
        className="px-8 py-4 bg-[#FF3399] text-white border-[4px] border-black rounded-[16px] font-black text-[16px] uppercase tracking-wide shadow-[8px_8px_0_black] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all">
        Open Modal ↗
       </button>

       <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="⚡ Generate Tactics"
        headerColor="pink"
        footer={
         <>
          <button
           onClick={() => setIsModalOpen(false)}
           className="px-5 py-2.5 bg-white border-[3px] border-black rounded-md font-black text-[13px] uppercase tracking-wide shadow-[3px_3px_0_black] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
           Cancel
          </button>
          <button
           onClick={() => setIsModalOpen(false)}
           className="px-5 py-2.5 bg-[#FF3399] text-white border-[3px] border-black rounded-md font-black text-[13px] uppercase tracking-wide shadow-[3px_3px_0_black] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
           ⚡ Generate
          </button>
         </>
        }>
        <p className="font-black text-[14px] tracking-wide leading-relaxed mb-4">
         AI will scan your channel telemetry and generate personalized daily
         success actions based on your goals.
        </p>
        <FormField
         label="Focus Area"
         type="select"
         options={["Growth", "Monetization", "Engagement"]}
        />
        <div className="mt-4">
         <Toggle
          label="Include competitor analysis"
          color="cyan"
          active={true}
         />
        </div>
       </Modal>
      </div>
     </EliteToolBlock>

      {/* 22 - Video Cards */}
      <EliteToolBlock
       title="22 — Video Cards"
       icon={ImageIcon}
       headerColor="bg-[#CCFF00]"
       iconBgColor="bg-[#FF3399]">
       <VideoCardGrid
        videos={[
         {
          title: "Sample Video One",
          views: "22.1K",
          ctr: "9.3%",
          duration: "22:14",
          status: "LIVE",
          placeholderIcon: "🏖",
         },
         {
          title: "Sample Video Two",
          views: "47.2K",
          ctr: "8.1%",
          duration: "35:07",
          status: "SCHED",
          placeholderIcon: "⚔️",
          gradientColors: ["#9B59FF", "#FF3399"],
         },
         {
          title: "Sample Video Three",
          duration: "41:22",
          status: "DRAFT",
          placeholderIcon: "👑",
          gradientColors: ["#000000", "#333333"],
         },
        ]}
       />
      </EliteToolBlock>

      {/* Toolbox Baseline Coverage - Visual Components */}
      <EliteToolBlock
       title="Toolbox Baseline Coverage"
       icon={Layers}
       headerColor="bg-[#B14AED]"
       iconBgColor="bg-white">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Dashboard */}
        <div className="bg-white border-[4px] border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_black]">
         <div className="font-black uppercase text-sm mb-4 text-center border-b-[3px] border-black pb-2">
          Dashboard
         </div>
         <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#00CCFF] border-[3px] border-black rounded-xl p-4 text-center">
           <div className="text-[10px] font-black uppercase opacity-60">Views</div>
           <div className="text-2xl font-[1000]">8,402</div>
          </div>
          <div className="bg-[#FF3399] border-[3px] border-black rounded-xl p-4 text-center">
           <div className="text-[10px] font-black uppercase opacity-60">CTR</div>
           <div className="text-2xl font-[1000]">12%</div>
          </div>
          <div className="bg-[#CCFF00] border-[3px] border-black rounded-xl p-4 text-center">
           <div className="text-[10px] font-black uppercase opacity-60">Watch</div>
           <div className="text-2xl font-[1000]">4.2h</div>
          </div>
          <div className="bg-[#FFDD00] border-[3px] border-black rounded-xl p-4 text-center">
           <div className="text-[10px] font-black uppercase opacity-60">Rev</div>
           <div className="text-2xl font-[1000]">$912</div>
          </div>
         </div>
        </div>

        {/* Strategy (Projects) */}
        <div className="bg-white border-[4px] border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_black]">
         <div className="font-black uppercase text-sm mb-4 text-center border-b-[3px] border-black pb-2">
          Strategy (Projects)
         </div>
         <div className="space-y-3">
          <div className="bg-white border-[3px] border-black rounded-xl p-4 flex items-center justify-between shadow-[4px_4px_0px_0px_black]">
           <span className="font-black uppercase text-sm">Project Alpha</span>
           <span className="bg-[#CCFF00] border-2 border-black px-3 py-1 rounded-full text-[10px] font-black uppercase">Active</span>
          </div>
          <div className="bg-white border-[3px] border-black rounded-xl p-4 flex items-center justify-between shadow-[4px_4px_0px_0px_black]">
           <span className="font-black uppercase text-sm">Project Beta</span>
           <span className="bg-[#FFB158] border-2 border-black px-3 py-1 rounded-full text-[10px] font-black uppercase">Planning</span>
          </div>
         </div>
        </div>

        {/* Studio Hub */}
        <div className="bg-white border-[4px] border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_black]">
         <div className="font-black uppercase text-sm mb-4 text-center border-b-[3px] border-black pb-2">
          Studio Hub
         </div>
         <div className="space-y-3">
          <div className="bg-white border-[3px] border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_black]">
           <div className="text-[10px] font-black uppercase opacity-40 mb-2">Input Field</div>
           <input type="text" placeholder="Enter title..." className="w-full bg-gray-50 border-[2px] border-black rounded-lg p-2 text-sm font-bold outline-none" />
          </div>
          <button className="w-full bg-[#FF3399] text-white border-[3px] border-black rounded-xl p-3 font-black uppercase text-sm shadow-[4px_4px_0px_0px_black]">
           Generate
          </button>
         </div>
        </div>

        {/* Shorts Studio */}
        <div className="bg-white border-[4px] border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_black]">
         <div className="font-black uppercase text-sm mb-4 text-center border-b-[3px] border-black pb-2">
          Shorts Studio
         </div>
         <div className="flex gap-2 justify-center">
          <div className="bg-[#FF3399] border-[3px] border-black rounded-xl p-4 text-center min-w-[80px]">
           <div className="text-2xl font-[1000]">92%</div>
           <div className="text-[10px] font-black uppercase opacity-60">Hook</div>
          </div>
          <div className="bg-[#CCFF00] border-[3px] border-black rounded-xl p-4 text-center min-w-[80px]">
           <div className="text-2xl font-[1000]">78%</div>
           <div className="text-[10px] font-black uppercase opacity-60">Pacing</div>
          </div>
          <div className="bg-[#00CCFF] border-[3px] border-black rounded-xl p-4 text-center min-w-[80px]">
           <div className="text-2xl font-[1000]">85%</div>
           <div className="text-[10px] font-black uppercase opacity-60">CTR</div>
          </div>
         </div>
        </div>

        {/* Performance Hub */}
        <div className="bg-white border-[4px] border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_black]">
         <div className="font-black uppercase text-sm mb-4 text-center border-b-[3px] border-black pb-2">
          Performance Hub
         </div>
         <div className="h-24 flex items-end gap-2 px-2">
          {[40, 70, 45, 90, 65, 80, 55, 95].map((h, i) => (
           <div key={i} className="flex-1 bg-[#00CCFF] border-2 border-black rounded-t-lg" style={{ height: `${h}%` }} />
          ))}
         </div>
        </div>

        {/* Vault */}
        <div className="bg-white border-[4px] border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_black]">
         <div className="font-black uppercase text-sm mb-4 text-center border-b-[3px] border-black pb-2">
          Vault
         </div>
         <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
           <div key={i} className="aspect-square bg-gray-100 border-[3px] border-black rounded-xl flex items-center justify-center">
            <FileCode size={20} className="text-black/30" />
           </div>
          ))}
         </div>
        </div>

        {/* System Settings */}
        <div className="bg-white border-[4px] border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_black]">
         <div className="font-black uppercase text-sm mb-4 text-center border-b-[3px] border-black pb-2">
          System Settings
         </div>
         <div className="space-y-3">
          <div className="flex items-center justify-between bg-white border-[3px] border-black p-3 rounded-xl shadow-[4px_4px_0px_0px_black]">
           <span className="font-black uppercase text-xs">Auto-Sync</span>
           <div className="w-12 h-6 border-[3px] border-black rounded-full bg-[#CCFF00] p-1">
            <div className="w-4 h-4 bg-white border-[2px] border-black rounded-full translate-x-6" />
           </div>
          </div>
          <div className="flex items-center justify-between bg-white border-[3px] border-black p-3 rounded-xl shadow-[4px_4px_0px_0px_black]">
           <span className="font-black uppercase text-xs">Notifications</span>
           <div className="w-12 h-6 border-[3px] border-black rounded-full bg-gray-300 p-1">
            <div className="w-4 h-4 bg-white border-[2px] border-black rounded-full" />
           </div>
          </div>
         </div>
        </div>

        {/* Reference Studio */}
        <div className="bg-white border-[4px] border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_black]">
         <div className="font-black uppercase text-sm mb-4 text-center border-b-[3px] border-black pb-2">
          Reference Studio
         </div>
         <div className="space-y-3">
          <div className="bg-black text-[#CCFF00] p-4 rounded-xl font-mono text-xs">
           {">"} ANALYZING...
           <br />
           {">"} FOUND 87 FILES
           <br />
           {">"} READY
          </div>
          <button className="w-full bg-[#CCFF00] border-[3px] border-black rounded-xl p-3 font-black uppercase text-sm shadow-[4px_4px_0px_0px_black]">
           Open Library
          </button>
         </div>
        </div>
       </div>
     </EliteToolBlock>
    </div>
   </div>
   </div>
 )
}

export default UIReferenceLibraryContent
