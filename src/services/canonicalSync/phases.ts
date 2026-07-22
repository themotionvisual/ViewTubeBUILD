import type { CanonicalSyncStage } from "./contracts"

export type CanonicalSinkPhaseId =
 | "bootstrap"
 | "core_metrics"
 | "traffic"
 | "demographics"
 | "geography"
 | "retention"

export type CanonicalSinkPhaseDefinition = {
 id: CanonicalSinkPhaseId
 label: string
 description: string
 stages: CanonicalSyncStage[]
 quotaProfile: "low" | "medium" | "high"
 defaultRun: boolean
 tableFamilies: string[]
}

export type CanonicalSinkPhaseState =
 | "ready"
 | "running"
 | "partial"
 | "queued"
 | "failed"

export type CanonicalSinkPhaseSnapshot = {
 phase: CanonicalSinkPhaseDefinition
 state: CanonicalSinkPhaseState
 progress: number
 completedStages: number
 totalStages: number
 hasFailure: boolean
 hasAnyProgress: boolean
}

export const CANONICAL_SINK_PHASES: CanonicalSinkPhaseDefinition[] = [
 {
  id: "bootstrap",
  label: "Bootstrap",
  description: "Channel identity, window summaries, daily history, and video inventory.",
  stages: ["channel_bootstrap", "channel_window", "channel_daily", "video_inventory"],
  quotaProfile: "medium",
  defaultRun: true,
  tableFamilies: ["channel", "daily_statistics", "weekly_statistics", "monthly_statistics"],
 },
 {
  id: "core_metrics",
  label: "Core Video Metrics",
  description: "Video statistics, revenue-capable metrics, and viewer cohort overlays.",
  stages: ["video_metrics", "viewer_cohorts"],
  quotaProfile: "high",
  defaultRun: true,
  tableFamilies: ["video_statistics", "top_videos_by_subscriber_status"],
 },
 {
  id: "traffic",
  label: "Traffic",
  description: "Traffic source overview, daily/source rows, video/source rows, and detail lanes.",
  stages: ["traffic_sync"],
  quotaProfile: "medium",
  defaultRun: true,
  tableFamilies: ["traffic_sources", "traffic_detail"],
 },
 {
  id: "demographics",
  label: "Demographics",
  description: "Age and gender demographic rows plus derived age-only and gender-only table views.",
  stages: ["demographics_sync"],
  quotaProfile: "medium",
  defaultRun: true,
  tableFamilies: ["demographics", "demographics_by_age", "demographics_by_gender"],
 },
 {
  id: "geography",
  label: "Geography",
  description: "Country-level geography plus supported video/city/province geography rows.",
  stages: ["geography_sync"],
  quotaProfile: "medium",
  defaultRun: true,
  tableFamilies: ["geography", "geography_city", "geography_subdivision"],
 },
 {
  id: "retention",
  label: "Retention",
  description: "Targeted retention curves for selected long-form and Shorts videos.",
  stages: ["retention_sync"],
  quotaProfile: "high",
  defaultRun: true,
  tableFamilies: ["retention_curves", "retention_points"],
 },
]

export const CANONICAL_DEFAULT_SINK_PHASES = CANONICAL_SINK_PHASES.filter(
 (phase) => phase.defaultRun,
)

export const getCanonicalSinkPhaseByStage = (
 stage: CanonicalSyncStage,
): CanonicalSinkPhaseDefinition | null =>
 CANONICAL_SINK_PHASES.find((phase) => phase.stages.includes(stage)) || null

const readStageStatus = (
 stageStatus: Record<string, "pending" | "complete" | "failed"> | null | undefined,
 stage: CanonicalSyncStage,
): "pending" | "complete" | "failed" => stageStatus?.[stage] || "pending"

const buildCanonicalSinkPhaseSnapshot = (
 phase: CanonicalSinkPhaseDefinition,
 stageStatus: Record<string, "pending" | "complete" | "failed"> | null | undefined,
): CanonicalSinkPhaseSnapshot => {
 const statuses = phase.stages.map((stage) => readStageStatus(stageStatus, stage))
 const totalStages = statuses.length || 1
 const completedStages = statuses.filter((status) => status === "complete").length
 const hasFailure = statuses.some((status) => status === "failed")
 const hasAnyProgress = completedStages > 0
 const state: CanonicalSinkPhaseState = hasFailure
  ? "failed"
  : completedStages === totalStages
   ? "ready"
   : hasAnyProgress
    ? "partial"
    : "queued"

 return {
  phase,
  state,
  progress: completedStages / totalStages,
  completedStages,
  totalStages,
  hasFailure,
  hasAnyProgress,
 }
}

export const getCanonicalSinkPhaseSnapshots = (
 stageStatus: Record<string, "pending" | "complete" | "failed"> | null | undefined,
): CanonicalSinkPhaseSnapshot[] =>
 CANONICAL_SINK_PHASES.map((phase) =>
  buildCanonicalSinkPhaseSnapshot(phase, stageStatus),
 )

export const getCanonicalActiveSinkPhaseSnapshot = (
 stageStatus: Record<string, "pending" | "complete" | "failed"> | null | undefined,
): CanonicalSinkPhaseSnapshot | null => {
 const snapshots = getCanonicalSinkPhaseSnapshots(stageStatus)
 return (
  snapshots.find((snapshot) => snapshot.state !== "ready") ||
  snapshots[snapshots.length - 1] ||
  null
 )
}

export const getCanonicalSinkPhaseBadgeLabel = (
 stageStatus: Record<string, "pending" | "complete" | "failed"> | null | undefined,
): string => {
 const snapshot = getCanonicalActiveSinkPhaseSnapshot(stageStatus)
 if (!snapshot) return "CANONICAL READY"
 if (snapshot.state === "queued") return `${snapshot.phase.label.toUpperCase()} · QUEUED`
 if (snapshot.state === "running") return `${snapshot.phase.label.toUpperCase()} · RUNNING`
 if (snapshot.state === "partial") {
  const progress = Math.max(1, Math.round(snapshot.progress * 100))
  return `${snapshot.phase.label.toUpperCase()} · ${progress}%`
 }
 if (snapshot.state === "failed") return `${snapshot.phase.label.toUpperCase()} · FAILED`
 return `${snapshot.phase.label.toUpperCase()} · READY`
}
