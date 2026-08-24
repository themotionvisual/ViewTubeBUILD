import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import {
  ANONYMOUS_ACCOUNT_SNAPSHOT,
  isAccountActionPending,
  resolveAccountActionLabel,
  resolveAccountIntent,
  sanitizeInternalReturnTo,
  type AccountIntent,
  type UnifiedAccountSnapshot,
} from "../services/account/accountContracts"
import {
  beginAccountIntent,
  deleteUnifiedAccount,
  fetchUnifiedAccountSnapshot,
  isAccountServerUnavailableError,
  isUnifiedAccountServerEnabled,
  normalizeAccountSnapshot,
  readCachedAccountSnapshot,
  revokeUnifiedGoogleConnection,
  selectUnifiedContentOwner,
  signOutUnifiedAccount,
} from "../services/account/accountCoordinator"
import { isAuthenticated as isLegacyAuthenticated, login as legacyLogin } from "../services/auth/authSession"

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

const UnifiedAccountContext = createContext<UnifiedAccountContextValue | null>(null)

export const UnifiedAccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [snapshot, setSnapshot] = useState<UnifiedAccountSnapshot>(() => readCachedAccountSnapshot())

  const commitSnapshot = useCallback((nextSnapshot: UnifiedAccountSnapshot) => {
    const next = normalizeAccountSnapshot(nextSnapshot)
    setSnapshot(next)
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("vt_account_snapshot_changed", { detail: next }))
      window.dispatchEvent(new Event("vt_auth_changed"))
    }
    return next
  }, [])

  const refresh = useCallback(async () => {
    try {
      const next = await fetchUnifiedAccountSnapshot()
      return commitSnapshot(next)
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
      return commitSnapshot(next)
    }
  }, [commitSnapshot])

  useEffect(() => {
    // Legacy path — sourced from the local OAuth token. Used both when the
    // account server is disabled up-front AND as the fallback after the
    // server refresh() marks itself unavailable. Without the second path
    // the snapshot stays "anonymous" even when the token is valid — the
    // exact split-brain state where the nav shell shows "SIGNED IN" while
    // the AccountActionButton renders "SIGN UP" and widgets prompt to
    // connect a channel.
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

    if (isUnifiedAccountServerEnabled()) {
      // Try the server first. If it fails and marks itself unavailable,
      // fall through to the legacy path so a valid local OAuth token
      // still gets reflected as an authenticated snapshot.
      void refresh().then(() => {
        if (!isUnifiedAccountServerEnabled()) syncLegacy()
      })
      // Also subscribe to vt_auth_changed so a fresh login / logout via
      // the legacy popup updates the snapshot even in server mode. The
      // syncLegacy body is a no-op when the token is absent + snapshot
      // is already anonymous, so this is cheap.
      window.addEventListener("vt_auth_changed", syncLegacy)
      return () => window.removeEventListener("vt_auth_changed", syncLegacy)
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
      await refresh()
    } catch (error) {
      if (isAccountServerUnavailableError(error)) {
        await legacyLogin()
        commitSnapshot({
          ...snapshot,
          authentication: { status: "authenticated", accountExists: true },
          google: { ...snapshot.google, status: "connected", youtubeScopesGranted: true },
          nextIntent: "manage_account",
          error: null,
        })
        return
      }
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
  }, [commitSnapshot, refresh, snapshot])

  const signOut = useCallback(async () => {
    await signOutUnifiedAccount()
    commitSnapshot({
      ...ANONYMOUS_ACCOUNT_SNAPSHOT,
      viewtubeUserId: snapshot.viewtubeUserId,
      authentication: {
        status: "anonymous",
        accountExists: Boolean(snapshot.viewtubeUserId),
      },
      nextIntent: snapshot.viewtubeUserId ? "log_in" : "sign_up",
    })
  }, [commitSnapshot, snapshot.viewtubeUserId])

  const disconnectGoogle = useCallback(async () => {
    if (!isUnifiedAccountServerEnabled()) return
    commitSnapshot(await revokeUnifiedGoogleConnection())
  }, [commitSnapshot])

  const deleteAccount = useCallback(async () => {
    await deleteUnifiedAccount()
    commitSnapshot(ANONYMOUS_ACCOUNT_SNAPSHOT)
  }, [commitSnapshot])

  const selectContentOwner = useCallback(async (ownerId: string) => {
    commitSnapshot(await selectUnifiedContentOwner(ownerId))
  }, [commitSnapshot])

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
    selectContentOwner,
  }), [deleteAccount, disconnectGoogle, intent, refresh, selectContentOwner, signOut, snapshot, start])

  return <UnifiedAccountContext.Provider value={value}>{children}</UnifiedAccountContext.Provider>
}

export const useUnifiedAccount = (): UnifiedAccountContextValue => {
  const value = useContext(UnifiedAccountContext)
  if (!value) throw new Error("useUnifiedAccount must be used within UnifiedAccountProvider")
  return value
}
