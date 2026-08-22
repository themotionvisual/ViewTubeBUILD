import { AUTH_STORAGE_KEY, defaultAuthState } from "../context/GlobalDataContextTypes"
import {
  applyPlanToEntitlement,
  createDefaultEntitlement,
  getCurrentEntitlement,
  readStoredEntitlementRaw,
  setStoredEntitlement,
  TOPUP_DEFINITIONS,
  type EntitlementState,
} from "./billingEntitlement"
import { loadAiBrainContext, type AiBrainContext } from "./aiBrainContext"
import {
  readOnboardingState,
  type OnboardingState,
} from "./onboardingState"
import { SUBSCRIPTION_PLANS, type SubscriptionPlanId } from "./subscriptionPlans"
import { unifiedAuth } from "./auth/authSession"
import type { AuthState } from "../types"

const ACCOUNT_SIMULATION_STORAGE_KEY = "vt_account_simulation_v1"
const ACCOUNT_SIMULATION_PRESETS_KEY = "vt_account_simulation_presets_v1"
const SIGNUP_EMAIL_KEY = "vt_signup_email"
const KNOWN_USER_EMAIL_KEY = "vt_known_user_email"
const REFERRAL_REDEMPTION_KEY = "vt_referral_redemption_v1"
const ONBOARDING_STATE_KEY = "vt_onboarding_state_v1"
const AI_BRAIN_CONTEXT_KEY = "vt_ai_brain_context_v1"
const AI_BRAIN_CONTEXT_COMPLETED_KEY = "vt_ai_brain_context_completed_v1"
const AI_BRAIN_CONTEXT_DISMISSED_KEY = "vt_ai_brain_context_dismissed_v1"
const YT_ACCESS_TOKEN_KEY = "yt_access_token"
const YT_TOKEN_EXPIRY_KEY = "yt_token_expiry"
const YT_REFRESH_TOKEN_KEY = "yt_refresh_token"
const YT_LAST_SYNC_KEY = "yt_analytics_last_sync"

export type AccountSimulationCheckoutStatus =
  | "not_started"
  | "session_created"
  | "completed"
  | "payment_failed"
  | "canceled"

export type AccountSimulationBillingEvent =
  | "none"
  | "checkout.session.completed"
  | "invoice.paid"
  | "invoice.payment_failed"
  | "customer.subscription.deleted"
  | "topup_purchased"

export type AccountSimulationOauthStatus =
  | "disconnected"
  | "authenticated_unsynced"
  | "authenticated_synced"

export type AccountSimulationSyncStatus =
  | "not_started"
  | "ready_to_sync"
  | "synced"

export type AccountSimulationPresetId =
  | "new_basic_user"
  | "new_beta_user"
  | "new_paid_user_before_checkout"
  | "paid_user_after_successful_checkout"
  | "connected_but_not_synced"
  | "fully_onboarded_user"
  | "past_due_failed_payment_user"

export interface AccountSimulationState {
  scenarioId: string
  scenarioLabel: string
  signupEmail: string
  selectedPlanId: SubscriptionPlanId
  referralCode: string
  checkoutStatus: AccountSimulationCheckoutStatus
  billingEvent: AccountSimulationBillingEvent
  trialEligible: boolean
  oauthStatus: AccountSimulationOauthStatus
  syncStatus: AccountSimulationSyncStatus
  syncTimestamp: string | null
  channelName: string
  channelHandle: string
  channelThumbnail: string
  subscriberCount: number
  totalViews: number
  videoCount: number
  onboardingState: OnboardingState
  aiBrainContext: AiBrainContext
  entitlementSnapshot: EntitlementState
  lastAppliedAt: string | null
}

export interface AccountSimulationPreset {
  id: string
  label: string
  builtIn: boolean
  state: AccountSimulationState
}

export interface AccountSimulationChecklist {
  emailCaptured: boolean
  planSelected: boolean
  referralStepCompleted: boolean
  accountActivated: boolean
  billingConfirmed: boolean
  authConnected: boolean
  firstSyncReady: boolean
  firstSyncCompleted: boolean
  aiBrainCompleted: boolean
}

export interface AccountSimulationLocalStateSnapshot {
  signupEmail: string
  knownUserEmail: string
  referralCode: string
  authState: AuthState
  onboardingState: OnboardingState
  aiBrainContext: AiBrainContext
  entitlementState: EntitlementState
  authToken: { accessToken: string; expiresAt: string } | null
  lastSyncTimestamp: string | null
  checkoutBoundary: {
    selectedPlanId: SubscriptionPlanId
    checkoutStatus: AccountSimulationCheckoutStatus
    billingEvent: AccountSimulationBillingEvent
    trialEligible: boolean
  }
}

const DEFAULT_CHANNEL = {
  channelName: "Verse ViewTubeX",
  channelHandle: "@verseviewtubex",
  channelThumbnail:
    "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=240&q=80",
  subscriberCount: 18420,
  totalViews: 912340,
  videoCount: 138,
}

const DEFAULT_ONBOARDING_STATE: OnboardingState = {
  emailCaptured: false,
  planSelected: false,
  referralStepCompleted: false,
  accountActivated: false,
  billingConfirmed: false,
  firstToolOpened: false,
  checklistDismissed: false,
}

const DEFAULT_AI_BRAIN_CONTEXT: AiBrainContext = {
  channelDescription: "",
  mainTopicFocus: "",
  audienceDescription: "",
  successDefinition: "",
  mainYoutubeGoal: "",
  recurringSeriesName: "",
  recurringSeriesDescription: "",
  biggestWeakness: "",
  mostSuccessfulVideo: "",
  signupReason: "",
  whatNext: "",
  primaryGoal: "views",
  audienceNiche: "",
  oneMonthGoals: [],
  completedAt: null,
  deferredAt: null,
  updatedAt: null,
  source: "system",
  version: 2,
}

const nowIso = () => new Date().toISOString()

const cloneOnboardingState = (state?: Partial<OnboardingState>): OnboardingState => ({
  ...DEFAULT_ONBOARDING_STATE,
  ...(state || {}),
})

const cloneAiBrainContext = (context?: Partial<AiBrainContext>): AiBrainContext => ({
  ...DEFAULT_AI_BRAIN_CONTEXT,
  ...(context || {}),
})

const normalizeEmail = (email: string): string => String(email || "").trim().toLowerCase()

const normalizeHandle = (handle: string): string => {
  const trimmed = String(handle || "").trim()
  if (!trimmed) return DEFAULT_CHANNEL.channelHandle
  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`
}

const topupCreditsForEvent = (): number =>
  TOPUP_DEFINITIONS.find((item) => item.sku === "topup_10")?.creditAmount || 18_000

const deriveEntitlementSnapshot = (
  selectedPlanId: SubscriptionPlanId,
  checkoutStatus: AccountSimulationCheckoutStatus,
  billingEvent: AccountSimulationBillingEvent,
  now = new Date(),
): EntitlementState => {
  let next = createDefaultEntitlement(now)
  const isFreePlan = selectedPlanId === "basic" || selectedPlanId === "beta"
  const isPaidActivated =
    checkoutStatus === "completed" ||
    billingEvent === "checkout.session.completed" ||
    billingEvent === "invoice.paid"

  if (isFreePlan) {
    next = applyPlanToEntitlement(next, selectedPlanId, now)
  } else if (isPaidActivated) {
    next = applyPlanToEntitlement(next, selectedPlanId, now)
  }

  if (billingEvent === "invoice.payment_failed" || billingEvent === "customer.subscription.deleted") {
    next = applyPlanToEntitlement(next, "basic", now)
  }

  if (billingEvent === "topup_purchased" && next.tier !== "free") {
    const extraCredits = topupCreditsForEvent()
    next = {
      ...next,
      creditBalance: Number(next.creditBalance || 0) + extraCredits,
      tokenBalance: Number(next.tokenBalance || 0) + extraCredits,
      updatedAtIso: now.toISOString(),
    }
  }

  return next
}

const deriveSyncStatus = (
  oauthStatus: AccountSimulationOauthStatus,
  syncTimestamp: string | null,
): AccountSimulationSyncStatus => {
  if (oauthStatus === "disconnected") return "not_started"
  return syncTimestamp ? "synced" : "ready_to_sync"
}

const deriveAuthState = (
  state: AccountSimulationState,
): AuthState => {
  const syncedAt = state.oauthStatus === "authenticated_synced" ? state.syncTimestamp : null
  const fastAnalytics =
    state.oauthStatus === "authenticated_synced" && state.syncTimestamp
      ? {
          lifetimeRevenue: 12450,
          lifetimeWatchMinutes: 483200,
          lifetimeViews: state.totalViews,
          subscribers28d: 521,
          lastSyncedAt: state.syncTimestamp,
        }
      : undefined

  return {
    isAuthenticated: state.oauthStatus !== "disconnected",
    channelName:
      state.oauthStatus === "disconnected" ? null : String(state.channelName || DEFAULT_CHANNEL.channelName),
    channelHandle:
      state.oauthStatus === "disconnected" ? null : normalizeHandle(state.channelHandle),
    channelThumbnail:
      state.oauthStatus === "disconnected" ? null : String(state.channelThumbnail || DEFAULT_CHANNEL.channelThumbnail),
    subscriberCount:
      state.oauthStatus === "disconnected" ? null : Number(state.subscriberCount || 0),
    totalViews:
      state.oauthStatus === "disconnected" ? null : Number(state.totalViews || 0),
    videoCount:
      state.oauthStatus === "disconnected" ? null : Number(state.videoCount || 0),
    syncedAt,
    fastAnalytics,
  }
}

const buildDummyAccessToken = (email: string): string => {
  const seed = normalizeEmail(email) || "sim-user"
  return `sim_${seed.replace(/[^a-z0-9]/g, "_")}_oauth_token`
}

const buildSimulationOnboarding = (
  prev: OnboardingState,
  state: {
    signupEmail: string
    selectedPlanId: SubscriptionPlanId
    referralCode: string
    oauthStatus: AccountSimulationOauthStatus
    entitlementSnapshot: EntitlementState
  },
): OnboardingState => ({
  ...cloneOnboardingState(prev),
  emailCaptured: normalizeEmail(state.signupEmail).length > 0,
  planSelected: Boolean(state.selectedPlanId),
  referralStepCompleted: prev.referralStepCompleted || state.referralCode.trim().length > 0,
  accountActivated:
    prev.accountActivated ||
    state.selectedPlanId === "basic" ||
    state.selectedPlanId === "beta" ||
    state.entitlementSnapshot.subscriptionPlanId !== "basic" ||
    state.oauthStatus !== "disconnected",
  billingConfirmed:
    prev.billingConfirmed ||
    state.selectedPlanId === "basic" ||
    state.selectedPlanId === "beta" ||
    state.entitlementSnapshot.subscriptionPlanId !== "basic",
  firstToolOpened: prev.firstToolOpened,
  checklistDismissed: prev.checklistDismissed,
})

export const createDefaultAccountSimulationState = (
  overrides: Partial<AccountSimulationState> = {},
  now = new Date(),
): AccountSimulationState => {
  const selectedPlanId = overrides.selectedPlanId || "basic"
  const signupEmail = normalizeEmail(overrides.signupEmail || "verse-tester@viewtube.local")
  const referralCode = String(overrides.referralCode || "").trim().toUpperCase()
  const aiBrainContext = cloneAiBrainContext(overrides.aiBrainContext)
  const initial: AccountSimulationState = {
    scenarioId: overrides.scenarioId || "sandbox",
    scenarioLabel: overrides.scenarioLabel || "Sandbox Scenario",
    signupEmail,
    selectedPlanId,
    referralCode,
    checkoutStatus: overrides.checkoutStatus || "not_started",
    billingEvent: overrides.billingEvent || "none",
    trialEligible: overrides.trialEligible ?? true,
    oauthStatus: overrides.oauthStatus || "disconnected",
    syncStatus: overrides.syncStatus || "not_started",
    syncTimestamp: overrides.syncTimestamp || null,
    channelName: overrides.channelName || DEFAULT_CHANNEL.channelName,
    channelHandle: normalizeHandle(overrides.channelHandle || DEFAULT_CHANNEL.channelHandle),
    channelThumbnail: overrides.channelThumbnail || DEFAULT_CHANNEL.channelThumbnail,
    subscriberCount: Number(overrides.subscriberCount ?? DEFAULT_CHANNEL.subscriberCount),
    totalViews: Number(overrides.totalViews ?? DEFAULT_CHANNEL.totalViews),
    videoCount: Number(overrides.videoCount ?? DEFAULT_CHANNEL.videoCount),
    onboardingState: cloneOnboardingState(overrides.onboardingState),
    aiBrainContext,
    entitlementSnapshot: overrides.entitlementSnapshot || createDefaultEntitlement(now),
    lastAppliedAt: overrides.lastAppliedAt || null,
  }
  return synchronizeAccountSimulationState(initial, now)
}

export const synchronizeAccountSimulationState = (
  input: AccountSimulationState,
  now = new Date(),
): AccountSimulationState => {
  const signupEmail = normalizeEmail(input.signupEmail)
  const aiBrainContext = cloneAiBrainContext(input.aiBrainContext)
  if (!aiBrainContext.completedAt && input.onboardingState?.billingConfirmed && aiBrainContext.whatNext.trim()) {
    aiBrainContext.completedAt = now.toISOString()
  }

  const syncTimestamp =
    input.oauthStatus === "authenticated_synced"
      ? input.syncTimestamp || now.toISOString()
      : null
  const syncStatus = deriveSyncStatus(input.oauthStatus, syncTimestamp)
  const entitlementSnapshot = deriveEntitlementSnapshot(
    input.selectedPlanId,
    input.checkoutStatus,
    input.billingEvent,
    now,
  )
  const onboardingState = buildSimulationOnboarding(cloneOnboardingState(input.onboardingState), {
    signupEmail,
    selectedPlanId: input.selectedPlanId,
    referralCode: String(input.referralCode || "").trim().toUpperCase(),
    oauthStatus: input.oauthStatus,
    entitlementSnapshot,
  })

  if (input.oauthStatus !== "disconnected" && input.selectedPlanId !== "basic") {
    onboardingState.accountActivated = true
  }
  if (input.selectedPlanId === "basic" || input.selectedPlanId === "beta") {
    onboardingState.billingConfirmed = true
  }
  if (aiBrainContext.completedAt) {
    onboardingState.firstToolOpened = input.onboardingState.firstToolOpened
  }

  return {
    ...input,
    signupEmail,
    referralCode: String(input.referralCode || "").trim().toUpperCase(),
    channelHandle: normalizeHandle(input.channelHandle),
    syncTimestamp,
    syncStatus,
    onboardingState,
    aiBrainContext,
    entitlementSnapshot,
  }
}

const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export const loadAccountSimulationState = (): AccountSimulationState => {
  const fallback = createDefaultAccountSimulationState()
  const raw = readJson<Partial<AccountSimulationState>>(ACCOUNT_SIMULATION_STORAGE_KEY, fallback)
  return synchronizeAccountSimulationState({
    ...fallback,
    ...raw,
    onboardingState: cloneOnboardingState(raw.onboardingState),
    aiBrainContext: cloneAiBrainContext(raw.aiBrainContext),
    entitlementSnapshot: raw.entitlementSnapshot || fallback.entitlementSnapshot,
  })
}

export const saveAccountSimulationState = (state: AccountSimulationState): AccountSimulationState => {
  const next = synchronizeAccountSimulationState(state)
  localStorage.setItem(ACCOUNT_SIMULATION_STORAGE_KEY, JSON.stringify(next))
  return next
}

export const resetAccountSimulationState = (): AccountSimulationState => {
  localStorage.removeItem(ACCOUNT_SIMULATION_STORAGE_KEY)
  return createDefaultAccountSimulationState()
}

const buildPreset = (
  id: AccountSimulationPresetId,
  label: string,
  overrides: Partial<AccountSimulationState>,
): AccountSimulationPreset => ({
  id,
  label,
  builtIn: true,
  state: createDefaultAccountSimulationState({
    scenarioId: id,
    scenarioLabel: label,
    ...overrides,
  }),
})

export const getBuiltInAccountSimulationPresets = (): AccountSimulationPreset[] => {
  const paidContext = {
    signupEmail: "newpaid@verseviewtube.test",
    selectedPlanId: "creator_plus" as SubscriptionPlanId,
    referralCode: "VERSE25",
  }
  return [
    buildPreset("new_basic_user", "New Basic User", {
      signupEmail: "basic@verseviewtube.test",
      selectedPlanId: "basic",
      billingEvent: "none",
      checkoutStatus: "not_started",
    }),
    buildPreset("new_beta_user", "New Beta User", {
      signupEmail: "beta@verseviewtube.test",
      selectedPlanId: "beta",
      billingEvent: "none",
      checkoutStatus: "not_started",
    }),
    buildPreset("new_paid_user_before_checkout", "New Paid User Before Checkout", {
      ...paidContext,
      checkoutStatus: "session_created",
    }),
    buildPreset("paid_user_after_successful_checkout", "Paid User After Successful Checkout", {
      ...paidContext,
      checkoutStatus: "completed",
      billingEvent: "checkout.session.completed",
    }),
    buildPreset("connected_but_not_synced", "Connected But Not Synced", {
      ...paidContext,
      checkoutStatus: "completed",
      billingEvent: "invoice.paid",
      oauthStatus: "authenticated_unsynced",
      onboardingState: {
        ...DEFAULT_ONBOARDING_STATE,
        emailCaptured: true,
        planSelected: true,
        referralStepCompleted: true,
        accountActivated: true,
        billingConfirmed: true,
      },
    }),
    buildPreset("fully_onboarded_user", "Fully Onboarded User", {
      ...paidContext,
      checkoutStatus: "completed",
      billingEvent: "invoice.paid",
      oauthStatus: "authenticated_synced",
      syncTimestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      onboardingState: {
        ...DEFAULT_ONBOARDING_STATE,
        emailCaptured: true,
        planSelected: true,
        referralStepCompleted: true,
        accountActivated: true,
        billingConfirmed: true,
        firstToolOpened: true,
      },
      aiBrainContext: {
        ...DEFAULT_AI_BRAIN_CONTEXT,
        whatNext: "Build weekly content reports and improve retention.",
        primaryGoal: "retention",
        audienceNiche: "Creator education and growth systems",
        completedAt: new Date().toISOString(),
      },
    }),
    buildPreset("past_due_failed_payment_user", "Past-Due / Failed Payment User", {
      ...paidContext,
      checkoutStatus: "payment_failed",
      billingEvent: "invoice.payment_failed",
      oauthStatus: "authenticated_unsynced",
    }),
  ]
}

const readCustomPresetEntries = (): AccountSimulationPreset[] => {
  const entries = readJson<AccountSimulationPreset[]>(ACCOUNT_SIMULATION_PRESETS_KEY, [])
  return Array.isArray(entries)
    ? entries.map((entry) => ({
        ...entry,
        builtIn: false,
        state: synchronizeAccountSimulationState(entry.state),
      }))
    : []
}

const writeCustomPresetEntries = (presets: AccountSimulationPreset[]) => {
  localStorage.setItem(ACCOUNT_SIMULATION_PRESETS_KEY, JSON.stringify(presets))
}

export const loadCustomAccountSimulationPresets = (): AccountSimulationPreset[] =>
  readCustomPresetEntries()

export const saveCustomAccountSimulationPreset = (
  label: string,
  state: AccountSimulationState,
): AccountSimulationPreset => {
  const preset: AccountSimulationPreset = {
    id: `custom_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    label: String(label || "Custom Scenario").trim() || "Custom Scenario",
    builtIn: false,
    state: synchronizeAccountSimulationState({
      ...state,
      scenarioId: `custom_${Date.now().toString(36)}`,
      scenarioLabel: String(label || "Custom Scenario").trim() || "Custom Scenario",
    }),
  }
  const next = [...readCustomPresetEntries(), preset]
  writeCustomPresetEntries(next)
  return preset
}

export const deleteCustomAccountSimulationPreset = (presetId: string): AccountSimulationPreset[] => {
  const next = readCustomPresetEntries().filter((entry) => entry.id !== presetId)
  writeCustomPresetEntries(next)
  return next
}

export const deriveFlowChecklist = (
  state: AccountSimulationState,
): AccountSimulationChecklist => ({
  emailCaptured: Boolean(state.onboardingState.emailCaptured),
  planSelected: Boolean(state.onboardingState.planSelected),
  referralStepCompleted: Boolean(state.onboardingState.referralStepCompleted),
  accountActivated: Boolean(state.onboardingState.accountActivated),
  billingConfirmed: Boolean(state.onboardingState.billingConfirmed),
  authConnected: state.oauthStatus !== "disconnected",
  firstSyncReady: state.oauthStatus === "authenticated_unsynced",
  firstSyncCompleted: state.oauthStatus === "authenticated_synced" && Boolean(state.syncTimestamp),
  aiBrainCompleted: Boolean(state.aiBrainContext.completedAt),
})

export const buildSimulationLocalStateSnapshot = (
  state: AccountSimulationState,
): AccountSimulationLocalStateSnapshot => {
  const normalized = synchronizeAccountSimulationState(state)
  const signupEmail = normalizeEmail(normalized.signupEmail)
  const knownUserEmail = signupEmail
  const authState = deriveAuthState(normalized)
  return {
    signupEmail,
    knownUserEmail,
    referralCode: normalized.referralCode,
    authState,
    onboardingState: cloneOnboardingState(normalized.onboardingState),
    aiBrainContext: cloneAiBrainContext(normalized.aiBrainContext),
    entitlementState: normalized.entitlementSnapshot,
    authToken:
      normalized.oauthStatus === "disconnected"
        ? null
        : {
            accessToken: buildDummyAccessToken(signupEmail),
            expiresAt: String(Date.now() + 60 * 60 * 1000),
          },
    lastSyncTimestamp: normalized.syncTimestamp,
    checkoutBoundary: {
      selectedPlanId: normalized.selectedPlanId,
      checkoutStatus: normalized.checkoutStatus,
      billingEvent: normalized.billingEvent,
      trialEligible: normalized.trialEligible,
    },
  }
}

export const applySimulationToRealState = (
  state: AccountSimulationState,
): AccountSimulationLocalStateSnapshot => {
  const snapshot = buildSimulationLocalStateSnapshot(state)
  localStorage.setItem(SIGNUP_EMAIL_KEY, snapshot.signupEmail)
  localStorage.setItem(KNOWN_USER_EMAIL_KEY, snapshot.knownUserEmail)
  localStorage.setItem(REFERRAL_REDEMPTION_KEY, snapshot.referralCode)
  localStorage.setItem(ONBOARDING_STATE_KEY, JSON.stringify(snapshot.onboardingState))
  localStorage.setItem(AI_BRAIN_CONTEXT_KEY, JSON.stringify(snapshot.aiBrainContext))

  if (snapshot.aiBrainContext.completedAt) {
    localStorage.setItem(AI_BRAIN_CONTEXT_COMPLETED_KEY, "true")
    localStorage.removeItem(AI_BRAIN_CONTEXT_DISMISSED_KEY)
  } else {
    localStorage.removeItem(AI_BRAIN_CONTEXT_COMPLETED_KEY)
    localStorage.removeItem(AI_BRAIN_CONTEXT_DISMISSED_KEY)
  }

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(snapshot.authState))
  setStoredEntitlement(snapshot.entitlementState)

  if (snapshot.authToken) {
    localStorage.setItem(YT_ACCESS_TOKEN_KEY, snapshot.authToken.accessToken)
    localStorage.setItem(YT_TOKEN_EXPIRY_KEY, snapshot.authToken.expiresAt)
  } else {
    localStorage.removeItem(YT_ACCESS_TOKEN_KEY)
    localStorage.removeItem(YT_TOKEN_EXPIRY_KEY)
    localStorage.removeItem(YT_REFRESH_TOKEN_KEY)
  }

  if (snapshot.lastSyncTimestamp) {
    localStorage.setItem(YT_LAST_SYNC_KEY, snapshot.lastSyncTimestamp)
  } else {
    localStorage.removeItem(YT_LAST_SYNC_KEY)
  }

  saveAccountSimulationState({
    ...state,
    lastAppliedAt: nowIso(),
  })
  return snapshot
}

export const resetRealAccountSimulationState = (): void => {
  localStorage.removeItem(SIGNUP_EMAIL_KEY)
  localStorage.removeItem(KNOWN_USER_EMAIL_KEY)
  localStorage.removeItem(REFERRAL_REDEMPTION_KEY)
  localStorage.removeItem(ONBOARDING_STATE_KEY)
  localStorage.removeItem(AI_BRAIN_CONTEXT_KEY)
  localStorage.removeItem(AI_BRAIN_CONTEXT_COMPLETED_KEY)
  localStorage.removeItem(AI_BRAIN_CONTEXT_DISMISSED_KEY)
  localStorage.removeItem(AUTH_STORAGE_KEY)
  localStorage.removeItem(YT_LAST_SYNC_KEY)
  unifiedAuth.logout()
  setStoredEntitlement(createDefaultEntitlement())
}

export const importRealStateIntoSimulation = (): AccountSimulationState => {
  const authState = readJson<AuthState>(AUTH_STORAGE_KEY, defaultAuthState)
  const entitlement = readStoredEntitlementRaw()
  const onboardingState = cloneOnboardingState(readOnboardingState())
  const aiBrainContext = cloneAiBrainContext(loadAiBrainContext())
  const signupEmail = normalizeEmail(localStorage.getItem(SIGNUP_EMAIL_KEY) || localStorage.getItem(KNOWN_USER_EMAIL_KEY) || "imported@viewtube.local")
  const referralCode = String(localStorage.getItem(REFERRAL_REDEMPTION_KEY) || "").trim().toUpperCase()
  const syncTimestamp = authState.fastAnalytics?.lastSyncedAt || authState.syncedAt || localStorage.getItem(YT_LAST_SYNC_KEY)
  const oauthStatus: AccountSimulationOauthStatus = authState.isAuthenticated
    ? syncTimestamp
      ? "authenticated_synced"
      : "authenticated_unsynced"
    : "disconnected"

  const selectedPlanId = SUBSCRIPTION_PLANS.some((plan) => plan.id === entitlement.subscriptionPlanId)
    ? entitlement.subscriptionPlanId
    : "basic"

  const billingEvent: AccountSimulationBillingEvent =
    entitlement.subscriptionPlanId === "basic"
      ? "none"
      : entitlement.status === "past_due"
        ? "invoice.payment_failed"
        : "invoice.paid"

  const checkoutStatus: AccountSimulationCheckoutStatus =
    entitlement.subscriptionPlanId === "basic"
      ? "not_started"
      : entitlement.status === "active"
        ? "completed"
        : "payment_failed"

  return synchronizeAccountSimulationState({
    scenarioId: "imported_real_state",
    scenarioLabel: "Imported Real Local State",
    signupEmail,
    selectedPlanId,
    referralCode,
    checkoutStatus,
    billingEvent,
    trialEligible: true,
    oauthStatus,
    syncStatus: deriveSyncStatus(oauthStatus, syncTimestamp),
    syncTimestamp,
    channelName: authState.channelName || DEFAULT_CHANNEL.channelName,
    channelHandle: authState.channelHandle || DEFAULT_CHANNEL.channelHandle,
    channelThumbnail: authState.channelThumbnail || DEFAULT_CHANNEL.channelThumbnail,
    subscriberCount: Number(authState.subscriberCount || DEFAULT_CHANNEL.subscriberCount),
    totalViews: Number(authState.totalViews || DEFAULT_CHANNEL.totalViews),
    videoCount: Number(authState.videoCount || DEFAULT_CHANNEL.videoCount),
    onboardingState,
    aiBrainContext,
    entitlementSnapshot: getCurrentEntitlement(),
    lastAppliedAt: null,
  })
}
