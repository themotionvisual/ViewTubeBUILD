import {
 listBrainOutcomesForTrace,
 type BrainOutcomeKind,
 type BrainOutcomeRecord,
} from "./BrainOutcomeLedger"
import {
 listBrainTraces,
 type BrainTrace,
} from "./BrainTrace"
import {
 listAlgorithmIntelligenceEvents,
 type AlgorithmIntelligenceEvent,
} from "./AlgorithmIntelligenceEventLedger"
import type { AlgorithmEvaluationResult } from "./AlgorithmEvaluationEngine"

export type BrainCreatorDecision =
 | "pending"
 | "positive"
 | "negative"
 | "corrective"
 | "mixed"

export type BrainMeasuredPerformanceState =
 | "not_measured"
 | "positive"
 | "neutral"
 | "negative"
 | "mixed"
 | "insufficient_data"

export type BrainOutcomeEvaluationState =
 | "pending"
 | "creator_positive_unmeasured"
 | "creator_negative_unmeasured"
 | "creator_corrective_unmeasured"
 | "creator_mixed_unmeasured"
 | "measured_positive"
 | "measured_neutral"
 | "measured_negative"
 | "measured_mixed"
 | "measured_insufficient_data"

export type BrainCreatorPerformanceAlignment =
 | "aligned"
 | "conflicted"
 | "not_applicable"
 | "unknown"

export type BrainLearningDisposition =
 | "hold"
 | "hold_for_measurement"
 | "candidate_correction"
 | "candidate_rejection"
 | "mixed_review"
 | "measured_observation"
 | "insufficient_measurement"

export interface BrainOutcomeEvaluation {
 version: "vt-brain-outcome-evaluation-v1"
 traceId: string
 outputRef: string | null
 channelId: string | null
 creatorDecision: BrainCreatorDecision
 creatorOutcomeKinds: BrainOutcomeKind[]
 performanceState: BrainMeasuredPerformanceState
 creatorPerformanceAlignment: BrainCreatorPerformanceAlignment
 overallState: BrainOutcomeEvaluationState
 learningDisposition: BrainLearningDisposition
 outcomeIds: string[]
 measuredEventIds: string[]
 performanceEvidenceRefs: string[]
 evidenceRefs: string[]
 evaluatedAt: string
}

const creatorDecisionFor = (
 outcomes: BrainOutcomeRecord[],
): BrainCreatorDecision => {
 if (!outcomes.length) return "pending"

 const positive = outcomes.some((row) =>
  row.outcome === "accepted" || row.outcome === "completed")
 const corrective = outcomes.some((row) => row.outcome === "corrected")
 const negative = outcomes.some((row) =>
  row.outcome === "rejected" || row.outcome === "abandoned")

 const dimensions = [positive, corrective, negative].filter(Boolean).length
 if (dimensions > 1) return "mixed"
 if (corrective) return "corrective"
 if (negative) return "negative"
 if (positive) return "positive"
 return "pending"
}

const performanceStateFor = (
 events: AlgorithmIntelligenceEvent[],
): BrainMeasuredPerformanceState => {
 const statuses = events
  .map((event) => (event.metadata?.evaluation as AlgorithmEvaluationResult | undefined)?.status)
  .filter((status): status is AlgorithmEvaluationResult["status"] => Boolean(status))
  .filter((status) => status !== "pending")

 if (!statuses.length) return "not_measured"
 const decisive = [...new Set(statuses.filter((status) => status !== "insufficient_data"))]
 if (!decisive.length) return "insufficient_data"
 if (decisive.length > 1) return "mixed"
 const [only] = decisive
 if (only === "positive" || only === "neutral" || only === "negative" || only === "mixed") return only
 return "not_measured"
}

const creatorPerformanceAlignmentFor = (
 creator: BrainCreatorDecision,
 performance: BrainMeasuredPerformanceState,
): BrainCreatorPerformanceAlignment => {
 if (performance === "not_measured" || performance === "insufficient_data") return "unknown"
 if (performance === "neutral" || performance === "mixed") return "not_applicable"
 if (creator === "positive") return performance === "positive" ? "aligned" : "conflicted"
 if (creator === "negative") return performance === "negative" ? "aligned" : "conflicted"
 return "not_applicable"
}

const overallStateFor = (
 decision: BrainCreatorDecision,
 performance: BrainMeasuredPerformanceState,
): BrainOutcomeEvaluationState => {
 if (performance === "positive") return "measured_positive"
 if (performance === "neutral") return "measured_neutral"
 if (performance === "negative") return "measured_negative"
 if (performance === "mixed") return "measured_mixed"
 if (performance === "insufficient_data") return "measured_insufficient_data"
 if (decision === "positive") return "creator_positive_unmeasured"
 if (decision === "negative") return "creator_negative_unmeasured"
 if (decision === "corrective") return "creator_corrective_unmeasured"
 if (decision === "mixed") return "creator_mixed_unmeasured"
 return "pending"
}

const learningDispositionFor = (
 decision: BrainCreatorDecision,
 performance: BrainMeasuredPerformanceState,
): BrainLearningDisposition => {
 if (["positive", "neutral", "negative", "mixed"].includes(performance)) return "measured_observation"
 if (performance === "insufficient_data") return "insufficient_measurement"
 if (decision === "positive") return "hold_for_measurement"
 if (decision === "corrective") return "candidate_correction"
 if (decision === "negative") return "candidate_rejection"
 if (decision === "mixed") return "mixed_review"
 return "hold"
}

const attributableOutcomes = (
 trace: BrainTrace,
 outcomes: BrainOutcomeRecord[],
): BrainOutcomeRecord[] =>
 outcomes
  .filter((outcome) => outcome.traceId === trace.id)
  .filter((outcome) =>
   trace.outputRef
    ? outcome.outputRef === trace.outputRef
    : !outcome.outputRef)
  .slice()
  .sort((left, right) => left.createdAt - right.createdAt)

const attributableMeasuredEvents = (
 trace: BrainTrace,
 events: AlgorithmIntelligenceEvent[],
): AlgorithmIntelligenceEvent[] =>
 events
  .filter((event) => event.kind === "OUTCOME_MEASURED")
  .filter((event) => event.traceId === trace.id)
  .filter((event) =>
   trace.outputRef
    ? event.outputRef === trace.outputRef
    : !event.outputRef)
  .slice()
  .sort((left, right) => left.createdAt - right.createdAt)

export const buildBrainOutcomeEvaluation = (input: {
 trace: BrainTrace
 outcomes: BrainOutcomeRecord[]
 measuredEvents?: AlgorithmIntelligenceEvent[]
 now?: string
}): BrainOutcomeEvaluation => {
 const outcomes = attributableOutcomes(input.trace, input.outcomes)
 const measuredEvents = attributableMeasuredEvents(input.trace, input.measuredEvents || [])
 const creatorDecision = creatorDecisionFor(outcomes)
 const performanceState = performanceStateFor(measuredEvents)
 const creatorPerformanceAlignment = creatorPerformanceAlignmentFor(creatorDecision, performanceState)
 const performanceEvidenceRefs = Array.from(new Set(
  measuredEvents.flatMap((event) => event.evidenceIds),
 ))

 return {
  version: "vt-brain-outcome-evaluation-v1",
  traceId: input.trace.id,
  outputRef: input.trace.outputRef || null,
  channelId: input.trace.channelId,
  creatorDecision,
  creatorOutcomeKinds: outcomes.map((outcome) => outcome.outcome),
  // Creator acceptance/rejection remains a separate dimension from canonical
  // measured performance, even when both are present.
  performanceState,
  creatorPerformanceAlignment,
  overallState: overallStateFor(creatorDecision, performanceState),
  learningDisposition: learningDispositionFor(creatorDecision, performanceState),
  outcomeIds: outcomes.map((outcome) => outcome.id),
  measuredEventIds: measuredEvents.map((event) => event.id),
  performanceEvidenceRefs,
  evidenceRefs: Array.from(new Set([
   ...input.trace.evidence.returned,
   ...outcomes.flatMap((outcome) => outcome.evidence),
   ...performanceEvidenceRefs,
  ])),
  evaluatedAt: input.now || new Date().toISOString(),
 }
}

export interface BrainOutcomeEvaluationSources {
 listBrainTraces: (channelId?: string | null) => BrainTrace[]
 listBrainOutcomesForTrace: (traceId: string) => BrainOutcomeRecord[]
 listAlgorithmIntelligenceEvents: (input?: {
  channelId?: string | null
  kind?: AlgorithmIntelligenceEvent["kind"] | null
 }) => AlgorithmIntelligenceEvent[]
}

const DEFAULT_SOURCES: BrainOutcomeEvaluationSources = {
 listBrainTraces,
 listBrainOutcomesForTrace,
 listAlgorithmIntelligenceEvents,
}

export const readBrainOutcomeEvaluation = (
 traceId: string,
 sources: Partial<BrainOutcomeEvaluationSources> = {},
): BrainOutcomeEvaluation | null => {
 const resolved = { ...DEFAULT_SOURCES, ...sources }
 const trace = resolved.listBrainTraces().find((candidate) => candidate.id === traceId)
 if (!trace) return null
 return buildBrainOutcomeEvaluation({
  trace,
  outcomes: resolved.listBrainOutcomesForTrace(traceId),
  measuredEvents: resolved.listAlgorithmIntelligenceEvents({
   channelId: trace.channelId,
   kind: "OUTCOME_MEASURED",
  }),
 })
}
