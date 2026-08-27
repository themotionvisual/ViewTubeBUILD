import {
  ANONYMOUS_ACCOUNT_SNAPSHOT,
  sanitizeInternalReturnTo,
  type AccountIntent,
  type UnifiedAccountSnapshot,
} from "./accountContracts"
import { reportDiagnostic } from "../diagnostics"

const SNAPSHOT_CACHE_KEY = "vt_unified_account_snapshot_v1"
const ACCOUNT_POPUP_NAME = "vt_unified_account_popup"
const ACCOUNT_POPUP_FEATURES = "popup=yes,width=560,height=720,menubar=no,toolbar=no,location=yes,status=no,resizable=yes,scrollbars=yes"

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"])
const ACCOUNT_SERVER_UNAVAILABLE_ERROR = "ACCOUNT_SERVER_UNAVAILABLE"

// Timeout for account-API fetches. Real diagnostic screenshots showed
// /api/account/auth/start hanging 22+ seconds on iOS 5G before WebKit
// gave up with "Load failed". Without an explicit timeout the user
// stays stuck in "CONNECTING..." for the full duration, and even then
// the WebKit failure doesn't match ACCOUNT_SERVER_UNAVAILABLE_ERROR so
// the legacy Google-popup fallback never fires. Ten seconds is plenty
// for a warm Vercel serverless function; anything longer means the
// endpoint is broken/undeployed and the user should get the legacy
// path immediately.
const ACCOUNT_FETCH_TIMEOUT_MS = 10_000

/**
 * fetch() wrapper with an AbortController-based timeout. On timeout
 * throws an Error with message ACCOUNT_SERVER_UNAVAILABLE_ERROR so the
 * caller's existing "server unavailable → legacy fallback" branch
 * fires. Network-layer failures (DNS, TLS, TCP reset, WebKit
 * "Load failed") are similarly normalized to ACCOUNT_SERVER_UNAVAILABLE_ERROR
 * so callers don't have to special-case each WebKit variant.
 */
const accountFetch = async (
 input: string,
 init: RequestInit = {},
 timeoutMs: number = ACCOUNT_FETCH_TIMEOUT_MS,
): Promise<Response> => {
 const controller = typeof AbortController !== "undefined" ? new AbortController() : null
 const timer = controller
  ? setTimeout(() => controller.abort(), timeoutMs)
  : null
 try {
  return await fetch(input, { ...init, signal: controller?.signal })
 } catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  // AbortError = our timeout. Network failures on WebKit surface as
  // "Load failed" and on Chromium as "Failed to fetch" / "NetworkError".
  // All three mean the caller should treat the account server as down
  // and fall back to the legacy flow.
  if (
   controller?.signal.aborted
   || /Load failed|Failed to fetch|NetworkError|AbortError/i.test(message)
  ) {
   throw new Error(ACCOUNT_SERVER_UNAVAILABLE_ERROR)
  }
  throw error
 } finally {
  if (timer !== null) clearTimeout(timer)
 }
}

let unifiedAccountServerUnavailable = false

export const markUnifiedAccountServerUnavailable = (): void => {
  if (unifiedAccountServerUnavailable) return
  unifiedAccountServerUnavailable = true
  // Reconcile connection/tool UI immediately when the app falls back from the
  // unified account server to the working local OAuth session.
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("vt_auth_changed"))
  }
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

  if (runtimeOrigin && isLocalRuntime && configuredIsLocal) return runtimeOrigin.replace(/\/$/, "")
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
  let overallTimeout: number | null = null
  // vt-2650 — COOP polish for the desktop/local popup lifecycle.
  //
  // Historical behavior (still in place):
  //   * COOP `same-origin-allow-popups` means cross-origin `popup.closed`
  //     reads log a Chrome warning while the popup is on accounts.google.com.
  //     We can't suppress the warning from JS, but we can read `popup.closed`
  //     less often, which cuts the warning count proportionally.
  //   * The 600ms grace after first observing `closed === true` remains
  //     because a successful popup posts VT_UNIFIED_ACCOUNT_AUTH_SUCCESS
  //     and then closes itself — the message can lose the race against
  //     the closed-poll unless we wait a poll cycle.
  //
  // Changes this pass:
  //   * Poll interval 200ms → 500ms (fewer COOP warnings, still detects
  //     manual cancels in ≤ 1.5s including the grace window).
  //   * Grace window 600 → 800ms to keep total detect-cancel latency in
  //     the same ballpark as before despite the slower poll.
  //   * OVERALL_TIMEOUT_MS — after 3 minutes without a completion signal,
  //     resolve the wait as a soft abort so a walked-away user doesn't
  //     leave a polling interval running forever if the OS reclaims the
  //     popup without our closed-poll noticing.
  //   * popup.closed read wrapped in try/catch — no known implementation
  //     throws here today, but defence-in-depth for future browser
  //     changes to COOP semantics.
  //   * Focus-based fast path — when the parent window regains focus, we
  //     do ONE immediate closed-check instead of waiting the next poll,
  //     so users who close the popup and swipe back to our tab see the
  //     abort fire immediately.
  const POLL_INTERVAL_MS = 500
  const CLOSED_GRACE_MS = 800
  const OVERALL_TIMEOUT_MS = 3 * 60 * 1000
  let closedSeenAt: number | null = null

  const cleanup = () => {
    if (settled) return
    settled = true
    window.removeEventListener("message", handleMessage)
    window.removeEventListener("focus", handleFocus)
    if (closedPoll !== null) window.clearInterval(closedPoll)
    if (overallTimeout !== null) {
      // Mirror the setTimeout guard above so cleanup works in stripped-down
      // test environments too.
      const clear = typeof window.clearTimeout === "function" ? window.clearTimeout : globalThis.clearTimeout
      clear(overallTimeout)
    }
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

  const checkPopupClosed = (): boolean => {
    try {
      return popup.closed
    } catch {
      // Some future COOP tightening could throw here; treat as "still open"
      // rather than falsely rejecting.
      return false
    }
  }

  const evaluateClosedState = () => {
    if (settled) return
    if (!checkPopupClosed()) {
      closedSeenAt = null
      return
    }
    if (closedSeenAt === null) {
      closedSeenAt = Date.now()
      return
    }
    if (Date.now() - closedSeenAt < CLOSED_GRACE_MS) return
    fail("Account popup closed before authorization completed.")
  }

  // Fast path: parent window regained focus → check right away instead of
  // waiting up to POLL_INTERVAL_MS for the next poll.
  const handleFocus = () => evaluateClosedState()

  closedPoll = window.setInterval(evaluateClosedState, POLL_INTERVAL_MS)
  // Use globalThis.setTimeout so tests that stub `window` (without a full
  // browser environment) don't hit TypeError: window.setTimeout is not a
  // function. In real browsers `globalThis.setTimeout === window.setTimeout`.
  overallTimeout = (typeof window.setTimeout === "function" ? window.setTimeout : globalThis.setTimeout)(() => {
    fail("Account popup timed out waiting for authorization to complete.")
  }, OVERALL_TIMEOUT_MS) as unknown as number

  window.addEventListener("message", handleMessage)
  window.addEventListener("focus", handleFocus)
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
    const response = await accountFetch(accountUrl("/api/account/snapshot"), {
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
  } catch (error) {
    reportDiagnostic({
      area: "account",
      event: "snapshot_fallback",
      level: "warn",
      whatHappened: "The unified account snapshot could not be loaded; ViewTube is using the safe local snapshot.",
      whatItMeans: "The account API may be unavailable, misrouted, or returning an invalid response.",
      whatToCheck: ["Account API deployment", "Vercel API rewrite", "Session cookie"],
      error,
    })
    markUnifiedAccountServerUnavailable()
    return readCachedAccountSnapshot()
  }
}

export const selectUnifiedContentOwner = async (ownerId: string): Promise<UnifiedAccountSnapshot> => {
  const response = await fetch(accountUrl("/api/account/content-owner"), {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ ownerId }),
  })
  if (!response.ok) throw new Error((await response.json().catch(() => null))?.error || "Content Owner selection failed.")
  return fetchUnifiedAccountSnapshot()
}

// Touch devices (phones/tablets) can't reliably keep a popup+opener
// relationship alive across a Google OAuth round-trip: mobile browsers block
// popups, open them as detached tabs, or lose window.opener before postMessage
// can arrive. Full-page redirects avoid the whole handshake — the server's
// returnTo lands the user back on the page that started the intent.
const shouldPreferAccountRedirect = (): boolean => {
  if (typeof window === "undefined" || !window.matchMedia) return false
  try {
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches
    const narrowViewport = window.matchMedia("(max-width: 760px)").matches
    return coarsePointer || narrowViewport
  } catch {
    return false
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

  const sanitizedReturnTo = sanitizeInternalReturnTo(returnTo)
  const useRedirect = shouldPreferAccountRedirect()
  const popup = useRedirect ? null : openAccountPopup()
  try {
    const response = await accountFetch(accountUrl("/api/account/auth/start"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        intent,
        returnTo: sanitizedReturnTo,
      }),
    })
    if (response.status === 404) {
      markUnifiedAccountServerUnavailable()
      throw new Error(ACCOUNT_SERVER_UNAVAILABLE_ERROR)
    }
    const payload = await readJson<{ authorizationUrl?: string } | null>(response)
    // A static host (e.g. an SPA served by Vercel without the account server) rewrites
    // unknown /api routes to index.html — a 200 that is not JSON, so readJson yields null.
    // Treat any response without a usable authorization URL as "server not deployed here"
    // so the caller falls back to the legacy Google popup instead of a dead blank popup.
    if (!payload || !payload.authorizationUrl) {
      markUnifiedAccountServerUnavailable()
      throw new Error(ACCOUNT_SERVER_UNAVAILABLE_ERROR)
    }
    if (!popup) {
      // Full-page redirect path (mobile). Returns a never-resolving promise
      // because the tab is being torn down for the navigation.
      window.location.href = payload.authorizationUrl
      await new Promise(() => {})
      return
    }
    popup.location.href = payload.authorizationUrl
    await waitForAccountPopupMessage(popup, sanitizedReturnTo)
  } catch (error) {
    reportDiagnostic({
      area: "account",
      event: "auth_start_failed",
      level: "error",
      whatHappened: "The account authorization flow could not start or complete.",
      whatItMeans: "ViewTube did not receive a usable authorization URL or popup completion message.",
      whatToCheck: ["Popup permissions", "Account API deployment", "Google callback configuration"],
      debugData: { intent, returnTo: sanitizedReturnTo, redirectMode: useRedirect },
      error,
    })
    if (popup) {
      try {
        popup.close()
      } catch {
        // ignore popup close failures
      }
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
