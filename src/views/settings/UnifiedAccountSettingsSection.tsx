import React from "react"
import {
  ArrowRight,
  Bell,
  Bot,
  Check,
  CircleUserRound,
  CreditCard,
  Database,
  Download,
  Eye,
  EyeOff,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
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

const PLANS: Array<{ id: SubscriptionPlanId; label: string; price: string; bullets: string[]; accent: string }> = [
  { id: "basic", label: "Basic", price: "$0", bullets: ["Core tools", "Manual sync", "Basic analytics"], accent: "#C9F830" },
  { id: "beta", label: "Beta BYOK", price: "$0", bullets: ["Unlimited AI with your key", "Full strategy stack", "Community tier"], accent: "#FF7A59" },
  { id: "creator", label: "Creator", price: "$9.99/mo", bullets: ["48-hour trial", "Included AI credits", "Advanced dashboards"], accent: "#40C6E9" },
  { id: "creator_plus", label: "Creator Plus", price: "$19.99/mo", bullets: ["More included credits", "Priority capacity", "Creator workflows"], accent: "#FFE357" },
  { id: "creator_pro", label: "Creator Pro", price: "$39.99/mo", bullets: ["Highest creator credits", "Full strategy stack", "Heavy reasoning"], accent: "#FFB570" },
  { id: "executive", label: "Executive", price: "$69.99/mo", bullets: ["Unlimited generation", "Executive priority", "Full platform"], accent: "#FF83EA" },
]

const PANELS: Array<{ id: SettingsPanel; label: string; description: string; icon: React.ReactNode }> = [
  { id: "overview", label: "Overview", description: "System readiness", icon: <LayoutDashboard size={19} /> },
  { id: "account", label: "Account", description: "Identity and channel", icon: <CircleUserRound size={19} /> },
  { id: "ai", label: "AI Runtime", description: "Brain, models, API key", icon: <Bot size={19} /> },
  { id: "billing", label: "Plan + Credits", description: "Billing and referrals", icon: <CreditCard size={19} /> },
  { id: "data", label: "Data + Privacy", description: "Sources and recovery", icon: <Database size={19} /> },
  { id: "help", label: "Help + Legal", description: "Guides and policies", icon: <ShieldCheck size={19} /> },
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

const ReadinessGrid: React.FC<{ readiness: SettingsReadiness }> = ({ readiness }) => (
  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
    {readiness.items.map((item) => (
      <article key={item.id} className={`rounded-2xl border-[3px] border-black p-4 ${item.ready ? "bg-[#CCFF00]" : "bg-[#f8f7f1]"}`}>
        <div className="flex items-start justify-between gap-3">
          <div><p className={labelClass}>{item.label}</p><p className="mt-2 text-lg font-black uppercase">{item.state}</p></div>
          <span className="grid size-8 shrink-0 place-items-center rounded-full border-[2px] border-black bg-white" aria-hidden="true">{item.ready ? <Check size={17} strokeWidth={4} /> : <ArrowRight size={17} strokeWidth={4} />}</span>
        </div>
      </article>
    ))}
  </div>
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

  return (
    <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[270px_minmax(0,1fr)]">
      <aside className="min-w-0 max-w-full xl:sticky xl:top-24">
        <nav aria-label="Settings sections" className="max-w-full overflow-x-auto rounded-[20px] border-[4px] border-black bg-[#111] p-3 text-white shadow-[7px_7px_0_0_#FF4FD8]">
          <div className="flex min-w-max gap-2 xl:min-w-0 xl:flex-col">
            {PANELS.map((panel) => {
              const active = activePanel === panel.id
              return (
                <button key={panel.id} type="button" aria-current={active ? "page" : undefined} onClick={() => onPanelChange(panel.id)} className={`flex min-h-14 min-w-[170px] items-center gap-3 rounded-xl border-[3px] px-3 py-2 text-left focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 xl:min-w-0 ${active ? "border-black bg-[#CCFF00] text-black shadow-[3px_3px_0_0_#fff]" : "border-white/20 bg-white/5 text-white hover:border-white/60"}`}>
                  <span aria-hidden="true">{panel.icon}</span>
                  <span><span className="block text-xs font-black uppercase tracking-[0.12em]">{panel.label}</span><span className={`mt-1 block text-[11px] font-bold ${active ? "text-black/60" : "text-white/55"}`}>{panel.description}</span></span>
                </button>
              )
            })}
          </div>
        </nav>
      </aside>

      <section id={`settings-panel-${activePanel}`} aria-label={`${activePanel} settings`} tabIndex={-1} className="min-w-0 space-y-6">
        {activePanel === "overview" ? (
          <>
            <Card accent="#00F0FF" title="System readiness" description={`${readiness.completed} of ${readiness.items.length} creator systems ready.`}>
              <ReadinessGrid readiness={readiness} />
              <div className="flex flex-col justify-between gap-4 rounded-2xl border-[3px] border-black bg-[#111] p-5 text-white sm:flex-row sm:items-center">
                <div><p className="text-xs font-black uppercase tracking-[0.18em] text-[#CCFF00]">Next best action</p><p className="mt-2 text-xl font-black uppercase">{readiness.nextLabel}</p></div>
                {readiness.nextPanel !== "overview" ? <button type="button" onClick={() => onPanelChange(readiness.nextPanel)} className={`${buttonClass} bg-[#CCFF00] text-black shadow-[3px_3px_0_0_#fff]`}>Open control <ArrowRight size={17} /></button> : null}
              </div>
            </Card>
            <div className="grid gap-6 lg:grid-cols-3">
              <Card accent="#FF83EA" title="Creator identity"><div><p className={labelClass}>Connected creator</p><p className="mt-2 text-2xl font-black uppercase">{profileName || "No creator loaded"}</p><p className="mt-1 break-words font-bold text-black/60">{currentHandleValue || currentEmail || "Connect to load identity"}</p></div><button type="button" onClick={() => onPanelChange("account")} className={`${buttonClass} bg-white`}>Manage account</button></Card>
              <Card accent="#FFE357" title="Plan + credits"><div className="grid grid-cols-2 gap-3"><div><p className={labelClass}>Plan</p><p className="mt-2 text-xl font-black uppercase">{entitlement.subscriptionPlanId}</p></div><div><p className={labelClass}>Available</p><p className="mt-2 text-xl font-black uppercase">{entitlement.tier === "large" ? "Unlimited" : meterLeft.toLocaleString()}</p></div></div><button type="button" onClick={() => onPanelChange("billing")} className={`${buttonClass} bg-[#CCFF00]`}>Open billing</button></Card>
              <Card accent="#40C6E9" title="Data source"><div><p className={labelClass}>Active mode</p><p className="mt-2 text-xl font-black uppercase">{ingestMode.replace("_", " ")}</p></div><button type="button" onClick={() => onPanelChange("data")} className={`${buttonClass} bg-white`}>Manage data</button></Card>
            </div>
          </>
        ) : null}

        {activePanel === "account" ? (
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <Card accent="#FF83EA" title="Creator passport" description="Your verified account and YouTube identity.">
              <dl className="grid gap-4 sm:grid-cols-2">
                {[["Display name", profileName || "Not loaded"], ["Channel", currentHandleValue || "Not connected"], ["Email", currentEmail || "Sign in to load email"], ["Connection", channelConnection.isConnected ? "Connected" : "Not connected"]].map(([term, value]) => <div key={term} className="rounded-xl border-[3px] border-black bg-[#f8f7f1] p-4"><dt className={labelClass}>{term}</dt><dd className="mt-2 break-words text-base font-black">{value}</dd></div>)}
              </dl>
              {channelConnection.isConnected ? <button type="button" onClick={onDisconnectChannel} className={`${buttonClass} bg-black text-white`}>Disconnect channel</button> : <AccountActionButton surface="settings" channelSyncing={channelConnection.state === "syncing" || channelConnection.state === "authorizing"} onLegacyAction={onConnectChannel} className={`${buttonClass} w-full bg-[#CCFF00] text-black`} />}
              <p className="text-sm font-bold leading-6 text-black/65">{channelConnection.helper || channelConnection.settingsLabel}</p>
            </Card>
            <div className="grid gap-6">
              <Card accent="#96F5A6" title="Public channel mode" description="Resolve public analytics without OAuth on Basic."><label htmlFor="settings-public-channel" className={labelClass}>Channel handle or URL</label><input id="settings-public-channel" value={currentHandleValue} onChange={(event) => onHandleInputChange(event.target.value)} disabled={!canResolvePublicHandle} placeholder="@channelhandle or channel URL" className={inputClass} /><button type="button" onClick={onPublicResolve} disabled={!canResolvePublicHandle} className={`${buttonClass} bg-[#96F5A6]`}>Resolve channel</button>{resolveStatus ? <p role="status" aria-live="polite" className="text-sm font-bold text-black/65">{resolveStatus}</p> : null}</Card>
              <Card accent="#FFE357" title="Account preferences"><button type="button" aria-pressed={notifyBilling} onClick={onToggleNotifyBilling} className={`${buttonClass} w-full ${notifyBilling ? "bg-[#CCFF00]" : "bg-white"}`}><Bell size={16} /> Billing alerts {notifyBilling ? "on" : "off"}</button><p className="text-sm font-bold leading-6 text-black/65">Identity is server-owned and read-only. Preferences apply locally until account preference sync is enabled.</p></Card>
            </div>
          </div>
        ) : null}

        {activePanel === "ai" ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card accent="#FF4FD8" title="Creator Brain" description="One profile powers Copilot, Oracle, Journal, and creator coaching."><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-xl border-[3px] border-black bg-[#f8f7f1] p-4"><p className={labelClass}>What it captures</p><p className="mt-2 text-sm font-bold leading-6">Niche, audience, goals, strengths, weaknesses, and creator direction.</p></div><div className="rounded-xl border-[3px] border-black bg-[#FFFF61] p-4"><p className={labelClass}>What it improves</p><p className="mt-2 text-sm font-bold leading-6">Recommendations, titles, thumbnails, publishing plans, and monetization moves.</p></div></div><button type="button" onClick={onOpenAiBrainIntake} className={`${buttonClass} bg-[#CCFF00]`}><Sparkles size={17} /> Open Brain intake</button></Card>
            <Card accent="#00F0FF" title="Model orchestration" description="Set the default model for creator workflows."><AIModelSelector /><div className="grid grid-cols-2 gap-3">{[["Flash", "1–1.5x", "#CCFF00"], ["Pro", "10–15x", "#FF83EA"]].map(([label, value, accent]) => <div key={label} className="rounded-xl border-[3px] border-black p-4" style={{ backgroundColor: accent }}><p className={labelClass}>{label}</p><p className="mt-2 text-2xl font-black uppercase">{value}</p><p className="mt-1 text-xs font-bold">Credit multiplier</p></div>)}</div></Card>
            {canViewGeminiKey ? <Card accent="#FFFF61" title="Bring your own key" description="Run Gemini generation against your own quota and billing."><form onSubmit={(event) => { event.preventDefault(); onSaveGeminiKey() }} className="grid gap-4"><label htmlFor="settings-gemini-key" className={labelClass}>Gemini API key</label><div className="relative"><input id="settings-gemini-key" type={showKey ? "text" : "password"} autoComplete="new-password" value={geminiKey} onChange={(event) => onUpdateGeminiKey(event.target.value)} placeholder="Enter your Gemini API key" className={`${inputClass} pr-14`} /><button type="button" onClick={onToggleShowKey} aria-label={showKey ? "Hide API key" : "Show API key"} className="absolute right-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg border-2 border-black bg-white focus-visible:outline focus-visible:outline-4"><span aria-hidden="true">{showKey ? <EyeOff size={19} /> : <Eye size={19} />}</span></button></div><button type="submit" className={`${buttonClass} bg-[#CCFF00]`}><KeyRound size={17} /> Save API key</button>{settingsSaveStatus ? <p role="status" aria-live="polite" className="text-sm font-black uppercase">{settingsSaveStatus}</p> : null}</form></Card> : null}
          </div>
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

        {activePanel === "help" ? <Card accent="#CCFF00" title="Help and policies" description="The support library is loaded below this control deck."><p className="text-sm font-bold leading-6 text-black/65">Use the guide cards for account connection, billing, AI, analytics, and troubleshooting. Legal policies remain available beside the guide actions.</p></Card> : null}
      </section>
    </div>
  )
}
