// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import { createLocalVaultAsset, listVaultAssets, updateVaultAsset } from "../vaultAdapter"

describe("Vault batch mutation foundation", () => {
 beforeEach(() => localStorage.clear())

 it("updates one canonical asset without replacing its identity", () => {
  const created = createLocalVaultAsset({ name: "Map", kind: "image", tags: ["research"] })
  const updated = updateVaultAsset(created.id, {
   tags: ["research", "approved"],
  })

  expect(updated?.id).toBe(created.id)
  expect(updated?.createdAt).toBe(created.createdAt)
  expect(updated?.tags).toEqual(["research", "approved"])
  expect(listVaultAssets()).toHaveLength(1)
 })

 it("returns null when the asset does not exist", () => {
  expect(updateVaultAsset("missing", { tags: ["x"] })).toBeNull()
 })
})
