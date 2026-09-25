export type VaultExplorerAssetLike = {
 id: string
 projectName?: string | null
}

export type VaultExplorerGroups = {
 projects: Array<{ name: string; count: number }>
 unassignedCount: number
}

export const buildVaultExplorerGroups = (
 assets: VaultExplorerAssetLike[],
): VaultExplorerGroups => {
 const projectCounts = new Map<string, number>()
 let unassignedCount = 0

 for (const asset of assets) {
  const project = asset.projectName?.trim()
  if (!project) {
   unassignedCount += 1
   continue
  }
  projectCounts.set(project, (projectCounts.get(project) || 0) + 1)
 }

 return {
  projects: Array.from(projectCounts.entries())
   .map(([name, count]) => ({ name, count }))
   .sort((a, b) => a.name.localeCompare(b.name)),
  unassignedCount,
 }
}
