import { listDueAlgorithmEvaluations } from "./BrainEvaluationLoop"

export type BrainCheckpointState =
 | "due"
 | "aging"
 | "stale"
 | "critical"

export interface BrainCheckpointPolicyRow {
 eventId: string
 state: BrainCheckpointState
 overdueHours: number
 requiredMetrics: string[]
 action: "evaluate" | "retry_after_sync" | "review_evidence" | "manual_review"
 reason: string
}

const stateForHours = (hours: number): BrainCheckpointState => {
 if (hours >= 168) return "critical"
 if (hours >= 72) return "stale"
 if (hours >= 24) return "aging"
 return "due"
}

export const buildBrainCheckpointPolicy = (input: {
 channelId: string
 now?: number
 maximum?: number
}) => {
 const due = listDueAlgorithmEvaluations({
  channelId: input.channelId,
  now: input.now,
  maximum: input.maximum || 100,
 })
 const rows: BrainCheckpointPolicyRow[] = due.map((item) => {
  const overdueHours = item.overdueByMs / 3600000
  const state = stateForHours(overdueHours)
  const action: BrainCheckpointPolicyRow["action"] = state === "critical"
   ? "manual_review"
   : state === "stale"
    ? "review_evidence"
    : "evaluate"
  return {
   eventId: item.event.id,
   state,
   overdueHours,
   requiredMetrics: item.requiredMetrics,
   action,
   reason: state === "critical"
    ? "Checkpoint is more than seven days overdue. Require human review before treating the strategy result as learnable."
    : state === "stale"
     ? "Checkpoint is more than three days overdue. Verify evidence freshness and lifecycle comparability before evaluation."
     : state === "aging"
      ? "Checkpoint is aging. Evaluate from the latest canonical snapshot if the required evidence is available."
      : "Checkpoint is due and ready for evidence collection.",
  }
 })
 return {
  channelId: input.channelId,
  generatedAt: input.now || Date.now(),
  rows,
  counts: {
   due: rows.filter((row) => row.state === "due").length,
   aging: rows.filter((row) => row.state === "aging").length,
   stale: rows.filter((row) => row.state === "stale").length,
   critical: rows.filter((row) => row.state === "critical").length,
  },
  automaticExternalActions: false,
 }
}
