import type { VaultAsset, VaultAssetKind } from "../types"

export type VaultSmartCollection = {
 id: string
 name: string
 query: string
 tags: string[]
 kind: "all" | VaultAssetKind
 source: "all" | VaultAsset["source"]
 createdAt: number
}

const STORAGE_KEY = "vt_creator_vault_smart_collections_v1"

const canUseStorage = () => typeof window !== "undefined" && typeof localStorage !== "undefined"

export const listVaultSmartCollections = (): VaultSmartCollection[] => {
 if (!canUseStorage()) return []
 try {
  const raw = localStorage.getItem(STORAGE_KEY)
  const parsed = raw ? JSON.parse(raw) : []
  return Array.isArray(parsed) ? parsed as VaultSmartCollection[] : []
 } catch {
  return []
 }
}

export const createVaultSmartCollection = (input: {
 name: string
 query?: string
 tags?: string[]
 kind?: "all" | VaultAssetKind
 source?: "all" | VaultAsset["source"]
}): VaultSmartCollection => {
 const item: VaultSmartCollection = {
  id: crypto.randomUUID(),
  name: input.name.trim() || "Untitled Collection",
  query: input.query?.trim() || "",
  tags: [...(input.tags || [])],
  kind: input.kind || "all",
  source: input.source || "all",
  createdAt: Date.now(),
 }
 const current = listVaultSmartCollections()
 if (canUseStorage()) localStorage.setItem(STORAGE_KEY, JSON.stringify([...current, item]))
 return item
}

export const deleteVaultSmartCollection = (id: string): void => {
 if (!canUseStorage()) return
 localStorage.setItem(
  STORAGE_KEY,
  JSON.stringify(listVaultSmartCollections().filter((item) => item.id !== id)),
 )
}
