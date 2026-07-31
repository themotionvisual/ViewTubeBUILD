import {
  ANONYMOUS_ACCOUNT_SNAPSHOT,
  sanitizeInternalReturnTo,
  type AccountIntent,
  type UnifiedAccountSnapshot,
} from "./accountContracts"

const SNAPSHOT_CACHE_KEY = "vt_unified_account_snapshot_v1"
const ACCOUNT_POPUP_NAME = "vt_unified_account_popup"
const ACCOUNT_POPUP_FEATURES = "popup=yes,width=560,height=720,menubar=no,toolbar=no,location=yes,status=no,resizable=yes,scrollbars=yes"

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"])
const ACCOUNT_SERVER_UNAVAILABLE_ERROR = "ACCOUNT_SERVER_UNAVAILABLE"

let unifiedAccountServerUnavailable = false

export const markUnifiedAccountServerUnavailable = (): void => {
  unifiedAccountServerUnavailable = true
}

export const isAccountServerUnavailableError = (error: unknown): boolean => {
  return error instanceof Error && error.message === ACCOUNT_SERVER_UNAVAILABLE_ERROR
}

export const resolveAccountApiBase = (
  runtimeHostname = typeof window !== "undefined" ? String(window.location.hostname || "") : "",
  runtimeOrigin = typeof window !== "undefined" ? String(window.location.origin || "") : "",
): string => {
  const configuredBase = String(import.meta.env.VITE_ACCOUNT_API_BASE || import.meta.env.VITE_BILLING_API_BASE || "").replace(/\/$/, "")
  const isLocalRuntime = LOCAL_HOSTS.has(runtimeHostname) || runtimeHostname.endsWith(".local")
  const configuredIsLocal = /localhost|127\.0\.0\.1|::1/.test(configuredBase)

  if (runtimeOrigin && !isLocalRuntime && configuredIsLocal) return runtimeOrigin.replace(/\/$/, "")
  if (configuredBase) return configuredBase
  return runtimeOrigin.replace(/\/$/, "")
}

export const isUnifiedAccountServerEnabled = (
  runtimeHostname = typeof window !== "undefined" ? String(window.location.hostname || "") : "",
): boolean => {
  if (unifiedAccountServerUnavailable) return false
  if (!runtimeHostname) return false
  const configured = String(import.meta.env.VITE_UNIFIED_ACCOUNT_ENABLED || "").trim().toLowerCase()
  if (configured === "true") return true
  if (configured === "false") {
    const isLocalRuntime = LOCAL_HOSTS.has(runtimeHostname) || runtimeHostname.endsWith(".local")
    return !isLocalRuntime
  }
  const isLocalRuntime = LOCAL_HOSTS.has(runtimeHostname) || runtimeHostname.endsWith(".local")
  return !isLocalRuntime || Boolean(resolveAccountApiBase(runtimeHostname))
}

export const accountUrl = (path: string): string => `${resolveAccountApiBase()}${path}`

const openAccountPopup = (): Window => {
  if (typeof window === "undefined") throw new Error("Account popup requires a browser window.")
  const popup = window.open("about:blank", ACCOUNT_POPUP_NAME, ACCOUNT_POPUP_FEATURES)
  if (!popup) throw new Error("Popup was blocked. Please allow popups for this site.")
  return popup
}

const waitForAccountPopupMessage = (
  popup: Window,
  expectedReturnTo: string,
): Promise<void> => new Promise((resolve, reject) => {
  let settled = false
  let closedPoll: number | null = null

  const cleanup = () => {
    if (settled) return
    settled = true
    window.removeEventListener("message", handleMessage)
    if (closedPoll !== null) window.clearInterval(closedPoll)
    try {
      popup.close()
    } catch {
      // ignore popup close failures
    }
  }

  const fail = (message: string) => {
    cleanup()
    reject(new Error(message))
  }

  const handleMessage = (event: MessageEvent) => {
    if (settled) return
    if (event.origin !== window.location.origin) return
    const data = event.data as Record<string, unknown> | null
    if (!data || typeof data !== "object") return
    if (data.type === "VT_UNIFIED_ACCOUNT_AUTH_SUCCESS") {
      cleanup()
      window.dispatchEvent(new CustomEvent("vt_account_auth_popup_success", {
        detail: {
          returnTo: typeof data.returnTo === "string" ? data.returnTo : expectedReturnTo,
        },
      }))
      resolve()
      return
    }
    if (data.type === "VT_UNIFIED_ACCOUNT_AUTH_ERROR") {
      fail(String(data.error || "Account authorization failed."))
    }
  }

  closedPoll = window.setInterval(() => {
    if (!popup.closed) return
    fail("Account popup closed before authorization completed.")
  }, 400)

  window.addEventListener("message", handleMessage)
})

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

const isValidAccountSnapshot = (value: unknown): value is UnifiedAccountSnapshot =>
  Boolean(value) && typeof value === "object" && value !== null &&
  typeof (value as UnifiedAccountSnapshot).authentication === "object" &&
  (value as UnifiedAccountSnapshot).authentication !== null

const cleanNullableString = (value: unknown): string | null => {
  const text = String(value || "").trim()
  return text || null
}

export const normalizeAccountSnapshot = (snapshot: UnifiedAccountSnapshot): UnifiedAccountSnapshot => {
  if (!snapshot || typeof snapshot !== "object") return { ...ANONYMOUS_ACCOUNT_SNAPSHOT }
  const candidateProfile = snapshot.profile as UnifiedAccountSnapshot["profile"] & {
    avatar?: unknown
    image?: unknown
    picture?: unknown
    photo?: unknown
    photoUrl?: unknown
    pictureUrl?: unknown
  }
  return {
    ...ANONYMOUS_ACCOUNT_SNAPSHOT,
    ...snapshot,
    profile: {
      ...ANONYMOUS_ACCOUNT_SNAPSHOT.profile,
      ...snapshot.profile,
      email: cleanNullableString(snapshot.profile?.email),
      displayName: cleanNullableString(snapshot.profile?.displayName),
      avatarUrl: cleanNullableString(
        snapshot.profile?.avatarUrl ||
          candidateProfile?.picture ||
          candidateProfile?.photoUrl ||
          candidateProfile?.pictureUrl ||
          candidateProfile?.avatar ||
          candidateProfile?.image ||
          candidateProfile?.photo,
      ),
    },
    authentication: {
      ...ANONYMOUS_ACCOUNT_SNAPSHOT.authentication,
      ...(snapshot.authentication && typeof snapshot.authentication === "object" ? snapshot.authentication : {}),
    },
    google: {
      ...ANONYMOUS_ACCOUNT_SNAPSHOT.google,
      ...(snapshot.google && typeof snapshot.google === "object" ? snapshot.google : {}),
    },
    onboarding: {
      ...ANONYMOUS_ACCOUNT_SNAPSHOT.onboarding,
      ...snapshot.onboarding,
    },
    billing: {
      ...ANONYMOUS_ACCOUNT_SNAPSHOT.billing,
      ...snapshot.billing,
    },
    ai: {
      ...ANONYMOUS_ACCOUNT_SNAPSHOT.ai,
      ...snapshot.ai,
    },
    grantedCapabilities: Array.isArray(snapshot.grantedCapabilities) ? snapshot.grantedCapabilities : [],
  }
}

const readAccountSnapshotJson = async (response: Response): Promise<UnifiedAccountSnapshot> => {
  const snapshot = await readJson<UnifiedAccountSnapshot>(response)
  if (!isValidAccountSnapshot(snapshot)) throw new Error("Account snapshot response was malformed.")
  return normalizeAccountSnapshot(snapshot)
}

export const readCachedAccountSnapshot = (): UnifiedAccountSnapshot => {
  if (typeof window === "undefined") return ANONYMOUS_ACCOUNT_SNAPSHOT
  try {
    const raw = localStorage.getItem(SNAPSHOT_CACHE_KEY)
    if (!raw) return ANONYMOUS_ACCOUNT_SNAPSHOT
    const parsed = JSON.parse(raw) as UnifiedAccountSnapshot | null
    // A cached JSON `null` or non-object must not become a snapshot: reading
    // `.authentication` off it is the "Cannot read properties of null" crash.
    if (!parsed || typeof parsed !== "object") return ANONYMOUS_ACCOUNT_SNAPSHOT
    return normalizeAccountSnapshot({
      ...ANONYMOUS_ACCOUNT_SNAPSHOT,
      ...parsed,
      profile: {
        ...ANONYMOUS_ACCOUNT_SNAPSHOT.profile,
        ...parsed.profile,
      },
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
    })
  } catch {
    return ANONYMOUS_ACCOUNT_SNAPSHOT
  }
}

export const cacheAccountSnapshot = (snapshot: UnifiedAccountSnapshot): void => {
  if (typeof window === "undefined") return
  const safeSnapshot: UnifiedAccountSnapshot = {
    ...normalizeAccountSnapshot(snapshot),
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
  try {
    const response = await fetch(accountUrl("/api/account/snapshot"), {
      credentials: "include",
      headers: { Accept: "application/json" },
    })
    if (response.status === 404) {
      markUnifiedAccountServerUnavailable()
      return readCachedAccountSnapshot()
    }
    const snapshot = await readAccountSnapshotJson(response)
    cacheAccountSnapshot(snapshot)
    return snapshot
  } catch {
    markUnifiedAccountServerUnavailable()
    return readCachedAccountSnapshot()
  }
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
    throw new Error(ACCOUNT_SERVER_UNAVAILABLE_ERROR)
  }

  const popup = openAccountPopup()
  try {
    const response = await fetch(accountUrl("/api/account/auth/start"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        intent,
        returnTo: sanitizeInternalReturnTo(returnTo),
      }),
    })
    if (response.status === 404) {
      markUnifiedAccountServerUnavailable()
      throw new Error(ACCOUNT_SERVER_UNAVAILABLE_ERROR)
    }
    const payload = await readJson<{ authorizationUrl: string }>(response)
    if (!payload.authorizationUrl) throw new Error("Google authorization URL was not returned.")
    popup.location.href = payload.authorizationUrl
    await waitForAccountPopupMessage(popup, sanitizeInternalReturnTo(returnTo))
  } catch (error) {
    try {
      popup.close()
    } catch {
      // ignore popup close failures
    }
    if (
      error instanceof Error &&
      (error.message === ACCOUNT_SERVER_UNAVAILABLE_ERROR || error.message.includes("Account request failed (404)"))
    ) {
      markUnifiedAccountServerUnavailable()
      throw new Error(ACCOUNT_SERVER_UNAVAILABLE_ERROR)
    }
    throw error
  }
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
  const snapshot = await readAccountSnapshotJson(response)
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
  const snapshot = await readAccountSnapshotJson(response)
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
  const snapshot = await readAccountSnapshotJson(response)
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
  if (!isValidAccountSnapshot(payload?.snapshot)) throw new Error("Account snapshot response was malformed.")
  cacheAccountSnapshot(payload.snapshot)
  window.dispatchEvent(new CustomEvent("vt_account_snapshot_changed", { detail: payload.snapshot }))
  return payload.snapshot
}
