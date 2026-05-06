import React from "react"
import { WidgetShell } from "../WidgetShell"
import { UserCircle2, PenTool } from "lucide-react"

export const GuestRatioWidget = ({ widget, instance, editMode, onToggleCollapse, onCycleSize, onDecSize, onCycleHeight, onDecHeight, onRemove, data }: any) => {
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

 return (
  <WidgetShell {...common} icon={<UserCircle2 size={22} />}>
   <div className="flex flex-col h-full justify-between gap-2 p-2">
    <div className="flex justify-between items-baseline border-b-[3px] border-black pb-2">
     <span className="text-[10px] font-black uppercase opacity-40">S2G Ratio</span>
     <span className="text-xl font-black text-[#FF7497]">1:12</span>
    </div>
    
    <div className="text-[9px] font-bold text-center opacity-70 px-2 leading-tight">
     1 logged-in viewer for every 12 anonymous. Conversion opportunity high.
    </div>

    <button className="w-full py-2 bg-[#FF7497] text-white border-[3px] border-black rounded-lg shadow-[2px_2px_0px_0px_#000] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#000] transition-all font-black text-[10px] uppercase flex justify-center items-center gap-2">
     <PenTool size={14}/> Craft Pinned CTA
    </button>
   </div>
  </WidgetShell>
 )
}
