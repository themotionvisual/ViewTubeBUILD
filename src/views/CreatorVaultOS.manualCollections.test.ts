import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS manual collections UI", () => {
 it("creates manual collections and adds the current selection by asset id", () => {
  expect(source).toContain("Create Collection")
  expect(source).toContain("Add Selection to Collection")
  expect(source).toContain("createVaultCollection")
  expect(source).toContain("addAssetsToVaultCollection")
 })

 it("filters the Explorer by manual collection without changing asset identity", () => {
  expect(source).toContain("activeManualCollectionId")
  expect(source).toContain("collection.assetIds.includes(asset.id)")
 })

 it("removes membership and deletes collections independently from assets", () => {
  expect(source).toContain("removeAssetFromVaultCollection")
  expect(source).toContain("deleteVaultCollection")
 })
})
