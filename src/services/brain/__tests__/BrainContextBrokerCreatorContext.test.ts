import { describe, expect, it } from "vitest"
import { buildBrainContextPack } from "../BrainContextBroker"
import { DEFAULT_BRAIN_USER_CONTROLS } from "../BrainUserControls"

const snapshot = {
 brain: {
  identityAndAspirations: "Build a serious history channel.",
  contentDNA: "Primary-source historical storytelling.",
  futureStateMap: "Publish one researched longform video weekly.",
 },
 channel: { label: "History Channel" },
 conversations: { recentFacts: [] },
 inferredProfile: {
  niche: "Napoleonic history",
  contentPillars: ["Napoleon"],
  topicClusters: ["Austerlitz"],
  videoCount: 12,
  topEvidenceVideos: [],
 },
 evidencePack: { missingInputs: [], evidenceIds: [] },
} as any

describe("BrainContextBroker creator-context convergence", () => {
 it("uses the unified Creator Context envelope for controls, knowledge, project and style", () => {
  const creatorContext = {
   version: "vt-creator-context-v1",
   channelId: "channel-1",
   controls: {
    ...DEFAULT_BRAIN_USER_CONTROLS,
    allowAnalytics: false,
   },
   profile: null,
   channelKnowledge: {
    records: [{
     knowledgeClass: "CREATOR_PREFERENCE",
     confidence: "high",
     lifecycleState: "active",
     statement: "Prefer concise titles.",
     evidenceRefs: ["creator:preference:title-length"],
    }],
    contradictions: [],
   },
   styleProfile: {
    id: "style-1",
    channelId: "channel-1",
    scope: "channel",
    descriptor: {
     voice: "measured and documentary",
     pacing: "deliberate",
     vocabulary: { prefer: ["eyewitness"], avoid: ["insane"] },
     structure: "chronological",
     openingPattern: "immediate historical scene",
     closingPattern: "reflective consequence",
     productionQuality: "cinematic",
    },
    exemplars: [],
    features: {},
    source: "creator_authored",
    confidence: "high",
    createdAt: "2026-09-26T00:00:00.000Z",
    updatedAt: "2026-09-26T00:00:00.000Z",
    contradictions: [],
   },
   project: {
    channelId: "channel-1",
    projectId: "project-1",
    contentBuildId: "content-1",
    title: "Austerlitz",
    topic: "Battle of Austerlitz",
    format: "longform",
    plannedPublishAt: null,
    evidenceIds: ["asset-1"],
   },
   surface: null,
   selection: null,
   evidenceRefs: ["asset-1"],
   provenance: {
    profileLoadedAt: null,
    selectionUpdatedAt: null,
    projectSource: "canonical_project_content_build",
   },
  } as any

  const result = buildBrainContextPack({
   channelId: "channel-1",
   systemPrompt: "SYSTEM",
   snapshot,
   recentTurns: [],
   userText: "Help improve this project.",
   creatorContext,
  })

  expect(result.systemInstruction).toContain("Analytics evidence access is disabled")
  expect(result.systemInstruction).toContain("CHANNEL KNOWLEDGE")
  expect(result.systemInstruction).toContain("Prefer concise titles.")
  expect(result.systemInstruction).toContain("ACTIVE PROJECT CONTEXT")
  expect(result.systemInstruction).toContain("Austerlitz")
  expect(result.systemInstruction).toContain("contentBuildId=content-1")
  expect(result.systemInstruction).toContain("CREATOR STYLE")
  expect(result.systemInstruction).toContain("measured and documentary")
  expect(result.systemInstruction).toContain("avoid=insane")
 })
})
