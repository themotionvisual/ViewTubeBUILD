import React from "react"
import {
  Check,  Download, LockKeyhole,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react"
import { AccountActionButton } from "../../components/account/AccountActionButton"
import { AIModelSelector } from "../../components/ui/AIModelSelector"
import { TOPUP_DEFINITIONS, getReferralCode, type EntitlementState } from "../../services/billingEntitlement"
import type { IngestMode } from "../../services/productArchitecture"
import type { SubscriptionPlanId } from "../../services/subscriptionPlans"
import type { SettingsPanel, SettingsReadiness } from "./settingsControlDeck"
import { WorkspaceExperienceSettingsSection } from "./WorkspaceExperienceSettingsSection"
import { SettingsOverviewPanel } from "./SettingsOverviewPanel"
import { SettingsAccountPanel } from "./SettingsAccountPanel"
import { SettingsAiPanel } from "./SettingsAiPanel"
import { buildSettingsOverviewModel } from "./settingsWorkspaceModel"

const PLANS: Array<{ id: SubscriptionPlanId; label: string; price: string; bullets: string[]; accent: string }> = [
  { id: "basic", label: "Basic", price: "$0", bullets: ["Core tools", "Manual sync", "Basic analytics"], accent: "#C9F830" },
  { id: "beta", label: "Beta BYOK", price: "$0", bullets: ["Unlimited AI with your key", "Full strategy stack", "Community tier"], accent: "#FF7A59" },
  { id: "creator", label: "Creator", price: "$9.99/mo", bullets: ["48-hour trial", "Included AI credits", "Advanced dashboards"], accent: "#40C6E9" },
  { id: "creator_plus", label: "Creator Plus", price: "$19.99/mo", bullets: ["More included credits", "Priority capacity", "Creator workflows"], accent: "#FFE357" },
  { id: "creator_pro", label: "Creator Pro", price: "$39.99/mo", bullets: ["Highest creator credits", "Full strategy stack", "Heavy reasoning"], accent: "#FFB570" },
  { id: "executive", label: "Executive", price: "$69.99/mo", bullets: ["Unlimited generation", "Executive priority", "Full platform"], accent: "#FF83EA" },
]

const buttonClass = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border-[3px] border-black px-4 py-3 text-xs font-black uppercase tracking-[0.08em] shadow-[3px_3px_0_0_#000] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_#000] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
const inputClass = "min-h-12 w-full rounded-xl border-[3px] border-black bg-white px-4 font-bold outline-none focus-visible:ring-4 focus-visible:ring-[#00F0FF]"
const labelClass = "text-xs font-black uppercase tracking-[0.16em] text-black/60"

const Card: React.FC<React.PropsWithChildren<{ accent: string; description?: string; title: string }>> = ({ accent, children, description, title }) => (
  <section className="overflow-hidden rounded-[20px] border-[4px] border-black bg-white shadow-[7px_7px_0_0_#000]">
    <header className="border-b-[4px] border-black px-5 py-4" style={{ backgroundColor: accent }}>
      <h2 className="text-2xl font-[1000] uppercase leading-none tracking-[-0.04em]">{title}</h2>
      {description ? <p className="mt-2 text-sm font-bold leading-5 text-black/65">{description}</p> : null}
    </header>
    <div className="grid gap-5 p-5">{children}</div>
  </section>
)

export type UnifiedAccountSettingsSectionProps = {
  activePanel: SettingsPanel
  billingStatus: string | null
  canResolvePublicHandle: boolean
  canViewGeminiKey: boolean
  channelConnection: { isConnected: boolean; helper: string; settingsLabel: string; state: string }
  currentEmail: string
  currentHandleValue: string
  customReferralCode: string
  customTopupAmount: string
  dataResetStatus: string | null
  entitlement: EntitlementState
  exportStatus: string | null
  geminiKey: string
  ingestMode: IngestMode
  loadingPlan: SubscriptionPlanId | null
  meterLeft: number
  meterPct: number
  meterTotal: number
  meterUsed: number
  notifyBilling: boolean
  onChoosePlan: (planId: SubscriptionPlanId) => void
  onConnectChannel: () => void
  onCustomReferralCodeChange: (value: string) => void
  onCustomTopup: () => void
  onCustomTopupAmountChange: (value: string) => void
  onDeleteAccount: () => void
  onDisconnectChannel: () => void
  onExport: () => void
  onHandleInputChange: (value: string) => void
  onIngestModeChange: (mode: IngestMode) => void
  onOpenAiBrainIntake: () => void
  onOpenBillingPortal: () => void
  onOpenTransparencyCenter: () => void
  onPanelChange: (panel: SettingsPanel) => void
  onPublicResolve: () => void
  onRunFactoryReset: () => void
  onRunSoftReset: () => void
  onSaveGeminiKey: () => void
  onSetCustomReferralCode: () => void
  onToggleNotifyBilling: () => void
  onToggleShowKey: () => void
  onTopup: (sku: string) => void
  onUpdateGeminiKey: (value: string) => void
  profileName: string
  readiness: SettingsReadiness
  resolveStatus: string | null
  settingsSaveStatus: string | null
  showInternalOpsLink: boolean
  showKey: boolean
}

export const UnifiedAccountSettingsSection: React.FC<UnifiedAccountSettingsSectionProps> = (props) => {
  const {
    activePanel, billingStatus, canResolvePublicHandle, canViewGeminiKey, channelConnection,
    currentEmail, currentHandleValue, customReferralCode, customTopupAmount, dataResetStatus,
    entitlement, exportStatus, geminiKey, ingestMode, loadingPlan, meterLeft, meterPct,
    meterTotal, meterUsed, notifyBilling, onChoosePlan, onConnectChannel,
    onCustomReferralCodeChange, onCustomTopup, onCustomTopupAmountChange, onDeleteAccount,
    onDisconnectChannel, onExport, onHandleInputChange, onIngestModeChange, onOpenAiBrainIntake,
    onOpenBillingPortal, onOpenTransparencyCenter, onPanelChange, onPublicResolve,
    onRunFactoryReset, onRunSoftReset, onSaveGeminiKey, onSetCustomReferralCode,
    onToggleNotifyBilling, onToggleShowKey, onTopup, onUpdateGeminiKey, profileName,
    readiness, resolveStatus, settingsSaveStatus, showInternalOpsLink, showKey,
  } = props

  const overviewModel = buildSettingsOverviewModel({
    readiness,
    profileName,
    currentHandleValue,
    currentEmail,
    planId: entitlement.subscriptionPlanId,
    creditsLabel: entitlement.tier === "large" ? "Unlimited credits" : `${meterLeft.toLocaleString()} credits available`,
    ingestMode,
  })

  return (
    <>
        {activePanel === "overview" ? (
          <SettingsOverviewPanel model={overviewModel} onPanelChange={onPanelChange} />
        ) : null}

        {activePanel === "experience" ? <WorkspaceExperienceSettingsSection /> : null}

        {activePanel === "account" ? (
          <SettingsAccountPanel
            profileName={profileName}
            currentHandleValue={currentHandleValue}
            currentEmail={currentEmail}
            connected={channelConnection.isConnected}
            connectionHelper={channelConnection.helper || channelConnection.settingsLabel}
            connectionState={channelConnection.state}
            canResolvePublicHandle={canResolvePublicHandle}
            resolveStatus={resolveStatus}
            notifyBilling={notifyBilling}
            connectAction={
              <AccountActionButton
                surface="settings"
                channelSyncing={channelConnection.state === "syncing" || channelConnection.state === "authorizing"}
                onLegacyAction={onConnectChannel}
                data-vt-studio-control="true"
                data-size="compact"
                data-tone="accent"
              />
            }
            onDisconnect={onDisconnectChannel}
            onHandleInputChange={onHandleInputChange}
            onPublicResolve={onPublicResolve}
            onToggleNotifyBilling={onToggleNotifyBilling}
          />
        ) : null}

        {activePanel === "ai" ? (
          <SettingsAiPanel
            canViewGeminiKey={canViewGeminiKey}
            geminiKey={geminiKey}
            showKey={showKey}
            settingsSaveStatus={settingsSaveStatus}
            modelSelector={<AIModelSelector />}
            onOpenAiBrainIntake={onOpenAiBrainIntake}
            onSaveGeminiKey={onSaveGeminiKey}
            onToggleShowKey={onToggleShowKey}
            onUpdateGeminiKey={onUpdateGeminiKey}
          />
        ) : null}

        {activePanel === "billing" ? (
          <div className="grid gap-6">
            <Card accent="#FFE357" title="Billing and credits" description="Server-owned plan state, secure checkout, and usage capacity."><div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><p className={labelClass}>Available credits</p><p className="mt-2 text-5xl font-[1000] uppercase tracking-[-0.06em]">{entitlement.tier === "large" ? "Unlimited" : meterLeft.toLocaleString()}</p></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[["Plan", entitlement.subscriptionPlanId], ["Used", meterUsed.toLocaleString()], ["Total", entitlement.tier === "large" ? "∞" : meterTotal.toLocaleString()], ["Next refill", entitlement.nextRefillIso ? new Date(entitlement.nextRefillIso).toLocaleDateString() : "N/A"]].map(([label, value]) => <div key={label} className="min-w-[120px] rounded-xl border-[3px] border-black bg-[#f8f7f1] p-3"><p className={labelClass}>{label}</p><p className="mt-2 text-sm font-black uppercase">{value}</p></div>)}</div></div><div role="progressbar" aria-label="Credits remaining" aria-valuemin={0} aria-valuemax={100} aria-valuenow={meterPct} className="h-7 overflow-hidden rounded-full border-[3px] border-black bg-[#E5E7EB]"><div className="h-full motion-safe:transition-[width]" style={{ width: `${meterPct}%`, backgroundColor: meterPct > 65 ? "#4FFF5B" : meterPct > 30 ? "#FFE357" : "#FF8AAF" }} /></div><button type="button" onClick={onOpenBillingPortal} className={`${buttonClass} justify-self-start bg-[#CCFF00]`}><LockKeyhole size={17} /> Manage billing</button>{billingStatus && !billingStatus.toLowerCase().includes("entitlements synced with server") ? <p role="status" aria-live="polite" className="rounded-xl border-[3px] border-black bg-[#f8f7f1] p-3 text-sm font-black">{billingStatus}</p> : null}</Card>
            <Card accent="#40C6E9" title="Plans" description="Paid access activates only after verified server checkout."><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{PLANS.map((plan) => { const active = entitlement.subscriptionPlanId === plan.id; return <article key={plan.id} className="flex min-w-0 flex-col rounded-2xl border-[4px] border-black bg-white p-4 shadow-[5px_5px_0_0_#000]"><div className="flex items-center justify-between gap-3 rounded-xl border-[2px] border-black px-3 py-2" style={{ backgroundColor: plan.accent }}><p className="text-xs font-black uppercase tracking-[0.14em]">{plan.label}</p>{active ? <Check size={18} strokeWidth={4} aria-label="Current plan" /> : null}</div><p className="mt-4 text-3xl font-[1000] uppercase tracking-[-0.05em]">{plan.price}</p><ul className="my-4 grid gap-2 text-sm font-bold">{plan.bullets.map((bullet) => <li key={bullet}>• {bullet}</li>)}</ul><button type="button" onClick={() => onChoosePlan(plan.id)} disabled={active || loadingPlan === plan.id} className={`${buttonClass} mt-auto`} style={{ backgroundColor: plan.accent }}>{active ? "Current plan" : loadingPlan === plan.id ? "Working…" : plan.id === "basic" ? "Manage downgrade" : "Choose plan"}</button></article> })}</div></Card>
            <div className="grid gap-6 lg:grid-cols-2"><Card accent="#CCFF00" title="Top up credits"><div className="flex flex-wrap gap-3">{TOPUP_DEFINITIONS.map((topup) => <button key={topup.sku} type="button" onClick={() => onTopup(topup.sku)} className={`${buttonClass} bg-[#40C6E9]`}>${topup.priceUsd} · {topup.creditAmount.toLocaleString()}</button>)}</div><div className="grid gap-3 sm:grid-cols-[150px_1fr]"><label htmlFor="settings-custom-topup" className="sr-only">Custom top-up amount in US dollars</label><input id="settings-custom-topup" type="number" min={1} step={1} value={customTopupAmount} onChange={(event) => onCustomTopupAmountChange(event.target.value)} className={inputClass} /><button type="button" onClick={onCustomTopup} className={`${buttonClass} bg-[#CCFF00]`}>Custom top-up · 25% bonus at $50+</button></div></Card><Card accent="#FF83EA" title="Referral rewards"><div className="rounded-xl border-[3px] border-black bg-[#f8f7f1] p-4"><p className={labelClass}>Your referral code</p><p className="mt-2 break-all text-2xl font-black uppercase">{getReferralCode()}</p><p className="mt-2 text-xs font-bold">{entitlement.referralCodeLocked ? "Custom code locked" : "You can customize this once"}</p></div><label htmlFor="settings-referral-code" className={labelClass}>Custom referral code</label><input id="settings-referral-code" value={customReferralCode} onChange={(event) => onCustomReferralCodeChange(event.target.value.toUpperCase())} disabled={entitlement.referralCodeLocked} placeholder="Set a one-time referral code" className={inputClass} /><button type="button" onClick={onSetCustomReferralCode} disabled={entitlement.referralCodeLocked} className={`${buttonClass} bg-[#CCFF00]`}><Sparkles size={17} /> Set referral code</button></Card></div>
          </div>
        ) : null}

        {activePanel === "data" ? (
          <div className="grid gap-6"><Card accent="#40C6E9" title="Analytics source" description="Choose where canonical analytics and master tables read their data."><fieldset><legend className={labelClass}>Ingest mode</legend><div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{(["connected", "import", "hybrid", "public_handle"] as IngestMode[]).map((mode) => <button key={mode} type="button" aria-pressed={ingestMode === mode} onClick={() => onIngestModeChange(mode)} className={`${buttonClass} ${ingestMode === mode ? "bg-[#CCFF00]" : "bg-white"}`}>{mode.replace("_", " ")}</button>)}</div></fieldset><p className="text-sm font-bold leading-6 text-black/65"><strong>Connected</strong> uses API sync. <strong>Import</strong> uses uploaded datasets. <strong>Hybrid</strong> supplements canonical rows. <strong>Public handle</strong> is limited to public Basic-plan analytics.</p></Card><div className="grid gap-6 lg:grid-cols-2"><Card accent="#FFB570" title="Export + transparency"><p className="text-sm font-bold leading-6 text-black/65">Download your canonical data bundle or inspect how ViewTube stores and transforms analytics.</p><div className="grid gap-3 sm:grid-cols-2"><button type="button" onClick={onExport} className={`${buttonClass} bg-[#FFB570]`}><Download size={17} /> Export all data</button>{showInternalOpsLink ? <button type="button" onClick={onOpenTransparencyCenter} className={`${buttonClass} bg-[#40C6E9]`}><ShieldCheck size={17} /> Data center</button> : null}</div>{exportStatus ? <p role="status" aria-live="polite" className="text-sm font-black">{exportStatus}</p> : null}</Card><Card accent="#FF8AAF" title="Recovery + danger zone" description="Destructive controls stay isolated from everyday settings."><div className="grid gap-3 sm:grid-cols-2"><button type="button" onClick={onRunSoftReset} className={`${buttonClass} bg-[#FFB570]`}><Trash2 size={17} /> Clear local data</button><button type="button" onClick={onRunFactoryReset} className={`${buttonClass} bg-black text-white`}><Trash2 size={17} /> Factory reset</button></div><button type="button" onClick={onDeleteAccount} className={`${buttonClass} bg-[#FF1744] text-white`}><LockKeyhole size={17} /> Delete ViewTube account</button>{dataResetStatus ? <p role="status" aria-live="polite" className="text-sm font-black">{dataResetStatus}</p> : null}</Card></div></div>
        ) : null}

    </>
  )
}
