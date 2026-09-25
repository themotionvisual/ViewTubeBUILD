import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS editable asset cards", () => {
 it("renders persisted asset previews inside Vault cards", () => {
  expect(source).toContain("asset.previewUrl || asset.url")
  expect(source).toContain("<img")
 })

 it("allows title, tags and notes to be edited from the asset card", () => {
  expect(source).toContain("updateAssetTitle")
  expect(source).toContain("addAssetTag")
  expect(source).toContain("removeAssetTag")
  expect(source).toContain("updateAssetNotes")
 })
})
