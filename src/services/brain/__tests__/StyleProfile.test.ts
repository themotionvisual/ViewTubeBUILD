// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import {
 buildStylePromptSection,
 createStyleProfile,
 evaluateStyleFidelity,
 listStyleProfiles,
 MAXIMUM_EXEMPLARS,
 proposeStyleProfileFromSamples,
 resolveStyleProfile,
 selectDiverseExemplars,
 setStyleExemplars,
 STYLE_FIDELITY_FLOOR,
 updateStyleDescriptor,
} from "../StyleProfile"

const terseSamples = [
 { text: "Pulled the head off. Bearings were shot. Rebuilt it in a day." },
 { text: "Dropped the sump. Oil was black. Changed it and moved on." },
 { text: "Stripped the loom. Found the short. Soldered it clean." },
]

beforeEach(() => {
 localStorage.clear()
})

describe("createStyleProfile", () => {
 it("derives target features from the samples and persists", () => {
  const profile = createStyleProfile({ channelId: "channel-1", samples: terseSamples })
  expect(profile.features.meanSentenceLength).toBeGreaterThan(0)
  expect(profile.exemplars).toHaveLength(3)
  expect(listStyleProfiles("channel-1")).toHaveLength(1)
 })

 it("never stores more than the research-backed exemplar cap", () => {
  const many = Array.from({ length: 20 }, (_, index) => ({
   text: `Sample ${index}. It has a couple of sentences. Roughly this long.`,
  }))
  const profile = createStyleProfile({ channelId: "channel-1", samples: many })
  expect(profile.exemplars).toHaveLength(MAXIMUM_EXEMPLARS)
 })

 it("reports low confidence when it has barely any evidence of the voice", () => {
  expect(createStyleProfile({ channelId: "c", samples: [] }).confidence).toBe("low")
  expect(createStyleProfile({ channelId: "c", samples: terseSamples }).confidence).toBe("medium")
  expect(
   createStyleProfile({
    channelId: "c",
    samples: [...terseSamples, { text: "Cleaned the ports. Ran it up. Sounded right." }],
   }).confidence,
  ).toBe("high")
 })

 it("is creator_authored when there is nothing published to learn from", () => {
  expect(createStyleProfile({ channelId: "c", samples: [] }).source).toBe("creator_authored")
 })
})

describe("selectDiverseExemplars", () => {
 it("returns everything when under the cap", () => {
  expect(selectDiverseExemplars(terseSamples, 5)).toHaveLength(3)
 })

 it("drops blank samples", () => {
  expect(selectDiverseExemplars([...terseSamples, { text: "   " }], 5)).toHaveLength(3)
 })

 it("picks for coverage rather than input order", () => {
  // Four near-identical terse samples plus one clearly different voice. A recency or
  // slice-based selection taking the first two would miss the outlier entirely.
  const candidates = [
   ...terseSamples,
   { text: "Skimmed the deck. Torqued it down. Done." },
   {
    text: "You are absolutely going to LOVE what happens next, and I genuinely cannot wait " +
     "for you to see the reveal because it honestly exceeded every expectation I had 😍",
   },
  ]
  const picked = selectDiverseExemplars(candidates, 2)
  expect(picked).toHaveLength(2)
  expect(picked.some((sample) => sample.text.includes("LOVE"))).toBe(true)
 })
})

describe("resolveStyleProfile", () => {
 it("prefers an asset-type profile over the channel profile", () => {
  createStyleProfile({ channelId: "channel-1", scope: "channel", samples: terseSamples })
  const forPosts = createStyleProfile({
   channelId: "channel-1",
   scope: "format",
   assetType: "community_post",
   samples: terseSamples,
  })
  const resolved = resolveStyleProfile({ channelId: "channel-1", assetType: "community_post" })
  expect(resolved?.id).toBe(forPosts.id)
 })

 it("falls back to the channel profile for an unknown asset type", () => {
  const channel = createStyleProfile({ channelId: "channel-1", scope: "channel", samples: terseSamples })
  expect(resolveStyleProfile({ channelId: "channel-1", assetType: "script" })?.id).toBe(channel.id)
 })

 it("returns null rather than inventing a voice for an unknown channel", () => {
  expect(resolveStyleProfile({ channelId: "nobody" })).toBeNull()
 })
})

describe("updateStyleDescriptor", () => {
 it("lets the creator override an extracted voice and marks the profile hybrid", () => {
  const profile = proposeStyleProfileFromSamples({ channelId: "channel-1", samples: terseSamples })
  expect(profile.source).toBe("extracted_from_published")
  const updated = updateStyleDescriptor(profile.id, { voice: "wry, technical, never hypey" })
  expect(updated?.descriptor.voice).toBe("wry, technical, never hypey")
  expect(updated?.source).toBe("hybrid")
 })

 it("preserves vocabulary lists that the edit does not mention", () => {
  const profile = createStyleProfile({
   channelId: "channel-1",
   samples: terseSamples,
   descriptor: { vocabulary: { prefer: ["teardown"], avoid: ["insane"] } },
  })
  const updated = updateStyleDescriptor(profile.id, { pacing: "brisk" })
  expect(updated?.descriptor.vocabulary.avoid).toEqual(["insane"])
  expect(updated?.descriptor.vocabulary.prefer).toEqual(["teardown"])
 })

 it("returns null for an unknown profile", () => {
  expect(updateStyleDescriptor("missing", { voice: "x" })).toBeNull()
 })
})

describe("setStyleExemplars", () => {
 it("re-derives target features and re-applies the cap", () => {
  const profile = createStyleProfile({ channelId: "channel-1", samples: terseSamples })
  const before = profile.features.meanSentenceLength
  const updated = setStyleExemplars(profile.id, [
   { text: "This is a considerably longer sentence than anything in the original sample set, deliberately so." },
   { text: "And here is a second one, also written at noticeably greater length for contrast." },
  ])
  expect(updated?.features.meanSentenceLength).not.toBeCloseTo(before, 3)
  expect(updated?.exemplars.length).toBeLessThanOrEqual(MAXIMUM_EXEMPLARS)
 })
})

describe("evaluateStyleFidelity", () => {
 it("passes a draft written in the profile's voice", () => {
  const profile = createStyleProfile({ channelId: "channel-1", samples: terseSamples })
  const evaluation = evaluateStyleFidelity({
   text: "Lifted the box. Splines were worn. Swapped it out.",
   profile,
  })
  expect(evaluation.score).toBeGreaterThanOrEqual(STYLE_FIDELITY_FLOOR)
  expect(evaluation.passed).toBe(true)
 })

 it("fails a draft in a different voice and says specifically why", () => {
  const profile = createStyleProfile({ channelId: "channel-1", samples: terseSamples })
  const evaluation = evaluateStyleFidelity({
   text:
    "You are going to absolutely LOVE this one!!! I genuinely cannot believe how " +
    "unbelievably incredible the whole thing turned out to be in the end 😍🔥🎉",
   profile,
  })
  expect(evaluation.passed).toBe(false)
  expect(evaluation.repairInstructions.length).toBeGreaterThan(0)
  // Instructions must name the problem, not just assert a mismatch.
  expect(evaluation.repairInstructions.join(" ")).toMatch(/sentence|emoji|CAPS|exclamation/i)
 })

 it("fails on an avoided term regardless of a good stylometric score", () => {
  const profile = createStyleProfile({
   channelId: "channel-1",
   samples: terseSamples,
   descriptor: { vocabulary: { prefer: [], avoid: ["insane"] } },
  })
  const evaluation = evaluateStyleFidelity({
   text: "Pulled the cover. Insane wear inside. Replaced it.",
   profile,
  })
  expect(evaluation.passed).toBe(false)
  expect(evaluation.violations[0].kind).toBe("avoided_term")
  expect(evaluation.repairInstructions[0]).toContain("insane")
 })

 it("treats an absent profile as nothing owed rather than a failure", () => {
  const evaluation = evaluateStyleFidelity({ text: "Anything at all.", profile: null })
  expect(evaluation.passed).toBe(true)
  expect(evaluation.repairInstructions).toEqual([])
 })

 it("keeps repair instructions short enough to be actionable", () => {
  const profile = createStyleProfile({ channelId: "channel-1", samples: terseSamples })
  const evaluation = evaluateStyleFidelity({
   text: "You are going to LOVE this!!! 😍🔥🎉 Honestly incredible, truly unbelievable stuff.",
   profile,
  })
  expect(evaluation.repairInstructions.length).toBeLessThanOrEqual(5)
 })
})

describe("buildStylePromptSection", () => {
 it("is empty without a profile", () => {
  expect(buildStylePromptSection(null)).toBe("")
 })

 it("states explicit rules before the exemplars", () => {
  const profile = createStyleProfile({
   channelId: "channel-1",
   samples: terseSamples,
   descriptor: {
    voice: "wry, technical",
    vocabulary: { prefer: ["teardown"], avoid: ["insane"] },
   },
  })
  const section = buildStylePromptSection(profile)
  expect(section.indexOf("Voice: wry, technical")).toBeLessThan(section.indexOf("[1]"))
  expect(section).toContain("Never use: insane")
 })

 it("labels exemplars as voice reference, not content to reuse", () => {
  const profile = createStyleProfile({ channelId: "channel-1", samples: terseSamples })
  expect(buildStylePromptSection(profile)).toContain("never copy their content")
 })
})

describe("proposeStyleProfileFromSamples", () => {
 it("records measurable observations and leaves the prose voice for the creator", () => {
  const profile = proposeStyleProfileFromSamples({ channelId: "channel-1", samples: terseSamples })
  expect(profile.descriptor.pacing).toContain("sentences average")
  // Never fabricate a voice description the evidence cannot support.
  expect(profile.descriptor.voice).toBe("")
 })

 it("notes an emoji-heavy, high-energy voice when that is what the samples show", () => {
  const profile = proposeStyleProfileFromSamples({
   channelId: "channel-2",
   samples: [
    { text: "You will love this! 😍 Incredible stuff!" },
    { text: "You have to see this one! 🔥 Unreal!" },
   ],
  })
  expect(profile.descriptor.pacing).toMatch(/emoji/)
  expect(profile.descriptor.pacing).toMatch(/exclamation|directly/)
 })
})
