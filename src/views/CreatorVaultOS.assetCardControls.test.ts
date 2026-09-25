import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS asset card organization controls", () => {
 it("allows canonical project assignment from each asset card", () => {
  expect(source).toContain("assignAssetToProject")
  expect(source).toContain("Asset project assignment")
 })

 it("exposes per-card favorite and archive actions", () => {
  expect(source).toContain("Toggle asset favorite")
  expect(source).toContain("Archive asset")
 })
})
