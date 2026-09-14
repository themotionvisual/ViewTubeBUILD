import { describe, expect, it } from "vitest"
import {
 VT_SYNC_DEFAULT_WINDOW_REQUEST_BUDGET,
 VT_SYNC_WINDOW_PRIORITY,
 estimateVtSyncRunCost,
 planVtSyncWindows,
 vtSyncCategoryRequestCost,
} from "./windowBudget"

describe("per-category request cost", () => {
 it("scales video analytics by batch count and bundles", () => {
  // 250 videos = 2 batches x 5 daily bundles
  expect(vtSyncCategoryRequestCost("videos_analytics", 250)).toBe(10)
  expect(vtSyncCategoryRequestCost("videos_analytics", 1)).toBe(5)
 })

 it("charges the full contract for complete-contract categories", () => {
  expect(vtSyncCategoryRequestCost("geography_country", 0)).toBe(4)
 })

 it("charges paginated categories their page ceiling", () => {
  expect(vtSyncCategoryRequestCost("sharing_service", 0)).toBe(4)
 })

 it("charges a plain segment one request", () => {
  expect(vtSyncCategoryRequestCost("device_type", 0)).toBe(1)
 })
})

describe("run cost estimate", () => {
 it("counts only non-lifetime windows as extra cost", () => {
  const lifetimeOnly = estimateVtSyncRunCost({
   categoryIds: ["device_type", "geography_country"],
   windows: ["lifetime"],
  })
  expect(lifetimeOnly.extraRequests).toBe(0)
  expect(lifetimeOnly.extraWindowCount).toBe(0)
 })

 it("multiplies fetchable categories by extra windows", () => {
  // device_type (1) + geography_country (4) = 5 per window, x2 windows
  const estimate = estimateVtSyncRunCost({
   categoryIds: ["device_type", "geography_country"],
   windows: ["lifetime", "28d", "7d"],
  })
  expect(estimate.extraRequests).toBe(10)
  expect(estimate.fetchedCategoryCount).toBe(2)
 })

 it("never charges derived or unwindowed categories per window", () => {
  const estimate = estimateVtSyncRunCost({
   categoryIds: ["daily_metrics", "revenue_source", "channel_metadata", "video_metadata"],
   windows: ["lifetime", "7d", "28d", "90d", "365d"],
  })
  expect(estimate.extraRequests).toBe(0)
  expect(estimate.derivedCategoryCount).toBe(2)
  expect(estimate.unwindowedCategoryCount).toBe(2)
 })

 it("deduplicates repeated categories and windows", () => {
  const estimate = estimateVtSyncRunCost({
   categoryIds: ["device_type", "device_type"],
   windows: ["28d", "28d"],
  })
  expect(estimate.extraRequests).toBe(1)
 })
})

describe("window planning under budget", () => {
 it("keeps every window when the run fits", () => {
  const plan = planVtSyncWindows({
   categoryIds: ["device_type"],
   windows: ["lifetime", "7d", "28d"],
  })
  expect(plan.deferred).toEqual([])
  expect(plan.windows).toContain("7d")
  expect(plan.windows).toContain("28d")
 })

 it("orders windows by priority, not by selection order", () => {
  const plan = planVtSyncWindows({
   categoryIds: ["device_type"],
   windows: ["365d", "7d", "lifetime", "90d", "28d"],
  })
  expect(plan.windows).toEqual(VT_SYNC_WINDOW_PRIORITY)
 })

 it("always keeps lifetime, because stored rows key off it", () => {
  const plan = planVtSyncWindows({
   categoryIds: ["geography_country"],
   windows: ["lifetime", "7d", "28d", "90d", "365d"],
   budget: 1,
  })
  expect(plan.windows[0]).toBe("lifetime")
  expect(plan.deferred).not.toContain("lifetime")
 })

 it("defers the cheapest-to-lose windows first when over budget", () => {
  // geography_country costs 4 per window; a budget of 5 admits one extra
  // window and no more.
  const plan = planVtSyncWindows({
   categoryIds: ["geography_country"],
   windows: ["lifetime", "7d", "28d", "90d", "365d"],
   budget: 5,
  })
  // Priority order after lifetime is 28d, 7d, 90d, 365d — so 28d survives and
  // the long windows, which lose least by waiting, are deferred.
  expect(plan.windows).toContain("28d")
  expect(plan.deferred).toEqual(["7d", "90d", "365d"])
 })

 it("still attempts one window even when it alone exceeds the budget", () => {
  // Refusing everything would make the feature unusable on a large catalog.
  const plan = planVtSyncWindows({
   categoryIds: ["geography_country"],
   windows: ["lifetime", "28d"],
   budget: 1,
  })
  expect(plan.windows).toContain("28d")
  expect(plan.deferred).toEqual([])
 })

 it("degrades rather than failing, returning lifetime at minimum", () => {
  const plan = planVtSyncWindows({ categoryIds: [], windows: [] })
  expect(plan.windows).toEqual(["lifetime"])
 })

 it("uses the documented default budget", () => {
  const plan = planVtSyncWindows({ categoryIds: ["device_type"], windows: ["28d"] })
  expect(plan.estimate.budget).toBe(VT_SYNC_DEFAULT_WINDOW_REQUEST_BUDGET)
 })
})

describe("traffic and playlist costs", () => {
 it("charges paginated traffic details their page ceiling", () => {
  expect(vtSyncCategoryRequestCost("search_terms", 0)).toBe(4)
 })

 it("charges enriched traffic details more, because they resolve titles too", () => {
  // suggested_videos and channel_pages make Data API lookups on top of paging.
  expect(vtSyncCategoryRequestCost("suggested_videos", 0)).toBeGreaterThan(
   vtSyncCategoryRequestCost("search_terms", 0),
  )
 })

 it("charges playlists for their deeper pagination", () => {
  expect(vtSyncCategoryRequestCost("playlists_analytics", 0)).toBeGreaterThan(4)
 })

 it("makes a full traffic selection expensive enough to trigger deferral", () => {
  const trafficCategories = [
   "traffic_overview", "advertising", "ext_websites", "hashtags",
   "search_terms", "suggested_videos", "channel_pages", "sound_pages",
  ]
  const plan = planVtSyncWindows({
   categoryIds: trafficCategories,
   windows: ["lifetime", "7d", "28d", "90d", "365d"],
   budget: 60,
  })
  expect(plan.deferred.length).toBeGreaterThan(0)
  expect(plan.windows).toContain("lifetime")
  expect(plan.windows).toContain("28d")
 })
})
