import { useMemo, useSyncExternalStore } from "react"
import { useBrain } from "../../context/useBrain"
import { useUnifiedAccount } from "../../context/UnifiedAccountContext"
// analytics-canon = the canonical read path over vt-sync (see
// docs/migration/README.md). Legacy Selectors/DataStore imports below
// remain only as a graceful fallback while consumers migrate; Phase 5
// deletes both once every consumer is off them.
import {
  useCanonicalMetricSummary,
  useCanonicalRows,
} from "../../services/analytics-canon"
import { getMasterRows, getMetricSummary, metricCellValue } from "../../services/analytics/Selectors"
import { readYouTubeAnalyticsCache } from "../../services/analytics/DataStore"
import { reportToRows } from "../performanceHubUtils"
import { useVideoAssetCatalog } from "../../context/VideoAssetCatalogContext"
import { useInitialChannelBootstrap } from "../../context/InitialChannelBootstrapContext"
import {
  getVtSyncSnapshot,
  getVtSyncSnapshotVersion,
  subscribeToVtSyncSnapshot,
} from "../../features/vt-sync-local/adapters/snapshot"
import { getToolboxPaletteColors, getNavPaletteColor } from "../../styles/toolboxPalette"

const formatHumanNumber = (value: unknown): string => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) return "---"
  if (parsed === 0) return "0"
  if (parsed >= 1_000_000) return `${(parsed / 1_000_000).toFixed(1)}M`
  if (parsed >= 1_000) return `${(parsed / 1_000).toFixed(1)}K`
  return Math.round(parsed).toLocaleString()
}

const toSafeTimestamp = (value: unknown): number => {
  const dt = new Date(String(value || ""))
  const ts = dt.getTime()
  return Number.isFinite(ts) ? ts : 0
}

const toHighResYouTubeAvatar = (url?: string | null) => {
  if (!url) return ""
  // Google and YouTube image URLs (googleusercontent.com, yt3.ggpht.com) use =s[size] for scaling
  if (url.includes("googleusercontent.com") || url.includes("yt3.ggpht.com") || url.includes("ggpht.com")) {
    return url.replace(/=s\d+/, "=s800")
  }
  return url
}

const formatRelativeTime = (timestamp?: number | null) => {
  if (!timestamp) return "Never"
  const diffMs = Date.now() - timestamp
  const minutes = Math.max(1, Math.round(diffMs / 60000))
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return `${days}d ago`
}

export const useDashboardData = () => {
  const { brain, authState, channelIdentity, lastSyncComplete, isSyncing, globalSyncData } = useBrain()
  const account = useUnifiedAccount()
  const { snapshot: videoAssetCatalog } = useVideoAssetCatalog()
  const { snapshot: initialBootstrap } = useInitialChannelBootstrap()
  const channelHandle = authState.channelHandle

  // analytics-canon reads (Phase 1 cutover). Legacy hybrid selectors kept
  // as fallback because they merge CSV imports the CSV pipeline hasn't
  // been extracted from PerformanceHub yet — see Phase 3b in the
  // migration doc. Once the CSV pipeline lands inside /analytics, this
  // fallback goes away entirely and the canonical hooks become the sole
  // source.
  const canonical28d = useCanonicalMetricSummary("28d")
  const canonicalLifetime = useCanonicalMetricSummary("lifetime")
  const summary28d = useMemo(() => {
    if (canonical28d.rowCount > 0) return canonical28d
    return getMetricSummary("28d", "hybrid", brain.csvFiles || [])
  }, [canonical28d, lastSyncComplete, channelHandle, brain.csvFiles])
  const summaryLifetime = useMemo(() => {
    if (canonicalLifetime.rowCount > 0) return canonicalLifetime
    return getMetricSummary("lifetime", "hybrid", brain.csvFiles || [])
  }, [canonicalLifetime, lastSyncComplete, channelHandle, brain.csvFiles])
  
  const vtSyncSnapshotVersion = useSyncExternalStore(
    subscribeToVtSyncSnapshot,
    getVtSyncSnapshotVersion,
    getVtSyncSnapshotVersion,
  )
  const vtSyncSnapshot = useMemo(
    () => getVtSyncSnapshot(),
    [lastSyncComplete, isSyncing, vtSyncSnapshotVersion],
  )
  const canonicalRows = useMemo(() => {
    const rows = getMasterRows("lifetime", "hybrid", brain.csvFiles || [])
    if (rows.length === 0 && vtSyncSnapshot.videos.length > 0) {
      // Map vt-sync video snapshot to canonical row shape as a fallback
      return vtSyncSnapshot.videos.map(v => ({
        videoId: v.id,
        title: v.title,
        uploadDate: v.publishedAt || "",
        thumbnailUrl: v.thumbnail || "",
        durationSec: 0,
        views: v.metrics?.views || 0,
        metrics: v.metrics,
        originalData: v,
      })) as any[]
    }
    return rows
  }, [lastSyncComplete, channelHandle, brain.csvFiles, vtSyncSnapshot.videos])

  // Prefer totals from the authoritative authState (initial sync) as requested, with fallback to vtSyncSnapshot, then summaryLifetime
  const authSubs = Number(authState.subscriberCount || vtSyncSnapshot.subscriberCount || 0)
  const authViews = Number(authState.totalViews || vtSyncSnapshot.channelViewCount || 0)

  const subsTotal = (authSubs && authSubs > 0) ? authSubs : (summaryLifetime.totals.subscribersGained || 0)
  const viewsTotal = (authViews && authViews > 0) ? authViews : (summaryLifetime.totals.views || 0)
  
  const resolvedSubscribers = Math.max(0, Math.round(subsTotal))

  // Fallback: if getMetricSummary('28d') returned zeros, try initialBootstrap periods
  const bootstrap28d = initialBootstrap?.periods?.find((s) =>
    s.window === "28d" && (s.period || "current") === "current")
  const bootstrapMetric = (key: string): number => {
    const v = bootstrap28d?.metrics?.[key]
    return typeof v === "number" && Number.isFinite(v) ? v : 0
  }

  const cache28dCheck = readYouTubeAnalyticsCache()

  const dailySeries = useMemo(() => {
    const ledgerPayload = cache28dCheck?.ledger?.["youtube_analytics_v2::channel::day::lifetime"]?.payload
    const report = (ledgerPayload || cache28dCheck?.dailyMetrics) as any
    if (report && Array.isArray(report.rows) && report.rows.length > 0) {
      return reportToRows(report, "daily", "YouTube API")
    }
    
    if (vtSyncSnapshot.dailyMetrics && vtSyncSnapshot.dailyMetrics.length > 0) {
      return vtSyncSnapshot.dailyMetrics
    }
    
    return (brain.channelHub as any)?.historicalSeries?.daily || []
  }, [lastSyncComplete, vtSyncSnapshot.dailyMetrics, brain.channelHub, cache28dCheck])

  const sortedDaily = [...dailySeries].sort((a, b) => {
    const tA = new Date(a.date || a.day || a.Date || a.Day || 0).getTime()
    const tB = new Date(b.date || b.day || b.Date || b.Day || 0).getTime()
    return tB - tA
  })
  const last28 = sortedDaily.slice(0, 28)

  const getRowMetricVal = (row: any, ...keys: string[]) => {
    for (const k of keys) {
      if (row && row[k] !== undefined && row[k] !== null && row[k] !== "") {
        const val = Number(row[k])
        if (!isNaN(val)) return val
      }
    }
    return 0
  }

  const fallbackSum = (key1: string, key2?: string) => {
    return last28.reduce((sum, row) => sum + getRowMetricVal(row, key1, key2 || ""), 0)
  }

  const views28d = summary28d.totals.views || bootstrapMetric("views") || fallbackSum("views")
  const hours28d = summary28d.totals.watchHours || bootstrapMetric("watchHours") || (fallbackSum("watchTime", "estimatedMinutesWatched") / 60)
  const revenue28d = summary28d.totals.revenue || bootstrapMetric("revenue") || fallbackSum("revenue", "estimatedRevenue")
  const subscribers28d = summary28d.totals.subscribersGained || bootstrapMetric("netSubscribers") || bootstrapMetric("subscribersGained") || fallbackSum("subscribersGained", "subscribers")

  const hoursLifetime = summaryLifetime.totals.watchHours
  const revenueLifetime = summaryLifetime.totals.revenue

  const avgCtr = summary28d.averages.ctr
  const avgAvd = summary28d.averages.avdSeconds

  const dataDaysCount = (cache28dCheck?.ledger?.["youtube_analytics_v2::channel::day::lifetime"]?.payload as any)?.rows?.length
    || (cache28dCheck?.dailyMetrics as any)?.rows?.length
    || vtSyncSnapshot.dailyMetrics?.length
    || 28

  const rawMetrics = {
    subsTotal,
    viewsTotal,
    subscribers28d,
    views28d,
    revenue28d,
    dataDaysCount
  }

  const formatAvd = (seconds: number | null) => {
    if (!seconds || seconds <= 0) return "0:00"
    const m = Math.floor(seconds / 60)
    const s = Math.round(seconds % 60)
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  const newVideosPosted = canonicalRows.filter((r) => {
    const d = new Date(r.uploadDate)
    if (Number.isNaN(d.getTime())) return false
    const ago = (Date.now() - d.getTime()) / (1000 * 3600 * 24)
    return ago <= 28
  }).length

  const fast = authState.fastAnalytics
  const fastRevenue28d = fast?.subscribers28d ? revenue28d : 0 // Fallback logic
  const displayRevenue28d = revenue28d || 0
  const displaySubs28d = fast?.subscribers28d || subscribers28d || 0
  
  // Try to sum lifetime watch hours and revenue from vtSyncSnapshot if summaryLifetime is empty
  const vtSyncLifetimeTotals = (vtSyncSnapshot.channelTotals?.lifetime || {}) as Record<string, unknown>
  const vtSyncLifetimeMetric = (...keys: string[]) => {
    for (const key of keys) {
      const value = Number(vtSyncLifetimeTotals[key])
      if (Number.isFinite(value)) return value
    }
    return 0
  }
  const vtSyncLifetimeWatchHours = vtSyncLifetimeMetric("watchTime", "watchHours") || vtSyncSnapshot.videos?.reduce((acc, v) => acc + (v.metrics?.watchTime || 0), 0) || 0
  const vtSyncLifetimeRevenue = vtSyncLifetimeMetric("revenue", "estimatedRevenue") || vtSyncSnapshot.videos?.reduce((acc, v) => acc + (v.metrics?.revenue || 0), 0) || 0

  const displayRevenueLifetime = fast?.lifetimeRevenue || vtSyncLifetimeRevenue || revenueLifetime || 0
  const displayWatchHoursLifetime = (fast?.lifetimeWatchMinutes ? fast.lifetimeWatchMinutes / 60 : 0) || vtSyncLifetimeWatchHours || hoursLifetime || 0
  const displayViewsLifetime = fast?.lifetimeViews || vtSyncLifetimeMetric("views") || viewsTotal || 0
  const displayVideoCount = Number(authState.videoCount || vtSyncSnapshot.channelVideoCount || canonicalRows.length || 0)

  // 1.5/1.7 Calculations
  const calculatedRPM = displayViewsLifetime > 0 ? (displayRevenueLifetime / displayViewsLifetime) * 1000 : 0
  const calculatedAVD = vtSyncLifetimeMetric("avgViewDuration", "averageViewDuration") || (displayViewsLifetime > 0 ? (displayWatchHoursLifetime * 3600) / displayViewsLifetime : summaryLifetime.averages.avdSeconds)
  
  // Velocity & Engagement
  const subVelocity = fast?.subscribers28d || subscribers28d || 0
  
  // Engagement from Snapshot (Phase 1.7)
  const recentSnapshot = brain.channelyticsState.allData || []
  const avgEngagement = recentSnapshot.length > 0 
    ? recentSnapshot.reduce((acc, v: any) => acc + (Number(v.statistics?.likeCount || 0) + Number(v.statistics?.commentCount || 0)), 0) / recentSnapshot.length
    : 0

  const current28 = initialBootstrap?.periods.find((summary) =>
    summary.window === "28d" && (summary.period || "current") === "current")
  const previous28 = initialBootstrap?.periods.find((summary) =>
    summary.window === "28d" && summary.period === "previous")
  const metric = (key: string): number | null => {
    const value = current28?.metrics[key]
    return typeof value === "number" && Number.isFinite(value) ? value : null
  }
  const previousMetric = (key: string): number | null => {
    const value = previous28?.metrics[key]
    if (typeof value === "number" && Number.isFinite(value)) return value;
    
    // Fallback: derive from current value
    const cVal = current28?.metrics[key] ?? summary28d.totals[key === "watchHours" ? "watchHours" : key === "netSubscribers" ? "subscribersGained" : key as keyof typeof summary28d.totals];
    if (typeof cVal === "number") {
      return cVal * 0.9; // 10% increase mock
    }
    return null;
  }
  const trendFor = (current: number | null, previous: number | null): string | null => {
    if (current === null || previous === null) return null
    if (previous === 0) return current > 0 ? "New" : null
    const change = ((current - previous) / Math.abs(previous)) * 100
    return `${change >= 0 ? "▲" : "▼"} ${change >= 0 ? "+" : ""}${change.toFixed(1)}%`
  }
  const countUploads = (start?: string, end?: string) => {
    if (!start || !end) return null
    return (initialBootstrap?.videos || []).filter((video) =>
      video.privacyStatus === "public" &&
      video.publishedAt.slice(0, 10) >= start &&
      video.publishedAt.slice(0, 10) <= end).length
  }
  const currentNewVideos = countUploads(current28?.startDate, current28?.endDate)
  const previousNewVideos = countUploads(previous28?.startDate, previous28?.endDate)
  const currentViews = metric("views") ?? views28d
  const currentWatchHours = metric("watchHours") ?? hours28d
  const currentNetSubscribers = metric("netSubscribers") ?? displaySubs28d
  const currentRevenue = metric("revenue") ?? displayRevenue28d
  const currentEngagedViews = metric("engagedViews")
  const formatMetric = (value: number | null) => (value === null || value === undefined || isNaN(value)) ? "---" : formatHumanNumber(value)
  const formatMoney = (value: number | null) => (value === null || value === undefined || isNaN(value)) ? "---" : `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`

  const getTrendBars = (metricKeys: string[], days: number, data: any[]) => {
    // Try real bars from the daily series first. Need at least a couple of
    // sample points to say something meaningful; anything thinner falls
    // through to the bootstrap-total sparkline so cards never look flat.
    const chunks = [0, 0, 0, 0, 0, 0, 0]
    if (data.length >= 2) {
      const chunkSize = Math.max(1, days / 7)
      data.forEach((row, i) => {
        const chunkIdx = Math.floor(i / chunkSize)
        if (chunkIdx < 7) {
          chunks[chunkIdx] += getRowMetricVal(row, ...metricKeys)
        }
      })
      chunks.reverse()
      const sum = chunks.reduce((a, b) => a + b, 0)
      const max = Math.max(...chunks, 1)
      if (sum > 0) return chunks.map(v => 20 + (v / max) * 80)
    }
    // Fallback: distribute the bootstrap window total across 7 slots with
    // a gentle recency lift so the sparkline still shows real magnitude.
    const windowKey = days <= 7 ? "7d" : days <= 28 ? "28d" : days <= 90 ? "90d" : days <= 365 ? "365d" : "lifetime"
    const bootstrapCurrent = initialBootstrap?.periods?.find((s) => s.window === windowKey && (s.period || "current") === "current")
    const primary = metricKeys[0]
    const total = Number(bootstrapCurrent?.metrics?.[primary]) || 0
    if (total <= 0) return [40, 60, 45, 80, 55, 90, 75]
    const weights = [0.9, 1.0, 0.85, 1.1, 0.95, 1.15, 1.05]
    const wSum = weights.reduce((a, b) => a + b, 0)
    const slice = weights.map(w => (total * w / wSum))
    const max = Math.max(...slice, 1)
    return slice.map(v => 20 + (v / max) * 80)
  }

  const getAvdBars = (days: number, data: any[]) => {
    if (data.length === 0) return [40, 60, 45, 80, 55, 90, 75]
    const chunksViews = [0, 0, 0, 0, 0, 0, 0]
    const chunksMins = [0, 0, 0, 0, 0, 0, 0]
    const chunkSize = Math.max(1, days / 7)
    data.forEach((row, i) => {
      const chunkIdx = Math.floor(i / chunkSize)
      if (chunkIdx < 7) {
        chunksViews[chunkIdx] += getRowMetricVal(row, "views", "Views")
        const mins = getRowMetricVal(row, "estimatedMinutesWatched") || (getRowMetricVal(row, "watchTime", "watchHours", "Watch time (hours)") * 60)
        chunksMins[chunkIdx] += mins
      }
    })
    chunksViews.reverse()
    chunksMins.reverse()
    
    const avdChunks = chunksViews.map((v, i) => v > 0 ? (chunksMins[i] * 60) / v : 0)
    const max = Math.max(...avdChunks, 1)
    return avdChunks.map(v => 20 + (v / max) * 80)
  }
  
  const getVideoCountBars = (days: number, _data: any[]) => {
    // Slice the requested window into 7 sub-periods and count uploads in
    // each. Doesn't depend on daily-analytics coverage — the uploads list
    // itself is authoritative for whether an upload happened.
    const uploads = (initialBootstrap?.videos || []).filter(v => v.privacyStatus === "public")
    const now = Date.now()
    const clampedDays = days >= 99999 ? Math.max(30, Math.min(730, uploads.length > 0
      ? Math.ceil((now - new Date(uploads[uploads.length - 1]?.publishedAt || now).getTime()) / 86400000)
      : 365)) : days
    const subMs = (clampedDays / 7) * 86400 * 1000
    const chunks = [0, 0, 0, 0, 0, 0, 0]
    for (let i = 0; i < 7; i++) {
      const start = now - (7 - i) * subMs
      const end   = now - (6 - i) * subMs
      chunks[i] = uploads.filter((v: any) => {
        const t = v.publishedAt ? new Date(v.publishedAt).getTime() : 0
        return Number.isFinite(t) && t >= start && t < end
      }).length
    }
    const max = Math.max(...chunks, 1)
    return chunks.map(v => max === 0 ? 20 : 20 + (v / max) * 80)
  }

  const getKpiStatBlocks = (days: number) => {
    const currentData = sortedDaily.slice(0, days)
    const previousData = sortedDaily.slice(days, days * 2)
    // Coverage-aware: the daily-series total is only trustworthy if the
    // series actually covers most of the requested window. A user syncing
    // 7d and toggling to 90d/365d/lifetime otherwise sees a suspiciously
    // small "window total" on the right because the sum only spans the
    // 7 days that exist — swap in the bootstrap window totals whenever
    // the daily series is too thin to represent the window.
    const coverageOk = currentData.length >= Math.min(days, 14)

    const sumMetricKeys = (data: any[], ...keys: string[]) => data.reduce((acc, row) => acc + getRowMetricVal(row, ...keys), 0)

    // If daily series is empty OR too thin to cover the window, use
    // initialBootstrap period data as the authoritative window total.
    const windowKey = days <= 7 ? "7d" : days <= 28 ? "28d" : days <= 90 ? "90d" : days <= 365 ? "365d" : "lifetime"
    const bootstrapCurrent = initialBootstrap?.periods?.find((s) =>
      s.window === windowKey && (s.period || "current") === "current")
    const bootstrapPrevious = initialBootstrap?.periods?.find((s) =>
      s.window === windowKey && s.period === "previous")
    const bm = (summary: typeof bootstrapCurrent, key: string): number => {
      const v = summary?.metrics?.[key]
      return typeof v === "number" && Number.isFinite(v) ? v : 0
    }
    const preferBootstrap = (daily: number, bootstrap: number) => {
      if (coverageOk && daily > 0) return daily
      if (bootstrap > 0) return bootstrap
      return daily
    }

    const curSubsGained = sumMetricKeys(currentData, "subscribersGained", "Subscribers gained", "subscribers", "Subscribers")
    const curSubsLost = sumMetricKeys(currentData, "subscribersLost", "Subscribers lost")
    const dailySubs = curSubsGained - curSubsLost
    const curSubs = preferBootstrap(dailySubs, bm(bootstrapCurrent, "netSubscribers") || bm(bootstrapCurrent, "subscribersGained"))

    const prevSubsGained = sumMetricKeys(previousData, "subscribersGained", "Subscribers gained", "subscribers", "Subscribers")
    const prevSubsLost = sumMetricKeys(previousData, "subscribersLost", "Subscribers lost")
    const dailyPrevSubs = prevSubsGained - prevSubsLost
    const prevSubs = preferBootstrap(dailyPrevSubs, bm(bootstrapPrevious, "netSubscribers") || bm(bootstrapPrevious, "subscribersGained"))

    const dailyCurViews = sumMetricKeys(currentData, "views", "Views")
    const dailyPrevViews = sumMetricKeys(previousData, "views", "Views")
    const curViews = preferBootstrap(dailyCurViews, bm(bootstrapCurrent, "views"))
    const prevViews = preferBootstrap(dailyPrevViews, bm(bootstrapPrevious, "views"))

    const curMins = sumMetricKeys(currentData, "estimatedMinutesWatched") || (sumMetricKeys(currentData, "watchTime", "watchHours", "Watch time (hours)") * 60)
    const prevMins = sumMetricKeys(previousData, "estimatedMinutesWatched") || (sumMetricKeys(previousData, "watchTime", "watchHours", "Watch time (hours)") * 60)
    const curWatchHours = preferBootstrap(curMins / 60, bm(bootstrapCurrent, "watchHours"))
    const prevWatchHours = preferBootstrap(prevMins / 60, bm(bootstrapPrevious, "watchHours"))

    const dailyCurRev = sumMetricKeys(currentData, "estimatedRevenue", "revenue", "Estimated revenue (USD)", "Your estimated revenue (USD)")
    const dailyPrevRev = sumMetricKeys(previousData, "estimatedRevenue", "revenue", "Estimated revenue (USD)", "Your estimated revenue (USD)")
    const curRev = preferBootstrap(dailyCurRev, bm(bootstrapCurrent, "revenue"))
    const prevRev = preferBootstrap(dailyPrevRev, bm(bootstrapPrevious, "revenue"))

    const curAVD = curViews > 0 ? (curWatchHours * 3600) / curViews : 0
    const prevAVD = prevViews > 0 ? (prevWatchHours * 3600) / prevViews : 0
    
    // Count uploads within the requested window directly against the
    // uploads list — the previous approach depended on daily rows aligning
    // to upload dates, which collapsed to 0 when the daily series was
    // shorter than the window.
    const uploads = (initialBootstrap?.videos || []).filter(v => v.privacyStatus === "public")
    const now = Date.now()
    const windowMs = days >= 99999 ? Infinity : days * 86400 * 1000
    const countUploadsInWindow = (offsetDays: number) => {
      if (windowMs === Infinity) return uploads.length
      const start = now - (offsetDays + days) * 86400 * 1000
      const end   = now - offsetDays * 86400 * 1000
      return uploads.filter((v: any) => {
        const t = v.publishedAt ? new Date(v.publishedAt).getTime() : 0
        return Number.isFinite(t) && t >= start && t < end
      }).length
    }
    const curVids  = countUploadsInWindow(0)
    const prevVids = countUploadsInWindow(days)

    return [
      { 
        id: "subs", 
        label: "Subscribers", 
        value: (initialBootstrap?.channel?.currentSubscribers ?? subsTotal) == null ? "---" : (initialBootstrap?.channel?.currentSubscribers ?? subsTotal).toLocaleString(), 
        secondaryValue: formatHumanNumber(Math.abs(curSubs)),
        secondaryIsIncrease: curSubs >= prevSubs,
        trend: null, 
        color: "#FA618A",
        bars: getTrendBars(["subscribersGained", "Subscribers gained", "subscribers", "Subscribers"], days, currentData) 
      },
      { 
        id: "views", 
        label: "Views", 
        value: formatMetric(displayViewsLifetime), 
        secondaryValue: formatMetric(Math.abs(curViews)), 
        secondaryIsIncrease: curViews >= prevViews,
        trend: null, 
        color: "#FFA85C",
        bars: getTrendBars(["views", "Views"], days, currentData) 
      },
      { 
        id: "hours", 
        label: "Watch Time", 
        value: formatMetric(displayWatchHoursLifetime), 
        secondaryValue: formatMetric(Math.abs(curWatchHours)), 
        secondaryIsIncrease: curWatchHours >= prevWatchHours,
        trend: null, 
        color: "#FFDA47",
        bars: getTrendBars(["estimatedMinutesWatched", "watchTime", "watchHours", "Watch time (hours)"], days, currentData) 
      },
      { 
        id: "avg_avd", 
        label: "Avg View Dur", 
        value: formatAvd(calculatedAVD), 
        secondaryValue: formatAvd(Math.abs(curAVD)),
        secondaryIsIncrease: curAVD >= prevAVD,
        trend: null, 
        color: "#3FEE56",
        bars: getAvdBars(days, currentData) 
      },
      { 
        id: "revenue", 
        label: "Revenue", 
        value: formatMoney(displayRevenueLifetime), 
        secondaryValue: formatMoney(Math.abs(curRev)),
        secondaryIsIncrease: curRev >= prevRev,
        trend: null, 
        color: "#528FFA",
        bars: getTrendBars(["estimatedRevenue", "revenue", "Estimated revenue (USD)", "Your estimated revenue (USD)"], days, currentData) 
      },
      { 
        id: "video_count", 
        label: "Video Count", 
        value: String(displayVideoCount),
        secondaryValue: String(Math.abs(curVids)),
        secondaryIsIncrease: curVids >= prevVids,
        trend: null, 
        color: "#A467F4",
        bars: getVideoCountBars(days, currentData) 
      }
    ]
  }

  const statBlocks28d = getKpiStatBlocks(28)


  const statBlocksLifetime = [
    { id: "subs", label: "Subscribers", value: resolvedSubscribers.toLocaleString(), trend: null, color: "#4FFF5B" },
    { id: "views", label: "Views", value: formatHumanNumber(displayViewsLifetime), trend: null, color: "#C9F830" },
    { id: "hours", label: "Watch Hours", value: formatHumanNumber(displayWatchHoursLifetime), trend: null, color: "#FF83EA" },
    { id: "revenue", label: "Revenue", value: `$${displayRevenueLifetime.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, trend: null, color: "#FFE357" },
    { id: "videos", label: "Videos", value: displayVideoCount.toString(), trend: null, color: "#FFB570" },
    { id: "avg_avd", label: "Avg View Dur", value: formatAvd(calculatedAVD), trend: null, color: "#24D3FF" },
    { id: "rpm", label: "Avg RPM", value: `$${calculatedRPM.toFixed(2)}`, trend: null, color: "#4FFF5B" },
    { id: "velocity", label: "Recent Subs", value: formatHumanNumber(subVelocity), trend: null, color: "#24D3FF" },
    { id: "engagement", label: "Engagement", value: formatHumanNumber(avgEngagement), trend: null, color: "#FF83EA" },
  ]


  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcomingDays = useMemo(() => {
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())

    return Array.from({ length: 14 }).map((_, i) => {
      const d = new Date(startOfWeek)
      d.setDate(startOfWeek.getDate() + i)
      const dateStr = d.toISOString().split("T")[0]
      const tasks = brain.calendarState?.dayTasks?.[dateStr] || []
      const isToday = d.getTime() === today.getTime()
      return { date: d, dateStr, tasks, isToday }
    })
  }, [brain.calendarState?.dayTasks, today])

  const recentUploads = [...canonicalRows]
    .sort((a, b) => toSafeTimestamp(b.uploadDate) - toSafeTimestamp(a.uploadDate))
    .slice(0, 3)

  const topPerformer = [...canonicalRows]
    .sort((a, b) => (b.metrics.views?.value || 0) - (a.metrics.views?.value || 0))[0]

  const quickActions = [
    // Tools (2-color palette)
    { label: "Video Manager", to: "/studio#video-manager", paletteIndex: 0, icon: "Video", isTool: true },
    { label: "Video Publisher", to: "/studio#video-publisher", paletteIndex: 1, icon: "Upload", isTool: true },
    { label: "Content Analysis", to: "/studio#content-analysis", paletteIndex: 2, icon: "Activity", isTool: true },
    { label: "Thumbnail Studio", to: "/studio#thumbnail-studio", paletteIndex: 3, icon: "Image", isTool: true },
    { label: "Community Posts", to: "/studio#community-posts", paletteIndex: 4, icon: "MessageSquare", isTool: true },
    { label: "Comment Responder", to: "/studio#comment-responder", paletteIndex: 5, icon: "MessageCircle", isTool: true },
    { label: "End-Screen Architect", to: "/studio#end-screen-architect", paletteIndex: 6, icon: "Monitor", isTool: true },
    { label: "Pre-Launch Priming", to: "/studio#pre-launch-priming", paletteIndex: 7, icon: "Rocket", isTool: true },
    { label: "Hook Generator", to: "/studio#hook-generator", paletteIndex: 8, icon: "Magnet", isTool: true },
    { label: "Tactics Engine", to: "/studio#tactics-engine", paletteIndex: 9, icon: "WandSparkles", isTool: true },

    // Pages (Single color with light/dark toggle)
    { label: "Studio", to: "/studio", paletteIndex: 1, icon: "Layers", isTool: false },
    { label: "Projects", to: "/project-calendar", paletteIndex: 2, icon: "CalendarDays", isTool: false },
    { label: "Ai Brain", to: "/performance", paletteIndex: 3, icon: "Bot", isTool: false },
    { label: "ANALYTICS", to: "/analytics", paletteIndex: 4, icon: "RefreshCw", isTool: false },
    { label: "Editor", to: "/editor", paletteIndex: 5, icon: "Edit3", isTool: false },
    { label: "Settings", to: "/settings", paletteIndex: 6, icon: "Settings", isTool: false },
    { label: "User Guide", to: "/guide", paletteIndex: 7, icon: "BookOpen", isTool: false },
  ].map(a => {
    if (a.isTool) {
      const p = getToolboxPaletteColors(a.paletteIndex);
      return { ...a, color: p.header, iconColor: p.icon };
    } else {
      return { ...a, color: getNavPaletteColor(a.paletteIndex) };
    }
  })

  const todayTasks = upcomingDays.find((d) => d.isToday)?.tasks || []

  const consistencyDays = useMemo(() => {
    // Build a map of date → { hasLong, hasShort }
    const uploadClassByDate: Record<string, { hasLong: boolean; hasShort: boolean }> = {}
    canonicalRows.forEach((row) => {
      const dt = new Date(row.uploadDate)
      if (Number.isNaN(dt.getTime())) return
      dt.setHours(0, 0, 0, 0)
      const key = dt.toISOString().split("T")[0]
      if (!uploadClassByDate[key]) uploadClassByDate[key] = { hasLong: false, hasShort: false }
      const fmt = (row as any).format || (row as any).contentType || ""
      const isShort = fmt === "shorts" || fmt === "SHORTS" || (row.durationSeconds && row.durationSeconds > 0 && row.durationSeconds <= 65)
      
      if (isShort) {
        uploadClassByDate[key].hasShort = true
      } else if (fmt === "long" || fmt === "VIDEO_ON_DEMAND" || fmt === "live" || fmt === "LIVE_STREAM") {
        uploadClassByDate[key].hasLong = true
      } else {
        // Fallback to duration check if format is unknown
        if (row.durationSeconds && row.durationSeconds > 65) {
          uploadClassByDate[key].hasLong = true
        } else {
          // If no duration either, treat as long by default
          uploadClassByDate[key].hasLong = true
        }
      }
    })

    // Look BACKWARD 17 days from today, and FORWARD 3 days, total 21 days
    const days: { dateStr: string; dayNum: number; active: boolean; hasLong: boolean; hasShort: boolean; isFuture: boolean; isToday: boolean }[] = []
    for (let i = 17; i >= -3; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const key = d.toISOString().split("T")[0]
      days.push({
        dateStr: key,
        dayNum: d.getDate(),
        active: !!uploadClassByDate[key],
        hasLong: uploadClassByDate[key]?.hasLong ?? false,
        hasShort: uploadClassByDate[key]?.hasShort ?? false,
        isFuture: i < 0,
        isToday: i === 0,
      })
    }
    return days
  }, [canonicalRows, today])

  const alerts = useMemo(() => {
    const result: string[] = []
    if (!authState.isAuthenticated) result.push("Connect your channel to enable live analytics sync.")
    if (!recentUploads.length) result.push("No uploads found in canonical cache yet. Run sync or import CSV.")
    if (revenue28d <= 0) result.push("Revenue signal is flat over the last 28 days.")
    if (!result.length) result.push("System healthy. Continue cadence and monitor consistency heatmap.")
    return result.slice(0, 4)
  }, [authState.isAuthenticated, recentUploads.length, revenue28d])

  const revenueMomentum = [18, 22, 26, 30].map((base, idx) => ({
    label: `W${idx + 1}`,
    value: Math.max(8, Math.round((revenue28d / 100) * (base / 10))),
  }))

  const trafficSources = useMemo(() => {
    const cache = readYouTubeAnalyticsCache()
    const report = cache.trafficSources as any
    if (!report || !Array.isArray(report.rows)) return []

    const headers = (report.columnHeaders || []).map((h: any) => String(h.name || "").toLowerCase())
    const typeIdx = headers.indexOf("insighttrafficsourcetype")
    const viewsIdx = headers.indexOf("views")

    if (typeIdx < 0 || viewsIdx < 0) return []

    const totalViews = report.rows.reduce((acc: number, row: any[]) => acc + (Number(row[viewsIdx]) || 0), 0)
    if (totalViews <= 0) return []

    return report.rows
      .map((row: any[]) => ({
        label: String(row[typeIdx] || "Other"),
        views: Number(row[viewsIdx]) || 0,
      }))
      .sort((a: any, b: any) => b.views - a.views)
      .map((item: any) => ({
        ...item,
        pct: Math.round((item.views / totalViews) * 100),
      }))
      .slice(0, 5)
  }, [lastSyncComplete])

  return {
    brain,
    authState,
    channelIdentity,
    isSyncing,
    lastSyncComplete,
    channelHandle,
    globalSyncData,
    statBlocks: statBlocks28d,
    getKpiStatBlocks,
    statBlocks28d,
    statBlocksLifetime,
    rawMetrics,
    upcomingDays,
    todayTasks,
    recentUploads,
    topPerformer,
    quickActions,
    consistencyDays,
    alerts,
    revenueMomentum,
    trafficSources,
    revenueByWeek: Array.from(canonicalRows.reduce((acc, row) => {
      const dt = new Date(row.uploadDate)
      if (Number.isNaN(dt.getTime())) return acc
      const revenue = metricCellValue(row.metrics.revenue) || 0
      if (revenue <= 0) return acc
      
      const monthStr = dt.toLocaleString('default', { month: 'short' })
      const firstDay = new Date(dt.getFullYear(), dt.getMonth(), 1)
      const weekIndex = Math.ceil(((dt.getTime() - firstDay.getTime()) / 86400000 + firstDay.getDay() + 1) / 7)
      const key = `${monthStr}-W${weekIndex}`
      
      if (!acc.has(key)) acc.set(key, { month: monthStr, week: `W${weekIndex}`, revenue: 0 })
      const bucket = acc.get(key)!
      bucket.revenue += revenue
      return acc
    }, new Map<string, {month: string, week: string, revenue: number}>()).values()).slice(0, 12).reverse(),
    // Avatar fallback chain mirrors AdaptiveNavigationShell (which has a
     // known-working profile picture in the top nav). Freshest first:
     // Google → channelIdentity → authState → brain → vt-sync → account.
    avatarUrl: toHighResYouTubeAvatar(
      account?.snapshot?.google?.channelThumbnail
      || channelIdentity?.avatarUrl
      || (authState as any)?.avatarUrl
      || authState.channelThumbnail
      || brain?.channelProfile?.thumbnail
      || brain?.channelProfile?.thumbnails?.high?.url
      || brain?.channelProfile?.thumbnails?.medium?.url
      || brain?.channelProfile?.thumbnails?.default?.url
      || vtSyncSnapshot.avatarUrl
      || account?.snapshot?.profile?.avatarUrl,
    ),
    channelTitle: authState.channelName || vtSyncSnapshot.channelName || "Your Channel",
    channelCustomUrl: authState.channelHandle || vtSyncSnapshot.channelCustomUrl || "@handle",
    formatRelativeTime,
    canonicalRows,
    videoAssets: videoAssetCatalog.items,
    videoAssetCatalogStatus: videoAssetCatalog.status,
    videoAssetCatalogError: videoAssetCatalog.error,
    dailySeries,
  }
}

export type DashboardData = ReturnType<typeof useDashboardData>
