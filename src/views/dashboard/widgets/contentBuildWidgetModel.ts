import type { VaultAsset } from "../../../types"
import type { ContentBuildSnapshot } from "../../../services/asset-engine/contracts"

export const scopeAssetsToContentBuild = (
  assets: readonly VaultAsset[],
  build: Pick<ContentBuildSnapshot, "id" | "assetIds"> | null | undefined,
): VaultAsset[] => {
  if (!build) return [...assets]
  const allowed = new Set(build.assetIds || [])
  return assets.filter((asset) => allowed.has(asset.id))
}

export const summarizeContentBuildReadiness = (
  build: Pick<ContentBuildSnapshot, "assetIds" | "selections" | "variantGroups" | "workflow"> | null | undefined,
) => {
  if (!build) {
    return {
      assetCount: 0,
      selectedCount: 0,
      finalCount: 0,
      variantCount: 0,
      blockerCount: 0,
    }
  }

  return {
    assetCount: build.assetIds.length,
    selectedCount: Object.values(build.selections || {}).filter(Boolean).length,
    finalCount: (build.variantGroups || []).filter((group) => Boolean(group.finalAssetId)).length,
    variantCount: (build.variantGroups || []).reduce((sum, group) => sum + group.members.length, 0),
    blockerCount: build.workflow?.blockerIds?.length || 0,
  }
}
