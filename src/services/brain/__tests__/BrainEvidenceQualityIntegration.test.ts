import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const read = (relativePath: string) =>
 fs.readFileSync(path.resolve(process.cwd(), relativePath), "utf8")

describe("Brain evidence quality integration", () => {
 it("injects bounded evidence health into Brain context", () => {
  const broker = read("src/services/brain/BrainContextBroker.ts")
  expect(broker).toContain("evidenceQuality")
  expect(broker).toContain("EVIDENCE QUALITY")
  expect(broker).toContain("scope=")
  expect(broker).toContain("Missing dataset:")
 })

 it("builds one Evidence Intelligence envelope for statistics, quality and audience reasoning", () => {
  const orchestrator = read("src/services/brain/BrainOrchestrator.ts")
  expect(orchestrator).toContain("resolveEvidenceIntelligence")
  expect(orchestrator).toContain("evidenceIntelligence.evidenceQuality")
  expect(orchestrator).toContain("evidenceIntelligence.statisticsIntelligence")
  expect(orchestrator).toContain("evidenceIntelligence.audienceIntelligence")
  expect(orchestrator).not.toContain("buildBrainEvidenceIntelligence")
  expect(orchestrator).not.toContain("buildBrainAudienceIntelligence")
 })
})
