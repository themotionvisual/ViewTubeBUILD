// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import {
 DEFAULT_VAULT_MODULE_ORDER,
 DEFAULT_VAULT_WORKSPACE_STATE,
 readVaultWorkspaceState,
 writeVaultWorkspaceState,
} from "../vaultWorkspaceState"

describe("Vault corrected tool ownership", () => {
 beforeEach(() => localStorage.clear())

 it("uses separate Asset Operations, Import & Tags, and Text Editor modules", () => {
  expect(DEFAULT_VAULT_MODULE_ORDER).toContain("asset-operations")
  expect(DEFAULT_VAULT_MODULE_ORDER).toContain("import-tags")
  expect(DEFAULT_VAULT_MODULE_ORDER).toContain("text-editor")
  expect(DEFAULT_VAULT_MODULE_ORDER).not.toContain("spectrum-tags")
  expect(DEFAULT_VAULT_MODULE_ORDER).not.toContain("import-station")
  expect(DEFAULT_VAULT_MODULE_ORDER).not.toContain("batch-processor")
 })

 it("persists Asset Operations and Import & Tags internal modes independently", () => {
  writeVaultWorkspaceState({
   ...DEFAULT_VAULT_WORKSPACE_STATE,
   assetOperationsMode: "groups",
   importTagsMode: "import",
  })
  expect(readVaultWorkspaceState()).toMatchObject({
   assetOperationsMode: "groups",
   importTagsMode: "import",
  })
 })

 it("migrates the previous unified tool into corrected module ownership", () => {
  localStorage.setItem("vt_creator_vault_workspace_v1", JSON.stringify({
   ...DEFAULT_VAULT_WORKSPACE_STATE,
   assetOperationsMode: "text",
   visibleModules: ["navigator", "asset-operations", "asset-library", "inspector"],
   moduleOrder: ["navigator", "asset-operations", "asset-library", "inspector"],
  }))

  const state = readVaultWorkspaceState()
  expect(state.assetOperationsMode).toBe("search")
  expect(state.visibleModules).toContain("asset-operations")
  expect(state.visibleModules).toContain("import-tags")
  expect(state.visibleModules).toContain("text-editor")
  expect(state.moduleOrder).toContain("import-tags")
  expect(state.moduleOrder).toContain("text-editor")
 })

 it("migrates older tag/import/batch modules without duplicating tools", () => {
  localStorage.setItem("vt_creator_vault_workspace_v1", JSON.stringify({
   ...DEFAULT_VAULT_WORKSPACE_STATE,
   visibleModules: ["navigator", "spectrum-tags", "asset-library", "import-station", "batch-processor", "inspector"],
   moduleOrder: ["navigator", "spectrum-tags", "asset-library", "import-station", "batch-processor", "inspector"],
  }))

  const state = readVaultWorkspaceState()
  expect(state.visibleModules.filter((id) => id === "asset-operations")).toHaveLength(1)
  expect(state.visibleModules.filter((id) => id === "import-tags")).toHaveLength(1)
  expect(state.visibleModules.filter((id) => id === "text-editor")).toHaveLength(1)
  expect(state.visibleModules).not.toContain("spectrum-tags")
  expect(state.visibleModules).not.toContain("import-station")
  expect(state.visibleModules).not.toContain("batch-processor")
 })
})
