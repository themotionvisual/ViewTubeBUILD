import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const read = (relativePath: string) =>
 fs.readFileSync(path.resolve(process.cwd(), relativePath), "utf8")

describe("Brain evidence ownership", () => {
 it("keeps VT-SYNC snapshot access behind analytics-canon", () => {
  const statisticsBridge = read("src/services/brain/BrainStatisticsBridge.ts")
  const audienceBridge = read("src/services/brain/BrainAudienceBridge.ts")
  const analyticsBarrel = read("src/services/analytics-canon/index.ts")

  expect(statisticsBridge).not.toContain("features/vt-sync-local")
  expect(audienceBridge).not.toContain("features/vt-sync-local")
  expect(analyticsBarrel).toContain("getCurrentCanonicalIntelligenceEvidence")
 })

 it("does not add a second analytics persistence owner", () => {
  const evidenceQuality = read("src/services/brain/BrainEvidenceQuality.ts")
  expect(evidenceQuality).not.toContain("localStorage")
  expect(evidenceQuality).not.toContain("indexedDB")
 })
})
