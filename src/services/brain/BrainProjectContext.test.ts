import { describe, expect, it } from "vitest"
import { buildAlgorithmProjectContext } from "./BrainProjectContext"

describe("BrainProjectContext", () => {
 it("preserves Project and ContentBuild identity in the bounded algorithm context", () => {
  expect(buildAlgorithmProjectContext({
   channelId: "channel-a",
   projectId: "project-a",
   visibleContext: {
    contentBuildId: "cb-a",
    title: "Austerlitz",
    topic: "Napoleonic history",
    format: "long",
    plannedPublishAt: "2026-10-01T18:00:00.000Z",
   },
   artifactRefs: ["asset-a", "asset-a", "asset-b"],
  })).toEqual({
   channelId: "channel-a",
   projectId: "project-a",
   contentBuildId: "cb-a",
   title: "Austerlitz",
   topic: "Napoleonic history",
   format: "long",
   plannedPublishAt: "2026-10-01T18:00:00.000Z",
   evidenceIds: ["asset-a", "asset-b"],
  })
 })

 it("does not create project context without both channel and project identity", () => {
  expect(buildAlgorithmProjectContext({ channelId: "channel-a", projectId: null })).toBeNull()
  expect(buildAlgorithmProjectContext({ channelId: null, projectId: "project-a" })).toBeNull()
 })
})
