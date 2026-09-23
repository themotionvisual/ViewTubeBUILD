/**
 * Deterministic stylometrics.
 *
 * Style fidelity has to be a number before it can be gated on, and the obvious approach —
 * cosine similarity over embeddings — costs a model call per check and produces a score
 * nobody can explain to a creator. These features cost nothing, are stable across runs,
 * and each one is nameable: "your sentences average 14 words, this draft averages 27".
 *
 * That explainability is the point. The same vector drives the fidelity score and the
 * creator-facing Style Fingerprint, so the number the gate uses and the shape the creator
 * sees are the same measurement.
 *
 * An embedding channel can be added later as a second opinion. It is not a prerequisite,
 * and research suggests explicit stylometric distance is competitive for the
 * short-form, high-frequency assets this is used on.
 */

export interface StyleFeatures {
 /** Words per sentence. */
 meanSentenceLength: number
 /** Coefficient of variation of sentence length: rhythm, not just pace. */
 sentenceLengthVariation: number
 /** Characters per word. */
 meanWordLength: number
 /** Distinct words / total words. Vocabulary range. */
 typeTokenRatio: number
 /** Questions per sentence. */
 questionRate: number
 /** Exclamations per sentence. */
 exclamationRate: number
 /** "you"/"your" per 100 words. Direct address is a strong voice marker. */
 secondPersonRate: number
 /** Contractions per 100 words. Separates conversational from formal registers. */
 contractionRate: number
 /** Emoji per 100 words. */
 emojiDensity: number
 /** ALL-CAPS words per 100 words. */
 allCapsRate: number
 /** Sentences per paragraph. */
 meanParagraphSentences: number
}

export const EMPTY_STYLE_FEATURES: StyleFeatures = {
 meanSentenceLength: 0,
 sentenceLengthVariation: 0,
 meanWordLength: 0,
 typeTokenRatio: 0,
 questionRate: 0,
 exclamationRate: 0,
 secondPersonRate: 0,
 contractionRate: 0,
 emojiDensity: 0,
 allCapsRate: 0,
 meanParagraphSentences: 0,
}

/**
 * How much difference in each feature counts as a complete mismatch. Derived from what a
 * reader would notice: a 10-word swing in average sentence length reads as a different
 * writer; a 0.5-character swing in word length does not.
 */
const FEATURE_TOLERANCE: Record<keyof StyleFeatures, number> = {
 meanSentenceLength: 10,
 sentenceLengthVariation: 0.5,
 meanWordLength: 1.5,
 typeTokenRatio: 0.25,
 questionRate: 0.4,
 exclamationRate: 0.3,
 secondPersonRate: 5,
 contractionRate: 5,
 emojiDensity: 3,
 allCapsRate: 4,
 meanParagraphSentences: 3,
}

export const STYLE_FEATURE_KEYS = Object.keys(FEATURE_TOLERANCE) as Array<keyof StyleFeatures>

// Emoji and pictographic symbols. Kept explicit rather than relying on \p{Emoji}, which
// also matches digits and common punctuation in some engines.
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{1F1E6}-\u{1F1FF}]/gu
const CONTRACTION = /\b\w+['’](?:s|t|re|ve|ll|d|m)\b/gi

const splitSentences = (text: string): string[] =>
 text
  .split(/(?<=[.!?])\s+|\n+/)
  .map((sentence) => sentence.trim())
  .filter(Boolean)

const splitWords = (text: string): string[] =>
 text
  .replace(EMOJI, " ")
  .split(/\s+/)
  .map((word) => word.replace(/^[^\w'’-]+|[^\w'’-]+$/g, ""))
  .filter(Boolean)

const splitParagraphs = (text: string): string[] =>
 text
  .split(/\n\s*\n/)
  .map((paragraph) => paragraph.trim())
  .filter(Boolean)

const standardDeviation = (values: number[]): number => {
 if (values.length < 2) return 0
 const mean = values.reduce((total, value) => total + value, 0) / values.length
 const variance = values.reduce((total, value) => total + (value - mean) ** 2, 0) / values.length
 return Math.sqrt(variance)
}

export const extractStyleFeatures = (text: string): StyleFeatures => {
 const trimmed = (text || "").trim()
 if (!trimmed) return { ...EMPTY_STYLE_FEATURES }

 const sentences = splitSentences(trimmed)
 const words = splitWords(trimmed)
 const paragraphs = splitParagraphs(trimmed)
 if (!words.length || !sentences.length) return { ...EMPTY_STYLE_FEATURES }

 const sentenceLengths = sentences.map((sentence) => splitWords(sentence).length || 1)
 const meanSentenceLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length
 const per100 = (count: number) => (count / words.length) * 100
 const lowerWords = words.map((word) => word.toLowerCase())

 return {
  meanSentenceLength,
  sentenceLengthVariation: meanSentenceLength
   ? standardDeviation(sentenceLengths) / meanSentenceLength
   : 0,
  meanWordLength: words.reduce((total, word) => total + word.length, 0) / words.length,
  typeTokenRatio: new Set(lowerWords).size / words.length,
  questionRate: sentences.filter((sentence) => sentence.endsWith("?")).length / sentences.length,
  exclamationRate: sentences.filter((sentence) => sentence.endsWith("!")).length / sentences.length,
  secondPersonRate: per100(lowerWords.filter((word) => word === "you" || word === "your" || word === "you're").length),
  contractionRate: per100((trimmed.match(CONTRACTION) || []).length),
  emojiDensity: per100((trimmed.match(EMOJI) || []).length),
  allCapsRate: per100(words.filter((word) => word.length > 1 && word === word.toUpperCase() && /[A-Z]/.test(word)).length),
  meanParagraphSentences: paragraphs.length ? sentences.length / paragraphs.length : sentences.length,
 }
}

/** Mean of several samples, so a profile speaks for a body of work rather than one post. */
export const averageStyleFeatures = (samples: StyleFeatures[]): StyleFeatures => {
 if (!samples.length) return { ...EMPTY_STYLE_FEATURES }
 const total = { ...EMPTY_STYLE_FEATURES }
 for (const sample of samples) {
  for (const key of STYLE_FEATURE_KEYS) total[key] += sample[key]
 }
 for (const key of STYLE_FEATURE_KEYS) total[key] /= samples.length
 return total
}

export interface StyleFeatureDelta {
 feature: keyof StyleFeatures
 target: number
 actual: number
 /** 0 = indistinguishable, 1 = completely different. */
 distance: number
}

/** Per-feature deltas, worst first — this is what a repair prompt should be built from. */
export const compareStyleFeatures = (
 target: StyleFeatures,
 actual: StyleFeatures,
): StyleFeatureDelta[] =>
 STYLE_FEATURE_KEYS
  .map((feature) => ({
   feature,
   target: target[feature],
   actual: actual[feature],
   distance: Math.min(1, Math.abs(target[feature] - actual[feature]) / FEATURE_TOLERANCE[feature]),
  }))
  .sort((left, right) => right.distance - left.distance)

/** 0-100, where 100 means stylometrically indistinguishable from the target. */
export const styleFidelityScore = (target: StyleFeatures, actual: StyleFeatures): number => {
 const deltas = compareStyleFeatures(target, actual)
 if (!deltas.length) return 0
 const mean = deltas.reduce((total, delta) => total + delta.distance, 0) / deltas.length
 return Math.round((1 - mean) * 100)
}
