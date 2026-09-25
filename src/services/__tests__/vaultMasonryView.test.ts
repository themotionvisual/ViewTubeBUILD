// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import {
 readVaultWorkspaceState,
 writeVaultWorkspaceState,
 DEFAULT_VAULT_WORKSPACE_STATE,
} from "../vaultWorkspaceState"

describe("Vault masonry workspace view", () => {
 beforeEach(() => localStorage.clear())

 it("persists masonry as a canonical workspace view mode", () => {
  writeVaultWorkspaceState({ ...DEFAULT_VAULT_WORKSPACE_STATE, viewMode: "masonry" })
  expect(readVaultWorkspaceState().viewMode).toBe("masonry")
 })
})
