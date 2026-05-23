import React from "react"
import { Blocks, FolderTree, Layers, Sparkles, Workflow } from "lucide-react"
import {
 MainToolbox,
 PillList,
 SectionCard,
 SourceFrame,
} from "./ReferenceStudioPrimitives"
import { SourceHeaderIcons, useAllSourceModules } from "./sourceModules"

const sectionCAndE = {
 Controls: ["analytics protocol", "viral passing", "hook architect", "02 buttons"],
 Inputs: ["05 channel url + category + daily stats", "thumbnail studio"],
 Navigation: ["13 sidebar nav", "storyboard planner"],
 "Feedback/Status": ["audience matrix", "retention pulse", "09 six KPI cards"],
 "Cards/Media": ["22 video cards + status pills", "asset vault", "media analyzer"],
 "Dialogs/Popups": ["17 hover tooltip", "18 modal dialog"],
 "Trees/Structure": ["14 collapsible tree", "toolbox baseline vault module"],
}

const toolboxSet = {
 Controls: ["single button collection", "toggle + color picker stack", "graphic minimalist + cinematic buttons"],
 Inputs: ["multiline + editable text fields", "sliders + loading circles + progress rings"],
 Navigation: ["horizontal stepper + timeline", "pagination"],
 "Feedback/Status": ["download/upload/storage meters", "low/mid/high meters"],
 "Cards/Media": ["checker + avatars", "swatches", "tags/chips/separators", "JDMKRS overlap circles"],
 "Dialogs/Popups": ["what is this", "how does it work", "dividers", "marquee"],
 "Trees/Structure": ["accordion menu structure"],
}

const shim = {
 Controls: ["complex controls toolbox", "tactile hardware toolbox"],
 Inputs: ["hook retention controls", "hover me action"],
 Navigation: ["console dashboard controls"],
 "Feedback/Status": ["pink loading bar", "live status", "system operational"],
 "Cards/Media": ["4-unit matrix", "2-unit media strip"],
 "Dialogs/Popups": ["hover popup", "modal popup"],
 "Trees/Structure": ["console section structure"],
}

const ustube = {
 Controls: ["analytics toolbox", "algorithm architect", "keyword research", "strategy chat"],
 Inputs: ["4 input fields", "drag-resize description", "sliders", "toggles"],
 Navigation: ["video manager box", "content calendar"],
 "Feedback/Status": ["loading bars/circles/dots", "dialog + notifications"],
 "Cards/Media": ["impressions trend", "views histogram", "revenue distribution", "performance bin"],
 "Dialogs/Popups": ["hover tip", "open modal", "notification actions"],
 "Trees/Structure": ["tasks + channel goals"],
}

const CategoryBucket: React.FC<{
 title: string
 subtitle: string
 scopeId: string
 icon: React.ReactNode
 headerColor: string
 items: string[]
 children: React.ReactNode
}> = ({ title, subtitle, scopeId, icon, headerColor, items, children }) => (
 <SectionCard
  title={title}
  subtitle={subtitle}
  scopeId={scopeId}
  icon={icon}
  headerColor={headerColor}
  collapsible
  isOpenInitial={false}
  contentClassName="p-4 md:p-5 flex-1 flex flex-col gap-4 min-h-[300px]">
  <PillList items={items} />
  <div className="border-[3px] border-black rounded-xl p-4 bg-white min-h-[220px]">{children}</div>
 </SectionCard>
)

const SectionSourcesLab: React.FC = () => {
 const { sectionCE, toolboxSet: setOne, shim: shimSet, ustube: ustubeSet } =
  useAllSourceModules()

 return (
  <div className="w-full max-w-[1450px] mx-auto pb-24">
   <MainToolbox
    title="SECTION SOURCES LAB"
    subtitle="4-source intake, traceability, and interaction-preserving extraction workspace"
    icon={<FolderTree size={40} strokeWidth={2.8} className="text-black" />}
   headerColor="bg-[#24D3FF]"
   iconBoxColor="bg-[#CCFF00]"
   scopeId="section-ce-root"
   defaultOpen={false}>
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
     <CategoryBucket scopeId="section-ce-controls" title="Section C + E · Controls" subtitle="source-scoped extracted controls" headerColor="bg-[#FFB158]" icon={SourceHeaderIcons.sectionCE} items={sectionCAndE.Controls}>{sectionCE.controls}</CategoryBucket>
     <CategoryBucket scopeId="section-ce-inputs" title="Section C + E · Inputs" subtitle="source-scoped input modules" headerColor="bg-[#FFB158]" icon={<Layers size={20} strokeWidth={2.6} className="text-black" />} items={sectionCAndE.Inputs}>{sectionCE.inputs}</CategoryBucket>
     <CategoryBucket scopeId="section-ce-navigation" title="Section C + E · Navigation" subtitle="sidebar + route navigation extraction" headerColor="bg-[#FFB158]" icon={<Layers size={20} strokeWidth={2.6} className="text-black" />} items={sectionCAndE.Navigation}>{sectionCE.navigation}</CategoryBucket>
     <CategoryBucket scopeId="section-ce-feedback" title="Section C + E · Feedback/Status" subtitle="kpi/status response modules" headerColor="bg-[#FFB158]" icon={<Layers size={20} strokeWidth={2.6} className="text-black" />} items={sectionCAndE["Feedback/Status"]}>{sectionCE.feedback}</CategoryBucket>
     <CategoryBucket scopeId="section-ce-cards" title="Section C + E · Cards/Media" subtitle="video cards + status pills" headerColor="bg-[#FFB158]" icon={<Layers size={20} strokeWidth={2.6} className="text-black" />} items={sectionCAndE["Cards/Media"]}>{sectionCE.cardsMedia}</CategoryBucket>
     <CategoryBucket scopeId="section-ce-dialogs" title="Section C + E · Dialogs/Popups" subtitle="hover + modal extraction" headerColor="bg-[#FFB158]" icon={<Layers size={20} strokeWidth={2.6} className="text-black" />} items={sectionCAndE["Dialogs/Popups"]}>{sectionCE.dialogs}</CategoryBucket>
     <CategoryBucket scopeId="section-ce-trees" title="Section C + E · Trees/Structure" subtitle="collapsible tree extraction" headerColor="bg-[#FFB158]" icon={<Layers size={20} strokeWidth={2.6} className="text-black" />} items={sectionCAndE["Trees/Structure"]}>{sectionCE.trees}</CategoryBucket>
     <SectionCard scopeId="section-ce-preview" title="Section C + E · Source Preview" subtitle="reference library page preview" headerColor="bg-[#FFE357]" icon={<Workflow size={20} strokeWidth={2.6} className="text-black" />} collapsible isOpenInitial={false} contentClassName="p-4 md:p-5 min-h-[300px]">
      <SourceFrame src="/reference-studio/library" title="Reference Studio · Library" heightClassName="h-[560px]" />
     </SectionCard>
    </div>
   </MainToolbox>

   <MainToolbox
    title="TOOLBOX_COMPONENT_SET_1 INGEST"
    subtitle="display, feedback, controls, and button systems extracted from toolbox_component_set_1.html"
    icon={<Blocks size={40} strokeWidth={2.8} className="text-black" />}
   headerColor="bg-[#CCFF00]"
   iconBoxColor="bg-[#24D3FF]"
   scopeId="set1-root"
   defaultOpen={false}>
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
     <CategoryBucket scopeId="set1-controls" title="Set 1 · Controls" subtitle="button/action families" headerColor="bg-[#24D3FF]" icon={SourceHeaderIcons.toolboxSet} items={toolboxSet.Controls}>{setOne.controls}</CategoryBucket>
     <CategoryBucket scopeId="set1-inputs" title="Set 1 · Inputs" subtitle="text/slider/edit-field modules" headerColor="bg-[#24D3FF]" icon={<Sparkles size={20} strokeWidth={2.6} className="text-black" />} items={toolboxSet.Inputs}>{setOne.inputs}</CategoryBucket>
     <CategoryBucket scopeId="set1-navigation" title="Set 1 · Navigation" subtitle="stepper/timeline/pagination" headerColor="bg-[#24D3FF]" icon={<Sparkles size={20} strokeWidth={2.6} className="text-black" />} items={toolboxSet.Navigation}>{setOne.navigation}</CategoryBucket>
     <CategoryBucket scopeId="set1-feedback" title="Set 1 · Feedback/Status" subtitle="meters/loading/progress" headerColor="bg-[#24D3FF]" icon={<Sparkles size={20} strokeWidth={2.6} className="text-black" />} items={toolboxSet["Feedback/Status"]}>{setOne.feedback}</CategoryBucket>
     <CategoryBucket scopeId="set1-cards" title="Set 1 · Cards/Media" subtitle="display chips/avatars/overlap cards" headerColor="bg-[#24D3FF]" icon={<Sparkles size={20} strokeWidth={2.6} className="text-black" />} items={toolboxSet["Cards/Media"]}>{setOne.cardsMedia}</CategoryBucket>
     <CategoryBucket scopeId="set1-dialogs" title="Set 1 · Dialogs/Popups" subtitle="accordion and tooltip interactions" headerColor="bg-[#24D3FF]" icon={<Sparkles size={20} strokeWidth={2.6} className="text-black" />} items={toolboxSet["Dialogs/Popups"]}>{setOne.dialogs}</CategoryBucket>
     <CategoryBucket scopeId="set1-trees" title="Set 1 · Trees/Structure" subtitle="structure/divider systems" headerColor="bg-[#24D3FF]" icon={<Sparkles size={20} strokeWidth={2.6} className="text-black" />} items={toolboxSet["Trees/Structure"]}>{setOne.trees}</CategoryBucket>
     <SectionCard scopeId="set1-preview" title="Set 1 · Source Preview" subtitle="local authoritative source file" headerColor="bg-[#FF7497]" icon={<FolderTree size={20} strokeWidth={2.6} className="text-black" />} collapsible isOpenInitial={false} contentClassName="p-4 md:p-5 min-h-[300px]">
      <SourceFrame src="/toolbox_component_set_1.html" title="toolbox_component_set_1.html" heightClassName="h-[560px]" />
     </SectionCard>
    </div>
   </MainToolbox>

   <MainToolbox
    title="SHIM INGEST"
    subtitle="operational widgets, tactile controls, and console dashboards from shim.html"
    icon={<Workflow size={40} strokeWidth={2.8} className="text-black" />}
   headerColor="bg-[#FF7497]"
   iconBoxColor="bg-[#FFE357]"
   scopeId="shim-root"
   defaultOpen={false}>
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
     <CategoryBucket scopeId="shim-controls" title="Shim · Controls" subtitle="complex controls toolbox" headerColor="bg-[#FFE357]" icon={SourceHeaderIcons.shim} items={shim.Controls}>{shimSet.controls}</CategoryBucket>
     <CategoryBucket scopeId="shim-inputs" title="Shim · Inputs" subtitle="hook retention input modules" headerColor="bg-[#FFE357]" icon={<Layers size={20} strokeWidth={2.6} className="text-black" />} items={shim.Inputs}>{shimSet.inputs}</CategoryBucket>
     <CategoryBucket scopeId="shim-navigation" title="Shim · Navigation" subtitle="console route controls" headerColor="bg-[#FFE357]" icon={<Layers size={20} strokeWidth={2.6} className="text-black" />} items={shim.Navigation}>{shimSet.navigation}</CategoryBucket>
     <CategoryBucket scopeId="shim-feedback" title="Shim · Feedback/Status" subtitle="loading/status system modules" headerColor="bg-[#FFE357]" icon={<Layers size={20} strokeWidth={2.6} className="text-black" />} items={shim["Feedback/Status"]}>{shimSet.feedback}</CategoryBucket>
     <CategoryBucket scopeId="shim-cards" title="Shim · Cards/Media" subtitle="matrix/media strip modules" headerColor="bg-[#FFE357]" icon={<Layers size={20} strokeWidth={2.6} className="text-black" />} items={shim["Cards/Media"]}>{shimSet.cardsMedia}</CategoryBucket>
     <CategoryBucket scopeId="shim-dialogs" title="Shim · Dialogs/Popups" subtitle="hover/modal interactions" headerColor="bg-[#FFE357]" icon={<Layers size={20} strokeWidth={2.6} className="text-black" />} items={shim["Dialogs/Popups"]}>{shimSet.dialogs}</CategoryBucket>
     <CategoryBucket scopeId="shim-trees" title="Shim · Trees/Structure" subtitle="section structure mapping" headerColor="bg-[#FFE357]" icon={<Layers size={20} strokeWidth={2.6} className="text-black" />} items={shim["Trees/Structure"]}>{shimSet.trees}</CategoryBucket>
     <SectionCard scopeId="shim-preview" title="Shim · Source Preview" subtitle="shim.html preview" headerColor="bg-[#24D3FF]" icon={<FolderTree size={20} strokeWidth={2.6} className="text-black" />} collapsible isOpenInitial={false} contentClassName="p-4 md:p-5 min-h-[300px]">
      <SourceFrame src="/shim.html" title="shim.html" heightClassName="h-[560px]" />
     </SectionCard>
    </div>
   </MainToolbox>

   <MainToolbox
    title="USTUBE UI KIT INGEST"
    subtitle="external source import mirrored in public/reference-studio-sources"
    icon={<Sparkles size={40} strokeWidth={2.8} className="text-black" />}
   headerColor="bg-[#FFE357]"
   iconBoxColor="bg-[#FFB158]"
   scopeId="ustube-root"
   defaultOpen={false}>
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
     <CategoryBucket scopeId="ustube-controls" title="UStube · Controls" subtitle="analytics/algorithm/keyword/strategy modules" headerColor="bg-[#FFB158]" icon={SourceHeaderIcons.ustube} items={ustube.Controls}>{ustubeSet.controls}</CategoryBucket>
     <CategoryBucket scopeId="ustube-inputs" title="UStube · Inputs" subtitle="input fields + sliders/toggles" headerColor="bg-[#FFB158]" icon={<Blocks size={20} strokeWidth={2.6} className="text-black" />} items={ustube.Inputs}>{ustubeSet.inputs}</CategoryBucket>
     <CategoryBucket scopeId="ustube-navigation" title="UStube · Navigation" subtitle="video manager/calendar modules" headerColor="bg-[#FFB158]" icon={<Blocks size={20} strokeWidth={2.6} className="text-black" />} items={ustube.Navigation}>{ustubeSet.navigation}</CategoryBucket>
     <CategoryBucket scopeId="ustube-feedback" title="UStube · Feedback/Status" subtitle="loading/dialog/notification modules" headerColor="bg-[#FFB158]" icon={<Blocks size={20} strokeWidth={2.6} className="text-black" />} items={ustube["Feedback/Status"]}>{ustubeSet.feedback}</CategoryBucket>
     <CategoryBucket scopeId="ustube-cards" title="UStube · Cards/Media" subtitle="trend/histogram/distribution bins" headerColor="bg-[#FFB158]" icon={<Blocks size={20} strokeWidth={2.6} className="text-black" />} items={ustube["Cards/Media"]}>{ustubeSet.cardsMedia}</CategoryBucket>
     <CategoryBucket scopeId="ustube-dialogs" title="UStube · Dialogs/Popups" subtitle="hover tips + modal + alerts" headerColor="bg-[#FFB158]" icon={<Blocks size={20} strokeWidth={2.6} className="text-black" />} items={ustube["Dialogs/Popups"]}>{ustubeSet.dialogs}</CategoryBucket>
     <CategoryBucket scopeId="ustube-trees" title="UStube · Trees/Structure" subtitle="tasks/goals structure extraction" headerColor="bg-[#FFB158]" icon={<Blocks size={20} strokeWidth={2.6} className="text-black" />} items={ustube["Trees/Structure"]}>{ustubeSet.trees}</CategoryBucket>
     <SectionCard scopeId="ustube-preview" title="UStube · Source Preview" subtitle="mirrored file for stable in-app iframe rendering" headerColor="bg-[#24D3FF]" icon={<FolderTree size={20} strokeWidth={2.6} className="text-black" />} collapsible isOpenInitial={false} contentClassName="p-4 md:p-5 min-h-[300px]">
      <SourceFrame src="/reference-studio-sources/ustube-ui-kit-3.html" title="ustube-ui-kit (3).html" heightClassName="h-[560px]" />
     </SectionCard>
    </div>
   </MainToolbox>
  </div>
 )
}

export default SectionSourcesLab
