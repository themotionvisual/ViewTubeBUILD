import React, { useEffect, useMemo, useRef, useState } from "react"
import { Check, Settings as SettingsIcon, ShieldCheck, X } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { useBrain } from "../context/useBrain"
import { useUnifiedAccount } from "../context/UnifiedAccountContext"
import { useFeatureAccess } from "../context/featureAccessContext"
import {
  createBillingPortalSession,
  createCheckoutSession,
  fetchEntitlementFromServer,
  getCurrentEntitlement,
  isOwnerEmail,
  setCustomReferralCodeOnce,
  syncReferralCodeToChannelHandle,
} from "../services/billingEntitlement"
import { loadAiBrainContext } from "../services/aiBrainContext"
import { downloadExportBundle } from "../services/dataExport"
import { googleService } from "../services/googleService"
import { getVaultSnapshot, setVaultSnapshot } from "../services/keyVault"
import {
  clearAnalyticsStateForFreshSync,
  clearCachedDataSoft,
  factoryResetAll,
} from "../services/localDataReset"
import {
  getStoredIngestMode,
  setStoredIngestMode,
  type IngestMode,
} from "../services/productArchitecture"
import { resolvePublicChannel } from "../services/publicHandleMode"
import type { SubscriptionPlanId } from "../services/subscriptionPlans"
import { SettingsHelpSection } from "./settings/SettingsHelpSection"
import { UnifiedAccountSettingsSection } from "./settings/UnifiedAccountSettingsSection"
import {
  resolveSettingsPanel,
  resolveSettingsReadiness,
  type SettingsPanel,
} from "./settings/settingsControlDeck"

type ConfirmationKind = "cache" | "factory" | "delete"

const isTopupStripeConfigError = (message: string): boolean => {
  const lower = String(message || "").toLowerCase()
  return lower.includes("missing stripe price env for top-up") || lower.includes("missing stripe price env for topup") || lower.includes("no such price")
}

const Settings: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const account = useUnifiedAccount()
  const featureAccess = useFeatureAccess()
  const { authState, channelConnection, connectChannel, disconnectChannel } = useBrain()
  const isAuth = account.snapshot.authentication.status === "authenticated" || authState.isAuthenticated

  const [geminiKey, setGeminiKey] = useState("")
  const [showKey, setShowKey] = useState(false)
  const [settingsSaveStatus, setSettingsSaveStatus] = useState<string | null>(null)
  const [handleInput, setHandleInput] = useState("")
  const [handleStatus, setHandleStatus] = useState<string | null>(null)
  const [ingestMode, setIngestMode] = useState<IngestMode>(() => getStoredIngestMode())
  const [exportStatus, setExportStatus] = useState<string | null>(null)
  const [dataResetStatus, setDataResetStatus] = useState<string | null>(null)
  const [loadingPlan, setLoadingPlan] = useState<SubscriptionPlanId | null>(null)
  const [billingStatus, setBillingStatus] = useState<string | null>(null)
  const [currentEmail, setCurrentEmail] = useState("")
  const [customReferralCode, setCustomReferralCode] = useState("")
  const [customTopupAmount, setCustomTopupAmount] = useState("50")
  const [notifyBilling, setNotifyBilling] = useState(() => localStorage.getItem("vt.settings.billing-alerts") !== "off")
  const [confirmation, setConfirmation] = useState<ConfirmationKind | null>(null)
  const [confirmationText, setConfirmationText] = useState("")
  const confirmationTriggerRef = useRef<HTMLElement | null>(null)

  const query = new URLSearchParams(location.search)
  const activePanel = resolveSettingsPanel(query.get("panel"))
  const entitlement = getCurrentEntitlement()
  const isBasicPlan = entitlement.subscriptionPlanId === "basic"
  const canViewGeminiKey = entitlement.tier === "large" || isOwnerEmail(currentEmail) || featureAccess.decision("settings.api_keys").disposition === "enabled"
  const showInternalOpsLink = isOwnerEmail(currentEmail)
  const profileName = account.snapshot.profile.displayName || authState.channelName || ""
  const profileHandle = account.snapshot.google.channelHandle || authState.channelHandle || ""
  const displayedChannelHandle = handleInput
  const connected = account.snapshot.google.status === "connected" || channelConnection.isConnected
  const brainContext = loadAiBrainContext()
  const readiness = resolveSettingsReadiness(
    account.snapshot,
    connected,
    Boolean(brainContext.completedAt || brainContext.audienceNiche || brainContext.whatNext),
  )

  const meterTotal = useMemo(
    () => Math.max(1, Math.floor(entitlement.rolloverCap || entitlement.monthlyCreditGrant || entitlement.creditBalance || 1)),
    [entitlement.creditBalance, entitlement.monthlyCreditGrant, entitlement.rolloverCap],
  )
  const meterLeft = useMemo(() => Math.max(0, Math.floor(entitlement.creditBalance || 0)), [entitlement.creditBalance])
  const meterUsed = Math.max(0, meterTotal - meterLeft)
  const meterPct = entitlement.tier === "large" ? 100 : Math.max(0, Math.min(100, Math.round((meterLeft / meterTotal) * 100)))

  useEffect(() => {
    setGeminiKey(getVaultSnapshot().gemini || "")
  }, [])

  useEffect(() => {
    const snapshotEmail = account.snapshot.profile.email?.toLowerCase()
    if (snapshotEmail) setCurrentEmail(snapshotEmail)
  }, [account.snapshot.profile.email])

  useEffect(() => {
    if (!authState.channelHandle) return
    syncReferralCodeToChannelHandle(authState.channelHandle)
  }, [authState.channelHandle])

  useEffect(() => {
    if (!profileHandle) return
    setHandleInput((current) => current || `@${String(profileHandle).replace(/^@+/, "")}`)
  }, [profileHandle])

  useEffect(() => {
    const syncBilling = async () => {
      if (!isAuth) {
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
    void syncBilling()
  }, [account.serverEnabled, isAuth])

  const changePanel = (panel: SettingsPanel) => {
    const next = new URLSearchParams(location.search)
    next.set("panel", panel)
    navigate(`${location.pathname}?${next.toString()}${location.hash}`, { replace: true })
    requestAnimationFrame(() => document.getElementById(`settings-panel-${panel}`)?.focus())
  }

  const handleAccountAction = async () => {
    if (account.serverEnabled) {
      if (account.intent !== "manage_account") await account.start(account.intent, `${location.pathname}${location.search}${location.hash}`)
      return
    }
    await clearAnalyticsStateForFreshSync()
    await connectChannel()
  }

  const handleDisconnectAccountChannel = async () => {
    if (account.serverEnabled) await account.disconnectGoogle()
    disconnectChannel()
  }

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
      setIngestMode("public_handle")
      setStoredIngestMode("public_handle")
      localStorage.setItem("vt_public_channel_id", result.resolvedChannelId)
      if (result.resolvedHandle) localStorage.setItem("vt_public_channel_handle", result.resolvedHandle)
    } catch (error) {
      setHandleStatus(`Resolve failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const handleExport = async () => {
    setExportStatus("Building export bundle...")
    try {
      const manifest = await downloadExportBundle(ingestMode, "lifetime")
      setExportStatus(`Export complete at ${manifest.generatedAt}.`)
    } catch (error) {
      setExportStatus(`Export failed: ${error instanceof Error ? error.message : String(error)}`)
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
      setBillingStatus(`Checkout failed: ${error instanceof Error ? error.message : String(error)}`)
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
      setBillingStatus(isTopupStripeConfigError(message) ? "Top-up checkout is not configured yet." : `Top-up failed: ${message}`)
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
      setBillingStatus(isTopupStripeConfigError(message) ? "Custom top-up checkout is not configured yet." : `Custom top-up failed: ${message}`)
    }
  }

  const openConfirmation = (kind: ConfirmationKind) => {
    confirmationTriggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setConfirmationText("")
    setConfirmation(kind)
  }

  const closeConfirmation = () => {
    setConfirmation(null)
    setConfirmationText("")
    requestAnimationFrame(() => confirmationTriggerRef.current?.focus())
  }

  const runConfirmedAction = async () => {
    const kind = confirmation
    if (!kind) return
    closeConfirmation()
    try {
      if (kind === "cache") {
        await clearCachedDataSoft()
        setDataResetStatus("Site data and cached analytics cleared.")
      } else if (kind === "factory") {
        await factoryResetAll()
        setDataResetStatus("Factory reset complete.")
      } else {
        await account.deleteAccount()
        await clearCachedDataSoft()
        navigate("/", { replace: true })
      }
    } catch (error) {
      setDataResetStatus(`Action failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const confirmationRequiredText = confirmation === "delete" ? "DELETE" : confirmation === "factory" ? "RESET" : "CLEAR"
  const confirmationReady = confirmationText.trim().toUpperCase() === confirmationRequiredText

  return (
    <div className="mx-auto flex max-w-[1600px] flex-col gap-8 px-4 pb-32 animate-fade-in">
      <header className="overflow-hidden rounded-[24px] border-[5px] border-black bg-[#111] text-white shadow-[12px_12px_0_0_#FF4FD8]">
        <div className="grid gap-6 p-6 md:p-8 xl:grid-cols-[1fr_auto] xl:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[#CCFF00]">Creator control deck</p>
            <h1 className="mt-3 text-5xl font-[1000] uppercase leading-[0.9] tracking-[-0.06em] md:text-7xl">Settings</h1>
            <p className="mt-4 max-w-3xl text-sm font-bold leading-6 text-white/65">Account, YouTube, AI, billing, analytics sources, privacy, and recovery—organized around the next action that matters.</p>
          </div>
          <div className="grid min-w-[240px] gap-3 rounded-2xl border-[3px] border-white/25 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-4"><span className="text-xs font-black uppercase tracking-[0.14em] text-white/55">System readiness</span><span className="text-3xl font-[1000] text-[#CCFF00]">{readiness.completed}/{readiness.items.length}</span></div>
            <div role="progressbar" aria-label="Settings readiness" aria-valuemin={0} aria-valuemax={readiness.items.length} aria-valuenow={readiness.completed} className="h-3 overflow-hidden rounded-full border-2 border-white/30 bg-black"><div className="h-full bg-[#CCFF00] motion-safe:transition-[width]" style={{ width: `${(readiness.completed / readiness.items.length) * 100}%` }} /></div>
          </div>
        </div>
        <div className="flex items-center gap-3 border-t-[4px] border-black bg-[#00F0FF] px-5 py-3 text-black"><SettingsIcon size={20} strokeWidth={3} aria-hidden="true" /><p className="text-xs font-black uppercase tracking-[0.14em]">{readiness.nextLabel}</p></div>
      </header>

      <UnifiedAccountSettingsSection
        activePanel={activePanel}
        billingStatus={billingStatus}
        canResolvePublicHandle={isBasicPlan}
        canViewGeminiKey={canViewGeminiKey}
        channelConnection={{ ...channelConnection, isConnected: connected, settingsLabel: account.label, state: account.pending ? "authorizing" : channelConnection.state }}
        currentEmail={currentEmail}
        currentHandleValue={displayedChannelHandle}
        customReferralCode={customReferralCode}
        customTopupAmount={customTopupAmount}
        dataResetStatus={dataResetStatus}
        entitlement={entitlement}
        exportStatus={exportStatus}
        geminiKey={geminiKey}
        ingestMode={ingestMode}
        loadingPlan={loadingPlan}
        meterLeft={meterLeft}
        meterPct={meterPct}
        meterTotal={meterTotal}
        meterUsed={meterUsed}
        notifyBilling={notifyBilling}
        onChoosePlan={handleChoosePlan}
        onConnectChannel={handleAccountAction}
        onCustomReferralCodeChange={setCustomReferralCode}
        onCustomTopup={handleCustomTopup}
        onCustomTopupAmountChange={setCustomTopupAmount}
        onDeleteAccount={() => openConfirmation("delete")}
        onDisconnectChannel={() => void handleDisconnectAccountChannel()}
        onExport={() => void handleExport()}
        onHandleInputChange={setHandleInput}
        onIngestModeChange={(mode) => { setIngestMode(mode); setStoredIngestMode(mode) }}
        onOpenAiBrainIntake={() => navigate("/ai-brain?intake=1")}
        onOpenBillingPortal={() => void handleOpenBillingPortal()}
        onOpenTransparencyCenter={() => navigate("/data-transparency")}
        onPanelChange={changePanel}
        onPublicResolve={() => void handlePublicResolve()}
        onRunFactoryReset={() => openConfirmation("factory")}
        onRunSoftReset={() => openConfirmation("cache")}
        onSaveGeminiKey={handleSaveGeminiKey}
        onSetCustomReferralCode={() => {
          const result = setCustomReferralCodeOnce(customReferralCode)
          setBillingStatus(result.ok ? "Referral code set and locked." : result.reason || "Could not set referral code.")
        }}
        onToggleNotifyBilling={() => setNotifyBilling((current) => { const next = !current; localStorage.setItem("vt.settings.billing-alerts", next ? "on" : "off"); return next })}
        onToggleShowKey={() => setShowKey((current) => !current)}
        onTopup={(sku) => void handleTopup(sku)}
        onUpdateGeminiKey={setGeminiKey}
        profileName={profileName}
        readiness={readiness}
        resolveStatus={handleStatus}
        settingsSaveStatus={settingsSaveStatus}
        showInternalOpsLink={showInternalOpsLink}
        showKey={showKey}
      />

      {activePanel === "help" ? <SettingsHelpSection onNavigate={navigate} /> : null}

      {confirmation ? (
        <div className="fixed inset-0 z-[200] grid place-items-center bg-black/70 p-4" role="presentation" onKeyDown={(event) => {
          if (event.key === "Escape") {
            closeConfirmation()
            return
          }
          if (event.key !== "Tab") return
          const dialog = event.currentTarget.querySelector<HTMLElement>("[role='dialog']")
          const focusable = Array.from(dialog?.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex='-1'])") || [])
          if (!focusable.length) return
          const first = focusable[0]
          const last = focusable[focusable.length - 1]
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault()
            last.focus()
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault()
            first.focus()
          }
        }} onMouseDown={(event) => { if (event.target === event.currentTarget) closeConfirmation() }}>
          <section role="dialog" aria-modal="true" aria-labelledby="settings-confirm-title" className="w-full max-w-xl overflow-hidden rounded-[22px] border-[5px] border-black bg-white shadow-[10px_10px_0_0_#FF4FD8]">
            <header className="flex items-center justify-between gap-4 border-b-[4px] border-black bg-[#FF8AAF] p-5"><div><p className="text-xs font-black uppercase tracking-[0.16em]">Danger zone</p><h2 id="settings-confirm-title" className="mt-1 text-3xl font-[1000] uppercase tracking-[-0.04em]">Confirm {confirmation === "cache" ? "local data clear" : confirmation === "factory" ? "factory reset" : "account deletion"}</h2></div><button type="button" onClick={closeConfirmation} aria-label="Cancel and close confirmation" className="grid size-11 place-items-center rounded-xl border-[3px] border-black bg-white shadow-[3px_3px_0_0_#000] focus-visible:outline focus-visible:outline-4"><X size={20} /></button></header>
            <div className="grid gap-5 p-5">
              <div className="rounded-xl border-[3px] border-black bg-[#f8f7f1] p-4 text-sm font-bold leading-6">{confirmation === "cache" ? "Clears all ViewTube data stored on this device, including local settings, API keys, authentication cookies, cached analytics, IndexedDB, and service-worker caches. Your server account is not deleted, but you may be signed out. Export first if you need a recovery copy." : confirmation === "factory" ? "Clears all local ViewTube data, settings, keys, and authentication from this device. Export first if you need a recovery copy." : "Permanently deletes the ViewTube account and its server-side onboarding and AI-credit records. Active subscriptions must be canceled first."}</div>
              {confirmationRequiredText ? <div><label htmlFor="settings-confirm-text" className="text-xs font-black uppercase tracking-[0.14em]">Type {confirmationRequiredText} to continue</label><input id="settings-confirm-text" autoFocus value={confirmationText} onChange={(event) => setConfirmationText(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border-[3px] border-black px-4 font-black uppercase outline-none focus-visible:ring-4 focus-visible:ring-[#00F0FF]" /></div> : null}
              <div className="grid gap-3 sm:grid-cols-2"><button type="button" onClick={closeConfirmation} className="inline-flex min-h-12 items-center justify-center rounded-xl border-[3px] border-black bg-white px-4 font-black uppercase shadow-[3px_3px_0_0_#000] focus-visible:outline focus-visible:outline-4"><ShieldCheck size={18} className="mr-2" /> Cancel</button><button type="button" disabled={!confirmationReady} onClick={() => void runConfirmedAction()} className="inline-flex min-h-12 items-center justify-center rounded-xl border-[3px] border-black bg-[#FF1744] px-4 font-black uppercase text-white shadow-[3px_3px_0_0_#000] focus-visible:outline focus-visible:outline-4 disabled:opacity-50"><Check size={18} className="mr-2" /> Confirm action</button></div>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}

export default Settings
