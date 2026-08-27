import { describe, expect, it } from "vitest"

import {
 VT_SYNC_CATEGORY_OPTIONS,
 VT_SYNC_DISABLED_UNVALIDATED_CATEGORY_IDS,
 VT_SYNC_DISABLED_UNVALIDATED_CATEGORY_OPTIONS,
 expandVtSyncCategoryDependencies,
 filterVtSyncVisibleCategoryIds,
 getVtSyncDefaultCategoryIds,
 getVtSyncVisibleCategoryIds,
 resolveVtSyncRequestedCategoryIds,
} from "./syncCategoryRegistry"
import { VT_SYNC_SYNC_UNITS } from "./syncUnitRegistry"
import { VT_SYNC_TABLE_CATEGORIES, VT_SYNC_TABLE_DEFINITIONS } from "./tableRegistry"
import { getVtSyncAvailableTrafficDetailSources, VT_SYNC_TRAFFIC_DETAIL_SOURCES } from "./trafficDetailRegistry"

describe("VT Sync category registry", () => {
 it("owns the exact supported traffic detail source set", () => {
 expect(VT_SYNC_TRAFFIC_DETAIL_SOURCES.map((source) => source.sourceType)).toEqual([
   "ADVERTISING", "EXT_URL", "HASHTAGS", "NOTIFICATION", "SUBSCRIBER", "YT_OTHER_PAGE", "YT_SEARCH",
   "END_SCREEN", "RELATED_VIDEO", "SOUND_PAGE", "VIDEO_REMIXES", "WATCH_WITH", "YT_CHANNEL", "CAMPAIGN_CARD",
  ])
 })
 it("exposes only successful/stable categories to the controller", () => {
  const visibleIds = getVtSyncVisibleCategoryIds()

  expect(visibleIds).toContain("geography_province")
  expect(visibleIds).toContain("traffic_overview")
  expect(visibleIds).toContain("monthly_metrics")
  expect(visibleIds).not.toContain("traffic_shorts")
  expect(visibleIds).not.toContain("traffic_browse_features")
  expect(visibleIds).not.toContain("audience_watch_behavior")
  expect(visibleIds).not.toContain("subscription_source")
  expect(VT_SYNC_CATEGORY_OPTIONS.map((category) => category.id)).not.toContain("subscription_source")
  expect(VT_SYNC_CATEGORY_OPTIONS.every((category) => category.syncStatus === "stable")).toBe(true)
 })

 it("maps every visible dataset to an explicit runtime phase", () => {
  expect(VT_SYNC_CATEGORY_OPTIONS.every((category) => Boolean(category.runtimePhaseId))).toBe(true)
  expect(VT_SYNC_CATEGORY_OPTIONS.find((category) => category.id === "retention")?.runtimePhaseId).toBe("retention")
  expect(VT_SYNC_CATEGORY_OPTIONS.find((category) => category.id === "traffic_overview")?.runtimePhaseId).toBe("traffic")
  expect(VT_SYNC_CATEGORY_OPTIONS.find((category) => category.id === "monthly_metrics")?.runtimePhaseId).toBe("monthly_metrics")
 })

 it("recursively expands dependencies once and keeps prerequisites first", () => {
  const expanded = expandVtSyncCategoryDependencies(["retention", "videos_analytics"])
  const retentionOnly = expandVtSyncCategoryDependencies(["retention"])
  const dailyOnly = expandVtSyncCategoryDependencies(["daily_metrics"])

  expect(expanded).toContain("uploads_playlist")
  expect(expanded).toContain("video_metadata")
  expect(expanded).toContain("videos_analytics")
  expect(expanded).toContain("retention")
  expect(expanded.indexOf("uploads_playlist")).toBeLessThan(expanded.indexOf("video_metadata"))
  expect(expanded.indexOf("video_metadata")).toBeLessThan(expanded.indexOf("videos_analytics"))
  expect(new Set(expanded).size).toBe(expanded.length)
  expect(retentionOnly).toEqual(["retention"])
  expect(dailyOnly).toEqual(["daily_metrics"])
 })

 it("keeps user-requested dataset execution exact instead of expanding dependencies", () => {
  expect(resolveVtSyncRequestedCategoryIds(["videos_analytics"])).toEqual(["videos_analytics"])
  expect(resolveVtSyncRequestedCategoryIds(["daily_metrics", "daily_metrics", "traffic_shorts"])).toEqual([
   "daily_metrics",
  ])
 })

 it("keeps video catalog phases owned by its one switch and out of every other unit", () => {
  const videoCategoryIds = ["uploads_playlist", "video_metadata", "videos_analytics"]
  const videoUnit = VT_SYNC_SYNC_UNITS.find((unit) => unit.id === "video_catalog")
  const otherUnits = VT_SYNC_SYNC_UNITS.filter((unit) => unit.id !== "video_catalog")

  expect(resolveVtSyncRequestedCategoryIds(videoUnit?.categoryIds || [])).toEqual(videoCategoryIds)
  expect(otherUnits.every((unit) =>
   resolveVtSyncRequestedCategoryIds(unit.categoryIds).every((id) => !videoCategoryIds.includes(id)),
  )).toBe(true)
 })

 it("keeps hidden categories in code as disabled_unvalidated", () => {
  const hiddenIds = VT_SYNC_DISABLED_UNVALIDATED_CATEGORY_OPTIONS.map((category) => category.id)

  expect(hiddenIds.sort()).toEqual([...VT_SYNC_DISABLED_UNVALIDATED_CATEGORY_IDS].sort())
  expect(VT_SYNC_DISABLED_UNVALIDATED_CATEGORY_OPTIONS.every((category) => category.syncStatus === "disabled_unvalidated")).toBe(true)
  expect(VT_SYNC_DISABLED_UNVALIDATED_CATEGORY_OPTIONS.every((category) => category.disabledReason)).toBe(true)
 })

 it("does not include hidden categories in default or sanitized selections", () => {
  expect(getVtSyncDefaultCategoryIds()).not.toEqual(expect.arrayContaining(["channel_pages", "traffic_subscribers"]))
  expect(getVtSyncDefaultCategoryIds()).not.toContain("traffic_shorts")
  expect(filterVtSyncVisibleCategoryIds(["traffic_overview", "traffic_shorts", "geography_province"])).toEqual([
   "traffic_overview",
   "geography_province",
  ])
 })

 it("maps every controller sync unit to a table category and supported child categories", () => {
  const tableCategoryIds = new Set(VT_SYNC_TABLE_CATEGORIES.map((category) => category.id))
  const visibleCategoryIds = new Set(VT_SYNC_CATEGORY_OPTIONS.map((category) => category.id))
 expect(VT_SYNC_SYNC_UNITS.every((unit) => tableCategoryIds.has(unit.tableCategoryId))).toBe(true)
 expect(VT_SYNC_SYNC_UNITS.every((unit) => unit.categoryIds.every((id) => visibleCategoryIds.has(id)))).toBe(true)
 expect(VT_SYNC_SYNC_UNITS.some((unit) => unit.categoryIds.includes("traffic_notification"))).toBe(false)
 expect(VT_SYNC_SYNC_UNITS.find((unit) => unit.id === "channel_overview_windows")).toMatchObject({
  label: "Channel Overview + Windows",
  group: "channel",
  tableId: "channel_totals",
  categoryIds: ["channel_metadata", "channel_totals"],
 })
 expect(VT_SYNC_SYNC_UNITS.find((unit) => unit.id === "video_catalog")?.categoryIds).toEqual([
  "uploads_playlist", "video_metadata", "videos_analytics",
 ])
 expect(getVtSyncAvailableTrafficDetailSources().map((source) => source.sourceType)).not.toEqual(expect.arrayContaining([
  "NOTIFICATION", "END_SCREEN", "VIDEO_REMIXES", "WATCH_WITH",
 ]))
 expect(VT_SYNC_SYNC_UNITS.some((unit) => unit.id === "channel_totals")).toBe(false)
 expect(VT_SYNC_SYNC_UNITS.find((unit) => unit.id === "daily_stats")).toMatchObject({
  label: "Daily Stats",
  group: "time",
  tableCategoryId: "daily",
  tableId: "daily",
  categoryIds: ["daily_metrics"],
 })
 expect(VT_SYNC_SYNC_UNITS.find((unit) => unit.id === "traffic_by_day")).toMatchObject({
  label: "Traffic × Day",
  group: "time",
  tableCategoryId: "daily",
  tableId: "traffic_day",
  categoryIds: ["traffic_day"],
 })
 expect(VT_SYNC_SYNC_UNITS.some((unit) => unit.id === "daily_traffic")).toBe(false)
 expect(VT_SYNC_SYNC_UNITS.filter((unit) => unit.group === "geography").map((unit) => unit.tableId)).toEqual([
  "geography", "cities", "provinces", "dma",
  ])
  expect(VT_SYNC_CATEGORY_OPTIONS.find((category) => category.id === "subscription_status")).toMatchObject({
   label: "Subscriber Status",
   group: "channel",
  })
  expect(VT_SYNC_CATEGORY_OPTIONS.find((category) => category.id === "formats_subscriber_status")).toMatchObject({
   label: "Formats x Subscriber Status",
   group: "channel",
   phase: "audience_segments",
  })
  expect(VT_SYNC_SYNC_UNITS.find((unit) => unit.id === "subscription_status")).toMatchObject({
   label: "Subscriber Status",
   group: "channel",
   tableCategoryId: "channel_totals",
   tableId: "subs",
  })
  expect(VT_SYNC_SYNC_UNITS.find((unit) => unit.id === "formats_subscriber_status")).toMatchObject({
   label: "Formats x Subscriber Status",
   group: "channel",
   tableCategoryId: "content",
   tableId: "formats_subscribers",
  })
  expect(VT_SYNC_TABLE_CATEGORIES.find((category) => category.id === "channel_totals")).toMatchObject({
   label: "Channel",
   tabs: expect.arrayContaining([expect.objectContaining({ id: "subs", label: "Subscriber Status" })]),
  })
  const subscriberStatusTable = VT_SYNC_TABLE_DEFINITIONS.find((table) => table.id === "subs")
  expect(subscriberStatusTable).toMatchObject({
   mainCategoryId: "channel_totals",
   label: "Subscriber Status",
  })
  expect(subscriberStatusTable?.columns.map((column) => column.key)).toEqual(expect.arrayContaining([
   "youtubePremiumViews",
   "youtubePremiumWatchTime",
  ]))
  const formatSubscriberTable = VT_SYNC_TABLE_DEFINITIONS.find((table) => table.id === "formats_subscribers")
  expect(formatSubscriberTable).toMatchObject({
   mainCategoryId: "content",
   label: "Formats x Subscriber Status",
   presentationMode: "format-subscriber-status",
  })
  expect(VT_SYNC_SYNC_UNITS.filter((unit) => unit.id.startsWith("traffic_detail_")).every((unit) =>
   VT_SYNC_TABLE_DEFINITIONS.some((table) => table.id === unit.tableId && table.syncUnitId === unit.id),
  )).toBe(true)
  expect(VT_SYNC_TABLE_DEFINITIONS.find((table) => table.id === "traffic_details")?.syncUnitId).toBe("traffic_details")
 })
})
