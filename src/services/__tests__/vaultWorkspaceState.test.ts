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
