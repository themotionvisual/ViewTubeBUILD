// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import {
 DEFAULT_VAULT_WORKSPACE_STATE,
 readVaultWorkspaceState,
 writeVaultWorkspaceState,
} from "../vaultWorkspaceState"

describe("Vault filmstrip view", () => {
 beforeEach(() => localStorage.clear())

 it("persists filmstrip as a canonical workspace view", () => {
  writeVaultWorkspaceState({ ...DEFAULT_VAULT_WORKSPACE_STATE, viewMode: "filmstrip" })
  expect(readVaultWorkspaceState().viewMode).toBe("filmstrip")
 })
})
