// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import {
 DEFAULT_VAULT_WORKSPACE_STATE,
 readVaultWorkspaceState,
 writeVaultWorkspaceState,
} from "../vaultWorkspaceState"

describe("Vault advanced filter persistence", () => {
 beforeEach(() => localStorage.clear())

 it("persists structured metadata filters with the workspace", () => {
  writeVaultWorkspaceState({
   ...DEFAULT_VAULT_WORKSPACE_STATE,
   filterLifecycle: "FINAL",
   filterOrientation: "portrait",
   filterMimeType: "video/mp4",
   filterMinWidth: "1280",
   filterMinHeight: "720",
   filterMinDuration: "30",
   filterMaxDuration: "90",
   filterMinBytesMb: "2",
   filterMaxBytesMb: "50",
  })

  expect(readVaultWorkspaceState()).toMatchObject({
   filterLifecycle: "FINAL",
   filterOrientation: "portrait",
   filterMimeType: "video/mp4",
   filterMinWidth: "1280",
   filterMinHeight: "720",
   filterMinDuration: "30",
   filterMaxDuration: "90",
   filterMinBytesMb: "2",
   filterMaxBytesMb: "50",
  })
 })
})
