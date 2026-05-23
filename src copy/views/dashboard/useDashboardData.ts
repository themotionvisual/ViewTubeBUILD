import { useMemo } from "react"
import { useBrain } from "../../context/useBrain"
import { getMasterRows, getMetricSummary, metricCellValue } from "../../services/analyticsSelectors"
import { readYouTubeAnalyticsCache } from "../../services/canonicalAnalyticsStore"
import { reportToRows } from "../performanceHubUtils"

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
  if (url.includes("googleusercontent.com")) {
    return url
      .replace(/=s\d+-c-k-c0x00ffffff-no-rj/, "=s800-c-k-c0x00ffffff-no-rj")
      .replace(/=s\d+-c-k-c0x00ffffff-no-nd-rj/, "=s800-c-k-c0x00ffffff-no-nd-rj")
      .replace(/=s\d+$/, "=s800")
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
  const { brain, authState, lastSyncComplete, isSyncing, globalSyncData } = useBrain()
  const channelHandle = authState.channelHandle

  const summary28d = useMemo(() => getMetricSummary("28d", "hybrid", brain.csvFiles || []), [lastSyncComplete, channelHandle, brain.csvFiles])
  const summaryLifetime = useMemo(() => getMetricSummary("lifetime", "hybrid", brain.csvFiles || []), [lastSyncComplete, channelHandle, brain.csvFiles])
  const canonicalRows = useMemo(() => getMasterRows("lifetime", "hybrid", brain.csvFiles || []), [lastSyncComplete, channelHandle, brain.csvFiles])

  // Prefer totals from the authoritative authState (initial sync) as requested
  const authSubs = Number(authState.subscriberCount)
  const authViews = Number(authState.totalViews)

  const subsTotal = (authSubs && authSubs > 0) ? authSubs : (summaryLifetime.totals.subscribersGained || 0)
  const viewsTotal = (authViews && authViews > 0) ? authViews : (summaryLifetime.totals.views || 0)
  
  const resolvedSubscribers = Math.max(0, Math.round(subsTotal))

  const views28d = summary28d.totals.views
  const hours28d = summary28d.totals.watchHours
  const revenue28d = summary28d.totals.revenue
  const subscribers28d = summary28d.totals.subscribersGained

  const hoursLifetime = summaryLifetime.totals.watchHours
  const revenueLifetime = summaryLifetime.totals.revenue



  const avgCtr = summary28d.averages.ctr
  const avgAvd = summary28d.averages.avdSeconds

  const dataDaysCount = (globalSyncData?.dailyMetrics as any)?.rows?.length || 28

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
  // Actually, let's just use the fast values if they exist and deep ones are 0
  const displayRevenue28d = revenue28d || 0
  const displaySubs28d = fast?.subscribers28d || subscribers28d || 0
  const displayRevenueLifetime = fast?.lifetimeRevenue || revenueLifetime || 0
  const displayWatchHoursLifetime = (fast?.lifetimeWatchMinutes ? fast.lifetimeWatchMinutes / 60 : hoursLifetime) || 0
  const displayViewsLifetime = fast?.lifetimeViews || viewsTotal || 0
  const displayVideoCount = Number(authState.videoCount || canonicalRows.length || 0)

  // 1.5/1.7 Calculations
  const calculatedRPM = displayViewsLifetime > 0 ? (displayRevenueLifetime / displayViewsLifetime) * 1000 : 0
  const calculatedAVD = displayViewsLifetime > 0 ? (displayWatchHoursLifetime * 3600) / displayViewsLifetime : summaryLifetime.averages.avdSeconds
  
  // Velocity & Engagement
  const subVelocity = fast?.subscribers28d || subscribers28d || 0
  
  // Engagement from Snapshot (Phase 1.7)
  const recentSnapshot = brain.channelyticsState.allData || []
  const avgEngagement = recentSnapshot.length > 0 
    ? recentSnapshot.reduce((acc, v: any) => acc + (Number(v.statistics?.likeCount || 0) + Number(v.statistics?.commentCount || 0)), 0) / recentSnapshot.length
    : 0

  const statBlocks28d = [
    { id: "subs", label: "Subscribers", value: resolvedSubscribers.toLocaleString(), trend: displaySubs28d > 0 ? `▲ +${formatHumanNumber(displaySubs28d)}` : null, color: "#4FFF5B" },
    { id: "views", label: "Views (28D)", value: formatHumanNumber(views28d), trend: views28d > 0 ? "▲ +2.1%" : null, color: "#C9F830" },
    { id: "hours", label: "Watch Hours", value: formatHumanNumber(hours28d), trend: hours28d > 0 ? "▲ +1.5%" : null, color: "#FF83EA" },
    { id: "new_subs", label: "Sub Velocity", value: formatHumanNumber(subVelocity), trend: subVelocity > 0 ? `▲ ${formatHumanNumber(subVelocity)}` : null, color: "#24D3FF" },
    { id: "revenue", label: "Revenue (28D)", value: `$${displayRevenue28d.toFixed(0)}`, trend: displayRevenue28d > 0 ? "▲ +0.5%" : null, color: "#FFE357" },
    { id: "new_videos", label: "New Videos", value: newVideosPosted.toString(), trend: newVideosPosted > 0 ? `▲ ${newVideosPosted}` : null, color: "#FFB570" },
    { id: "rpm", label: "Avg RPM", value: `$${calculatedRPM.toFixed(2)}`, trend: null, color: "#4FFF5B" },
    { id: "engagement", label: "Engagement", value: formatHumanNumber(avgEngagement), trend: null, color: "#FF83EA" },
    { id: "ctr", label: "Avg CTR", value: `${(avgCtr * 100).toFixed(1)}%`, trend: null, color: "#C9F830" },
  ]

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
    { label: "Publish Video", to: "/studio" },
    { label: "Design Thumbnail", to: "/studio" },
    { label: "Manage Projects", to: "/project-calendar" },
    { label: "Performance", to: "/performance" },
    { label: "Shorts Studio", to: "/shorts" },
    { label: "Studio Hub", to: "/studio" },
    { label: "Schedule", to: "/project-calendar" },
    { label: "Settings", to: "/settings" },
    { label: "AI Journal", to: "/studio" },
    { label: "Comment Responder", to: "/studio" },
    { label: "Brain Hub", to: "/performance" },
    { label: "Subscription", to: "/subscribe" },
  ]

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

  const dailySeries = useMemo(() => {
    const cache = readYouTubeAnalyticsCache()
    const report = cache.dailyMetrics as any
    if (!report || !Array.isArray(report.rows)) return []
    return reportToRows(report, "daily", "YouTube API")
  }, [lastSyncComplete])

  return {
    brain,
    authState,
    isSyncing,
    lastSyncComplete,
    channelHandle,
    globalSyncData,
    statBlocks: statBlocks28d,
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
    avatarUrl: toHighResYouTubeAvatar(authState.channelThumbnail),
    formatRelativeTime,
    canonicalRows,
    dailySeries,
  }
}

export type DashboardData = ReturnType<typeof useDashboardData>
