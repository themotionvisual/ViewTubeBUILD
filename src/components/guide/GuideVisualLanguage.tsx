import React from "react"
import { AreaChart, BarChart3, CircleDot, Grid3X3, LineChart, Radar, Rows3, ScatterChart } from "lucide-react"

const LANG = [
 { title:"Position", icon:ScatterChart, example:"X / Y", text:"Position is usually the strongest quantitative encoding. Read the axes first, including units and scale." },
 { title:"Length", icon:BarChart3, example:"Bars", text:"Longer bars normally mean larger values. Compare from a shared baseline whenever possible." },
 { title:"Line", icon:LineChart, example:"Trend", text:"Read direction, slope, duration, and turning points. A line connects observations; it does not prove causation." },
 { title:"Area", icon:AreaChart, example:"Share", text:"Area can represent contribution or magnitude. In bubbles and mosaics, compare area—not diameter or width alone." },
 { title:"Color", icon:CircleDot, example:"Intensity", text:"Color may encode category, rank, or magnitude. Always check the legend before treating brighter as better." },
 { title:"Heat", icon:Grid3X3, example:"Matrix", text:"Heatmaps are best for patterns across rows and columns. Compare cells within the same scale." },
 { title:"Shape", icon:Radar, example:"Profile", text:"Radar and fingerprint shapes show normalized profiles. Their geometry is comparative, not a raw unit." },
 { title:"Stack", icon:Rows3, example:"Composition", text:"Stacks show both total size and composition. Read the whole first, then the contribution of each segment." },
]

export const GuideVisualLanguage:React.FC=()=>(
 <div className="rounded-2xl border-[4px] border-black bg-white p-4 shadow-[6px_6px_0_0_#000] sm:p-5">
  <div className="flex items-end justify-between gap-4">
   <div><p className="text-[10px] font-black uppercase tracking-[.18em] text-black/45">Before reading any chart</p><h3 className="text-2xl font-black uppercase leading-none">ViewTube visual language</h3></div>
   <span className="rounded-lg border-[3px] border-black bg-[#CCFF00] px-3 py-2 text-xs font-black uppercase">8 encodings</span>
  </div>
  <p className="mt-3 max-w-4xl text-sm font-bold leading-relaxed text-black/65">Every visualization is a combination of a few visual channels. Identify what position, length, area, color, and shape mean before interpreting the pattern.</p>
  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
   {LANG.map(({title,icon:Icon,example,text})=>(
    <article key={title} className="rounded-xl border-[3px] border-black bg-[#F7F7F7] p-3">
     <div className="flex items-center justify-between gap-2"><Icon size={20} strokeWidth={3}/><span className="rounded-md border-2 border-black bg-white px-2 py-1 text-[9px] font-black uppercase">{example}</span></div>
     <h4 className="mt-4 text-lg font-black uppercase">{title}</h4>
     <p className="mt-1 text-xs font-bold leading-relaxed text-black/65">{text}</p>
    </article>
   ))}
  </div>
  <div className="mt-4 rounded-xl border-[3px] border-black bg-[#FFF7A8] p-4 text-sm font-bold">
   <strong className="font-black uppercase">Rule:</strong> if a visual uses more than two encodings at once, change one control at a time. Otherwise you may see a different pattern without knowing which encoding caused the change.
  </div>
 </div>
)
