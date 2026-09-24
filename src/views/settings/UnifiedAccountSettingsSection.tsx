import React from "react"
import type { EntitlementState } from "../../services/billingEntitlement"
import type { IngestMode } from "../../services/productArchitecture"
import type { SubscriptionPlanId } from "../../services/subscriptionPlans"
import { SettingsAccountPanel } from "./SettingsAccountPanel"
import { SettingsAiRuntimePanel } from "./SettingsAiRuntimePanel"
import { SettingsBillingPanel } from "./SettingsBillingPanel"
import { SettingsDataPrivacyPanel } from "./SettingsDataPrivacyPanel"
import { SettingsOverviewPanel } from "./SettingsOverviewPanel"
import { WorkspaceExperienceSettingsSection } from "./WorkspaceExperienceSettingsSection"
import type { SettingsPanel, SettingsReadiness } from "./settingsControlDeck"
import { buildSettingsOverviewModel } from "./settingsWorkspaceModel"

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
  const overviewModel = buildSettingsOverviewModel({
    readiness: props.readiness,
    profileName: props.profileName,
    currentHandleValue: props.currentHandleValue,
    currentEmail: props.currentEmail,
    planId: props.entitlement.subscriptionPlanId,
    creditsLabel:
      props.entitlement.tier === "large"
        ? "Unlimited credits"
        : `${props.meterLeft.toLocaleString()} credits available`,
    ingestMode: props.ingestMode,
  })

  switch (props.activePanel) {
    case "overview":
      return <SettingsOverviewPanel model={overviewModel} onPanelChange={props.onPanelChange} />
    case "account":
      return (
        <SettingsAccountPanel
          canResolvePublicHandle={props.canResolvePublicHandle}
          channelConnection={props.channelConnection}
          currentEmail={props.currentEmail}
          currentHandleValue={props.currentHandleValue}
          notifyBilling={props.notifyBilling}
          onConnectChannel={props.onConnectChannel}
          onDisconnectChannel={props.onDisconnectChannel}
          onHandleInputChange={props.onHandleInputChange}
          onPublicResolve={props.onPublicResolve}
          onToggleNotifyBilling={props.onToggleNotifyBilling}
          profileName={props.profileName}
          resolveStatus={props.resolveStatus}
        />
      )
    case "ai":
      return (
        <SettingsAiRuntimePanel
          canViewGeminiKey={props.canViewGeminiKey}
          geminiKey={props.geminiKey}
          onOpenAiBrainIntake={props.onOpenAiBrainIntake}
          onSaveGeminiKey={props.onSaveGeminiKey}
          onToggleShowKey={props.onToggleShowKey}
          onUpdateGeminiKey={props.onUpdateGeminiKey}
          settingsSaveStatus={props.settingsSaveStatus}
          showKey={props.showKey}
        />
      )
    case "experience":
      return <WorkspaceExperienceSettingsSection />
    case "billing":
      return (
        <SettingsBillingPanel
          billingStatus={props.billingStatus}
          customReferralCode={props.customReferralCode}
          customTopupAmount={props.customTopupAmount}
          entitlement={props.entitlement}
          loadingPlan={props.loadingPlan}
          meterLeft={props.meterLeft}
          meterPct={props.meterPct}
          meterTotal={props.meterTotal}
          meterUsed={props.meterUsed}
          onChoosePlan={props.onChoosePlan}
          onCustomReferralCodeChange={props.onCustomReferralCodeChange}
          onCustomTopup={props.onCustomTopup}
          onCustomTopupAmountChange={props.onCustomTopupAmountChange}
          onOpenBillingPortal={props.onOpenBillingPortal}
          onSetCustomReferralCode={props.onSetCustomReferralCode}
          onTopup={props.onTopup}
        />
      )
    case "data":
      return (
        <SettingsDataPrivacyPanel
          dataResetStatus={props.dataResetStatus}
          exportStatus={props.exportStatus}
          ingestMode={props.ingestMode}
          onDeleteAccount={props.onDeleteAccount}
          onExport={props.onExport}
          onIngestModeChange={props.onIngestModeChange}
          onOpenTransparencyCenter={props.onOpenTransparencyCenter}
          onRunFactoryReset={props.onRunFactoryReset}
          onRunSoftReset={props.onRunSoftReset}
          showInternalOpsLink={props.showInternalOpsLink}
        />
      )
    case "widgets":
    case "help":
      return null
    default:
      return null
  }
}
