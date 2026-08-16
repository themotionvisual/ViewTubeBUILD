import React, { useEffect, useMemo, useState } from "react"
import { Settings as SettingsIcon } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { useBrain } from "../context/useBrain"
import {
  createCheckoutSession,
  createBillingPortalSession,
  fetchEntitlementFromServer,
  isOwnerEmail,
  setCustomReferralCodeOnce,
  syncReferralCodeToChannelHandle,
  TOPUP_DEFINITIONS,
} from "../services/billingEntitlement"
import { downloadExportBundle } from "../services/dataExport"
import { googleService } from "../services/googleService"
import { getVaultSnapshot, setVaultSnapshot } from "../services/keyVault"
import { clearCachedDataSoft, factoryResetAll } from "../services/localDataReset"
import { setStoredIngestMode } from "../services/productArchitecture"
import { resolvePublicChannel } from "../services/publicHandleMode"
import type { SubscriptionPlanId } from "../services/subscriptionPlans"
import { SettingsHelpSection } from "./settings/SettingsHelpSection"
import { UnifiedAccountSettingsSection } from "./settings/UnifiedAccountSettingsSection"
import { useUnifiedAccount } from "../context/UnifiedAccountContext"
import { parseAccountIntent, sanitizeInternalReturnTo } from "../services/account/accountContracts"
import { useEntitlement } from "../context/entitlementContext"

const isTopupStripeConfigError = (message: string): boolean => {
  const lower = String(message || "").toLowerCase()
  return (
    lower.includes("missing stripe price env for top-up") ||
    lower.includes("missing stripe price env for topup") ||
    lower.includes("no such price")
  )
}

const Settings: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { authState, channelConnection, connectChannel, disconnectChannel } = useBrain()
  const account = useUnifiedAccount()
  const entitlement = useEntitlement()
  const isAuth = authState.isAuthenticated

  const [geminiKey, setGeminiKey] = useState("")
  const [showKey, setShowKey] = useState(false)
  const [settingsSaveStatus, setSettingsSaveStatus] = useState<string | null>(null)
  const [handleInput, setHandleInput] = useState("")
  const [handleStatus, setHandleStatus] = useState<string | null>(null)
  const [exportStatus, setExportStatus] = useState<string | null>(null)
  const [dataResetStatus, setDataResetStatus] = useState<string | null>(null)
  const [loadingPlan, setLoadingPlan] = useState<SubscriptionPlanId | null>(null)
  const [billingStatus, setBillingStatus] = useState<string | null>(null)
  const [currentEmail, setCurrentEmail] = useState("")
  const [profileName, setProfileName] = useState("")
  const [profileHandle, setProfileHandle] = useState("")
  const [notifyBilling, setNotifyBilling] = useState(true)
  const [customReferralCode, setCustomReferralCode] = useState("")
  const [customTopupAmount, setCustomTopupAmount] = useState("50")

  const query = new URLSearchParams(location.search)
  const highlightBilling = query.get("panel") === "billing"
  const requestedAccountIntent = parseAccountIntent(query.get("intent"))
  const requestedReturnTo = sanitizeInternalReturnTo(query.get("returnTo"))
  const canViewGeminiKey = entitlement.tier === "large" || isOwnerEmail(currentEmail)
  const isBasicPlan = entitlement.subscriptionPlanId === "basic"
  const showInternalOpsLink = isOwnerEmail(currentEmail)
  const canResolvePublicHandle = isBasicPlan
  const displayedChannelHandle = handleInput || (profileHandle ? `@${String(profileHandle).replace(/^@+/, "")}` : "")
  const meterTotal = useMemo(
    () => Math.max(1, Math.floor(entitlement.rolloverCap || entitlement.monthlyCreditGrant || entitlement.creditBalance || 1)),
    [entitlement.creditBalance, entitlement.monthlyCreditGrant, entitlement.rolloverCap],
  )
  const meterLeft = useMemo(() => Math.max(0, Math.floor(entitlement.creditBalance || 0)), [entitlement.creditBalance])
  const meterUsed = Math.max(0, meterTotal - meterLeft)
  const meterPct =
    entitlement.tier === "large" ? 100 : Math.max(0, Math.min(100, Math.round((meterLeft / meterTotal) * 100)))

  useEffect(() => {
    const vault = getVaultSnapshot()
    setGeminiKey(vault.gemini || "")
    setProfileName(authState.channelName || "")
    setProfileHandle(authState.channelHandle || "")
  }, [authState.channelHandle, authState.channelName])

  useEffect(() => {
    if (account.snapshot.profile.email) setCurrentEmail(account.snapshot.profile.email.toLowerCase())
    if (account.snapshot.profile.displayName) setProfileName(account.snapshot.profile.displayName)
  }, [account.snapshot.profile.displayName, account.snapshot.profile.email])

  useEffect(() => {
    const syncBilling = async () => {
      const authReady = account.snapshot?.authentication?.status === "authenticated" || isAuth
      if (!authReady) {
        setBillingStatus("Connect to sync billing entitlements.")
        return
      }
      try {
        if (!account.serverEnabled) {
          const userInfo = await googleService.getUserInfo()
          setCurrentEmail((userInfo.email || "").toLowerCase())
        }
        await fetchEntitlementFromServer()
        setBillingStatus("Entitlements synced with server.")
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        if (message.toLowerCase().includes("not authenticated")) {
          setBillingStatus("Connect to sync billing entitlements.")
          return
        }
        console.error("Billing sync failed", error)
        setBillingStatus("Failed to sync billing.")
      }
    }
    syncBilling()
  }, [account.serverEnabled, account.snapshot?.authentication?.status, isAuth])

  const handleAccountAction = async () => {
    if (account.serverEnabled) {
      const intent = requestedAccountIntent || account.intent
      if (intent === "manage_account") return
      await account.start(intent, requestedReturnTo)
      return
    }
    await connectChannel()
  }

  const handleDisconnectAccountChannel = async () => {
    if (account.serverEnabled) await account.disconnectGoogle()
    disconnectChannel()
  }

  useEffect(() => {
    if (!authState.channelHandle) return
    syncReferralCodeToChannelHandle(authState.channelHandle)
  }, [authState.channelHandle])

  const handleSaveGeminiKey = () => {
    setVaultSnapshot({ gemini: geminiKey })
    setSettingsSaveStatus("API key saved.")
    setTimeout(() => setSettingsSaveStatus(null), 2500)
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
      setHandleStatus(`Resolved: ${result.channelTitle || "Unknown Channel"} (${result.resolvedChannelId})`)
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
      const manifest = await downloadExportBundle(channelConnection.isConnected ? "connected" : "public_handle", "lifetime")
      setExportStatus(`Export complete at ${manifest.generatedAt}.`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setExportStatus(`Export failed: ${message}`)
    }
  }

  const handleChoosePlan = async (planId: SubscriptionPlanId) => {
    if (planId === "basic") {
      setBillingStatus("Downgrades are managed securely through the billing portal.")
      return
    }
    try {
      setLoadingPlan(planId)
      setBillingStatus("Creating secure checkout session...")
      const session = await createCheckoutSession({
        planId,
        successUrl: `${window.location.origin}/account?panel=billing`,
        cancelUrl: `${window.location.origin}/account?panel=billing`,
      })
      window.location.href = session.checkoutUrl
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setBillingStatus(`Checkout failed: ${message}`)
    } finally {
      setLoadingPlan(null)
    }
  }

  const handleOpenBillingPortal = async () => {
    try {
      setBillingStatus("Opening secure billing portal...")
      const { portalUrl } = await createBillingPortalSession(`${window.location.origin}/account?panel=billing`)
      window.location.assign(portalUrl)
    } catch (error) {
      setBillingStatus(`Billing portal failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const handleTopup = async (topupSku: string) => {
    try {
      setBillingStatus("Creating top-up checkout session...")
      const session = await createCheckoutSession({
        planId: "creator_plus",
        successUrl: `${window.location.origin}/account?panel=billing`,
        cancelUrl: `${window.location.origin}/account?panel=billing`,
        mode: "topup",
        topupSku,
      })
      window.location.href = session.checkoutUrl
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      if (isTopupStripeConfigError(message)) {
        setBillingStatus("Top-up checkout is not configured yet. Add Stripe top-up price IDs in billing env.")
        return
      }
      setBillingStatus(`Top-up failed: ${message}`)
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
        successUrl: `${window.location.origin}/account?panel=billing`,
        cancelUrl: `${window.location.origin}/account?panel=billing`,
        mode: "topup",
        topupSku: `custom_${amountUsd.toFixed(2)}`,
      })
      window.location.href = session.checkoutUrl
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      if (isTopupStripeConfigError(message)) {
        setBillingStatus("Custom top-up checkout is not configured yet. Add Stripe top-up price IDs in billing env.")
        return
      }
      setBillingStatus(`Custom top-up failed: ${message}`)
    }
  }

  const handleRunSoftReset = async () => {
    if (!confirm("Clear this site's local browser data, caches, IndexedDB, service workers, and stored session data?")) return
    await clearCachedDataSoft()
    setDataResetStatus("Site data and cached data cleared.")
    setTimeout(() => setDataResetStatus(null), 3500)
  }

  const handleRunFactoryReset = async () => {
    if (!confirm("FACTORY RESET EVERYTHING? Clears ALL keys and auth.")) return
    await factoryResetAll()
    setDataResetStatus("Factory reset complete. Site data cleared.")
    setTimeout(() => setDataResetStatus(null), 3500)
  }

  const handleDeleteAccount = async () => {
    if (!confirm("Delete your ViewTube account? Active subscriptions must be canceled first. This cannot be undone.")) return
    if (!confirm("Final confirmation: permanently delete this ViewTube account and its server-side onboarding and AI-credit records?")) return
    try {
      await account.deleteAccount()
      await clearCachedDataSoft()
      navigate("/", { replace: true })
    } catch (error) {
      setDataResetStatus(`Account deletion failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto pb-32 px-4 space-y-10 animate-fade-in">
      <div className="flex flex-wrap justify-between items-end gap-4 border-b-[4px] border-black pb-4">
        <div className="space-y-2">
          <h1 className="text-5xl font-black uppercase tracking-tighter text-black">Account Settings</h1>
          <p className="font-bold text-gray-700 uppercase tracking-wide text-xs">
            Unified account, billing, workspace, and data controls
          </p>
        </div>
        <div className="bg-[#FF83EA] text-black p-3 rounded-xl border-[4px] border-black shadow-[4px_4px_0px_0px_black] rotate-2">
          <SettingsIcon size={32} />
        </div>
      </div>

      <UnifiedAccountSettingsSection
        billingStatus={billingStatus}
        canResolvePublicHandle={canResolvePublicHandle}
        canViewGeminiKey={canViewGeminiKey}
        currentEmail={currentEmail}
        currentHandleValue={displayedChannelHandle}
        customReferralCode={customReferralCode}
        customTopupAmount={customTopupAmount}
        dataResetStatus={dataResetStatus}
        entitlement={entitlement}
        exportStatus={exportStatus}
        geminiKey={geminiKey}
        highlightBilling={highlightBilling}
        loadingPlan={loadingPlan}
        meterLeft={meterLeft}
        meterPct={meterPct}
        meterTotal={meterTotal}
        meterUsed={meterUsed}
        notifyBilling={notifyBilling}
        onChoosePlan={handleChoosePlan}
        onConnectChannel={handleAccountAction}
        onCustomReferralCodeChange={setCustomReferralCode}
        onCustomTopupAmountChange={setCustomTopupAmount}
        onDisconnectChannel={handleDisconnectAccountChannel}
        onDeleteAccount={handleDeleteAccount}
        onExport={handleExport}
        onHandleInputChange={setHandleInput}
        onOpenGuide={(hash) => navigate(`/user-guide${hash}`)}
        onOpenAiBrainIntake={() => navigate("/ai-brain?intake=1")}
        onOpenBillingPortal={handleOpenBillingPortal}
        onOpenTransparencyCenter={() => navigate("/data-transparency")}
        onPublicResolve={handlePublicResolve}
        onRunFactoryReset={handleRunFactoryReset}
        onRunSoftReset={handleRunSoftReset}
        onSaveGeminiKey={handleSaveGeminiKey}
        onSetCustomReferralCode={() => {
          const result = setCustomReferralCodeOnce(customReferralCode)
          setBillingStatus(result.ok ? "Referral code set and locked." : result.reason || "Could not set referral code.")
        }}
        onTopup={handleTopup}
        onCustomTopup={handleCustomTopup}
        onToggleShowKey={() => setShowKey((prev) => !prev)}
        onToggleNotifyBilling={() => setNotifyBilling((prev) => !prev)}
        onUpdateGeminiKey={setGeminiKey}
        profileName={profileName}
        resolveDisabled={!canResolvePublicHandle}
        resolveStatus={handleStatus}
        settingsSaveStatus={settingsSaveStatus}
        showInternalOpsLink={showInternalOpsLink}
        showKey={showKey}
        channelConnection={{
          ...channelConnection,
          isConnected: account.snapshot.google.status === "connected" || channelConnection.isConnected,
          settingsLabel: account.label,
          state: account.pending ? "authorizing" : channelConnection.state,
        }}
      />

      <SettingsHelpSection onNavigate={navigate} />
    </div>
  )
}

export default Settings
