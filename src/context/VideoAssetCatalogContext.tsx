import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { useSimpleAuth } from "../auth/AuthProvider"
import { fetchSimpleVideoInventory } from "../services/simpleYouTubeApi"
import {
 EMPTY_VIDEO_ASSET_CATALOG,
 restoreVideoAssetCatalog,
 type VideoAsset,
 type VideoAssetCatalogSnapshot,
} from "../services/videoAssets"
import { recordDiagnostic } from "../services/diagnostics"

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

const toVideoAsset = (channelId: string, video: any): VideoAsset => ({
 channelId,
 videoId: String(video.videoId || ""),
 title: String(video.title || `Untitled video (${video.videoId || ""})`),
 thumbnailUrl: String(video.thumbnail || `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`),
 publishedAt: String(video.publishedAt || "") || null,
 durationSeconds: null,
 format: "unknown",
})

export const VideoAssetCatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
 const auth = useSimpleAuth()
 const connected = auth.session.status === "ready" && auth.session.capabilities.youtubeRead
 const channelId = String(auth.session.channel?.id || "").trim()
 const [snapshot, setSnapshot] = useState<VideoAssetCatalogSnapshot>(EMPTY_VIDEO_ASSET_CATALOG)
 const snapshotRef = useRef<VideoAssetCatalogSnapshot>(EMPTY_VIDEO_ASSET_CATALOG)
 const inFlightRef = useRef<Map<string, Promise<VideoAssetCatalogSnapshot>>>(new Map())
 const generationRef = useRef(0)

 useEffect(() => { snapshotRef.current = snapshot }, [snapshot])

 const restore = useCallback(async () => {
  const generation = ++generationRef.current
  if (!channelId) {
   const next = { ...EMPTY_VIDEO_ASSET_CATALOG, revision: snapshotRef.current.revision + 1 }
   setSnapshot(next)
   return next
  }
  const restored = await restoreVideoAssetCatalog(channelId)
  if (generation !== generationRef.current) return snapshotRef.current
  const next: VideoAssetCatalogSnapshot = {
   channelId,
   status: restored.items.length ? "ready" : "idle",
   items: restored.items,
   revision: snapshotRef.current.revision + 1,
   source: restored.source,
   lastSyncedAt: snapshotRef.current.channelId === channelId ? snapshotRef.current.lastSyncedAt : null,
   stale: true,
   error: null,
  }
  setSnapshot(next)
  return next
 }, [channelId])

 const ensure = useCallback(async (_options: EnsureVideoAssetCatalogOptions = {}) => {
  if (!channelId) {
   const next: VideoAssetCatalogSnapshot = {
    ...EMPTY_VIDEO_ASSET_CATALOG,
    revision: snapshotRef.current.revision + 1,
    error: connected ? null : { code: "auth", message: "Connect your YouTube channel to load video assets.", recoverable: true },
   }
   setSnapshot(next)
   return next
  }

  const existing = inFlightRef.current.get(channelId)
  if (existing) return existing

  const task = (async (): Promise<VideoAssetCatalogSnapshot> => {
   const local = await restoreVideoAssetCatalog(channelId)
   if (!connected) {
    const next: VideoAssetCatalogSnapshot = {
     channelId,
     status: local.items.length ? "ready" : "error",
     items: local.items,
     revision: snapshotRef.current.revision + 1,
     source: local.source,
     lastSyncedAt: snapshotRef.current.lastSyncedAt,
     stale: true,
     error: local.items.length ? null : { code: "auth", message: "Connect your YouTube channel to load video assets.", recoverable: true },
    }
    setSnapshot(next)
    return next
   }

   setSnapshot((current) => ({
    ...(current.channelId === channelId ? current : EMPTY_VIDEO_ASSET_CATALOG),
    channelId,
    status: current.items.length ? "refreshing" : "restoring",
    revision: current.revision + 1,
    error: null,
   }))

   try {
    const inventory = await fetchSimpleVideoInventory()
    const items = inventory.videos.map((video) => toVideoAsset(channelId, video))
    const next: VideoAssetCatalogSnapshot = {
     channelId,
     status: items.length ? "ready" : "confirmed_empty",
     items,
     revision: snapshotRef.current.revision + 1,
     source: "data_api",
     lastSyncedAt: new Date().toISOString(),
     stale: false,
     error: null,
    }
    setSnapshot(next)
    window.dispatchEvent(new CustomEvent("vt_video_asset_catalog_updated", { detail: { channelId, count: items.length, syncedAt: next.lastSyncedAt } }))
    return next
   } catch (error) {
    const message = error instanceof Error ? error.message : "Video inventory refresh failed."
    recordDiagnostic("warn", "video-assets", message)
    const next: VideoAssetCatalogSnapshot = {
     channelId,
     status: "error",
     items: local.items,
     revision: snapshotRef.current.revision + 1,
     source: local.source,
     lastSyncedAt: snapshotRef.current.lastSyncedAt,
     stale: true,
     error: { code: /401|session|auth/i.test(message) ? "auth" : "unknown", message, recoverable: true },
    }
    setSnapshot(next)
    return next
   }
  })().finally(() => inFlightRef.current.delete(channelId))

  inFlightRef.current.set(channelId, task)
  return task
 }, [channelId, connected])

 useEffect(() => { void restore() }, [restore])

 useEffect(() => {
  if (!connected || !channelId) return
  void ensure({ reason: "boot" })
 }, [channelId, connected, ensure])

 useEffect(() => {
  const refresh = () => void ensure({ reason: "event", force: true })
  window.addEventListener("vt_auth_changed", refresh)
  window.addEventListener("yt_analytics_synced", refresh)
  window.addEventListener("canonical_store_updated", refresh)
  return () => {
   window.removeEventListener("vt_auth_changed", refresh)
   window.removeEventListener("yt_analytics_synced", refresh)
   window.removeEventListener("canonical_store_updated", refresh)
  }
 }, [ensure])

 const search = useCallback((query: string, limit = 50) => {
  const normalized = query.trim().toLowerCase()
  const matches = normalized
   ? snapshot.items.filter((item) => item.title.toLowerCase().includes(normalized) || item.videoId.toLowerCase().includes(normalized))
   : snapshot.items
  return matches.slice(0, Math.max(1, limit))
 }, [snapshot.items])

 const value = useMemo<VideoAssetCatalogContextValue>(() => ({ snapshot, connected, ensure, search }), [connected, ensure, search, snapshot])
 return <VideoAssetCatalogContext.Provider value={value}>{children}</VideoAssetCatalogContext.Provider>
}

export const useVideoAssetCatalog = (): VideoAssetCatalogContextValue => {
 const value = useContext(VideoAssetCatalogContext)
 if (!value) throw new Error("useVideoAssetCatalog must be used within VideoAssetCatalogProvider")
 return value
}
