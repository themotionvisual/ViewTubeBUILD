import "fake-indexeddb/auto"
import { afterEach, describe, expect, it } from "vitest"
import { runBrainTurn } from "../BrainOrchestrator"
import {
 resetBrainTraceSink,
 setBrainTraceSink,
 type BrainTrace,
} from "../BrainTrace"
import {
 buildGoldenChannelFixture,
 restorationRichSpec,
} from "../fixtures"

afterEach(() => {
 resetBrainTraceSink()
})

describe("Brain answer trace integration", () => {
 it("records one joinable trace for a completed Brain turn", async () => {
  const written: BrainTrace[] = []
  setBrainTraceSink({
   write: (trace) => { written.push(trace) },
   list: () => written,
  })
  const fixture = buildGoldenChannelFixture(restorationRichSpec)

  const result = await runBrainTurn({
   channelId: null,
   userText: "Give me a growth strategy.",
   snapshot: fixture.snapshot,
   growthContext: fixture.growthContext,
   systemPrompt: "Use supplied evidence.",
   allowModel: false,
  })

  expect(written).toHaveLength(1)
  const trace = written[0]
  expect(trace.kind).toBe("question")
  expect(trace.outputRef).toBe(result.response.id)
  expect(trace.taskProfileId).toBe("strategy")
  expect(trace.promptVersions).toMatchObject({
   orchestrator: "brain-orchestrator-v2",
   shared_constitution: "brain-prompt-constitution-v1",
   prompt_family: "strategy-prompt-family-v1",
  })
  expect(trace.context.tokensEstimated).toBeGreaterThan(0)
  expect(trace.grades).toHaveProperty("answerQuality")
  expect(result.turn.metadata).toMatchObject({ traceId: trace.id })
 })

 it("records numeric claim findings and repair count on the same trace", async () => {
  const written: BrainTrace[] = []
  setBrainTraceSink({
   write: (trace) => { written.push(trace) },
   list: () => written,
  })
  const fixture = buildGoldenChannelFixture(restorationRichSpec)
  let calls = 0

  await runBrainTurn({
   channelId: null,
   userText: "Give me a growth strategy.",
   snapshot: fixture.snapshot,
   growthContext: fixture.growthContext,
   systemPrompt: "Use supplied evidence.",
   allowModel: true,
   modelGenerator: async () => {
    calls += 1
    return {
     headline: "Growth claim",
     keyInsight: "This will deliver 9.9M views.",
     body: "This will deliver 9.9M views.",
     mode: "strategy_brief",
     modules: [],
     actions: ["Publish it."],
    }
   },
  })

  expect(calls).toBe(2)
  expect(written).toHaveLength(1)
  expect(written[0].repairAttempts).toBe(1)
  expect(written[0].claims.fabricated).toContain("9.9M")
  expect(written[0].status).toBe("fallback")
 })
})
