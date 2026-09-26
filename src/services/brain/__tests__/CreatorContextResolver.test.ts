import { describe, expect, it, vi } from "vitest"
import {
 resolveCreatorContext,
 type CreatorContextResolverDependencies,
} from "../CreatorContextResolver"
import { DEFAULT_BRAIN_USER_CONTROLS } from "../BrainUserControls"

const profile = {
 channelId: "channel-1",
 personalizationEnabled: true,
 analyticsEnabled: true,
 knowledgeModel: null,
 toolContextPack: null,
 evidencePacket: null,
 nicheKnowledge: null,
 memoryClaims: [],
 loadedAt: "2026-09-26T10:00:00.000Z",
}

const knowledge = {
 records: [],
 contradictions: [],
 omitted: [],
 query: "title",
}

describe("CreatorContextResolver", () => {
 it("aggregates channel, project, style, surface and selection context behind one envelope", async () => {
  const deps: CreatorContextResolverDependencies = {
   readControls: () => ({ ...DEFAULT_BRAIN_USER_CONTROLS }),
   loadProfile: vi.fn(async () => profile),
   buildKnowledge: vi.fn(() => knowledge as any),
   resolveStyle: vi.fn(() => ({ id: "style-1", channelId: "channel-1" }) as any),
   buildProject: vi.fn(() => ({
    channelId: "channel-1",
    projectId: "project-1",
    contentBuildId: "content-1",
    title: "Austerlitz",
    topic: "Napoleonic history",
    format: "longform",
    plannedPublishAt: null,
    evidenceIds: ["asset-1", "asset-2"],
   })),
  }

  const result = await resolveCreatorContext({
   channelId: "channel-1",
   query: "Improve this title",
   projectId: "project-1",
   visibleContext: { contentBuildId: "content-1", title: "Austerlitz" },
   artifactRefs: ["asset-1", "asset-1", "asset-2"],
   assetType: "title",
   surface: {
    route: "/projects",
    projectId: "project-1",
    videoId: null,
    commentId: null,
    dateRange: null,
    capabilityIds: ["projects"],
    superToolIds: [],
    sourceOfTruth: ["Projects"],
    blockedCapabilities: [],
   },
   selection: {
    route: "/projects",
    sourceId: "project-1",
    label: "Austerlitz",
    projectId: "project-1",
    evidenceIds: ["asset-2", "selection-evidence"],
    updatedAt: "2026-09-26T10:01:00.000Z",
   },
  }, deps)

  expect(result.version).toBe("vt-creator-context-v1")
  expect(result.channelId).toBe("channel-1")
  expect(result.profile?.channelId).toBe("channel-1")
  expect(result.channelKnowledge).toBe(knowledge)
  expect(result.styleProfile?.id).toBe("style-1")
  expect(result.project?.contentBuildId).toBe("content-1")
  expect(result.surface?.route).toBe("/projects")
  expect(result.selection?.sourceId).toBe("project-1")
  expect(result.evidenceRefs).toEqual(["asset-1", "asset-2", "selection-evidence"])
 })

 it("honors creator controls instead of reconstructing disabled personalization or project context", async () => {
  const deps: CreatorContextResolverDependencies = {
   readControls: () => ({
    ...DEFAULT_BRAIN_USER_CONTROLS,
    personalization: false,
    allowProjects: false,
   }),
   loadProfile: vi.fn(async () => ({ ...profile, personalizationEnabled: false })),
   buildKnowledge: vi.fn(() => knowledge as any),
   resolveStyle: vi.fn(() => ({ id: "style-1" }) as any),
   buildProject: vi.fn(() => ({ projectId: "project-1" }) as any),
  }

  const result = await resolveCreatorContext({
   channelId: "channel-1",
   query: "What should I make?",
   projectId: "project-1",
   visibleContext: { title: "private project" },
  }, deps)

  expect(result.channelKnowledge).toBeNull()
  expect(result.styleProfile).toBeNull()
  expect(result.project).toBeNull()
  expect(deps.buildKnowledge).not.toHaveBeenCalled()
  expect(deps.resolveStyle).not.toHaveBeenCalled()
  expect(deps.buildProject).not.toHaveBeenCalled()
 })

 it("avoids channel-scoped reads when no channel is active", async () => {
  const deps: CreatorContextResolverDependencies = {
   readControls: () => ({ ...DEFAULT_BRAIN_USER_CONTROLS }),
   loadProfile: vi.fn(async () => profile),
   buildKnowledge: vi.fn(() => knowledge as any),
   resolveStyle: vi.fn(() => ({ id: "style-1" }) as any),
   buildProject: vi.fn(() => null),
  }

  const result = await resolveCreatorContext({
   channelId: null,
   query: "Help me plan",
  }, deps)

  expect(result.channelId).toBeNull()
  expect(result.profile).toBeNull()
  expect(result.channelKnowledge).toBeNull()
  expect(result.styleProfile).toBeNull()
  expect(deps.loadProfile).not.toHaveBeenCalled()
 })
})
