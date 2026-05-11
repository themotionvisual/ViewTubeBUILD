// src/context/GlobalDataContext.tsx
import React, {
 useState,
 useCallback,
 useEffect,
} from "react"
import type { ReactNode } from "react"
import type {
 WorkspaceBrain,
 AppTool,
 AuthState,
 ChannelAnalysisSyncStatus,
 VideoSyncBatchState,
 VideoRetentionCache,
 Project,
 BrainMemorySchema,
} from "../types"
import { unifiedAuth } from "../services/authSession"
import { clearAnalyticsStateForFreshSync } from "../services/localDataReset"
import { readYouTubeAnalyticsCache } from "../services/canonicalAnalyticsStore"
import {
 fetchDailyMetrics,
 fetchRetentionCurve,
} from "../services/youtubeDataFetcher"
import {
 STORAGE_KEY,
 AUTH_STORAGE_KEY,
 defaultBrain,
 defaultAuthState,
 defaultSyncStatus,
 defaultSyncBatch,
 GlobalDataContext,
} from "./GlobalDataContextTypes"
import type { GlobalDataContextProps } from "./GlobalDataContextTypes"
import { emitSignal, consultBrain, getBrainMemory, reflectAndCompress, initializeBrain } from "../services/brain"


const loadPersistedBrain = (): WorkspaceBrain => {
 try {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
   const parsed = JSON.parse(saved) as Partial<WorkspaceBrain> & {
    channelHub?: Partial<WorkspaceBrain["channelHub"]>
   }

   return {
    ...defaultBrain,
    ...parsed,
    activeProviders:
     Array.isArray(parsed.activeProviders) ?
      parsed.activeProviders
     : defaultBrain.activeProviders,
    seoState: {
     ...defaultBrain.seoState,
     ...(parsed.seoState || {}),
     winningKeywords:
      Array.isArray(parsed.seoState?.winningKeywords) ?
       parsed.seoState.winningKeywords
      : [],
     results:
      Array.isArray(parsed.seoState?.results) ? parsed.seoState.results : [],
    },
    storyboardState: {
     ...defaultBrain.storyboardState,
     ...(parsed.storyboardState || {}),
     scenes:
      Array.isArray(parsed.storyboardState?.scenes) ?
       parsed.storyboardState.scenes
      : [],
    },
    thumbnailState: {
     ...defaultBrain.thumbnailState,
     ...(parsed.thumbnailState || {}),
    },
    analyticalConstraints: {
     ...defaultBrain.analyticalConstraints,
     ...(parsed.analyticalConstraints || {}),
     provenFormats:
      Array.isArray(parsed.analyticalConstraints?.provenFormats) ?
       parsed.analyticalConstraints.provenFormats
      : [],
     forbiddenTopics:
      Array.isArray(parsed.analyticalConstraints?.forbiddenTopics) ?
       parsed.analyticalConstraints.forbiddenTopics
      : [],
    },
    calendarState: {
     ...defaultBrain.calendarState,
     ...(parsed.calendarState || {}),
     dayTasks: parsed.calendarState?.dayTasks || {},
    },
    channelHub: {
     ...defaultBrain.channelHub,
     ...(parsed.channelHub || {}),
     toDos:
      Array.isArray(parsed.channelHub?.toDos) ? parsed.channelHub.toDos : [],
     goals:
      Array.isArray(parsed.channelHub?.goals) ? parsed.channelHub.goals : [],
    },
    channelyticsState: {
     ...defaultBrain.channelyticsState,
     ...(parsed.channelyticsState || {}),
     csvFiles:
      Array.isArray(parsed.channelyticsState?.csvFiles) ?
       parsed.channelyticsState.csvFiles
      : [],
     allData:
      Array.isArray(parsed.channelyticsState?.allData) ?
       parsed.channelyticsState.allData
      : [],
     analyticsResult: parsed.channelyticsState?.analyticsResult || null,
    },
    researchLabState: {
     ...defaultBrain.researchLabState,
     ...(parsed.researchLabState || {}),
     csvFiles:
      Array.isArray(parsed.researchLabState?.csvFiles) ?
       parsed.researchLabState.csvFiles
      : [],
     allData:
      Array.isArray(parsed.researchLabState?.allData) ?
       parsed.researchLabState.allData
      : [],
     analyticsResult: parsed.researchLabState?.analyticsResult || null,
    },
    videoFlags: parsed.videoFlags || {},
    projects: Array.isArray(parsed.projects) ? parsed.projects : [],
    activeProjectId: parsed.activeProjectId || null,
    journalEntries:
     Array.isArray(parsed.journalEntries) ? parsed.journalEntries : [],
    journalFollowUps:
     Array.isArray(parsed.journalFollowUps) ? parsed.journalFollowUps : [],
    microPolls: Array.isArray(parsed.microPolls) ? parsed.microPolls : [],
    creatorPreferences: parsed.creatorPreferences || {},
    lastSyncDate:
     parsed.lastSyncDate || localStorage.getItem("vt_last_sync_date") || null,
    retentionCache:
     parsed.retentionCache ||
     JSON.parse(localStorage.getItem("vt_retention_cache") || "{}"),
   }
  }
 } catch (e) {
  console.warn("[Brain] Failed to load persisted state:", e)
 }
 return defaultBrain
}

const loadPersistedAuth = (): AuthState => {
 try {
  const saved = localStorage.getItem(AUTH_STORAGE_KEY)
  if (saved) {
   return {
    ...defaultAuthState,
    ...JSON.parse(saved),
    isAuthenticated: unifiedAuth.isAuthenticated(),
   }
  }
 } catch (e) {
  console.warn("[Auth] Failed to load persisted state:", e)
 }
 return { ...defaultAuthState, isAuthenticated: unifiedAuth.isAuthenticated() }
}

// ... moved fallbackContext to types file ...

export const GlobalDataProvider: React.FC<{ children: ReactNode }> = ({
 children,
}) => {
 useEffect(() => {
  initializeBrain().catch(e => console.error("Brain initialization failed:", e));
 }, []);
 const [brain, setBrain] = useState<WorkspaceBrain>(loadPersistedBrain)
 const [authState, setAuthStateRaw] = useState<AuthState>(loadPersistedAuth)
 const [isSyncing, setIsSyncing] = useState<boolean>(false)
 const [lastSyncComplete, setLastSyncComplete] = useState<string | null>(
  localStorage.getItem("yt_analytics_last_sync") || null,
 )
 const [syncStatus, setSyncStatus] =
  useState<ChannelAnalysisSyncStatus>(defaultSyncStatus)
 const [syncBatch, setSyncBatch] = useState<VideoSyncBatchState>(() => {
  try {
   const raw = localStorage.getItem("vt_video_sync_batch_state")
   if (!raw) return defaultSyncBatch
   return {
    ...defaultSyncBatch,
    ...(JSON.parse(raw) as Partial<VideoSyncBatchState>),
   }
  } catch {
   return defaultSyncBatch
  }
 })

 const globalSyncData = useCallback(
  async (options?: { batchMode?: "initial" | "next" }) => {
   setIsSyncing(true)
   try {
    if ((options?.batchMode || "initial") === "initial") {
     await clearAnalyticsStateForFreshSync()
    }
    const { syncCoordinator } = await import("../services/SyncCoordinator")
    await syncCoordinator.syncYouTube(true, {
     batchMode: options?.batchMode || "initial",
    })
    setLastSyncComplete(new Date().toISOString())
     
     // Update auth state with latest channel stats from sync
     try {
       const cache = readYouTubeAnalyticsCache()
       if (cache.profile?.statistics) {
         setAuthStateRaw(prev => ({
           ...prev,
           subscriberCount: cache.profile.statistics.subscriberCount || prev.subscriberCount,
           totalViews: cache.profile.statistics.viewCount || prev.totalViews,
           videoCount: cache.profile.statistics.videoCount || prev.videoCount
         }))
       }
     } catch (err) {
       console.warn("Failed to update auth state from sync cache:", err)
     }

     try {
       const raw = localStorage.getItem("vt_video_sync_batch_state")
     if (raw) {
      setSyncBatch({
       ...defaultSyncBatch,
       ...(JSON.parse(raw) as Partial<VideoSyncBatchState>),
      })
     }
    } catch {
     // no-op
    }
   } catch (e) {
    console.warn("Global sync failed:", e)
   } finally {
    setIsSyncing(false)
   }
  },
  [],
 )

 const updateBrain = useCallback((updates: Partial<WorkspaceBrain>) => {
  setBrain((prev) => ({ ...prev, ...updates }))
 }, [])

 const syncMetrics = useCallback(
  async (force: boolean = false) => {
   const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

   if (!force && brain.lastSyncDate === today) {
    console.log("Metrics already synced today. Using cached data.")
    return
   }

   console.log("Initiating daily metrics sync...")
   const channelId = authState.channelHandle || "MINE"
   const videoIds = brain.channelyticsState.allData
    .map((v) => v.videoId)
    .filter(Boolean)

   try {
    // 1. Fetch dynamic daily metrics (views, revenue, etc.)
    const dailyData = await fetchDailyMetrics(channelId, today)
    console.log("Fetched daily metrics:", dailyData)

    // 2. Fetch and lock moment-by-moment retention data (if not already cached)
    const newRetentionCache: VideoRetentionCache = { ...brain.retentionCache }
    for (const videoId of videoIds) {
     if (!newRetentionCache[videoId]) {
      console.log(`Fetching retention curve for video: ${videoId}`)
      try {
       const retentionCurve = await fetchRetentionCurve(videoId)
       newRetentionCache[videoId] = retentionCurve
       console.log(`Locked retention data for ${videoId}`)
      } catch (e) {
       console.warn(`Failed to fetch retention for ${videoId}`, e)
      }
     }
    }

    // Update the brain state with new data and sync date
    updateBrain({
     lastSyncDate: today,
     retentionCache: newRetentionCache,
    })

    localStorage.setItem("vt_last_sync_date", today)
    localStorage.setItem(
     "vt_retention_cache",
     JSON.stringify(newRetentionCache),
    )
    console.log("Metrics sync complete.")
   } catch (error) {
    console.error("Error during metrics sync:", error)
   }
  },
  [
   brain.lastSyncDate,
   brain.retentionCache,
   brain.channelyticsState.allData,
   authState.channelHandle,
   updateBrain,
  ],
 )

  useEffect(() => {
    const onStatus = (event: Event) => {
      const detail = (event as CustomEvent<ChannelAnalysisSyncStatus>).detail
      if (!detail) return
      setSyncStatus(detail)
    }
    const onAuthMetadata = (event: Event) => {
      const detail = (event as CustomEvent<any>).detail
      if (!detail || !detail.statistics) return
      
      console.log("[GlobalData] Authoritative metadata received. Updating UI widgets.")
      setAuthStateRaw(prev => ({
        ...prev,
        channelName: detail.title || prev.channelName,
        channelHandle: detail.customUrl || prev.channelHandle,
        channelThumbnail: detail.thumbnail || prev.channelThumbnail,
        subscriberCount: Number(detail.statistics.subscriberCount),
        totalViews: Number(detail.statistics.viewCount),
        videoCount: Number(detail.statistics.videoCount)
      }))
    }
    const onFastAnalytics = (event: Event) => {
      const detail = (event as CustomEvent<any>).detail
      if (!detail) return
      
      console.log("[GlobalData] Fast analytics received. Updating revenue widgets.")
      setAuthStateRaw(prev => ({
        ...prev,
        fastAnalytics: detail
      }))
    }
    const onRecentVideos = (event: Event) => {
      const detail = (event as CustomEvent<any>).detail
      if (!Array.isArray(detail)) return
      
      console.log(`[GlobalData] Recent videos snapshot received (${detail.length}). Updating brain.`)
      setBrain(prev => ({
        ...prev,
        channelyticsState: {
          ...prev.channelyticsState,
          allData: detail // Initial snapshot
        }
      }))
    }

    window.addEventListener("vt_channel_sync_status", onStatus as EventListener)
    window.addEventListener("yt_channel_metadata_synced", onAuthMetadata as EventListener)
    window.addEventListener("yt_fast_analytics_synced", onFastAnalytics as EventListener)
    window.addEventListener("yt_recent_videos_synced", onRecentVideos as EventListener)
    const onDeepSegments = (event: Event) => {
      const detail = (event as CustomEvent<any>).detail
      console.log(`[GlobalData] Deep segments received. Updating brain.`)
      setBrain(prev => ({
        ...prev,
        channelyticsState: {
          ...prev.channelyticsState,
          deepSegments: detail
        }
      }))
    }
    window.addEventListener("yt_deep_segments_synced", onDeepSegments as EventListener)
    
    return () => {
      window.removeEventListener("vt_channel_sync_status", onStatus as EventListener)
      window.removeEventListener("yt_channel_metadata_synced", onAuthMetadata as EventListener)
      window.removeEventListener("yt_fast_analytics_synced", onFastAnalytics as EventListener)
      window.removeEventListener("yt_recent_videos_synced", onRecentVideos as EventListener)
      window.removeEventListener("yt_deep_segments_synced", onDeepSegments as EventListener)
    }
  }, [])

  // Auto-Restore Fast Boot Data (Step 1.5 & 1.7)
  // Triggers if authenticated but missing financial totals or recent videos.
  useEffect(() => {
    if (!authState.isAuthenticated) return

    const restoreFastBoot = async () => {
      const lastSync = authState.fastAnalytics?.lastSyncedAt || authState.syncedAt
      const isStale = lastSync ? (Date.now() - new Date(lastSync).getTime() > 4 * 60 * 60 * 1000) : true
      const hasFastAnalytics = !!authState.fastAnalytics
      const hasRecentVideos = brain.channelyticsState.allData.length > 0

      if (!hasFastAnalytics || !hasRecentVideos || isStale) {
        console.log(`♻️ AUTH RESTORE: Data is ${isStale ? "STALE" : "MISSING"}. Triggering Auto-Restore...`)
        try {
          const { syncAuthoritativeMetadata, syncFastAnalyticsTotals, syncRecentVideoSnapshot } = await import("../services/youtube/coreLifetimeSync")
          const meta = await syncAuthoritativeMetadata()
          await syncFastAnalyticsTotals()
          if (meta.uploadsPlaylistId) {
            await syncRecentVideoSnapshot(meta.uploadsPlaylistId)
          }
        } catch (err) {
          console.warn("Auto-restore fast boot failed:", err)
        }
      }
    }

    restoreFastBoot()
  }, [authState.isAuthenticated])

 useEffect(() => {
  // Keep last sync timestamp in sync with any cache reset actions.
  const onLocalDataChanged = () => {
   try {
    setLastSyncComplete(localStorage.getItem("yt_analytics_last_sync") || null)
   } catch {
    setLastSyncComplete(null)
   }
  }
  window.addEventListener("vt_local_data_changed", onLocalDataChanged)
  window.addEventListener("storage", onLocalDataChanged)
  return () => {
   window.removeEventListener("vt_local_data_changed", onLocalDataChanged)
   window.removeEventListener("storage", onLocalDataChanged)
  }
 }, [])

 useEffect(() => {
  try {
   const persistable = { ...brain }
   const toSave = {
    ...persistable,
    channelyticsState: { csvFiles: [], allData: [], analyticsResult: null },
    researchLabState: { csvFiles: [], allData: [], analyticsResult: null },
   }
   localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  } catch (e) {
   console.warn("[Brain] Failed to persist state:", e)
  }
 }, [brain])

 useEffect(() => {
  try {
   localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState))
  } catch (e) {
   console.warn("[Auth] Failed to persist state:", e)
  }
 }, [authState])

 const registerProvider = useCallback((tool: AppTool) => {
  setBrain((prev) => {
   if (prev.activeProviders.includes(tool)) return prev
   return { ...prev, activeProviders: [...prev.activeProviders, tool] }
  })
 }, [])

 const unregisterProvider = useCallback((tool: AppTool) => {
  setBrain((prev) => {
   const filtered = prev.activeProviders.filter((p) => p !== tool)
   if (filtered.length === prev.activeProviders.length) return prev
   return { ...prev, activeProviders: filtered }
  })
 }, [])

 const setSeoState = useCallback(
  (updates: Partial<WorkspaceBrain["seoState"]>) => {
   setBrain((prev) => ({
    ...prev,
    seoState: { ...prev.seoState, ...updates },
   }))
  },
  [],
 )

 const setStoryboardState = useCallback(
  (updates: Partial<WorkspaceBrain["storyboardState"]>) => {
   setBrain((prev) => ({
    ...prev,
    storyboardState: { ...prev.storyboardState, ...updates },
   }))
  },
  [],
 )

 const setThumbnailState = useCallback(
  (updates: Partial<WorkspaceBrain["thumbnailState"]>) => {
   setBrain((prev) => ({
    ...prev,
    thumbnailState: { ...prev.thumbnailState, ...updates },
   }))
  },
  [],
 )

 const addProject = useCallback((project: Project) => {
  setBrain((prev) => ({
   ...prev,
   projects: [...prev.projects, project],
  }))
 }, [])

 const updateProject = useCallback((id: string, updates: Partial<Project>) => {
  setBrain((prev) => ({
   ...prev,
   projects: prev.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
  }))
 }, [])

 const deleteProject = useCallback((id: string) => {
  setBrain((prev) => ({
   ...prev,
   projects: prev.projects.filter((p) => p.id !== id),
  }))
 }, [])

 const setActiveProject = useCallback((id: string | null) => {
  setBrain((prev) => ({
   ...prev,
   activeProjectId: id,
  }))
 }, [])

 const setVideoFlags = useCallback(
  (
   videoId: string,
   flags: {
    excludeAnalysis?: boolean
    includeOnly?: boolean
    priorityAnalysis?: boolean
   },
  ) => {
   setBrain((prev) => ({
    ...prev,
    videoFlags: {
     ...prev.videoFlags,
     [videoId]: {
      ...(prev.videoFlags[videoId] || {}),
      ...flags,
     },
    },
   }))
  },
  [],
 )

 const setCalendarState = useCallback(
  (updates: Partial<WorkspaceBrain["calendarState"]>) => {
   setBrain((prev) => ({
    ...prev,
    calendarState: { ...prev.calendarState, ...updates },
   }))
  },
  [],
 )

 const setChannelHub = useCallback(
  (updates: Partial<WorkspaceBrain["channelHub"]>) => {
   setBrain((prev) => ({
    ...prev,
    channelHub: { ...prev.channelHub, ...updates },
   }))
  },
  [],
 )

 const setResearchLabState = useCallback(
  (updates: Partial<WorkspaceBrain["researchLabState"]>) => {
   setBrain((prev) => ({
    ...prev,
    researchLabState: { ...prev.researchLabState, ...updates },
   }))
  },
  [],
 )

 const setAuthState = useCallback((updates: Partial<AuthState>) => {
  setAuthStateRaw((prev) => ({ ...prev, ...updates }))
 }, [])

 const login = useCallback(async () => {
  try {
   await unifiedAuth.login()
   setAuthStateRaw((prev) => ({ ...prev, isAuthenticated: true }))
   // Fast Boot: Only sync channel metadata on login.
    // Full video + analytics sync requires manual "Sync Data" click.
    try {
     const { syncAuthoritativeMetadata, syncFastAnalyticsTotals, syncRecentVideoSnapshot } = await import("../services/youtube/coreLifetimeSync")
     const meta = await syncAuthoritativeMetadata()
     await syncFastAnalyticsTotals()
     
     // Step 1.7: Recent Video Snapshot
     if (meta.uploadsPlaylistId) {
        await syncRecentVideoSnapshot(meta.uploadsPlaylistId)
     }
    } catch (metaErr) {
    console.warn("Fast boot metadata sync failed:", metaErr)
   }
  } catch (err) {
   console.warn("User aborted login or auth failed", err)
  }
 }, [])

 const logout = useCallback(() => {
  setAuthStateRaw(defaultAuthState)
  unifiedAuth.logout()
 }, [])

 return (
  <GlobalDataContext.Provider
   value={{
    brain,
    updateBrain,
    registerProvider,
    unregisterProvider,
    setSeoState,
    setStoryboardState,
    setThumbnailState,
    addProject,
    updateProject,
    deleteProject,
    setCalendarState,
    setChannelHub,
    setResearchLabState,
    setActiveProject,
    setVideoFlags,
    authState,
    setAuthState,
    researchLabState: brain.researchLabState,
    login,
    logout,
    isSyncing,
    lastSyncComplete,
    syncStatus,
    syncBatch,
    globalSyncData,
    syncMetrics,
    addJournalEntry: (content: string, category: any) => {
     const entry = {
      id: crypto.randomUUID(),
      content,
      category,
      timestamp: Date.now(),
     }
     setBrain((prev) => ({
      ...prev,
      journalEntries: [entry, ...prev.journalEntries],
     }))
     return entry
    },
    addFollowUp: (entryId: string, question: string) => {
     setBrain((prev) => ({
      ...prev,
      journalFollowUps: [
       { id: crypto.randomUUID(), entryId, question, timestamp: Date.now() },
       ...prev.journalFollowUps,
      ],
     }))
    },
    answerFollowUp: (id: string, answer: string) => {
     setBrain((prev) => ({
      ...prev,
      journalFollowUps: prev.journalFollowUps.map((f) =>
       f.id === id ? { ...f, answer } : f,
      ),
     }))
    },
    answerMicroPoll: (id: string, answer: string) => {
     setBrain((prev) => ({
      ...prev,
      microPolls: prev.microPolls.map((p) =>
       p.id === id ? { ...p, answer } : p,
      ),
      creatorPreferences: { ...prev.creatorPreferences, [id]: answer }, // Optimization: cache as pref
     }))
    },
    setMicroPolls: (polls: any[]) => {
     setBrain((prev) => ({ ...prev, microPolls: polls }))
    },
    emitSignal,
    consultBrain,
    getBrainMemory,
    reflectAndCompress,
   }}>
   {children}
 </GlobalDataContext.Provider>
 )
}
