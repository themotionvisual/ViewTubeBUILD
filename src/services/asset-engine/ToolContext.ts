import type { VaultAsset, WorkspaceBrain } from "@/types"
import { listVaultAssets } from "../vaultAdapter"
import {
 appendContentBuildEvent,
 ensureContentBuild,
 getContentBuild,
 listContentBuildEvents,
} from "./ContentBuildRepository"
import type { ContentBuildEvent, ContentBuildSnapshot } from "./contracts"
import { syncProjectToContentBuild } from "./ProjectContentBuildBridge"

export interface ResolveContentBuildToolContextInput {
 contentBuildId?: string | null
 channelId?: string | null
 projectId?: string | null
 projectName?: string | null
 videoId?: string | null
 toolId: string
 requestedSlots?: string[]
 evidenceIds?: string[]
}

export interface ContentBuildToolContext {
 contentBuildId: string
 toolId: string
 build: ContentBuildSnapshot
 assets: VaultAsset[]
 selectedAssets: Record<string, VaultAsset | null>
 evidenceIds: string[]
 recentEvents: ContentBuildEvent[]
}

const indexAssets = (assets: VaultAsset[]) => new Map(assets.map(asset => [asset.id, asset]))

export const resolveContentBuildToolContext = (
 input: ResolveContentBuildToolContextInput,
): ContentBuildToolContext | null => {
 const build = ensureContentBuild({
  id: input.contentBuildId || undefined,
  channelId: input.channelId || null,
  legacyProjectId: input.projectId || null,
  legacyProjectName: input.projectName || null,
  videoId: input.videoId || null,
  profile: input.projectName ? { workingConcept: input.projectName } : undefined,
  toolId: input.toolId,
 })
 if (!build) return null

 const allAssets = listVaultAssets()
 const byId = indexAssets(allAssets)
 const assets = build.assetIds.map(id => byId.get(id)).filter((asset): asset is VaultAsset => Boolean(asset))
 const requestedSlots = input.requestedSlots?.length ? input.requestedSlots : Object.keys(build.selections)
 const selectedAssets = Object.fromEntries(
  requestedSlots.map(slot => {
   const assetId = build.selections[slot]
   return [slot, assetId ? byId.get(assetId) || null : null]
  }),
 )

 return {
  contentBuildId: build.id,
  toolId: input.toolId,
  build,
  assets,
  selectedAssets,
  evidenceIds: input.evidenceIds || [],
  recentEvents: listContentBuildEvents(build.id).slice(-25),
 }
}

export const recordContentBuildToolInput = (input: {
 contentBuildId: string
 toolId: string
 assetIds?: string[]
 evidenceIds?: string[]
 traceId?: string | null
 summary?: string
 metadata?: Record<string, unknown>
}) => appendContentBuildEvent({
 contentBuildId: input.contentBuildId,
 eventType: "tool.input.received",
 entityType: "tool-context",
 entityId: input.toolId,
 actorType: "tool",
 toolId: input.toolId,
 inputAssetIds: input.assetIds || [],
 evidenceIds: input.evidenceIds || [],
 traceId: input.traceId || null,
 metadata: {
  summary: input.summary || "",
  ...(input.metadata || {}),
 },
})

export const recordContentBuildToolOutput = (input: {
 contentBuildId: string
 toolId: string
 assetIds?: string[]
 evidenceIds?: string[]
 generationRecordId?: string | null
 traceId?: string | null
 summary?: string
 metadata?: Record<string, unknown>
}) => appendContentBuildEvent({
 contentBuildId: input.contentBuildId,
 eventType: "tool.output.recorded",
 entityType: "tool-output",
 entityId: input.toolId,
 actorType: "tool",
 toolId: input.toolId,
 outputAssetIds: input.assetIds || [],
 evidenceIds: input.evidenceIds || [],
 generationRecordId: input.generationRecordId || null,
 traceId: input.traceId || null,
 metadata: {
  summary: input.summary || "",
  ...(input.metadata || {}),
 },
})

export const refreshContentBuildToolContext = (
 contentBuildId: string,
 toolId: string,
 requestedSlots?: string[],
): ContentBuildToolContext | null => {
 const build = getContentBuild(contentBuildId)
 if (!build) return null
 return resolveContentBuildToolContext({
  contentBuildId,
  channelId: build.channelId || null,
  projectId: build.legacyProjectId || null,
  projectName: build.legacyProjectName || null,
  videoId: build.youtube?.videoId || null,
  toolId,
  requestedSlots,
 })
}


export const resolveWorkspaceContentBuildToolContext = (
 brain: WorkspaceBrain,
 toolId: string,
 requestedSlots?: string[],
): ContentBuildToolContext | null => {
 const project =
  brain.projects.find(candidate => candidate.id === brain.activeProjectId) ||
  brain.projects.find(candidate => candidate.status === "active") ||
  brain.projects[0]

 if (!project) return null

 const build = syncProjectToContentBuild(project, { sourceToolId: toolId })

 return resolveContentBuildToolContext({
  contentBuildId: build.id,
  projectId: project.id,
  projectName: project.name,
  videoId: build.youtube?.videoId || null,
  toolId,
  requestedSlots,
 })
}
