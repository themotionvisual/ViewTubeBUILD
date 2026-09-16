// @vitest-environment jsdom

/**
 * The controller each registered visual actually renders.
 *
 * Phase 0 of `docs/migration/data-visual-controller-unification-plan.md`: the
 * plan changes row order, row count, width and density, and those four things
 * are decided in several places at once — partly by the module, partly by
 * whichever shell it was rendered through. `AnalyticsVisualShell` in particular
 * reorders every dropdown to the end, injects a `statement` row and truncates
 * to four, while a module rendering `SubToolboxChartModule` directly gets none
 * of that. Nothing recorded which modules were affected.
 *
 * This records it. Every later phase must leave this snapshot alone except
 * where the phase says otherwise, and then the diff is the review.
 */

import { describe, expect, it } from "vitest"
import React from "react"
import { createRoot } from "react-dom/client"
import { act } from "react-dom/test-utils"

import { VT_SYNC_VISUAL_MODULE_REGISTRY } from "./VtSyncDataVisualsToolbox"
import { buildDataVisualAuditProps } from "../../../views/bench/dataVisualAuditFixture"

/*
 * jsdom implements no Web Animations API, and several renderers drive their
 * intro with `element.animate()`. The animation is not what this test is
 * about, so it is stubbed with an object carrying the handful of members the
 * renderers touch — `finished`, `cancel` — rather than the modules being made
 * to care whether they are in a browser.
 */
if (typeof Element !== "undefined" && !Element.prototype.animate) {
 Element.prototype.animate = (() => ({
  finished: Promise.resolve(),
  cancel: () => undefined,
  play: () => undefined,
  pause: () => undefined,
  reverse: () => undefined,
  finish: () => undefined,
  addEventListener: () => undefined,
  removeEventListener: () => undefined,
 })) as unknown as Element["animate"]
}

/*
 * jsdom has no ResizeObserver either. Renderers that size themselves against a
 * measured box observe one; a stub that never fires leaves them at their
 * pre-measurement state, which is the state whose controller this test reads.
 */
if (typeof globalThis.ResizeObserver === "undefined") {
 globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
 } as unknown as typeof ResizeObserver
}

type ControllerShape = {
 rows: string
 width: string
 density: string
}

const shapeOf = (container: HTMLElement): ControllerShape[] =>
 Array.from(container.querySelectorAll("[data-controller-root]")).map((node) => ({
  rows: node.getAttribute("data-vt-controller-rows") ?? "",
  width: node.getAttribute("data-vt-controller-width") ?? "",
  density: node.getAttribute("data-vt-controller-density") ?? "",
 }))

const renderShape = (Renderer: React.ComponentType<Record<string, unknown>>): ControllerShape[] => {
 const container = document.createElement("div")
 document.body.appendChild(container)
 const root = createRoot(container)
 act(() => {
  root.render(<Renderer {...(buildDataVisualAuditProps() as Record<string, unknown>)} />)
 })
 const shape = shapeOf(container)
 act(() => { root.unmount() })
 container.remove()
 return shape
}

describe("Data Visual controller shape", () => {
 const shapes: Record<string, ControllerShape[]> = {}
 for (const module of VT_SYNC_VISUAL_MODULE_REGISTRY) {
  shapes[module.id] = renderShape(module.renderer as unknown as React.ComponentType<Record<string, unknown>>)
 }

 it("renders a controller for the modules that declare one", () => {
  const withController = Object.entries(shapes).filter(([, shape]) => shape.length > 0)
  expect(withController.length).toBeGreaterThan(0)
 })

 it("matches the recorded shape for every registered visual", () => {
  expect(shapes).toMatchSnapshot()
 })

 it("shows the four-row cap is latent rather than active", () => {
  // `AnalyticsVisualShell.normalizedRows` only injects a `statement` row and
  // truncates to four when a `controllerExplanation` is present; with none it
  // returns early and does neither. No registered visual supplies one today,
  // so no controller carries a statement row and two visuals already render
  // five. Phase 4 can therefore drop the truncation without changing what any
  // creator currently sees — and if that stops being true, this fails first.
  const allRows = Object.values(shapes).flat()
  expect(allRows.filter((shape) => shape.rows.includes("statement"))).toEqual([])
  expect(Math.max(...allRows.map((shape) => shape.rows.split(",").length))).toBe(5)
 })

 it("records which visuals have their authored row order rewritten", () => {
  // These six author their dropdowns FIRST and the shell moves them last.
  // Phase 4 hands ordering back to the module, so this is the exact set whose
  // controller changes — and the set that has to be re-authored with it.
  const REORDERED_BY_THE_SHELL = {
   "tube-explorer-revenue-efficiency-map": "text,number,dropdown,dropdown,dropdown",
   "tube-explorer-bubble-universe": "text,number,dropdown,dropdown,dropdown",
   "tube-explorer-like-rate-waveform": "text,text,number,dropdown",
   "tube-explorer-seasonality-radar": "text,label,dropdown",
   "tube-explorer-retention-curve-atlas": "text,number,dropdown",
   "tube-explorer-publish-optimal-clock": "label,dropdown,dropdown",
  }
  for (const [id, rows] of Object.entries(REORDERED_BY_THE_SHELL)) {
   expect(shapes[id]?.[0]?.rows, id).toBe(rows)
  }
 })

 it("records the width and density authorities the plan collapses", () => {
  const widths = new Set(Object.values(shapes).flat().map((shape) => shape.width))
  const densities = new Set(Object.values(shapes).flat().map((shape) => shape.density))
  // Width is not the four call-site values the plan counted statically: the
  // controller takes `max(declared, widest row estimate)`, so the CONTENT is
  // the dominant authority and the column is a different size in almost every
  // module. Phase 2 replaces this with the registered layout's width.
  expect(widths.size).toBeGreaterThan(10)
  // Density is decided by which shell a module came through — Tube Explorer
  // modules are compact because `ModuleFrame` hardcodes it — never by the
  // module itself.
  expect([...densities].sort()).toEqual(["compact", "normal"])
 })
})
