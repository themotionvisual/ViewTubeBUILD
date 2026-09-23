/**
 * Asset outcomes — the first link of the learning loop to actually get written.
 *
 * `recordBrainOutcome` and `createEvaluationRecord` both shipped with read APIs, a UI, and
 * zero write callers. `ViewTubeLearningLedger` rendered a permanently empty list, and
 * `ChannelIntelligence` derived its patterns from `summarizeBrainOutcomes`, which always
 * returned `total: 0`. A correct engine, starved. This module gives it call sites.
 *
 * The most valuable signal here is `edited`.
 *
 * When a creator rewrites a generated draft, the pair (what the model wrote, what the
 * creator changed it to) is the highest-quality style evidence the system can obtain: a
 * correction on the creator's own content, in their own voice, for free. A thumbs-down says
 * something was wrong; an edit says exactly what, and in which direction. So an edit records
 * which stylometric features the creator moved and by how much, which is directly
 * actionable against the StyleProfile rather than just a negative score.
 *
 * Storage is browser-local for now, like every other ledger in this codebase. That is a real
 * limitation, not a design: per-device learning cannot be aggregated for calibration or
 * cross-channel patterns. The shape here is server-ready so Phase 1 moves it without
 * changing callers.
 */

import { recordBrainOutcome } from "./BrainOutcomeLedger"
import { getGeneratedAsset, type AssetRecord, type AssetType } from "./AssetGenerator"
import { compareStyleFeatures, extractStyleFeatures, type StyleFeatures } from "./styleMetrics"

export type AssetOutcomeKind =
 /** Kept as generated. */
 | "accepted"
 /** Kept, but rewritten first. Carries the strongest style signal. */
 | "edited"
 /** Explicitly discarded. */
 | "rejected"
 /** Sent onward to a tool or the creator's clipboard. */
 | "exported"
 /** Actually posted. The only outcome that can later be joined to performance. */
 | "published"

export interface StyleDriftSignal {
 feature: keyof StyleFeatures
 /** What the model produced. */
 generated: number
 /** What the creator changed it to. */
 corrected: number
 /** 0-1, how far the creator moved this feature. */
 magnitude: number
}

export interface AssetOutcome {
 id: string
 assetId: string
 channelId: string
 assetType: AssetType
 kind: AssetOutcomeKind
 createdAt: string
 /** Creator's stated reason, when they gave one. Rejections teach more with a reason. */
 note?: string
 /** Style fidelity at generation time, for calibration against what the creator kept. */
 styleScoreAtGeneration?: number
 /** Populated for `edited`: which features the creator moved, worst first. */
 styleDrift?: StyleDriftSignal[]
 /** Proportion of the draft the creator changed, 0-1. */
 editRatio?: number
 /** Links the outcome back to the generating turn. */
 traceId: string
}

const STORAGE_KEY = "vt_asset_outcomes_v1"
const MAXIMUM_RETAINED = 1_000
export const ASSET_OUTCOME_EVENT = "vt_asset_outcome_recorded"

/** Community and comment assets belong to the audience loop tool. */
const TOOL_FOR_ASSET: Partial<Record<AssetType, "audience-loop-studio" | "creator-canvas-os" | "packaging-lab-pro">> = {
 community_post: "audience-loop-studio",
 comment_reply: "audience-loop-studio",
 script: "creator-canvas-os",
 hook: "creator-canvas-os",
 short: "creator-canvas-os",
 broll_plan: "creator-canvas-os",
 video_topic: "creator-canvas-os",
 title: "packaging-lab-pro",
 description: "packaging-lab-pro",
 tags: "packaging-lab-pro",
 timestamps: "packaging-lab-pro",
 education_questions: "packaging-lab-pro",
 thumbnail_concept: "packaging-lab-pro",
}

const canUseStorage = (): boolean =>
 typeof window !== "undefined" && typeof localStorage !== "undefined"

const readOutcomes = (): AssetOutcome[] => {
 if (!canUseStorage()) return []
 try {
  const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
  return Array.isArray(parsed) ? (parsed as AssetOutcome[]) : []
 } catch {
  return []
 }
}

const persist = (outcome: AssetOutcome): void => {
 if (!canUseStorage()) return
 try {
  localStorage.setItem(
   STORAGE_KEY,
   JSON.stringify([outcome, ...readOutcomes()].slice(0, MAXIMUM_RETAINED)),
  )
  window.dispatchEvent(new CustomEvent(ASSET_OUTCOME_EVENT, { detail: outcome }))
 } catch {
  // Losing a learning signal must never break the creator's action.
 }
}

export const listAssetOutcomes = (input?: {
 channelId?: string
 assetType?: AssetType
 assetId?: string
}): AssetOutcome[] =>
 readOutcomes().filter((outcome) => {
  if (input?.channelId && outcome.channelId !== input.channelId) return false
  if (input?.assetType && outcome.assetType !== input.assetType) return false
  if (input?.assetId && outcome.assetId !== input.assetId) return false
  return true
 })

const makeId = (): string =>
 typeof crypto !== "undefined" && "randomUUID" in crypto
  ? `outcome_${crypto.randomUUID()}`
  : `outcome_${Date.now()}_${Math.random().toString(36).slice(2)}`

/**
 * Character-level difference ratio, via the length of the common prefix and suffix.
 *
 * A full edit-distance matrix is quadratic and this runs on every save of a text the
 * creator may be typing into. Prefix/suffix trimming is linear and answers the question
 * actually being asked — "roughly how much of this did they change" — closely enough to
 * distinguish a typo fix from a rewrite.
 */
export const editRatio = (generated: string, corrected: string): number => {
 const a = generated || ""
 const b = corrected || ""
 if (!a && !b) return 0
 if (!a || !b) return 1

 let prefix = 0
 while (prefix < a.length && prefix < b.length && a[prefix] === b[prefix]) prefix += 1

 let suffix = 0
 while (
  suffix < a.length - prefix &&
  suffix < b.length - prefix &&
  a[a.length - 1 - suffix] === b[b.length - 1 - suffix]
 ) suffix += 1

 const changed = Math.max(a.length, b.length) - prefix - suffix
 return Math.min(1, Math.max(0, changed) / Math.max(a.length, b.length))
}

/** Which style features the creator moved, and how far. Worst first. */
export const styleDriftBetween = (generated: string, corrected: string): StyleDriftSignal[] => {
 const before = extractStyleFeatures(generated)
 const after = extractStyleFeatures(corrected)
 return compareStyleFeatures(before, after)
  .filter((delta) => delta.distance > 0.15)
  .map((delta) => ({
   feature: delta.feature,
   generated: delta.target,
   corrected: delta.actual,
   magnitude: delta.distance,
  }))
}

const BRAIN_OUTCOME_FOR_KIND = {
 accepted: "accepted",
 published: "completed",
 exported: "accepted",
 edited: "corrected",
 rejected: "rejected",
} as const

/**
 * Record what the creator did with a generated asset.
 *
 * Writes to the asset outcome store and to `BrainOutcomeLedger`, which is what feeds
 * `ChannelIntelligence`. Resolves the asset by id so callers only need the id they already
 * hold; an unknown id is ignored rather than throwing, because a missing learning signal
 * must never break a creator action.
 */
export const recordAssetOutcome = async (input: {
 assetId: string
 kind: AssetOutcomeKind
 note?: string
 /** Required for `edited`: what the creator changed it to. */
 correctedText?: string
 /** The generated text, when the caller has it and the record does not. */
 generatedText?: string
}): Promise<AssetOutcome | null> => {
 const asset = getGeneratedAsset(input.assetId) as AssetRecord | null
 if (!asset) return null

 const generated = input.generatedText
  ?? (typeof (asset.output as { body?: unknown })?.body === "string"
   ? String((asset.output as { body: string }).body)
   : "")

 const isEdit = input.kind === "edited" && typeof input.correctedText === "string"

 const outcome: AssetOutcome = {
  id: makeId(),
  assetId: asset.id,
  channelId: asset.channelId,
  assetType: asset.assetType,
  kind: input.kind,
  createdAt: new Date().toISOString(),
  ...(input.note ? { note: input.note } : {}),
  ...(typeof asset.styleScore === "number" ? { styleScoreAtGeneration: asset.styleScore } : {}),
  ...(isEdit && generated
   ? {
     editRatio: editRatio(generated, input.correctedText as string),
     styleDrift: styleDriftBetween(generated, input.correctedText as string),
    }
   : {}),
  traceId: asset.traceId,
 }

 persist(outcome)

 const tool = TOOL_FOR_ASSET[asset.assetType] || "creator-canvas-os"
 try {
  await recordBrainOutcome({
   channelId: asset.channelId,
   sourceToolId: tool,
   targetToolId: null,
   outcome: BRAIN_OUTCOME_FOR_KIND[input.kind],
   summary: `${asset.assetType} ${input.kind}${input.note ? `: ${input.note}` : ""}`,
   evidence: asset.evidenceRefs,
   // What the creator did is direct evidence; a style score is an inference about it.
   confidence: input.kind === "edited" || input.kind === "rejected" ? "high" : "medium",
  })
 } catch (cause) {
  // recordBrainOutcome writes its own record synchronously and then captures a learning
  // event through IndexedDB, which is unavailable in private browsing and can fail on
  // quota. The creator's action must survive that; the outcome above is already stored.
  console.warn("Brain outcome capture failed; asset outcome was still recorded.", cause)
 }

 return outcome
}

export interface AssetOutcomeSummary {
 total: number
 accepted: number
 edited: number
 rejected: number
 published: number
 /** Kept as generated, out of all decided outcomes. */
 acceptanceRate: number
 /** Mean proportion changed across edits. High means style is consistently off. */
 meanEditRatio: number
 /** Features the creator most often corrects. The StyleProfile's to-do list. */
 mostCorrectedFeatures: Array<{ feature: keyof StyleFeatures; count: number }>
}

/**
 * What the creator's behaviour says about generation quality.
 *
 * `mostCorrectedFeatures` is the actionable output: if a creator shortens sentences on every
 * draft, the profile's target is wrong and should move, rather than every future draft being
 * repaired toward a target the creator keeps rejecting.
 */
export const summarizeAssetOutcomes = (input?: {
 channelId?: string
 assetType?: AssetType
}): AssetOutcomeSummary => {
 const outcomes = listAssetOutcomes(input)
 const count = (kind: AssetOutcomeKind) => outcomes.filter((entry) => entry.kind === kind).length

 const edits = outcomes.filter((entry) => typeof entry.editRatio === "number")
 const featureCounts = new Map<keyof StyleFeatures, number>()
 for (const outcome of outcomes) {
  for (const drift of outcome.styleDrift || []) {
   featureCounts.set(drift.feature, (featureCounts.get(drift.feature) || 0) + 1)
  }
 }

 const accepted = count("accepted") + count("published") + count("exported")
 const decided = accepted + count("edited") + count("rejected")

 return {
  total: outcomes.length,
  accepted,
  edited: count("edited"),
  rejected: count("rejected"),
  published: count("published"),
  acceptanceRate: decided ? Math.round((accepted / decided) * 100) : 0,
  meanEditRatio: edits.length
   ? edits.reduce((total, entry) => total + (entry.editRatio || 0), 0) / edits.length
   : 0,
  mostCorrectedFeatures: [...featureCounts.entries()]
   .map(([feature, featureCount]) => ({ feature, count: featureCount }))
   .sort((left, right) => right.count - left.count),
 }
}
