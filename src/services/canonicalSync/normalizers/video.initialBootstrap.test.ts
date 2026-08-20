import { describe, expect, it } from "vitest"
import { normalizeVideoRecord } from "./video"

describe("initial bootstrap video normalization", () => {
 it.each(["private", "unlisted"])("keeps %s inventory but classifies its format as unknown", (privacyStatus) => {
  const video = normalizeVideoRecord("channel-1", {
   id: `video-${privacyStatus}`,
   snippet: {
    title: "Hidden upload",
    description: "One. Two. Three. Four.",
    publishedAt: "2026-07-15T00:00:00Z",
    thumbnails: { high: { url: "https://example.test/thumb.jpg", width: 480, height: 360 } },
   },
   contentDetails: { duration: "PT10M", definition: "hd", caption: "false" },
   status: { privacyStatus },
  }, {})
  expect(video.format).toBe("unknown")
  expect(video.privacyStatus).toBe(privacyStatus)
  expect(video.fullDescription).toBe("One. Two. Three. Four.")
  expect(video.description.replace(/\s+/g, " ")).toBe("One. Two. Three.")
 })

 it("preserves missing public statistics as null", () => {
  const video = normalizeVideoRecord("channel-1", {
   id: "video-no-stats",
   snippet: { title: "No stats", publishedAt: "2026-07-15T00:00:00Z" },
   contentDetails: { duration: "PT1M" },
   status: { privacyStatus: "public" },
  }, {})
  expect(video.metricsByWindow.lifetime?.views).toBeNull()
  expect(video.metricsByWindow.lifetime?.likes).toBeNull()
  expect(video.metricsByWindow.lifetime?.comments).toBeNull()
 })
})
