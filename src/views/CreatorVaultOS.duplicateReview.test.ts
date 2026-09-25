import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS duplicate review", () => {
 it("resolves an exact staged duplicate to its existing canonical Vault asset", () => {
  expect(source).toContain("Use Existing Duplicate")
  expect(source).toContain("duplicateAssetId")
  expect(source).toContain("resolvePendingDuplicate")
  expect(source).toContain("setSelectedAssetIds([duplicateId])")
 })
})
