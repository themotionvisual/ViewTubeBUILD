import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { VT_SYNC_SYNC_UNITS } from "../upstream/syncUnitRegistry"
import { VtSyncControllerPanel } from "./VtSyncControllerPanel"

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
