import { describe, expect, it } from "vitest"

import { normalizeVtSyncSnapshot } from "./snapshot"
import {
 DEFAULT_VT_SYNC_PRIVACY_FILTERS,
 applyVtSyncPrivacyFilters,
 filterVtSyncVideos,
 normalizeVtSyncPrivacyFilters,
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
 it("defaults both privacy exclusions on", () => {
  expect(normalizeVtSyncPrivacyFilters()).toEqual(DEFAULT_VT_SYNC_PRIVACY_FILTERS)
 })

 it("classifies private and unlisted metadata as unknown format", () => {
  expect(resolveVtSyncVideoFormat({ privacyStatus: "private", isLive: false, isShort: false })).toBe("unknown")
  expect(resolveVtSyncVideoFormat({ privacyStatus: "unlisted", isLive: false, isShort: true })).toBe("unknown")
  expect(resolveVtSyncVideoFormat({ privacyStatus: "public", isLive: false, isShort: true })).toBe("short")
  expect(resolveVtSyncVideoFormat({ privacyStatus: "public", isLive: false, isShort: false })).toBe("long")
 })

 it("keeps raw snapshot rows while excluding private and unlisted consumer rows", () => {
  const projected = applyVtSyncPrivacyFilters(snapshot)
  expect(projected.videos.map((video) => video.id)).toEqual(["public"])
  expect(snapshot.videos.map((video) => video.id)).toEqual(["public", "private", "unlisted"])
 })

 it("restores excluded rows as unknown when their toggles are disabled", () => {
  const videos = filterVtSyncVideos(
   snapshot.videos as Array<(typeof snapshot.videos)[number] & Record<string, unknown>>,
   { excludePrivate: false, excludeUnlisted: false },
  )
  expect(videos.map((video) => [video.id, video.format])).toEqual([
   ["public", "long"],
   ["private", "unknown"],
   ["unlisted", "unknown"],
  ])
 })

 it("uses the same default projection for tables, Brain evidence, and visual rows", () => {
  const table = VT_SYNC_VISIBLE_TABLE_DEFINITIONS.find((definition) => definition.id === "videos")!
  const tableRows = buildVtSyncTableViewModel(snapshot, table).rows
  const brain = buildVtSyncBrainContext(snapshot)
  const visuals = buildVtSyncVisualPropsData(snapshot)

  expect(tableRows.map((row) => row.videoId)).toEqual(["public"])
  expect(brain.facts.rowCounts).toMatchObject({ videos: 1 })
  expect(brain.facts.privacyPolicy).toMatchObject({ excludedVideoRows: 2 })
  expect(brain.facts.totals).toEqual({ privacyFilteredVideos: { views: 10, watchTime: 0 } })
  expect(visuals.rows.map((row) => row.videoId)).toEqual(["public"])
 })
})
