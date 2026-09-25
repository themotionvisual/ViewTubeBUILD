// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import {
 DEFAULT_VAULT_MODULE_ORDER,
 DEFAULT_VAULT_WORKSPACE_STATE,
 readVaultWorkspaceState,
 writeVaultWorkspaceState,
} from "../vaultWorkspaceState"

describe("Vault unified Asset Operations workspace", () => {
 beforeEach(() => localStorage.clear())

 it("uses one asset-operations module instead of separate tag/import/batch modules", () => {
  expect(DEFAULT_VAULT_MODULE_ORDER).toContain("asset-operations")
  expect(DEFAULT_VAULT_MODULE_ORDER).not.toContain("spectrum-tags")
  expect(DEFAULT_VAULT_MODULE_ORDER).not.toContain("import-station")
  expect(DEFAULT_VAULT_MODULE_ORDER).not.toContain("batch-processor")
 })

 it("persists the active Asset Operations tool", () => {
  writeVaultWorkspaceState({
   ...DEFAULT_VAULT_WORKSPACE_STATE,
   assetOperationsMode: "text",
  })
  expect(readVaultWorkspaceState().assetOperationsMode).toBe("text")
 })

 it("migrates legacy visible modules and ordering into one Asset Operations module", () => {
  localStorage.setItem("vt_creator_vault_workspace_v1", JSON.stringify({
   ...DEFAULT_VAULT_WORKSPACE_STATE,
   visibleModules: ["navigator", "spectrum-tags", "asset-library", "import-station", "batch-processor", "inspector"],
   moduleOrder: ["navigator", "spectrum-tags", "asset-library", "import-station", "batch-processor", "inspector"],
  }))

  const state = readVaultWorkspaceState()
  expect(state.visibleModules.filter((id) => id === "asset-operations")).toHaveLength(1)
  expect(state.moduleOrder.filter((id) => id === "asset-operations")).toHaveLength(1)
  expect(state.visibleModules).not.toContain("spectrum-tags")
  expect(state.visibleModules).not.toContain("import-station")
  expect(state.visibleModules).not.toContain("batch-processor")
 })
})
