import React, { useState } from "react"
import { WidgetShell } from "../WidgetShell"
import { Star, WandSparkles } from "lucide-react"

export const PremiumPulseWidget = ({ widget, instance, editMode, onToggleCollapse, onCycleSize, onDecSize, onCycleHeight, onDecHeight, onRemove, data }: any) => {
 const common = {
  widget,
  instance,
  editMode,
  canEdit: true,
  onToggleCollapse,
  onCycleSize,
  onRemove,
  onDecSize,
  onCycleHeight,
  onDecHeight,
 }

 const [teaser, setTeaser] = useState<string | null>(null)

 return (
  <WidgetShell {...common} icon={<Star size={22} />}>
   <div className="flex flex-col h-full justify-between gap-2 p-2">
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-black uppercase opacity-40">Premium Engagement</span>
      <div className="text-2xl font-[1000] text-[#40C6E9] leading-none">
       High
      </div>
      <p className="text-[9px] font-bold mt-2 border-l-[3px] border-[#40C6E9] pl-2 opacity-80 uppercase leading-tight">
       Top tier members are binging recent uploads. Prime them with a teaser.
      </p>
    </div>
    
    <button 
     onClick={() => setTeaser("Hey Members! 🔓 Early access to our biggest breakdown yet drops tomorrow. Sneak peek inside...")}
     className="w-full py-2 bg-[#40C6E9] border-[3px] border-black rounded-lg shadow-[2px_2px_0px_0px_#000] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#000] transition-all font-black text-[10px] uppercase flex justify-center items-center gap-2">
     <WandSparkles size={14} /> Draft Member Teaser
    </button>
    
    {teaser && (
     <div className="absolute inset-2 bg-white border-[3px] border-black rounded-xl p-3 z-50 flex flex-col shadow-[4px_4px_0px_0px_#000]">
      <span className="text-[10px] font-black uppercase border-b-[3px] border-black pb-1 mb-2">Member Teaser</span>
      <textarea className="flex-1 w-full bg-gray-50 border-2 border-black rounded p-2 text-[10px] font-bold font-mono outline-none resize-none" defaultValue={teaser} />
      <button onClick={() => setTeaser(null)} className="w-full mt-2 py-1 bg-[#4FFF5B] border-[3px] border-black rounded-lg font-black text-[10px] uppercase shadow-[2px_2px_0px_0px_#000]">Copy & Close</button>
     </div>
    )}
   </div>
  </WidgetShell>
 )
}
