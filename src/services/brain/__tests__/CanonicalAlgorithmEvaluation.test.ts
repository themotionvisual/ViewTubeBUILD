import { describe, expect, it } from "vitest"
import {
 CANONICAL_ALGORITHM_METRIC_RULES,
 resolveAlgorithmMetricFromCanonicalCatalog,
} from "../CanonicalAlgorithmEvaluation"

const rule = (metric: string) => {
 const found = CANONICAL_ALGORITHM_METRIC_RULES.find((candidate) => candidate.metric === metric)
 if (!found) throw new Error(`Missing test rule: ${metric}`)
 return found
}

describe("CanonicalAlgorithmEvaluation", () => {
 it("prefers a matching video row over a channel summary", () => {
  const result = resolveAlgorithmMetricFromCanonicalCatalog({
   snapshotId: "snapshot-current",
   videoId: "video-2",
   rule: rule("qualified_views"),
   catalog: [{
    id: "videos",
    status: "available",
    sampleRows: [
     { videoId: "video-1", engagedViews: 100 },
     { videoId: "video-2", engagedViews: 250 },
    ],
    metrics: {
     engagedViews: { count: 2, sum: 350, average: 175, minimum: 100, maximum: 250 },
    },
   }] as any,
  })
  expect(result?.value).toBe(250)
  expect(result?.evidenceId).toContain("videos:2:engagedViews")
 })

 it("uses canonical summary aggregation when no video row is requested", () => {
  const result = resolveAlgorithmMetricFromCanonicalCatalog({
   snapshotId: "snapshot-current",
   rule: rule("qualified_views"),
   catalog: [{
    id: "videos",
    status: "available",
    sampleRows: [],
    metrics: {
     engagedViews: { count: 2, sum: 350, average: 175, minimum: 100, maximum: 250 },
    },
   }] as any,
  })
  expect(result?.value).toBe(350)
  expect(result?.evidenceId).toBe("snapshot-current:videos:summary:engagedViews")
 })

 it("uses averages for quality-style metrics", () => {
  const result = resolveAlgorithmMetricFromCanonicalCatalog({
   snapshotId: "snapshot-current",
   rule: rule("watch_quality"),
   catalog: [{
    id: "videos",
    status: "available",
    sampleRows: [],
    metrics: {
     averagePercentageViewed: { count: 4, sum: 240, average: 60, minimum: 45, maximum: 75 },
    },
   }] as any,
  })
  expect(result?.value).toBe(60)
 })

 it("does not treat failed or unavailable datasets as evaluation evidence", () => {
  const result = resolveAlgorithmMetricFromCanonicalCatalog({
   snapshotId: "snapshot-current",
   rule: rule("qualified_views"),
   catalog: [{
    id: "videos",
    status: "failed",
    sampleRows: [{ videoId: "video-1", engagedViews: 999 }],
    metrics: {
     engagedViews: { count: 1, sum: 999, average: 999, minimum: 999, maximum: 999 },
    },
   }] as any,
  })
  expect(result).toBeNull()
 })

 it("keeps workflow-completion concepts out of the analytics metric registry", () => {
  expect(CANONICAL_ALGORITHM_METRIC_RULES.some((candidate) => candidate.metric === "diagnosis_complete")).toBe(false)
 })
})
