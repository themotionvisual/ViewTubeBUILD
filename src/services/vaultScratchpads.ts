export type VaultScratchpad = {
 id: string
 title: string
 content: string
 createdAt: number
 updatedAt: number
}

const STORAGE_KEY = "vt_creator_vault_scratchpads_v1"

const canUseStorage = () => typeof window !== "undefined" && typeof localStorage !== "undefined"

const writeScratchpads = (items: VaultScratchpad[]) => {
 if (!canUseStorage()) return
 localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export const listVaultScratchpads = (): VaultScratchpad[] => {
 if (!canUseStorage()) return []
 try {
  const raw = localStorage.getItem(STORAGE_KEY)
  const parsed = raw ? JSON.parse(raw) : []
  return Array.isArray(parsed) ? (parsed as VaultScratchpad[]) : []
 } catch {
  return []
 }
}

export const createVaultScratchpad = (input: {
 title: string
 content: string
}): VaultScratchpad => {
 const now = Date.now()
 const item: VaultScratchpad = {
  id: crypto.randomUUID(),
  title: input.title.trim() || "Untitled Note",
  content: input.content,
  createdAt: now,
  updatedAt: now,
 }
 writeScratchpads([item, ...listVaultScratchpads()])
 return item
}

export const updateVaultScratchpad = (
 id: string,
 patch: Partial<Pick<VaultScratchpad, "title" | "content">>,
): VaultScratchpad | null => {
 const items = listVaultScratchpads()
 const current = items.find((item) => item.id === id)
 if (!current) return null
 const updated = {
  ...current,
  ...patch,
  updatedAt: Date.now(),
 }
 writeScratchpads(items.map((item) => (item.id === id ? updated : item)))
 return updated
}

export const deleteVaultScratchpad = (id: string): void => {
 writeScratchpads(listVaultScratchpads().filter((item) => item.id !== id))
}
