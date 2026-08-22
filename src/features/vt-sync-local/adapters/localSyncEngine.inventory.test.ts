import "fake-indexeddb/auto"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { clearVtSyncLocalDb, listVtSyncVideoInventory, putVtSyncVideoInventoryRecords, buildVtSyncInventoryId } from "./localDbRepository"
import { normalizeVtSyncSnapshot } from "./snapshot"
import {
 GEOGRAPHY_PROVINCE_SAFE_METRICS,
 VT_SYNC_TRAFFIC_DETAIL_FALLBACK_MAX_WINDOWS,
 VT_SYNC_PAGINATED_REPORT_MAX_PAGES,
 VT_SYNC_SERVER_ACCOUNT_TOKEN,
 VT_SYNC_TRAFFIC_DETAIL_PAGE_SIZE,
 VT_SYNC_VIDEO_ANALYTICS_BATCH_SIZE,
 runVtSyncLocalSync,
 syncUploadsInventory,
} from "./localSyncEngine"

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
 it("stops the run after one non-retryable reconnect failure and preserves the previous snapshot", async () => {
  const fetchMock = vi.fn(async () => new Response(JSON.stringify({
   error: {
    code: "GOOGLE_RECONNECT_REQUIRED",
    message: "Reconnect Google.",
    retryable: false,
    reconnectRequired: true,
    requestId: "request-reconnect",
   },
  }), { status: 409, headers: { "Content-Type": "application/json" } }))
  vi.stubGlobal("fetch", fetchMock)
  const progress: Array<Record<string, any>> = []
  let committed = normalizeVtSyncSnapshot({ videos: [] })
  const previousSnapshot = normalizeVtSyncSnapshot({
   channelId: "channel-a",
   videos: [{ id: "video-a", title: "Preserved video", metrics: { views: 42 } }],
  })

  await expect(runVtSyncLocalSync({
   token: VT_SYNC_SERVER_ACCOUNT_TOKEN,
   selectedCategories: ["channel_metadata"],
   previousSnapshot,
   onProgress: (next) => progress.push(next),
   onSnapshotCommit: (next) => { committed = next },
  })).rejects.toMatchObject({ details: { code: "GOOGLE_RECONNECT_REQUIRED", reconnectRequired: true } })

  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(committed.videos[0]).toMatchObject({ id: "video-a", title: "Preserved video", metrics: { views: 42 } })
  expect(committed.syncManifest).toMatchObject({
   stop_reason: "reconnect_required",
   failure_code: "GOOGLE_RECONNECT_REQUIRED",
   reconnect_required: true,
   request_id: "request-reconnect",
  })
  expect(progress.at(-1)).toMatchObject({
   status: "failed",
   failureCode: "GOOGLE_RECONNECT_REQUIRED",
   reconnectRequired: true,
  })
  expect(progress.at(-1)?.phases.every((phase: any) => phase.status !== "pending" && phase.status !== "running")).toBe(true)
 })

 it("does not carry a previous channel's catalog into the active channel", async () => {
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
   if (url.includes("youtube/v3/channels")) {
    return new Response(JSON.stringify({
     items: [{ id: "channel-b", snippet: { title: "Channel B", thumbnails: {} }, statistics: {}, contentDetails: { relatedPlaylists: {} } }],
    }), { status: 200 })
   }
   return new Response(JSON.stringify({ items: [] }), { status: 200 })
  }))

  const snapshot = await runVtSyncLocalSync({
   token: "token",
   selectedCategories: ["channel_metadata"],
   previousSnapshot: normalizeVtSyncSnapshot({
    channelId: "channel-a",
    videos: [{ id: "video-from-a", title: "Channel A video" }],
   }),
  })

  expect(snapshot.channelId).toBe("channel-b")
  expect(snapshot.videos).toEqual([])
 })

 it("backfills video analytics in 200-video chunks after the first ranked page", async () => {
  const requestedVideoFilters: string[] = []
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
   if (url.includes("youtube/v3/channels")) {
    return new Response(JSON.stringify({
     items: [{
      id: "channel-a",
      snippet: { title: "Channel A", customUrl: "@channel-a", thumbnails: {} },
      statistics: { subscriberCount: "10", videoCount: "250", viewCount: "100" },
      contentDetails: { relatedPlaylists: { uploads: "uploads-a" } },
     }],
    }), { status: 200 })
   }

   if (url.includes("youtubeanalytics.googleapis.com/v2/reports")) {
    const parsed = new URL(url)
    const filters = parsed.searchParams.get("filters") || ""
    if (filters.startsWith("video==")) requestedVideoFilters.push(filters)

    return new Response(JSON.stringify({
     columnHeaders: [
      { name: "video" },
      { name: "views" },
      { name: "estimatedMinutesWatched" },
     ],
     rows: filters
      ? filters.replace("video==", "").split(",").map((id, index) => [id, 100 - index, 60])
      : [],
    }), { status: 200 })
   }

   return new Response(JSON.stringify({ items: [] }), { status: 200 })
  }))

  const videos = Array.from({ length: 250 }, (_, index) => ({
   id: `video-${String(index + 1).padStart(3, "0")}`,
   title: `Video ${index + 1}`,
   format: "short" as const,
   metrics: { views: 0 },
  }))

  const snapshot = await runVtSyncLocalSync({
   token: "token",
   selectedCategories: ["videos_analytics"],
   previousSnapshot: normalizeVtSyncSnapshot({ videos }),
  })

  const chunkSizes = requestedVideoFilters.map((filter) => filter.replace("video==", "").split(",").length)
  expect(VT_SYNC_VIDEO_ANALYTICS_BATCH_SIZE).toBe(200)
  // Each Analytics metric bundle receives the same complete 200/50-video
  // partition; the requests must never exceed the engine batch size.
  expect(new Set(chunkSizes)).toEqual(new Set([200, 50]))
  expect(chunkSizes.filter((size) => size === 200)).toHaveLength(chunkSizes.filter((size) => size === 50).length)
  expect(snapshot.videos[0]?.metrics?.views).toBe(100)
 expect(snapshot.datasetFreshness?.videos?.status).toBe("synced")
})

 it("keeps a rendered title and thumbnail when metadata omits those fields", async () => {
 let latestCommittedTitle = ""
  let latestCommittedViews: number | undefined
  let metadataWasVisibleBeforeAnalytics = false
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
   if (url.includes("youtube/v3/channels")) return new Response(JSON.stringify({
    items: [{ id: "channel-a", snippet: { title: "Channel A", thumbnails: {} }, statistics: {}, contentDetails: { relatedPlaylists: {} } }],
   }), { status: 200 })
   if (url.includes("youtube/v3/videos")) return new Response(JSON.stringify({
    items: [{ id: "video-a", snippet: { thumbnails: {} }, contentDetails: {}, statistics: { viewCount: "123", likeCount: "9", commentCount: "4" } }],
   }), { status: 200 })
   if (url.includes("youtubeanalytics.googleapis.com/v2/reports")) {
    metadataWasVisibleBeforeAnalytics = latestCommittedTitle === "Established title" && latestCommittedViews === 123
    return new Response(JSON.stringify({ columnHeaders: [], rows: [] }), { status: 200 })
   }
   return new Response(JSON.stringify({ items: [] }), { status: 200 })
  }))

  const snapshot = await runVtSyncLocalSync({
   token: "token",
   selectedCategories: ["channel_metadata", "video_metadata", "videos_analytics"],
   previousSnapshot: normalizeVtSyncSnapshot({ videos: [{ id: "video-a", title: "Established title", thumbnail: "https://example.test/cover.jpg", publishedAt: "2026-01-01T00:00:00Z", duration: "", metrics: {} }] }),
   onSnapshotCommit: (committed) => {
    latestCommittedTitle = committed.videos[0]?.title || ""
    latestCommittedViews = committed.videos[0]?.metrics?.views
   },
  })

  expect(snapshot.videos[0]).toMatchObject({ title: "Established title", thumbnail: "https://example.test/cover.jpg" })
  expect(snapshot.videos[0].metrics).toMatchObject({ views: 123, likes: 9, comments: 4 })
  expect(snapshot.videos[0].metricProvenance).toMatchObject({ views: "youtube_data_v3", likes: "youtube_data_v3", comments: "youtube_data_v3" })
  expect(snapshot.datasetFreshness?.videos).toMatchObject({
   status: expect.stringMatching(/synced|partial/),
  })
  expect(metadataWasVisibleBeforeAnalytics).toBe(true)
})

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
    "engagedViews",
    "views",
    "redViews",
    "estimatedMinutesWatched",
    "estimatedRedMinutesWatched",
    "averageViewDuration",
    "averageViewPercentage",
    "cardClickRate",
    "cardTeaserClickRate",
    "cardImpressions",
    "cardTeaserImpressions",
    "cardClicks",
    "cardTeaserClicks",
   ])
   expect([...GEOGRAPHY_PROVINCE_SAFE_METRICS]).not.toEqual(expect.arrayContaining([
    "subscribersGained",
    "subscribersLost",
    "likes",
    "comments",
    "annotationClicks",
    "annotationImpressions",
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
  expect(snapshot.provinces[0].subscribersLost).toBeUndefined()
  expect(snapshot.provinces[0].likes).toBeUndefined()
  expect(snapshot.provinces[0].dislikes).toBeUndefined()
  expect(snapshot.provinces[0].comments).toBeUndefined()
  expect(snapshot.provinces[0].shares).toBeUndefined()
  expect(snapshot.syncManifest?.diagnostics?.some((entry) => entry.categoryId === "traffic_shorts" && entry.status === "disabled_unvalidated")).toBe(true)
 })

 it("pages VT-SYNC traffic detail bundles until YouTube returns no more rows", async () => {
  const requestedDetailPages: Array<{ sourceType: string; startIndex: number; maxResults: number }> = []
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
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
    const parsed = new URL(url)
    const filters = parsed.searchParams.get("filters") || ""
    const sourceType = filters.includes("YT_SEARCH") ? "YT_SEARCH" : filters.includes("EXT_URL") ? "EXT_URL" : filters.includes("NOTIFICATION") ? "NOTIFICATION" : "UNKNOWN"
    const startIndex = Number(parsed.searchParams.get("startIndex") || "1")
    const maxResults = Number(parsed.searchParams.get("maxResults") || "0")
    requestedDetailPages.push({ sourceType, startIndex, maxResults })

    const rows = startIndex > 125 ? [] : Array.from({ length: VT_SYNC_TRAFFIC_DETAIL_PAGE_SIZE }, (_, index) => {
     const rank = startIndex + index
     return [
      sourceType === "YT_SEARCH" ? `search term ${rank}` : sourceType === "NOTIFICATION" ? `notification ${rank}` : `referrer-${rank}.example.com`,
      1_000 - rank,
      rank * 2,
      45 + rank,
      50,
      900 - rank,
     ]
    })

    return new Response(JSON.stringify({
     columnHeaders: [
      { name: "insightTrafficSourceDetail" },
      { name: "views" },
      { name: "estimatedMinutesWatched" },
      { name: "averageViewDuration" },
      { name: "averageViewPercentage" },
      { name: "engagedViews" },
     ],
     rows,
    }), { status: 200 })
   }

   return new Response(JSON.stringify({ items: [] }), { status: 200 })
  }))

  const snapshot = await runVtSyncLocalSync({
   token: "token",
   selectedCategories: ["search_terms", "ext_websites"],
   previousSnapshot: normalizeVtSyncSnapshot(),
  })
  expect(snapshot.searchTerms).toHaveLength(125)
  expect(snapshot.extWebsites).toHaveLength(125)
  expect(snapshot.trafficDetails.filter((row) => row.sourceType === "YT_SEARCH")).toHaveLength(125)
  expect(requestedDetailPages.filter((page) => page.sourceType === "YT_SEARCH").map((page) => page.startIndex)).toEqual([1, 26, 51, 76, 101, 126])
  expect(requestedDetailPages.filter((page) => page.sourceType === "EXT_URL").map((page) => page.startIndex)).toEqual([1, 26, 51, 76, 101, 126])
  expect(requestedDetailPages.every((page) => page.maxResults === VT_SYNC_TRAFFIC_DETAIL_PAGE_SIZE)).toBe(true)
  expect(requestedDetailPages).toHaveLength(12)
 })

 it("pages sharing services to the top 100 rows by default", async () => {
  const requestedSharingPages: Array<{ startIndex: number; maxResults: number }> = []
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
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
    const parsed = new URL(url)
    const startIndex = Number(parsed.searchParams.get("startIndex") || "1")
    const maxResults = Number(parsed.searchParams.get("maxResults") || "0")
    requestedSharingPages.push({ startIndex, maxResults })

    const rows = Array.from({ length: VT_SYNC_TRAFFIC_DETAIL_PAGE_SIZE }, (_, index) => {
     const rank = startIndex + index
     return [`share-service-${rank}`, 1_000 - rank]
    })

    return new Response(JSON.stringify({
     columnHeaders: [
      { name: "sharingService" },
      { name: "shares" },
     ],
     rows,
    }), { status: 200 })
   }

   return new Response(JSON.stringify({ items: [] }), { status: 200 })
  }))

  const snapshot = await runVtSyncLocalSync({
   token: "token",
   selectedCategories: ["sharing_service"],
   previousSnapshot: normalizeVtSyncSnapshot(),
  })

  expect(snapshot.sharingService).toHaveLength(VT_SYNC_TRAFFIC_DETAIL_PAGE_SIZE * VT_SYNC_PAGINATED_REPORT_MAX_PAGES)
  expect(snapshot.sharingService[0]).toMatchObject({
   sharingService: "share-service-1",
   term: "share-service-1",
   shares: 999,
  })
  expect(requestedSharingPages.map((page) => page.startIndex)).toEqual([1, 26, 51, 76])
  expect(requestedSharingPages.every((page) => page.maxResults === VT_SYNC_TRAFFIC_DETAIL_PAGE_SIZE)).toBe(true)
  expect(snapshot.datasetFreshness?.shares?.status).toBe("synced")
  const paginationDiagnostic = snapshot.syncManifest?.diagnostics?.find((entry) => entry.categoryId === "sharing_service" && entry.phase === "sharing_service")
  expect(paginationDiagnostic).toMatchObject({
   requestedRows: VT_SYNC_TRAFFIC_DETAIL_PAGE_SIZE * VT_SYNC_PAGINATED_REPORT_MAX_PAGES,
   returnedRows: VT_SYNC_TRAFFIC_DETAIL_PAGE_SIZE * VT_SYNC_PAGINATED_REPORT_MAX_PAGES,
   status: "inspected",
  })
 })

 it("pages Traffic x Day until the complete lifetime series is returned", async () => {
  const requestedStartIndexes: number[] = []
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
   if (url.includes("youtube/v3/channels")) {
    return new Response(JSON.stringify({
     items: [{ id: "channel-a", snippet: { title: "Channel A", publishedAt: "2025-01-01T00:00:00Z", thumbnails: {} }, statistics: {}, contentDetails: { relatedPlaylists: {} } }],
    }), { status: 200 })
   }
   if (!url.includes("youtubeanalytics.googleapis.com/v2/reports")) {
    return new Response(JSON.stringify({ items: [] }), { status: 200 })
   }
   const parsed = new URL(url)
   const startIndex = Number(parsed.searchParams.get("startIndex") || "1")
   const maxResults = Number(parsed.searchParams.get("maxResults") || "0")
   requestedStartIndexes.push(startIndex)
   const remaining = Math.max(0, 450 - startIndex + 1)
   const count = Math.min(maxResults, remaining)
   const rows = Array.from({ length: count }, (_, index) => {
    const rank = startIndex + index
    const day = new Date(Date.UTC(2025, 0, rank)).toISOString().slice(0, 10)
    return [rank % 2 ? "YT_SEARCH" : "EXT_URL", day, rank, rank * 2, 30, 50, rank]
   })
   return new Response(JSON.stringify({
    columnHeaders: [
     "insightTrafficSourceType", "day", "views", "estimatedMinutesWatched",
     "averageViewDuration", "averageViewPercentage", "engagedViews",
    ].map((name) => ({ name })),
    rows,
   }), { status: 200 })
  }))

  const snapshot = await runVtSyncLocalSync({
   token: "token",
   selectedCategories: ["traffic_day"],
   previousSnapshot: normalizeVtSyncSnapshot({
    channelId: "channel-a",
    channelStartedAt: "2025-01-01T00:00:00Z",
    trafficByDay: [{ term: "STALE_SOURCE", day: "2024-01-01", views: 999 }],
   }),
  })

  expect(requestedStartIndexes).toEqual([1, 201, 401])
  expect(snapshot.trafficByDay).toHaveLength(450)
  expect(snapshot.trafficByDay.some((row) => row.term === "STALE_SOURCE")).toBe(false)
  expect(snapshot.datasetFreshness?.traffic_day?.status).toBe("synced")
 })

 it("marks VT-SYNC traffic details partial when Google rejects a later detail page", async () => {
  const requestedDetailPages: Array<{ startIndex: number; maxResults: number }> = []
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
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
    const parsed = new URL(url)
    const startIndex = Number(parsed.searchParams.get("startIndex") || "1")
    const maxResults = Number(parsed.searchParams.get("maxResults") || "0")
    requestedDetailPages.push({ startIndex, maxResults })

    if (startIndex > 1) {
     return new Response(JSON.stringify({
      error: {
       code: 500,
       message: "Internal error encountered.",
       errors: [{
        domain: "video_reporting.ApiaryErrorDomain",
        reason: "FIELD_UNKNOWN_VALUE",
        location: "max-results",
        locationType: "parameter",
       }],
       status: "INTERNAL",
      },
     }), { status: 500 })
    }

    const rows = Array.from({ length: VT_SYNC_TRAFFIC_DETAIL_PAGE_SIZE }, (_, index) => [
     `search term ${index + 1}`,
     1_000 - index,
     index * 2,
     45 + index,
     50,
     900 - index,
    ])

    return new Response(JSON.stringify({
     columnHeaders: [
      { name: "insightTrafficSourceDetail" },
      { name: "views" },
      { name: "estimatedMinutesWatched" },
      { name: "averageViewDuration" },
      { name: "averageViewPercentage" },
      { name: "engagedViews" },
     ],
     rows,
    }), { status: 200 })
   }

   return new Response(JSON.stringify({ items: [] }), { status: 200 })
  }))

  const snapshot = await runVtSyncLocalSync({
   token: "token",
   selectedCategories: ["search_terms"],
   previousSnapshot: normalizeVtSyncSnapshot(),
  })

  expect(snapshot.searchTerms).toHaveLength(VT_SYNC_TRAFFIC_DETAIL_PAGE_SIZE)
  expect(snapshot.datasetFreshness?.search_terms?.status).toBe("partial")
  expect(snapshot.syncManifest?.bundles_failed?.some((entry) => entry.bundle_id === "search_terms")).toBe(true)
  const paginationDiagnostic = snapshot.syncManifest?.diagnostics?.find((entry) => entry.categoryId === "search_terms" && entry.phase === "traffic_sync")
  expect(paginationDiagnostic).toMatchObject({
   returnedRows: VT_SYNC_TRAFFIC_DETAIL_PAGE_SIZE,
   status: "partial",
  })
  expect((paginationDiagnostic?.pagination as Array<Record<string, unknown>>).map((page) => page.startIndex)).toEqual([1, 26])
  expect(requestedDetailPages[0]).toEqual({ startIndex: 1, maxResults: VT_SYNC_TRAFFIC_DETAIL_PAGE_SIZE })
  expect(requestedDetailPages.every((page) => [1, 26].includes(page.startIndex) && page.maxResults === VT_SYNC_TRAFFIC_DETAIL_PAGE_SIZE)).toBe(true)
  expect(requestedDetailPages.filter((page) => page.startIndex === 1)).toHaveLength(1 + VT_SYNC_TRAFFIC_DETAIL_FALLBACK_MAX_WINDOWS)
  expect(requestedDetailPages.filter((page) => page.startIndex === 26).length).toBeGreaterThanOrEqual(1 + VT_SYNC_TRAFFIC_DETAIL_FALLBACK_MAX_WINDOWS)
 }, 20_000)

 it("falls back to date-windowed traffic details when offset pagination fails", async () => {
  const requestedDetailPages: Array<{ startIndex: number; maxResults: number; startDate: string; endDate: string }> = []
  let primaryPageServed = false
  let fallbackWindow = 0
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
   if (url.includes("youtube/v3/channels")) {
    return new Response(JSON.stringify({
     items: [{
      id: "channel-a",
      snippet: { title: "Channel A", customUrl: "@channel-a", publishedAt: "2022-01-01T00:00:00Z", thumbnails: {} },
      statistics: { subscriberCount: "10", videoCount: "2", viewCount: "100" },
      contentDetails: { relatedPlaylists: { uploads: "uploads-a" } },
     }],
    }), { status: 200 })
   }

   if (url.includes("youtubeanalytics.googleapis.com/v2/reports")) {
    const parsed = new URL(url)
    const startIndex = Number(parsed.searchParams.get("startIndex") || "1")
    const maxResults = Number(parsed.searchParams.get("maxResults") || "0")
    const startDate = parsed.searchParams.get("startDate") || ""
    const endDate = parsed.searchParams.get("endDate") || ""
    requestedDetailPages.push({ startIndex, maxResults, startDate, endDate })

    if (startIndex > 1) {
     return new Response(JSON.stringify({
      error: {
       code: 500,
       message: "Internal error encountered.",
       errors: [{ reason: "FIELD_UNKNOWN_VALUE", location: "max-results" }],
       status: "INTERNAL",
      },
     }), { status: 500 })
    }

    const prefix = primaryPageServed ? `window ${fallbackWindow += 1}` : "primary"
    primaryPageServed = true
    const rows = Array.from({ length: VT_SYNC_TRAFFIC_DETAIL_PAGE_SIZE }, (_, index) => [
     `${prefix} search term ${index + 1}`,
     1_000 - fallbackWindow * 50 - index,
     index * 2,
     45 + index,
     50,
     900 - index,
    ])

    return new Response(JSON.stringify({
     columnHeaders: [
      { name: "insightTrafficSourceDetail" },
      { name: "views" },
      { name: "estimatedMinutesWatched" },
      { name: "averageViewDuration" },
      { name: "averageViewPercentage" },
      { name: "engagedViews" },
     ],
     rows,
    }), { status: 200 })
   }

   return new Response(JSON.stringify({ items: [] }), { status: 200 })
  }))

  const snapshot = await runVtSyncLocalSync({
   token: "token",
   selectedCategories: ["search_terms"],
   previousSnapshot: normalizeVtSyncSnapshot(),
  })

  expect(snapshot.searchTerms).toHaveLength(VT_SYNC_TRAFFIC_DETAIL_PAGE_SIZE * VT_SYNC_TRAFFIC_DETAIL_FALLBACK_MAX_WINDOWS)
  expect(snapshot.datasetFreshness?.search_terms?.status).toBe("partial")
  const paginationDiagnostic = snapshot.syncManifest?.diagnostics?.find((entry) => entry.categoryId === "search_terms" && entry.phase === "traffic_sync")
  expect(paginationDiagnostic).toMatchObject({
   returnedRows: VT_SYNC_TRAFFIC_DETAIL_PAGE_SIZE * VT_SYNC_TRAFFIC_DETAIL_FALLBACK_MAX_WINDOWS,
   status: "partial",
   fallback: {
    strategy: "traffic_detail_date_windows",
    rowsAfter: VT_SYNC_TRAFFIC_DETAIL_PAGE_SIZE * VT_SYNC_TRAFFIC_DETAIL_FALLBACK_MAX_WINDOWS,
   },
  })
  expect(requestedDetailPages.filter((page) => page.startIndex === 1)).toHaveLength(1 + VT_SYNC_TRAFFIC_DETAIL_FALLBACK_MAX_WINDOWS)
  expect(requestedDetailPages.some((page) => page.startIndex === 26)).toBe(true)
  expect(requestedDetailPages.every((page) => page.maxResults === VT_SYNC_TRAFFIC_DETAIL_PAGE_SIZE)).toBe(true)
 }, 20_000)

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
