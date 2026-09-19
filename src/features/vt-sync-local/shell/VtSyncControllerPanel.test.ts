import { readFileSync } from "node:fs"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { VT_SYNC_SYNC_UNITS } from "../upstream/syncUnitRegistry"
import { VtSyncControllerPanel } from "./VtSyncControllerPanel"
import { ANALYTICS_WINDOWS, WINDOW_SHORT_LABELS } from "../../../services/analytics/windows"

describe("VT-SYNC controller accordion", () => {
 it("renders stacked category controls with only the first group expanded", () => {
  const markup = renderToStaticMarkup(React.createElement(VtSyncControllerPanel, {
   isAuthenticated: true,
   isSyncing: false,
   videos: [],
   onLogin: vi.fn(async () => undefined),
   onStartSync: vi.fn(async () => undefined),
  }))
  const groups = [...new Set(VT_SYNC_SYNC_UNITS.map((unit) => unit.group))]
  const groupCount = groups.length

  expect(groupCount).toBeGreaterThan(1)
  expect(markup).toContain("SYNC CONTROL + PROGRESS")
  expect(markup).toContain('id="vt-sync-controller-group-channel"')
  expect(markup).toContain('id="vt-sync-controller-group-time" hidden=""')
  expect(markup.match(/id="vt-sync-controller-group-[^"]+"/g)).toHaveLength(groupCount)
  expect(markup).toContain("SYNC ALL")
  expect(markup).toContain("Copy Summary")
 })
})

describe("VT-SYNC execution status controls", () => {
 it("keeps a stored successful unit visibly done between runs", () => {
  const markup = renderToStaticMarkup(React.createElement(VtSyncControllerPanel, {
   isAuthenticated: true,
   isSyncing: false,
   videos: [],
   datasetFreshness: {
    daily_metrics: {
     runId: "previous-run",
     phase: "daily_metrics",
     status: "synced",
     source: "current_run",
     rows: 365,
     updatedAt: "2026-09-19T12:00:00.000Z",
    },
   },
   onLogin: vi.fn(async () => undefined),
   onStartSync: vi.fn(async () => undefined),
  }))
  expect(markup).toContain('data-sync-status="complete"')
  expect(markup).toContain(">DONE<")
 })

 it("uses one compact telemetry row with the controller pinned to the far right", () => {
  const source = readFileSync(new URL("./VtSyncControllerPanel.tsx", import.meta.url), "utf8")
  expect(source).toContain("grid-cols-[minmax(210px,1fr)_58px_54px_88px_34px_58px_96px]")
  expect(source).toContain("min-w-[600px]")
  expect(source).toContain("sticky right-0")
  expect(source).toContain("<span>Status</span><span>Time</span><span>Last sync</span>")
  expect(source).toContain("<span className=\"text-center\">!</span>")
  expect(source).toContain("<span className=\"text-right\">Rows</span>")
  expect(source).toContain("<RetroSyncExecutionSwitch")
 })

 it("keeps sync time, issues, child queries, and description inside the expandable dataset detail surface", () => {
  const source = readFileSync(new URL("./VtSyncControllerPanel.tsx", import.meta.url), "utf8")
  expect(source).toContain("vt-sync-unified-unit-")
  expect(source).toContain("Issues ·")
  expect(source).toContain("Underlying query")
  expect(source).toContain("DURATION")
  expect(source).toContain("LAST SYNC")
 })

})

describe("time window controller options", () => {
 const render = () => renderToStaticMarkup(React.createElement(VtSyncControllerPanel, {
  isAuthenticated: true,
  isSyncing: false,
  videos: [],
  onLogin: vi.fn(async () => undefined),
  onStartSync: vi.fn(async () => undefined),
 }))

 it("offers every canonical window as a chip", () => {
  const markup = render()
  ANALYTICS_WINDOWS.forEach((window) => {
   expect(markup).toContain(WINDOW_SHORT_LABELS[window])
  })
 })

 it("selects lifetime only by default, so opening the panel cannot raise quota", () => {
  const markup = render()
  const chips = markup.match(/<button[^>]*data-window="[^"]+"[^>]*>/g) || []
  expect(chips).toHaveLength(ANALYTICS_WINDOWS.length)
  const selectedChips = chips.filter((chip) => chip.includes('aria-pressed="true"'))
  expect(selectedChips).toHaveLength(1)
  expect(selectedChips[0]).toContain('data-window="lifetime"')
  // Lifetime is also locked on, since stored rows still key off it.
  expect(selectedChips[0]).toContain("disabled")
 })

 it("says the run is lifetime-only rather than quoting an extra cost", () => {
  expect(render()).toContain("Lifetime only")
 })

 it("labels visible dataset units separately from underlying child queries", () => {
  const source = readFileSync(new URL("./VtSyncControllerPanel.tsx", import.meta.url), "utf8")
  expect(source).toContain("selectedUnitCount")
  expect(source).toContain("selectedQueryCount")
  expect(source).toContain("underlying quer")
  expect(source).not.toContain('selected.length} dataset')
 })

 it("tells the user which datasets derive their windows for free", () => {
  // The recommended default selection includes daily stats, which is derived.
  expect(render()).toContain("derive their windows without extra window requests")
 })

 it("passes the selected windows to both sync entry points", () => {
  const source = readFileSync(new URL("./VtSyncControllerPanel.tsx", import.meta.url), "utf8")
  const startCalls = source.split("\n").filter((line) => line.includes("await onStartSync("))
  expect(startCalls).toHaveLength(2)
  startCalls.forEach((call) => expect(call).toContain("selectedWindows"))
 })

 it("excludes derived datasets from the request-cost estimate", () => {
  const source = readFileSync(new URL("./VtSyncControllerPanel.tsx", import.meta.url), "utf8")
  expect(source).toContain("selected.filter(vtSyncCategoryCostsPerWindow)")
 })
})
