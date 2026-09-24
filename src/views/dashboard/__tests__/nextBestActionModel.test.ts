import { describe, expect, it } from "vitest"
import { buildNextBestActionModel } from "../widgets/nextBestActionModel"

describe("Next Best Action model", () => {
  it("prefers governed Algorithm Intelligence recommendations when available", () => {
    const model = buildNextBestActionModel({
      recommendations: [{
        id: "rec-1",
        channelId: "channel-1",
        signalId: "sig-1",
        signalOrigin: "anomaly",
        command: "REPACKAGE",
        title: "Repackage the current upload",
        rationale: "Packaging weakened while watch quality stayed strong.",
        confidence: "high",
        score: 88,
        evidenceIds: ["e1", "e2"],
        targetToolId: "packaging-lab-pro",
        checkpoint: "Measure after one controlled change.",
        guardrails: [],
        payload: {},
      }],
      canonicalRows: [],
      todayTasks: [],
      topPerformer: null,
    })

    expect(model.source).toBe("algorithm-intelligence")
    expect(model.actions[0]).toMatchObject({
      title: "Repackage the current upload",
      priority: "REPACKAGE",
      score: 88,
      evidenceCount: 2,
      route: "/tools/packaging-lab-pro",
    })
  })

  it("falls back to connected dashboard evidence when no governed recommendation exists", () => {
    const model = buildNextBestActionModel({
      recommendations: [],
      canonicalRows: [{
        videoId: "v1",
        title: "Latest upload",
        uploadDate: "2026-09-23",
        views: 10,
      }, {
        videoId: "v2",
        title: "Older upload",
        uploadDate: "2026-09-01",
        views: 100,
      }],
      todayTasks: [],
      topPerformer: null,
    })

    expect(model.source).toBe("dashboard-fallback")
    expect(model.actions[0].priority).toBe("HIGH PRIORITY")
    expect(model.actions[0].title).toContain("Repackage")
  })
})
