import type { ContentBuildAssetVersion } from "./asset-engine/contracts"
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
