import type { SuperToolId, VaultAssetKind } from "../../types"
import { searchVaultAssets } from "../vaultAdapter"
import { readBrainUserControls } from "./BrainUserControls"
import type { BrainEvidenceItem } from "./phaseOneIntegration"

export interface BrainVaultSearchInput {
 query?: string
 projectId?: string | null
 toolId?: SuperToolId | null
 kind?: VaultAssetKind | null
 tags?: string[]
 limit?: number
}

export interface BrainVaultSearchResult {
 assets: Array<{
  id: string
  name: string
  kind: VaultAssetKind
  source: string
  projectId: string | null
  projectName: string | null
  toolId: SuperToolId | null
  generationId: string | null
  tags: string[]
  updatedAt: number
 }>
 evidence: BrainEvidenceItem[]
}

/**
 * Read-only Brain adapter over the canonical Vault adapter. It intentionally
 * returns metadata/provenance rather than raw files or Drive IDs.
 */
export const searchVaultForBrain = (
 input: BrainVaultSearchInput = {},
): BrainVaultSearchResult => {
 const controls = readBrainUserControls()
 if (!controls.enabled || !controls.allowVault) {
  return { assets: [], evidence: [] }
 }

 const assets = searchVaultAssets(input).map((asset) => ({
  id: asset.id,
  name: asset.name,
  kind: asset.kind,
  source: asset.source,
  projectId: asset.projectId,
  projectName: asset.projectName,
  toolId: asset.toolId,
  generationId: asset.generationId,
  tags: asset.tags || [],
  updatedAt: asset.updatedAt,
 }))

 return {
  assets,
  evidence: assets.map((asset) => ({
   id: `vault:${asset.id}`,
   label: asset.name,
   role: "context" as const,
   source: "vault" as const,
   detail: [asset.kind, asset.projectName, asset.toolId].filter(Boolean).join(" · "),
   route: "/reference-studio/toolbox-system",
   freshness: new Date(asset.updatedAt).toISOString(),
  })),
 }
}
