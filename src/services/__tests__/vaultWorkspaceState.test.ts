// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import {
 DEFAULT_VAULT_WORKSPACE_STATE,
 readVaultWorkspaceState,
 writeVaultWorkspaceState,
} from "../vaultWorkspaceState"

describe("Vault workspace memory", () => {
 beforeEach(() => localStorage.clear())

 it("falls back safely when no workspace state exists", () => {
  expect(readVaultWorkspaceState()).toEqual(DEFAULT_VAULT_WORKSPACE_STATE)
 })

 it("persists creator workspace preferences without storing asset data", () => {
  writeVaultWorkspaceState({
   ...DEFAULT_VAULT_WORKSPACE_STATE,
   query: "Austerlitz",
   selectedTag: "Map",
   filterKind: "image",
   viewMode: "list",
  })

  expect(readVaultWorkspaceState()).toMatchObject({
   query: "Austerlitz",
   selectedTag: "Map",
   filterKind: "image",
   viewMode: "list",
  })
 })
})

 it("migrates legacy full-page navigation and operations modules out of the compact workspace", () => {
  localStorage.setItem("vt_creator_vault_workspace_v1", JSON.stringify({
   ...DEFAULT_VAULT_WORKSPACE_STATE,
   query: "Napoleon",
   viewMode: "masonry",
   density: "compact",
   visibleModules: [
    "navigator",
    "explorer",
    "asset-operations",
    "import-tags",
    "text-editor",
    "asset-library",
    "task-center",
    "inspector",
   ],
   moduleOrder: [
    "navigator",
    "explorer",
    "asset-operations",
    "asset-library",
    "import-tags",
    "text-editor",
    "task-center",
    "inspector",
   ],
  }))

  const migrated = readVaultWorkspaceState()

  expect(migrated.query).toBe("Napoleon")
  expect(migrated.viewMode).toBe("masonry")
  expect(migrated.density).toBe("compact")
  expect(migrated.visibleModules).not.toContain("navigator")
  expect(migrated.visibleModules).not.toContain("explorer")
  expect(migrated.visibleModules).not.toContain("asset-operations")
  expect(migrated.moduleOrder).not.toContain("navigator")
  expect(migrated.moduleOrder).not.toContain("explorer")
  expect(migrated.moduleOrder).not.toContain("asset-operations")
  expect(migrated.visibleModules).toEqual(expect.arrayContaining([
   "import-tags",
   "text-editor",
   "asset-library",
   "task-center",
   "inspector",
  ]))
 })
