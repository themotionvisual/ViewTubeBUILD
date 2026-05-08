import { describe, expect, it } from "vitest"

import type { CanonicalVideoRow, MetricCell } from "../analyticsContract"
import {
  buildUnifiedLedger,
  buildWindowSignature,
  buildYouTubeStyleProjection,
  selectAuthoritativeOwnerRows,
} from "../unifiedSourceOfTruth"

const cell = (value: number | null): MetricCell => ({
  value,
  status: value === null ? "unavailable" : "actual",
  source: "api",
  availability: value === null ? "unavailable" : "available",
  confidence: value === null ? "unavailable" : "raw_direct",
})

const baseRow = (overrides: Partial<CanonicalVideoRow>): CanonicalVideoRow => ({
  id: "r1",
  videoId: "vid-1",
  title: "Video One",
  uploadDate: "2026-01-10",
  format: "long",
  durationSeconds: 120,
  sourceMode: "api",
  metrics: {
    views: cell(100),
    watchHours: cell(3),
    likes: cell(5),
    dislikes: cell(0),
    comments: cell(2),
    shares: cell(1),
    subscribersGained: cell(4),
    subscribersLost: cell(0),
    impressions: cell(1000),
    revenue: cell(1.2),
    cpm: cell(2.2),
    rpm: cell(1.1),
    ctr: cell(2.4),
    newViewers: cell(10),
    returningViewers: cell(5),
    casualViewers: cell(7),
    regularViewers: cell(3),
    uniqueViewers: cell(12),
    avdSeconds: cell(20),
    avp: cell(35),
    engagedViews: cell(22),
    stw: cell(45),
    endScreenClickRate: cell(1),
    endScreenClicks: cell(1),
    endScreenImpressions: cell(10),
    cardClickRate: cell(2),
    cardTeaserClickRate: cell(2),
    cardTeaserClicks: cell(1),
    cardTeaserImpressions: cell(9),
    annotationImpressions: cell(0),
    annotationClickableImpressions: cell(0),
    annotationClosableImpressions: cell(0),
    annotationClicks: cell(0),
    annotationCloses: cell(0),
    redWatchHours: cell(0),
  },
  ...overrides,
})

describe("unified source of truth", () => {
  it("uses owner uploads as authoritative winner for owner-only and overlapping metrics", () => {
    const apiRow = baseRow({ sourceMode: "api" })
    const ownerRow = baseRow({
      sourceMode: "csv_table",
      metrics: {
        ...apiRow.metrics,
        ctr: cell(4.8),
        stw: cell(68),
        views: cell(120),
      },
    })

    const out = buildUnifiedLedger({
      channelId: "UC123",
      window: "90d",
      apiRows: [apiRow],
      ownerRows: [ownerRow],
    })

    const ctr = out.facts.find((f) => f.metric_name === "ctr")
    const stw = out.facts.find((f) => f.metric_name === "stw")
    const views = out.facts.find((f) => f.metric_name === "views")

    expect(ctr?.source_system).toBe("owner_upload")
    expect(ctr?.metric_value).toBe(4.8)
    expect(stw?.source_system).toBe("owner_upload")
    expect(stw?.availability).toBe("owner")
    expect(views?.source_system).toBe("owner_upload")
    expect(out.conflicts.some((c) => c.reason === "owner_precedence")).toBe(true)
  })

  it("remains idempotent when same rows are re-ingested", () => {
    const apiRow = baseRow({ sourceMode: "api" })
    const out1 = buildUnifiedLedger({
      channelId: "UC123",
      window: "28d",
      apiRows: [apiRow],
      ownerRows: [],
    })
    const out2 = buildUnifiedLedger({
      channelId: "UC123",
      window: "28d",
      apiRows: [apiRow, apiRow],
      ownerRows: [],
    })

    expect(out2.facts.length).toBe(out1.facts.length)
    expect(new Set(out2.facts.map((f) => f.fingerprint)).size).toBe(out2.facts.length)
  })

  it("builds youtube-style projections with deterministic totals", () => {
    const rowA = baseRow({ videoId: "a", uploadDate: "2026-01-10", metrics: { ...baseRow({}).metrics, engagedViews: cell(10) } })
    const rowB = baseRow({ videoId: "b", uploadDate: "2026-01-10", metrics: { ...baseRow({}).metrics, engagedViews: cell(15) } })

    const proj = buildYouTubeStyleProjection([rowA, rowB], "engagedViews")

    expect(proj.tableRows.length).toBe(2)
    expect(proj.chartRows.length).toBe(2)
    expect(proj.totalsRows).toEqual([{ Date: "2026-01-10", "Engaged views": 25 }])
  })

  it("selects authoritative owner rows via owner-only metric evidence", () => {
    const ownerLike = baseRow({ metrics: { ...baseRow({}).metrics, stw: cell(10) } })
    const selected = selectAuthoritativeOwnerRows([ownerLike])
    expect(selected.length).toBe(1)
  })

  it("builds stable window signatures", () => {
    expect(buildWindowSignature("UC1", "lifetime", "2026-01-01")).toBe(
      "UC1::lifetime::2026-01-01",
    )
  })
})
