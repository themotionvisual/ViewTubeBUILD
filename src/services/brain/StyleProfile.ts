/**
 * StyleProfile — the creator's voice, as something the system can apply and measure.
 *
 * Before this, the only personalisation available to any generator was a free-text journal
 * blob passed as `brain?: any`. There was no representation of how a creator writes, no way
 * for them to correct the system's idea of their voice, and no way to tell whether a draft
 * matched it. "Loyal to the creator's previous style" was unimplementable.
 *
 * Two rules come straight from the research and are enforced here rather than left to
 * callers:
 *
 * 1. **At most five exemplars.** Style matching improves sharply with few-shot examples but
 *    plateaus after four or five; beyond that, exemplars consume context budget for no
 *    measurable gain. `MAXIMUM_EXEMPLARS` is a cap, not a suggestion.
 *
 * 2. **Exemplars are chosen for coverage, not recency.** Five samples of the same post
 *    teach less than five that span the creator's range, so selection maximises
 *    stylometric spread.
 *
 * The descriptor is always creator-editable. Extraction proposes a voice; the creator owns
 * it. A system that tells a creator who they are and cannot be corrected is worse than one
 * that asks.
 */

import {
 averageStyleFeatures,
 compareStyleFeatures,
 extractStyleFeatures,
 styleFidelityScore,
 STYLE_FEATURE_KEYS,
 type StyleFeatureDelta,
 type StyleFeatures,
} from "./styleMetrics"

/** Research-backed cap: fidelity plateaus after 4-5 demonstrations. */
export const MAXIMUM_EXEMPLARS = 5

/** Below this, a draft does not sound like the creator and is repaired before delivery. */
export const STYLE_FIDELITY_FLOOR = 62

export type StyleScope = "channel" | "format" | "series"

export interface StyleDescriptor {
 /** Plain-language voice summary, e.g. "wry, technical, never hypey". */
 voice: string
 pacing: string
 vocabulary: { prefer: string[]; avoid: string[] }
 structure: string
 openingPattern: string
 closingPattern: string
 /** The creator's production bar: shapes b-roll density and script detail. */
 productionQuality: string
}

export interface StyleExemplar {
 id: string
 /** Verbatim creator-authored text. Never model output. */
 text: string
 /** Where it came from, e.g. "community_post" or a video id. */
 sourceRef?: string
 createdAt: string
}

export interface StyleProfile {
 id: string
 channelId: string
 scope: StyleScope
 /** Set when scope is "format": the asset type this profile governs. */
 assetType?: string
 descriptor: StyleDescriptor
 exemplars: StyleExemplar[]
 /** Aggregate stylometrics of the exemplars. The target a draft is scored against. */
 features: StyleFeatures
 source: "creator_authored" | "extracted_from_published" | "hybrid"
 confidence: "low" | "medium" | "high"
 createdAt: string
 updatedAt: string
 /** Noted when new evidence disagrees with a stored belief about the voice. */
 contradictions: string[]
}

export const EMPTY_STYLE_DESCRIPTOR: StyleDescriptor = {
 voice: "",
 pacing: "",
 vocabulary: { prefer: [], avoid: [] },
 structure: "",
 openingPattern: "",
 closingPattern: "",
 productionQuality: "",
}

const STORAGE_KEY = "vt_style_profiles_v1"

const canUseStorage = (): boolean =>
 typeof window !== "undefined" && typeof localStorage !== "undefined"

const makeId = (prefix: string): string =>
 typeof crypto !== "undefined" && "randomUUID" in crypto
  ? `${prefix}_${crypto.randomUUID()}`
  : `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`

const readAll = (): StyleProfile[] => {
 if (!canUseStorage()) return []
 try {
  const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
  return Array.isArray(parsed) ? (parsed as StyleProfile[]) : []
 } catch {
  return []
 }
}

const writeAll = (profiles: StyleProfile[]): void => {
 if (!canUseStorage()) return
 try {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles))
 } catch {
  // Never break a generation over a storage quota.
 }
}

/**
 * Distance between two feature vectors, reused for exemplar spread.
 * 0 = identical, 1 = maximally different.
 */
const featureDistance = (left: StyleFeatures, right: StyleFeatures): number => {
 const deltas = compareStyleFeatures(left, right)
 return deltas.reduce((total, delta) => total + delta.distance, 0) / deltas.length
}

/**
 * Pick up to `limit` exemplars spanning the creator's range.
 *
 * Starts from the sample closest to the centroid — the most representative one — then
 * repeatedly adds whichever remaining sample is furthest from everything already chosen.
 * Recency ordering would happily pick five near-identical posts from one week and teach
 * the model a narrower voice than the creator actually has.
 */
export const selectDiverseExemplars = <T extends { text: string }>(
 candidates: T[],
 limit: number = MAXIMUM_EXEMPLARS,
): T[] => {
 const usable = candidates.filter((candidate) => candidate.text.trim().length > 0)
 if (usable.length <= limit) return usable

 const features = usable.map((candidate) => extractStyleFeatures(candidate.text))
 const centroid = averageStyleFeatures(features)

 let seedIndex = 0
 let seedDistance = Number.POSITIVE_INFINITY
 features.forEach((candidateFeatures, index) => {
  const distance = featureDistance(centroid, candidateFeatures)
  if (distance < seedDistance) {
   seedDistance = distance
   seedIndex = index
  }
 })

 const chosen = [seedIndex]
 while (chosen.length < limit) {
  let bestIndex = -1
  let bestDistance = -1
  for (let index = 0; index < usable.length; index += 1) {
   if (chosen.includes(index)) continue
   // Distance to the nearest already-chosen exemplar: maximise the minimum.
   const nearest = Math.min(...chosen.map((pick) => featureDistance(features[pick], features[index])))
   if (nearest > bestDistance) {
    bestDistance = nearest
    bestIndex = index
   }
  }
  if (bestIndex < 0) break
  chosen.push(bestIndex)
 }

 return chosen.map((index) => usable[index])
}

const buildExemplar = (input: { text: string; sourceRef?: string }): StyleExemplar => ({
 id: makeId("exemplar"),
 text: input.text.trim(),
 ...(input.sourceRef ? { sourceRef: input.sourceRef } : {}),
 createdAt: new Date().toISOString(),
})

const confidenceForExemplars = (count: number): StyleProfile["confidence"] =>
 count >= 4 ? "high" : count >= 2 ? "medium" : "low"

export const createStyleProfile = (input: {
 channelId: string
 scope?: StyleScope
 assetType?: string
 descriptor?: Partial<StyleDescriptor>
 samples?: Array<{ text: string; sourceRef?: string }>
 source?: StyleProfile["source"]
}): StyleProfile => {
 const now = new Date().toISOString()
 const exemplars = selectDiverseExemplars(
  (input.samples || []).map(buildExemplar),
  MAXIMUM_EXEMPLARS,
 )
 const profile: StyleProfile = {
  id: makeId("style"),
  channelId: input.channelId,
  scope: input.scope || "channel",
  ...(input.assetType ? { assetType: input.assetType } : {}),
  descriptor: { ...EMPTY_STYLE_DESCRIPTOR, ...input.descriptor,
   vocabulary: {
    prefer: input.descriptor?.vocabulary?.prefer || [],
    avoid: input.descriptor?.vocabulary?.avoid || [],
   },
  },
  exemplars,
  features: averageStyleFeatures(exemplars.map((exemplar) => extractStyleFeatures(exemplar.text))),
  source: input.source || (exemplars.length ? "extracted_from_published" : "creator_authored"),
  confidence: confidenceForExemplars(exemplars.length),
  createdAt: now,
  updatedAt: now,
  contradictions: [],
 }
 writeAll([profile, ...readAll().filter((entry) => entry.id !== profile.id)])
 return profile
}

export const listStyleProfiles = (channelId?: string): StyleProfile[] => {
 const all = readAll()
 return channelId ? all.filter((profile) => profile.channelId === channelId) : all
}

/**
 * Most specific profile wins: a profile for this asset type, else the channel profile.
 * Returns null rather than inventing a voice — generating in a guessed style is worse than
 * generating in a neutral one.
 */
export const resolveStyleProfile = (input: {
 channelId: string
 assetType?: string
}): StyleProfile | null => {
 const candidates = listStyleProfiles(input.channelId)
 if (input.assetType) {
  const forAsset = candidates.find(
   (profile) => profile.scope === "format" && profile.assetType === input.assetType,
  )
  if (forAsset) return forAsset
 }
 return candidates.find((profile) => profile.scope === "channel") || null
}

/** Creator edits win outright: extraction proposes, the creator decides. */
export const updateStyleDescriptor = (
 profileId: string,
 descriptor: Partial<StyleDescriptor>,
): StyleProfile | null => {
 const profiles = readAll()
 const found = profiles.find((profile) => profile.id === profileId)
 if (!found) return null
 const next: StyleProfile = {
  ...found,
  descriptor: {
   ...found.descriptor,
   ...descriptor,
   vocabulary: {
    prefer: descriptor.vocabulary?.prefer ?? found.descriptor.vocabulary.prefer,
    avoid: descriptor.vocabulary?.avoid ?? found.descriptor.vocabulary.avoid,
   },
  },
  source: found.source === "extracted_from_published" ? "hybrid" : found.source,
  updatedAt: new Date().toISOString(),
 }
 writeAll(profiles.map((profile) => (profile.id === profileId ? next : profile)))
 return next
}

/** Replaces the exemplar set, re-selecting for coverage and re-deriving the target features. */
export const setStyleExemplars = (
 profileId: string,
 samples: Array<{ text: string; sourceRef?: string }>,
): StyleProfile | null => {
 const profiles = readAll()
 const found = profiles.find((profile) => profile.id === profileId)
 if (!found) return null
 const exemplars = selectDiverseExemplars(samples.map(buildExemplar), MAXIMUM_EXEMPLARS)
 const next: StyleProfile = {
  ...found,
  exemplars,
  features: averageStyleFeatures(exemplars.map((exemplar) => extractStyleFeatures(exemplar.text))),
  confidence: confidenceForExemplars(exemplars.length),
  updatedAt: new Date().toISOString(),
 }
 writeAll(profiles.map((profile) => (profile.id === profileId ? next : profile)))
 return next
}

export interface StyleViolation {
 kind: "avoided_term" | "stylometric"
 detail: string
}

export interface StyleEvaluation {
 /** 0-100 stylometric match. */
 score: number
 passed: boolean
 /** Worst-first, for building a specific repair instruction. */
 deltas: StyleFeatureDelta[]
 violations: StyleViolation[]
 /** Human-readable repair instructions naming the actual problem. */
 repairInstructions: string[]
}

const FEATURE_GUIDANCE: Record<keyof StyleFeatures, { high: string; low: string }> = {
 meanSentenceLength: { high: "Use shorter sentences.", low: "Use longer, less clipped sentences." },
 sentenceLengthVariation: { high: "Even out sentence lengths.", low: "Vary sentence length more." },
 meanWordLength: { high: "Prefer plainer, shorter words.", low: "Use more precise, specific vocabulary." },
 typeTokenRatio: { high: "Repeat key terms rather than reaching for synonyms.", low: "Widen the vocabulary; it is repetitive." },
 questionRate: { high: "Ask fewer questions.", low: "Ask the audience more direct questions." },
 exclamationRate: { high: "Remove exclamation marks.", low: "Allow a little more energy in the punctuation." },
 secondPersonRate: { high: "Address the viewer as 'you' less often.", low: "Address the viewer directly more often." },
 contractionRate: { high: "Use fewer contractions; the register is more formal.", low: "Use contractions; the register is conversational." },
 emojiDensity: { high: "Use fewer emoji.", low: "Emoji are part of this voice; include some." },
 allCapsRate: { high: "Stop using ALL CAPS for emphasis.", low: "Occasional capitalised emphasis fits this voice." },
 meanParagraphSentences: { high: "Break into shorter paragraphs.", low: "Group sentences into fuller paragraphs." },
}

/**
 * Score a draft against a profile and say specifically what is wrong.
 *
 * The repair instructions matter as much as the score: repairing with "match the style
 * better" reliably produces another mismatch, whereas "use shorter sentences; stop using
 * ALL CAPS" is actionable.
 */
export const evaluateStyleFidelity = (input: {
 text: string
 profile: StyleProfile | null
}): StyleEvaluation => {
 if (!input.profile || !input.profile.exemplars.length) {
  // No profile is not a failure: it means style was never asserted, so nothing is owed.
  return { score: 0, passed: true, deltas: [], violations: [], repairInstructions: [] }
 }

 const actual = extractStyleFeatures(input.text)
 const deltas = compareStyleFeatures(input.profile.features, actual)
 const score = styleFidelityScore(input.profile.features, actual)

 const lowered = input.text.toLowerCase()
 const violations: StyleViolation[] = input.profile.descriptor.vocabulary.avoid
  .filter((term) => term.trim() && lowered.includes(term.toLowerCase()))
  .map((term) => ({ kind: "avoided_term" as const, detail: `Uses "${term}", which this channel avoids.` }))

 const repairInstructions = violations.map((violation) => violation.detail)
 // Only the genuinely divergent features are worth instructing on; listing all eleven
 // would bury the real problem.
 for (const delta of deltas.filter((entry) => entry.distance >= 0.5).slice(0, 3)) {
  const guidance = FEATURE_GUIDANCE[delta.feature]
  repairInstructions.push(delta.actual > delta.target ? guidance.high : guidance.low)
 }

 return {
  score,
  passed: score >= STYLE_FIDELITY_FLOOR && violations.length === 0,
  deltas,
  violations,
  repairInstructions,
 }
}

/**
 * The style section of a generation prompt.
 *
 * Exemplars are labelled as the creator's own writing and capped by construction. The
 * descriptor is stated before them so explicit rules take precedence over whatever the
 * model infers from the samples.
 */
export const buildStylePromptSection = (profile: StyleProfile | null): string => {
 if (!profile) return ""
 const { descriptor } = profile
 const lines: string[] = ["CREATOR STYLE — match this voice."]

 if (descriptor.voice) lines.push(`Voice: ${descriptor.voice}`)
 if (descriptor.pacing) lines.push(`Pacing: ${descriptor.pacing}`)
 if (descriptor.structure) lines.push(`Structure: ${descriptor.structure}`)
 if (descriptor.openingPattern) lines.push(`Opens with: ${descriptor.openingPattern}`)
 if (descriptor.closingPattern) lines.push(`Closes with: ${descriptor.closingPattern}`)
 if (descriptor.productionQuality) lines.push(`Production bar: ${descriptor.productionQuality}`)
 if (descriptor.vocabulary.prefer.length) lines.push(`Prefer: ${descriptor.vocabulary.prefer.join(", ")}`)
 if (descriptor.vocabulary.avoid.length) lines.push(`Never use: ${descriptor.vocabulary.avoid.join(", ")}`)

 if (profile.exemplars.length) {
  lines.push("", "The creator's own writing, for voice only — never copy their content:")
  profile.exemplars.forEach((exemplar, index) => {
   lines.push(`[${index + 1}] ${exemplar.text}`)
  })
 }

 return lines.join("\n")
}

/**
 * Observable style facts derived from a creator's published work.
 *
 * Deliberately partial. Stylometrics and distinctive vocabulary are computable; the prose
 * voice description is not, and is left empty for the creator or a later model-assisted
 * pass to fill rather than fabricated here.
 */
export const proposeStyleProfileFromSamples = (input: {
 channelId: string
 assetType?: string
 samples: Array<{ text: string; sourceRef?: string }>
}): StyleProfile => {
 const exemplars = selectDiverseExemplars(input.samples, MAXIMUM_EXEMPLARS)
 const features = averageStyleFeatures(exemplars.map((sample) => extractStyleFeatures(sample.text)))

 const observations: string[] = []
 if (features.meanSentenceLength) {
  observations.push(`sentences average ${Math.round(features.meanSentenceLength)} words`)
 }
 if (features.emojiDensity > 0.5) observations.push("uses emoji")
 if (features.exclamationRate > 0.25) observations.push("uses exclamation marks")
 if (features.secondPersonRate > 2) observations.push("addresses the viewer directly")
 if (features.contractionRate > 2) observations.push("conversational register")
 if (features.allCapsRate > 1) observations.push("capitalises for emphasis")

 return createStyleProfile({
  channelId: input.channelId,
  scope: input.assetType ? "format" : "channel",
  assetType: input.assetType,
  samples: exemplars,
  source: "extracted_from_published",
  descriptor: {
   // Measured, not guessed. `voice` stays empty until a human or a model states it.
   pacing: observations.join("; "),
  },
 })
}

export const styleFeatureKeys = STYLE_FEATURE_KEYS
