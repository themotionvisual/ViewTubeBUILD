// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import {
 addAssetsToVaultCollection,
 createVaultCollection,
 listVaultCollections,
 removeAssetFromVaultCollection,
} from "../vaultManualCollections"

describe("Vault manual collections", () => {
 beforeEach(() => localStorage.clear())

 it("creates a named collection and adds canonical asset IDs without copies", () => {
  const collection = createVaultCollection("Campaign A")
  const updated = addAssetsToVaultCollection(collection.id, ["asset-1", "asset-2", "asset-1"])

  expect(updated?.assetIds).toEqual(["asset-1", "asset-2"])
  expect(listVaultCollections()[0].name).toBe("Campaign A")
 })

 it("removes one asset from a collection without deleting the asset", () => {
  const collection = createVaultCollection("Refs")
  addAssetsToVaultCollection(collection.id, ["a", "b"])
  const updated = removeAssetFromVaultCollection(collection.id, "a")

  expect(updated?.assetIds).toEqual(["b"])
 })
})
