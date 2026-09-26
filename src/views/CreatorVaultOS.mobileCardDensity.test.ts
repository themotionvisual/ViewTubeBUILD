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

 it("shows selection operations contextually instead of as a permanent Asset Operations toolbox", () => {
  expect(source).toContain('aria-label="Vault selection actions"')
  expect(source).toContain('selectedAssetIds.length ? (')
  expect(source).toContain('Send to ViewTube')
  expect(source).not.toContain('title="Asset Operations"')
 })

 it("keeps Task Center compact when idle and makes Inspector selection-contextual", () => {
  expect(source).toContain('const activeVaultTasks = tasks.filter')
  expect(source).toContain('activeVaultTasks.length || failedVaultTasks.length')
  expect(source).toContain('selectedAsset ? (')
  expect(source).toContain('title="Inspector"')
  expect(source).not.toContain('duration || 60')
 })

 it("keeps Notes editing in the contextual Inspector rather than permanent asset-card chrome", () => {
  expect(source).toContain('aria-label="Asset notes"')
  expect(source).toContain('onBlur={(event) => updateAssetNotes(selectedAsset, event.target.value)}')
  expect(source).not.toContain('onNotesChange={(nextNotes) => updateAssetNotes(asset, nextNotes)}')
 })

 it("renders Inspector only when an asset is selected", () => {
  expect(source).toContain('{selectedAsset ? (\n       <div ref={inspectorRef}')
  expect(source).not.toContain('message="Select an asset to inspect metadata, provenance, rights, versions, and relationships."')
 })

 it("marks the library as the first-viewport content target on mobile", () => {
  expect(source).toContain('data-vault-first-viewport="library"')
  expect(source).toContain('min-w-0 overflow-x-hidden')
 })

 it("keeps workspace configuration off the default scrolling surface", () => {
  expect(source).toContain('aria-label="Open workspace layout settings"')
  expect(source).toContain('role="dialog"')
  expect(source).toContain('aria-modal="true"')
  expect(source).not.toContain('title="Workspace Controls"')
 })
})