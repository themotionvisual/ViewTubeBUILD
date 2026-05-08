import { useMemo } from "react"
import type {
 AnalyticsWindow,
 CanonicalMetricKey,
 CanonicalVideoRow,
} from "../../services/analyticsContract"
import { getMasterRows, getMetricSummary } from "../../services/analyticsSelectors"
import { useBrain } from "../../context/useBrain"

const metricValue = (
 row: CanonicalVideoRow,
 metricKey: CanonicalMetricKey,
): number => {
 const cell = row.metrics[metricKey]
 if (!cell || cell.status === "unavailable" || cell.value === null) return 0
 return cell.value
}

export interface CanonicalAnalyticsView {
 rows: CanonicalVideoRow[]
 summary: ReturnType<typeof getMetricSummary>
 topRows: Array<{
  id: string
  title: string
  format: CanonicalVideoRow["format"]
  views: number
  likes: number
  comments: number
  shares: number
  watchHours: number
  subscribers: number
  revenue: number
  ctr: number
  avp: number
 }>
 formatBreakdown: Array<{ name: string; value: number }>
 timelineSeries: Array<{
  date: string
  views: number
  watchHours: number
  revenue: number
  subscribers: number
 }>
}

export const useCanonicalAnalytics = (
 windowKey: AnalyticsWindow = "28d",
): CanonicalAnalyticsView => {
 const { lastSyncComplete } = useBrain()

 const rows = useMemo(
  () => getMasterRows(windowKey, "api"),
  [lastSyncComplete, windowKey],
 )

 const summary = useMemo(
  () => getMetricSummary(windowKey, "api"),
  [lastSyncComplete, windowKey],
 )

 const topRows = useMemo(
  () =>
   [...rows]
    .map((row, index) => ({
     id: row.videoId || `${row.title}-${index}`,
     title: row.title,
     format: row.format,
     views: metricValue(row, "views"),
     likes: metricValue(row, "likes"),
     comments: metricValue(row, "comments"),
     shares: metricValue(row, "shares"),
     watchHours: metricValue(row, "watchHours"),
     subscribers: metricValue(row, "subscribersGained"),
     revenue: metricValue(row, "revenue"),
     ctr: metricValue(row, "ctr"),
     avp: metricValue(row, "avp"),
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 50),
  [rows],
 )

 const formatBreakdown = useMemo(() => {
  const map = new Map<string, number>()
  topRows.forEach((row) => {
   map.set(row.format, (map.get(row.format) || 0) + row.views)
  })
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
 }, [topRows])

 const timelineSeries = useMemo(() => {
  const dayMap = new Map<
   string,
   { views: number; watchHours: number; revenue: number; subscribers: number }
  >()

  rows.forEach((row) => {
   const parsed = new Date(row.uploadDate)
   if (Number.isNaN(parsed.getTime())) return

   const dateKey = parsed.toISOString().slice(0, 10)
   const bucket = dayMap.get(dateKey) || {
    views: 0,
    watchHours: 0,
    revenue: 0,
    subscribers: 0,
   }

   bucket.views += metricValue(row, "views")
   bucket.watchHours += metricValue(row, "watchHours")
   bucket.revenue += metricValue(row, "revenue")
   bucket.subscribers += metricValue(row, "subscribersGained")

   dayMap.set(dateKey, bucket)
  })

  return Array.from(dayMap.entries())
   .sort(([a], [b]) => a.localeCompare(b))
   .map(([date, bucket]) => ({ date, ...bucket }))
 }, [rows])

 return {
  rows,
  summary,
  topRows,
  formatBreakdown,
  timelineSeries,
 }
}

export const formatCompactNumber = (value: number): string => {
 if (!Number.isFinite(value)) return "-"
 if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
 if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}K`
 return Math.round(value).toLocaleString()
}

export const formatCurrency = (value: number): string => `$${value.toFixed(2)}`
