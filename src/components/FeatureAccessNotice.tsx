import React from "react"
import { Link } from "react-router-dom"
import { LockKeyhole, RotateCw, ShieldCheck } from "lucide-react"
import { useFeatureAccess } from "../context/featureAccessContext"
import { FEATURE_GATING_MODE, featureGateDefinition, type FeatureGateId } from "../services/featureGating"

export const FeatureAccessNotice: React.FC<{ featureId: FeatureGateId; compact?: boolean }> = ({ featureId, compact }) => {
  const access = useFeatureAccess()
  const gate = featureGateDefinition(featureId)
  const decision = access.decision(featureId)
  if (decision.disposition === "enabled" && !compact) return null
  const tone = decision.disposition === "enabled" ? "#CCFF00" : decision.disposition === "upgrade" || decision.disposition === "insufficient_credits" ? "#FFE357" : "#40C6E9"
  return (
    <aside className={`flex min-w-0 flex-wrap items-center gap-3 border-[3px] border-black bg-white ${compact ? "rounded-xl p-3" : "mb-4 rounded-2xl p-4 shadow-[5px_5px_0_0_#000]"}`} aria-label={`${gate.label} access status`}>
      <span className="grid size-9 shrink-0 place-items-center rounded-lg border-[2px] border-black" style={{ backgroundColor: tone }} aria-hidden>{decision.disposition === "enabled" ? <ShieldCheck size={18} /> : <LockKeyhole size={18} />}</span>
      <span className="min-w-[190px] flex-1"><strong className="block text-xs font-black uppercase tracking-[.12em]">{gate.label} · {access.checking ? "checking" : decision.disposition.replaceAll("_", " ")}</strong><small className="mt-1 block font-bold text-black/65">{access.checking ? "Verifying account access…" : decision.reason} {FEATURE_GATING_MODE === "advisory" ? "Foundation preview; current tool access is unchanged." : ""}</small></span>
      {decision.href && decision.actionLabel ? <Link to={decision.href} className="rounded-lg border-[3px] border-black bg-[#CCFF00] px-3 py-2 text-xs font-black uppercase shadow-[2px_2px_0_0_#000]">{decision.actionLabel}</Link> : null}
      {!access.verified && !access.checking ? <button type="button" onClick={() => void access.refresh()} className="inline-flex items-center gap-2 rounded-lg border-[3px] border-black bg-white px-3 py-2 text-xs font-black uppercase"><RotateCw size={15} /> Retry</button> : null}
    </aside>
  )
}
