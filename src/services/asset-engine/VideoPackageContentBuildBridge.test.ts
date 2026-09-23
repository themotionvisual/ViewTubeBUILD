import { beforeEach, describe, expect, it } from "vitest"
import {
 createContentBuild,
 resetContentBuildRepositoryForTests,
 setContentBuildSelection,
} from "./ContentBuildRepository"
import {
 projectContentBuildSelectionsToVideoPackage,
 syncVideoPackageToContentBuild,
} from "./VideoPackageContentBuildBridge"
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
 it("projects canonical ContentBuild title and thumbnail selections back into package references", () => {
  const base = createVideoPackage({
   id: "package-projection",
   contentBuildId: "cb-projection",
   channelId: "channel-a",
   projectId: "project-a",
   workingTitle: "Projection test",
   format: "long",
  })
  const videoPackage = {
   ...base,
   packaging: {
    ...base.packaging,
    titleVariants: [{
     id: "title-ref-a", kind: "title" as const, version: 1, label: "A",
     sourceToolId: "packaging-lab-pro", vaultAssetId: "vault-title-a", createdAt: base.identity.createdAt,
    }],
    thumbnailVariants: [{
     id: "thumb-ref-b", kind: "thumbnail" as const, version: 1, label: "B",
     sourceToolId: "thumbnail-studio", vaultAssetId: "vault-thumb-b", createdAt: base.identity.createdAt,
    }],
   },
  }

  createContentBuild({ id: "cb-projection", channelId: "channel-a" })
  setContentBuildSelection("cb-projection", "title", "vault-title-a")
  setContentBuildSelection("cb-projection", "thumbnail", "vault-thumb-b")

  const projected = projectContentBuildSelectionsToVideoPackage(videoPackage)
  expect(projected.packaging.selectedTitleId).toBe("title-ref-a")
  expect(projected.packaging.selectedThumbnailId).toBe("thumb-ref-b")
 })

 it("turns package title and thumbnail options into canonical versions and VariantGroups", () => {
  const base = createVideoPackage({
   id: "package-options",
   contentBuildId: "cb-options",
   channelId: "channel-a",
   projectId: "project-a",
   workingTitle: "Options test",
   format: "long",
  })
  const videoPackage = {
   ...base,
   packaging: {
    ...base.packaging,
    titleVariants: [
     { id: "title-a", kind: "title" as const, version: 1, label: "Title A", sourceToolId: "packaging-lab-pro", vaultAssetId: "vault-title-a", createdAt: base.identity.createdAt },
     { id: "title-b", kind: "title" as const, version: 2, label: "Title B", sourceToolId: "packaging-lab-pro", vaultAssetId: "vault-title-b", createdAt: base.identity.createdAt },
    ],
    thumbnailVariants: [
     { id: "thumb-a", kind: "thumbnail" as const, version: 1, label: "Thumb A", sourceToolId: "thumbnail-studio", vaultAssetId: "vault-thumb-a", createdAt: base.identity.createdAt },
    ],
    selectedTitleId: "title-b",
    selectedThumbnailId: "thumb-a",
   },
  }

  const build = syncVideoPackageToContentBuild(videoPackage)
  expect(build.versions.filter(version => version.slot === "title")).toHaveLength(2)
  expect(build.versions.filter(version => version.slot === "thumbnail")).toHaveLength(1)
  expect(build.variantGroups.find(group => group.slot === "title")?.members).toHaveLength(2)
  expect(build.variantGroups.find(group => group.slot === "thumbnail")?.members).toHaveLength(1)
  expect(build.selections.title).toBe("vault-title-b")
  expect(build.selections.thumbnail).toBe("vault-thumb-a")

  const projected = projectContentBuildSelectionsToVideoPackage(videoPackage)
  expect(projected.packaging.titleVariants).toHaveLength(2)
  expect(projected.packaging.selectedTitleId).toBe("title-b")
 })


})
