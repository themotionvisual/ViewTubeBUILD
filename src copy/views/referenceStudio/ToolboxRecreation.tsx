import React from "react"
import {
 Activity,
 BarChart3,
 LayoutDashboard,
 Sparkles,
} from "lucide-react"
import {
 MainToolbox,
 MetricTile,
 SectionCard,
} from "./ReferenceStudioPrimitives"
import {
 formatCompactNumber,
 formatCurrency,
 useCanonicalAnalytics,
} from "./useCanonicalAnalytics"
import { SourceUtilityModules, useAllSourceModules } from "./sourceModules"

const ToolboxRecreation: React.FC = () => {
 const { summary, topRows, timelineSeries } = useCanonicalAnalytics("28d")
 const { sectionCE, toolboxSet, shim, ustube } = useAllSourceModules()

 const latestRows = topRows.slice(0, 6)
 const lastTimeline = timelineSeries.slice(-10)

 return (
  <div className="w-full max-w-[1450px] mx-auto pb-24">
   <MainToolbox
    title="DASHBOARD RECREATION"
    subtitle="overview cards + quick actions + compact intelligence modules"
    icon={<LayoutDashboard size={40} strokeWidth={2.8} className="text-black" />}
    headerColor="bg-[#24D3FF]"
    iconBoxColor="bg-[#FFE357]"
    defaultOpen={false}>
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
     <SectionCard
      title="Quick Actions"
      subtitle="primary dashboard controls"
      headerColor="bg-[#FFB158]"
      icon={<Sparkles size={20} strokeWidth={2.6} className="text-black" />}>
      <div className="space-y-3">
       <div className="border-[3px] border-black rounded-xl p-3 bg-white">{toolboxSet.controls}</div>
       <div className="border-[3px] border-black rounded-xl p-3 bg-white">{sectionCE.feedback}</div>
      </div>
     </SectionCard>

     <SectionCard
      title="Latest Assets"
      subtitle="top videos (28d canonical)"
      headerColor="bg-[#FF7497]"
      icon={<Activity size={20} strokeWidth={2.6} className="text-black" />}>
      <div className="space-y-2">
       {latestRows.map((row) => (
        <div
         key={row.id}
         className="h-12 px-3 border-[3px] border-black rounded-xl bg-white flex items-center justify-between">
         <span className="text-xs font-black uppercase tracking-[0.08em] truncate max-w-[60%]">
          {row.title}
         </span>
         <span className="text-xs font-black opacity-70">
          {formatCompactNumber(row.views)} views
         </span>
        </div>
       ))}
      </div>
     </SectionCard>
    </div>
   </MainToolbox>

   <MainToolbox
    title="STUDIO RECREATION"
    subtitle="creation flow controls, inputs, and modal interactions"
    icon={<Sparkles size={40} strokeWidth={2.8} className="text-black" />}
    headerColor="bg-[#FF7497]"
    iconBoxColor="bg-[#FFE357]"
    defaultOpen={false}>
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
     <SectionCard
      title="Creator Controls"
      subtitle="input + command stack"
      headerColor="bg-[#FFE357]"
      icon={<Sparkles size={20} strokeWidth={2.6} className="text-black" />}>
      <div className="space-y-3">
       <div className="border-[3px] border-black rounded-xl p-3 bg-white">{ustube.inputs}</div>
       <div className="border-[3px] border-black rounded-xl p-3 bg-white">{shim.dialogs}</div>
      </div>
     </SectionCard>

     <SectionCard
      title="Publisher + Cards"
      subtitle="upload/script/cards modules"
      headerColor="bg-[#24D3FF]"
      icon={<Activity size={20} strokeWidth={2.6} className="text-black" />}>
      <div className="space-y-3">
       <div className="border-[3px] border-black rounded-xl p-3 bg-white">
        <SourceUtilityModules.PublisherUpload />
       </div>
       <div className="border-[3px] border-black rounded-xl p-3 bg-white">{sectionCE.cardsMedia}</div>
      </div>
     </SectionCard>
    </div>
   </MainToolbox>

   <MainToolbox
    title="PERFORMANCE RECREATION"
    subtitle="table + trend modules anchored to canonical selector outputs"
    icon={<BarChart3 size={40} strokeWidth={2.8} className="text-black" />}
    headerColor="bg-[#FFE357]"
    iconBoxColor="bg-[#24D3FF]"
    defaultOpen={false}>
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
     <SectionCard
      title="Trend Feed"
      subtitle="latest 10 timeline points"
      headerColor="bg-[#CCFF00]"
      icon={<Activity size={20} strokeWidth={2.6} className="text-black" />}>
      <div className="grid grid-cols-1 gap-2">
       {lastTimeline.map((point) => (
        <div
         key={point.date}
         className="h-11 px-3 border-[3px] border-black rounded-lg bg-white flex items-center justify-between text-[10px] font-black uppercase tracking-[0.08em]">
         <span>{point.date}</span>
         <span>{formatCompactNumber(point.views)} Views</span>
        </div>
       ))}
      </div>
     </SectionCard>

     <SectionCard
      title="Performance Modules"
      subtitle="status, tasks, and audience structures"
      headerColor="bg-[#FFB158]"
      icon={<BarChart3 size={20} strokeWidth={2.6} className="text-black" />}>
      <div className="space-y-3">
       <div className="border-[3px] border-black rounded-xl p-3 bg-white">{ustube.trees}</div>
       <div className="border-[3px] border-black rounded-xl p-3 bg-white">{shim.feedback}</div>
      </div>
     </SectionCard>
    </div>
   </MainToolbox>
  </div>
 )
}

export default ToolboxRecreation
