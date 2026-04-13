import React from "react"
import { LayoutGrid, Sparkles, Workflow, Wrench } from "lucide-react"
import { MainToolbox, PillList, SectionCard, SourceFrame } from "./ReferenceStudioPrimitives"
import { WIDGET_LAB_SPECS, type WidgetPromotionState } from "./widgetContracts"

const STATUS_STYLE: Record<WidgetPromotionState, string> = {
 prototype: "bg-[#FFE357]",
 "ready-for-prod": "bg-[#CCFF00]",
 "needs-backend": "bg-[#FF7497]",
}

const formatDeps = (deps: string[]) =>
 deps
  .map((dep) => dep.replaceAll("_", " ").toUpperCase())
  .filter(Boolean)

const WidgetLab: React.FC = () => {
 return (
  <div className="w-full max-w-[1450px] mx-auto pb-24">
   <MainToolbox
    title="WIDGET LAB"
    subtitle="dashboard widget r&d factory sourced from widget preview and staged for production promotion"
    icon={<LayoutGrid size={40} strokeWidth={2.8} className="text-black" />}
    headerColor="bg-[#B14AED]"
    iconBoxColor="bg-[#CCFF00]"
    defaultOpen={false}
    scopeId="widget-lab-root">
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
     <SectionCard
      title="Widget Pipeline"
      subtitle="stage flow from preview into production dashboard rollout"
      headerColor="bg-[#24D3FF]"
      icon={<Workflow size={20} strokeWidth={2.6} className="text-black" />}
      wrapperClassName="xl:col-span-1">
      <div className="space-y-3">
       <div className="border-[3px] border-black rounded-xl p-3 bg-white">
        <p className="text-[10px] font-black uppercase tracking-[0.12em] opacity-50 mb-2">
         Stage A
        </p>
        <p className="text-sm font-black">`widget-preview.html` to Widget Lab</p>
       </div>
       <div className="border-[3px] border-black rounded-xl p-3 bg-white">
        <p className="text-[10px] font-black uppercase tracking-[0.12em] opacity-50 mb-2">
         Stage B
        </p>
        <p className="text-sm font-black">Typed React widget modules + backend status contracts</p>
       </div>
       <div className="border-[3px] border-black rounded-xl p-3 bg-white">
        <p className="text-[10px] font-black uppercase tracking-[0.12em] opacity-50 mb-2">
         Stage C
        </p>
        <p className="text-sm font-black">Feature-flag rollout into live dashboard sections</p>
       </div>
      </div>
     </SectionCard>

     <SectionCard
      title="Widget Registry"
      subtitle="status, dependencies, and fallback strategy for each candidate widget"
      headerColor="bg-[#FFB158]"
      icon={<Wrench size={20} strokeWidth={2.6} className="text-black" />}
      wrapperClassName="xl:col-span-2">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-h-[540px] overflow-y-auto pr-1">
       {WIDGET_LAB_SPECS.map((widget) => (
        <article
         key={widget.id}
         className="border-[3px] border-black rounded-xl bg-white p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)]">
         <div className="flex items-center justify-between gap-2 mb-2">
          <h3 className="text-[14px] font-black uppercase tracking-[0.06em] leading-tight">
           {widget.title}
          </h3>
          <span
           className={`h-7 px-2 border-[2px] border-black rounded-lg text-[9px] font-black uppercase tracking-[0.12em] inline-flex items-center ${STATUS_STYLE[widget.status.state]}`}>
           {widget.status.state}
          </span>
         </div>
         <p className="text-[10px] font-black uppercase tracking-[0.12em] opacity-55 mb-2">
          {widget.category}
         </p>
         <PillList items={formatDeps(widget.status.dependencies)} />
         <p className="text-xs font-bold mt-2 leading-snug">{widget.status.notes}</p>
        </article>
       ))}
      </div>
     </SectionCard>
    </div>
   </MainToolbox>

   <MainToolbox
    title="WIDGET PREVIEW SOURCE SURFACE"
    subtitle="interactive source preview retained as idea-bank while typed components are promoted"
    icon={<Sparkles size={40} strokeWidth={2.8} className="text-black" />}
    headerColor="bg-[#CCFF00]"
    iconBoxColor="bg-[#24D3FF]"
    defaultOpen={false}
    scopeId="widget-source-surface">
    <SectionCard
     title="Source Preview"
     subtitle="widget-preview authoritative source"
     headerColor="bg-[#FFE357]"
     icon={<LayoutGrid size={18} strokeWidth={2.5} className="text-black" />}>
     <SourceFrame
      src="/widget-preview.html"
      title="widget-preview.html"
      heightClassName="h-[780px]"
     />
    </SectionCard>
   </MainToolbox>
  </div>
 )
}

export default WidgetLab
