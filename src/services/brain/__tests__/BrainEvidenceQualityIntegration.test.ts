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

 it("builds one canonical evidence snapshot for statistics, quality and audience reasoning", () => {
  const orchestrator = read("src/services/brain/BrainOrchestrator.ts")
  expect(orchestrator).toContain("buildBrainEvidenceIntelligence")
  expect(orchestrator).toContain("evidenceQuality")
  expect(orchestrator).toContain("canonicalEvidence")
  expect(orchestrator).toContain("buildBrainAudienceIntelligence(canonicalEvidence)")
 })
})
