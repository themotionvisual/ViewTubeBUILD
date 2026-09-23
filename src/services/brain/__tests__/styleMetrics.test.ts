import { describe, expect, it } from "vitest"
import {
 averageStyleFeatures,
 compareStyleFeatures,
 EMPTY_STYLE_FEATURES,
 extractStyleFeatures,
 styleFidelityScore,
} from "../styleMetrics"

const terse = "Pulled the head off. Bearings were shot. Rebuilt it in a day."
const effusive =
 "You are going to LOVE this one!! I honestly cannot believe how incredible it turned out, " +
 "and I think you're going to feel exactly the same way when you see the final reveal 😍🔥"

describe("extractStyleFeatures", () => {
 it("returns the empty vector for blank input", () => {
  expect(extractStyleFeatures("")).toEqual(EMPTY_STYLE_FEATURES)
  expect(extractStyleFeatures("   \n  ")).toEqual(EMPTY_STYLE_FEATURES)
 })

 it("measures sentence length and word length", () => {
  const features = extractStyleFeatures(terse)
  expect(features.meanSentenceLength).toBeGreaterThan(3)
  expect(features.meanSentenceLength).toBeLessThan(7)
  expect(features.meanWordLength).toBeGreaterThan(3)
 })

 it("separates a terse voice from an effusive one on the markers that matter", () => {
  const a = extractStyleFeatures(terse)
  const b = extractStyleFeatures(effusive)
  expect(b.meanSentenceLength).toBeGreaterThan(a.meanSentenceLength)
  expect(b.exclamationRate).toBeGreaterThan(a.exclamationRate)
  expect(b.secondPersonRate).toBeGreaterThan(a.secondPersonRate)
  expect(b.emojiDensity).toBeGreaterThan(0)
  expect(a.emojiDensity).toBe(0)
 })

 it("counts all-caps emphasis without counting single letters", () => {
  expect(extractStyleFeatures("This is a LOVE letter").allCapsRate).toBeGreaterThan(0)
  expect(extractStyleFeatures("I went to a shop").allCapsRate).toBe(0)
 })

 it("counts contractions with either apostrophe form", () => {
  expect(extractStyleFeatures("It's fine and I'm done").contractionRate).toBeGreaterThan(0)
  expect(extractStyleFeatures("It’s fine and I’m done").contractionRate).toBeGreaterThan(0)
  expect(extractStyleFeatures("It is fine and I am done").contractionRate).toBe(0)
 })

 it("measures question rate", () => {
  expect(extractStyleFeatures("What broke? Why now? Who knows?").questionRate).toBe(1)
  expect(extractStyleFeatures("It broke. It is fixed.").questionRate).toBe(0)
 })

 it("does not let emoji inflate the word count", () => {
  const features = extractStyleFeatures("Great build 🔥🔥🔥")
  expect(features.emojiDensity).toBeGreaterThan(0)
  expect(features.meanWordLength).toBeGreaterThan(3)
 })

 it("measures paragraph structure", () => {
  const single = extractStyleFeatures("One. Two. Three. Four.")
  const split = extractStyleFeatures("One. Two.\n\nThree. Four.")
  expect(single.meanParagraphSentences).toBeGreaterThan(split.meanParagraphSentences)
 })
})

describe("averageStyleFeatures", () => {
 it("averages samples so a profile speaks for a body of work", () => {
  const averaged = averageStyleFeatures([
   extractStyleFeatures(terse),
   extractStyleFeatures(effusive),
  ])
  const a = extractStyleFeatures(terse)
  const b = extractStyleFeatures(effusive)
  expect(averaged.meanSentenceLength).toBeCloseTo((a.meanSentenceLength + b.meanSentenceLength) / 2, 5)
 })

 it("returns the empty vector for no samples", () => {
  expect(averageStyleFeatures([])).toEqual(EMPTY_STYLE_FEATURES)
 })
})

describe("styleFidelityScore", () => {
 it("scores identical text as a perfect match", () => {
  const features = extractStyleFeatures(terse)
  expect(styleFidelityScore(features, features)).toBe(100)
 })

 it("scores a mismatched voice well below a matched one", () => {
  const target = extractStyleFeatures(terse)
  const sameVoice = extractStyleFeatures("Dropped the sump. Oil was black. Changed it.")
  const otherVoice = extractStyleFeatures(effusive)
  expect(styleFidelityScore(target, sameVoice)).toBeGreaterThan(
   styleFidelityScore(target, otherVoice),
  )
 })

 it("stays within 0-100", () => {
  const score = styleFidelityScore(
   extractStyleFeatures(terse),
   extractStyleFeatures(effusive),
  )
  expect(score).toBeGreaterThanOrEqual(0)
  expect(score).toBeLessThanOrEqual(100)
 })
})

describe("compareStyleFeatures", () => {
 it("orders deltas worst first so a repair prompt can name the real problem", () => {
  const deltas = compareStyleFeatures(
   extractStyleFeatures(terse),
   extractStyleFeatures(effusive),
  )
  expect(deltas[0].distance).toBeGreaterThanOrEqual(deltas[deltas.length - 1].distance)
  expect(deltas.every((delta) => delta.distance >= 0 && delta.distance <= 1)).toBe(true)
 })

 it("reports both the target and the actual value so the delta is explainable", () => {
  const [worst] = compareStyleFeatures(
   extractStyleFeatures(terse),
   extractStyleFeatures(effusive),
  )
  expect(worst).toHaveProperty("target")
  expect(worst).toHaveProperty("actual")
  expect(worst.target).not.toBe(worst.actual)
 })

 it("covers every feature", () => {
  const deltas = compareStyleFeatures(EMPTY_STYLE_FEATURES, EMPTY_STYLE_FEATURES)
  expect(deltas).toHaveLength(11)
 })
})
