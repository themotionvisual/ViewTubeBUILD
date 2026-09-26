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
  expect(source).toContain('ariaLabel="Vault media type"')
  expect(source).toContain('label="View"')
  expect(source).toContain('onChange={(value) => setViewMode(value as VaultWorkspaceViewMode)}')
  expect(source).not.toContain('title="Navigator"')
 })

 it("filters by canonical Spectrum Tags inside the contextual Filters sheet without duplicating tag management", () => {
  expect(source).toContain('aria-label="Vault tag filter"')
  expect(source).toContain("availableTags.map((tag) =>")
  expect(source).toContain("setSelectedTag((current) => current === tag ? null : tag)")
  expect(source).not.toContain('aria-label="Create tag from Vault filters"')
 })

 it("keeps advanced metadata filters available inside the contextual filter surface", () => {
  for (const label of [
   'Vault MIME type filter',
   'Vault updated from filter',
   'Vault updated to filter',
   'Vault minimum width filter',
   'Vault minimum height filter',
   'Vault minimum duration filter',
   'Vault maximum duration filter',
   'Vault minimum size filter',
   'Vault maximum size filter',
  ]) expect(source).toContain(`aria-label="${label}"`)
 })

 it("uses a three-cell search row plus a wrapped secondary toolbar for phone widths", () => {
  expect(source).toContain('grid-cols-[auto_minmax(0,1fr)_auto]')
  expect(source).toContain('data-vault-toolbar-secondary')
  expect(source).toContain('label="State"')
  expect(source).not.toContain('ariaLabel="Vault library state"')
 })

 it("provides an explicit compact search clear action without a second search owner", () => {
  expect(source).toContain('aria-label="Clear Vault search"')
  expect(source).toContain('onClick={() => setQuery("")}')
 })

 it("keeps the mobile Inspector closed until explicitly opened and provides a close action", () => {
  expect(source).toContain("const [mobileInspectorOpen, setMobileInspectorOpen] = useState(false)")
  expect(source).toContain('label="Close Inspector"')
  expect(source).toContain('setMobileInspectorOpen(true)')
  expect(source).toContain('setMobileInspectorOpen(false)')
  expect(source).toContain('mobileInspectorOpen ? "fixed inset-x-2 bottom-16')
  expect(source).toContain('"hidden"} xl:static xl:block')
 })

 it("uses contextual mobile sheets for selection actions and Inspector", () => {
  expect(source).toContain('data-vault-mobile-sheet="selection-actions"')
  expect(source).toContain('data-vault-mobile-sheet="inspector"')
  expect(source).toContain('fixed inset-x-2 bottom-2')
  expect(source).toContain('xl:static')
 })

 it("shows removable applied-filter chips only when contextual filters are active", () => {
  expect(source).toContain('aria-label="Vault active filters"')
  expect(source).toContain('onClick={() => setSelectedTag(null)}')
  expect(source).toContain('onClick={() => setSource("all")}')
  expect(source).toContain('onClick={() => setFilterLifecycle("all")}')
  expect(source).toContain('onClick={() => setFilterOrientation("all")}')
 })

 it("renders navigation and advanced filters as contextual phone sheets instead of inline mobile chrome", () => {
  expect(source).toContain('data-vault-mobile-sheet="library-navigation"')
  expect(source).toContain('data-vault-mobile-sheet="filters"')
  expect(source).toContain('setLibraryFiltersOpen(false)')
  expect(source).toContain('setLibraryNavigationOpen(false)')
 })

 it("moves project and collection navigation into a contextual library drawer", () => {
  expect(source).toContain('aria-label="Vault library navigation"')
  expect(source).not.toContain('title="Explorer"')
 })

 it("preserves lifecycle batch operations inside the contextual selection workflow", () => {
  for (const label of ["Toggle Favorite", "Archive Selection", "Trash Selection", "Restore Selection"]) {
   expect(source).toContain(`label="${label}"`)
  }
  expect(source).toContain("setVaultAssetState(assetId")
 })

 it("preserves collection management inside Group Builder", () => {
  expect(source).toContain('aria-label="Target Vault collection"')
  for (const label of [
   "Add Selection to Collection",
   "Set Target Collection as Brand Kit",
   "Remove Selected Asset From Active Collection",
   "Rename Active Collection",
   "Delete Active Collection",
  ]) expect(source).toContain(`label="${label}"`)
 })

 it("keeps selected-asset utility actions contextual", () => {
  for (const label of ["Open Quick Look", "Open Filmstrip", "Open Lineage", "Copy Asset ID", "Open Inspector"]) {
   expect(source).toContain(`label="${label}"`)
  }
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

 it("renders the asset library before secondary Import & Tags and Text Editor tools", () => {
  const libraryIndex = source.indexOf('data-vault-first-viewport="library"')
  const importIndex = source.indexOf('title="Import & Tags"')
  const textEditorIndex = source.indexOf('title="Text Editor"')
  const workspaceNotesIndex = source.indexOf('title="Workspace Notes"')

  expect(libraryIndex).toBeGreaterThan(-1)
  expect(importIndex).toBeGreaterThan(libraryIndex)
  expect(textEditorIndex).toBeGreaterThan(libraryIndex)
  expect(workspaceNotesIndex).toBeGreaterThan(libraryIndex)
  expect(source).toContain('persistenceId="vault-import-tags"')
  expect(source).toContain('persistenceId="vault-text-editor"')
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