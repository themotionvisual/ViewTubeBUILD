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

  expect(markup.match(/aria-expanded="true"/g)).toHaveLength(1)
  expect(markup.match(/aria-expanded="false"/g)).toHaveLength(groupCount - 1)
  expect(markup).toContain('id="vt-sync-controller-group-channel"')
  expect(markup).toContain('id="vt-sync-controller-group-time" hidden=""')
  expect(markup.match(/id="vt-sync-controller-group-[^"]+"/g)).toHaveLength(groupCount)
  expect(markup.match(/SYNC ALL/g)).toHaveLength(groupCount)
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

 it("tells the user which datasets derive their windows for free", () => {
  // The recommended default selection includes daily stats, which is derived.
  expect(render()).toContain("derive their windows for free")
 })

 it("passes the selected windows to both sync entry points", () => {
  const source = readFileSync(new URL("./VtSyncControllerPanel.tsx", import.meta.url), "utf8")
  const startCalls = source.split("\n").filter((line) => line.includes("await onStartSync("))
  expect(startCalls).toHaveLength(2)
  startCalls.forEach((call) => expect(call).toContain("selectedWindows"))
 })

 it("excludes derived datasets from the request-cost estimate", () => {
  const source = readFileSync(new URL("./VtSyncControllerPanel.tsx", import.meta.url), "utf8")
  // Three disjoint groups: fetched costs per window, derived is free, and
  // unwindowed belongs to neither.
  expect(source).toContain("selected.filter(vtSyncCategoryIsWindowFetchable)")
  expect(source).toContain("VT_SYNC_DERIVED_WINDOW_CATEGORY_IDS.has(id)")
 })
})
