import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8")

describe("Algorithm Intelligence Brain integration", () => {
 it("registers algorithm specialists as governed Brain capabilities", () => {
  const source = read("src/services/brain/BrainCapabilityRegistry.ts")
  expect(source).toContain('id: "channel-intelligence"')
  expect(source).toContain('id: "opportunity-intelligence"')
  expect(source).toContain('id: "algorithm-priming"')
  expect(source).toContain('"signal-anomaly-intelligence"')
 })

 it("feeds algorithm intelligence through the shared context broker", () => {
  const source = read("src/services/brain/BrainContextBroker.ts")
  expect(source).toContain("algorithmIntelligence?: string")
  expect(source).toContain("ALGORITHM INTELLIGENCE & MOMENTUM")
  expect(source).toContain("algorithm_intelligence_analytics_disabled")
  expect(source).toContain("recommendation or priming step as already executed")
 })

 it("builds algorithm evidence additively without making specialist failure fatal", () => {
  const source = read("src/services/brain/BrainOrchestrator.ts")
  expect(source).toContain("readAlgorithmIntelligenceForBrain")
  expect(source).toContain("buildAlgorithmIntelligenceContext")
  expect(source).toContain("Algorithm intelligence is additive evidence")
  expect(source).toContain("algorithmIntelligence,")
 })
})
