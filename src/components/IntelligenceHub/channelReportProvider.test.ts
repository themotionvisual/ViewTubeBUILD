import { describe, expect, it } from "vitest"
import type { ChannelReportEvidencePackV2 } from "../../services/analytics-canon"
import { LAYERED_REPORT_SECTION_IDS, sanitizeInvalidLayeredReport, validateLayeredChannelReport } from "./channelReportProvider"
import type { LayeredChannelReportModelOutputV2 } from "./types"

const evidence = {
 version: "channel-report-evidence-v2",
 channelId: "channel-a",
 snapshotId: "snapshot-a",
 selectedWindow: "28d",
 bundleFingerprint: "bundle-a",
 privacyFingerprint: "privacy-a",
 datasets: [],
 facts: [{ id: "views", label: "Views", statement: "The channel has 100 views.", value: 100, unit: "views", classification: "fact", evidenceIds: ["agg:views"], confidence: 1 }],
 sectionFactIds: {},
 evidenceIndex: { "agg:views": { id: "agg:views", datasetId: "videos", datasetVersion: "v1", kind: "aggregate", label: "Views", value: 100, sourceEvidenceIds: [], sources: ["youtube_analytics_v2"], window: "28d", capturedAt: "2026-08-24T12:00:00.000Z" } },
 contradictions: [],
 missingInputs: [],
} as ChannelReportEvidencePackV2

const report = (): LayeredChannelReportModelOutputV2 => ({
 executiveSummary: "The channel has 100 views.",
 executiveLayer: { health: "mixed", strongestSignal: "The channel has 100 views.", criticalGap: "Retention is unavailable.", nextActions: ["Review the cited evidence."] },
 sections: LAYERED_REPORT_SECTION_IDS.map((id) => ({
  id,
  title: id,
  summary: id === "executive-summary" ? "The channel has 100 views." : "Not enough evidence for this section.",
  bullets: [],
  actions: [],
  claims: id === "executive-summary" ? [{ id: "claim-views", statement: "The channel has 100 views.", classification: "fact", evidenceIds: ["agg:views"], confidence: 1 }] : [],
 })),
})

describe("layered channel report validation", () => {
 it("accepts a complete report whose factual number resolves to evidence", () => {
  expect(validateLayeredChannelReport(report(), evidence)).toMatchObject({ valid: true, errors: [] })
 })

 it("rejects and removes invented numeric claims", () => {
  const invalid = report()
  invalid.sections[0].claims.push({ id: "invented", statement: "Views will grow 42% next week.", classification: "hypothesis", evidenceIds: [], confidence: 0.5 })
  const validation = validateLayeredChannelReport(invalid, evidence)
  expect(validation.valid).toBe(false)
  expect(validation.unsupportedNumbers).toContain("42%")
  expect(sanitizeInvalidLayeredReport(invalid, validation).sections[0].claims.map((claim) => claim.id)).not.toContain("invented")
 })

 it("rejects factual claims with cross-bundle evidence IDs", () => {
  const invalid = report()
  invalid.sections[0].claims[0].evidenceIds = ["agg:other-channel"]
  const validation = validateLayeredChannelReport(invalid, evidence)
  expect(validation.invalidClaimIds).toContain("claim-views")
 })
})
