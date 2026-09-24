import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const read = (relativePath: string) =>
 fs.readFileSync(path.resolve(process.cwd(), relativePath), "utf8")

describe("Brain Channel Knowledge integration", () => {
 it("keeps persistence access in ChannelProfileAdapter rather than BrainContextBroker", () => {
  const broker = read("src/services/brain/BrainContextBroker.ts")
  expect(broker).toContain("channelKnowledge")
  expect(broker).toContain("CHANNEL KNOWLEDGE")
  expect(broker).not.toContain("./Persistence")
  expect(broker).not.toContain("listActiveBrainMemoryClaims")
 })

 it("loads task-specific Channel Knowledge once per Brain turn and passes it to both context builds", () => {
  const orchestrator = read("src/services/brain/BrainOrchestrator.ts")
  expect(orchestrator).toContain("loadRelevantChannelKnowledge")
  expect(orchestrator).toContain("channelKnowledge")
  expect(orchestrator.match(/channelKnowledge,/g)?.length || 0).toBeGreaterThanOrEqual(2)
 })

 it("preserves contradiction and provenance labels in prompt context", () => {
  const broker = read("src/services/brain/BrainContextBroker.ts")
  expect(broker).toContain("evidence=")
  expect(broker).toContain("Contradiction:")
 })
})
