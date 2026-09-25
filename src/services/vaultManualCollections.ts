export type VaultManualCollection = {
 id: string
 name: string
 assetIds: string[]
 createdAt: number
 updatedAt: number
}

const STORAGE_KEY = "vt_creator_vault_manual_collections_v1"

const canUseStorage = () => typeof window !== "undefined" && typeof localStorage !== "undefined"

const writeCollections = (items: VaultManualCollection[]) => {
 if (!canUseStorage()) return
 localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export const listVaultCollections = (): VaultManualCollection[] => {
 if (!canUseStorage()) return []
 try {
  const raw = localStorage.getItem(STORAGE_KEY)
  const parsed = raw ? JSON.parse(raw) : []
  return Array.isArray(parsed) ? parsed as VaultManualCollection[] : []
 } catch {
  return []
 }
}

export const createVaultCollection = (name: string): VaultManualCollection => {
 const now = Date.now()
 const collection: VaultManualCollection = {
  id: crypto.randomUUID(),
  name: name.trim() || "Untitled Collection",
  assetIds: [],
  createdAt: now,
  updatedAt: now,
 }
 writeCollections([collection, ...listVaultCollections()])
 return collection
}

export const addAssetsToVaultCollection = (
 id: string,
 assetIds: string[],
): VaultManualCollection | null => {
 const items = listVaultCollections()
 const current = items.find((item) => item.id === id)
 if (!current) return null
 const updated = {
  ...current,
  assetIds: Array.from(new Set([...current.assetIds, ...assetIds])),
  updatedAt: Date.now(),
 }
 writeCollections(items.map((item) => item.id === id ? updated : item))
 return updated
}

export const removeAssetFromVaultCollection = (
 id: string,
 assetId: string,
): VaultManualCollection | null => {
 const items = listVaultCollections()
 const current = items.find((item) => item.id === id)
 if (!current) return null
 const updated = {
  ...current,
  assetIds: current.assetIds.filter((value) => value !== assetId),
  updatedAt: Date.now(),
 }
 writeCollections(items.map((item) => item.id === id ? updated : item))
 return updated
}

export const deleteVaultCollection = (id: string): void => {
 writeCollections(listVaultCollections().filter((item) => item.id !== id))
}
