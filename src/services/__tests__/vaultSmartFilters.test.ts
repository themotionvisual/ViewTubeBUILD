// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import { createLocalVaultAsset, searchVaultAssets } from "../vaultAdapter"

describe("Vault smart filtering", () => {
 beforeEach(() => localStorage.clear())

 it("supports ANY tag matching without changing the default ALL behavior", () => {
  createLocalVaultAsset({ name: "Map reference", kind: "image", tags: ["map", "research"] })
  createLocalVaultAsset({ name: "Thumbnail draft", kind: "image", tags: ["thumbnail", "draft"] })

  expect(searchVaultAssets({ tags: ["map", "draft"] })).toHaveLength(0)
  expect(searchVaultAssets({ tags: ["map", "draft"], tagMode: "any" })).toHaveLength(2)
 })

 it("filters by asset source and can sort by name", () => {
  createLocalVaultAsset({ name: "Zulu", kind: "image", tags: [] })
  createLocalVaultAsset({ name: "Alpha", kind: "image", tags: [] })

  const matches = searchVaultAssets({ source: "local", sort: "name-asc", limit: 100 })
  expect(matches.map((asset) => asset.name)).toEqual(["Alpha", "Zulu"])
 })
})
