import React, { useState } from "react"
import { WidgetShell } from "../WidgetShell"
import { DollarSign } from "lucide-react"

export const AdStackWidget = ({
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

 const currentRev = parseFloat(data.statBlocks.find((s: any) => s.label.toLowerCase() === "revenue")?.value.replace(/[^0-9.]/g, "") || "0.00")
 const [target, setTarget] = useState("5000")

 const cpm = 12.40;
 const targetViews = (parseInt(target) / (cpm / 1000)).toLocaleString(undefined, { maximumFractionDigits: 0 });

 return (
  <WidgetShell {...common} icon={<DollarSign size={22} />}>
   <div className="flex flex-col h-full gap-2 p-2">
    <div className="grid grid-cols-2 gap-3 flex-1 mb-2">
     <div className="flex flex-col justify-center bg-[#f5f5f5] border-[3px] border-black rounded-xl p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
      <span className="text-[9px] font-black uppercase opacity-40">Gross Rev</span>
      <div className="text-xl font-black">${currentRev.toFixed(2)}</div>
     </div>
     <div className="flex flex-col justify-center bg-[#f5f5f5] border-[3px] border-black rounded-xl p-3 shadow-[2px_2px_0px_0px_#C9F830]">
      <span className="text-[9px] font-black uppercase opacity-40">CPM (Est)</span>
      <div className="text-xl font-black text-[#8db11c]">${cpm.toFixed(2)}</div>
     </div>
    </div>

    {/* TARGET SIMULATOR */}
    <div className="flex flex-col gap-1 border-t-[3px] border-black pt-2">
     <span className="text-[9px] font-black uppercase">Revenue Yield Target</span>
     <div className="flex gap-2 items-center">
      <div className="flex-1 flex items-center bg-white border-[3px] border-black rounded-lg px-2">
       <span className="font-bold text-gray-500">$</span>
       <input 
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        className="w-full bg-transparent outline-none font-bold text-sm px-1 py-1"
       />
      </div>
     </div>
     <div className="bg-[#C9F830] border-[3px] border-black rounded p-1 text-center mt-1 font-black text-[9px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
      Needs {targetViews} Monetized Plays
     </div>
    </div>
   </div>
  </WidgetShell>
 )
}
