import type { CanonicalSyncRun, CanonicalSyncStage } from "./contracts"

export type CanonicalOperatorPhaseId =
 | "identity_lifetime"
 | "video_inventory"
 | "deep_enrichment"

export type CanonicalOperatorPhaseDefinition = {
 id: CanonicalOperatorPhaseId
 label: string
 description: string
 stages: CanonicalSyncStage[]
 accentClass: string
}

export type CanonicalOperatorPhaseState =
 | "queued"
 | "running"
 | "partial"
 | "ready"
 | "failed"

export type CanonicalOperatorPhaseSnapshot = {
 phase: CanonicalOperatorPhaseDefinition
 state: CanonicalOperatorPhaseState
 progress: number
 completedStages: number
 totalStages: number
 hasFailure: boolean
}

export const CANONICAL_OPERATOR_PHASES: CanonicalOperatorPhaseDefinition[] = [
 {
  id: "identity_lifetime",
  label: "Identity & Lifetime",
  description: "Bootstrap the channel identity, windows, and daily history.",
  stages: ["channel_bootstrap", "channel_window", "channel_daily"],
  accentClass: "bg-[#CCFF00]",
 },
 {
  id: "video_inventory",
  label: "Video Inventory & Base Metrics",
  description: "Build the video catalog and baseline per-video data.",
  stages: ["video_inventory", "video_metrics"],
  accentClass: "bg-[#24D3FF]",
 },
 {
  id: "deep_enrichment",
  label: "Deep Enrichment",
  description:
   "Fill monetization, cohorts, traffic, audience, geography, playlists, and retention lanes.",
  stages: [
   "viewer_cohorts",
   "traffic_sync",
   "audience_segments",
   "demographics_sync",
   "geography_sync",
   "playlist_sync",
   "retention_sync",
   "owner_mode",
   "shadow_diff",
  ],
  accentClass: "bg-[#FFB158]",
 },
]

const readStageStatus = (
 stageStatus: Record<string, "pending" | "complete" | "failed"> | null | undefined,
 stage: CanonicalSyncStage,
): "pending" | "complete" | "failed" => stageStatus?.[stage] || "pending"

export const getCanonicalOperatorPhaseSnapshots = (
 stageStatus: Record<string, "pending" | "complete" | "failed"> | null | undefined,
 runStatus: CanonicalSyncRun["status"] | "idle" | null | undefined = null,
): CanonicalOperatorPhaseSnapshot[] =>
 CANONICAL_OPERATOR_PHASES.map((phase) => {
  const statuses = phase.stages.map((stage) => readStageStatus(stageStatus, stage))
  const totalStages = statuses.length || 1
  const completedStages = statuses.filter((status) => status === "complete").length
  const failedStages = statuses.filter((status) => status === "failed").length
  const hasFailure = failedStages > 0 || runStatus === "failed"
  const hasProgress = completedStages > 0
  let state: CanonicalOperatorPhaseState = "queued"
  if (hasFailure) state = "failed"
  else if (completedStages === totalStages) state = "ready"
  else if (runStatus === "running" && (hasProgress || phase.id === "identity_lifetime")) {
   state = hasProgress ? "partial" : "running"
  } else if (hasProgress) {
   state = "partial"
  }
  return {
   phase,
   state,
   progress: completedStages / totalStages,
   completedStages,
   totalStages,
   hasFailure,
  }
 })

export const getCanonicalActiveOperatorPhaseSnapshot = (
 stageStatus: Record<string, "pending" | "complete" | "failed"> | null | undefined,
 runStatus: CanonicalSyncRun["status"] | "idle" | null | undefined = null,
): CanonicalOperatorPhaseSnapshot | null => {
 const snapshots = getCanonicalOperatorPhaseSnapshots(stageStatus, runStatus)
 return (
  snapshots.find((snapshot) => snapshot.state === "running") ||
  snapshots.find((snapshot) => snapshot.state === "partial") ||
  snapshots.find((snapshot) => snapshot.state === "failed") ||
  snapshots.find((snapshot) => snapshot.state === "queued") ||
  snapshots[snapshots.length - 1] ||
  null
 )
}
