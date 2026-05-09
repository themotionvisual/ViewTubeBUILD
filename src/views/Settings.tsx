import React, { useMemo, useState, useEffect } from "react"
import {
 Check,
 Zap,
 Settings as SettingsIcon,
 Eye,
 EyeOff,
 Link2,
 KeyRound,
 Trash2,
 Download,
 ShieldCheck,
 Lock,
 Sparkles,
 BookOpen,
 User,
 Mail,
 Bell,
} from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { useBrain } from "../context/useBrain"
import { unifiedAuth } from "../services/authSession"
import { getVaultSnapshot, setVaultSnapshot } from "../services/keyVault"
import { SubToolbox } from "../components/Toolbox"
import { resolvePublicChannel } from "../services/publicHandleMode"
import {
 getStoredIngestMode,
 setStoredIngestMode,
 type IngestMode,
} from "../services/productArchitecture"
import { downloadExportBundle } from "../services/dataExport"
import {
 clearAnalyticsStateForFreshSync,
 clearCachedDataSoft,
 factoryResetAll,
} from "../services/localDataReset"
import type { SubscriptionPlanId } from "../services/subscriptionPlans"
import { googleService } from "../services/googleService"
import {
 applyCustomTopupCredits,
 applyTopupCredits,
 createCheckoutSession,
 getCurrentEntitlement,
  getReferralCode,
  getReferralRedemptionCode,
 isOwnerEmail,
 saveReferralRedemptionCode,
 setCustomReferralCodeOnce,
 simulateMeterRefill,
 simulateMeterUsage,
 TOPUP_DEFINITIONS,
 updatePlanEntitlement,
 fetchEntitlementFromServer,
} from "../services/billingEntitlement"
import { GUIDE_LAST_UPDATED, GUIDE_PROTOCOL_VERSION } from "../content/userGuideContent"

const SUBSCRIPTION_PLANS_UI: {
 id: SubscriptionPlanId
 tierLabel: string
 price: string
 bullets: string[]
 cta: string
}[] = [
 {
  id: "basic",
  tierLabel: "Basic",
  price: "$0",
  bullets: ["Core tools", "Manual sync", "Basic analytics"],
  cta: "Upgrade",
 },
 {
  id: "creator",
  tierLabel: "Creator",
  price: "$9.99/mo",
  bullets: ["48-hour trial", "Included AI credits", "Advanced dashboards"],
  cta: "Upgrade",
 },
 {
  id: "creator_plus",
  tierLabel: "Creator Plus",
  price: "$19.99/mo",
  bullets: ["48-hour trial", "More included AI credits", "Priority generation capacity"],
  cta: "Upgrade",
 },
 {
  id: "creator_pro",
  tierLabel: "Creator Pro",
  price: "$39.99/mo",
  bullets: ["48-hour trial", "Highest capped creator credits", "Full strategy stack"],
  cta: "Upgrade",
 },
 {
  id: "executive",
  tierLabel: "Executive",
  price: "$69.99/mo",
  bullets: ["48-hour trial", "Unlimited AI generation", "Executive priority"],
  cta: "Upgrade",
 },
]

const PLAN_THEME: Record<SubscriptionPlanId, { accent: string; shadow: string; tint: string }> = {
 basic: { accent: "#C9F830", shadow: "rgba(201, 248, 48, 0.45)", tint: "#F4FFD0" },
 creator: { accent: "#40C6E9", shadow: "rgba(64, 198, 233, 0.45)", tint: "#D9F6FF" },
 creator_plus: { accent: "#FFE357", shadow: "rgba(255, 227, 87, 0.45)", tint: "#FFF7CC" },
 creator_pro: { accent: "#FFB570", shadow: "rgba(255, 181, 112, 0.45)", tint: "#FFE9D2" },
 executive: { accent: "#FF83EA", shadow: "rgba(255, 131, 234, 0.45)", tint: "#FFDDF7" },
}

const canonicalButtonClass =
 "rounded-xl border-[3px] border-black shadow-[3px_3px_0px_0px_black] hover:translate-y-0.5 hover:shadow-[1.5px_1.5px_0px_0px_black] transition-all font-black uppercase"

const Settings: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { authState } = useBrain()
  const isAuth = authState.isAuthenticated

  const [geminiKey, setGeminiKey] = useState("")
  const [showKey, setShowKey] = useState(false)
  const [modelPreference, setModelPreference] = useState("pro")
  const [saveStatus, setSaveStatus] = useState<string | null>(null)
  const [handleInput, setHandleInput] = useState("")
  const [handleStatus, setHandleStatus] = useState<string | null>(null)
  const [ingestMode, setIngestMode] = useState<IngestMode>(getStoredIngestMode())
  const [exportStatus, setExportStatus] = useState<string | null>(null)
  const [dataResetStatus, setDataResetStatus] = useState<string | null>(null)
  const [loadingPlan, setLoadingPlan] = useState<SubscriptionPlanId | null>(null)
  const [billingStatus, setBillingStatus] = useState<string | null>(null)
  const [currentEmail, setCurrentEmail] = useState("")
  const [profileName, setProfileName] = useState("")
  const [profileHandle, setProfileHandle] = useState("")
  const [notifyBilling, setNotifyBilling] = useState(true)
 const [referralInput, setReferralInput] = useState("")
 const [customReferralCode, setCustomReferralCode] = useState("")
 const [customTopupAmount, setCustomTopupAmount] = useState("50")

  const query = new URLSearchParams(location.search)
 const activePanel = query.get("panel")
 const highlightBilling = activePanel === "billing"
 const entitlement = getCurrentEntitlement()
 const canViewGeminiKey = entitlement.tier === "large" || isOwnerEmail(currentEmail)
 const isBasicPlan = entitlement.subscriptionPlanId === "basic"
 const meterTotal = useMemo(
  () =>
   Math.max(
    1,
    Math.floor(
     entitlement.rolloverCap || entitlement.monthlyCreditGrant || entitlement.creditBalance || 1,
    ),
   ),
  [entitlement.creditBalance, entitlement.monthlyCreditGrant, entitlement.rolloverCap],
 )
 const meterLeft = useMemo(
  () => Math.max(0, Math.floor(entitlement.creditBalance || 0)),
  [entitlement.creditBalance],
 )
 const meterUsed = Math.max(0, meterTotal - meterLeft)
 const meterPct = entitlement.tier === "large" ? 100 : Math.max(0, Math.min(100, Math.round((meterLeft / meterTotal) * 100)))

 useEffect(() => {
  const vault = getVaultSnapshot()
  setGeminiKey(vault.gemini || "")
  setModelPreference(localStorage.getItem("yt_model_preference") || "pro")
  setProfileName(authState.channelName || "")
  setProfileHandle(authState.channelHandle || "")
 }, [authState.channelHandle, authState.channelName])

 useEffect(() => {
  const syncBilling = async () => {
   const authReady = isAuth && unifiedAuth.isAuthenticated()
   if (!authReady) {
    setBillingStatus("Sign in to sync billing entitlements.")
    return
   }
   try {
     const userInfo = await googleService.getUserInfo()
     setCurrentEmail((userInfo.email || "").toLowerCase())
     await fetchEntitlementFromServer(userInfo.email)
     setBillingStatus("Entitlements synced with server.")
   } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    if (message.toLowerCase().includes("not authenticated")) {
     console.info("Billing sync skipped: not authenticated.")
     setBillingStatus("Sign in to sync billing entitlements.")
     return
    }
    console.error("Billing sync failed", e)
    setBillingStatus("Failed to sync billing.")
   }
  }
  syncBilling()
 }, [isAuth])

 useEffect(() => {
  setReferralInput(getReferralRedemptionCode())
 }, [])

 // ... existing code ...


 const handleSave = () => {
  setVaultSnapshot({
   gemini: geminiKey,
  })
  localStorage.setItem("yt_model_preference", modelPreference)
  setSaveStatus("Settings Saved!")
  setTimeout(() => setSaveStatus(null), 2500)
  window.dispatchEvent(new Event("yt_settings_updated"))
 }

 const handlePublicResolve = async () => {
  setHandleStatus("Resolving channel...")
  try {
   const result = await resolvePublicChannel(handleInput)
   if (!result.resolvedChannelId) {
    setHandleStatus(result.reason || "Channel not resolved.")
    return
   }
   setHandleStatus(
    `Resolved: ${result.channelTitle || "Unknown Channel"} (${result.resolvedChannelId})`,
   )
   setIngestMode("public_handle")
   setStoredIngestMode("public_handle")
   localStorage.setItem("vt_public_channel_id", result.resolvedChannelId)
   if (result.resolvedHandle) {
    localStorage.setItem("vt_public_channel_handle", result.resolvedHandle)
   }
  } catch (error) {
   const message = error instanceof Error ? error.message : String(error)
   setHandleStatus(`Resolve failed: ${message}`)
  }
 }

 const handleExport = async () => {
  setExportStatus("Building export bundle...")
  try {
   const manifest = await downloadExportBundle(ingestMode, "lifetime")
   setExportStatus(`Export complete at ${manifest.generatedAt}.`)
  } catch (error) {
   const message = error instanceof Error ? error.message : String(error)
   setExportStatus(`Export failed: ${message}`)
  }
 }

 const switchMode = (mode: IngestMode) => {
  setIngestMode(mode)
  setStoredIngestMode(mode)
 }

 const handleChoosePlan = async (planId: SubscriptionPlanId) => {
  if (planId === "basic") {
   updatePlanEntitlement("basic")
   setBillingStatus("Free plan active. You can browse normally.")
   return
  }

  try {
   setLoadingPlan(planId)
   setBillingStatus("Creating secure checkout session...")
  const session = await createCheckoutSession({
    planId,
    userId: "local-user",
    successUrl: `${window.location.origin}/account?panel=billing`,
    cancelUrl: `${window.location.origin}/account?panel=billing`,
   })

   window.location.href = session.checkoutUrl
  } catch (error) {
   const message = error instanceof Error ? error.message : String(error)
   if (message.includes("not configured") || message.includes("failed (404)")) {
    updatePlanEntitlement(planId)
    setBillingStatus("Demo checkout applied locally (billing server not connected).")
   } else {
    setBillingStatus(`Checkout failed: ${message}`)
   }
  } finally {
   setLoadingPlan(null)
  }
 }

 const handleTopup = async (topupSku: string) => {
  try {
   setBillingStatus("Creating top-up checkout session...")
   const session = await createCheckoutSession({
    planId: "creator_plus",
    userId: "local-user",
    successUrl: `${window.location.origin}/account?panel=billing`,
    cancelUrl: `${window.location.origin}/account?panel=billing`,
    mode: "topup",
    topupSku,
   })
   window.location.href = session.checkoutUrl
  } catch (error) {
   const message = error instanceof Error ? error.message : String(error)
   if (message.includes("not configured") || message.includes("failed (404)")) {
    applyTopupCredits(topupSku)
    setBillingStatus("Demo top-up applied locally (billing server not connected).")
   } else {
    setBillingStatus(`Top-up failed: ${message}`)
   }
  }
 }

 const handleCustomTopup = async () => {
  const amountUsd = Math.max(0, Number(customTopupAmount) || 0)
  if (amountUsd <= 0) {
   setBillingStatus("Enter a valid top-up amount.")
   return
  }
  try {
   setBillingStatus("Creating custom top-up checkout session...")
   const session = await createCheckoutSession({
    planId: "creator_plus",
    userId: "local-user",
    successUrl: `${window.location.origin}/account?panel=billing`,
    cancelUrl: `${window.location.origin}/account?panel=billing`,
    mode: "topup",
    topupSku: `custom_${amountUsd.toFixed(2)}`,
   })
   window.location.href = session.checkoutUrl
  } catch (error) {
   const message = error instanceof Error ? error.message : String(error)
   if (message.includes("not configured") || message.includes("failed (404)")) {
    const result = applyCustomTopupCredits(amountUsd)
    const bonusLabel = result.bonusCredits > 0 ? ` (+${result.bonusCredits.toLocaleString()} bonus)` : ""
    setBillingStatus(
     `Demo custom top-up applied: ${result.creditsGranted.toLocaleString()} credits${bonusLabel}.`,
    )
   } else {
    setBillingStatus(`Custom top-up failed: ${message}`)
   }
  }
 }

 return (
  <div className="max-w-[1400px] mx-auto pb-32 animate-fade-in px-4 space-y-14">
   <div className="flex justify-between items-end border-b-[4px] border-black pb-4">
    <div>
     <h1 className="text-5xl font-black uppercase tracking-tighter text-black">
      Account Settings
     </h1>
     <p className="font-bold text-gray-700 uppercase tracking-wide text-xs mt-1">
      Unified account, billing, workspace, and data controls
     </p>
    </div>
   <div className="bg-[#FF83EA] text-black p-3 rounded-xl border-[4px] border-black shadow-[4px_4px_0px_0px_black] rotate-2">
     <SettingsIcon size={32} />
   </div>
  </div>

   <div id="account-profile" className="pt-1">
   <SubToolbox
    title="Account Profile"
    icon={<User size={20} strokeWidth={3} className="text-black" />}
    paletteIndex={5}
    contentClassName="p-6 space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
     <div className="space-y-2">
      <label className="text-xs font-black uppercase tracking-wider">Display Name</label>
      <input
       value={profileName}
       readOnly
       className="w-full p-3 border-[3px] border-black rounded-xl font-bold bg-[#f3f4f6] text-gray-700"
       placeholder="Loaded from YouTube"
      />
     </div>
     <div className="space-y-2">
      <label className="text-xs font-black uppercase tracking-wider">Channel Handle</label>
      <input
       value={profileHandle}
       readOnly
       className="w-full p-3 border-[3px] border-black rounded-xl font-bold bg-[#f3f4f6] text-gray-700"
       placeholder="Loaded from YouTube"
      />
     </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
     <div className="space-y-2">
      <label className="text-xs font-black uppercase tracking-wider">Email</label>
      <div className="w-full p-3 border-[3px] border-black rounded-xl font-bold bg-white flex items-center gap-2">
       <Mail size={15} />
       {currentEmail || "Sign in to load email"}
      </div>
     </div>
     <div className="space-y-2">
      <label className="text-xs font-black uppercase tracking-wider">Notifications</label>
      <button
       onClick={() => setNotifyBilling((prev) => !prev)}
       className={`${canonicalButtonClass} w-full py-3 text-sm ${notifyBilling ? "bg-[#CCFF00]" : "bg-white"}`}>
       <Bell size={14} className="inline mr-2" />
       {notifyBilling ? "Billing alerts on" : "Billing alerts off"}
      </button>
     </div>
    </div>
    <p className="text-[11px] font-black uppercase tracking-[0.1em] text-gray-600">
     Channel title and handle are read-only and synced from your connected YouTube identity.
    </p>
   </SubToolbox>
   </div>

   <div id="guide-protocols" className="pt-1">
   <SubToolbox
    title="User Guide & Protocols"
    icon={<BookOpen size={20} strokeWidth={3} className="text-black" />}
    paletteIndex={6}
    contentClassName="p-6 space-y-4">
    <p className="font-bold text-gray-700">
     Step-by-step help for launch-critical tasks: account setup, billing and credits, sync/data sources, and graph troubleshooting.
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
     <button
      onClick={() => navigate("/user-guide")}
      className={`${canonicalButtonClass} bg-[#40C6E9] text-black px-4 py-4 text-sm w-full`}>
      Open Full User Guide
     </button>
     <button
      onClick={() => navigate("/user-guide#billing")}
      className={`${canonicalButtonClass} bg-white text-black px-4 py-4 text-xs w-full`}>
      Billing + Credits Help
     </button>
     <button
      onClick={() => navigate("/user-guide#sync")}
      className={`${canonicalButtonClass} bg-white text-black px-4 py-4 text-xs w-full`}>
      Connect + Sync Data Help
     </button>
     <button
      onClick={() => navigate("/user-guide#graphs")}
      className={`${canonicalButtonClass} bg-white text-black px-4 py-4 text-xs w-full`}>
      Graph QA + Troubleshooting
     </button>
    </div>
    <p className="text-xs font-black uppercase tracking-[0.15em] text-gray-600">
     Protocol {GUIDE_PROTOCOL_VERSION} • Updated {GUIDE_LAST_UPDATED}
    </p>
   </SubToolbox>
   </div>

   <div id="billing-meter" className="pt-1">
   <SubToolbox
    title="Billing & Subscription"
    icon={<Lock size={20} strokeWidth={3} className="text-black" />}
    paletteIndex={0}
    contentClassName={`p-7 space-y-10 ${highlightBilling ? "ring-4 ring-[#CCFF00]" : ""}`}>
    <div className="space-y-6">
     <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-2">
       <h2 className="text-[30px] leading-none font-black uppercase tracking-tight">Subscription Controls</h2>
       <p className="text-sm font-bold text-gray-700">
        Manage plans, credits, referral rewards, and one-time top-ups from one place.
       </p>
      </div>
      <div className="flex gap-2">
       <button
        onClick={() => navigate("/user-guide#billing")}
        className="px-4 py-2 border-[2px] border-black rounded-xl bg-white font-black uppercase text-xs shadow-[2px_2px_0px_0px_black]">
        Billing Help
       </button>
       <button
        onClick={() => navigate("/account?panel=billing")}
        className="px-4 py-2 border-[3px] border-black rounded-xl bg-[#CCFF00] font-black uppercase shadow-[3px_3px_0px_0px_black]">
        Billing Panel
       </button>
      </div>
     </div>

    </div>

    <div className="border-[4px] border-black rounded-2xl bg-white p-5 shadow-[4px_4px_0px_0px_black] space-y-4">
     <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-[260px]">
       <p className="text-xs font-black uppercase tracking-[0.14em] text-gray-700">Credit Meter</p>
       <h3 className="text-3xl font-black uppercase tracking-tight">
        {entitlement.tier === "large" ? "Unlimited" : `${meterLeft.toLocaleString()} left`}
       </h3>
      </div>
      <div className="flex flex-wrap justify-end gap-2">
       <div className="border-[2px] border-black rounded-xl px-3 py-2 min-w-[120px]" style={{ backgroundColor: "#D9F6FF", boxShadow: "3px 3px 0px 0px rgba(64, 198, 233, 0.45)" }}>
        <p className="text-[9px] font-black uppercase tracking-[0.14em] text-gray-700">Plan</p>
        <p className="text-sm font-black uppercase">{entitlement.subscriptionPlanId}</p>
       </div>
       <div className="border-[2px] border-black rounded-xl px-3 py-2 min-w-[100px]" style={{ backgroundColor: "#FFDDF7", boxShadow: "3px 3px 0px 0px rgba(255, 131, 234, 0.45)" }}>
        <p className="text-[9px] font-black uppercase tracking-[0.14em] text-gray-700">Tier</p>
        <p className="text-sm font-black uppercase">{entitlement.tier}</p>
       </div>
       <div className="border-[2px] border-black rounded-xl px-3 py-2 min-w-[120px]" style={{ backgroundColor: "#FFF7CC", boxShadow: "3px 3px 0px 0px rgba(255, 227, 87, 0.45)" }}>
        <p className="text-[9px] font-black uppercase tracking-[0.14em] text-gray-700">Refill</p>
        <p className="text-sm font-black uppercase">
         {Math.max(0, Math.floor(entitlement.monthlyCreditGrant || 0)).toLocaleString()}
        </p>
       </div>
       <div className="border-[2px] border-black rounded-xl px-3 py-2 min-w-[120px]" style={{ backgroundColor: "#FFE9D2", boxShadow: "3px 3px 0px 0px rgba(255, 181, 112, 0.45)" }}>
        <p className="text-[9px] font-black uppercase tracking-[0.14em] text-gray-700">Next</p>
        <p className="text-sm font-black uppercase">
         {entitlement.nextRefillIso ? new Date(entitlement.nextRefillIso).toLocaleDateString() : "N/A"}
        </p>
       </div>
       <div className="border-[2px] border-black rounded-xl px-3 py-2 min-w-[100px] text-right" style={{ backgroundColor: "#F4FFD0", boxShadow: "3px 3px 0px 0px rgba(201, 248, 48, 0.45)" }}>
        <p className="text-[9px] font-black uppercase tracking-[0.14em] text-gray-700">Total</p>
        <p className="text-lg font-black">{entitlement.tier === "large" ? "∞" : meterTotal.toLocaleString()}</p>
       </div>
      </div>
     </div>
     <div className="h-6 border-[3px] border-black rounded-full bg-[#e5e7eb] overflow-hidden">
      <div
       style={{
        width: `${meterPct}%`,
        height: "100%",
        transition: "width 280ms ease",
        background:
         entitlement.tier === "large"
          ? "#4FFF5B"
          : meterPct > 65
            ? "#4FFF5B"
            : meterPct > 30
              ? "#FFE357"
              : "#FF8AAF",
       }}
      />
     </div>
     <div className="flex items-center justify-between text-xs font-black uppercase tracking-wide text-gray-700">
      <span>{entitlement.tier === "large" ? "Unlimited Plan Active" : `${meterUsed.toLocaleString()} used`}</span>
      <span>{entitlement.tier === "large" ? "100%" : `${meterPct}% remaining`}</span>
     </div>
     <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-3 pt-1 items-start">
      <div className="flex flex-wrap gap-3">
       {TOPUP_DEFINITIONS.map((topup) => (
        <button
         key={`meter-topup-${topup.sku}`}
         onClick={() => handleTopup(topup.sku)}
         className="border-[3px] border-black rounded-xl px-4 py-3 bg-[#40C6E9] font-black uppercase text-sm shadow-[3px_3px_0px_0px_black]">
         ${topup.priceUsd} • {topup.creditAmount.toLocaleString()} credits
        </button>
       ))}
      </div>
      <div className="flex flex-wrap xl:flex-nowrap items-center gap-2">
       <input
        type="number"
        min={1}
        step="1"
        value={customTopupAmount}
        onChange={(event) => setCustomTopupAmount(event.target.value)}
        className="w-[140px] border-[3px] border-black rounded-xl px-3 py-3 font-black text-sm bg-white"
        placeholder="Amount USD"
       />
       <button
        onClick={handleCustomTopup}
        className="border-[3px] border-black rounded-xl px-4 py-3 bg-[#CCFF00] font-black uppercase text-sm shadow-[3px_3px_0px_0px_black] whitespace-nowrap">
        Custom top-up (+25% on $50+)
       </button>
      </div>
     </div>
     {isOwnerEmail(currentEmail) ? (
      <div className="flex flex-wrap gap-2">
       <button
        onClick={() => {
         simulateMeterUsage(2500)
         setBillingStatus("Meter simulation: consumed 2,500 credits.")
        }}
        className="border-[2px] border-black rounded-xl px-3 py-2 bg-[#FFE357] font-black uppercase text-xs shadow-[2px_2px_0px_0px_black]">
        Test Drain
       </button>
       <button
        onClick={() => {
         simulateMeterRefill(10000)
         setBillingStatus("Meter simulation: added 10,000 credits.")
        }}
        className="border-[2px] border-black rounded-xl px-3 py-2 bg-[#4FFF5B] font-black uppercase text-xs shadow-[2px_2px_0px_0px_black]">
        Test Refill
       </button>
      </div>
     ) : null}
    </div>

    <div className="space-y-3">
     <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-600">Choose Plan</p>
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 items-stretch">
     {SUBSCRIPTION_PLANS_UI.map((plan) => {
      const active = entitlement.subscriptionPlanId === plan.id
      const loading = loadingPlan === plan.id
      const theme = PLAN_THEME[plan.id]
      return (
       <div
        key={plan.id}
        className="h-full min-w-0 border-[4px] border-black rounded-2xl bg-white p-5 flex flex-col gap-4"
        style={{
         boxShadow: `6px 6px 0px 0px ${theme.shadow}`,
        }}>
        <div
         className="border-[2px] border-black rounded-xl px-3 py-2 flex items-center justify-between"
         style={{ backgroundColor: theme.tint }}>
         <p className="text-xs font-black uppercase tracking-[0.2em]">{plan.tierLabel}</p>
         {active ? <Check size={18} strokeWidth={3} /> : null}
        </div>
        <h3 className="text-[2.05rem] leading-none font-black uppercase tracking-tight whitespace-nowrap">
         {plan.price}
        </h3>
        <ul className="space-y-2">
         {plan.bullets.map((bullet) => (
          <li key={bullet} className="font-bold text-[0.95rem] uppercase">• {bullet}</li>
         ))}
        </ul>
        <button
         onClick={() => handleChoosePlan(plan.id)}
         disabled={loading}
         className="mt-auto border-[3px] border-black rounded-xl px-4 py-3 font-black uppercase text-sm disabled:opacity-60"
         style={{
          backgroundColor: theme.accent,
          boxShadow: `4px 4px 0px 0px ${theme.shadow}`,
         }}>
         {loading ? "Working..." : plan.cta}
        </button>
       </div>
      )
     })}
    </div>
    </div>

    <div className="border-[3px] border-black rounded-xl bg-[#E5E7EB] p-4 font-bold space-y-3 mt-4">
      <div className="flex items-center gap-2 text-sm uppercase">
        <Sparkles size={16} /> Referral rewards
      </div>
     <p className="mt-2 text-sm">
      Generate your referral code and share it. New users can enter a referral code at signup.
     </p>
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <div className="border-[2px] border-black rounded-xl bg-white px-3 py-2">
       <p className="text-[10px] font-black uppercase tracking-[0.12em] text-gray-600">Your referral code</p>
       <p className="text-lg font-black tracking-[0.08em]">{getReferralCode()}</p>
       <p className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-500 mt-1">
        {entitlement.referralCodeLocked ? "Locked permanently" : "You can set this once"}
       </p>
      </div>
      <div className="flex gap-2">
       <input
        value={referralInput}
        onChange={(event) => setReferralInput(event.target.value.toUpperCase())}
        placeholder="Enter referral code"
        className="flex-1 border-[2px] border-black rounded-xl px-3 py-2 font-black uppercase bg-white"
       />
       <button
        onClick={() => {
         saveReferralRedemptionCode(referralInput)
         setBillingStatus("Referral code saved for signup.")
        }}
        className="border-[2px] border-black rounded-xl px-3 py-2 bg-[#CCFF00] font-black uppercase text-xs shadow-[2px_2px_0px_0px_black]">
        Save
       </button>
      </div>
     </div>
     {!entitlement.referralCodeLocked ? (
      <div className="flex flex-wrap items-center gap-2">
       <input
        value={customReferralCode}
        onChange={(event) => setCustomReferralCode(event.target.value.toUpperCase())}
        placeholder="Set your own referral code (one-time)"
        className="w-full md:w-[360px] border-[2px] border-black rounded-xl px-3 py-2 font-black uppercase bg-white"
       />
       <button
        onClick={() => {
         const result = setCustomReferralCodeOnce(customReferralCode)
         setBillingStatus(result.ok ? "Referral code set and locked." : result.reason || "Could not set referral code.")
        }}
        className="border-[2px] border-black rounded-xl px-3 py-2 bg-[#CCFF00] font-black uppercase text-xs shadow-[2px_2px_0px_0px_black]">
        Set Code
       </button>
      </div>
     ) : null}
    </div>

   {billingStatus && !billingStatus.toLowerCase().includes("entitlements synced with server")
    ? <p className="text-sm font-black uppercase">{billingStatus}</p>
    : null}
   </SubToolbox>
   </div>

   {/* Gemini API Key */}
   {canViewGeminiKey ? (
   <div id="api-keys">
   <SubToolbox
    title="Gemini API Key"
    icon={<KeyRound size={20} strokeWidth={3} className="text-black" />}
    paletteIndex={2}
    contentClassName="p-6 flex flex-col gap-4">
    <p className="font-bold text-gray-700">
     Use your own key so generations run on your quota and billing.
    </p>
    <button
      onClick={() => navigate("/user-guide#sync")}
      className="self-start text-xs font-black uppercase underline underline-offset-2">
      API Key Setup Help
    </button>
    <form onSubmit={(e) => e.preventDefault()} className="relative">
     <input
      type="text"
      autoComplete="username"
      tabIndex={-1}
      aria-hidden="true"
      className="absolute h-0 w-0 opacity-0 pointer-events-none"
      value="gemini-user"
      readOnly
     />
     <input
     type={showKey ? "text" : "password"}
      autoComplete="new-password"
      value={geminiKey}
      onChange={(e) => setGeminiKey(e.target.value)}
      placeholder="Enter your Gemini API Key..."
      className="w-full p-4 text-lg font-bold border-[4px] border-black rounded-xl shadow-[4px_4px_0px_0px_black] outline-none pr-12"
     />
     <button
      type="button"
      onClick={() => setShowKey(!showKey)}
      className="absolute right-4 top-1/2 -translate-y-1/2 text-black">
      {showKey ? <EyeOff size={20} /> : <Eye size={20} />}
     </button>
    </form>
   </SubToolbox>
   </div>
   ) : null}

   {/* Gemini Preference - Full Width */}
   <SubToolbox
    title="Gemini Preference"
    icon={<Zap size={20} strokeWidth={3} className="text-black" />}
    paletteIndex={7}
    contentClassName="p-6 space-y-6">
    <p className="font-bold text-gray-700">
     Choose speed or depth. Switch anytime and keep your workflow flexible.
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
     <button
      onClick={() => setModelPreference("flash")}
      className={`flex flex-col items-start p-6 border-[4px] border-black rounded-2xl transition-all ${
       modelPreference === "flash"
        ? "bg-[#FFB570] shadow-[4px_4px_0px_0px_black] -translate-y-1"
        : "bg-white hover:bg-gray-50"
      }`}>
      <div className="flex items-center gap-2 mb-2">
       <span className="text-2xl font-black uppercase">Flash</span>
       {modelPreference === "flash" && (
        <span className="bg-black text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase">
         Active
        </span>
       )}
      </div>
      <p className="text-sm font-bold text-gray-600 text-left">
       Fast, lighter responses for quick ideas, bulk work, and rapid iteration.
      </p>
     </button>
     <button
      onClick={() => setModelPreference("pro")}
      className={`flex flex-col items-start p-6 border-[4px] border-black rounded-2xl transition-all ${
       modelPreference === "pro"
        ? "bg-[#FFFF61] shadow-[4px_4px_0px_0px_black] -translate-y-1"
        : "bg-white hover:bg-gray-50"
      }`}>
      <div className="flex items-center gap-2 mb-2">
       <span className="text-2xl font-black uppercase">Pro</span>
       {modelPreference === "pro" && (
        <span className="bg-black text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase">
         Active
        </span>
       )}
      </div>
      <p className="text-sm font-bold text-gray-600 text-left">
       Deeper reasoning, longer context, and higher‑quality strategic outputs.
      </p>
     </button>
    </div>
   </SubToolbox>

   {/* Combined Advanced Workspace & Data Module */}
   <div id="workspace-data" className="pt-1">
   <SubToolbox
    title="Advanced Workspace & Data"
    icon={<ShieldCheck size={20} strokeWidth={3} className="text-black" />}
    paletteIndex={1}
    contentClassName="p-8 space-y-12">
    
    {/* Row 1: Channel Link + Public Handle */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
     {/* YouTube Workspace Link */}
     <div className="space-y-4">
      <div className="flex items-center gap-2">
       <Link2 size={20} strokeWidth={3} />
       <h2 className="text-2xl font-black uppercase tracking-tighter">Workspace Link</h2>
      </div>
      <p className="text-sm font-bold text-gray-600">
       Connect your workspace channel to unlock uploads, analytics, and metadata controls.
      </p>
      {isAuth ? (
       <button
        onClick={() => unifiedAuth.logout()}
        className={`${canonicalButtonClass} bg-black text-white px-8 py-4 text-sm w-full`}>
        Disconnect Channel
       </button>
      ) : (
       <button
        onClick={async () => {
         await clearAnalyticsStateForFreshSync()
         await unifiedAuth.login()
        }}
        className={`${canonicalButtonClass} bg-[#FFFF61] text-black px-8 py-4 text-sm w-full`}>
        Connect Channel
       </button>
      )}
     </div>

     {/* Public Handle Mode */}
     <div className="space-y-4">
      <div className="flex items-center gap-2">
       <Eye size={20} strokeWidth={3} />
       <h2 className="text-2xl font-black uppercase tracking-tighter">Public Handle</h2>
      </div>
     <p className="text-sm font-bold text-gray-600">
       {isBasicPlan
        ? "Basic plan can load public-only analytics without OAuth by resolving a channel handle or URL."
        : "Public handle mode is reserved for Basic plan. Creator plans should use connected sync."}
      </p>
      <div className="flex gap-3">
       <input
        value={handleInput}
        onChange={(event) => setHandleInput(event.target.value)}
        placeholder="@channelhandle or channel URL"
        disabled={!isBasicPlan}
        className="flex-1 p-4 border-[3px] border-black rounded-xl font-bold outline-none disabled:bg-[#ececec] disabled:text-gray-500"
       />
       <button
        onClick={handlePublicResolve}
        disabled={!isBasicPlan}
        className={`${canonicalButtonClass} bg-[#96F5A6] text-black px-6 py-4 text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed`}>
        Resolve
       </button>
      </div>
      {!isBasicPlan ? (
       <p className="text-xs font-black uppercase tracking-wide text-gray-600">
        Switch to Basic plan to use public-handle-only mode.
       </p>
      ) : null}
      {handleStatus ? <p className="text-sm font-bold text-gray-700">{handleStatus}</p> : null}
     </div>
    </div>

    {/* Row 2: Ingest Mode */}
    <div className="space-y-4 border-t-[3px] border-black pt-10">
     <div className="flex items-center gap-2">
      <Zap size={20} strokeWidth={3} />
      <h3 className="text-xl font-black uppercase tracking-tighter">Ingest Mode</h3>
     </div>
    <p className="font-bold text-gray-700 text-sm">
      Select how ViewTube should source data for analytics and master tables.
     </p>
     <button
      onClick={() => navigate("/user-guide#sync")}
      className="self-start text-xs font-black uppercase underline underline-offset-2">
      Ingest Mode Help
     </button>
     <div className="flex flex-wrap gap-3">
      {(["connected", "import", "hybrid", "public_handle"] as IngestMode[]).map(
       (mode) => (
        <button
         key={mode}
         onClick={() => switchMode(mode)}
         className={`px-6 py-3 border-[3px] border-black rounded-xl text-sm font-black uppercase transition-all ${
          ingestMode === mode
           ? "bg-[#CCFF00] shadow-[3px_3px_0px_0px_black] -translate-y-0.5"
           : "bg-white hover:bg-gray-50 shadow-[1px_1px_0px_0px_black]"
         }`}>
         {mode}
        </button>
       ),
      )}
     </div>
    </div>

    {/* Row 3: Data Management + Trust/Export */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t-[3px] border-black pt-10">
     {/* Data Management */}
     <div className="space-y-4">
      <div className="flex items-center gap-2">
       <Trash2 size={20} strokeWidth={3} />
       <h3 className="text-xl font-black uppercase tracking-tighter">Data Management</h3>
      </div>
      <p className="font-bold text-gray-700 text-sm">
       Control local storage. Safe clear for caches, or factory reset for a full wipe.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
       <button
        onClick={() => {
         if (!confirm("Clear cached analytics + uploads + GA4 data on this device? (Keeps keys/preferences/auth)")) return
         clearCachedDataSoft()
         setDataResetStatus("Cached data cleared.")
         setTimeout(() => setDataResetStatus(null), 3500)
        }}
        className="flex items-center justify-center gap-2 bg-[#FFB570] text-black px-4 py-4 rounded-xl border-[3px] border-black shadow-[3px_3px_0px_0px_black] hover:translate-y-0.5 hover:shadow-[1.5px_1.5px_0px_0px_black] transition-all font-black uppercase text-[10px]">
        Clear Cache
       </button>
       <button
        onClick={async () => {
         if (!confirm("FACTORY RESET EVERYTHING? Clears ALL keys and auth.")) return
         await factoryResetAll()
         setDataResetStatus("Factory reset complete.")
         setTimeout(() => setDataResetStatus(null), 3500)
        }}
        className="flex items-center justify-center gap-2 bg-black text-white px-4 py-4 rounded-xl border-[3px] border-black shadow-[3px_3px_0px_0px_black] hover:translate-y-0.5 hover:shadow-[1.5px_1.5px_0px_0px_black] transition-all font-black uppercase text-[10px]">
        Factory Reset
       </button>
      </div>
      {dataResetStatus ? <p className="text-xs font-black text-gray-700">{dataResetStatus}</p> : null}
     </div>

     {/* Trust + Export */}
     <div className="space-y-4">
      <div className="flex items-center gap-2">
       <Download size={20} strokeWidth={3} />
       <h3 className="text-xl font-black uppercase tracking-tighter">Trust + Export</h3>
      </div>
      <p className="font-bold text-gray-700 text-sm">
       Transparency docs and one-click canonical export bundle.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
       <button
        onClick={() => navigate("/data-transparency")}
        className="flex items-center justify-center gap-2 bg-[#40C6E9] text-black px-4 py-4 rounded-xl border-[3px] border-black shadow-[3px_3px_0px_0px_black] hover:translate-y-0.5 hover:shadow-[1.5px_1.5px_0px_0px_black] transition-all font-black uppercase text-[10px]">
        Docs Center
       </button>
       <button
        onClick={handleExport}
        className="flex items-center justify-center gap-2 bg-[#FFB570] text-black px-4 py-4 rounded-xl border-[3px] border-black shadow-[3px_3px_0px_0px_black] hover:translate-y-0.5 hover:shadow-[1.5px_1.5px_0px_0px_black] transition-all font-black uppercase text-[10px]">
        Export All
       </button>
      </div>
      {exportStatus ? <p className="text-xs font-bold text-gray-700">{exportStatus}</p> : null}
     </div>
    </div>

    {/* Row 4: Save Settings - Centered */}
    <div className="border-t-[3px] border-black pt-10 flex justify-center">
     <button
      onClick={handleSave}
      className={`${canonicalButtonClass} bg-[#FFFF61] text-black px-16 py-5 text-2xl w-full md:w-auto flex items-center justify-center gap-4`}>
      {saveStatus ? <Check size={28} /> : <Zap size={28} />}
     {saveStatus || "Save All Settings"}
     </button>
    </div>

    <div className="border-t-[3px] border-black pt-8 space-y-3">
     <h3 className="text-xl font-black uppercase tracking-tighter">Account & Billing Links</h3>
     <p className="text-sm font-bold text-gray-700">
      Open quick-access pages for signup flows, billing actions, and public route checks.
     </p>
     <button
      onClick={() => navigate("/all-links")}
      className={`${canonicalButtonClass} bg-[#40C6E9] text-black px-8 py-4 text-sm`}>
      Open All Links Page
     </button>
    </div>
   </SubToolbox>
   </div>
  </div>
 )
}

export default Settings
