import React, { useMemo, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { CheckCircle2, Lock, Sparkles } from "lucide-react"
import type { SubscriptionPlanId } from "../services/subscriptionPlans"
import {
 createCheckoutSession,
 fetchEntitlementFromServer,
 getReferralRedemptionCode,
 saveReferralRedemptionCode,
 getCurrentEntitlement,
 isOwnerEmail,
 setKnownUserEmail,
 updatePlanEntitlement,
} from "../services/billingEntitlement"

const plans: Array<{
 id: SubscriptionPlanId
 tierLabel: string
 description: string
 price: string
 bullets: string[]
 cta: string
}> = [
 {
  id: "basic",
  tierLabel: "Basic",
  description: "Experience the core tools of ViewTube with foundational access to your channel's essential data.",
  price: "$0",
  bullets: ["Public handle mode", "CSV/import workflows", "Core dashboard views"],
  cta: "Stay Basic",
 },
 {
  id: "creator",
  tierLabel: "Creator",
  description: "Jumpstart your channel’s growth with increased limits and expanded insights for dedicated creators.",
  price: "$9.99/mo",
  bullets: ["Included AI credits", "Advanced dashboards + tools", "48-hour trial"],
  cta: "Start Creator",
 },
 {
  id: "creator_plus",
  tierLabel: "Creator Plus",
  description: "Accelerate your content strategy with deeper analytics and higher data capacity to sustain consistent channel development.",
  price: "$19.99/mo",
  bullets: ["More included AI credits", "Priority generation capacity", "48-hour trial"],
  cta: "Start Creator Plus",
 },
 {
  id: "creator_pro",
  tierLabel: "Creator Pro",
  description: "Master your algorithm performance with advanced intelligence tools designed to scale your reach and maximize engagement.",
  price: "$39.99/mo",
  bullets: ["Highest capped creator credits", "Full strategy stack", "48-hour trial"],
  cta: "Start Creator Pro",
 },
 {
  id: "executive",
  tierLabel: "Executive",
  description: "Command your entire ecosystem with unrestricted access, custom integrations, and total strategic authority over your video business.",
  price: "$69.99/mo",
  bullets: ["Unlimited AI generation", "Executive priority", "48-hour trial"],
  cta: "Start Executive",
 },
]

const Subscribe: React.FC = () => {
 const location = useLocation()
 const query = useMemo(() => new URLSearchParams(location.search), [location.search])
 const from = query.get("from") || "/"
 const need = query.get("need") || "free"
 const [loadingPlan, setLoadingPlan] = useState<SubscriptionPlanId | null>(null)
 const [status, setStatus] = useState("")
 const [referralCode, setReferralCode] = useState(() => getReferralRedemptionCode())
 const [signupEmail, setSignupEmail] = useState(
  () => String(localStorage.getItem("vt_signup_email") || "").trim().toLowerCase(),
 )

 const entitlement = getCurrentEntitlement()

 const persistSignupEmail = async (): Promise<string | null> => {
  const normalized = String(signupEmail || "").trim().toLowerCase()
  if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
   setStatus("Enter a valid email to continue signup.")
   return null
  }
  localStorage.setItem("vt_signup_email", normalized)
  setKnownUserEmail(normalized)
  if (isOwnerEmail(normalized)) {
   await fetchEntitlementFromServer(normalized)
   setStatus("Owner account recognized. You can continue signup or checkout.")
  } else {
   setStatus("Email saved. Continue with plan selection.")
  }
  return normalized
 }

 const onChoosePlan = async (planId: SubscriptionPlanId) => {
  const userEmail = await persistSignupEmail()
  if (!userEmail) return

  if (planId === "basic") {
   updatePlanEntitlement("basic")
   setStatus("Free plan active. You can keep exploring now.")
   return
  }

  try {
   setLoadingPlan(planId)
   setStatus("Creating secure checkout session...")
   const session = await createCheckoutSession({
    planId,
    userId: userEmail,
    successUrl: `${window.location.origin}${from}`,
    cancelUrl: `${window.location.origin}/subscribe`,
    referralCode: referralCode || undefined,
   })

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
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <input
       type="email"
       value={signupEmail}
       onChange={(e) => setSignupEmail(e.target.value.toLowerCase())}
       placeholder="Email for account signup"
       className="w-full max-w-[360px] border-[3px] border-black rounded-xl px-3 py-2 font-black"
      />
      <button
       onClick={() => void persistSignupEmail()}
       className="border-[3px] border-black rounded-xl px-4 py-2 bg-white font-black uppercase text-xs shadow-[3px_3px_0px_0px_black]">
       Continue Signup
      </button>
    </div>
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <input
       value={referralCode}
       onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
       placeholder="Referral code (optional)"
       className="w-full max-w-[320px] border-[3px] border-black rounded-xl px-3 py-2 font-black uppercase"
      />
      <button
       onClick={() => {
        saveReferralRedemptionCode(referralCode)
        setStatus("Referral code saved.")
       }}
       className="border-[3px] border-black rounded-xl px-4 py-2 bg-white font-black uppercase text-xs shadow-[3px_3px_0px_0px_black]">
       Apply Code
      </button>
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
       <p className="text-sm font-bold opacity-70 italic">{plan.description}</p>
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
