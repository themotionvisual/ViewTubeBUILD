import { describe, expect, it, vi } from "vitest"
import { upsertLedgerEntry, type RawAnalyticsCache } from "./DataStore"

describe("upsertLedgerEntry", () => {
 it("preserves video inventory while adding immutable checkpoint entries", () => {
  vi.spyOn(Date, "now").mockReturnValue(1_720_000_000_000)
  const initial: RawAnalyticsCache = {
   videos: [{ videoId: "video-1", title: "Stored inventory" }],
   profile: { id: "channel-1" },
  }

  const withVideoMetrics = upsertLedgerEntry(initial, {
   source: "youtube_analytics_v2",
   context: "video",
   dimensions: ["video"],
   metrics: ["views"],
   payload: { rows: [["video-1", 42]] },
   window: "lifetime",
  })
  const completed = upsertLedgerEntry(withVideoMetrics, {
   source: "youtube_data_v3",
   context: "video",
   dimensions: ["video"],
   metrics: ["title"],
   payload: { count: 1 },
  })

  expect(initial.ledger).toBeUndefined()
  expect(completed.videos).toEqual(initial.videos)
  expect(completed.profile).toEqual(initial.profile)
  expect(Object.keys(completed.ledger || {})).toHaveLength(2)
  expect(Object.values(completed.ledger || {}).every((entry) => entry.syncedAt === 1_720_000_000_000)).toBe(true)
 })
})
