import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import {
  ANONYMOUS_ACCOUNT_SNAPSHOT,
  isAccountActionPending,
  resolveAccountActionLabel,
  resolveAccountIntent,
  type AccountIntent,
  type UnifiedAccountSnapshot,
} from "../services/account/accountContracts"
import {
  beginAccountIntent,
  deleteUnifiedAccount,
  fetchUnifiedAccountSnapshot,
  isUnifiedAccountServerEnabled,
  readCachedAccountSnapshot,
  revokeUnifiedGoogleConnection,
  signOutUnifiedAccount,
} from "../services/account/accountCoordinator"
import { isAuthenticated as isLegacyAuthenticated } from "../services/auth/authSession"

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
}

const UnifiedAccountContext = createContext<UnifiedAccountContextValue | null>(null)

export const UnifiedAccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [snapshot, setSnapshot] = useState<UnifiedAccountSnapshot>(() => readCachedAccountSnapshot())

  const refresh = useCallback(async () => {
    try {
      const next = await fetchUnifiedAccountSnapshot()
      setSnapshot(next)
      return next
    } catch (error) {
      const cached = readCachedAccountSnapshot()
      const next: UnifiedAccountSnapshot = {
        ...cached,
        billing: { ...cached.billing, status: cached.billing.status === "active" ? "unavailable" : cached.billing.status },
        error: {
          code: "ACCOUNT_SNAPSHOT_UNAVAILABLE",
          message: error instanceof Error ? error.message : "Account service unavailable.",
          recoverable: true,
        },
      }
      setSnapshot(next)
      return next
    }
  }, [])

  useEffect(() => {
    if (isUnifiedAccountServerEnabled()) {
      void refresh()
      return
    }
    const syncLegacy = () => {
      if (!isLegacyAuthenticated()) {
        setSnapshot(readCachedAccountSnapshot())
        return
      }
      setSnapshot((current) => ({
        ...current,
        authentication: { status: "authenticated", accountExists: true },
        google: { ...current.google, status: "connected", youtubeScopesGranted: true },
        nextIntent: "manage_account",
        error: null,
      }))
    }
    syncLegacy()
    window.addEventListener("vt_auth_changed", syncLegacy)
    return () => window.removeEventListener("vt_auth_changed", syncLegacy)
  }, [refresh])

  useEffect(() => {
    const onSnapshotChanged = (event: Event) => {
      const next = (event as CustomEvent<UnifiedAccountSnapshot>).detail
      if (next) setSnapshot(next)
    }
    window.addEventListener("vt_account_snapshot_changed", onSnapshotChanged)
    return () => window.removeEventListener("vt_account_snapshot_changed", onSnapshotChanged)
  }, [])

  const intent = resolveAccountIntent(snapshot)
  const start = useCallback(async (requestedIntent?: AccountIntent, returnTo?: string) => {
    const nextIntent = requestedIntent || resolveAccountIntent(snapshot)
    setSnapshot((current) => ({
      ...current,
      authentication: { ...current.authentication, status: "pending" },
      nextIntent,
      error: null,
    }))
    try {
      await beginAccountIntent(nextIntent, returnTo)
    } catch (error) {
      setSnapshot((current) => ({
        ...current,
        authentication: {
          ...current.authentication,
          status: current.viewtubeUserId ? "expired" : "anonymous",
        },
        error: {
          code: error instanceof Error ? error.message : "ACCOUNT_ACTION_FAILED",
          message: error instanceof Error ? error.message : "Account action failed.",
          recoverable: true,
        },
      }))
      throw error
    }
  }, [snapshot])

  const signOut = useCallback(async () => {
    await signOutUnifiedAccount()
    setSnapshot({
      ...ANONYMOUS_ACCOUNT_SNAPSHOT,
      viewtubeUserId: snapshot.viewtubeUserId,
      authentication: {
        status: "anonymous",
        accountExists: Boolean(snapshot.viewtubeUserId),
      },
      nextIntent: snapshot.viewtubeUserId ? "log_in" : "sign_up",
    })
  }, [snapshot.viewtubeUserId])

  const disconnectGoogle = useCallback(async () => {
    if (!isUnifiedAccountServerEnabled()) return
    setSnapshot(await revokeUnifiedGoogleConnection())
  }, [])

  const deleteAccount = useCallback(async () => {
    await deleteUnifiedAccount()
    setSnapshot(ANONYMOUS_ACCOUNT_SNAPSHOT)
  }, [])

  const value = useMemo<UnifiedAccountContextValue>(() => ({
    snapshot,
    label: resolveAccountActionLabel(snapshot),
    intent,
    pending: isAccountActionPending(snapshot),
    serverEnabled: isUnifiedAccountServerEnabled(),
    refresh,
    start,
    signOut,
    disconnectGoogle,
    deleteAccount,
  }), [deleteAccount, disconnectGoogle, intent, refresh, signOut, snapshot, start])

  return <UnifiedAccountContext.Provider value={value}>{children}</UnifiedAccountContext.Provider>
}

export const useUnifiedAccount = (): UnifiedAccountContextValue => {
  const value = useContext(UnifiedAccountContext)
  if (!value) throw new Error("useUnifiedAccount must be used within UnifiedAccountProvider")
  return value
}
