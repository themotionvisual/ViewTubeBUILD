import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
 inferAssistantTargetTool,
 listAssistantIntelligenceSystems,
 queueAssistantCommand,
} from "../assistantIntelligenceSystem"
import {
 createBrainCommandAction,
 filterBrainCommandActions,
 listBrainCommandActions,
 normalizeBrainCommandAction,
 resolveBrainCommandRoute,
} from "../superToolActionPackets"

const createStorage = () => {
 const store = new Map<string, string>()
 return {
  getItem: vi.fn((key: string) => store.get(key) || null),
  setItem: vi.fn((key: string, value: string) => {
   store.set(key, value)
  }),
  removeItem: vi.fn((key: string) => {
   store.delete(key)
  }),
  clear: vi.fn(() => {
   store.clear()
  }),
 }
}

describe("assistantIntelligenceSystem", () => {
 let storage: ReturnType<typeof createStorage>

 beforeEach(() => {
  storage = createStorage()
  vi.stubGlobal("localStorage", storage)
  vi.stubGlobal("window", { localStorage: storage })
 })

 afterEach(() => {
  vi.unstubAllGlobals()
 })

 it("exposes Brain, super-tool, and dashboard widget systems to the assistant", () => {
  const systems = listAssistantIntelligenceSystems()
  expect(systems.some((system) => system.id === "central-brain-memory")).toBe(true)
  expect(systems.some((system) => system.id === "brain-command-center")).toBe(true)
  expect(systems.some((system) => system.id === "widget:ai-journal")).toBe(true)
 })

 it("routes Brain and goal requests to Brain Command Center", () => {
  expect(inferAssistantTargetTool("queue a goal and update my AI journal")).toBe(
   "brain-command-center",
  )
 })

 it("routes analytics and media analysis requests to Cinematic Analytics Lab", () => {
  expect(inferAssistantTargetTool("analyze video retention and channel history")).toBe(
   "cinematic-analytics-lab",
  )
 })

 it("routes generator requests to Creator Canvas OS", () => {
  expect(inferAssistantTargetTool("generate a hook, title, and content idea")).toBe(
   "creator-canvas-os",
  )
 })

 it("normalizes old manual command records without assistant metadata", () => {
  const normalized = normalizeBrainCommandAction({
   id: "manual-1",
   priority: "high",
   confidence: "low",
   sourceEvidence: ["note"],
   targetToolId: "workflow-chain-builder",
   note: "Manual command",
   status: "queued",
   createdAt: 10,
  })

  expect(normalized?.source).toBe("manual")
  expect(normalized?.generationId).toBeNull()
  expect(normalized?.workflowId).toBeNull()
  expect(normalized?.targetRoute).toBe(
   "/data-transparency?internalTool=workflow-chain-builder&commandActionId=manual-1",
  )
 })

 it("filters assistant and manual command records", () => {
  const assistant = createBrainCommandAction({
   source: "assistant",
   priority: "medium",
   confidence: "medium",
   sourceEvidence: ["assistant:user-request"],
   targetToolId: "creator-canvas-os",
   note: "Assistant request",
  })
  const manual = createBrainCommandAction({
   priority: "high",
   confidence: "medium",
   sourceEvidence: ["manual-note"],
   targetToolId: "brain-command-center",
   note: "Manual request",
  })

  const actions = listBrainCommandActions()
  expect(filterBrainCommandActions(actions, "assistant").map((action) => action.id)).toEqual([
   assistant.id,
  ])
  expect(filterBrainCommandActions(actions, "manual").map((action) => action.id)).toEqual([
   manual.id,
  ])
 })

 it("resolves command routes through existing target tool routes", () => {
  expect(resolveBrainCommandRoute("creator-canvas-os", "cmd-1")).toBe(
   "/data-transparency?internalTool=creator-canvas-os&commandActionId=cmd-1",
  )
  expect(resolveBrainCommandRoute("brain-command-center", "cmd-2")).toBe(
   "/data-transparency?internalTool=brain-command-center&commandActionId=cmd-2",
  )
 })

 it("queues assistant commands with generation, workflow, request, response, and target route metadata", async () => {
  const result = await queueAssistantCommand({
   request: "generate a hook and content idea",
   response: "Use Creator Canvas OS.",
   channelId: "channel-1",
  })

  const [action] = listBrainCommandActions()
  expect(action.id).toBe(result.action.id)
  expect(action.source).toBe("assistant")
  expect(action.targetToolId).toBe("creator-canvas-os")
  expect(action.generationId).toBe(result.recordId)
  expect(action.workflowId).toBe(result.workflowId)
  expect(action.assistantRequest).toBe("generate a hook and content idea")
  expect(action.assistantResponse).toBe("Use Creator Canvas OS.")
  expect(action.targetRoute).toBe(
   `/data-transparency?internalTool=creator-canvas-os&commandActionId=${action.id}`,
  )
 })
})
