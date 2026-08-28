import React, { createContext, useCallback, useContext, useMemo } from "react"
import {
  ANONYMOUS_ACCOUNT_SNAPSHOT,
  resolveAccountActionLabel,
  resolveAccountIntent,
  type AccountCapability,
  type AccountIntent,
  type UnifiedAccountSnapshot,
} from "../services/account/accountContracts"
import {
  deleteUnifiedAccount,
  readCachedAccountSnapshot,
  revokeUnifiedGoogleConnection,
  selectUnifiedContentOwner,
} from "../services/account/accountCoordinator"
import { useSimpleAuth } from "../auth/AuthProvider"

interface UnifiedAccountContextValue {
  snapshot: UnifiedAccountSnapshot
  label: ReturnType<typeof resolveAccountActionLabel>
  intent: AccountIntent
  pending: boolean
  serverEnabled: boolean
  refresh: () => Promise<UnifiedAccountSnapshot>
  start: (intent?: AccountIntent, returnTo?: string) => Promise<void>
  signOut: () => Promise<void>
  disconnectGoogle: () => Promise<void>
  deleteAccount: () => Promise<void>
  selectContentOwner: (ownerId: string) => Promise<void>
}

/**
 * Compatibility adapter for legacy ViewTube surfaces.
 *
 * Authentication is no longer owned here. The only auth truth is
 * SimpleAuthProvider -> GET /api/auth/session. This context translates the
 * simple session into the older UnifiedAccountSnapshot shape until every
 * consumer is migrated and this adapter can be deleted.
 *
 * It deliberately does NOT:
 * - read browser Google tokens
 * - listen for vt_auth_changed
 * - hydrate auth from analytics/localStorage
 * - call beginAccountIntent
 * - choose between "server" and "legacy" auth modes
 * - emit account/auth events
 */
const UnifiedAccountContext = createContext<UnifiedAccountContextValue | null>(null)

const capabilitiesFromSession = (
  capabilities: ReturnType<typeof useSimpleAuth>["session"]["capabilities"],
): AccountCapability[] => {
  const result: AccountCapability[] = []
  if (capabilities.youtubeRead) result.push("youtube_read")
  if (capabilities.analyticsRead) result.push("youtube_analytics_read")
  if (capabilities.monetaryRead) result.push("youtube_monetary_read")
  if (capabilities.upload) result.push("youtube_upload")
  if (capabilities.youtubeWrite) {
    result.push("youtube_comments")
    result.push("youtube_video_manage")
  }
  return result
}

const snapshotFromSimpleAuth = (
  auth: ReturnType<typeof useSimpleAuth>,
): UnifiedAccountSnapshot => {
  const cached = readCachedAccountSnapshot()
  const session = auth.session
  const ready = session.status === "ready"
  const reconnect = session.status === "reconnect_required"

  return {
    ...ANONYMOUS_ACCOUNT_SNAPSHOT,
    onboarding: cached.onboarding || ANONYMOUS_ACCOUNT_SNAPSHOT.onboarding,
    billing: cached.billing || ANONYMOUS_ACCOUNT_SNAPSHOT.billing,
    ai: cached.ai || ANONYMOUS_ACCOUNT_SNAPSHOT.ai,

    viewtubeUserId: session.user?.id || null,
    profile: {
      email: session.user?.email || null,
      displayName: session.user?.name || null,
      avatarUrl: session.user?.avatar || session.channel?.thumbnail || null,
    },
    authentication: {
      status: auth.loading ? "pending" : ready || reconnect ? "authenticated" : "anonymous",
      accountExists: Boolean(session.user?.id),
    },
    google: {
      status: ready ? "connected" : reconnect ? "expired" : "disconnected",
      youtubeScopesGranted: Boolean(session.capabilities.youtubeRead),
      channelId: session.channel?.id || null,
      channelTitle: session.channel?.title || null,
      channelHandle: session.channel?.handle || null,
      channelThumbnail: session.channel?.thumbnail || null,
      contentOwners: [],
      activeContentOwnerId: null,
      contentOwnerSelectionRequired: false,
    },
    grantedCapabilities: capabilitiesFromSession(session.capabilities),
    nextIntent: auth.loading
      ? null
      : ready
        ? "manage_account"
        : reconnect
          ? "reconnect_channel"
          : session.user?.id
            ? "connect_channel"
            : "sign_up",
    error: null,
  }
}

export const UnifiedAccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useSimpleAuth()
  const snapshot = useMemo(() => snapshotFromSimpleAuth(auth), [auth.loading, auth.session])

  const refresh = useCallback(async (): Promise<UnifiedAccountSnapshot> => {
    const next = await auth.refresh()
    return snapshotFromSimpleAuth({ ...auth, session: next, loading: false })
  }, [auth])

  const start = useCallback(async (_intent?: AccountIntent, returnTo?: string) => {
    auth.login(returnTo || `${window.location.pathname}${window.location.search}${window.location.hash}`)
  }, [auth])

  const signOut = useCallback(async () => {
    await auth.logout()
  }, [auth])

  const disconnectGoogle = useCallback(async () => {
    await revokeUnifiedGoogleConnection()
    await auth.refresh()
  }, [auth])

  const deleteAccount = useCallback(async () => {
    await deleteUnifiedAccount()
    await auth.logout()
  }, [auth])

  const selectContentOwner = useCallback(async (ownerId: string) => {
    await selectUnifiedContentOwner(ownerId)
  }, [])

  const intent = resolveAccountIntent(snapshot)
  const value = useMemo<UnifiedAccountContextValue>(() => ({
    snapshot,
    label: resolveAccountActionLabel(snapshot),
    intent,
    pending: auth.loading,
    serverEnabled: true,
    refresh,
    start,
    signOut,
    disconnectGoogle,
    deleteAccount,
    selectContentOwner,
  }), [auth.loading, deleteAccount, disconnectGoogle, intent, refresh, selectContentOwner, signOut, snapshot, start])

  return <UnifiedAccountContext.Provider value={value}>{children}</UnifiedAccountContext.Provider>
}

export const useUnifiedAccount = (): UnifiedAccountContextValue => {
  const value = useContext(UnifiedAccountContext)
  if (!value) throw new Error("useUnifiedAccount must be used within UnifiedAccountProvider")
  return value
}
