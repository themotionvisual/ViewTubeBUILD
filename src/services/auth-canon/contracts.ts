// Canonical auth contracts — the shapes every consumer depends on.
//
// This module re-exports the mature account contracts from
// services/account/accountContracts.ts. As with analytics-canon, types
// stay canonical; only the CONSUMER-FACING API changes. When the
// legacy `useBrain().authState.isAuthenticated` path is retired,
// nothing that imports from this module needs to change.

import type { AccountCapability } from "../account/accountContracts"

export type {
 UnifiedAccountSnapshot,
 AccountIntent,
 AccountCapability,
} from "../account/accountContracts"

/**
 * Consolidated status — the single field every consumer should look at
 * when the question is "is this user actually able to use the app?"
 * It combines the three fragmented signals (VT account authenticated
 * + Google OAuth connected + token actually present) so drift between
 * them stops causing "signed in but nothing works" states.
 *
 *   ready   → VT account authenticated, Google connected, token present.
 *             Widgets can call APIs. UI shows signed-in state.
 *   connecting → an auth flow is in flight (popup open, refresh underway).
 *   needs_reconnect → the user was authenticated but the Google token
 *             is missing/expired. The right prompt is "reconnect", not
 *             "sign up".
 *   anonymous → no VT account. Show sign-up.
 */
export type AccountStatus =
 | "ready"
 | "connecting"
 | "needs_reconnect"
 | "anonymous"

/**
 * The full status payload consumers read. `status` is the primary
 * signal; the other fields are for widgets that need more nuance
 * (nav shell chip, verification widget, sync buttons).
 */
export interface AccountStatusPayload {
 status: AccountStatus
 /** VT account exists and viewer is authenticated. */
 accountAuthenticated: boolean
 /** Google OAuth token is present and scopes are granted. */
 googleConnected: boolean
 /** Access token exists in local storage. Reflects real API-call viability. */
 tokenPresent: boolean
 /** Convenience — true iff status === "ready". */
 canUseYouTubeApis: boolean
 /** Display name if signed in, null otherwise. */
 displayName: string | null
 /** Avatar URL if signed in and available. */
 avatarUrl: string | null
 /** Channel handle if a YouTube channel is linked. */
 channelHandle: string | null
 /** Channel id (YouTube UC-prefixed) if linked. */
 channelId: string | null
 /** Active credential owner for YouTube requests. */
 transportMode: "server" | "legacy"
 grantedCapabilities: AccountCapability[]
 canReadYouTube: boolean
 canManageVideos: boolean
 canUploadVideos: boolean
 canPostComments: boolean
}
