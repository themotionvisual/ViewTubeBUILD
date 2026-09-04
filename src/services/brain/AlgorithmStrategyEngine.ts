import type { BrainConfidenceLevel, SuperToolId } from "../../types"
import type { ChannelIntelligenceSnapshot } from "./ChannelIntelligence"

export type AlgorithmSignalKind =
 | "traffic_expansion"
 | "traffic_contraction"
 | "search_breakout"
 | "external_breakout"
 | "audience_mix_shift"
 | "packaging_decline"
 | "retention_decline"
 | "retention_strength"
 | "session_opportunity"
 | "revenue_shift"
 | "back_catalog_resurgence"
 | "unknown"

export type AlgorithmMomentumCommand =
 | "HOLD"
 | "AMPLIFY"
 | "REPACKAGE"
 | "RETARGET"
 | "REINFORCE_SESSION"
 | "CREATE_FOLLOWUP"
 | "INSPECT"

export interface AlgorithmSignal {
 id: string
 kind: AlgorithmSignalKind
 channelId: string
 videoId?: string | null
 entity?: string | null
 metric?: string | null
 currentValue?: number | null
 baselineValue?: number | null
 relativeDelta?: number | null
 impactScore: number
 confidence: number
 evidenceIds: string[]
 context?: {
  ctrDirection?: "up" | "flat" | "down" | "unknown"
  retentionDirection?: "up" | "flat" | "down" | "unknown"
  watchQuality?: "strong" | "stable" | "weak" | "unknown"
  audienceTemperature?: "core" | "warm" | "cold" | "unknown"
  trafficSource?: string | null
 }
}

export interface AlgorithmRecommendation {
 id: string
 channelId: string
 signalId: string
 command: AlgorithmMomentumCommand
 title: string
 rationale: string
 confidence: BrainConfidenceLevel
 score: number
 evidenceIds: string[]
 targetToolId: SuperToolId | null
 checkpoint: string
 guardrails: string[]
 payload: Record<string, unknown>
}

const confidenceLabel = (value: number): BrainConfidenceLevel =>
 value >= 85 ? "high" : value >= 65 ? "medium" : "low"

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)))

const hasPattern = (intelligence: ChannelIntelligenceSnapshot | null | undefined, text: string) =>
 Boolean(intelligence?.patterns.some((pattern) => pattern.statement.toLowerCase().includes(text.toLowerCase())))

export const recommendAlgorithmAction = (input: {
 signal: AlgorithmSignal
 intelligence?: ChannelIntelligenceSnapshot | null
}): AlgorithmRecommendation => {
 const { signal, intelligence } = input
 const context = signal.context || {}
 let command: AlgorithmMomentumCommand = "INSPECT"
 let targetToolId: SuperToolId | null = "cinematic-analytics-lab"
 let rationale = "The signal is material enough to inspect, but the evidence does not yet justify a stronger intervention."
 let checkpoint = "Re-evaluate after the next meaningful analytics refresh."
 const guardrails = [
  "Treat this as a recommendation, not an automatic YouTube mutation.",
  "Preserve the current package until evidence supports changing it.",
 ]
 let score = signal.impactScore * 0.7 + signal.confidence * 0.3

 if (signal.kind === "traffic_expansion") {
  if ((context.watchQuality === "strong" || context.watchQuality === "stable") && context.retentionDirection !== "down") {
   command = "HOLD"
   targetToolId = null
   rationale = "Distribution is expanding while watch quality remains healthy. Avoid interrupting a successful expansion with premature packaging changes."
   checkpoint = "Watch CTR, retention and traffic-source mix for 24-48 hours before intervening."
   guardrails.push("A lower CTR can be normal when YouTube broadens impressions into a colder audience.")
  } else {
   command = "INSPECT"
   rationale = "Traffic expanded but watch quality is not clearly healthy; inspect the source/audience mix before amplifying."
  }
 }

 if (signal.kind === "search_breakout") {
  command = "CREATE_FOLLOWUP"
  targetToolId = "creator-canvas-os"
  rationale = "A high-confidence search breakout is a channel-specific demand signal that can support a related follow-up concept, Short, or Community bridge."
  checkpoint = "Re-check the term cluster after 7 days and compare performance of any derivative content."
  guardrails.push("Do not rewrite a currently successful video solely to chase the term.")
 }

 if (signal.kind === "external_breakout") {
  command = context.watchQuality === "weak" ? "INSPECT" : "AMPLIFY"
  targetToolId = context.watchQuality === "weak" ? "cinematic-analytics-lab" : "audience-loop-studio"
  rationale = context.watchQuality === "weak"
   ? "The external source is large but appears low quality; inspect landing-video retention and audience fit before reinforcing it."
   : "A meaningful external source is delivering acceptable watch quality. Preserve the source, understand its context, and selectively reinforce related audience touchpoints."
  checkpoint = "Track persistence and watch quality over the next 3-7 observations."
 }

 if (signal.kind === "audience_mix_shift") {
  if (context.audienceTemperature === "cold" && (context.watchQuality === "strong" || context.watchQuality === "stable")) {
   command = "HOLD"
   targetToolId = null
   rationale = "The audience is getting colder without a watch-quality collapse, which is consistent with healthy audience expansion."
   checkpoint = "Compare retention and traffic mix after the expansion stabilizes."
  } else if (context.audienceTemperature === "cold" && context.watchQuality === "weak") {
   command = "RETARGET"
   targetToolId = "packaging-lab-pro"
   rationale = "The audience mix moved colder while watch quality weakened. Revisit promise/audience alignment before increasing distribution."
   checkpoint = "Measure retention and click quality after one controlled retargeting/packaging change."
  }
 }

 if (signal.kind === "packaging_decline") {
  if (context.retentionDirection === "up" || context.watchQuality === "strong") {
   command = "REPACKAGE"
   targetToolId = "packaging-lab-pro"
   rationale = "The content appears to satisfy viewers who click, while packaging performance is weakening. A controlled title/thumbnail experiment is justified."
   checkpoint = "Compare CTR and watch quality before/after one packaging intervention."
   guardrails.push("Change one packaging variable at a time when practical.")
  } else {
   command = "INSPECT"
   rationale = "Packaging and post-click quality are both weak, so a thumbnail/title change alone may not address the underlying content/audience problem."
  }
 }

 if (signal.kind === "retention_decline") {
  command = "RETARGET"
  targetToolId = "retention-autopsy-experiment-engine"
  rationale = "Watch quality is the primary weak signal. Diagnose the opening, promise delivery and segment-level drop-offs before changing distribution strategy."
  checkpoint = "Create one explicit retention hypothesis and measure the next comparable upload or revision."
 }

 if (signal.kind === "retention_strength") {
  command = "AMPLIFY"
  targetToolId = "creator-canvas-os"
  rationale = "A strong retention pattern is reusable creator evidence. Extract the structural lesson and apply it to a follow-up concept or script."
  checkpoint = "Compare the repeated structural pattern across the next 2-3 related videos."
 }

 if (signal.kind === "session_opportunity") {
  command = "REINFORCE_SESSION"
  targetToolId = "packaging-lab-pro"
  rationale = "Viewer intent suggests an adjacent-video path. Strengthen end-screen/outro/next-video routing before seeking unrelated traffic."
  checkpoint = "Measure downstream video starts and session continuation after the routing change."
 }

 if (signal.kind === "back_catalog_resurgence") {
  command = "CREATE_FOLLOWUP"
  targetToolId = "creator-canvas-os"
  rationale = "A back-catalog video has regained demand. Use the renewed audience intent to evaluate a sequel, update, Short, or session path."
  checkpoint = "Track whether the resurgence persists for 7 days and whether related catalog videos also rise."
 }

 if (signal.kind === "revenue_shift") {
  command = "INSPECT"
  targetToolId = "cinematic-analytics-lab"
  rationale = "Revenue changes can be mix-driven. Decompose geography, device, traffic and monetized-playback changes before choosing a creator intervention."
  checkpoint = "Re-evaluate after the revenue-mix decomposition is complete."
 }

 if (signal.kind === "traffic_contraction") {
  command = context.watchQuality === "strong" ? "REPACKAGE" : "INSPECT"
  targetToolId = context.watchQuality === "strong" ? "packaging-lab-pro" : "cinematic-analytics-lab"
  rationale = context.watchQuality === "strong"
   ? "Distribution contracted while post-click quality remains strong; controlled packaging/discovery testing may restore reach."
   : "Both distribution and watch quality need diagnosis before a packaging intervention is justified."
  checkpoint = "Compare the next intervention against the same lifecycle/window baseline."
 }

 if (hasPattern(intelligence, "positive preference") && targetToolId) {
  score += 4
 }
 if (hasPattern(intelligence, "rejected or abandoned") && targetToolId) {
  score -= 4
 }

 return {
  id: `algorithm:${signal.id}:${command.toLowerCase()}`,
  channelId: signal.channelId,
  signalId: signal.id,
  command,
  title: `${command}: ${signal.entity || signal.kind.replaceAll("_", " ")}`,
  rationale,
  confidence: confidenceLabel(Math.min(signal.confidence, score)),
  score: clamp(score),
  evidenceIds: [...new Set(signal.evidenceIds)],
  targetToolId,
  checkpoint,
  guardrails,
  payload: {
   signalKind: signal.kind,
   videoId: signal.videoId || null,
   entity: signal.entity || null,
   metric: signal.metric || null,
   currentValue: signal.currentValue ?? null,
   baselineValue: signal.baselineValue ?? null,
   relativeDelta: signal.relativeDelta ?? null,
   impactScore: signal.impactScore,
   signalConfidence: signal.confidence,
   context,
  },
 }
}

export const rankAlgorithmRecommendations = (input: {
 signals: AlgorithmSignal[]
 intelligence?: ChannelIntelligenceSnapshot | null
}): AlgorithmRecommendation[] => input.signals
 .map((signal) => recommendAlgorithmAction({ signal, intelligence: input.intelligence }))
 .sort((left, right) => right.score - left.score)
