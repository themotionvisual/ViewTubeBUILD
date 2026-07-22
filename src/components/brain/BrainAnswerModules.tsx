import React from "react"
import { ArrowRight } from "lucide-react"
import type { AIBrainAnswerModule, BrainQuickAction } from "../../types"
import { sanitizeCreatorFacingBrainCopy } from "../../services/aiBrainConversationStore"

export type { BrainQuickAction }

/**
 * Tone -> palette mapping. Kept semantic (a "green" module renders green) so the
 * same module reads identically in the Brain Hub and the sidebar.
 */
const MODULE_TONE: Record<AIBrainAnswerModule["tone"], string> = {
 green: "#3FEE56",
 yellow: "#FFDA47",
 pink: "#FF7AC8",
 blue: "#36E0F6",
 orange: "#FFA85C",
 white: "#FFFFFF",
}

const cardShell = "overflow-hidden rounded-[10px] border-[2px] border-black bg-white"

export const BrainKpiModule: React.FC<{
 module: AIBrainAnswerModule
 compact?: boolean
 className?: string
}> = ({ module, compact = false, className = "" }) => (
 <section className={`${cardShell} ${className}`}>
  <div
   className="border-b-[2px] border-black px-3 py-2"
   style={{ backgroundColor: MODULE_TONE[module.tone] || MODULE_TONE.white }}
  >
   <h4 className="text-[12px] font-[1000] uppercase leading-4 tracking-[0.04em]">
    {sanitizeCreatorFacingBrainCopy(module.title)}
   </h4>
  </div>
  <div className={compact ? "p-2.5" : "p-3"}>
   <p className={`font-bold text-black/75 ${compact ? "text-xs leading-5" : "text-sm leading-6"}`}>
    {sanitizeCreatorFacingBrainCopy(module.body)}
   </p>
   {module.actionLabel ? (
    <div className="mt-3 inline-flex rounded-[8px] border-[2px] border-black bg-white px-2 py-1 text-[10px] font-black uppercase tracking-[0.08em]">
     {module.actionLabel}
    </div>
   ) : null}
  </div>
 </section>
)

export const BrainAnswerModuleGrid: React.FC<{
 modules: AIBrainAnswerModule[]
 compact?: boolean
}> = ({ modules, compact = false }) => {
 if (!modules.length) return null
 return (
  <div className={`grid gap-3 ${compact ? "" : "lg:grid-cols-2"}`}>
   {modules.map((module) => (
    <BrainKpiModule key={module.id} module={module} compact={compact} />
   ))}
  </div>
 )
}

const EFFORT_TEXT = ["", "5 minutes", "20 minutes", "An hour", "Half a day", "Multi-day"]
const REWARD_TEXT = ["", "Marginal", "Useful", "Solid", "Strong", "Channel-moving"]

const clampScore = (value: number): number => Math.max(1, Math.min(5, Math.round(value)))

/**
 * The effort x reward card. The Brain only surfaces actions with a strong
 * result-to-effort ratio, so both scores are always visible to the creator.
 */
export const BrainQuickActionCard: React.FC<{
 action: BrainQuickAction
 onAccept?: (action: BrainQuickAction) => void
 /** Secondary actions collapse to title + scores so the rail stays scannable. */
 compact?: boolean
}> = ({ action, onAccept, compact = false }) => {
 const effort = clampScore(action.effort)
 const reward = clampScore(action.reward)

 if (compact) {
  return (
   <button
    type="button"
    onClick={() => onAccept?.(action)}
    className="group flex w-full items-start justify-between gap-2 rounded-[8px] border-[2px] border-black bg-white px-2.5 py-2 text-left transition hover:bg-[#FFDA47]"
   >
    <span className="min-w-0">
     <span className="block text-[10px] font-[1000] uppercase leading-4">
      {sanitizeCreatorFacingBrainCopy(action.title)}
     </span>
     <span className="mt-0.5 block text-[9px] font-black uppercase tracking-[0.06em] text-black/45">
      {EFFORT_TEXT[effort]} · {REWARD_TEXT[reward]} payoff
     </span>
    </span>
    <ArrowRight size={13} className="mt-0.5 shrink-0 transition group-hover:translate-x-0.5" />
   </button>
  )
 }

 return (
  <article className={cardShell}>
   <h4 className="border-b-[2px] border-black bg-[#C0F240] px-2.5 py-1.5 text-[11px] font-[1000] uppercase leading-4 tracking-[0.04em]">
    {sanitizeCreatorFacingBrainCopy(action.title)}
   </h4>
   <div className="grid gap-2 p-2.5">
    <p className="text-[11px] font-bold leading-4 text-black/75">
     {sanitizeCreatorFacingBrainCopy(action.body)}
    </p>
    <div className="flex flex-wrap gap-1">
     <span className="rounded-[7px] border-[2px] border-black bg-white px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.06em]">
      {EFFORT_TEXT[effort]}
     </span>
     <span className="rounded-[7px] border-[2px] border-black bg-[#FFDA47] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.06em]">
      {REWARD_TEXT[reward]} payoff
     </span>
    </div>
    {onAccept ? (
     <button
      type="button"
      onClick={() => onAccept(action)}
      className="inline-flex w-fit items-center gap-1.5 rounded-[7px] border-[2px] border-black bg-[#3FEE56] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.06em] hover:bg-[#FFDA47]"
     >
      {action.routeLabel || "Start this"}
      <ArrowRight size={12} />
     </button>
    ) : null}
   </div>
  </article>
 )
}

export default BrainKpiModule
