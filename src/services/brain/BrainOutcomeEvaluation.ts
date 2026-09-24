import {
 listBrainOutcomesForTrace,
 type BrainOutcomeKind,
 type BrainOutcomeRecord,
} from "./BrainOutcomeLedger"
import {
 listBrainTraces,
 type BrainTrace,
} from "./BrainTrace"

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

export type BrainLearningDisposition =
 | "hold"
 | "hold_for_measurement"
 | "candidate_correction"
 | "candidate_rejection"
 | "mixed_review"

export interface BrainOutcomeEvaluation {
 version: "vt-brain-outcome-evaluation-v1"
 traceId: string
 outputRef: string | null
 channelId: string | null
 creatorDecision: BrainCreatorDecision
 creatorOutcomeKinds: BrainOutcomeKind[]
 performanceState: BrainMeasuredPerformanceState
 overallState: BrainOutcomeEvaluationState
 learningDisposition: BrainLearningDisposition
 outcomeIds: string[]
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

const overallStateFor = (
 decision: BrainCreatorDecision,
): BrainOutcomeEvaluationState => {
 if (decision === "positive") return "creator_positive_unmeasured"
 if (decision === "negative") return "creator_negative_unmeasured"
 if (decision === "corrective") return "creator_corrective_unmeasured"
 if (decision === "mixed") return "creator_mixed_unmeasured"
 return "pending"
}

const learningDispositionFor = (
 decision: BrainCreatorDecision,
): BrainLearningDisposition => {
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

export const buildBrainOutcomeEvaluation = (input: {
 trace: BrainTrace
 outcomes: BrainOutcomeRecord[]
 now?: string
}): BrainOutcomeEvaluation => {
 const outcomes = attributableOutcomes(input.trace, input.outcomes)
 const creatorDecision = creatorDecisionFor(outcomes)

 return {
  version: "vt-brain-outcome-evaluation-v1",
  traceId: input.trace.id,
  outputRef: input.trace.outputRef || null,
  channelId: input.trace.channelId,
  creatorDecision,
  creatorOutcomeKinds: outcomes.map((outcome) => outcome.outcome),
  // Creator acceptance/rejection is preference/workflow evidence. It is never
  // relabeled as measured channel performance.
  performanceState: "not_measured",
  overallState: overallStateFor(creatorDecision),
  learningDisposition: learningDispositionFor(creatorDecision),
  outcomeIds: outcomes.map((outcome) => outcome.id),
  evidenceRefs: Array.from(new Set([
   ...input.trace.evidence.returned,
   ...outcomes.flatMap((outcome) => outcome.evidence),
  ])),
  evaluatedAt: input.now || new Date().toISOString(),
 }
}

export interface BrainOutcomeEvaluationSources {
 listBrainTraces: (channelId?: string | null) => BrainTrace[]
 listBrainOutcomesForTrace: (traceId: string) => BrainOutcomeRecord[]
}

const DEFAULT_SOURCES: BrainOutcomeEvaluationSources = {
 listBrainTraces,
 listBrainOutcomesForTrace,
}

export const readBrainOutcomeEvaluation = (
 traceId: string,
 sources: BrainOutcomeEvaluationSources = DEFAULT_SOURCES,
): BrainOutcomeEvaluation | null => {
 const trace = sources.listBrainTraces().find((candidate) => candidate.id === traceId)
 if (!trace) return null
 return buildBrainOutcomeEvaluation({
  trace,
  outcomes: sources.listBrainOutcomesForTrace(traceId),
 })
}
