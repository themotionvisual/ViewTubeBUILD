import type { VtSyncSnapshot } from "../../features/vt-sync-local/adapters/contracts"
import { evaluateAlgorithmEvent } from "./AlgorithmEvaluationEngine"
import {
 listAlgorithmIntelligenceEvents,
 type AlgorithmIntelligenceEvent,
} from "./AlgorithmIntelligenceEventLedger"
import { buildCanonicalEvaluationEvidence } from "./CanonicalAlgorithmEvaluation"
import { hydrateEvaluationTargetsWithLifecycleCohorts } from "./AlgorithmLifecycleBaseline"
import { processCanonicalAlgorithmEvaluation } from "./BrainEvaluationLoop"

const TERMINAL = new Set(["positive", "neutral", "negative", "mixed"])

const finalReachedParentIds = (channelId: string) => new Set(
 listAlgorithmIntelligenceEvents({ channelId, kind: "CHECKPOINT_REACHED" })
  .filter((event) => event.metadata?.monitoringRole === "final_evaluation")
  .flatMap((event) => event.parentEventIds),
)

const terminalOutcomeParentIds = (channelId: string) => new Set(
 listAlgorithmIntelligenceEvents({ channelId, kind: "OUTCOME_MEASURED" })
  .filter((event) => TERMINAL.has(String((event.metadata?.evaluation as { status?: string } | undefined)?.status || "")))
  .flatMap((event) => event.parentEventIds),
)

const preflight = (input: {
 event: AlgorithmIntelligenceEvent
 currentSnapshot: VtSyncSnapshot
 baselineSnapshot?: VtSyncSnapshot | null
 now?: number
}) => {
 const canonical = buildCanonicalEvaluationEvidence({
  event: input.event,
  currentSnapshot: input.currentSnapshot,
  baselineSnapshot: input.baselineSnapshot,
 })
 const lifecycle = hydrateEvaluationTargetsWithLifecycleCohorts({
  event: { ...input.event, evaluationTargets: canonical.evaluationTargets },
 })
 const evaluation = evaluateAlgorithmEvent({
  event: { ...input.event, evaluationTargets: lifecycle.targets },
  observations: canonical.observations,
  now: input.now,
 })
 return { canonical, lifecycle, evaluation }
}

/**
 * Automatically finalizes only actions whose declared final monitoring horizon
 * has been reached AND whose canonical/lifecycle evidence can support a real
 * terminal evaluation. Missing evidence remains unresolved and is retried after
 * future syncs; no synthetic insufficient-data outcome is created by this path.
 */
export const processResolvableFinalAlgorithmEvaluations = (input: {
 channelId: string
 currentSnapshot: VtSyncSnapshot
 baselineSnapshotForEvent?: (event: AlgorithmIntelligenceEvent) => VtSyncSnapshot | null | undefined
 now?: number
 maximum?: number
}) => {
 const finalReached = finalReachedParentIds(input.channelId)
 const alreadyTerminal = terminalOutcomeParentIds(input.channelId)
 const maximum = Math.max(1, Math.min(100, input.maximum || 25))
 const candidates = listAlgorithmIntelligenceEvents({ channelId: input.channelId })
  .filter((event) => ["RECOMMENDATION_CREATED", "RECOMMENDATION_EXECUTED", "PRIMING_STEP_PREPARED", "PRIMING_STEP_EXECUTED"].includes(event.kind))
  .filter((event) => finalReached.has(event.id))
  .filter((event) => !alreadyTerminal.has(event.id))
  .slice(0, maximum)

 const results = candidates.map((event) => {
  const baselineSnapshot = input.baselineSnapshotForEvent?.(event) || null
  const preview = preflight({
   event,
   currentSnapshot: input.currentSnapshot,
   baselineSnapshot,
   now: input.now,
  })
  if (!TERMINAL.has(preview.evaluation.status)) {
   return {
    eventId: event.id,
    status: "unresolved" as const,
    reason: preview.evaluation.status,
    evaluation: preview.evaluation,
    recorded: null,
   }
  }
  const result = processCanonicalAlgorithmEvaluation({
   channelId: input.channelId,
   eventId: event.id,
   currentSnapshot: input.currentSnapshot,
   baselineSnapshot,
   now: input.now,
  })
  return {
   eventId: event.id,
   status: "evaluated" as const,
   reason: null,
   evaluation: result.evaluation,
   recorded: result.recorded,
  }
 })

 return {
  channelId: input.channelId,
  candidates: candidates.length,
  evaluated: results.filter((row) => row.status === "evaluated").length,
  unresolved: results.filter((row) => row.status === "unresolved").length,
  results,
 }
}
