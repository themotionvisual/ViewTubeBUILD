import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
 beginBrainTrace,
 resetBrainTraceSink,
 setBrainTraceSink,
 type BrainTrace,
} from "../BrainTrace"

const collectSink = () => {
 const written: BrainTrace[] = []
 return {
  written,
  sink: {
   write: (trace: BrainTrace) => { written.push(trace) },
   list: () => written,
  },
 }
}

let collector = collectSink()

beforeEach(() => {
 collector = collectSink()
 setBrainTraceSink(collector.sink)
})

afterEach(() => {
 resetBrainTraceSink()
 vi.useRealTimers()
})

describe("beginBrainTrace", () => {
 it("does not write to the sink until completed", () => {
  const trace = beginBrainTrace({ kind: "asset", channelId: "channel-1" })
  trace.recordGrade("grounding", 90)
  expect(collector.written).toHaveLength(0)
  trace.complete()
  expect(collector.written).toHaveLength(1)
 })

 it("starts in a running state and completes with latency", () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date("2026-09-12T00:00:00Z"))
  const trace = beginBrainTrace({ kind: "question", channelId: "channel-1" })
  expect(trace.snapshot().status).toBe("running")
  vi.advanceTimersByTime(1_250)
  const finished = trace.complete()
  expect(finished.status).toBe("complete")
  expect(finished.latencyMs).toBe(1_250)
  expect(finished.completedAt).toBe("2026-09-12T00:00:01.250Z")
 })

 it("accumulates the full decision record of one operation", () => {
  const trace = beginBrainTrace({
   kind: "asset",
   channelId: "channel-1",
   assetType: "community_post",
  })
  trace.setIntent({ intent: "content_generation", taskProfileId: "asset-draft" })
  trace.recordCapabilities(["content-generation", "channel-profile"])
  trace.recordCapabilities(["channel-profile"]) // deduplicates
  trace.recordEvidence({
   requested: ["top_videos", "community_history"],
   returned: ["dataset:top_videos:snap-1"],
   missing: ["community_history"],
  })
  trace.recordContext({ tokensEstimated: 4_200, sectionsIncluded: ["style", "evidence"] })
  trace.recordModel({
   capability: "text",
   requested: "gemini-3.1-pro",
   served: "gemini-3.1-flash-lite",
   substituted: true,
   reason: "capability_policy_override",
  })
  trace.recordPromptVersion("constitution", "v1")
  trace.recordPromptVersion("community_post", "v3")
  trace.recordClaims({ fabricated: [], unverifiedDerived: ["34%"] })
  trace.recordStyle({ styleProfileId: "style-1", styleScore: 78 })
  trace.recordGrade("grounding", 100)
  trace.recordGrade("styleFidelity", 78)
  trace.recordRepairAttempt()

  const finished = trace.complete({ outputRef: "asset_9f2" })

  expect(finished.assetType).toBe("community_post")
  expect(finished.capabilitiesInvoked).toEqual(["content-generation", "channel-profile"])
  expect(finished.evidence.missing).toEqual(["community_history"])
  expect(finished.context.tokensEstimated).toBe(4_200)
  // The substitution is preserved, so a later quality comparison is attributable.
  expect(finished.model?.served).toBe("gemini-3.1-flash-lite")
  expect(finished.model?.substituted).toBe(true)
  expect(finished.promptVersions).toEqual({ constitution: "v1", community_post: "v3" })
  expect(finished.claims.unverifiedDerived).toEqual(["34%"])
  expect(finished.styleScore).toBe(78)
  expect(finished.grades).toEqual({ grounding: 100, styleFidelity: 78 })
  expect(finished.repairAttempts).toBe(1)
  // outputRef is what lets an outcome be joined back to this generation.
  expect(finished.outputRef).toBe("asset_9f2")
 })

 it("records a failure with its reason", () => {
  const trace = beginBrainTrace({ kind: "asset", channelId: null })
  const finished = trace.complete({ status: "failed", failureReason: "provider_error" })
  expect(finished.status).toBe("failed")
  expect(finished.failureReason).toBe("provider_error")
  expect(finished.channelId).toBeNull()
 })

 it("gives every trace a distinct id", () => {
  const ids = new Set(
   Array.from({ length: 25 }, () => beginBrainTrace({ kind: "question" }).id),
  )
  expect(ids.size).toBe(25)
 })

 it("snapshot does not expose mutable internal state", () => {
  const trace = beginBrainTrace({ kind: "question" })
  const snapshot = trace.snapshot()
  snapshot.status = "failed"
  expect(trace.snapshot().status).toBe("running")
 })
})
