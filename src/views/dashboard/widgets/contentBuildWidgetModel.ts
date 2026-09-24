import type { VaultAsset } from "../../../types"
import type { ContentBuildSnapshot, ContentBuildStage } from "../../../services/asset-engine/contracts"

export const scopeAssetsToContentBuild = (
  assets: readonly VaultAsset[],
  build: Pick<ContentBuildSnapshot, "id" | "assetIds"> | null | undefined,
): VaultAsset[] => {
  if (!build) return [...assets]
  const allowed = new Set(build.assetIds || [])
  return assets.filter((asset) => allowed.has(asset.id))
}

const bucketForStage = (stage: ContentBuildStage) => {
  if (stage === "idea" || stage === "research" || stage === "concept") return "IDEA"
  if (stage === "outline" || stage === "script" || stage === "storyboard" || stage === "media" || stage === "edit") return "BUILD"
  if (stage === "package" || stage === "review" || stage === "scheduled") return "PACKAGE"
  if (stage === "published" || stage === "launch" || stage === "monitor") return "LIVE"
  return "LEARN"
}

export const buildContentLifecycleSummary = (builds: readonly ContentBuildSnapshot[]) => {
  const order = ["IDEA", "BUILD", "PACKAGE", "LIVE", "LEARN"] as const
  const counts = new Map<(typeof order)[number], number>(order.map((id) => [id, 0]))

  for (const build of builds) {
    const bucket = bucketForStage(build.stage)
    counts.set(bucket, (counts.get(bucket) || 0) + 1)
  }

  return order.map((id) => ({ id, count: counts.get(id) || 0 }))
}

export const describeContentBuildReadiness = (build: ContentBuildSnapshot | null | undefined) => {
  if (!build) return { assetCount: 0, selectedCount: 0, finalCount: 0, variantCount: 0, blockerCount: 0 }
  return {
    assetCount: build.assetIds.length,
    selectedCount: Object.values(build.selections || {}).filter(Boolean).length,
    finalCount: (build.variantGroups || []).filter((group) => Boolean(group.finalAssetId)).length,
    variantCount: (build.variantGroups || []).reduce((sum, group) => sum + group.members.length, 0),
    blockerCount: build.workflow?.blockerIds?.length || 0,
  }
}
