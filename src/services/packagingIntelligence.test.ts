import { describe, expect, it } from "vitest"
import {
  derivePackagingIntelligence,
  rankPackagingIntelligenceCandidates,
  summarizeVideoPackage,
  type PackagingIntelligenceVideoInput,
} from "./packagingIntelligence"
import { getViewTubeToolCapability } from "./viewTubeToolChains"
import type { ViewTubeVideoPackage } from "./video-package/contracts"

const baseVideo: PackagingIntelligenceVideoInput = {
  videoId: "video-a",
  title: "A strong video with weak packaging",
  impressions: 120000,
  ctr: 2.8,
  avp: 57,
  views: 18000,
  watchTimeHours: 4200,
}

const packageFixture: ViewTubeVideoPackage = {
  schemaVersion: 1,
  id: "package-a",
  contentBuildId: "cb-a",
  version: 3,
  channelId: "channel-a",
  projectId: "project-a",
  videoId: "video-a",
  identity: {
    workingTitle: "A strong video with weak packaging",
    format: "long",
    status: "measuring",
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-27T00:00:00.000Z",
  },
  strategy: {
    evidence: [
      { id: "evidence-1", source: "analytics-canon", createdAt: "2026-09-27T00:00:00.000Z" },
    ],
    opportunityIds: [],
  },
  creative: { hooks: [], scenes: [] },
  packaging: {
    titleVariants: [
      { id: "title-a", kind: "title", version: 1, label: "Title A", sourceToolId: "packaging-lab-pro", createdAt: "2026-09-20T00:00:00.000Z" },
      { id: "title-b", kind: "title", version: 2, label: "Title B", sourceToolId: "packaging-lab-pro", createdAt: "2026-09-21T00:00:00.000Z" },
    ],
    thumbnailVariants: [
      { id: "thumb-a", kind: "thumbnail", version: 1, label: "Thumb A", sourceToolId: "thumbnail-studio", createdAt: "2026-09-20T00:00:00.000Z" },
    ],
    selectedTitleId: "title-b",
    selectedThumbnailId: "thumb-a",
    description: { id: "description-a", kind: "description", version: 1, label: "Description", sourceToolId: "video-manager", createdAt: "2026-09-20T00:00:00.000Z" },
    tags: { id: "tags-a", kind: "tags", version: 1, label: "Tags", sourceToolId: "video-manager", createdAt: "2026-09-20T00:00:00.000Z" },
    communityAssets: [],
  },
  production: { vaultAssetIds: [], renderIds: [] },
  publishing: {
    checks: [],
    approval: { status: "approved" },
    publishedVideoId: "video-a",
  },
  workflow: {
    blockers: [{ id: "b1", label: "Review title variant", severity: "warning", resolved: false, createdAt: "2026-09-27T00:00:00.000Z" }],
    handoffs: [],
  },
  provenance: [
    { id: "p1", action: "experiment batch created", sourceToolId: "packaging-lab-pro", artifactIds: ["title-a", "title-b"], evidenceIds: ["evidence-1"], createdAt: "2026-09-21T00:00:00.000Z" },
  ],
}

describe("Packaging Intelligence", () => {
  it("identifies weak click response with strong watch quality as a repackage opportunity", () => {
    const result = derivePackagingIntelligence(baseVideo, summarizeVideoPackage(packageFixture))
    expect(result.diagnosis).toBe("repackage")
    expect(result.recommendedTarget).toBe("packaging-lab-pro")
    expect(result.opportunityScore).toBeGreaterThan(70)
    expect(result.rationale.toLowerCase()).toContain("click")
  })

  it("does not blame packaging when click response is strong but post-click quality is weak", () => {
    const result = derivePackagingIntelligence({
      ...baseVideo,
      ctr: 8.2,
      avp: 24,
    }, summarizeVideoPackage(packageFixture))
    expect(result.diagnosis).toBe("content-friction")
    expect(result.recommendedTarget).toBe("content-analysis")
  })

  it("summarizes canonical package variants, selections, metadata, evidence, and blockers", () => {
    const summary = summarizeVideoPackage(packageFixture)
    expect(summary.titleVariants).toBe(2)
    expect(summary.thumbnailVariants).toBe(1)
    expect(summary.selectedTitleLabel).toBe("Title B")
    expect(summary.selectedThumbnailLabel).toBe("Thumb A")
    expect(summary.hasDescription).toBe(true)
    expect(summary.hasTags).toBe(true)
    expect(summary.evidenceIds).toContain("evidence-1")
    expect(summary.openBlockers).toBe(1)
    expect(summary.experimentEvents).toBe(1)
  })

  it("ranks the clearest evidence-backed repackage candidate before healthy packaging", () => {
    const ranked = rankPackagingIntelligenceCandidates([
      baseVideo,
      { ...baseVideo, videoId: "healthy", title: "Healthy", ctr: 6.4, avp: 52 },
    ])
    expect(ranked[0].videoId).toBe("video-a")
    expect(ranked[0].diagnosis).toBe("repackage")
  })

  it("exposes Packaging Lab Pro as a canonical handoff destination", () => {
    expect(getViewTubeToolCapability("packaging-lab-pro")).toMatchObject({
      id: "packaging-lab-pro",
      kind: "super-tool",
      route: "/packaging-lab-pro",
    })
  })
})
