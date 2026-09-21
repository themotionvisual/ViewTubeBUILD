import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const capabilitySource = readFileSync(new URL("../BrainCapabilityRegistry.ts", import.meta.url), "utf8")
const contextSource = readFileSync(new URL("../BrainContextBroker.ts", import.meta.url), "utf8")
const orchestratorSource = readFileSync(new URL("../BrainOrchestrator.ts", import.meta.url), "utf8")
const bridgeSource = readFileSync(new URL("../BrainAlgorithmIntelligenceContext.ts", import.meta.url), "utf8")

describe("Algorithm Intelligence recovery contract", () => {
 it("registers the recovered channel/opportunity/priming capabilities", () => {
  expect(capabilitySource).toContain('{ id: "channel-intelligence"')
  expect(capabilitySource).toContain('{ id: "opportunity-intelligence"')
  expect(capabilitySource).toContain('{ id: "algorithm-priming"')
  expect(capabilitySource).toContain('readBrainUserControls(input.channelId)')
 })

 it("keeps algorithm evidence distinct inside the context broker", () => {
  expect(contextSource).toContain("algorithmIntelligence?: string")
  expect(contextSource).toContain("ALGORITHM INTELLIGENCE & MOMENTUM")
  expect(contextSource).toContain("algorithm_intelligence_analytics_disabled")
  expect(contextSource).toContain("algorithm_intelligence_clipped")
  expect(contextSource).toContain("recommendation or priming step as already executed")
 })

 it("keeps both capability selection and context construction channel scoped", () => {
  expect(orchestratorSource).toContain("selectBrainCapabilities({ userText: input.userText, snapshot: input.snapshot, channelId: input.channelId })")
  expect(orchestratorSource.match(/channelId: input\.channelId/g)?.length || 0).toBeGreaterThanOrEqual(3)
 })

 it("restores a dedicated Brain-facing algorithm context bridge without executing actions", () => {
  expect(bridgeSource).toContain("buildBrainAlgorithmIntelligence")
  expect(bridgeSource).toContain("buildAlgorithmIntelligencePortfolio")
  expect(bridgeSource).toContain("buildAlgorithmIntelligenceContext")
  expect(bridgeSource).not.toContain("createAlgorithmRecommendationHandoff")
  expect(bridgeSource).not.toContain("createPrimingStepHandoff")
 })
})
