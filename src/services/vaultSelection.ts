export type VaultSelectionInput = {
 visibleIds: string[]
 selectedIds: string[]
 clickedId: string
 nextSelected: boolean
 anchorId: string | null
 shiftKey: boolean
}

export type VaultSelectionResult = {
 selectedIds: string[]
 anchorId: string | null
}

export const resolveVaultSelection = ({
 visibleIds,
 selectedIds,
 clickedId,
 nextSelected,
 anchorId,
 shiftKey,
}: VaultSelectionInput): VaultSelectionResult => {
 const selected = new Set(selectedIds)
 const anchorIndex = anchorId ? visibleIds.indexOf(anchorId) : -1
 const clickedIndex = visibleIds.indexOf(clickedId)

 if (shiftKey && anchorIndex >= 0 && clickedIndex >= 0) {
  const start = Math.min(anchorIndex, clickedIndex)
  const end = Math.max(anchorIndex, clickedIndex)
  const range = visibleIds.slice(start, end + 1)
  for (const id of range) {
   if (nextSelected) selected.add(id)
   else selected.delete(id)
  }
  return { selectedIds: visibleIds.filter((id) => selected.has(id)), anchorId }
 }

 if (nextSelected) selected.add(clickedId)
 else selected.delete(clickedId)

 const ordered = [
  ...visibleIds.filter((id) => selected.has(id)),
  ...selectedIds.filter((id) => !visibleIds.includes(id) && selected.has(id)),
 ]

 return { selectedIds: Array.from(new Set(ordered)), anchorId: clickedId }
}
