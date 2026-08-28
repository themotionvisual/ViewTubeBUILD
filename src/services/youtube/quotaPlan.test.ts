import { describe, expect, it } from "vitest"
import { estimateVideoManagerSaveQuota, estimateVideoPublishQuota, estimateYouTubeQuota } from "./quotaPlan"

describe("YouTube Data API quota planner", () => {
 it("keeps cheap reads cheap and search expensive", () => {
  expect(estimateYouTubeQuota([{ operation: "videos.list" }, { operation: "playlistItems.list" }])).toBe(2)
  expect(estimateYouTubeQuota([{ operation: "search.list" }])).toBe(100)
 })

 it("estimates a full publish workflow", () => {
  expect(estimateVideoPublishQuota({ thumbnail: true, captions: 1, finalMetadataUpdate: true })).toBe(2100)
 })

 it("estimates Video Manager mutations by actual changed operations", () => {
  expect(estimateVideoManagerSaveQuota({
   metadataChanged: true,
   thumbnailChanged: true,
   playlistsAdded: 2,
   playlistsRemoved: 1,
  })).toBe(250)
 })
})
