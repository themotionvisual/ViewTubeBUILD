export type VtSyncVisualGridBlock<T> =
 | { type: "module"; module: T; index: number }
 | { type: "row"; modules: Array<{ module: T; index: number }> }

export const VT_SYNC_HALF_WIDTH_VISUAL_GRID_IDS = [
 "age-gender-audience",
 "tube-explorer-engagement-radar",
 "subscribers-gained",
 "watch-time-distribution",
 "revenue-distribution",
 "tube-explorer-shorts-vs-longs",
] as const

/**
 * Featured modules can be moved into a grid long after their original module
 * index was assigned. Their initial disclosure state must follow the visual
 * role, not that stale list position, or a collapsed card will stretch to the
 * height of its open grid neighbour and look like an empty white module.
 */
export const shouldVtSyncVisualStartOpen = (id: string, index: number): boolean =>
 index < 3 || id === "tube-explorer-engagement-radar"

export const buildOrderedVisualGridBlocks = <T extends { id: string }>(
 modules: readonly T[],
 orderedGridIds: readonly string[],
): VtSyncVisualGridBlock<T>[] => {
 const gridIdSet = new Set(orderedGridIds)
 const gridModules = orderedGridIds.flatMap((id) => {
  const index = modules.findIndex((module) => module.id === id)
  return index >= 0 ? [{ module: modules[index], index }] : []
 })
 const firstGridModuleId = gridModules[0]?.module.id
 const blocks: VtSyncVisualGridBlock<T>[] = []

 modules.forEach((module, index) => {
  if (!gridIdSet.has(module.id)) {
   blocks.push({ type: "module", module, index })
  } else if (module.id === firstGridModuleId) {
   blocks.push({ type: "row", modules: gridModules })
  }
 })

 return blocks
}

export const buildVtSyncVisualGridBlocks = <T extends { id: string }>(modules: readonly T[]) =>
 buildOrderedVisualGridBlocks(modules, VT_SYNC_HALF_WIDTH_VISUAL_GRID_IDS)
