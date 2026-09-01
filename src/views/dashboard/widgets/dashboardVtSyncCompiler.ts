// Dashboard-specific compiler over the vt-sync snapshot.
//
// Widgets on the ViewTube dashboard need a small, stable subset of channel
// data: format-dominance totals, revenue segments, per-day traffic mix, and
// monthly view buckets. The main `visualData.ts` adapter compiles the full
// canonical shape for the analytics page — this file distills that same
// snapshot into the smaller, dashboard-shaped payload without dragging in
// canonical row types the dashboard never reads.
//
// The compiler MERGES the local snapshot with rows persisted in IndexedDB
// (the same source `ComboChannelProgress` and `TrafficSourceEvolution` on the
// analytics page hydrate from), so if the user has synced analytics on
// another tab those rows show up on the dashboard immediately.

import {
  getVtSyncSnapshot,
  listVtSyncDatasetTableRows,
  mergeVtSyncPersistedApiRowsIntoSnapshot,
  toVtSyncPersistedApiState,
} from "../../../features/vt-sync-local"
import type { VtSyncSnapshot } from "../../../features/vt-sync-local"
import { buildFormatDominanceContentTypeTotals } from "../../../components/visualMetricSources"
import {
  buildTrafficSourceDailyTimeline,
  normalizeTrafficDayRows,
  parseCsvRows,
} from "../../../components/GraphsPageCharts"

export type DashboardTrafficBucket = {
  day: string
  shares: Record<string, number>
}
export type DashboardTrafficMix = {
  buckets: DashboardTrafficBucket[]
  sources: string[]
  sourceLifetimeShares: Record<string, number>
}
export type DashboardMonthlyPoint = { label: string; value: number }
export type DashboardCompiledData = {
  formatTotals: ReturnType<typeof buildFormatDominanceContentTypeTotals>
  revenue: { adTotal: number; premiumTotal: number; topDays: Array<{ day: string; total: number }> }
  trafficMix: DashboardTrafficMix
  monthlyViews: DashboardMonthlyPoint[]
  snapshotSource: VtSyncSnapshot["source"]
}

const readNumber = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value
  const parsed = Number(String(value ?? "").replace(/[$,%\s,]/g, ""))
  return Number.isFinite(parsed) ? parsed : 0
}

const monthKeyFromDate = (raw: unknown): string => {
  if (raw === null || raw === undefined || raw === "") return ""
  const iso = String(raw)
  if (/^\d{4}-\d{2}/.test(iso)) return iso.slice(0, 7)
  if (/^\d{1,2}\/\d{1,2}\/\d{2,4}/.test(iso)) {
    const [m, , yRaw] = iso.split("/")
    const y = yRaw && yRaw.length === 2 ? `20${yRaw}` : yRaw
    return `${y}-${m.padStart(2, "0")}`
  }
  const d = new Date(iso)
  if (Number.isFinite(d.getTime())) return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
  return ""
}

// Build the traffic mix using the SAME data path as the Traffic Source
// Evolution visual in the analytics-page toolbox:
//   1. Prefer live snapshot.trafficByDay (Analytics API).
//   2. Fall back to the uploaded-CSV cache via `parseCsvRows` when the live
//      feed is empty — this is how the reference visual keeps working after
//      the user imports CSVs but before a fresh Analytics sync.
//   3. Rows flow through `normalizeTrafficDayRows` +
//      `buildTrafficSourceDailyTimeline` so bucket keys and source labels
//      match the reference visual exactly.
const compileTrafficMix = (snapshot: VtSyncSnapshot, topN = 8): DashboardTrafficMix => {
  const liveRows = (Array.isArray(snapshot.trafficByDay) && snapshot.trafficByDay.length > 0
    ? snapshot.trafficByDay
    : (snapshot.tableExports?.traffic_day as Array<Record<string, unknown>>) || []) as Array<Record<string, unknown>>

  const liveNormalized = normalizeTrafficDayRows(liveRows)
  const rows = liveNormalized.length > 0 ? liveRows : parseCsvRows()
  const timeline = buildTrafficSourceDailyTimeline(rows, {})

  // Rank sources by lifetime total; take the top N.
  const totals = new Map<string, number>()
  for (const t of timeline) {
    for (const [source, views] of Object.entries(t.shares)) {
      totals.set(source, (totals.get(source) || 0) + (views as number))
    }
  }
  const topSources = [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([s]) => s)

  // Normalize each daily bucket to percent using ONLY the top-N sources
  // so the stacked columns sum to exactly 100%.
  const buckets: DashboardTrafficBucket[] = timeline.map((t) => {
    const sum = topSources.reduce((acc, s) => acc + ((t.shares[s] as number) || 0), 0) || 1
    const shares: Record<string, number> = {}
    for (const s of topSources) shares[s] = (((t.shares[s] as number) || 0) / sum) * 100
    return { day: t.bucket, shares }
  })

  // Lifetime shares of the top-N sources (used for the guaranteed-fill
  // horizontal bands and the tooltip legend).
  const lifetimeSum = topSources.reduce((acc, s) => acc + (totals.get(s) || 0), 0) || 1
  const sourceLifetimeShares: Record<string, number> = {}
  for (const s of topSources) sourceLifetimeShares[s] = ((totals.get(s) || 0) / lifetimeSum) * 100

  return { buckets, sources: topSources, sourceLifetimeShares }
}

const compileMonthlyViews = (snapshot: VtSyncSnapshot, lastN = 12): DashboardMonthlyPoint[] => {
  // Prefer live dailyMetrics; if empty, fall back to the SAME uploaded-CSV
  // cache the analytics-page Channel Performance visual falls back to.
  const liveDaily = (Array.isArray(snapshot.dailyMetrics) && snapshot.dailyMetrics.length > 0
    ? snapshot.dailyMetrics
    : (snapshot.tableExports?.daily as Array<Record<string, unknown>>) || []) as Array<Record<string, unknown>>
  const dailyRows: Array<Record<string, unknown>> = liveDaily.length > 0 ? liveDaily : parseCsvRows()

  const byMonth = new Map<string, number>()
  for (const row of dailyRows) {
    const rawDate = row.day ?? row.date ?? (row as Record<string, unknown>).Day ?? (row as Record<string, unknown>).Date
    const month = monthKeyFromDate(rawDate)
    if (!month) continue
    const views = readNumber(row.views ?? (row as Record<string, unknown>).Views ?? (row as Record<string, unknown>).viewCount)
    if (views <= 0) continue
    byMonth.set(month, (byMonth.get(month) || 0) + views)
  }

  // Fallback: monthlyMetrics table if daily didn't yield anything.
  if (byMonth.size === 0) {
    const monthlyRows = (Array.isArray(snapshot.monthlyMetrics) && snapshot.monthlyMetrics.length > 0
      ? snapshot.monthlyMetrics
      : (snapshot.tableExports?.monthly_api as Array<Record<string, unknown>>) || []) as Array<Record<string, unknown>>
    for (const row of monthlyRows) {
      const rawDate = row.month ?? row.date ?? row.day
      const month = monthKeyFromDate(rawDate)
      if (!month) continue
      const views = readNumber(row.views)
      if (views <= 0) continue
      byMonth.set(month, (byMonth.get(month) || 0) + views)
    }
  }

  const keys = [...byMonth.keys()].sort()
  return keys.slice(-lastN).map((k) => ({ label: k.slice(5), value: byMonth.get(k) || 0 }))
}

const compileRevenue = (snapshot: VtSyncSnapshot) => {
  const revenueRows = (snapshot.revenueSource as Array<Record<string, unknown>>) || []
  let adTotal = 0
  let premiumTotal = 0
  const daySums: Array<{ day: string; total: number }> = []
  for (const row of revenueRows) {
    const ad = readNumber(row.adRevenue)
    const premium = readNumber(row.redRevenue ?? row.premiumRevenue)
    const total = readNumber(row.revenue) || ad + premium
    adTotal += ad
    premiumTotal += premium
    const dayLabel = String(row.day ?? row.date ?? "").slice(5)
    if (dayLabel) daySums.push({ day: dayLabel, total })
  }
  const topDays = [...daySums].sort((a, b) => b.total - a.total).slice(0, 5)
  return { adTotal, premiumTotal, topDays }
}

/** Compile the dashboard payload from a snapshot that has already been
 *  merged with any persisted API rows. Kept sync so widgets can memo it. */
export const compileDashboardVtSync = (snapshot: VtSyncSnapshot): DashboardCompiledData => {
  const contentTypeRows = (snapshot.creatorContentTypes as Array<Record<string, unknown>>) || []
  return {
    formatTotals: buildFormatDominanceContentTypeTotals(contentTypeRows),
    revenue: compileRevenue(snapshot),
    trafficMix: compileTrafficMix(snapshot),
    monthlyViews: compileMonthlyViews(snapshot),
    snapshotSource: snapshot.source,
  }
}

/** Load persisted API rows from IndexedDB and merge them into the current
 *  in-memory snapshot. Returns the merged snapshot so the widget can compile
 *  its payload from a single call. */
export const loadMergedDashboardSnapshot = async (): Promise<VtSyncSnapshot> => {
  try {
    const records = await listVtSyncDatasetTableRows()
    const snap = getVtSyncSnapshot()
    const channelId = snap.channelId ?? (() => {
      const apiRecords = records.filter((r) => r.provenance === "api" && r.channelId)
      if (apiRecords.length === 0) return null
      apiRecords.sort((a, b) => (b.capturedAt || 0) - (a.capturedAt || 0))
      return apiRecords[0]!.channelId
    })()
    const persisted = toVtSyncPersistedApiState(records, channelId)
    return mergeVtSyncPersistedApiRowsIntoSnapshot(snap, persisted)
  } catch {
    return getVtSyncSnapshot()
  }
}
