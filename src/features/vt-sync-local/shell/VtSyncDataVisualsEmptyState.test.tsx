// @vitest-environment jsdom

/**
 * Every registered Data Visual module must render with no data.
 *
 * The Data Visuals toolbox used to hide its whole grid behind one
 * all-or-nothing check on three datasets, so a creator with no channel
 * connected — or one who had imported only a Daily Stats table — saw a single
 * "sync or import" panel instead of the visuals. The grid is now
 * unconditional, which only works if every module can draw its own empty
 * state instead of throwing on `rows[0]`.
 *
 * This renders each registered module against a fully empty dataset and fails
 * on the first one that throws.
 */

import { describe, expect, it } from "vitest"
import React from "react"
import { createRoot } from "react-dom/client"
import { act } from "react-dom/test-utils"

import { VT_SYNC_VISUAL_MODULE_REGISTRY } from "./VtSyncDataVisualsToolbox"
import type { VtSyncVisualProps } from "./VtSyncVisualFrame"

const EMPTY_PROPS = {
 data: [],
 csvFiles: [],
 trafficRows: [],
 trafficByDay: [],
 dailyMetrics: [],
 monthlyMetrics: [],
 channelSummary: undefined,
 geographyRows: [],
 demographicRows: [],
 contentTypeRows: [],
} as unknown as VtSyncVisualProps

describe("Data Visual modules with no data", () => {
 it("registers modules to render", () => {
  expect(VT_SYNC_VISUAL_MODULE_REGISTRY.length).toBeGreaterThan(0)
 })

 for (const module of VT_SYNC_VISUAL_MODULE_REGISTRY) {
  it(`renders ${module.id} with an empty dataset`, () => {
   const Renderer = module.renderer
   const container = document.createElement("div")
   document.body.appendChild(container)
   const root = createRoot(container)

   expect(() => {
    act(() => {
     root.render(<Renderer {...EMPTY_PROPS} />)
    })
   }).not.toThrow()

   act(() => {
    root.unmount()
   })
   container.remove()
  })
 }
})
