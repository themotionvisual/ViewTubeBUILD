import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const read = (relativePath: string) =>
 fs.readFileSync(path.resolve(process.cwd(), relativePath), "utf8")

const SURFACES = [
 {
  path: "src/views/dashboard/widgets/BrainHubWidget.tsx",
  surface: 'surface: "brain-hub-widget"',
 },
 {
  path: "src/components/SidebarChatbot.tsx",
  surface: 'surface: "sidebar-chatbot"',
 },
 {
  path: "src/views/AIBrainCommandInterface.tsx",
  surface: 'surface: "ai-brain"',
 },
] as const

describe("BrainRuntime creator-surface migration guard", () => {
 it.each(SURFACES)("routes $path through runBrainTask", ({ path: relativePath, surface }) => {
  const source = read(relativePath)
  expect(source).toContain("runBrainTask")
  expect(source).toContain(surface)
  expect(source).not.toContain("runBrainTurn(")
 })

 it("preserves selected sidebar UI context as runtime visibleContext rather than durable memory", () => {
  const source = read("src/components/SidebarChatbot.tsx")
  expect(source).toContain("visibleContext")
  expect(source).toContain("selectedItem")
  expect(source).toContain("projectId: selection?.projectId ?? surface.projectId ?? null")
 })

 it("preserves runtime context through the orchestrator for specialist intelligence", () => {
  const runtime = read("src/services/brain/runtime/BrainRuntime.ts")
  const orchestrator = read("src/services/brain/BrainOrchestrator.ts")
  const broker = read("src/services/brain/BrainContextBroker.ts")
  expect(runtime).toContain("visibleContext: input.visibleContext")
  expect(runtime).toContain("projectId: input.projectId")
  expect(orchestrator).toContain("readAlgorithmIntelligenceForBrain")
  expect(orchestrator).toContain("algorithmIntelligence")
  expect(broker).toContain("ALGORITHM / CHANNEL / OPPORTUNITY INTELLIGENCE")
 })

 it("keeps evidence permissions and engine controls canonical", () => {
  const broker = read("src/services/brain/BrainContextBroker.ts")
  const controls = read("src/services/brain/BrainUserControls.ts")
  expect(broker).toContain("readBrainUserControls(input.channelId)")
  expect(controls).toContain("showEvidence: boolean")
  expect(controls).toContain("externalActionsRequireApproval: boolean")
 })

 it("keeps Brain Hub controls on the canonical user and engine stores", () => {
  const source = read("src/views/dashboard/widgets/BrainHubWidget.tsx")
  expect(source).toContain("writeBrainUserControls")
  expect(source).toContain("writeBrainEngineControls")
  expect(source).toContain("WidgetHeaderToggle")
  expect(source).toContain("WidgetLeftSplitButton")
 })
})