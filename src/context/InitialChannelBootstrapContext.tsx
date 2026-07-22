import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import type { InitialChannelBootstrapSnapshot } from "../services/canonicalSync/contracts"
import {
 ensureInitialChannelBootstrap,
 getInitialChannelBootstrapSnapshot,
 isInitialChannelBootstrapEnabled,
 subscribeInitialChannelBootstrap,
} from "../services/initialChannelBootstrap"
import { useUnifiedAccount } from "./UnifiedAccountContext"

type InitialChannelBootstrapContextValue = {
 snapshot: InitialChannelBootstrapSnapshot | null
 enabled: boolean
 refresh: (force?: boolean) => Promise<InitialChannelBootstrapSnapshot | null>
}

const InitialChannelBootstrapContext = createContext<InitialChannelBootstrapContextValue | null>(null)

export const InitialChannelBootstrapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
 const account = useUnifiedAccount()
 const enabled = isInitialChannelBootstrapEnabled()
 const [snapshot, setSnapshot] = useState<InitialChannelBootstrapSnapshot | null>(() =>
  getInitialChannelBootstrapSnapshot(),
 )
 const channelId = account.snapshot.google.channelId
 const authorized =
  account.snapshot.authentication.status === "authenticated" &&
  account.snapshot.google.status === "connected" &&
  account.snapshot.google.youtubeScopesGranted

 useEffect(() => subscribeInitialChannelBootstrap(setSnapshot), [])

 const refresh = useCallback(async (force = false) => {
  if (!enabled || !authorized) return null
  return ensureInitialChannelBootstrap({ channelId, force, reason: force ? "manual" : "account_boot" })
 }, [authorized, channelId, enabled])

 const value = useMemo(() => ({ snapshot, enabled, refresh }), [enabled, refresh, snapshot])
 return (
  <InitialChannelBootstrapContext.Provider value={value}>
   {children}
  </InitialChannelBootstrapContext.Provider>
 )
}

export const useInitialChannelBootstrap = (): InitialChannelBootstrapContextValue => {
 const value = useContext(InitialChannelBootstrapContext)
 if (!value) throw new Error("useInitialChannelBootstrap must be used within InitialChannelBootstrapProvider")
 return value
}
