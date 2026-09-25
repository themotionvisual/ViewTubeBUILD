// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import {
 createLocalVaultAsset,
 setVaultAssetLifecycle,
 setVaultAssetProtection,
 setVaultAssetState,
} from "../vaultAdapter"

describe("Vault asset lifecycle protection", () => {
 beforeEach(() => localStorage.clear())

 it("stores canonical Vault lifecycle state", () => {
  const asset = createLocalVaultAsset({ name: "Master", kind: "video", tags: [] })
  const updated = setVaultAssetLifecycle(asset.id, "GOLDEN")
  expect(updated?.metadata?.lifecycle).toBe("GOLDEN")
 })

 it("blocks archive and trash for GOLDEN assets until explicitly unlocked", () => {
  const asset = createLocalVaultAsset({ name: "Master", kind: "video", tags: [] })
  setVaultAssetLifecycle(asset.id, "GOLDEN")

  expect(setVaultAssetState(asset.id, { archived: true })).toBeNull()
  expect(setVaultAssetState(asset.id, { trashed: true })).toBeNull()

  setVaultAssetProtection(asset.id, false)
  expect(setVaultAssetState(asset.id, { archived: true })?.metadata?.archivedAt).toBeTruthy()
 })

 it("blocks destructive state changes for explicitly protected assets", () => {
  const asset = createLocalVaultAsset({ name: "Approved", kind: "image", tags: [] })
  setVaultAssetProtection(asset.id, true)
  expect(setVaultAssetState(asset.id, { trashed: true })).toBeNull()
 })
})
