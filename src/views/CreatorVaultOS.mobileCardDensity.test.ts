import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS mobile card density", () => {
 it("keeps detailed card editing controls scoped to the selected asset", () => {
  expect(source).toContain("selectedAssetIds.includes(asset.id)")
  expect(source).toContain("SELECT TO EDIT DETAILS")
 })

 it("promotes library navigation and search into one compact toolbar", () => {
  expect(source).toContain('aria-label="Vault library toolbar"')
  expect(source).toContain('"aria-label": "Search Vault assets"')
  expect(source).toContain('aria-label="Open library navigation"')
  expect(source).toContain('aria-label="Open Vault filters"')
  expect(source).not.toContain('title="Navigator"')
 })

 it("moves project and collection navigation into a contextual library drawer", () => {
  expect(source).toContain('aria-label="Vault library navigation"')
  expect(source).not.toContain('title="Explorer"')
 })

 it("keeps workspace configuration off the default scrolling surface", () => {
  expect(source).toContain('aria-label="Open workspace layout settings"')
  expect(source).toContain('role="dialog"')
  expect(source).toContain('aria-modal="true"')
  expect(source).not.toContain('title="Workspace Controls"')
 })
})