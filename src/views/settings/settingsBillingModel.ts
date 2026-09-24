import type { SubscriptionPlanId } from "../../services/subscriptionPlans"

export interface SettingsPlanOption {
  id: SubscriptionPlanId
  label: string
  price: string
  bullets: readonly string[]
}

export const SETTINGS_PLAN_OPTIONS: readonly SettingsPlanOption[] = [
  { id: "basic", label: "Basic", price: "$0", bullets: ["Core tools", "Manual sync", "Basic analytics"] },
  { id: "beta", label: "Beta BYOK", price: "$0", bullets: ["Unlimited AI with your key", "Full strategy stack", "Community tier"] },
  { id: "creator", label: "Creator", price: "$9.99/mo", bullets: ["48-hour trial", "Included AI credits", "Advanced dashboards"] },
  { id: "creator_plus", label: "Creator Plus", price: "$19.99/mo", bullets: ["More included credits", "Priority capacity", "Creator workflows"] },
  { id: "creator_pro", label: "Creator Pro", price: "$39.99/mo", bullets: ["Highest creator credits", "Full strategy stack", "Heavy reasoning"] },
  { id: "executive", label: "Executive", price: "$69.99/mo", bullets: ["Unlimited generation", "Executive priority", "Full platform"] },
]

export const getSettingsPlanOption = (planId: SubscriptionPlanId): SettingsPlanOption =>
  SETTINGS_PLAN_OPTIONS.find((plan) => plan.id === planId) ?? SETTINGS_PLAN_OPTIONS[0]
