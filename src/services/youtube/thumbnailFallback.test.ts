import { beforeEach, describe, expect, it } from "vitest"
import {
  firstYouTubeThumbnailCandidate,
  getYouTubeThumbnailCandidates,
  nextYouTubeThumbnailCandidate,
  resetFailedYouTubeThumbnailsForTests,
  YOUTUBE_THUMBNAIL_PLACEHOLDER,
} from "./thumbnailFallback"

describe("YouTube thumbnail fallback", () => {
  beforeEach(resetFailedYouTubeThumbnailsForTests)

  it("preserves preferred images before the canonical YouTube fallback order", () => {
    expect(getYouTubeThumbnailCandidates("abc", ["https://cdn.example/thumb.jpg"])).toEqual([
      "https://cdn.example/thumb.jpg",
      "https://i.ytimg.com/vi/abc/maxresdefault.jpg",
      "https://i.ytimg.com/vi/abc/hq720.jpg",
      "https://i.ytimg.com/vi/abc/hqdefault.jpg",
      "https://i.ytimg.com/vi/abc/mqdefault.jpg",
    ])
  })

  it("advances past failed candidates and remembers failures for the session", () => {
    const maxres = firstYouTubeThumbnailCandidate("abc")
    expect(nextYouTubeThumbnailCandidate("abc", maxres)).toContain("hq720.jpg")
    expect(firstYouTubeThumbnailCandidate("abc")).toContain("hq720.jpg")
  })

  it("ends with a deterministic 16:9 placeholder", () => {
    const candidates = getYouTubeThumbnailCandidates("abc")
    candidates.forEach((url) => nextYouTubeThumbnailCandidate("abc", url))
    expect(firstYouTubeThumbnailCandidate("abc")).toBe(YOUTUBE_THUMBNAIL_PLACEHOLDER)
    expect(YOUTUBE_THUMBNAIL_PLACEHOLDER).toContain("viewBox='0 0 320 180'")
  })
})
