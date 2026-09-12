import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const read = (relative: string) => fs.readFileSync(path.resolve(process.cwd(), relative), "utf8")

const expectSharedConversationSurface = (source: string) => {
 expect(source).toContain("loadBrainConversationState")
 expect(source).toContain("buildBrainConversationHistory")
 expect(source).toContain("subscribeBrainConversationChanges")
 expect(source).toContain("notifyBrainConversationChanged")
 expect(source).not.toContain("resumeAIBrainThread")
}

const expectBrainRuntimeSurface = (source: string) => {
 expect(source).toContain("runBrainTask")
 expect(source).not.toContain("runBrainTurn")
}

describe("Brain conversation architecture guard", () => {
 it("keeps Sidebar Copilot behind the shared conversation controller", () => {
  expectSharedConversationSurface(read("src/components/SidebarChatbot.tsx"))
 })

 it("keeps Brain Hub widget behind the shared conversation controller", () => {
  expectSharedConversationSurface(read("src/views/dashboard/widgets/BrainHubWidget.tsx"))
 })

 it("keeps Sidebar Copilot generation behind BrainRuntime", () => {
  expectBrainRuntimeSurface(read("src/components/SidebarChatbot.tsx"))
 })

 it("keeps Brain Hub widget generation behind BrainRuntime", () => {
  expectBrainRuntimeSurface(read("src/views/dashboard/widgets/BrainHubWidget.tsx"))
 })
})