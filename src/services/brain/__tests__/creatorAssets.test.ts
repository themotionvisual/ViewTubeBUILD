// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import { generateAsset, type AssetModelRunner, type AssetRequest } from "../AssetGenerator"
import { buildChannelAssetEvidence } from "../creatorAssets"
import {
 communitySinglePostStrategy,
 type CommunitySinglePost,
} from "../assetStrategies/communityPost"

const context = {
 channelId: "channel-1",
 channelName: "Restoration Works",
 subscriberCount: 48_200,
 recentVideoTitles: ["Rebuilding a 1954 Fordson", "Barn find teardown"],
}

const request = (inputs: Record<string, unknown> = {}): AssetRequest => ({
 channelId: "channel-1",
 assetType: "community_post",
 instruction: "Write a post about the gearbox rebuild.",
 inputs,
})

const runnerFor = (outputs: CommunitySinglePost[]): AssetModelRunner => {
 let index = 0
 return (async () => {
  const output = outputs[Math.min(index, outputs.length - 1)]
  index += 1
  return { output }
 }) as AssetModelRunner
}

beforeEach(() => {
 localStorage.clear()
})

describe("buildChannelAssetEvidence", () => {
 it("summarises what the caller supplied", () => {
  const evidence = buildChannelAssetEvidence(context, ["channel_profile", "top_videos"])
  expect(evidence.summary).toContain("Restoration Works")
  expect(evidence.summary).toContain("48,200")
  expect(evidence.summary).toContain("Rebuilding a 1954 Fordson")
  expect(evidence.missing).toEqual([])
 })

 it("reports requested classes it could not supply", () => {
  const evidence = buildChannelAssetEvidence(
   { channelId: "channel-1" },
   ["channel_profile", "top_videos", "recent_community_engagement"],
  )
  expect(evidence.missing).toEqual([
   "channel_profile",
   "top_videos",
   "recent_community_engagement",
  ])
 })

 it("puts only genuine channel facts in the grounding payload", () => {
  const evidence = buildChannelAssetEvidence(context, ["channel_profile"])
  const payload = evidence.payload as { channel: Record<string, unknown> }
  expect(payload.channel.subscribers).toBe(48_200)
  expect(payload.channel.label).toBe("Restoration Works")
 })

 it("omits absent facts rather than defaulting them to zero", () => {
  const evidence = buildChannelAssetEvidence({ channelId: "channel-1" }, ["channel_profile"])
  const payload = evidence.payload as { channel: Record<string, unknown> }
  // A zero subscriber count would be a claim the evidence cannot support.
  expect(payload.channel).not.toHaveProperty("subscribers")
  expect(payload.channel).not.toHaveProperty("label")
 })

 it("caps recent titles so evidence cannot crowd out the budget", () => {
  const evidence = buildChannelAssetEvidence(
   { channelId: "c", recentVideoTitles: Array.from({ length: 40 }, (_, i) => `Video ${i}`) },
   ["top_videos"],
  )
  expect((evidence.payload as { recentVideoTitles: string[] }).recentVideoTitles).toHaveLength(8)
 })
})

describe("communitySinglePostStrategy", () => {
 const rubric = (output: CommunitySinglePost, inputs: Record<string, unknown> = {}) =>
  communitySinglePostStrategy.rubric?.(output, request(inputs)) || []

 it("grades only the post body", () => {
  expect(
   communitySinglePostStrategy.toGradeableText({ body: "Splines were worn.", intent: "series" }),
  ).toBe("Splines were worn.")
 })

 it("tells a poll to bring real options and a text post not to", () => {
  expect(communitySinglePostStrategy.buildTaskInstruction(request({ postType: "poll" }), {
   requested: [], refs: [], missing: [], payload: {}, summary: "",
  })).toContain("two to four poll options")
  expect(communitySinglePostStrategy.buildTaskInstruction(request({ postType: "text" }), {
   requested: [], refs: [], missing: [], payload: {}, summary: "",
  })).toContain("Do not include poll options")
 })

 it("blocks an empty body", () => {
  expect(rubric({ body: "  ", intent: "x" }).some((f) => f.rule === "post_body")).toBe(true)
 })

 it("blocks a poll with too few options", () => {
  const findings = rubric({ body: "Which next?", intent: "x", pollOptions: ["only one"] }, { postType: "poll" })
  expect(findings.some((f) => f.rule === "poll_options" && f.severity === "blocking")).toBe(true)
 })

 it("blocks a conversational lead-in instead of the post itself", () => {
  for (const body of ["Here's a great post for you!", "Sure! Here is the post.", "Certainly, try this."]) {
   expect(rubric({ body, intent: "x" }).some((f) => f.rule === "no_preamble")).toBe(true)
  }
 })

 it("accepts a clean post", () => {
  expect(rubric({ body: "Stripped the loom. Found the short.", intent: "series continuity" })).toEqual([])
 })
})

describe("single post through the governed path", () => {
 it("repairs a preamble and delivers the post copy", async () => {
  const result = await generateAsset<CommunitySinglePost>({
   request: request({ postType: "text" }),
   strategy: communitySinglePostStrategy,
   evidence: buildChannelAssetEvidence(context, communitySinglePostStrategy.evidenceClasses),
   runner: runnerFor([
    { body: "Here's a post for you: the gearbox is done.", intent: "update" },
    { body: "Gearbox is back together. Splines were the problem.", intent: "update" },
   ]),
   styleProfile: null,
  })
  expect(result.record.repairAttempts).toBe(1)
  expect(result.record.status).toBe("delivered")
  expect(result.record.output?.body).not.toMatch(/^Here's/)
 })

 it("blocks a subscriber count the evidence does not support", async () => {
  const result = await generateAsset<CommunitySinglePost>({
   request: request({ postType: "text" }),
   strategy: communitySinglePostStrategy,
   evidence: buildChannelAssetEvidence(context, communitySinglePostStrategy.evidenceClasses),
   runner: runnerFor([{ body: "We just hit 60,000 subscribers!", intent: "milestone" }]),
   styleProfile: null,
  })
  expect(result.record.fabricatedNumbers).toContain("60,000")
  expect(result.record.status).toBe("needs_review")
 })

 it("accepts the real subscriber count", async () => {
  const result = await generateAsset<CommunitySinglePost>({
   request: request({ postType: "text" }),
   strategy: communitySinglePostStrategy,
   evidence: buildChannelAssetEvidence(context, communitySinglePostStrategy.evidenceClasses),
   runner: runnerFor([{ body: "48,200 of you now. Thanks.", intent: "milestone" }]),
   styleProfile: null,
  })
  expect(result.record.fabricatedNumbers).toEqual([])
  expect(result.record.status).toBe("delivered")
 })
})
