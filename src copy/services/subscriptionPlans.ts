import type { MasterTableType } from "./productArchitecture"

export type SubscriptionPlanId =
 | "basic"
 | "beta"
 | "creator"
 | "creator_plus"
 | "creator_pro"
 | "executive"

export interface SubscriptionPlanCapabilityMatrix {
 id: SubscriptionPlanId
 label: string
 modes: Array<"public_handle" | "connected" | "import" | "hybrid">
 tables: MasterTableType[]
 maxHistoryDays: number
 formulaComplexityTier: 1 | 2 | 3 | 4 | 5
 chartTier: 1 | 2 | 3 | 4 | 5
 includesScheduledExports: boolean
 includesExternalSignals: boolean
 includesTeamWorkspaces: boolean
 includesCustomConnectors: boolean
}

export const SUBSCRIPTION_PLANS: SubscriptionPlanCapabilityMatrix[] = [
 {
  id: "basic",
  label: "Basic (Free)",
  modes: ["public_handle", "import"],
  tables: [
   "master_channel_identity",
   "master_video_core",
   "master_geography",
   "master_traffic",
   "master_coverage_registry",
  ],
  maxHistoryDays: 90,
  formulaComplexityTier: 1,
  chartTier: 1,
  includesScheduledExports: false,
  includesExternalSignals: false,
  includesTeamWorkspaces: false,
  includesCustomConnectors: false,
 },
 {
  id: "beta",
  label: "Beta (BYOK)",
  modes: ["connected", "import", "hybrid", "public_handle"],
  tables: [
   "master_channel_identity",
   "master_video_core",
   "master_audience",
   "master_geography",
   "master_traffic",
   "master_device_playback",
   "master_retention",
   "master_monetization",
   "master_external_signals",
   "master_formula_metrics",
   "master_coverage_registry",
  ],
  maxHistoryDays: 3650,
  formulaComplexityTier: 5,
  chartTier: 5,
  includesScheduledExports: true,
  includesExternalSignals: true,
  includesTeamWorkspaces: true,
  includesCustomConnectors: true,
 },
 {
  id: "creator",
  label: "Creator",
  modes: ["connected", "import", "hybrid", "public_handle"],
  tables: [
   "master_channel_identity",
   "master_video_core",
   "master_audience",
   "master_geography",
   "master_traffic",
   "master_device_playback",
   "master_coverage_registry",
  ],
  maxHistoryDays: 365,
  formulaComplexityTier: 2,
  chartTier: 2,
  includesScheduledExports: false,
  includesExternalSignals: false,
  includesTeamWorkspaces: false,
  includesCustomConnectors: false,
 },
 {
  id: "creator_plus",
  label: "Creator Plus",
  modes: ["connected", "import", "hybrid", "public_handle"],
  tables: [
   "master_channel_identity",
   "master_video_core",
   "master_audience",
   "master_geography",
   "master_traffic",
   "master_device_playback",
   "master_retention",
   "master_monetization",
   "master_formula_metrics",
   "master_coverage_registry",
  ],
  maxHistoryDays: 1095,
  formulaComplexityTier: 3,
  chartTier: 3,
  includesScheduledExports: false,
  includesExternalSignals: false,
  includesTeamWorkspaces: false,
  includesCustomConnectors: false,
 },
 {
  id: "creator_pro",
  label: "Creator Pro",
  modes: ["connected", "import", "hybrid", "public_handle"],
  tables: [
   "master_channel_identity",
   "master_video_core",
   "master_audience",
   "master_geography",
   "master_traffic",
   "master_device_playback",
   "master_retention",
   "master_monetization",
   "master_external_signals",
   "master_formula_metrics",
   "master_coverage_registry",
  ],
  maxHistoryDays: 1825,
  formulaComplexityTier: 4,
  chartTier: 4,
  includesScheduledExports: true,
  includesExternalSignals: true,
  includesTeamWorkspaces: true,
  includesCustomConnectors: false,
 },
 {
  id: "executive",
  label: "Executive",
  modes: ["connected", "import", "hybrid", "public_handle"],
  tables: [
   "master_channel_identity",
   "master_video_core",
   "master_audience",
   "master_geography",
   "master_traffic",
   "master_device_playback",
   "master_retention",
   "master_monetization",
   "master_external_signals",
   "master_formula_metrics",
   "master_coverage_registry",
  ],
  maxHistoryDays: 3650,
  formulaComplexityTier: 5,
  chartTier: 5,
  includesScheduledExports: true,
  includesExternalSignals: true,
  includesTeamWorkspaces: true,
  includesCustomConnectors: true,
 },
]

export const getSubscriptionPlan = (
 planId: SubscriptionPlanId,
): SubscriptionPlanCapabilityMatrix => {
 return SUBSCRIPTION_PLANS.find((plan) => plan.id === planId) || SUBSCRIPTION_PLANS[0]
}

export const isTableEnabledForPlan = (
 planId: SubscriptionPlanId,
 table: MasterTableType,
): boolean => {
 return getSubscriptionPlan(planId).tables.includes(table)
}
