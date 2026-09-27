import { describe, expect, it } from "vitest"
import { anomalyToDerivedSignal } from "../AnomalySignalBridge"
import { opportunityToDerivedSignal } from "../OpportunityIntelligence"

describe("DerivedSignal convergence", () => {
 it("normalizes anomaly evidence into the shared DerivedSignal contract before algorithm mapping", () => {
  const signal = anomalyToDerivedSignal({
   id: "anomaly-1",
   channelId: "channel-1",
   family: "traffic",
   anomalyType: "drop",
   datasetId: "traffic_sources",
   entity: "Browse",
   metric: "views",
   currentValue: 800,
   baselineValue: 1200,
   relativeDelta: -0.333,
   impactScore: 82,
   confidence: 91,
   evidenceIds: ["e1", "e1", "e2"],
  })

  expect(signal.kind).toBe("anomaly")
  expect(signal.channelId).toBe("channel-1")
  expect(signal.metric).toBe("views")
  expect(signal.evidenceIds).toEqual(["e1", "e2"])
  expect(signal.derivation).toEqual({
   method: "external-anomaly-normalization",
   version: "v1",
   deterministic: true,
  })
 })

 it("normalizes opportunity evidence into the shared DerivedSignal contract before algorithm mapping", () => {
  const signal = opportunityToDerivedSignal({
   id: "opportunity-1",
   kind: "emerging_search",
   channelId: "channel-1",
   entity: "austerlitz map",
   metric: "views",
   currentValue: 500,
   baselineValue: 200,
   relativeDelta: 1.5,
   confidence: 88,
   impactScore: 76,
   evidenceIds: ["search:e1"],
  })

  expect(signal.kind).toBe("opportunity")
  expect(signal.label).toContain("austerlitz map")
  expect(signal.evidenceIds).toEqual(["search:e1"])
  expect(signal.derivation.deterministic).toBe(true)
  expect(signal.metadata?.sourceKind).toBe("emerging_search")
 })
})
