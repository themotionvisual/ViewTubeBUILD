import React from "react"
import { ClipboardCheck, Network, Workflow } from "lucide-react"
import { MainToolbox, SectionCard } from "./ReferenceStudioPrimitives"
import {
 formatCompactNumber,
 formatCurrency,
 useCanonicalAnalytics,
} from "./useCanonicalAnalytics"
import {
 CHART_CARD_DEFINITIONS,
 CREATIVE_CHART_VARIANTS_40,
 ChartRendererSurface,
 getSpanClassForChartSize,
} from "./chartSystem"

const ChartSpecImplementation: React.FC = () => {
 const analytics = useCanonicalAnalytics("28d")
 const { summary } = analytics

 return (
  <div className="w-full max-w-[1450px] mx-auto pb-24">
   <MainToolbox
    title="CHART SPEC IMPLEMENTATION"
    subtitle="canonical implementations for COMPLETE_CHART_SPECIFICATION classes bound to 28d selector data"
    icon={<ClipboardCheck size={40} strokeWidth={2.8} className="text-black" />}
    headerColor="bg-[#CCFF00]"
    iconBoxColor="bg-[#24D3FF]"
    defaultOpen={false}>
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
     <SectionCard
      title="Spec Coverage"
      subtitle="29/29 classes implemented via explicit key-to-renderer mapping"
      headerColor="bg-[#24D3FF]"
      icon={<Workflow size={20} strokeWidth={2.6} className="text-black" />}>
      <div className="grid grid-cols-1 gap-2 max-h-[520px] overflow-y-auto pr-1">
       {CHART_CARD_DEFINITIONS.map((card) => (
        <div
         key={card.key}
         className="h-8 px-3 border-[2px] border-black rounded-lg bg-white flex items-center justify-between text-[10px] font-black uppercase tracking-[0.1em]">
         <span>{card.title}</span>
         <span className="opacity-50">{card.size}</span>
        </div>
       ))}
      </div>
     </SectionCard>

     <SectionCard
      title="Canonical 28D Metrics"
      subtitle="single-source metric panel used by all spec renderers"
      headerColor="bg-[#FFE357]"
      icon={<Network size={20} strokeWidth={2.6} className="text-black" />}>
      <div className="grid grid-cols-2 gap-3">
       <div className="border-[3px] border-black rounded-xl p-3 bg-white">
        <p className="text-[10px] font-black uppercase opacity-50">Views</p>
        <p className="text-2xl font-[1000]">{formatCompactNumber(summary.totals.views)}</p>
       </div>
       <div className="border-[3px] border-black rounded-xl p-3 bg-white">
        <p className="text-[10px] font-black uppercase opacity-50">Watch Hrs</p>
        <p className="text-2xl font-[1000]">{formatCompactNumber(summary.totals.watchHours)}</p>
       </div>
       <div className="border-[3px] border-black rounded-xl p-3 bg-white">
        <p className="text-[10px] font-black uppercase opacity-50">Subs +</p>
        <p className="text-2xl font-[1000]">{formatCompactNumber(summary.totals.subscribersGained)}</p>
       </div>
       <div className="border-[3px] border-black rounded-xl p-3 bg-white">
        <p className="text-[10px] font-black uppercase opacity-50">Revenue</p>
        <p className="text-2xl font-[1000]">{formatCurrency(summary.totals.revenue)}</p>
       </div>
      </div>
      <div className="border-[3px] border-black rounded-xl p-3 bg-white">
       <p className="text-[10px] font-black uppercase opacity-50 mb-2">Adapter Contract</p>
       <p className="text-xs font-bold leading-relaxed">
        All classes map from canonical selectors only: <code>getMasterRows("28d", "api")</code> +{" "}
        <code>getMetricSummary("28d", "api")</code>. No random datasets and no index-based renderer switching.
       </p>
      </div>
     </SectionCard>

     <SectionCard
      title="Spec Notes"
      subtitle="mixed card widths (full/half/third) and deterministic fallback adapters"
      headerColor="bg-[#FF7497]"
      icon={<ClipboardCheck size={20} strokeWidth={2.6} className="text-black" />}>
      <ul className="space-y-2 text-xs font-bold list-none">
       <li className="border-[2px] border-black rounded-lg p-2 bg-white">No dashed or dotted grid/cursor lines are used in any catalog/spec renderer.</li>
       <li className="border-[2px] border-black rounded-lg p-2 bg-white">Geo/Map classes use deterministic canonical-derived regional fallback when country dimensions are absent.</li>
       <li className="border-[2px] border-black rounded-lg p-2 bg-white">Cards span full/half/third based on readability, while preserving Toolbox shell styling.</li>
       <li className="border-[2px] border-black rounded-lg p-2 bg-white">
        Creative bank live: {CREATIVE_CHART_VARIANTS_40.length} alternate chart variants available in Chart Catalog.
       </li>
      </ul>
     </SectionCard>
    </div>
   </MainToolbox>

   <MainToolbox
    title="SPEC CLASS GRID"
    subtitle="one canonical chart instance per requested class via explicit mapping"
    icon={<Network size={40} strokeWidth={2.8} className="text-black" />}
    headerColor="bg-[#24D3FF]"
    iconBoxColor="bg-[#FFE357]"
    defaultOpen={false}>
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
     {CHART_CARD_DEFINITIONS.map((card) => (
      <SectionCard
       key={card.key}
       title={card.title}
       subtitle={card.note}
       headerColor="bg-[#FFB158]"
       icon={<ClipboardCheck size={18} strokeWidth={2.5} className="text-black" />}
       wrapperClassName={getSpanClassForChartSize(card.size)}>
       <div className="h-[300px] border-[3px] border-black rounded-xl bg-white p-2">
        <ChartRendererSurface card={card} analytics={analytics} />
       </div>
      </SectionCard>
     ))}
    </div>
   </MainToolbox>
  </div>
 )
}

export default ChartSpecImplementation
