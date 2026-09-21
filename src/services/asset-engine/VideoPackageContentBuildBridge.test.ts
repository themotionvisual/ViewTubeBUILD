import { beforeEach, describe, expect, it } from "vitest"
import { resetContentBuildRepositoryForTests } from "./ContentBuildRepository"
import { syncVideoPackageToContentBuild } from "./VideoPackageContentBuildBridge"
import { createVideoPackage } from "../video-package/packageValidation"

describe("VideoPackage ContentBuild bridge", () => {
 beforeEach(() => {
  resetContentBuildRepositoryForTests()
 })

 it("backfills one build identity and carries selected package assets into it", () => {
  const base = createVideoPackage({
   id: "package-a",
   channelId: "channel-a",
   projectId: "project-a",
   workingTitle: "Napoleon — The Last Charge",
   format: "long",
   now: "2026-09-20T18:00:00.000Z",
  })

  const videoPackage = {
   ...base,
   creative: {
    ...base.creative,
    script: {
     id: "script-ref-v6",
     kind: "script" as const,
     version: 6,
     label: "Script V6",
     sourceToolId: "script-architect",
     vaultAssetId: "vault-script-v6",
     createdAt: "2026-09-20T18:05:00.000Z",
     approvedAt: "2026-09-20T18:06:00.000Z",
    },
   },
   packaging: {
    ...base.packaging,
    titleVariants: [{
     id: "title-ref-v4",
     kind: "title" as const,
     version: 4,
     label: "The Last Charge of Napoleon",
     sourceToolId: "packaging-lab-pro",
     vaultAssetId: "vault-title-v4",
     createdAt: "2026-09-20T18:10:00.000Z",
    }],
    thumbnailVariants: [{
     id: "thumb-ref-v3",
     kind: "thumbnail" as const,
     version: 3,
     label: "Thumbnail V3",
     sourceToolId: "thumbnail-studio",
     vaultAssetId: "vault-thumb-v3",
     createdAt: "2026-09-20T18:11:00.000Z",
    }],
    selectedTitleId: "title-ref-v4",
    selectedThumbnailId: "thumb-ref-v3",
   },
   production: {
    ...base.production,
    renderIds: ["render-final"],
   },
   publishing: {
    ...base.publishing,
    publishedVideoId: "youtube-123",
   },
   identity: {
    ...base.identity,
    status: "published" as const,
   },
  }

  const build = syncVideoPackageToContentBuild(videoPackage)

  expect(build.id).toBe("package-a")
  expect(build.legacyProjectId).toBe("project-a")
  expect(build.assetIds).toEqual(expect.arrayContaining([
   "vault-script-v6",
   "vault-title-v4",
   "vault-thumb-v3",
   "render-final",
  ]))
  expect(build.selections).toMatchObject({
   script: "vault-script-v6",
   title: "vault-title-v4",
   thumbnail: "vault-thumb-v3",
  })
  expect(build.youtube).toMatchObject({
   videoId: "youtube-123",
   status: "published",
   initialTitleAssetId: "vault-title-v4",
   initialThumbnailAssetId: "vault-thumb-v3",
   finalRenderAssetId: "render-final",
  })
 })
})
