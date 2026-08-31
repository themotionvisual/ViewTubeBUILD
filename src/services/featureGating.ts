import type { AccountCapability, UnifiedAccountSnapshot } from "./account/accountContracts"
import { getSubscriptionPlan, type SubscriptionPlanId } from "./subscriptionPlans"
import type { MasterTableType } from "./productArchitecture"

/** Advisory until each protected operation has equivalent server enforcement. */
export const FEATURE_GATING_MODE = "advisory" as const
export type AiUsageCategory = "analysis" | "assets" | "other"
export type GateDisposition = "enabled" | "preview" | "upgrade" | "connect" | "reconnect" | "insufficient_credits" | "unsupported" | "disabled"
export interface FeatureGateDefinition {
  id: string
  label: string
  minimumPlan: SubscriptionPlanId
  requiredCapabilities?: readonly AccountCapability[]
  requiredTables?: readonly MasterTableType[]
  planTable?: MasterTableType
  planCapability?: "includesScheduledExports" | "includesExternalSignals" | "includesTeamWorkspaces" | "includesCustomConnectors"
  allowAnonymous?: boolean
  usageCategory?: AiUsageCategory
  requiresApproval?: boolean
  featureFlag?: string
  routes?: readonly string[]
}

export const FEATURE_GATES = [
  { id: "help.guide", label: "User guide and product information", minimumPlan: "basic", allowAnonymous: true, routes: ["/user-guide", "/about"] },
  { id: "data.portability", label: "Local CSV and complete JSON import/export", minimumPlan: "basic", allowAnonymous: true },
  { id: "analytics.connected_sync", label: "Connected YouTube sync", minimumPlan: "creator", requiredCapabilities: ["youtube_read", "youtube_analytics_read"], routes: ["/local-analytics", "/analytics", "/vt-sync-local"] },
  { id: "analytics.retention", label: "Retention analysis", minimumPlan: "creator_plus", planTable: "master_retention", routes: ["/graphs/shorts-retention"] },
  { id: "analytics.monetization", label: "Private revenue analytics", minimumPlan: "creator_plus", planTable: "master_monetization", requiredCapabilities: ["youtube_monetary_read"] },
  { id: "analytics.external_signals", label: "External signals / Search Console", minimumPlan: "creator_pro", planCapability: "includesExternalSignals", requiredCapabilities: ["search_console_read"] },
  { id: "brain.core", label: "AI Brain analysis", minimumPlan: "creator", usageCategory: "analysis", routes: ["/ai-brain", "/media-analyzer"] },
  { id: "brain.oracle", label: "Oracle and executive analysis", minimumPlan: "creator_plus", usageCategory: "analysis", routes: ["/intelligence"] },
  { id: "creator.generation", label: "AI writing and asset generation", minimumPlan: "creator", usageCategory: "assets", routes: ["/studio", "/seo-generator", "/hook-generator", "/storyboard-studio", "/thumbnail-studio"] },
  { id: "editor.core", label: "Local video editing", minimumPlan: "basic", allowAnonymous: true, routes: ["/editor"] },
  { id: "editor.advanced", label: "Advanced editor workflows", minimumPlan: "creator_plus" },
  { id: "community.write", label: "Post comments and community actions", minimumPlan: "creator", requiredCapabilities: ["youtube_comments"], requiresApproval: true },
  { id: "publishing.upload", label: "Publish and upload videos", minimumPlan: "creator_plus", requiredCapabilities: ["youtube_upload"], requiresApproval: true, featureFlag: "publishing.upload", routes: ["/video-publisher"] },
  { id: "exports.scheduled", label: "Scheduled exports", minimumPlan: "creator_pro", planCapability: "includesScheduledExports" },
  { id: "workspace.personal", label: "Personal projects and calendar", minimumPlan: "basic", allowAnonymous: true, routes: ["/projects", "/project-calendar"] },
  { id: "workspace.team", label: "Team workspaces", minimumPlan: "creator_pro", planCapability: "includesTeamWorkspaces" },
  { id: "connectors.custom", label: "Custom connectors", minimumPlan: "executive", planCapability: "includesCustomConnectors" },
  { id: "settings.api_keys", label: "API keys / BYOK", minimumPlan: "creator_pro" },
] as const satisfies readonly FeatureGateDefinition[]

export type FeatureGateId = typeof FEATURE_GATES[number]["id"]
export interface FeatureGateContext {
  snapshot: UnifiedAccountSnapshot
  serverVerified: boolean
  /** Reserved for explicit server assertions. Never infer these from email or browser storage. */
  policy?: { ownerOverride?: boolean; betaAllowlisted?: boolean }
  availableTables?: readonly MasterTableType[]
  flags?: Readonly<Record<string, boolean>>
  approvedExternalAction?: boolean
  estimatedCredits?: number
}
export interface FeatureGateDecision {
  disposition: GateDisposition
  reason: string
  actionLabel?: string
  href?: string
  capability?: AccountCapability
}

export const featureGateDefinition = (id: FeatureGateId): FeatureGateDefinition => FEATURE_GATES.find((gate) => gate.id === id)!
export const featureGateForRoute = (path: string): FeatureGateId | undefined =>
  FEATURE_GATES.find((gate) => (gate as FeatureGateDefinition).routes?.includes(path.split(/[?#]/)[0]))?.id

export const resolveFeatureGate = (id: FeatureGateId, ctx: FeatureGateContext): FeatureGateDecision => {
  const gate = featureGateDefinition(id)
  const { snapshot } = ctx
  const enabled = { disposition: "enabled", reason: "Available under the proposed policy." } as const
  if (gate.allowAnonymous && gate.minimumPlan === "basic") return enabled
  if (snapshot.authentication.status === "pending") return { disposition: "disabled", reason: "Checking account status." }
  if (snapshot.authentication.status === "expired") return { disposition: "reconnect", reason: "Sign in again to verify access.", actionLabel: "Sign in", href: "/account/connect?intent=log_in" }
  if (snapshot.authentication.status !== "authenticated") return { disposition: "preview", reason: "Explore the tool; sign in to check account access.", actionLabel: "Sign in", href: "/account/connect?intent=log_in" }
  if (!ctx.serverVerified) return { disposition: "disabled", reason: "Account access could not be verified. Retry in Settings.", actionLabel: "Review access", href: "/settings?panel=access" }
  if (snapshot.billing.status === "unavailable") return { disposition: "disabled", reason: "Billing verification is unavailable." }
  const planId = snapshot.billing.planId
  const override = ctx.policy?.ownerOverride || (planId === "beta" && ctx.policy?.betaAllowlisted)
  const paidActive = snapshot.billing.status === "active" || snapshot.billing.status === "trialing"
  const plan = getSubscriptionPlan(override ? "executive" : paidActive && planId !== "beta" ? planId as SubscriptionPlanId : "basic")
  const minimum = getSubscriptionPlan(gate.minimumPlan)
  if (plan.chartTier < minimum.chartTier || (gate.planTable && !plan.tables.includes(gate.planTable)) || (gate.planCapability && !plan[gate.planCapability])) {
    return { disposition: "upgrade", reason: planId === "beta" ? "Beta access requires an explicit server allowlist; Beta alone does not grant access." : `${minimum.label} or above is required.`, actionLabel: "Compare plans", href: "/subscribe" }
  }
  if (gate.featureFlag && ctx.flags?.[gate.featureFlag] !== true) return { disposition: "disabled", reason: "This operation is not enabled for rollout." }
  if (gate.requiredCapabilities?.length) {
    const missing = gate.requiredCapabilities.find((capability) => !snapshot.grantedCapabilities.includes(capability))
    const expired = snapshot.google.status === "expired" || snapshot.google.status === "revoked"
    if (missing || snapshot.google.status !== "connected") {
      const reconnect = expired || snapshot.google.status === "connected"
      return { disposition: reconnect ? "reconnect" : "connect", reason: "YouTube authorization is required; this is not a plan upgrade.", actionLabel: reconnect ? "Reconnect channel" : "Connect channel", href: "/account?panel=account", capability: missing }
    }
  }
  if (gate.requiredTables?.some((table) => !ctx.availableTables?.includes(table))) return { disposition: "unsupported", reason: "Required real data is unavailable. Sync or import it first." }
  if (gate.usageCategory) {
    const cost = ctx.estimatedCredits ?? 1
    if (!Number.isFinite(cost) || cost < 0 || !Number.isFinite(snapshot.ai.availableCredits)) return { disposition: "disabled", reason: "A valid credit balance and operation estimate are required." }
    if (snapshot.ai.availableCredits < Math.max(1, cost) && plan.id !== "executive") return { disposition: "insufficient_credits", reason: "Your plan permits this feature, but more AI credits are needed.", actionLabel: "Review credits", href: "/settings?panel=billing" }
  }
  if (gate.requiresApproval && !ctx.approvedExternalAction) return { disposition: "preview", reason: "Draft / dry run only. Explicit approval is required before making external changes." }
  return enabled
}
