import { describe, expect, it } from "vitest"
import {
 createApprovedPublishSnapshot,
 verifyApprovedPublishSnapshot,
} from "./ApprovedPublishSnapshot"
import type { PublishingPackageProjection } from "./PublishingPackageProjection"

const projection = (): PublishingPackageProjection => ({
 schemaVersion: 1,
 contentBuildId: "cb-publish",
 projectId: "project-a",
 videoPackageId: "vp-a",
 revision: 7,
 titleAssetId: "title-final",
 thumbnailAssetId: "thumb-final",
 scriptAssetId: "script-v4",
 storyboardAssetId: "story-v2",
 finalRenderAssetId: "render-final",
 descriptionAssetId: "description-final",
 tagsAssetId: "tags-final",
 endScreenAssetId: "end-screen-final",
 outroAssetId: "outro-final",
 scheduledAt: "2026-09-30T18:00:00.000Z",
 publishedVideoId: null,
 approval: {
  status: "approved",
  approvedBy: "creator-1",
  approvedAt: "2026-09-24T18:00:00.000Z",
 },
 checks: [],
 blockers: [],
 ready: true,
 missing: [],
})

describe("ApprovedPublishSnapshot", () => {
 it("freezes the exact approved package identity and assets", () => {
  const snapshot = createApprovedPublishSnapshot(projection())

  expect(snapshot.contentBuildId).toBe("cb-publish")
  expect(snapshot.contentBuildRevision).toBe(7)
  expect(snapshot.videoPackageId).toBe("vp-a")
  expect(snapshot.assets).toEqual({
   titleAssetId: "title-final",
   thumbnailAssetId: "thumb-final",
   finalRenderAssetId: "render-final",
   descriptionAssetId: "description-final",
   tagsAssetId: "tags-final",
   endScreenAssetId: "end-screen-final",
   outroAssetId: "outro-final",
  })
  expect(snapshot.approval).toEqual({
   approvedBy: "creator-1",
   approvedAt: "2026-09-24T18:00:00.000Z",
  })
 })

 it("creates the same stable identity for the same approved content", () => {
  const first = createApprovedPublishSnapshot(projection())
  const second = createApprovedPublishSnapshot(projection())

  expect(second.id).toBe(first.id)
  expect(second.hash).toBe(first.hash)
 })

 it("changes identity when an approved asset or schedule changes", () => {
  const first = createApprovedPublishSnapshot(projection())
  const changedAsset = createApprovedPublishSnapshot({
   ...projection(),
   titleAssetId: "title-v2",
  })
  const changedSchedule = createApprovedPublishSnapshot({
   ...projection(),
   scheduledAt: "2026-10-01T18:00:00.000Z",
  })

  expect(changedAsset.hash).not.toBe(first.hash)
  expect(changedSchedule.hash).not.toBe(first.hash)
 })

 it("rejects packages that are not ready and creator-approved", () => {
  expect(() =>
   createApprovedPublishSnapshot({
    ...projection(),
    ready: false,
    missing: ["approval"],
    approval: { status: "ready" },
   }),
  ).toThrow(/ready and creator-approved/i)
 })

 it("detects mutation after snapshot creation", () => {
  const snapshot = createApprovedPublishSnapshot(projection())
  const tampered = {
   ...snapshot,
   assets: { ...snapshot.assets, titleAssetId: "title-tampered" },
  }

  expect(verifyApprovedPublishSnapshot(snapshot)).toBe(true)
  expect(verifyApprovedPublishSnapshot(tampered)).toBe(false)
 })
})
