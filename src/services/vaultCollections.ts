import type { VaultAsset, VaultAssetKind } from "../types"

export type VaultSmartCollection = {
 id: string
 name: string
 query: string
 tags: string[]
 kind: "all" | VaultAssetKind
 source: "all" | VaultAsset["source"]
 lifecycle: string
 orientation: "all" | "landscape" | "portrait" | "square"
 updatedFrom: string
 updatedTo: string
 mimeType: string
 minWidth: string
 minHeight: string
 minDuration: string
 maxDuration: string
 minBytesMb: string
 maxBytesMb: string
 createdAt: number
}

const STORAGE_KEY = "vt_creator_vault_smart_collections_v1"

const canUseStorage = () => typeof window !== "undefined" && typeof localStorage !== "undefined"

export const listVaultSmartCollections = (): VaultSmartCollection[] => {
 if (!canUseStorage()) return []
 try {
  const raw = localStorage.getItem(STORAGE_KEY)
  const parsed = raw ? JSON.parse(raw) : []
  return Array.isArray(parsed)
   ? (parsed as Array<Partial<VaultSmartCollection>>).map((item) => ({
     id: String(item.id || crypto.randomUUID()),
     name: String(item.name || "Untitled Collection"),
     query: String(item.query || ""),
     tags: Array.isArray(item.tags) ? item.tags.filter((tag): tag is string => typeof tag === "string") : [],
     kind: (item.kind || "all") as VaultSmartCollection["kind"],
     source: (item.source || "all") as VaultSmartCollection["source"],
     lifecycle: String(item.lifecycle || "all"),
     orientation: (item.orientation || "all") as VaultSmartCollection["orientation"],
     updatedFrom: String(item.updatedFrom || ""),
     updatedTo: String(item.updatedTo || ""),
     mimeType: String(item.mimeType || ""),
     minWidth: String(item.minWidth || ""),
     minHeight: String(item.minHeight || ""),
     minDuration: String(item.minDuration || ""),
     maxDuration: String(item.maxDuration || ""),
     minBytesMb: String(item.minBytesMb || ""),
     maxBytesMb: String(item.maxBytesMb || ""),
     createdAt: typeof item.createdAt === "number" ? item.createdAt : Date.now(),
    }))
   : []
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
 lifecycle?: string
 orientation?: "all" | "landscape" | "portrait" | "square"
 updatedFrom?: string
 updatedTo?: string
 mimeType?: string
 minWidth?: string
 minHeight?: string
 minDuration?: string
 maxDuration?: string
 minBytesMb?: string
 maxBytesMb?: string
}): VaultSmartCollection => {
 const item: VaultSmartCollection = {
  id: crypto.randomUUID(),
  name: input.name.trim() || "Untitled Collection",
  query: input.query?.trim() || "",
  tags: [...(input.tags || [])],
  kind: input.kind || "all",
  source: input.source || "all",
  lifecycle: input.lifecycle || "all",
  orientation: input.orientation || "all",
  updatedFrom: input.updatedFrom?.trim() || "",
  updatedTo: input.updatedTo?.trim() || "",
  mimeType: input.mimeType?.trim() || "",
  minWidth: input.minWidth?.trim() || "",
  minHeight: input.minHeight?.trim() || "",
  minDuration: input.minDuration?.trim() || "",
  maxDuration: input.maxDuration?.trim() || "",
  minBytesMb: input.minBytesMb?.trim() || "",
  maxBytesMb: input.maxBytesMb?.trim() || "",
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
