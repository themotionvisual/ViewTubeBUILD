import React, { useState } from "react"
import {
 StyleChipRow,
 Toggle,
 Checkbox,
 RadioGroup,
 FormField,
 KPIStatRow,
 DailyStats,
 Sidebar,
 ChannelTree,
 Tooltip,
 Dialog,
 VideoCardGrid,
} from "./ui"
import {
 MainToolbox,
 SectionCard,
} from "../views/referenceStudio/ReferenceStudioPrimitives"

export const ComponentGridLab: React.FC = () => {
 const [isDialogOpen, setIsDialogOpen] = useState(false)

 return (
  <div className="min-h-screen bg-[#E8E8E8] p-8 font-sans">
   <div className="max-w-6xl mx-auto">
    {/* Page Header */}
    <div className="mb-12">
     <h1
      className="text-[56px] font-black uppercase tracking-tighter leading-none mb-2"
      style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
      UsTube <span style={{ color: "#00CCFF" }}>UI</span> Kit
     </h1>
     <p
      className="text-[14px] font-black uppercase tracking-[0.1em] text-[#AAAAAA]"
      style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
      v2 · 6-color system · Full component library · All interactive
     </p>
    </div>

    <MainToolbox
     title="Interactive Component Lab"
     subtitle="Neo-brutalist UsTube kit components integrated with Toolbox UI architecture"
     headerColor="bg-[#B14AED]"
     iconBoxColor="bg-[#00CCFF]">
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Section 2 — Style Chips & Custom Buttons */}
      <SectionCard
       title="02 — Styles & Buttons"
       subtitle="Chips and tactile button variants"
       headerColor="bg-[#00CCFF]">
       <div className="space-y-6">
        <StyleChipRow
         chips={[
          { label: "Educational", color: "cyan", active: true },
          { label: "Graphic", color: "pink", active: true },
          { label: "Minimalist", color: "lime", active: true },
          { label: "Futuristic", color: "purple", active: true },
         ]}
        />
        <div className="flex gap-4">
         <button className="w-[36px] h-[36px] border-[3px] border-black rounded-md bg-black/10 flex items-center justify-center font-black text-[22px]">
          −
         </button>
         <button className="w-[36px] h-[36px] border-[3px] border-black rounded-md bg-[#CCFF00] flex items-center justify-center font-black text-[22px] shadow-[2px_2px_0_black]">
          +
         </button>
         <button className="px-6 py-2 bg-[#FF3399] text-white border-[3px] border-black rounded-xl font-black uppercase text-[14px] shadow-[4px_4px_0_black]">
          Large Action
         </button>
         <button className="px-6 py-2 bg-black text-white border-[3px] border-black rounded-xl font-black uppercase text-[14px] shadow-[4px_4px_0_black]">
          Dark Mode
         </button>
        </div>
       </div>
      </SectionCard>

      {/* Section 4 — Interactive Controls */}
      <SectionCard
       title="04 — Toggles & RadioGroups"
       subtitle="Binary and group selection inputs"
       headerColor="bg-[#CCFF00]">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
         <Toggle label="Live Mode" active={true} badge="ON" />
         <Toggle label="Auto-Refine" color="cyan" active={true} />
         <Toggle label="Analytics" active={false} />
        </div>
        <div className="space-y-3">
         <Checkbox label="Reach 10K Subs" active={true} />
         <Checkbox
          label="Optimize CTR"
          color="pink"
          active={true}
          done={true}
         />
         <RadioGroup label="Channel" groupName="lab_rg" active={true} />
         <RadioGroup label="Shorts" groupName="lab_rg" color="cyan" />
        </div>
       </div>
      </SectionCard>

      {/* Section 5 — Form Fields */}
      <SectionCard
       title="05 — Form Fields"
       subtitle="Text inputs and select menus"
       headerColor="bg-[#FFB158]">
       <div className="space-y-4">
        <FormField label="Channel URL" placeholder="https://youtube.com/…" />
        <FormField
         label="Category"
         type="select"
         options={["Growth", "Analytics", "Content", "Monetization"]}
        />
        <FormField
         label="Description / Concept"
         type="textarea"
         value="High-energy thumbnail for the new video drop. Bold, vibrant, eye-catching."
        />
       </div>
      </SectionCard>

      {/* Section 9 — KPI Stats */}
      <SectionCard
       title="09 — KPI Stat Cards"
       subtitle="Performance metrics at a glance"
       headerColor="bg-[#FF3399]">
       <KPIStatRow
        stats={[
         {
          label: "Subscribers",
          value: "9.3K",
          delta: "12%",
          deltaDirection: "up",
          color: "pink",
         },
         {
          label: "Avg CTR",
          value: "6.8%",
          delta: "0.4%",
          deltaDirection: "up",
          color: "lime",
         },
         {
          label: "Revenue",
          value: "$912",
          delta: "18%",
          deltaDirection: "up",
          color: "yellow",
         },
        ]}
       />
      </SectionCard>

      {/* Section 10 — Daily Stats */}
      <SectionCard
       title="10 — Daily Stats"
       subtitle="Rolling 24h activity feed"
       headerColor="bg-[#FFE357]">
       <DailyStats
        title="Daily Stats"
        data={[
         {
          metric: "Views",
          today: "3,214",
          delta: "+14%",
          deltaDirection: "up",
         },
         { metric: "Clicks", today: "261", delta: "+7%", deltaDirection: "up" },
         {
          metric: "Revenue",
          today: "$48",
          delta: "+21%",
          deltaDirection: "up",
         },
        ]}
       />
      </SectionCard>

      {/* Section 13 — Sidebar */}
      <SectionCard
       title="13 — Navigation"
       subtitle="Application hierarchy"
       headerColor="bg-[#00CCFF]">
       <Sidebar
        logo="UsTube"
        badges={[{ label: "BETA", color: "black" }]}
        links={[
         { icon: "📊", label: "Studio Hub" },
         { icon: "🔬", label: "Research Lab", active: true },
         { icon: "⚙", label: "Settings" },
        ]}
        statusBadge={{ label: "GEMINI ACTIVE", active: true }}
       />
      </SectionCard>

      {/* Section 14 — Channel Tree */}
      <SectionCard
       title="14 — Assets"
       subtitle="Collapsible folder structure"
       headerColor="bg-[#FFB158]">
       <ChannelTree
        items={[
         {
          label: "Videos",
          icon: "🎬",
          children: [
           { label: "Episode 1 — Beach Day", isLeaf: true },
           { label: "Episode 2 — Sunset Hike", isLeaf: true },
          ],
         },
        ]}
       />
      </SectionCard>

      {/* Section 17 — Tooltips */}
      <SectionCard
       title="17 — Tooltips"
       subtitle="Hover information feedback"
       headerColor="bg-[#CCFF00]">
       <div className="flex gap-6 py-4">
        <Tooltip content="AI-powered daily actions">
         <button className="px-5 py-2 bg-[#FF3399] text-white border-[3px] border-black rounded-md font-black text-[13px] uppercase shadow-[4px_4px_0_black]">
          ⚡ Generate
         </button>
        </Tooltip>
        <Tooltip content="Sync channel data now">
         <button className="px-5 py-2 bg-[#CCFF00] border-[3px] border-black rounded-md font-black text-[13px] uppercase shadow-[4px_4px_0_black]">
          ↗ Sync
         </button>
        </Tooltip>
       </div>
      </SectionCard>

      {/* Section 18 — Dialog Launch */}
      <SectionCard
       title="18 — Dialog Dialog"
       subtitle="Interruptive confirmation UI"
       headerColor="bg-[#FF3399]">
       <div className="py-2">
        <button
         onClick={() => setIsDialogOpen(true)}
         className="px-8 py-4 bg-[#FF3399] text-white border-[4px] border-black rounded-[16px] font-black uppercase text-[16px] shadow-[8px_8px_0_black] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all">
         Launch Dialog ↗
        </button>
       </div>
      </SectionCard>

      {/* Section 22 — Video Cards */}
      <SectionCard
       title="22 — Video Cards"
       subtitle="Rich media grid previews"
       headerColor="bg-[#00CCFF]">
       <VideoCardGrid
        videos={[
         {
          title: "Sample Video One",
          views: "22.1K",
          ctr: "9.3%",
          duration: "22:14",
          status: "LIVE",
          placeholderIcon: "🏖",
         },
         {
          title: "Sample Video Two",
          views: "47.2K",
          ctr: "8.1%",
          duration: "35:07",
          status: "SCHED",
          placeholderIcon: "⚔️",
          gradientColors: ["#9B59FF", "#FF3399"],
         },
        ]}
       />
      </SectionCard>
     </div>
    </MainToolbox>

    <Dialog
     isOpen={isDialogOpen}
     onClose={() => setIsDialogOpen(false)}
     title="⚡ Generate Tactics"
     headerColor="pink"
     footer={
      <>
       <button
        onClick={() => setIsDialogOpen(false)}
        className="px-5 py-2.5 bg-white border-[3px] border-black rounded-md font-black text-[13px] uppercase tracking-wide shadow-[3px_3px_0_black] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
        Cancel
       </button>
       <button
        onClick={() => setIsDialogOpen(false)}
        className="px-5 py-2.5 bg-[#FF3399] text-white border-[3px] border-black rounded-md font-black text-[13px] uppercase tracking-wide shadow-[3px_3px_0_black] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
        ⚡ Generate
       </button>
      </>
     }>
     <p
      className="font-black text-[14px] tracking-wide leading-relaxed mb-4"
      style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
      AI will scan your channel telemetry and generate personalized daily
      success actions based on your goals.
     </p>
     <FormField
      label="Focus Area"
      type="select"
      options={["Growth", "Monetization", "Engagement"]}
     />
     <div className="mt-4">
      <Toggle label="Include competitor analysis" color="cyan" active={true} />
     </div>
    </Dialog>

    <div className="h-20" />
   </div>
  </div>
 )
}
