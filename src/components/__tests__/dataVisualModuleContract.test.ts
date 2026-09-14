import { describe, expect, it } from "vitest"
import {
 DATA_VISUAL_MODULE_CONTRACTS,
 dataVisualDensityBudget,
 dataVisualModuleContract,
 isRegisteredDataVisualModuleId,
 type DataVisualViewportBucket,
} from "../dataVisualModuleContract"

const BUCKETS: DataVisualViewportBucket[] = ["desktop", "landscape", "portrait"]

describe("Data Visual module canvas contracts", () => {
 it("registers the priority module migrations", () => {
  expect(Object.keys(DATA_VISUAL_MODULE_CONTRACTS)).toEqual(expect.arrayContaining([
   "shorts-retention", "publish-optimal-clock", "heat-matrix", "traffic-source-evolution", "engagement-pulse", "content-treemap",
  ]))
 })

 it("uses a wide outer canvas with a square internal plot for the radial reference", () => {
  expect(dataVisualModuleContract("clock-radial-burst")).toMatchObject({ family: "radial", canvasAspect: "16:9", plotAspect: "1:1", overflow: "clip" })
 })

 it("leaves the publish clock's internal plot natural because it renders a 24x7 grid", () => {
  // The production renderer is a day x hour grid, not a dial. Forcing a 1:1
  // internal plot onto it would squash the grid rather than centre a clock.
  expect(dataVisualModuleContract("publish-optimal-clock")).toMatchObject({ family: "spatial", canvasAspect: "16:9", plotAspect: "natural" })
 })

 it("keeps dense spatial modules bounded to the canvas", () => {
  for (const id of ["heat-matrix", "content-treemap", "publish-optimal-clock"] as const) {
   expect(dataVisualModuleContract(id)).toMatchObject({ family: "spatial", canvasAspect: "16:9", density: "dense", overflow: "clip" })
  }
 })

 it("guards source-native module ids without title matching", () => {
  expect(isRegisteredDataVisualModuleId("shorts-retention")).toBe(true)
  expect(isRegisteredDataVisualModuleId("unregistered-legacy-visual")).toBe(false)
 })

 it("never asks a phone to draw more simultaneous marks than a desktop", () => {
  for (const id of Object.keys(DATA_VISUAL_MODULE_CONTRACTS) as Array<keyof typeof DATA_VISUAL_MODULE_CONTRACTS>) {
   const profile = dataVisualModuleContract(id).densityProfile
   expect(profile, `${id} must declare a density profile`).toBeDefined()
   if (!profile) continue
   expect(profile.portrait).toBeLessThanOrEqual(profile.landscape)
   expect(profile.landscape).toBeLessThanOrEqual(profile.desktop)
   for (const bucket of BUCKETS) expect(dataVisualDensityBudget(id, bucket)).toBeGreaterThan(0)
  }
 })

 it("reduces the dense heat matrix to the documented per-orientation column budgets", () => {
  expect(dataVisualDensityBudget("heat-matrix", "desktop")).toBe(18)
  expect(dataVisualDensityBudget("heat-matrix", "landscape")).toBe(14)
  expect(dataVisualDensityBudget("heat-matrix", "portrait")).toBe(8)
 })
})
