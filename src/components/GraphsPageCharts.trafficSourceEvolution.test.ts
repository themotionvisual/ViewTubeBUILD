import { describe, expect, it } from "vitest"

import {
 buildTrafficSourceDailyTimeline,
 resolveTrafficOverviewSourceKey,
} from "./GraphsPageCharts"

describe("Traffic Source Evolution overview-source boundary", () => {
 it("accepts canonical overview source families and their display labels", () => {
  expect(resolveTrafficOverviewSourceKey("YT_SEARCH")).toBe("YT_SEARCH")
  expect(resolveTrafficOverviewSourceKey("YouTube Search")).toBe("YT_SEARCH")
  expect(resolveTrafficOverviewSourceKey("IMMERSIVE_LIVE")).toBe("LIVE_REDIRECT")
  expect(resolveTrafficOverviewSourceKey("Other YouTube Features")).toBe("YT_OTHER_PAGE")
 })

 it("rejects traffic-detail identities", () => {
  expect(resolveTrafficOverviewSourceKey("Kentucky Derby 2025")).toBeNull()
  expect(resolveTrafficOverviewSourceKey("reddit.com")).toBeNull()
  expect(resolveTrafficOverviewSourceKey("#alder")).toBeNull()
  expect(resolveTrafficOverviewSourceKey("The Motion Visual History")).toBeNull()
 })

 it("prefers a canonical source field when a later detail field is present", () => {
  expect(resolveTrafficOverviewSourceKey("RELATED_VIDEO", "Alder's Cavalry Types")).toBe("RELATED_VIDEO")
 })

 it("builds changing daily areas only from overview source families", () => {
  const timeline = buildTrafficSourceDailyTimeline([
   { day: "2026-08-11", term: "SHORTS", views: 60 },
   { day: "2026-08-11", term: "YT_SEARCH", views: 40 },
   { day: "2026-08-12", term: "SHORTS", views: 20 },
   { day: "2026-08-12", term: "YT_SEARCH", views: 80 },
   { day: "2026-08-12", term: "Kentucky Derby 2025", views: 900 },
  ])

  expect(timeline).toEqual([
   expect.objectContaining({
    bucket: "2026-08-11",
    shares: { "Shorts Feed": 60, "YouTube Search": 40 },
   }),
   expect.objectContaining({
    bucket: "2026-08-12",
    shares: { "Shorts Feed": 20, "YouTube Search": 80 },
   }),
  ])
 })

 it("does not invent a second time bucket when only one day was synced", () => {
  expect(buildTrafficSourceDailyTimeline([
   { day: "2026-08-12", term: "YT_SEARCH", views: 12 },
  ])).toHaveLength(1)
 })
})
