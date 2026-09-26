import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS mobile card density", () => {
 it("keeps detailed card editing controls scoped to the selected asset", () => {
  expect(source).toContain("selectedAssetIds.includes(asset.id)")
  expect(source).toContain("SELECT TO EDIT DETAILS")
 })

 it("keeps workspace configuration off the default scrolling surface", () => {
  expect(source).toContain('aria-label="Open workspace layout settings"')
  expect(source).toContain('role="dialog"')
  expect(source).toContain('aria-modal="true"')
  expect(source).not.toContain('title="Workspace Controls"')
 })
})