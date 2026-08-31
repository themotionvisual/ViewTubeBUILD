import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useUnifiedAccount } from "./UnifiedAccountContext"
import { fetchVerifiedUnifiedAccountSnapshot } from "../services/account/accountCoordinator"
import { resolveFeatureGate } from "../services/featureGating"
import { FeatureAccessContext, type FeatureAccessContextValue } from "./featureAccessContext"

export const FeatureAccessProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const account = useUnifiedAccount()
  const [snapshot, setSnapshot] = useState(account.snapshot)
  const [verified, setVerified] = useState(false)
  const [checking, setChecking] = useState(true)

  const refresh = useCallback(async () => {
    setChecking(true)
    try {
      const next = await fetchVerifiedUnifiedAccountSnapshot()
      setSnapshot(next)
      setVerified(true)
      window.dispatchEvent(new CustomEvent("vt_feature_access_changed", { detail: next }))
    } catch (error) {
      setVerified(false)
      throw error
    } finally {
      setChecking(false)
    }
  }, [])

  useEffect(() => {
    let alive = true
    fetchVerifiedUnifiedAccountSnapshot()
      .then((next) => { if (alive) { setSnapshot(next); setVerified(true) } })
      .catch(() => { if (alive) setVerified(false) })
      .finally(() => { if (alive) setChecking(false) })
    return () => { alive = false }
  }, [account.snapshot.viewtubeUserId])

  useEffect(() => {
    const handleSnapshot = (event: Event) => {
      const next = (event as CustomEvent).detail
      if (next?.authentication && next?.billing && next?.ai) {
        setSnapshot(next)
        setVerified(true)
      }
    }
    window.addEventListener("vt_account_snapshot_changed", handleSnapshot)
    return () => window.removeEventListener("vt_account_snapshot_changed", handleSnapshot)
  }, [])

  const value = useMemo<FeatureAccessContextValue>(() => ({
    snapshot, verified, checking,
    decision: (id) => resolveFeatureGate(id, { snapshot, serverVerified: verified }),
    refresh,
  }), [checking, refresh, snapshot, verified])
  return <FeatureAccessContext.Provider value={value}>{children}</FeatureAccessContext.Provider>
}
