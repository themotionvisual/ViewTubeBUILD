import { describe, expect, it } from "vitest"
import { getVaultAttentionReasons } from "../vaultAttention"
import type { VaultAsset } from "../../types"

const base = (patch: Partial<VaultAsset> = {}): VaultAsset => ({
 id: "asset-1",
 name: "Asset",
 kind: "image",
 source: "imported",
 projectId: null,
 projectName: null,
 toolId: null,
 generationId: null,
 driveFileId: null,
 folderId: null,
 url: null,
 previewUrl: null,
 mimeType: "image/png",
 tags: [],
 metadata: {},
 createdAt: 1,
 updatedAt: 1,
 ...patch,
})

describe("getVaultAttentionReasons", () => {
 it("explains unassigned and untagged assets", () => {
  expect(getVaultAttentionReasons(base())).toEqual([
   "Unassigned to a project",
   "No tags",
  ])
 })

 it("includes explicit attention flags without duplicating resolved reasons", () => {
  expect(getVaultAttentionReasons(base({
   projectName: "Austerlitz",
   tags: ["map"],
   metadata: { needsAttention: true, attentionNote: "Check source rights" },
  }))).toEqual(["Check source rights"])
 })

 it("returns no reasons for organized assets", () => {
  expect(getVaultAttentionReasons(base({
   projectName: "Austerlitz",
   tags: ["map"],
  }))).toEqual([])
 })
})
