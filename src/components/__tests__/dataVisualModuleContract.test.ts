import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import {
 DATA_VISUAL_MARK_FLOORS,
 DATA_VISUAL_MODULE_CONTRACTS,
 DEFAULT_LANDSCAPE_ASPECT,
 dataVisualLandscapeAspect,
 DEFAULT_DATA_VISUAL_MARK_SCALE,
 dataVisualDefaultSelection,
 dataVisualDensityBudget,
 dataVisualMarkInteraction,
 dataVisualMarkScale,
 dataVisualModuleContract,
 dataVisualPanelBudget,
 dataVisualSeriesBudget,
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
  // Rows, not columns: the tile edge follows the canvas height and the tile
  // floor, so how many columns fit is an outcome rather than a registered cap.
  expect(dataVisualDefaultSelection("heat-matrix", "desktop")).toBe(8)
  expect(dataVisualDefaultSelection("heat-matrix", "landscape")).toBe(5)
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

 it("shows one radial panel at a time on any phone", () => {
  // Both phone canvases leave a two-panel split too narrow for a legend rail
  // to carry a source name; the second panel moves behind a switch instead.
  expect(dataVisualPanelBudget("clock-radial-burst", "portrait")).toBe(1)
  expect(dataVisualPanelBudget("clock-radial-burst", "landscape")).toBe(1)
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

describe("landscape aspect policy", () => {
 it("fills the box by default rather than holding a ratio", () => {
  // A landscape phone is wide and short. Holding 16:9 there makes height the
  // binding constraint and leaves a third of the module width unused.
  expect(DEFAULT_LANDSCAPE_ASPECT).toBe("fill")
  for (const id of Object.keys(DATA_VISUAL_MODULE_CONTRACTS) as Array<keyof typeof DATA_VISUAL_MODULE_CONTRACTS>) {
   expect(dataVisualLandscapeAspect(id), `${id}`).toBe("fill")
  }
 })

 it("still holds the registered aspect for portrait and desktop", () => {
  for (const id of Object.keys(DATA_VISUAL_MODULE_CONTRACTS) as Array<keyof typeof DATA_VISUAL_MODULE_CONTRACTS>) {
   expect(dataVisualModuleContract(id).canvasAspect).toBe("16:9")
  }
 })
})

describe("channel progress composition", () => {
 it("thins panels and overlaid series before it thins the canvas", () => {
  // A landscape phone can carry two stacked bands; a portrait phone shows one
  // plot at a time and switches with the metric control instead of shrinking
  // four plots into a strip each.
  expect(dataVisualPanelBudget("channel-progress", "desktop")).toBe(4)
  expect(dataVisualPanelBudget("channel-progress", "landscape")).toBe(2)
  expect(dataVisualPanelBudget("channel-progress", "portrait")).toBe(1)

  // Every extra overlaid metric divides the bar width, so the overlay is
  // capped before the bars stop being readable.
  expect(dataVisualSeriesBudget("channel-progress", "desktop")).toBe(5)
  expect(dataVisualSeriesBudget("channel-progress", "landscape")).toBe(3)
  expect(dataVisualSeriesBudget("channel-progress", "portrait")).toBe(2)
 })

 it("reads hover off the plot, so the touch floor does not apply", () => {
  // At five metrics a 24px touch minimum would make the PHONE bar wider than
  // the desktop bar it is meant to be a reduction of.
  expect(dataVisualMarkInteraction("channel-progress")).toBe("field")
 })

 it("carries no height of its own once the canvas owns geometry", () => {
  const source = readFileSync(
   join(process.cwd(), "src/components/GraphsPageCharts.tsx"),
   "utf8",
  )
  const module = source.slice(
   source.indexOf("export const ComboChannelProgress"),
   source.indexOf("type TrafficTimelinePoint"),
  )
  expect(module).toContain('<DataVisualCanvas id="channel-progress">')
  for (const legacyHeight of ["min-h-[400px]", "h-[400px]", "h-[420px]", 'minHeightClassName="min-h-[360px]"']) {
   expect(module, `channel progress still sets ${legacyHeight}`).not.toContain(legacyHeight)
  }
  // Keys belong to the module's bottom section, not to the evidence canvas.
  expect(module).toContain("data-vt-data-visual-guides")
 })
})
