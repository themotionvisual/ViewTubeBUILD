import { describe, expect, it } from "vitest"
import { serializeVaultAssetsCsv, serializeVaultAssetsJson } from "../vaultMetadataExport"
import type { VaultAsset } from "../../types"

const asset: VaultAsset = {
 id: "asset-1",
 name: 'Map, "Final"',
 kind: "image",
 source: "imported",
 projectId: "project-1",
 projectName: "Austerlitz",
 toolId: "creator-vault-os",
 generationId: null,
 driveFileId: null,
 folderId: null,
 url: null,
 previewUrl: "data:image/png;base64,preview",
 mimeType: "image/png",
 tags: ["map", "final"],
 metadata: {
  width: 1920,
  height: 1080,
  byteSize: 12345,
  lifecycle: "FINAL",
  customFields: { rating: 5 },
 },
 createdAt: 10,
 updatedAt: 20,
}

describe("Vault metadata export", () => {
 it("exports canonical asset records as JSON without mutating them", () => {
  const parsed = JSON.parse(serializeVaultAssetsJson([asset]))
  expect(parsed.assets[0]).toMatchObject({
   id: "asset-1",
   name: 'Map, "Final"',
   metadata: { lifecycle: "FINAL" },
  })
  expect(parsed.assets[0].previewUrl).toBe("data:image/png;base64,preview")
 })

 it("exports creator-useful CSV with correct escaping", () => {
  const csv = serializeVaultAssetsCsv([asset])
  expect(csv).toContain("id,name,kind,project,source,mimeType")
  expect(csv).toContain('"Map, ""Final"""')
  expect(csv).toContain('"map; final"')
  expect(csv).toContain("1920")
  expect(csv).toContain("1080")
  expect(csv).toContain("FINAL")
 })
})
