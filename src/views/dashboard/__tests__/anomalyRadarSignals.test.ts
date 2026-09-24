import { describe, expect, it } from "vitest"
import { describeAlgorithmAnomaly } from "../widgets/anomalyRadarSignals"

describe("Anomaly Radar canonical signal mapping", () => {
  it("maps algorithm intelligence anomalies into creator-facing signal rows", () => {
    expect(describeAlgorithmAnomaly({
      id: "a1",
      kind: "packaging_decline",
      origin: "anomaly",
      channelId: "c1",
      metric: "ctr",
      currentValue: 4.2,
      baselineValue: 6.0,
      relativeDelta: -30,
      impactScore: 82,
      confidence: 91,
      evidenceIds: ["e1"],
    })).toMatchObject({
      id: "a1",
      label: "CTR",
      direction: "down",
      delta: -30,
      severity: "SIGNIFICANT",
      impact: 82,
      confidence: 91,
    })
  })

  it("uses WATCH for lower-impact canonical anomalies", () => {
    expect(describeAlgorithmAnomaly({
      id: "a2",
      kind: "traffic_expansion",
      origin: "anomaly",
      channelId: "c1",
      metric: "views",
      currentValue: 120,
      baselineValue: 100,
      relativeDelta: 20,
      impactScore: 48,
      confidence: 70,
      evidenceIds: [],
    }).severity).toBe("WATCH")
  })
})
