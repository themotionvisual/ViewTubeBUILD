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
  Search,
  Settings,
  Square,
  Type,
  X,
  Zap,
  Bell,
  Check,
  TrendingUp,
  Activity,
 Eye,
 Database,
 Cpu,
 Layers,
 Lock,
 Shield,
 Download,
 Upload,
 Trash2,
 Wifi,
 EyeOff,
 Tag
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


export const zoomIn35 = new URL(
  "../assets/icons/toolbox-toggle/zoom-in-35.png",
  import.meta.url
).href

export const zoomIn50 = new URL(
  "../assets/icons/toolbox-toggle/zoom-in-50.png",
  import.meta.url
).href

export const zoomOut35 = new URL(
  "../assets/icons/toolbox-toggle/zoom-out-35.png",
  import.meta.url
).href

export const zoomOut50 = new URL(
  "../assets/icons/toolbox-toggle/zoom-out-50.png",
  import.meta.url
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

 tone?: keyof typeof ROW_CONTROL_THEMES

}

type ActionControlButtonProps = {
 label: string
 tone?: keyof typeof ROW_CONTROL_THEMES
 icon: React.ReactNode
 onClick?: () => void
}

// Universal subtoolbox-sized control geometry.
// Any subtoolbox-row control should read these tokens rather than define local sizes/corners.
const HEAD_HEIGHT = 56 // Header block height; 56 + 4px stroke seam = 60px control rhythm.

const ROW_CONTROL_THEMES = {
 orange: {
  surface: "#FCAF57",
  control: "#FFE357",
  shadow: "#FCAF57",
 },
 pink: {
  surface: "#FF7497",
  control: "#FCAF57",
  shadow: "#FF7497",
 },
 lime: {
  surface: "#C9F830",
  control: "#24D3FF",
  shadow: "#C9F830",
 },
 cyan: {
  surface: "#24D3FF",
  control: "#C9F830",
  shadow: "#24D3FF",
 },
} as const

// Canonical shell tokens shared by SubToolbox, DropdownControl, and ActionControlButton.
export const CONTROL_SHELL = {
  headerHeight: HEAD_HEIGHT,
  height: 60,
  stroke: 4,
  radius: 16,
  railSize: HEAD_HEIGHT,
  contentOffset: HEAD_HEIGHT,
  shadowOffset: 6,
  transition: "duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
} as const


const CONFIG: SystemConfig = {

 gap: 24,

 padding: 24,

 stroke: CONTROL_SHELL.stroke,

 radius: CONTROL_SHELL.radius,

 baseHeight: CONTROL_SHELL.height,

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

 "3D Rendered",

 "Photorealistic",

 "Surreal",

 "Comic Book",

 "Neon/Cyberpunk",

 "Watercolor",

 "High Contrast",

 "Documentary",

]


const RULES = [

 "Main toolbox content uses inner margin 0. The structural grid owns spacing.",

 "The base structural rhythm is 24px gaps and 24px internal grid padding.",

 "A component should never cut off contained elements to force grid fit.",

 "If content exceeds a unit bucket, the module opens to the next level.",

 "Subtoolbox stroke is 4px; first-level internals max 3px; nested internals max 2px.",

 "Dropdown labels stay embedded inside controls so grid alignment stays locked.",

 "All subtoolbox-sized controls use one shared left icon-section primitive: same width, stroke divider, and full-height geometry as SubToolbox.",

 "Control shells reuse subtoolbox motion tokens: 60px height, 4px stroke, 16px radius, and 600ms open/close timing.",

 "Dropdown collapse must use subtoolbox grid-row mechanics only; no fade/scale animation paths.",

 "Do not add one-off corner/size overrides for subtoolbox-sized controls; extend shared shell/rail primitives instead.",

 "Chart cards can span full / half / third widths based on readability and data density.",

 "Chart catalog and spec pages do not use dashed or dotted grid/cursor lines; use low-opacity solid lines only.",

 "Chart primitives must render from canonical adapter outputs only, with deterministic fallbacks when dimensions are missing.",

 "Subtoolbox demo content must not be clipped to force grid fit; expand the module instead.",

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

export const hexToRgba = (hex: string, alpha: number) => {

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


export const AnimatedToggleIcon: React.FC<{ open: boolean; size?: number }> = ({

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

type IconRailProps = {
 backgroundColor: string
 children: React.ReactNode
}

// Canonical SubToolbox icon-section primitive (left rail).
// All subtoolbox-sized controls reuse this exact shell geometry.
const IconRail: React.FC<IconRailProps> = ({ backgroundColor, children }) => {
 return (
  <div
   className="h-full flex items-center justify-center shrink-0 transition-all duration-500"
   style={{
    width: `${CONTROL_SHELL.headerHeight}px`,
    backgroundColor,
    borderRight: `${CONTROL_SHELL.stroke}px solid black`,
   }}>
   {children}
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

    className="flex items-center justify-between select-none relative z-20 group cursor-pointer"

    style={{

     height: `${CONTROL_SHELL.headerHeight}px`,

     minHeight: `${CONTROL_SHELL.headerHeight}px`,

     backgroundColor: headerBg,

     borderBottom: `${config.stroke}px solid black`,

    }}>

    <div className="flex items-center h-full flex-1">

     <IconRail backgroundColor={iconBg}>
      <Icon size={30} strokeWidth={2.5} className="text-black" />
     </IconRail>

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

    className={`grid transition-[grid-template-rows] ${CONTROL_SHELL.transition} ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
    style={{
     marginTop: `-${config.stroke}px`,
    }}>

    <div className="overflow-hidden min-h-0">

     <main

      className={`bg-white w-full p-3 text-black flex flex-col transition-opacity ${CONTROL_SHELL.transition} ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}

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
 tone = "orange",
}) => {
 const toneConfig = ROW_CONTROL_THEMES[tone]
 const resolvedSurfaceColor = toneConfig.surface
 const resolvedControlColor = toneConfig.control
 const resolvedShadowColor = toneConfig.shadow
 const [open, setOpen] = useState(false)
 const [hoveredOption, setHoveredOption] = useState<string | null>(null)
 const rootRef = useRef<HTMLDivElement>(null)
 const menuRef = useRef<HTMLDivElement>(null)
 const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 })
 const idleOptionColor = hexToRgba(resolvedSurfaceColor, 0.28)

 const updateMenuPosition = () => {
  if (!rootRef.current) return
  const rect = rootRef.current.getBoundingClientRect()
  setMenuPos({
   top: rect.bottom - CONTROL_SHELL.stroke,
   left: rect.left,
   width: rect.width,
  })
 }

 useEffect(() => {
  const onDocumentMouseDown = (event: MouseEvent) => {
   const target = event.target as Node
   const insideDropdown = rootRef.current?.contains(target) ?? false
   const insideMenu = menuRef.current?.contains(target) ?? false
   if (!insideDropdown && !insideMenu) {
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
  <div
   ref={rootRef}
   className="relative w-full"
   style={{
    height: `${CONTROL_SHELL.height}px`,
    zIndex: open ? 120 : 1,
   }}>
   <button
    type="button"
    onClick={() => setOpen((prev) => !prev)}
    className={`group w-full border-[4px] border-black overflow-hidden transition-[border-radius] ${CONTROL_SHELL.transition} block appearance-none p-0 ${
     open ? "rounded-t-[16px] rounded-b-none" : "rounded-[16px]"
    }`}
    style={{
     backgroundColor: resolvedSurfaceColor,
     height: `${CONTROL_SHELL.height}px`,
     boxShadow: `${CONTROL_SHELL.shadowOffset}px ${CONTROL_SHELL.shadowOffset}px 0px 0px ${hexToRgba(
      resolvedShadowColor,
      0.45,
     )}`,
    }}>
   <div className="h-full flex items-stretch">
     <IconRail backgroundColor={resolvedControlColor}>
      <div className="h-full w-full flex flex-col items-stretch justify-start">
       <div className="h-1/2 border-b-[4px] border-black text-[8px] font-black uppercase tracking-[0.14em] flex items-center justify-center px-1 leading-none">
        {label}
       </div>
       <div className="h-1/2 flex items-center justify-center">
        <ChevronDown size={30} strokeWidth={2.5} className="text-black" />
       </div>
      </div>
     </IconRail>
     <div
      className="flex-1 h-full flex items-center justify-center px-4 text-[20px] font-[900] uppercase tracking-tighter leading-none text-center"
      style={{ paddingRight: `${CONTROL_SHELL.contentOffset}px` }}>
      {value}
     </div>
    </div>
   </button>

   {createPortal(
    <div
     ref={menuRef}
     className={`${open ? "pointer-events-auto" : "pointer-events-none"} fixed z-[2500]`}
     style={{
      top: `${menuPos.top}px`,
      left: `${menuPos.left}px`,
      width: `${menuPos.width}px`,
     }}>
    <div
     className={`grid transition-[grid-template-rows] ${CONTROL_SHELL.transition} ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
     style={{ marginTop: `-${CONTROL_SHELL.stroke}px` }}>
     <div className="overflow-hidden min-h-0">
      <div
       className="border-x-[4px] border-b-[4px] border-black rounded-b-[16px] overflow-hidden"
       style={{ backgroundColor: "#FFFFFF" }}>
       {options.map((option) => (
         <button
          key={option}
          type="button"
          onClick={() => {
           onChange(option)
           setOpen(false)
          }}
          className="w-full h-11 border-t-[4px] border-black transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] rounded-none appearance-none focus:outline-none text-black"
          style={{
           backgroundColor: hoveredOption === option ? resolvedSurfaceColor : idleOptionColor,
          }}
          onMouseEnter={() => setHoveredOption(option)}
          onMouseLeave={() => setHoveredOption(null)}>
          <div className="h-full flex items-center px-4 text-[20px] font-[900] uppercase tracking-tighter leading-none text-left">
           <span className="leading-none mt-0.5">{option}</span>
          </div>
         </button>
        ))}
       </div>
      </div>
     </div>
    </div>,
    document.body,
   )}
  </div>
 )
}

const ActionControlButton: React.FC<ActionControlButtonProps> = ({
 label,
 tone = "pink",
 icon,
 onClick,
}) => {
 const toneConfig = ROW_CONTROL_THEMES[tone]
 return (
  <button
   type="button"
   onClick={onClick}
   className="w-full border-[4px] border-black rounded-[16px] overflow-hidden cursor-pointer active:translate-y-1 transition-all shrink-0 flex items-stretch appearance-none p-0"
   style={{
    height: `${CONTROL_SHELL.height}px`,
    backgroundColor: toneConfig.surface,
   boxShadow: `${CONTROL_SHELL.shadowOffset}px ${CONTROL_SHELL.shadowOffset}px 0px 0px ${hexToRgba(
     toneConfig.shadow,
     0.45,
    )}`,
   }}>
   <IconRail
    backgroundColor={toneConfig.control}
    >
    {icon}
   </IconRail>
   <div className="flex-1 h-full flex items-center justify-center" style={{ paddingRight: `${CONTROL_SHELL.contentOffset}px` }}>
    <span className="text-[28px] sm:text-[30px] font-[900] uppercase tracking-tighter leading-none mt-1 text-black">
     {label}
    </span>
   </div>
  </button>
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

  const [images, setImages] = useState<Array<{ id: string; name: string; url: string }>>([])

  // Subtoolboxes Gallery state
  const [showSubtoolboxesGallery, setShowSubtoolboxesGallery] = useState(true)
 const [isGalOverviewOpen, setIsGalOverviewOpen] = useState(true)
 const [isGalTrendsOpen, setIsGalTrendsOpen] = useState(false)
 const [isGalEngagementOpen, setIsGalEngagementOpen] = useState(false)
 const [isGalConceptOpen, setIsGalConceptOpen] = useState(true)
 const [isGalStylesOpen, setIsGalStylesOpen] = useState(false)
 const [isGalTextOpen, setIsGalTextOpen] = useState(false)
 const [isGalTagsOpen, setIsGalTagsOpen] = useState(false)
 const [isGalResourcesOpen, setIsGalResourcesOpen] = useState(true)
 const [isGalSecurityOpen, setIsGalSecurityOpen] = useState(false)
 const [isGalNetworkOpen, setIsGalNetworkOpen] = useState(false)
 const [isGalStorageOpen, setIsGalStorageOpen] = useState(false)

 const [galCpuUsage] = useState(67)
 const [galMemUsage] = useState(45)
 const [galDiskUsage] = useState(78)
 const [galAutoSync, setGalAutoSync] = useState(true)
 const [galNetworkState, setGalNetworkState] = useState<0 | 1 | 2>(1)
 const [galPassword, setGalPassword] = useState("")
 const [galOtp, setGalOtp] = useState("")
 const [galTags, setGalTags] = useState<string[]>(["tutorial", "howto"])

 const galTrendData = [
   { name: "Mon", views: 4000 }, { name: "Tue", views: 3000 }, { name: "Wed", views: 5000 }, { name: "Thu", views: 2780 }, { name: "Fri", views: 1890 }, { name: "Sat", views: 2390 }, { name: "Sun", views: 3490 },
 ]
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

 const showStudioScaffold = mode === "full" || mode === "ui-system"

 const showPackScaffold = mode === "full" || mode === "component-grid"

 const showComponentGrid = mode === "full" || mode === "component-grid"

 const showRulebook = mode === "full" || mode === "ui-system"

 const switchResolutionLabel =

  ["480P", "1K", "2K", "4K"][switchResolution] || "1K"

 // Keep legacy tokens and state hooks intentionally alive while sections are conditionally rendered.
 void [
  Settings,
  Square,
  X,
  closeIcon21,
  isAnalyticsScaffoldOpen,
  setIsAnalyticsScaffoldOpen,
  isPackControlsOpen,
  setIsPackControlsOpen,
  isPackFormsOpen,
  setIsPackFormsOpen,
  isPackSwitchesOpen,
  setIsPackSwitchesOpen,
  isAnalyticsOpen,
  setIsAnalyticsOpen,
  vibeValue,
  setVibeValue,
  hqMode,
  setHqMode,
  scanMode,
  setScanMode,
  labMode,
  setLabMode,
  packTab,
  setPackTab,
  packRowToggles,
  setPackRowToggles,
  packInput,
  setPackInput,
  packDescription,
  setPackDescription,
  packSelect,
  setPackSelect,
  packSecondarySelect,
  setPackSecondarySelect,
  packPage,
  setPackPage,
  packStep,
  setPackStep,
  setMediaProgress,
  switchCtrTarget,
  setSwitchCtrTarget,
  switchSaturation,
  setSwitchSaturation,
  setSwitchResolution,
  packPaletteToggles,
  setPackPaletteToggles,
  packPaletteChecks,
  setPackPaletteChecks,
  packPaletteRadios,
  setPackPaletteRadios,
 ]

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

      className="bg-[#FFE357] h-[80px] min-h-[80px] flex items-center justify-between select-none z-30 relative cursor-pointer"

      style={{

       borderBottom: `${CONFIG.scaffoldStroke}px solid black`,

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

      className={`grid transition-[grid-template-rows] duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${isStudioOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      style={{
       marginTop: `-${CONFIG.scaffoldStroke}px`,
      }}>

      <div className="overflow-hidden min-h-0 flex flex-col">

       <div
        className={`p-0 bg-neutral-100 flex-1 relative transition-opacity duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${isStudioOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>

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
           <div className="grid grid-cols-3 gap-2">
            {STYLES.map((style) => (
             <button
              key={style}
              onClick={() => toggleStyle(style)}
              className={`px-2 py-2 border-[2px] border-black rounded-lg font-black uppercase text-[9px] shadow-[2px_2px_0px_0px_black] active:translate-y-0.5 active:shadow-none transition-all ${
               activeStyles.includes(style) ? "bg-[#FFE357]" : "bg-white"
              }`}>
              {style}
             </button>
            ))}
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
           <div className="space-y-4">
            <input
             value={titleText}
             onChange={(e) => setTitleText(e.target.value)}
             placeholder="TITLE"
             className="pop-input w-full p-3 border-[3px] text-sm rounded-lg"
            />
            <input
             value={hookText}
             onChange={(e) => setHookText(e.target.value)}
             placeholder="SUBTITLE"
             className="pop-input w-full p-3 border-[3px] text-sm rounded-lg"
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
           <div className="flex justify-between items-start gap-3 py-2">
            {colors.map((color, index) => (
             <div key={`${index}-${color}`} className="flex flex-col items-center gap-2 flex-1">
              <div
               style={{ backgroundColor: color || "#f3f4f6" }}
               className="w-full aspect-[2/3] border-[3px] border-black rounded-xl shadow-[4px_4px_0px_0px_black] relative overflow-hidden flex items-center justify-center cursor-pointer">
               <input
                id={`toolbox-color-${index}`}
                type="color"
                value={color || "#ffffff"}
                onChange={(e) => {
                 const next = [...colors]
                 next[index] = e.target.value
                 setColors(next)
                }}
                className="absolute inset-0 opacity-0 cursor-pointer"
               />
               {!color && <span className="text-black/10 font-black text-lg">+</span>}
              </div>
              <input
               value={color}
               onChange={(e) => {
                const next = [...colors]
                next[index] = e.target.value
                setColors(next)
               }}
               className="pop-input w-full p-1.5 text-xs font-mono text-center border-[2px] rounded-md uppercase font-black"
               maxLength={7}
              />
             </div>
            ))}
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

            tone="orange"

           />

           <DropdownControl

            label="SIZE"

            value={resolution}

            options={["1K", "2K", "4K"]}

            onChange={setResolution}

            tone="orange"

           />

          </div>


          <ActionControlButton
           label="GENERATE ART"
           tone="pink"
           icon={<Zap size={30} strokeWidth={2.5} className="text-black" />}
          />

         </div>

        </div>

       </div>

      </div>

     </div>

    </div>

   )}

   {showSubtoolboxesGallery && (
    <div
     className="w-full bg-white flex flex-col overflow-hidden relative shadow-[12px_12px_0px_0px_rgba(0,0,0,0.5)] transition-all"
     style={{
      border: `${CONFIG.scaffoldStroke}px solid black`,
      borderRadius: `${CONFIG.radius}px`,
     }}>
     <header
      onClick={() => setShowSubtoolboxesGallery((prev) => !prev)}
      className="bg-[#C9F830] h-[80px] min-h-[80px] flex items-center justify-between select-none z-30 relative cursor-pointer"
      style={{ borderBottom: `${CONFIG.scaffoldStroke}px solid black` }}>
      <div className="flex items-center h-full flex-1">
       <div className="h-full w-[80px] flex items-center justify-center shrink-0" style={{ backgroundColor: "#FF00FF", borderRight: `${CONFIG.scaffoldStroke}px solid black` }}>
        <Layers size={40} strokeWidth={2.5} className="text-white" />
       </div>
       <h2 className="text-[32px] sm:text-[40px] md:text-[50px] font-[1000] uppercase tracking-tighter leading-none pl-6 truncate text-black">
        SUBTOOLBOXES GALLERY
       </h2>
      </div>
      <div className="flex items-center gap-3 pr-6 h-full">
       <AnimatedToggleIcon open={showSubtoolboxesGallery} size={40} />
      </div>
     </header>

     <div className={`grid transition-[grid-template-rows] duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${showSubtoolboxesGallery ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`} style={{ marginTop: `-${CONFIG.scaffoldStroke}px` }}>
      <div className="overflow-hidden min-h-0">
       <main className={`bg-[#f5f5f5] w-full p-6 md:p-8 text-black transition-opacity duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${showSubtoolboxesGallery ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

         {/* 1. MEDIA ANALYTICS */}
         <SubToolbox title="OVERVIEW" icon={Eye} headerBg="#FFE357" iconBg="#FF7497" isOpen={isGalOverviewOpen} onToggle={() => setIsGalOverviewOpen((p) => !p)} openUnits={4} config={CONFIG}>
          <div className="grid grid-cols-2 gap-4 h-[180px]">
           <MetricCard title="Total Views" value="2.4M" change="+12.5%" sparklineData={[30,40,35,50,49,60,70,91]} color="#00D2FF" />
           <MetricCard title="Watch Time" value="1.2K hrs" change="+8.3%" sparklineData={[20,35,45,40,55,65,60,75]} color="#C9F830" />
           <MetricCard title="Engagement" value="89.2%" change="-2.1%" changeType="negative" sparklineData={[90,85,88,82,87,89,84,89]} color="#FF7497" />
           <MetricCard title="Sub" value="142K" change="+5.7%" sparklineData={[100,110,108,120,125,130,135,142]} color="#FFE357" />
          </div>
         </SubToolbox>

         <SubToolbox title="TRENDS" icon={TrendingUp} headerBg="#C9F830" iconBg="#00D2FF" isOpen={isGalTrendsOpen} onToggle={() => setIsGalTrendsOpen((p) => !p)} openUnits={4} config={CONFIG}>
          <div className="h-full w-full"><TrendAreaChart data={galTrendData} dataKey="views" color="#00D2FF" height={180} /></div>
         </SubToolbox>

         <SubToolbox title="ENGAGEMENT" icon={Activity} headerBg="#FF7497" iconBg="#FFE357" isOpen={isGalEngagementOpen} onToggle={() => setIsGalEngagementOpen((p) => !p)} openUnits={4} config={CONFIG}>
          <div className="grid grid-cols-2 gap-4 h-[180px]">
           <MiniModule title="Performance" headerColor="bg-[#C9F830]">
            <div className="space-y-3 pt-2">
             <StatSlider label="CTR" value={78} color="#FF3399" />
             <StatSlider label="Retention" value={62} color="#C9F830" />
             <StatSlider label="Completion" value={91} color="#00D2FF" />
            </div>
           </MiniModule>
           <MiniModule title="Activity" headerColor="bg-[#FF7497]">
            <div className="h-full flex items-center justify-center relative translate-y-1">
             <ActivityRings rings={[{value:78,max:100,color:"#FF7497",label:"Likes"},{value:62,max:100,color:"#C9F830",label:"Comments"},{value:45,max:100,color:"#00D2FF",label:"Shares"}]} size={110} />
            </div>
           </MiniModule>
          </div>
         </SubToolbox>
         
         {/* 2. CONTENT STRATEGY */}
         <SubToolbox title="CONCEPT" icon={Lightbulb} headerBg="#24D3FF" iconBg="#FFE357" isOpen={isGalConceptOpen} onToggle={() => setIsGalConceptOpen((prev) => !prev)} openUnits={4} config={CONFIG}>
            <div className="flex flex-col h-full justify-between gap-4">
              <textarea placeholder="Describe your content idea..." className="w-full flex-1 p-4 text-sm font-bold rounded-2xl outline-none resize-none border-[4px] bg-white border-black text-black placeholder:text-black/20" />
              <div className="flex justify-between items-center gap-4">
                {/* <KeyboardShortcut keys={["Ctrl", "Enter"]} /> */}
                <span className="font-mono text-xs font-bold px-2 border-2 border-black rounded shadow-[2px_2px_0px_0px_black] bg-white">CTRL + ENTER</span>
                <ActionControlButton label="Auto-Refine" icon={<Zap size={16} />} tone="orange" />
              </div>
            </div>
         </SubToolbox>
         
         <SubToolbox title="STYLES" icon={Grid3X3} headerBg="#C9F830" iconBg="#24D3FF" isOpen={isGalStylesOpen} onToggle={() => setIsGalStylesOpen((p) => !p)} openUnits={4} config={CONFIG}>
          <div className="grid grid-cols-3 gap-2 h-full">
            {STYLES.slice(0, 9).map((style) => (
              <button key={style} className="h-full rounded-xl font-black uppercase text-[9px] transition-all border-[3px] border-black bg-white text-black hover:bg-black hover:text-white min-h-[40px]">{style}</button>
            ))}
          </div>
         </SubToolbox>
         
         <SubToolbox title="TEXT" icon={Type} headerBg="#FFE357" iconBg="#C9F830" isOpen={isGalTextOpen} onToggle={() => setIsGalTextOpen((p) => !p)} openUnits={3} config={CONFIG}>
            <div className="flex flex-col h-full justify-center gap-4">
              <input placeholder="TITLE" className="w-full h-[56px] px-4 font-black uppercase text-sm rounded-2xl outline-none border-[4px] bg-white border-black text-black" />
              <input placeholder="HOOK / SUBTITLE" className="w-full h-[56px] px-4 font-black uppercase text-sm rounded-2xl outline-none border-[4px] bg-white border-black text-black" />
            </div>
         </SubToolbox>
         
         <SubToolbox title="TAGS" icon={Tag} headerBg="#FCAF57" iconBg="#FFE357" isOpen={isGalTagsOpen} onToggle={() => setIsGalTagsOpen((p) => !p)} openUnits={3} config={CONFIG}>
            <TagInput tags={galTags} onChange={setGalTags} />
         </SubToolbox>
         
         {/* 3. SYSTEM OPS */}
         <SubToolbox title="RESOURCES" icon={Cpu} headerBg="#00D2FF" iconBg="#C9F830" isOpen={isGalResourcesOpen} onToggle={() => setIsGalResourcesOpen((p) => !p)} openUnits={5} config={CONFIG}>
            <div className="grid grid-cols-2 gap-4 h-[240px]">
              <MiniModule title="System Stats" headerColor="bg-[#FFE357]">
                <div className="space-y-3 pt-4">
                  <StatSlider label="CPU" value={galCpuUsage} color="#FF3399" />
                  <StatSlider label="Memory" value={galMemUsage} color="#C9F830" />
                  <StatSlider label="Disk" value={galDiskUsage} color="#00D2FF" />
                </div>
              </MiniModule>
              <MiniModule title="Live Status" headerColor="bg-[#FF7497]">
                <div className="h-full flex flex-col items-center justify-center gap-4 pt-4">
                  <div className="flex gap-4">
                    <RadialGauge value={galCpuUsage} label="CPU" color="#FF3399" size={70} />
                    <RadialGauge value={galMemUsage} label="MEM" color="#C9F830" size={70} />
                  </div>
                  <div className="text-center text-black">
                    <span className="text-3xl font-[1000]">142</span>
                    <span className="text-[10px] font-black uppercase tracking-widest block">ms latency</span>
                  </div>
                </div>
              </MiniModule>
            </div>
         </SubToolbox>
         
         <SubToolbox title="SECURITY" icon={Shield} headerBg="#FF7497" iconBg="#FFE357" isOpen={isGalSecurityOpen} onToggle={() => setIsGalSecurityOpen((p) => !p)} openUnits={4} config={CONFIG}>
            <div className="flex flex-col gap-4 h-full justify-between">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest mb-2 block text-black/60">Admin Password</label>
                <PasswordInput value={galPassword} onChange={setGalPassword} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest mb-2 block text-black/60">2FA Code</label>
                <OTPInput value={galOtp} onChange={setGalOtp} length={5} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Lock size={16} className="text-black" /><span className="text-xs font-bold uppercase text-black">AES-256 Enabled</span></div>
                <Keycap>PRO</Keycap>
              </div>
            </div>
         </SubToolbox>
         
         <SubToolbox title="NETWORK" icon={Wifi} headerBg="#FCAF57" iconBg="#C9F830" isOpen={isGalNetworkOpen} onToggle={() => setIsGalNetworkOpen((p) => !p)} openUnits={3} config={CONFIG}>
            <div className="flex flex-col gap-5 h-full justify-center">
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase text-sm text-black">Network Mode</span>
                <TripleStateSwitch state={galNetworkState} onChange={setGalNetworkState} labels={["Off", "Auto", "On"]} colors={["#FF3399", "#FFE357", "#C9F830"]} />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase text-sm text-black">Auto Sync</span>
                <BrutalistCheckbox checked={galAutoSync} onChange={setGalAutoSync} color="#C9F830" />
              </div>
              <LinearGauge value={85} max={100} label="Bandwidth" color="#00D2FF" />
            </div>
         </SubToolbox>
         
         <SubToolbox title="STORAGE" icon={Database} headerBg="#24D3FF" iconBg="#FFE357" isOpen={isGalStorageOpen} onToggle={() => setIsGalStorageOpen((p) => !p)} openUnits={3} config={CONFIG}>
            <div className="flex flex-col gap-5 h-full justify-center">
              <LinearGauge value={galDiskUsage} max={100} label="Local Storage" color="#FF7497" />
              <LinearGauge value={45} max={100} label="Cloud Storage" color="#C9F830" />
              <div className="flex gap-2">
                <button className="flex-1 py-3 border-[3px] rounded-xl font-[900] uppercase text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02] border-black bg-[#C9F830]"><Download size={14} />Backup</button>
                <button className="flex-1 py-3 border-[3px] rounded-xl font-[900] uppercase text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02] border-black bg-[#FFE357]"><Upload size={14} />Restore</button>
                <button className="py-3 px-4 border-[3px] rounded-xl font-[900] uppercase text-xs flex items-center justify-center transition-all hover:scale-[1.02] border-black bg-[#FF3399] text-white"><Trash2 size={14} /></button>
              </div>
            </div>
         </SubToolbox>
        </div>
       </main>
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
      className="bg-[#FFE357] h-[80px] min-h-[80px] flex items-center justify-between select-none z-30 relative cursor-pointer"
      style={{
       borderBottom: `${CONFIG.scaffoldStroke}px solid black`,
      }}>
      <div className="flex items-center h-full flex-1">
       <div
        className="h-full w-[80px] flex items-center justify-center shrink-0"
        style={{
         backgroundColor: "#24D3FF",
         borderRight: `${CONFIG.scaffoldStroke}px solid black`,
        }}>
        <Cloud size={40} strokeWidth={2.5} className="text-black" />
       </div>
       <h2 className="text-[32px] sm:text-[40px] md:text-[50px] font-[1000] uppercase tracking-tighter leading-none pl-6 truncate text-black">
        PACK SCAFFOLD
       </h2>
      </div>
      <div className="flex items-center gap-3 pr-6 h-full">
       <AnimatedToggleIcon open={isPackScaffoldOpen} size={40} />
      </div>
     </header>

     <div
      className={`grid transition-[grid-template-rows] duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${isPackScaffoldOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      style={{
       marginTop: `-${CONFIG.scaffoldStroke}px`,
      }}>
      <div className="overflow-hidden min-h-0">
       <main
        className={`bg-[#f5f5f5] w-full p-6 md:p-8 text-black transition-opacity duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${isPackScaffoldOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
         <SubToolbox
          title="MEDIA"
          icon={MonitorPlay}
          headerBg="#24D3FF"
          iconBg="#C9F830"
          isOpen={isPackMediaOpen}
          onToggle={() => setIsPackMediaOpen((prev) => !prev)}
         config={CONFIG}>
          <div className="space-y-3">
           <div className="grid grid-cols-2 gap-3">
            <DropdownControl
             label="MODE"
             value={packSelect}
             options={["DEFAULT", "PRIORITY", "BALANCED"]}
             onChange={setPackSelect}
             tone="orange"
            />
            <DropdownControl
             label="FLOW"
             value={packSecondarySelect}
             options={["PRIORITY", "AUTO", "MANUAL"]}
             onChange={setPackSecondarySelect}
             tone="orange"
            />
           </div>
           <div className="h-12 border-[3px] border-black rounded-xl bg-white px-3 flex items-center justify-between text-[11px] font-black uppercase">
            <span>Preview Player</span>
            <span>{switchResolutionLabel}</span>
           </div>
           <div className="h-24 border-[3px] border-dashed border-black/40 rounded-xl bg-white flex items-center justify-center text-[10px] font-black uppercase">
            Timeline + Markers
           </div>
          </div>
         </SubToolbox>

         <SubToolbox
          title="DATA"
          icon={Search}
          headerBg="#C9F830"
          iconBg="#24D3FF"
          isOpen={isPackDataOpen}
          onToggle={() => setIsPackDataOpen((prev) => !prev)}
          config={CONFIG}>
          <div className="grid grid-cols-3 gap-3">
           {[
            { label: "Views", value: "12.4K", bg: "#24D3FF" },
            { label: "CTR", value: "6.8%", bg: "#FFE357" },
            { label: "Revenue", value: "$402", bg: "#FFB158" },
           ].map((stat) => (
            <div key={stat.label} className="border-[3px] border-black rounded-xl bg-white overflow-hidden">
             <div className="h-7 border-b-[3px] border-black text-[10px] font-black uppercase flex items-center justify-center" style={{ backgroundColor: stat.bg }}>
              {stat.label}
             </div>
             <div className="h-12 flex items-center justify-center text-[20px] font-[1000]">{stat.value}</div>
            </div>
           ))}
          </div>
         </SubToolbox>

         <SubToolbox
          title="SCHEDULE"
          icon={Bell}
          headerBg="#FFB158"
          iconBg="#24D3FF"
          isOpen={isPackScheduleOpen}
          onToggle={() => setIsPackScheduleOpen((prev) => !prev)}
          config={CONFIG}>
          <div className="grid grid-cols-7 gap-2">
           {Array.from({ length: 14 }).map((_, i) => (
            <div
             key={`pack-day-${i}`}
             className={`h-8 border-[2px] border-black rounded-lg text-[11px] font-black flex items-center justify-center ${i === 8 ? "bg-[#FCAF57]" : "bg-white"}`}>
             {i + 1}
            </div>
           ))}
          </div>
         </SubToolbox>

         <SubToolbox
          title="STATES"
          icon={ImagePlus}
          headerBg="#FF7497"
          iconBg="#FFE357"
          isOpen={isPackStatesOpen}
          onToggle={() => setIsPackStatesOpen((prev) => !prev)}
          config={CONFIG}>
          <div className="space-y-3">
           <div className="h-20 border-[3px] border-dashed border-black/30 rounded-xl bg-white flex items-center justify-center text-[11px] font-black uppercase">
            Empty / Dropzone
           </div>
           <div className="h-12 border-[3px] border-black rounded-xl bg-[#FF7497] text-white flex items-center px-3 text-[11px] font-black uppercase">
            Alert: Action Required
           </div>
          </div>
         </SubToolbox>
        </div>
       </main>
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

      className="bg-[#C9F830] h-[80px] min-h-[80px] flex items-center justify-between select-none z-30 relative cursor-pointer"

      style={{

       borderBottom: `${CONFIG.scaffoldStroke}px solid black`,

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

      className={`grid transition-[grid-template-rows] duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${isComponentsOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      style={{
       marginTop: `-${CONFIG.scaffoldStroke}px`,
      }}>

      <div className="overflow-hidden min-h-0">

       <div

        className={`bg-neutral-100 transition-opacity duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${isComponentsOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}

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

      className="bg-[#24D3FF] h-[80px] min-h-[80px] flex items-center justify-between select-none z-30 relative cursor-pointer"

      style={{

       borderBottom: `${CONFIG.scaffoldStroke}px solid black`,

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

      className={`grid transition-[grid-template-rows] duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${isRulebookOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      style={{
       marginTop: `-${CONFIG.scaffoldStroke}px`,
      }}>

      <div className="overflow-hidden min-h-0">

       <div

        className={`bg-neutral-100 transition-opacity duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${isRulebookOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}

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

  );

};


// ==========================================
// IMPORTED HYBRID PRIMITIVES
// ==========================================

export function Sparkline({ data, color = "#FF7497", height = 40, variant = "standard" }: any) {
  const chartData = data.map((value: any, index: any) => ({ value, index }))
  const getStrokeColor = () => variant === "tokyo-pop" ? "#00FFFF" : variant === "inverted" ? "#FFFFFF" : color
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line type="monotone" dataKey="value" stroke={getStrokeColor()} strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function TrendAreaChart({ data, dataKey, color = "#C9F830", height = 200, variant = "standard" }: any) {
  const getBgColor = () => variant === "tokyo-pop" ? "#0a0a0a" : variant === "inverted" ? "#000000" : "#FFFFFF"
  const getStrokeColor = () => variant === "tokyo-pop" ? "#00FFFF" : color
  return (
    <div style={{ height }} className={`w-full border-[4px] rounded-2xl overflow-hidden p-4 ${variant === "inverted" ? "border-white bg-black" : variant === "tokyo-pop" ? "border-[#FF00FF] bg-black" : "border-black bg-white"}`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`gradient-${variant}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={getStrokeColor()} stopOpacity={0.8} />
              <stop offset="95%" stopColor={getStrokeColor()} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <XAxis dataKey="name" stroke={variant === "standard" ? "#000" : "#FFF"} strokeWidth={2} tick={{ fontSize: 10, fontWeight: 900 }} />
          <YAxis stroke={variant === "standard" ? "#000" : "#FFF"} strokeWidth={2} tick={{ fontSize: 10 }} />
          <Tooltip contentStyle={{ backgroundColor: getBgColor(), border: `3px solid ${variant === "tokyo-pop" ? "#FF00FF" : "black"}`, borderRadius: "12px", fontWeight: 900 }} />
          <Area type="monotone" dataKey={dataKey} stroke={getStrokeColor()} strokeWidth={4} fill={`url(#gradient-${variant})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function BrutalistBarChart({ data, dataKey, colors = ["#FF7497", "#C9F830", "#00D2FF", "#FFE357", "#FF3399"], height = 200, variant = "standard" }: any) {
  return (
    <div style={{ height }} className={`w-full border-[4px] rounded-2xl overflow-hidden p-4 ${variant === "inverted" ? "border-white bg-black" : variant === "tokyo-pop" ? "border-[#FF00FF] bg-black" : "border-black bg-white"}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" stroke={variant === "standard" ? "#000" : "#FFF"} strokeWidth={2} tick={{ fontSize: 10, fontWeight: 900 }} />
          <YAxis stroke={variant === "standard" ? "#000" : "#FFF"} strokeWidth={2} tick={{ fontSize: 10 }} />
          <Tooltip contentStyle={{ backgroundColor: variant === "standard" ? "#FFF" : "#000", border: `3px solid ${variant === "tokyo-pop" ? "#FF00FF" : "black"}`, borderRadius: "12px", fontWeight: 900 }} />
          <Bar dataKey={dataKey} radius={[8, 8, 0, 0]}>
            {data.map((_: any, index: number) => <Cell key={`cell-${index}`} fill={variant === "tokyo-pop" ? "#00FFFF" : colors[index % colors.length]} stroke={variant === "tokyo-pop" ? "#FF00FF" : "black"} strokeWidth={3} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function RadialGauge({ value, max = 100, label, color = "#C9F830", size = 120, variant = "standard" }: any) {
  const percentage = (value / max) * 100; const strokeWidth = 12; const radius = (size - strokeWidth) / 2; const circumference = radius * 2 * Math.PI; const offset = circumference - (percentage / 100) * circumference;
  const styles = variant === "tokyo-pop" ? { bg: "#FF00FF20", stroke: "#00FFFF", text: "text-[#00FFFF]" } : variant === "inverted" ? { bg: "#FFFFFF20", stroke: "#FFFFFF", text: "text-white" } : { bg: "#00000010", stroke: color, text: "text-black" };
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={styles.bg} strokeWidth={strokeWidth} />
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={styles.stroke} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-700 ease-out" style={variant === "tokyo-pop" ? { filter: "drop-shadow(0 0 10px #00FFFF)" } : undefined} />
        </svg>
        <div className={`absolute inset-0 flex items-center justify-center ${styles.text}`}><span className="text-2xl font-[1000]">{Math.round(percentage)}%</span></div>
      </div>
      {label && <span className={`text-[10px] font-black uppercase tracking-widest mt-2 ${styles.text}`}>{label}</span>}
    </div>
  )
}

export function LinearGauge({ value, max = 100, label, color = "#FF7497", variant = "standard" }: any) {
  const percentage = (value / max) * 100;
  const styles = variant === "tokyo-pop" ? { bg: "bg-[#FF00FF]/20", border: "border-[#FF00FF]", text: "text-[#00FFFF]" } : variant === "inverted" ? { bg: "bg-white/20", border: "border-white", text: "text-white" } : { bg: "bg-gray-100", border: "border-black", text: "text-black" };
  return (
    <div className="w-full">
      {label && (<div className="flex justify-between items-center mb-2"><span className={`text-[10px] font-black uppercase tracking-widest ${styles.text}/60`}>{label}</span><span className={`text-[12px] font-[1000] ${styles.text}`}>{value}/{max}</span></div>)}
      <div className={`relative h-6 ${styles.bg} border-[3px] ${styles.border} rounded-full overflow-hidden`}>
        <div className="absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${percentage}%`, backgroundColor: variant === "tokyo-pop" ? "#00FFFF" : color, boxShadow: variant === "tokyo-pop" ? "0 0 15px #00FFFF" : undefined }} />
      </div>
    </div>
  )
}

export function ActivityRings({ rings, size = 120, variant = "standard" }: any) {
  const strokeWidth = 10; const gap = 4;
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {rings.map((ring: any, index: number) => {
            const radius = (size - strokeWidth) / 2 - index * (strokeWidth + gap); const circumference = radius * 2 * Math.PI; const percentage = (ring.value / ring.max) * 100; const offset = circumference - (percentage / 100) * circumference;
            return (
              <g key={ring.label}>
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={variant === "standard" ? "#00000010" : "#FFFFFF10"} strokeWidth={strokeWidth} />
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={variant === "tokyo-pop" ? "#00FFFF" : ring.color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-700 ease-out" />
              </g>
            )
          })}
        </svg>
      </div>
      <div className="flex gap-4 mt-3">
        {rings.map((ring: any) => (
          <div key={ring.label} className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: variant === "tokyo-pop" ? "#00FFFF" : ring.color }} />
            <span className={`text-[9px] font-black uppercase ${variant === "standard" ? "text-black" : "text-white"}`}>{ring.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function MetricCard({ title, value, change, changeType = "positive", sparklineData, color = "#C9F830", variant = "standard" }: any) {
  const styles = variant === "tokyo-pop" ? { border: "border-[#FF00FF]", bg: "bg-black", text: "text-[#00FFFF]", subtext: "text-[#FF00FF]" } : variant === "inverted" ? { border: "border-white", bg: "bg-black", text: "text-white", subtext: "text-white/60" } : { border: "border-black", bg: "bg-white", text: "text-black", subtext: "text-black/60" };
  const changeColors: any = { positive: "text-[#C9F830]", negative: "text-[#FF3399]", neutral: "text-[#FFE357]" };
  return (
    <div className={`${styles.border} border-[4px] rounded-2xl ${styles.bg} p-4 shadow-[4px_4px_0px_0px_black]`}>
      <div className="flex justify-between items-start mb-2"><span className={`text-[10px] font-black uppercase tracking-widest ${styles.subtext}`}>{title}</span>{change && (<span className={`text-[10px] font-black ${changeColors[changeType]}`}>{change}</span>)}</div>
      <div className={`text-3xl font-[1000] ${styles.text} mb-2`}>{value}</div>
      {sparklineData && <Sparkline data={sparklineData} color={color} height={30} variant={variant} />}
    </div>
  )
}

export function BrutalistCheckbox({ checked, onChange, label, color = "#C9F830", variant = "standard" }: any) {
  const styles = variant === "tokyo-pop" ? { border: "border-[#FF00FF]", text: "text-[#00FFFF]", bg: checked ? "bg-[#FF00FF]" : "bg-transparent" } : variant === "inverted" ? { border: "border-white", text: "text-white", bg: checked ? "bg-white" : "bg-transparent" } : { border: "border-black", text: "text-black", bg: checked ? "" : "bg-white" };
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <button onClick={() => onChange(!checked)} className={`w-6 h-6 ${styles.border} border-[3px] rounded-lg flex items-center justify-center transition-all shadow-[2px_2px_0px_0px_black] group-hover:shadow-[1px_1px_0px_0px_black] group-hover:translate-x-0.5 group-hover:translate-y-0.5`} style={{ backgroundColor: checked ? color : variant === "standard" ? "white" : "transparent" }}>
        {checked && <Check size={16} strokeWidth={4} className={variant === "tokyo-pop" ? "text-[#00FFFF]" : "text-black"} />}
      </button>
      {label && <span className={`text-sm font-bold uppercase ${styles.text}`}>{label}</span>}
    </label>
  )
}

export function TripleStateSwitch({ state, onChange, labels = ["Off", "Auto", "On"], colors = ["#FF3399", "#FFE357", "#C9F830"] }: any) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-8 w-24 bg-gray-100 border-[3px] border-black rounded-full overflow-hidden">
        <div className="absolute top-0 left-0 h-full w-1/3 transition-all duration-300" style={{ transform: `translateX(${state * 100}%)`, backgroundColor: colors[state] }} />
        <div className="absolute inset-0 flex">
          {[0, 1, 2].map((i) => <button key={i} onClick={() => onChange(i as any)} className="flex-1 flex items-center justify-center">{state === i && (<div className="w-4 h-4 bg-white border-[2px] border-black rounded-full shadow-[1px_1px_0px_0px_black]" />)}</button>)}
        </div>
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest mt-2">{labels[state]}</span>
    </div>
  )
}

export function TokyoPopSwitch({ checked, onChange, label }: any) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <button onClick={() => onChange(!checked)} className="relative w-14 h-7 rounded-full border-[3px] transition-all" style={{ borderColor: "#FF00FF", backgroundColor: checked ? "#FF00FF" : "black", boxShadow: checked ? "0 0 20px #FF00FF, 0 0 40px #FF00FF40" : "none" }}>
        <div className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full transition-all duration-300" style={{ left: checked ? "calc(100% - 24px)" : "2px", backgroundColor: "#00FFFF", boxShadow: "0 0 10px #00FFFF" }} />
      </button>
      {label && <span className="text-sm font-bold uppercase text-[#00FFFF]" style={{ textShadow: "0 0 10px #00FFFF" }}>{label}</span>}
    </label>
  )
}

export function OTPInput({ length = 6, value, onChange, variant = "standard" }: any) {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  const handleChange = (index: number, char: string) => { if (char.length > 1) return; const newValue = value.split(""); newValue[index] = char; onChange(newValue.join("")); if (char && index < length - 1) { inputRefs.current[index + 1]?.focus(); } };
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => { if (e.key === "Backspace" && !value[index] && index > 0) { inputRefs.current[index - 1]?.focus(); } };
  const styles = variant === "tokyo-pop" ? { border: "border-[#FF00FF]", bg: "bg-black", text: "text-[#00FFFF]" } : variant === "inverted" ? { border: "border-white", bg: "bg-black", text: "text-white" } : { border: "border-black", bg: "bg-white", text: "text-black" };
  return (
    <div className="flex gap-2">
      {Array.from({ length }).map((_, index) => (
        <input key={index} ref={(el) => { inputRefs.current[index] = el }} type="text" inputMode="numeric" maxLength={1} value={value[index] || ""} onChange={(e) => handleChange(index, e.target.value)} onKeyDown={(e) => handleKeyDown(index, e)} className={`w-12 h-14 text-center text-2xl font-[1000] ${styles.border} border-[4px] rounded-2xl ${styles.bg} ${styles.text} outline-none focus:ring-4 focus:ring-[#C9F830] transition-all shadow-[3px_3px_0px_0px_black]`} style={variant === "tokyo-pop" ? { boxShadow: "0 0 15px #FF00FF40, 3px 3px 0px 0px #FF00FF" } : undefined} />
      ))}
    </div>
  )
}

export function PasswordInput({ value, onChange, placeholder = "Password", variant = "standard" }: any) {
  const [visible, setVisible] = React.useState(false);
  const styles = variant === "tokyo-pop" ? { border: "border-[#FF00FF]", bg: "bg-black", text: "text-[#00FFFF]", placeholder: "placeholder:text-[#00FFFF]/40" } : variant === "inverted" ? { border: "border-white", bg: "bg-black", text: "text-white", placeholder: "placeholder:text-white/40" } : { border: "border-black", bg: "bg-white", text: "text-black", placeholder: "placeholder:text-black/40" };
  return (
    <div className="relative">
      <input type={visible ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`w-full h-14 px-4 pr-14 text-sm font-bold ${styles.border} border-[4px] rounded-2xl ${styles.bg} ${styles.text} ${styles.placeholder} outline-none focus:ring-4 focus:ring-[#C9F830] transition-all shadow-[3px_3px_0px_0px_black]`} />
      <button type="button" onClick={() => setVisible(!visible)} className={`absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center ${styles.border} border-[3px] rounded-xl ${variant === "tokyo-pop" ? "bg-[#FF00FF]" : "bg-[#FFE357]"} hover:scale-105 transition-transform`}>
        {visible ? <EyeOff size={18} className={variant === "tokyo-pop" ? "text-[#00FFFF]" : "text-black"} /> : <Eye size={18} className={variant === "tokyo-pop" ? "text-[#00FFFF]" : "text-black"} />}
      </button>
    </div>
  )
}

export function Keycap({ children, size = "md", variant = "standard" }: any) {
  const sizes: any = { sm: "min-w-[28px] h-7 text-[10px] px-2", md: "min-w-[36px] h-9 text-xs px-3", lg: "min-w-[44px] h-11 text-sm px-4" };
  const styles = variant === "tokyo-pop" ? "border-[#FF00FF] bg-black text-[#00FFFF] shadow-[0_4px_0_0_#FF00FF]" : variant === "inverted" ? "border-white bg-black text-white shadow-[0_4px_0_0_white]" : "border-black bg-white text-black shadow-[0_4px_0_0_black]";
  return (
    <span className={`inline-flex items-center justify-center ${sizes[size]} font-[900] uppercase tracking-tight border-[3px] rounded-lg ${styles} hover:translate-y-1 hover:shadow-none transition-all cursor-pointer`}>
      {children}
    </span>
  )
}

export function TagInput({ tags, onChange, placeholder = "Add tag...", color = "#C9F830" }: any) {
  const [inputValue, setInputValue] = React.useState("");
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputValue.trim()) { e.preventDefault(); if (!tags.includes(inputValue.trim())) onChange([...tags, inputValue.trim()]); setInputValue(""); }
    if (e.key === "Backspace" && !inputValue && tags.length > 0) onChange(tags.slice(0, -1));
  };
  return (
    <div className="flex flex-wrap gap-2 p-3 min-h-[56px] border-[4px] border-black rounded-2xl bg-white">
      {tags.map((tag: string) => (
        <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 text-xs font-[900] uppercase border-[3px] border-black rounded-full shadow-[2px_2px_0px_0px_black]" style={{ backgroundColor: color }}>
          {tag}
          <button onClick={() => onChange(tags.filter((t: string) => t !== tag))} className="w-4 h-4 flex items-center justify-center rounded-full bg-black text-white hover:bg-red-500 transition-colors"><X size={10} strokeWidth={3} /></button>
        </span>
      ))}
      <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder={tags.length === 0 ? placeholder : ""} className="flex-1 min-w-[100px] h-8 text-sm font-bold outline-none bg-transparent placeholder:text-black/30" />
    </div>
  )
}

export function MiniModule({ title, headerColor, children, variant = "standard" }: any) {
  const styles = variant === "tokyo-pop" ? { border: "border-[#FF00FF]", bg: "bg-[#0a0a0a]", text: "text-[#00FFFF]" } : variant === "inverted" ? { border: "border-white", bg: "bg-black", text: "text-white" } : { border: "border-black", bg: "bg-white", text: "text-black" };
  return (
    <section className={`${styles.border} border-[3px] rounded-2xl ${styles.bg} overflow-hidden flex flex-col h-full shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]`}>
      <div className={`h-10 ${headerColor} border-b-[3px] ${styles.border} flex items-center px-4 shrink-0`}><h3 className={`text-sm font-[1000] uppercase tracking-tighter mt-0.5 ${styles.text}`}>{title}</h3></div>
      <div className="p-4 flex-1 overflow-hidden">{children}</div>
    </section>
  )
}

export function StatSlider({ label, value, color, variant = "standard" }: any) {
  const styles = variant === "tokyo-pop" ? { labelColor: "text-[#00FFFF]/40", valueColor: "text-[#00FFFF]", trackBg: "bg-[#FF00FF]/20", border: "border-[#FF00FF]" } : variant === "inverted" ? { labelColor: "text-white/40", valueColor: "text-white", trackBg: "bg-white/20", border: "border-white" } : { labelColor: "text-black/40", valueColor: "text-black", trackBg: "bg-gray-100", border: "border-black" };
  return (
    <div className="flex flex-col justify-center h-[40px]">
      <div className="flex justify-between items-end mb-1"><span className={`text-[9px] font-black uppercase tracking-widest ${styles.labelColor} leading-none`}>{label}</span><span className={`text-[10px] font-[1000] leading-none ${styles.valueColor}`}>{value}%</span></div>
      <div className={`w-full h-4 ${styles.trackBg} border-[3px] ${styles.border} rounded-full overflow-hidden`}><div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${value}%`, backgroundColor: color }} /></div>
    </div>
  )
}


export default ToolboxUISystem;
