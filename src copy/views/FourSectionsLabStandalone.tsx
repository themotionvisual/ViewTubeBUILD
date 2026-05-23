import React, { useMemo } from "react"
import { FolderTree, Blocks, Workflow, Sparkles } from "lucide-react"
import { useAllSourceModules } from "./referenceStudio/sourceModules"
import { MainToolbox, SectionCard } from "./referenceStudio/ReferenceStudioPrimitives"

const FourSectionsLabStandalone: React.FC = () => {
 const { allContracts } = useAllSourceModules()

 // Helper to find and render specific modules by their defined IDs in sourceModules.tsx
 const getModule = (id: string) => {
  const mod = allContracts.find(m => m.id === id)
  if (!mod) return null
  return (
   <div key={mod.id} className="border-[3px] border-black rounded-xl bg-white p-3 shadow-[4px_4px_0px_0px_black] mb-4">
    <div className="text-[10px] font-black uppercase tracking-[0.14em] opacity-50 mb-3 pb-2 border-b-2 border-black/5">
     {mod.title}
    </div>
    {mod.render}
   </div>
  )
 }

 return (
  <div className="min-h-screen bg-[#f3f4f6] p-8 space-y-12">
   <header className="max-w-[1450px] mx-auto border-[5px] border-black bg-[#FFE357] p-8 rounded-3xl shadow-[10px_10px_0px_0px_black] flex flex-col items-center justify-center text-center">
    <h1 className="text-[60px] font-[1000] uppercase tracking-tighter leading-none mb-2">Four Sections Lab</h1>
    <p className="text-xl font-black uppercase tracking-widest opacity-60">Source-Fidelity Component Extraction · Standalone Isolation</p>
   </header>

   <div className="max-w-[1450px] mx-auto space-y-16 pb-32">
    {/* SECTION 1: REFERENCE STUDIO C & E */}
    <MainToolbox
     title="SECTION C + E"
     subtitle="Reference Studio Authority Modules"
     icon={<FolderTree size={40} strokeWidth={2.8} />}
     headerColor="bg-[#24D3FF]"
     iconBoxColor="bg-[#CCFF00]"
     defaultOpen={true}
     scopeId="standalone-ce"
    >
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <SectionCard title="Controls" headerColor="bg-[#FFB158]">
       {getModule("ce_analytics_protocol")}
       {getModule("ce_viral_passing")}
       {getModule("ce_hook_architect")}
       {getModule("ce_02_buttons")}
      </SectionCard>
      <SectionCard title="Inputs" headerColor="bg-[#24D3FF]">
       {getModule("ce_05_channel_stats")}
       {getModule("ce_thumbnail_studio")}
       {getModule("ce_daily_stats")}
      </SectionCard>
      <SectionCard title="Structure" headerColor="bg-[#FFE357]">
       {getModule("ce_13_sidebar")}
       {getModule("ce_14_tree")}
       {getModule("ce_vault_module")}
      </SectionCard>
      <SectionCard title="Feedback" headerColor="bg-[#FF7497]">
       {getModule("ce_audience_matrix")}
       {getModule("ce_retention_pulse")}
       {getModule("ce_09_kpis")}
      </SectionCard>
      <SectionCard title="Media" headerColor="bg-[#CCFF00]">
       {getModule("ce_22_video_cards")}
       {getModule("ce_asset_vault")}
       {getModule("ce_media_analyzer")}
      </SectionCard>
      <SectionCard title="Dialogs" headerColor="bg-[#FFB158]">
       {getModule("ce_17_tooltips")}
       {getModule("ce_18_modals")}
      </SectionCard>
     </div>
    </MainToolbox>

    {/* SECTION 2: TOOLBOX COMPONENTS SET 1 */}
    <MainToolbox
     title="COMPONENTS SET 1"
     subtitle="authoritative local HTML-derived set"
     icon={<Blocks size={40} strokeWidth={2.8} />}
     headerColor="bg-[#CCFF00]"
     iconBoxColor="bg-[#24D3FF]"
     defaultOpen={true}
     scopeId="standalone-set1"
    >
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <SectionCard title="Visuals + Avatars" headerColor="bg-[#FFB158]">
       {getModule("set1_avatars_swatches")}
       {getModule("set1_overlap_circles")}
       {getModule("set1_tags_chips")}
      </SectionCard>
      <SectionCard title="Interactions" headerColor="bg-[#24D3FF]">
       {getModule("set1_accordion_menu")}
       {getModule("set1_stepper_timeline")}
       {getModule("set1_pagination")}
      </SectionCard>
      <SectionCard title="Meters + Loaders" headerColor="bg-[#FF7497]">
       {getModule("set1_meters_storage")}
       {getModule("set1_rings_loaders")}
       {getModule("set1_loading_circles")}
      </SectionCard>
      <SectionCard title="Inputs + Text" headerColor="bg-[#00CCFF]">
       {getModule("set1_color_picker")}
       {getModule("set1_multiline_editable")}
      </SectionCard>
      <SectionCard title="Buttons" headerColor="bg-[#FFE357]">
       {getModule("set1_buttons_single")}
      </SectionCard>
     </div>
    </MainToolbox>

    {/* SECTION 3: SHIM.HTML */}
    <MainToolbox
     title="SHIM AUTHORITY"
     subtitle="tactile console and complex controller rigs"
     icon={<Workflow size={40} strokeWidth={2.8} />}
     headerColor="bg-[#FF7497]"
     iconBoxColor="bg-[#FFE357]"
     defaultOpen={true}
     scopeId="standalone-shim"
    >
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <SectionCard title="Status" headerColor="bg-[#CCFF00]">
       {getModule("shim_pink_loading_bar")}
       {getModule("shim_live_status")}
      </SectionCard>
      <SectionCard title="Control Rigs" headerColor="bg-[#24D3FF]">
       {getModule("shim_complex_controls")}
       {getModule("shim_tactile_hardware")}
      </SectionCard>
      <SectionCard title="Dashboard" headerColor="bg-[#FFE357]">
       {getModule("shim_console_matrix")}
       {getModule("shim_console_media_strip")}
      </SectionCard>
      <SectionCard title="Special" headerColor="#FFB158">
       {getModule("shim_hook_retention")}
       {getModule("shim_hover_me")}
      </SectionCard>
     </div>
    </MainToolbox>

    {/* SECTION 4: USTUBE-UI-KIT */}
    <MainToolbox
     title="USTUBE UI KIT"
     subtitle="external authority mirrored for reference"
     icon={<Sparkles size={40} strokeWidth={2.8} />}
     headerColor="bg-[#FFE357]"
     iconBoxColor="bg-[#FFB158]"
     defaultOpen={true}
     scopeId="standalone-ustube"
    >
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <SectionCard title="Analytics" headerColor="bg-[#FF7497]">
       {getModule("ustube_analytics_toolbox")}
       {getModule("ustube_algorithm_architect")}
       {getModule("ustube_keyword_research")}
       {getModule("ustube_strategy_chat")}
      </SectionCard>
      <SectionCard title="Data Viz" headerColor="bg-[#24D3FF]">
       {getModule("ustube_impressions_trend")}
       {getModule("ustube_views_histogram")}
       {getModule("ustube_revenue_distribution")}
       {getModule("ustube_performance_bin")}
       {getModule("ustube_ability_vectors")}
      </SectionCard>
      <SectionCard title="Inputs + Toggles" headerColor="bg-[#CCFF00]">
       {getModule("ustube_inputs_four")}
       {getModule("ustube_resizable_description")}
       {getModule("ustube_sliders_three")}
       {getModule("ustube_toggles_two")}
      </SectionCard>
      <SectionCard title="Interface" headerColor="#FFB158">
       {getModule("ustube_video_manager_box")}
       {getModule("ustube_content_calendar_box")}
       {getModule("ustube_loading_states")}
       {getModule("ustube_dialog_notifications")}
      </SectionCard>
      <SectionCard title="Tasks + Goals" headerColor="bg-[#FFE357]">
       {getModule("ustube_tasks_with_strike")}
       {getModule("ustube_channel_goals_progress")}
      </SectionCard>
     </div>
    </MainToolbox>
   </div>
  </div>
 )
}

export default FourSectionsLabStandalone
