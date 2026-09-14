import { CROWN_CODE_SNAPSHOT, CROWN_RELEASE_SNAPSHOT } from "./crownCodeReleaseSnapshot"
import { CROWN_DECISIONS, CROWN_VERIFICATION } from "./crownControlRoomRecords"
import { CROWN_MISSIONS, type CrownMissionSnapshot } from "./crownControlRoomSnapshot"

export type CrownPriority = "critical" | "blocked" | "needs_decision" | "verify" | "ready" | "watch"

export interface CrownTodaySignal {
  id: string
  priority: CrownPriority
  title: string
  detail: string
  source: "release" | "mission" | "decision" | "verification" | "code"
  missionId?: string
  score: number
}

const missionScore = (mission: CrownMissionSnapshot) => {
  let score = mission.status === "blocked" ? 100 : mission.status === "partial" ? 55 : mission.status === "verification" ? 45 : 15
  if (mission.risk === "high") score += 25
  if (mission.risk === "medium") score += 10
  score += mission.blockers.length * 8
  return score
}

const missionPriority = (mission: CrownMissionSnapshot): CrownPriority => {
  if (mission.status === "blocked") return "blocked"
  if (mission.risk === "high" && mission.blockers.length > 0) return "critical"
  if (mission.status === "partial" || mission.status === "verification") return "verify"
  if (mission.status === "complete") return "ready"
  return "watch"
}

const missionSignals: CrownTodaySignal[] = CROWN_MISSIONS
  .filter((mission) => mission.status !== "complete" || mission.blockers.length > 0)
  .map((mission) => ({
    id: `mission:${mission.id}`,
    priority: missionPriority(mission),
    title: mission.title,
    detail: mission.blockers[0] || "Mission needs the next evidence-bearing execution step.",
    source: "mission" as const,
    missionId: mission.id,
    score: missionScore(mission),
  }))

const decisionSignals: CrownTodaySignal[] = CROWN_DECISIONS
  .filter((decision) => decision.state === "needs-creator-decision" || decision.state === "proposed")
  .map((decision) => ({
    id: `decision:${decision.id}`,
    priority: "needs_decision" as const,
    title: decision.question,
    detail: decision.recommendation,
    source: "decision" as const,
    missionId: decision.missionId,
    score: 90,
  }))

const releaseSignals: CrownTodaySignal[] = [
  ...(CROWN_RELEASE_SNAPSHOT.production.state === "blocked" ? [{
    id: "release:production-blocked",
    priority: "blocked" as const,
    title: "Production release chain blocked",
    detail: CROWN_RELEASE_SNAPSHOT.production.detail,
    source: "release" as const,
    score: 98,
  }] : []),
  ...(CROWN_RELEASE_SNAPSHOT.preview.state === "preview_unavailable" ? [{
    id: "release:preview-unavailable",
    priority: "watch" as const,
    title: "Preview evidence unavailable",
    detail: CROWN_RELEASE_SNAPSHOT.preview.detail,
    source: "release" as const,
    score: 68,
  }] : []),
]

export const CROWN_TODAY_SIGNALS: readonly CrownTodaySignal[] = [...releaseSignals, ...decisionSignals, ...missionSignals]
  .sort((a, b) => b.score - a.score)

export const CROWN_TODAY_TOP_ACTIONS = CROWN_TODAY_SIGNALS.slice(0, 3).map((signal) => ({
  id: signal.id,
  priority: signal.priority,
  action: signal.source === "release"
    ? "Restore release evidence, then rerun preview → production → live verification."
    : signal.priority === "needs_decision"
      ? "Resolve the creator decision before execution continues."
      : `Produce a runtime verification receipt for ${signal.title}.`,
  reason: signal.detail,
}))

export const CROWN_TODAY_CHANGES = CROWN_CODE_SNAPSHOT.recentMerges.map((merge) => ({
  id: `pr-${merge.pr}`,
  title: `PR #${merge.pr} merged`,
  detail: merge.title,
}))

export const CROWN_TODAY_SUMMARY = {
  critical: CROWN_TODAY_SIGNALS.filter((signal) => signal.priority === "critical").length,
  blocked: CROWN_TODAY_SIGNALS.filter((signal) => signal.priority === "blocked").length,
  needsDecision: CROWN_TODAY_SIGNALS.filter((signal) => signal.priority === "needs_decision").length,
  needsVerification: CROWN_TODAY_SIGNALS.filter((signal) => signal.priority === "verify").length,
  partialReceipts: CROWN_VERIFICATION.filter((receipt) => receipt.state === "partial").length,
} as const
