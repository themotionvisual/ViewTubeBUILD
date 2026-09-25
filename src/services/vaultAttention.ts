import type { VaultAsset } from "../types"

export const getVaultAttentionReasons = (asset: VaultAsset): string[] => {
 const reasons: string[] = []
 const metadata = asset.metadata || {}

 if (!asset.projectName) reasons.push("Unassigned to a project")
 if (!(asset.tags || []).length) reasons.push("No tags")

 if (metadata.needsAttention === true) {
  const note = typeof metadata.attentionNote === "string" ? metadata.attentionNote.trim() : ""
  if (note) reasons.push(note)
  else reasons.push("Flagged for review")
 }

 return Array.from(new Set(reasons))
}
