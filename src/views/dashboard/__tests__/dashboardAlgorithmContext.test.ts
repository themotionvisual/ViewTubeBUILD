import { describe, expect, it } from "vitest"
import { buildDashboardAlgorithmProjectContext, describeDashboardRecommendation } from "../widgets/dashboardAlgorithmContext"

describe("dashboard algorithm context", () => {
  it("maps the active project into bounded Algorithm Intelligence context", () => {
    const context = buildDashboardAlgorithmProjectContext({
      channelId: "channel-1",
      activeProjectId: "p2",
      projects: [
        { id: "p1", name: "Other" },
        {
          id: "p2",
          name: "Napoleon at Austerlitz",
          videoTitle: "How Napoleon Broke the Allied Center",
          targetAudience: "Napoleonic history viewers, military history fans",
          format: "long",
          publishDate: "2026-10-02",
          videoId: "video-2",
          topic: "Austerlitz",
        },
      ],
    })

    expect(context).toMatchObject({
      channelId: "channel-1",
      projectId: "p2",
      videoId: "video-2",
      title: "How Napoleon Broke the Allied Center",
      topic: "Austerlitz",
      format: "long",
      plannedPublishAt: "2026-10-02",
      targetAudience: ["Napoleonic history viewers", "military history fans"],
    })
  })

  it("returns null without an active or fallback project", () => {
    expect(buildDashboardAlgorithmProjectContext({
      channelId: "channel-1",
      activeProjectId: null,
      projects: [],
    })).toBeNull()
  })

  it("maps a governed recommendation to a reusable dashboard action", () => {
    const action = describeDashboardRecommendation({
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
    })

    expect(action).toMatchObject({
      title: "Repackage the current upload",
      command: "REPACKAGE",
      score: 88,
      confidence: "high",
      evidenceCount: 2,
      route: "/tools/packaging-lab-pro",
    })
  })
})
