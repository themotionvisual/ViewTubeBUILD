import React, { useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { CheckCircle2, Lock, Sparkles } from "lucide-react"
import type { SubscriptionPlanId } from "../services/subscriptionPlans"
import {
 createCheckoutSession,
 getReferralRedemptionCode,
 saveReferralRedemptionCode,
} from "../services/billingEntitlement"
import { useUnifiedAccount } from "../context/UnifiedAccountContext"
import { activateUnifiedFreePlan, updateUnifiedOnboarding } from "../services/account/accountCoordinator"
import { useBrain } from "../context/useBrain"
import { buildAccountRoute } from "../services/account/accountContracts"
import { useEntitlement } from "../context/entitlementContext"

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
  id: "beta",
  tierLabel: "Beta Version",
  description: "Community-driven access. Use your own Gemini API key for all AI features. No credit card required.",
  price: "$0",
  bullets: ["Unlimited AI (BYOK)", "Full strategy stack", "No credit card"],
  cta: "Connect Beta",
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
 const navigate = useNavigate()
 const location = useLocation()
 const account = useUnifiedAccount()
 const entitlement = useEntitlement()
 const { authState, connectChannel } = useBrain()
 const accountAuthenticated = account.serverEnabled
  ? account.snapshot.authentication.status === "authenticated"
  : authState.isAuthenticated
 const startAccount = async (pendingPlan?: SubscriptionPlanId | null) => {
  const resumeQuery = new URLSearchParams(location.search)
  if (pendingPlan) resumeQuery.set("plan", pendingPlan)
  const resumePath = `/subscribe${resumeQuery.size ? `?${resumeQuery.toString()}` : ""}`
  if (account.serverEnabled) navigate(buildAccountRoute(account.intent, resumePath))
  else await connectChannel()
 }
 const query = useMemo(() => new URLSearchParams(location.search), [location.search])
 const from = query.get("from") || "/"
 const need = query.get("need") || "free"
 const [loadingPlan, setLoadingPlan] = useState<SubscriptionPlanId | null>(null)
 const [status, setStatus] = useState("")
 const [referralCode, setReferralCode] = useState(() => getReferralRedemptionCode())
 const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
 const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanId | null>(() => {
  const plan = query.get("plan") as SubscriptionPlanId | null
  return plans.some((candidate) => candidate.id === plan) ? plan : null
 })

 const startCheckout = async () => {
  if (!selectedPlan) {
   setStatus("Select a plan to continue.")
   return
  }
  if (!accountAuthenticated) {
   await startAccount(selectedPlan)
   return
  }

  if (selectedPlan === "basic" || selectedPlan === "beta") {
   if (!account.serverEnabled) {
    setStatus("The unified account server must be enabled before activating a plan.")
    return
   }
   await activateUnifiedFreePlan(selectedPlan)
   await updateUnifiedOnboarding({ status: "in_progress", nextStep: "first_sync" })
   navigate("/?onboarding=welcome", { replace: true })
   return
  }

  try {
   setLoadingPlan(selectedPlan)
   setStatus("Creating secure checkout session...")
   const session = await createCheckoutSession({
    planId: selectedPlan,
    successUrl: `${window.location.origin}/?onboarding=welcome`,
    cancelUrl: `${window.location.origin}/subscribe`,
    referralCode: referralCode || undefined,
   })

   window.location.href = session.checkoutUrl
  } catch (error) {
   const message = error instanceof Error ? error.message : String(error)
   if (message.toLowerCase().includes("no such price") || message.toLowerCase().includes("missing stripe price env")) {
    setStatus("This plan is not fully configured in Stripe yet. Add the missing plan price ID.")
    return
   }
   setStatus(`Checkout failed: ${message}`)
  } finally {
   setLoadingPlan(null)
  }
 }

 const stepTitle =
  step === 1
   ? "Step 1 • Account"
   : step === 2
   ? "Step 2 • Plan"
   : step === 3
   ? "Step 3 • Referral (Optional)"
   : "Step 4 • Activate"

 const selectedPlanConfig = plans.find((plan) => plan.id === selectedPlan) || null

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
    <div className="mt-5 border-[3px] border-black rounded-2xl bg-white p-4 md:p-5">
      <div className="text-xs font-black uppercase tracking-[0.2em]">{stepTitle}</div>
      {step === 1 && (
        <div className="mt-3 space-y-3">
          <p className="max-w-[620px] text-sm font-bold">
            {accountAuthenticated
              ? `Signed in as ${account.snapshot.profile.email || "your ViewTube account"}.`
              : "Create or restore your ViewTube account before selecting a subscription."}
          </p>
          <button
            onClick={async () => {
              if (!accountAuthenticated) {
                await startAccount(selectedPlan)
                return
              }
              setStep(2)
            }}
            className="border-[3px] border-black rounded-xl px-4 py-2 bg-[#4FFF5B] font-black uppercase text-xs shadow-[3px_3px_0px_0px_black]"
          >
            {accountAuthenticated ? "Continue" : account.label}
          </button>
        </div>
      )}
      {step === 2 && (
        <div className="mt-3 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {plans.map((plan) => {
              const active = selectedPlan === plan.id
              return (
                <button
                  key={plan.id}
                  onClick={() => {
                    setSelectedPlan(plan.id)
                    void updateUnifiedOnboarding({ status: "in_progress", nextStep: "referral" })
                  }}
                  className={`text-left border-[3px] rounded-2xl p-3 shadow-[3px_3px_0px_0px_black] ${
                    active ? "border-black bg-[#C9F830]" : "border-black bg-white"
                  }`}
                >
                  <div className="text-[10px] font-black uppercase tracking-[0.2em]">{plan.tierLabel}</div>
                  <div className="text-2xl font-black uppercase">{plan.price}</div>
                  <div className="text-xs font-bold uppercase opacity-70 mt-1">{plan.bullets[0]}</div>
                </button>
              )
            })}
          </div>
          <button
            onClick={() => {
              if (!selectedPlan) {
                setStatus("Select a plan to continue.")
                return
              }
              setStep(3)
            }}
            className="border-[3px] border-black rounded-xl px-4 py-2 bg-[#4FFF5B] font-black uppercase text-xs shadow-[3px_3px_0px_0px_black]"
          >
            Continue
          </button>
        </div>
      )}
      {step === 3 && (
        <div className="mt-3 space-y-3">
          <input
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
            placeholder="Referral code (optional)"
            className="w-full max-w-[360px] border-[3px] border-black rounded-xl px-3 py-2 font-black uppercase"
          />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                saveReferralRedemptionCode(referralCode)
                void updateUnifiedOnboarding({ status: "in_progress", nextStep: "activate_plan" })
                setStep(4)
              }}
              className="border-[3px] border-black rounded-xl px-4 py-2 bg-[#4FFF5B] font-black uppercase text-xs shadow-[3px_3px_0px_0px_black]"
            >
              Continue
            </button>
            <button
              onClick={() => {
                void updateUnifiedOnboarding({ status: "in_progress", nextStep: "activate_plan" })
                setStep(4)
              }}
              className="border-[3px] border-black rounded-xl px-4 py-2 bg-white font-black uppercase text-xs shadow-[3px_3px_0px_0px_black]"
            >
              Skip
            </button>
          </div>
        </div>
      )}
      {step === 4 && (
        <div className="mt-3 space-y-3">
          <div className="border-[2px] border-black rounded-xl p-3 bg-[#f3f4f6]">
            <div className="text-[10px] font-black uppercase tracking-[0.14em]">Selected Plan</div>
            <div className="text-xl font-black uppercase">{selectedPlanConfig?.tierLabel || "None selected"}</div>
            <div className="text-sm font-bold uppercase opacity-75">{selectedPlanConfig?.price || ""}</div>
          </div>
          <button
            onClick={() => void startCheckout()}
            disabled={!selectedPlan || Boolean(loadingPlan)}
            className="border-[3px] border-black rounded-xl px-4 py-2 bg-[#FF8AAF] font-black uppercase text-xs shadow-[3px_3px_0px_0px_black] disabled:opacity-50"
          >
            {loadingPlan ? "Working..." : (selectedPlan === "basic" || selectedPlan === "beta") ? `Activate ${selectedPlan === "beta" ? "Beta" : "Free"} Plan` : "Continue to Checkout"}
          </button>
          <button
            onClick={() => setStep(3)}
            className="border-[2px] border-black rounded-xl px-3 py-1.5 bg-white font-black uppercase text-[10px]"
          >
            More options
          </button>
        </div>
      )}
    </div>
   </div>

   <div className="border-[3px] border-black rounded-xl bg-[#E5E7EB] p-4 font-bold">
    <div className="flex items-center gap-2 text-sm uppercase"><Sparkles size={16} /> Referral rewards</div>
    <p className="mt-2 text-sm">
     Referral conversion rule active: one free month is earned after each referred customer makes their first successful payment.
    </p>
   </div>

   {status && <p className="font-black uppercase text-sm">{status}</p>}

   <button
    onClick={() => navigate(from)}
    className="inline-block border-[3px] border-black rounded-xl px-4 py-2 bg-white font-black uppercase text-sm shadow-[4px_4px_0px_0px_black]"
   >
    Back
   </button>
  </div>
 )
}

export default Subscribe
