import type {
 AlgorithmEvaluationTarget,
 AlgorithmIntelligenceEvent,
} from "./AlgorithmIntelligenceEventLedger"
import { buildAlgorithmLifecycleCohort, type AlgorithmLifecycleCohortResult } from "./AlgorithmLifecycleCohorts"
import { listAlgorithmLifecycleObservations } from "./AlgorithmLifecycleObservationStore"

export interface AlgorithmLifecycleBaselineResult {
 targets: AlgorithmEvaluationTarget[]
 cohorts: AlgorithmLifecycleCohortResult[]
 usedLifecycleBaseline: boolean
}

const metadataString = (event: AlgorithmIntelligenceEvent, ...keys: string[]) => {
 for (const key of keys) {
  const value = event.metadata?.[key]
  if (typeof value === "string" && value.trim()) return value.trim()
 }
 return null
}

const metadataNumber = (event: AlgorithmIntelligenceEvent, ...keys: string[]) => {
 for (const key of keys) {
  const value = event.metadata?.[key]
  if (typeof value === "number" && Number.isFinite(value)) return value
 }
 return null
}

/**
 * Hydrates missing evaluation baselines from genuine historical lifecycle peers.
 * Explicit baselines always win. A target without a declared window cannot be
 * converted into a lifecycle baseline because there is no fair comparison age.
 */
export const hydrateEvaluationTargetsWithLifecycleCohorts = (input: {
 event: AlgorithmIntelligenceEvent
 minimumPeers?: number
 maximumPeers?: number
}): AlgorithmLifecycleBaselineResult => {
 const { event } = input
 if (!event.videoId) return { targets: event.evaluationTargets, cohorts: [], usedLifecycleBaseline: false }
 const observations = listAlgorithmLifecycleObservations({ channelId: event.channelId })
 const cohorts: AlgorithmLifecycleCohortResult[] = []
 const format = metadataString(event, "format", "contentFormat", "videoFormat")
 const durationSeconds = metadataNumber(event, "durationSeconds", "videoDurationSeconds")
 const topicKey = metadataString(event, "topicKey", "topic", "category")

 const targets = event.evaluationTargets.map((target) => {
  if (target.baselineValue != null || !target.windowHours || target.direction === "inspect") return target
  const cohort = buildAlgorithmLifecycleCohort(observations, {
   channelId: event.channelId,
   videoId: event.videoId!,
   metric: target.metric,
   lifecycleHour: target.windowHours,
   format,
   durationSeconds,
   topicKey,
   minimumPeers: input.minimumPeers,
   maximumPeers: input.maximumPeers,
  })
  cohorts.push(cohort)
  return cohort.status === "available" && cohort.baselineValue != null
   ? { ...target, baselineValue: cohort.baselineValue }
   : target
 })

 return {
  targets,
  cohorts,
  usedLifecycleBaseline: targets.some((target, index) =>
   event.evaluationTargets[index]?.baselineValue == null && target.baselineValue != null,
  ),
 }
}
