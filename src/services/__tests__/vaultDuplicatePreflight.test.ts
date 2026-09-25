// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import { createLocalVaultAsset, findVaultDuplicateByHash } from "../vaultAdapter"

describe("Vault duplicate preflight", () => {
 beforeEach(() => localStorage.clear())

 it("finds an existing asset by exact content hash", () => {
  const existing = createLocalVaultAsset({
   name: "Map.png",
   kind: "image",
   tags: ["research"],
   metadata: { contentHash: "sha256:abc" },
  })

  expect(findVaultDuplicateByHash("sha256:abc")?.id).toBe(existing.id)
 })

 it("returns null for a hash that is not present", () => {
  expect(findVaultDuplicateByHash("sha256:missing")).toBeNull()
 })
})
