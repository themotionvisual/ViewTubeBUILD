import { beforeEach, describe, expect, it } from "vitest"
import { createContentBuild, resetContentBuildRepositoryForTests, setContentBuildSelection } from "./ContentBuildRepository"
import { projectPublishingPackage } from "./PublishingPackageProjection"
import { createVideoPackage } from "../video-package/packageValidation"

describe("Publishing Package projection", () => {
 beforeEach(() => resetContentBuildRepositoryForTests())

 it("resolves canonical ContentBuild selections without creating a second publishing store", () => {
  const base = createVideoPackage({
   id: "vp-publish",
   contentBuildId: "cb-publish",
   channelId: "channel-a",
   projectId: "project-a",
   workingTitle: "Publish test",
   format: "long",
  })
  createContentBuild({ id: "cb-publish", channelId: "channel-a" })
  setContentBuildSelection("cb-publish", "title", "title-final")
  setContentBuildSelection("cb-publish", "thumbnail", "thumb-final")
  setContentBuildSelection("cb-publish", "final-render", "render-final")
  setContentBuildSelection("cb-publish", "description", "description-final")

  const videoPackage = {
   ...base,
   publishing: {
    ...base.publishing,
    approval: { status: "approved" as const, approvedBy: "creator", approvedAt: base.identity.createdAt },
    checks: [{ id: "rights", label: "Rights", required: true, passed: true, checkedAt: base.identity.createdAt }],
   },
  }

  const projection = projectPublishingPackage(videoPackage)
  expect(projection).toMatchObject({
   schemaVersion: 1,
   contentBuildId: "cb-publish",
   projectId: "project-a",
   titleAssetId: "title-final",
   thumbnailAssetId: "thumb-final",
   finalRenderAssetId: "render-final",
   descriptionAssetId: "description-final",
   ready: true,
   missing: [],
  })
 })

 it("reports publication requirements instead of inventing missing state", () => {
  const videoPackage = createVideoPackage({
   id: "vp-incomplete",
   contentBuildId: "cb-incomplete",
   channelId: "channel-a",
   projectId: "project-a",
   workingTitle: "Incomplete",
   format: "long",
  })
  createContentBuild({ id: "cb-incomplete", channelId: "channel-a" })

  const projection = projectPublishingPackage(videoPackage)
  expect(projection.ready).toBe(false)
  expect(projection.missing).toEqual(expect.arrayContaining([
   "title", "thumbnail", "final-render", "description", "approval",
  ]))
 })
})
