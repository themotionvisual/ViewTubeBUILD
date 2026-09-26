import { beforeEach, describe, expect, it } from "vitest"
import { createContentBuild, resetContentBuildRepositoryForTests } from "./ContentBuildRepository"
import { beginPublishTransaction, completePublishStep, failPublishTransaction, resetPublishTransactionRepositoryForTests } from "./PublishTransaction"
import { getApprovedPublishSnapshot, resetApprovedPublishSnapshotRepositoryForTests } from "./ApprovedPublishSnapshot"
import type { PublishingPackageProjection } from "./PublishingPackageProjection"

const projection=():PublishingPackageProjection=>({
 schemaVersion:1,contentBuildId:"cb-publish",projectId:"project-a",videoPackageId:"vp-a",revision:7,
 titleAssetId:"title-final",thumbnailAssetId:"thumb-final",scriptAssetId:"script-v4",storyboardAssetId:"story-v2",
 finalRenderAssetId:"render-final",descriptionAssetId:"description-final",tagsAssetId:"tags-final",endScreenAssetId:null,outroAssetId:null,
 scheduledAt:null,publishedVideoId:null,approval:{status:"approved"},checks:[],blockers:[],ready:true,missing:[],
 it("starts a new transaction when a newly approved final render changes",()=>{
  const first=beginPublishTransaction(projection())
  const second=beginPublishTransaction({...projection(),revision:8,finalRenderAssetId:"render-v2"})
  expect(second.id).not.toBe(first.id)
  expect(second.approvedSnapshotId).not.toBe(first.approvedSnapshotId)
  expect(second.assetLock.finalRenderAssetId).toBe("render-v2")
 })
})
describe("PublishTransaction",()=>{
 beforeEach(()=>{resetContentBuildRepositoryForTests();resetApprovedPublishSnapshotRepositoryForTests();resetPublishTransactionRepositoryForTests();createContentBuild({id:"cb-publish",channelId:"channel-a"})})
 it("locks canonical assets and returns the same transaction for the same final render",()=>{
  const first=beginPublishTransaction(projection())
  const second=beginPublishTransaction({...projection(),revision:8,titleAssetId:"title-later"})
  expect(second.id).toBe(first.id)
  expect(second.assetLock.titleAssetId).toBe("title-final")
  expect(second.assetLock.projectionRevision).toBe(7)
  expect(second.approvedSnapshotId).toBe(first.approvedSnapshotId)
  expect(second.approvedSnapshotHash).toBe(first.approvedSnapshotHash)
  expect(getApprovedPublishSnapshot(first.approvedSnapshotId)?.assets.titleAssetId).toBe("title-final")
 })
 it("resumes a failed transaction instead of creating a duplicate upload transaction",()=>{
  const first=beginPublishTransaction(projection())
  const uploaded=completePublishStep({transactionId:first.id,step:"upload-video",youtubeVideoId:"youtube-123",receipt:{uploaded:true}})
  failPublishTransaction(first.id,"apply-metadata",new Error("network"))
  const resumed=beginPublishTransaction(projection())
  expect(resumed.id).toBe(first.id)
  expect(resumed.youtubeVideoId).toBe("youtube-123")
  expect(uploaded.youtubeVideoId).toBe("youtube-123")
 })
})
