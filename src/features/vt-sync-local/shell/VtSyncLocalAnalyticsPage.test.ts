import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

import type { VtSyncDatasetFreshness } from "../adapters/contracts"
import type { VtSyncLocalSyncProgress } from "../adapters/localSyncEngine"
import { VT_SYNC_GROUP_ORDER } from "../upstream/syncUnitRegistry"
import {
 buildVtSyncConsoleModel,
 buildVtSyncUnifiedProgressRows,
 claimVtSyncSyncRequest,
 getVtSyncProgressQueueSummary,
} from "./vtSyncProgressModel"

const pageSource = readFileSync(new URL("./VtSyncLocalAnalyticsPage.tsx", import.meta.url), "utf8")
const pageCss = readFileSync(new URL("./VtSyncLocalAnalyticsPage.css", import.meta.url), "utf8")

describe("VT-SYNC unified progress rows", () => {
 it("uses the creator-facing hero and routes its actions through the existing account and sync paths", () => {
  expect(pageSource).toContain("<VtSyncCreatorHero")
  expect(pageSource).toContain("void startSync(getVtSyncDefaultUnitIds().flatMap(getVtSyncUnitCategoryIds))")
  expect(pageSource).toContain("scrollToPanel(controllerPanelRef.current)")
  expect(pageSource).not.toContain("progressPanelRef")
  expect(pageSource).not.toContain("VT-SYNC Tools Page")
  expect(pageSource).not.toContain("NO CANONICAL WRITES")
  expect(pageSource).not.toContain("VtSyncStatCard")
 })

 it("renders one half-width unified console without a duplicate progress toolbox or height coupling", () => {
  expect(pageSource.match(/<VtSyncControllerPanel/g)).toHaveLength(1)
  expect(pageSource).not.toContain("ProgressRail")
  expect(pageSource).not.toContain("new ResizeObserver")
  expect(pageSource).not.toContain("--vt-sync-controller-height")
  expect(pageCss).not.toContain("--vt-sync-controller-height")
  expect(pageSource).toContain('className="grid items-start gap-6 md:grid-cols-2"')
 })

 it("synchronously rejects a second active sync request", () => {
  const lock = { current: false }
  expect(claimVtSyncSyncRequest(lock)).toBe(true)
  expect(claimVtSyncSyncRequest(lock)).toBe(false)
  lock.current = false
  expect(claimVtSyncSyncRequest(lock)).toBe(true)
 })

 it("shows the running query before the next pending or queued query", () => {
  const progress: VtSyncLocalSyncProgress = {
   runId: "active-run",
   startedAt: "2026-08-13T12:00:00.000Z",
   status: "running",
   requestedCategoryIds: ["channel_metadata", "traffic_overview"],
   phases: [
    { id: "channel_metadata", label: "Channel Metadata", status: "running", rows: 1 },
    { id: "traffic", label: "Traffic Details", status: "pending", rows: 0 },
   ],
  }

  expect(getVtSyncProgressQueueSummary(progress, ["search_terms"])).toMatchObject({
   currentLabel: "Channel Metadata",
   nextLabel: "Traffic Details",
  })
  expect(getVtSyncProgressQueueSummary({
   ...progress,
   phases: [{ id: "channel_metadata", label: "Channel Metadata", status: "running", rows: 1 }],
  }, ["search_terms"])).toMatchObject({
   currentLabel: "Channel Metadata",
   nextLabel: "Search Terms",
  })
  expect(getVtSyncProgressQueueSummary({
   ...progress,
   phases: [{
    id: "traffic",
    label: "Traffic Details",
    status: "running",
    rows: 25,
    currentQueryLabel: "Search Terms",
    nextQueryLabel: "External Websites",
   }],
  })).toMatchObject({
   currentLabel: "Search Terms",
   nextLabel: "External Websites",
  })
 })

 it("groups progress datasets into the same categories as the controller", () => {
  const model = buildVtSyncConsoleModel({ progress: null })
  expect(model.groups.map((group) => group.group)).toEqual(VT_SYNC_GROUP_ORDER)
  expect(model.queue.currentLabel).toBe("Idle")
  expect(model.queue.nextLabel).toBe("No queued query")
 })

 it("reports the video catalog authority instead of summing child-query rows", () => {
  const model = buildVtSyncConsoleModel({
   progress: null,
   datasetFreshness: {
    videos: { status: "synced", source: "current_run", rows: 1_446 },
    uploads_playlist: { status: "synced", source: "current_run", rows: 1_446 },
    video_metadata: { status: "partial", source: "current_run", rows: 1_442 },
    videos_analytics: { status: "synced", source: "current_run", rows: 1_388 },
   },
   videoCatalogCoverage: {
    catalogTotal: 1_446,
    metadataAvailable: 1_442,
    analyticsAvailable: 1_388,
    importOnly: 0,
    unresolvedImports: 0,
   },
  })

  expect(model.units.find((unit) => unit.id === "video_catalog")?.displayRows).toBe(1_446)
  expect(model.units.find((unit) => unit.id === "video_catalog")?.displayRows).not.toBe(4_276)
 })

 it("uses live phase state only for datasets requested by the active run", () => {
  const freshness: VtSyncDatasetFreshness = {
   traffic_overview: {
    runId: "stored-run",
    phase: "traffic_overview",
    status: "synced",
    source: "current_run",
    rows: 10,
    updatedAt: "2026-07-28T06:00:00.000Z",
   },
   search_terms: {
    runId: "stored-run",
    phase: "search_terms",
    status: "synced",
    source: "current_run",
    rows: 8,
    updatedAt: "2026-07-28T06:00:00.000Z",
   },
  }
  const progress: VtSyncLocalSyncProgress = {
   runId: "active-run",
   startedAt: "2026-07-28T07:00:00.000Z",
   status: "running",
   requestedCategoryIds: ["traffic_overview"],
   phases: [
    { id: "traffic", label: "Traffic Details", status: "running", rows: 3 },
   ],
  }

  const rows = buildVtSyncUnifiedProgressRows(progress, freshness)
  expect(rows.find((row) => row.category.id === "traffic_overview")).toMatchObject({
   phaseLabel: "Traffic Details",
   displayStatus: "running",
   displayRows: 3,
  })
 expect(rows.find((row) => row.category.id === "search_terms")).toMatchObject({
   displayStatus: "synced",
   displayRows: 8,
  })
 })

 it("does not duplicate an aggregate live phase row count across sibling datasets", () => {
  const rows = buildVtSyncUnifiedProgressRows({
   runId: "traffic-run",
   startedAt: "2026-07-28T07:00:00.000Z",
   status: "running",
   requestedCategoryIds: ["traffic_overview", "search_terms"],
   phases: [{ id: "traffic", label: "Traffic Details", status: "running", rows: 21 }],
  }, {
   traffic_overview: { runId: "stored", phase: "traffic_overview", status: "synced", source: "current_run", rows: 13 },
   search_terms: { runId: "stored", phase: "search_terms", status: "synced", source: "current_run", rows: 8 },
  })

  expect(rows.find((row) => row.category.id === "traffic_overview")?.displayRows).toBe(13)
  expect(rows.find((row) => row.category.id === "search_terms")?.displayRows).toBe(8)
 })

 it("groups channel identity and channel windows under the restored Channel bundle", () => {
  const rows = buildVtSyncUnifiedProgressRows(null, {
   channel_metadata: { runId: "channel-run", phase: "channel_metadata", status: "synced", source: "current_run", rows: 1 },
   channel_totals: { runId: "channel-run", phase: "channel_totals", status: "synced", source: "current_run", rows: 5 },
  })

  expect(rows.find((row) => row.category.id === "channel_metadata")).toMatchObject({
   syncUnitId: "channel_overview_windows",
   syncUnitLabel: "Channel Overview + Windows",
  })
  expect(rows.find((row) => row.category.id === "channel_totals")).toMatchObject({
   syncUnitId: "channel_overview_windows",
   syncUnitLabel: "Channel Overview + Windows",
  })
 })

 it("falls back to stored freshness between runs", () => {
  const rows = buildVtSyncUnifiedProgressRows(null, {
   retention: {
    runId: "stored-retention",
    phase: "retention",
    status: "partial",
    source: "current_run",
    rows: 600,
    updatedAt: "2026-07-28T06:00:00.000Z",
    missingMetrics: ["relativeRetentionPerformance"],
   },
  })

  expect(rows.find((row) => row.category.id === "retention")).toMatchObject({
   phaseLabel: "retention sync",
   displayStatus: "partial",
   displayRows: 600,
   message: "Missing: relativeRetentionPerformance",
  })
 })
})
