import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("../youtube/youtubeApiClient", () => ({
 refreshTokenIfExpired: vi.fn().mockResolvedValue("mock-token"),
 proxyFetch: vi.fn(),
 handleYouTubeApiError: vi.fn((error: unknown) => {
  throw error
 }),
 YouTubeApiError: class YouTubeApiError extends Error {},
 ANALYTICS_URL: "https://youtubeanalytics.googleapis.com/v2/reports",
 REPORTING_URL: "https://youtubereporting.googleapis.com/v1",
}))

vi.mock("../authSession", () => ({
 logout: vi.fn(),
}))

import { proxyFetch } from "../youtube/youtubeApiClient"
import { fetchAnalytics } from "../youtube/youtubeAnalyticsFetcher"

describe("youtubeAnalyticsFetcher end-screen request guard", () => {
 beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(proxyFetch).mockResolvedValue({
   ok: true,
   json: async () => ({
    columnHeaders: [
     { name: "video", columnType: "DIMENSION", dataType: "STRING" },
     { name: "views", columnType: "METRIC", dataType: "INTEGER" },
    ],
    rows: [["abc123", 1]],
   }),
  } as Response)
 })

 it("does not send known-invalid per-video end-screen element metric requests", async () => {
  const result = await fetchAnalytics("2025-09-06", "2026-05-15", "channel_123", {
   batchMode: "next",
   targetVideoIds: ["abc123"],
  })

  const requestedUrls = vi
   .mocked(proxyFetch)
   .mock.calls.map(([url]) => String(url))

  expect(requestedUrls.join("\n")).not.toContain("endScreenElement")
  expect(result.groups.end_screen.ok).toBe(true)
  expect(result.groups.end_screen.metrics).toEqual([])
  expect(result.syncDiagnostics.disabledMetrics).toEqual(
   expect.arrayContaining([
    "endScreenElementImpressions",
    "endScreenElementClicks",
    "endScreenElementClickRate",
   ]),
  )
 })
})
