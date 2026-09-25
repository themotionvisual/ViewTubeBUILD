import type { VtSyncSnapshot } from "../../../features/vt-sync-local/adapters/contracts"
import { latestCompleteAnalyticsDate } from "../../../services/analytics/windows"

export type OverviewChartData = Pick<VtSyncSnapshot, "devices" | "subscriptionStatuses" | "trafficByDay" | "datasetsByWindow" | "capturedAt" | "storageMetadata">
export type ChartSlice = { label: string; value: number; share: number }
export type TrafficPoint = { date: string; shares: Record<string, number> }

const positive = (value: unknown) => {
 const number = Number(value)
 return Number.isFinite(number) && number > 0 ? number : 0
}

const chartWindow = (days: number) => ({ 7: "7d", 28: "28d", 90: "90d", 365: "365d", 99999: "lifetime" } as const)[days as 7 | 28 | 90 | 365 | 99999]

export const overviewSlices = (data: OverviewChartData, kind: "audience" | "devices", days: number): ChartSlice[] => {
 const window = chartWindow(days)
 if (!window) return [] // Aggregate rows cannot truthfully represent a custom window.
 const dataset = kind === "audience" ? "subscription_status" : "device_type"
 const field = kind === "audience" ? "subscriptionStatuses" : "devices"
 if (window === "lifetime" && (data.storageMetadata?.fullRowCountByField?.[field] || 0) > (data.storageMetadata?.visiblePreviewRowCountByField?.[field] || 0)) return []
 const aggregateRows = kind === "audience" ? data.subscriptionStatuses : data.devices
 const exactRows = window === "lifetime" ? aggregateRows : data.datasetsByWindow?.[window]?.[dataset] || []
 const fallbackWindows = ["7d", "28d", "90d", "365d", "lifetime"] as const
 const fallbackRows = fallbackWindows
  .filter((candidate) => candidate !== window)
  .map((candidate) => candidate === "lifetime" ? aggregateRows : data.datasetsByWindow?.[candidate]?.[dataset] || [])
  .find((candidateRows) => candidateRows.length > 0)
 const rows = exactRows.length > 0 ? exactRows : (fallbackRows || aggregateRows)
 const counts = new Map<string, number>()
 rows.forEach((row) => {
  const code = String(kind === "audience" ? (row.status ?? row.subscribedStatus ?? "") : (row.device ?? row.deviceType ?? "")).trim()
  const value = positive(row.views)
  if (!code || !value) return
  const label = code.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase())
  counts.set(label, (counts.get(label) || 0) + value)
 })
 const total = [...counts.values()].reduce((sum, value) => sum + value, 0)
 return [...counts].sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value, share: value / total * 100 }))
}

export const overviewTraffic = (data: OverviewChartData, days: number, now = new Date()) => {
 const partial = (data.storageMetadata?.fullRowCountByField?.trafficByDay || 0) > (data.storageMetadata?.visiblePreviewRowCountByField?.trafficByDay || 0)
 if (partial) return { sources: [], points: [] as TrafficPoint[], partial }
 const end = latestCompleteAnalyticsDate(now)
 const endDate = end.toISOString().slice(0, 10)
 const start = new Date(end)
 if (days !== 99999) start.setUTCDate(start.getUTCDate() - days + 1)
 const startDate = start.toISOString().slice(0, 10)
 const byDate = new Map<string, Map<string, number>>()
 data.trafficByDay.forEach((row) => {
  const date = String(row.day ?? row.date ?? "").slice(0, 10)
  const source = String(row.term ?? row.source ?? row.trafficSource ?? "").trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < startDate || date > endDate || !source) return
  const value = positive(row.views)
  if (!value) return
  const sources = byDate.get(date) || new Map<string, number>()
  sources.set(source, (sources.get(source) || 0) + value)
  byDate.set(date, sources)
 })
 const totals = new Map<string, number>()
 byDate.forEach((sources) => sources.forEach((value, source) => totals.set(source, (totals.get(source) || 0) + value)))
 const leading = [...totals].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([source]) => source)
 const sources = [...leading, ...(totals.size > leading.length ? ["Other"] : [])]
 const dates = [...byDate.keys()].sort()
 // Bin adjacent observed days so a year of data does not produce hundreds of SVG marks.
 const binSize = Math.max(1, Math.ceil(dates.length / 16))
 const points: TrafficPoint[] = []
 for (let index = 0; index < dates.length; index += binSize) {
  const group = dates.slice(index, index + binSize)
  const counts = Object.fromEntries(sources.map((source) => [source, 0]))
  group.forEach((date) => byDate.get(date)?.forEach((value, source) => {
   counts[leading.includes(source) ? source : "Other"] += value
  }))
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0)
  points.push({ date: group[group.length - 1], shares: Object.fromEntries(sources.map((source) => [source, counts[source] / total * 100])) })
 }
 return { sources, points, partial }
}
