import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

import type { VtSyncDatasetFreshness } from "../adapters/contracts"
import type { VtSyncLocalSyncProgress } from "../adapters/localSyncEngine"
import { buildVtSyncUnifiedProgressRows, claimVtSyncSyncRequest } from "./VtSyncLocalAnalyticsPage"

const pageSource = readFileSync(new URL("./VtSyncLocalAnalyticsPage.tsx", import.meta.url), "utf8")
const pageCss = readFileSync(new URL("./VtSyncLocalAnalyticsPage.css", import.meta.url), "utf8")

describe("VT-SYNC unified progress rows", () => {
 it("uses the creator-facing hero and routes its actions through the existing account and sync paths", () => {
  expect(pageSource).toContain("<VtSyncCreatorHero")
  expect(pageSource).toContain("void startSync(getVtSyncDefaultCategoryIds())")
  expect(pageSource).toContain("scrollToPanel(controllerPanelRef.current)")
  expect(pageSource).toContain("scrollToPanel(progressPanelRef.current)")
  expect(pageSource).not.toContain("VT-SYNC Tools Page")
  expect(pageSource).not.toContain("NO CANONICAL WRITES")
  expect(pageSource).not.toContain("VtSyncStatCard")
 })

 it("measures the controller and constrains the progress toolbox to the same desktop height", () => {
  expect(pageSource).toContain("new ResizeObserver(updateHeight)")
  expect(pageSource).toContain("--vt-sync-controller-height")
  expect(pageSource).toContain("fillAvailable")
  expect(pageSource).toContain("min-h-0 flex-1 overflow-auto")
  expect(pageCss).toContain("height: var(--vt-sync-controller-height, auto)")
 })

 it("synchronously rejects a second active sync request", () => {
  const lock = { current: false }
  expect(claimVtSyncSyncRequest(lock)).toBe(true)
  expect(claimVtSyncSyncRequest(lock)).toBe(false)
  lock.current = false
  expect(claimVtSyncSyncRequest(lock)).toBe(true)
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
