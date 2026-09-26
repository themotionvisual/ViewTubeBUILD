import { describe, expect, it } from "vitest"
import { buildAlgorithmProjectContext } from "./BrainProjectContext"
import type { Project } from "../../types"
import type { ContentBuildSnapshot } from "../asset-engine/contracts"

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

 it("prefers canonical Project and ContentBuild state over stale visible UI context", () => {
  const project: Project = {
   id: "project-a",
   contentBuildId: "cb-canonical",
   name: "Canonical Project",
   videoTitle: "Canonical Project Title",
   publishDate: "2026-10-10T18:00:00.000Z",
   status: "active",
   plan: { concept: "Project concept", niche: "history" },
  }
  const contentBuild = {
   id: "cb-canonical",
   profile: {
    subject: "Canonical build subject",
    topic: "Canonical build topic",
    format: "long",
    audienceSegments: ["Napoleonic history viewers", "military history viewers"],
   },
  } as ContentBuildSnapshot

  expect(buildAlgorithmProjectContext({
   channelId: "channel-a",
   projectId: "project-a",
   project,
   contentBuild,
   visibleContext: {
    contentBuildId: "cb-stale",
    title: "Stale UI title",
    topic: "Stale UI topic",
    format: "short",
    plannedPublishAt: "2025-01-01T00:00:00.000Z",
   },
   artifactRefs: ["asset-a"],
  })).toEqual({
   channelId: "channel-a",
   projectId: "project-a",
   contentBuildId: "cb-canonical",
   title: "Canonical Project Title",
   topic: "Canonical build topic",
   format: "long",
   plannedPublishAt: "2026-10-10T18:00:00.000Z",
   targetAudience: ["Napoleonic history viewers", "military history viewers"],
   evidenceIds: ["asset-a"],
  })
 })

 it("does not create project context without both channel and project identity", () => {
  expect(buildAlgorithmProjectContext({ channelId: "channel-a", projectId: null })).toBeNull()
  expect(buildAlgorithmProjectContext({ channelId: null, projectId: "project-a" })).toBeNull()
 })
})
