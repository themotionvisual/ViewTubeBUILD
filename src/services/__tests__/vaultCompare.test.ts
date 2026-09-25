import { describe, expect, it } from "vitest"
import { resolveVaultComparePair } from "../vaultCompare"

describe("resolveVaultComparePair", () => {
 it("returns the two selected assets in selection order", () => {
  const pair = resolveVaultComparePair({
   selectedIds: ["b", "a"],
   assets: [
    { id: "a", name: "A" },
    { id: "b", name: "B" },
    { id: "c", name: "C" },
   ],
  })
  expect(pair?.map((asset) => asset.id)).toEqual(["b", "a"])
 })

 it("returns null unless exactly two selected assets still exist", () => {
  expect(resolveVaultComparePair({
   selectedIds: ["a"],
   assets: [{ id: "a", name: "A" }],
  })).toBeNull()
  expect(resolveVaultComparePair({
   selectedIds: ["a", "missing"],
   assets: [{ id: "a", name: "A" }],
  })).toBeNull()
 })
})
