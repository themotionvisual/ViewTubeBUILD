import { describe, expect, it } from "vitest"
import { buildAlgorithmLifecycleCohort, type AlgorithmLifecycleObservation } from "../AlgorithmLifecycleCohorts"

const row = (overrides: Partial<AlgorithmLifecycleObservation>): AlgorithmLifecycleObservation => ({
 videoId: "peer",
 channelId: "channel-1",
 metric: "qualified_views",
 value: 100,
 lifecycleHour: 24,
 observedAt: 1000,
 format: "Long-Format",
 durationSeconds: 600,
 ...overrides,
})

describe("AlgorithmLifecycleCohorts", () => {
 it("uses comparable lifecycle peers and prefers the median baseline", () => {
  const result = buildAlgorithmLifecycleCohort([
   row({ videoId: "a", value: 90, lifecycleHour: 23 }),
   row({ videoId: "b", value: 100, lifecycleHour: 24 }),
   row({ videoId: "c", value: 300, lifecycleHour: 25 }),
   row({ videoId: "wrong-format", format: "Shorts", value: 1000 }),
  ], {
   channelId: "channel-1",
   videoId: "target",
   metric: "qualified_views",
   lifecycleHour: 24,
   format: "Long-Format",
   durationSeconds: 620,
  })
  expect(result.status).toBe("available")
  expect(result.sampleSize).toBe(3)
  expect(result.baselineValue).toBe(100)
 })

 it("refuses to substitute mismatched lifecycle observations when peers are insufficient", () => {
  const result = buildAlgorithmLifecycleCohort([
   row({ videoId: "a", lifecycleHour: 240, value: 10000 }),
   row({ videoId: "b", lifecycleHour: 24, value: 100 }),
  ], {
   channelId: "channel-1",
   videoId: "target",
   metric: "qualified_views",
   lifecycleHour: 24,
   minimumPeers: 3,
  })
  expect(result.status).toBe("insufficient_peers")
  expect(result.baselineValue).toBeNull()
 })
})
