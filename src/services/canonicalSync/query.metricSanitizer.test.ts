import { beforeEach, describe, expect, it, vi } from "vitest"

const { proxyFetch, refreshTokenIfExpired } = vi.hoisted(() => ({
  proxyFetch: vi.fn(),
  refreshTokenIfExpired: vi.fn(),
}))

vi.mock("../youtube/youtubeApiClient", () => ({
  handleYouTubeApiError: vi.fn(),
  proxyFetch,
  refreshTokenIfExpired,
}))

vi.mock("../diagnostics", () => ({ reportDiagnostic: vi.fn() }))

import { fetchCanonicalAnalyticsReport } from "./query"

describe("canonical analytics query sanitization", () => {
  beforeEach(() => {
    proxyFetch.mockReset()
    refreshTokenIfExpired.mockReset()
  })

  it("does not issue a network request when a channel bundle contains only video reach metrics", async () => {
    await expect(fetchCanonicalAnalyticsReport({
      startDate: "2026-01-01",
      endDate: "2026-01-31",
      metrics: ["videoThumbnailImpressions", "videoThumbnailImpressionsClickRate"],
    }, "channel reach")).resolves.toMatchObject({ rows: [], columnHeaders: [] })

    expect(refreshTokenIfExpired).not.toHaveBeenCalled()
    expect(proxyFetch).not.toHaveBeenCalled()
  })

  it("keeps video reach metrics in a dimensions=video request", async () => {
    refreshTokenIfExpired.mockResolvedValue("token")
    proxyFetch.mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue({ rows: [] }) })

    await fetchCanonicalAnalyticsReport({
      startDate: "2026-01-01",
      endDate: "2026-01-31",
      metrics: ["videoThumbnailImpressions", "videoThumbnailImpressionsClickRate"],
      dimensions: ["video"],
    }, "video reach")

    expect(String(proxyFetch.mock.calls[0][0])).toContain("videoThumbnailImpressions")
  })
})
