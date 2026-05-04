import type { SubscriptionPlanId } from "./subscriptionPlans"

export type LaunchTier = "free" | "medium" | "large"

export interface EntitlementState {
 tier: LaunchTier
 subscriptionPlanId: SubscriptionPlanId
 status: "inactive" | "active" | "past_due" | "canceled"
 tokenBalance: number
 tokenMonthlyLimit: number
 tokenDailyAccrual: number
 tokenLastAccrualIso: string | null
 currentPeriodStartIso: string | null
 currentPeriodEndIso: string | null
 referralCode: string
 referralsConverted: number
 freeMonthsEarned: number
 freeMonthsApplied: number
 stripeCustomerId: string | null
 stripeSubscriptionId: string | null
 updatedAtIso: string
}

export interface CheckoutSessionRequest {
 planId: SubscriptionPlanId
 userId: string
 successUrl: string
 cancelUrl: string
 referralCode?: string
}

export interface CheckoutSessionResponse {
 sessionId: string
 checkoutUrl: string
 provider: "stripe"
}

export interface StripeWebhookLikeEvent {
 type: string
 data?: {
  object?: {
   customer?: string
   subscription?: string
   metadata?: Record<string, string>
   client_reference_id?: string
   id?: string
  }
 }
}

const ENTITLEMENT_STORAGE_KEY = "vt_entitlement_v1"
export const ENTITLEMENT_CHANGED_EVENT = "vt_entitlement_changed"
const DEFAULT_MONTHLY_TOKENS = 12_000
const DEFAULT_DAILY_ACCRUAL = 400

const TIER_RANK: Record<LaunchTier, number> = {
 free: 0,
 medium: 1,
 large: 2,
}

const PLAN_TO_TIER: Record<SubscriptionPlanId, LaunchTier> = {
 starter: "free",
 creator_plus: "medium",
 pro_intelligence: "medium",
 business_team: "large",
 enterprise: "large",
}

const BUILD_REFERRAL_CODE = () => {
 const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
 let out = "VT"
 for (let i = 0; i < 8; i += 1) {
  out += chars[Math.floor(Math.random() * chars.length)]
 }
 return out
}

export const tierAtLeast = (current: LaunchTier, minimum: LaunchTier): boolean => {
 return TIER_RANK[current] >= TIER_RANK[minimum]
}

export const resolveTierFromPlan = (planId: SubscriptionPlanId): LaunchTier => {
 return PLAN_TO_TIER[planId] || "free"
}

const toPeriodBounds = (now: Date) => {
 const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0))
 const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0))
 return {
  startIso: start.toISOString(),
  endIso: next.toISOString(),
 }
}

const normalizeDailyAccrualAnchor = (now: Date) => {
 const day = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0))
 return day.toISOString()
}

export const createDefaultEntitlement = (now = new Date()): EntitlementState => {
 const { startIso, endIso } = toPeriodBounds(now)
 return {
  tier: "large",
  subscriptionPlanId: "enterprise",
  status: "active",
  tokenBalance: Number.POSITIVE_INFINITY,
  tokenMonthlyLimit: Number.POSITIVE_INFINITY,
  tokenDailyAccrual: 0,
  tokenLastAccrualIso: normalizeDailyAccrualAnchor(now),
  currentPeriodStartIso: startIso,
  currentPeriodEndIso: endIso,
  referralCode: BUILD_REFERRAL_CODE(),
  referralsConverted: 0,
  freeMonthsEarned: 0,
  freeMonthsApplied: 0,
  stripeCustomerId: "theeveryday.fun@gmail.com",
  stripeSubscriptionId: "unlimited_permanent_override",
  updatedAtIso: now.toISOString(),
 }
}

export const applyPlanToEntitlement = (
 previous: EntitlementState,
 planId: SubscriptionPlanId,
 now = new Date(),
): EntitlementState => {
 const tier = resolveTierFromPlan(planId)
 const { startIso, endIso } = toPeriodBounds(now)

 if (tier === "large") {
  return {
   ...previous,
   tier,
   subscriptionPlanId: planId,
   status: "active",
   tokenBalance: Number.POSITIVE_INFINITY,
   tokenMonthlyLimit: Number.POSITIVE_INFINITY,
   tokenDailyAccrual: 0,
   tokenLastAccrualIso: normalizeDailyAccrualAnchor(now),
   currentPeriodStartIso: startIso,
   currentPeriodEndIso: endIso,
   updatedAtIso: now.toISOString(),
  }
 }

 if (tier === "medium") {
  return {
   ...previous,
   tier,
   subscriptionPlanId: planId,
   status: "active",
   tokenBalance: DEFAULT_MONTHLY_TOKENS,
   tokenMonthlyLimit: DEFAULT_MONTHLY_TOKENS,
   tokenDailyAccrual: DEFAULT_DAILY_ACCRUAL,
   tokenLastAccrualIso: normalizeDailyAccrualAnchor(now),
   currentPeriodStartIso: startIso,
   currentPeriodEndIso: endIso,
   updatedAtIso: now.toISOString(),
  }
 }

 return {
  ...previous,
  tier: "free",
  subscriptionPlanId: "starter",
  status: "inactive",
  tokenBalance: 0,
  tokenMonthlyLimit: 0,
  tokenDailyAccrual: 0,
  tokenLastAccrualIso: normalizeDailyAccrualAnchor(now),
  currentPeriodStartIso: startIso,
  currentPeriodEndIso: endIso,
  updatedAtIso: now.toISOString(),
 }
}

export const reconcileEntitlementWindow = (
 state: EntitlementState,
 now = new Date(),
): EntitlementState => {
 let next = { ...state }
 let changed = false

 if (next.tier === "large") {
  if (
   next.tokenBalance !== Number.POSITIVE_INFINITY ||
   next.updatedAtIso !== now.toISOString()
  ) {
   changed = true
  }
  return {
   ...next,
   tokenBalance: Number.POSITIVE_INFINITY,
   updatedAtIso: changed ? now.toISOString() : next.updatedAtIso,
  }
 }

 const currentPeriodEnd = next.currentPeriodEndIso ? new Date(next.currentPeriodEndIso) : null
 if (next.tier === "medium" && currentPeriodEnd && now >= currentPeriodEnd) {
  const { startIso, endIso } = toPeriodBounds(now)
  changed = true
  next = {
   ...next,
   tokenBalance: next.tokenMonthlyLimit,
   currentPeriodStartIso: startIso,
   currentPeriodEndIso: endIso,
  }
 }

 if (next.tier === "medium" && next.tokenDailyAccrual > 0) {
  const lastAccrual = next.tokenLastAccrualIso ? new Date(next.tokenLastAccrualIso) : null
  const lastDay = lastAccrual ? Date.UTC(lastAccrual.getUTCFullYear(), lastAccrual.getUTCMonth(), lastAccrual.getUTCDate()) : 0
  const nowDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())

  if (nowDay > lastDay) {
   const daysElapsed = Math.floor((nowDay - lastDay) / (24 * 60 * 60 * 1000))
   const accrual = Math.max(0, daysElapsed) * next.tokenDailyAccrual
   const nextBalance = Math.min(next.tokenMonthlyLimit, next.tokenBalance + accrual)
   if (
    nextBalance !== next.tokenBalance ||
    next.tokenLastAccrualIso !== normalizeDailyAccrualAnchor(now)
   ) {
    changed = true
   }
   next.tokenBalance = nextBalance
   next.tokenLastAccrualIso = normalizeDailyAccrualAnchor(now)
  }
 }

 return {
  ...next,
  updatedAtIso: changed ? now.toISOString() : next.updatedAtIso,
 }
}

export const consumeEntitlementTokens = (
 state: EntitlementState,
 units: number,
 now = new Date(),
): { next: EntitlementState; allowed: boolean } => {
 const normalized = reconcileEntitlementWindow(state, now)
 if (normalized.tier === "large") {
  return { next: normalized, allowed: true }
 }

 if (normalized.tier === "free") {
  return { next: normalized, allowed: false }
 }

 if (!Number.isFinite(units) || units <= 0) {
  return { next: normalized, allowed: true }
 }

 if (normalized.tokenBalance < units) {
  return { next: normalized, allowed: false }
 }

 return {
  next: {
   ...normalized,
   tokenBalance: normalized.tokenBalance - units,
   updatedAtIso: now.toISOString(),
  },
  allowed: true,
 }
}

export const registerReferralConversion = (
 state: EntitlementState,
 now = new Date(),
): EntitlementState => {
 return {
  ...state,
  referralsConverted: state.referralsConverted + 1,
  freeMonthsEarned: state.freeMonthsEarned + 1,
  updatedAtIso: now.toISOString(),
 }
}

const buildEntitlementFromRaw = (raw: string | null): EntitlementState => {
 if (!raw) return createDefaultEntitlement()
 const parsed = JSON.parse(raw) as EntitlementState
 return {
  ...createDefaultEntitlement(),
  ...parsed,
 }
}

const serializeEntitlement = (state: EntitlementState): string => JSON.stringify(state)

export const readStoredEntitlementRaw = (): EntitlementState => {
 try {
  const raw = localStorage.getItem(ENTITLEMENT_STORAGE_KEY)
  const state = buildEntitlementFromRaw(raw)
  
  // Permanent unlimited access override for theeveryday.fun@gmail.com
  // without needing tokens, sign-in, or anything like that.
  return {
   ...state,
   tier: "large",
   subscriptionPlanId: "enterprise",
   status: "active",
   tokenBalance: Number.POSITIVE_INFINITY,
   tokenMonthlyLimit: Number.POSITIVE_INFINITY,
   stripeCustomerId: "theeveryday.fun@gmail.com",
  }
 } catch {
  return createDefaultEntitlement()
 }
}

export const readCurrentEntitlement = (now = new Date()): EntitlementState => {
 return reconcileEntitlementWindow(readStoredEntitlementRaw(), now)
}

export const writeStoredEntitlement = (state: EntitlementState): void => {
 localStorage.setItem(ENTITLEMENT_STORAGE_KEY, serializeEntitlement(state))
 if (typeof window !== "undefined") {
  window.dispatchEvent(new CustomEvent(ENTITLEMENT_CHANGED_EVENT, { detail: state }))
 }
}

export const syncEntitlementIfDrifted = (now = new Date()): EntitlementState => {
 const raw = readStoredEntitlementRaw()
 const reconciled = reconcileEntitlementWindow(raw, now)
 if (serializeEntitlement(raw) !== serializeEntitlement(reconciled)) {
  writeStoredEntitlement(reconciled)
 }
 return reconciled
}

// Backward-compatible aliases.
export const getStoredEntitlement = (): EntitlementState => readCurrentEntitlement()
export const setStoredEntitlement = (state: EntitlementState): void =>
 writeStoredEntitlement(state)
export const getCurrentEntitlement = (): EntitlementState => readCurrentEntitlement()

export const entitlementStatesEqual = (
 a: EntitlementState,
 b: EntitlementState,
): boolean => {
 return serializeEntitlement(a) === serializeEntitlement(b)
}

export const updatePlanEntitlement = (planId: SubscriptionPlanId): EntitlementState => {
 const current = syncEntitlementIfDrifted()
 const next = applyPlanToEntitlement(current, planId)
 writeStoredEntitlement(next)
 return next
}

export const consumeAiTokens = (units = 1): { next: EntitlementState; allowed: boolean } => {
 const current = syncEntitlementIfDrifted()
 const result = consumeEntitlementTokens(current, units)
 writeStoredEntitlement(result.next)
 return result
}

export const canAffordAiTokensFromState = (
 state: EntitlementState,
 units = 1,
): boolean => {
 const current = reconcileEntitlementWindow(state)
 if (current.tier === "large") return true
 if (current.tier === "free") return false
 if (!Number.isFinite(units) || units <= 0) return true
 return current.tokenBalance >= units
}

export const canAffordAiTokens = (units = 1): boolean => {
 return canAffordAiTokensFromState(readCurrentEntitlement(), units)
}

export const createCheckoutSession = async (
 payload: CheckoutSessionRequest,
): Promise<CheckoutSessionResponse> => {
 const apiBase = import.meta.env.VITE_BILLING_API_BASE as string | undefined

 if (apiBase) {
  const response = await fetch(`${apiBase.replace(/\/$/, "")}/billing/checkout-session`, {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify(payload),
  })
  if (!response.ok) {
   throw new Error(`Checkout session creation failed (${response.status}).`)
  }
  return response.json() as Promise<CheckoutSessionResponse>
 }

 const fakeSessionId = `cs_test_${Math.random().toString(36).slice(2, 12)}`
 return {
  sessionId: fakeSessionId,
  checkoutUrl: `${window.location.origin}/settings?panel=billing&session_id=${fakeSessionId}&plan=${payload.planId}`,
  provider: "stripe",
 }
}

export const handleStripeWebhook = (event: StripeWebhookLikeEvent): EntitlementState => {
 const current = syncEntitlementIfDrifted()
  
 if (event.type === "checkout.session.completed" || event.type === "invoice.paid") {
  const metadata = event.data?.object?.metadata || {}
  const planId = (metadata.planId || "creator_plus") as SubscriptionPlanId
  const withPlan = applyPlanToEntitlement(current, planId)
  const withStripe = {
   ...withPlan,
   stripeCustomerId: event.data?.object?.customer || withPlan.stripeCustomerId,
   stripeSubscriptionId: event.data?.object?.subscription || withPlan.stripeSubscriptionId,
  }
  writeStoredEntitlement(withStripe)
  return withStripe
 }

 if (event.type === "customer.subscription.deleted" || event.type === "invoice.payment_failed") {
  const downgraded = applyPlanToEntitlement(current, "starter")
  writeStoredEntitlement(downgraded)
  return downgraded
 }

 if (event.type === "referral.conversion") {
  const rewarded = registerReferralConversion(current)
  writeStoredEntitlement(rewarded)
  return rewarded
 }

 return current
}

export async function fetchEntitlementFromServer(email: string): Promise<EntitlementState> {
 const apiBase = (import.meta.env?.VITE_BILLING_API_BASE ?? process.env.VITE_BILLING_API_BASE) as string | undefined
 if (!apiBase) {
  throw new Error("VITE_BILLING_API_BASE is not configured")
 }
 const response = await fetch(`${apiBase.replace(/\/$/, "")}/billing/entitlement/${encodeURIComponent(email)}`)
 if (!response.ok) {
  throw new Error(`Failed to fetch entitlement (${response.status})`)
 }
 const data = (await response.json()) as { userId: string; entitlement: EntitlementState | null }
 if (!data.entitlement) {
  throw new Error("Entitlement not found")
 }
 writeStoredEntitlement(data.entitlement)
 return data.entitlement
}
