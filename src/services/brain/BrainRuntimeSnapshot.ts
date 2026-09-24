import type { Project } from "../../types"
import {
 listContentBuildEvents,
 listContentBuilds,
} from "../asset-engine/ContentBuildRepository"
import type {
 ContentBuildEvent,
 ContentBuildSnapshot,
} from "../asset-engine/contracts"
import type {
 GenerationContextManifest,
 GenerationRequest,
 ToolReceipt,
} from "../asset-engine/GenerationWorkflow"
import {
 BRAIN_CAPABILITY_REGISTRY,
} from "./BrainCapabilityRegistry"
import {
 listBrainTraces,
 type BrainTrace,
} from "./BrainTrace"
import {
 summarizeBrainOutcomes,
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
}

const DEFAULT_SOURCES: BrainRuntimeSnapshotSources = {
 listContentBuilds,
 listContentBuildEvents,
 listBrainTraces,
 summarizeBrainOutcomes,
 capabilityCount: BRAIN_CAPABILITY_REGISTRY.length,
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
  lifecycle: summarizeLifecycle(events),
 }
}
