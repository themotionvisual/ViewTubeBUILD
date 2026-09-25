import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS rights editor", () => {
 it("edits license, source, expiry and usage restrictions on the selected asset", () => {
  expect(source).toContain("Rights & License")
  expect(source).toContain("rightsLicense")
  expect(source).toContain("rightsSource")
  expect(source).toContain("rightsExpiry")
  expect(source).toContain("rightsRestrictions")
  expect(source).toContain("updateAssetRights")
 })
})
