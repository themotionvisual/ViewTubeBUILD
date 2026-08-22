export interface DuplicateId {
  id: string
  count: number
}

export const findDuplicateIds = <T>(
  items: readonly T[],
  getId: (item: T) => string,
): DuplicateId[] => {
  const counts = new Map<string, number>()
  for (const item of items) {
    const id = String(getId(item) || "").trim()
    counts.set(id, (counts.get(id) ?? 0) + 1)
  }
  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => a.id.localeCompare(b.id))
}

export const assertUniqueIds = <T>(
  items: readonly T[],
  getId: (item: T) => string,
  label: string,
): void => {
  const duplicates = findDuplicateIds(items, getId)
  if (!duplicates.length) return
  throw new Error(
    `${label} contains duplicate IDs: ${duplicates.map(({ id, count }) => `${id} (${count})`).join(", ")}`,
  )
}
