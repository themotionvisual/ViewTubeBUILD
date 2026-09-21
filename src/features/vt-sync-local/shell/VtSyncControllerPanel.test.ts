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
  expect(markup).toContain(">COMPLETE<")
 })

 it("keeps portrait metadata below the row but moves two-high badge columns left of sync on landscape and desktop", () => {
  const source = readFileSync(new URL("./VtSyncUnifiedSyncToolbox.tsx", import.meta.url), "utf8")
  const cssSource = readFileSync(new URL("./VtSyncRetroChrome.css", import.meta.url), "utf8")
  expect(source).toContain("vt-sync-row-shell")
  expect(source).toContain("vt-sync-row-check")
  expect(source).toContain("vt-sync-row-copy")
  expect(source).toContain("vt-sync-meta-rail")
  expect(source).toContain("vt-sync-row-sync")
  expect(cssSource).toContain('grid-template-areas: "check copy meta sync"')
  expect(cssSource).toContain("grid-template-rows: repeat(2")
  expect(cssSource).toContain("grid-auto-flow: column")
 })

 it("enlarges dataset/category text and the complete sync compound on landscape and desktop without edge collisions", () => {
  const source = readFileSync(new URL("./VtSyncUnifiedSyncToolbox.tsx", import.meta.url), "utf8")
  const cssSource = readFileSync(new URL("./VtSyncRetroChrome.css", import.meta.url), "utf8")
  expect(source).toContain("vt-sync-category-title")
  expect(source).toContain("vt-sync-category-summary")
  expect(cssSource).toContain("@media (min-width: 600px)")
  expect(cssSource).toContain("margin: 7px 12px")
  expect(cssSource).toContain("width: 102px")
  expect(cssSource).toContain("@media (min-width: 1100px)")
  expect(cssSource).toContain("margin: 9px 16px")
  expect(cssSource).toContain("width: 114px")
 })

  it("keeps a one-line title, larger subtitle, and combines status with last-sync time", () => {
  const source = readFileSync(new URL("./VtSyncUnifiedSyncToolbox.tsx", import.meta.url), "utf8")
  expect(source).toContain("vt-sync-dataset-title")
  expect(source).toContain("whitespace-nowrap")
  expect(source).toContain("vt-sync-dataset-subtitle")
  expect(source).toContain("formatCompactLastSync")
  expect(source).toContain("statusAndSyncValue")
  expect(source).toContain("resultValue")
  expect(source).toContain("resultNounForUnit")
 })

 it("tints each dataset row from its category color at 10% unselected and 30% selected", () => {
  const source = readFileSync(new URL("./VtSyncUnifiedSyncToolbox.tsx", import.meta.url), "utf8")
  expect(source).toContain("selectedForBatch ? 30 : 10")
  expect(source).toContain('["--vt-subtoolbox-fill" as string]: groupColor')
  expect(source).not.toContain('border-r-[2px] border-black bg-[#f4f4f4]')
  expect(source).not.toContain('border-l-[2px] border-black bg-[#f4f4f4]')
 })

 it("uses the canonical toolbox X check-control primitive for dataset and group batch inclusion", () => {
  const source = readFileSync(new URL("./VtSyncUnifiedSyncToolbox.tsx", import.meta.url), "utf8")
  const cssSource = readFileSync(new URL("../../../styles/subtoolbox-system.css", import.meta.url), "utf8")
  expect(source.match(/<SubToolboxCheckControl/g)?.length).toBeGreaterThanOrEqual(2)
  expect(source).toContain('className="vt-sync-batch-checkbox"')
  expect(cssSource).toContain(".vt-subtoolbox-check-control>span:before")
  expect(cssSource).toContain("rotate(45deg)")
  expect(cssSource).toContain("rotate(-45deg)")
 })

 it("shows an issues tag only when issues exist and keeps only purposeful special-option tags", () => {
  const source = readFileSync(new URL("./VtSyncUnifiedSyncToolbox.tsx", import.meta.url), "utf8")
  expect(source).toContain("(model?.issueCount || 0) > 0 ? (")
  expect(source).toContain("issueValue")
  expect(source).toContain('text="OPTIONS: METADATA"')
  expect(source).toContain('text="OPTIONS: VIDEOS"')
  expect(source).not.toContain('label="QUERIES"')
  expect(source).not.toContain('label="MODE"')
 })

 it("puts LEDs to the right, matches state-label colors, and animates colored LED ripples", () => {
  const chromeSource = readFileSync(new URL("./VtSyncRetroChrome.tsx", import.meta.url), "utf8")
  const cssSource = readFileSync(new URL("./VtSyncRetroChrome.css", import.meta.url), "utf8")
  const executionStart = chromeSource.indexOf("export const RetroSyncExecutionSwitch")
  const executionEnd = chromeSource.indexOf("export const RetroBatchSelectionSwitch", executionStart)
  const executionBlock = chromeSource.slice(executionStart, executionEnd)
  expect(executionBlock.indexOf("vt-retro-sync-hitbox")).toBeLessThan(executionBlock.indexOf("vt-retro-status-led"))
  expect(executionBlock).toContain("data-sync-label={statusLabel}")
  expect(cssSource).toContain("@keyframes vt-sync-led-ripple")
  expect(cssSource).toContain("@keyframes vt-sync-led-breathe")
  expect(cssSource).toContain('[data-sync-label="UP NEXT"]')
  expect(cssSource).toContain("var(--vt-sync-led-color)")
  expect(cssSource).not.toContain("repeating-linear-gradient(105deg")
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
  expect(render()).toContain("derive requested windows from their source data without extra per-window requests")
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
