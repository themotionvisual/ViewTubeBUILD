import { describe, expect, it } from "vitest"
import { buildYouTubeCommentUrl } from "./commentHandoff"

describe("buildYouTubeCommentUrl", () => {
  it("opens the specific comment in native YouTube", () => {
    expect(buildYouTubeCommentUrl("video id", "comment/id")).toBe(
      "https://www.youtube.com/watch?v=video%20id&lc=comment%2Fid",
    )
  })

  it("does not produce a broad video link without a comment id", () => {
    expect(buildYouTubeCommentUrl("video-id", "")).toBeNull()
  })
})
