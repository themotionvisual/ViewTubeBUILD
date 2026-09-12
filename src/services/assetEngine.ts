import type { GenerationArtifact, SuperToolId, VaultAsset, VaultAssetKind } from "@/types"
import { createGenerationRecord, updateGenerationRecord } from "./generationStore"
import { ingestGenerationArtifacts, listVaultAssets, searchVaultAssets } from "./vaultAdapter"
import {
 createViewTubeActionPacket,
 persistViewTubeActionPacket,
 type ViewTubeActionPacket,
 type ViewTubePayloadKind,
 type ViewTubeToolKind,
} from "./viewTubeToolChains"

/**
 * Canonical Asset Engine
 *
 * The Asset Engine is the standard vehicle between ViewTube systems. Tools do
 * not pass anonymous blobs directly to one another. They create/resolve an
 * asset envelope, preserve evidence + provenance, persist the artifact in the
 * Vault, and use an ActionPacket for the next tool boundary.
 *
 * BrainRuntime remains the reasoning/orchestration owner; Vault remains the
 * canonical artifact owner; ActionPacket/Handoff remains transport. This
 * service is the connective workflow facade over those canonical owners.
 */
export type AssetEngineStage =
 | "idea" | "evidence" | "research" | "concept" | "outline" | "script"
 | "visual-plan" | "production" | "metadata" | "priming" | "publish"
 | "monitor" | "evaluation" | "learning"

export interface AssetEvidenceRef {
 id: string
 source?: string
 grain?: string
 freshness?: string
 confidence?: number
}

export interface AssetEngineContext {
 channelId?: string | null
 projectId?: string | null
 projectName?: string | null
 videoId?: string | null
 stage?: AssetEngineStage
 evidence?: AssetEvidenceRef[]
 provenance?: string[]
 parentAssetIds?: string[]
 traceId?: string | null
}

export interface CreateAssetInput {
 sourceToolId: string
 sourceKind: ViewTubeToolKind
 payloadKind: ViewTubePayloadKind
 name: string
 summary?: string
 kind: VaultAssetKind
 artifactKind?: GenerationArtifact["kind"]
 payload?: unknown
 url?: string | null
 mimeType?: string | null
 tags?: string[]
 context?: AssetEngineContext
 metadata?: Record<string, unknown>
}

export interface AssetEngineResult {
 asset: VaultAsset
 generationRecordId: string
 artifactId: string
}

const evidenceIds = (context?: AssetEngineContext) => (context?.evidence || []).map(item => item.id)

export const createAsset = (input: CreateAssetInput): AssetEngineResult => {
 const context = input.context || {}
 const record = createGenerationRecord({
  toolId: input.sourceToolId as SuperToolId,
  provider: "mock",
  model: "viewtube-asset-engine-v1",
  prompt: JSON.stringify({
   operation: "create-asset",
   sourceToolId: input.sourceToolId,
   payloadKind: input.payloadKind,
   projectId: context.projectId || null,
   videoId: context.videoId || null,
   evidenceIds: evidenceIds(context),
  }),
  status: "running",
  artifacts: [],
  metadata: {
   assetEngine: true,
   traceId: context.traceId || null,
   stage: context.stage || null,
   evidence: context.evidence || [],
   provenance: context.provenance || [],
   parentAssetIds: context.parentAssetIds || [],
  },
 })

 const artifact: GenerationArtifact = {
  id: crypto.randomUUID(),
  kind: input.artifactKind || (input.kind as GenerationArtifact["kind"]),
  label: input.name,
  sourceRecordId: record.id,
  url: input.url || undefined,
  mimeType: input.mimeType || undefined,
  metadata: {
   ...(input.metadata || {}),
   payload: input.payload,
   payloadKind: input.payloadKind,
   channelId: context.channelId || null,
   projectId: context.projectId || null,
   videoId: context.videoId || null,
   stage: context.stage || null,
   evidence: context.evidence || [],
   provenance: context.provenance || [],
   parentAssetIds: context.parentAssetIds || [],
   traceId: context.traceId || null,
  },
 }

 updateGenerationRecord(record.id, {
  status: "complete",
  outputText: input.summary || input.name,
  outputJson: { payload: input.payload } as Record<string, unknown>,
  artifacts: [artifact],
  usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
  estimatedCostCents: 0,
 })

 const [asset] = ingestGenerationArtifacts([artifact], {
  toolId: input.sourceToolId as SuperToolId,
  projectId: context.projectId || null,
  projectName: context.projectName || null,
  generationId: record.id,
  tags: [...(input.tags || []), "asset-engine", input.payloadKind, context.stage || "unscoped"],
 })

 return { asset, generationRecordId: record.id, artifactId: artifact.id }
}

export interface HandoffAssetInput<T = unknown> {
 asset: VaultAsset
 sourceToolId: string
 sourceKind: ViewTubeToolKind
 payloadKind: ViewTubePayloadKind
 title?: string
 summary?: string
 payload?: T
 context?: AssetEngineContext
 suggestedTargets?: string[]
}

export const handoffAsset = <T,>(input: HandoffAssetInput<T>) => {
 const context = input.context || {}
 const packet: ViewTubeActionPacket<T | Record<string, unknown>> = createViewTubeActionPacket({
  sourceToolId: input.sourceToolId,
  sourceKind: input.sourceKind,
  payloadKind: input.payloadKind,
  title: input.title || input.asset.name,
  summary: input.summary || `Asset Engine handoff: ${input.asset.name}`,
  payload: input.payload ?? ({ assetId: input.asset.id, asset: input.asset } as Record<string, unknown>),
  projectId: context.projectId || input.asset.projectId || null,
  channelId: context.channelId || null,
  videoId: context.videoId || null,
  evidence: evidenceIds(context),
  provenance: [input.asset.id, ...(context.provenance || [])],
  suggestedTargets: input.suggestedTargets,
 })
 return persistViewTubeActionPacket(packet)
}

export const createAndHandoffAsset = <T,>(
 input: CreateAssetInput & { handoffPayload?: T; suggestedTargets?: string[] },
) => {
 const created = createAsset(input)
 const handoff = handoffAsset({
  asset: created.asset,
  sourceToolId: input.sourceToolId,
  sourceKind: input.sourceKind,
  payloadKind: input.payloadKind,
  title: input.name,
  summary: input.summary,
  payload: input.handoffPayload,
  context: input.context,
  suggestedTargets: input.suggestedTargets,
 })
 return { ...created, handoff }
}

export const resolveAssets = (input: Parameters<typeof searchVaultAssets>[0] = {}) => searchVaultAssets(input)
export const listAssets = () => listVaultAssets()

export const getAssetLineage = (assetId: string): VaultAsset[] => {
 const all = listVaultAssets()
 const byId = new Map(all.map(asset => [asset.id, asset]))
 const seen = new Set<string>()
 const output: VaultAsset[] = []
 const visit = (id: string) => {
  if (seen.has(id)) return
  seen.add(id)
  const asset = byId.get(id)
  if (!asset) return
  output.push(asset)
  const parents = Array.isArray(asset.metadata?.parentAssetIds) ? asset.metadata.parentAssetIds : []
  parents.forEach(parent => typeof parent === "string" && visit(parent))
 }
 visit(assetId)
 return output
}
