import { describe, expect, it } from "vitest"
import { recommendAlgorithmAction, type AlgorithmSignal } from "../AlgorithmStrategyEngine"

const baseSignal = (overrides: Partial<AlgorithmSignal> = {}): AlgorithmSignal => ({
 id: "signal-1",
 kind: "traffic_expansion",
 channelId: "channel-1",
 videoId: "video-1",
 entity: "Browse Features",
 metric: "views",
 currentValue: 12000,
 baselineValue: 4000,
 relativeDelta: 2,
 impactScore: 92,
 confidence: 90,
 evidenceIds: ["dataset:traffic_day:snapshot-1"],
 context: {
  ctrDirection: "down",
  retentionDirection: "flat",
  watchQuality: "stable",
  audienceTemperature: "cold",
 },
 ...overrides,
})

describe("AlgorithmStrategyEngine", () => {
 it("holds a healthy distribution expansion instead of prematurely repackaging", () => {
  const recommendation = recommendAlgorithmAction({ signal: baseSignal() })
  expect(recommendation.command).toBe("HOLD")
  expect(recommendation.targetToolId).toBeNull()
  expect(recommendation.rationale).toContain("expanding")
 })

 it("routes a search breakout into follow-up ideation", () => {
  const recommendation = recommendAlgorithmAction({
   signal: baseSignal({
    kind: "search_breakout",
    entity: "imperial guard waterloo",
    impactScore: 88,
    confidence: 91,
   }),
  })
  expect(recommendation.command).toBe("CREATE_FOLLOWUP")
  expect(recommendation.targetToolId).toBe("creator-canvas-os")
 })

 it("repackages when click performance weakens but post-click quality remains strong", () => {
  const recommendation = recommendAlgorithmAction({
   signal: baseSignal({
    kind: "packaging_decline",
    entity: "Home package",
    context: {
     ctrDirection: "down",
     retentionDirection: "up",
     watchQuality: "strong",
     audienceTemperature: "warm",
    },
   }),
  })
  expect(recommendation.command).toBe("REPACKAGE")
  expect(recommendation.targetToolId).toBe("packaging-lab-pro")
 })

 it("retargets a cold audience shift when watch quality weakens", () => {
  const recommendation = recommendAlgorithmAction({
   signal: baseSignal({
    kind: "audience_mix_shift",
    entity: "UNSUBSCRIBED",
    context: {
     ctrDirection: "flat",
     retentionDirection: "down",
     watchQuality: "weak",
     audienceTemperature: "cold",
    },
   }),
  })
  expect(recommendation.command).toBe("RETARGET")
  expect(recommendation.targetToolId).toBe("packaging-lab-pro")
 })
})
