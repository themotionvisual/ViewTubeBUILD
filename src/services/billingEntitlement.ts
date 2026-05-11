import type { SubscriptionPlanId } from "./subscriptionPlans"

export type LaunchTier = "free" | "medium" | "large"
export type CreditLedgerEntryType =
 | "monthly_refill"
 | "topup_credit"
 | "usage_debit"
 | "adjustment"

export interface PlanDefinition {
 id: SubscriptionPlanId
 priceUsd: number
 monthlyCredits: number
 rolloverCap: number
 tier: LaunchTier
}

export interface TopupDefinition {
 sku: string
 priceUsd: number
 creditAmount: number
}

export interface AutoRechargeConfig {
 enabled: boolean
 thresholdCredits: number
 topupSku: string | null
 cooldownHours: number
 lastTriggeredIso: string | null
}

export interface EntitlementState {
 tier: LaunchTier
 subscriptionPlanId: SubscriptionPlanId
 status: "inactive" | "active" | "past_due" | "canceled"

 // Canonical credit meter (1 credit == $0.01).
 creditBalance: number
 monthlyCreditGrant: number
 rolloverCap: number
 nextRefillIso: string | null

 // Backward compatibility for legacy token widgets.
 tokenBalance: number
 tokenMonthlyLimit: number
 tokenDailyAccrual: number
 tokenLastAccrualIso: string | null

 currentPeriodStartIso: string | null
 currentPeriodEndIso: string | null
 referralCode: string
 referralCodeLocked: boolean
 referralsConverted: number
 freeMonthsEarned: number
 freeMonthsApplied: number
 stripeCustomerId: string | null
 stripeSubscriptionId: string | null

 autoRechargeConfig: AutoRechargeConfig
 updatedAtIso: string
}

export interface MeterQuoteRequest {
 modelId: string
 inputTokensEstimate: number
 outputTokensEstimate: number
}

export interface MeterQuoteResponse {
 modelId: string
 inputTokensEstimate: number
 outputTokensEstimate: number
 rawCostUsd: number
 meterCostUsd: number
 markupMultiplier: number
 creditDebitEstimate: number
 canRun: boolean
 availableCredits: number
}

export interface MeterChargeEvent {
 id: string
 tsIso: string
 modelId: string
 inputTokens: number
 outputTokens: number
 rawCostUsd: number
 meterCostUsd: number
 markupMultiplier: number
 creditDebit: number
 balanceBefore: number
 balanceAfter: number
 reason: "usage_metadata" | "fallback_estimate"
 fallbackApplied: boolean
}

export interface CreditLedgerEntry {
 id: string
 tsIso: string
 type: CreditLedgerEntryType
 deltaCredits: number
 balanceAfter: number
 meta?: Record<string, string | number | boolean | null>
}

export interface CheckoutSessionRequest {
 planId: SubscriptionPlanId
 userId: string
 successUrl: string
 cancelUrl: string
 referralCode?: string
 mode?: "subscription" | "topup"
 topupSku?: string
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
const ENTITLEMENT_LEDGER_KEY = "vt_credit_ledger_v1"
const KNOWN_USER_EMAIL_KEY = "vt_known_user_email"
const REFERRAL_REDEMPTION_KEY = "vt_referral_redemption_v1"
const OWNER_METER_SIMULATION_KEY = "vt_owner_meter_simulation_v1"
export const ENTITLEMENT_CHANGED_EVENT = "vt_entitlement_changed"

const MARKUP_MULTIPLIER = Number(import.meta.env?.VITE_GEMINI_METER_MARKUP || 3)

const PLAN_DEFINITIONS: PlanDefinition[] = [
 { id: "basic", priceUsd: 0, monthlyCredits: 0, rolloverCap: 0, tier: "free" },
 { id: "creator", priceUsd: 9.99, monthlyCredits: 1000, rolloverCap: 2000, tier: "medium" },
 {
  id: "creator_plus",
  priceUsd: 19.99,
  monthlyCredits: 2000,
  rolloverCap: 4000,
  tier: "medium",
 },
 {
  id: "creator_pro",
  priceUsd: 39.99,
  monthlyCredits: 4000,
  rolloverCap: 8000,
  tier: "medium",
 },
 { id: "executive", priceUsd: 69.99, monthlyCredits: Number.POSITIVE_INFINITY, rolloverCap: Number.POSITIVE_INFINITY, tier: "large" },
]

export const TOPUP_DEFINITIONS: TopupDefinition[] = [
 { sku: "topup_5", priceUsd: 5, creditAmount: 8_000 },
 { sku: "topup_10", priceUsd: 10, creditAmount: 18_000 },
 { sku: "topup_25", priceUsd: 25, creditAmount: 50_000 },
]

const GEMINI_MODEL_RATES_USD_PER_1K: Record<string, { input: number; output: number }> = {
 "gemini-3-flash-preview": {
  input: Number(import.meta.env?.VITE_GEMINI_RATE_FLASH_IN_1K || 0.00035),
  output: Number(import.meta.env?.VITE_GEMINI_RATE_FLASH_OUT_1K || 0.00105),
 },
 "gemini-3-pro-preview": {
  input: Number(import.meta.env?.VITE_GEMINI_RATE_PRO_IN_1K || 0.0035),
  output: Number(import.meta.env?.VITE_GEMINI_RATE_PRO_OUT_1K || 0.0105),
 },
 "gemini-3.1-pro-preview": {
  input: Number(import.meta.env?.VITE_GEMINI_RATE_PRO_IN_1K || 0.0035),
  output: Number(import.meta.env?.VITE_GEMINI_RATE_PRO_OUT_1K || 0.0105),
 },
}

const TIER_RANK: Record<LaunchTier, number> = { free: 0, medium: 1, large: 2 }
const DEFAULT_AUTO_RECHARGE: AutoRechargeConfig = {
 enabled: false,
 thresholdCredits: 2_500,
 topupSku: "topup_10",
 cooldownHours: 24,
 lastTriggeredIso: null,
}
const OWNER_EMAILS = new Set([
 "cbrewsterart@gmail.com",
 "theeveryday.fun@gmail.com",
])
const OWNER_FREE_TOPUP_THRESHOLD = 1_000
const OWNER_FREE_TOPUP_AMOUNT = 10_000
const OWNER_SIM_DEFAULT_MONTHLY_PLAN: SubscriptionPlanId = "creator_plus"

const buildReferralCode = () => {
 const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
 let out = "VT"
 for (let i = 0; i < 8; i += 1) out += chars[Math.floor(Math.random() * chars.length)]
 return out
}

const normalizeEmail = (email: string): string => String(email || "").trim().toLowerCase()
export const isOwnerEmail = (email: string): boolean => OWNER_EMAILS.has(normalizeEmail(email))
export const setKnownUserEmail = (email: string): void => {
 if (typeof window === "undefined") return
 localStorage.setItem(KNOWN_USER_EMAIL_KEY, normalizeEmail(email))
}
const getKnownUserEmail = (): string => {
 if (typeof window === "undefined") return ""
 return normalizeEmail(localStorage.getItem(KNOWN_USER_EMAIL_KEY) || "")
}
const isOwnerMode = (): boolean => isOwnerEmail(getKnownUserEmail())
const isOwnerMeterSimulationEnabled = (): boolean => {
 if (typeof window === "undefined") return false
 const raw = localStorage.getItem(OWNER_METER_SIMULATION_KEY)
 if (raw === null) return true
 return raw !== "0" && raw !== "false"
}
const getOwnerSimulationPlan = (): PlanDefinition =>
 getPlanDefinition(OWNER_SIM_DEFAULT_MONTHLY_PLAN)

const toPeriodBounds = (now: Date) => {
 const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0))
 const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0))
 return { startIso: start.toISOString(), endIso: next.toISOString() }
}

const roundCreditUnits = (usd: number): number => Math.max(0, Math.ceil(usd * 100))
const safeNumber = (value: unknown, fallback = 0): number => {
 const n = Number(value)
 return Number.isFinite(n) ? n : fallback
}

const getPlanDefinition = (planId: SubscriptionPlanId): PlanDefinition =>
 PLAN_DEFINITIONS.find((plan) => plan.id === planId) || PLAN_DEFINITIONS[0]

const modelRatesFor = (modelId: string) => {
 const rates = GEMINI_MODEL_RATES_USD_PER_1K[modelId] || GEMINI_MODEL_RATES_USD_PER_1K["gemini-3-flash-preview"]
 return rates
}

const ensureCompatibilityFields = (state: EntitlementState): EntitlementState => ({
 ...state,
 tokenBalance: state.creditBalance,
 tokenMonthlyLimit: state.monthlyCreditGrant,
 tokenDailyAccrual: 0,
})

const applyOwnerOverride = (state: EntitlementState, now = new Date()): EntitlementState => {
 if (!isOwnerMode()) return state
 const simulationEnabled = isOwnerMeterSimulationEnabled()
 const simPlan = getOwnerSimulationPlan()
 const nextTier: LaunchTier = "large"
 const nextPlan: SubscriptionPlanId = "executive"
 const nextStatus: EntitlementState["status"] = "active"
 const nextGrant = simulationEnabled
  ? simPlan.monthlyCredits
  : Math.max(state.monthlyCreditGrant || 0, OWNER_FREE_TOPUP_AMOUNT)
 const nextCap = simulationEnabled ? simPlan.rolloverCap : Number.POSITIVE_INFINITY
 const nextBalance = simulationEnabled
  ? Math.max(0, Math.min(safeNumber(state.creditBalance, 0), nextCap))
  : Math.max(
   safeNumber(state.creditBalance, 0),
   OWNER_FREE_TOPUP_THRESHOLD + OWNER_FREE_TOPUP_AMOUNT,
  )
 const changed =
  state.tier !== nextTier ||
  state.subscriptionPlanId !== nextPlan ||
  state.status !== nextStatus ||
  state.monthlyCreditGrant !== nextGrant ||
  state.rolloverCap !== nextCap ||
  state.creditBalance !== nextBalance

 const next = ensureCompatibilityFields({
  ...state,
  tier: nextTier,
  subscriptionPlanId: nextPlan,
  status: nextStatus,
  monthlyCreditGrant: nextGrant,
  rolloverCap: nextCap,
  creditBalance: nextBalance,
  updatedAtIso: changed ? now.toISOString() : state.updatedAtIso,
 })
 return next
}

export const tierAtLeast = (current: LaunchTier, minimum: LaunchTier): boolean =>
 TIER_RANK[current] >= TIER_RANK[minimum]

export const resolveTierFromPlan = (planId: SubscriptionPlanId): LaunchTier =>
 getPlanDefinition(planId).tier

export const createDefaultEntitlement = (now = new Date()): EntitlementState => {
 const { startIso, endIso } = toPeriodBounds(now)
 return ensureCompatibilityFields({
  tier: "free",
  subscriptionPlanId: "basic",
  status: "inactive",
  creditBalance: 0,
  monthlyCreditGrant: 0,
  rolloverCap: 0,
  nextRefillIso: endIso,
  tokenBalance: 0,
  tokenMonthlyLimit: 0,
  tokenDailyAccrual: 0,
  tokenLastAccrualIso: startIso,
  currentPeriodStartIso: startIso,
  currentPeriodEndIso: endIso,
  referralCode: buildReferralCode(),
  referralCodeLocked: false,
  referralsConverted: 0,
  freeMonthsEarned: 0,
  freeMonthsApplied: 0,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  autoRechargeConfig: { ...DEFAULT_AUTO_RECHARGE },
  updatedAtIso: now.toISOString(),
 })
}

export const applyPlanToEntitlement = (
 previous: EntitlementState,
 planId: SubscriptionPlanId,
 now = new Date(),
): EntitlementState => {
 const plan = getPlanDefinition(planId)
 const { startIso, endIso } = toPeriodBounds(now)
 const rolled = Math.min(plan.rolloverCap, Math.max(0, safeNumber(previous.creditBalance, 0)))
 const toppedBalance = plan.tier === "free" ? 0 : Math.max(rolled, plan.monthlyCredits)

 return ensureCompatibilityFields({
  ...previous,
  tier: plan.tier,
  subscriptionPlanId: plan.id,
  status: plan.tier === "free" ? "inactive" : "active",
  creditBalance: toppedBalance,
  monthlyCreditGrant: plan.monthlyCredits,
  rolloverCap: plan.rolloverCap,
  nextRefillIso: endIso,
  currentPeriodStartIso: startIso,
  currentPeriodEndIso: endIso,
  updatedAtIso: now.toISOString(),
 })
}

export const reconcileEntitlementWindow = (
 state: EntitlementState,
 now = new Date(),
): EntitlementState => {
 const normalized = ensureCompatibilityFields({ ...state })
 const periodEnd = normalized.currentPeriodEndIso ? new Date(normalized.currentPeriodEndIso) : null
 if (normalized.tier === "free" || !periodEnd || now < periodEnd) return normalized

 const plan = getPlanDefinition(normalized.subscriptionPlanId)
 const { startIso, endIso } = toPeriodBounds(now)
 const rolled = Math.min(plan.rolloverCap, Math.max(0, normalized.creditBalance))
 const refillBalance = Math.min(plan.rolloverCap, rolled + plan.monthlyCredits)

 return ensureCompatibilityFields({
  ...normalized,
  creditBalance: refillBalance,
  monthlyCreditGrant: plan.monthlyCredits,
  rolloverCap: plan.rolloverCap,
  nextRefillIso: endIso,
  currentPeriodStartIso: startIso,
  currentPeriodEndIso: endIso,
  updatedAtIso: now.toISOString(),
 })
}

const serializeEntitlement = (state: EntitlementState): string => JSON.stringify(state)

const buildEntitlementFromRaw = (raw: string | null): EntitlementState => {
 if (!raw) return createDefaultEntitlement()
 const parsed = JSON.parse(raw) as Partial<EntitlementState>
 return ensureCompatibilityFields({
  ...createDefaultEntitlement(),
  ...parsed,
  autoRechargeConfig: {
   ...DEFAULT_AUTO_RECHARGE,
   ...(parsed.autoRechargeConfig || {}),
  },
  creditBalance: safeNumber(parsed.creditBalance ?? parsed.tokenBalance, 0),
  monthlyCreditGrant: safeNumber(parsed.monthlyCreditGrant ?? parsed.tokenMonthlyLimit, 0),
  rolloverCap: safeNumber(parsed.rolloverCap ?? parsed.tokenMonthlyLimit, 0),
 } as EntitlementState)
}

export const readStoredEntitlementRaw = (): EntitlementState => {
 try {
  return buildEntitlementFromRaw(localStorage.getItem(ENTITLEMENT_STORAGE_KEY))
 } catch {
  return createDefaultEntitlement()
 }
}

export const readCurrentEntitlement = (now = new Date()): EntitlementState =>
 applyOwnerOverride(reconcileEntitlementWindow(readStoredEntitlementRaw(), now), now)

export const writeStoredEntitlement = (state: EntitlementState): void => {
 const normalized = ensureCompatibilityFields(state)
 localStorage.setItem(ENTITLEMENT_STORAGE_KEY, serializeEntitlement(normalized))
 if (typeof window !== "undefined") {
  window.dispatchEvent(new CustomEvent(ENTITLEMENT_CHANGED_EVENT, { detail: normalized }))
 }
}

export const syncEntitlementIfDrifted = (now = new Date()): EntitlementState => {
 const raw = readStoredEntitlementRaw()
 const reconciled = applyOwnerOverride(reconcileEntitlementWindow(raw, now), now)
 if (serializeEntitlement(raw) !== serializeEntitlement(reconciled)) {
  writeStoredEntitlement(reconciled)
 }
 return reconciled
}

const readLedger = (): CreditLedgerEntry[] => {
 try {
  const raw = localStorage.getItem(ENTITLEMENT_LEDGER_KEY)
  if (!raw) return []
  const parsed = JSON.parse(raw)
  return Array.isArray(parsed) ? (parsed as CreditLedgerEntry[]) : []
 } catch {
  return []
 }
}

const writeLedger = (entries: CreditLedgerEntry[]) => {
 localStorage.setItem(ENTITLEMENT_LEDGER_KEY, JSON.stringify(entries.slice(-1500)))
}

const appendLedger = (entry: CreditLedgerEntry) => {
 const next = [...readLedger(), entry]
 writeLedger(next)
}

const newLedgerId = (): string =>
 `lg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`

export const getModelRates = (modelId: string) => modelRatesFor(modelId)

export const estimateMeterQuote = (
 request: MeterQuoteRequest,
 state = getCurrentEntitlement(),
): MeterQuoteResponse => {
 const inputTokens = Math.max(0, Math.floor(safeNumber(request.inputTokensEstimate, 0)))
 const outputTokens = Math.max(0, Math.floor(safeNumber(request.outputTokensEstimate, 0)))
 const rates = modelRatesFor(request.modelId)
 const rawCostUsd = (inputTokens / 1000) * rates.input + (outputTokens / 1000) * rates.output
 const meterCostUsd = rawCostUsd * MARKUP_MULTIPLIER
 const creditDebitEstimate = roundCreditUnits(meterCostUsd)

 return {
  modelId: request.modelId,
  inputTokensEstimate: inputTokens,
  outputTokensEstimate: outputTokens,
  rawCostUsd,
  meterCostUsd,
  markupMultiplier: MARKUP_MULTIPLIER,
  creditDebitEstimate,
  canRun:
   isOwnerMode() ||
   state.tier === "large" ||
   (state.tier !== "free" && state.creditBalance >= Math.max(1, creditDebitEstimate)),
  availableCredits: state.creditBalance,
 }
}

export const canAffordAiTokensFromState = (
 state: EntitlementState,
 units = 1,
): boolean => {
 if (isOwnerMode()) return true
 if (state.tier === "large") return true
 if (state.tier === "free") return false
 return state.creditBalance >= Math.max(1, Math.floor(units))
}

export const canAffordAiTokens = (units = 1): boolean =>
 canAffordAiTokensFromState(readCurrentEntitlement(), units)

export const applyMeterChargeEvent = (
 eventInput: Omit<MeterChargeEvent, "balanceBefore" | "balanceAfter" | "markupMultiplier" | "tsIso">,
 now = new Date(),
): { event: MeterChargeEvent; next: EntitlementState; allowed: boolean } => {
 const current = syncEntitlementIfDrifted(now)
 const ownerMode = isOwnerMode()
 const debit = Math.max(0, Math.floor(eventInput.creditDebit))
 let before = current.creditBalance

 if (current.tier === "free" && !ownerMode) {
  return {
   event: {
    ...eventInput,
    tsIso: now.toISOString(),
    markupMultiplier: MARKUP_MULTIPLIER,
    balanceBefore: before,
    balanceAfter: before,
   },
   next: current,
   allowed: false,
  }
 }

 if (!ownerMode && current.tier !== "large" && before < debit) {
  return {
   event: {
    ...eventInput,
    tsIso: now.toISOString(),
    markupMultiplier: MARKUP_MULTIPLIER,
    balanceBefore: before,
    balanceAfter: before,
   },
   next: current,
   allowed: false,
  }
 }

 const ownerSimulationEnabled = ownerMode && isOwnerMeterSimulationEnabled()
 if (ownerMode && !ownerSimulationEnabled && before < debit + OWNER_FREE_TOPUP_THRESHOLD) {
  before = before + OWNER_FREE_TOPUP_AMOUNT
  appendLedger({
   id: newLedgerId(),
   tsIso: now.toISOString(),
   type: "topup_credit",
   deltaCredits: OWNER_FREE_TOPUP_AMOUNT,
   balanceAfter: before,
   meta: { source: "owner_auto_topup", free: true },
  })
 }

 let after = current.tier === "large" && !ownerMode ? before : Math.max(0, before - debit)
 if (ownerSimulationEnabled && after <= 0) {
  const refill = getOwnerSimulationPlan().monthlyCredits
  after = refill
  appendLedger({
   id: newLedgerId(),
   tsIso: now.toISOString(),
   type: "monthly_refill",
   deltaCredits: refill,
   balanceAfter: after,
   meta: { source: "owner_sim_auto_refill" },
  })
 }
 if (ownerMode && !ownerSimulationEnabled && after < OWNER_FREE_TOPUP_THRESHOLD) {
  after += OWNER_FREE_TOPUP_AMOUNT
  appendLedger({
   id: newLedgerId(),
   tsIso: now.toISOString(),
   type: "topup_credit",
   deltaCredits: OWNER_FREE_TOPUP_AMOUNT,
   balanceAfter: after,
   meta: { source: "owner_auto_topup", free: true },
  })
 }
 const next = ensureCompatibilityFields({ ...current, creditBalance: after, updatedAtIso: now.toISOString() })
 writeStoredEntitlement(next)

 const event: MeterChargeEvent = {
  ...eventInput,
  tsIso: now.toISOString(),
  markupMultiplier: MARKUP_MULTIPLIER,
  balanceBefore: before,
  balanceAfter: after,
 }

 appendLedger({
  id: event.id,
  tsIso: event.tsIso,
  type: "usage_debit",
  deltaCredits: -debit,
  balanceAfter: after,
  meta: {
   modelId: event.modelId,
   inputTokens: event.inputTokens,
   outputTokens: event.outputTokens,
   rawCostUsd: Number(event.rawCostUsd.toFixed(8)),
   meterCostUsd: Number(event.meterCostUsd.toFixed(8)),
   reason: event.reason,
   fallbackApplied: event.fallbackApplied,
  },
 })

 return { event, next, allowed: true }
}

export const applyTopupCredits = (sku: string, now = new Date()): EntitlementState => {
 const topup = TOPUP_DEFINITIONS.find((item) => item.sku === sku)
 if (!topup) return syncEntitlementIfDrifted(now)
 const current = syncEntitlementIfDrifted(now)
 const next = ensureCompatibilityFields({
  ...current,
  creditBalance: current.creditBalance + topup.creditAmount,
  updatedAtIso: now.toISOString(),
 })
 writeStoredEntitlement(next)
 appendLedger({
  id: newLedgerId(),
  tsIso: now.toISOString(),
  type: "topup_credit",
  deltaCredits: topup.creditAmount,
  balanceAfter: next.creditBalance,
  meta: { sku: topup.sku, priceUsd: topup.priceUsd },
 })
 return next
}

export const applyCustomTopupCredits = (
 amountUsd: number,
 now = new Date(),
): { next: EntitlementState; creditsGranted: number; bonusCredits: number } => {
 const current = syncEntitlementIfDrifted(now)
 const normalizedAmount = Math.max(0, Number(amountUsd) || 0)
 const baseCredits = Math.floor(normalizedAmount * 1000)
 const bonusCredits = normalizedAmount >= 50 ? Math.floor(baseCredits * 0.25) : 0
 const creditsGranted = baseCredits + bonusCredits
 const nextBalance = safeNumber(current.creditBalance, 0) + creditsGranted
 const next = ensureCompatibilityFields({
  ...current,
  creditBalance: nextBalance,
  updatedAtIso: now.toISOString(),
 })
 writeStoredEntitlement(next)
 appendLedger({
  id: newLedgerId(),
  tsIso: now.toISOString(),
  type: "topup_credit",
  deltaCredits: creditsGranted,
  balanceAfter: nextBalance,
  meta: {
   source: "custom_topup",
   amountUsd: Number(normalizedAmount.toFixed(2)),
   bonusCredits,
  },
 })
 return { next, creditsGranted, bonusCredits }
}

export const simulateMeterUsage = (creditsToConsume: number, now = new Date()): EntitlementState => {
 const current = syncEntitlementIfDrifted(now)
 const debit = Math.max(0, Math.floor(creditsToConsume))
 const nextBalance = Math.max(0, safeNumber(current.creditBalance, 0) - debit)
 const next = ensureCompatibilityFields({
  ...current,
  creditBalance: nextBalance,
  updatedAtIso: now.toISOString(),
 })
 writeStoredEntitlement(next)
 appendLedger({
  id: newLedgerId(),
  tsIso: now.toISOString(),
  type: "usage_debit",
  deltaCredits: -debit,
  balanceAfter: nextBalance,
  meta: { source: "manual_meter_simulation" },
 })
 return next
}

export const simulateMeterRefill = (creditsToAdd: number, now = new Date()): EntitlementState => {
 const current = syncEntitlementIfDrifted(now)
 const delta = Math.max(0, Math.floor(creditsToAdd))
 const nextBalance = safeNumber(current.creditBalance, 0) + delta
 const next = ensureCompatibilityFields({
  ...current,
  creditBalance: nextBalance,
  updatedAtIso: now.toISOString(),
 })
 writeStoredEntitlement(next)
 appendLedger({
  id: newLedgerId(),
  tsIso: now.toISOString(),
  type: "topup_credit",
  deltaCredits: delta,
  balanceAfter: nextBalance,
  meta: { source: "manual_meter_refill" },
 })
 return next
}

export const getReferralCode = (): string => readCurrentEntitlement().referralCode

export const saveReferralRedemptionCode = (code: string): void => {
 localStorage.setItem(REFERRAL_REDEMPTION_KEY, String(code || "").trim().toUpperCase())
}

export const getReferralRedemptionCode = (): string =>
 String(localStorage.getItem(REFERRAL_REDEMPTION_KEY) || "").trim().toUpperCase()

export const consumeAiTokens = (units = 1): { next: EntitlementState; allowed: boolean } => {
 const current = syncEntitlementIfDrifted()
 if (isOwnerMode()) return { next: current, allowed: true }
 if (current.tier === "large") return { next: current, allowed: true }
 if (current.tier === "free") return { next: current, allowed: false }
 const debit = Math.max(1, Math.floor(units))
 if (current.creditBalance < debit) return { next: current, allowed: false }
 const next = ensureCompatibilityFields({
  ...current,
  creditBalance: current.creditBalance - debit,
  updatedAtIso: new Date().toISOString(),
 })
 writeStoredEntitlement(next)
 return { next, allowed: true }
}

export const updatePlanEntitlement = (planId: SubscriptionPlanId): EntitlementState => {
 const current = syncEntitlementIfDrifted()
 const next = applyPlanToEntitlement(current, planId)
 writeStoredEntitlement(next)
 return next
}

export const createCheckoutSession = async (
 payload: CheckoutSessionRequest,
): Promise<CheckoutSessionResponse> => {
 const configuredBase = import.meta.env.VITE_BILLING_API_BASE as string | undefined
 const inferredBase =
  typeof window !== "undefined" && window.location?.origin
   ? window.location.origin
   : ""
 const apiBase = String(configuredBase || inferredBase).trim()
 if (!apiBase) {
  throw new Error(
   "Billing API is not configured. Set VITE_BILLING_API_BASE or run with a valid window origin.",
  )
 }
 const checkoutUrl = `${apiBase.replace(/\/$/, "")}/billing/checkout-session`
 const response = await fetch(checkoutUrl, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
 })
 if (!response.ok) {
  if (response.status === 404 || response.status >= 500) {
   throw new Error(
    `Billing server unavailable at ${apiBase}. Start the billing server or update VITE_BILLING_API_BASE.`,
   )
  }
  throw new Error(`Checkout session creation failed (${response.status}).`)
 }
 return response.json() as Promise<CheckoutSessionResponse>
}

export const handleStripeWebhook = (event: StripeWebhookLikeEvent): EntitlementState => {
 const current = syncEntitlementIfDrifted()
 const metadata = event.data?.object?.metadata || {}

 if (event.type === "checkout.session.completed" || event.type === "invoice.paid") {
  if ((metadata.mode || "subscription") === "topup" && metadata.topupSku) {
   return applyTopupCredits(metadata.topupSku)
  }
  const planId = (metadata.planId || "creator_plus") as SubscriptionPlanId
  const next = applyPlanToEntitlement(current, planId)
  const withStripe = {
   ...next,
   stripeCustomerId: event.data?.object?.customer || next.stripeCustomerId,
   stripeSubscriptionId: event.data?.object?.subscription || next.stripeSubscriptionId,
  }
  writeStoredEntitlement(withStripe)
  appendLedger({
   id: newLedgerId(),
   tsIso: new Date().toISOString(),
   type: "monthly_refill",
   deltaCredits: withStripe.monthlyCreditGrant,
   balanceAfter: withStripe.creditBalance,
   meta: { planId },
  })
  return withStripe
 }

 if (event.type === "customer.subscription.deleted" || event.type === "invoice.payment_failed") {
  const downgraded = applyPlanToEntitlement(current, "basic")
  writeStoredEntitlement(downgraded)
  return downgraded
 }

 if (event.type === "referral.conversion") {
  const rewarded = {
   ...current,
   referralsConverted: current.referralsConverted + 1,
   freeMonthsEarned: current.freeMonthsEarned + 1,
   updatedAtIso: new Date().toISOString(),
  }
  writeStoredEntitlement(rewarded)
  return rewarded
 }

 return current
}

export async function fetchEntitlementFromServer(email: string): Promise<EntitlementState> {
 setKnownUserEmail(email)
 if (isOwnerEmail(email)) {
  const ownerState = syncEntitlementIfDrifted()
  writeStoredEntitlement(ownerState)
  return ownerState
 }
 const apiBase = (import.meta.env?.VITE_BILLING_API_BASE) as
  | string
  | undefined
 if (!apiBase) {
  throw new Error("VITE_BILLING_API_BASE is not configured")
 }
 const response = await fetch(
  `${apiBase.replace(/\/$/, "")}/billing/entitlement/${encodeURIComponent(email)}`,
 )
 if (!response.ok) {
  throw new Error(`Failed to fetch entitlement (${response.status})`)
 }
 const data = (await response.json()) as { userId: string; entitlement: EntitlementState | null }
 if (!data.entitlement) {
  throw new Error("Entitlement not found")
 }
 writeStoredEntitlement(buildEntitlementFromRaw(JSON.stringify(data.entitlement)))
 return readCurrentEntitlement()
}

// Backward-compatible aliases.
export const getStoredEntitlement = (): EntitlementState => readCurrentEntitlement()
export const setStoredEntitlement = (state: EntitlementState): void => writeStoredEntitlement(state)
export const getCurrentEntitlement = (): EntitlementState => readCurrentEntitlement()

export const entitlementStatesEqual = (a: EntitlementState, b: EntitlementState): boolean =>
 serializeEntitlement(a) === serializeEntitlement(b)

export const getMeterLedgerEntries = (): CreditLedgerEntry[] => readLedger()
export const getPlanDefinitions = (): PlanDefinition[] => [...PLAN_DEFINITIONS]

const sanitizeReferralCode = (raw: string): string =>
 String(raw || "")
  .toUpperCase()
  .replace(/[^A-Z0-9_-]/g, "")
  .slice(0, 24)

export const setCustomReferralCodeOnce = (
 rawCode: string,
 now = new Date(),
): { ok: boolean; reason?: string; state: EntitlementState } => {
 const current = syncEntitlementIfDrifted(now)
 if (current.referralCodeLocked) {
  return { ok: false, reason: "Referral code is already set and locked.", state: current }
 }
 const code = sanitizeReferralCode(rawCode)
 if (code.length < 4) {
  return { ok: false, reason: "Referral code must be at least 4 characters.", state: current }
 }
 const next = ensureCompatibilityFields({
  ...current,
  referralCode: code,
  referralCodeLocked: true,
  updatedAtIso: now.toISOString(),
 })
 writeStoredEntitlement(next)
 return { ok: true, state: next }
}
