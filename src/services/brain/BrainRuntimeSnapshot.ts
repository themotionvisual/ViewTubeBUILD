import type { GenerationRecord, Project } from "../../types"
import {
 listContentBuildEvents,
 listContentBuilds,
} from "../asset-engine/ContentBuildRepository"
import type {
 ContentBuildEvent,
 ContentBuildSnapshot,
} from "../asset-engine/contracts"
import { listGenerationRecords } from "../generationStore"
import type {
 GenerationContextManifest,
 GenerationRequest,
 ToolReceipt,
} from "../asset-engine/GenerationWorkflow"
import {
 BRAIN_CAPABILITY_REGISTRY,
} from "./BrainCapabilityRegistry"
import {
 listAlgorithmIntelligenceEvents,
 type AlgorithmIntelligenceEvent,
} from "./AlgorithmIntelligenceEventLedger"
import {
 listBrainTraces,
 type BrainTrace,
} from "./BrainTrace"
import {
 listBrainOutcomes,
 summarizeBrainOutcomes,
 type BrainOutcomeRecord,
} from "./BrainOutcomeLedger"

export interface BrainRuntimeProjectSummary {
 id: string
 name: string
 status: string
}

export interface BrainRuntimeBuildSummary {
 id: string
 stage: string
 revision: number
 assetCount: number
 versionCount: number
 variantGroupCount: number
 relationCount: number
 selectedSlotCount: number
 eventCount: number
 youtubeStatus: string | null
 blockerCount: number
}

export interface BrainRuntimeRequestSummary {
 id: string
 toolId: string
 operation: string
 targetSlot: string
 mode: string
 contextManifestId: string
 contextRevision: number
 requestedAt: string
 requestedSlotCount: number
 selectedAssetCount: number
 sourceAssetCount: number
 evidenceCount: number
}

export interface BrainRuntimeReceiptSummary {
 id: string
 requestId: string
 toolId: string
 completedAt: string
 outputAssetCount: number
 versionCount: number
 relationshipCount: number
 variantGroupId: string | null
 generationRecordId: string | null
}

export interface BrainRuntimeTraceSummary {
 id: string
 kind: string
 status: string
 intent: string | null
 capabilityCount: number
 evidenceReturned: number
 evidenceMissing: number
 latencyMs: number | null
 modelServed: string | null
 promptVersionCount: number
 repairAttempts: number
 gradeAverage: number | null
 outputRef: string | null
}

export interface BrainRuntimeProvenanceChain {
 requestId: string
 requestedAt: string
 contextManifestId: string
 receiptId: string | null
 traceId: string | null
 contentBuildId: string
 projectId: string | null
 generationRecordId: string | null
 generationProvider: string | null
 generationModel: string | null
 outputAssetIds: string[]
 actionPacketIds: string[]
 workflowIds: string[]
 brainOutcomeIds: string[]
 algorithmEventIds: string[]
 evaluationEventIds: string[]
 learningCandidateEventIds: string[]
 learningReviewEventIds: string[]
 learningPromotionEventIds: string[]
 traceOutputMatchesGenerationRecord: boolean | null
 unresolved: string[]
}

export interface BrainRuntimeProvenanceSummary {
 chainCount: number
 unresolvedChainCount: number
 attributedOutcomeChainCount: number
 evaluatedChainCount: number
 learningChainCount: number
 latestChain: BrainRuntimeProvenanceChain | null
}

export interface BrainRuntimeLifecycleSummary {
 latestEventType: string | null
 latestEventAt: string | null
 publishEventCount: number
 analyticsCheckpointCount: number
 commentEventCount: number
 experimentEventCount: number
 learningEventCount: number
}

export interface BrainRuntimeOutcomeSummary {
 total: number
 accepted: number
 negative: number
 acceptanceRate: number
 completed: number
 corrected: number
 rejected: number
 abandoned: number
}

export interface BrainRuntimeSnapshot {
 project: BrainRuntimeProjectSummary | null
 build: BrainRuntimeBuildSummary | null
 generation: {
  requestCount: number
  receiptCount: number
  latestRequest: BrainRuntimeRequestSummary | null
  latestReceipt: BrainRuntimeReceiptSummary | null
 }
 brain: {
  capabilityCount: number
  traceCount: number
  latestTrace: BrainRuntimeTraceSummary | null
 }
 outcomes: BrainRuntimeOutcomeSummary
 provenance: BrainRuntimeProvenanceSummary
 lifecycle: BrainRuntimeLifecycleSummary
}

export interface BrainRuntimeSnapshotInput {
 channelId?: string | null
 activeProjectId?: string | null
 projects: Array<Pick<Project, "id" | "name" | "status" | "contentBuildId">>
}

export interface BrainRuntimeSnapshotSources {
 listContentBuilds: () => ContentBuildSnapshot[]
 listContentBuildEvents: (contentBuildId: string) => ContentBuildEvent[]
 listBrainTraces: (channelId?: string | null) => BrainTrace[]
 summarizeBrainOutcomes: (channelId?: string | null) => BrainRuntimeOutcomeSummary
 capabilityCount: number
 listGenerationRecords?: () => GenerationRecord[]
 listBrainOutcomes?: (channelId?: string | null) => BrainOutcomeRecord[]
 listAlgorithmIntelligenceEvents?: () => AlgorithmIntelligenceEvent[]
}

const DEFAULT_SOURCES: BrainRuntimeSnapshotSources = {
 listContentBuilds,
 listContentBuildEvents,
 listBrainTraces,
 summarizeBrainOutcomes,
 capabilityCount: BRAIN_CAPABILITY_REGISTRY.length,
 listGenerationRecords,
 listBrainOutcomes,
 listAlgorithmIntelligenceEvents: () => listAlgorithmIntelligenceEvents(),
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
 Boolean(value) && typeof value === "object" && !Array.isArray(value)

const generationRequestFromEvent = (
 event: ContentBuildEvent,
): GenerationRequest | null => {
 const metadata = isRecord(event.metadata) ? event.metadata : null
 const value = metadata?.generationRequest
 return isRecord(value) && typeof value.id === "string"
  ? value as unknown as GenerationRequest
  : null
}

const contextManifestFromEvent = (
 event: ContentBuildEvent,
): GenerationContextManifest | null => {
 const metadata = isRecord(event.metadata) ? event.metadata : null
 const value = metadata?.contextManifest
 return isRecord(value) && typeof value.id === "string"
  ? value as unknown as GenerationContextManifest
  : null
}

const toolReceiptFromEvent = (
 event: ContentBuildEvent,
): ToolReceipt | null => {
 const metadata = isRecord(event.metadata) ? event.metadata : null
 const value = metadata?.toolReceipt
 return isRecord(value) && typeof value.id === "string"
  ? value as unknown as ToolReceipt
  : null
}

const selectActiveProject = (
 input: BrainRuntimeSnapshotInput,
): BrainRuntimeSnapshotInput["projects"][number] | null => {
 if (!input.activeProjectId) return null
 return input.projects.find(project => project.id === input.activeProjectId) || null
}

const selectContentBuild = (
 builds: ContentBuildSnapshot[],
 project: BrainRuntimeSnapshotInput["projects"][number] | null,
 channelId?: string | null,
): ContentBuildSnapshot | null => {
 if (project?.contentBuildId) {
  const direct = builds.find(build => build.id === project.contentBuildId)
  if (direct) return direct
 }

 if (project) {
  const byProject = builds.find(build => build.legacyProjectId === project.id)
  if (byProject) return byProject
 }

 if (channelId) {
  const byChannel = builds.find(build => build.channelId === channelId)
  if (byChannel) return byChannel
 }

 return null
}

const summarizeRequest = (
 request: GenerationRequest,
 manifest: GenerationContextManifest | null,
): BrainRuntimeRequestSummary => ({
 id: request.id,
 toolId: request.toolId,
 operation: request.operation,
 targetSlot: request.targetSlot,
 mode: request.mode,
 contextManifestId: request.contextManifestId,
 contextRevision: request.contextRevision,
 requestedAt: request.requestedAt,
 requestedSlotCount: manifest?.requestedSlots?.length || 0,
 selectedAssetCount: manifest?.selectedAssetIds?.length || 0,
 sourceAssetCount: request.sourceAssetIds?.length || 0,
 evidenceCount: request.evidenceIds?.length || 0,
})

const summarizeReceipt = (
 receipt: ToolReceipt,
): BrainRuntimeReceiptSummary => ({
 id: receipt.id,
 requestId: receipt.requestId,
 toolId: receipt.toolId,
 completedAt: receipt.completedAt,
 outputAssetCount: receipt.outputAssetIds?.length || 0,
 versionCount: receipt.versionIds?.length || 0,
 relationshipCount: receipt.relationshipIds?.length || 0,
 variantGroupId: receipt.variantGroupId || null,
 generationRecordId: receipt.generationRecordId || null,
})

const metadataString = (
 metadata: Record<string, unknown> | undefined,
 key: string,
): string | null => {
 const value = metadata?.[key]
 return typeof value === "string" && value ? value : null
}

const uniqueStrings = (values: Array<string | null | undefined>): string[] =>
 [...new Set(values.filter((value): value is string => Boolean(value)))]

const eventExplicitlyMatchesRequest = (
 event: ContentBuildEvent,
 request: GenerationRequest,
 receipt: ToolReceipt | null,
 traceId: string | null,
 generationRecordId: string | null,
): boolean => {
 const metadata = isRecord(event.metadata) ? event.metadata : undefined
 const metadataRequestId = metadataString(metadata, "requestId")
 const metadataRequest = isRecord(metadata?.generationRequest)
  ? metadata.generationRequest
  : null
 const metadataReceipt = isRecord(metadata?.toolReceipt)
  ? metadata.toolReceipt
  : null

 return metadataRequestId === request.id
  || metadataRequest?.id === request.id
  || metadataReceipt?.requestId === request.id
  || Boolean(traceId && event.traceId === traceId)
  || Boolean(generationRecordId && event.generationRecordId === generationRecordId)
  || Boolean(receipt && event.entityId === receipt.id)
}

const descendantAlgorithmEvents = (
 allEvents: AlgorithmIntelligenceEvent[],
 seedIds: Set<string>,
): AlgorithmIntelligenceEvent[] => {
 const included = new Set(seedIds)
 let changed = true
 while (changed) {
  changed = false
  for (const event of allEvents) {
   if (included.has(event.id)) continue
   if (event.parentEventIds?.some(parentId => included.has(parentId))) {
    included.add(event.id)
    changed = true
   }
  }
 }
 return allEvents
  .filter(event => included.has(event.id))
  .sort((a, b) => a.createdAt - b.createdAt)
}

const buildProvenanceChain = (input: {
 request: GenerationRequest
 manifest: GenerationContextManifest | null
 receipts: ToolReceipt[]
 events: ContentBuildEvent[]
 traces: BrainTrace[]
 generationRecords: GenerationRecord[]
 brainOutcomes: BrainOutcomeRecord[]
 algorithmEvents: AlgorithmIntelligenceEvent[]
}): BrainRuntimeProvenanceChain => {
 const receipt = input.receipts
  .filter(candidate => candidate.requestId === input.request.id)
  .sort((a, b) => a.completedAt.localeCompare(b.completedAt))
  .at(-1) || null

 const traceId = receipt?.traceId || input.request.traceId || null
 const trace = traceId
  ? input.traces.find(candidate => candidate.id === traceId) || null
  : null

 const explicitGenerationRecordId = receipt?.generationRecordId || null
 const traceGenerationRecordId = trace?.outputRef
  && input.generationRecords.some(record => record.id === trace.outputRef)
  ? trace.outputRef
  : null
 const generationRecordId = explicitGenerationRecordId || traceGenerationRecordId
 const generationRecord = generationRecordId
  ? input.generationRecords.find(record => record.id === generationRecordId) || null
  : null

 const relatedEvents = input.events.filter(event =>
  eventExplicitlyMatchesRequest(
   event,
   input.request,
   receipt,
   traceId,
   generationRecordId,
  )
 )

 const actionPacketIds = uniqueStrings([
  ...relatedEvents.map(event => event.actionPacketId),
  metadataString(generationRecord?.metadata, "actionPacketId"),
 ])
 let workflowIds = uniqueStrings([
  metadataString(generationRecord?.metadata, "workflowId"),
 ])

 const matchedOutcomes = input.brainOutcomes
  .filter(outcome =>
   Boolean(outcome.actionPacketId && actionPacketIds.includes(outcome.actionPacketId))
   || Boolean(outcome.workflowId && workflowIds.includes(outcome.workflowId))
  )
  .sort((a, b) => a.createdAt - b.createdAt)

 workflowIds = uniqueStrings([
  ...workflowIds,
  ...matchedOutcomes.map(outcome => outcome.workflowId),
 ])

 const directAlgorithmEvents = input.algorithmEvents.filter(event =>
  Boolean(event.actionPacketId && actionPacketIds.includes(event.actionPacketId))
  || Boolean(event.workflowId && workflowIds.includes(event.workflowId))
 )
 const algorithmEvents = descendantAlgorithmEvents(
  input.algorithmEvents,
  new Set(directAlgorithmEvents.map(event => event.id)),
 )

 const unresolved: string[] = []
 if (!input.manifest) unresolved.push("context_manifest")
 if (!receipt) unresolved.push("tool_receipt")
 if (!trace) unresolved.push("trace")
 if (!generationRecord) unresolved.push("generation_record")
 if (!actionPacketIds.length && !workflowIds.length) {
  unresolved.push("outcome_attribution_key")
 }

 return {
  requestId: input.request.id,
  requestedAt: input.request.requestedAt,
  contextManifestId: input.request.contextManifestId,
  receiptId: receipt?.id || null,
  traceId,
  contentBuildId: input.request.contentBuildId,
  projectId: input.request.projectId,
  generationRecordId,
  generationProvider: generationRecord?.provider || null,
  generationModel: generationRecord?.model || null,
  outputAssetIds: uniqueStrings(receipt?.outputAssetIds || []),
  actionPacketIds,
  workflowIds,
  brainOutcomeIds: matchedOutcomes.map(outcome => outcome.id),
  algorithmEventIds: algorithmEvents.map(event => event.id),
  evaluationEventIds: algorithmEvents
   .filter(event => event.kind === "OUTCOME_MEASURED")
   .map(event => event.id),
  learningCandidateEventIds: algorithmEvents
   .filter(event => event.kind === "LEARNING_CANDIDATE_CREATED")
   .map(event => event.id),
  learningReviewEventIds: algorithmEvents
   .filter(event => event.kind === "LEARNING_CANDIDATE_REVIEWED")
   .map(event => event.id),
  learningPromotionEventIds: algorithmEvents
   .filter(event => event.kind === "LEARNING_PROMOTED")
   .map(event => event.id),
  traceOutputMatchesGenerationRecord: trace && generationRecordId
   ? trace.outputRef
    ? trace.outputRef === generationRecordId
    : null
   : null,
  unresolved,
 }
}

const buildProvenanceSummary = (input: {
 requestRecords: Array<{
  request: GenerationRequest
  manifest: GenerationContextManifest | null
 }>
 receipts: ToolReceipt[]
 events: ContentBuildEvent[]
 traces: BrainTrace[]
 generationRecords: GenerationRecord[]
 brainOutcomes: BrainOutcomeRecord[]
 algorithmEvents: AlgorithmIntelligenceEvent[]
}): BrainRuntimeProvenanceSummary => {
 const chains = input.requestRecords
  .map(({ request, manifest }) => buildProvenanceChain({
   request,
   manifest,
   receipts: input.receipts,
   events: input.events,
   traces: input.traces,
   generationRecords: input.generationRecords,
   brainOutcomes: input.brainOutcomes,
   algorithmEvents: input.algorithmEvents,
  }))
  .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))

 return {
  chainCount: chains.length,
  unresolvedChainCount: chains.filter(chain => chain.unresolved.length > 0).length,
  attributedOutcomeChainCount: chains.filter(chain => chain.brainOutcomeIds.length > 0).length,
  evaluatedChainCount: chains.filter(chain => chain.evaluationEventIds.length > 0).length,
  learningChainCount: chains.filter(chain =>
   chain.learningCandidateEventIds.length > 0
   || chain.learningReviewEventIds.length > 0
   || chain.learningPromotionEventIds.length > 0
  ).length,
  latestChain: chains[0] || null,
 }
}

const traceTimestamp = (trace: BrainTrace): number => {
 const raw = trace.completedAt || trace.createdAt
 const parsed = Date.parse(raw)
 return Number.isFinite(parsed) ? parsed : 0
}

const summarizeTrace = (
 trace: BrainTrace,
): BrainRuntimeTraceSummary => {
 const grades = Object.values(trace.grades || {})
  .filter((value): value is number => typeof value === "number" && Number.isFinite(value))
 const gradeAverage = grades.length
  ? Math.round(grades.reduce((sum, value) => sum + value, 0) / grades.length)
  : null

 return {
  id: trace.id,
  kind: trace.kind,
  status: trace.status,
  intent: trace.intent || null,
  capabilityCount: trace.capabilitiesInvoked?.length || 0,
  evidenceReturned: trace.evidence?.returned?.length || 0,
  evidenceMissing: trace.evidence?.missing?.length || 0,
  latencyMs: typeof trace.latencyMs === "number" ? trace.latencyMs : null,
  modelServed: trace.model?.served || null,
  promptVersionCount: Object.keys(trace.promptVersions || {}).length,
  repairAttempts: trace.repairAttempts || 0,
  gradeAverage,
  outputRef: trace.outputRef || null,
 }
}

const summarizeLifecycle = (
 events: ContentBuildEvent[],
): BrainRuntimeLifecycleSummary => {
 const latest = events.length ? events[events.length - 1] : null
 return {
  latestEventType: latest?.eventType || null,
  latestEventAt: latest?.timestamp || null,
  publishEventCount: events.filter(event => event.eventType.startsWith("publish.transaction.")).length,
  analyticsCheckpointCount: events.filter(event => event.eventType === "analytics.checkpoint").length,
  commentEventCount: events.filter(event => event.eventType.startsWith("comment.")).length,
  experimentEventCount: events.filter(event => event.eventType.startsWith("experiment.")).length,
  learningEventCount: events.filter(event => event.eventType === "learning.candidate.created").length,
 }
}

export const readBrainRuntimeSnapshot = (
 input: BrainRuntimeSnapshotInput,
 sources: BrainRuntimeSnapshotSources = DEFAULT_SOURCES,
): BrainRuntimeSnapshot => {
 const project = selectActiveProject(input)
 const build = selectContentBuild(
  sources.listContentBuilds(),
  project,
  input.channelId,
 )
 const events = build ? sources.listContentBuildEvents(build.id) : []

 const requestRecords = events
  .map(event => ({
   request: generationRequestFromEvent(event),
   manifest: contextManifestFromEvent(event),
  }))
  .filter((entry): entry is {
   request: GenerationRequest
   manifest: GenerationContextManifest | null
  } => Boolean(entry.request))

 const receipts = events
  .map(toolReceiptFromEvent)
  .filter((receipt): receipt is ToolReceipt => Boolean(receipt))

 const latestRequestRecord = requestRecords.length
  ? requestRecords[requestRecords.length - 1]
  : null
 const latestReceipt = receipts.length ? receipts[receipts.length - 1] : null

 const traces = sources.listBrainTraces(input.channelId)
  .slice()
  .sort((a, b) => traceTimestamp(b) - traceTimestamp(a))
 const latestTrace = traces[0] || null
 const generationRecords = sources.listGenerationRecords?.() || []
 const brainOutcomes = sources.listBrainOutcomes?.(input.channelId) || []
 const algorithmEvents = (sources.listAlgorithmIntelligenceEvents?.() || [])
  .filter(event => !input.channelId || event.channelId === input.channelId)
  .filter(event => !project || !event.projectId || event.projectId === project.id)

 const provenance = buildProvenanceSummary({
  requestRecords,
  receipts,
  events,
  traces,
  generationRecords,
  brainOutcomes,
  algorithmEvents,
 })

 return {
  project: project
   ? {
      id: project.id,
      name: project.name,
      status: project.status,
     }
   : null,
  build: build
   ? {
      id: build.id,
      stage: build.stage,
      revision: build.revision,
      assetCount: build.assetIds?.length || 0,
      versionCount: build.versions?.length || 0,
      variantGroupCount: build.variantGroups?.length || 0,
      relationCount: build.relations?.length || 0,
      selectedSlotCount: Object.values(build.selections || {}).filter(Boolean).length,
      eventCount: events.length,
      youtubeStatus: build.youtube?.status || null,
      blockerCount: build.workflow?.blockerIds?.length || 0,
     }
   : null,
  generation: {
   requestCount: requestRecords.length,
   receiptCount: receipts.length,
   latestRequest: latestRequestRecord
    ? summarizeRequest(latestRequestRecord.request, latestRequestRecord.manifest)
    : null,
   latestReceipt: latestReceipt ? summarizeReceipt(latestReceipt) : null,
  },
  brain: {
   capabilityCount: sources.capabilityCount,
   traceCount: traces.length,
   latestTrace: latestTrace ? summarizeTrace(latestTrace) : null,
  },
  outcomes: sources.summarizeBrainOutcomes(input.channelId),
  provenance,
  lifecycle: summarizeLifecycle(events),
 }
}
