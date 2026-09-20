import type { CreatorGrowthContext } from "../../types"

export type DailyOracleGoalMetric =
 | "views"
 | "subscribers"
 | "revenue"
 | "engagement"
 | "watch-time"

export type DailyOracleLevel = 1 | 2 | 3

export interface DailyOracleEvidenceSnapshot {
 recentUploadCount14d: number
 daysSinceLatestUpload: number | null
 readySources: number
 totalSources: number
 channelConnected: boolean
}

export interface DailyOracleCandidate {
 id: string
 title: string
 detail: string
 evidence: string
 taskText: string
 metric?: DailyOracleGoalMetric
 impact: DailyOracleLevel
 urgency: DailyOracleLevel
 confidence: DailyOracleLevel
 effort: DailyOracleLevel
 score: number
}

export interface DailyOraclePlan {
 primary: DailyOracleCandidate
 quickWins: DailyOracleCandidate[]
 focusTasks: DailyOracleCandidate[]
 evidenceCoverage: number
 sourceLabel: string
}

export const DAILY_ORACLE_METRIC_TASKS: Record<DailyOracleGoalMetric, readonly string[]> = {
 views: [
  "Refresh the title and thumbnail promise on one recent underperforming upload.",
  "Create one follow-up around a proven topic or format.",
  "Link a strong related video with an end screen.",
  "Send viewers to one catalog video from a Community post.",
 ],
 subscribers: [
  "Add a clear subscriber payoff to the opening of the next upload.",
  "Turn a proven topic into a named repeatable series.",
  "Improve the featured-video or channel-trailer call to action.",
  "Reply to high-intent comments with a useful next-video recommendation.",
 ],
 revenue: [
  "Review end screens on the videos carrying the most current watch time.",
  "Audit monetization and mid-roll opportunities on longer uploads.",
  "Create a follow-up to one topic already showing revenue potential.",
  "Improve the opening minute of a high-value long-form upload.",
 ],
 engagement: [
  "Pin one specific question on the latest upload.",
  "Publish a two-option Community poll tied to an active topic.",
  "Reply to thoughtful comments with one follow-up question.",
  "Turn a recurring audience question into a content brief.",
 ],
 "watch-time": [
  "Add an end screen that continues the strongest viewing path.",
  "Review the first 30 seconds of a recent upload and sharpen its promise.",
  "Improve timestamps or chapters on a longer video.",
  "Build a sequel around a topic with strong viewing depth.",
 ],
}

const scoreCandidate = (candidate: Omit<DailyOracleCandidate, "score">): DailyOracleCandidate => ({
 ...candidate,
 score: (candidate.impact * 4) + (candidate.urgency * 3) + (candidate.confidence * 2) - candidate.effort,
})

const short = (value: string, max = 220) => {
 const clean = String(value || "").replace(/\s+/g, " ").trim()
 return clean.length > max ? `${clean.slice(0, max - 1).trim()}…` : clean
}

const focusCandidates = (metric: DailyOracleGoalMetric, rotation = 0): DailyOracleCandidate[] => {
 const tasks = DAILY_ORACLE_METRIC_TASKS[metric]
 return tasks.map((task, index) => {
  const rotatedIndex = (index + rotation) % tasks.length
  const text = tasks[rotatedIndex]
  return scoreCandidate({
   id: `focus-${metric}-${rotatedIndex}`,
   title: [
    "Make one measurable move",
    "Ship the next improvement",
    "Turn the goal into action",
    "Create one feedback loop",
   ][rotatedIndex],
   detail: text,
   evidence: `Selected focus · ${metric.replace("-", " ")}`,
   taskText: text,
   metric,
   impact: rotatedIndex === 0 ? 3 : 2,
   urgency: rotatedIndex < 2 ? 3 : 2,
   confidence: 2,
   effort: rotatedIndex === 0 ? 2 : 1,
  })
 })
}

export const buildDailyOraclePlan = ({
 growth,
 focusMetric,
 evidence,
 rotation = 0,
}: {
 growth: CreatorGrowthContext
 focusMetric: DailyOracleGoalMetric
 evidence: DailyOracleEvidenceSnapshot
 rotation?: number
}): DailyOraclePlan => {
 const candidates: DailyOracleCandidate[] = []
 const topPattern = growth.topPerformerPatterns.find(Boolean)
 const currentGoal = short(growth.currentGoal || "")
 const brainAction = growth.dailyOracleActions.find(Boolean)

 if (evidence.daysSinceLatestUpload === null) {
  candidates.push(scoreCandidate({
   id: "cadence-unknown",
   title: "Re-establish a visible cadence",
   detail: "Pick one shippable upload or short-form experiment and put a concrete publishing step on today’s calendar.",
   evidence: "Upload timing evidence is incomplete",
   taskText: "Choose and schedule one shippable upload or short-form experiment.",
   impact: 3,
   urgency: 3,
   confidence: 1,
   effort: 3,
  }))
 } else if (evidence.daysSinceLatestUpload > 14) {
  candidates.push(scoreCandidate({
   id: "cadence-restart",
   title: "Restart publishing momentum",
   detail: "Make the next shippable piece the priority before spending the day on secondary optimization.",
   evidence: `Latest visible upload · ${evidence.daysSinceLatestUpload} days ago`,
   taskText: "Choose the next shippable piece and schedule the first production step today.",
   impact: 3,
   urgency: 3,
   confidence: 3,
   effort: 3,
  }))
 } else {
  candidates.push(scoreCandidate({
   id: "cadence-follow-up",
   title: "Use the current publishing momentum",
   detail: "Turn the recent cadence into a deliberate follow-up instead of resetting the strategy with an unrelated upload.",
   evidence: `${evidence.recentUploadCount14d} upload${evidence.recentUploadCount14d === 1 ? "" : "s"} visible in the last 14 days`,
   taskText: "Choose the strongest recent topic or format and outline the most natural follow-up.",
   impact: 2,
   urgency: 2,
   confidence: 3,
   effort: 2,
  }))
 }

 if (topPattern) {
  candidates.push(scoreCandidate({
   id: "repeat-pattern",
   title: "Repeat a proven pattern",
   detail: short(topPattern),
   evidence: "Brain · top-performer pattern",
   taskText: `Build the next content decision around this proven pattern: ${short(topPattern, 160)}`,
   impact: 3,
   urgency: 2,
   confidence: growth.profileConfidenceScore >= 70 ? 3 : 2,
   effort: 2,
  }))
 }

 if (currentGoal && !/pick one measurable channel goal/i.test(currentGoal)) {
  candidates.push(scoreCandidate({
   id: "advance-goal",
   title: "Advance the current goal",
   detail: currentGoal,
   evidence: "Brain · saved creator goal",
   taskText: `Take one concrete action today that advances this goal: ${currentGoal}`,
   impact: 3,
   urgency: 2,
   confidence: 3,
   effort: 2,
  }))
 }

 if (brainAction) {
  candidates.push(scoreCandidate({
   id: "brain-daily",
   title: "Use the Brain’s daily direction",
   detail: short(brainAction),
   evidence: "Brain · Daily Oracle capability",
   taskText: short(brainAction, 180),
   impact: 2,
   urgency: 2,
   confidence: Math.max(1, Math.min(3, Math.ceil(growth.profileConfidenceScore / 34))) as DailyOracleLevel,
   effort: 1,
  }))
 }

 candidates.push(scoreCandidate({
  id: "packaging-pass",
  title: "Improve one packaging promise",
  detail: "Choose one upload and make its title, thumbnail promise, opening hook, and next-view path tell the same story.",
  evidence: "Reusable packaging check",
  taskText: "Run one packaging pass: title, thumbnail promise, opening hook, and next-view path.",
  impact: 2,
  urgency: 2,
  confidence: 2,
  effort: 1,
 }))

 if (growth.profileConfidenceScore < 60) {
  candidates.push(scoreCandidate({
   id: "brain-context",
   title: "Strengthen the channel read",
   detail: "Give the Brain one confirmed goal, audience fact, or content preference so tomorrow’s ranking can use stronger creator context.",
   evidence: `Brain profile read · ${Math.round(growth.profileConfidenceScore)}%`,
   taskText: "Add one confirmed goal, audience fact, or content preference to the Brain.",
   impact: 2,
   urgency: 1,
   confidence: 3,
   effort: 1,
  }))
 }

 const focused = focusCandidates(focusMetric, rotation)
 candidates.push(...focused.slice(0, 2))

 const sorted = [...candidates].sort((a, b) => b.score - a.score || a.effort - b.effort || a.id.localeCompare(b.id))
 const primary = sorted[0] || focused[0]
 const quickWins = sorted
  .filter((candidate) => candidate.id !== primary.id)
  .sort((a, b) => a.effort - b.effort || b.score - a.score)
  .slice(0, 3)

 const totalSources = Math.max(0, evidence.totalSources)
 const readySources = Math.max(0, Math.min(totalSources, evidence.readySources))
 const evidenceCoverage = totalSources > 0 ? Math.round((readySources / totalSources) * 100) : 0

 return {
  primary,
  quickWins,
  focusTasks: focused.slice(0, 3),
  evidenceCoverage,
  sourceLabel: evidence.channelConnected
   ? `${readySources}/${totalSources || 0} Brain/data sources ready`
   : "Local creator context · channel not connected",
 }
}

export const oracleLevelLabel = (level: DailyOracleLevel) =>
 level === 3 ? "High" : level === 2 ? "Med" : "Low"

export const oracleEffortLabel = (level: DailyOracleLevel) =>
 level === 3 ? "Deep" : level === 2 ? "30–60m" : "≤20m"
