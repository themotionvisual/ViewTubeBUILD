import { describe, expect, it } from "vitest"
import { extractDominantPaletteFromRgba } from "../vaultImagePalette"

describe("extractDominantPaletteFromRgba", () => {
 it("returns dominant colors from sampled pixels", () => {
  const data = new Uint8ClampedArray([
   255, 0, 0, 255,
   255, 0, 0, 255,
   0, 0, 255, 255,
   0, 0, 255, 255,
   0, 255, 0, 255,
  ])
  expect(extractDominantPaletteFromRgba(data, 3)).toEqual([
   "#ff0000",
   "#0000ff",
   "#00ff00",
  ])
 })

 it("ignores fully transparent pixels", () => {
  const data = new Uint8ClampedArray([
   255, 255, 255, 0,
   12, 34, 56, 255,
  ])
  expect(extractDominantPaletteFromRgba(data, 3)).toEqual(["#0c2238"])
 })
})
