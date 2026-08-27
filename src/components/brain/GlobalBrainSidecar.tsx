import React, { useEffect, useMemo, useState } from "react"
import { Brain, ChevronDown, Settings2, X } from "lucide-react"
import { useLocation } from "react-router-dom"
import { SidebarChatbot } from "../SidebarChatbot"
import {
 readBrainUserControls,
 type BrainUserControls,
} from "../../services/brain/BrainUserControls"
import { parseBrainSurfaceContextFromLocation } from "../../services/brain/BrainSurfaceContext"
import { BrainUserControlPanel } from "./BrainUserControlPanel"

const OPEN_KEY = "vt_brain_sidecar_open_v1"

export const GlobalBrainSidecar: React.FC = () => {
 const location = useLocation()
 const [open, setOpen] = useState(() => localStorage.getItem(OPEN_KEY) === "true")
 const [controls, setControls] = useState<BrainUserControls>(() => readBrainUserControls())
 const [showControls, setShowControls] = useState(false)

 useEffect(() => {
  const onControls = (event: Event) => {
   const detail = (event as CustomEvent<BrainUserControls>).detail
   setControls(detail || readBrainUserControls())
  }
  window.addEventListener("vt_brain_user_controls_changed", onControls as EventListener)
  return () => window.removeEventListener("vt_brain_user_controls_changed", onControls as EventListener)
 }, [])

 const surface = useMemo(
  () => parseBrainSurfaceContextFromLocation(location, controls),
  [location.pathname, location.search, controls],
 )

 const setOpenState = (value: boolean) => {
  setOpen(value)
  localStorage.setItem(OPEN_KEY, String(value))
 }

 if (!controls.enabled) {
  return (
   <button
    type="button"
    onClick={() => setShowControls(true)}
    className="fixed bottom-4 right-4 z-[80] inline-flex items-center gap-2 rounded-[10px] border-[3px] border-black bg-[#FFDA47] px-3 py-2 text-[9px] font-[1000] uppercase shadow-[4px_4px_0_0_#000]"
   >
    <Brain size={15} />Brain Off · Controls
    <span className="hidden"><BrainUserControlPanel open={showControls} onClose={() => setShowControls(false)} onChange={setControls} /></span>
   </button>
  )
 }

 if (!open) {
  return (
   <button
    type="button"
    onClick={() => setOpenState(true)}
    className="fixed bottom-4 right-4 z-[80] inline-flex items-center gap-2 rounded-[12px] border-[3px] border-black bg-[#C0F240] px-4 py-3 text-[10px] font-[1000] uppercase shadow-[5px_5px_0_0_#000] transition hover:-translate-y-0.5"
    aria-label="Open ViewTube Brain"
   >
    <Brain size={17} />Brain
   </button>
  )
 }

 return (
  <aside className="fixed bottom-3 right-3 z-[90] flex max-h-[calc(100dvh-24px)] w-[min(440px,calc(100vw-24px))] flex-col overflow-hidden rounded-[16px] border-[3px] border-black bg-white shadow-[8px_8px_0_0_#000]" aria-label="ViewTube Brain sidecar">
   <header className="flex shrink-0 items-center gap-2 border-b-[3px] border-black bg-[#A96CFF] px-3 py-2">
    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[8px] border-[2px] border-black bg-white"><Brain size={18} /></div>
    <div className="min-w-0 flex-1">
     <h2 className="truncate text-[12px] font-[1000] uppercase tracking-tight">ViewTube Brain</h2>
     <p className="truncate text-[8px] font-black uppercase text-black/55">{surface.capabilityIds.length ? surface.capabilityIds.join(" · ") : "Channel context"}</p>
    </div>
    <button type="button" onClick={() => setShowControls(true)} className="grid h-8 w-8 place-items-center rounded-[7px] border-[2px] border-black bg-[#FFDA47]" aria-label="Brain controls"><Settings2 size={14} /></button>
    <button type="button" onClick={() => setOpenState(false)} className="grid h-8 w-8 place-items-center rounded-[7px] border-[2px] border-black bg-white" aria-label="Minimize Brain"><ChevronDown size={15} /></button>
    <button type="button" onClick={() => setOpenState(false)} className="hidden h-8 w-8 place-items-center rounded-[7px] border-[2px] border-black bg-white" aria-label="Close Brain"><X size={15} /></button>
   </header>

   <div className="flex flex-wrap gap-1 border-b-[2px] border-black bg-[#f7f7f3] px-2 py-1.5">
    <span className="rounded-full border-[1.5px] border-black bg-white px-2 py-0.5 text-[7px] font-[1000] uppercase">{location.pathname}</span>
    {surface.superToolIds.slice(0, 2).map((id) => <span key={id} className="rounded-full border-[1.5px] border-black bg-[#36E0F6] px-2 py-0.5 text-[7px] font-[1000] uppercase">{id}</span>)}
    {surface.blockedCapabilities.length ? <span className="rounded-full border-[1.5px] border-black bg-[#FF7497] px-2 py-0.5 text-[7px] font-[1000] uppercase">{surface.blockedCapabilities.length} blocked</span> : null}
   </div>

   <div className="min-h-0 flex-1 overflow-y-auto p-2">
    <SidebarChatbot />
   </div>

   <BrainUserControlPanel open={showControls} onClose={() => setShowControls(false)} onChange={setControls} />
  </aside>
 )
}

export default GlobalBrainSidecar
