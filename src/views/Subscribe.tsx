import React, { useMemo, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { CheckCircle2, Lock, Sparkles } from "lucide-react"
import type { SubscriptionPlanId } from "../services/subscriptionPlans"
import {
 createCheckoutSession,
 getCurrentEntitlement,
 updatePlanEntitlement,
} from "../services/billingEntitlement"

const plans: Array<{
 id: SubscriptionPlanId
 tierLabel: string
 price: string
 bullets: string[]
 cta: string
}> = [
 {
  id: "starter",
  tierLabel: "Free",
  price: "$0",
  bullets: ["Public handle mode", "CSV/import workflows", "Core dashboard views"],
  cta: "Stay Free",
 },
 {
  id: "creator_plus",
  tierLabel: "Medium",
  price: "$29/mo",
  bullets: ["Token meter", "Monthly pool + daily accrual", "Advanced dashboards + tools"],
  cta: "Start Medium",
 },
 {
  id: "business_team",
  tierLabel: "Large",
  price: "$99/mo",
  bullets: ["Unlimited AI prompts", "Unlimited generations", "Top-tier access + team surface"],
  cta: "Start Large",
 },
]

const Subscribe: React.FC = () => {
 const location = useLocation()
 const query = useMemo(() => new URLSearchParams(location.search), [location.search])
 const from = query.get("from") || "/"
 const need = query.get("need") || "free"
 const [loadingPlan, setLoadingPlan] = useState<SubscriptionPlanId | null>(null)
 const [status, setStatus] = useState("")

 const entitlement = getCurrentEntitlement()

 const onChoosePlan = async (planId: SubscriptionPlanId) => {
  if (planId === "starter") {
   updatePlanEntitlement("starter")
   setStatus("Free plan active. You can keep exploring now.")
   return
  }

  try {
   setLoadingPlan(planId)
   setStatus("Creating secure checkout session...")
   const session = await createCheckoutSession({
    planId,
    userId: "local-user",
    successUrl: `${window.location.origin}${from}`,
    cancelUrl: `${window.location.origin}/subscribe`,
   })

   if (session.checkoutUrl.startsWith(window.location.origin)) {
    // Dev fallback path when billing backend is not wired yet.
    updatePlanEntitlement(planId)
    setStatus(`Dev mode checkout complete. ${planId} activated.`)
    window.location.href = from
    return
   }

   window.location.href = session.checkoutUrl
  } catch (error) {
   const message = error instanceof Error ? error.message : String(error)
   setStatus(`Checkout failed: ${message}`)
  } finally {
   setLoadingPlan(null)
  }
 }

 return (
  <div className="mx-auto max-w-6xl px-4 pb-24 pt-8 space-y-6 animate-fade-in">
   <div className="border-[4px] border-black rounded-2xl p-6 bg-[#CCFF00] shadow-[8px_8px_0px_0px_black]">
    <div className="flex items-start justify-between gap-4">
     <div>
      <p className="text-xs font-black uppercase tracking-[0.2em]">Launch Access Gate</p>
      <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mt-2">Unlock ViewTubeX</h1>
      <p className="font-bold mt-3">
       Required tier for this route: <span className="uppercase">{need}</span>
      </p>
      <p className="font-bold mt-1">
       Current tier: <span className="uppercase">{entitlement.tier}</span>
      </p>
     </div>
     <Lock size={36} strokeWidth={3} />
    </div>
   </div>

   <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
    {plans.map((plan) => {
     const active = entitlement.subscriptionPlanId === plan.id
     const loading = loadingPlan === plan.id
     return (
      <div
       key={plan.id}
       className="border-[4px] border-black rounded-2xl bg-white p-5 shadow-[8px_8px_0px_0px_black] flex flex-col gap-4"
      >
       <div className="flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-[0.2em]">{plan.tierLabel}</p>
        {active && <CheckCircle2 size={20} strokeWidth={3} />}
       </div>
       <h2 className="text-3xl font-black uppercase tracking-tight">{plan.price}</h2>
       <ul className="space-y-2">
        {plan.bullets.map((bullet) => (
         <li key={bullet} className="font-bold text-sm uppercase">• {bullet}</li>
        ))}
       </ul>
       <button
        onClick={() => onChoosePlan(plan.id)}
        disabled={loading}
        className="mt-auto border-[3px] border-black rounded-xl px-4 py-3 bg-[#FF8AAF] font-black uppercase text-sm shadow-[4px_4px_0px_0px_black] disabled:opacity-60"
       >
        {loading ? "Working..." : plan.cta}
       </button>
      </div>
     )
    })}
   </div>

   <div className="border-[3px] border-black rounded-xl bg-[#E5E7EB] p-4 font-bold">
    <div className="flex items-center gap-2 text-sm uppercase"><Sparkles size={16} /> Referral rewards</div>
    <p className="mt-2 text-sm">
     Referral conversion rule active: one free month is earned after each referred customer makes their first successful payment.
    </p>
   </div>

   {status && <p className="font-black uppercase text-sm">{status}</p>}

   <Link
    to={from}
    className="inline-block border-[3px] border-black rounded-xl px-4 py-2 bg-white font-black uppercase text-sm shadow-[4px_4px_0px_0px_black]"
   >
    Back
   </Link>
  </div>
 )
}

export default Subscribe
