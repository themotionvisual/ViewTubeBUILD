// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import { createImportedVaultAsset, listVaultAssets } from "../vaultAdapter"

describe("createImportedVaultAsset", () => {
 beforeEach(() => localStorage.clear())

 it("creates an imported-source canonical Vault record", () => {
  const asset = createImportedVaultAsset({
   name: "reference.png",
   kind: "image",
   mimeType: "image/png",
   tags: ["reference"],
   previewUrl: "data:image/jpeg;base64,thumb",
  })

  expect(asset.source).toBe("imported")
  expect(asset.previewUrl).toBe("data:image/jpeg;base64,thumb")
  expect(listVaultAssets()[0].id).toBe(asset.id)
 })
})
