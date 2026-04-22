import React from "react"
import { WidgetShell } from "../WidgetShell"
import { Globe, Languages } from "lucide-react"

export const CpmGeoWidget = ({
 widget,
 instance,
 editMode,
 onToggleCollapse,
 onCycleSize,
 onRemove,
 data,
}: any) => {
 const common = {
  widget,
  instance,
  editMode,
  canEdit: true,
  onToggleCollapse,
  onCycleSize,
  onRemove,
 }

 return (
  <WidgetShell {...common} icon={<Globe size={22} />}>
   <div className="flex flex-col h-full gap-2 p-2">
    <div className="flex justify-between items-center bg-[#f5f5f5] border-[3px] border-black rounded-lg p-2 shadow-[2px_2px_0px_0px_#B14AED]">
     <div className="flex flex-col">
      <span className="text-[9px] font-black uppercase opacity-60">Top CPM Geo</span>
      <span className="text-lg font-black">Australia</span>
     </div>
     <span className="text-xl font-black text-[#B14AED]">$18.40</span>
    </div>
    
    <div className="flex-1 flex items-end mt-2">
     <button className="w-full py-2 bg-[#B14AED] text-white border-[3px] border-black rounded-lg shadow-[2px_2px_0px_0px_#000] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#000] transition-all font-black text-[10px] uppercase flex justify-center items-center gap-2">
      <Languages size={14}/> Localize Description
     </button>
    </div>
   </div>
  </WidgetShell>
 )
}
