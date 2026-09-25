import { createLocalVaultAsset, listVaultAssets, updateVaultAsset } from "./vaultAdapter"
import type { VaultAsset } from "../types"

export type VaultTextFormat = "plain" | "markdown"

const mimeForFormat = (format: VaultTextFormat) =>
 format === "markdown" ? "text/markdown" : "text/plain"

export const createVaultTextDocument = (input: {
 name: string
 text: string
 format: VaultTextFormat
 projectId?: string | null
 projectName?: string | null
 tags?: string[]
}): VaultAsset =>
 createLocalVaultAsset({
  name: input.name.trim() || "Untitled Text Document",
  kind: "document",
  projectId: input.projectId || null,
  projectName: input.projectName || null,
  mimeType: mimeForFormat(input.format),
  tags: Array.from(new Set(["text", ...(input.tags || [])])),
  metadata: {
   textContent: input.text,
   textFormat: input.format,
   editor: "vault-text-editor",
  },
 })

export const saveVaultTextDocument = (
 assetId: string,
 input: {
  name: string
  text: string
  format: VaultTextFormat
 },
): VaultAsset | null => {
 const existing = listVaultAssets().find((asset) => asset.id === assetId)
 if (!existing || existing.kind !== "document") return null
 return updateVaultAsset(assetId, {
  name: input.name.trim() || "Untitled Text Document",
  mimeType: mimeForFormat(input.format),
  metadata: {
   ...(existing.metadata || {}),
   textContent: input.text,
   textFormat: input.format,
   editor: "vault-text-editor",
  },
 })
}
