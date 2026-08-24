import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import type { InitialChannelBootstrapSnapshot } from "../services/canonicalSync/contracts"
import {
 ensureInitialChannelBootstrap,
 getInitialChannelBootstrapSnapshot,
 isInitialChannelBootstrapEnabled,
 subscribeInitialChannelBootstrap,
} from "../services/initialChannelBootstrap"
import { useUnifiedAccount } from "./UnifiedAccountContext"
import { recordDiagnostic } from "../services/diagnostics"

// Module-scoped render counter — same rationale as other providers.
let icbpRenderCount = 0
let icbpFirstRenderTs: number | null = null

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
 icbpRenderCount += 1
 if (icbpFirstRenderTs === null) icbpFirstRenderTs = typeof performance !== "undefined" ? performance.now() : Date.now()
 if (icbpRenderCount === 1 || icbpRenderCount === 10 || icbpRenderCount === 50
     || icbpRenderCount === 100 || icbpRenderCount === 500 || icbpRenderCount === 1000) {
  const now = typeof performance !== "undefined" ? performance.now() : Date.now()
  const elapsed = Math.round(now - (icbpFirstRenderTs ?? now))
  recordDiagnostic("warn", "render-storm", `InitialChannelBootstrapProvider render #${icbpRenderCount} (${elapsed}ms since first)`)
 }
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
 //
 // Mobile freeze fix (2026-08-23): the immediate post-login refresh(false)
 // used to fire synchronously as soon as `authorized` flipped true, which
 // on mobile blocked the main thread hard enough to freeze the hamburger
 // menu and every other interactive element for the several hundred ms of
 // network + parse. Defer via requestIdleCallback (matching the same-day
 // manual-refresh path below) so the login-success UI animation, the
 // channel-chip render, and the drawer / tool buttons stay tappable while
 // the bootstrap does its thing in the background.
 useEffect(() => {
  if (!enabled || !authorized) return
  const defer = typeof window !== "undefined" && typeof window.requestIdleCallback === "function"
   ? window.requestIdleCallback
   : (cb: () => void) => setTimeout(cb, 0)
  const handle = defer(() => void refresh(false))
  return () => {
   if (typeof window !== "undefined" && typeof window.cancelIdleCallback === "function" && typeof handle === "number") {
    window.cancelIdleCallback(handle)
   } else if (typeof handle === "number") {
    clearTimeout(handle)
   }
  }
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
