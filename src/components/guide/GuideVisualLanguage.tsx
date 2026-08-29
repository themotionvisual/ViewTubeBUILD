import React from "react"
import { AreaChart, BarChart3, CircleDot, Grid3X3, LineChart, Radar, Rows3, ScatterChart } from "lucide-react"
import { getToolboxPaletteColors } from "../../styles/toolboxPalette"

const visualLanguagePalette = getToolboxPaletteColors(8)

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
 <div className="rounded-[14px] border-[4px] border-black bg-white p-3 shadow-[4px_4px_0_0_#000]">
  <div className="flex items-end justify-between gap-4">
   <div><p className="text-[10px] font-black uppercase tracking-[.18em] text-black/45">Before reading any chart</p><h3 className="text-2xl font-black uppercase leading-none">ViewTube visual language</h3></div>
   <span className="rounded-md border-[3px] border-black px-2.5 py-1.5 text-[10px] font-black uppercase" style={{backgroundColor:visualLanguagePalette.header}}>8 encodings</span>
  </div>
  <p className="mt-2 max-w-4xl text-sm font-bold leading-snug text-black/65">Every visualization is a combination of a few visual channels. Identify what position, length, area, color, and shape mean before interpreting the pattern.</p>
  <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
   {LANG.map(({title,icon:Icon,example,text},index)=>{
    const palette=getToolboxPaletteColors(index)
    return <article key={title} className="overflow-hidden rounded-lg border-[3px] border-black bg-[#F7F7F7]">
     <div className="flex min-h-9 items-stretch border-b-[3px] border-black" style={{backgroundColor:palette.header}}><span className="flex w-10 items-center justify-center border-r-[3px] border-black text-black" style={{backgroundColor:palette.icon}}><Icon size={18} strokeWidth={3}/></span><h4 className="flex flex-1 items-center px-2 text-sm font-black uppercase">{title}</h4><span className="m-1 flex items-center rounded-md border-2 border-black bg-white px-1.5 text-[8px] font-black uppercase">{example}</span></div>
     <p className="p-2.5 text-[11px] font-bold leading-snug text-black/65">{text}</p>
    </article>
   })}
  </div>
  <div className="mt-3 rounded-lg border-[3px] border-black bg-[#FFF7A8] p-3 text-xs font-bold">
   <strong className="font-black uppercase">Rule:</strong> if a visual uses more than two encodings at once, change one control at a time. Otherwise you may see a different pattern without knowing which encoding caused the change.
  </div>
 </div>
)
