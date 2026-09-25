import { beforeEach, describe, expect, it, vi } from "vitest"

const runBrainTurn = vi.hoisted(() => vi.fn())
const gatewayGenerate = vi.hoisted(() => vi.fn())

vi.mock("../BrainOrchestrator", () => ({
 runBrainTurn,
}))

vi.mock("../runtime/BrainModelGateway", () => ({
 defaultBrainModelGateway: {
  generateStructuredResponse: gatewayGenerate,
 },
}))

import {
 BRAIN_RUNTIME_VERSION,
 buildBrainRuntimeMetadata,
 runBrainTask,
} from "../runtime/BrainRuntime"

describe("BrainRuntime", () => {
 beforeEach(() => {
  runBrainTurn.mockReset()
  gatewayGenerate.mockReset()
 })

 it("forwards project and evidence context while keeping surface metadata in the runtime", async () => {
  const orchestratorResult = {
   response: { id: "response-1" },
   modules: [],
   capabilities: ["channel-profile"],
   contextBudget: { maximumCharacters: 24000 },
   repaired: false,
   generationPath: "model",
   repairOutcome: { attempted: false, succeeded: false, reasons: [] },
  }
  runBrainTurn.mockResolvedValue(orchestratorResult)

  const snapshot = { channel: { label: "Channel" } }
  const growthContext = { currentGoal: "Grow" }
  const result = await runBrainTask({
   channelId: "channel-1",
   userText: "What should I make next?",
   snapshot: snapshot as any,
   systemPrompt: "system",
   growthContext: growthContext as any,
   recentTurns: [],
   history: [],
   allowModel: true,
   surface: "ai-brain",
   projectId: "project-1",
   visibleContext: { selectedVideoId: "video-1", contentBuildId: "cb-1" },
   artifactRefs: ["asset-1", "asset-1", "asset-2"],
   requestedOutput: "strategy brief",
  })

  expect(runBrainTurn).toHaveBeenCalledTimes(1)
  expect(runBrainTurn).toHaveBeenCalledWith({
   channelId: "channel-1",
   userText: "What should I make next?",
   snapshot,
   systemPrompt: "system",
   growthContext,
   recentTurns: [],
   history: [],
   allowModel: true,
   modelGenerator: gatewayGenerate,
   nicheResolver: undefined,
   currentResearcher: undefined,
   projectId: "project-1",
   visibleContext: { selectedVideoId: "video-1", contentBuildId: "cb-1" },
   artifactRefs: ["asset-1", "asset-1", "asset-2"],
  })
  expect(result).toEqual({
   ...orchestratorResult,
   runtime: {
    runtimeVersion: BRAIN_RUNTIME_VERSION,
    surface: "ai-brain",
    projectId: "project-1",
    contentBuildId: "cb-1",
    artifactRefs: ["asset-1", "asset-2"],
    hasVisibleContext: true,
   },
  })
 })

 it("preserves an explicitly injected model generator for tests and specialized callers", async () => {
  const explicitGenerator = vi.fn()
  runBrainTurn.mockResolvedValue({ turn: { id: "turn-1" } })

  await runBrainTask({
   userText: "test",
   snapshot: {} as any,
   systemPrompt: "system",
   growthContext: {} as any,
   modelGenerator: explicitGenerator as any,
  })

  expect(runBrainTurn).toHaveBeenCalledWith(expect.objectContaining({
   modelGenerator: explicitGenerator,
  }))
 })

 it("builds bounded deterministic runtime metadata", () => {
  const artifactRefs = Array.from({ length: 60 }, (_, index) => `asset-${index}`)
  const metadata = buildBrainRuntimeMetadata({
   userText: "test",
   snapshot: {} as any,
   systemPrompt: "system",
   growthContext: {} as any,
   artifactRefs,
  })

  expect(metadata.runtimeVersion).toBe("brain-runtime-v1")
  expect(metadata.surface).toBe("unknown")
  expect(metadata.projectId).toBeNull()
  expect(metadata.artifactRefs).toHaveLength(50)
  expect(metadata.hasVisibleContext).toBe(false)
 })
})
