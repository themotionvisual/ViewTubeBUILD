import { describe, expect, it } from "vitest"
import {
  rankCommunityAdvocates,
  type CommunityCommentEvidence,
} from "./superfanIntelligence"

const comments: CommunityCommentEvidence[] = [
  { id: "a1", author: "Alice", videoId: "v1", text: "Great", likeCount: 2, replyCount: 1, publishedAt: "2026-09-26T12:00:00Z" },
  { id: "a2", author: "Alice", videoId: "v2", text: "Loved this too", likeCount: 3, replyCount: 0, publishedAt: "2026-09-20T12:00:00Z" },
  { id: "a3", author: "Alice", videoId: "v3", text: "Another one", likeCount: 1, replyCount: 0, publishedAt: "2026-09-10T12:00:00Z" },
  { id: "b1", author: "Bob", videoId: "v1", text: "Popular comment", likeCount: 40, replyCount: 4, publishedAt: "2026-09-25T12:00:00Z" },
  { id: "c1", author: "Channel Owner", videoId: "v1", text: "Thanks!", likeCount: 10, replyCount: 0, publishedAt: "2026-09-25T13:00:00Z" },
]

describe("Superfan community advocate intelligence", () => {
  it("prioritizes repeated multi-video participation over a one-off popular comment", () => {
    const ranked = rankCommunityAdvocates(comments, {
      now: new Date("2026-09-27T12:00:00Z"),
      excludedAuthors: ["Channel Owner"],
    })

    expect(ranked.map((item) => item.author)).toEqual(["Alice", "Bob"])
    expect(ranked[0]).toMatchObject({
      commentCount: 3,
      videoCount: 3,
      confidence: "strong",
    })
    expect(ranked[0].signals).toEqual(expect.arrayContaining(["3 COMMENTS", "3 VIDEOS", "RECENT"]))
  })

  it("reports only observable evidence and never invents subscriber or loyalty claims", () => {
    const ranked = rankCommunityAdvocates(comments, {
      now: new Date("2026-09-27T12:00:00Z"),
    })

    const allSignals = ranked.flatMap((item) => item.signals).join(" ")
    expect(allSignals).not.toMatch(/subscriber|top 1%|loyalty|early supporter/i)
    expect(ranked.find((item) => item.author === "Bob")?.signals).toEqual(
      expect.arrayContaining(["40 COMMENT LIKES", "4 REPLIES", "RECENT"]),
    )
  })

  it("deduplicates repeated comment ids before scoring", () => {
    const ranked = rankCommunityAdvocates([...comments, comments[0]], {
      now: new Date("2026-09-27T12:00:00Z"),
    })
    expect(ranked.find((item) => item.author === "Alice")?.commentCount).toBe(3)
  })
})
