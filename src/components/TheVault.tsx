import React, { useState } from "react"
import { ToolboxScaffold, SubToolbox, SubToolboxGridActionButton } from "./Toolbox"
import { Database, Video, Image as ImageIcon, Sparkles, BarChart, History, Download, Trash2, Search } from "lucide-react"
import { CustomIcon } from "./CustomIcon"

export interface TheVaultProps {
 collapsible?: boolean
 isOpenInitial?: boolean
 paletteIndex?: number
}

export const TheVault: React.FC<TheVaultProps> = ({
 collapsible = true,
 isOpenInitial = false,
 paletteIndex = 9,
}) => {
 const [activeTab, setActiveTab] = useState<"media" | "ai" | "stats">("media")
 const [isOpen, setIsOpen] = useState(isOpenInitial)

 return (
  <ToolboxScaffold
   title="THE VAULT"
   subtitle="Unified storage for videos, images, AI generations, and production statistics"
   headerColor="bg-[#FF00FF]"
   icon={<Database size={40} className="text-white" />}
   iconBoxColor="bg-black"
   paletteIndex={paletteIndex}
   collapsible={collapsible}
   isOpen={isOpen}
   onToggle={() => setIsOpen(!isOpen)}
   helpText="Store and manage all your production assets in one high-security location.">
   <div className="space-y-6 p-2">
    {/* Tab Navigation */}
    <div className="flex space-x-2 border-b-[3px] border-black pb-4">
     {[
      { id: "media", label: "Media Assets", icon: Video },
      { id: "ai", label: "AI Generations", icon: Sparkles },
      { id: "stats", label: "Data Statistics", icon: BarChart },
     ].map((tab) => (
      <button
       key={tab.id}
       onClick={() => setActiveTab(tab.id as any)}
       className={`flex items-center space-x-2 px-4 py-2 rounded-xl border-[3px] border-black font-black uppercase text-xs transition-all ${
        activeTab === tab.id ? "bg-[#CCFF00] translate-y-[-2px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" : "bg-white hover:bg-gray-50"
       }`}>
       <tab.icon size={16} />
       <span>{tab.label}</span>
      </button>
     ))}
    </div>

    {/* Search & Filter Bar */}
    <div className="flex items-center space-x-3 bg-black/5 p-3 rounded-2xl border-[3px] border-black/10">
     <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" size={18} />
      <input
       type="text"
       placeholder="Search vault..."
       className="w-full pl-10 pr-4 py-2 bg-white border-[3px] border-black rounded-xl text-sm font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#CCFF00]"
      />
     </div>
     <SubToolboxGridActionButton icon={History} label="History" onClick={() => {}} />
    </div>

    {/* Content Area */}
    <div className="min-h-[400px]">
     {activeTab === "media" && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       <SubToolbox title="Uploaded Videos" icon={Video} headerBg="bg-blue-500" iconBg="bg-white">
        <div className="space-y-4 p-4">
         <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
           <div key={i} className="aspect-video bg-gray-200 border-[3px] border-black rounded-xl flex items-center justify-center group relative overflow-hidden">
            <Video className="opacity-20" size={48} />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
             <button className="p-2 bg-[#CCFF00] rounded-full border-[3px] border-black"><Download size={20} /></button>
             <button className="p-2 bg-red-500 rounded-full border-[3px] border-black text-white"><Trash2 size={20} /></button>
            </div>
            <div className="absolute bottom-2 left-2 right-2 text-[10px] font-black uppercase text-white truncate drop-shadow-md">Video_Asset_00{i}.mp4</div>
           </div>
          ))}
         </div>
         <button className="w-full py-3 bg-white border-[3px] border-black rounded-xl font-black uppercase text-sm hover:bg-gray-50 flex items-center justify-center space-x-2">
          <Download size={18} />
          <span>Batch Export Media</span>
         </button>
        </div>
       </SubToolbox>

       <SubToolbox title="Generated Images" icon={ImageIcon} headerBg="bg-purple-500" iconBg="bg-white">
        <div className="space-y-4 p-4">
         <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
           <div key={i} className="aspect-square bg-gray-200 border-[3px] border-black rounded-xl flex items-center justify-center group relative overflow-hidden">
            <ImageIcon className="opacity-20" size={32} />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <button className="p-1.5 bg-[#CCFF00] rounded-full border-[2px] border-black"><Download size={14} /></button>
            </div>
           </div>
          ))}
         </div>
         <div className="text-center p-4 border-[3px] border-dashed border-black/20 rounded-xl">
          <p className="text-[10px] font-black uppercase opacity-40">Drag & Drop to add to vault</p>
         </div>
        </div>
       </SubToolbox>
      </div>
     )}

     {activeTab === "ai" && (
      <div className="grid grid-cols-1 gap-6">
       <SubToolbox title="AI Generations Archive" icon={Sparkles} headerBg="bg-amber-400" iconBg="bg-white">
        <div className="p-4 space-y-4">
         <div className="overflow-x-auto">
          <table className="w-full border-collapse">
           <thead>
            <tr className="border-b-[3px] border-black">
             <th className="text-left py-3 px-4 text-[10px] font-black uppercase">Type</th>
             <th className="text-left py-3 px-4 text-[10px] font-black uppercase">Prompt Excerpt</th>
             <th className="text-left py-3 px-4 text-[10px] font-black uppercase">Model</th>
             <th className="text-left py-3 px-4 text-[10px] font-black uppercase">Date</th>
             <th className="text-right py-3 px-4 text-[10px] font-black uppercase">Actions</th>
            </tr>
           </thead>
           <tbody>
            {[
             { type: "Script", prompt: "Explain quantum physics using coffee metaphors...", model: "Gemini 1.5 Pro", date: "2024-05-14" },
             { type: "SEO", prompt: "Title ideas for 'Minecraft but everything is cake'...", model: "GPT-4o", date: "2024-05-12" },
             { type: "Image", prompt: "Cyberpunk library with glowing neon books...", model: "DALL-E 3", date: "2024-05-10" },
            ].map((item, idx) => (
             <tr key={idx} className="border-b-[1px] border-black/10 hover:bg-black/5 transition-colors">
              <td className="py-3 px-4"><span className="px-2 py-1 bg-black text-white text-[9px] font-black uppercase rounded">{item.type}</span></td>
              <td className="py-3 px-4 text-xs font-bold truncate max-w-[300px]">{item.prompt}</td>
              <td className="py-3 px-4 text-[10px] font-black uppercase opacity-60">{item.model}</td>
              <td className="py-3 px-4 text-[10px] font-mono">{item.date}</td>
              <td className="py-3 px-4 text-right space-x-2">
               <button className="text-blue-500 hover:underline text-[10px] font-black uppercase">Reuse</button>
               <button className="text-red-500 hover:underline text-[10px] font-black uppercase">Delete</button>
              </td>
             </tr>
            ))}
           </tbody>
          </table>
         </div>
        </div>
       </SubToolbox>
      </div>
     )}

     {activeTab === "stats" && (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
       <div className="md:col-span-2">
        <SubToolbox title="Production Performance" icon={BarChart} headerBg="bg-lime-400" iconBg="bg-white">
         <div className="p-6 h-[300px] flex items-end justify-between space-x-2">
          {[40, 65, 45, 90, 70, 85, 60, 95, 80, 55, 75, 88].map((h, i) => (
           <div key={i} className="flex-1 bg-black group relative" style={{ height: `${h}%` }}>
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] font-black px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
             {h}%
            </div>
           </div>
          ))}
         </div>
         <div className="p-4 border-t-[3px] border-black bg-black/5 flex justify-between">
          <div className="text-[10px] font-black uppercase">Monthly Production Output</div>
          <div className="text-[10px] font-black uppercase text-lime-600">+12% vs last month</div>
         </div>
        </SubToolbox>
       </div>

       <div className="space-y-6">
        <div className="border-[3px] border-black rounded-2xl p-4 bg-white">
         <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4">Total Assets</h4>
         <div className="text-4xl font-[1000] mb-1">1,482</div>
         <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden flex">
          <div className="h-full bg-blue-500" style={{ width: "45%" }} />
          <div className="h-full bg-purple-500" style={{ width: "30%" }} />
          <div className="h-full bg-amber-400" style={{ width: "25%" }} />
         </div>
         <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="text-[9px] font-black uppercase flex items-center"><div className="w-2 h-2 bg-blue-500 mr-2" /> Videos (45%)</div>
          <div className="text-[9px] font-black uppercase flex items-center"><div className="w-2 h-2 bg-purple-500 mr-2" /> Images (30%)</div>
          <div className="text-[9px] font-black uppercase flex items-center"><div className="w-2 h-2 bg-amber-400 mr-2" /> AI Gen (25%)</div>
         </div>
        </div>

        <div className="border-[3px] border-black rounded-2xl p-4 bg-black text-white">
         <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4">Storage Used</h4>
         <div className="text-4xl font-[1000] mb-1 text-[#CCFF00]">42.8 GB</div>
         <div className="text-[10px] font-black uppercase opacity-60">Out of 100 GB (Pro Plan)</div>
        </div>
       </div>
      </div>
     )}
    </div>
   </div>
  </ToolboxScaffold>
 )
}
