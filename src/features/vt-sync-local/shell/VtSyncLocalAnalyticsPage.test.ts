import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

import type { VtSyncDatasetFreshness } from "../adapters/contracts"
import type { VtSyncLocalSyncProgress } from "../adapters/localSyncEngine"
import {
 buildVtSyncUnifiedProgressRows,
 buildVtSyncUnifiedUnitViewModels,
 claimVtSyncSyncRequest,
 getVtSyncActiveCategoryIds,
 getVtSyncPendingCategoryIds,
 getVtSyncProgressQueueSummary,
} from "./vtSyncProgressModel"

const pageSource = readFileSync(new URL("./VtSyncLocalAnalyticsPage.tsx", import.meta.url), "utf8")

describe("VT-SYNC unified progress rows", () => {
 it("uses the creator-facing hero and routes its actions through the existing account and sync paths", () => {
  expect(pageSource).toContain("<VtSyncCreatorHero")
  expect(pageSource).toContain("void startSync(getVtSyncDefaultUnitIds().flatMap(getVtSyncUnitCategoryIds))")
  expect(pageSource.match(/scrollToPanel\(syncToolboxRef\.current\)/g)).toHaveLength(2)
  expect(pageSource).not.toContain("progressPanelRef")
  expect(pageSource).not.toContain("VT-SYNC Tools Page")
  expect(pageSource).not.toContain("NO CANONICAL WRITES")
  expect(pageSource).not.toContain("VtSyncStatCard")
 })

 it("renders one unified controller + progress toolbox instead of two synchronized panels", () => {
  expect(pageSource.match(/<VtSyncUnifiedSyncToolbox/g)).toHaveLength(1)
  expect(pageSource).toContain("progress={syncProgress}")
  expect(pageSource).toContain("queuedCategoryIds={queuedCategoryIds}")
  expect(pageSource).toContain("videoCatalogCoverage={videoCatalogProjection.coverage}")
  expect(pageSource).not.toContain("<ProgressRail")
  expect(pageSource).not.toContain("<VtSyncControllerPanel")
  expect(pageSource).not.toContain("--vt-sync-controller-height")
  expect(pageSource).not.toContain("new ResizeObserver(updateHeight)")
 })

 it("does not consume a queued request before authorization is ready and dedupes equivalent jobs", () => {
  const tokenGuard = pageSource.indexOf('if (!token) throw new Error("No valid Google access token is available after authorization.")')
  const queueShift = pageSource.indexOf("syncQueueRef.current.shift()")
  expect(tokenGuard).toBeGreaterThan(-1)
  expect(queueShift).toBeGreaterThan(tokenGuard)
  expect(pageSource).toContain("vtSyncQueueRequestKey")
  expect(pageSource).toContain("alreadyActive || alreadyQueued")
  expect(pageSource).toContain("readPersistedVtSyncQueue")
  expect(pageSource).toContain("persistVtSyncQueue(syncQueueRef.current)")
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

 it("lights only the exact query running inside a shared traffic phase", () => {
  const progress: VtSyncLocalSyncProgress = {
   runId: "traffic-run",
   startedAt: "2026-09-19T12:00:00.000Z",
   status: "running",
   requestedCategoryIds: ["search_terms", "ext_websites", "suggested_videos"],
   phases: [{
    id: "traffic",
    label: "Traffic Details",
    status: "running",
    rows: 12,
    currentCategoryId: "search_terms",
    nextCategoryId: "ext_websites",
    currentQueryLabel: "Search Terms",
    nextQueryLabel: "External Websites",
   }],
  }

  expect(getVtSyncActiveCategoryIds(progress)).toEqual(["search_terms"])
  expect(getVtSyncPendingCategoryIds(progress)).toEqual(expect.arrayContaining(["ext_websites", "suggested_videos"]))
  expect(getVtSyncPendingCategoryIds(progress)).not.toContain("search_terms")

  const rows = buildVtSyncUnifiedProgressRows(progress)
  expect(rows.find((row) => row.category.id === "search_terms")?.displayStatus).toBe("running")
  expect(rows.find((row) => row.category.id === "ext_websites")?.displayStatus).toBe("pending")
  expect(rows.find((row) => row.category.id === "suggested_videos")?.displayStatus).toBe("pending")
 })

 it("shows a follow-up queued request as pending without calling it running", () => {
  const rows = buildVtSyncUnifiedProgressRows(null, undefined, ["search_terms"])
  expect(rows.find((row) => row.category.id === "search_terms")).toMatchObject({
   displayStatus: "pending",
   message: "Queued behind the current sync request.",
  })
  expect(getVtSyncActiveCategoryIds(null)).toEqual([])
 })

  it("does not relabel a completed sibling as queued while its shared phase keeps running", () => {
  const progress: VtSyncLocalSyncProgress = {
   runId: "traffic-run",
   startedAt: "2026-09-19T12:00:00.000Z",
   status: "running",
   requestedCategoryIds: ["search_terms", "ext_websites"],
   phases: [{
    id: "traffic",
    label: "Traffic Details",
    status: "running",
    rows: 20,
    currentCategoryId: "ext_websites",
    currentQueryLabel: "External Websites",
   }],
  }
  const freshness: VtSyncDatasetFreshness = {
   search_terms: {
    runId: "traffic-run",
    phase: "search_terms",
    status: "synced",
    source: "current_run",
    rows: 12,
    updatedAt: "2026-09-19T12:00:04.000Z",
   },
  }

  expect(getVtSyncActiveCategoryIds(progress)).toEqual(["ext_websites"])
  expect(getVtSyncPendingCategoryIds(progress, freshness)).not.toContain("search_terms")
  expect(buildVtSyncUnifiedProgressRows(progress, freshness)
   .find((row) => row.category.id === "search_terms")?.displayStatus).toBe("synced")
 })

 it("builds one user-facing unit model that carries status, timing, issues, rows, and child queries together", () => {
  const units = buildVtSyncUnifiedUnitViewModels(null, {
   channel_metadata: {
    runId: "channel-run",
    phase: "channel_metadata",
    status: "synced",
    source: "current_run",
    rows: 1,
    updatedAt: "2026-09-19T12:00:04.000Z",
    startedAt: "2026-09-19T12:00:00.000Z",
    completedAt: "2026-09-19T12:00:04.000Z",
    durationMs: 4000,
   },
   channel_totals: {
    runId: "channel-run",
    phase: "channel_totals",
    status: "synced",
    source: "current_run",
    rows: 5,
    updatedAt: "2026-09-19T12:00:08.000Z",
    startedAt: "2026-09-19T12:00:04.000Z",
    completedAt: "2026-09-19T12:00:08.000Z",
    durationMs: 4000,
   },
  })
  const channel = units.find((unit) => unit.id === "channel_overview_windows")
  expect(channel).toMatchObject({
   status: "synced",
   displayRows: 6,
   issueCount: 0,
   lastSyncedAt: "2026-09-19T12:00:08.000Z",
  })
  expect(channel?.rows).toHaveLength(2)
  expect(channel?.durationMs).toBeGreaterThanOrEqual(4000)
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
