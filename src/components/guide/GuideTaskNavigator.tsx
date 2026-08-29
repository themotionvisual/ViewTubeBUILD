import React from "react"
import {
  BarChart3,
  CircleHelp,
  Database,
  Film,
  Gauge,
  Lightbulb,
  MessageSquareText,
  Search,
  Upload,
  WandSparkles,
} from "lucide-react"
import { getToolboxPaletteColors } from "../../styles/toolboxPalette"

const TASKS = [
 { label: "Connect my channel", detail: "Account + Google authorization", href: "#guide-connect", icon: Gauge },
 { label: "Find a metric", detail: "Definitions, sources, aliases", href: "#metrics", icon: Search },
 { label: "Find a dataset", detail: "VT-SYNC tables + ownership", href: "#datasets", icon: Database },
 { label: "Understand performance", detail: "Analytics + Intelligence", href: "#guide-analytics", icon: BarChart3 },
 { label: "Understand a chart", detail: "Visual encodings + module encyclopedia", href: "#visuals", icon: BarChart3 },
 { label: "Plan a video", detail: "Projects, ideas, hooks, storyboards", href: "#guide-create", icon: Lightbulb },
 { label: "Use AI Brain", detail: "Channel-grounded analysis", href: "#create", icon: WandSparkles },
 { label: "Work with comments", detail: "Audience + engagement tools", href: "#widgets", icon: MessageSquareText },
 { label: "Edit a video", detail: "Timeline, clips, transitions", href: "#guide-editor", icon: Film },
 { label: "Publish a video", detail: "Packaging + metadata", href: "#guide-publish", icon: Upload },
 { label: "Fix a problem", detail: "Connection → data → tool → render", href: "#guide-help", icon: CircleHelp },
] as const

export const GuideTaskNavigator: React.FC = () => (
 <div className="overflow-hidden rounded-[14px] border-[4px] border-black bg-white shadow-[5px_5px_0_0_#000]">
  <div className="flex items-end justify-between gap-3 border-b-[4px] border-black bg-black px-3 py-2 text-white">
   <div><p className="text-[9px] font-black uppercase tracking-[.18em] text-white/60">Task navigator</p><h3 className="text-lg font-black uppercase leading-none">I want to...</h3></div>
   <span className="text-[9px] font-black uppercase text-white/60">{TASKS.length} paths</span>
  </div>
  <div className="grid gap-2 p-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
   {TASKS.map(({ label, detail, href, icon: Icon }, index) => {
    const palette = getToolboxPaletteColors(index)
    return (
    <a
     key={label}
     href={href}
     className="group flex min-h-[58px] min-w-0 overflow-hidden rounded-lg border-[3px] border-black bg-white transition-transform hover:-translate-y-0.5"
    >
     <span className="flex w-11 shrink-0 items-center justify-center border-r-[3px] border-black text-black" style={{ backgroundColor: palette.icon }}><Icon size={19} strokeWidth={3} /></span>
     <span className="min-w-0 flex-1 px-2.5 py-2" style={{ backgroundColor: palette.header }}>
      <strong className="block truncate text-xs font-black uppercase leading-none text-black">{label}</strong>
      <span className="mt-1 block truncate text-[9px] font-bold text-black/60">{detail}</span>
     </span>
     <span className="flex w-7 shrink-0 items-center justify-center text-sm font-black transition-transform group-hover:translate-x-0.5">→</span>
    </a>
   )})}
  </div>
 </div>
)
