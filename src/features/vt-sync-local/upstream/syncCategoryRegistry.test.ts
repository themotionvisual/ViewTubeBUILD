import { describe, expect, it } from "vitest"

import {
 VT_SYNC_CATEGORY_OPTIONS,
 VT_SYNC_DISABLED_UNVALIDATED_CATEGORY_IDS,
 VT_SYNC_DISABLED_UNVALIDATED_CATEGORY_OPTIONS,
 filterVtSyncVisibleCategoryIds,
 getVtSyncDefaultCategoryIds,
 getVtSyncVisibleCategoryIds,
} from "./syncCategoryRegistry"

describe("VT Sync category registry", () => {
 it("exposes only successful/stable categories to the controller", () => {
  const visibleIds = getVtSyncVisibleCategoryIds()

  expect(visibleIds).toContain("geography_province")
  expect(visibleIds).toContain("traffic_overview")
  expect(visibleIds).not.toContain("traffic_shorts")
  expect(visibleIds).not.toContain("traffic_browse_features")
  expect(visibleIds).not.toContain("audience_watch_behavior")
  expect(visibleIds).not.toContain("subscription_source")
  expect(VT_SYNC_CATEGORY_OPTIONS.every((category) => category.syncStatus === "stable")).toBe(true)
 })

 it("keeps hidden categories in code as disabled_unvalidated", () => {
  const hiddenIds = VT_SYNC_DISABLED_UNVALIDATED_CATEGORY_OPTIONS.map((category) => category.id)

  expect(hiddenIds.sort()).toEqual([...VT_SYNC_DISABLED_UNVALIDATED_CATEGORY_IDS].sort())
  expect(VT_SYNC_DISABLED_UNVALIDATED_CATEGORY_OPTIONS.every((category) => category.syncStatus === "disabled_unvalidated")).toBe(true)
  expect(VT_SYNC_DISABLED_UNVALIDATED_CATEGORY_OPTIONS.every((category) => category.disabledReason)).toBe(true)
 })

 it("does not include hidden categories in default or sanitized selections", () => {
  expect(getVtSyncDefaultCategoryIds()).not.toContain("traffic_shorts")
  expect(filterVtSyncVisibleCategoryIds(["traffic_overview", "traffic_shorts", "geography_province"])).toEqual([
   "traffic_overview",
   "geography_province",
  ])
 })
})
