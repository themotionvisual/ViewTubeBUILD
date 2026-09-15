import { describe, expect, it } from "vitest"
import {
 DATA_VISUAL_MARK_FLOORS,
 DATA_VISUAL_MODULE_CONTRACTS,
 DEFAULT_DATA_VISUAL_MARK_SCALE,
 dataVisualDefaultSelection,
 dataVisualDensityBudget,
 dataVisualMarkScale,
 dataVisualModuleContract,
 dataVisualPanelBudget,
 isRegisteredDataVisualModuleId,
 scaleMark,
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
   if (!profile) continue
   expect(profile.portrait).toBeLessThanOrEqual(profile.landscape)
   expect(profile.landscape).toBeLessThanOrEqual(profile.desktop)
   for (const bucket of BUCKETS) expect(dataVisualDensityBudget(id, bucket)).toBeGreaterThan(0)
  }
 })

 it("gives the heat matrix a shallower grid on a phone", () => {
  // Rows, not columns: the tile edge follows mark scale and the tile floor, so
  // how many columns fit is an outcome rather than a registered cap.
  expect(dataVisualDefaultSelection("heat-matrix", "desktop")).toBe(8)
  expect(dataVisualDefaultSelection("heat-matrix", "landscape")).toBe(6)
  expect(dataVisualDefaultSelection("heat-matrix", "portrait")).toBe(4)
  expect(dataVisualModuleContract("heat-matrix").densityProfile).toBeUndefined()
 })
})

describe("mark scale, floors and budgets", () => {
 it("halves marks in portrait and keeps desktop untouched", () => {
  expect(DEFAULT_DATA_VISUAL_MARK_SCALE.desktop).toBe(1)
  expect(DEFAULT_DATA_VISUAL_MARK_SCALE.portrait).toBe(0.5)
  expect(DEFAULT_DATA_VISUAL_MARK_SCALE.landscape).toBeGreaterThan(DEFAULT_DATA_VISUAL_MARK_SCALE.portrait)
  expect(DEFAULT_DATA_VISUAL_MARK_SCALE.landscape).toBeLessThan(DEFAULT_DATA_VISUAL_MARK_SCALE.desktop)
 })

 it("falls back to the shared scale for modules that register none", () => {
  expect(dataVisualMarkScale("content-treemap", "portrait")).toBe(0.5)
  expect(dataVisualMarkScale("content-treemap", "desktop")).toBe(1)
 })

 it("never scales a mark below its floor", () => {
  // A 3px bubble radius halved would be 1.5px — the floor holds it at 2.
  expect(scaleMark(3, 0.5, "bubbleRadius")).toBe(DATA_VISUAL_MARK_FLOORS.bubbleRadius)
  expect(scaleMark(2, 0.5, "strokeWidth")).toBe(DATA_VISUAL_MARK_FLOORS.strokeWidth)
  expect(scaleMark(9, 0.5, "fontSize")).toBe(DATA_VISUAL_MARK_FLOORS.fontSize)
  // Above the floor, the multiplier applies untouched.
  expect(scaleMark(32, 0.5, "bubbleRadius")).toBe(16)
  expect(scaleMark(36, 0.6, "bubbleRadius")).toBeCloseTo(21.6)
 })

 it("accepts an explicit floor for dimensions without a named one", () => {
  expect(scaleMark(46, 0.5, 8)).toBe(23)
  expect(scaleMark(10, 0.5, 8)).toBe(8)
 })

 it("leaves absent or zero-size marks alone", () => {
  expect(scaleMark(0, 0.5, "strokeWidth")).toBe(0)
  expect(scaleMark(Number.NaN, 0.5, "strokeWidth")).toBeNaN()
 })

 it("opens the named modules on a readable default selection", () => {
  expect(dataVisualDefaultSelection("engagement-pulse", "portrait")).toBe(10)
  expect(dataVisualDefaultSelection("engagement-pulse", "desktop")).toBe(25)
  expect(dataVisualDefaultSelection("shorts-retention", "portrait")).toBe(25)
  expect(dataVisualDefaultSelection("heat-matrix", "portrait")).toBe(4)
  expect(dataVisualDefaultSelection("heat-matrix", "desktop")).toBe(8)
 })

 it("shows one radial panel at a time on a portrait phone", () => {
  expect(dataVisualPanelBudget("clock-radial-burst", "portrait")).toBe(1)
  expect(dataVisualPanelBudget("clock-radial-burst", "landscape")).toBe(2)
  expect(dataVisualPanelBudget("clock-radial-burst", "desktop")).toBe(2)
 })

 it("never asks a phone for more of anything than a desktop", () => {
  for (const id of Object.keys(DATA_VISUAL_MODULE_CONTRACTS) as Array<keyof typeof DATA_VISUAL_MODULE_CONTRACTS>) {
   const contract = dataVisualModuleContract(id)
   for (const profile of [contract.densityProfile, contract.defaultSelection, contract.panelBudget, contract.seriesBudget, contract.markScale]) {
    if (!profile) continue
    expect(profile.portrait, `${id} portrait`).toBeLessThanOrEqual(profile.landscape)
    expect(profile.landscape, `${id} landscape`).toBeLessThanOrEqual(profile.desktop)
   }
  }
 })
})

describe("the contract cannot contradict itself", () => {
 it("never opens a module on more marks than its density cap allows", () => {
  // A module that opens at 10 but caps at 6 would show "10" on its control and
  // plot 6 — two knobs disagreeing in front of the reader.
  for (const id of Object.keys(DATA_VISUAL_MODULE_CONTRACTS) as Array<keyof typeof DATA_VISUAL_MODULE_CONTRACTS>) {
   const { densityProfile, defaultSelection } = dataVisualModuleContract(id)
   if (!densityProfile || !defaultSelection) continue
   for (const bucket of BUCKETS) {
    expect(defaultSelection[bucket], `${id} ${bucket}`).toBeLessThanOrEqual(densityProfile[bucket])
   }
  }
 })
})
