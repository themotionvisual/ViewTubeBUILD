import { describe, expect, it } from "vitest"
import { createVtSyncAnalyticsBundle, parseVtSyncAnalyticsBundle } from "./analyticsBundle"

describe("VT-SYNC analytics bundle", () => {
 it("creates a versioned bundle and removes secret-like fields recursively", () => {
  const bundle = createVtSyncAnalyticsBundle({
   datasets: { videos: [{ videoId: "abc", views: 12, accessToken: "nope", nested: { apiKey: "nope", safe: true } }] },
   authenticatedAtExport: false,
   exportedAt: "2026-08-22T00:00:00.000Z",
  })
  expect(bundle.datasets.videos.rows).toEqual([{ videoId: "abc", views: 12, nested: { safe: true } }])
  expect(bundle.format).toBe("viewtube-analytics-bundle")
  expect(bundle.version).toBe(1)
 })

 it("validates every dataset before returning the bundle", () => {
  const valid = createVtSyncAnalyticsBundle({ datasets: { videos: [] }, authenticatedAtExport: false })
  expect(parseVtSyncAnalyticsBundle(JSON.stringify(valid), new Set(["videos"]))).toEqual(valid)
  expect(() => parseVtSyncAnalyticsBundle(JSON.stringify({ ...valid, version: 2 }), new Set(["videos"]))).toThrow("Unsupported")
  expect(() => parseVtSyncAnalyticsBundle(JSON.stringify({ ...valid, datasets: { hidden: valid.datasets.videos } }), new Set(["videos"]))).toThrow("Unknown")
  expect(() => parseVtSyncAnalyticsBundle(JSON.stringify({ ...valid, datasets: { videos: { ...valid.datasets.videos, rowCount: 1 } } }), new Set(["videos"]))).toThrow("row count")
 })
})
