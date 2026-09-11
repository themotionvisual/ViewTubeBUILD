import { describe, expect, it } from "vitest"
import type { CanonicalIntelligenceEvidenceBundle } from "../../services/analytics-canon"
import { gradeIntelligenceEvidence } from "./EvidencePreflightPanel"

const evidence = (available: number, partial = 0, stale = 0, channelId: string | null = "channel-a") => ({
 channelId,
 coverage: { total: 34, available, partial, stale, failed: 0, unavailable: 34 - available - partial - stale, represented: 34 },
}) as CanonicalIntelligenceEvidenceBundle

describe("Intelligence evidence grade", () => {
 it("blocks generation infrastructure gaps", () => {
  expect(gradeIntelligenceEvidence(null, true).grade).toBe("BLOCKED")
  expect(gradeIntelligenceEvidence(evidence(34), false).grade).toBe("BLOCKED")
  expect(gradeIntelligenceEvidence(evidence(34, 0, 0, null), true).grade).toBe("BLOCKED")
  expect(gradeIntelligenceEvidence(evidence(0), true).grade).toBe("BLOCKED")
 })

 it("weights available, partial, and stale evidence differently", () => {
  expect(gradeIntelligenceEvidence(evidence(34), true)).toMatchObject({ grade: "A", score: 100, ready: true })
  expect(gradeIntelligenceEvidence(evidence(20, 8), true).grade).toBe("B")
  expect(gradeIntelligenceEvidence(evidence(7, 7, 7), true).grade).toBe("D")
 })
})
