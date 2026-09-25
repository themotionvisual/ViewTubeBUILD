// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import {
 createVaultBrandKit,
 getVaultBrandKit,
 listVaultCollections,
} from "../vaultManualCollections"

describe("createVaultBrandKit", () => {
 beforeEach(() => localStorage.clear())

 it("creates one Brand Kit and can seed it with selected asset ids", () => {
  const kit = createVaultBrandKit(["asset-a", "asset-b"])
  expect(kit.role).toBe("brand-kit")
  expect(kit.name).toBe("Brand Kit")
  expect(kit.assetIds).toEqual(["asset-a", "asset-b"])
  expect(getVaultBrandKit()?.id).toBe(kit.id)
 })

 it("reuses the existing Brand Kit instead of creating a second one", () => {
  const first = createVaultBrandKit(["asset-a"])
  const second = createVaultBrandKit(["asset-b"])
  expect(second.id).toBe(first.id)
  expect(second.assetIds).toEqual(["asset-a", "asset-b"])
  expect(listVaultCollections().filter((item) => item.role === "brand-kit")).toHaveLength(1)
 })
})
