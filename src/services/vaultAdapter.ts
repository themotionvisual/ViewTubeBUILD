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
 mimeType?: string | null
 lifecycle?: string | null
 minWidth?: number | null
 minHeight?: number | null
 minDurationSec?: number | null
 maxDurationSec?: number | null
 minBytes?: number | null
 maxBytes?: number | null
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
   if (input.mimeType != null && asset.mimeType !== input.mimeType) return false
   const metadata = asset.metadata || {}
   const lifecycle = String(metadata.lifecycle || "DRAFT").toUpperCase()
   const width = typeof metadata.width === "number" ? metadata.width : null
   const height = typeof metadata.height === "number" ? metadata.height : null
   const durationSec = typeof metadata.durationSeconds === "number"
    ? metadata.durationSeconds
    : typeof metadata.durationSec === "number"
     ? metadata.durationSec
     : typeof metadata.duration === "number" ? metadata.duration : null
   const byteSize = typeof metadata.byteSize === "number" ? metadata.byteSize : null

   if (input.lifecycle != null && lifecycle !== input.lifecycle.trim().toUpperCase()) return false
   if (input.minWidth != null && (width == null || width < input.minWidth)) return false
   if (input.minHeight != null && (height == null || height < input.minHeight)) return false
   if (input.minDurationSec != null && (durationSec == null || durationSec < input.minDurationSec)) return false
   if (input.maxDurationSec != null && (durationSec == null || durationSec > input.maxDurationSec)) return false
   if (input.minBytes != null && (byteSize == null || byteSize < input.minBytes)) return false
   if (input.maxBytes != null && (byteSize == null || byteSize > input.maxBytes)) return false
   if (input.special === "inbox") {
    if (metadata.archivedAt || metadata.trashedAt) return false
    if (!getVaultAttentionReasons(asset).length) return false
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

export const findVaultDuplicateByHash = (contentHash: string): VaultAsset | null => {
 const normalized = contentHash.trim().toLowerCase()
 if (!normalized) return null
 return readAssets().find((asset) => (
  String(asset.metadata?.contentHash || "").trim().toLowerCase() === normalized
 )) || null
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
 const lifecycle = String(metadata.lifecycle || "DRAFT").toUpperCase()
 const protectedAsset = metadata.protected === true || (lifecycle === "GOLDEN" && metadata.protected !== false)
 const destructiveRequested = input.archived === true || input.trashed === true
 if (protectedAsset && destructiveRequested) return null

 if (typeof input.favorite === "boolean") metadata.favorite = input.favorite

 const priorLifecycle = lifecycle === "ARCHIVED" || lifecycle === "TRASHED"
  ? String(metadata.previousLifecycle || "DRAFT").toUpperCase()
  : lifecycle || "DRAFT"

 if (input.archived === true) {
  if (!metadata.previousLifecycle) metadata.previousLifecycle = priorLifecycle
  metadata.archivedAt = Date.now()
  delete metadata.trashedAt
  metadata.lifecycle = "ARCHIVED"
 } else if (input.archived === false) {
  delete metadata.archivedAt
  if (String(metadata.lifecycle || "").toUpperCase() === "ARCHIVED" && input.trashed !== true) {
   metadata.lifecycle = String(metadata.previousLifecycle || "DRAFT").toUpperCase()
   delete metadata.previousLifecycle
  }
 }

 if (input.trashed === true) {
  if (!metadata.previousLifecycle) metadata.previousLifecycle = priorLifecycle
  metadata.trashedAt = Date.now()
  delete metadata.archivedAt
  metadata.lifecycle = "TRASHED"
 } else if (input.trashed === false) {
  delete metadata.trashedAt
  if (String(metadata.lifecycle || "").toUpperCase() === "TRASHED" && input.archived !== true) {
   metadata.lifecycle = String(metadata.previousLifecycle || "DRAFT").toUpperCase()
   delete metadata.previousLifecycle
  }
 }

 return updateVaultAsset(id, { metadata })
}

export const setVaultAssetLifecycle = (
 id: string,
 lifecycle: VaultAssetLifecycle,
): VaultAsset | null => {
 const existing = readAssets().find((asset) => asset.id === id)
 if (!existing) return null
 const metadata = { ...(existing.metadata || {}), lifecycle }
 if (lifecycle === "GOLDEN" && metadata.protected === undefined) metadata.protected = true
 return updateVaultAsset(id, { metadata })
}

export const setVaultAssetProtection = (
 id: string,
 protectedAsset: boolean,
): VaultAsset | null => {
 const existing = readAssets().find((asset) => asset.id === id)
 if (!existing) return null
 return updateVaultAsset(id, {
  metadata: {
   ...(existing.metadata || {}),
   protected: protectedAsset,
  },
 })
}

export const deleteVaultAsset = (id: string): boolean => {
 const assets = readAssets()
 const existing = assets.find((asset) => asset.id === id)
 if (!existing) return false

 const metadata = existing.metadata || {}
 const lifecycle = String(metadata.lifecycle || "").toUpperCase()
 const protectedAsset = metadata.protected === true || (lifecycle === "GOLDEN" && metadata.protected !== false)
 const isTrashed = Boolean(metadata.trashedAt) || lifecycle === "TRASHED"

 if (!isTrashed || protectedAsset) return false

 writeAssets(assets.filter((asset) => asset.id !== id))
 return true
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
 previewUrl?: string | null
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
  previewUrl: input.previewUrl || input.url || null,
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
 previewUrl?: string | null
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
  previewUrl: input.previewUrl || input.url || null,
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


export const setVaultAssetAttention = (
 id: string,
 flagged: boolean,
 note = "",
): VaultAsset | null => {
 const existing = readAssets().find((asset) => asset.id === id)
 if (!existing) return null
 const metadata = { ...(existing.metadata || {}) }
 if (flagged) {
  metadata.needsAttention = true
  const trimmed = note.trim()
  if (trimmed) metadata.attentionNote = trimmed
  else delete metadata.attentionNote
 } else {
  delete metadata.needsAttention
  delete metadata.attentionNote
 }
 return updateVaultAsset(id, { metadata })
}
