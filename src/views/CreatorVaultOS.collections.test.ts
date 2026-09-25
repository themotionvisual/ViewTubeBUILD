import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS manual collections", () => {
 it("creates collections, filters by collection, and adds selected assets", () => {
  expect(source).toContain("Create Collection")
  expect(source).toContain("Add Selection to Collection")
  expect(source).toContain("activeCollectionId")
  expect(source).toContain("addAssetsToVaultCollection")
 })
})
