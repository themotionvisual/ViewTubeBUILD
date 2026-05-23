import { hasCompletedAiBrainContext } from "./aiBrainContext"

const STORAGE_KEY = "vt_onboarding_state_v1"

export type OnboardingState = {
  emailCaptured: boolean
  planSelected: boolean
  referralStepCompleted: boolean
  accountActivated: boolean
  billingConfirmed: boolean
  firstToolOpened: boolean
  checklistDismissed: boolean
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

export const readOnboardingState = (): OnboardingState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_ONBOARDING_STATE
    const parsed = JSON.parse(raw) as Partial<OnboardingState>
    return {
      emailCaptured: Boolean(parsed.emailCaptured),
      planSelected: Boolean(parsed.planSelected),
      referralStepCompleted: Boolean(parsed.referralStepCompleted),
      accountActivated: Boolean(parsed.accountActivated),
      billingConfirmed: Boolean(parsed.billingConfirmed),
      firstToolOpened: Boolean(parsed.firstToolOpened),
      checklistDismissed: Boolean(parsed.checklistDismissed),
    }
  } catch {
    return DEFAULT_ONBOARDING_STATE
  }
}

export const updateOnboardingState = (updates: Partial<OnboardingState>): OnboardingState => {
  const next = { ...readOnboardingState(), ...updates }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}

export const resetOnboardingState = (): void => {
  localStorage.removeItem(STORAGE_KEY)
}

export const getSyncTimestamp = (authState: {
  syncedAt?: string | null
  fastAnalytics?: { lastSyncedAt?: string | null } | null
}): number | null => {
  const fromAuth = String(authState?.syncedAt || "").trim()
  if (fromAuth) {
    const ts = new Date(fromAuth).getTime()
    if (Number.isFinite(ts)) return ts
  }

  const fromFast = String(authState?.fastAnalytics?.lastSyncedAt || "").trim()
  if (fromFast) {
    const ts = new Date(fromFast).getTime()
    if (Number.isFinite(ts)) return ts
  }

  const fromCache = String(localStorage.getItem("yt_analytics_last_sync") || "").trim()
  if (fromCache) {
    const ts = new Date(fromCache).getTime()
    if (Number.isFinite(ts)) return ts
  }

  return null
}

export const formatSyncLabel = (timestamp: number | null): string => {
  if (!timestamp) return "Not connected"
  const diffMs = Math.max(0, Date.now() - timestamp)
  const mins = Math.max(1, Math.round(diffMs / 60000))
  return `Synced ${mins} min ago`
}

export const hasFirstSync = (authState: {
  isAuthenticated?: boolean
  syncedAt?: string | null
  fastAnalytics?: { lastSyncedAt?: string | null } | null
}): boolean => {
  if (!authState?.isAuthenticated) return false
  return Boolean(getSyncTimestamp(authState))
}

export const resolvePrimaryAuthAction = (authState: {
  isAuthenticated?: boolean
  syncedAt?: string | null
  fastAnalytics?: { lastSyncedAt?: string | null } | null
}): "Connect Channel" | "Run First Sync" | "Sync Now" => {
  if (!authState?.isAuthenticated) return "Connect Channel"
  if (!hasFirstSync(authState)) return "Run First Sync"
  return "Sync Now"
}

export const isChecklistComplete = (input: {
  authConnected: boolean
  hasFirstSync: boolean
  billingConfirmed: boolean
  hasBrainIntake: boolean
  firstToolOpened: boolean
}): boolean =>
  input.authConnected &&
  input.hasFirstSync &&
  input.billingConfirmed &&
  input.hasBrainIntake &&
  input.firstToolOpened

export const hasBrainIntakeCompleted = (): boolean => hasCompletedAiBrainContext()
