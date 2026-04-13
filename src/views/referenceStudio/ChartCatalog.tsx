import React from "react"
import { BarChart3, Network, PieChartIcon, TrendingUp } from "lucide-react"
import { MainToolbox, SectionCard } from "./ReferenceStudioPrimitives"
import { useCanonicalAnalytics } from "./useCanonicalAnalytics"
import {
 CREATIVE_CHART_VARIANTS_40,
 CHART_CATALOG_GROUPS,
 ChartRendererSurface,
 chartCardFromVariant,
 getChartCardByKey,
 getSpanClassForChartSize,
} from "./chartSystem"

const GROUP_ICON_MAP: Record<string, React.ReactNode> = {
 "Trend + Sequence": <TrendingUp size={20} strokeWidth={2.6} className="text-black" />,
 "Compare + Composition": <BarChart3 size={20} strokeWidth={2.6} className="text-black" />,
 "Distribution + Mix": <PieChartIcon size={20} strokeWidth={2.6} className="text-black" />,
 "Structure + Flow": <Network size={20} strokeWidth={2.6} className="text-black" />,
 "Domain-Specific": <BarChart3 size={20} strokeWidth={2.6} className="text-black" />,
}

const ChartCatalog: React.FC = () => {
 const analytics = useCanonicalAnalytics("28d")

 return (
  <div className="w-full max-w-[1450px] mx-auto pb-24">
  {CHART_CATALOG_GROUPS.map((group, index) => (
    <MainToolbox
     key={group.title}
     title={`CHART CATALOG · ${group.title.toUpperCase()}`}
     subtitle="all charts in this catalog are sourced from canonical analytics selectors (28d default window)"
     icon={GROUP_ICON_MAP[group.title]}
     headerColor={index % 2 === 0 ? "bg-[#CCFF00]" : "bg-[#24D3FF]"}
     iconBoxColor={index % 2 === 0 ? "bg-[#24D3FF]" : "bg-[#FFE357]"}
     defaultOpen={false}>
     <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
      {group.keys.map((key) => {
       const card = getChartCardByKey(key)
       return (
        <SectionCard
         key={card.key}
         title={card.title}
         subtitle={card.note}
         headerColor="bg-[#FFB158]"
         icon={<BarChart3 size={18} strokeWidth={2.5} className="text-black" />}
         wrapperClassName={getSpanClassForChartSize(card.size)}>
         <div className="h-[300px] border-[3px] border-black rounded-xl bg-white p-2">
          <ChartRendererSurface card={card} analytics={analytics} />
         </div>
        </SectionCard>
       )
      })}
     </div>
   </MainToolbox>
  ))}

   <MainToolbox
    title="CHART CATALOG · CREATIVE VARIANT LAB (40)"
    subtitle="expanded 40-chart option bank for selection before canonical standardization"
    icon={<PieChartIcon size={20} strokeWidth={2.6} className="text-black" />}
    headerColor="bg-[#B14AED]"
    iconBoxColor="bg-[#CCFF00]"
    defaultOpen={false}>
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
     {CREATIVE_CHART_VARIANTS_40.map((variant) => {
      const card = chartCardFromVariant(variant)
      return (
       <SectionCard
        key={variant.id}
        title={`${variant.label}`}
        subtitle={`Variant ${variant.id.toUpperCase()} · ${variant.readiness}`}
        headerColor="bg-[#24D3FF]"
        icon={<BarChart3 size={18} strokeWidth={2.5} className="text-black" />}
        wrapperClassName={getSpanClassForChartSize(card.size)}>
        <div className="h-[260px] border-[3px] border-black rounded-xl bg-white p-2">
         <ChartRendererSurface card={card} analytics={analytics} />
        </div>
       </SectionCard>
      )
     })}
    </div>
   </MainToolbox>
  </div>
 )
}

export default ChartCatalog
