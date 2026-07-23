import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
 list: vi.fn(),
 replace: vi.fn(),
 readCache: vi.fn(),
 writeCache: vi.fn(),
 googleRead: vi.fn(),
}))

vi.mock("../canonicalSync/storage", () => ({
 listCanonicalVideoRecords: mocks.list,
 replaceCanonicalVideoInventory: mocks.replace,
}))
vi.mock("../analytics/DataStore", () => ({
 readYouTubeAnalyticsCache: mocks.readCache,
 writeYouTubeAnalyticsCache: mocks.writeCache,
}))
vi.mock("../youtube/googleReadTransport", () => ({
 authorizedGoogleRead: mocks.googleRead,
}))

import { refreshVideoAssetCatalog, restoreVideoAssetCatalog } from "./catalog"

const jsonResponse = (payload: unknown, status = 200) =>
 new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } })

describe("VideoAssetCatalog", () => {
 beforeEach(() => {
  const values = new Map<string, string>()
  Object.defineProperty(globalThis, "localStorage", {
   configurable: true,
   value: {
    getItem: (key: string) => values.get(key) || null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
   },
  })
  Object.defineProperty(globalThis, "window", {
   configurable: true,
   value: { dispatchEvent: vi.fn() },
  })
  mocks.list.mockReset().mockResolvedValue([])
  mocks.replace.mockReset().mockResolvedValue(undefined)
  mocks.readCache.mockReset().mockReturnValue({ profile: { id: "channel-1" }, videos: [] })
  mocks.writeCache.mockReset()
  mocks.googleRead.mockReset()
 })

 it("fully pages uploads, batches details by 50, and atomically replaces inventory", async () => {
  const ids = Array.from({ length: 51 }, (_, index) => `video-${index + 1}`)
  mocks.googleRead.mockImplementation(async (url: string) => {
   if (url.includes("/channels?")) {
    return jsonResponse({ items: [{ contentDetails: { relatedPlaylists: { uploads: "uploads-1" } } }] })
   }
   if (url.includes("/playlistItems?") && !url.includes("pageToken=")) {
    return jsonResponse({
     items: ids.slice(0, 50).map((videoId) => ({ contentDetails: { videoId } })),
     nextPageToken: "page-2",
    })
   }
   if (url.includes("/playlistItems?")) {
    return jsonResponse({ items: [{ contentDetails: { videoId: ids[50] } }] })
   }
   const query = new URL(url).searchParams
   return jsonResponse({
    items: String(query.get("id") || "").split(",").filter(Boolean).map((videoId) => ({
     id: videoId,
     snippet: {
      title: `Title ${videoId}`,
      publishedAt: "2026-01-01T00:00:00Z",
      thumbnails: { high: { url: `https://thumb.test/${videoId}.jpg` } },
     },
     contentDetails: { duration: "PT1M" },
     statistics: {},
     status: { privacyStatus: "public" },
    })),
   })
  })

  const result = await refreshVideoAssetCatalog("channel-1")

  expect(result.items).toHaveLength(51)
  expect(mocks.replace).toHaveBeenCalledTimes(1)
  expect(mocks.replace.mock.calls[0][0]).toBe("channel-1")
  expect(mocks.replace.mock.calls[0][1]).toHaveLength(51)
  expect(mocks.googleRead.mock.calls.filter(([url]) => String(url).includes("/videos?"))).toHaveLength(2)
  expect(mocks.writeCache).toHaveBeenCalledWith(expect.objectContaining({ videos: expect.any(Array) }))
 })

 it("does not migrate legacy assets owned by a different channel", async () => {
  mocks.readCache.mockReturnValue({
   profile: { id: "channel-other" },
   videos: [{ channelId: "channel-other", videoId: "wrong", title: "Wrong channel" }],
  })
  const restored = await restoreVideoAssetCatalog("channel-1")
  expect(restored).toEqual({ items: [], source: null })
 })

 it("classifies authorization failures instead of returning a confirmed-empty inventory", async () => {
  mocks.googleRead.mockResolvedValue(jsonResponse({ error: { message: "expired" } }, 401))
  await expect(refreshVideoAssetCatalog("channel-1")).rejects.toMatchObject({
   name: "VideoAssetCatalogError",
   code: "auth",
   recoverable: true,
  })
  expect(mocks.replace).not.toHaveBeenCalled()
  expect(mocks.writeCache).not.toHaveBeenCalled()
 })
})
