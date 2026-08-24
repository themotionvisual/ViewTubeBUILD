// Pure reconciliation — given the three fragmented auth signals in the
// codebase today, return a single AccountStatusPayload. This is the
// entire point of auth-canon: consumers stop deciding for themselves
// how to combine the signals and stop letting them drift.
//
// The three signals as of 2026-08-24:
//   1. unifiedAuth.getAccessToken() — the OAuth token in localStorage.
//      Reflects real API-call viability. When missing/expired, YouTube
//      API calls WILL 401.
//   2. UnifiedAccountContext.snapshot.authentication.status — the VT
//      account state. Persists across sessions via a cached snapshot.
//      Can lie about the current token because it's derived from a
//      cached blob, not the live token check.
//   3. UnifiedAccountContext.snapshot.google.status — YouTube channel
//      connection state. Same caveat as (2).
//
// The reconciliation rules:
//   * If no token AND account not authenticated → anonymous.
//   * If no token BUT account claims authenticated → needs_reconnect
//     (the user has an account but the OAuth session died).
//   * If token present AND google.status === "connected" AND account
//     authenticated → ready.
//   * If auth is pending → connecting.
//   * Everything else defaults to needs_reconnect so we err toward
//     "prompt reconnection" instead of "silently break API calls".

import type {
 AccountStatus,
 AccountStatusPayload,
 UnifiedAccountSnapshot,
} from "./contracts"

export interface ReconcileInputs {
 snapshot: UnifiedAccountSnapshot | null
 tokenPresent: boolean
}

const pickStatus = (
 accountAuthenticated: boolean,
 googleConnected: boolean,
 tokenPresent: boolean,
 pending: boolean,
 hadAccount: boolean,
): AccountStatus => {
 if (pending) return "connecting"
 // anonymous ONLY when the snapshot has no history of an account at all —
 // no viewtubeUserId, status is the initial "anonymous" state, and no
 // token. An "expired" or previously-authenticated snapshot means the
 // user HAD an account; the right prompt is reconnect, not sign-up.
 if (!accountAuthenticated && !tokenPresent && !hadAccount) return "anonymous"
 if (accountAuthenticated && googleConnected && tokenPresent) return "ready"
 return "needs_reconnect"
}

/**
 * Reconcile the three signals into one payload. Pure — safe to call
 * from anywhere (tests, workers, hooks).
 */
export const reconcileAccountStatus = ({
 snapshot,
 tokenPresent,
}: ReconcileInputs): AccountStatusPayload => {
 const authStatus = snapshot?.authentication.status ?? "anonymous"
 const googleStatus = snapshot?.google.status ?? "disconnected"
 const scopes = Boolean(snapshot?.google.youtubeScopesGranted)

 const accountAuthenticated = authStatus === "authenticated"
 const googleConnected = googleStatus === "connected" || scopes
 const pending = authStatus === "pending"
 // "Had an account" = the snapshot carries any evidence that this
 // browser has been logged in before (viewtubeUserId set, or an
 // explicit non-anonymous status). Distinguishes needs_reconnect from
 // anonymous.
 const hadAccount = Boolean(snapshot?.viewtubeUserId) || (
  Boolean(snapshot) && authStatus !== "anonymous"
 )

 const status = pickStatus(accountAuthenticated, googleConnected, tokenPresent, pending, hadAccount)

 return {
  status,
  accountAuthenticated,
  googleConnected,
  tokenPresent,
  canUseYouTubeApis: status === "ready",
  displayName: snapshot?.profile.displayName ?? null,
  avatarUrl: snapshot?.profile.avatarUrl ?? snapshot?.google.channelThumbnail ?? null,
  channelHandle: snapshot?.google.channelHandle ?? null,
  channelId: snapshot?.google.channelId ?? null,
 }
}

/**
 * The signed-out payload. Consumers rendering placeholder / anonymous
 * UI can compare against this or just call reconcileAccountStatus with
 * a null snapshot + tokenPresent=false.
 */
export const ANONYMOUS_ACCOUNT_STATUS: AccountStatusPayload = reconcileAccountStatus({
 snapshot: null,
 tokenPresent: false,
})
