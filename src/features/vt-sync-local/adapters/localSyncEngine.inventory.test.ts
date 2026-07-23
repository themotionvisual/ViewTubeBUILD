import "fake-indexeddb/auto"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { clearVtSyncLocalDb, listVtSyncVideoInventory, putVtSyncVideoInventoryRecords, buildVtSyncInventoryId } from "./localDbRepository"
import { normalizeVtSyncSnapshot } from "./snapshot"
import { GEOGRAPHY_PROVINCE_SAFE_METRICS, runVtSyncLocalSync, syncUploadsInventory } from "./localSyncEngine"

const uploadItem = (videoId: string) => ({
 snippet: {
  title: `Title ${videoId}`,
  publishedAt: "2026-07-06T00:00:00.000Z",
  resourceId: { videoId },
  thumbnails: { medium: { url: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg` } },
 },
})

const mockPlaylistPages = (pages: Record<string, { ids: string[]; next?: string }>) => {
 vi.stubGlobal("fetch", vi.fn(async (url: string) => {
  const parsed = new URL(url)
  const pageToken = parsed.searchParams.get("pageToken") || "first"
  const page = pages[pageToken]
  if (!page) return new Response(JSON.stringify({ items: [] }), { status: 200 })
  return new Response(JSON.stringify({
   items: page.ids.map(uploadItem),
   nextPageToken: page.next || "",
  }), { status: 200 })
 }))
}

beforeEach(() => {
 vi.restoreAllMocks()
})

afterEach(async () => {
 await clearVtSyncLocalDb()
 vi.restoreAllMocks()
})

describe("syncUploadsInventory", () => {
 it("keeps prior analytics when the long-format Cards pass returns a partial row", async () => {
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
   if (url.includes("youtube/v3/channels")) {
    return new Response(JSON.stringify({
     items: [{
      id: "channel-a",
      snippet: { title: "Channel A", customUrl: "@channel-a", thumbnails: {} },
      statistics: { subscriberCount: "10", videoCount: "1", viewCount: "50000" },
      contentDetails: { relatedPlaylists: { uploads: "uploads-a" } },
     }],
    }), { status: 200 })
   }

   if (url.includes("youtubeanalytics.googleapis.com/v2/reports")) {
    const metrics = new URL(url).searchParams.get("metrics") || ""
    const isLongFormatCardsPass = metrics.split(",").length === 6
    return new Response(JSON.stringify({
     columnHeaders: [
      { name: "video" },
      { name: "cardImpressions" },
      { name: "cardClicks" },
     ],
     rows: [["long-1", isLongFormatCardsPass ? 153 : 150, 10]],
    }), { status: 200 })
   }

   return new Response(JSON.stringify({ items: [] }), { status: 200 })
  }))

  const snapshot = await runVtSyncLocalSync({
   token: "token",
   selectedCategories: ["videos_analytics"],
   previousSnapshot: normalizeVtSyncSnapshot({
    videos: [{
     id: "long-1",
     title: "Long video",
     format: "long",
     metrics: {
      views: 41_292,
      watchTime: 925.12,
      revenue: 18.45,
      engagedViews: 38_078,
      averagePercentageViewed: 60.29,
     },
    }],
   }),
  })

  expect(snapshot.videos[0].metrics).toMatchObject({
   views: 41_292,
   watchTime: 925.12,
   revenue: 18.45,
   engagedViews: 38_078,
   averagePercentageViewed: 60.29,
   cardImpressions: 153,
   cardsShown: 153,
   cardClicks: 10,
  })
 })

 it("keeps the geography province query on the reduced safe metric bundle", () => {
  expect([...GEOGRAPHY_PROVINCE_SAFE_METRICS]).toEqual([
   "views",
   "engagedViews",
   "estimatedMinutesWatched",
   "averageViewDuration",
   "averageViewPercentage",
  ])
  expect([...GEOGRAPHY_PROVINCE_SAFE_METRICS]).not.toEqual(expect.arrayContaining([
   "subscribersGained",
   "subscribersLost",
   "likes",
   "comments",
  ]))
 })

 it("runs geography province with the reduced query shape and leaves unrequested metrics blank", async () => {
  const requestedUrls: string[] = []
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
   requestedUrls.push(url)
   if (url.includes("youtube/v3/channels")) {
    return new Response(JSON.stringify({
     items: [{
      id: "channel-a",
      snippet: { title: "Channel A", customUrl: "@channel-a", thumbnails: {} },
      statistics: { subscriberCount: "10", videoCount: "2", viewCount: "100" },
      contentDetails: { relatedPlaylists: { uploads: "uploads-a" } },
     }],
    }), { status: 200 })
   }
   if (url.includes("youtubeanalytics.googleapis.com/v2/reports")) {
    return new Response(JSON.stringify({
     columnHeaders: [
      { name: "province" },
      { name: "views" },
      { name: "engagedViews" },
      { name: "estimatedMinutesWatched" },
      { name: "averageViewDuration" },
      { name: "averageViewPercentage" },
     ],
     rows: [["US-CA", 100, 75, 300, 120, 63.5]],
    }), { status: 200 })
   }
   return new Response(JSON.stringify({ items: [] }), { status: 200 })
  }))

  const snapshot = await runVtSyncLocalSync({
   token: "token",
   selectedCategories: ["geography_province", "traffic_shorts"],
   previousSnapshot: normalizeVtSyncSnapshot(),
  })
  const provinceUrl = requestedUrls.find((url) => url.includes("youtubeanalytics.googleapis.com/v2/reports"))

  expect(provinceUrl).toBeTruthy()
  const params = new URL(provinceUrl || "").searchParams
  expect(params.get("dimensions")).toBe("province")
  expect(params.get("filters")).toBe("country==US")
  expect(params.get("sort")).toBe("-views")
  expect(params.get("maxResults")).toBe("50")
  expect(params.get("metrics")).toBe([...GEOGRAPHY_PROVINCE_SAFE_METRICS].join(","))
  expect(snapshot.provinces[0]).toMatchObject({
   province: "US-CA",
   views: 100,
   engagedViews: 75,
   watchTime: 5,
   avgDuration: 120,
   avgPercentageViewed: 63.5,
  })
  expect(snapshot.provinces[0].subscribersGained).toBeUndefined()
  expect(snapshot.provinces[0].likes).toBeUndefined()
  expect(snapshot.provinces[0].comments).toBeUndefined()
  expect(snapshot.syncManifest?.diagnostics?.some((entry) => entry.categoryId === "traffic_shorts" && entry.status === "disabled_unvalidated")).toBe(true)
 })

 it("stores the full uploads playlist on first inventory sync", async () => {
  mockPlaylistPages({
   first: { ids: ["video-3", "video-2"], next: "page-2" },
   "page-2": { ids: ["video-1"] },
  })

  const result = await syncUploadsInventory({
   token: "token",
   channelId: "channel-a",
   uploadsPlaylistId: "uploads-a",
   runId: "run-1",
   channelTitle: "Channel A",
   publicVideoCount: 3,
   now: "2026-07-06T00:00:00.000Z",
  })

  expect(result.stopReason).toBe("initial_full_inventory")
  expect(result.pagesRead).toBe(2)
  expect(result.videoIds).toEqual(["video-3", "video-2", "video-1"])
  expect(await listVtSyncVideoInventory("channel-a")).toHaveLength(3)
 })

 it("stops incremental inventory after ten known IDs following the newest new item", async () => {
  const knownIds = Array.from({ length: 12 }, (_, index) => `old-${index + 1}`)
  await putVtSyncVideoInventoryRecords(knownIds.map((videoId) => ({
   id: buildVtSyncInventoryId("channel-a", videoId),
   channelId: "channel-a",
   videoId,
   uploadsPlaylistId: "uploads-a",
   firstSeenAt: "2026-07-05T00:00:00.000Z",
   lastSeenAt: "2026-07-05T00:00:00.000Z",
   firstInventoryRunId: "run-old",
   lastInventoryRunId: "run-old",
  })))
  mockPlaylistPages({
   first: { ids: ["new-2", "new-1", ...knownIds.slice(0, 10)], next: "page-2" },
   "page-2": { ids: knownIds.slice(10) },
  })

  const result = await syncUploadsInventory({
   token: "token",
   channelId: "channel-a",
   uploadsPlaylistId: "uploads-a",
   runId: "run-2",
   channelTitle: "Channel A",
   publicVideoCount: 14,
   now: "2026-07-06T00:00:00.000Z",
  })

  expect(result.stopReason).toBe("known_inventory_overlap")
  expect(result.pagesRead).toBe(1)
  expect(result.newVideoIds).toEqual(["new-2", "new-1"])
  expect(result.videoIds).toEqual(expect.arrayContaining(["new-2", "new-1", "old-1", "old-12"]))
  expect(await listVtSyncVideoInventory("channel-a")).toHaveLength(14)
 })
})
