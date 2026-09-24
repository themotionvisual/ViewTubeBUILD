import { describe, expect, it } from "vitest"

import { readBrainRuntimeSnapshot } from "./BrainRuntimeSnapshot"

const build = {
 schemaVersion: 1 as const,
 id: "cb:project:project-2",
 revision: 7,
 channelId: "channel-1",
 legacyProjectId: "project-2",
 legacyProjectName: "Austerlitz package",
 profile: {},
 stage: "package" as const,
 assetIds: ["asset-script", "asset-title-1", "asset-title-2"],
 selections: { script: "asset-script", title: "asset-title-1" },
 relations: [{ id: "relation-1" }],
 versions: [
  { id: "version-1", assetId: "asset-title-1", slot: "title", version: 1 },
  { id: "version-2", assetId: "asset-title-2", slot: "title", version: 2 },
 ],
 variantGroups: [
  {
   id: "variant-group-1",
   slot: "title",
   label: "Publisher title candidates",
   members: [{ assetId: "asset-title-1" }, { assetId: "asset-title-2" }],
  },
 ],
 workflow: { completedStepIds: ["concept"], blockerIds: [] },
 youtube: { videoId: "yt-1", canonicalUrl: "https://youtu.be/yt-1", status: "scheduled" as const },
 createdAt: "2026-09-24T04:00:00.000Z",
 updatedAt: "2026-09-24T05:00:00.000Z",
} as any

const generationRequest = {
 schemaVersion: 1,
 id: "generation_request_1",
 contentBuildId: build.id,
 projectId: "project-2",
 channelId: "channel-1",
 toolId: "video-publisher",
 operation: "generate-package",
 targetSlot: "title",
 mode: "new-option",
 sourceAssetIds: ["asset-script"],
 evidenceIds: ["evidence-1", "evidence-2"],
 contextManifestId: "context-1",
 contextRevision: 7,
 creatorIntent: "Generate publishing metadata.",
 constraints: {},
 outputSpec: {},
 parentAssetId: null,
 variantGroupId: null,
 traceId: "trace-1",
 requestedAt: "2026-09-24T05:01:00.000Z",
}

const contextManifest = {
 schemaVersion: 1,
 id: "context-1",
 contentBuildId: build.id,
 contentBuildRevision: 7,
 projectId: "project-2",
 channelId: "channel-1",
 toolId: "video-publisher",
 requestedSlots: ["script", "title", "thumbnail", "description", "tags"],
 selectedAssetIds: ["asset-script"],
 sourceAssetIds: ["asset-script"],
 evidenceIds: ["evidence-1", "evidence-2"],
 createdAt: "2026-09-24T05:01:00.000Z",
}

const toolReceipt = {
 schemaVersion: 1,
 id: "tool_receipt_1",
 requestId: generationRequest.id,
 contentBuildId: build.id,
 projectId: "project-2",
 toolId: "video-publisher",
 inputAssetIds: ["asset-script"],
 outputAssetIds: ["asset-title-1", "asset-title-2"],
 evidenceIds: ["evidence-1", "evidence-2"],
 generationRecordId: "generation-record-1",
 versionIds: ["version-1", "version-2"],
 variantGroupId: "variant-group-1",
 relationshipIds: ["relation-1"],
 traceId: "trace-1",
 completedAt: "2026-09-24T05:01:02.000Z",
}

describe("readBrainRuntimeSnapshot", () => {
 it("summarizes the active Project, ContentBuild, generation lineage, trace, and outcomes", () => {
  const snapshot = readBrainRuntimeSnapshot(
   {
    channelId: "channel-1",
    activeProjectId: "project-2",
    projects: [
     { id: "project-1", name: "Older project", status: "active" },
     { id: "project-2", name: "Austerlitz package", status: "active" },
    ],
   },
   {
    listContentBuilds: () => [build],
    listContentBuildEvents: () => [
     {
      id: "event-input",
      contentBuildId: build.id,
      timestamp: "2026-09-24T05:01:00.000Z",
      eventType: "tool.input.received",
      actorType: "tool",
      inputAssetIds: ["asset-script"],
      outputAssetIds: [],
      evidenceIds: ["evidence-1", "evidence-2"],
      metadata: { generationRequest, contextManifest },
     },
     {
      id: "event-output",
      contentBuildId: build.id,
      timestamp: "2026-09-24T05:01:02.000Z",
      eventType: "tool.output.recorded",
      actorType: "tool",
      inputAssetIds: [],
      outputAssetIds: ["asset-title-1", "asset-title-2"],
      evidenceIds: ["evidence-1", "evidence-2"],
      metadata: { toolReceipt },
     },
     {
      id: "event-publish",
      contentBuildId: build.id,
      timestamp: "2026-09-24T05:02:00.000Z",
      eventType: "publish.transaction.completed",
      actorType: "youtube",
      inputAssetIds: [],
      outputAssetIds: [],
      evidenceIds: [],
     },
    ] as any,
    listBrainTraces: () => [
     {
      id: "trace-1",
      channelId: "channel-1",
      kind: "asset",
      assetType: "title",
      createdAt: "2026-09-24T05:01:00.000Z",
      completedAt: "2026-09-24T05:01:02.000Z",
      latencyMs: 2000,
      status: "complete",
      intent: "content_generation",
      capabilitiesInvoked: ["content-generation"],
      evidence: { requested: ["channel_profile"], returned: ["evidence-1"], missing: [] },
      context: { tokensEstimated: 640, sectionsIncluded: ["evidence", "task"], sectionsDropped: [] },
      claims: { fabricated: [], unverifiedDerived: [] },
      promptVersions: { constitution: "asset-constitution-v1", title: "title-v1" },
      model: { capability: "text", requested: "gemini-2.5-pro", served: "gemini-2.5-pro", substituted: false, reason: "honoured" },
      grades: { grounding: 100, styleFidelity: 94 },
      repairAttempts: 0,
      outputRef: "generation-record-1",
     },
    ],
    summarizeBrainOutcomes: () => ({
     total: 8,
     accepted: 6,
     negative: 2,
     acceptanceRate: 75,
     completed: 4,
     corrected: 1,
     rejected: 1,
     abandoned: 0,
    }),
    capabilityCount: 14,
   },
  )

  expect(snapshot.project).toMatchObject({ id: "project-2", name: "Austerlitz package" })
  expect(snapshot.build).toMatchObject({
   id: build.id,
   stage: "package",
   revision: 7,
   assetCount: 3,
   versionCount: 2,
   variantGroupCount: 1,
   selectedSlotCount: 2,
   eventCount: 3,
   youtubeStatus: "scheduled",
  })
  expect(snapshot.generation.requestCount).toBe(1)
  expect(snapshot.generation.receiptCount).toBe(1)
  expect(snapshot.generation.latestRequest).toMatchObject({
   id: "generation_request_1",
   toolId: "video-publisher",
   targetSlot: "title",
   mode: "new-option",
   contextManifestId: "context-1",
   contextRevision: 7,
   requestedSlotCount: 5,
   selectedAssetCount: 1,
   evidenceCount: 2,
  })
  expect(snapshot.generation.latestReceipt).toMatchObject({
   id: "tool_receipt_1",
   requestId: "generation_request_1",
   outputAssetCount: 2,
   versionCount: 2,
   variantGroupId: "variant-group-1",
  })
  expect(snapshot.brain).toMatchObject({
   capabilityCount: 14,
   traceCount: 1,
   latestTrace: {
    id: "trace-1",
    status: "complete",
    capabilityCount: 1,
    evidenceReturned: 1,
    evidenceMissing: 0,
    latencyMs: 2000,
    modelServed: "gemini-2.5-pro",
    gradeAverage: 97,
   },
  })
  expect(snapshot.outcomes).toMatchObject({ total: 8, acceptanceRate: 75 })
  expect(snapshot.lifecycle).toMatchObject({
   latestEventType: "publish.transaction.completed",
   publishEventCount: 1,
  })
 })

 it("falls back to the latest build for the channel when no active Project is selected", () => {
  const snapshot = readBrainRuntimeSnapshot(
   {
    channelId: "channel-1",
    activeProjectId: null,
    projects: [],
   },
   {
    listContentBuilds: () => [
     { ...build, id: "cb-newer", legacyProjectId: null, updatedAt: "2026-09-24T06:00:00.000Z" },
     { ...build, id: "cb-other-channel", channelId: "channel-2", updatedAt: "2026-09-24T07:00:00.000Z" },
    ],
    listContentBuildEvents: () => [],
    listBrainTraces: () => [],
    summarizeBrainOutcomes: () => ({
     total: 0,
     accepted: 0,
     negative: 0,
     acceptanceRate: 0,
     completed: 0,
     corrected: 0,
     rejected: 0,
     abandoned: 0,
    }),
    capabilityCount: 14,
   },
  )

  expect(snapshot.project).toBeNull()
  expect(snapshot.build?.id).toBe("cb-newer")
  expect(snapshot.generation.requestCount).toBe(0)
  expect(snapshot.generation.receiptCount).toBe(0)
  expect(snapshot.brain.capabilityCount).toBe(14)
 })
})
