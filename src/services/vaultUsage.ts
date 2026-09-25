import { listContentBuildSnapshots } from "./assetEngine"

export type VaultAssetUsage = {
 contentBuildId: string
 projectId: string | null
 projectName: string | null
 stage: string
 selectedSlots: string[]
}

export const getVaultAssetUsage = (assetId: string): VaultAssetUsage[] =>
 listContentBuildSnapshots()
  .filter((build) => build.assetIds.includes(assetId))
  .map((build) => ({
   contentBuildId: build.id,
   projectId: build.legacyProjectId || null,
   projectName: build.legacyProjectName || null,
   stage: build.stage,
   selectedSlots: Object.entries(build.selections)
    .filter(([, selectedAssetId]) => selectedAssetId === assetId)
    .map(([slot]) => slot),
  }))
  .sort((a, b) => (a.projectName || a.contentBuildId).localeCompare(b.projectName || b.contentBuildId))
