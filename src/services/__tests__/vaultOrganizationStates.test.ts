// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import {
 createLocalVaultAsset,
 searchVaultAssets,
 setVaultAssetState,
} from "../vaultAdapter"

describe("Vault organization states", () => {
 beforeEach(() => localStorage.clear())

 it("marks an asset favorite without changing its identity", () => {
  const asset = createLocalVaultAsset({ name: "Hero", kind: "image", tags: [] })
  const updated = setVaultAssetState(asset.id, { favorite: true })

  expect(updated?.id).toBe(asset.id)
  expect(updated?.metadata?.favorite).toBe(true)
  expect(searchVaultAssets({ special: "favorites" }).map((item) => item.id)).toEqual([asset.id])
 })

 it("keeps trash distinct from archive", () => {
  const archived = createLocalVaultAsset({ name: "Old", kind: "image", tags: [] })
  const trashed = createLocalVaultAsset({ name: "Delete", kind: "image", tags: [] })

  setVaultAssetState(archived.id, { archived: true })
  setVaultAssetState(trashed.id, { trashed: true })

  expect(searchVaultAssets({ special: "archive" }).map((item) => item.id)).toEqual([archived.id])
  expect(searchVaultAssets({ special: "trash" }).map((item) => item.id)).toEqual([trashed.id])
  expect(searchVaultAssets({ special: "active" }).map((item) => item.id)).toEqual([])
 })
})
