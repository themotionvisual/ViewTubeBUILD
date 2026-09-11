import { describe, expect, it } from "vitest"
import { resolveAlgorithmMonitoringCheckpoint } from "../AlgorithmMonitoringResolver"
import type { AlgorithmIntelligenceEvent } from "../AlgorithmIntelligenceEventLedger"
import type { AlgorithmLifecycleObservation } from "../AlgorithmLifecycleCohorts"

const hour = 60 * 60 * 1000
const event: AlgorithmIntelligenceEvent = {
 id: "event-1",
 channelId: "channel-1",
 videoId: "video-1",
 kind: "RECOMMENDATION_EXECUTED",
 sourceSystem: "workflow",
 sourceId: "signal-1",
 parentEventIds: [],
 recommendationId: "recommendation-1",
 evidenceIds: [],
 confidence: "high",
 title: "Repackage",
 summary: "Test a better package.",
 evaluationTargets: [
  { metric: "ctr", direction: "increase", windowHours: 72 },
  { metric: "watch_quality", direction: "hold", windowHours: 72 },
 ],
 metadata: {},
 createdAt: 0,
}

const checkpoint = {
 id: "algorithm-monitor:event-1:24h",
 horizonHours: 24,
 dueAt: 24 * hour,
 role: "observe" as const,
 metrics: ["ctr", "watch_quality"],
 label: "T+24h",
}

const observation = (overrides: Partial<AlgorithmLifecycleObservation>): AlgorithmLifecycleObservation => ({
 channelId: "channel-1",
 videoId: "video-1",
 metric: "ctr",
 value: 0.05,
 lifecycleHour: 30,
 observedAt: 24 * hour,
 evidenceId: "snapshot:video:ctr",
 ...overrides,
})

describe("AlgorithmMonitoringResolver", () => {
 it("resolves an observation-only checkpoint when all required evidence exists near its due time", () => {
  const result = resolveAlgorithmMonitoringCheckpoint({
   event,
   checkpoint,
   record: false,
   observations: [
    observation({ metric: "ctr", value: 0.057 }),
    observation({ metric: "watch_quality", value: 0.61, evidenceId: "snapshot:video:watch" }),
   ],
  })
  expect(result.status).toBe("resolved")
  expect(result.metrics.map((metric) => metric.metric)).toEqual(["ctr", "watch_quality"])
  expect(result.event).toBeNull()
 })

 it("keeps a checkpoint partial when one declared metric is missing", () => {
  const result = resolveAlgorithmMonitoringCheckpoint({
   event,
   checkpoint,
   record: false,
   observations: [observation({ metric: "ctr" })],
  })
  expect(result.status).toBe("partial")
  expect(result.missingMetrics).toEqual(["watch_quality"])
 })

 it("does not substitute a much later observation for the 24 hour checkpoint", () => {
  const result = resolveAlgorithmMonitoringCheckpoint({
   event,
   checkpoint,
   record: false,
   observations: [
    observation({ metric: "ctr", observedAt: 60 * hour }),
    observation({ metric: "watch_quality", observedAt: 60 * hour }),
   ],
  })
  expect(result.status).toBe("missing_evidence")
  expect(result.metrics).toHaveLength(0)
 })

 it("requires a concrete video scope before lifecycle evidence can resolve the checkpoint", () => {
  const result = resolveAlgorithmMonitoringCheckpoint({
   event: { ...event, videoId: null },
   checkpoint,
   record: false,
   observations: [observation({})],
  })
  expect(result.status).toBe("not_video_scoped")
 })
})
