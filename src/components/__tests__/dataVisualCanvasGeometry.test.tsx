// @vitest-environment jsdom

import React from "react"
import { createRoot } from "react-dom/client"
import { act } from "react-dom/test-utils"
import { afterEach, describe, expect, it, vi } from "vitest"
import {
 DATA_VISUAL_LANDSCAPE_QUERY,
 DATA_VISUAL_PORTRAIT_QUERY,
 useDataVisualDensityBudget,
} from "../dataVisualCanvasGeometry"

/** Minimal matchMedia stand-in: jsdom ships none. */
const stubMatchMedia = (matching: string[]) => {
 const listeners = new Set<() => void>()
 window.matchMedia = ((query: string) => ({
  matches: matching.includes(query),
  media: query,
  addEventListener: (_: string, handler: () => void) => listeners.add(handler),
  removeEventListener: (_: string, handler: () => void) => listeners.delete(handler),
 })) as unknown as typeof window.matchMedia
 return listeners
}

const renderBudget = (): { bucket: string; budget: number } => {
 const captured = { bucket: "", budget: 0 }
 const Probe: React.FC = () => {
  const resolved = useDataVisualDensityBudget("traffic-source-evolution", 99)
  React.useEffect(() => {
   captured.bucket = resolved.bucket
   captured.budget = resolved.budget
  }, [resolved.bucket, resolved.budget])
  return null
 }
 const container = document.createElement("div")
 document.body.appendChild(container)
 const root = createRoot(container)
 act(() => { root.render(<Probe />) })
 act(() => { root.unmount() })
 container.remove()
 return captured
}

afterEach(() => { vi.unstubAllGlobals() })

describe("useDataVisualDensityBudget", () => {
 it("falls back when a module registers no density profile", () => {
  // Heat Matrix deliberately registers none: its column count is an outcome of
  // tile scale and the tile floor, not a cap.
  stubMatchMedia([])
  let captured = 0
  const Probe: React.FC = () => {
   const { budget } = useDataVisualDensityBudget("heat-matrix", 99)
   React.useEffect(() => { captured = budget }, [budget])
   return null
  }
  const container = document.createElement("div")
  document.body.appendChild(container)
  const root = createRoot(container)
  act(() => { root.render(<Probe />) })
  act(() => { root.unmount() })
  container.remove()
  expect(captured).toBe(99)
 })

 it("uses the desktop budget when neither phone query matches", () => {
  stubMatchMedia([])
  expect(renderBudget()).toEqual({ bucket: "desktop", budget: 8 })
 })

 it("uses the portrait budget on a portrait phone", () => {
  stubMatchMedia([DATA_VISUAL_PORTRAIT_QUERY])
  expect(renderBudget()).toEqual({ bucket: "portrait", budget: 4 })
 })

 it("uses the landscape budget on a short landscape phone", () => {
  stubMatchMedia([DATA_VISUAL_LANDSCAPE_QUERY])
  expect(renderBudget()).toEqual({ bucket: "landscape", budget: 6 })
 })

 it("prefers the landscape composition when a device reports both", () => {
  // Some browsers briefly report both during an orientation change; landscape
  // is the tighter constraint, so it wins rather than the layout flickering.
  stubMatchMedia([DATA_VISUAL_PORTRAIT_QUERY, DATA_VISUAL_LANDSCAPE_QUERY])
  expect(renderBudget().bucket).toBe("landscape")
 })
})
