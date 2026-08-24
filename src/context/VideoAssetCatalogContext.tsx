import React, {
 createContext,
 useCallback,
 useContext,
 useEffect,
 useMemo,
 useRef,
 useState,
} from "react"
import { useUnifiedAccount } from "./UnifiedAccountContext"
import { isAuthenticated as isLegacyAuthenticated } from "../services/auth/authSession"
import { readYouTubeAnalyticsCache } from "../services/analytics/DataStore"
import { useInitialChannelBootstrap } from "./InitialChannelBootstrapContext"
import {
 EMPTY_VIDEO_ASSET_CATALOG,
 isVideoAssetCatalogStale,
 refreshVideoAssetCatalog,
 restoreVideoAssetCatalog,
 VideoAssetCatalogError,
 type VideoAsset,
 type VideoAssetCatalogSnapshot,
} from "../services/videoAssets"
import { recordDiagnostic } from "../services/diagnostics"

// Module-scoped render counter — see GlobalDataProvider counter for rationale.
let vacpRenderCount = 0
let vacpFirstRenderTs: number | null = null

interface EnsureVideoAssetCatalogOptions {
 force?: boolean
 reason?: "boot" | "manual" | "sync" | "event"
}

interface VideoAssetCatalogContextValue {
 snapshot: VideoAssetCatalogSnapshot
 connected: boolean
 ensure: (options?: EnsureVideoAssetCatalogOptions) => Promise<VideoAssetCatalogSnapshot>
 search: (query: string, limit?: number) => VideoAsset[]
}

const VideoAssetCatalogContext = createContext<VideoAssetCatalogContextValue | null>(null)

const resolveLegacyChannelId = (): string | null => {
 const cache = readYouTubeAnalyticsCache()
 const profile = (cache.profile || cache.channelBaseline || {}) as Record<string, unknown>
 const channelId = String(profile.channelId || profile.id || "").trim()
 return channelId || null
}

export const VideoAssetCatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
 vacpRenderCount += 1
 if (vacpFirstRenderTs === null) vacpFirstRenderTs = typeof performance !== "undefined" ? performance.now() : Date.now()
 if (vacpRenderCount === 1 || vacpRenderCount === 10 || vacpRenderCount === 50
     || vacpRenderCount === 100 || vacpRenderCount === 500 || vacpRenderCount === 1000) {
  const now = typeof performance !== "undefined" ? performance.now() : Date.now()
  const elapsed = Math.round(now - (vacpFirstRenderTs ?? now))
  recordDiagnostic("warn", "render-storm", `VideoAssetCatalogProvider render #${vacpRenderCount} (${elapsed}ms since first)`)
 }
 const account = useUnifiedAccount()
 const initialBootstrap = useInitialChannelBootstrap()
 const [snapshot, setSnapshot] = useState<VideoAssetCatalogSnapshot>(EMPTY_VIDEO_ASSET_CATALOG)
 const snapshotRef = useRef<VideoAssetCatalogSnapshot>(EMPTY_VIDEO_ASSET_CATALOG)
 const inFlightRef = useRef<Map<string, Promise<VideoAssetCatalogSnapshot>>>(new Map())
 const abortRef = useRef<AbortController | null>(null)
 const restoreGenerationRef = useRef(0)
 const currentChannelIdRef = useRef("")

 const legacyConnected = !account.serverEnabled && isLegacyAuthenticated()
 const serverConnected = account.serverEnabled &&
  account.snapshot.authentication.status === "authenticated" &&
  account.snapshot.google.youtubeScopesGranted &&
  account.snapshot.google.status === "connected"
 const connected = serverConnected || legacyConnected
 const channelId = account.serverEnabled
  ? account.snapshot.google.channelId
  : resolveLegacyChannelId()
 currentChannelIdRef.current = String(channelId || "").trim()

 useEffect(() => {
  snapshotRef.current = snapshot
 }, [snapshot])

 const ensure = useCallback(async (
  options: EnsureVideoAssetCatalogOptions = {},
 ): Promise<VideoAssetCatalogSnapshot> => {
  const activeChannelId = String(channelId || "").trim()
  restoreGenerationRef.current += 1
  if (!activeChannelId) {
   const next = { ...EMPTY_VIDEO_ASSET_CATALOG, revision: snapshotRef.current.revision + 1 }
   setSnapshot(next)
   return next
  }

  const existingFlight = inFlightRef.current.get(activeChannelId)
  if (existingFlight) return existingFlight

  const task = (async () => {
   setSnapshot((current) => ({
    ...(current.channelId === activeChannelId ? current : EMPTY_VIDEO_ASSET_CATALOG),
    channelId: activeChannelId,
    status: current.channelId === activeChannelId && current.items.length > 0 ? "refreshing" : "restoring",
    revision: current.revision + 1,
   error: null,
  }))

   const shouldRunAnalyticsBootstrap =
    connected && initialBootstrap.enabled && (options.reason === "manual" || options.reason === "sync")
   if (shouldRunAnalyticsBootstrap) {
    const bootstrap = await initialBootstrap.refresh(Boolean(options.force))
    if (bootstrap?.channelId === activeChannelId && bootstrap.status !== "error") {
     const restoredFromBootstrap = await restoreVideoAssetCatalog(activeChannelId)
     const next: VideoAssetCatalogSnapshot = {
      channelId: activeChannelId,
      status: bootstrap.error ? "error" : restoredFromBootstrap.items.length > 0 ? "ready" : "confirmed_empty",
      items: restoredFromBootstrap.items,
      revision: snapshotRef.current.revision + 1,
      source: restoredFromBootstrap.source,
      lastSyncedAt: bootstrap.channel?.syncedAt || null,
      stale: false,
      error: bootstrap.error ? {
       code: "unknown",
       message: bootstrap.error.message,
       recoverable: bootstrap.error.recoverable,
      } : null,
     }
     setSnapshot(next)
     return next
    }
   }

   const restored = await restoreVideoAssetCatalog(activeChannelId)
   const currentForChannel = snapshotRef.current.channelId === activeChannelId
    ? snapshotRef.current.items
    : []
   const availableItems = restored.items.length > 0 ? restored.items : currentForChannel
   const availableSource = restored.source || (
    snapshotRef.current.channelId === activeChannelId ? snapshotRef.current.source : null
   )
   const stale = isVideoAssetCatalogStale(activeChannelId)
   if (availableItems.length > 0) {
    setSnapshot((current) => ({
     channelId: activeChannelId,
     status: stale ? "refreshing" : "ready",
     items: availableItems,
     revision: current.revision + 1,
     source: availableSource,
     lastSyncedAt: current.channelId === activeChannelId ? current.lastSyncedAt : null,
     stale,
     error: null,
    }))
   }

   const shouldRefresh = connected && (options.force || stale || availableItems.length === 0)
   if (!shouldRefresh) {
    const next: VideoAssetCatalogSnapshot = {
     channelId: activeChannelId,
     status: availableItems.length > 0 ? "ready" : connected ? "restoring" : "error",
     items: availableItems,
     revision: snapshotRef.current.revision + 1,
     source: availableSource,
     lastSyncedAt: snapshotRef.current.lastSyncedAt,
     stale,
     error: availableItems.length === 0 && !connected
      ? { code: "auth", message: "Connect your YouTube channel to load video assets.", recoverable: true }
      : null,
    }
    setSnapshot(next)
    return next
   }

   abortRef.current?.abort()
   const controller = new AbortController()
   abortRef.current = controller
   try {
    const refreshed = await refreshVideoAssetCatalog(activeChannelId, controller.signal)
    const next: VideoAssetCatalogSnapshot = {
     channelId: activeChannelId,
     status: refreshed.items.length > 0 ? "ready" : "confirmed_empty",
     items: refreshed.items,
     revision: snapshotRef.current.revision + 1,
     source: "data_api",
     lastSyncedAt: refreshed.syncedAt,
     stale: false,
     error: null,
    }
    setSnapshot(next)
    return next
   } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
     return snapshotRef.current
    }
    const catalogError = error instanceof VideoAssetCatalogError
     ? error
     : new VideoAssetCatalogError("unknown", error instanceof Error ? error.message : "Video inventory refresh failed.")
    const next: VideoAssetCatalogSnapshot = {
     channelId: activeChannelId,
     status: "error",
     items: availableItems,
     revision: snapshotRef.current.revision + 1,
     source: availableSource,
     lastSyncedAt: snapshotRef.current.lastSyncedAt,
     stale: true,
     error: {
      code: catalogError.code,
      message: catalogError.message,
      recoverable: catalogError.recoverable,
     },
    }
    setSnapshot(next)
    return next
   }
  })().finally(() => {
   inFlightRef.current.delete(activeChannelId)
  })

 inFlightRef.current.set(activeChannelId, task)
 return task
 }, [channelId, connected, initialBootstrap])

 const restoreLocalCatalog = useCallback(async () => {
  const activeChannelId = String(channelId || "").trim()
  if (!activeChannelId) return
  const restoreGeneration = ++restoreGenerationRef.current
  const restored = await restoreVideoAssetCatalog(activeChannelId)
  if (restoreGeneration !== restoreGenerationRef.current || activeChannelId !== currentChannelIdRef.current) return
  setSnapshot((current) => {
   if (
    restoreGeneration !== restoreGenerationRef.current ||
    activeChannelId !== currentChannelIdRef.current ||
    (current.channelId === activeChannelId && (current.status === "refreshing" || (current.source === "data_api" && !current.stale)))
   ) return current
   return {
    channelId: activeChannelId,
    status: restored.items.length > 0 ? "ready" : "idle",
    items: restored.items,
    revision: current.revision + 1,
    source: restored.source,
    lastSyncedAt: current.channelId === activeChannelId ? current.lastSyncedAt : null,
    stale: isVideoAssetCatalogStale(activeChannelId),
    error: null,
   }
  })
 }, [channelId])

 useEffect(() => {
  void restoreLocalCatalog()
 }, [restoreLocalCatalog])

 useEffect(() => {
  const restoreFromLocalEvent = () => void restoreLocalCatalog()
  window.addEventListener("vt_auth_changed", restoreFromLocalEvent)
  window.addEventListener("yt_analytics_synced", restoreFromLocalEvent)
  window.addEventListener("canonical_store_updated", restoreFromLocalEvent)
  window.addEventListener("vt_video_asset_catalog_updated", restoreFromLocalEvent)
  return () => {
   window.removeEventListener("vt_auth_changed", restoreFromLocalEvent)
   window.removeEventListener("yt_analytics_synced", restoreFromLocalEvent)
   window.removeEventListener("canonical_store_updated", restoreFromLocalEvent)
   window.removeEventListener("vt_video_asset_catalog_updated", restoreFromLocalEvent)
  }
 }, [restoreLocalCatalog])

 const search = useCallback((query: string, limit = 50): VideoAsset[] => {
  const normalized = query.trim().toLowerCase()
  const matches = normalized
   ? snapshot.items.filter((item) =>
      item.title.toLowerCase().includes(normalized) || item.videoId.toLowerCase().includes(normalized),
     )
   : snapshot.items
  return matches.slice(0, Math.max(1, limit))
 }, [snapshot.items])

 const value = useMemo<VideoAssetCatalogContextValue>(() => ({
  snapshot,
  connected,
  ensure,
  search,
 }), [connected, ensure, search, snapshot])

 return <VideoAssetCatalogContext.Provider value={value}>{children}</VideoAssetCatalogContext.Provider>
}

export const useVideoAssetCatalog = (): VideoAssetCatalogContextValue => {
 const value = useContext(VideoAssetCatalogContext)
 if (!value) throw new Error("useVideoAssetCatalog must be used within VideoAssetCatalogProvider")
 return value
}
