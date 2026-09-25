// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import { createLocalVaultAsset, listVaultAssets } from "../vaultAdapter"
import {
 createVaultCustomField,
 listVaultCustomFields,
 setVaultCustomFieldValue,
} from "../vaultCustomFields"

describe("Vault custom fields", () => {
 beforeEach(() => localStorage.clear())

 it("stores typed field definitions separately from assets", () => {
  const field = createVaultCustomField({ name: "Shot Type", type: "text" })
  expect(listVaultCustomFields()).toEqual([expect.objectContaining({
   id: field.id,
   name: "Shot Type",
   type: "text",
  })])
 })

 it("stores only per-asset values inside canonical asset metadata", () => {
  const asset = createLocalVaultAsset({ name: "Clip", kind: "video", tags: [] })
  const field = createVaultCustomField({ name: "Rating", type: "number" })
  setVaultCustomFieldValue(asset.id, field.id, 5)
  expect(listVaultAssets()[0].metadata?.customFields).toEqual({
   [field.id]: 5,
  })
 })

 it("validates values against the declared field type", () => {
  const asset = createLocalVaultAsset({ name: "Image", kind: "image", tags: [] })
  const field = createVaultCustomField({ name: "Approved", type: "boolean" })
  expect(() => setVaultCustomFieldValue(asset.id, field.id, "yes")).toThrow()
 })
})
