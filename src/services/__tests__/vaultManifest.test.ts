import { describe, expect, it } from "vitest"
import { createVaultSelectionManifest } from "../vaultManifest"

describe("createVaultSelectionManifest", () => {
 it("serializes selected asset identity and canonical usage without blobs", () => {
  const manifest = createVaultSelectionManifest({
   assets: [{
    id: "asset-1",
    name: "Map",
    kind: "image",
    source: "imported",
    projectId: "p-1",
    projectName: "Austerlitz",
    toolId: "creator-vault-os",
    generationId: null,
    driveFileId: null,
    folderId: null,
    url: "https://example.com/map.png",
    previewUrl: "data:image/jpeg;base64,thumb",
    mimeType: "image/png",
    tags: ["map"],
    metadata: { contentHash: "sha256:abc" },
    createdAt: 1,
    updatedAt: 2,
   }],
   usageByAssetId: {
    "asset-1": [{
     contentBuildId: "cb-1",
     projectId: "p-1",
     projectName: "Austerlitz",
     stage: "production",
     selectedSlots: ["thumbnail"],
    }],
   },
   generatedAt: "2026-09-25T18:15:00.000Z",
  })

  expect(manifest.assets[0]).toMatchObject({
   id: "asset-1",
   name: "Map",
   projectName: "Austerlitz",
   contentHash: "sha256:abc",
  })
  expect(manifest.assets[0]).not.toHaveProperty("previewUrl")
  expect(manifest.usage["asset-1"][0].contentBuildId).toBe("cb-1")
 })
})
