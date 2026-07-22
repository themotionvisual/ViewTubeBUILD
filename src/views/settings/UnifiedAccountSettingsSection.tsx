import React from "react"
import {
  Bell,
  Check,
  Coins,
  Download,
  Eye,
  EyeOff,
  Mail,
  Sparkles,
  Trash2,
  User,
} from "lucide-react"
import { SubToolbox } from "../../components/Toolbox"
import { AccountActionButton } from "../../components/account/AccountActionButton"
import { AIModelSelector } from "../../components/ui/AIModelSelector"
import {
  TOPUP_DEFINITIONS,
  getReferralCode,
  type EntitlementState,
} from "../../services/billingEntitlement"
import type { SubscriptionPlanId } from "../../services/subscriptionPlans"

const SUBSCRIPTION_PLANS_UI: {
  id: SubscriptionPlanId
  tierLabel: string
  price: string
  bullets: string[]
  cta: string
}[] = [
  { id: "basic", tierLabel: "Basic", price: "$0", bullets: ["Core tools", "Manual sync", "Basic analytics"], cta: "Upgrade" },
  { id: "beta", tierLabel: "Beta (BYOK)", price: "$0", bullets: ["Unlimited AI (BYOK)", "Full strategy stack", "Community-driven"], cta: "Switch to Beta" },
  { id: "creator", tierLabel: "Creator", price: "$9.99/mo", bullets: ["48-hour trial", "Included AI credits", "Advanced dashboards"], cta: "Upgrade" },
  { id: "creator_plus", tierLabel: "Creator Plus", price: "$19.99/mo", bullets: ["48-hour trial", "More included AI credits", "Priority generation capacity"], cta: "Upgrade" },
  { id: "creator_pro", tierLabel: "Creator Pro", price: "$39.99/mo", bullets: ["48-hour trial", "Highest capped creator credits", "Full strategy stack"], cta: "Upgrade" },
  { id: "executive", tierLabel: "Executive", price: "$69.99/mo", bullets: ["48-hour trial", "Unlimited AI generation", "Executive priority"], cta: "Upgrade" },
]

const PLAN_THEME: Record<SubscriptionPlanId, { accent: string; shadow: string; tint: string }> = {
  basic: { accent: "#C9F830", shadow: "rgba(201, 248, 48, 0.45)", tint: "#F4FFD0" },
  beta: { accent: "#FF5733", shadow: "rgba(255, 87, 51, 0.45)", tint: "#FFD5CC" },
  creator: { accent: "#40C6E9", shadow: "rgba(64, 198, 233, 0.45)", tint: "#D9F6FF" },
  creator_plus: { accent: "#FFE357", shadow: "rgba(255, 227, 87, 0.45)", tint: "#FFF7CC" },
  creator_pro: { accent: "#FFB570", shadow: "rgba(255, 181, 112, 0.45)", tint: "#FFE9D2" },
  executive: { accent: "#FF83EA", shadow: "rgba(255, 131, 234, 0.45)", tint: "#FFDDF7" },
}

const canonicalButtonClass =
  "rounded-xl border-[3px] border-black shadow-[3px_3px_0px_0px_black] hover:translate-y-0.5 hover:shadow-[1.5px_1.5px_0px_0px_black] transition-all font-black uppercase"
const fieldLabelClass = "text-[11px] font-black uppercase tracking-[0.16em] text-black"
const inputClass = "w-full h-12 px-4 border-[3px] border-black rounded-xl font-bold bg-white"
const readonlyClass = `${inputClass} bg-[#F3F4F6] text-gray-700`
const statusClass = "text-xs font-black uppercase tracking-[0.12em] text-gray-700"

export type UnifiedAccountSettingsSectionProps = {
  billingStatus: string | null
  canResolvePublicHandle: boolean
  canViewGeminiKey: boolean
  currentEmail: string
  currentHandleValue: string
  customReferralCode: string
  customTopupAmount: string
  dataResetStatus: string | null
  entitlement: EntitlementState
  exportStatus: string | null
  geminiKey: string
  highlightBilling: boolean
  loadingPlan: SubscriptionPlanId | null
  meterLeft: number
  meterPct: number
  meterTotal: number
  meterUsed: number
  notifyBilling: boolean
  onOpenAiBrainIntake: () => void
  onChoosePlan: (planId: SubscriptionPlanId) => void
  onConnectChannel: () => void
  onCustomReferralCodeChange: (value: string) => void
  onCustomTopupAmountChange: (value: string) => void
  onDisconnectChannel: () => void
  onDeleteAccount: () => void
  onExport: () => void
  onHandleInputChange: (value: string) => void
  onOpenGuide: (hash: string) => void
  onOpenBillingPortal: () => void
  onOpenTransparencyCenter: () => void
  onPublicResolve: () => void
  onRunFactoryReset: () => void
  onRunSoftReset: () => void
  onSaveGeminiKey: () => void
  onSetCustomReferralCode: () => void
  onTopup: (sku: string) => void
  onCustomTopup: () => void
  onToggleShowKey: () => void
  onToggleNotifyBilling: () => void
  onUpdateGeminiKey: (value: string) => void
  profileName: string
  resolveDisabled: boolean
  resolveStatus: string | null
  settingsSaveStatus: string | null
  showInternalOpsLink: boolean
  showKey: boolean
  channelConnection: {
    isConnected: boolean
    helper: string
    settingsLabel: string
    state: string
  }
}

export const UnifiedAccountSettingsSection: React.FC<UnifiedAccountSettingsSectionProps> = ({
  billingStatus,
  canResolvePublicHandle,
  canViewGeminiKey,
  currentEmail,
  currentHandleValue,
  customReferralCode,
  customTopupAmount,
  dataResetStatus,
  entitlement,
  exportStatus,
  geminiKey,
  highlightBilling,
  loadingPlan,
  meterLeft,
  meterPct,
  meterTotal,
  meterUsed,
  notifyBilling,
  onChoosePlan,
  onConnectChannel,
  onCustomReferralCodeChange,
  onCustomTopupAmountChange,
  onDisconnectChannel,
  onDeleteAccount,
  onExport,
  onHandleInputChange,
  onOpenGuide,
  onOpenAiBrainIntake,
  onOpenBillingPortal,
  onOpenTransparencyCenter,
  onPublicResolve,
  onRunFactoryReset,
  onRunSoftReset,
  onSaveGeminiKey,
  onSetCustomReferralCode,
  onTopup,
  onCustomTopup,
  onToggleShowKey,
  onToggleNotifyBilling,
  onUpdateGeminiKey,
  profileName,
  resolveDisabled,
  resolveStatus,
  settingsSaveStatus,
  showInternalOpsLink,
  showKey,
  channelConnection,
}) => {
  const connectionLabel = channelConnection.isConnected ? "Connected" : "Not connected"
  const connectionDetail = channelConnection.isConnected
    ? "Verified YouTube identity is available for channel-linked settings and workspace controls."
    : channelConnection.helper || channelConnection.settingsLabel

  return (
    <div id="account-profile" className="scroll-mt-24">
      <SubToolbox
        title="Account"
        subtitle="Profile, billing, AI workspace, referral, export, and reset"
        icon={<User size={20} strokeWidth={3} className="text-black" />}

        contentClassName="p-5 xl:p-6 space-y-5"
      >
        <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-5">
          <div className="border-[3px] border-black rounded-2xl bg-white p-4 xl:p-5 shadow-[3px_3px_0px_0px_black] space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] gap-4">
              <div className="space-y-2">
                <label className={fieldLabelClass}>Display name</label>
                <input value={profileName} readOnly className={readonlyClass} placeholder="Loaded from YouTube" />
              </div>
              <div className="space-y-2">
                <label className={fieldLabelClass}>Channel handle or URL</label>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                  <input
                    value={currentHandleValue}
                    onChange={(event) => onHandleInputChange(event.target.value)}
                    placeholder="@channelhandle or channel URL"
                    className={inputClass}
                  />
                  <button
                    onClick={onPublicResolve}
                    disabled={resolveDisabled}
                    className={`${canonicalButtonClass} bg-[#96F5A6] px-4 py-3 text-sm whitespace-nowrap disabled:opacity-50`}
                  >
                    Resolve
                  </button>
                </div>
                <p className={statusClass}>
                  {canResolvePublicHandle
                    ? resolveStatus || "This one field covers connected handle display and public-handle resolution."
                    : resolveStatus || "Public-handle resolution is reserved for Basic plan. Connected sync remains the primary path here."}
                </p>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className={fieldLabelClass}>Email</label>
                <div className="w-full min-h-12 px-4 border-[3px] border-black rounded-xl font-bold bg-white flex items-center gap-2">
                  <Mail size={15} />
                  {currentEmail || "Connect to load email"}
                </div>
              </div>
            </div>
          </div>

          <div className="border-[3px] border-black rounded-2xl bg-[#FCFCFC] p-4 xl:p-5 shadow-[3px_3px_0px_0px_black] grid gap-4 content-start">
            <div className="space-y-1">
              <p className={fieldLabelClass}>Connection status</p>
              <p className="text-2xl font-black uppercase tracking-tight">{connectionLabel}</p>
              <p className="text-sm font-bold text-gray-700">{connectionDetail}</p>
            </div>
            {channelConnection.isConnected ? (
              <button onClick={onDisconnectChannel} className={`${canonicalButtonClass} bg-black text-white px-5 py-3 text-sm w-full`}>
                Disconnect channel
              </button>
            ) : (
              <AccountActionButton
                surface="settings"
                channelSyncing={channelConnection.state === "syncing" || channelConnection.state === "authorizing"}
                onLegacyAction={onConnectChannel}
                className={`${canonicalButtonClass} bg-[#FFFF61] text-black px-5 py-3 text-sm w-full disabled:opacity-60`}
              />
            )}
            {!channelConnection.isConnected && (
              <p className="text-[11px] font-black uppercase tracking-[0.12em] text-gray-700">
                Connecting opens Google OAuth after you acknowledge ViewTube Terms and Privacy Policy.
              </p>
            )}
            <button
              onClick={onToggleNotifyBilling}
              className={`${canonicalButtonClass} w-full py-3 text-sm ${notifyBilling ? "bg-[#CCFF00]" : "bg-white"}`}
            >
              <Bell size={14} className="inline mr-2" />
              {notifyBilling ? "Billing alerts on" : "Billing alerts off"}
            </button>
            <p className={statusClass}>Identity fields are synced from your verified YouTube session and stay read-only here.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-5">
          <div className="border-[3px] border-black rounded-2xl bg-white p-4 xl:p-5 shadow-[3px_3px_0px_0px_black] space-y-4">
            <div>
              <p className={fieldLabelClass}>AI Brain creator profile</p>
              <p className="text-sm font-bold text-gray-700 mt-1">
                The Brain profile now lives in ViewTube Brain Hub so chat, journal, Daily Oracle, and creator coaching share one source of truth.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="border-[2px] border-black rounded-xl bg-[#F6F7F2] p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-black/50">What it captures</p>
                <p className="mt-1 text-sm font-bold leading-6 text-black/70">
                  Channel description, niche, audience, success definition, goal, recurring series idea, biggest weakness, best video, and why you joined ViewTube.
                </p>
              </div>
              <div className="border-[2px] border-black rounded-xl bg-[#FFFF61] p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-black/50">How it is used</p>
                <p className="mt-1 text-sm font-bold leading-6 text-black/70">
                  Future Copilot answers use it to recommend better videos, titles, thumbnails, publishing plans, audience growth, and monetization moves.
                </p>
              </div>
            </div>
            <button onClick={onOpenAiBrainIntake} className={`${canonicalButtonClass} bg-[#4FFF5B] px-4 py-3 text-sm`}>
              Open Brain intake
            </button>
          </div>

          <div className="grid gap-5 content-start">
            {canViewGeminiKey ? (
              <div className="border-[3px] border-black rounded-2xl bg-white p-4 xl:p-5 shadow-[3px_3px_0px_0px_black] space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className={fieldLabelClass}>Gemini API key</p>
                    <p className="text-sm font-bold text-gray-700 mt-1">
                      Use your own key if you want generation to run against your own quota and billing.
                    </p>
                  </div>
                  <button onClick={() => onOpenGuide("#sync")} className="text-xs font-black uppercase underline underline-offset-2">
                    Setup help
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    autoComplete="new-password"
                    value={geminiKey}
                    onChange={(event) => onUpdateGeminiKey(event.target.value)}
                    placeholder="Enter your Gemini API key..."
                    className="w-full h-14 px-4 pr-12 border-[3px] border-black rounded-xl font-bold"
                  />
                  <button type="button" onClick={onToggleShowKey} className="absolute right-4 top-1/2 -translate-y-1/2 text-black">
                    {showKey ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button onClick={onSaveGeminiKey} className={`${canonicalButtonClass} bg-[#FFFF61] px-4 py-3 text-sm`}>
                    Save API key
                  </button>
                  {settingsSaveStatus ? <p className={statusClass}>{settingsSaveStatus}</p> : null}
                </div>
              </div>
            ) : null}

            <div className="border-[3px] border-black rounded-2xl bg-white p-4 xl:p-5 shadow-[3px_3px_0px_0px_black] space-y-5">
              <div>
                <p className={fieldLabelClass}>Model orchestration</p>
                <p className="text-sm font-bold text-gray-700 mt-1">
                  Choose the default reasoning model for creator workflows and understand how credits change by model tier.
                </p>
              </div>
              <AIModelSelector />
              <div className="border-[3px] border-black rounded-2xl bg-[#F7F7F7] p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-[#FFFF61] border-2 border-black p-2 rounded-lg">
                    <Coins size={18} strokeWidth={3} />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Credit economy guide</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: "3.0 Flash", multiplier: "1.0x", desc: "Baseline efficiency", color: "bg-white" },
                    { label: "3.1 Flash", multiplier: "1.5x", desc: "Balanced IQ", color: "bg-[#C9F830]" },
                    { label: "3.0 Pro", multiplier: "10.0x", desc: "Heavy reasoning", color: "bg-[#FFDD00]" },
                    { label: "3.1 Pro", multiplier: "15.0x", desc: "Elite intelligence", color: "bg-[#FF3399] text-white" },
                  ].map((item) => (
                    <div key={item.label} className={`border-[3px] border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_black] ${item.color}`}>
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] opacity-70">{item.label}</p>
                      <p className="mt-1 text-3xl leading-none font-black uppercase tracking-tight">{item.multiplier}</p>
                      <p className="mt-2 text-[10px] font-bold uppercase opacity-70">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`border-[4px] border-black rounded-2xl bg-white p-5 xl:p-6 shadow-[4px_4px_0px_0px_black] space-y-5 ${highlightBilling ? "ring-4 ring-[#CCFF00]" : ""}`}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tight">Billing and credits</h2>
              <p className="text-sm font-bold text-gray-700 mt-2">
                Manage plans, top-ups, referral rewards, export, and data reset from one compact account surface.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={onOpenBillingPortal} className="px-4 py-2 border-[2px] border-black rounded-xl bg-[#4FFF5B] font-black uppercase text-xs shadow-[2px_2px_0px_0px_black]">
                Manage billing
              </button>
              <button onClick={() => onOpenGuide("#billing")} className="px-4 py-2 border-[2px] border-black rounded-xl bg-white font-black uppercase text-xs shadow-[2px_2px_0px_0px_black]">
                Billing help
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-[240px]">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-gray-700">Credit meter</p>
              <h3 className="text-4xl font-black uppercase tracking-tight">
                {entitlement.tier === "large" ? "Unlimited" : `${meterLeft.toLocaleString()} left`}
              </h3>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              {[
                ["Plan", entitlement.subscriptionPlanId, "#D9F6FF", "rgba(64, 198, 233, 0.45)"],
                ["Tier", entitlement.tier, "#FFDDF7", "rgba(255, 131, 234, 0.45)"],
                ["Refill", Math.max(0, Math.floor(entitlement.monthlyCreditGrant || 0)).toLocaleString(), "#FFF7CC", "rgba(255, 227, 87, 0.45)"],
                ["Next", entitlement.nextRefillIso ? new Date(entitlement.nextRefillIso).toLocaleDateString() : "N/A", "#FFE9D2", "rgba(255, 181, 112, 0.45)"],
                ["Total", entitlement.tier === "large" ? "∞" : meterTotal.toLocaleString(), "#F4FFD0", "rgba(201, 248, 48, 0.45)"],
              ].map(([label, value, bg, shadow]) => (
                <div
                  key={String(label)}
                  className="border-[2px] border-black rounded-xl px-3 py-2 min-w-[104px]"
                  style={{ backgroundColor: String(bg), boxShadow: `3px 3px 0px 0px ${shadow}` }}
                >
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-gray-700">{label}</p>
                  <p className="text-sm font-black uppercase">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="h-6 border-[3px] border-black rounded-full bg-[#E5E7EB] overflow-hidden">
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
            <span>{entitlement.tier === "large" ? "Unlimited plan active" : `${meterUsed.toLocaleString()} used`}</span>
            <span>{entitlement.tier === "large" ? "100%" : `${meterPct}% remaining`}</span>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-3 items-start">
            <div className="flex flex-wrap gap-3">
              {TOPUP_DEFINITIONS.map((topup) => (
                <button
                  key={topup.sku}
                  onClick={() => onTopup(topup.sku)}
                  className="border-[3px] border-black rounded-xl px-4 py-3 bg-[#40C6E9] font-black uppercase text-sm shadow-[3px_3px_0px_0px_black]"
                >
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
                onChange={(event) => onCustomTopupAmountChange(event.target.value)}
                className="w-[130px] border-[3px] border-black rounded-xl px-3 py-3 font-black text-sm bg-white"
                placeholder="Amount USD"
              />
              <button
                onClick={onCustomTopup}
                className="border-[3px] border-black rounded-xl px-4 py-3 bg-[#CCFF00] font-black uppercase text-sm shadow-[3px_3px_0px_0px_black] whitespace-nowrap"
              >
                Custom top-up (+25% on $50+)
              </button>
            </div>
          </div>
        </div>

        <div className="border-[3px] border-black rounded-2xl bg-white p-5 shadow-[3px_3px_0px_0px_black] space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-600">Plan options</p>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-gray-500">Compact plan grid</p>
          </div>
          <div className="grid gap-4 items-stretch" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))" }}>
            {SUBSCRIPTION_PLANS_UI.map((plan) => {
              const active = entitlement.subscriptionPlanId === plan.id
              const loading = loadingPlan === plan.id
              const theme = PLAN_THEME[plan.id]
              return (
                <div
                  key={plan.id}
                  className="h-full min-w-0 border-[4px] border-black rounded-2xl bg-white p-4 flex flex-col gap-4"
                  style={{ boxShadow: `6px 6px 0px 0px ${theme.shadow}` }}
                >
                  <div
                    className="border-[2px] border-black rounded-xl px-3 py-2 flex items-center justify-between"
                    style={{ backgroundColor: theme.tint }}
                  >
                    <p className="text-xs font-black uppercase tracking-[0.2em]">{plan.tierLabel}</p>
                    {active ? <Check size={18} strokeWidth={3} /> : null}
                  </div>
                  <h3 className="text-[2rem] leading-none font-black uppercase tracking-tight whitespace-nowrap">{plan.price}</h3>
                  <ul className="space-y-2">
                    {plan.bullets.map((bullet) => (
                      <li key={bullet} className="font-bold text-[0.92rem] uppercase">• {bullet}</li>
                    ))}
                  </ul>
                  <button
                    onClick={() => onChoosePlan(plan.id)}
                    disabled={loading}
                    className="mt-auto border-[3px] border-black rounded-xl px-4 py-3 font-black uppercase text-sm disabled:opacity-60"
                    style={{ backgroundColor: theme.accent, boxShadow: `4px 4px 0px 0px ${theme.shadow}` }}
                  >
                    {loading ? "Working..." : plan.cta}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_0.95fr] gap-5">
          <div className="border-[3px] border-black rounded-2xl bg-[#E5E7EB] p-4 font-bold space-y-3 shadow-[3px_3px_0px_0px_black]">
            <div className="flex items-center gap-2 text-sm uppercase">
              <Sparkles size={16} />
              Referral rewards
            </div>
            <p className="text-sm">
              Your default referral code follows your connected YouTube handle. You can replace it one time with a custom code that does not start with the @ symbol.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-3">
              <div className="border-[2px] border-black rounded-xl bg-white px-3 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-gray-600">Your referral code</p>
                <p className="text-lg font-black tracking-[0.08em]">{getReferralCode()}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-500 mt-1">
                  {entitlement.referralCodeLocked ? "Custom code locked" : "Default follows your YouTube handle until you change it"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={customReferralCode}
                  onChange={(event) => onCustomReferralCodeChange(event.target.value.toUpperCase())}
                  placeholder="Set your own referral code (one-time, no @)"
                  className="flex-1 min-w-[260px] border-[2px] border-black rounded-xl px-3 py-3 font-black uppercase bg-white"
                />
                <button
                  onClick={onSetCustomReferralCode}
                  disabled={entitlement.referralCodeLocked}
                  className="border-[2px] border-black rounded-xl px-3 py-3 bg-[#CCFF00] font-black uppercase text-xs shadow-[2px_2px_0px_0px_black] disabled:opacity-50"
                >
                  Set code
                </button>
              </div>
            </div>
          </div>

          <div className="border-[3px] border-black rounded-2xl bg-white p-4 xl:p-5 shadow-[3px_3px_0px_0px_black]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Trash2 size={20} strokeWidth={3} />
                  <h3 className="text-xl font-black uppercase tracking-tight">Data management</h3>
                </div>
                <p className="text-sm font-bold text-gray-700">
                  Clear this origin’s site data or run a full logout reset without leaving the account page.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button onClick={onRunSoftReset} className="flex items-center justify-center gap-2 bg-[#FFB570] text-black px-4 py-4 rounded-xl border-[3px] border-black shadow-[3px_3px_0px_0px_black] font-black uppercase text-[10px]">
                    Clear cache
                  </button>
                  <button onClick={onRunFactoryReset} className="flex items-center justify-center gap-2 bg-black text-white px-4 py-4 rounded-xl border-[3px] border-black shadow-[3px_3px_0px_0px_black] font-black uppercase text-[10px]">
                    Factory reset
                  </button>
                  <button onClick={onDeleteAccount} className="sm:col-span-2 flex items-center justify-center gap-2 bg-[#FF1744] text-white px-4 py-4 rounded-xl border-[3px] border-black shadow-[3px_3px_0px_0px_black] font-black uppercase text-[10px]">
                    Delete ViewTube account
                  </button>
                </div>
                {dataResetStatus ? <p className={statusClass}>{dataResetStatus}</p> : null}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Download size={20} strokeWidth={3} />
                  <h3 className="text-xl font-black uppercase tracking-tight">Export + trust</h3>
                </div>
                <p className="text-sm font-bold text-gray-700">
                  Export your current bundle here. Internal diagnostics stay available only through the hidden transparency center.
                </p>
                <div className={`grid gap-3 ${showInternalOpsLink ? "sm:grid-cols-2" : "grid-cols-1"}`}>
                  {showInternalOpsLink ? (
                    <button onClick={onOpenTransparencyCenter} className="flex items-center justify-center gap-2 bg-[#40C6E9] text-black px-4 py-4 rounded-xl border-[3px] border-black shadow-[3px_3px_0px_0px_black] font-black uppercase text-[10px]">
                      Data center
                    </button>
                  ) : null}
                  <button onClick={onExport} className="flex items-center justify-center gap-2 bg-[#FFB570] text-black px-4 py-4 rounded-xl border-[3px] border-black shadow-[3px_3px_0px_0px_black] font-black uppercase text-[10px]">
                    Export all
                  </button>
                </div>
                {exportStatus ? <p className={statusClass}>{exportStatus}</p> : null}
              </div>
            </div>
          </div>
        </div>

        {billingStatus && !billingStatus.toLowerCase().includes("entitlements synced with server") ? (
          <p className="text-sm font-black uppercase">{billingStatus}</p>
        ) : null}
      </SubToolbox>
    </div>
  )
}
