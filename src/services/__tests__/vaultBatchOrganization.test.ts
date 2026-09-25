// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import { createLocalVaultAsset, listVaultAssets, updateVaultAsset } from "../vaultAdapter"

describe("Vault batch organization operations", () => {
 beforeEach(() => localStorage.clear())

 it("can rename and project-assign an asset while preserving canonical identity", () => {
  const created = createLocalVaultAsset({
   name: "hero.png",
   kind: "image",
   projectName: null,
   tags: ["thumbnail"],
  })

  const updated = updateVaultAsset(created.id, {
   name: "EP01_hero.png",
   projectName: "Austerlitz",
  })

  expect(updated).toMatchObject({
   id: created.id,
   name: "EP01_hero.png",
   projectName: "Austerlitz",
  })
  expect(updated?.createdAt).toBe(created.createdAt)
  expect(listVaultAssets()).toHaveLength(1)
 })
})
