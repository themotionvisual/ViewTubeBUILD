import React, { useEffect, useMemo, useState } from "react"
import { CreditCard, Gift, LockKeyhole, Plus, Sparkles } from "lucide-react"
import { SubToolbox } from "../../components/Toolbox"
import { SubToolboxGrid, SubToolboxStack } from "../../components/subtoolbox/SubToolboxLayouts"
import {
  SubToolboxAlert,
  SubToolboxButton,
  SubToolboxFieldLabel,
  SubToolboxMeter,
  SubToolboxMetricStrip,
  SubToolboxNameValueList,
} from "../../components/subtoolbox/SubToolboxPrimitives"
import {
  SubToolboxSplitDropdown,
  type SubToolboxSplitDropdownOption,
} from "../../components/subtoolbox/SubToolboxSplitPrimitives"
import { StudioInput, StudioNumberInput } from "../../studio-ui"
import type { SubscriptionPlanId } from "../../services/subscriptionPlans"
import {
  SETTINGS_PLAN_OPTIONS,
  getSettingsPlanOption,
} from "./settingsBillingModel"

export interface SettingsBillingTopup {
  sku: string
  priceUsd: number
  creditAmount: number
}

export interface SettingsBillingPanelProps {
  activePlanId: SubscriptionPlanId
  unlimited: boolean
  meterLeft: number
  meterUsed: number
  meterTotal: number
  meterPct: number
  nextRefillLabel: string
  billingStatus: string | null
  loadingPlan: SubscriptionPlanId | null
  topups: readonly SettingsBillingTopup[]
  customTopupAmount: string
  referralCode: string
  referralCodeLocked: boolean
  customReferralCode: string
  onChoosePlan: (planId: SubscriptionPlanId) => void
  onOpenBillingPortal: () => void
  onTopup: (sku: string) => void
  onCustomTopup: () => void
  onCustomTopupAmountChange: (value: string) => void
  onSetCustomReferralCode: () => void
  onCustomReferralCodeChange: (value: string) => void
}

export const SettingsBillingPanel: React.FC<SettingsBillingPanelProps> = ({
  activePlanId,
  unlimited,
  meterLeft,
  meterUsed,
  meterTotal,
  meterPct,
  nextRefillLabel,
  billingStatus,
  loadingPlan,
  topups,
  customTopupAmount,
  referralCode,
  referralCodeLocked,
  customReferralCode,
  onChoosePlan,
  onOpenBillingPortal,
  onTopup,
  onCustomTopup,
  onCustomTopupAmountChange,
  onSetCustomReferralCode,
  onCustomReferralCodeChange,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionPlanId>(activePlanId)

  useEffect(() => {
    setSelectedPlanId(activePlanId)
  }, [activePlanId])

  const selectedPlan = useMemo(
    () => getSettingsPlanOption(selectedPlanId),
    [selectedPlanId],
  )
  const selectedIsActive = selectedPlan.id === activePlanId
  const planOptions: SubToolboxSplitDropdownOption[] = SETTINGS_PLAN_OPTIONS.map((plan) => ({
    value: plan.id,
    label: `${plan.label} · ${plan.price}`,
    icon: <CreditCard size={17} />,
  }))

  return (
    <div className="grid gap-3">
      <SubToolbox
        title="Current Plan"
        icon={<CreditCard />}
        paletteIndex={5}
        collapsible
        isOpenInitial
        persistenceId="settings-billing-current-plan"
        helpText="Server-owned entitlement and credit capacity. Checkout and billing management remain handled by the existing secure billing service."
      >
        <SubToolboxStack density="dense">
          <SubToolboxMetricStrip
            level="l1"
            items={[
              { label: "Plan", value: getSettingsPlanOption(activePlanId).label },
              { label: "Available", value: unlimited ? "∞" : meterLeft.toLocaleString() },
              { label: "Used", value: meterUsed.toLocaleString() },
              { label: "Total", value: unlimited ? "∞" : meterTotal.toLocaleString() },
              { label: "Refill", value: nextRefillLabel },
            ]}
          />
          <SubToolboxMeter
            level="l1"
            value={unlimited ? 100 : meterPct}
            max={100}
            label={unlimited ? "Unlimited credits" : "Credits remaining %"}
          />
          <SubToolboxButton
            level="l1"
            size="standard"
            tone="accent"
            icon={<LockKeyhole size={18} />}
            onClick={onOpenBillingPortal}
          >
            Manage billing
          </SubToolboxButton>
          {billingStatus && !billingStatus.toLowerCase().includes("entitlements synced with server") ? (
            <SubToolboxAlert
              level="l1"
              tone={billingStatus.toLowerCase().includes("fail") ? "danger" : "info"}
              title="Billing"
              detail={billingStatus}
            />
          ) : null}
        </SubToolboxStack>
      </SubToolbox>

      <SubToolbox
        title="Change Plan"
        icon={<CreditCard />}
        paletteIndex={6}
        collapsible
        isOpenInitial
        persistenceId="settings-billing-change-plan"
        helpText="Compare one plan at a time instead of rendering every plan as a large card."
      >
        <SubToolboxStack density="dense">
          <SubToolboxSplitDropdown
            level="l1"
            ariaLabel="Choose a ViewTube plan"
            value={selectedPlanId}
            options={planOptions}
            icon={<CreditCard size={17} />}
            onChange={(value) => setSelectedPlanId(value as SubscriptionPlanId)}
          />
          <SubToolboxAlert
            level="l1"
            tone={selectedIsActive ? "success" : "info"}
            icon={<CreditCard size={18} />}
            title={`${selectedPlan.label} · ${selectedPlan.price}`}
            detail={selectedPlan.bullets.join(" · ")}
            action={
              <SubToolboxButton
                level="l2"
                size="compact"
                tone={selectedIsActive ? "neutral" : "accent"}
                disabled={selectedIsActive || loadingPlan === selectedPlan.id}
                onClick={() => onChoosePlan(selectedPlan.id)}
              >
                {selectedIsActive
                  ? "Current plan"
                  : loadingPlan === selectedPlan.id
                    ? "Working…"
                    : selectedPlan.id === "basic"
                      ? "Manage downgrade"
                      : "Choose plan"}
              </SubToolboxButton>
            }
          />
        </SubToolboxStack>
      </SubToolbox>

      <SubToolbox
        title="Top Up Credits"
        icon={<Plus />}
        paletteIndex={7}
        collapsible
        isOpenInitial={false}
        persistenceId="settings-billing-topups"
        helpText="Add credit capacity without changing the active subscription."
      >
        <SubToolboxStack density="dense">
          <SubToolboxGrid minItemWidth="compact" density="dense">
            {topups.map((topup) => (
              <SubToolboxButton
                key={topup.sku}
                level="l2"
                size="compact"
                tone="accent"
                onClick={() => onTopup(topup.sku)}
              >
                {"$"}{topup.priceUsd} · {topup.creditAmount.toLocaleString()}
              </SubToolboxButton>
            ))}
          </SubToolboxGrid>
          <SubToolboxFieldLabel htmlFor="settings-custom-topup" level="l1">
            Custom top-up amount
          </SubToolboxFieldLabel>
          <div className="grid min-w-0 gap-2 sm:grid-cols-[150px_minmax(0,1fr)]">
            <StudioNumberInput
              id="settings-custom-topup"
              sizeVariant="standard"
              min={1}
              step={1}
              value={customTopupAmount}
              onChange={(event) => onCustomTopupAmountChange(event.target.value)}
              aria-label="Custom top-up amount in US dollars"
            />
            <SubToolboxButton
              level="l1"
              size="standard"
              tone="success"
              onClick={onCustomTopup}
            >
              Custom top-up · 25% bonus at $50+
            </SubToolboxButton>
          </div>
        </SubToolboxStack>
      </SubToolbox>

      <SubToolbox
        title="Referral Rewards"
        icon={<Gift />}
        paletteIndex={8}
        collapsible
        isOpenInitial={false}
        persistenceId="settings-billing-referral"
        helpText="Your referral code follows the existing one-time customization and lock rules."
      >
        <SubToolboxStack density="dense">
          <SubToolboxNameValueList
            level="l1"
            items={[
              { name: "Referral code", value: referralCode },
              { name: "Status", value: referralCodeLocked ? "Custom code locked" : "Can customize once" },
            ]}
          />
          <SubToolboxFieldLabel htmlFor="settings-referral-code" level="l1">
            Custom referral code
          </SubToolboxFieldLabel>
          <StudioInput
            id="settings-referral-code"
            sizeVariant="standard"
            value={customReferralCode}
            onChange={(event) => onCustomReferralCodeChange(event.target.value.toUpperCase())}
            disabled={referralCodeLocked}
            placeholder="Set a one-time referral code"
          />
          <SubToolboxButton
            level="l1"
            size="standard"
            tone="accent"
            icon={<Sparkles size={18} />}
            disabled={referralCodeLocked}
            onClick={onSetCustomReferralCode}
          >
            Set referral code
          </SubToolboxButton>
        </SubToolboxStack>
      </SubToolbox>
    </div>
  )
}
