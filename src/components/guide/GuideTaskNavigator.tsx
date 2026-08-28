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

const TASKS = [
 { label: "Connect my channel", detail: "Account + Google authorization", href: "#guide-connect", icon: Gauge, className: "bg-[#CCFF00]" },
 { label: "Find a metric", detail: "Definitions, sources, aliases", href: "#metrics", icon: Search, className: "bg-[#FFB86B]" },
 { label: "Find a dataset", detail: "VT-SYNC tables + ownership", href: "#datasets", icon: Database, className: "bg-[#40C6E9]" },
 { label: "Understand performance", detail: "Analytics + Intelligence", href: "#guide-analytics", icon: BarChart3, className: "bg-[#40C6E9]" },
 { label: "Plan a video", detail: "Projects, ideas, hooks, storyboards", href: "#guide-create", icon: Lightbulb, className: "bg-[#FF8AAF]" },
 { label: "Use AI Brain", detail: "Channel-grounded analysis", href: "#create", icon: WandSparkles, className: "bg-[#FF8AAF]" },
 { label: "Work with comments", detail: "Audience + engagement tools", href: "#widgets", icon: MessageSquareText, className: "bg-[#72E6B1]" },
 { label: "Edit a video", detail: "Timeline, clips, transitions", href: "#guide-editor", icon: Film, className: "bg-[#FFD84D]" },
 { label: "Publish a video", detail: "Packaging + metadata", href: "#guide-publish", icon: Upload, className: "bg-[#B79CFF]" },
 { label: "Fix a problem", detail: "Connection → data → tool → render", href: "#guide-help", icon: CircleHelp, className: "bg-[#E5E7EB]" },
] as const

export const GuideTaskNavigator: React.FC = () => (
 <div className="overflow-hidden rounded-2xl border-[4px] border-black bg-white shadow-[6px_6px_0_0_#000]">
  <div className="border-b-[4px] border-black bg-black px-4 py-3 text-white">
   <p className="text-[10px] font-black uppercase tracking-[.18em] text-white/60">Task navigator</p>
   <h3 className="text-xl font-black uppercase">I want to...</h3>
  </div>
  <div className="grid sm:grid-cols-2 xl:grid-cols-5">
   {TASKS.map(({ label, detail, href, icon: Icon, className }) => (
    <a
     key={label}
     href={href}
     className={`group min-w-0 border-b-[3px] border-black p-4 transition-transform hover:-translate-y-0.5 sm:[&:nth-last-child(-n+2)]:border-b-0 xl:border-b-0 xl:border-r-[3px] xl:last:border-r-0 ${className}`}
    >
     <div className="flex items-start justify-between gap-3">
      <Icon size={22} strokeWidth={3} />
      <span className="text-lg font-black">→</span>
     </div>
     <strong className="mt-5 block text-base font-black uppercase leading-none">{label}</strong>
     <span className="mt-2 block text-[11px] font-bold leading-snug text-black/60">{detail}</span>
    </a>
   ))}
  </div>
 </div>
)
