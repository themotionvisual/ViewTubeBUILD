import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const read = (relative: string) => fs.readFileSync(path.resolve(process.cwd(), relative), "utf8")

describe("Brain conversation architecture guard", () => {
 it("keeps Sidebar Copilot behind the shared conversation controller", () => {
  const source = read("src/components/SidebarChatbot.tsx")
  expect(source).toContain("loadBrainConversationState")
  expect(source).toContain("buildBrainConversationHistory")
  expect(source).toContain("subscribeBrainConversationChanges")
  expect(source).not.toContain("resumeAIBrainThread")
 })

 it("keeps Sidebar Copilot generation behind BrainRuntime", () => {
  const source = read("src/components/SidebarChatbot.tsx")
  expect(source).toContain("runBrainTask")
  expect(source).not.toContain("runBrainTurn")
 })
})
