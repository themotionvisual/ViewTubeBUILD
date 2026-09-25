// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import {
 createLocalVaultAsset,
 deleteVaultAsset,
 listVaultAssets,
 setVaultAssetLifecycle,
 setVaultAssetProtection,
 setVaultAssetState,
} from "../vaultAdapter"

describe("Vault archive and trash recovery", () => {
 beforeEach(() => localStorage.clear())

 it("restores archived and trashed assets without changing identity", () => {
  const asset = createLocalVaultAsset({ name: "Recover Me", kind: "image", tags: [] })
  setVaultAssetState(asset.id, { archived: true })
  const restoredArchive = setVaultAssetState(asset.id, { archived: false })
  expect(restoredArchive?.id).toBe(asset.id)
  expect(restoredArchive?.metadata?.archivedAt).toBeUndefined()

  setVaultAssetState(asset.id, { trashed: true })
  const restoredTrash = setVaultAssetState(asset.id, { trashed: false })
  expect(restoredTrash?.id).toBe(asset.id)
  expect(restoredTrash?.metadata?.trashedAt).toBeUndefined()
 })

 it("restores the lifecycle that existed before archive or trash", () => {
  const asset = createLocalVaultAsset({ name: "Final Master", kind: "video", tags: [] })
  setVaultAssetLifecycle(asset.id, "FINAL")
  setVaultAssetState(asset.id, { archived: true })
  expect(setVaultAssetState(asset.id, { archived: false })?.metadata?.lifecycle).toBe("FINAL")

  setVaultAssetState(asset.id, { trashed: true })
  expect(setVaultAssetState(asset.id, { trashed: false })?.metadata?.lifecycle).toBe("FINAL")
 })

 it("permanently deletes only already-trashed unprotected assets", () => {
  const asset = createLocalVaultAsset({ name: "Delete Me", kind: "image", tags: [] })
  expect(deleteVaultAsset(asset.id)).toBe(false)

  setVaultAssetState(asset.id, { trashed: true })
  expect(deleteVaultAsset(asset.id)).toBe(true)
  expect(listVaultAssets()).toEqual([])
 })

 it("never permanently deletes GOLDEN or protected assets", () => {
  const golden = createLocalVaultAsset({ name: "Golden", kind: "video", tags: [] })
  setVaultAssetLifecycle(golden.id, "GOLDEN")
  setVaultAssetProtection(golden.id, false)
  setVaultAssetState(golden.id, { trashed: true })
  setVaultAssetProtection(golden.id, true)
  expect(deleteVaultAsset(golden.id)).toBe(false)
 })
})
