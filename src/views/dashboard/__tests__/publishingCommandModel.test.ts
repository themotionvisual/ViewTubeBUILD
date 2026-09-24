import { describe, expect, it } from "vitest"
import { buildPublishingCommandModel } from "../widgets/publishingCommandModel"

describe("Publishing Command model", () => {
  it("maps a ready publishing package and running transaction into launch stages", () => {
    const model = buildPublishingCommandModel({
      projection: {
        ready: true,
        missing: [],
        scheduledAt: "2026-10-01T16:00:00Z",
        publishedVideoId: null,
        checks: [],
        blockers: [],
        titleAssetId: "title",
        thumbnailAssetId: "thumb",
        finalRenderAssetId: "render",
        descriptionAssetId: "description",
      } as any,
      transaction: {
        status: "running",
        steps: {
          "validate-package": { status: "completed" },
          "creator-approval": { status: "completed" },
          "upload-video": { status: "completed" },
          "bind-youtube": { status: "completed" },
          "apply-metadata": { status: "running" },
        },
      } as any,
    })

    expect(model.source).toBe("canonical")
    expect(model.stages.map((stage) => [stage.id, stage.status])).toEqual([
      ["PACKAGE", "complete"],
      ["CHECK", "complete"],
      ["SCHEDULE", "complete"],
      ["READY", "complete"],
      ["LIVE", "active"],
    ])
  })

  it("keeps blockers visible before readiness", () => {
    const model = buildPublishingCommandModel({
      projection: {
        ready: false,
        missing: ["thumbnail", "approval"],
        scheduledAt: null,
        publishedVideoId: null,
        checks: [],
        blockers: [{ severity: "blocking", resolved: false }],
        titleAssetId: "title",
        thumbnailAssetId: null,
        finalRenderAssetId: "render",
        descriptionAssetId: "description",
      } as any,
      transaction: null,
    })

    expect(model.blockers).toEqual(["thumbnail", "approval"])
    expect(model.stages.find((stage) => stage.id === "READY")?.status).toBe("blocked")
  })
})
