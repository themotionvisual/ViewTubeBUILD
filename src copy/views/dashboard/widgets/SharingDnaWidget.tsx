import React, { useState } from "react"
import { WidgetShell } from "../WidgetShell"
import { Share2, FileText } from "lucide-react"

export const SharingDnaWidget = ({ widget, instance, editMode, onToggleCollapse, onCycleSize, onDecSize, onCycleHeight, onDecHeight, onRemove, data }: any) => {
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

 const platforms = [
  { name: "WhatsApp", share: 45, color: "#4FFF5B" },
  { name: "Twitter", share: 30, color: "#00D2FF" },
  { name: "Email", share: 25, color: "#FFB570" },
 ]

 const [active, setActive] = useState(platforms[0].name)

 return (
  <WidgetShell {...common} icon={<Share2 size={22} />}>
   <div className="flex flex-col h-full gap-2 p-2">
    <div className="flex gap-1 h-2 w-full border-[2px] border-black rounded-full overflow-hidden mb-2">
     {platforms.map(p => (
      <div key={p.name} style={{width:`${p.share}%`, backgroundColor: p.color}} />
     ))}
    </div>
    
    <div className="flex gap-2">
     {platforms.map(p => (
      <button 
       key={p.name}
       onClick={() => setActive(p.name)}
       className={`flex-1 text-[8px] font-black uppercase py-1 border-[2px] border-black rounded ${active === p.name ? 'bg-black text-white' : 'bg-white text-black'}`}>
       {p.name}
      </button>
     ))}
    </div>

    <div className="flex-1 mt-2">
      <button className="w-full py-2 bg-white border-[3px] border-black rounded-lg shadow-[2px_2px_0px_0px_#000] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#000] transition-all font-black text-[9px] uppercase flex justify-center items-center gap-1">
       <FileText size={12}/> Generate {active} Link Copy
      </button>
    </div>
   </div>
  </WidgetShell>
 )
}
