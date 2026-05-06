import React from "react"
import { WidgetShell } from "../WidgetShell"
import { TrendingUp, Upload } from "lucide-react"

export const ReachFunnelWidget = ({ widget, instance, editMode, onToggleCollapse, onCycleSize, onDecSize, onCycleHeight, onDecHeight, onRemove, data }: any) => {
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

 const impressions = data.brain?.recentMetrics?.totalImpressions || 1450000;
 const ctr = data.brain?.recentMetrics?.ctr || 5.2;

 return (
  <WidgetShell {...common} icon={<TrendingUp size={22} />}>
   <div className="flex flex-col h-full gap-2 p-2">
    <div className="flex justify-between items-end border-b-[3px] border-black pb-2">
     <div className="flex flex-col">
      <span className="text-[10px] font-black uppercase opacity-40">
       Thumbnail Impressions
      </span>
      <div className="text-3xl font-[1000] leading-none">
       {Math.round(impressions).toLocaleString()}
      </div>
     </div>
     <div className="flex flex-col items-end">
      <span className="text-[10px] font-black uppercase text-[#00CCFF]">
       Click Through Rate
      </span>
      <div className="text-2xl font-[1000] text-[#00CCFF] leading-none">
       {ctr.toFixed(1)}%
      </div>
     </div>
    </div>
    
    {/* CTR SIMULATOR INPUT */}
    <div className="flex-1 flex flex-col justify-end gap-2 mt-2">
       <span className="text-[10px] font-black uppercase">Simulate CTR Impact</span>
       <div className="flex gap-2">
        <input 
         className="flex-1 px-3 border-[3px] border-black rounded-lg text-sm font-bold bg-[#f5f5f5] focus:bg-white focus:outline-none" 
         placeholder="Enter target CTR (e.g. 7.5)"
         defaultValue="6.5"
        />
        <button className="px-4 py-1 bg-[#00CCFF] border-[3px] border-black rounded-lg shadow-[2px_2px_0px_0px_#000] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#000] transition-all font-black text-[10px] uppercase">
         Simulate
        </button>
       </div>
    </div>
   </div>
  </WidgetShell>
 )
}
