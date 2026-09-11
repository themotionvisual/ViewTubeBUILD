import {
 buildAlgorithmIntelligenceContext,
 buildAlgorithmIntelligencePortfolio,
 type AlgorithmIntelligencePortfolio,
 type AlgorithmProjectContext,
} from "./AlgorithmIntelligenceOrchestrator"
import type { ExternalAnomalySignal } from "./AnomalySignalBridge"
import type { OpportunityEvidence } from "./OpportunityIntelligence"
import type { AlgorithmSignal } from "./AlgorithmStrategyEngine"
import { buildBrainEvaluationInbox } from "./BrainEvaluationInbox"
import { buildAlgorithmRecommendationCalibration } from "./AlgorithmRecommendationCalibration"
import { buildBrainCheckpointPolicy } from "./BrainCheckpointPolicy"
import { summarizeAlgorithmLifecycleObservationStore } from "./AlgorithmLifecycleObservationStore"

export interface BrainAlgorithmIntelligenceRequest {
 channelId: string
 project?: AlgorithmProjectContext | null
 anomalies?: ExternalAnomalySignal[]
 opportunities?: OpportunityEvidence[]
 directSignals?: AlgorithmSignal[]
 anomalyThresholds?: { minimumImpact?: number; minimumConfidence?: number }
}

export interface BrainAlgorithmIntelligenceResult {
 portfolio: AlgorithmIntelligencePortfolio
 context: string
 evaluationInbox: ReturnType<typeof buildBrainEvaluationInbox>
 calibration: ReturnType<typeof buildAlgorithmRecommendationCalibration>
 checkpointPolicy: ReturnType<typeof buildBrainCheckpointPolicy>
 lifecycleEvidence: ReturnType<typeof summarizeAlgorithmLifecycleObservationStore>
}

const buildPhaseSixContext = (input: {
 evaluationInbox: ReturnType<typeof buildBrainEvaluationInbox>
 calibration: ReturnType<typeof buildAlgorithmRecommendationCalibration>
 checkpointPolicy: ReturnType<typeof buildBrainCheckpointPolicy>
 lifecycleEvidence: ReturnType<typeof summarizeAlgorithmLifecycleObservationStore>
}) => {
 const { evaluationInbox, calibration, checkpointPolicy, lifecycleEvidence } = input
 const urgentItems = evaluationInbox.items
  .filter((item) => item.priority === "critical" || item.priority === "high")
  .slice(0, 6)
  .map((item) => `- ${item.kind}: ${item.title} — ${item.summary}`)
 const calibrationLines = calibration.buckets
  .filter((bucket) => bucket.measured > 0)
  .map((bucket) => `- ${bucket.confidence}: measured=${bucket.measured}; success=${bucket.successRate == null ? "unknown" : `${Math.round(bucket.successRate * 100)}%`}; gap=${bucket.calibrationGap == null ? "unknown" : `${Math.round(bucket.calibrationGap * 100)}pp`}`)

 return [
  "",
  "PHASE 6 — EVALUATION, ATTRIBUTION & LEARNING",
  `dueEvaluations=${evaluationInbox.counts.overdue}`,
  `insufficientData=${evaluationInbox.counts.insufficientData}`,
  `learningReviews=${evaluationInbox.counts.learningReviews}`,
  `criticalItems=${evaluationInbox.counts.critical}`,
  `staleCheckpoints=${checkpointPolicy.counts.stale}`,
  `criticalCheckpoints=${checkpointPolicy.counts.critical}`,
  `lifecycleObservations=${lifecycleEvidence.observations}`,
  `lifecycleVideos=${lifecycleEvidence.videos}`,
  `lifecycleMetrics=${lifecycleEvidence.metrics.join(",") || "none"}`,
  "",
  "URGENT EVALUATION ITEMS",
  ...(urgentItems.length ? urgentItems : ["- No high-priority evaluation items."]),
  "",
  "RECOMMENDATION CALIBRATION",
  ...(calibrationLines.length ? calibrationLines : ["- Not enough measured recommendation outcomes for calibration yet."]),
  ...(calibration.warnings.length ? ["", "CALIBRATION WARNINGS", ...calibration.warnings.map((warning) => `- ${warning}`)] : []),
  "",
  "EVALUATION RULES",
  "- Do not claim an action worked unless a measured outcome exists.",
  "- Treat insufficient-data evaluations as unresolved, not failed or successful.",
  "- Workflow completion is not evidence that CTR, retention, views, or revenue improved.",
  "- Prefer comparable lifecycle peers at the declared evaluation horizon over mismatched lifetime/current totals.",
  "- If lifecycle peer evidence is insufficient, say so rather than inventing a baseline.",
  "- Learning candidates are not durable Channel Profile facts until governance and creator approval complete.",
 ].join("\n")
}

export const buildBrainAlgorithmEvaluationContext = (channelId: string) => {
 const evaluationInbox = buildBrainEvaluationInbox({ channelId, maximum: 60 })
 const calibration = buildAlgorithmRecommendationCalibration(channelId)
 const checkpointPolicy = buildBrainCheckpointPolicy({ channelId, maximum: 100 })
 const lifecycleEvidence = summarizeAlgorithmLifecycleObservationStore(channelId)
 return {
  evaluationInbox,
  calibration,
  checkpointPolicy,
  lifecycleEvidence,
  context: buildPhaseSixContext({ evaluationInbox, calibration, checkpointPolicy, lifecycleEvidence }).slice(0, 6_000),
 }
}

/**
 * Brain-facing entry point for the Algorithm Intelligence & Momentum system.
 * The caller decides which evidence sources are available; this service never
 * fetches YouTube data directly and never executes a tool action.
 *
 * Phase 6 appends bounded evaluation, attribution, lifecycle and calibration
 * context so the Brain can reason about whether prior recommendations worked
 * without confusing execution with success.
 */
export const buildBrainAlgorithmIntelligence = async (
 input: BrainAlgorithmIntelligenceRequest,
): Promise<BrainAlgorithmIntelligenceResult> => {
 const portfolio = await buildAlgorithmIntelligencePortfolio(input)
 const evaluation = buildBrainAlgorithmEvaluationContext(input.channelId)
 const phaseFiveContext = buildAlgorithmIntelligenceContext(portfolio)
 return {
  portfolio,
  ...evaluation,
  context: `${phaseFiveContext}\n${evaluation.context}`.slice(0, 12_000),
 }
}
