import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const read = (relativePath: string) =>
 fs.readFileSync(path.resolve(process.cwd(), relativePath), "utf8")

describe("Brain evidence ownership", () => {
 it("keeps VT-SYNC snapshot access behind analytics-canon and the unified evidence facade", () => {
  const resolver = read("src/services/brain/EvidenceIntelligenceResolver.ts")
  const orchestrator = read("src/services/brain/BrainOrchestrator.ts")
  const analyticsBarrel = read("src/services/analytics-canon/index.ts")

  expect(resolver).not.toContain("features/vt-sync-local")
  expect(orchestrator).not.toContain("features/vt-sync-local")
  expect(analyticsBarrel).toContain("getCurrentCanonicalIntelligenceEvidence")
 })

 it("does not add a second analytics persistence owner", () => {
  const evidenceQuality = read("src/services/brain/BrainEvidenceQuality.ts")
  const resolver = read("src/services/brain/EvidenceIntelligenceResolver.ts")
  expect(evidenceQuality).not.toContain("localStorage")
  expect(evidenceQuality).not.toContain("indexedDB")
  expect(resolver).not.toContain("localStorage")
  expect(resolver).not.toContain("indexedDB")
 })

 it("keeps legacy Brain evidence bridges out of runtime orchestration", () => {
  const orchestrator = read("src/services/brain/BrainOrchestrator.ts")
  expect(orchestrator).not.toContain("./BrainStatisticsBridge")
  expect(orchestrator).not.toContain("./BrainAudienceBridge")
  expect(orchestrator).not.toContain("./OpportunityEvidenceAdapter")
 })
})
