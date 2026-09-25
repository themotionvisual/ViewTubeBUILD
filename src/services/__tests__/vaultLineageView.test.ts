// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import {
 DEFAULT_VAULT_WORKSPACE_STATE,
 readVaultWorkspaceState,
 writeVaultWorkspaceState,
} from "../vaultWorkspaceState"

describe("Vault lineage workspace view", () => {
 beforeEach(() => localStorage.clear())

 it("persists lineage as a canonical workspace view", () => {
  writeVaultWorkspaceState({ ...DEFAULT_VAULT_WORKSPACE_STATE, viewMode: "lineage" })
  expect(readVaultWorkspaceState().viewMode).toBe("lineage")
 })
})
