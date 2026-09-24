import { describe, expect, it } from "vitest"

import {
 createContentBuild,
 listContentBuildEvents,
} from "./ContentBuildRepository"
import {
 prepareGenerationRequest,
 recordToolReceipt,
} from "./GenerationWorkflow"

describe("GenerationWorkflow", () => {
 it("prepares a generation request from one existing ContentBuild identity", () => {
  const build = createContentBuild({
   id: "cb-generation-workflow-1",
   channelId: "channel-1",
   legacyProjectId: "project-1",
   legacyProjectName: "Austerlitz",
  })

  const prepared = prepareGenerationRequest({
   contentBuildId: build.id,
   channelId: "channel-1",
   projectId: "project-1",
   toolId: "video-publisher",
   operation: "generate-package",
   targetSlot: "title",
   mode: "new-option",
   creatorIntent: "Generate packaging options for the active video.",
   requestedSlots: ["script", "title", "thumbnail", "description", "tags"],
   evidenceIds: ["evidence:channel-profile:1"],
  })

  expect(prepared.request.contentBuildId).toBe(build.id)
  expect(prepared.request.projectId).toBe("project-1")
  expect(prepared.request.channelId).toBe("channel-1")
  expect(prepared.request.contextManifestId).toBe(prepared.contextManifest.id)
  expect(prepared.request.contextRevision).toBe(build.revision)
  expect(prepared.contextManifest.contentBuildRevision).toBe(build.revision)
  expect(prepared.contextManifest.requestedSlots).toEqual([
   "script",
   "title",
   "thumbnail",
   "description",
   "tags",
  ])
  expect(prepared.contextManifest.evidenceIds).toEqual(["evidence:channel-profile:1"])

  const inputEvent = listContentBuildEvents(build.id)
   .find((event) => event.eventType === "tool.input.received")

  expect(inputEvent?.toolId).toBe("video-publisher")
  expect(inputEvent?.metadata).toMatchObject({
   requestId: prepared.request.id,
   contextManifestId: prepared.contextManifest.id,
   targetSlot: "title",
   mode: "new-option",
  })
 })

 it("rejects a request that conflicts with the ContentBuild project or channel scope", () => {
  const build = createContentBuild({
   id: "cb-generation-workflow-scope",
   channelId: "channel-canonical",
   legacyProjectId: "project-canonical",
  })

  expect(() => prepareGenerationRequest({
   contentBuildId: build.id,
   channelId: "channel-other",
   projectId: "project-canonical",
   toolId: "video-publisher",
   operation: "generate-package",
   targetSlot: "title",
   mode: "create",
   creatorIntent: "Generate a title.",
  })).toThrow(/channel scope mismatch/i)

  expect(() => prepareGenerationRequest({
   contentBuildId: build.id,
   channelId: "channel-canonical",
   projectId: "project-other",
   toolId: "video-publisher",
   operation: "generate-package",
   targetSlot: "title",
   mode: "create",
   creatorIntent: "Generate a title.",
  })).toThrow(/project scope mismatch/i)
 })

 it("records a ToolReceipt in the existing ContentBuild event history", () => {
  const build = createContentBuild({
   id: "cb-generation-workflow-receipt",
   channelId: "channel-2",
   legacyProjectId: "project-2",
  })

  const prepared = prepareGenerationRequest({
   contentBuildId: build.id,
   channelId: "channel-2",
   projectId: "project-2",
   toolId: "video-publisher",
   operation: "generate-package",
   targetSlot: "title",
   mode: "new-option",
   creatorIntent: "Generate six title options.",
   sourceAssetIds: ["asset-script-1"],
   evidenceIds: ["evidence:packaging:1"],
  })

  const receipt = recordToolReceipt({
   request: prepared.request,
   outputAssetIds: ["asset-title-1", "asset-title-2"],
   generationRecordId: "generation-1",
   versionIds: ["version-1", "version-2"],
   variantGroupId: "variant-group-1",
   relationshipIds: ["relation-1"],
   traceId: "trace-1",
   summary: "Created two title candidates.",
  })

  expect(receipt.requestId).toBe(prepared.request.id)
  expect(receipt.contentBuildId).toBe(build.id)
  expect(receipt.projectId).toBe("project-2")
  expect(receipt.toolId).toBe("video-publisher")
  expect(receipt.inputAssetIds).toEqual(["asset-script-1"])
  expect(receipt.outputAssetIds).toEqual(["asset-title-1", "asset-title-2"])
  expect(receipt.versionIds).toEqual(["version-1", "version-2"])
  expect(receipt.variantGroupId).toBe("variant-group-1")
  expect(receipt.traceId).toBe("trace-1")

  const outputEvent = listContentBuildEvents(build.id)
   .find((event) => event.eventType === "tool.output.recorded")

  expect(outputEvent?.generationRecordId).toBe("generation-1")
  expect(outputEvent?.traceId).toBe("trace-1")
  expect(outputEvent?.outputAssetIds).toEqual(["asset-title-1", "asset-title-2"])
  expect(outputEvent?.metadata).toMatchObject({
   requestId: prepared.request.id,
   contextManifestId: prepared.request.contextManifestId,
   versionIds: ["version-1", "version-2"],
   variantGroupId: "variant-group-1",
   relationshipIds: ["relation-1"],
  })
 })
})
