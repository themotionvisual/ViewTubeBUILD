import React, { useState } from "react"
import { WidgetShell } from "../WidgetShell"
import { Activity, Zap } from "lucide-react"

export const AlgoBenchmarkWidget = ({ widget, instance, editMode, onToggleCollapse, onCycleSize, onDecSize, onCycleHeight, onDecHeight, onRemove, data }: any) => {
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

 const [diagnostic, setDiagnostic] = useState<string | null>(null)

 return (
  <WidgetShell {...common} icon={<Activity size={22} />}>
   <div className="flex flex-col h-full gap-2 p-2">
    <div className="flex justify-between items-baseline border-b-[3px] border-black pb-2">
     <span className="text-[10px] font-black uppercase opacity-40">
      Algo Benchmark
     </span>
     <span className="text-lg font-black uppercase text-[#FF00FF]">
      EXCEPTIONAL
     </span>
    </div>
    <div className="flex-1 bg-gray-50 border-[3px] border-black rounded-xl relative overflow-hidden flex flex-col p-2">
     <div className="flex justify-between items-center z-20">
      <span className="text-[9px] font-black uppercase bg-black text-white px-2 py-0.5 rounded shadow-[2px_2px_0px_0px_#FF00FF]">BIG DROP @ 2:14</span>
     </div>
     
     {/* Mock Curve */}
     <svg viewBox="0 0 100 100" className="w-full h-full opacity-30 absolute inset-0 z-0">
      <path d="M0 80 Q 50 60 100 20" fill="none" stroke="black" strokeWidth="2" strokeDasharray="4" />
     </svg>
     <div className="absolute inset-x-0 bottom-0 top-1/2 bg-[#FF00FF]/20 border-t-[3px] border-[#FF00FF] z-10" />

     {/* DIAGNOSTIC BUTTON */}
     <div className="mt-auto z-20 flex justify-center">
      {diagnostic ? (
       <div className="bg-white border-[3px] border-black p-2 rounded-lg text-[9px] font-bold w-full uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
        {diagnostic}
       </div>
      ) : (
       <button 
        onClick={() => setDiagnostic("AI FIX: Add pattern interrupt at 2:14 to retain 8% more viewers.")}
        className="px-3 py-1 bg-white border-[3px] border-black rounded-lg shadow-[2px_2px_0px_0px_#000] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#000] transition-all font-black text-[9px] uppercase flex items-center gap-1">
        <Zap size={10} color="#FF00FF" fill="#FF00FF" /> Fix Drop
       </button>
      )}
     </div>
    </div>
   </div>
  </WidgetShell>
 )
}
