import type { VaultAsset } from "../types"
import type { ContentBuildAssetVersion } from "./asset-engine/contracts"
import { addVaultAsset } from "./vaultAdapter"
import { listContentBuildSnapshots } from "./assetEngine"

export const getVaultAssetVersionStack = (assetId: string): ContentBuildAssetVersion[] => {
 for (const build of listContentBuildSnapshots()) {
  const selected = build.versions.find((version) => version.assetId === assetId)
  if (!selected) continue
  return build.versions
   .filter((version) => version.slot === selected.slot)
   .sort((a, b) => a.version - b.version)
 }
 return []
}


export const detachVaultAssetVersion = (
 asset: VaultAsset,
 input: { versionId: string },
): VaultAsset => {
 const existingParents = Array.isArray(asset.metadata?.parentAssetIds)
  ? asset.metadata.parentAssetIds.filter((id): id is string => typeof id === "string")
  : []
 return addVaultAsset({
  name: `${asset.name} · Detached`,
  kind: asset.kind,
  source: asset.source,
  projectId: asset.projectId || null,
  projectName: asset.projectName || null,
  toolId: asset.toolId || null,
  generationId: asset.generationId || null,
  driveFileId: asset.driveFileId || null,
  folderId: asset.folderId || null,
  url: asset.url || null,
  previewUrl: asset.previewUrl || asset.url || null,
  mimeType: asset.mimeType || null,
  tags: Array.from(new Set([...(asset.tags || []), "detached-version"])),
  metadata: {
   ...(asset.metadata || {}),
   parentAssetIds: Array.from(new Set([...existingParents, asset.id])),
   detachedFromVersionId: input.versionId,
   detachedAt: Date.now(),
  },
 })
}
