import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { MemoryRouter } from "react-router-dom"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { AssistantCommandContextBanner } from "../AssistantCommandContextBanner"
import { createBrainCommandAction, resolveBrainCommandRoute } from "../../services/superToolActionPackets"

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

describe("AssistantCommandContextBanner", () => {
 let storage: ReturnType<typeof createStorage>

 beforeEach(() => {
  storage = createStorage()
  vi.stubGlobal("localStorage", storage)
  vi.stubGlobal("window", { localStorage: storage })
 })

 afterEach(() => {
  vi.unstubAllGlobals()
 })

 it("renders queued assistant command context for the matching target surface", () => {
  const command = createBrainCommandAction({
   source: "assistant",
   priority: "medium",
   confidence: "medium",
   sourceEvidence: ["assistant:user-request"],
   targetToolId: "creator-canvas-os",
   note: "Assistant note",
   assistantRequest: "Build a hook from this idea",
   assistantResponse: "Open Creator Canvas OS.",
   targetRoute: resolveBrainCommandRoute("creator-canvas-os", "cmd-1"),
  })
  const html = renderToStaticMarkup(
   <MemoryRouter initialEntries={[`/studio?commandActionId=${command.id}`]}>
    <AssistantCommandContextBanner targetToolId="creator-canvas-os" />
   </MemoryRouter>,
  )

  expect(html).toContain("Assistant Command Context")
  expect(html).toContain("Build a hook from this idea")
  expect(html).toContain("Open Creator Canvas OS.")
 })
})
