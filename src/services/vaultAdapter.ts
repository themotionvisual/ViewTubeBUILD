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
