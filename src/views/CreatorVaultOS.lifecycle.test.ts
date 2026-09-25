import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS lifecycle controls", () => {
 it("exposes lifecycle and explicit protection controls for selected assets", () => {
  expect(source).toContain("Asset lifecycle")
  expect(source).toContain("GOLDEN")
  expect(source).toContain("Unlock Protected Asset")
  expect(source).toContain("setVaultAssetLifecycle")
  expect(source).toContain("setVaultAssetProtection")
 })
})
