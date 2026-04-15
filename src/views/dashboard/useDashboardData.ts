import { useMemo } from "react"
import { useBrain } from "../../context/GlobalDataContext"
import { getMasterRows, getMetricSummary } from "../../services/analyticsSelectors"

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

  const summary28d = useMemo(() => getMetricSummary("28d", "api"), [lastSyncComplete])
  const canonicalRows = useMemo(() => getMasterRows("lifetime", "api"), [lastSyncComplete])

  const subsTotal = Number(authState.subscriberCount || 0) || 0
  const views28d = summary28d.totals.views
  const hours28d = summary28d.totals.watchHours
  const revenue28d = summary28d.totals.revenue
  const subscribers28d = summary28d.totals.subscribersGained
  const resolvedSubscribers = Math.max(0, Math.round(subsTotal + subscribers28d))

  const statBlocks = [
    { label: "Views", value: formatHumanNumber(views28d), color: "#C9F830" },
    { label: "Subscribers", value: resolvedSubscribers.toLocaleString(), color: "#4FFF5B" },
    { label: "Hours", value: formatHumanNumber(hours28d), color: "#FF83EA" },
    { label: "Revenue", value: `$${revenue28d.toFixed(2)}`, color: "#FFE357" },
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
  ]

  const todayTasks = upcomingDays.find((d) => d.isToday)?.tasks || []

  const consistencyDays = useMemo(() => {
    const uploadsByDate = new Set(
      canonicalRows
        .map((row) => {
          const dt = new Date(row.uploadDate)
          if (Number.isNaN(dt.getTime())) return null
          dt.setHours(0, 0, 0, 0)
          return dt.toISOString().split("T")[0]
        })
        .filter((value): value is string => Boolean(value)),
    )

    return upcomingDays.map((day) => ({
      dateStr: day.dateStr,
      active: uploadsByDate.has(day.dateStr),
      hasTasks: day.tasks.length > 0,
    }))
  }, [canonicalRows, upcomingDays])

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

  return {
    brain,
    authState,
    isSyncing,
    lastSyncComplete,
    globalSyncData,
    statBlocks,
    upcomingDays,
    todayTasks,
    recentUploads,
    topPerformer,
    quickActions,
    consistencyDays,
    alerts,
    revenueMomentum,
    avatarUrl: toHighResYouTubeAvatar(authState.channelThumbnail),
    formatRelativeTime,
  }
}

export type DashboardData = ReturnType<typeof useDashboardData>
