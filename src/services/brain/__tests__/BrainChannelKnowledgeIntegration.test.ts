import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const read = (relativePath: string) =>
 fs.readFileSync(path.resolve(process.cwd(), relativePath), "utf8")

describe("Brain Channel Knowledge integration", () => {
 it("keeps persistence access behind the unified Creator Context facade rather than BrainContextBroker", () => {
  const broker = read("src/services/brain/BrainContextBroker.ts")
  const resolver = read("src/services/brain/CreatorContextResolver.ts")
  expect(broker).toContain("channelKnowledge")
  expect(broker).toContain("CHANNEL KNOWLEDGE")
  expect(broker).not.toContain("./Persistence")
  expect(broker).not.toContain("listActiveBrainMemoryClaims")
  expect(resolver).toContain("loadBrainChannelProfile")
  expect(resolver).toContain("buildChannelKnowledgeContextFromProfile")
 })

 it("resolves task-specific Channel Knowledge once per Brain turn through CreatorContextResolver", () => {
  const orchestrator = read("src/services/brain/BrainOrchestrator.ts")
  expect(orchestrator).toContain("resolveCreatorContext")
  expect(orchestrator).toContain("creatorContext.channelKnowledge")
  expect(orchestrator.match(/creatorContext\.channelKnowledge/g)?.length || 0).toBeGreaterThanOrEqual(2)
  expect(orchestrator).not.toContain("loadRelevantChannelKnowledge")
 })

 it("preserves contradiction and provenance labels in prompt context", () => {
  const broker = read("src/services/brain/BrainContextBroker.ts")
  expect(broker).toContain("evidence=")
  expect(broker).toContain("Contradiction:")
 })
})
