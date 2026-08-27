// @vitest-environment jsdom
/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it } from "vitest"
import {
 COMMUNITY_POST_STATE_KEY,
 COMMUNITY_POST_VAULT_KEY,
 LEGACY_COMMUNITY_POST_VAULT_KEY,
 emptyCommunityPostDraft,
 normalizeCommunityPostDraft,
 readCommunityPostState,
 readCommunityPostVault,
 writeCommunityPostState,
 writeCommunityPostVault,
} from "./communityPostStore"
import { buildChannelCommunityUrl } from "./useCommunityPostController"
import { partitionCommentThreads, resolveSuggestedVideoId } from "./useCommentResponderController"

describe("creator engagement persistence", () => {
 const values = new Map<string, string>()
 const storage = {
  getItem: (key: string) => values.get(key) ?? null,
  setItem: (key: string, value: string) => { values.set(key, String(value)) },
  removeItem: (key: string) => { values.delete(key) },
  clear: () => values.clear(),
  key: (index: number) => Array.from(values.keys())[index] ?? null,
  get length() { return values.size },
 }

 beforeEach(() => {
  values.clear()
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage })
 })

 it("normalizes legacy vault records into the versioned schema", () => {
  localStorage.setItem(LEGACY_COMMUNITY_POST_VAULT_KEY, JSON.stringify([{ id: 4, type: "poll", content: "Question", pollOptions: ["A", "B"], timestamp: "2026-08-24T00:00:00.000Z" }]))
  const vault = readCommunityPostVault()
  expect(vault).toHaveLength(1)
  expect(vault[0]).toMatchObject({ version: 1, id: "4", type: "poll", content: "Question", pollOptions: ["A", "B", "", ""] })
  expect(localStorage.getItem(COMMUNITY_POST_VAULT_KEY)).toContain('"version":1')
 })

 it("round-trips current drafts and vault entries", () => {
  const draft = normalizeCommunityPostDraft({ ...emptyCommunityPostDraft(), type: "video", content: "Watch this", linkedVideoId: "video-1" })
  writeCommunityPostState(draft)
  writeCommunityPostVault([draft])
  expect(readCommunityPostState()).toMatchObject({ type: "video", content: "Watch this", linkedVideoId: "video-1" })
  expect(readCommunityPostVault()).toHaveLength(1)
  expect(localStorage.getItem(COMMUNITY_POST_STATE_KEY)).toContain("Watch this")
 })
})

describe("creator engagement contracts", () => {
 it("links only AI video suggestions present in the canonical channel catalog", () => {
  const catalog = [{ videoId: "video-1" }, { videoId: "video-2" }]

  expect(resolveSuggestedVideoId(" video-2 ", catalog)).toBe("video-2")
  expect(resolveSuggestedVideoId("hallucinated-video", catalog)).toBeNull()
  expect(resolveSuggestedVideoId(undefined, catalog)).toBeNull()
 })

 it("never recommends the video the viewer is already commenting on", () => {
  const catalog = [{ videoId: "source-video" }, { videoId: "related-video" }]

  expect(resolveSuggestedVideoId("source-video", catalog, "source-video")).toBeNull()
  expect(resolveSuggestedVideoId("related-video", catalog, "source-video")).toBe("related-video")
 })

 it("builds community URLs from channel ID before handle", () => {
  expect(buildChannelCommunityUrl({ channelId: "UC123", channelHandle: "creator" })).toBe("https://www.youtube.com/channel/UC123/community")
  expect(buildChannelCommunityUrl({ channelId: "", channelHandle: "@creator" })).toBe("https://www.youtube.com/@creator/community")
  expect(buildChannelCommunityUrl({ channelId: "", channelHandle: "" })).toBeNull()
 })

 it("classifies only reply-complete comment threads", () => {
  const base = (id: string, replies: any[] = [], repliesComplete = true) => ({ id, repliesComplete, replies: { comments: replies } })
  const ownReply = { snippet: { authorChannelId: { value: "channel-1" } } }
  const result = partitionCommentThreads([base("new"), base("old", [ownReply]), base("partial", [], false)], "channel-1")
  expect(result.unreplied.map((thread) => thread.id)).toEqual(["new"])
  expect(result.replied.map((thread) => thread.id)).toEqual(["old"])
 })
})
