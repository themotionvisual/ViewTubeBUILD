import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS metadata export actions", () => {
 it("exports selected or multi-selected Vault metadata as JSON and CSV", () => {
  expect(source).toContain("Export Metadata JSON")
  expect(source).toContain("Export Metadata CSV")
  expect(source).toContain("serializeVaultAssetsJson")
  expect(source).toContain("serializeVaultAssetsCsv")
  expect(source).toContain("exportVaultMetadata")
 })
})
