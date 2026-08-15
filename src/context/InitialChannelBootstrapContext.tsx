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

const localDayKey = () => {
 const now = new Date()
 return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
}

const dailyBootstrapStorageKey = (channelId?: string | null) =>
 `viewtube:initial-channel-bootstrap:first-action:${channelId || "mine"}`

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

 // Connected creators get channel overview immediately. A later first real
 // action on each local calendar day forces fresh overview/totals without
 // repeatedly starting work for every click.
 useEffect(() => {
  if (!enabled || !authorized) return
  void refresh(false)
 }, [authorized, channelId, enabled, refresh])

 useEffect(() => {
  if (!enabled || !authorized || typeof window === "undefined") return
  const onFirstActionToday = () => {
   const key = dailyBootstrapStorageKey(channelId)
   const today = localDayKey()
   if (window.localStorage.getItem(key) === today) return
   window.localStorage.setItem(key, today)
   // Defer sync work so the browser processes the tap's visual feedback
   // (ripple, press state, navigation) before starting network+parse work.
   // Without this, the synchronous refresh() call blocks the main thread
   // for 200-800ms on mobile and freezes the first interaction each day.
   const defer = typeof window.requestIdleCallback === "function"
    ? window.requestIdleCallback
    : (cb: () => void) => setTimeout(cb, 0)
   defer(() => void refresh(true))
  }
  window.addEventListener("pointerdown", onFirstActionToday, { capture: true, passive: true })
  window.addEventListener("keydown", onFirstActionToday, { capture: true })
  return () => {
   window.removeEventListener("pointerdown", onFirstActionToday, { capture: true })
   window.removeEventListener("keydown", onFirstActionToday, { capture: true })
  }
 }, [authorized, channelId, enabled, refresh])

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
