// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import {
 createVaultCollection,
 listVaultCollections,
 renameVaultCollection,
} from "../vaultManualCollections"

describe("renameVaultCollection", () => {
 beforeEach(() => localStorage.clear())

 it("renames a collection without changing membership or identity", () => {
  const collection = createVaultCollection("Old Name")
  const renamed = renameVaultCollection(collection.id, "Brand References")
  expect(renamed).toMatchObject({
   id: collection.id,
   name: "Brand References",
   assetIds: [],
  })
 })

 it("rejects blank names and duplicate names case-insensitively", () => {
  const a = createVaultCollection("Brand")
  createVaultCollection("Research")
  expect(renameVaultCollection(a.id, " ")).toBeNull()
  expect(renameVaultCollection(a.id, "research")).toBeNull()
  expect(listVaultCollections().find((item) => item.id === a.id)?.name).toBe("Brand")
 })
})
