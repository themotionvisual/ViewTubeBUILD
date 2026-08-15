import { afterEach, describe, expect, it, vi } from "vitest"

import { normalizeVtSyncSnapshot } from "./snapshot"
import {
 DEFAULT_VT_SYNC_PRIVACY_FILTERS,
 VT_SYNC_PRIVACY_FILTERS_KEY,
 VT_SYNC_PRIVACY_FILTERS_VERSION,
 applyVtSyncPrivacyFilters,
 filterVtSyncVideos,
 normalizeVtSyncPrivacyFilters,
 readVtSyncPrivacyFilters,
 resolveVtSyncVideoFormat,
} from "./privacyPolicy"
import { buildVtSyncBrainContext } from "./brainContext"
import { buildVtSyncVisualPropsData } from "./visualData"
import { VT_SYNC_VISIBLE_TABLE_DEFINITIONS } from "../upstream/tableRegistry"
import { buildVtSyncTableViewModel } from "../shell/toolbox-table/vtSyncToolboxTableModel"

const snapshot = normalizeVtSyncSnapshot({
 channelName: "Privacy Test",
 channelTotals: { lifetime: { views: 999, watchTime: 999 } },
 videos: [
  { id: "public", title: "Public", privacyStatus: "public", format: "long", metrics: { views: 10 } },
  { id: "private", title: "Private", privacyStatus: "private", format: "long", metrics: { views: 20 } },
  { id: "unlisted", title: "Unlisted", privacyStatus: "unlisted", format: "short", metrics: { views: 30 } },
 ],
})

describe("VT-SYNC privacy policy", () => {
 afterEach(() => {
  vi.unstubAllGlobals()
 })

 it("defaults to showing the creator's complete catalog", () => {
  expect(normalizeVtSyncPrivacyFilters()).toEqual(DEFAULT_VT_SYNC_PRIVACY_FILTERS)
  expect(DEFAULT_VT_SYNC_PRIVACY_FILTERS).toEqual({
   excludePrivate: false,
   excludeUnlisted: false,
  })
 })

 it("durably migrates legacy hidden privacy defaults to show the complete catalog", () => {
  const values = new Map<string, string>([
   [VT_SYNC_PRIVACY_FILTERS_KEY, JSON.stringify({ excludePrivate: true, excludeUnlisted: true })],
  ])
  vi.stubGlobal("localStorage", {
   getItem: (key: string) => values.get(key) ?? null,
   setItem: (key: string, value: string) => values.set(key, value),
  })

  expect(readVtSyncPrivacyFilters()).toEqual({ excludePrivate: false, excludeUnlisted: false })
  expect(JSON.parse(values.get(VT_SYNC_PRIVACY_FILTERS_KEY) || "{}"))
   .toEqual({
    excludePrivate: false,
    excludeUnlisted: false,
    version: VT_SYNC_PRIVACY_FILTERS_VERSION,
   })
 })

 it("classifies video format based on duration or isShort indicator", () => {
  expect(resolveVtSyncVideoFormat({ privacyStatus: "private", isLive: false, isShort: false, durationSeconds: 400 })).toBe("long")
  expect(resolveVtSyncVideoFormat({ privacyStatus: "unlisted", isLive: false, isShort: true })).toBe("short")
  expect(resolveVtSyncVideoFormat({ privacyStatus: "public", isLive: false, isShort: true })).toBe("short")
  expect(resolveVtSyncVideoFormat({ privacyStatus: "public", isLive: false, isShort: false, durationSeconds: 30 })).toBe("long")
  expect(resolveVtSyncVideoFormat({ privacyStatus: "public", isLive: false, isShort: false, durationSeconds: 400 })).toBe("long")
 })

 it("keeps raw snapshot rows while applying explicit privacy filters to consumers", () => {
  const projected = applyVtSyncPrivacyFilters(snapshot, {
   excludePrivate: true,
   excludeUnlisted: true,
  })
  expect(projected.videos.map((video) => video.id)).toEqual(["public"])
  expect(snapshot.videos.map((video) => video.id)).toEqual(["public", "private", "unlisted"])
 })

 it("restores private and unlisted rows when their toggles are disabled", () => {
  const videos = filterVtSyncVideos(
   snapshot.videos as Array<(typeof snapshot.videos)[number] & Record<string, unknown>>,
   { excludePrivate: false, excludeUnlisted: false },
  )
  expect(videos.map((video) => [video.id, video.format])).toEqual([
   ["public", "long"],
   ["private", "long"],
   ["unlisted", "short"],
  ])
 })

 it("uses the same default projection for tables, Brain evidence, and visual rows", () => {
  const table = VT_SYNC_VISIBLE_TABLE_DEFINITIONS.find((definition) => definition.id === "videos")!
  const tableRows = buildVtSyncTableViewModel(snapshot, table).rows
  const brain = buildVtSyncBrainContext(snapshot)
  const visuals = buildVtSyncVisualPropsData(snapshot)

  expect(tableRows.map((row) => row.videoId)).toEqual(["public", "private", "unlisted"])
  expect(brain.facts.rowCounts).toMatchObject({ videos: 3 })
  expect(brain.facts.privacyPolicy).toMatchObject({ excludedVideoRows: 0 })
  expect(brain.facts.totals).toEqual({ lifetime: { views: 999, watchTime: 999 } })
  expect(visuals.rows.map((row) => row.videoId)).toEqual(["public", "private", "unlisted"])
 })
})
