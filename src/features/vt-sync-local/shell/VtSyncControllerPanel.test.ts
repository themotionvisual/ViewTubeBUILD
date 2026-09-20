import { readFileSync } from "node:fs"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { VT_SYNC_SYNC_UNITS } from "../upstream/syncUnitRegistry"
import { VtSyncUnifiedSyncToolbox } from "./VtSyncUnifiedSyncToolbox"
import { ANALYTICS_WINDOWS, WINDOW_SHORT_LABELS } from "../../../services/analytics/windows"

describe("VT-SYNC controller accordion", () => {
 it("renders stacked category controls with only the first group expanded", () => {
  const markup = renderToStaticMarkup(React.createElement(VtSyncUnifiedSyncToolbox, {
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
  const markup = renderToStaticMarkup(React.createElement(VtSyncUnifiedSyncToolbox, {
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
  const source = readFileSync(new URL("./VtSyncUnifiedSyncToolbox.tsx", import.meta.url), "utf8")
  expect(source).toContain("grid-cols-[minmax(210px,1fr)_58px_54px_88px_38px_58px_142px]")
  expect(source).toContain("min-w-[650px]")
  expect(source).toContain("sticky right-0")
  expect(source).toContain("<span>Status</span><span>Time</span><span>Last sync</span>")
  expect(source).toContain("<span className=\"text-center\">!</span>")
  expect(source).toContain("<span className=\"text-right\">Rows</span>")
  expect(source).toContain("<RetroSyncExecutionSwitch")
 })

 it("removes default row checkboxes and only exposes details for rows with extra information", () => {
  const source = readFileSync(new URL("./VtSyncUnifiedSyncToolbox.tsx", import.meta.url), "utf8")
  expect(source).toContain("hasExtraDetail")
  expect(source).toContain("vt-sync-unified-unit-")
  expect(source).toContain("Issues ·")
  expect(source).toContain("Underlying query")
  expect(source).not.toContain('title={expandedUnit ? "Collapse dataset details" : "Expand dataset details"}')
  expect(source).not.toContain('aria-label={`${checked ? "Remove" : "Add"}')
 })

 it("integrates the red batch selector and its LED into the same silver controller plate", () => {
  const chromeSource = readFileSync(new URL("./VtSyncRetroChrome.tsx", import.meta.url), "utf8")
  const cssSource = readFileSync(new URL("./VtSyncRetroChrome.css", import.meta.url), "utf8")
  expect(chromeSource).toContain("vt-retro-dual-plate")
  expect(chromeSource).toContain("vt-retro-status-led")
  expect(chromeSource).toContain("vt-retro-batch-track")
  expect(chromeSource).toContain("vt-retro-selection-led")
  expect(cssSource).toContain("Physical composition: [ status LED | horizontal sync switch | red vertical batch switch | batch LED ]")
  expect(cssSource).toContain(".vt-retro-pcb-group.is-batch-selected .vt-retro-batch-nub")
 })

})

describe("time window controller options", () => {
 const render = () => renderToStaticMarkup(React.createElement(VtSyncUnifiedSyncToolbox, {
  isAuthenticated: true,
  isSyncing: false,
  videos: [],
  onLogin: vi.fn(async () => undefined),
  onStartSync: vi.fn(async () => undefined),
 }))

 it("offers every canonical window as an analog toggle", () => {
  const markup = render()
  ANALYTICS_WINDOWS.forEach((window) => {
   expect(markup).toContain(`data-window="${window}"`)
   expect(markup).toContain(WINDOW_SHORT_LABELS[window])
  })
  expect(markup).toContain("vt-retro-analog-toggle")
 })

 it("starts with lifetime on but leaves it independently toggleable", () => {
  const markup = render()
  const lifetimeMarker = markup.indexOf('data-window="lifetime"')
  expect(lifetimeMarker).toBeGreaterThan(-1)
  const lifetimeSlice = markup.slice(lifetimeMarker, lifetimeMarker + 900)
  expect(lifetimeSlice).toContain('aria-pressed="true"')
  expect(lifetimeSlice).not.toContain("disabled")
 })

 it("describes the selected-window request estimate rather than forcing lifetime language", () => {
  const markup = render()
  expect(markup).toContain("window")
  expect(markup).toContain("selected")
  expect(markup).not.toContain("Lifetime is always synced")
 })

 it("labels visible dataset units separately from underlying child queries", () => {
  const source = readFileSync(new URL("./VtSyncUnifiedSyncToolbox.tsx", import.meta.url), "utf8")
  expect(source).toContain("selectedUnitCount")
  expect(source).toContain("selectedQueryCount")
  expect(source).toContain("underlying quer")
  expect(source).not.toContain('selected.length} dataset')
 })

 it("tells the user which datasets derive their windows for free", () => {
  // The recommended default selection includes daily stats, which is derived.
  expect(render()).toContain("derive their windows without extra window requests")
 })

 it("uses analog switch components for quick-select presets rather than ordinary preset buttons", () => {
  const source = readFileSync(new URL("./VtSyncUnifiedSyncToolbox.tsx", import.meta.url), "utf8")
  expect(source).toContain('<RetroAnalogToggle\n       label="All"')
  expect(source).toContain('label="Core"')
  expect(source).toContain('label="Recommended"')
  expect(source).toContain('label="Clear"')
 })

  it("passes the selected windows to both sync entry points", () => {
  const source = readFileSync(new URL("./VtSyncUnifiedSyncToolbox.tsx", import.meta.url), "utf8")
  const startCalls = source.split("\n").filter((line) => line.includes("await onStartSync("))
  expect(startCalls).toHaveLength(2)
  startCalls.forEach((call) => expect(call).toContain("selectedWindows"))
 })

 it("excludes derived datasets from the request-cost estimate", () => {
  const source = readFileSync(new URL("./VtSyncUnifiedSyncToolbox.tsx", import.meta.url), "utf8")
  expect(source).toContain("selected.filter(vtSyncCategoryCostsPerWindow)")
 })
})
