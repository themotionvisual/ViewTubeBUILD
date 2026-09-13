import { beforeEach, describe, expect, it, vi } from "vitest"

import { fetchSimpleVideoBundle, fetchSimpleVideoInventory } from "./simpleYouTubeApi"

describe("simpleYouTubeApi video inventory cache", () => {
 beforeEach(() => {
  vi.restoreAllMocks()
 })

 it("reuses full inventory metadata when a selected video is opened", async () => {
  const inventoryItem = {
   id: "video-123",
   snippet: {
    title: "Inventory title",
    description: "Inventory description",
    tags: ["napoleon", "history"],
    categoryId: "27",
    publishedAt: "2026-09-01T12:00:00Z",
    thumbnails: { high: { url: "https://example.test/thumb.jpg" } },
   },
   statistics: { viewCount: "101", likeCount: "12", commentCount: "3" },
   contentDetails: { duration: "PT2M5S" },
   status: { privacyStatus: "public" },
  }

  const fetchMock = vi.fn().mockResolvedValue({
   ok: true,
   status: 200,
   json: async () => ({ items: [inventoryItem] }),
  })
  vi.stubGlobal("fetch", fetchMock)

  await fetchSimpleVideoInventory()
  const bundle = await fetchSimpleVideoBundle("video-123")

  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(fetchMock).toHaveBeenCalledWith("/api/youtube/videos", expect.any(Object))
  expect(bundle.details).toMatchObject({
   videoId: "video-123",
   title: "Inventory title",
   description: "Inventory description",
   tags: ["napoleon", "history"],
   categoryId: "27",
   privacyStatus: "public",
  })
  expect(bundle.stats).toMatchObject({
   views: "101",
   likes: "12",
   comments: "3",
   duration: "PT2M5S",
  })
 })
})
