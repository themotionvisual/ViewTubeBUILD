import React, { useState } from "react"
import { WidgetShell } from "../WidgetShell"
import { Database, Zap } from "lucide-react"

export const PlaybackOriginsWidget = ({
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

 const [source, setSource] = useState("Search")

 return (
  <WidgetShell {...common} icon={<Database size={22} />}>
   <div className="flex flex-col h-full gap-2 p-2">
    <div className="flex gap-2 mb-2">
     {["Search", "Browse", "Suggested"].map(s => (
      <button 
       key={s}
       onClick={() => setSource(s)}
       className={`flex-1 py-1 rounded border-[2px] border-black text-[9px] font-black uppercase ${source === s ? 'bg-black text-[#00D2FF]':'bg-white text-black'}`}>
       {s}
      </button>
     ))}
    </div>
    
    <div className="flex-1 bg-gray-50 border-[3px] border-black rounded-lg p-2 flex flex-col gap-2 shadow-[inset_2px_2px_0px_rgba(0,0,0,0.05)]">
     <span className="text-[10px] font-black uppercase text-[#00D2FF]">Traffic Attack Plan: {source}</span>
     <ul className="text-[9px] font-bold flex flex-col gap-1 list-disc pl-4 opacity-80">
      {source === "Search" && (
       <><li>Add target keyword to first 100 chars of desc.</li><li>Change thumbnail text to match Exact Match Query.</li></>
      )}
      {source === "Browse" && (
       <><li>Increase thumbnail saturation +10%.</li><li>Use "Curiosity Gap" in Title.</li></>
      )}
      {source === "Suggested" && (
       <><li>Match the first 10s pacing of top competitor.</li><li>Mirror competitor's tag structure.</li></>
      )}
     </ul>
     <button className="mt-auto self-end px-3 py-1 bg-[#00D2FF] text-black border-[3px] border-black rounded font-black text-[8px] uppercase flex items-center gap-1 shadow-[2px_2px_0px_0px_#000]">
      <Zap size={10} /> Execute
     </button>
    </div>
   </div>
  </WidgetShell>
 )
}
