import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const read = (relativePath: string) =>
 fs.readFileSync(path.resolve(process.cwd(), relativePath), "utf8")

describe("Brain Context Resolver integration", () => {
 it("keeps task context policy out of BrainContextBroker", () => {
  const resolver = read("src/services/brain/BrainContextResolver.ts")
  const broker = read("src/services/brain/BrainContextBroker.ts")
  expect(resolver).toContain("resolveBrainContextPlan")
  expect(broker).not.toContain("selectBrainCapabilities")
  expect(broker).not.toContain("loadRelevantChannelKnowledge")
 })

 it("drives orchestration requirements and context budget from one plan", () => {
  const orchestrator = read("src/services/brain/BrainOrchestrator.ts")
  expect(orchestrator).toContain("resolveBrainContextPlan")
  expect(orchestrator).toContain("contextPlan.requires.statistics")
  expect(orchestrator).toContain("contextPlan.requires.channelKnowledge")
  expect(orchestrator).toContain("maximumCharacters: contextPlan.budget.maximumCharacters")
 })
})
