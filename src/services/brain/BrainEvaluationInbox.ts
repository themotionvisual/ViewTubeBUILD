import { listDueAlgorithmEvaluations, summarizeAlgorithmLearningLoop } from "./BrainEvaluationLoop"
import { getAlgorithmEventLineage, listAlgorithmIntelligenceEvents, type AlgorithmIntelligenceEvent } from "./AlgorithmIntelligenceEventLedger"
import { listAlgorithmLearningCandidatesForReview, summarizeAlgorithmLearningGovernance } from "./AlgorithmLearningGovernance"
import type { AlgorithmEvaluationResult } from "./AlgorithmEvaluationEngine"

export type BrainEvaluationInboxItemKind =
 | "overdue_checkpoint"
 | "insufficient_data"
 | "measured_outcome"
 | "learning_review"

export type BrainEvaluationInboxPriority = "critical" | "high" | "medium" | "low"

export interface BrainEvaluationInboxItem {
 id: string
 kind: BrainEvaluationInboxItemKind
 priority: BrainEvaluationInboxPriority
 channelId: string
 projectId?: string | null
 videoId?: string | null
 title: string
 summary: string
 sourceEventId: string
 recommendationId?: string | null
 actionPacketId?: string | null
 workflowId?: string | null
 evidenceIds: string[]
 createdAt: number
 dueAt?: number | null
 overdueByMs?: number | null
 requiredMetrics: string[]
 lineageEventIds: string[]
 metadata: Record<string, unknown>
}

const outcomePriority = (evaluation: AlgorithmEvaluationResult | null): BrainEvaluationInboxPriority => {
 if (!evaluation) return "low"
 if (evaluation.status === "negative") return "critical"
 if (evaluation.status === "mixed") return "high"
 if (evaluation.status === "positive") return "medium"
 return "low"
}

const measuredOutcomeItems = (channelId: string): BrainEvaluationInboxItem[] =>
 listAlgorithmIntelligenceEvents({ channelId, kind: "OUTCOME_MEASURED" })
  .filter((event) => {
   const status = (event.metadata?.evaluation as AlgorithmEvaluationResult | undefined)?.status
   return status && status !== "insufficient_data" && status !== "pending"
  })
  .map((event) => {
   const evaluation = (event.metadata?.evaluation as AlgorithmEvaluationResult | undefined) || null
   return {
    id: `evaluation-inbox:outcome:${event.id}`,
    kind: "measured_outcome" as const,
    priority: outcomePriority(evaluation),
    channelId,
    projectId: event.projectId,
    videoId: event.videoId,
    title: event.title,
    summary: event.summary,
    sourceEventId: event.id,
    recommendationId: event.recommendationId,
    actionPacketId: event.actionPacketId,
    workflowId: event.workflowId,
    evidenceIds: event.evidenceIds,
    createdAt: event.createdAt,
    requiredMetrics: event.evaluationTargets.map((target) => target.metric),
    lineageEventIds: getAlgorithmEventLineage(event.id).map((candidate) => candidate.id),
    metadata: { evaluation },
   }
  })

const insufficientDataItems = (channelId: string): BrainEvaluationInboxItem[] => {
 const terminalParents = new Set(
  listAlgorithmIntelligenceEvents({ channelId, kind: "OUTCOME_MEASURED" })
   .filter((event) => {
    const status = (event.metadata?.evaluation as AlgorithmEvaluationResult | undefined)?.status
    return status && status !== "insufficient_data" && status !== "pending"
   })
   .flatMap((event) => event.parentEventIds),
 )
 return listAlgorithmIntelligenceEvents({ channelId, kind: "OUTCOME_MEASURED" })
  .filter((event) => (event.metadata?.evaluation as AlgorithmEvaluationResult | undefined)?.status === "insufficient_data")
  .filter((event) => !event.parentEventIds.some((id) => terminalParents.has(id)))
  .map((event) => ({
   id: `evaluation-inbox:insufficient:${event.id}`,
   kind: "insufficient_data" as const,
   priority: "high" as const,
   channelId,
   projectId: event.projectId,
   videoId: event.videoId,
   title: `Needs evidence: ${event.title.replace(/^Evaluation:\s*/, "")}`,
   summary: "The checkpoint was reached, but canonical analytics or workflow evidence is still missing. Retry after the relevant sync, import, or tool outcome is available.",
   sourceEventId: event.id,
   recommendationId: event.recommendationId,
   actionPacketId: event.actionPacketId,
   workflowId: event.workflowId,
   evidenceIds: event.evidenceIds,
   createdAt: event.createdAt,
   requiredMetrics: event.evaluationTargets.map((target) => target.metric),
   lineageEventIds: getAlgorithmEventLineage(event.id).map((candidate) => candidate.id),
   metadata: { evaluation: event.metadata?.evaluation || null },
  }))
}

const dueItems = (channelId: string, now: number): BrainEvaluationInboxItem[] =>
 listDueAlgorithmEvaluations({ channelId, now, maximum: 100 }).map(({ event, dueAt, overdueByMs, requiredMetrics }) => ({
  id: `evaluation-inbox:due:${event.id}`,
  kind: "overdue_checkpoint" as const,
  priority: overdueByMs >= 72 * 60 * 60 * 1000 ? "critical" as const : overdueByMs >= 24 * 60 * 60 * 1000 ? "high" as const : "medium" as const,
  channelId,
  projectId: event.projectId,
  videoId: event.videoId,
  title: `Evaluate: ${event.title}`,
  summary: `Checkpoint is overdue by ${Math.round(overdueByMs / 3600000)}h and requires ${requiredMetrics.join(", ") || "declared outcome evidence"}.`,
  sourceEventId: event.id,
  recommendationId: event.recommendationId,
  actionPacketId: event.actionPacketId,
  workflowId: event.workflowId,
  evidenceIds: event.evidenceIds,
  createdAt: event.createdAt,
  dueAt,
  overdueByMs,
  requiredMetrics,
  lineageEventIds: getAlgorithmEventLineage(event.id).map((candidate) => candidate.id),
  metadata: {},
 }))

const learningItems = (channelId: string): BrainEvaluationInboxItem[] =>
 listAlgorithmLearningCandidatesForReview(channelId)
  .filter((row) => !row.review || row.review.decision === "hold")
  .map(({ candidate, sourceEvent, review }) => ({
   id: `evaluation-inbox:learning:${candidate.id}`,
   kind: "learning_review" as const,
   priority: candidate.confidence === "high" ? "high" as const : "medium" as const,
   channelId,
   title: "Review measured channel learning",
   summary: candidate.statement,
   sourceEventId: sourceEvent.id,
   evidenceIds: candidate.evidenceIds,
   createdAt: sourceEvent.createdAt,
   requiredMetrics: [],
   lineageEventIds: getAlgorithmEventLineage(sourceEvent.id).map((event) => event.id),
   metadata: { candidate, review: review || null },
  }))

const priorityRank: Record<BrainEvaluationInboxPriority, number> = { critical: 4, high: 3, medium: 2, low: 1 }

export const buildBrainEvaluationInbox = (input: {
 channelId: string
 now?: number
 includeMeasuredOutcomes?: boolean
 maximum?: number
}) => {
 const now = input.now || Date.now()
 const items = [
  ...dueItems(input.channelId, now),
  ...insufficientDataItems(input.channelId),
  ...learningItems(input.channelId),
  ...(input.includeMeasuredOutcomes === false ? [] : measuredOutcomeItems(input.channelId)),
 ]
  .sort((left, right) => priorityRank[right.priority] - priorityRank[left.priority] || right.createdAt - left.createdAt)
  .slice(0, Math.max(1, Math.min(250, input.maximum || 100)))

 return {
  channelId: input.channelId,
  generatedAt: now,
  items,
  counts: {
   total: items.length,
   critical: items.filter((item) => item.priority === "critical").length,
   overdue: items.filter((item) => item.kind === "overdue_checkpoint").length,
   insufficientData: items.filter((item) => item.kind === "insufficient_data").length,
   measuredOutcomes: items.filter((item) => item.kind === "measured_outcome").length,
   learningReviews: items.filter((item) => item.kind === "learning_review").length,
  },
  learningLoop: summarizeAlgorithmLearningLoop(input.channelId),
  governance: summarizeAlgorithmLearningGovernance(input.channelId),
 }
}

export const getBrainEvaluationAttribution = (eventId: string): {
 event: AlgorithmIntelligenceEvent | null
 lineage: AlgorithmIntelligenceEvent[]
} => {
 const event = listAlgorithmIntelligenceEvents().find((candidate) => candidate.id === eventId) || null
 return { event, lineage: event ? getAlgorithmEventLineage(event.id) : [] }
}
