import type { VaultAsset } from "../types"
import type { VaultAssetUsage } from "./vaultUsage"

export type VaultSelectionManifest = {
 schemaVersion: "viewtube-vault-selection-manifest-v1"
 generatedAt: string
 assets: Array<{
  id: string
  name: string
  kind: VaultAsset["kind"]
  source: VaultAsset["source"]
  projectId: string | null
  projectName: string | null
  toolId: VaultAsset["toolId"]
  generationId: string | null
  mimeType: string | null
  tags: string[]
  contentHash: string | null
  metadata: Record<string, unknown>
  createdAt: number
  updatedAt: number
 }>
 usage: Record<string, VaultAssetUsage[]>
}

export const createVaultSelectionManifest = (input: {
 assets: VaultAsset[]
 usageByAssetId: Record<string, VaultAssetUsage[]>
 generatedAt?: string
}): VaultSelectionManifest => ({
 schemaVersion: "viewtube-vault-selection-manifest-v1",
 generatedAt: input.generatedAt || new Date().toISOString(),
 assets: input.assets.map((asset) => ({
  id: asset.id,
  name: asset.name,
  kind: asset.kind,
  source: asset.source,
  projectId: asset.projectId || null,
  projectName: asset.projectName || null,
  toolId: asset.toolId || null,
  generationId: asset.generationId || null,
  mimeType: asset.mimeType || null,
  tags: [...(asset.tags || [])],
  contentHash: typeof asset.metadata?.contentHash === "string" ? asset.metadata.contentHash : null,
  metadata: { ...(asset.metadata || {}) },
  createdAt: asset.createdAt,
  updatedAt: asset.updatedAt,
 })),
 usage: Object.fromEntries(
  input.assets.map((asset) => [asset.id, input.usageByAssetId[asset.id] || []]),
 ),
})

export const serializeVaultSelectionManifest = (manifest: VaultSelectionManifest): string =>
 JSON.stringify(manifest, null, 2)
