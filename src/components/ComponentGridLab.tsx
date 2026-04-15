import React, { useState } from "react"
import {
 StyleChipRow,
 Toggle,
 Checkbox,
 Radio,
 FormField,
 KPIStatRow,
 DailyStats,
 Sidebar,
 ChannelTree,
 TooltipSimple,
 Modal,
 VideoCardGrid,
} from "./ui"

export const ComponentGridLab: React.FC = () => {
 const [isModalOpen, setIsModalOpen] = useState(false)

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

    {/* Section 2 — Style Chips */}
    <div className="mb-14">
     <div
      className="text-[10px] font-black tracking-[0.2em] uppercase text-[#AAAAAA] mb-4 pb-2 border-b-[3px] border-black"
      style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
      02 — Style Chips & Filters
     </div>
     <div className="bg-white border-[5px] border-black rounded-[16px] shadow-[12px_12px_0px_black] overflow-hidden">
      <div className="flex items-center justify-between h-[60px] px-4 bg-[#00CCFF] border-b-[4px] border-black">
       <div className="flex items-center gap-3">
        <div className="w-[60px] h-full bg-black flex items-center justify-center text-white text-[20px]">
         ◈
        </div>
        <span
         className="font-black uppercase text-[24px] text-white"
         style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
         Styles
        </span>
       </div>
       <button className="w-[36px] h-[36px] border-[3px] border-black rounded-md bg-black/10 flex items-center justify-center font-black text-[22px]">
        −
       </button>
      </div>
      <div className="p-7 bg-[#F0F0F0]">
       <StyleChipRow
        chips={[
         { label: "Educational" },
         { label: "Graphic", color: "pink", active: true },
         { label: "Clickbait" },
         { label: "Minimalist", color: "lime", active: true },
         { label: "Cinematic" },
         { label: "Mysterious", color: "pink", active: true },
         { label: "Vibrant", color: "lime", active: true },
         { label: "Dark & Moody" },
         { label: "Retro/Vintage" },
         { label: "Simplified" },
         { label: "Futuristic" },
         { label: "Hand-Drawn" },
         { label: "Educational", color: "cyan", active: true },
         { label: "Clickbait", color: "yellow", active: true },
         { label: "Cinematic", color: "orange", active: true },
         { label: "Futuristic", color: "purple", active: true },
        ]}
       />
      </div>
     </div>
    </div>

    {/* Section 4 — Toggles */}
    <div className="mb-14">
     <div
      className="text-[10px] font-black tracking-[0.2em] uppercase text-[#AAAAAA] mb-4 pb-2 border-b-[3px] border-black"
      style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
      04 — Toggles · Checkboxes · Radios
     </div>
     <div className="grid grid-cols-3 gap-4">
      {/* Toggles */}
      <div className="border-[4px] border-black rounded-[16px] overflow-hidden bg-white shadow-[4px_4px_0_black]">
       <div className="flex items-center justify-between h-[60px] px-4 bg-[#CCFF00] border-b-[4px] border-black">
        <div className="flex items-center gap-3">
         <div className="w-[60px] h-full bg-black flex items-center justify-center text-white text-[18px]">
          ◈
         </div>
         <span
          className="font-black uppercase text-[22px]"
          style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
          Toggles
         </span>
        </div>
       </div>
       <div className="p-6 bg-white">
        <Toggle label="Live Mode" active={true} badge="ON" />
        <Toggle label="Auto-Refine" color="cyan" active={true} />
        <Toggle label="Notifications" color="pink" active={true} />
        <Toggle label="Revenue" color="lime" active={true} />
        <Toggle label="Analytics" active={false} />
       </div>
      </div>

      {/* Checkboxes */}
      <div className="border-[4px] border-black rounded-[16px] overflow-hidden bg-white shadow-[4px_4px_0_black]">
       <div className="flex items-center justify-between h-[60px] px-4 bg-[#FFD600] border-b-[4px] border-black">
        <div className="flex items-center gap-3">
         <div className="w-[60px] h-full bg-black flex items-center justify-center text-white text-[18px]">
          ✓
         </div>
         <span
          className="font-black uppercase text-[22px]"
          style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
          Checkboxes
         </span>
        </div>
       </div>
       <div className="p-6 bg-white">
        <Checkbox label="Reach 10K Subs" active={true} />
        <Checkbox label="Optimize CTR" color="pink" active={true} done={true} />
        <Checkbox label="Post Monday" color="lime" active={true} />
        <Checkbox label="Edit Thumbnail" color="cyan" active={true} />
        <Checkbox label="Write Script" active={false} />
       </div>
      </div>

      {/* Radios */}
      <div className="border-[4px] border-black rounded-[16px] overflow-hidden bg-white shadow-[4px_4px_0_black]">
       <div className="flex items-center justify-between h-[60px] px-4 bg-[#FFB158] border-b-[4px] border-black">
        <div className="flex items-center gap-3">
         <div className="w-[60px] h-full bg-black flex items-center justify-center text-white text-[18px]">
          ◎
         </div>
         <span
          className="font-black uppercase text-[22px]"
          style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
          Radio
         </span>
        </div>
       </div>
       <div className="p-6 bg-white">
        <Radio label="Channel" groupName="rg1" active={true} />
        <Radio label="Projects" groupName="rg1" />
        <Radio label="Analytics" groupName="rg1" />
        <Radio label="Shorts" groupName="rg1" color="cyan" active={true} />
       </div>
      </div>
     </div>
    </div>

    {/* Section 5 — Form Fields */}
    <div className="mb-14">
     <div
      className="text-[10px] font-black tracking-[0.2em] uppercase text-[#AAAAAA] mb-4 pb-2 border-b-[3px] border-black"
      style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
      05 — Text Inputs & Form Fields
     </div>
     <div className="border-[4px] border-black rounded-[16px] overflow-hidden bg-white shadow-[4px_4px_0_black]">
      <div className="flex items-center justify-between h-[60px] px-4 bg-black border-b-[4px] border-black">
       <div className="flex items-center gap-3">
        <div className="w-[60px] h-full bg-[#00CCFF] flex items-center justify-center text-[18px]">
         ✎
        </div>
        <span
         className="font-black uppercase text-[22px] text-white"
         style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
         Form Fields
        </span>
       </div>
      </div>
      <div className="p-7 bg-white">
       <div className="grid grid-cols-2 gap-6">
        <div>
         <FormField label="Channel URL" placeholder="https://youtube.com/…" />
         <FormField label="Channel Goal" value="Reach 10K Subscribers" />
         <FormField
          label="Category"
          type="select"
          options={["Growth", "Analytics", "Content", "Monetization"]}
         />
        </div>
        <div>
         <FormField
          label="Description / Concept"
          type="textarea"
          value="High-energy thumbnail for the new video drop. Bold, vibrant, eye-catching."
         />
         <FormField label="Add Manual Task" placeholder="Add task…" />
        </div>
       </div>
      </div>
     </div>
    </div>

    {/* Section 9 — KPI Stat Cards */}
    <div className="mb-14">
     <div
      className="text-[10px] font-black tracking-[0.2em] uppercase text-[#AAAAAA] mb-4 pb-2 border-b-[3px] border-black"
      style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
      09 — KPI Stat Cards
     </div>
     <KPIStatRow
      stats={[
       {
        label: "Subscribers",
        value: "9.3K",
        delta: "12% this week",
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
        label: "Watch Time",
        value: "4.2h",
        delta: "5%",
        deltaDirection: "down",
        color: "cyan",
       },
       {
        label: "Revenue",
        value: "$912",
        delta: "18%",
        deltaDirection: "up",
        color: "yellow",
       },
       {
        label: "Impressions",
        value: "56K",
        delta: "8%",
        deltaDirection: "up",
        color: "orange",
       },
       { label: "Videos", value: "248", delta: "All time", color: "purple" },
      ]}
     />
    </div>

    {/* Section 10 — Daily Stats */}
    <div className="mb-14">
     <div
      className="text-[10px] font-black tracking-[0.2em] uppercase text-[#AAAAAA] mb-4 pb-2 border-b-[3px] border-black"
      style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
      10 — Daily Stats
     </div>
     <DailyStats
      title="Daily Stats"
      data={[
       { metric: "Views", today: "3,214", delta: "+14%", deltaDirection: "up" },
       { metric: "Clicks", today: "261", delta: "+7%", deltaDirection: "up" },
       {
        metric: "Watch Time",
        today: "2.1h",
        delta: "-3%",
        deltaDirection: "down",
       },
       { metric: "Revenue", today: "$48", delta: "+21%", deltaDirection: "up" },
      ]}
     />
    </div>

    {/* Section 13 — Sidebar */}
    <div className="mb-14">
     <div
      className="text-[10px] font-black tracking-[0.2em] uppercase text-[#AAAAAA] mb-4 pb-2 border-b-[3px] border-black"
      style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
      13 — Sidebar Navigation
     </div>
     <div className="border-[4px] border-black rounded-[16px] overflow-hidden bg-white shadow-[4px_4px_0_black] p-6">
      <Sidebar
       logo="UsTube"
       badges={[
        { label: "AI Powered", color: "lime" },
        { label: "Beta", color: "black" },
       ]}
       links={[
        { icon: "📊", label: "Studio Hub" },
        { icon: "🔬", label: "Research Lab", active: true },
        { icon: "🎬", label: "Video Manager" },
        { icon: "⚡", label: "Growth Ideas" },
        { icon: "📈", label: "Dashboard" },
        { icon: "📖", label: "User Guide" },
        { icon: "⚙", label: "Settings" },
       ]}
       statusBadge={{ label: "GEMINI API ACTIVE", active: true }}
      />
     </div>
    </div>

    {/* Section 14 — Channel Tree */}
    <div className="mb-14">
     <div
      className="text-[10px] font-black tracking-[0.2em] uppercase text-[#AAAAAA] mb-4 pb-2 border-b-[3px] border-black"
      style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
      14 — Collapsible Tree
     </div>
     <div className="max-w-[400px] border-[4px] border-black rounded-[16px] overflow-hidden bg-white shadow-[4px_4px_0_black]">
      <div className="flex items-center justify-between h-[60px] px-4 bg-[#FFB158] border-b-[4px] border-black">
       <div className="flex items-center gap-3">
        <div className="w-[60px] h-full bg-black flex items-center justify-center text-white text-[18px]">
         ⊞
        </div>
        <span
         className="font-black uppercase text-[22px]"
         style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
         Channel Tree
        </span>
       </div>
      </div>
      <div className="p-6 bg-white">
       <ChannelTree
        items={[
         {
          label: "Channel Assets",
          icon: "📁",
          children: [
           {
            label: "Videos",
            icon: "🎬",
            children: [
             { label: "Episode 1 — Beach Day", isLeaf: true },
             { label: "Episode 2 — Sunset Hike", isLeaf: true },
             { label: "AI Tools Review (Draft)", isLeaf: true },
            ],
           },
           {
            label: "Thumbnails",
            icon: "🖼",
            children: [
             { label: "thumb_ep1_v3.png", isLeaf: true },
             { label: "thumb_ep2_final.png", isLeaf: true },
            ],
           },
           { label: "📊 Analytics Export", isLeaf: true },
           { label: "📝 Script Templates", isLeaf: true },
          ],
         },
        ]}
       />
      </div>
     </div>
    </div>

    {/* Section 17 — Tooltips */}
    <div className="mb-14">
     <div
      className="text-[10px] font-black tracking-[0.2em] uppercase text-[#AAAAAA] mb-4 pb-2 border-b-[3px] border-black"
      style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
      17 — Tooltips
     </div>
     <div className="flex gap-6">
      <TooltipSimple content="AI-powered daily actions">
       <button className="px-5 py-2.5 bg-[#FF3399] text-white border-[3px] border-black rounded-md font-black text-[13px] uppercase tracking-wide shadow-[4px_4px_0_black] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all">
        ⚡ Generate
       </button>
      </TooltipSimple>
      <TooltipSimple content="Sync channel data now">
       <button className="px-5 py-2.5 bg-[#CCFF00] border-[3px] border-black rounded-md font-black text-[13px] uppercase tracking-wide shadow-[4px_4px_0_black] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all">
        ↗ Sync
       </button>
      </TooltipSimple>
      <TooltipSimple content="Copies to clipboard">
       <button className="px-5 py-2.5 bg-black text-white border-[3px] border-black rounded-md font-black text-[13px] uppercase tracking-wide shadow-[4px_4px_0_black] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all">
        Copy
       </button>
      </TooltipSimple>
     </div>
    </div>

    {/* Section 18 — Modal */}
    <div className="mb-14">
     <div
      className="text-[10px] font-black tracking-[0.2em] uppercase text-[#AAAAAA] mb-4 pb-2 border-b-[3px] border-black"
      style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
      18 — Modal Dialog
     </div>
     <button
      onClick={() => setIsModalOpen(true)}
      className="px-8 py-4 bg-[#FF3399] text-white border-[4px] border-black rounded-[16px] font-black text-[16px] uppercase tracking-wide shadow-[8px_8px_0_black] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all">
      Open Modal ↗
     </button>

     <Modal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      title="⚡ Generate Tactics"
      headerColor="pink"
      footer={
       <>
        <button
         onClick={() => setIsModalOpen(false)}
         className="px-5 py-2.5 bg-white border-[3px] border-black rounded-md font-black text-[13px] uppercase tracking-wide shadow-[3px_3px_0_black] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
         Cancel
        </button>
        <button
         onClick={() => setIsModalOpen(false)}
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
     </Modal>
    </div>

    {/* Section 22 — Video Cards */}
    <div className="mb-14">
     <div
      className="text-[10px] font-black tracking-[0.2em] uppercase text-[#AAAAAA] mb-4 pb-2 border-b-[3px] border-black"
      style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
      22 — Video Cards
     </div>
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
       {
        title: "Sample Video Three",
        duration: "41:22",
        status: "DRAFT",
        placeholderIcon: "👑",
        gradientColors: ["#000000", "#333333"],
       },
      ]}
     />
    </div>

    <div className="h-20" />
   </div>
  </div>
 )
}
