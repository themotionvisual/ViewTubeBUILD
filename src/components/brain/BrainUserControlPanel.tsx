import React, { useEffect, useState } from "react"
import { Settings2, ShieldCheck, X } from "lucide-react"
import {
 DEFAULT_BRAIN_USER_CONTROLS,
 clearBrainUserControlOverride,
 readBrainUserControls,
 writeBrainUserControls,
 type BrainUserControls,
} from "../../services/brain/BrainUserControls"

const Row: React.FC<{
 label: string
 detail: string
 value: boolean
 onChange: (value: boolean) => void
}> = ({ label, detail, value, onChange }) => (
 <label className="flex items-center justify-between gap-3 border-b-[2px] border-black/10 py-2 last:border-b-0">
  <span className="min-w-0">
   <span className="block text-[10px] font-[1000] uppercase tracking-tight">{label}</span>
   <span className="block text-[9px] font-bold leading-4 text-black/50">{detail}</span>
  </span>
  <input
   type="checkbox"
   checked={value}
   onChange={(event) => onChange(event.target.checked)}
   className="h-5 w-5 shrink-0 accent-black"
  />
 </label>
)

export const BrainUserControlPanel: React.FC<{
 open: boolean
 onClose: () => void
 onChange?: (controls: BrainUserControls) => void
 channelId?: string | null
}> = ({ open, onClose, onChange, channelId = null }) => {
 const [controls, setControls] = useState<BrainUserControls>(() => readBrainUserControls(channelId))

 useEffect(() => {
  if (!open) return
  setControls(readBrainUserControls(channelId))
 }, [open, channelId])

 if (!open) return null

 const patch = (next: Partial<BrainUserControls>) => {
  const saved = writeBrainUserControls({ ...controls, ...next }, channelId)
  setControls(saved)
  onChange?.(saved)
 }

 const reset = () => {
  const saved = channelId
   ? clearBrainUserControlOverride(channelId)
   : writeBrainUserControls(DEFAULT_BRAIN_USER_CONTROLS)
  setControls(saved)
  onChange?.(saved)
 }

 return (
  <div className="absolute inset-0 z-30 flex flex-col bg-white" aria-label="Brain user controls">
   <header className="flex items-center justify-between border-b-[3px] border-black bg-[#FFDA47] px-3 py-2">
    <div className="min-w-0">
     <div className="flex items-center gap-2 text-[11px] font-[1000] uppercase"><ShieldCheck size={16} />Brain User Controls</div>
     <p className="mt-0.5 truncate text-[8px] font-black uppercase text-black/50">
      {channelId ? `Channel profile · ${channelId}` : "Global defaults"} · creator rules override Brain defaults
     </p>
    </div>
    <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-[7px] border-[2px] border-black bg-white" aria-label="Close Brain controls"><X size={15} /></button>
   </header>

   <div className="min-h-0 flex-1 overflow-y-auto p-3">
    <Row label="Brain enabled" detail="Master switch for ViewTube Brain surfaces." value={controls.enabled} onChange={(value) => patch({ enabled: value })} />
    <Row label="Personalization" detail="Use this channel profile, goals, memory and learned patterns." value={controls.personalization} onChange={(value) => patch({ personalization: value })} />
    <Row label="Show evidence" detail="Expose why a recommendation was made and what channel data supports it." value={controls.showEvidence} onChange={(value) => patch({ showEvidence: value })} />
    <Row label="Learn from interactions" detail="Allow accepted/rejected outputs and corrections to improve this channel model." value={controls.learnFromInteractions} onChange={(value) => patch({ learnFromInteractions: value })} />
    <Row label="Analytics access" detail="Allow Brain to use canonical VT-SYNC / analytics evidence for this channel." value={controls.allowAnalytics} onChange={(value) => patch({ allowAnalytics: value })} />
    <Row label="Projects access" detail="Allow Brain to read or prepare internal Project actions." value={controls.allowProjects} onChange={(value) => patch({ allowProjects: value })} />
    <Row label="Comments access" detail="Allow audience/comment context in Brain workflows." value={controls.allowComments} onChange={(value) => patch({ allowComments: value })} />
    <Row label="Vault access" detail="Allow Brain to use creator-owned Vault asset metadata." value={controls.allowVault} onChange={(value) => patch({ allowVault: value })} />
    <Row label="Publisher access" detail="Allow Brain to prepare publishing/metadata workflows." value={controls.allowPublisher} onChange={(value) => patch({ allowPublisher: value })} />
    <Row label="Confirm external actions" detail="Brain-initiated external posting, Sheets, Drive, or publishing actions must stop for creator approval." value={controls.externalActionsRequireApproval} onChange={(value) => patch({ externalActionsRequireApproval: value })} />
    <Row label="De-identified research contribution" detail="Separate opt-in for aggregate product research; personal learning does not require this." value={controls.contributeDeidentifiedResearch} onChange={(value) => patch({ contributeDeidentifiedResearch: value })} />
   </div>

   <footer className="grid grid-cols-2 gap-2 border-t-[3px] border-black bg-[#f7f7f3] p-2">
    <button type="button" onClick={reset} className="rounded-[8px] border-[2px] border-black bg-white px-2 py-2 text-[9px] font-[1000] uppercase">{channelId ? "Use global defaults" : "Reset defaults"}</button>
    <button type="button" onClick={onClose} className="inline-flex items-center justify-center gap-1 rounded-[8px] border-[2px] border-black bg-[#3FEE56] px-2 py-2 text-[9px] font-[1000] uppercase"><Settings2 size={12} />Done</button>
   </footer>
  </div>
 )
}

export default BrainUserControlPanel
