import {
  ANONYMOUS_ACCOUNT_SNAPSHOT,
  sanitizeInternalReturnTo,
  type AccountIntent,
  type UnifiedAccountSnapshot,
} from "./accountContracts"

const SNAPSHOT_CACHE_KEY = "vt_unified_account_snapshot_v1"

const configuredBase = (): string =>
  String(import.meta.env.VITE_ACCOUNT_API_BASE || import.meta.env.VITE_BILLING_API_BASE || "").replace(/\/$/, "")

export const isUnifiedAccountServerEnabled = (): boolean =>
  String(import.meta.env.VITE_UNIFIED_ACCOUNT_ENABLED || "false") === "true"

export const accountUrl = (path: string): string => `${configuredBase()}${path}`

const readJson = async <T>(response: Response): Promise<T> => {
  const payload = (await response.json().catch(() => null)) as T | { error?: string } | null
  if (!response.ok) {
    const message = payload && typeof payload === "object" && "error" in payload
      ? String(payload.error || "Account request failed.")
      : `Account request failed (${response.status}).`
    throw new Error(message)
  }
  return payload as T
}

export const readCachedAccountSnapshot = (): UnifiedAccountSnapshot => {
  if (typeof window === "undefined") return ANONYMOUS_ACCOUNT_SNAPSHOT
  try {
    const raw = localStorage.getItem(SNAPSHOT_CACHE_KEY)
    if (!raw) return ANONYMOUS_ACCOUNT_SNAPSHOT
    const parsed = JSON.parse(raw) as UnifiedAccountSnapshot
    return {
      ...ANONYMOUS_ACCOUNT_SNAPSHOT,
      ...parsed,
      authentication: {
        ...ANONYMOUS_ACCOUNT_SNAPSHOT.authentication,
        ...parsed.authentication,
        status: "anonymous",
        accountExists: Boolean(parsed.viewtubeUserId || parsed.authentication?.accountExists),
      },
      google: {
        ...ANONYMOUS_ACCOUNT_SNAPSHOT.google,
        ...parsed.google,
        status: parsed.google?.status === "revoked" ? "revoked" : "disconnected",
        youtubeScopesGranted: false,
      },
      nextIntent: parsed.viewtubeUserId ? "log_in" : "sign_up",
    }
  } catch {
    return ANONYMOUS_ACCOUNT_SNAPSHOT
  }
}

export const cacheAccountSnapshot = (snapshot: UnifiedAccountSnapshot): void => {
  if (typeof window === "undefined") return
  const safeSnapshot: UnifiedAccountSnapshot = {
    ...snapshot,
    error: null,
  }
  localStorage.setItem(SNAPSHOT_CACHE_KEY, JSON.stringify(safeSnapshot))
}

export const clearCachedAccountSession = (): void => {
  if (typeof window === "undefined") return
  const cached = readCachedAccountSnapshot()
  cacheAccountSnapshot({
    ...ANONYMOUS_ACCOUNT_SNAPSHOT,
    viewtubeUserId: cached.viewtubeUserId,
    authentication: {
      status: "anonymous",
      accountExists: Boolean(cached.viewtubeUserId),
    },
    nextIntent: cached.viewtubeUserId ? "log_in" : "sign_up",
  })
}

export const fetchUnifiedAccountSnapshot = async (): Promise<UnifiedAccountSnapshot> => {
  if (!isUnifiedAccountServerEnabled()) return readCachedAccountSnapshot()
  const response = await fetch(accountUrl("/api/account/snapshot"), {
    credentials: "include",
    headers: { Accept: "application/json" },
  })
  const snapshot = await readJson<UnifiedAccountSnapshot>(response)
  cacheAccountSnapshot(snapshot)
  return snapshot
}

export const beginAccountIntent = async (
  intent: AccountIntent,
  returnTo = typeof window !== "undefined"
    ? `${window.location.pathname}${window.location.search}${window.location.hash}`
    : "/account",
): Promise<void> => {
  if (intent === "manage_account") {
    if (typeof window !== "undefined") window.location.assign("/account")
    return
  }

  if (!isUnifiedAccountServerEnabled()) {
    throw new Error("UNIFIED_ACCOUNT_SERVER_DISABLED")
  }

  const response = await fetch(accountUrl("/api/account/auth/start"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      intent,
      returnTo: sanitizeInternalReturnTo(returnTo),
    }),
  })
  const payload = await readJson<{ authorizationUrl: string }>(response)
  if (!payload.authorizationUrl) throw new Error("Google authorization URL was not returned.")
  window.location.assign(payload.authorizationUrl)
}

export const signOutUnifiedAccount = async (): Promise<void> => {
  if (isUnifiedAccountServerEnabled()) {
    const response = await fetch(accountUrl("/api/account/sign-out"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    })
    await readJson<{ ok: boolean }>(response)
  }
  clearCachedAccountSession()
}

export const revokeUnifiedGoogleConnection = async (): Promise<UnifiedAccountSnapshot> => {
  const response = await fetch(accountUrl("/api/account/revoke"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: "{}",
  })
  const snapshot = await readJson<UnifiedAccountSnapshot>(response)
  cacheAccountSnapshot(snapshot)
  return snapshot
}

export const deleteUnifiedAccount = async (): Promise<void> => {
  const response = await fetch(accountUrl("/api/account"), {
    method: "DELETE",
    credentials: "include",
    headers: { Accept: "application/json" },
  })
  await readJson<{ deleted: boolean }>(response)
  localStorage.removeItem(SNAPSHOT_CACHE_KEY)
}

export const updateUnifiedOnboarding = async (input: {
  status: UnifiedAccountSnapshot["onboarding"]["status"]
  nextStep: string | null
  context?: Record<string, unknown>
}): Promise<UnifiedAccountSnapshot> => {
  const response = await fetch(accountUrl("/api/account/onboarding"), {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(input),
  })
  const snapshot = await readJson<UnifiedAccountSnapshot>(response)
  cacheAccountSnapshot(snapshot)
  return snapshot
}

export const activateUnifiedFreePlan = async (planId: "basic" | "beta"): Promise<UnifiedAccountSnapshot> => {
  const response = await fetch(accountUrl("/api/account/plan"), {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ planId }),
  })
  const snapshot = await readJson<UnifiedAccountSnapshot>(response)
  cacheAccountSnapshot(snapshot)
  return snapshot
}

export const consumeUnifiedAiCredits = async (input: {
  credits: number
  idempotencyKey: string
  metadata?: Record<string, unknown>
}): Promise<UnifiedAccountSnapshot> => {
  const response = await fetch(accountUrl("/api/account/ai-credits/consume"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(input),
  })
  const payload = await readJson<{ snapshot: UnifiedAccountSnapshot }>(response)
  cacheAccountSnapshot(payload.snapshot)
  window.dispatchEvent(new CustomEvent("vt_account_snapshot_changed", { detail: payload.snapshot }))
  return payload.snapshot
}
