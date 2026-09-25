// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import {
 DEFAULT_VAULT_WORKSPACE_STATE,
 readVaultWorkspaceState,
 writeVaultWorkspaceState,
} from "../vaultWorkspaceState"

describe("Vault workspace customization", () => {
 beforeEach(() => localStorage.clear())

 it("persists density, Arrange Mode, module visibility and module order", () => {
  writeVaultWorkspaceState({
   ...DEFAULT_VAULT_WORKSPACE_STATE,
   density: "compact",
   arrangeMode: true,
   visibleModules: ["asset-library", "inspector"],
   moduleOrder: ["asset-library", "inspector"],
  })

  expect(readVaultWorkspaceState()).toMatchObject({
   density: "compact",
   arrangeMode: true,
   visibleModules: ["asset-library", "inspector"],
   moduleOrder: ["asset-library", "inspector"],
  })
 })

 it("keeps all core modules visible by default", () => {
  expect(DEFAULT_VAULT_WORKSPACE_STATE.visibleModules).toContain("asset-library")
  expect(DEFAULT_VAULT_WORKSPACE_STATE.visibleModules).toContain("import-station")
  expect(DEFAULT_VAULT_WORKSPACE_STATE.visibleModules).toContain("inspector")
 })
})
