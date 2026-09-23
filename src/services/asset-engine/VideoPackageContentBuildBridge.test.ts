import { beforeEach, describe, expect, it } from "vitest"
import {
 createContentBuild,
 listContentBuildEvents,
 resetContentBuildRepositoryForTests,
 selectContentBuildVariant,
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
     approvedAt: "2026-09-20T18:12:00.000Z",
    }],
    thumbnailVariants: [{
     id: "thumb-ref-v3",
     kind: "thumbnail" as const,
     version: 3,
     label: "Thumbnail V3",
     sourceToolId: "thumbnail-studio",
     vaultAssetId: "vault-thumb-v3",
     createdAt: "2026-09-20T18:11:00.000Z",
     approvedAt: "2026-09-20T18:13:00.000Z",
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
  const titleGroup = build.variantGroups.find(group => group.slot === "title")
  const thumbnailGroup = build.variantGroups.find(group => group.slot === "thumbnail")
  expect(titleGroup?.selectedAssetId).toBe("vault-title-v4")
  expect(titleGroup?.finalAssetId).toBeNull()
  expect(titleGroup?.members.find(member => member.assetId === "vault-title-v4")?.status).toBe("selected")
  expect(thumbnailGroup?.selectedAssetId).toBe("vault-thumb-v3")
  expect(thumbnailGroup?.finalAssetId).toBeNull()
  expect(thumbnailGroup?.members.find(member => member.assetId === "vault-thumb-v3")?.status).toBe("selected")
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

  const repeated = syncVideoPackageToContentBuild(videoPackage)
  expect(repeated.variantGroups.filter(group => group.slot === "title")).toHaveLength(1)
  expect(repeated.variantGroups.filter(group => group.slot === "thumbnail")).toHaveLength(1)
  expect(repeated.versions.filter(version => version.slot === "title")).toHaveLength(2)
  expect(repeated.versions.filter(version => version.slot === "thumbnail")).toHaveLength(1)
  expect(repeated.variantGroups.find(group => group.slot === "title")?.selectedAssetId).toBe("vault-title-b")
  expect(repeated.variantGroups.find(group => group.slot === "title")?.finalAssetId).toBeNull()
  expect(repeated.variantGroups.find(group => group.slot === "thumbnail")?.selectedAssetId).toBe("vault-thumb-a")
  expect(repeated.variantGroups.find(group => group.slot === "thumbnail")?.finalAssetId).toBeNull()
  const selectedEvents = listContentBuildEvents(repeated.id).filter(event => event.eventType === "asset.selected")
  expect(selectedEvents.filter(event => event.entityId === "title")).toHaveLength(1)
  expect(selectedEvents.filter(event => event.entityId === "thumbnail")).toHaveLength(1)

  const projected = projectContentBuildSelectionsToVideoPackage(videoPackage)
  expect(projected.packaging.titleVariants).toHaveLength(2)
  expect(projected.packaging.selectedTitleId).toBe("title-b")
 })


 it("keeps approval metadata separate from finalization until an explicit command", () => {
  const base = createVideoPackage({
   id: "package-approved-option",
   contentBuildId: "cb-approved-option",
   channelId: "channel-a",
   projectId: "project-a",
   workingTitle: "Approved option test",
   format: "long",
  })
  const approvedAt = "2026-09-22T21:00:00.000Z"
  const videoPackage = {
   ...base,
   packaging: {
    ...base.packaging,
    titleVariants: [{
     id: "title-approved",
     kind: "title" as const,
     version: 1,
     label: "Approved",
     sourceToolId: "packaging-lab-pro",
     vaultAssetId: "vault-title-approved",
     createdAt: base.identity.createdAt,
     approvedAt,
    }],
    selectedTitleId: "title-approved",
   },
  }

  const build = syncVideoPackageToContentBuild(videoPackage, { mode: "strict" })
  const group = build.variantGroups.find(candidate => candidate.slot === "title")
  expect(group?.selectedAssetId).toBe("vault-title-approved")
  expect(group?.finalAssetId).toBeNull()
  expect(group?.members.find(member => member.assetId === "vault-title-approved")?.status).toBe("selected")

  const finalized = selectContentBuildVariant({
   contentBuildId: build.id,
   groupId: group!.id,
   assetId: "vault-title-approved",
   sourceToolId: "packaging-lab-pro",
   actorType: "creator",
   final: true,
  })
  expect(finalized.finalAssetId).toBe("vault-title-approved")
  expect(finalized.members.find(member => member.assetId === "vault-title-approved")?.status).toBe("final")
 })

 it("rejects strict synchronization when a package has no canonical ContentBuild identity", () => {
  const base = createVideoPackage({
   id: "package-missing-build",
   contentBuildId: "cb-temporary",
   channelId: "channel-a",
   projectId: "project-a",
   workingTitle: "Missing build",
   format: "long",
  })
  const legacyShape = { ...base, contentBuildId: undefined }

  expect(() => syncVideoPackageToContentBuild(legacyShape, { mode: "strict" }))
   .toThrow("canonical contentBuildId")
 })

})
