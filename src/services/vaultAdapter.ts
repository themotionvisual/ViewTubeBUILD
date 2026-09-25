import type { GenerationArtifact, SuperToolId, VaultAsset, VaultAssetKind } from "@/types"
import { nexusSyncService } from "./nexusSyncService"

const VAULT_STORAGE_KEY = "vt_creator_vault_assets_v1"

const canUseStorage = () => typeof window !== "undefined" && typeof localStorage !== "undefined"

const readAssets = (): VaultAsset[] => {
 if (!canUseStorage()) return []
 try {
  const raw = localStorage.getItem(VAULT_STORAGE_KEY)
  const parsed = raw ? JSON.parse(raw) : []
  return Array.isArray(parsed) ? (parsed as VaultAsset[]) : []
 } catch (error) {
  console.warn("[vaultAdapter] Failed to read assets", error)
  return []
 }
}

const writeAssets = (assets: VaultAsset[]) => {
 if (!canUseStorage()) return
 localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(assets))
}

export const listVaultAssets = (): VaultAsset[] =>
 readAssets().sort((a, b) => b.updatedAt - a.updatedAt)

export interface VaultAssetSearchInput {
 query?: string
 projectId?: string | null
 projectName?: string | null
 toolId?: SuperToolId | null
 kind?: VaultAssetKind | null
 generationId?: string | null
 tags?: string[]
 tagMode?: "all" | "any"
 source?: VaultAsset["source"] | null
 sort?: "updated-desc" | "updated-asc" | "name-asc" | "name-desc"
 special?: "active" | "inbox" | "favorites" | "archive" | "trash" | null
 limit?: number
}

/**
 * Canonical local Vault search used by creator surfaces and Brain adapters.
 * This searches existing Vault metadata only; it does not create a parallel
 * Brain asset index.
 */
export const searchVaultAssets = (input: VaultAssetSearchInput = {}): VaultAsset[] => {
 const query = String(input.query || "").trim().toLowerCase()
 const tags = (input.tags || []).map((tag) => tag.trim().toLowerCase()).filter(Boolean)
 const tagMode = input.tagMode || "all"
 const limit = Math.max(1, Math.min(100, input.limit || 25))

 const filtered = listVaultAssets()
  .filter((asset) => {
   if (input.projectId != null && asset.projectId !== input.projectId) return false
   if (input.projectName != null && asset.projectName !== input.projectName) return false
   if (input.toolId != null && asset.toolId !== input.toolId) return false
   if (input.kind != null && asset.kind !== input.kind) return false
   if (input.generationId != null && asset.generationId !== input.generationId) return false
   if (input.source != null && asset.source !== input.source) return false
   const metadata = asset.metadata || {}
   if (input.special === "inbox") {
    if (metadata.archivedAt || metadata.trashedAt) return false
    const needsAttention = metadata.needsAttention === true || !asset.projectName || !(asset.tags || []).length
    if (!needsAttention) return false
   }
   if (input.special === "favorites" && metadata.favorite !== true) return false
   if (input.special === "archive" && !metadata.archivedAt) return false
   if (input.special === "trash" && !metadata.trashedAt) return false
   if (input.special === "active" && (metadata.archivedAt || metadata.trashedAt)) return false
   if (tags.length) {
    const assetTags = (asset.tags || []).map((tag) => String(tag).toLowerCase())
    const matchesTags = tagMode === "any"
     ? tags.some((tag) => assetTags.includes(tag))
     : tags.every((tag) => assetTags.includes(tag))
    if (!matchesTags) return false
   }
   if (query) {
    const haystack = [
     asset.name,
     asset.projectName,
     asset.toolId,
     asset.kind,
     ...(asset.tags || []),
     JSON.stringify(asset.metadata || {}),
    ].filter(Boolean).join(" ").toLowerCase()
    if (!haystack.includes(query)) return false
   }
   return true
  })

 const sorted = [...filtered].sort((a, b) => {
  switch (input.sort || "updated-desc") {
   case "updated-asc":
    return a.updatedAt - b.updatedAt
   case "name-asc":
    return a.name.localeCompare(b.name)
   case "name-desc":
    return b.name.localeCompare(a.name)
   case "updated-desc":
   default:
    return b.updatedAt - a.updatedAt
  }
 })

 return sorted.slice(0, limit)
}

export const addVaultAsset = (
 input: Omit<VaultAsset, "id" | "createdAt" | "updatedAt">,
): VaultAsset => {
 const now = Date.now()
 const asset: VaultAsset = {
  ...input,
  id: crypto.randomUUID(),
  createdAt: now,
  updatedAt: now,
 }
 writeAssets([asset, ...readAssets()])
 return asset
}

export const updateVaultAsset = (
 id: string,
 patch: Partial<Omit<VaultAsset, "id" | "createdAt">>,
): VaultAsset | null => {
 const assets = readAssets()
 const existing = assets.find((asset) => asset.id === id)
 if (!existing) return null
 const updated: VaultAsset = {
  ...existing,
  ...patch,
  id: existing.id,
  createdAt: existing.createdAt,
  updatedAt: Date.now(),
 }
 writeAssets(assets.map((asset) => (asset.id === id ? updated : asset)))
 return updated
}

export const setVaultAssetState = (
 id: string,
 input: { favorite?: boolean; archived?: boolean; trashed?: boolean },
): VaultAsset | null => {
 const existing = readAssets().find((asset) => asset.id === id)
 if (!existing) return null
 const metadata = { ...(existing.metadata || {}) }

 if (typeof input.favorite === "boolean") metadata.favorite = input.favorite
 if (typeof input.archived === "boolean") {
  if (input.archived) metadata.archivedAt = Date.now()
  else delete metadata.archivedAt
 }
 if (typeof input.trashed === "boolean") {
  if (input.trashed) metadata.trashedAt = Date.now()
  else delete metadata.trashedAt
 }

 return updateVaultAsset(id, { metadata })
}

export const upsertVaultAsset = (
 matcher: (asset: VaultAsset) => boolean,
 input: Omit<VaultAsset, "id" | "createdAt" | "updatedAt">,
): VaultAsset => {
 const assets = readAssets()
 const existing = assets.find(matcher)
 if (!existing) {
  return addVaultAsset(input)
 }
 const updated: VaultAsset = {
  ...existing,
  ...input,
  id: existing.id,
  createdAt: existing.createdAt,
  updatedAt: Date.now(),
 }
 writeAssets(assets.map((asset) => (asset.id === existing.id ? updated : asset)))
 return updated
}

export const ingestGenerationArtifacts = (
 artifacts: GenerationArtifact[],
 options: {
  toolId: SuperToolId
  projectId?: string | null
  projectName?: string | null
  generationId?: string | null
  tags?: string[]
 } = { toolId: "creator-canvas-os" },
): VaultAsset[] =>
 artifacts.map((artifact) =>
  addVaultAsset({
   name: artifact.label,
   kind: artifact.kind,
   source: "generated",
   projectId: options.projectId || null,
   projectName: options.projectName || null,
   toolId: options.toolId,
   generationId: options.generationId || artifact.sourceRecordId || null,
   driveFileId: null,
   folderId: null,
   url: artifact.url || null,
   previewUrl: artifact.url || null,
   mimeType: artifact.mimeType || null,
   tags: options.tags || [],
   metadata: artifact.metadata || {},
  }),
 )

export const createLocalVaultAsset = (input: {
 name: string
 kind: VaultAssetKind
 projectId?: string | null
 projectName?: string | null
 toolId?: SuperToolId | null
 url?: string | null
 mimeType?: string | null
 tags?: string[]
 metadata?: Record<string, unknown>
}): VaultAsset =>
 addVaultAsset({
  name: input.name,
  kind: input.kind,
  source: "local",
  projectId: input.projectId || null,
  projectName: input.projectName || null,
  toolId: input.toolId || null,
  generationId: null,
  driveFileId: null,
  folderId: null,
  url: input.url || null,
  previewUrl: input.url || null,
  mimeType: input.mimeType || null,
  tags: input.tags || [],
  metadata: input.metadata || {},
 })


export const createImportedVaultAsset = (input: {
 name: string
 kind: VaultAssetKind
 projectId?: string | null
 projectName?: string | null
 toolId?: SuperToolId | null
 url?: string | null
 mimeType?: string | null
 tags?: string[]
 metadata?: Record<string, unknown>
}): VaultAsset =>
 addVaultAsset({
  name: input.name,
  kind: input.kind,
  source: "imported",
  projectId: input.projectId || null,
  projectName: input.projectName || null,
  toolId: input.toolId || null,
  generationId: null,
  driveFileId: null,
  folderId: null,
  url: input.url || null,
  previewUrl: input.url || null,
  mimeType: input.mimeType || null,
  tags: input.tags || [],
  metadata: input.metadata || {},
 })

export const linkDriveVaultFolder = async (projectName: string) => {
 const folderId = await nexusSyncService.ensureProjectVault(projectName)
 return upsertVaultAsset(
  (asset) => asset.folderId === folderId,
  {
   name: `${projectName} Drive Vault`,
   kind: "document",
   source: "drive",
   projectId: null,
   projectName,
   toolId: "creator-vault-os",
   generationId: null,
   driveFileId: folderId,
   folderId,
   url: null,
   previewUrl: null,
   mimeType: "application/vnd.google-apps.folder",
   tags: ["drive", "vault"],
   metadata: { projectName },
  },
 )
}
