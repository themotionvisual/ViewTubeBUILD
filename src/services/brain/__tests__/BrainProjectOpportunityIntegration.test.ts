import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const read = (relativePath: string) => fs.readFileSync(path.resolve(process.cwd(), relativePath), "utf8")

describe("Brain Project + Opportunity integration seam", () => {
 it("routes bounded project context through CreatorContextResolver and canonical opportunity evidence through Algorithm Intelligence", () => {
  const orchestrator = read("src/services/brain/BrainOrchestrator.ts")
  expect(orchestrator).toContain("resolveCreatorContext")
  expect(orchestrator).toContain("creatorContext.project")
  expect(orchestrator).toContain("buildOpportunityEvidenceFromBrainPack")
  expect(orchestrator).toContain("opportunities:")
  expect(orchestrator).toContain("includeAnomalies:")
  expect(orchestrator).not.toContain("buildAlgorithmProjectContext")
 })

 it("keeps ContentBuild identity in the shared project context contract", () => {
  const portfolio = read("src/services/brain/AlgorithmIntelligenceOrchestrator.ts")
  expect(portfolio).toContain("contentBuildId?: string | null")
 })
})
