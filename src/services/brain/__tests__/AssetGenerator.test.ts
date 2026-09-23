// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest"
import {
 ASSET_CONSTITUTION_VERSION,
 generateAsset,
 getGeneratedAsset,
 listGeneratedAssets,
 type AssetModelCall,
 type AssetModelRunner,
 type AssetRequest,
 type AssetEvidence,
} from "../AssetGenerator"
import { communityPostStrategy, type CommunityPostPlan } from "../assetStrategies/communityPost"
import { createStyleProfile } from "../StyleProfile"

const terseSamples = [
 { text: "Pulled the head off. Bearings were shot. Rebuilt it in a day." },
 { text: "Dropped the sump. Oil was black. Changed it and moved on." },
 { text: "Stripped the loom. Found the short. Soldered it clean." },
]

const evidence: AssetEvidence = {
 requested: ["channel_profile", "top_videos"],
 refs: ["dataset:top_videos:snap-1"],
 missing: ["recent_community_engagement"],
 payload: {
  channel: { label: "Restoration Works", subscribers: 48200 },
  topVideos: [{ title: "Rebuilding a 1954 Fordson", views: 1284730 }],
 },
 summary: "Restoration Works, 48,200 subscribers. Best video: Rebuilding a 1954 Fordson (1,284,730 views).",
}

const request: AssetRequest = {
 channelId: "channel-1",
 assetType: "community_post",
 instruction: "Plan next week's community posts.",
 inputs: { days: 3, schedule: "Tue: gearbox teardown part 2" },
}

const post = (day: number, overrides: Partial<CommunityPostPlan["posts"][number]> = {}) => ({
 day,
 kind: "text" as const,
 body: `Stripped another box today. Splines were worn. Day ${day}.`,
 intent: "Keep the teardown series visible.",
 ...overrides,
})

const goodPlan: CommunityPostPlan = {
 posts: [
  post(1),
  post(2, { kind: "poll", pollOptions: ["Gearbox first", "Engine first"], body: "Which should I tackle next? Both need work." }),
  post(3, { kind: "question", body: "What broke first on your own rebuild? Curious what fails most." }),
 ],
 notes: [],
}

/** Records what the model was asked, so prompt composition can be asserted. */
const makeRunner = (
 plans: CommunityPostPlan[],
): { runner: AssetModelRunner; calls: AssetModelCall[] } => {
 const calls: AssetModelCall[] = []
 let index = 0
 const runner = (async (call: AssetModelCall) => {
  calls.push(call)
  const plan = plans[Math.min(index, plans.length - 1)]
  index += 1
  return { output: plan }
 }) as AssetModelRunner
 return { runner, calls }
}

beforeEach(() => {
 localStorage.clear()
})

describe("generateAsset", () => {
 it("delivers a clean asset and records a joinable asset id", async () => {
  const { runner } = makeRunner([goodPlan])
  const result = await generateAsset({
   request,
   strategy: communityPostStrategy,
   evidence,
   runner,
   styleProfile: null,
  })

  expect(result.record.status).toBe("delivered")
  expect(result.record.repairAttempts).toBe(0)
  expect(result.record.id).toMatch(/^asset_/)
  // The trace points at the asset, which is how an outcome later finds this generation.
  expect(result.trace.outputRef).toBe(result.record.id)
  expect(getGeneratedAsset(result.record.id)?.id).toBe(result.record.id)
 })

 it("composes the constitution, evidence, gaps and task into the system instruction", async () => {
  const { runner, calls } = makeRunner([goodPlan])
  await generateAsset({ request, strategy: communityPostStrategy, evidence, runner, styleProfile: null })

  const instruction = calls[0].systemInstruction
  expect(instruction).toContain("ViewTube's creator assistant")
  expect(instruction).toContain("CHANNEL EVIDENCE")
  expect(instruction).toContain("48,200 subscribers")
  // Missing evidence is named so the model can say so rather than invent around it.
  expect(instruction).toContain("EVIDENCE NOT AVAILABLE")
  expect(instruction).toContain("recent_community_engagement")
  expect(instruction).toContain("TASK")
  expect(instruction).toContain("gearbox teardown part 2")
  expect(instruction).not.toContain("FIX THE PREVIOUS DRAFT")
 })

 it("records both prompt versions so an outcome is attributable to a configuration", async () => {
  const { runner } = makeRunner([goodPlan])
  const result = await generateAsset({
   request, strategy: communityPostStrategy, evidence, runner, styleProfile: null,
  })
  expect(result.record.promptVersions).toEqual({
   constitution: ASSET_CONSTITUTION_VERSION,
   community_post: "community-post-v1",
  })
 })

 it("blocks and repairs a fabricated figure, then delivers", async () => {
  const invented: CommunityPostPlan = {
   ...goodPlan,
   posts: [
    post(1, { body: "This channel just passed 92,400 subscribers. Wild." }),
    goodPlan.posts[1],
    goodPlan.posts[2],
   ],
  }
  const { runner, calls } = makeRunner([invented, goodPlan])
  const result = await generateAsset({
   request, strategy: communityPostStrategy, evidence, runner, styleProfile: null,
  })

  expect(calls).toHaveLength(2)
  expect(calls[1].systemInstruction).toContain("FIX THE PREVIOUS DRAFT")
  expect(calls[1].systemInstruction).toContain("92,400")
  expect(result.record.repairAttempts).toBe(1)
  expect(result.record.status).toBe("delivered")
  expect(result.record.fabricatedNumbers).toEqual([])
 })

 it("returns needs_review rather than delivering output that still fails a gate", async () => {
  const invented: CommunityPostPlan = {
   ...goodPlan,
   posts: [post(1, { body: "We just passed 92,400 subscribers." }), goodPlan.posts[1], goodPlan.posts[2]],
  }
  const { runner } = makeRunner([invented, invented])
  const result = await generateAsset({
   request, strategy: communityPostStrategy, evidence, runner, styleProfile: null,
  })

  expect(result.record.status).toBe("needs_review")
  expect(result.record.fabricatedNumbers).toContain("92,400")
  expect(result.trace.status).toBe("fallback")
 })

 it("keeps a supported figure without repairing", async () => {
  const grounded: CommunityPostPlan = {
   ...goodPlan,
   posts: [
    post(1, { body: "The Fordson build just crossed 1.28M views. Thanks for that." }),
    goodPlan.posts[1],
    goodPlan.posts[2],
   ],
  }
  const { runner, calls } = makeRunner([grounded])
  const result = await generateAsset({
   request, strategy: communityPostStrategy, evidence, runner, styleProfile: null,
  })
  expect(calls).toHaveLength(1)
  expect(result.record.status).toBe("delivered")
 })

 it("flags an unverified percentage as a warning rather than blocking", async () => {
  const derived: CommunityPostPlan = {
   ...goodPlan,
   posts: [post(1, { body: "Views are up 34% on the series. Good week." }), goodPlan.posts[1], goodPlan.posts[2]],
  }
  const { runner, calls } = makeRunner([derived])
  const result = await generateAsset({
   request, strategy: communityPostStrategy, evidence, runner, styleProfile: null,
  })
  expect(calls).toHaveLength(1)
  expect(result.record.status).toBe("delivered_with_warnings")
  expect(result.record.unverifiedDerivedNumbers).toContain("34%")
 })

 it("scores and gates on style when a profile exists", async () => {
  const profile = createStyleProfile({ channelId: "channel-1", samples: terseSamples })
  const offVoice: CommunityPostPlan = {
   posts: [
    post(1, { body: "You are going to absolutely LOVE this one!!! I genuinely cannot believe how unbelievably incredible the whole thing turned out 😍🔥🎉" }),
    post(2, { kind: "poll", pollOptions: ["Yes!!!", "Absolutely!!!"], body: "Are you as excited as I am about this incredible upcoming reveal?!!" }),
    post(3, { kind: "question", body: "What is the single most amazing restoration you have ever witnessed in your entire life?!" }),
   ],
   notes: [],
  }
  const { runner, calls } = makeRunner([offVoice, goodPlan])
  const result = await generateAsset({
   request, strategy: communityPostStrategy, evidence, runner, styleProfile: profile,
  })

  expect(calls).toHaveLength(2)
  // The repair names the actual stylometric problem, not "match the style better".
  expect(calls[1].systemInstruction).toMatch(/sentence|emoji|CAPS|exclamation/i)
  expect(result.record.styleProfileId).toBe(profile.id)
  expect(result.record.status).toBe("delivered")
 })

 it("includes the style section and labels exemplars as voice reference", async () => {
  const profile = createStyleProfile({ channelId: "channel-1", samples: terseSamples })
  const { runner, calls } = makeRunner([goodPlan])
  await generateAsset({ request, strategy: communityPostStrategy, evidence, runner, styleProfile: profile })
  expect(calls[0].systemInstruction).toContain("CREATOR STYLE")
  expect(calls[0].systemInstruction).toContain("never copy their content")
 })

 it("does not penalise style when no profile exists", async () => {
  const { runner, calls } = makeRunner([goodPlan])
  const result = await generateAsset({
   request, strategy: communityPostStrategy, evidence, runner, styleProfile: null,
  })
  expect(calls).toHaveLength(1)
  expect(result.record.status).toBe("delivered")
  expect(calls[0].systemInstruction).not.toContain("CREATOR STYLE")
 })

 it("records a runner failure without throwing at the caller", async () => {
  const runner = (async () => { throw new Error("provider exploded") }) as AssetModelRunner
  const result = await generateAsset({
   request, strategy: communityPostStrategy, evidence, runner, styleProfile: null,
  })
  expect(result.record.status).toBe("failed")
  expect(result.trace.status).toBe("failed")
  expect(result.trace.failureReason).toContain("provider exploded")
 })

 it("keeps the first draft when a repair trades one blocker for another", async () => {
  const wrongCount: CommunityPostPlan = { posts: [post(1)], notes: [] }
  const alsoBad: CommunityPostPlan = {
   posts: [post(1, { kind: "poll", pollOptions: ["only one"] })],
   notes: [],
  }
  const { runner } = makeRunner([wrongCount, alsoBad])
  const result = await generateAsset({
   request, strategy: communityPostStrategy, evidence, runner, styleProfile: null,
  })
  expect(result.record.status).toBe("needs_review")
  expect(result.record.repairAttempts).toBe(1)
 })

 it("lists assets by channel and type", async () => {
  const { runner } = makeRunner([goodPlan])
  await generateAsset({ request, strategy: communityPostStrategy, evidence, runner, styleProfile: null })
  expect(listGeneratedAssets({ channelId: "channel-1" })).toHaveLength(1)
  expect(listGeneratedAssets({ channelId: "channel-1", assetType: "community_post" })).toHaveLength(1)
  expect(listGeneratedAssets({ channelId: "other" })).toHaveLength(0)
 })

 it("carries projectId through so an asset can be tied to a project", async () => {
  const { runner } = makeRunner([goodPlan])
  const result = await generateAsset({
   request: { ...request, projectId: "project-9" },
   strategy: communityPostStrategy,
   evidence,
   runner,
   styleProfile: null,
  })
  expect(result.record.projectId).toBe("project-9")
 })
})

describe("communityPostStrategy rubric", () => {
 const rubric = (plan: CommunityPostPlan, overrides: Partial<AssetRequest> = {}) =>
  communityPostStrategy.rubric?.(plan, { ...request, ...overrides }) || []

 it("passes a well-formed plan", () => {
  expect(rubric(goodPlan)).toEqual([])
 })

 it("blocks the wrong number of posts", () => {
  const findings = rubric({ posts: [post(1)], notes: [] })
  expect(findings.some((finding) => finding.rule === "post_count" && finding.severity === "blocking")).toBe(true)
 })

 it("blocks a poll without real options", () => {
  const findings = rubric({
   posts: [post(1), post(2, { kind: "poll", pollOptions: ["only one"] }), post(3)],
   notes: [],
  })
  expect(findings.some((finding) => finding.rule === "poll_options")).toBe(true)
 })

 it("blocks a window of one repeated kind", () => {
  const findings = rubric(
   { posts: [post(1), post(2), post(3), post(4)], notes: [] },
   { inputs: { days: 4 } },
  )
  expect(findings.some((finding) => finding.rule === "kind_variety")).toBe(true)
 })

 it("blocks duplicate posts", () => {
  const findings = rubric({
   posts: [post(1), post(2, { body: post(1).body, kind: "question" }), post(3)],
   notes: [],
  })
  expect(findings.some((finding) => finding.rule === "duplicate_body")).toBe(true)
 })

 it("warns rather than blocks on poll options attached to a text post", () => {
  const findings = rubric({
   posts: [post(1, { pollOptions: ["a", "b"] }), goodPlan.posts[1], goodPlan.posts[2]],
   notes: [],
  })
  const finding = findings.find((entry) => entry.rule === "poll_options")
  expect(finding?.severity).toBe("warning")
 })

 it("blocks an unknown post kind", () => {
  const findings = rubric({
   posts: [post(1, { kind: "sonnet" as never }), goodPlan.posts[1], goodPlan.posts[2]],
   notes: [],
  })
  expect(findings.some((finding) => finding.rule === "post_kind")).toBe(true)
 })

 it("defaults to a seven day window when none is given", () => {
  const findings = communityPostStrategy.rubric?.(goodPlan, {
   ...request,
   inputs: undefined,
  }) || []
  expect(findings.some((finding) => finding.detail.includes("7 posts"))).toBe(true)
 })
})

describe("communityPostStrategy shape", () => {
 it("grades post copy only, not internal rationale", () => {
  const text = communityPostStrategy.toGradeableText(goodPlan)
  expect(text).toContain("Stripped another box")
  // Intents are internal and would dilute the style measurement.
  expect(text).not.toContain("Keep the teardown series visible")
 })

 it("declares the evidence it needs", () => {
  expect(communityPostStrategy.evidenceClasses).toContain("top_videos")
  expect(communityPostStrategy.evidenceClasses).toContain("upcoming_publishing_schedule")
 })

 it("asks for structured output rather than markdown", () => {
  expect(communityPostStrategy.schema).toMatchObject({ type: "OBJECT" })
  expect(vi.isMockFunction(communityPostStrategy.toGradeableText)).toBe(false)
 })
})
