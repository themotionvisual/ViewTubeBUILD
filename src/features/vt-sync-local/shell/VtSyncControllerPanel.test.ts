import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { VT_SYNC_CATEGORY_OPTIONS } from "../upstream/syncCategoryRegistry"
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
  const groupCount = new Set(VT_SYNC_CATEGORY_OPTIONS.map((category) => category.group)).size

  expect(markup.match(/aria-expanded="true"/g)).toHaveLength(1)
  expect(markup.match(/aria-expanded="false"/g)).toHaveLength(groupCount - 1)
  expect(markup).toContain('id="vt-sync-controller-group-channel"')
  expect(markup).toContain('id="vt-sync-controller-group-videos" hidden=""')
  expect(markup.match(/id="vt-sync-controller-group-[^"]+"/g)).toHaveLength(groupCount)
 })
})
