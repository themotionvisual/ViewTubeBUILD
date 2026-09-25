// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import { createLocalVaultAsset } from "../vaultAdapter"
import {
 hammingDistanceHex,
 findVaultSimilarAssets,
} from "../vaultImageSimilarity"

describe("Vault image similarity", () => {
 beforeEach(() => localStorage.clear())

 it("measures perceptual hash distance deterministically", () => {
  expect(hammingDistanceHex("0000", "0000")).toBe(0)
  expect(hammingDistanceHex("0000", "000f")).toBe(4)
 })

 it("finds only image assets within the requested perceptual distance", () => {
  const source = createLocalVaultAsset({
   name: "Source",
   kind: "image",
   tags: [],
   metadata: { perceptualHash: "0000000000000000" },
  })
  createLocalVaultAsset({
   name: "Near",
   kind: "image",
   tags: [],
   metadata: { perceptualHash: "000000000000000f" },
  })
  createLocalVaultAsset({
   name: "Far",
   kind: "image",
   tags: [],
   metadata: { perceptualHash: "ffffffffffffffff" },
  })

  expect(findVaultSimilarAssets(source, 6).map((asset) => asset.name)).toEqual(["Near"])
 })
})
