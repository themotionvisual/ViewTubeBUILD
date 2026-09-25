export type VaultCompareAssetLike = {
 id: string
 name: string
}

export const resolveVaultComparePair = <T extends VaultCompareAssetLike>(input: {
 selectedIds: string[]
 assets: T[]
}): [T, T] | null => {
 if (input.selectedIds.length !== 2) return null
 const byId = new Map(input.assets.map((asset) => [asset.id, asset]))
 const first = byId.get(input.selectedIds[0])
 const second = byId.get(input.selectedIds[1])
 return first && second ? [first, second] : null
}
