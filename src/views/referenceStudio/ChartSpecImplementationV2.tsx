import React from "react"
import { ClipboardCheck, Network, Workflow } from "lucide-react"
import { Toolbox } from "../../components/Toolbox"
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

const ChartSpecImplementationV2: React.FC = () => {
 const analytics = useCanonicalAnalytics("28d")
 const { summary } = analytics

 return (
  <div className="w-full max-w-[1450px] mx-auto pb-24 space-y-16">
   <Toolbox
    variant="scaffold"
    title="CHART SPEC IMPLEMENTATION"
    subtitle="canonical implementations for COMPLETE_CHART_SPECIFICATION classes bound to 28d selector data"
    icon={<ClipboardCheck size={40} className="text-black" />}
    headerColor="bg-[#CCFF00]"
    iconBoxColor="bg-[#24D3FF]"
    collapsible
    indicator="symbols"
    isOpenInitial={true}>
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
     <Toolbox
      variant="sub"
      title="Spec Coverage"
      subtitle="29/29 classes implemented via explicit key-to-renderer mapping"
      headerColor="bg-[#24D3FF]"
      icon={<Workflow size={22} className="text-black" />}>
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
     </Toolbox>

     <Toolbox
      variant="sub"
      title="Canonical 28D Metrics"
      subtitle="single-source metric panel used by all spec renderers"
      headerColor="bg-[#FFE357]"
      icon={<Network size={22} className="text-black" />}>
      <div className="space-y-4">
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
            <code>getMetricSummary("28d", "api")</code>.
          </p>
        </div>
      </div>
     </Toolbox>

     <Toolbox
      variant="sub"
      title="Spec Notes"
      subtitle="mixed card widths (full/half/third) and deterministic fallback adapters"
      headerColor="bg-[#FF7497]"
      icon={<ClipboardCheck size={22} className="text-black" />}>
      <ul className="space-y-2 text-xs font-bold list-none">
       <li className="border-[2px] border-black rounded-lg p-2 bg-white">No dashed or dotted grid/cursor lines are used in any catalog/spec renderer.</li>
       <li className="border-[2px] border-black rounded-lg p-2 bg-white">Geo/Map classes use deterministic canonical-derived regional fallback.</li>
       <li className="border-[2px] border-black rounded-lg p-2 bg-white">Cards span full/half/third based on readability.</li>
       <li className="border-[2px] border-black rounded-lg p-2 bg-white">
        Creative bank live: {CREATIVE_CHART_VARIANTS_40.length} alternate chart variants.
       </li>
      </ul>
     </Toolbox>
    </div>
   </Toolbox>

   <Toolbox
    variant="scaffold"
    title="SPEC CLASS GRID"
    subtitle="one canonical chart instance per requested class via explicit mapping"
    icon={<Network size={40} className="text-black" />}
    headerColor="bg-[#24D3FF]"
    iconBoxColor="bg-[#FFE357]"
    collapsible
    indicator="symbols"
    isOpenInitial={true}>
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
     {CHART_CARD_DEFINITIONS.map((card) => (
      <Toolbox
       key={card.key}
       variant="sub"
       title={card.title}
       subtitle={card.note}
       headerColor="bg-[#FFB158]"
       icon={<ClipboardCheck size={20} className="text-black" />}
       outerClassName={getSpanClassForChartSize(card.size)}>
       <div className="h-[300px] border-[3px] border-black rounded-xl bg-white p-2">
        <ChartRendererSurface card={card} analytics={analytics} />
       </div>
      </Toolbox>
     ))}
    </div>
   </Toolbox>
  </div>
 )
}

export default ChartSpecImplementationV2
