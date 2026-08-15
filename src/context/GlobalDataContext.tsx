// src/context/GlobalDataContext.tsx
import React, {
 useState,
 useCallback,
 useEffect,
 useRef,
 startTransition,
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
} from "../types"
import { syncChannelBootstrap } from "../services/canonicalSync/channelBootstrapSync"
import { unifiedAuth } from "../services/auth/authSession"
import {
 beginAccountIntent,
 isAccountServerUnavailableError,
 fetchUnifiedAccountSnapshot,
 isUnifiedAccountServerEnabled,
} from "../services/account/accountCoordinator"
import { resolveAccountIntent } from "../services/account/accountContracts"
import type { UnifiedAccountSnapshot } from "../services/account/accountContracts"
import { requestGoogleOAuthTermsConsent } from "../services/googleOAuthConsent"
import { readYouTubeAnalyticsCache } from "../services/analytics/DataStore"
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
 defaultChannelIdentity,
 defaultInitialDashboardHydrationStatus,
 GlobalDataContext,
} from "./GlobalDataContextTypes"
import type { AnalyticsSyncAction } from "../services/analytics/SyncPipeline"
import {
 emitSignal,
 consultBrain,
 getBrainMemory,
 reflectAndCompress,
 initializeBrain,
 runFirstRunBrainOnboardingBootstrap,
 refreshToolContextPack,
} from "../services/brain"
// Import directly from the leaf modules rather than the feature barrel — the
// barrel re-exports the entire vt-sync-local surface (localSyncEngine,
// tableRegistry, adapters), which is ~120 kB of code that we do not want to
// pay for on the first-paint entry chunk.
import { applyVtSyncPrivacyFilters } from "../features/vt-sync-local/adapters/privacyPolicy"
import { getVtSyncSnapshot } from "../features/vt-sync-local/adapters/snapshot"
import { resolveChannelConnectionSnapshot } from "../services/connectionState"
import type {
 ChannelBootPhase,
 ChannelIdentitySnapshot,
 InitialDashboardHydrationStatus,
} from "../types"

let lastAuthAbortLogAt = 0

const isPresent = (value: unknown) =>
 value !== null && value !== undefined && String(value).trim() !== ""

const isUnauthorizedError = (error: unknown): boolean => {
 const candidate = error as { code?: unknown; message?: unknown } | null
 const message = String(candidate?.message || error || "").toLowerCase()
 return (
  candidate?.code === 401 ||
  message === "unauthorized" ||
  message.includes("authorization expired") ||
  message.includes("please reconnect your channel")
 )
}

const isLoginAbortError = (error: unknown): boolean => {
 const message = String((error as { message?: unknown } | null)?.message || error || "").toLowerCase()
 return (
  message.includes("popup") ||
  message.includes("timed out") ||
  message.includes("cancel") ||
  message.includes("aborted")
 )
}

const ensureLoginToken = (): string => {
 const token = unifiedAuth.getAccessToken()
 if (!token) {
  throw Object.assign(
   new Error("Channel authorization failed; reconnect required."),
   { code: 401, stage: "login_token_validation" },
  )
 }
 return token
}

const mergeDefined = <T,>(incoming: T | null | undefined, current: T | null | undefined) =>
 incoming !== null && incoming !== undefined ? incoming : current

const toFiniteNumber = (value: unknown): number | null => {
 const parsed = Number(value)
 return Number.isFinite(parsed) ? parsed : null
}

const preferNonZeroFinite = (
 incoming: unknown,
 fallback: unknown,
): number | null => {
 const nextValue = toFiniteNumber(incoming)
 const fallbackValue = toFiniteNumber(fallback)
 if (nextValue == null) return fallbackValue
 if (nextValue === 0 && fallbackValue != null && fallbackValue > 0) return fallbackValue
 return nextValue
}

const getSubscriberCountGranularity = (value: number | null): number => {
 if (value == null) return 1
 const absValue = Math.abs(value)
 if (absValue >= 100000000) return 1000000
 if (absValue >= 10000000) return 100000
 if (absValue >= 1000000) return 10000
 if (absValue >= 100000) return 1000
 if (absValue >= 10000) return 100
 if (absValue >= 1000) return 10
 return 1
}

const preferPreciseSubscriberCount = (
 incoming: unknown,
 current: unknown,
): number | null => {
 const nextValue = toFiniteNumber(incoming)
 const currentValue = toFiniteNumber(current)
 if (nextValue == null) return currentValue
 if (currentValue == null) return nextValue
 if (nextValue === currentValue) return nextValue

 const nextGranularity = getSubscriberCountGranularity(nextValue)
 const currentGranularity = getSubscriberCountGranularity(currentValue)
 const nextLooksRounded =
  nextGranularity > 1 && Math.abs(nextValue % nextGranularity) < 1e-9
 const currentLooksRounded =
  currentGranularity > 1 && Math.abs(currentValue % currentGranularity) < 1e-9

 if (
  nextLooksRounded &&
  !currentLooksRounded &&
  Math.abs(nextValue - currentValue) < nextGranularity
 ) {
  return currentValue
 }

 return nextValue
}

const buildChannelIdentityFromSources = (
 auth: AuthState,
 cache?: Record<string, any> | null,
): ChannelIdentitySnapshot => {
 const profile = (cache?.profile || cache?.channelBaseline || {}) as Record<string, any>
 const summary = (cache?.channelLifetimeSummary || {}) as Record<string, any>
 const thumbnails = (profile.thumbnails || {}) as Record<string, { url?: string }>
 const avatarUrl =
  String(
   thumbnails.medium?.url ||
    thumbnails.high?.url ||
    thumbnails.default?.url ||
    profile.thumbnail ||
    auth.channelThumbnail ||
    "",
  ).trim() || null
 const name =
  String(profile.title || auth.channelName || "").trim() || null
 const handle =
  String(profile.customUrl || auth.channelHandle || "").trim() || null
 const channelId =
  String(profile.id || profile.channelId || auth.channelId || "").trim() || null
 const subscriberCount = preferPreciseSubscriberCount(
  summary.currentSubscribers,
  auth.subscriberCount,
 )
 const totalViews = preferNonZeroFinite(summary.lifetimeViews, auth.totalViews)
 const videoCount = preferNonZeroFinite(summary.publicVideoCount, auth.videoCount)
 const isVerified = Boolean(name && (handle || avatarUrl || subscriberCount !== null || totalViews !== null || videoCount !== null))
 const hasAnyIdentity = Boolean(channelId || name || handle || avatarUrl)

 return {
  channelId,
  name,
  handle,
  avatarUrl,
  subscriberCount: Number.isFinite(Number(subscriberCount)) ? Number(subscriberCount) : null,
  totalViews: Number.isFinite(Number(totalViews)) ? Number(totalViews) : null,
  videoCount: Number.isFinite(Number(videoCount)) ? Number(videoCount) : null,
  isVerified,
  isPartial: hasAnyIdentity && !isVerified,
  lastHydratedAt: String(profile.syncedAt || summary.syncedAt || auth.syncedAt || "").trim() || null,
 }
}

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
    performanceHubState: {
     ...defaultBrain.performanceHubState,
     ...(parsed.performanceHubState || {}),
     analyticsWindow:
      parsed.performanceHubState?.analyticsWindow ||
      defaultBrain.performanceHubState.analyticsWindow,
     syncSourceMode:
      parsed.performanceHubState?.syncSourceMode ||
      defaultBrain.performanceHubState.syncSourceMode,
     storageMode:
      parsed.performanceHubState?.storageMode ||
      defaultBrain.performanceHubState.storageMode,
     tableDataset:
      parsed.performanceHubState?.tableDataset ||
      defaultBrain.performanceHubState.tableDataset,
     tableSearch:
      typeof parsed.performanceHubState?.tableSearch === "string" ?
       parsed.performanceHubState.tableSearch
      : defaultBrain.performanceHubState.tableSearch,
     tableTag:
      typeof parsed.performanceHubState?.tableTag === "string" ?
       parsed.performanceHubState.tableTag
      : defaultBrain.performanceHubState.tableTag,
     selectedRowIds:
      Array.isArray(parsed.performanceHubState?.selectedRowIds) ?
       parsed.performanceHubState.selectedRowIds
      : defaultBrain.performanceHubState.selectedRowIds,
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
 // ── Phase 3: Defer heavy localStorage parsing off the critical render path ──
 // Start with lightweight defaults so the first React commit is instant.
 // Heavy JSON.parse of brain/auth/cache is scheduled via requestIdleCallback
 // and merged in once ready. Users see a skeleton for 1-2 frames at most.
 const [brain, setBrain] = useState<WorkspaceBrain>(defaultBrain)
 const [authState, setAuthStateRaw] = useState<AuthState>(() => ({
  ...defaultAuthState,
  isAuthenticated: unifiedAuth.isAuthenticated(),
 }))
 const [isAuthorizing, setIsAuthorizing] = useState(false)
 const [isSyncing, setIsSyncing] = useState<boolean>(false)
 const [channelIdentity, setChannelIdentity] = useState<ChannelIdentitySnapshot>(defaultChannelIdentity)
 const [channelBootPhase, setChannelBootPhase] = useState<ChannelBootPhase>("idle")
 const [initialDashboardHydrationStatus, setInitialDashboardHydrationStatus] =
  useState<InitialDashboardHydrationStatus>(defaultInitialDashboardHydrationStatus)
 const [lastSyncComplete, setLastSyncComplete] = useState<string | null>(null)
 const [syncStatus, setSyncStatus] =
  useState<ChannelAnalysisSyncStatus>(defaultSyncStatus)
 const [activeSyncAction, setActiveSyncAction] =
  useState<AnalyticsSyncAction | null>(null)
 const [activeSyncButtonId, setActiveSyncButtonId] = useState<string | null>(null)
 const [syncBatch, setSyncBatch] = useState<VideoSyncBatchState>(defaultSyncBatch)
 const [aiModel, setAiModel] = useState<string>("gemini-3.1-flash-lite")
 const loginBootPromiseRef = useRef<Promise<void> | null>(null)
 const hydratedFromStorageRef = useRef(false)

 // Deferred hydration: parse localStorage in an idle callback so the main
 // thread isn't blocked during first paint. On mobile this saves 300-1500ms.
 useEffect(() => {
  if (hydratedFromStorageRef.current) return
  hydratedFromStorageRef.current = true
  const schedule = typeof window.requestIdleCallback === "function"
   ? window.requestIdleCallback
   : (cb: () => void) => setTimeout(cb, 0)
  schedule(() => {
   const persistedBrain = loadPersistedBrain()
   const persistedAuth = loadPersistedAuth()
   const cache = readYouTubeAnalyticsCache()
   const identity = buildChannelIdentityFromSources(persistedAuth, cache)
   setBrain(persistedBrain)
   setAuthStateRaw(persistedAuth)
   setChannelIdentity(identity)
   setLastSyncComplete(localStorage.getItem("yt_analytics_last_sync") || null)
   try {
    const model = localStorage.getItem("vt_ai_model")
    if (model) setAiModel(model)
   } catch { /* ignore */ }
   try {
    const raw = localStorage.getItem("vt_video_sync_batch_state")
    if (raw) {
     const parsed = JSON.parse(raw) as Partial<VideoSyncBatchState>
     const parsedInitialLimit =
      typeof parsed.initialLimit === "number" && parsed.initialLimit > 500
       ? parsed.initialLimit
       : defaultSyncBatch.initialLimit
     setSyncBatch({ ...defaultSyncBatch, ...parsed, initialLimit: parsedInitialLimit })
    }
   } catch { /* ignore */ }
  })
 }, [])
  useEffect(() => {
    localStorage.setItem("vt_ai_model", aiModel)
  }, [aiModel])

 const bootstrapFirstRunBrain = useCallback(
  async (
   cache?: Record<string, any>,
   source: "auth_boot" | "manual_sync" | "event" = "manual_sync",
  ) => {
   try {
    const snapshot = await runFirstRunBrainOnboardingBootstrap({
     cache,
     vtSyncSnapshot: applyVtSyncPrivacyFilters(getVtSyncSnapshot()),
     source,
    })
    if (snapshot.toolContextPack) {
     await refreshToolContextPack(snapshot.toolContextPack.channelId)
    }
    if (snapshot.run?.status === "complete") {
     const run = snapshot.run
     const completedAt = run.completedAt || new Date().toISOString()
     setBrain((prev) => ({
      ...prev,
      contentDNA: snapshot.knowledgeModel?.niche?.[0]?.summary || prev.contentDNA,
      performanceLedger:
       snapshot.knowledgeModel?.growthOpportunities?.[0]?.summary ||
       prev.performanceLedger,
      futureStateMap:
       "Use first-run channel evidence to personalize sitewide tools, then ask owner-confirmed questions before making strong claims.",
      sitewideBrainContext:
       snapshot.toolContextPack?.contextBlock || prev.sitewideBrainContext,
      onboarding: {
       lastRunId: run.id,
       channelId: run.channelId,
       status: run.status,
       completedAt,
      },
     }))
    }
    return snapshot
   } catch (error) {
    console.warn("[BrainOnboarding] First-run bootstrap failed:", error)
    return null
   }
  },
  [],
 )

 const mergeChannelIdentity = useCallback((incoming: Partial<ChannelIdentitySnapshot>) => {
  const lastHydratedAt =
   String(incoming.lastHydratedAt || "").trim() || new Date().toISOString()
  setChannelIdentity((prev) => ({
   channelId: mergeDefined(incoming.channelId, prev.channelId) ?? null,
   name: isPresent(incoming.name) ? String(incoming.name).trim() : prev.name,
   handle: isPresent(incoming.handle) ? String(incoming.handle).trim() : prev.handle,
   avatarUrl: isPresent(incoming.avatarUrl) ? String(incoming.avatarUrl).trim() : prev.avatarUrl,
  subscriberCount:
    preferPreciseSubscriberCount(incoming.subscriberCount, prev.subscriberCount),
   totalViews:
    incoming.totalViews !== null && incoming.totalViews !== undefined
     ? Number(incoming.totalViews)
     : prev.totalViews,
   videoCount:
    incoming.videoCount !== null && incoming.videoCount !== undefined
     ? Number(incoming.videoCount)
     : prev.videoCount,
   isVerified: incoming.isVerified ?? prev.isVerified,
   isPartial: incoming.isPartial ?? prev.isPartial,
   lastHydratedAt,
  }))
 }, [])

 const applyChannelIdentity = useCallback((nextIdentity: Partial<ChannelIdentitySnapshot>) => {
  mergeChannelIdentity(nextIdentity)
  setAuthStateRaw((prev) => ({
   ...prev,
   channelId: isPresent(nextIdentity.channelId) ? String(nextIdentity.channelId).trim() : prev.channelId,
   channelName: isPresent(nextIdentity.name) ? String(nextIdentity.name).trim() : prev.channelName,
   channelHandle: isPresent(nextIdentity.handle) ? String(nextIdentity.handle).trim() : prev.channelHandle,
   channelThumbnail: isPresent(nextIdentity.avatarUrl) ? String(nextIdentity.avatarUrl).trim() : prev.channelThumbnail,
   subscriberCount:
    preferPreciseSubscriberCount(nextIdentity.subscriberCount, prev.subscriberCount),
   totalViews:
    nextIdentity.totalViews !== null && nextIdentity.totalViews !== undefined
     ? Number(nextIdentity.totalViews)
     : prev.totalViews,
   videoCount:
    nextIdentity.videoCount !== null && nextIdentity.videoCount !== undefined
     ? Number(nextIdentity.videoCount)
     : prev.videoCount,
   syncedAt: String(nextIdentity.lastHydratedAt || prev.syncedAt || "").trim() || prev.syncedAt || null,
  }))
  setBrain((prev) => ({
   ...prev,
   channelProfile: {
    ...(prev.channelProfile || {}),
    id: isPresent(nextIdentity.channelId) ? String(nextIdentity.channelId).trim() : prev.channelProfile?.id,
    name: isPresent(nextIdentity.name) ? String(nextIdentity.name).trim() : prev.channelProfile?.name,
    title: isPresent(nextIdentity.name) ? String(nextIdentity.name).trim() : prev.channelProfile?.title,
    channelHandle: isPresent(nextIdentity.handle) ? String(nextIdentity.handle).replace(/^@/, "").trim() : prev.channelProfile?.channelHandle,
    customUrl: isPresent(nextIdentity.handle) ? String(nextIdentity.handle).replace(/^@/, "").trim() : prev.channelProfile?.customUrl,
    thumbnail: isPresent(nextIdentity.avatarUrl) ? String(nextIdentity.avatarUrl).trim() : prev.channelProfile?.thumbnail,
    thumbnails:
     isPresent(nextIdentity.avatarUrl)
      ? {
         ...(prev.channelProfile?.thumbnails || {}),
         medium: { url: String(nextIdentity.avatarUrl).trim() },
         default: { url: String(nextIdentity.avatarUrl).trim() },
        }
      : prev.channelProfile?.thumbnails,
   },
  }))
 }, [mergeChannelIdentity])

 const hydrateAuthStateFromAnalyticsCache = useCallback(() => {
 try {
   const cache = readYouTubeAnalyticsCache()
   const profile = ((cache?.profile || {}) as Record<string, any>)
   const nextIdentity = buildChannelIdentityFromSources(authState, cache)
   if (Object.keys(profile).length === 0 && !nextIdentity.name && !nextIdentity.avatarUrl && !nextIdentity.channelId) return false
   const statistics = profile.statistics || {}
    setAuthStateRaw((prev) => ({
    ...prev,
    isAuthenticated: prev.isAuthenticated || unifiedAuth.isAuthenticated(),
    channelId: String(profile?.id || profile?.channelId || prev.channelId || "").trim() || prev.channelId || null,
    channelName: profile.title || prev.channelName,
    channelHandle: profile.customUrl || prev.channelHandle,
    channelThumbnail: profile.thumbnail || prev.channelThumbnail,
    subscriberCount:
     preferPreciseSubscriberCount(
      statistics.subscriberCount,
      prev.subscriberCount,
     ),
    totalViews:
     statistics.viewCount != null ? Number(statistics.viewCount) : prev.totalViews,
    videoCount:
     statistics.videoCount != null ?
     Number(statistics.videoCount)
     : prev.videoCount,
   }))
   applyChannelIdentity(nextIdentity)
   return true
  } catch (error) {
   console.warn("[GlobalData] Failed to hydrate auth state from analytics cache:", error)
   return false
  }
 }, [applyChannelIdentity, authState])

 const applyUnifiedAccountSnapshot = useCallback((snapshot: UnifiedAccountSnapshot) => {
  const authenticated = snapshot.authentication.status === "authenticated"
  const googleConnected =
   snapshot.google.status === "connected" ||
   snapshot.google.youtubeScopesGranted ||
   Boolean(snapshot.google.channelId)

  if (!authenticated) {
   setAuthStateRaw((prev) => ({
    ...prev,
    isAuthenticated: false,
   }))
   return
  }

  setAuthStateRaw((prev) => ({
   ...prev,
   isAuthenticated: true,
   channelId: snapshot.google.channelId || prev.channelId || null,
  }))
  if (googleConnected) {
   setChannelBootPhase((prev) => (prev === "idle" || prev === "oauth" ? "ready" : prev))
  }
  hydrateAuthStateFromAnalyticsCache()
 }, [hydrateAuthStateFromAnalyticsCache])

 useEffect(() => {
  const handleAnalyticsSynced = (event: Event) => {
   if (!unifiedAuth.isAuthenticated()) return
   const detail = (event as CustomEvent<Record<string, any>>).detail
   void bootstrapFirstRunBrain(detail || readYouTubeAnalyticsCache(), "event")
  }
  window.addEventListener("yt_analytics_synced", handleAnalyticsSynced as EventListener)
  return () => {
   window.removeEventListener("yt_analytics_synced", handleAnalyticsSynced as EventListener)
  }
 }, [bootstrapFirstRunBrain])

 useEffect(() => {
  const onUnifiedAccountSnapshotChanged = (event: Event) => {
   const snapshot = (event as CustomEvent<UnifiedAccountSnapshot>).detail
   if (!snapshot) return
   applyUnifiedAccountSnapshot(snapshot)
  }
  const onAuthChanged = () => {
   if (unifiedAuth.isAuthenticated()) {
    setAuthStateRaw((prev) => ({ ...prev, isAuthenticated: true }))
    hydrateAuthStateFromAnalyticsCache()
    return
   }
   void fetchUnifiedAccountSnapshot().then(applyUnifiedAccountSnapshot).catch(() => {
    setAuthStateRaw((prev) => ({ ...prev, isAuthenticated: false }))
   })
  }
  window.addEventListener("vt_account_snapshot_changed", onUnifiedAccountSnapshotChanged as EventListener)
  window.addEventListener("vt_auth_changed", onAuthChanged)
  return () => {
   window.removeEventListener("vt_account_snapshot_changed", onUnifiedAccountSnapshotChanged as EventListener)
   window.removeEventListener("vt_auth_changed", onAuthChanged)
  }
 }, [applyUnifiedAccountSnapshot, hydrateAuthStateFromAnalyticsCache])

  const globalSyncData = useCallback(
  async (options?: {
   batchMode?: "initial" | "next"
   syncAction?:
    | "core_video_data"
    | "daily_metrics"
    | "google_search"
    | "video_metrics"
    | "traffic"
    | "geography"
    | "audience"
    | "surfaces_discovery"
    | "revenue_monetization"
   | "reporting_bulk"
   | "comments"
   | "deep_data"
   syncButtonId?: string
   enrichmentMode?: "core" | "video_metrics" | "traffic" | "segments" | "all"
  }) => {
   setIsSyncing(true)
   setChannelBootPhase((prev) => (prev === "idle" ? "syncing" : prev === "ready" ? "syncing" : prev))
   setActiveSyncAction(options?.syncAction || "core_video_data")
   setActiveSyncButtonId(options?.syncButtonId || options?.syncAction || "core_video_data")
   window.dispatchEvent(
    new CustomEvent("vt_manual_sync_started", {
     detail: {
      batchMode: options?.batchMode || "initial",
      syncAction: options?.syncAction || null,
      syncButtonId: options?.syncButtonId || null,
      enrichmentMode: options?.enrichmentMode || null,
     },
    }),
   )
   try {
    if ((options?.batchMode || "initial") === "initial") {
     // await clearAnalyticsStateForFreshSync() // Stop depopulation, keep old data until new data arrives
    }
    const isFastLoginBoot =
     options?.enrichmentMode === "core" || options?.syncAction === "core_video_data"
    if (isFastLoginBoot) {
     const { syncCoordinator } = await import("../services/SyncCoordinator")
     await syncCoordinator.syncYouTube(true, {
      batchMode: options?.batchMode || "initial",
      syncAction: options?.syncAction,
      enrichmentMode: options?.enrichmentMode,
     })
    } else {
     const { runCanonicalDefaultSync } = await import("../services/canonicalSync")
     await runCanonicalDefaultSync()
    }
    setLastSyncComplete(new Date().toISOString())
     
     // Update auth state with latest channel stats from sync
    hydrateAuthStateFromAnalyticsCache()

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
    window.dispatchEvent(
     new CustomEvent("vt_manual_sync_completed", {
      detail: {
       batchMode: options?.batchMode || "initial",
       syncAction: options?.syncAction || null,
       syncButtonId: options?.syncButtonId || null,
       enrichmentMode: options?.enrichmentMode || null,
      },
     }),
    )
    if ((options?.batchMode || "initial") === "initial") {
     await bootstrapFirstRunBrain(readYouTubeAnalyticsCache(), "manual_sync")
    }
   } catch (e) {
    console.warn("Global sync failed:", e)
   } finally {
    setIsSyncing(false)
    setChannelBootPhase((prev) => (prev === "error" ? prev : "ready"))
    setActiveSyncAction(null)
    setActiveSyncButtonId(null)
   }
  },
  [bootstrapFirstRunBrain, hydrateAuthStateFromAnalyticsCache],
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
      if (detail.phase === "complete") {
        setChannelBootPhase("ready")
      } else if (detail.phase === "error") {
        setChannelBootPhase("error")
      }
    }
    const onAuthMetadata = (event: Event) => {
      const detail = (event as CustomEvent<any>).detail
      if (!detail || !detail.statistics) return
      
      console.log("[GlobalData] Authoritative metadata received. Updating UI widgets.")
      const handle = String(detail.customUrl || "").trim().replace(/^@/, "") || null
      const avatarUrl =
        String(
          detail.thumbnail ||
            detail.thumbnails?.medium?.url ||
            detail.thumbnails?.default?.url ||
            "",
        ).trim() || null
      applyChannelIdentity({
        channelId: String(detail.id || detail.channelId || "").trim() || null,
        name: String(detail.title || "").trim() || null,
        handle,
        avatarUrl,
        subscriberCount: preferPreciseSubscriberCount(
         detail.statistics.subscriberCount,
         channelIdentity.subscriberCount,
        ),
        totalViews: Number(detail.statistics.viewCount || 0) || 0,
        videoCount: Number(detail.statistics.videoCount || 0) || 0,
        isVerified: true,
        isPartial: false,
        lastHydratedAt: String(detail.syncedAt || new Date().toISOString()),
      })
      setAuthStateRaw(prev => ({
        ...prev,
        isAuthenticated: true,
        channelId: String(detail.id || detail.channelId || prev.channelId || "").trim() || prev.channelId || null,
        channelName: detail.title || prev.channelName,
        channelHandle: handle || prev.channelHandle,
        channelThumbnail: avatarUrl || prev.channelThumbnail,
        subscriberCount: preferPreciseSubscriberCount(
         detail.statistics.subscriberCount,
         prev.subscriberCount,
        ),
        totalViews: Number(detail.statistics.viewCount),
        videoCount: Number(detail.statistics.videoCount)
      }))
      setInitialDashboardHydrationStatus((prev) => ({
        ...prev,
        identityReady: true,
        lastUpdatedAt: String(detail.syncedAt || new Date().toISOString()),
      }))
      setChannelBootPhase((prev) => (prev === "idle" ? "ready" : prev))
    }
    const onFastAnalytics = (event: Event) => {
      const detail = (event as CustomEvent<any>).detail
      if (!detail) return
      
      console.log("[GlobalData] Fast analytics received. Updating revenue widgets.")
      setAuthStateRaw(prev => ({
        ...prev,
        fastAnalytics: detail
      }))
      setInitialDashboardHydrationStatus((prev) => ({
        ...prev,
        lifetimeReady: true,
        lastUpdatedAt: String(detail.lastSyncedAt || new Date().toISOString()),
      }))
    }
    const onLifetimeSummary = (event: Event) => {
      const detail = (event as CustomEvent<any>).detail
      if (!detail) return
      setAuthStateRaw((prev) => ({
        ...prev,
        syncedAt: String(detail.syncedAt || new Date().toISOString()),
        fastAnalytics: {
          lifetimeRevenue: Number(detail.lifetimeRevenue || prev.fastAnalytics?.lifetimeRevenue || 0),
          lifetimeWatchMinutes: Number(detail.lifetimeWatchMinutes || prev.fastAnalytics?.lifetimeWatchMinutes || 0),
          lifetimeViews: Number(detail.lifetimeViews || prev.fastAnalytics?.lifetimeViews || 0),
          subscribers28d: Number(prev.fastAnalytics?.subscribers28d || 0),
          lastSyncedAt: String(detail.syncedAt || new Date().toISOString()),
        },
      }))
      setBrain((prev) => ({
        ...prev,
        recentMetrics: {
          ...(prev.recentMetrics || {}),
          ...detail,
          currentSubscribers:
           preferPreciseSubscriberCount(
            detail.currentSubscribers,
            prev.recentMetrics?.currentSubscribers ??
             channelIdentity.subscriberCount ??
             authState.subscriberCount,
           ) || 0,
        },
      }))
      applyChannelIdentity({
        subscriberCount: preferPreciseSubscriberCount(
         detail.currentSubscribers,
         channelIdentity.subscriberCount,
        ),
        totalViews: Number(detail.lifetimeViews || channelIdentity.totalViews || 0),
        videoCount: Number(detail.publicVideoCount || channelIdentity.videoCount || 0),
        isVerified: true,
        isPartial: false,
        lastHydratedAt: String(detail.syncedAt || new Date().toISOString()),
      })
      setInitialDashboardHydrationStatus((prev) => ({
        ...prev,
        lifetimeReady: true,
        lastUpdatedAt: String(detail.syncedAt || new Date().toISOString()),
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
      setInitialDashboardHydrationStatus((prev) => ({
        ...prev,
        inventoryReady: true,
        lastUpdatedAt: new Date().toISOString(),
      }))
      setChannelBootPhase((prev) => (prev === "inventory" ? "ready" : prev))
    }

    window.addEventListener("vt_channel_sync_status", onStatus as EventListener)
    window.addEventListener("yt_channel_metadata_synced", onAuthMetadata as EventListener)
    window.addEventListener("yt_fast_analytics_synced", onFastAnalytics as EventListener)
    window.addEventListener("yt_channel_lifetime_summary_synced", onLifetimeSummary as EventListener)
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
    const onChannelAuthInvalidated = () => {
      setAuthStateRaw(defaultAuthState)
      setSyncStatus(defaultSyncStatus)
      setSyncBatch(defaultSyncBatch)
      setIsSyncing(false)
      setIsAuthorizing(false)
      setChannelIdentity(defaultChannelIdentity)
      setChannelBootPhase("idle")
      setInitialDashboardHydrationStatus(defaultInitialDashboardHydrationStatus)
      setActiveSyncAction(null)
      setActiveSyncButtonId(null)
      setLastSyncComplete(null)
    }
    window.addEventListener("yt_deep_segments_synced", onDeepSegments as EventListener)
    window.addEventListener("vt_channel_auth_invalidated", onChannelAuthInvalidated as EventListener)
    
    return () => {
      window.removeEventListener("vt_channel_sync_status", onStatus as EventListener)
      window.removeEventListener("yt_channel_metadata_synced", onAuthMetadata as EventListener)
      window.removeEventListener("yt_fast_analytics_synced", onFastAnalytics as EventListener)
      window.removeEventListener("yt_channel_lifetime_summary_synced", onLifetimeSummary as EventListener)
      window.removeEventListener("yt_recent_videos_synced", onRecentVideos as EventListener)
      window.removeEventListener("yt_deep_segments_synced", onDeepSegments as EventListener)
      window.removeEventListener("vt_channel_auth_invalidated", onChannelAuthInvalidated as EventListener)
    }
  }, [applyChannelIdentity, channelIdentity.subscriberCount, channelIdentity.totalViews, channelIdentity.videoCount])

 useEffect(() => {
   // Keep last sync timestamp in sync with any cache reset actions.
   const onLocalDataChanged = () => {
   try {
     setLastSyncComplete(localStorage.getItem("yt_analytics_last_sync") || null)
    } catch {
     setLastSyncComplete(null)
    }
    try {
      const cache = readYouTubeAnalyticsCache()
      const hasCanonicalCache = Boolean(
        Object.keys(cache || {}).length > 0 &&
          (cache.profile || cache.channelBaseline || cache.channelLifetimeSummary || cache.videos),
      )
      if (hasCanonicalCache) {
        const nextIdentity = buildChannelIdentityFromSources(authState, cache)
        applyChannelIdentity(nextIdentity)
        hydrateAuthStateFromAnalyticsCache()
        return
      }

      if (!unifiedAuth.isAuthenticated()) {
        setBrain(defaultBrain)
        setAuthStateRaw(defaultAuthState)
        setChannelIdentity(defaultChannelIdentity)
        setChannelBootPhase("idle")
        setInitialDashboardHydrationStatus(defaultInitialDashboardHydrationStatus)
        setSyncStatus(defaultSyncStatus)
        setSyncBatch(defaultSyncBatch)
      }
    } catch {
      // no-op
    }
   }
   const onIndexedDbCacheLoaded = (event: Event) => {
    const detail = (event as CustomEvent<Record<string, any>>).detail
    if (!detail) return
    applyChannelIdentity(buildChannelIdentityFromSources(authState, detail))
   }
   window.addEventListener("vt_local_data_changed", onLocalDataChanged)
   window.addEventListener("yt_analytics_cache_loaded", onIndexedDbCacheLoaded as EventListener)
   window.addEventListener("storage", onLocalDataChanged)
   return () => {
    window.removeEventListener("vt_local_data_changed", onLocalDataChanged)
    window.removeEventListener("yt_analytics_cache_loaded", onIndexedDbCacheLoaded as EventListener)
    window.removeEventListener("storage", onLocalDataChanged)
   }
  }, [applyChannelIdentity, authState, hydrateAuthStateFromAnalyticsCache])

 // Phase 5: Guard session verification against concurrent login boot.
 // If connectChannel() is already running, skip — it handles its own
 // token refresh and channel boot. Also wrap the cache hydration in
 // startTransition so it doesn't block any pending user interaction.
 useEffect(() => {
  let cancelled = false
  const verifyExistingSession = async () => {
   if (!unifiedAuth.isAuthenticated()) return
   // Skip if a login boot is already in progress — it handles everything.
   if (loginBootPromiseRef.current) return
   try {
     const { refreshTokenIfExpired } = await import("../services/youtube/youtubeApiClient")
     const token = await refreshTokenIfExpired()
     if (!token || cancelled) return
    setAuthStateRaw((prev) => ({ ...prev, isAuthenticated: true }))
    startTransition(() => hydrateAuthStateFromAnalyticsCache())
    setChannelBootPhase("ready")
   } catch {
    // auth invalidation is handled by the API client event path
   }
  }
  void verifyExistingSession()
  return () => {
   cancelled = true
  }
 }, [hydrateAuthStateFromAnalyticsCache])

 // Phase 6: Debounce brain persistence. During login boot the brain state
 // changes 10-20x in rapid succession; writing JSON.stringify on each one
 // blocks the main thread for 50-200ms per call on mobile. A 2s trailing
 // debounce coalesces the storm into a single write.
 useEffect(() => {
  // Don't persist until the deferred hydration has run, otherwise we'd
  // overwrite the real persisted state with the empty defaults.
  if (!hydratedFromStorageRef.current) return
  const timer = setTimeout(() => {
   try {
    const toSave = {
     ...brain,
     channelyticsState: { csvFiles: [], allData: [], analyticsResult: null },
     researchLabState: { csvFiles: [], allData: [], analyticsResult: null },
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
   } catch (e) {
    console.warn("[Brain] Failed to persist state:", e)
   }
  }, 2000)
  return () => clearTimeout(timer)
 }, [brain])

 // Debounce auth persistence with 1s trailing delay for the same reason.
 useEffect(() => {
  if (!hydratedFromStorageRef.current) return
  const timer = setTimeout(() => {
   try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState))
   } catch (e) {
    console.warn("[Auth] Failed to persist state:", e)
   }
  }, 1000)
  return () => clearTimeout(timer)
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

 const connectChannel = useCallback(async () => {
  if (loginBootPromiseRef.current) return loginBootPromiseRef.current

  if (isUnifiedAccountServerEnabled()) {
   try {
    const accountSnapshot = await fetchUnifiedAccountSnapshot()
    await beginAccountIntent(resolveAccountIntent(accountSnapshot))
    const nextAccountSnapshot = await fetchUnifiedAccountSnapshot()
    applyUnifiedAccountSnapshot(nextAccountSnapshot)
    window.dispatchEvent(new CustomEvent("vt_account_snapshot_changed", { detail: nextAccountSnapshot }))
    window.dispatchEvent(new Event("vt_auth_changed"))
    return
   } catch (error) {
    if (!isAccountServerUnavailableError(error)) throw error
    console.warn("[GlobalDataContext] Unified account server unavailable, falling back to legacy login.")
   }
  }

  const bootPromise = (async () => {
   const acceptedTerms = await requestGoogleOAuthTermsConsent()
   if (!acceptedTerms) return

   setIsAuthorizing(true)
   setChannelBootPhase("oauth")
   setInitialDashboardHydrationStatus(defaultInitialDashboardHydrationStatus)
   try {
    await unifiedAuth.login()
    ensureLoginToken()
    setAuthStateRaw((prev) => ({ ...prev, isAuthenticated: true }))
    setChannelBootPhase("identity")
    const { channel: metadata } = await syncChannelBootstrap(`connect-channel::${Date.now()}`)
    const metadataIdentity = {
     channelId: String(metadata.channelId || "").trim() || null,
     name: String(metadata.title || "").trim() || null,
     handle: String(metadata.handle || "").trim().replace(/^@/, "") || null,
     avatarUrl:
      String(
       metadata.thumbnails?.high?.url ||
        metadata.thumbnails?.medium?.url ||
        metadata.thumbnails?.default?.url ||
        "",
      ).trim() || null,
     subscriberCount: preferPreciseSubscriberCount(
      metadata.currentSubscribers,
      authState.subscriberCount,
     ),
     totalViews: metadata.publicViewCount,
     videoCount: metadata.publicVideoCount,
     isVerified: true,
     isPartial: false,
     lastHydratedAt: String(metadata.syncedAt || new Date().toISOString()),
    }
    applyChannelIdentity(metadataIdentity)
    setInitialDashboardHydrationStatus((prev) => ({
      ...prev,
      identityReady: true,
      lastUpdatedAt: String(metadata.syncedAt || new Date().toISOString()),
    }))

    setInitialDashboardHydrationStatus({
     identityReady: true,
     lifetimeReady: false,
     inventoryReady: false,
     lastUpdatedAt: metadata.syncedAt,
    })
    hydrateAuthStateFromAnalyticsCache()
    setChannelBootPhase("ready")

    // Begin the core channel data sync immediately after first login so the
    // dashboard overview (avatar + KPIs), the nav bar, and the analytics
    // creator module hydrate without the user having to click "Sync". This runs
    // inside the app-level context boot promise, so it keeps going even as the
    // user navigates between pages. A sync failure must not tear down a
    // successful connection, so it is isolated from the connect catch below.
    try {
     await globalSyncData({ batchMode: "initial" })
    } catch (syncErr) {
     console.warn("Post-login core sync failed; manual sync remains available.", syncErr)
    }
   } catch (err) {
    if (isUnauthorizedError(err)) {
     unifiedAuth.logout()
     setAuthStateRaw(defaultAuthState)
     setChannelIdentity(defaultChannelIdentity)
     setInitialDashboardHydrationStatus(defaultInitialDashboardHydrationStatus)
     setChannelBootPhase("idle")
     console.warn("Channel authorization failed; reconnect required.", err)
     return
    }
    setChannelBootPhase(isLoginAbortError(err) ? "idle" : "error")
    const now = Date.now()
    if (now - lastAuthAbortLogAt > 8000) {
     lastAuthAbortLogAt = now
     console.warn(
      isLoginAbortError(err)
       ? "Channel connection was cancelled or timed out."
       : "Channel connection failed.",
      err,
     )
    }
   } finally {
    setIsAuthorizing(false)
    setIsSyncing(false)
    loginBootPromiseRef.current = null
   }
  })()

  loginBootPromiseRef.current = bootPromise
  return bootPromise
 }, [applyChannelIdentity, applyUnifiedAccountSnapshot, authState.subscriberCount, globalSyncData, hydrateAuthStateFromAnalyticsCache])

 const disconnectChannel = useCallback(() => {
  setAuthStateRaw(defaultAuthState)
  setSyncStatus(defaultSyncStatus)
  setSyncBatch(defaultSyncBatch)
  setLastSyncComplete(null)
  setIsAuthorizing(false)
  setIsSyncing(false)
  setChannelIdentity(defaultChannelIdentity)
  setChannelBootPhase("idle")
  setInitialDashboardHydrationStatus(defaultInitialDashboardHydrationStatus)
  unifiedAuth.logout()
 }, [])

 const syncChannelData = useCallback(
  async (options?: {
   batchMode?: "initial" | "next"
   syncAction?: AnalyticsSyncAction
   syncButtonId?: string
   enrichmentMode?: "core" | "video_metrics" | "traffic" | "segments" | "all"
  }) =>
   globalSyncData({
    batchMode: "initial",
    ...options,
   }),
  [globalSyncData],
 )

 const login = connectChannel
 const logout = disconnectChannel

 const channelConnection = resolveChannelConnectionSnapshot({
  authState,
  channelIdentity,
  isAuthorizing,
  isSyncing,
  syncStatus,
 })

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
    connectChannel,
    disconnectChannel,
    isSyncing,
    isAuthorizing,
    lastSyncComplete,
    syncStatus,
    syncBatch,
    activeSyncAction,
    activeSyncButtonId,
    channelConnection,
    channelIdentity,
    channelBootPhase,
    initialDashboardHydrationStatus,
    globalSyncData,
    syncChannelData,
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
    aiModel,
    setAiModel,
    fetchAndCacheRetention: async (videoId: string) => {
     if (brain.retentionCache[videoId]) {
      return brain.retentionCache[videoId]
     }
     const { fetchVideoRetention } = await import("../services/youtubeService")
     const data = await fetchVideoRetention(videoId)
     if (data) {
      setBrain((prev) => {
       const newCache = { ...prev.retentionCache, [videoId]: data }
       localStorage.setItem("vt_retention_cache", JSON.stringify(newCache))
       return { ...prev, retentionCache: newCache }
      })
      return data
     }
     return null
    },
   }}>
   {children}
 </GlobalDataContext.Provider>
 )
}
