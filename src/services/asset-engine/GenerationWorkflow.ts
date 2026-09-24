import {
 getContentBuild,
} from "./ContentBuildRepository"
import {
 recordContentBuildToolInput,
 recordContentBuildToolOutput,
 resolveContentBuildToolContext,
 type ContentBuildToolContext,
} from "./ToolContext"

export const GENERATION_WORKFLOW_SCHEMA_VERSION = 1 as const

export type GenerationMode =
 | "create"
 | "new-option"
 | "new-version"
 | "transform"

export interface GenerationContextManifest {
 schemaVersion: typeof GENERATION_WORKFLOW_SCHEMA_VERSION
 id: string
 contentBuildId: string
 contentBuildRevision: number
 projectId: string | null
 channelId: string | null
 toolId: string
 requestedSlots: string[]
 selectedAssetIds: string[]
 sourceAssetIds: string[]
 evidenceIds: string[]
 createdAt: string
}

export interface GenerationRequest {
 schemaVersion: typeof GENERATION_WORKFLOW_SCHEMA_VERSION
 id: string
 contentBuildId: string
 projectId: string | null
 channelId: string | null
 toolId: string
 operation: string
 targetSlot: string
 mode: GenerationMode
 sourceAssetIds: string[]
 evidenceIds: string[]
 contextManifestId: string
 contextRevision: number
 creatorIntent: string
 constraints: Record<string, unknown>
 outputSpec: Record<string, unknown>
 parentAssetId: string | null
 variantGroupId: string | null
 traceId: string | null
 requestedAt: string
}

export interface PreparedGenerationRequest {
 request: GenerationRequest
 contextManifest: GenerationContextManifest
 context: ContentBuildToolContext
}

export interface ToolReceipt {
 schemaVersion: typeof GENERATION_WORKFLOW_SCHEMA_VERSION
 id: string
 requestId: string
 contentBuildId: string
 projectId: string | null
 toolId: string
 inputAssetIds: string[]
 outputAssetIds: string[]
 evidenceIds: string[]
 generationRecordId: string | null
 versionIds: string[]
 variantGroupId: string | null
 relationshipIds: string[]
 traceId: string | null
 completedAt: string
}

const createId = (prefix: string): string => {
 if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
  return `${prefix}_${crypto.randomUUID()}`
 }
 return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

const unique = (values: Array<string | null | undefined>): string[] =>
 [...new Set(values.filter((value): value is string => Boolean(value)))]

const assertCanonicalScope = (input: {
 contentBuildId: string
 channelId?: string | null
 projectId?: string | null
}) => {
 const build = getContentBuild(input.contentBuildId)
 if (!build) {
  throw new Error(`Unknown ContentBuild: ${input.contentBuildId}`)
 }

 if (input.channelId && build.channelId && input.channelId !== build.channelId) {
  throw new Error(
   `GenerationRequest channel scope mismatch for ContentBuild ${build.id}: expected ${build.channelId}, received ${input.channelId}.`,
  )
 }

 if (
  input.projectId &&
  build.legacyProjectId &&
  input.projectId !== build.legacyProjectId
 ) {
  throw new Error(
   `GenerationRequest project scope mismatch for ContentBuild ${build.id}: expected ${build.legacyProjectId}, received ${input.projectId}.`,
  )
 }

 return build
}

export const prepareGenerationRequest = (input: {
 contentBuildId: string
 channelId?: string | null
 projectId?: string | null
 toolId: string
 operation: string
 targetSlot: string
 mode: GenerationMode
 creatorIntent: string
 requestedSlots?: string[]
 sourceAssetIds?: string[]
 evidenceIds?: string[]
 constraints?: Record<string, unknown>
 outputSpec?: Record<string, unknown>
 parentAssetId?: string | null
 variantGroupId?: string | null
 traceId?: string | null
}): PreparedGenerationRequest => {
 const canonicalBuild = assertCanonicalScope(input)
 const channelId = canonicalBuild.channelId || input.channelId || null
 const projectId = canonicalBuild.legacyProjectId || input.projectId || null
 const requestedSlots = unique(input.requestedSlots || [input.targetSlot])
 const sourceAssetIds = unique(input.sourceAssetIds || [])
 const evidenceIds = unique(input.evidenceIds || [])

 const context = resolveContentBuildToolContext({
  contentBuildId: canonicalBuild.id,
  channelId,
  projectId,
  projectName: canonicalBuild.legacyProjectName || null,
  videoId: canonicalBuild.youtube?.videoId || null,
  toolId: input.toolId,
  requestedSlots,
  evidenceIds,
 })

 if (!context) {
  throw new Error(
   `Unable to resolve generation context for ContentBuild ${canonicalBuild.id}.`,
  )
 }

 const timestamp = new Date().toISOString()
 const contextManifest: GenerationContextManifest = {
  schemaVersion: GENERATION_WORKFLOW_SCHEMA_VERSION,
  id: createId("context"),
  contentBuildId: canonicalBuild.id,
  contentBuildRevision: canonicalBuild.revision,
  projectId,
  channelId,
  toolId: input.toolId,
  requestedSlots,
  selectedAssetIds: unique(
   Object.values(context.selectedAssets).map((asset) => asset?.id),
  ),
  sourceAssetIds,
  evidenceIds,
  createdAt: timestamp,
 }

 const request: GenerationRequest = {
  schemaVersion: GENERATION_WORKFLOW_SCHEMA_VERSION,
  id: createId("generation_request"),
  contentBuildId: canonicalBuild.id,
  projectId,
  channelId,
  toolId: input.toolId,
  operation: input.operation,
  targetSlot: input.targetSlot,
  mode: input.mode,
  sourceAssetIds,
  evidenceIds,
  contextManifestId: contextManifest.id,
  contextRevision: canonicalBuild.revision,
  creatorIntent: input.creatorIntent,
  constraints: input.constraints || {},
  outputSpec: input.outputSpec || {},
  parentAssetId: input.parentAssetId || null,
  variantGroupId: input.variantGroupId || null,
  traceId: input.traceId || null,
  requestedAt: timestamp,
 }

 recordContentBuildToolInput({
  contentBuildId: request.contentBuildId,
  toolId: request.toolId,
  assetIds: unique([
   ...contextManifest.selectedAssetIds,
   ...request.sourceAssetIds,
  ]),
  evidenceIds: request.evidenceIds,
  traceId: request.traceId,
  summary: request.creatorIntent,
  metadata: {
   requestId: request.id,
   contextManifestId: request.contextManifestId,
   contextRevision: request.contextRevision,
   operation: request.operation,
   targetSlot: request.targetSlot,
   mode: request.mode,
   requestedSlots: contextManifest.requestedSlots,
   parentAssetId: request.parentAssetId,
   variantGroupId: request.variantGroupId,
   generationRequest: request,
   contextManifest,
  },
 })

 return {
  request,
  contextManifest,
  context,
 }
}

export const recordToolReceipt = (input: {
 request: GenerationRequest
 outputAssetIds?: string[]
 generationRecordId?: string | null
 versionIds?: string[]
 variantGroupId?: string | null
 relationshipIds?: string[]
 traceId?: string | null
 summary?: string
 metadata?: Record<string, unknown>
}): ToolReceipt => {
 const build = getContentBuild(input.request.contentBuildId)
 if (!build) {
  throw new Error(`Unknown ContentBuild: ${input.request.contentBuildId}`)
 }

 const completedAt = new Date().toISOString()
 const receipt: ToolReceipt = {
  schemaVersion: GENERATION_WORKFLOW_SCHEMA_VERSION,
  id: createId("tool_receipt"),
  requestId: input.request.id,
  contentBuildId: input.request.contentBuildId,
  projectId: input.request.projectId,
  toolId: input.request.toolId,
  inputAssetIds: [...input.request.sourceAssetIds],
  outputAssetIds: unique(input.outputAssetIds || []),
  evidenceIds: [...input.request.evidenceIds],
  generationRecordId: input.generationRecordId || null,
  versionIds: unique(input.versionIds || []),
  variantGroupId: input.variantGroupId || input.request.variantGroupId || null,
  relationshipIds: unique(input.relationshipIds || []),
  traceId: input.traceId || input.request.traceId || null,
  completedAt,
 }

 recordContentBuildToolOutput({
  contentBuildId: receipt.contentBuildId,
  toolId: receipt.toolId,
  assetIds: receipt.outputAssetIds,
  evidenceIds: receipt.evidenceIds,
  generationRecordId: receipt.generationRecordId,
  traceId: receipt.traceId,
  summary: input.summary || "",
  metadata: {
   receiptId: receipt.id,
   requestId: receipt.requestId,
   contextManifestId: input.request.contextManifestId,
   contextRevision: input.request.contextRevision,
   operation: input.request.operation,
   targetSlot: input.request.targetSlot,
   mode: input.request.mode,
   versionIds: receipt.versionIds,
   variantGroupId: receipt.variantGroupId,
   relationshipIds: receipt.relationshipIds,
   toolReceipt: receipt,
   ...(input.metadata || {}),
  },
 })

 return receipt
}
