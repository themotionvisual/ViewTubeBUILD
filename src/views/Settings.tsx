import React, { useState, useEffect } from "react"
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
} from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { useBrain } from "../context/GlobalDataContext"
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
 createCheckoutSession,
 getCurrentEntitlement,
 updatePlanEntitlement,
 fetchEntitlementFromServer,
} from "../services/billingEntitlement"

// ... existing code ...

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

  const query = new URLSearchParams(location.search)
 const activePanel = query.get("panel")
 const highlightBilling = activePanel === "billing"
 const entitlement = getCurrentEntitlement()

 useEffect(() => {
  const syncBilling = async () => {
   if (isAuth) {
    try {
     const userInfo = await googleService.getUserInfo()
     await fetchEntitlementFromServer(userInfo.email)
     setBillingStatus("Entitlements synced with server.")
    } catch (e) {
     console.error("Billing sync failed", e)
     setBillingStatus("Failed to sync billing.")
    }
   }
  }
  syncBilling()
 }, [isAuth])

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
  if (planId === "starter") {
   updatePlanEntitlement("starter")
   setBillingStatus("Free plan active. You can browse normally.")
   return
  }

  try {
   setLoadingPlan(planId)
   setBillingStatus("Creating secure checkout session...")
   const session = await createCheckoutSession({
    planId,
    userId: "local-user",
    successUrl: `${window.location.origin}/settings?panel=billing`,
    cancelUrl: `${window.location.origin}/settings?panel=billing`,
   })

   if (session.checkoutUrl.startsWith(window.location.origin)) {
    // Dev fallback path when billing backend is not wired yet.
    updatePlanEntitlement(planId)
    setBillingStatus(`Dev mode checkout complete. ${planId} activated.`)
    return
   }

   window.location.href = session.checkoutUrl
  } catch (error) {
   const message = error instanceof Error ? error.message : String(error)
   setBillingStatus(`Checkout failed: ${message}`)
  } finally {
   setLoadingPlan(null)
  }
 }

 return (
  <div className="max-w-5xl mx-auto pb-32 animate-fade-in px-4 space-y-8">
   <div className="flex justify-between items-end border-b-[4px] border-black pb-4">
    <div>
     <h1 className="text-5xl font-black uppercase tracking-tighter text-black">
      Settings
     </h1>
    </div>
   <div className="bg-[#FF83EA] text-black p-3 rounded-xl border-[4px] border-black shadow-[4px_4px_0px_0px_black] rotate-2">
     <SettingsIcon size={32} />
   </div>
  </div>

   <SubToolbox
    title="Billing & Subscription"
    icon={<Lock size={20} strokeWidth={3} className="text-black" />}
    paletteIndex={0}
    contentClassName={`p-6 space-y-5 ${highlightBilling ? "ring-4 ring-[#CCFF00]" : ""}`}>
    <div className="flex flex-wrap items-center justify-between gap-3">
     <div>
      <h2 className="text-2xl font-black uppercase tracking-tighter">Subscription Controls</h2>
      <p className="font-bold text-gray-700 mt-1">
       Current tier: <span className="uppercase">{entitlement.tier}</span> • Plan:{" "}
       <span className="uppercase">{entitlement.subscriptionPlanId}</span>
      </p>
      <p className="font-bold text-gray-700">
       Tokens:{" "}
       <span className="uppercase">
        {Number.isFinite(entitlement.tokenBalance)
         ? Math.max(0, Math.floor(entitlement.tokenBalance)).toLocaleString()
         : "Unlimited"}
       </span>
      </p>
     </div>
     <button
      onClick={() => navigate("/settings?panel=billing")}
      className="px-4 py-2 border-[3px] border-black rounded-xl bg-[#CCFF00] font-black uppercase shadow-[3px_3px_0px_0px_black]">
      Billing Panel
     </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
     {SUBSCRIPTION_PLANS_UI.map((plan) => {
      const active = entitlement.subscriptionPlanId === plan.id
      const loading = loadingPlan === plan.id
      return (
       <div
        key={plan.id}
        className="border-[4px] border-black rounded-2xl bg-white p-5 shadow-[6px_6px_0px_0px_black] flex flex-col gap-4">
        <div className="flex items-center justify-between">
         <p className="text-xs font-black uppercase tracking-[0.2em]">{plan.tierLabel}</p>
         {active ? <Check size={18} strokeWidth={3} /> : null}
        </div>
        <h3 className="text-3xl font-black uppercase tracking-tight">{plan.price}</h3>
        <ul className="space-y-2">
         {plan.bullets.map((bullet) => (
          <li key={bullet} className="font-bold text-sm uppercase">• {bullet}</li>
         ))}
        </ul>
        <button
         onClick={() => handleChoosePlan(plan.id)}
         disabled={loading}
         className="mt-auto border-[3px] border-black rounded-xl px-4 py-3 bg-[#FF8AAF] font-black uppercase text-sm shadow-[4px_4px_0px_0px_black] disabled:opacity-60">
         {loading ? "Working..." : plan.cta}
        </button>
       </div>
      )
     })}
    </div>

    <div className="border-[3px] border-black rounded-xl bg-[#E5E7EB] p-4 font-bold">
     <div className="flex items-center gap-2 text-sm uppercase">
      <Sparkles size={16} /> Referral rewards
     </div>
     <p className="mt-2 text-sm">
      Referral conversion rule active: one free month is earned after each referred customer makes their first successful payment.
     </p>
    </div>

    {billingStatus ? <p className="text-sm font-black uppercase">{billingStatus}</p> : null}
   </SubToolbox>

   {/* Gemini API Key */}
   <SubToolbox
    title="Gemini API Key"
    icon={<KeyRound size={20} strokeWidth={3} className="text-black" />}
    paletteIndex={2}
    contentClassName="p-6 flex flex-col gap-4">
    <p className="font-bold text-gray-700">
     Use your own key so generations run on your quota and billing.
    </p>
    <form onSubmit={(e) => e.preventDefault()} className="relative">
     <input
      type={showKey ? "text" : "password"}
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
   <SubToolbox
    title="Advanced Workspace & Data"
    icon={<ShieldCheck size={20} strokeWidth={3} className="text-black" />}
    paletteIndex={1}
    contentClassName="p-8 space-y-12">
    
    {/* Row 1: Connection & Handle */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
     {/* YouTube Workspace Link */}
     <div className="space-y-4">
      <div className="flex items-center gap-2">
       <Link2 size={20} strokeWidth={3} />
       <h2 className="text-2xl font-black uppercase tracking-tighter">Workspace Link</h2>
      </div>
      <p className="text-sm font-bold text-gray-600">
       Link your channel via OAuth to unlock uploads, analytics, and metadata updates.
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
       No OAuth required: resolve a public handle and load public-only stats.
      </p>
      <div className="flex gap-3">
       <input
        value={handleInput}
        onChange={(event) => setHandleInput(event.target.value)}
        placeholder="@channelhandle or channel URL"
        className="flex-1 p-4 border-[3px] border-black rounded-xl font-bold outline-none"
       />
       <button
        onClick={handlePublicResolve}
        className={`${canonicalButtonClass} bg-[#96F5A6] text-black px-6 py-4 text-sm whitespace-nowrap`}>
        Resolve
       </button>
      </div>
      {handleStatus ? <p className="text-sm font-bold text-gray-700">{handleStatus}</p> : null}
     </div>
    </div>

    {/* Row 2: Ingest Mode (Full Width but Symmetrical) */}
    <div className="space-y-4 border-t-[3px] border-black pt-10">
     <div className="flex items-center gap-2">
      <Zap size={20} strokeWidth={3} />
      <h3 className="text-xl font-black uppercase tracking-tighter">Ingest Mode</h3>
     </div>
     <p className="font-bold text-gray-700 text-sm">
      Select how ViewTube should source data for analytics and master tables.
     </p>
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

    {/* Row 3: Data Mgmt & Trust */}
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
   </SubToolbox>
  </div>
 )
}

export default Settings
