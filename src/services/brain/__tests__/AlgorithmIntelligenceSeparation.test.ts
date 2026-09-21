import { describe, expect, it } from "vitest"
import { buildAlgorithmPrimingPlan } from "../AlgorithmPrimingEngine"
import { getReadyPrimingSteps } from "../AlgorithmPrimingWorkflow"
import { anomalyToAlgorithmSignal, escalateAnomaliesToAlgorithmSignals } from "../AnomalySignalBridge"
import { opportunityToAlgorithmSignal } from "../OpportunityIntelligence"

const anomaly = {
 id: "anomaly-1",
 channelId: "channel-1",
 family: "search",
 anomalyType: "spike",
 datasetId: "youtube_search_terms",
 entity: "imperial guard waterloo",
 metric: "views",
 currentValue: 1200,
 baselineValue: 300,
 relativeDelta: 3,
 impactScore: 88,
 confidence: 91,
 relatedVideoIds: ["video-1"],
 evidenceIds: ["evidence-1"],
}

describe("Algorithm Intelligence separation", () => {
 it("keeps priming proactive and independent from anomaly detection", () => {
  const plan = buildAlgorithmPrimingPlan({
   video: {
    channelId: "channel-1",
    projectId: "project-1",
    videoId: "video-2",
    title: "The Last Stand of the Imperial Guard",
    plannedPublishAt: "2026-09-18T19:00:00Z",
    evidenceIds: ["project-evidence"],
   },
  })

  expect(plan.steps.some((step) => step.phase === "PRE_LAUNCH")).toBe(true)
  expect(plan.steps.some((step) => step.phase === "LAUNCH")).toBe(true)
  expect(plan.steps.some((step) => step.phase === "EARLY_POST_LAUNCH")).toBe(true)
  expect(plan.guardrails.join(" ")).toContain("not anomaly detection")
  expect(plan.evidenceIds).toContain("project-evidence")
 })

 it("keeps dependent priming steps blocked until prerequisites complete", () => {
  const plan = buildAlgorithmPrimingPlan({
   video: { channelId: "channel-1", projectId: "project-1", videoId: "video-2", title: "The Last Stand" },
  })
  const initial = getReadyPrimingSteps(plan, [])
  expect(initial.map((step) => step.id)).toContain("priming:qualify")
  expect(initial.some((step) => step.dependsOn.length > 0)).toBe(false)

  const afterQualify = getReadyPrimingSteps(plan, ["priming:qualify"])
  expect(afterQualify.some((step) => step.dependsOn.includes("priming:qualify"))).toBe(true)
 })

 it("converts an already-detected anomaly into an algorithm signal without detecting it", () => {
  const signal = anomalyToAlgorithmSignal(anomaly)

  expect(signal.origin).toBe("anomaly")
  expect(signal.kind).toBe("search_breakout")
  expect(signal.entity).toBe("imperial guard waterloo")
  expect(signal.evidenceIds).toEqual(["evidence-1"])
 })

 it("filters low-impact anomaly evidence before escalation", () => {
  const signals = escalateAnomaliesToAlgorithmSignals([
   anomaly,
   { ...anomaly, id: "weak", impactScore: 20, confidence: 91 },
  ])

  expect(signals).toHaveLength(1)
  expect(signals[0].id).toBe("anomaly:anomaly-1")
 })

 it("keeps opportunity signals distinguishable from anomaly signals", () => {
  const signal = opportunityToAlgorithmSignal({
   id: "opportunity-1",
   kind: "session_adjacency",
   channelId: "channel-1",
   videoId: "video-1",
   entity: "Austerlitz -> Waterloo",
   confidence: 86,
   impactScore: 79,
   evidenceIds: ["catalog-edge-1"],
  })

  expect(signal.origin).toBe("opportunity")
  expect(signal.kind).toBe("session_opportunity")
 })
})
