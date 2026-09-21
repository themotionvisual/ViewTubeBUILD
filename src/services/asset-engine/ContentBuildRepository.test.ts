import { beforeEach, describe, expect, it } from "vitest"
import {
 addContentBuildAssetRelation,
 attachAssetToContentBuild,
 addContentBuildVariant,
 bindYouTubeVideo,
 createContentBuild,
 createContentBuildAssetVersion,
 createContentBuildVariantGroup,
 deriveLegacyContentBuildId,
 getContentBuild,
 listContentBuildEvents,
 resetContentBuildRepositoryForTests,
 setContentBuildSelection,
 selectContentBuildVariant,
} from "./ContentBuildRepository"

describe("ContentBuild repository", () => {
 beforeEach(() => {
  resetContentBuildRepositoryForTests()
 })

 it("creates one durable build projection with a creation event", () => {
  const build = createContentBuild({
   id: "cb-001",
   channelId: "channel-a",
   legacyProjectId: "project-a",
   profile: {
    subject: "Austerlitz",
    niche: "Napoleonic history",
    intention: "Eyewitness-driven historical narrative",
   },
  })

  expect(build).toMatchObject({
   id: "cb-001",
   revision: 1,
   channelId: "channel-a",
   legacyProjectId: "project-a",
   stage: "idea",
  })
  expect(listContentBuildEvents(build.id).map(event => event.eventType)).toEqual(["build.created"])
 })

 it("keeps assets, selections and lineage on the same ContentBuild", () => {
  createContentBuild({ id: "cb-002" })
  attachAssetToContentBuild("cb-002", "script-v6", { toolId: "script-architect" })
  attachAssetToContentBuild("cb-002", "thumbnail-v3", { toolId: "thumbnail-studio" })

  addContentBuildAssetRelation({
   contentBuildId: "cb-002",
   fromAssetId: "script-v6",
   toAssetId: "thumbnail-v3",
   relation: "generated-from",
   sourceToolId: "thumbnail-studio",
  })
  setContentBuildSelection("cb-002", "script", "script-v6", { final: true, toolId: "script-architect" })
  setContentBuildSelection("cb-002", "thumbnail", "thumbnail-v3", { final: true, toolId: "thumbnail-studio" })

  const build = getContentBuild("cb-002")
  expect(build?.assetIds).toEqual(expect.arrayContaining(["script-v6", "thumbnail-v3"]))
  expect(build?.selections).toMatchObject({ script: "script-v6", thumbnail: "thumbnail-v3" })
  expect(build?.relations).toContainEqual(expect.objectContaining({
   fromAssetId: "script-v6",
   toAssetId: "thumbnail-v3",
   relation: "generated-from",
  }))
  expect(listContentBuildEvents("cb-002").map(event => event.eventType)).toEqual(expect.arrayContaining([
   "asset.attached",
   "asset.relation.created",
   "asset.finalized",
  ]))
 })

 it("binds the same build to a published YouTube identity", () => {
  createContentBuild({ id: "cb-003", channelId: "channel-a" })
  const next = bindYouTubeVideo({
   contentBuildId: "cb-003",
   channelId: "channel-a",
   videoId: "yt-123",
   status: "published",
   publishedAt: "2026-09-20T22:00:00.000Z",
  })

  expect(next.youtube).toMatchObject({
   videoId: "yt-123",
   canonicalUrl: "https://www.youtube.com/watch?v=yt-123",
   status: "published",
  })
  const events = listContentBuildEvents("cb-003")
  expect(events[events.length - 1]?.eventType).toBe("youtube.bound")
 })

 it("derives stable compatibility ids from legacy project/video scope", () => {
  expect(deriveLegacyContentBuildId({ projectId: "project 12" })).toBe("cb:project:project%2012")
  expect(deriveLegacyContentBuildId({ videoId: "abc123" })).toBe("cb:video:abc123")
  expect(deriveLegacyContentBuildId({})).toBeNull()
 })

 it("tracks versions and variant-group selection without replacing asset identity", () => {
  const build = createContentBuild({ id: "cb-variants" })
  const v1 = createContentBuildAssetVersion({
   contentBuildId: build.id,
   assetId: "thumb-a",
   slot: "thumbnail",
   label: "A",
   sourceToolId: "thumbnail-studio",
  })
  const v2 = createContentBuildAssetVersion({
   contentBuildId: build.id,
   assetId: "thumb-b",
   slot: "thumbnail",
   label: "B",
   parentVersionId: v1.id,
   parentAssetId: "thumb-a",
   sourceToolId: "thumbnail-studio",
  })
  const group = createContentBuildVariantGroup({
   contentBuildId: build.id,
   slot: "thumbnail",
   label: "Thumbnail candidates",
   sourceToolId: "thumbnail-studio",
  })
  addContentBuildVariant({
   contentBuildId: build.id,
   groupId: group.id,
   assetId: "thumb-a",
   versionId: v1.id,
   sourceToolId: "thumbnail-studio",
  })
  addContentBuildVariant({
   contentBuildId: build.id,
   groupId: group.id,
   assetId: "thumb-b",
   versionId: v2.id,
   sourceToolId: "thumbnail-studio",
  })
  selectContentBuildVariant({
   contentBuildId: build.id,
   groupId: group.id,
   assetId: "thumb-b",
   final: true,
   sourceToolId: "thumbnail-studio",
  })

  const snapshot = getContentBuild(build.id)!
  expect(snapshot.versions.map(version => version.version)).toEqual([1, 2])
  expect(snapshot.variantGroups[0].members).toHaveLength(2)
  expect(snapshot.variantGroups[0].finalAssetId).toBe("thumb-b")
  expect(snapshot.selections.thumbnail).toBe("thumb-b")
  expect(listContentBuildEvents(build.id).map(event => event.eventType)).toEqual(
   expect.arrayContaining(["asset.versioned", "asset.variant.created", "asset.finalized"]),
  )
 })

})
