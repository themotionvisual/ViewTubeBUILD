// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import {
 createLocalVaultAsset,
 listVaultAssets,
 setVaultAssetAttention,
} from "../vaultAdapter"

describe("setVaultAssetAttention", () => {
 beforeEach(() => localStorage.clear())

 it("flags an asset for review with an optional note", () => {
  const asset = createLocalVaultAsset({ name: "Map", kind: "image", tags: ["map"] })
  const updated = setVaultAssetAttention(asset.id, true, "Verify source rights")
  expect(updated?.metadata).toMatchObject({
   needsAttention: true,
   attentionNote: "Verify source rights",
  })
 })

 it("clears the flag and note without changing asset identity", () => {
  const asset = createLocalVaultAsset({ name: "Map", kind: "image", tags: ["map"] })
  setVaultAssetAttention(asset.id, true, "Check crop")
  const cleared = setVaultAssetAttention(asset.id, false)
  expect(cleared?.id).toBe(asset.id)
  expect(cleared?.metadata?.needsAttention).toBeUndefined()
  expect(cleared?.metadata?.attentionNote).toBeUndefined()
  expect(listVaultAssets()[0].id).toBe(asset.id)
 })
})
