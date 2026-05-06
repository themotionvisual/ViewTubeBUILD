import React, { useState } from "react"
import { WidgetShell } from "../WidgetShell"
import { Monitor, Smartphone, Tv } from "lucide-react"

export const DeviceMatrixWidget = ({ widget, instance, editMode, onToggleCollapse, onCycleSize, onDecSize, onCycleHeight, onDecHeight, onRemove, data }: any) => {
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

 const [device, setDevice] = useState<"mobile" | "desktop" | "tv">("mobile")
 const title = data.topPerformer?.title || "My Awesome Video Title Over two lines..."

 return (
  <WidgetShell {...common} icon={<Monitor size={22} />}>
   <div className="flex flex-col h-full gap-2 p-2">
    <div className="flex rounded-lg overflow-hidden border-[3px] border-black mb-2">
     <button onClick={() => setDevice("mobile")} className={`flex-1 flex justify-center items-center py-1 ${device==='mobile'?'bg-black text-[#FFB570]':'bg-white text-black'}`}><Smartphone size={14}/></button>
     <button onClick={() => setDevice("desktop")} className={`flex-1 flex justify-center items-center py-1 border-x-[3px] border-black ${device==='desktop'?'bg-black text-[#FFB570]':'bg-white text-black'}`}><Monitor size={14}/></button>
     <button onClick={() => setDevice("tv")} className={`flex-1 flex justify-center items-center py-1 ${device==='tv'?'bg-black text-[#FFB570]':'bg-white text-black'}`}><Tv size={14}/></button>
    </div>

    <div className="flex-1 bg-gray-100 border-[3px] border-black rounded-lg p-2 flex items-center justify-center relative shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1)]">
      {/* Mini Preview rendering */}
      <div className={`
       bg-white border-2 border-black flex overflow-hidden shadow-sm
       ${device === 'mobile' ? 'flex-col w-[60px] h-[100px] rounded-sm' : ''}
       ${device === 'desktop' ? 'flex-col w-[120px] h-[90px] rounded-md' : ''}
       ${device === 'tv' ? 'w-full h-full rounded-md object-cover relative' : ''}
      `}>
       <div className={`bg-gray-300 border-black ${device==='tv'?'w-full h-full':'w-full h-1/2 border-b-2'}`} />
       {device !== 'tv' && (
        <div className="p-1">
         <div className="bg-black h-1 rounded mb-1 w-full" />
         <div className="bg-gray-400 h-1 rounded w-2/3" />
        </div>
       )}
      </div>
      <div className="absolute bottom-2 right-2 px-1 bg-black text-[#FFB570] text-[7px] font-black uppercase rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
       {device.toUpperCase()} PREVIEW
      </div>
    </div>
   </div>
  </WidgetShell>
 )
}
