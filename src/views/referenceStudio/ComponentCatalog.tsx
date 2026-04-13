import React from "react"
import {
 Bell,
 Boxes,
 MousePointerClick,
 SlidersHorizontal,
 SplitSquareVertical,
 SquareStack,
 Workflow,
} from "lucide-react"
import { MainToolbox, SectionCard } from "./ReferenceStudioPrimitives"
import { SourceUtilityModules, useAllSourceModules } from "./sourceModules"

const paneClass = "border-[3px] border-black rounded-xl p-3 bg-white"

const ComponentCatalog: React.FC = () => {
 const { sectionCE, toolboxSet, shim, ustube } = useAllSourceModules()

 return (
  <div className="w-full max-w-[1450px] mx-auto pb-24">
   <MainToolbox
    title="COMPONENT CATALOG"
    subtitle="dense interactive index of non-chart components grouped by type with source-fidelity interactions"
    icon={<SquareStack size={40} strokeWidth={2.8} className="text-black" />}
    headerColor="bg-[#B14AED]"
    iconBoxColor="bg-[#CCFF00]"
    defaultOpen={false}>
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
     <SectionCard
      title="Controls + Buttons"
      subtitle="toggles, radios, checkboxes, action buttons, color systems"
      headerColor="bg-[#FFB158]"
      icon={<MousePointerClick size={22} strokeWidth={2.6} className="text-black" />}>
      <div className="space-y-3">
       <div className={paneClass}>{sectionCE.controls}</div>
       <div className={paneClass}>{toolboxSet.controls}</div>
       <div className={paneClass}>{shim.controls}</div>
       <div className={paneClass}>{ustube.controls}</div>
      </div>
     </SectionCard>

     <SectionCard
      title="Inputs + Editors"
      subtitle="fields, dropdowns, sliders, resizable description, add-input actions"
      headerColor="bg-[#24D3FF]"
      icon={<SlidersHorizontal size={22} strokeWidth={2.6} className="text-black" />}>
      <div className="space-y-3">
       <div className={paneClass}>{sectionCE.inputs}</div>
       <div className={paneClass}>{toolboxSet.inputs}</div>
       <div className={paneClass}>{shim.inputs}</div>
       <div className={paneClass}>{ustube.inputs}</div>
      </div>
     </SectionCard>

     <SectionCard
      title="Navigation + Structure"
      subtitle="sidebar, tree, stepper, timeline, pagination, content calendar"
      headerColor="bg-[#FFE357]"
      icon={<Workflow size={22} strokeWidth={2.6} className="text-black" />}>
      <div className="space-y-3">
       <div className={paneClass}>{sectionCE.navigation}</div>
       <div className={paneClass}>{toolboxSet.navigation}</div>
       <div className={paneClass}>{shim.navigation}</div>
       <div className={paneClass}>{ustube.navigation}</div>
       <div className={paneClass}>{sectionCE.trees}</div>
       <div className={paneClass}>{ustube.trees}</div>
      </div>
     </SectionCard>

     <SectionCard
      title="Feedback + Status"
      subtitle="loading states, meters, KPI modules, progress, notifications"
      headerColor="bg-[#FF7497]"
      icon={<Bell size={22} strokeWidth={2.6} className="text-black" />}>
      <div className="space-y-3">
       <div className={paneClass}>{sectionCE.feedback}</div>
       <div className={paneClass}>{toolboxSet.feedback}</div>
       <div className={paneClass}>{shim.feedback}</div>
       <div className={paneClass}>{ustube.feedback}</div>
      </div>
     </SectionCard>

     <SectionCard
      title="Cards + Media"
      subtitle="video cards, pills, overlap circles, matrix strips, media modules"
      headerColor="bg-[#CCFF00]"
      icon={<Boxes size={22} strokeWidth={2.6} className="text-black" />}>
      <div className="space-y-3">
       <div className={paneClass}>{sectionCE.cardsMedia}</div>
       <div className={paneClass}>{toolboxSet.cardsMedia}</div>
       <div className={paneClass}>{shim.cardsMedia}</div>
       <div className={paneClass}>{ustube.cardsMedia}</div>
      </div>
     </SectionCard>

     <SectionCard
      title="Dialogs + Popups"
      subtitle="hover tips, modal launchers, notifications, and popup contracts"
      headerColor="bg-[#FFB158]"
      icon={<SplitSquareVertical size={22} strokeWidth={2.6} className="text-black" />}>
      <div className="space-y-3">
       <div className={paneClass}>{sectionCE.dialogs}</div>
       <div className={paneClass}>{toolboxSet.dialogs}</div>
       <div className={paneClass}>{shim.dialogs}</div>
       <div className={paneClass}>{ustube.dialogs}</div>
      </div>
     </SectionCard>
    </div>
   </MainToolbox>

   <MainToolbox
    title="UNIFIED BEST-FIT SET"
    subtitle="subtoolbox-grid optimized baseline set preserving source interactions"
    icon={<SquareStack size={40} strokeWidth={2.8} className="text-black" />}
    headerColor="bg-[#FFE357]"
    iconBoxColor="bg-[#24D3FF]"
    defaultOpen={false}>
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
     <div className="border-[4px] border-black rounded-2xl bg-white p-4 shadow-[6px_6px_0px_0px_black]">
      <p className="text-[10px] font-black uppercase tracking-[0.12em] opacity-50 mb-2">Unified Input</p>
      <div className="border-[3px] border-black rounded-xl p-3">
       <SourceUtilityModules.FocusFields includeAddButton />
      </div>
     </div>

     <div className="border-[4px] border-black rounded-2xl bg-white p-4 shadow-[6px_6px_0px_0px_black]">
      <p className="text-[10px] font-black uppercase tracking-[0.12em] opacity-50 mb-2">Unified Action</p>
      <div className="border-[3px] border-black rounded-xl p-3">
       <SourceUtilityModules.ButtonSystem />
      </div>
     </div>

     <div className="border-[4px] border-black rounded-2xl bg-white p-4 shadow-[6px_6px_0px_0px_black]">
      <p className="text-[10px] font-black uppercase tracking-[0.12em] opacity-50 mb-2">Unified Feedback</p>
      <div className="border-[3px] border-black rounded-xl p-3">
       <SourceUtilityModules.LoadingStates />
      </div>
     </div>

     <div className="border-[4px] border-black rounded-2xl bg-white p-4 shadow-[6px_6px_0px_0px_black]">
      <p className="text-[10px] font-black uppercase tracking-[0.12em] opacity-50 mb-2">Unified Tasks</p>
      <div className="border-[3px] border-black rounded-xl p-3">
       <SourceUtilityModules.StrikeTaskList />
      </div>
     </div>

     <div className="border-[4px] border-black rounded-2xl bg-white p-4 shadow-[6px_6px_0px_0px_black]">
      <p className="text-[10px] font-black uppercase tracking-[0.12em] opacity-50 mb-2">Unified Sliders</p>
      <div className="border-[3px] border-black rounded-xl p-3">
       <SourceUtilityModules.SliderCluster />
      </div>
     </div>

     <div className="border-[4px] border-black rounded-2xl bg-white p-4 shadow-[6px_6px_0px_0px_black]">
      <p className="text-[10px] font-black uppercase tracking-[0.12em] opacity-50 mb-2">Unified Cards</p>
      <div className="border-[3px] border-black rounded-xl p-3">
       <SourceUtilityModules.VideoCardsLite />
      </div>
     </div>
    </div>
   </MainToolbox>
  </div>
 )
}

export default ComponentCatalog
