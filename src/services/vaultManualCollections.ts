export type VaultManualCollectionRole = "standard" | "brand-kit"

export type VaultManualCollection = {
 id: string
 name: string
 role: VaultManualCollectionRole
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
  return Array.isArray(parsed)
   ? (parsed as Array<Partial<VaultManualCollection>>).map((item) => ({
     ...item,
     id: String(item.id || crypto.randomUUID()),
     name: String(item.name || "Untitled Collection"),
     role: item.role === "brand-kit" ? "brand-kit" : "standard",
     assetIds: Array.isArray(item.assetIds) ? item.assetIds.filter((id): id is string => typeof id === "string") : [],
     createdAt: typeof item.createdAt === "number" ? item.createdAt : Date.now(),
     updatedAt: typeof item.updatedAt === "number" ? item.updatedAt : Date.now(),
    }))
   : []
 } catch {
  return []
 }
}

export const createVaultCollection = (name: string): VaultManualCollection => {
 const now = Date.now()
 const collection: VaultManualCollection = {
  id: crypto.randomUUID(),
  name: name.trim() || "Untitled Collection",
  role: "standard",
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


export const getVaultBrandKit = (): VaultManualCollection | null =>
 listVaultCollections().find((item) => item.role === "brand-kit") || null

export const setVaultCollectionRole = (
 id: string,
 role: VaultManualCollectionRole,
): VaultManualCollection | null => {
 const items = listVaultCollections()
 const current = items.find((item) => item.id === id)
 if (!current) return null

 const now = Date.now()
 const nextItems = items.map((item) => {
  if (role === "brand-kit" && item.id !== id && item.role === "brand-kit") {
   return { ...item, role: "standard" as const, updatedAt: now }
  }
  if (item.id === id) return { ...item, role, updatedAt: now }
  return item.role ? item : { ...item, role: "standard" as const }
 })
 writeCollections(nextItems)
 return nextItems.find((item) => item.id === id) || null
}
