import "fake-indexeddb/auto"
import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("../BrainUserControls", async (importOriginal) => {
 const original = await importOriginal<typeof import("../BrainUserControls")>()
 return {
  ...original,
  readBrainUserControls: vi.fn((channelId?: string | null) => ({
   ...original.DEFAULT_BRAIN_USER_CONTROLS,
   allowAnalytics: channelId !== "restricted-channel",
   learnFromInteractions: false,
  })),
 }
})

import { selectBrainCapabilities } from "../BrainCapabilityRegistry"
import * as broker from "../BrainContextBroker"
import { runBrainTurn } from "../BrainOrchestrator"
import { buildGoldenChannelFixture, restorationRichSpec } from "../fixtures"
import { buildCreatorGrowthContext } from "../../aiBrainConversationStore"

const snapshot = () => buildGoldenChannelFixture(restorationRichSpec).snapshot

describe("Brain request channel scope", () => {
 beforeEach(() => vi.restoreAllMocks())

 it("uses the requested channel policy even when the ambient policy allows analytics", () => {
  const input = { userText: "Analyze my channel analytics", snapshot: snapshot() }
  const restricted = selectBrainCapabilities({ ...input, channelId: "restricted-channel" }).map(item => item.id)
  const allowed = selectBrainCapabilities({ ...input, channelId: "allowed-channel" }).map(item => item.id)
  expect(allowed).toContain("statistics-intelligence")
  expect(restricted).not.toContain("statistics-intelligence")
  expect(restricted).not.toContain("algorithm-intelligence")
  expect(restricted).not.toContain("signal-anomaly-intelligence")
 })

 it("preserves channel policy when rebuilding context after niche resolution", async () => {
  const build = vi.spyOn(broker, "buildBrainContextPack")
  const value = snapshot()
  await runBrainTurn({
   channelId: "restricted-channel",
   userText: "Analyze my channel analytics",
   snapshot: value,
   systemPrompt: "Help the creator.",
   growthContext: buildCreatorGrowthContext(value, [], []),
   allowModel: false,
   nicheResolver: vi.fn(async () => ({ sources: [] })) as any,
  })
  expect(build).toHaveBeenCalledTimes(2)
  for (const [input] of build.mock.calls) expect(input.channelId).toBe("restricted-channel")
  for (const result of build.mock.results) {
   expect(result.value.systemInstruction).toContain("Analytics evidence access is disabled")
   expect(result.value.systemInstruction).not.toContain("DETERMINISTIC STATISTICS INTELLIGENCE")
  }
 })
})
