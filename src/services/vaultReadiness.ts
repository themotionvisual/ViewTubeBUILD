import type { Project } from "../types"
import { getContentBuild } from "./asset-engine/ContentBuildRepository"
import type { ContentBuildSnapshot } from "./asset-engine/contracts"

export type VaultReadinessSlotState = "final" | "selected" | "working" | "legacy" | "empty"

export type VaultReadinessSlot = {
 id: "script" | "title" | "thumbnail" | "description" | "tags" | "final-render"
 label: string
 state: VaultReadinessSlotState
 assetId: string | null
}

export type VaultProjectReadiness = {
 projectId: string
 contentBuildId: string | null
 slots: VaultReadinessSlot[]
 missingPackaging: string[]
 packageReady: boolean
 publishReady: boolean
 storage: {
  knownBytes: number
  knownAssetCount: number
  unknownSizeCount: number
 }
}

type SizableAsset = {
 id: string
 metadata?: Record<string, unknown> | null
}

const slotState = (
 project: Project,
 build: ContentBuildSnapshot | null,
 slot: VaultReadinessSlot["id"],
): Pick<VaultReadinessSlot, "state" | "assetId"> => {
 const selected = build?.selections?.[slot] || null
 const group = build?.variantGroups?.find((candidate) => candidate.slot === slot)
 const versions = build?.versions?.filter((candidate) => candidate.slot === slot) || []

 if (group?.finalAssetId) return { state: "final", assetId: group.finalAssetId }
 if (selected) return { state: "selected", assetId: selected }
 if ((group?.members?.length || 0) > 0 || versions.length > 0) {
  return { state: "working", assetId: group?.selectedAssetId || versions.at(-1)?.assetId || null }
 }

 const legacyReady =
  slot === "script" ? Boolean(project.script?.trim())
  : slot === "title" ? Boolean(project.videoTitle?.trim())
  : slot === "thumbnail" ? Boolean(project.thumbnailUrl)
  : slot === "description" ? Boolean(project.description?.trim())
  : slot === "tags" ? Boolean(project.tags?.trim())
  : slot === "final-render" ? Boolean(build?.youtube?.finalRenderAssetId)
  : false

 return legacyReady
  ? {
    state: "legacy",
    assetId: slot === "final-render" ? build?.youtube?.finalRenderAssetId || null : null,
   }
  : { state: "empty", assetId: null }
}

export const getVaultProjectReadiness = (input: {
 project: Project
 assets: SizableAsset[]
}): VaultProjectReadiness => {
 const build = input.project.contentBuildId ? getContentBuild(input.project.contentBuildId) : null
 const definitions: Array<{ id: VaultReadinessSlot["id"]; label: string }> = [
  { id: "script", label: "Script" },
  { id: "title", label: "Title" },
  { id: "thumbnail", label: "Thumbnail" },
  { id: "description", label: "Description" },
  { id: "tags", label: "Tags / SEO" },
  { id: "final-render", label: "Final Video" },
 ]
 const slots = definitions.map((definition) => ({
  ...definition,
  ...slotState(input.project, build, definition.id),
 }))

 const packagingIds = ["script", "title", "thumbnail", "description", "tags"]
 const missingPackaging = slots
  .filter((slot) => packagingIds.includes(slot.id) && slot.state === "empty")
  .map((slot) => slot.id)
 const finalRender = slots.find((slot) => slot.id === "final-render")
 const known = input.assets
  .map((asset) => asset.metadata?.byteSize)
  .filter((value): value is number => typeof value === "number" && Number.isFinite(value) && value >= 0)

 return {
  projectId: input.project.id,
  contentBuildId: input.project.contentBuildId || null,
  slots,
  missingPackaging,
  packageReady: missingPackaging.length === 0,
  publishReady: missingPackaging.length === 0 && Boolean(finalRender && finalRender.state !== "empty"),
  storage: {
   knownBytes: known.reduce((sum, value) => sum + value, 0),
   knownAssetCount: known.length,
   unknownSizeCount: input.assets.length - known.length,
  },
 }
}
