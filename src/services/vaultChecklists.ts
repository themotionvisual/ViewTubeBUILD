export type VaultChecklistItem = {
 id: string
 text: string
 done: boolean
 createdAt: number
 updatedAt: number
}

const STORAGE_KEY = "vt_creator_vault_checklists_v1"

const canUseStorage = () => typeof window !== "undefined" && typeof localStorage !== "undefined"

const writeItems = (items: VaultChecklistItem[]) => {
 if (!canUseStorage()) return
 localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export const listVaultChecklistItems = (): VaultChecklistItem[] => {
 if (!canUseStorage()) return []
 try {
  const raw = localStorage.getItem(STORAGE_KEY)
  const parsed = raw ? JSON.parse(raw) : []
  return Array.isArray(parsed) ? parsed as VaultChecklistItem[] : []
 } catch {
  return []
 }
}

export const createVaultChecklistItem = (text: string): VaultChecklistItem => {
 const now = Date.now()
 const item: VaultChecklistItem = {
  id: crypto.randomUUID(),
  text: text.trim() || "Untitled checklist item",
  done: false,
  createdAt: now,
  updatedAt: now,
 }
 writeItems([item, ...listVaultChecklistItems()])
 return item
}

export const toggleVaultChecklistItem = (id: string): VaultChecklistItem | null => {
 const items = listVaultChecklistItems()
 const current = items.find((item) => item.id === id)
 if (!current) return null
 const updated = {
  ...current,
  done: !current.done,
  updatedAt: Date.now(),
 }
 writeItems(items.map((item) => item.id === id ? updated : item))
 return updated
}

export const deleteVaultChecklistItem = (id: string): void => {
 writeItems(listVaultChecklistItems().filter((item) => item.id !== id))
}
