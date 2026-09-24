import React from "react"
import { Download, LockKeyhole,
  ShieldCheck, Trash2,
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
import { SettingsBillingPanel } from "./SettingsBillingPanel"
import { buildSettingsOverviewModel } from "./settingsWorkspaceModel"

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
          <SettingsBillingPanel
            activePlanId={entitlement.subscriptionPlanId}
            unlimited={entitlement.tier === "large"}
            meterLeft={meterLeft}
            meterUsed={meterUsed}
            meterTotal={meterTotal}
            meterPct={meterPct}
            nextRefillLabel={entitlement.nextRefillIso ? new Date(entitlement.nextRefillIso).toLocaleDateString() : "N/A"}
            billingStatus={billingStatus}
            loadingPlan={loadingPlan}
            topups={TOPUP_DEFINITIONS}
            customTopupAmount={customTopupAmount}
            referralCode={getReferralCode()}
            referralCodeLocked={entitlement.referralCodeLocked}
            customReferralCode={customReferralCode}
            onChoosePlan={onChoosePlan}
            onOpenBillingPortal={onOpenBillingPortal}
            onTopup={onTopup}
            onCustomTopup={onCustomTopup}
            onCustomTopupAmountChange={onCustomTopupAmountChange}
            onSetCustomReferralCode={onSetCustomReferralCode}
            onCustomReferralCodeChange={onCustomReferralCodeChange}
          />
        ) : null}

        {activePanel === "data" ? (
          <div className="grid gap-6"><Card accent="#40C6E9" title="Analytics source" description="Choose where canonical analytics and master tables read their data."><fieldset><legend className={labelClass}>Ingest mode</legend><div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{(["connected", "import", "hybrid", "public_handle"] as IngestMode[]).map((mode) => <button key={mode} type="button" aria-pressed={ingestMode === mode} onClick={() => onIngestModeChange(mode)} className={`${buttonClass} ${ingestMode === mode ? "bg-[#CCFF00]" : "bg-white"}`}>{mode.replace("_", " ")}</button>)}</div></fieldset><p className="text-sm font-bold leading-6 text-black/65"><strong>Connected</strong> uses API sync. <strong>Import</strong> uses uploaded datasets. <strong>Hybrid</strong> supplements canonical rows. <strong>Public handle</strong> is limited to public Basic-plan analytics.</p></Card><div className="grid gap-6 lg:grid-cols-2"><Card accent="#FFB570" title="Export + transparency"><p className="text-sm font-bold leading-6 text-black/65">Download your canonical data bundle or inspect how ViewTube stores and transforms analytics.</p><div className="grid gap-3 sm:grid-cols-2"><button type="button" onClick={onExport} className={`${buttonClass} bg-[#FFB570]`}><Download size={17} /> Export all data</button>{showInternalOpsLink ? <button type="button" onClick={onOpenTransparencyCenter} className={`${buttonClass} bg-[#40C6E9]`}><ShieldCheck size={17} /> Data center</button> : null}</div>{exportStatus ? <p role="status" aria-live="polite" className="text-sm font-black">{exportStatus}</p> : null}</Card><Card accent="#FF8AAF" title="Recovery + danger zone" description="Destructive controls stay isolated from everyday settings."><div className="grid gap-3 sm:grid-cols-2"><button type="button" onClick={onRunSoftReset} className={`${buttonClass} bg-[#FFB570]`}><Trash2 size={17} /> Clear local data</button><button type="button" onClick={onRunFactoryReset} className={`${buttonClass} bg-black text-white`}><Trash2 size={17} /> Factory reset</button></div><button type="button" onClick={onDeleteAccount} className={`${buttonClass} bg-[#FF1744] text-white`}><LockKeyhole size={17} /> Delete ViewTube account</button>{dataResetStatus ? <p role="status" aria-live="polite" className="text-sm font-black">{dataResetStatus}</p> : null}</Card></div></div>
        ) : null}

    </>
  )
}
