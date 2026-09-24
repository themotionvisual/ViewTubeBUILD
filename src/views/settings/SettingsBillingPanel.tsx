import React, { useEffect, useMemo, useState } from "react"
import { CreditCard, Gift, LockKeyhole, PlusCircle, Sparkles } from "lucide-react"
import { SubToolbox } from "../../components/Toolbox"
import { SubToolboxActions, SubToolboxStack } from "../../components/subtoolbox/SubToolboxLayouts"
import {
  SubToolboxAlert,
  SubToolboxButton,
  SubToolboxDisclosure,
  SubToolboxFieldLabel,
  SubToolboxInput,
  SubToolboxMeter,
  SubToolboxMetricStrip,
  SubToolboxSelect,
  SubToolboxStatusBadge,
} from "../../components/subtoolbox/SubToolboxPrimitives"
import {
  TOPUP_DEFINITIONS,
  getReferralCode,
  type EntitlementState,
} from "../../services/billingEntitlement"
import type { SubscriptionPlanId } from "../../services/subscriptionPlans"

const PLANS: Array<{ id: SubscriptionPlanId; label: string; price: string; bullets: string[] }> = [
  { id: "basic", label: "Basic", price: "$0", bullets: ["Core tools", "Manual sync", "Basic analytics"] },
  { id: "beta", label: "Beta BYOK", price: "$0", bullets: ["Unlimited AI with your key", "Full strategy stack", "Community tier"] },
  { id: "creator", label: "Creator", price: "$9.99/mo", bullets: ["48-hour trial", "Included AI credits", "Advanced dashboards"] },
  { id: "creator_plus", label: "Creator Plus", price: "$19.99/mo", bullets: ["More included credits", "Priority capacity", "Creator workflows"] },
  { id: "creator_pro", label: "Creator Pro", price: "$39.99/mo", bullets: ["Highest creator credits", "Full strategy stack", "Heavy reasoning"] },
  { id: "executive", label: "Executive", price: "$69.99/mo", bullets: ["Unlimited generation", "Executive priority", "Full platform"] },
]

export interface SettingsBillingPanelProps {
  billingStatus: string | null
  customReferralCode: string
  customTopupAmount: string
  entitlement: EntitlementState
  loadingPlan: SubscriptionPlanId | null
  meterLeft: number
  meterPct: number
  meterTotal: number
  meterUsed: number
  onChoosePlan: (planId: SubscriptionPlanId) => void
  onCustomReferralCodeChange: (value: string) => void
  onCustomTopup: () => void
  onCustomTopupAmountChange: (value: string) => void
  onOpenBillingPortal: () => void
  onSetCustomReferralCode: () => void
  onTopup: (sku: string) => void
}

export const SettingsBillingPanel: React.FC<SettingsBillingPanelProps> = (props) => {
  const { billingStatus, customReferralCode, customTopupAmount, entitlement, loadingPlan, meterLeft, meterPct, meterTotal, meterUsed, onChoosePlan, onCustomReferralCodeChange, onCustomTopup, onCustomTopupAmountChange, onOpenBillingPortal, onSetCustomReferralCode, onTopup } = props
  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionPlanId>(entitlement.subscriptionPlanId)
  useEffect(() => setSelectedPlanId(entitlement.subscriptionPlanId), [entitlement.subscriptionPlanId])
  const selectedPlan = useMemo(() => PLANS.find((plan) => plan.id === selectedPlanId) ?? PLANS[0], [selectedPlanId])
  const activePlan = selectedPlan.id === entitlement.subscriptionPlanId

  return (
    <div className="grid gap-3">
      <SubToolbox title="Plan + Credits" icon={<CreditCard />} paletteIndex={5} persistenceId="settings-billing-summary" helpText="Server-owned plan state, credit capacity and secure billing actions.">
        <SubToolboxStack density="dense">
          <SubToolboxMetricStrip level="l1" items={[
            { label: "Plan", value: entitlement.subscriptionPlanId },
            { label: "Available", value: entitlement.tier === "large" ? "Unlimited" : meterLeft.toLocaleString() },
            { label: "Used", value: meterUsed.toLocaleString() },
          ]} />
          <SubToolboxMeter level="l1" value={entitlement.tier === "large" ? 100 : meterPct} max={100} label={entitlement.tier === "large" ? "Unlimited credits" : `${meterLeft.toLocaleString()} of ${meterTotal.toLocaleString()} remaining`} />
          <SubToolboxActions columns={2}>
            <SubToolboxButton level="l1" icon={<LockKeyhole size={18} />} onClick={onOpenBillingPortal}>Manage billing</SubToolboxButton>
            <SubToolboxStatusBadge level="l1">{entitlement.nextRefillIso ? `Refill ${new Date(entitlement.nextRefillIso).toLocaleDateString()}` : "No refill scheduled"}</SubToolboxStatusBadge>
          </SubToolboxActions>
          {billingStatus && !billingStatus.toLowerCase().includes("entitlements synced with server") ? <SubToolboxAlert level="l2" tone="info" title="Billing status" detail={billingStatus} /> : null}
        </SubToolboxStack>
      </SubToolbox>

      <SubToolbox title="Change Plan" icon={<Sparkles />} paletteIndex={6} collapsible isOpenInitial={false} persistenceId="settings-billing-change-plan" helpText="Choose one plan, review only that plan, then act.">
        <SubToolboxStack density="dense">
          <SubToolboxFieldLabel level="l2" htmlFor="settings-plan-select">Plan</SubToolboxFieldLabel>
          <SubToolboxSelect id="settings-plan-select" value={selectedPlanId} onChange={(event) => setSelectedPlanId(event.target.value as SubscriptionPlanId)}>
            {PLANS.map((plan) => <option key={plan.id} value={plan.id}>{plan.label} · {plan.price}</option>)}
          </SubToolboxSelect>
          <SubToolboxAlert level="l1" tone={activePlan ? "success" : "info"} icon={<CreditCard size={20} />} title={`${selectedPlan.label} · ${selectedPlan.price}`} detail={selectedPlan.bullets.join(" • ")} action={<SubToolboxButton level="l2" size="compact" disabled={activePlan || loadingPlan === selectedPlan.id} onClick={() => onChoosePlan(selectedPlan.id)}>{activePlan ? "Current" : loadingPlan === selectedPlan.id ? "Working…" : selectedPlan.id === "basic" ? "Manage downgrade" : "Choose"}</SubToolboxButton>} />
        </SubToolboxStack>
      </SubToolbox>

      <div className="grid gap-3 xl:grid-cols-2">
        <SubToolbox title="Top Up Credits" icon={<PlusCircle />} paletteIndex={7} collapsible isOpenInitial={false} persistenceId="settings-billing-topups">
          <SubToolboxStack density="dense">
            <SubToolboxActions columns={3}>
              {TOPUP_DEFINITIONS.map((topup) => <SubToolboxButton key={topup.sku} level="l1" size="compact" onClick={() => onTopup(topup.sku)}>${topup.priceUsd} · {topup.creditAmount.toLocaleString()}</SubToolboxButton>)}
            </SubToolboxActions>
            <SubToolboxDisclosure level="l1" title="Custom top-up" icon={<PlusCircle size={18} />}>
              <SubToolboxStack density="dense">
                <SubToolboxFieldLabel level="l2" htmlFor="settings-custom-topup">Amount in US dollars</SubToolboxFieldLabel>
                <SubToolboxInput id="settings-custom-topup" level="l1" type="number" min={1} step={1} value={customTopupAmount} onChange={(event) => onCustomTopupAmountChange(event.target.value)} />
                <SubToolboxButton level="l1" onClick={onCustomTopup}>Top up · 25% bonus at $50+</SubToolboxButton>
              </SubToolboxStack>
            </SubToolboxDisclosure>
          </SubToolboxStack>
        </SubToolbox>

        <SubToolbox title="Referral Rewards" icon={<Gift />} paletteIndex={8} collapsible isOpenInitial={false} persistenceId="settings-billing-referrals">
          <SubToolboxStack density="dense">
            <SubToolboxAlert level="l1" tone="info" title={getReferralCode()} detail={entitlement.referralCodeLocked ? "Custom code locked" : "You can customize this once"} />
            <SubToolboxFieldLabel level="l2" htmlFor="settings-referral-code">Custom referral code</SubToolboxFieldLabel>
            <SubToolboxInput id="settings-referral-code" level="l1" value={customReferralCode} onChange={(event) => onCustomReferralCodeChange(event.target.value.toUpperCase())} disabled={entitlement.referralCodeLocked} placeholder="Set a one-time referral code" />
            <SubToolboxButton level="l1" icon={<Gift size={18} />} disabled={entitlement.referralCodeLocked} onClick={onSetCustomReferralCode}>Set referral code</SubToolboxButton>
          </SubToolboxStack>
        </SubToolbox>
      </div>
    </div>
  )
}