// @vitest-environment jsdom
import React, { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, describe, expect, it, vi } from "vitest"

import { VT_SYNC_SYNC_UNITS, getVtSyncDefaultUnitIds, getVtSyncUnitCategoryIds } from "../upstream/syncUnitRegistry"
import { VtSyncControllerPanel } from "./VtSyncControllerPanel"

const baseProps = () => ({
 isAuthenticated: true,
 isSyncing: false,
 progress: null,
 videos: [],
 onLogin: vi.fn(async () => undefined),
 onStartSync: vi.fn(async (_categories?: string[], _options?: unknown) => undefined),
})

let root: Root | null = null
let container: HTMLDivElement | null = null

afterEach(() => {
 if (root) act(() => root?.unmount())
 root = null
 container?.remove()
 container = null
})

const mountPanel = async () => {
 const props = baseProps()
 container = document.createElement("div")
 document.body.appendChild(container)
 root = createRoot(container)
 await act(async () => root?.render(React.createElement(VtSyncControllerPanel, props)))
 return props
}

describe("VT-SYNC compact unified controller", () => {
 it("renders one expanded group, two global commands, and no legacy preset or core UI", () => {
  const markup = renderToStaticMarkup(React.createElement(VtSyncControllerPanel, baseProps()))
  const groups = [...new Set(VT_SYNC_SYNC_UNITS.map((unit) => unit.group))]

  expect(markup.match(/aria-expanded="true" aria-controls="vt-sync-controller-group-/g)).toHaveLength(1)
  expect(markup.match(/aria-expanded="false" aria-controls="vt-sync-controller-group-/g)).toHaveLength(groups.length - 1)
  expect(markup).toContain("SYNC SELECTED (6)")
  expect(markup).toContain("visible sync units")
  expect(markup).not.toContain("Core Units")
  expect(markup).not.toContain(">Core<")
  expect(markup).not.toContain("Recommended")
  expect(markup).not.toContain("Copy Summary")
  expect(markup).not.toContain("Select All")
  expect(markup).not.toContain("0 issues")
  expect(markup).not.toContain(" rows")
  expect(markup).not.toContain(">Sync time<")
  expect(markup).not.toContain(">Source<")
  expect(markup.match(/class="comp-label"/g)).toHaveLength(2)
  expect(markup).toContain("vt-sync-unit-count")
  expect(markup).toContain("vt-sync-unit-freshness")
  expect(markup).toContain("vt-sync-unit-status")
 })

 it("runs every visible unit from Sync All without changing selection", async () => {
  const props = await mountPanel()
  const syncAll = container?.querySelector<HTMLButtonElement>('button[aria-label^="SYNC ALL:"]')
  expect(syncAll).toBeTruthy()
  await act(async () => syncAll?.click())

  const requested = props.onStartSync.mock.calls[0]?.[0] || []
  VT_SYNC_SYNC_UNITS.flatMap((unit) => unit.categoryIds).forEach((categoryId) => expect(requested).toContain(categoryId))
  expect(container?.querySelector('button[aria-label^="SYNC SELECTED (6):"]')).toBeTruthy()
 })

 it("runs only the default checked units from Sync Selected", async () => {
  const props = await mountPanel()
  const syncSelected = container?.querySelector<HTMLButtonElement>('button[aria-label^="SYNC SELECTED (6):"]')
  expect(syncSelected).toBeTruthy()
  await act(async () => syncSelected?.click())

  const expected = getVtSyncDefaultUnitIds().flatMap(getVtSyncUnitCategoryIds)
  expect(props.onStartSync).toHaveBeenCalledWith(expected, undefined)
 })
})
