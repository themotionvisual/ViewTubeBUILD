import { describe, expect, it } from "vitest"
import { DATA_VISUAL_MODULE_CONTRACTS, dataVisualModuleContract } from "../dataVisualModuleContract"

describe("Data Visual module canvas contracts", () => {
 it("registers the priority module migrations", () => {
  expect(Object.keys(DATA_VISUAL_MODULE_CONTRACTS)).toEqual(expect.arrayContaining([
   "shorts-retention",
   "publish-optimal-clock",
   "heat-matrix",
   "traffic-source-evolution",
   "engagement-pulse",
   "content-treemap",
  ]))
 })

 it("uses a wide outer canvas with a square internal plot for Publish Optimal Clock", () => {
  expect(dataVisualModuleContract("publish-optimal-clock")).toMatchObject({
   family: "radial",
   canvasAspect: "16:9",
   plotAspect: "1:1",
   overflow: "clip",
  })
 })

 it("keeps dense spatial modules bounded to the canvas", () => {
  for (const id of ["heat-matrix", "content-treemap"] as const) {
   expect(dataVisualModuleContract(id)).toMatchObject({
    family: "spatial",
    canvasAspect: "16:9",
    density: "dense",
    overflow: "clip",
   })
  }
 })
})
