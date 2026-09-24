// @vitest-environment jsdom
// The ledger captures a learning event through IndexedDB, so the full path is exercised
// rather than stubbed — that integration is the point of these tests.
import "fake-indexeddb/auto"
import { beforeEach, describe, expect, it } from "vitest"
import { generateAsset, type AssetModelRunner } from "../AssetGenerator"
import {
 communitySinglePostStrategy,
 type CommunitySinglePost,
} from "../assetStrategies/communityPost"
import {
 editRatio,
 listAssetOutcomes,
 recordAssetOutcome,
 styleDriftBetween,
 summarizeAssetOutcomes,
} from "../assetOutcomes"
import { listBrainOutcomes, summarizeBrainOutcomes } from "../BrainOutcomeLedger"

const runnerFor = (body: string): AssetModelRunner =>
 (async () => ({ output: { body, intent: "series update" } as CommunitySinglePost })) as AssetModelRunner

const makeAsset = async (body = "Gearbox is back together. Splines were the problem.") => {
 const result = await generateAsset<CommunitySinglePost>({
  request: {
   channelId: "channel-1",
   assetType: "community_post",
   instruction: "Post about the gearbox.",
   inputs: { postType: "text" },
  },
  strategy: communitySinglePostStrategy,
  runner: runnerFor(body),
  styleProfile: null,
 })
 return result.record
}

beforeEach(() => {
 localStorage.clear()
})

describe("editRatio", () => {
 it("is zero for an untouched draft", () => {
  expect(editRatio("same text", "same text")).toBe(0)
 })

 it("is small for a typo fix and large for a rewrite", () => {
  const typo = editRatio("Gearbox is back together.", "Gearbox is back togethre.")
  const rewrite = editRatio("Gearbox is back together.", "You will not BELIEVE what happened 😍")
  expect(typo).toBeLessThan(0.3)
  expect(rewrite).toBeGreaterThan(0.5)
  expect(rewrite).toBeGreaterThan(typo)
 })

 it("handles an emptied draft and stays within 0-1", () => {
  expect(editRatio("something", "")).toBe(1)
  expect(editRatio("", "")).toBe(0)
  expect(editRatio("", "new")).toBe(1)
 })
})

describe("styleDriftBetween", () => {
 it("reports nothing when the creator changed nothing stylistic", () => {
  expect(styleDriftBetween("Short. Punchy. Done.", "Short. Punchy. Done.")).toEqual([])
 })

 it("names which features the creator moved", () => {
  const drift = styleDriftBetween(
   "You are going to absolutely LOVE this incredible reveal!!! 😍🔥",
   "Gearbox is done. Splines were worn.",
  )
  expect(drift.length).toBeGreaterThan(0)
  const features = drift.map((entry) => entry.feature)
  expect(features.some((feature) =>
   ["exclamationRate", "emojiDensity", "allCapsRate", "secondPersonRate"].includes(feature),
  )).toBe(true)
 })

 it("orders by magnitude so the strongest correction leads", () => {
  const drift = styleDriftBetween(
   "You are going to absolutely LOVE this incredible reveal!!! 😍🔥",
   "Gearbox is done.",
  )
  for (let index = 1; index < drift.length; index += 1) {
   expect(drift[index - 1].magnitude).toBeGreaterThanOrEqual(drift[index].magnitude)
  }
 })
})

describe("recordAssetOutcome", () => {
 it("writes the outcome store that had no writers", async () => {
  const asset = await makeAsset()
  const outcome = await recordAssetOutcome({ assetId: asset.id, kind: "accepted" })
  expect(outcome?.assetId).toBe(asset.id)
  expect(listAssetOutcomes({ channelId: "channel-1" })).toHaveLength(1)
 })

 it("feeds BrainOutcomeLedger, which ChannelIntelligence reads", async () => {
  const asset = await makeAsset()
  // The ledger that previously always summarised to zero.
  expect(summarizeBrainOutcomes("channel-1").total).toBe(0)
  await recordAssetOutcome({ assetId: asset.id, kind: "accepted" })
  const summary = summarizeBrainOutcomes("channel-1")
  expect(summary.total).toBe(1)
  expect(summary.accepted).toBe(1)
  expect(listBrainOutcomes("channel-1")[0].sourceToolId).toBe("audience-loop-studio")
 })

 it("maps a rejection through to the ledger as negative", async () => {
  const asset = await makeAsset()
  await recordAssetOutcome({ assetId: asset.id, kind: "rejected", note: "too salesy" })
  expect(summarizeBrainOutcomes("channel-1").negative).toBe(1)
  expect(listAssetOutcomes()[0].note).toBe("too salesy")
 })

 it("captures the style signal in an edit", async () => {
  const generated = "You are going to absolutely LOVE this incredible reveal!!! 😍🔥"
  const asset = await makeAsset(generated)
  const outcome = await recordAssetOutcome({
   assetId: asset.id,
   kind: "edited",
   correctedText: "Gearbox is done. Splines were worn.",
  })
  expect(outcome?.editRatio).toBeGreaterThan(0)
  expect(outcome?.styleDrift?.length).toBeGreaterThan(0)
  // An edit is a correction, not an acceptance.
  expect(summarizeBrainOutcomes("channel-1").corrected).toBe(1)
 })

 it("does not fabricate a style signal on a non-edit outcome", async () => {
  const asset = await makeAsset()
  const outcome = await recordAssetOutcome({ assetId: asset.id, kind: "accepted" })
  expect(outcome?.styleDrift).toBeUndefined()
  expect(outcome?.editRatio).toBeUndefined()
 })

 it("ignores an unknown asset rather than throwing at the creator", async () => {
  await expect(recordAssetOutcome({ assetId: "missing", kind: "accepted" })).resolves.toBeNull()
 })

 it("links both outcome stores back to the generating trace and asset", async () => {
  const asset = await makeAsset()
  const outcome = await recordAssetOutcome({ assetId: asset.id, kind: "published" })
  expect(outcome?.traceId).toBe(asset.traceId)

  const brainOutcome = listBrainOutcomes("channel-1")[0]
  expect(brainOutcome).toMatchObject({
   traceId: asset.traceId,
   outputRef: asset.id,
  })
 })
})

describe("summarizeAssetOutcomes", () => {
 it("is empty before anything happens", () => {
  expect(summarizeAssetOutcomes()).toMatchObject({ total: 0, acceptanceRate: 0 })
 })

 it("computes an acceptance rate over decided outcomes", async () => {
  const kept = await makeAsset("Gearbox is done. Splines were worn.")
  const binned = await makeAsset("Another post. Also fine.")
  await recordAssetOutcome({ assetId: kept.id, kind: "accepted" })
  await recordAssetOutcome({ assetId: binned.id, kind: "rejected" })
  expect(summarizeAssetOutcomes({ channelId: "channel-1" }).acceptanceRate).toBe(50)
 })

 it("surfaces the features the creator keeps correcting", async () => {
  for (let index = 0; index < 3; index += 1) {
   const asset = await makeAsset("You will absolutely LOVE this incredible reveal!!! 😍🔥")
   await recordAssetOutcome({
    assetId: asset.id,
    kind: "edited",
    correctedText: "Gearbox is done. Splines were worn.",
   })
  }
  const summary = summarizeAssetOutcomes({ channelId: "channel-1" })
  expect(summary.edited).toBe(3)
  expect(summary.meanEditRatio).toBeGreaterThan(0)
  // This is the actionable output: a feature corrected every time means the profile's
  // target is wrong, not that the model keeps failing.
  expect(summary.mostCorrectedFeatures[0].count).toBe(3)
 })

 it("filters by asset type", async () => {
  const asset = await makeAsset()
  await recordAssetOutcome({ assetId: asset.id, kind: "accepted" })
  expect(summarizeAssetOutcomes({ assetType: "community_post" }).total).toBe(1)
  expect(summarizeAssetOutcomes({ assetType: "script" }).total).toBe(0)
 })
})
