import React, { useEffect, useMemo, useRef, useState } from "react"

import { createPortal } from "react-dom"

import {

 ChevronDown,

 Cloud,

 Grid3X3,

 Image as ImageIcon,

 ImagePlus,

 Lightbulb,

 MonitorPlay,

 Pause,

 Palette,

 Play,

 Plus,

 Minus,

 Search,

 Settings,

 Square,

 Type,

 X,

 Zap,

 Bell,

 Check,

} from "lucide-react"

import {

 ResponsiveContainer,

 LineChart,

 Line,

 XAxis,

 YAxis,

 CartesianGrid,

 Tooltip,

 Legend,

 Area,

 AreaChart,

 BarChart,

 Bar,

 Cell,

 PieChart,

 Pie,

 ScatterChart,

 Scatter,

 ZAxis,

 ReferenceLine,

} from "recharts"

import {

 TableDemo,

 CalendarDemo,

 TabsPillsDemo,

 ModalDemo,

 BarChartDemo,

 LineChartDemo,

 DonutChartDemo,

 RadarChartDemo,

 ScatterPlotDemo,

 DistributionDemo,

 ClockDemo,

 MetersDemo,

 AvatarsDemo,

 PaginationDemo,

 StepIndicatorDemo,

 AdvancedSlidersDemo,

 DropdownMenuDemo,

 AreaChartDemo,

} from "./NativeUIKit"


const zoomIn35 = new URL(

 "../assets/icons/toolbox-toggle/zoom-in-35.png",

 import.meta.url,

).href

const zoomIn50 = new URL(

 "../assets/icons/toolbox-toggle/zoom-in-50.png",

 import.meta.url,

).href

const zoomOut35 = new URL(

 "../assets/icons/toolbox-toggle/zoom-out-35.png",

 import.meta.url,

).href

const zoomOut50 = new URL(

 "../assets/icons/toolbox-toggle/zoom-out-50.png",

 import.meta.url,

).href

const closeIcon21 = new URL(

 "../assets/icons/close_21dp_1F1F1F_FILL0_wght700_GRAD200_opsz20.png",

 import.meta.url,

).href


type SystemConfig = {

 gap: number

 padding: number

 stroke: number

 radius: number

 baseHeight: number

 scaffoldStroke: number

}


type IconType = React.ComponentType<{

 size?: number

 strokeWidth?: number

 className?: string

}>


type SubToolboxProps = {

 title: string

 icon: IconType

 headerBg: string

 iconBg: string

 isOpen: boolean

 onToggle: () => void

 openUnits?: number

 heightMode?: "standard" | "compact"

 config: SystemConfig

 children: React.ReactNode

}


type DropdownControlProps = {

 label: string

 value: string

 options: string[]

 onChange: (next: string) => void

}


const CONFIG: SystemConfig = {

 gap: 24,

 padding: 24,

 stroke: 4,

 radius: 16,

 baseHeight: 60,

 scaffoldStroke: 6,

}


const STYLES = [

 "Educational",

 "Clickbait",

 "Cinematic",

 "Graphic",

 "Simplified",

 "Mysterious",

 "Minimalist",

 "Vibrant",

 "Dark & Moody",

 "Retro/Vintage",

 "Futuristic",

 "Hand-drawn",

]


const RULES = [

 "Main toolbox content uses inner margin 0. The structural grid owns spacing.",

 "The base structural rhythm is 24px gaps and 24px internal grid padding.",

 "A component should never cut off contained elements to force grid fit.",

 "If content exceeds a unit bucket, the module opens to the next level.",

 "Subtoolbox stroke is 4px; first-level internals max 3px; nested internals max 2px.",

 "Dropdown labels stay embedded inside controls so grid alignment stays locked.",

]


const RATIO_RULES = [

 "Closed subtoolbox = 60px",

 "2 rows (60 + 60) + 1 gap (24) = 144px",

 "Three compact slider rows map to same 144px rhythm",

 "Canvas uses flex-1 with min-h-0 for automatic column sync",

 "Avoid fixed min-height that blocks synchronized vertical math",

]


const CHART_METRIC_COLORS = {

 likes: "#FF7497",

 comments: "#24D3FF",

 shares: "#FFE357",

 subs: "#C9F830",

 views: "#FCAF57",

 ctr: "#CC99FF",

 revenue: "#4ADE80",

} as const


const ENGAGEMENT_MAP_SOURCE = [

 {

  idx: 1,

  shortTitle: "IRISH LEGION",

  likes: 7,

  comments: 2,

  shares: 0,

  subs: 2,

  views: 136,

  impressions: 2605,

  ctr: 3.95,

  avp: 36.6,

  revenue: 0.102,

  durationSec: 123,

 },

 {

  idx: 2,

  shortTitle: "PYRAMIDS SPEECH",

  likes: 11,

  comments: 3,

  shares: 0,

  subs: 1,

  views: 276,

  impressions: 5705,

  ctr: 3.72,

  avp: 42.8,

  revenue: 0.297,

  durationSec: 142,

 },

 {

  idx: 3,

  shortTitle: "JOIN OLD GUARD",

  likes: 27,

  comments: 4,

  shares: 5,

  subs: 4,

  views: 675,

  impressions: 11942,

  ctr: 4.07,

  avp: 25.62,

  revenue: 1.98,

  durationSec: 497,

 },

 {

  idx: 4,

  shortTitle: "BEAUCAIRE",

  likes: 10,

  comments: 4,

  shares: 0,

  subs: 2,

  views: 232,

  impressions: 3748,

  ctr: 4.32,

  avp: 8.85,

  revenue: 0.914,

  durationSec: 1616,

 },

 {

  idx: 5,

  shortTitle: "BLACK BRUNSWICKERS",

  likes: 24,

  comments: 5,

  shares: 5,

  subs: 2,

  views: 461,

  impressions: 8304,

  ctr: 4.01,

  avp: 40.32,

  revenue: 0.633,

  durationSec: 146,

 },

 {

  idx: 6,

  shortTitle: "AUSTERLITZ 1805",

  likes: 15,

  comments: 4,

  shares: 4,

  subs: 6,

  views: 528,

  impressions: 4197,

  ctr: 3.96,

  avp: 12.49,

  revenue: 3.658,

  durationSec: 1843,

 },

 {

  idx: 7,

  shortTitle: "1805 PREMIERE",

  likes: 1,

  comments: 0,

  shares: 0,

  subs: 0,

  views: 1,

  impressions: 0,

  ctr: 0,

  avp: 42.88,

  revenue: 0,

  durationSec: 670,

 },

 {

  idx: 8,

  shortTitle: "AUSTERLITZ ABOVE",

  likes: 4,

  comments: 1,

  shares: 0,

  subs: 2,

  views: 152,

  impressions: 2368,

  ctr: 4.35,

  avp: 35.6,

  revenue: 0.51,

  durationSec: 559,

 },

 {

  idx: 9,

  shortTitle: "UNION JACK",

  likes: 1,

  comments: 0,

  shares: 0,

  subs: 0,

  views: 15,

  impressions: 775,

  ctr: 1.16,

  avp: 36.6,

  revenue: 0.023,

  durationSec: 128,

 },

 {

  idx: 10,

  shortTitle: "UNKNOWN FACTS",

  likes: 0,

  comments: 0,

  shares: 0,

  subs: 0,

  views: 13,

  impressions: 607,

  ctr: 1.15,

  avp: 55.13,

  revenue: 0.017,

  durationSec: 223,

 },

 {

  idx: 11,

  shortTitle: "TOP 3 STRATEGIES",

  likes: 0,

  comments: 0,

  shares: 1,

  subs: 0,

  views: 27,

  impressions: 562,

  ctr: 2.49,

  avp: 43.75,

  revenue: 0.13,

  durationSec: 502,

 },

 {

  idx: 12,

  shortTitle: "CORPS SYSTEM",

  likes: 25,

  comments: 2,

  shares: 4,

  subs: 3,

  views: 828,

  impressions: 6878,

  ctr: 6.73,

  avp: 37.56,

  revenue: 2.743,

  durationSec: 508,

 },

 {

  idx: 13,

  shortTitle: "BATTALION CARRE",

  likes: 0,

  comments: 0,

  shares: 0,

  subs: 0,

  views: 54,

  impressions: 654,

  ctr: 2.45,

  avp: 68.84,

  revenue: 0.118,

  durationSec: 69,

 },

 {

  idx: 14,

  shortTitle: "MARENGO",

  likes: 2,

  comments: 0,

  shares: 0,

  subs: 0,

  views: 65,

  impressions: 1188,

  ctr: 2.44,

  avp: 38.53,

  revenue: 0.739,

  durationSec: 151,

 },

 {

  idx: 15,

  shortTitle: "EMPERORS MEN",

  likes: 15,

  comments: 2,

  shares: 1,

  subs: 1,

  views: 331,

  impressions: 3775,

  ctr: 4.74,

  avp: 21.3,

  revenue: 1.446,

  durationSec: 1068,

 },

 {

  idx: 16,

  shortTitle: "KOZIETULSKI",

  likes: 2,

  comments: 0,

  shares: 0,

  subs: 0,

  views: 29,

  impressions: 740,

  ctr: 3.51,

  avp: 42.65,

  revenue: 0.093,

  durationSec: 258,

 },

 {

  idx: 17,

  shortTitle: "MARSHAL NEY",

  likes: 1,

  comments: 0,

  shares: 0,

  subs: 0,

  views: 29,

  impressions: 733,

  ctr: 2.46,

  avp: 40.57,

  revenue: 0.109,

  durationSec: 271,

 },

 {

  idx: 18,

  shortTitle: "JOACHIM MURAT",

  likes: 0,

  comments: 0,

  shares: 0,

  subs: 0,

  views: 17,

  impressions: 509,

  ctr: 2.16,

  avp: 53.12,

  revenue: 0.019,

  durationSec: 212,

 },

 {

  idx: 19,

  shortTitle: "ANTOINE LASALLE",

  likes: 7,

  comments: 0,

  shares: 0,

  subs: 0,

  views: 144,

  impressions: 1780,

  ctr: 5.06,

  avp: 36.81,

  revenue: 0.227,

  durationSec: 271,

 },

 {

  idx: 20,

  shortTitle: "CAVALRY ALIVE",

  likes: 3,

  comments: 0,

  shares: 0,

  subs: 1,

  views: 13,

  impressions: 338,

  ctr: 2.96,

  avp: 29.54,

  revenue: 0.049,

  durationSec: 511,

 },

 {

  idx: 21,

  shortTitle: "LAST KNIGHTS TRAILER",

  likes: 2,

  comments: 0,

  shares: 0,

  subs: 1,

  views: 12,

  impressions: 390,

  ctr: 1.03,

  avp: 42.27,

  revenue: 0.017,

  durationSec: 226,

 },

 {

  idx: 22,

  shortTitle: "JAN BESSIERES",

  likes: 1,

  comments: 0,

  shares: 0,

  subs: 0,

  views: 22,

  impressions: 649,

  ctr: 2.47,

  avp: 55.04,

  revenue: 0.06,

  durationSec: 210,

 },

 {

  idx: 23,

  shortTitle: "2D TO 3D",

  likes: 0,

  comments: 0,

  shares: 1,

  subs: 0,

  views: 98,

  impressions: 764,

  ctr: 4.06,

  avp: 37.48,

  revenue: 0.033,

  durationSec: 199,

 },

 {

  idx: 24,

  shortTitle: "MURAT COMMANDER",

  likes: 0,

  comments: 0,

  shares: 0,

  subs: 0,

  views: 32,

  impressions: 501,

  ctr: 2.2,

  avp: 40.44,

  revenue: 0.057,

  durationSec: 187,

 },

 {

  idx: 25,

  shortTitle: "LAST KNIGHTS EUROPE",

  likes: 6,

  comments: 0,

  shares: 0,

  subs: 1,

  views: 122,

  impressions: 1140,

  ctr: 3.33,

  avp: 13.96,

  revenue: 0.446,

  durationSec: 1806,

 },

]


const HEAD_HEIGHT = 56 // Anchor height for header + its bottom border (56px)


const hexToRgba = (hex: string, alpha: number) => {

 const normalized = hex.replace("#", "")

 const fullHex =

  normalized.length === 3

   ? normalized

      .split("")

      .map((char) => `${char}${char}`)

      .join("")

   : normalized


 if (!/^[0-9a-fA-F]{6}$/.test(fullHex)) return `rgba(0,0,0,${alpha})`


 const parsed = Number.parseInt(fullHex, 16)

 const r = (parsed >> 16) & 255

 const g = (parsed >> 8) & 255

 const b = parsed & 255

 return `rgba(${r}, ${g}, ${b}, ${alpha})`

}


const resolveSubtoolboxMinHeight = (

 openUnits: number,

 config: SystemConfig,

 heightMode: "standard" | "compact",

) => {

 // Target total = openUnits * 60 + (openUnits-1) * 24

 // Overhead  = container top border + header (including its own borderBottom) + container bottom border

 //           = stroke + HEAD_HEIGHT + stroke = 4 + 56 + 4 = 64

 const overhead = HEAD_HEIGHT + config.stroke * 2

 const computed =

  openUnits * config.baseHeight + (openUnits - 1) * config.gap - overhead


 if (heightMode === "compact") {

  return Math.max(0, Math.min(computed, 144))

 }


 return Math.max(0, computed)

}


const AnimatedToggleIcon: React.FC<{ open: boolean; size?: number }> = ({

 open,

 size = 36,

}) => {

 const openActionIcon = size >= 44 ? zoomOut50 : zoomOut35

 const closeActionIcon = size >= 44 ? zoomIn50 : zoomIn35


 return (

  <div

   className="relative group flex items-center justify-center shrink-0 cursor-pointer"

   style={{ width: size, height: size }}>

   <div

    className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out rotate-45 ${open ? "scale-90" : "scale-100"} group-hover:scale-110 group-active:scale-95`}>

    <img

     alt="Open toolbox"

     src={openActionIcon}

     className={`absolute inset-0 w-full h-full inline-block select-none pointer-events-none transition-all duration-1000 ease-in-out ${open ? "opacity-0 rotate-180 scale-75" : "opacity-80 rotate-0 scale-100 group-hover:opacity-100"}`}

    />

    <img

     alt="Close toolbox"

     src={closeActionIcon}

     className={`absolute inset-0 w-full h-full inline-block select-none pointer-events-none transition-all duration-1000 ease-in-out ${open ? "opacity-80 rotate-180 scale-100 group-hover:opacity-100" : "opacity-0 rotate-0 scale-75"}`}

    />

   </div>

  </div>

 )

}


const SubToolbox: React.FC<SubToolboxProps> = ({

 title,

 icon: Icon,

 headerBg,

 iconBg,

 isOpen,

 onToggle,

 openUnits = 3,

 heightMode = "standard",

 config,

 children,

}) => {

 const minInnerHeight = resolveSubtoolboxMinHeight(

  openUnits,

  config,

  heightMode,

 )

 const contentSizeStyle =

  heightMode === "compact"

   ? undefined

   : { minHeight: `${Math.max(0, minInnerHeight)}px` }

 const shadowColor = hexToRgba(headerBg, 0.5)


 return (

  <div

   className="w-full bg-white overflow-hidden relative flex flex-col shrink-0"

   style={{

    border: `${config.stroke}px solid black`,

    borderRadius: `${config.radius}px`,

    boxShadow: `${config.stroke + 2}px ${config.stroke + 2}px 0px 0px ${shadowColor}`,

   }}>

   <header

    onClick={onToggle}

    className="flex items-center justify-between select-none relative z-20 group transition-[margin] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer"

    style={{

     height: `${HEAD_HEIGHT}px`,

     minHeight: `${HEAD_HEIGHT}px`,

     backgroundColor: headerBg,

     borderBottom: `${config.stroke}px solid black`,

     marginBottom: isOpen ? "0px" : `-${config.stroke}px`,

    }}>

    <div className="flex items-center h-full flex-1">

     <div

      className="h-full flex items-center justify-center shrink-0 transition-all duration-500"

      style={{

       width: `${HEAD_HEIGHT}px`,

       backgroundColor: iconBg,

       borderRight: `${config.stroke}px solid black`,

      }}>

      <Icon size={30} strokeWidth={2.5} className="text-black" />

     </div>

     <div className="flex items-center pl-2.5 h-full pointer-events-none select-none">

      <h3 className="font-[900] uppercase tracking-tighter text-black leading-none text-[46px] sm:text-[40px] md:text-[42px]">

       {title}

      </h3>

     </div>

    </div>

    <div className="flex items-center gap-2 pr-3 h-full">

     <div className="h-full flex items-center justify-center">

      <AnimatedToggleIcon open={isOpen} size={24} />

     </div>

    </div>

   </header>


   <div

    className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>

    <div className="overflow-hidden min-h-0">

     <main

      className="bg-white w-full p-3 text-black flex flex-col"

      style={contentSizeStyle}>

      {children}

     </main>

    </div>

   </div>

  </div>

 )

}


const DropdownControl: React.FC<DropdownControlProps> = ({

 label,

 value,

 options,

 onChange,

}) => {

 const [open, setOpen] = useState(false)

 const rootRef = useRef<HTMLDivElement>(null)

 const menuRef = useRef<HTMLDivElement>(null)

 const [menuPos, setMenuPos] = useState<{

  top: number

  left: number

  width: number

 }>({

  top: 0,

  left: 0,

  width: 0,

 })


 const updateMenuPosition = () => {

  if (!rootRef.current) return

  const rect = rootRef.current.getBoundingClientRect()

  setMenuPos({

   top: rect.bottom,

   left: rect.left,

   width: rect.width,

  })

 }


 useEffect(() => {

  const onDocumentMouseDown = (event: MouseEvent) => {

   const target = event.target as Node

   if (!rootRef.current) return

   const insideTrigger = rootRef.current.contains(target)

   const insideMenu = menuRef.current?.contains(target) ?? false

   if (!insideTrigger && !insideMenu) {

    setOpen(false)

   }

  }

  document.addEventListener("mousedown", onDocumentMouseDown)

  return () => document.removeEventListener("mousedown", onDocumentMouseDown)

 }, [])


 useEffect(() => {

  if (!open) return

  updateMenuPosition()

  const onWindowChange = () => updateMenuPosition()

  window.addEventListener("resize", onWindowChange)

  window.addEventListener("scroll", onWindowChange, true)

  return () => {

   window.removeEventListener("resize", onWindowChange)

   window.removeEventListener("scroll", onWindowChange, true)

  }

 }, [open])


 return (

  <div ref={rootRef} className="relative w-full h-[60px] block">

   <button

    type="button"

    onClick={() => setOpen((prev) => !prev)}

    className={`group w-full h-full border-[4px] border-black overflow-hidden bg-white transition-colors hover:bg-[#f3f4f6] block ${open ? "rounded-t-[16px] rounded-b-none" : "rounded-[16px]"}`}>

    <div className="h-full flex items-stretch">

     <div className="flex-1 flex items-center justify-center px-4 text-[20px] font-[900] uppercase tracking-tighter leading-none text-center">

      {value}

     </div>

     <div className="w-[52px] h-full border-l-[4px] border-black bg-[#FFE357] shrink-0 flex flex-col">

      <div className="h-1/2 border-b-[4px] border-black text-[8px] font-black uppercase tracking-[0.14em] flex items-center justify-center px-1">

       {label}

      </div>

      <div className="h-1/2 flex items-center justify-center transition-transform">

       <ChevronDown

        size={22}

        strokeWidth={3}

        className="text-black transition-transform duration-100 ease-out group-active:translate-y-0.5"

       />

      </div>

     </div>

    </div>

   </button>


   {open &&

    createPortal(

     <div

      ref={menuRef}

      className="fixed z-[3000] bg-white border-[4px] border-black border-t-0 rounded-b-[16px] overflow-hidden"

      style={{

       top: `${menuPos.top}px`,

       left: `${menuPos.left}px`,

       width: `${menuPos.width}px`,

      }}>

      {options.map((option) => (

       <button

        key={option}

        type="button"

        onClick={() => {

         onChange(option)

         setOpen(false)

        }}

        className={`w-full h-11 transition-colors ${option === value ? "bg-[#FCAF57] text-black" : "bg-white text-black hover:bg-[rgba(252,175,87,0.5)] hover:text-white"}`}>

        <div className="h-full w-[calc(100%-52px)] mr-[52px] flex items-center justify-center px-4 text-[20px] font-[900] uppercase tracking-tighter leading-none text-center">

         <span className="leading-none mt-0.5">{option}</span>

        </div>

       </button>

      ))}

     </div>,

     document.body,

    )}

  </div>

 )

}


const ComponentTile: React.FC<{

 id: string

 title: string

 description: string

 children: React.ReactNode

}> = ({ id, title, description, children }) => (

 <article className="bg-white border-[4px] border-black rounded-2xl overflow-hidden shadow-[6px_6px_0px_0px_black]">

  <div className="h-10 bg-[#CCFF00] border-b-[4px] border-black flex items-center justify-between px-3">

   <span className="text-[10px] font-black uppercase tracking-widest">

    {id}

   </span>

   <span className="text-[9px] font-black uppercase opacity-60">{title}</span>

  </div>

  <div className="p-3 space-y-2">

   <p className="text-[9px] font-bold uppercase opacity-60 leading-tight">

    {description}

   </p>

   {children}

  </div>

 </article>

)


const InvertedStatModule: React.FC<{

 label: string

 value: string

 accentColor: string

 interiorColor?: string

 size: number

}> = ({ label, value, accentColor, interiorColor = "#FFFFFF", size }) => {

 return (

  <div

   className="flex flex-col overflow-visible shrink-0"

   style={{

    width: `${size}px`,

    height: `${size}px`,

    boxSizing: "border-box",

    border: `3px solid ${interiorColor}`,

    borderRadius: "24px",

    backgroundColor: interiorColor,

   }}>

   <div

    className="flex-1 flex items-center justify-center"

    style={{ backgroundColor: accentColor }}>

    <div className="relative flex items-center justify-center">

     <span

      className="uppercase select-none absolute inset-0 flex items-center justify-center"

      style={{

       color: "transparent",

       fontSize: "126px",

       fontWeight: 1000,

       lineHeight: "0.5",

       letterSpacing: "-0.02em",

       textAlign: "center",

       WebkitTextStroke: `7px ${accentColor}`,

       pointerEvents: "none",

       userSelect: "none",

      }}>

      {value}

     </span>

     <span

      className="uppercase select-none relative"

      style={{

       color: interiorColor,

       fontSize: "126px",

       fontWeight: 1000,

       lineHeight: "0.5",

       letterSpacing: "-0.02em",

       textAlign: "center",

      }}>

      {value}

     </span>

    </div>

   </div>

   <div

    className="h-10 flex items-center justify-center"

    style={{ backgroundColor: interiorColor }}>

    <span

     className="w-full text-center uppercase leading-none"

     style={{

      color: accentColor,

      fontSize: "35px",

      fontWeight: 1000,

      letterSpacing: "0",

      WebkitTextStroke: "0.9px currentColor",

      display: "inline-block",

      transform: "scaleX(1.2)",

      transformOrigin: "center",

     }}>

     {label}

    </span>

   </div>

  </div>

 )

}


const InvertedStatModuleSoft: React.FC<{

 label: string

 value: string

 accentColor: string

 interiorColor?: string

 size: number

 width?: number

}> = ({

 label,

 value,

 accentColor,

 interiorColor = "#E4E7EB",

 size,

 width,

}) => {

 const moduleWidth = width ?? size

 const titleFontSize = Math.min(

  28,

  Math.max(

   11,

   Math.floor((moduleWidth - 12) / Math.max(1, label.length * 0.72)),

  ),

 )


 return (

  <div

   className="flex flex-col overflow-hidden shrink-0"

   style={{

    width: `${moduleWidth}px`,

    height: `${size}px`,

    boxSizing: "border-box",

    border: `3px solid ${interiorColor}`,

    borderRadius: "16px",

    backgroundColor: interiorColor,

   }}>

   <div

    className="flex-1 flex items-center justify-center"

    style={{ backgroundColor: accentColor }}>

    <span

     className="font-[1000] uppercase leading-none select-none"

     style={{

      color: interiorColor,

      fontSize: `${Math.floor(size * 0.7)}px`,

      lineHeight: "0.78",

      letterSpacing: "-0.06em",

     }}>

     {value}

    </span>

   </div>

   <div

    className="h-10 flex items-center justify-center"

    style={{ backgroundColor: interiorColor }}>

    <span

     className="w-full text-center uppercase leading-none"

     style={{

      color: accentColor,

      fontSize: `${titleFontSize}px`,

      fontWeight: 1000,

      letterSpacing: "0",

      display: "inline-block",

      whiteSpace: "nowrap",

     }}>

     {label}

    </span>

   </div>

  </div>

 )

}


const RuleList: React.FC<{ items: string[] }> = ({ items }) => (

 <div className="space-y-3">

  {items.map((item) => (

   <div

    key={item}

    className="bg-white border-[3px] border-black rounded-xl p-3 text-[11px] font-black uppercase tracking-tight leading-snug">

    {item}

   </div>

  ))}

 </div>

)


type ToolboxUISystemMode = "full" | "ui-system" | "component-grid"


type ToolboxUISystemProps = {

 mode?: ToolboxUISystemMode

}


const ToolboxUISystem: React.FC<ToolboxUISystemProps> = ({ mode = "full" }) => {

 // Toolbox state

 const [isStudioOpen, setIsStudioOpen] = useState(true)

 const [isAnalyticsScaffoldOpen, setIsAnalyticsScaffoldOpen] = useState(true)

 const [isComponentsOpen, setIsComponentsOpen] = useState(true)

 const [isRulebookOpen, setIsRulebookOpen] = useState(false)

 const [isPackScaffoldOpen, setIsPackScaffoldOpen] = useState(true)


 // Sub-toolbox state (Component Pack)

 const [isPackControlsOpen, setIsPackControlsOpen] = useState(true)

 const [isPackFormsOpen, setIsPackFormsOpen] = useState(true)

 const [isPackSwitchesOpen, setIsPackSwitchesOpen] = useState(true)

 const [isPackMediaOpen, setIsPackMediaOpen] = useState(true)

 const [isPackDataOpen, setIsPackDataOpen] = useState(true)

 const [isPackScheduleOpen, setIsPackScheduleOpen] = useState(false)

 const [isPackStatesOpen, setIsPackStatesOpen] = useState(false)


 // Sub-toolbox state (Studio)

 const [isConceptOpen, setIsConceptOpen] = useState(true)

 const [isStylesOpen, setIsStylesOpen] = useState(false)

 const [isTextOpen, setIsTextOpen] = useState(false)

 const [isImagesOpen, setIsImagesOpen] = useState(false)

 const [isPaletteOpen, setIsPaletteOpen] = useState(false)


 // Sub-toolbox state (Analytics)

 const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(true)

 const [vibeValue, setVibeValue] = useState(65)

 const [hqMode, setHqMode] = useState(true)

 const [scanMode, setScanMode] = useState(false)


 const [concept, setConcept] = useState("")

 const [titleText, setTitleText] = useState("")

 const [hookText, setHookText] = useState("")

 const [ratio, setRatio] = useState("16:9")

 const [resolution, setResolution] = useState("1K")

 const [labMode, setLabMode] = useState("Balanced")

 const [activeStyles, setActiveStyles] = useState<string[]>([])

 const [colors, setColors] = useState(["#C9F830", "#FF7497", "", "", ""])

 const [images, setImages] = useState<

  Array<{ id: string; name: string; url: string }>

 >([])

 const [toggleOne, setToggleOne] = useState(true)

 const [toggleTwo, setToggleTwo] = useState(false)

 const [toggleThree, setToggleThree] = useState(true)

 const [toggleFour, setToggleFour] = useState(false)

 const [toggleFive, setToggleFive] = useState(true)

 const [buttonFeedback, setButtonFeedback] = useState("NO TRIGGER YET")

 const [buttonBurst, setButtonBurst] = useState(0)

 const [sliderA, setSliderA] = useState(82)

 const [sliderB, setSliderB] = useState(44)

 const [sliderC, setSliderC] = useState(67)

 const [sliderD, setSliderD] = useState(25)

 const [sliderE, setSliderE] = useState(58)

 const [segmentMode, setSegmentMode] = useState<"PULSE" | "STEADY" | "STEALTH">(

  "STEADY",

 )

 const [ratingValue, setRatingValue] = useState(4)

 const [stepValue, setStepValue] = useState(3)

 const [selectedChipSet, setSelectedChipSet] = useState<string[]>([

  "HOOKS",

  "FACES",

 ])

 const [swatchValue, setSwatchValue] = useState("#FF7497")

 const [interactiveCells, setInteractiveCells] = useState<boolean[]>([

  true,

  false,

  true,

  false,

  true,

  false,

  true,

  false,

  true,

 ])

 const [reactionMode, setReactionMode] = useState<"HYPE" | "FOCUS" | "CHILL">(

  "HYPE",

 )

 const [commandLocked, setCommandLocked] = useState(false)

 const [counterValue, setCounterValue] = useState(12)

 const [flipCardOpen, setFlipCardOpen] = useState(false)

 const [streakDays, setStreakDays] = useState(5)

 const [tinyClicked, setTinyClicked] = useState("NONE")

 const [chipTheme, setChipTheme] = useState<

  Record<"pink" | "blue" | "green", string[]>

 >({

  pink: ["All"],

  blue: ["Long"],

  green: ["Shorts"],

 })

 const [toggleTheme, setToggleTheme] = useState<

  Record<"pink" | "blue" | "green", boolean[]>

 >({

  pink: [true, false, true],

  blue: [false, true, false],

  green: [true, true, false],

 })

 const [checkTheme, setCheckTheme] = useState<

  Record<"pink" | "blue" | "green", boolean[]>

 >({

  pink: [true, false, false],

  blue: [false, true, false],

  green: [false, false, true],

 })

 const [radioTheme, setRadioTheme] = useState<

  Record<"pink" | "blue" | "green", number>

 >({

  pink: 0,

  blue: 1,

  green: 2,

 })

 const [engagementSortMetric, setEngagementSortMetric] = useState<

  "likes" | "comments" | "shares" | "subs"

 >("likes")

 const [engagementSortDir, setEngagementSortDir] = useState<"desc" | "asc">(

  "desc",

 )

 const [lineMode, setLineMode] = useState<"natural" | "step">("natural")

 const [barMetric, setBarMetric] = useState<

  "views" | "likes" | "comments" | "shares" | "subs" | "revenue"

 >("views")

 const [pieMetric, setPieMetric] = useState<

  "views" | "likes" | "comments" | "shares" | "subs" | "revenue"

 >("views")

 const [scatterX, setScatterX] = useState<

  "views" | "impressions" | "durationSec" | "ctr" | "avp"

 >("impressions")

 const [scatterY, setScatterY] = useState<

  "ctr" | "avp" | "likes" | "comments" | "subs"

 >("ctr")

 const [bubbleMetric, setBubbleMetric] = useState<

  "likes" | "comments" | "shares" | "subs" | "views"

 >("likes")

 const [activePieIndex, setActivePieIndex] = useState(0)

 const [packTab, setPackTab] = useState<"overview" | "builder" | "review">(

  "overview",

 )

 const [packRowToggles, setPackRowToggles] = useState({

  yellow: false,

  red: false,

  green: false,

 })

 const [packInput, setPackInput] = useState("")

 const [packDescription, setPackDescription] = useState("")

 const [packSelect, setPackSelect] = useState("DEFAULT")

 const [packSecondarySelect, setPackSecondarySelect] = useState("PRIORITY")

 const [packPage, setPackPage] = useState(2)

 const [packStep, setPackStep] = useState(2)

 const [mediaPlaying, setMediaPlaying] = useState(false)

 const [mediaProgress, setMediaProgress] = useState(45)

 const [switchCtrTarget, setSwitchCtrTarget] = useState(6)

 const [switchSaturation, setSwitchSaturation] = useState(58)

 const [switchResolution, setSwitchResolution] = useState(1)

 const [packPaletteToggles, setPackPaletteToggles] = useState<boolean[]>([

  true,

  true,

  true,

  true,

  false,

  false,

  false,

 ])

 const [packPaletteChecks, setPackPaletteChecks] = useState<boolean[]>([

  true,

  true,

  false,

  false,

  true,

  true,

  false,

 ])

 const [packPaletteRadios, setPackPaletteRadios] = useState<boolean[]>([

  false,

  false,

  false,

  true,

  false,

  true,

  false,

 ])


 const imageInputRef = useRef<HTMLInputElement>(null)

 const canvasInputRef = useRef<HTMLInputElement>(null)


 const canvasPreview = useMemo(() => images[0]?.url || null, [images])


 const addImages = (files: FileList | null) => {

  if (!files) return

  const uploaded = Array.from(files)

   .filter((file) => file.type.startsWith("image/"))

   .map((file) => ({

    id: crypto.randomUUID(),

    name: file.name,

    url: URL.createObjectURL(file),

   }))


  if (!uploaded.length) return

  setImages((prev) => [...uploaded, ...prev].slice(0, 8))

 }


 const toggleStyle = (value: string) => {

  setActiveStyles((prev) =>

   prev.includes(value)

    ? prev.filter((entry) => entry !== value)

    : [...prev, value].slice(0, 4),

  )

 }


 const addPaletteColor = () => {

  setColors((prev) => (prev.length < 8 ? [...prev, ""] : prev))

 }


 const removePaletteColor = () => {

  setColors((prev) => (prev.length > 2 ? prev.slice(0, -1) : prev))

 }


 const fireButton = (label: string) => {

  setButtonFeedback(`${label} FIRED`)

  setButtonBurst((prev) => prev + 1)

 }


 const toggleChip = (chip: string) => {

  setSelectedChipSet((prev) =>

   prev.includes(chip)

    ? prev.filter((entry) => entry !== chip)

    : [...prev, chip].slice(0, 4),

  )

 }


 const toggleThemeChip = (theme: "pink" | "blue" | "green", chip: string) => {

  setChipTheme((prev) => ({

   ...prev,

   [theme]: prev[theme].includes(chip)

    ? prev[theme].filter((entry) => entry !== chip)

    : [...prev[theme], chip].slice(0, 3),

  }))

 }


 const toggleThemeToggle = (theme: "pink" | "blue" | "green", idx: number) => {

  setToggleTheme((prev) => ({

   ...prev,

   [theme]: prev[theme].map((v, i) => (i === idx ? !v : v)),

  }))

 }


 const toggleThemeCheck = (theme: "pink" | "blue" | "green", idx: number) => {

  setCheckTheme((prev) => ({

   ...prev,

   [theme]: prev[theme].map((v, i) => (i === idx ? !v : v)),

  }))

 }


 const sortedEngagementData = useMemo(() => {

  const list = [...ENGAGEMENT_MAP_SOURCE]

  list.sort((a, b) => {

   const diff =

    Number(a[engagementSortMetric]) - Number(b[engagementSortMetric])

   return engagementSortDir === "desc" ? -diff : diff

  })

  return list.map((item, idx) => ({ ...item, order: idx + 1 }))

 }, [engagementSortMetric, engagementSortDir])


 const engagementLeader = sortedEngagementData[0]


 const topBarData = useMemo(() => {

  return [...sortedEngagementData]

   .sort((a, b) => Number(b[barMetric]) - Number(a[barMetric]))

   .slice(0, 10)

 }, [barMetric, sortedEngagementData])


 const pieTopSixData = useMemo(() => {

  const sorted = [...sortedEngagementData].sort(

   (a, b) => Number(b[pieMetric]) - Number(a[pieMetric]),

  )

  const top = sorted

   .slice(0, 6)

   .map((item) => ({ name: item.shortTitle, value: Number(item[pieMetric]) }))

  const other = sorted

   .slice(6)

   .reduce((acc, item) => acc + Number(item[pieMetric]), 0)

  return [...top, { name: "OTHERS", value: other }]

 }, [pieMetric, sortedEngagementData])


 const pieDurationBandData = useMemo(() => {

  const buckets = {

   Sprint: 0,

   Mid: 0,

   Long: 0,

   Epic: 0,

  }

  sortedEngagementData.forEach((item) => {

   const v = Number(item[pieMetric])

   if (item.durationSec < 180) buckets.Sprint += v

   else if (item.durationSec < 400) buckets.Mid += v

   else if (item.durationSec < 900) buckets.Long += v

   else buckets.Epic += v

  })

  return Object.entries(buckets).map(([name, value]) => ({ name, value }))

 }, [pieMetric, sortedEngagementData])


 const pieEngagementMixData = useMemo(

  () => [

   {

    name: "LIKES",

    value: sortedEngagementData.reduce((acc, item) => acc + item.likes, 0),

   },

   {

    name: "COMMENTS",

    value: sortedEngagementData.reduce((acc, item) => acc + item.comments, 0),

   },

   {

    name: "SHARES",

    value: sortedEngagementData.reduce((acc, item) => acc + item.shares, 0),

   },

   {

    name: "SUBS",

    value: sortedEngagementData.reduce((acc, item) => acc + item.subs, 0),

   },

  ],

  [sortedEngagementData],

 )


 const scatterPlotData = useMemo(

  () =>

   sortedEngagementData.map((item) => ({

    name: item.shortTitle,

    x: Number(item[scatterX]),

    y: Number(item[scatterY]),

    z: Math.max(8, Number(item[bubbleMetric]) * 2 + 10),

    views: item.views,

    ctr: item.ctr,

    avp: item.avp,

   })),

  [sortedEngagementData, scatterX, scatterY, bubbleMetric],

 )


 const scatterAvgX = useMemo(

  () =>

   scatterPlotData.length

    ? scatterPlotData.reduce((acc, item) => acc + item.x, 0) /

      scatterPlotData.length

    : 0,

  [scatterPlotData],

 )

 const scatterAvgY = useMemo(

  () =>

   scatterPlotData.length

    ? scatterPlotData.reduce((acc, item) => acc + item.y, 0) /

      scatterPlotData.length

    : 0,

  [scatterPlotData],

 )


 // STYLES column color order: previous color from green header => yellow, orange, red

 const stylesColumnColors = ["#FFE357", "#FCAF57", "#FF7497"]

 const statModuleSize = CONFIG.baseHeight * 2 + CONFIG.gap

 const statModuleMiniSize = 78

 const statModuleMiniWidth = 98

 const chartPalette = [

  "#FF7497",

  "#FCAF57",

  "#FFE357",

  "#C9F830",

  "#24D3FF",

  "#CC99FF",

  "#9ca3af",

 ]

 const showStudioScaffold = mode !== "component-grid"

 const showPackScaffold = mode !== "component-grid"

 const showComponentGrid = mode !== "ui-system"

 const showRulebook = mode !== "component-grid"

 const switchResolutionLabel =

  ["480P", "1K", "2K", "4K"][switchResolution] || "1K"


 return (

  <div className="w-full max-w-[1400px] mx-auto mb-40 space-y-12">

   <style>{`

   @keyframes dash {

     to {

      stroke-dashoffset: -30;

     }

    }

    @keyframes synthPulse {

     0%, 100% { transform: scale(1); opacity: 0.9; }

     50% { transform: scale(1.04); opacity: 1; }

    }

    @keyframes stripeShift {

     0% { background-position: 0 0; }

     100% { background-position: 72px 0; }

    }

    @keyframes glowDrift {

     0%, 100% { box-shadow: 0 0 0 0 rgba(36, 211, 255, 0.45); }

     50% { box-shadow: 0 0 0 8px rgba(36, 211, 255, 0); }

    }

    .synth-stripes {

     background-image: repeating-linear-gradient(

      -45deg,

      rgba(255,255,255,0.22) 0px,

      rgba(255,255,255,0.22) 8px,

      rgba(255,255,255,0) 8px,

      rgba(255,255,255,0) 16px

     );

     animation: stripeShift 1.6s linear infinite;

    }

    .synth-pulse {

     animation: synthPulse 1.8s ease-in-out infinite;

    }

    .synth-glow {

     animation: glowDrift 1.5s ease-out infinite;

    }

   `}</style>

   {showStudioScaffold && (

    <div

     className="w-full bg-white flex flex-col overflow-hidden relative shadow-[12px_12px_0px_0px_rgba(0,0,0,0.5)] transition-all"

     style={{

      border: `${CONFIG.scaffoldStroke}px solid black`,

      borderRadius: `${CONFIG.radius}px`,

     }}>

     <header

      onClick={() => setIsStudioOpen((prev) => !prev)}

      className="bg-[#FFE357] h-[80px] min-h-[80px] flex items-center justify-between select-none z-30 relative cursor-pointer transition-[margin] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"

      style={{

       borderBottom: `${CONFIG.scaffoldStroke}px solid black`,

       marginBottom: isStudioOpen ? "0px" : `-${CONFIG.scaffoldStroke}px`,

      }}>

      <div className="flex items-center h-full flex-1">

       <div

        className="h-full w-[80px] flex items-center justify-center shrink-0"

        style={{

         backgroundColor: "#FF7497",

         borderRight: `${CONFIG.scaffoldStroke}px solid black`,

        }}>

        <ImageIcon size={40} strokeWidth={2.5} className="text-black" />

       </div>

       <h1 className="text-[32px] sm:text-[40px] md:text-[50px] font-[1000] uppercase tracking-tighter leading-none pl-6 truncate text-black">

        TOOLBOX UI SYSTEM

       </h1>

      </div>

      <div className="flex items-center gap-3 pr-6 h-full">

       <AnimatedToggleIcon open={isStudioOpen} size={40} />

      </div>

     </header>


     <div

      className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isStudioOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>

      <div className="overflow-hidden min-h-0 flex flex-col">

       <div className="p-0 bg-neutral-100 flex-1 relative">

        <div

         className="grid grid-cols-1 lg:grid-cols-2 items-stretch h-full"

         style={{ padding: `${CONFIG.padding}px`, gap: `${CONFIG.gap}px` }}>

         <div

          className="flex flex-col h-full justify-start"

          style={{ gap: `${CONFIG.gap}px` }}>

          <SubToolbox

           title="CONCEPT"

           icon={Lightbulb}

           headerBg="#24D3FF"

           iconBg="#FFE357"

           isOpen={isConceptOpen}

           onToggle={() => setIsConceptOpen((prev) => !prev)}

           config={CONFIG}>

           <div className="flex flex-col h-full justify-between gap-3">

            <textarea

             value={concept}

             onChange={(e) => setConcept(e.target.value)}

             placeholder="Describe idea..."

             className="w-full min-h-[88px] p-0 text-sm font-bold bg-transparent outline-none resize-none border-none placeholder:text-black/20 text-black leading-tight"

            />

            <div className="flex justify-end">

             <button className="group h-[40px] bg-[#C9F830] text-[20px] font-[1000] uppercase text-black px-5 rounded-2xl border-[3px] border-black flex items-center justify-center text-center leading-none tracking-tighter transition-transform duration-150 ease-out hover:scale-x-[1.02] hover:scale-y-[1.08] active:scale-x-[0.97] active:scale-y-[0.9]">

              <span className="block transition-transform duration-150 ease-out group-hover:scale-x-[0.98] group-hover:scale-y-[0.93] group-active:scale-x-[1.03] group-active:scale-y-[1.11]">

               AUTO-REFINE

              </span>

             </button>

            </div>

           </div>

          </SubToolbox>


          <SubToolbox

           title="STYLES"

           icon={Grid3X3}

           headerBg="#C9F830"

           iconBg="#24D3FF"

           isOpen={isStylesOpen}

           onToggle={() => setIsStylesOpen((prev) => !prev)}

           openUnits={3}

           heightMode="compact"

           config={CONFIG}>

           <div className="grid grid-cols-3 gap-[6px]">

            {STYLES.map((style, index) => {

             const columnColor =

              stylesColumnColors[index % stylesColumnColors.length]

             const isActive = activeStyles.includes(style)

             return (

              <button

               key={style}

               onClick={() => toggleStyle(style)}

               className="h-[30px] border-[3px] border-black rounded-2xl font-black uppercase text-[11px] tracking-wide transition-colors text-black bg-white hover:bg-gray-100"

               style={{

                ...(isActive ? { backgroundColor: columnColor } : {}),

               }}>

               {style}

              </button>

             )

            })}

           </div>

          </SubToolbox>


          <SubToolbox

           title="TEXT"

           icon={Type}

           headerBg="#FFE357"

           iconBg="#C9F830"

           isOpen={isTextOpen}

           onToggle={() => setIsTextOpen((prev) => !prev)}

           config={CONFIG}>

           <div className="flex flex-col h-full justify-center gap-3">

            <input

             value={titleText}

             onChange={(e) => setTitleText(e.target.value)}

             placeholder="TITLE"

             className="w-full h-[44px] px-3 border-[3px] border-black font-black uppercase text-sm rounded-2xl outline-none"

            />

            <input

             value={hookText}

             onChange={(e) => setHookText(e.target.value)}

             placeholder="HOOK"

             className="w-full h-[44px] px-3 border-[3px] border-black font-black uppercase text-sm rounded-2xl outline-none"

            />

           </div>

          </SubToolbox>


          <SubToolbox

           title="IMAGES"

           icon={ImagePlus}

           headerBg="#FCAF57"

           iconBg="#FFE357"

           isOpen={isImagesOpen}

           onToggle={() => setIsImagesOpen((prev) => !prev)}

           config={CONFIG}>

           <div className="flex flex-col h-full justify-between gap-3">

            <input

             ref={imageInputRef}

             type="file"

             accept="image/*"

             multiple

             className="hidden"

             onChange={(e) => addImages(e.target.files)}

            />

            <div

             onClick={() => imageInputRef.current?.click()}

             className="w-full h-[88px] border-[3px] border-[#9ca3af] border-dashed rounded-2xl bg-gray-100 flex flex-col items-center justify-center gap-2 cursor-pointer">

             <div className="w-10 h-10 border-[2px] border-black rounded-full bg-white flex items-center justify-center">

              <Cloud size={18} className="text-black" />

             </div>

             <span className="text-[10px] font-black uppercase text-black text-center">

              DROP FILES OR CLICK TO UPLOAD

             </span>

            </div>

            <button

             onClick={() => imageInputRef.current?.click()}

             className="group w-full h-[40px] bg-[#FCAF57] border-[3px] border-black rounded-2xl font-[1000] uppercase text-[20px] tracking-tighter flex items-center justify-center gap-2 transition-transform duration-150 ease-out hover:scale-x-[1.02] hover:scale-y-[1.08] active:scale-x-[0.97] active:scale-y-[0.9]">

             <div className="flex items-center justify-center gap-2 transition-transform duration-150 ease-out group-hover:scale-x-[0.98] group-hover:scale-y-[0.93] group-active:scale-x-[1.03] group-active:scale-y-[1.11]">

              <Cloud size={16} className="text-black" />

              <span className="leading-none mt-0.5">UPLOAD IMAGES</span>

             </div>

            </button>

           </div>

          </SubToolbox>


          <SubToolbox

           title="PALETTE"

           icon={Palette}

           headerBg="#FF7497"

           iconBg="#FCAF57"

           isOpen={isPaletteOpen}

           onToggle={() => setIsPaletteOpen((prev) => !prev)}

           openUnits={3}

           config={CONFIG}>

           <div className="space-y-3">

            <div

             className="relative grid gap-3 pt-9"

             style={{

              gridTemplateColumns: `repeat(${colors.length}, minmax(0, 1fr))`,

             }}>

             <div className="absolute top-0 right-0 flex gap-2 z-20">

              <button

               type="button"

               onClick={removePaletteColor}

               className="h-8 w-8 border-[3px] border-black rounded-lg bg-white flex items-center justify-center">

               <Minus size={14} />

              </button>

              <button

               type="button"

               onClick={addPaletteColor}

               className="h-8 w-8 border-[3px] border-black rounded-lg bg-white flex items-center justify-center">

               <Plus size={14} />

              </button>

             </div>

             {colors.map((color, index) => (

              <div key={`${index}-${color}`} className="flex flex-col gap-2">

               <div

                className="h-[96px] rounded-2xl border-[3px] border-black cursor-pointer flex items-center justify-center relative overflow-hidden"

                style={{ backgroundColor: color || "#e5e5e5" }}>

                {!color && (

                 <span className="text-black/10 text-2xl font-black">+</span>

                )}

                <input

                 type="color"

                 value={color || "#ffffff"}

                 onChange={(e) => {

                  const next = [...colors]

                  next[index] = e.target.value

                  setColors(next)

                 }}

                 className="absolute inset-0 opacity-0 cursor-pointer"

                />

               </div>

               <input

                value={color}

                onChange={(e) => {

                 const next = [...colors]

                 next[index] = e.target.value

                 setColors(next)

                }}

                className="w-full border-[2px] border-black rounded-lg px-2 h-8 text-[10px] font-black uppercase bg-[#e5e5e5]"

               />

              </div>

             ))}

            </div>

           </div>

          </SubToolbox>

         </div>


         <div

          className="flex flex-col h-full min-h-0 justify-start"

          style={{ gap: `${CONFIG.gap}px` }}>

          <input

           ref={canvasInputRef}

           type="file"

           accept="image/*"

           multiple

           className="hidden"

           onChange={(e) => addImages(e.target.files)}

          />

          <div className="w-full border-[4px] border-black bg-white rounded-2xl flex-1 min-h-[220px] flex flex-col items-center justify-center p-3 relative overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">

           {canvasPreview ? (

            <img

             src={canvasPreview}

             alt="Canvas preview"

             className="w-full h-full object-contain border-[3px] border-black rounded-2xl"

            />

           ) : (

            <div

             onClick={() => canvasInputRef.current?.click()}

             className="w-full h-full border-[3px] border-[#9ca3af] border-dashed rounded-2xl bg-gray-100 flex flex-col items-center justify-center gap-4 cursor-pointer">

             <div className="w-16 h-16 border-[3px] border-black rounded-full bg-white flex items-center justify-center">

              <Zap size={32} strokeWidth={2.5} className="text-[#FF7497]" />

             </div>

             <h3 className="text-[42px] font-[1000] uppercase tracking-tighter text-black leading-none text-center">

              CANVAS

              <br />

              STANDBY

             </h3>

             <p className="font-black text-black/40 uppercase tracking-[0.18em] text-[11px] text-center">

              DROP FILES OR CLICK TO UPLOAD

             </p>

            </div>

           )}

          </div>


          <div

           className="grid grid-cols-2 shrink-0"

           style={{ gap: `${CONFIG.gap}px` }}>

           <DropdownControl

            label="RATIO"

            value={ratio}

            options={["1:1", "4:5", "9:16", "16:9", "21:9"]}

            onChange={setRatio}

           />

           <DropdownControl

            label="SIZE"

            value={resolution}

            options={["1K", "2K", "4K"]}

            onChange={setResolution}

           />

          </div>


          <button className="w-full h-[60px] border-[4px] border-black rounded-[16px] overflow-hidden cursor-pointer active:translate-y-1 transition-all bg-[#FF7497] hover:bg-[#ff8fae] shrink-0 flex items-stretch">

           <div className="h-full w-[52px] border-r-[4px] border-black bg-[#FCAF57] flex items-center justify-center shrink-0">

            <Zap size={24} strokeWidth={2.5} className="text-black" />

           </div>

           <div className="flex-1 flex items-center justify-center pr-[52px]">

            <span className="text-[28px] sm:text-[30px] font-[900] uppercase tracking-tighter leading-none mt-1 text-black">

             GENERATE ART

            </span>

           </div>

          </button>

         </div>

        </div>

       </div>

      </div>

     </div>

    </div>

   )}


   {showPackScaffold && (

    <div

     className="w-full bg-white flex flex-col overflow-hidden relative shadow-[12px_12px_0px_0px_rgba(0,0,0,0.5)] transition-all"

     style={{

      border: `${CONFIG.scaffoldStroke}px solid black`,

      borderRadius: `${CONFIG.radius}px`,

     }}>

     <header

      onClick={() => setIsPackScaffoldOpen((prev) => !prev)}

      className="bg-[#FCAF57] h-[80px] min-h-[80px] flex items-center justify-between select-none z-30 relative cursor-pointer transition-[margin] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"

      style={{

       borderBottom: `${CONFIG.scaffoldStroke}px solid black`,

       marginBottom: isPackScaffoldOpen ? "0px" : `-${CONFIG.scaffoldStroke}px`,

      }}>

      <div className="flex items-center h-full flex-1">

       <div

        className="h-full w-[80px] flex items-center justify-center shrink-0"

        style={{

         backgroundColor: "#24D3FF",

         borderRight: `${CONFIG.scaffoldStroke}px solid black`,

        }}>

        <Grid3X3 size={40} strokeWidth={2.5} className="text-black" />

       </div>

       <h2 className="text-[28px] sm:text-[34px] md:text-[42px] font-[1000] uppercase tracking-tighter leading-none pl-6 truncate text-black">

        SUBTOOLBOX COMPONENT PACK

       </h2>

      </div>

      <div className="flex items-center gap-3 pr-6 h-full">

       <AnimatedToggleIcon open={isPackScaffoldOpen} size={36} />

      </div>

     </header>


     <div

      className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isPackScaffoldOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>

      <div className="overflow-hidden min-h-0 flex flex-col">

       <div className="p-0 bg-neutral-100 flex-1 relative">

        <div

         className="grid grid-cols-1 lg:grid-cols-2 items-start"

         style={{ padding: `${CONFIG.padding}px`, gap: `${CONFIG.gap}px` }}>

         <div className="flex flex-col" style={{ gap: `${CONFIG.gap}px` }}>

          <SubToolbox

           title="CONTROLS"

           icon={Grid3X3}

           headerBg="#C9F830"

           iconBg="#24D3FF"

           isOpen={isPackControlsOpen}

           onToggle={() => setIsPackControlsOpen((prev) => !prev)}

           config={CONFIG}>

           <div className="space-y-3">

            <div className="grid grid-cols-3 gap-2">

             {[

              ["overview", "OVERVIEW"],

              ["builder", "BUILDER"],

              ["review", "REVIEW"],

             ].map(([key, label]) => (

              <button

               key={key}

               onClick={() =>

                setPackTab(key as "overview" | "builder" | "review")

               }

               className={`h-10 border-[3px] border-black rounded-xl text-[11px] font-black uppercase tracking-wide transition-colors ${packTab === key ? "bg-[#24D3FF]" : "bg-white"}`}>

               {label}

              </button>

             ))}

            </div>


            <div className="grid grid-cols-3 gap-2">

             {[

              { key: "yellow", label: "YELLOW", color: "#FFE357" },

              { key: "red", label: "RED", color: "#FF7497" },

              { key: "green", label: "GREEN", color: "#C9F830" },

             ].map((item) => (

              <button

               key={item.key}

               onClick={() =>

                setPackRowToggles((prev) => ({

                 ...prev,

                 [item.key]: !prev[item.key as keyof typeof prev],

                }))

               }

               className="h-10 border-[3px] border-black rounded-xl text-[10px] font-black uppercase tracking-wide transition-colors"

               style={{

                backgroundColor: packRowToggles[

                 item.key as keyof typeof packRowToggles

                ]

                 ? item.color

                 : "#FFFFFF",

               }}>

               {item.label}

              </button>

             ))}

            </div>


            <input

             value={packInput}

             onChange={(e) => setPackInput(e.target.value)}

             placeholder="TITLE FIELD"

             className="w-full h-10 px-3 border-[3px] border-black rounded-xl text-[12px] font-black uppercase"

            />


            <textarea

             value={packDescription}

             onChange={(e) => setPackDescription(e.target.value)}

             placeholder="DESCRIPTION FIELD"

             className="w-full min-h-[72px] p-3 border-[3px] border-black rounded-xl text-[12px] font-black uppercase resize-none"

            />

           </div>

          </SubToolbox>


          <SubToolbox

           title="FORMS"

           icon={Type}

           headerBg="#FFE357"

           iconBg="#C9F830"

           isOpen={isPackFormsOpen}

           onToggle={() => setIsPackFormsOpen((prev) => !prev)}

           config={CONFIG}>

           <div className="space-y-3">

            <div className="grid grid-cols-2 gap-3">

             <DropdownControl

              label="MODE"

              value={packSelect}

              options={["DEFAULT", "ADVANCED", "BULK", "SAFE"]}

              onChange={setPackSelect}

             />

             <DropdownControl

              label="TYPE"

              value={packSecondarySelect}

              options={["PRIORITY", "STANDARD", "BACKLOG"]}

              onChange={setPackSecondarySelect}

             />

            </div>

            <div className="h-10 px-3 border-[3px] border-black rounded-xl bg-white text-[10px] font-black uppercase tracking-widest flex items-center">

             Form options focus only

            </div>

           </div>

          </SubToolbox>

         </div>

        </div>


        <SubToolbox

         title="SWITCHES"

         icon={Check}

         headerBg="#24D3FF"

         iconBg="#FF7497"

         isOpen={isPackSwitchesOpen}

         onToggle={() => setIsPackSwitchesOpen((prev) => !prev)}

         config={CONFIG}>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

          <div className="space-y-3">

            <div className="border-[3px] border-black rounded-xl bg-white p-3">

             <div className="grid grid-cols-[54px_30px_30px] gap-x-8 gap-y-2 items-center justify-start">

              <div className="text-[9px] font-black uppercase tracking-[0.16em] text-black/60 text-center">

               Toggles

              </div>

              <div className="text-[9px] font-black uppercase tracking-[0.16em] text-black/60 text-center">

               Boxes

              </div>

              <div className="text-[9px] font-black uppercase tracking-[0.16em] text-black/60 text-center">

               Radios

              </div>


              {[

               { label: "RED", color: "#FF7497" },

               { label: "ORANGE", color: "#FCAF57" },

               { label: "YELLOW", color: "#FFE357" },

               { label: "GREEN", color: "#C9F830" },

               { label: "BLUE", color: "#24D3FF" },

               { label: "PURPLE", color: "#CC99FF" },

               { label: "WHITE", color: "#FFFFFF" },

              ].map((row, idx) => {

               const colorFill = row.label === "WHITE" ? "#F3F4F6" : row.color

               const radioDot = row.label === "WHITE" ? "#E5E7EB" : row.color

               return (

                <React.Fragment key={row.label}>

                 <button

                  type="button"

                  aria-label={`${row.label} toggle`}

                  aria-pressed={packPaletteToggles[idx]}

                  onClick={() =>

                   setPackPaletteToggles((prev) =>

                    prev.map((value, i) => (i === idx ? !value : value)),

                   )

                  }

                  className="relative w-[54px] h-[30px] border-[3px] border-black rounded-full transition-colors duration-300 ease-in-out"

                  style={{

                   backgroundColor: packPaletteToggles[idx]

                    ? colorFill

                    : "#ffffff",

                  }}>

                  <span

                   className="absolute top-1/2 h-[18px] w-[18px] rounded-full bg-black transition-all duration-300 ease-in-out"

                   style={{

                    left: packPaletteToggles[idx] ? "calc(100% - 21px)" : "3px",

                    transform: "translateY(-50%)",

                   }}

                  />

                 </button>


                 <button

                  type="button"

                  aria-label={`${row.label} checkbox`}

                  aria-pressed={packPaletteChecks[idx]}

                  onClick={() =>

                   setPackPaletteChecks((prev) =>

                    prev.map((value, i) => (i === idx ? !value : value)),

                   )

                  }

                  className="w-[30px] h-[30px] border-[3px] border-black rounded-[8px] flex items-center justify-center transition-colors duration-300 ease-in-out"

                  style={{

                   backgroundColor: packPaletteChecks[idx]

                    ? colorFill

                    : "#ffffff",

                  }}>

                  <img

                   src={closeIcon21}

                   alt=""

                   aria-hidden="true"

                   className={`w-[24px] h-[24px] select-none pointer-events-none transition-opacity duration-300 ease-in-out ${packPaletteChecks[idx] ? "opacity-100" : "opacity-0"}`}

                  />

                 </button>


                 <button

                  type="button"

                  aria-label={`${row.label} radio`}

                  aria-pressed={packPaletteRadios[idx]}

                  onClick={() =>

                   setPackPaletteRadios((prev) =>

                    prev.map((value, i) => (i === idx ? !value : value)),

                   )

                  }

                  className="w-[30px] h-[30px] border-[3px] border-black rounded-full flex items-center justify-center bg-white transition-colors duration-300 ease-in-out">

                  <span

                   className="h-[18px] w-[18px] rounded-full transition-colors duration-300 ease-in-out"

                   style={{

                    backgroundColor: packPaletteRadios[idx]

                     ? radioDot

                     : "transparent",

                   }}

                  />

                 </button>

                </React.Fragment>

               )

              })}

             </div>

            </div>


            <div className="border-[3px] border-black rounded-xl bg-[#f8fafc] p-3 space-y-3">

             <div>

              <div className="flex items-center justify-between mb-1">

               <span className="text-[11px] font-black uppercase tracking-[0.08em]">

                CTR Target

               </span>

               <span className="text-[14px] font-[1000]">

                {switchCtrTarget}%

               </span>

              </div>

              <input

               type="range"

               min={0}

               max={20}

               value={switchCtrTarget}

               onChange={(e) => setSwitchCtrTarget(Number(e.target.value))}

               className="w-full accent-[#24D3FF]"

              />

             </div>


             <div>

              <div className="flex items-center justify-between mb-1">

               <span className="text-[11px] font-black uppercase tracking-[0.08em]">

                Saturation

               </span>

               <span className="text-[14px] font-[1000]">

                {switchSaturation}

               </span>

              </div>

              <input

               type="range"

               min={0}

               max={100}

               value={switchSaturation}

               onChange={(e) => setSwitchSaturation(Number(e.target.value))}

               className="w-full accent-[#84cc16]"

              />

             </div>


             <div>

              <div className="flex items-center justify-between mb-1">

               <span className="text-[11px] font-black uppercase tracking-[0.08em]">

                Resolution

               </span>

               <span className="text-[14px] font-[1000]">

                {switchResolutionLabel}

               </span>

              </div>

              <input

               type="range"

               min={0}

               max={3}

               step={1}

               value={switchResolution}

               onChange={(e) => setSwitchResolution(Number(e.target.value))}

               className="w-full accent-[#FF7497]"

              />

              <div className="mt-1 flex items-center justify-between text-[9px] font-black uppercase tracking-[0.08em] text-black/45">

               <span>480P</span>

               <span>1K</span>

               <span>2K</span>

               <span>4K</span>

              </div>

             </div>

            </div>

           </div>


           <div className="space-y-3">

            <div className="border-[3px] border-black rounded-xl bg-white p-3 space-y-4">

             <div className="text-[9px] font-black uppercase tracking-[0.16em] text-black/60 text-center mb-2">

              Custom Range Sliders

             </div>


             {/* Custom Slider 1 - Engagement Boost */}

             <div className="flex flex-col gap-1">

              <div className="flex items-center justify-between">

               <span className="text-[9px] font-black uppercase tracking-[0.12em] text-black/60">

                Engagement

               </span>

               <span className="text-[11px] font-[1000] text-black">

                {switchCtrTarget * 5}

               </span>

              </div>

              <div className="relative w-full h-[30px] flex items-center">

               <div

                className="absolute w-full h-[14px] border-[3px] border-black rounded-full box-border overflow-hidden"

                style={{ backgroundColor: "rgba(255, 116, 151, 0.2)" }}>

                <div

                 className="h-full transition-none"

                 style={{

                  width: `${(switchCtrTarget / 20) * 100}%`,

                  backgroundColor: "rgb(255, 116, 151)",

                 }}

                />

               </div>

               <input

                type="range"

                min={0}

                max={20}

                value={switchCtrTarget}

                onChange={(e) => setSwitchCtrTarget(Number(e.target.value))}

                className="absolute w-full h-full appearance-none bg-transparent cursor-pointer z-10 margin-0"

                style={{ WebkitAppearance: "none" }}

               />

              </div>

             </div>


             {/* Custom Slider 2 - Saturation */}

             <div className="flex flex-col gap-1">

              <div className="flex items-center justify-between">

               <span className="text-[9px] font-black uppercase tracking-[0.12em] text-black/60">

                Saturation

               </span>

               <span className="text-[11px] font-[1000] text-black">

                {switchSaturation}

               </span>

              </div>

              <div className="relative w-full h-[30px] flex items-center">

               <div

                className="absolute w-full h-[14px] border-[3px] border-black rounded-full box-border overflow-hidden"

                style={{ backgroundColor: "rgba(36, 211, 255, 0.2)" }}>

                <div

                 className="h-full transition-none"

                 style={{

                  width: `${switchSaturation}%`,

                  backgroundColor: "rgb(36, 211, 255)",

                 }}

                />

               </div>

               <input

                type="range"

                min={0}

                max={100}

                value={switchSaturation}

                onChange={(e) => setSwitchSaturation(Number(e.target.value))}

                className="absolute w-full h-full appearance-none bg-transparent cursor-pointer z-10 margin-0"

                style={{ WebkitAppearance: "none" }}

               />

              </div>

             </div>


             {/* Custom Slider 3 - Resolution */}

             <div className="flex flex-col gap-1">

              <div className="flex items-center justify-between">

               <span className="text-[9px] font-black uppercase tracking-[0.12em] text-black/60">

                Resolution

               </span>

               <span className="text-[11px] font-[1000] text-black">

                {switchResolutionLabel}

               </span>

              </div>

              <div className="relative w-full h-[30px] flex items-center">

               <div

                className="absolute w-full h-[14px] border-[3px] border-black rounded-full box-border overflow-hidden"

                style={{ backgroundColor: "rgba(201, 248, 48, 0.2)" }}>

                <div

                 className="h-full transition-none"

                 style={{

                  width: `${(switchResolution / 3) * 100}%`,

                  backgroundColor: "rgb(201, 248, 48)",

                 }}

                />

               </div>

               <input

                type="range"

                min={0}

                max={3}

                step={1}

                value={switchResolution}

                onChange={(e) => setSwitchResolution(Number(e.target.value))}

                className="absolute w-full h-full appearance-none bg-transparent cursor-pointer z-10 margin-0"

                style={{ WebkitAppearance: "none" }}

               />

              </div>

             </div>


             {/* Custom Slider 4 - Contrast */}

             <div className="flex flex-col gap-1">

              <div className="flex items-center justify-between">

               <span className="text-[9px] font-black uppercase tracking-[0.12em] text-black/60">

                Contrast

               </span>

               <span className="text-[11px] font-[1000] text-black">75</span>

              </div>

              <div className="relative w-full h-[30px] flex items-center">

               <div

                className="absolute w-full h-[14px] border-[3px] border-black rounded-full box-border overflow-hidden"

                style={{ backgroundColor: "rgba(255, 227, 87, 0.2)" }}>

                <div

                 className="h-full transition-none"

                 style={{ width: "75%", backgroundColor: "rgb(255, 227, 87)" }}

                />

               </div>

               <input

                type="range"

                min={0}

                max={100}

                value={75}

                onChange={() => {}}

                className="absolute w-full h-full appearance-none bg-transparent cursor-pointer z-10 margin-0"

                style={{ WebkitAppearance: "none" }}

               />

              </div>

             </div>


             {/* Custom Slider 5 - Brightness */}

             <div className="flex flex-col gap-1">

              <div className="flex items-center justify-between">

               <span className="text-[9px] font-black uppercase tracking-[0.12em] text-black/60">

                Brightness

               </span>

               <span className="text-[11px] font-[1000] text-black">60</span>

              </div>

              <div className="relative w-full h-[30px] flex items-center">

               <div

                className="absolute w-full h-[14px] border-[3px] border-black rounded-full box-border overflow-hidden"

                style={{ backgroundColor: "rgba(252, 167, 87, 0.2)" }}>

                <div

                 className="h-full transition-none"

                 style={{ width: "60%", backgroundColor: "rgb(252, 167, 87)" }}

                />

               </div>

               <input

                type="range"

                min={0}

                max={100}

                value={60}

                onChange={() => {}}

                className="absolute w-full h-full appearance-none bg-transparent cursor-pointer z-10 margin-0"

                style={{ WebkitAppearance: "none" }}

               />

              </div>

             </div>

            </div>

           </div>

          </div>

         </SubToolbox>


         <div className="flex flex-col" style={{ gap: `${CONFIG.gap}px` }}>

          <SubToolbox

           title="MEDIA ENGINE"

           icon={MonitorPlay}

           headerBg="#CC99FF"

           iconBg="#FFFFFF"

           isOpen={isPackMediaOpen}

           onToggle={() => setIsPackMediaOpen((prev) => !prev)}

           config={CONFIG}>

           <div className="border-[3px] border-black rounded-[14px] bg-white overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">

            <div className="h-11 bg-[#CC99FF] border-b-[3px] border-black flex items-center justify-between px-3">

             <div className="flex items-center gap-2">

              <MonitorPlay size={16} strokeWidth={3} className="text-black" />

              <span className="text-[10px] font-black uppercase tracking-[0.14em]">

               Preview_Renderer.exe

              </span>

             </div>

             <div className="flex items-center gap-2">

              <button className="w-7 h-7 border-[2px] border-black rounded-md bg-[#24D3FF] flex items-center justify-center">

               <Minus size={12} strokeWidth={3.5} />

              </button>

              <button className="w-7 h-7 border-[2px] border-black rounded-md bg-[#FFE357] flex items-center justify-center">

               <Square size={10} strokeWidth={3.5} />

              </button>

              <button className="w-7 h-7 border-[2px] border-black rounded-md bg-[#FF7497] flex items-center justify-center">

               <X size={13} strokeWidth={3.5} />

              </button>

             </div>

            </div>


            <div className="relative aspect-video bg-gradient-to-br from-[#24D3FF] to-[#CCFF00] border-b-[3px] border-black flex items-center justify-center overflow-hidden">

             <div

              className="absolute inset-0 opacity-20"

              style={{

               backgroundImage:

                "linear-gradient(black 2px, transparent 2px), linear-gradient(90deg, black 2px, transparent 2px)",

               backgroundSize: "40px 40px",

              }}

             />

             <button

              type="button"

              onClick={() => setMediaPlaying((prev) => !prev)}

              className="relative z-10 w-16 h-16 bg-[#FF7497] border-[3px] border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform">

              {mediaPlaying ? (

               <Pause size={28} strokeWidth={3} className="text-black" />

              ) : (

               <Play

                size={28}

                strokeWidth={3}

                fill="currentColor"

                className="text-black ml-1"

               />

              )}

             </button>

            </div>


            <div className="p-3 bg-white space-y-3">

             <div className="flex items-center gap-2">

              <span className="text-[9px] font-black uppercase">01:24</span>

              <div className="flex-1 h-4 border-[2px] border-black bg-[#f3f4f6] rounded-full relative">

               <div

                className="absolute top-0 left-0 h-full bg-[#CC99FF] rounded-l-full border-r-[2px] border-black"

                style={{ width: `${mediaProgress}%` }}

               />

               <button

                type="button"

                onClick={() =>

                 setMediaProgress((prev) => (prev >= 90 ? 20 : prev + 10))

                }

                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-[#CCFF00] border-[2px] border-black rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]"

                style={{ left: `${mediaProgress}%` }}

               />

              </div>

              <span className="text-[9px] font-black uppercase">05:00</span>

             </div>


             <div className="flex items-center justify-between gap-2">

              <div className="flex gap-2">

               <button className="h-9 px-3 bg-[#24D3FF] border-[3px] border-black rounded-xl text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]">

                Add Marker

               </button>

               <button className="h-9 px-3 bg-white border-[3px] border-black rounded-xl text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]">

                Trim

               </button>

              </div>

              <div className="flex items-center gap-2">

               <button className="w-9 h-9 border-[3px] border-black rounded-xl flex items-center justify-center hover:bg-gray-100">

                <Settings size={16} strokeWidth={3} />

               </button>

               <div className="h-9 bg-black text-[#CCFF00] border-[3px] border-black rounded-xl px-3 flex items-center text-[9px] font-black uppercase tracking-[0.12em]">

                HQ ON

               </div>

              </div>

             </div>

            </div>

           </div>

          </SubToolbox>


          <SubToolbox

           title="DATA"

           icon={Search}

           headerBg="#24D3FF"

           iconBg="#FFE357"

           isOpen={isPackDataOpen}

           onToggle={() => setIsPackDataOpen((prev) => !prev)}

           config={CONFIG}>

           <div className="space-y-3">

            <div className="grid grid-cols-3 gap-3">

             {[

              { label: "VIEWS", value: "12.4K", bg: "#24D3FF" },

              { label: "CTR", value: "6.8%", bg: "#C9F830" },

              { label: "REV", value: "$402", bg: "#FCAF57" },

             ].map((stat) => (

              <div

               key={stat.label}

               className="border-[3px] border-black rounded-xl overflow-hidden bg-white">

               <div

                className="h-6 border-b-[3px] border-black text-[9px] font-black uppercase flex items-center justify-center"

                style={{ backgroundColor: stat.bg }}>

                {stat.label}

               </div>

               <div className="h-12 text-[20px] font-[1000] flex items-center justify-center">

                {stat.value}

               </div>

              </div>

             ))}

            </div>

            <div className="border-[3px] border-black rounded-xl overflow-hidden">

             <div className="grid grid-cols-[13fr_7fr_7fr] h-8 bg-[#FFE357] border-b-[3px] border-black text-[10px] font-black uppercase">

              <div className="px-2 flex items-center">TITLE</div>

              <div className="px-2 flex items-center justify-center">VIEWS</div>

              <div className="px-2 flex items-center justify-center">CTR</div>

             </div>

             {[

              ["BATTLE RECAP", "9.8K", "7.2%"],

              ["MARCHING ORDER", "7.4K", "6.5%"],

              ["HISTORY SHORT", "5.1K", "5.9%"],

             ].map((row) => (

              <div

               key={row[0]}

               className="grid grid-cols-[13fr_7fr_7fr] h-8 border-b-[2px] border-black/20 last:border-b-0 text-[10px] font-black uppercase bg-white">

               <div className="px-2 flex items-center">{row[0]}</div>

               <div className="px-2 flex items-center justify-center">

                {row[1]}

               </div>

               <div className="px-2 flex items-center justify-center">

                {row[2]}

               </div>

              </div>

             ))}

            </div>

            <div className="grid grid-cols-3 gap-2">

             <button

              className="h-9 border-[3px] border-black rounded-xl bg-white text-[11px] font-black uppercase"

              onClick={() => setPackPage((prev) => Math.max(1, prev - 1))}>

              PREV

             </button>

             <div className="h-9 border-[3px] border-black rounded-xl bg-[#C9F830] text-[11px] font-black uppercase flex items-center justify-center">

              PAGE {packPage}

             </div>

             <button

              className="h-9 border-[3px] border-black rounded-xl bg-white text-[11px] font-black uppercase"

              onClick={() => setPackPage((prev) => Math.min(9, prev + 1))}>

              NEXT

             </button>

            </div>

           </div>

          </SubToolbox>


          <SubToolbox

           title="SCHEDULE"

           icon={Bell}

           headerBg="#C9F830"

           iconBg="#24D3FF"

           isOpen={isPackScheduleOpen}

           onToggle={() => setIsPackScheduleOpen((prev) => !prev)}

           config={CONFIG}>

           <div className="space-y-3">

            <div className="grid grid-cols-7 gap-2">

             {["S", "M", "T", "W", "T", "F", "S"].map((d) => (

              <div

               key={d}

               className="h-7 text-[10px] font-black uppercase flex items-center justify-center text-black/40">

               {d}

              </div>

             ))}

             {Array.from({ length: 14 }).map((_, i) => (

              <div

               key={`pack-day-${i}`}

               className={`h-8 border-[2px] border-black rounded-lg text-[11px] font-black flex items-center justify-center ${i === 8 ? "bg-[#FCAF57]" : "bg-white"}`}>

               {i + 1}

              </div>

             ))}

            </div>

            <div className="grid grid-cols-3 gap-2">

             {[1, 2, 3].map((step) => (

              <button

               key={`step-${step}`}

               onClick={() => setPackStep(step)}

               className={`h-10 border-[3px] border-black rounded-xl text-[11px] font-black uppercase ${packStep === step ? "bg-[#24D3FF]" : "bg-white"}`}>

               STEP {step}

              </button>

             ))}

            </div>

            <div className="h-24 border-[3px] border-black rounded-xl bg-white p-3 text-[10px] font-black uppercase leading-relaxed">

             <p>LINE CHART CONTAINER</p>

             <div className="mt-2 h-10 border-[2px] border-dashed border-black/30 rounded-lg bg-[#f8fafc]" />

            </div>

           </div>

          </SubToolbox>


          <SubToolbox

           title="STATES"

           icon={ImagePlus}

           headerBg="#FFE357"

           iconBg="#FF7497"

           isOpen={isPackStatesOpen}

           onToggle={() => setIsPackStatesOpen((prev) => !prev)}

           config={CONFIG}>

           <div className="space-y-3">

            <div className="h-20 border-[3px] border-dashed border-black/30 rounded-xl bg-white flex items-center justify-center text-[11px] font-black uppercase">

             EMPTY / DROPZONE

            </div>

            <div className="h-12 border-[3px] border-black rounded-xl bg-[#FF7497] text-white flex items-center px-3 text-[11px] font-black uppercase">

             ALERT: ACTION REQUIRED

            </div>

            <div className="grid grid-cols-2 gap-3">

             <div className="h-20 border-[3px] border-black rounded-xl bg-white flex items-center justify-center text-[11px] font-black uppercase">

              MODAL PREVIEW

             </div>

             <div className="h-20 border-[3px] border-black rounded-xl bg-white flex items-center justify-center text-[11px] font-black uppercase">

              SIDE PANEL PREVIEW

             </div>

            </div>

           </div>

          </SubToolbox>

         </div>

        </div>

       </div>

      </div>

     </div>

    </div>

   )}


   {showComponentGrid && (

    <div

     className="w-full bg-white flex flex-col overflow-hidden relative shadow-[12px_12px_0px_0px_rgba(0,0,0,0.5)] transition-all"

     style={{

      border: `${CONFIG.scaffoldStroke}px solid black`,

      borderRadius: `${CONFIG.radius}px`,

     }}>

     <header

      onClick={() => setIsComponentsOpen((prev) => !prev)}

      className="bg-[#C9F830] h-[80px] min-h-[80px] flex items-center justify-between select-none z-30 relative cursor-pointer transition-[margin] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"

      style={{

       borderBottom: `${CONFIG.scaffoldStroke}px solid black`,

       marginBottom: isComponentsOpen ? "0px" : `-${CONFIG.scaffoldStroke}px`,

      }}>

      <div className="flex items-center h-full flex-1">

       <div

        className="h-full w-[80px] flex items-center justify-center shrink-0"

        style={{

         backgroundColor: "#24D3FF",

         borderRight: `${CONFIG.scaffoldStroke}px solid black`,

        }}>

        <Grid3X3 size={40} strokeWidth={2.5} className="text-black" />

       </div>

       <h2 className="text-[32px] sm:text-[40px] md:text-[50px] font-[1000] uppercase tracking-tighter leading-none pl-6 truncate text-black">

        COMPONENT GRID LAB

       </h2>

      </div>

      <div className="flex items-center gap-3 pr-6 h-full">

       <AnimatedToggleIcon open={isComponentsOpen} size={40} />

      </div>

     </header>


     <div

      className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isComponentsOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>

      <div className="overflow-hidden min-h-0">

       <div

        className="bg-neutral-100"

        style={{ padding: `${CONFIG.padding}px` }}>

        <div className="bg-white border-[4px] border-black rounded-2xl p-4 shadow-[6px_6px_0px_0px_black]">

         <div className="h-9 mb-4 px-3 border-[3px] border-black rounded-xl bg-[#FFE357] text-[10px] font-black uppercase tracking-widest flex items-center justify-between">

          <span>Section 1 Live Wrapper</span>

          <span>40+ Components</span>

         </div>


         <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 mb-4">

          <button className="h-12 border-[3px] border-black rounded-2xl bg-white text-[11px] font-black uppercase flex items-center justify-center gap-2">

           <Search size={16} /> C01 Search Chip

          </button>

          <button className="h-12 border-[3px] border-black rounded-2xl bg-[#FF7497] text-[11px] font-black uppercase flex items-center justify-center gap-2">

           <Zap size={16} /> C02 Action Button

          </button>

          <div className="h-12 border-[3px] border-black rounded-2xl bg-white text-[11px] font-black uppercase flex items-center justify-center gap-2">

           <Bell size={16} /> C03 Alert Pill

          </div>

          <div className="h-12 border-[3px] border-black rounded-2xl bg-white text-[11px] font-black uppercase flex items-center justify-center gap-2">

           <Check size={16} /> C04 Toggle Chip

          </div>

         </div>


         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

          <ComponentTile

           id="C05"

           title="Text Input"

           description="Used in studios/settings forms.">

           <input

            className="w-full h-10 border-[3px] border-black rounded-xl px-3 text-xs font-black uppercase"

            defaultValue="Title input"

           />

          </ComponentTile>


          <ComponentTile

           id="C06"

           title="Textarea"

           description="Used in concept and script tools.">

           <textarea

            className="w-full min-h-[70px] border-[3px] border-black rounded-xl p-2 text-xs font-black uppercase"

            defaultValue="Long-form prompt"

           />

          </ComponentTile>


          <ComponentTile

           id="C07"

           title="Checkbox Row"

           description="Used in settings and filter rows.">

           <div className="space-y-2">

            <label className="h-8 border-[3px] border-black rounded-xl bg-white px-2 flex items-center gap-2 text-[10px] font-black uppercase">

             <Check size={12} /> Include Hashtags

            </label>

            <label className="h-8 border-[3px] border-black rounded-xl bg-white px-2 flex items-center gap-2 text-[10px] font-black uppercase">

             <Check size={12} /> Include Emoji

            </label>

           </div>

          </ComponentTile>


          <ComponentTile

           id="C08"

           title="Small Stat Modules"

           description="Module set moved to dedicated full-width section below.">

           <div className="h-full min-h-[110px] border-[3px] border-black rounded-xl bg-white flex items-center justify-center text-[10px] font-black uppercase opacity-60">

            See full-width module below

           </div>

          </ComponentTile>

         </div>


         <div className="mt-4 border-[4px] border-black rounded-2xl bg-white p-3">

          <div className="h-9 mb-3 px-3 border-[3px] border-black rounded-xl bg-[#FF7497] text-[10px] font-black uppercase tracking-widest flex items-center justify-between">

           <span>C08 LARGE STAT MODULE SET</span>

           <span>FULL WIDTH</span>

          </div>

          <div className="w-full grid grid-cols-3 gap-x-2 gap-y-2 place-items-center py-1">

           <InvertedStatModule

            label="Views"

            value="69"

            accentColor="#ff7497"

            interiorColor="#FFFFFF"

            size={statModuleSize}

           />

           <InvertedStatModule

            label="Likes"

            value="69"

            accentColor="#FCAF57"

            interiorColor="#FFFFFF"

            size={statModuleSize}

           />

           <InvertedStatModule

            label="Shares"

            value="69"

            accentColor="#FFE357"

            interiorColor="#FFFFFF"

            size={statModuleSize}

           />

           <InvertedStatModule

            label="$REV"

            value="69"

            accentColor="#C9F830"

            interiorColor="#FFFFFF"

            size={statModuleSize}

           />

           <InvertedStatModule

            label="CMNTS"

            value="69"

            accentColor="#24D3FF"

            interiorColor="#FFFFFF"

            size={statModuleSize}

           />

           <InvertedStatModule

            label="STW%"

            value="69"

            accentColor="#CC99FF"

            interiorColor="#FFFFFF"

            size={statModuleSize}

           />

          </div>

         </div>


         <div className="mt-4 border-[4px] border-black rounded-2xl bg-white p-3">

          <div className="h-9 mb-3 px-3 border-[3px] border-black rounded-xl bg-[#24D3FF] text-[10px] font-black uppercase tracking-widest flex items-center justify-between">

           <span>C08 STAT MODULE SET</span>

           <span>FULL WIDTH</span>

          </div>

          <div className="w-full grid grid-cols-3 gap-x-2 gap-y-2 place-items-center py-1">

           <InvertedStatModuleSoft

            label="Views"

            value="69"

            accentColor="#ff7497"

            interiorColor="#E4E7EB"

            size={statModuleMiniSize}

            width={statModuleMiniWidth}

           />

           <InvertedStatModuleSoft

            label="Likes"

            value="69"

            accentColor="#FCAF57"

            interiorColor="#E4E7EB"

            size={statModuleMiniSize}

            width={statModuleMiniWidth}

           />

           <InvertedStatModuleSoft

            label="Shares"

            value="69"

            accentColor="#FFE357"

            interiorColor="#E4E7EB"

            size={statModuleMiniSize}

            width={statModuleMiniWidth}

           />

           <InvertedStatModuleSoft

            label="$REV"

            value="69"

            accentColor="#C9F830"

            interiorColor="#E4E7EB"

            size={statModuleMiniSize}

            width={statModuleMiniWidth}

           />

           <InvertedStatModuleSoft

            label="CMNTS"

            value="69"

            accentColor="#24D3FF"

            interiorColor="#E4E7EB"

            size={statModuleMiniSize}

            width={statModuleMiniWidth}

           />

           <InvertedStatModuleSoft

            label="STW%"

            value="69"

            accentColor="#CC99FF"

            interiorColor="#E4E7EB"

            size={statModuleMiniSize}

            width={statModuleMiniWidth}

           />

          </div>

         </div>


         <div className="mt-6 border-[4px] border-black rounded-2xl bg-white p-3">

          <div className="h-9 mb-3 px-3 border-[3px] border-black rounded-xl bg-[#C9F830] text-[10px] font-black uppercase tracking-widest flex items-center justify-between">

           <span>TOGGLE FORGE</span>

           <span>5 STYLES</span>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">

           <div className="border-[3px] border-black rounded-xl p-3 bg-white">

            <div className="text-[9px] font-black uppercase mb-2">

             Neon Rail

            </div>

            <button

             type="button"

             onClick={() => setToggleOne((prev) => !prev)}

             className="relative w-full h-12 border-[3px] border-black rounded-xl bg-[#e5e7eb] overflow-hidden">

             <div

              className={`absolute inset-0 transition-all ${toggleOne ? "bg-[#24D3FF] synth-stripes" : "bg-[#d1d5db]"}`}

             />

             <div

              className={`absolute top-1 h-8 w-8 rounded-lg border-[3px] border-black bg-white transition-all ${toggleOne ? "left-[calc(100%-2.5rem)]" : "left-1"}`}

             />

            </button>

           </div>


           <div className="border-[3px] border-black rounded-xl p-3 bg-white">

            <div className="text-[9px] font-black uppercase mb-2">

             Split Blade

            </div>

            <button

             type="button"

             onClick={() => setToggleTwo((prev) => !prev)}

             className="w-full h-12 border-[3px] border-black rounded-xl overflow-hidden grid grid-cols-2">

             <div

              className={`flex items-center justify-center text-[10px] font-black uppercase transition-colors ${toggleTwo ? "bg-black text-white" : "bg-white text-black"}`}>

              Off

             </div>

             <div

              className={`flex items-center justify-center text-[10px] font-black uppercase transition-colors ${toggleTwo ? "bg-[#FF7497] text-black" : "bg-[#d1d5db] text-black"}`}>

              On

             </div>

            </button>

           </div>


           <div className="border-[3px] border-black rounded-xl p-3 bg-white">

            <div className="text-[9px] font-black uppercase mb-2">

             Dot Matrix

            </div>

            <button

             type="button"

             onClick={() => setToggleThree((prev) => !prev)}

             className="w-full h-12 border-[3px] border-black rounded-xl bg-white px-2 grid grid-cols-4 gap-1">

             {Array.from({ length: 8 }).map((_, idx) => (

              <span

               key={`dot-${idx}`}

               className={`rounded-full border border-black transition-all ${toggleThree ? "bg-[#C9F830] synth-pulse" : "bg-[#d1d5db]"}`}

              />

             ))}

            </button>

           </div>


           <div className="border-[3px] border-black rounded-xl p-3 bg-white">

            <div className="text-[9px] font-black uppercase mb-2">

             Wave Gate

            </div>

            <button

             type="button"

             onClick={() => setToggleFour((prev) => !prev)}

             className="relative w-full h-12 border-[3px] border-black rounded-xl bg-[#e5e7eb] overflow-hidden">

             <div

              className={`absolute left-0 top-0 h-full transition-all ${toggleFour ? "w-full bg-[#FFE357]" : "w-1/3 bg-[#d1d5db]"}`}

             />

             <span className="relative z-10 h-full flex items-center justify-center text-[10px] font-black uppercase">

              {toggleFour ? "Armed" : "Idle"}

             </span>

            </button>

           </div>


           <div className="border-[3px] border-black rounded-xl p-3 bg-white">

            <div className="text-[9px] font-black uppercase mb-2">

             Orbital Lock

            </div>

            <button

             type="button"

             onClick={() => setToggleFive((prev) => !prev)}

             className="relative w-full h-12 border-[3px] border-black rounded-xl bg-black overflow-hidden">

             <span

              className={`absolute left-1/2 top-1/2 h-8 w-8 rounded-full border-[2px] border-black -translate-x-1/2 -translate-y-1/2 transition-all ${toggleFive ? "bg-[#24D3FF] synth-glow scale-110" : "bg-[#9ca3af] scale-90"}`}

             />

             <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black uppercase text-white tracking-wider">

              {toggleFive ? "Sync" : "Mute"}

             </span>

            </button>

           </div>

          </div>

         </div>


         <div className="mt-4 border-[4px] border-black rounded-2xl bg-white p-3">

          <div className="h-9 mb-3 px-3 border-[3px] border-black rounded-xl bg-[#FFB570] text-[10px] font-black uppercase tracking-widest flex items-center justify-between">

           <span>BUTTON ARSENAL</span>

           <span>10 STYLES</span>

          </div>

          <div className="h-9 mb-3 px-3 border-[2px] border-black rounded-lg bg-[#111827] text-[#5ff6ff] text-[10px] font-black uppercase flex items-center justify-between">

           <span>Last Trigger</span>

           <span className={`${buttonBurst % 2 === 1 ? "synth-pulse" : ""}`}>

            {buttonFeedback}

           </span>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">

           <button

            type="button"

            onClick={() => fireButton("Turbo Launch")}

            className="h-12 border-[3px] border-black rounded-xl bg-gradient-to-r from-[#24D3FF] to-[#5BE8A8] text-black text-[10px] font-black uppercase hover:-translate-y-0.5 active:translate-y-0.5 transition-all">

            Turbo Launch

           </button>

           <button

            type="button"

            onClick={() => fireButton("Retro Pop")}

            className="h-12 border-[3px] border-black rounded-xl bg-[#FF7497] synth-stripes text-black text-[10px] font-black uppercase hover:brightness-110 transition-all">

            Retro Pop

           </button>

           <button

            type="button"

            onClick={() => fireButton("Blackout")}

            className="h-12 border-[3px] border-black rounded-xl bg-black text-[#5ff6ff] text-[10px] font-black uppercase hover:shadow-[0_0_0_4px_#5ff6ff] transition-all">

            Blackout

           </button>

           <button

            type="button"

            onClick={() => fireButton("Lime Snap")}

            className="h-12 border-[3px] border-black rounded-xl bg-[#C9F830] text-black text-[10px] font-black uppercase hover:rotate-[-1deg] transition-all">

            Lime Snap

           </button>

           <button

            type="button"

            onClick={() => fireButton("Cloud Tap")}

            className="h-12 border-[3px] border-black rounded-xl bg-white text-black text-[10px] font-black uppercase hover:bg-[#f3f4f6] transition-all flex items-center justify-center gap-2">

            <Cloud size={14} />

            Cloud Tap

           </button>

           <button

            type="button"

            onClick={() => fireButton("Flash Gate")}

            className="h-12 border-[3px] border-black rounded-xl bg-gradient-to-b from-[#FFE357] to-[#FCAF57] text-black text-[10px] font-black uppercase hover:scale-[1.02] transition-transform">

            Flash Gate

           </button>

           <button

            type="button"

            onClick={() => fireButton("Volt Edge")}

            className="h-12 border-[3px] border-black rounded-xl bg-[#24D3FF] text-black text-[10px] font-black uppercase shadow-[4px_4px_0px_0px_black] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">

            Volt Edge

           </button>

           <button

            type="button"

            onClick={() => fireButton("Rally")}

            className="h-12 border-[3px] border-black rounded-xl bg-[#CC99FF] text-black text-[10px] font-black uppercase hover:tracking-wider transition-all">

            Rally

           </button>

           <button

            type="button"

            onClick={() => fireButton("Crystal")}

            className="h-12 border-[3px] border-black rounded-xl bg-gradient-to-r from-white to-[#e5e7eb] text-black text-[10px] font-black uppercase hover:from-[#ecfeff] hover:to-white transition-all">

            Crystal

           </button>

           <button

            type="button"

            onClick={() => fireButton("Pulse Lock")}

            className={`h-12 border-[3px] border-black rounded-xl bg-[#FF7497] text-black text-[10px] font-black uppercase transition-all ${buttonBurst % 2 === 0 ? "" : "synth-pulse"}`}>

            Pulse Lock

           </button>

          </div>

         </div>


         <div className="mt-4 border-[4px] border-black rounded-2xl bg-white p-3">

          <div className="h-9 mb-3 px-3 border-[3px] border-black rounded-xl bg-[#24D3FF] text-[10px] font-black uppercase tracking-widest flex items-center justify-between">

           <span>SLIDER SPECTRUM</span>

           <span>5 STYLES</span>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">

           <div className="border-[3px] border-black rounded-xl p-2 bg-white">

            <div className="text-[9px] font-black uppercase mb-1">

             Velocity {sliderA}%

            </div>

            <div className="h-2 border-[2px] border-black rounded-full mb-2 bg-white overflow-hidden">

             <div

              className="h-full bg-[#FF7497]"

              style={{ width: `${sliderA}%` }}

             />

            </div>

            <input

             type="range"

             min={0}

             max={100}

             value={sliderA}

             onChange={(e) => setSliderA(Number(e.target.value))}

             className="w-full accent-[#FF7497]"

            />

           </div>

           <div className="border-[3px] border-black rounded-xl p-2 bg-[#fff7d6]">

            <div className="text-[9px] font-black uppercase mb-1">

             Resonance {sliderB}%

            </div>

            <div className="h-2 border-[2px] border-black rounded-full mb-2 bg-white overflow-hidden">

             <div

              className="h-full bg-[#FCAF57] synth-pulse"

              style={{ width: `${sliderB}%` }}

             />

            </div>

            <input

             type="range"

             min={0}

             max={100}

             value={sliderB}

             onChange={(e) => setSliderB(Number(e.target.value))}

             className="w-full accent-[#FCAF57]"

            />

           </div>

           <div className="border-[3px] border-black rounded-xl p-2 bg-[#edffe5]">

            <div className="text-[9px] font-black uppercase mb-1">

             Boost {sliderC}%

            </div>

            <div className="h-2 border-[2px] border-black rounded-full mb-2 bg-white overflow-hidden">

             <div

              className="h-full bg-[#C9F830]"

              style={{ width: `${sliderC}%` }}

             />

            </div>

            <input

             type="range"

             min={0}

             max={100}

             value={sliderC}

             onChange={(e) => setSliderC(Number(e.target.value))}

             className="w-full accent-[#84cc16]"

            />

           </div>

           <div className="border-[3px] border-black rounded-xl p-2 bg-[#e0f7ff]">

            <div className="text-[9px] font-black uppercase mb-1">

             Pulse {sliderD}%

            </div>

            <div className="h-2 border-[2px] border-black rounded-full mb-2 bg-white overflow-hidden">

             <div

              className="h-full bg-[#24D3FF]"

              style={{ width: `${sliderD}%` }}

             />

            </div>

            <input

             type="range"

             min={0}

             max={100}

             value={sliderD}

             onChange={(e) => setSliderD(Number(e.target.value))}

             className="w-full accent-[#24D3FF]"

            />

           </div>

           <div className="border-[3px] border-black rounded-xl p-2 bg-[#f3e8ff]">

            <div className="text-[9px] font-black uppercase mb-1">

             Depth {sliderE}%

            </div>

            <div className="h-2 border-[2px] border-black rounded-full mb-2 bg-white overflow-hidden">

             <div

              className="h-full bg-[#CC99FF]"

              style={{ width: `${sliderE}%` }}

             />

            </div>

            <input

             type="range"

             min={0}

             max={100}

             value={sliderE}

             onChange={(e) => setSliderE(Number(e.target.value))}

             className="w-full accent-[#a855f7]"

            />

           </div>

          </div>

         </div>


         <div className="mt-4 border-[4px] border-black rounded-2xl bg-white p-3">

          <div className="h-9 mb-3 px-3 border-[3px] border-black rounded-xl bg-[#CC99FF] text-[10px] font-black uppercase tracking-widest flex items-center justify-between">

           <span>INTERACTIVE PACK</span>

           <span>11 MODULES</span>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">

           <div className="border-[3px] border-black rounded-xl p-2 bg-white">

            <div className="text-[9px] font-black uppercase mb-2">

             Segment Mode

            </div>

            <div className="grid grid-cols-3 gap-1">

             {(["PULSE", "STEADY", "STEALTH"] as const).map((mode) => (

              <button

               key={mode}

               type="button"

               onClick={() => setSegmentMode(mode)}

               className={`h-8 border-[2px] border-black rounded-lg text-[9px] font-black uppercase ${segmentMode === mode ? "bg-[#FFE357]" : "bg-white"}`}>

               {mode}

              </button>

             ))}

            </div>

           </div>


           <div className="border-[3px] border-black rounded-xl p-2 bg-white">

            <div className="text-[9px] font-black uppercase mb-2">

             Star Rating

            </div>

            <div className="flex gap-1">

             {[1, 2, 3, 4, 5].map((star) => (

              <button

               key={`star-${star}`}

               type="button"

               onClick={() => setRatingValue(star)}

               className={`h-8 w-8 border-[2px] border-black rounded-md text-lg leading-none ${ratingValue >= star ? "bg-[#FFE357]" : "bg-white"}`}>

               ★

              </button>

             ))}

            </div>

           </div>


           <div className="border-[3px] border-black rounded-xl p-2 bg-white">

            <div className="text-[9px] font-black uppercase mb-2">Stepper</div>

            <div className="h-8 border-[2px] border-black rounded-lg grid grid-cols-3 overflow-hidden">

             <button

              type="button"

              onClick={() => setStepValue((prev) => Math.max(0, prev - 1))}

              className="bg-white text-xl font-black">

              −

             </button>

             <div className="bg-[#f3f4f6] flex items-center justify-center text-[12px] font-black">

              {stepValue}

             </div>

             <button

              type="button"

              onClick={() => setStepValue((prev) => Math.min(12, prev + 1))}

              className="bg-[#C9F830] text-xl font-black">

              +

             </button>

            </div>

           </div>


           <div className="border-[3px] border-black rounded-xl p-2 bg-white">

            <div className="text-[9px] font-black uppercase mb-2">

             Chip Cloud

            </div>

            <div className="flex flex-wrap gap-1">

             {["HOOKS", "STORY", "FACES", "TEXT", "COLOR"].map((chip) => (

              <button

               key={chip}

               type="button"

               onClick={() => toggleChip(chip)}

               className={`h-7 px-2 border-[2px] border-black rounded-md text-[8px] font-black uppercase ${selectedChipSet.includes(chip) ? "bg-[#24D3FF]" : "bg-white"}`}>

               {chip}

              </button>

             ))}

            </div>

           </div>


           <div className="border-[3px] border-black rounded-xl p-2 bg-white">

            <div className="text-[9px] font-black uppercase mb-2">

             Swatch Picker

            </div>

            <div className="flex gap-1">

             {[

              "#FF7497",

              "#FCAF57",

              "#FFE357",

              "#C9F830",

              "#24D3FF",

              "#CC99FF",

             ].map((swatch) => (

              <button

               key={swatch}

               type="button"

               onClick={() => setSwatchValue(swatch)}

               className={`h-8 w-8 rounded-full border-[2px] ${swatchValue === swatch ? "border-black scale-110" : "border-white"} transition-all`}

               style={{ backgroundColor: swatch }}

              />

             ))}

            </div>

           </div>


           <div className="border-[3px] border-black rounded-xl p-2 bg-white">

            <div className="text-[9px] font-black uppercase mb-2">

             9-Cell Matrix

            </div>

            <div className="grid grid-cols-3 gap-1">

             {interactiveCells.map((active, idx) => (

              <button

               key={`matrix-${idx}`}

               type="button"

               onClick={() =>

                setInteractiveCells((prev) =>

                 prev.map((cell, cellIdx) => (cellIdx === idx ? !cell : cell)),

                )

               }

               className={`h-7 border-[2px] border-black rounded-md transition-all ${active ? "bg-[#C9F830]" : "bg-[#e5e7eb]"}`}

              />

             ))}

            </div>

           </div>


           <div className="border-[3px] border-black rounded-xl p-2 bg-white">

            <div className="text-[9px] font-black uppercase mb-2">

             Reaction Engine

            </div>

            <div className="grid grid-cols-3 gap-1">

             {(["HYPE", "FOCUS", "CHILL"] as const).map((mode) => (

              <button

               key={mode}

               type="button"

               onClick={() => setReactionMode(mode)}

               className={`h-8 border-[2px] border-black rounded-md text-[8px] font-black uppercase ${reactionMode === mode ? "bg-[#FF7497]" : "bg-white"}`}>

               {mode}

              </button>

             ))}

            </div>

           </div>


           <div className="border-[3px] border-black rounded-xl p-2 bg-black text-white">

            <div className="text-[9px] font-black uppercase mb-2 text-[#5ff6ff]">

             Command Lock

            </div>

            <button

             type="button"

             onClick={() => setCommandLocked((prev) => !prev)}

             className={`w-full h-8 border-[2px] rounded-md text-[9px] font-black uppercase transition-all ${commandLocked ? "border-[#5ff6ff] bg-[#111827] text-[#5ff6ff]" : "border-white bg-white text-black"}`}>

             {commandLocked ? "Locked" : "Unlocked"}

            </button>

           </div>


           <div className="border-[3px] border-black rounded-xl p-2 bg-white">

            <div className="text-[9px] font-black uppercase mb-2">

             Counter Burst

            </div>

            <div className="grid grid-cols-3 gap-1">

             <button

              type="button"

              onClick={() => setCounterValue((prev) => Math.max(0, prev - 1))}

              className="h-8 border-[2px] border-black rounded-md bg-white font-black">

              −

             </button>

             <div className="h-8 border-[2px] border-black rounded-md bg-[#f3f4f6] flex items-center justify-center text-[10px] font-black">

              {counterValue}

             </div>

             <button

              type="button"

              onClick={() => setCounterValue((prev) => prev + 1)}

              className="h-8 border-[2px] border-black rounded-md bg-[#24D3FF] font-black">

              +

             </button>

            </div>

           </div>


           <div className="border-[3px] border-black rounded-xl p-2 bg-white overflow-hidden">

            <div className="text-[9px] font-black uppercase mb-2">

             Flip Card

            </div>

            <button

             type="button"

             onClick={() => setFlipCardOpen((prev) => !prev)}

             className={`w-full h-8 border-[2px] border-black rounded-md text-[9px] font-black uppercase transition-all ${flipCardOpen ? "bg-[#CC99FF]" : "bg-[#FFE357]"}`}>

             {flipCardOpen ? "BACK FACE" : "FRONT FACE"}

            </button>

            <div

             className={`mt-2 h-8 border-[2px] border-black rounded-md flex items-center justify-center text-[8px] font-black uppercase transition-all ${flipCardOpen ? "bg-black text-[#5ff6ff]" : "bg-white text-black"}`}>

             {flipCardOpen ? "Metadata / Sync / Live" : "Variant A / 12.4% CTR"}

            </div>

           </div>


           <div className="border-[3px] border-black rounded-xl p-2 bg-white">

            <div className="text-[9px] font-black uppercase mb-2">

             Streak Ladder

            </div>

            <div className="flex items-center gap-2">

             <button

              type="button"

              onClick={() => setStreakDays((prev) => Math.max(0, prev - 1))}

              className="h-8 w-8 border-[2px] border-black rounded-md bg-white font-black">

              −

             </button>

             <div className="flex-1 h-8 border-[2px] border-black rounded-md bg-[#fef9c3] flex items-center justify-center text-[10px] font-black uppercase">

              {streakDays} Day

             </div>

             <button

              type="button"

              onClick={() => setStreakDays((prev) => prev + 1)}

              className="h-8 w-8 border-[2px] border-black rounded-md bg-[#C9F830] font-black">

              +

             </button>

            </div>

           </div>

          </div>

         </div>


         <div className="mt-6 border-[4px] border-black rounded-2xl bg-white p-3">

          <div className="h-9 mb-3 px-3 border-[3px] border-black rounded-xl bg-[#00CCFF] text-[10px] font-black uppercase tracking-widest flex items-center justify-between">

           <span>CHART PROTOTYPE FORGE</span>

           <span>12 DESIGNS · CSV DRIVEN</span>

          </div>


          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 mb-4">

           <div className="border-[3px] border-black rounded-xl p-2 bg-white">

            <div className="text-[9px] font-black uppercase mb-2">

             Engagement Map Sort

            </div>

            <div className="flex flex-wrap gap-1">

             {(["likes", "comments", "shares", "subs"] as const).map(

              (metric) => (

               <button

                key={metric}

                type="button"

                onClick={() => setEngagementSortMetric(metric)}

                className={`h-8 px-2 border-[2px] border-black rounded-lg text-[9px] font-black uppercase ${engagementSortMetric === metric ? "bg-[#FFE357]" : "bg-white"}`}>

                {metric}

               </button>

              ),

             )}

             <button

              type="button"

              onClick={() =>

               setEngagementSortDir((prev) =>

                prev === "desc" ? "asc" : "desc",

               )

              }

              className="h-8 px-2 border-[2px] border-black rounded-lg text-[9px] font-black uppercase bg-[#24D3FF]">

              {engagementSortDir === "desc" ? "Highest First" : "Lowest First"}

             </button>

             <button

              type="button"

              onClick={() =>

               setLineMode((prev) => (prev === "natural" ? "step" : "natural"))

              }

              className="h-8 px-2 border-[2px] border-black rounded-lg text-[9px] font-black uppercase bg-[#CC99FF]">

              {lineMode === "natural" ? "Smooth" : "Step"}

             </button>

            </div>

           </div>


           <div className="border-[3px] border-black rounded-xl p-2 bg-black text-white">

            <div className="text-[9px] font-black uppercase mb-2 text-[#C9F830]">

             Current Leader

            </div>

            <div className="flex items-center justify-between text-[11px] font-black uppercase">

             <span className="truncate max-w-[70%]">

              {engagementLeader?.shortTitle || "N/A"}

             </span>

             <span className="text-[#24D3FF]">

              {engagementSortMetric}:{" "}

              {engagementLeader

               ? Number(engagementLeader[engagementSortMetric])

               : 0}

             </span>

            </div>

            <div className="text-[9px] mt-1 uppercase text-white/70">

             Rearranged by selected metric across latest 25 videos from your

             CSV.

            </div>

           </div>

          </div>


          <div className="text-[10px] font-black uppercase tracking-widest mb-2">

           1. Multi Data Line Graphs (3 Designs)

          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 mb-5">

           <div className="border-[3px] border-black rounded-xl bg-[#f3f4f6] p-2">

            <div className="text-[9px] font-black uppercase mb-2">

             ENGAGEMENT MAP · ORACLE

            </div>

            <div className="h-[220px] border-[2px] border-black rounded-lg bg-white p-2">

             <ResponsiveContainer width="100%" height="100%">

              <LineChart

               data={sortedEngagementData}

               margin={{ top: 12, right: 8, left: 0, bottom: 6 }}>

               <CartesianGrid strokeDasharray="4 4" stroke="#d1d5db" />

               <XAxis dataKey="order" tick={{ fontSize: 9, fontWeight: 700 }} />

               <YAxis tick={{ fontSize: 9, fontWeight: 700 }} />

               <Tooltip />

               <Legend wrapperStyle={{ fontSize: 10, fontWeight: 800 }} />

               <Line

                dataKey="likes"

                stroke={CHART_METRIC_COLORS.likes}

                type={lineMode === "natural" ? "natural" : "stepAfter"}

                strokeWidth={3}

                dot={false}

               />

               <Line

                dataKey="comments"

                stroke={CHART_METRIC_COLORS.comments}

                type={lineMode === "natural" ? "natural" : "stepAfter"}

                strokeWidth={3}

                dot={false}

               />

               <Line

                dataKey="shares"

                stroke={CHART_METRIC_COLORS.shares}

                type={lineMode === "natural" ? "natural" : "stepAfter"}

                strokeWidth={3}

                dot={false}

               />

               <Line

                dataKey="subs"

                stroke={CHART_METRIC_COLORS.subs}

                type={lineMode === "natural" ? "natural" : "stepAfter"}

                strokeWidth={3}

                dot={false}

               />

              </LineChart>

             </ResponsiveContainer>

            </div>

           </div>


           <div className="border-[3px] border-black rounded-xl bg-black p-2 text-white">

            <div className="text-[9px] font-black uppercase mb-2 text-[#5ff6ff]">

             RETRO SYNTH LINES

            </div>

            <div className="h-[220px] border-[2px] border-[#5ff6ff] rounded-lg bg-[#111827] p-2 synth-stripes">

             <ResponsiveContainer width="100%" height="100%">

              <AreaChart

               data={sortedEngagementData}

               margin={{ top: 8, right: 6, left: 0, bottom: 6 }}>

               <defs>

                <linearGradient id="likesGlow" x1="0" y1="0" x2="0" y2="1">

                 <stop offset="0%" stopColor="#FF7497" stopOpacity={0.9} />

                 <stop offset="100%" stopColor="#FF7497" stopOpacity={0.05} />

                </linearGradient>

                <linearGradient id="subsGlow" x1="0" y1="0" x2="0" y2="1">

                 <stop offset="0%" stopColor="#C9F830" stopOpacity={0.9} />

                 <stop offset="100%" stopColor="#C9F830" stopOpacity={0.06} />

                </linearGradient>

               </defs>

               <CartesianGrid stroke="#374151" strokeDasharray="3 5" />

               <XAxis dataKey="order" tick={{ fill: "#9ca3af", fontSize: 9 }} />

               <YAxis tick={{ fill: "#9ca3af", fontSize: 9 }} />

               <Tooltip

                contentStyle={{

                 background: "#000",

                 border: "2px solid #5ff6ff",

                 fontWeight: 900,

                 fontSize: 10,

                }}

               />

               <Area

                type="monotone"

                dataKey="likes"

                stroke="#FF7497"

                fill="url(#likesGlow)"

                strokeWidth={3}

               />

               <Area

                type="monotone"

                dataKey="subs"

                stroke="#C9F830"

                fill="url(#subsGlow)"

                strokeWidth={3}

               />

              </AreaChart>

             </ResponsiveContainer>

            </div>

           </div>


           <div className="border-[3px] border-black rounded-xl bg-white p-2">

            <div className="text-[9px] font-black uppercase mb-2">

             MINIMAL SIGNAL TRACK

            </div>

            <div className="h-[220px] border-[2px] border-black rounded-lg bg-[#f9fafb] p-2">

             <ResponsiveContainer width="100%" height="100%">

              <LineChart

               data={sortedEngagementData}

               margin={{ top: 10, right: 10, left: 0, bottom: 6 }}>

               <CartesianGrid stroke="#e5e7eb" />

               <XAxis dataKey="order" tick={false} />

               <YAxis tick={{ fontSize: 9, fontWeight: 700 }} />

               <Tooltip />

               <Line

                dataKey="likes"

                stroke="#111827"

                type="monotone"

                strokeWidth={2.5}

                dot={false}

               />

               <Line

                dataKey="comments"

                stroke="#6b7280"

                type="monotone"

                strokeWidth={2.5}

                dot={false}

                strokeDasharray="6 4"

               />

              </LineChart>

             </ResponsiveContainer>

            </div>

           </div>

          </div>


          <div className="text-[10px] font-black uppercase tracking-widest mb-2">

           2. Bar Charts (3 Designs)

          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 mb-5">

           <div className="border-[3px] border-black rounded-xl bg-white p-2">

            <div className="flex items-center justify-between mb-2">

             <span className="text-[9px] font-black uppercase">

              Rank Ladder

             </span>

             <select

              value={barMetric}

              onChange={(e) => setBarMetric(e.target.value as typeof barMetric)}

              className="h-7 border-[2px] border-black rounded-md px-2 text-[9px] font-black uppercase">

              <option value="views">Views</option>

              <option value="likes">Likes</option>

              <option value="comments">Comments</option>

              <option value="shares">Shares</option>

              <option value="subs">Subs</option>

              <option value="revenue">Revenue</option>

             </select>

            </div>

            <div className="h-[220px] border-[2px] border-black rounded-lg bg-[#f9fafb] p-2">

             <ResponsiveContainer width="100%" height="100%">

              <BarChart

               data={topBarData}

               margin={{ top: 8, right: 6, left: 0, bottom: 6 }}>

               <CartesianGrid stroke="#e5e7eb" />

               <XAxis dataKey="order" tick={{ fontSize: 9, fontWeight: 800 }} />

               <YAxis tick={{ fontSize: 9, fontWeight: 800 }} />

               <Tooltip />

               <Bar dataKey={barMetric} radius={[4, 4, 0, 0]}>

                {topBarData.map((_, idx) => (

                 <Cell

                  key={`bar-main-${idx}`}

                  fill={

                   idx === 0

                    ? "#111827"

                    : chartPalette[idx % chartPalette.length]

                  }

                 />

                ))}

               </Bar>

              </BarChart>

             </ResponsiveContainer>

            </div>

           </div>


           <div className="border-[3px] border-black rounded-xl bg-[#fff7d6] p-2">

            <div className="text-[9px] font-black uppercase mb-2">

             Stacked Performance DNA

            </div>

            <div className="h-[220px] border-[2px] border-black rounded-lg bg-white p-2">

             <ResponsiveContainer width="100%" height="100%">

              <BarChart

               data={sortedEngagementData.slice(0, 12)}

               margin={{ top: 8, right: 6, left: 0, bottom: 6 }}>

               <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

               <XAxis dataKey="order" tick={{ fontSize: 9, fontWeight: 700 }} />

               <YAxis tick={{ fontSize: 9, fontWeight: 700 }} />

               <Tooltip />

               <Legend wrapperStyle={{ fontSize: 9, fontWeight: 800 }} />

               <Bar dataKey="likes" stackId="a" fill="#FF7497" />

               <Bar dataKey="comments" stackId="a" fill="#24D3FF" />

               <Bar dataKey="shares" stackId="a" fill="#FFE357" />

               <Bar dataKey="subs" stackId="a" fill="#C9F830" />

              </BarChart>

             </ResponsiveContainer>

            </div>

           </div>


           <div className="border-[3px] border-black rounded-xl bg-black p-2 text-white">

            <div className="text-[9px] font-black uppercase mb-2 text-[#C9F830]">

             Horizontal Kill List

            </div>

            <div className="h-[220px] border-[2px] border-[#C9F830] rounded-lg bg-[#111827] p-2">

             <ResponsiveContainer width="100%" height="100%">

              <BarChart

               layout="vertical"

               data={topBarData.slice(0, 8)}

               margin={{ top: 8, right: 8, left: 8, bottom: 6 }}>

               <CartesianGrid stroke="#374151" strokeDasharray="2 4" />

               <XAxis type="number" tick={{ fill: "#9ca3af", fontSize: 9 }} />

               <YAxis

                type="category"

                dataKey="order"

                tick={{ fill: "#9ca3af", fontSize: 9 }}

               />

               <Tooltip

                contentStyle={{

                 background: "#000",

                 border: "2px solid #C9F830",

                 fontSize: 10,

                 fontWeight: 900,

                }}

               />

               <Bar dataKey={barMetric} fill="#C9F830" radius={[0, 6, 6, 0]} />

              </BarChart>

             </ResponsiveContainer>

            </div>

           </div>

          </div>


          <div className="text-[10px] font-black uppercase tracking-widest mb-2">

           3. Pie Charts (3 Designs)

          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 mb-5">

           <div className="border-[3px] border-black rounded-xl bg-white p-2">

            <div className="flex items-center justify-between mb-2">

             <span className="text-[9px] font-black uppercase">

              Revenue Orbit

             </span>

             <select

              value={pieMetric}

              onChange={(e) => setPieMetric(e.target.value as typeof pieMetric)}

              className="h-7 border-[2px] border-black rounded-md px-2 text-[9px] font-black uppercase">

              <option value="views">Views</option>

              <option value="likes">Likes</option>

              <option value="comments">Comments</option>

              <option value="shares">Shares</option>

              <option value="subs">Subs</option>

              <option value="revenue">Revenue</option>

             </select>

            </div>

            <div className="h-[220px] border-[2px] border-black rounded-lg bg-[#f9fafb] p-2">

             <ResponsiveContainer width="100%" height="100%">

              <PieChart>

               <Tooltip />

               <Legend wrapperStyle={{ fontSize: 9, fontWeight: 800 }} />

               <Pie

                data={pieTopSixData}

                dataKey="value"

                nameKey="name"

                innerRadius={42}

                outerRadius={80}

                onMouseEnter={(_, i) => setActivePieIndex(i)}>

                {pieTopSixData.map((_, idx) => (

                 <Cell

                  key={`pie-top-${idx}`}

                  fill={chartPalette[idx % chartPalette.length]}

                  fillOpacity={activePieIndex === idx ? 1 : 0.65}

                 />

                ))}

               </Pie>

              </PieChart>

             </ResponsiveContainer>

            </div>

           </div>


           <div className="border-[3px] border-black rounded-xl bg-[#f3e8ff] p-2">

            <div className="text-[9px] font-black uppercase mb-2">

             Engagement Mix Donut

            </div>

            <div className="h-[220px] border-[2px] border-black rounded-lg bg-white p-2">

             <ResponsiveContainer width="100%" height="100%">

              <PieChart>

               <Tooltip />

               <Pie

                data={pieEngagementMixData}

                dataKey="value"

                nameKey="name"

                innerRadius={36}

                outerRadius={82}

                startAngle={90}

                endAngle={-270}>

                <Cell fill="#FF7497" />

                <Cell fill="#24D3FF" />

                <Cell fill="#FFE357" />

                <Cell fill="#C9F830" />

               </Pie>

               <Legend wrapperStyle={{ fontSize: 10, fontWeight: 900 }} />

              </PieChart>

             </ResponsiveContainer>

            </div>

           </div>


           <div className="border-[3px] border-black rounded-xl bg-black p-2 text-white">

            <div className="text-[9px] font-black uppercase mb-2 text-[#FF7497]">

             Duration Ring Stack

            </div>

            <div className="h-[220px] border-[2px] border-[#FF7497] rounded-lg bg-[#111827] p-2">

             <ResponsiveContainer width="100%" height="100%">

              <PieChart>

               <Tooltip

                contentStyle={{

                 background: "#000",

                 border: "2px solid #FF7497",

                 fontSize: 10,

                 fontWeight: 900,

                }}

               />

               <Pie

                data={pieDurationBandData}

                dataKey="value"

                nameKey="name"

                innerRadius={26}

                outerRadius={80}

                paddingAngle={3}>

                <Cell fill="#24D3FF" />

                <Cell fill="#C9F830" />

                <Cell fill="#FFE357" />

                <Cell fill="#FF7497" />

               </Pie>

               <Legend

                wrapperStyle={{ fontSize: 9, fontWeight: 800, color: "white" }}

               />

              </PieChart>

             </ResponsiveContainer>

            </div>

           </div>

          </div>


          <div className="text-[10px] font-black uppercase tracking-widest mb-2">

           4. Scatter Plot Charts (3 Designs)

          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">

           <div className="border-[3px] border-black rounded-xl bg-white p-2">

            <div className="flex items-center justify-between mb-2">

             <span className="text-[9px] font-black uppercase">

              Value Matrix Bubble

             </span>

             <div className="flex gap-1">

              <select

               value={scatterX}

               onChange={(e) => setScatterX(e.target.value as typeof scatterX)}

               className="h-7 border-[2px] border-black rounded-md px-1 text-[8px] font-black uppercase">

               <option value="impressions">Impressions</option>

               <option value="views">Views</option>

               <option value="durationSec">Duration</option>

               <option value="ctr">CTR</option>

               <option value="avp">AVP</option>

              </select>

              <select

               value={scatterY}

               onChange={(e) => setScatterY(e.target.value as typeof scatterY)}

               className="h-7 border-[2px] border-black rounded-md px-1 text-[8px] font-black uppercase">

               <option value="ctr">CTR</option>

               <option value="avp">AVP</option>

               <option value="likes">Likes</option>

               <option value="comments">Comments</option>

               <option value="subs">Subs</option>

              </select>

             </div>

            </div>

            <div className="h-[220px] border-[2px] border-black rounded-lg bg-[#f9fafb] p-2">

             <ResponsiveContainer width="100%" height="100%">

              <ScatterChart margin={{ top: 8, right: 8, left: 0, bottom: 6 }}>

               <CartesianGrid stroke="#e5e7eb" />

               <XAxis

                type="number"

                dataKey="x"

                name={scatterX}

                tick={{ fontSize: 9, fontWeight: 700 }}

               />

               <YAxis

                type="number"

                dataKey="y"

                name={scatterY}

                tick={{ fontSize: 9, fontWeight: 700 }}

               />

               <Tooltip cursor={{ strokeDasharray: "4 4" }} />

               <Scatter data={scatterPlotData} fill="#FF7497" />

              </ScatterChart>

             </ResponsiveContainer>

            </div>

           </div>


           <div className="border-[3px] border-black rounded-xl bg-[#ecfeff] p-2">

            <div className="text-[9px] font-black uppercase mb-2">

             Quadrant Scout

            </div>

            <div className="h-[220px] border-[2px] border-black rounded-lg bg-white p-2">

             <ResponsiveContainer width="100%" height="100%">

              <ScatterChart margin={{ top: 8, right: 8, left: 0, bottom: 6 }}>

               <CartesianGrid stroke="#d1d5db" />

               <XAxis

                type="number"

                dataKey="x"

                tick={{ fontSize: 9, fontWeight: 700 }}

               />

               <YAxis

                type="number"

                dataKey="y"

                tick={{ fontSize: 9, fontWeight: 700 }}

               />

               <ReferenceLine

                x={scatterAvgX}

                stroke="#111827"

                strokeDasharray="5 3"

               />

               <ReferenceLine

                y={scatterAvgY}

                stroke="#111827"

                strokeDasharray="5 3"

               />

               <Tooltip />

               <Scatter data={scatterPlotData} fill="#24D3FF" />

              </ScatterChart>

             </ResponsiveContainer>

            </div>

           </div>


           <div className="border-[3px] border-black rounded-xl bg-black p-2 text-white">

            <div className="flex items-center justify-between mb-2">

             <span className="text-[9px] font-black uppercase text-[#5ff6ff]">

              Night Pulse Scatter

             </span>

             <select

              value={bubbleMetric}

              onChange={(e) =>

               setBubbleMetric(e.target.value as typeof bubbleMetric)

              }

              className="h-7 border-[2px] border-[#5ff6ff] bg-black text-[#5ff6ff] rounded-md px-1 text-[8px] font-black uppercase">

              <option value="likes">Likes</option>

              <option value="comments">Comments</option>

              <option value="shares">Shares</option>

              <option value="subs">Subs</option>

              <option value="views">Views</option>

             </select>

            </div>

            <div className="h-[220px] border-[2px] border-[#5ff6ff] rounded-lg bg-[#111827] p-2">

             <ResponsiveContainer width="100%" height="100%">

              <ScatterChart margin={{ top: 8, right: 8, left: 0, bottom: 6 }}>

               <CartesianGrid stroke="#374151" />

               <XAxis

                type="number"

                dataKey="x"

                tick={{ fill: "#9ca3af", fontSize: 9 }}

               />

               <YAxis

                type="number"

                dataKey="y"

                tick={{ fill: "#9ca3af", fontSize: 9 }}

               />

               <ZAxis type="number" dataKey="z" range={[60, 360]} />

               <Tooltip

                contentStyle={{

                 background: "#000",

                 border: "2px solid #5ff6ff",

                 fontSize: 10,

                 fontWeight: 900,

                }}

               />

               <Scatter data={scatterPlotData} fill="#CC99FF" />

              </ScatterChart>

             </ResponsiveContainer>

            </div>

           </div>

          </div>

         </div>


         <div className="mt-6 border-[4px] border-black rounded-2xl bg-white p-3">

          <div className="h-9 mb-3 px-3 border-[3px] border-black rounded-xl bg-[#FF3399] text-[10px] font-black uppercase tracking-widest flex items-center justify-between">

           <span>NATIVE KIT TRANSPLANT MODULES</span>

           <span>CUSTOM + SELECTED SECTIONS</span>

          </div>


          <div className="border-[3px] border-black rounded-xl p-3 bg-white mb-4">

           <div className="text-[9px] font-black uppercase mb-2">

            Tiny Buttons (Pink / Lime / Cyan)

           </div>

           <div className="flex flex-wrap gap-2">

            {[

             {

              key: "PINK",

              label: "Tiny Pink",

              color: "bg-[#FF3399]",

              text: "text-white",

             },

             {

              key: "LIME",

              label: "Tiny Lime",

              color: "bg-[#CCFF00]",

              text: "text-black",

             },

             {

              key: "CYAN",

              label: "Tiny Cyan",

              color: "bg-[#00CCFF]",

              text: "text-black",

             },

            ].map((tinyBtn) => {

             const isSelected = tinyClicked === tinyBtn.key

             return (

              <button

               key={tinyBtn.key}

               type="button"

               onClick={() => setTinyClicked(tinyBtn.key)}

               aria-pressed={isSelected}

               className={`${tinyBtn.color} ${tinyBtn.text} relative px-4 py-2 border-[3px] border-black rounded-xl font-black uppercase text-[10px] tracking-widest transition-[transform,box-shadow,filter] duration-150 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[6px_6px_0px_0px_black] active:translate-x-1 active:translate-y-1 active:scale-95 active:shadow-[1px_1px_0px_0px_black] ${

                isSelected

                 ? "translate-x-1 translate-y-1 shadow-[1px_1px_0px_0px_black] ring-[2px] ring-black/70 ring-offset-2 ring-offset-white"

                 : "shadow-[3px_3px_0px_0px_black]"

               }`}>

               {tinyBtn.label}

              </button>

             )

            })}

            <span className="text-[9px] font-black uppercase tracking-widest text-black/50 flex items-center">

             Last: {tinyClicked}

            </span>

           </div>

          </div>


          <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 mb-4">

           {[

            {

             key: "pink" as const,

             title: "Pink Control Pack",

             color: "bg-[#FF3399]/15",

             accent: "bg-[#FF3399]",

            },

            {

             key: "blue" as const,

             title: "Blue Control Pack",

             color: "bg-[#00CCFF]/15",

             accent: "bg-[#00CCFF]",

            },

            {

             key: "green" as const,

             title: "Green Control Pack",

             color: "bg-[#CCFF00]/20",

             accent: "bg-[#CCFF00]",

            },

           ].map((theme) => (

            <div

             key={theme.key}

             className={`border-[3px] border-black rounded-xl p-3 ${theme.color}`}>

             <div className="text-[9px] font-black uppercase mb-2">

              {theme.title}

             </div>

             <div className="space-y-3">

              <div>

               <div className="text-[8px] font-black uppercase mb-1 text-black/50">

                3 Style Chips

               </div>

               <div className="flex gap-1 flex-wrap">

                {["ALL", "LONG", "SHORTS"].map((chip) => (

                 <button

                  key={`${theme.key}-${chip}`}

                  type="button"

                  onClick={() => toggleThemeChip(theme.key, chip)}

                  className={`px-2 py-1 border-[2px] border-black rounded-lg text-[8px] font-black uppercase ${

                   chipTheme[theme.key].includes(chip)

                    ? `${theme.accent} text-black`

                    : "bg-white"

                  }`}>

                  {chip}

                 </button>

                ))}

               </div>

              </div>


              <div>

               <div className="text-[8px] font-black uppercase mb-1 text-black/50">

                3 Toggles

               </div>

               <div className="flex gap-2">

                {[0, 1, 2].map((i) => (

                 <button

                  key={`tog-${theme.key}-${i}`}

                  type="button"

                  onClick={() => toggleThemeToggle(theme.key, i)}

                  className={`w-10 h-6 border-[2px] border-black rounded-full relative ${toggleTheme[theme.key][i] ? theme.accent : "bg-white"}`}>

                  <span

                   className={`absolute top-[1px] w-4 h-4 rounded-full border border-black bg-white transition-all ${toggleTheme[theme.key][i] ? "left-[20px]" : "left-[2px]"}`}

                  />

                 </button>

                ))}

               </div>

              </div>


              <div>

               <div className="text-[8px] font-black uppercase mb-1 text-black/50">

                3 Checkboxes

               </div>

               <div className="flex gap-2">

                {[0, 1, 2].map((i) => (

                 <button

                  key={`chk-${theme.key}-${i}`}

                  type="button"

                  onClick={() => toggleThemeCheck(theme.key, i)}

                  className={`w-6 h-6 border-[2px] border-black rounded-md text-[10px] font-black ${checkTheme[theme.key][i] ? `${theme.accent} text-black` : "bg-white"}`}>

                  {checkTheme[theme.key][i] ? "✓" : ""}

                 </button>

                ))}

               </div>

              </div>


              <div>

               <div className="text-[8px] font-black uppercase mb-1 text-black/50">

                3 Radio Buttons

               </div>

               <div className="flex gap-2">

                {[0, 1, 2].map((i) => (

                 <button

                  key={`rad-${theme.key}-${i}`}

                  type="button"

                  onClick={() =>

                   setRadioTheme((prev) => ({ ...prev, [theme.key]: i }))

                  }

                  className={`w-6 h-6 border-[2px] border-black rounded-full flex items-center justify-center ${radioTheme[theme.key] === i ? theme.accent : "bg-white"}`}>

                  {radioTheme[theme.key] === i ? (

                   <span className="w-2 h-2 bg-white rounded-full" />

                  ) : null}

                 </button>

                ))}

               </div>

              </div>

             </div>

            </div>

           ))}

          </div>


          <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 mb-4">

           {[1, 2, 3].map((n) => (

            <div

             key={`input-pack-${n}`}

             className="border-[3px] border-black rounded-xl p-3 bg-white">

             <div className="text-[9px] font-black uppercase mb-2">

              Video Title + Description Box {n}

             </div>

             <input

              className="w-full h-10 border-[3px] border-black rounded-xl px-3 font-black uppercase text-sm mb-2"

              placeholder="Video title..."

             />

             <textarea

              className="w-full min-h-[70px] border-[3px] border-black rounded-xl p-2 font-bold text-xs resize-none"

              placeholder="Short description..."

             />

            </div>

           ))}

          </div>


          <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 mb-4">

           <div className="border-[3px] border-black rounded-xl p-3 bg-white">

            <div className="text-[9px] font-black uppercase mb-2">

             06 Progress Bars (Quarter Width)

            </div>

            <div className="space-y-2 max-w-[25%] min-w-[100px]">

             <div className="h-4 border-[2px] border-black rounded-full bg-gray-100 overflow-hidden">

              <div className="h-full w-[78%] bg-[#FF3399]" />

             </div>

             <div className="h-4 border-[2px] border-black rounded-full bg-gray-100 overflow-hidden">

              <div className="h-full w-[62%] bg-[#CCFF00]" />

             </div>

             <div className="h-4 border-[2px] border-black rounded-full bg-gray-100 overflow-hidden">

              <div className="h-full w-[45%] bg-[#00CCFF]" />

             </div>

            </div>

           </div>

           <div className="border-[3px] border-black rounded-xl p-3 bg-white xl:col-span-2">

            <div className="text-[9px] font-black uppercase mb-2">

             07 KPI Stat Cards (3)

            </div>

            <div className="grid grid-cols-3 gap-2">

             {[

              { label: "Views", value: "4.2M", color: "bg-[#FFE357]" },

              { label: "Engagement", value: "12%", color: "bg-[#FCAF57]" },

              { label: "System", value: "STABLE", color: "bg-[#00CCFF]" },

             ].map((card) => (

              <div

               key={card.label}

               className={`${card.color} border-[3px] border-black rounded-xl p-3`}>

               <div className="text-[8px] font-black uppercase text-black/50">

                {card.label}

               </div>

               <div className="text-2xl font-[1000] uppercase tracking-tighter">

                {card.value}

               </div>

              </div>

             ))}

            </div>

           </div>

          </div>


          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 mb-4">

           <div className="border-[3px] border-black rounded-xl p-3 bg-white">

            <div className="text-[9px] font-black uppercase mb-2">08 Table</div>

            <TableDemo />

           </div>

           <div className="border-[3px] border-black rounded-xl p-3 bg-white">

            <div className="text-[9px] font-black uppercase mb-2">

             09 Calendar

            </div>

            <CalendarDemo />

           </div>

          </div>


          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 mb-4">

           <div className="border-[3px] border-black rounded-xl p-3 bg-white">

            <div className="text-[9px] font-black uppercase mb-2">

             10 Skeletons + 3 Spinners

            </div>

            <div className="space-y-3">

             <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse border-[2px] border-black/10" />

             <div className="w-full h-3 bg-gray-200 rounded animate-pulse" />

             <div className="w-full h-20 rounded-xl bg-gray-200 animate-pulse border-[2px] border-black/10" />

             <div className="flex gap-4 items-center">

              {["#FF3399", "#00CCFF", "#CCFF00"].map((c) => (

               <div

                key={c}

                className="w-8 h-8 border-[4px] border-black/20 rounded-full animate-spin"

                style={{ borderTopColor: c }}

               />

              ))}

             </div>

            </div>

           </div>

           <div className="border-[3px] border-black rounded-xl p-3 bg-white">

            <div className="text-[9px] font-black uppercase mb-2">

             11 Tabs & Pills

            </div>

            <TabsPillsDemo />

           </div>

          </div>


          <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 mb-4">

           <div className="border-[3px] border-black rounded-xl p-3 bg-white">

            <div className="text-[9px] font-black uppercase mb-2">13 Stars</div>

            <div className="flex items-center gap-1">

             {[1, 2, 3, 4, 5].map((i) => (

              <span key={i} className="text-3xl text-[#FFDD00]">

               ★

              </span>

             ))}

            </div>

           </div>

           <div className="border-[3px] border-black rounded-xl p-3 bg-white">

            <div className="text-[9px] font-black uppercase mb-2">

             14 Hover Card (First Box)

            </div>

            <div className="w-36 text-center p-5 border-[4px] border-black rounded-2xl font-[1000] uppercase tracking-tighter text-sm bg-white shadow-[4px_4px_0px_0px_black] hover:shadow-[8px_8px_0px_0px_black] hover:-translate-y-2 transition-all cursor-pointer hover:bg-[#CCFF00]">

             ↗ Default Lift

            </div>

           </div>

           <div className="border-[3px] border-black rounded-xl p-3 bg-white">

            <div className="text-[9px] font-black uppercase mb-2">

             17 Modal Pop Up

            </div>

            <ModalDemo />

           </div>

          </div>


          <div className="border-[3px] border-black rounded-xl p-3 bg-white mb-4">

           <div className="text-[9px] font-black uppercase mb-2">

            16 Video Cards (First 2)

           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {[

             {

              emoji: "🏖",

              title: "Napoleon's Irish General 🇮🇪",

              views: "22.1K",

              ctr: "9.3%",

              status: "LIVE",

              statusColor: "bg-[#CCFF00]",

              dur: "22:14",

              thumbBg: "bg-[#00CCFF]/20",

             },

             {

              emoji: "⚔️",

              title: "Battle of Pyramids 🔥🔥",

              views: "47.2K",

              ctr: "8.1%",

              status: "SCHED",

              statusColor: "bg-[#FFDD00]",

              dur: "35:07",

              thumbBg: "bg-[#FF3399]/20",

             },

            ].map((v) => (

             <div

              key={v.title}

              className="border-[4px] border-black rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_black] hover:shadow-[8px_8px_0px_0px_black] hover:-translate-y-1 transition-all bg-white cursor-pointer group">

              <div

               className={`${v.thumbBg} h-36 flex items-center justify-center text-5xl relative`}>

               {v.emoji}

               <div className="absolute bottom-2 right-2 bg-black text-white px-2 py-1 rounded-lg text-[10px] font-black">

                {v.dur}

               </div>

              </div>

              <div className="p-4 space-y-2">

               <h4 className="font-[1000] uppercase tracking-tighter text-sm leading-tight group-hover:text-[#FF3399] transition-colors">

                {v.title}

               </h4>

               <div className="flex items-center gap-2 flex-wrap">

                <span className="text-[10px] font-black text-black/40">

                 {v.views} views

                </span>

                <span className="text-[10px] font-black text-black/40">

                 {v.ctr} CTR

                </span>

                <span

                 className={`${v.statusColor} px-2 py-0.5 border-[2px] border-black rounded-md text-[8px] font-black uppercase`}>

                 {v.status}

                </span>

               </div>

              </div>

             </div>

            ))}

           </div>

          </div>


          <div className="border-[3px] border-black rounded-xl p-3 bg-white">

           <div className="text-[9px] font-black uppercase mb-2">

            Media Player Module

           </div>

           <div className="w-full border-[3px] border-black bg-white rounded-[12px] overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">

            <div className="h-9 bg-[#CC99FF] border-b-[3px] border-black flex items-center justify-between px-3">

             <div className="flex items-center gap-2">

              <MonitorPlay size={14} strokeWidth={3} />

              <span className="text-[9px] font-black uppercase tracking-[0.12em]">

               Preview Renderer

              </span>

             </div>

             <div className="flex items-center gap-1.5">

              <span className="w-5 h-5 border-[2px] border-black rounded-md bg-[#24D3FF]" />

              <span className="w-5 h-5 border-[2px] border-black rounded-md bg-[#FFE357]" />

              <span className="w-5 h-5 border-[2px] border-black rounded-md bg-[#FF7497]" />

             </div>

            </div>

            <div className="aspect-video border-b-[3px] border-black bg-gradient-to-br from-[#24D3FF] to-[#CCFF00] flex items-center justify-center">

             <button

              type="button"

              onClick={() => setMediaPlaying((prev) => !prev)}

              className="w-12 h-12 border-[3px] border-black rounded-full bg-[#FF7497] flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)]">

              {mediaPlaying ? (

               <Pause size={20} strokeWidth={3} />

              ) : (

               <Play

                size={20}

                strokeWidth={3}

                fill="currentColor"

                className="ml-0.5"

               />

              )}

             </button>

            </div>

            <div className="p-2.5">

             <div className="flex items-center gap-2">

              <span className="text-[8px] font-black uppercase">01:24</span>

              <div className="flex-1 h-3 border-[2px] border-black rounded-full bg-[#f3f4f6] overflow-hidden">

               <div

                className="h-full bg-[#CC99FF]"

                style={{ width: `${mediaProgress}%` }}

               />

              </div>

              <span className="text-[8px] font-black uppercase">05:00</span>

             </div>

            </div>

           </div>

          </div>


          <div className="border-[3px] border-black rounded-xl p-3 bg-white">

           <div className="text-[9px] font-black uppercase mb-2">

            19-28 + 30-33 Native Chart/Utility Set

           </div>

           <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

            <BarChartDemo />

            <LineChartDemo />

            <DonutChartDemo />

            <RadarChartDemo />

            <ScatterPlotDemo />

            <DistributionDemo />

            <ClockDemo />

            <MetersDemo />

            <AvatarsDemo />

            <PaginationDemo />

            <StepIndicatorDemo />

            <AdvancedSlidersDemo />

            <DropdownMenuDemo />

            <AreaChartDemo />

           </div>

          </div>

         </div>

        </div>

       </div>

      </div>

     </div>

    </div>

   )}


   {showRulebook && (

    <div

     className="w-full bg-white flex flex-col overflow-hidden relative shadow-[12px_12px_0px_0px_rgba(0,0,0,0.5)] transition-all"

     style={{

      border: `${CONFIG.scaffoldStroke}px solid black`,

      borderRadius: `${CONFIG.radius}px`,

     }}>

     <header

      onClick={() => setIsRulebookOpen((prev) => !prev)}

      className="bg-[#24D3FF] h-[80px] min-h-[80px] flex items-center justify-between select-none z-30 relative cursor-pointer transition-[margin] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"

      style={{

       borderBottom: `${CONFIG.scaffoldStroke}px solid black`,

       marginBottom: isRulebookOpen ? "0px" : `-${CONFIG.scaffoldStroke}px`,

      }}>

      <div className="flex items-center h-full flex-1">

       <div

        className="h-full w-[80px] flex items-center justify-center shrink-0"

        style={{

         backgroundColor: "#CCFF00",

         borderRight: `${CONFIG.scaffoldStroke}px solid black`,

        }}>

        <Lightbulb size={40} strokeWidth={2.5} className="text-black" />

       </div>

       <h2 className="text-[32px] sm:text-[40px] md:text-[50px] font-[1000] uppercase tracking-tighter leading-none pl-6 truncate text-black">

        TOOLBOX RULEBOOK

       </h2>

      </div>

      <div className="flex items-center gap-3 pr-6 h-full">

       <AnimatedToggleIcon open={isRulebookOpen} size={40} />

      </div>

     </header>


     <div

      className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isRulebookOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>

      <div className="overflow-hidden min-h-0">

       <div

        className="bg-neutral-100"

        style={{ padding: `${CONFIG.padding}px` }}>

        <div

         className="grid grid-cols-1 lg:grid-cols-2"

         style={{ gap: `${CONFIG.gap}px` }}>

         <SubToolbox

          title="CORE RULES"

          icon={Lightbulb}

          headerBg="#FFE357"

          iconBg="#24D3FF"

          isOpen={true}

          onToggle={() => {}}

          openUnits={6}

          config={CONFIG}>

          <RuleList items={RULES} />

         </SubToolbox>


         <SubToolbox

          title="RATIO MAP"

          icon={Grid3X3}

          headerBg="#FF7497"

          iconBg="#FFE357"

          isOpen={true}

          onToggle={() => {}}

          openUnits={6}

          config={CONFIG}>

          <RuleList items={RATIO_RULES} />

         </SubToolbox>

        </div>

       </div>

      </div>

     </div>

    </div>

   )}

  </div>

 )

}


export default ToolboxUISystem



