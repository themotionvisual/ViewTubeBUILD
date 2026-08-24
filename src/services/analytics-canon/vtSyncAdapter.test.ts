// Shape parity tests — the canonical adapter must emit output that
// downstream widgets/AI/tools accept without any consumer-side changes.
// If any of these fail, the migration is not shape-safe for that
// consumer path.

import { describe, expect, it } from "vitest"
import type { VtSyncSnapshot, VtSyncVideoItem } from "../../features/vt-sync-local/adapters/contracts"
import {
 filterCanonicalRowsByWindow,
 getCanonicalRowsFromVtSync,
 getMetricSummaryFromVtSync,
 getWindowTotalsFromVtSync,
 projectVtSyncVideoToCanonicalRow,
 summarizeCanonicalRows,
} from "./vtSyncAdapter"

// A small, deterministic snapshot factory — enough shape to exercise
// every downstream field without pulling in the real VT Sync store.
const makeVideo = (
 id: string,
 daysAgo: number,
 metrics: Partial<VtSyncVideoItem["metrics"]> = {},
): VtSyncVideoItem =>
 ({
  id,
  title: `Video ${id}`,
  thumbnail: `https://img.example/${id}.jpg`,
  publishedAt: new Date(Date.now() - daysAgo * 86400 * 1000).toISOString(),
  format: "long",
  metrics: {
   views: 1000,
   watchTime: 60,
   revenue: 5,
   subscribersGained: 2,
   ctr: 0.08,
   ...metrics,
  },
 }) as VtSyncVideoItem

const makeSnapshot = (videos: VtSyncVideoItem[]): VtSyncSnapshot =>
 ({
  source: "vt-sync",
  snapshotId: "test",
  capturedAt: new Date().toISOString(),
  videos,
  dailyMetrics: [],
  monthlyMetrics: [],
  trafficSources: [],
  trafficDetails: [],
  searchTerms: [],
  demographics: [],
  geography: [],
  devices: [],
  operatingSystems: [],
  deviceOs: [],
  trafficByDay: [],
  playbackLocations: [],
  subscriptionStatuses: [],
  formatSubscriberStatuses: [],
  playlistsData: [],
  adTypes: [],
  cities: [],
  provinces: [],
  dmaRegions: [],
  continentsData: [],
  extWebsites: [],
  suggestedVideos: [],
  hashtags: [],
  soundPages: [],
  creatorContentTypes: [],
  demographicsByAge: [],
  demographicsByGender: [],
  trafficAdvertising: [],
  audienceWatchBehavior: [],
  sharingService: [],
  newReturningViewers: [],
  revenueSource: [],
  subscriptionSource: [],
  trafficChannelPages: [],
  trafficOtherFeatures: [],
  trafficSubscriberData: [],
  trafficShorts: [],
  trafficShortsContentLink: [],
  trafficBrowseFeatures: [],
  trafficCampaignCard: [],
  trafficCard: [],
  trafficEndScreen: [],
  trafficLiveRedirect: [],
  trafficNotification: [],
  trafficNoLinkEmbedded: [],
  trafficNoLinkOther: [],
  trafficPlaylist: [],
  trafficYtPlaylistPage: [],
  retentions: [],
 }) as VtSyncSnapshot

describe("projectVtSyncVideoToCanonicalRow", () => {
 it("emits every field a CanonicalVideoRow requires", () => {
  const row = projectVtSyncVideoToCanonicalRow(makeVideo("v1", 1))
  expect(row.id).toBe("v1")
  expect(row.videoId).toBe("v1")
  expect(row.title).toBe("Video v1")
  expect(row.thumbnailUrl).toBe("https://img.example/v1.jpg")
  expect(row.uploadDate).toMatch(/T.*Z$/)
  expect(row.format).toBe("long")
  // sourceMode uses the canonical MetricSource union — "api" for now.
  // When MetricSource adds a "vt_sync" variant, this becomes "vt_sync".
  expect(row.sourceMode).toBe("api")
  expect(row.metrics.views?.value).toBe(1000)
  // vt-sync stores watchTime in minutes; canonical stores watchHours.
  expect(row.metrics.watchHours?.value).toBe(1)
  expect(row.metrics.revenue?.value).toBe(5)
 })

 it("returns 'unavailable' cells for missing metric fields, not zero", () => {
  const row = projectVtSyncVideoToCanonicalRow(
   makeVideo("v1", 1, { revenue: undefined, cpm: undefined }),
  )
  expect(row.metrics.revenue?.value).toBeNull()
  expect(row.metrics.revenue?.status).toBe("unavailable")
  expect(row.metrics.cpm?.value).toBeNull()
  // Cells that DO have data stay populated.
  expect(row.metrics.views?.value).toBe(1000)
 })

 it("normalizes vt-sync format values to the canonical enum", () => {
  const short = projectVtSyncVideoToCanonicalRow({
   ...makeVideo("s1", 1),
   format: "short",
  } as VtSyncVideoItem)
  const live = projectVtSyncVideoToCanonicalRow({
   ...makeVideo("l1", 1),
   format: "live",
  } as VtSyncVideoItem)
  const unknown = projectVtSyncVideoToCanonicalRow({
   ...makeVideo("u1", 1),
   format: "wat",
  } as VtSyncVideoItem)
  expect(short.format).toBe("shorts")
  expect(live.format).toBe("live")
  expect(unknown.format).toBe("unknown")
 })
})

describe("filterCanonicalRowsByWindow", () => {
 it("returns every row for 'lifetime'", () => {
  const rows = [makeVideo("a", 1), makeVideo("b", 400)].map(
   projectVtSyncVideoToCanonicalRow,
  )
  expect(filterCanonicalRowsByWindow(rows, "lifetime")).toHaveLength(2)
 })

 it("filters by day window", () => {
  const rows = [
   makeVideo("today", 0),
   makeVideo("last-week", 6),
   makeVideo("last-month", 30),
   makeVideo("last-year", 300),
  ].map(projectVtSyncVideoToCanonicalRow)
  expect(filterCanonicalRowsByWindow(rows, "7d")).toHaveLength(2)
  expect(filterCanonicalRowsByWindow(rows, "28d")).toHaveLength(2)
  expect(filterCanonicalRowsByWindow(rows, "90d")).toHaveLength(3)
  expect(filterCanonicalRowsByWindow(rows, "365d")).toHaveLength(4)
 })

 it("drops rows with an unparseable uploadDate", () => {
  const bad = [{ ...makeVideo("bad", 0), publishedAt: "not-a-date" }].map(
   projectVtSyncVideoToCanonicalRow as (v: VtSyncVideoItem) => ReturnType<typeof projectVtSyncVideoToCanonicalRow>,
  )
  expect(filterCanonicalRowsByWindow(bad, "7d")).toHaveLength(0)
 })
})

describe("getCanonicalRowsFromVtSync + snapshot integration", () => {
 it("returns [] for null/undefined snapshot without throwing", () => {
  expect(getCanonicalRowsFromVtSync(null, "28d")).toEqual([])
  expect(getCanonicalRowsFromVtSync(undefined, "lifetime")).toEqual([])
 })

 it("returns [] when the snapshot has no videos array", () => {
  const snap = { ...makeSnapshot([]), videos: undefined as unknown as VtSyncVideoItem[] }
  expect(getCanonicalRowsFromVtSync(snap, "28d")).toEqual([])
 })

 it("projects and filters in one call", () => {
  const snap = makeSnapshot([
   makeVideo("recent", 5),
   makeVideo("old", 100),
  ])
  const rows = getCanonicalRowsFromVtSync(snap, "28d")
  expect(rows).toHaveLength(1)
  expect(rows[0].id).toBe("recent")
 })
})

describe("summarizeCanonicalRows / getMetricSummaryFromVtSync", () => {
 it("matches the legacy MetricSummary shape field-for-field", () => {
  const snap = makeSnapshot([
   makeVideo("a", 1, { views: 100, watchTime: 60, revenue: 5, subscribersGained: 1, ctr: 0.1 }),
   makeVideo("b", 1, { views: 200, watchTime: 120, revenue: 15, subscribersGained: 3, ctr: 0.05 }),
  ])
  const summary = getMetricSummaryFromVtSync(snap, "lifetime")

  // Every field the MetricSummary contract requires exists at the right nesting.
  expect(summary).toEqual({
   rowCount: 2,
   totals: {
    views: 300,
    watchHours: 180 / 60, // watchTime is minutes, watchHours is hours
    subscribersGained: 4,
    revenue: 20,
   },
   averages: {
    ctr: expect.closeTo(0.075, 3),
    rpm: null, // rows had no rpm, so average is null (not zero)
    cpm: null,
    avdSeconds: null,
    avp: null,
   },
  })
 })

 it("returns zero-totals + null-averages for an empty snapshot", () => {
  const summary = summarizeCanonicalRows([])
  expect(summary.rowCount).toBe(0)
  expect(summary.totals).toEqual({ views: 0, watchHours: 0, subscribersGained: 0, revenue: 0 })
  expect(summary.averages).toEqual({ ctr: null, rpm: null, cpm: null, avdSeconds: null, avp: null })
 })
})

describe("getWindowTotalsFromVtSync", () => {
 it("matches the legacy WindowTotals shape field-for-field", () => {
  const snap = makeSnapshot([makeVideo("a", 1, { views: 100, watchTime: 60, revenue: 5 })])
  const totals = getWindowTotalsFromVtSync(snap, "lifetime")
  expect(totals).toEqual({
   views: 100,
   watchHours: 1,
   subscribersGained: 2,
   revenue: 5,
   impressions: 0,
   ctr: 0.08,
  })
 })
})
