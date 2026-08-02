import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { MemoryRouter } from "react-router-dom"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { GlobalDataContext, fallbackContext } from "../../context/GlobalDataContextTypes"
import AIBrainCommandInterface, { BrainGenerationBadge } from "../AIBrainCommandInterface"

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

const renderHub = () =>
 renderToStaticMarkup(
  <MemoryRouter initialEntries={["/ai-brain"]}>
   <GlobalDataContext.Provider value={fallbackContext}>
    <AIBrainCommandInterface />
   </GlobalDataContext.Provider>
  </MemoryRouter>,
 )

describe("AIBrainCommandInterface", () => {
 let storage: ReturnType<typeof createStorage>

 beforeEach(() => {
  storage = createStorage()
  vi.stubGlobal("localStorage", storage)
  vi.stubGlobal("window", { localStorage: storage })
 })

 afterEach(() => {
  vi.unstubAllGlobals()
 })

 it("renders one autonomous surface with no tab or mode selector", () => {
  const html = renderHub()

  expect(html).toContain("ViewTube Brain Hub")
  expect(html).toContain("Ask ViewTube Copilot Anything")

  // The creator never picks a mode: no tab controls of any kind.
  expect(html).not.toContain('role="tab"')
  expect(html).not.toContain(">Ask Copilot<")
  expect(html).not.toContain(">Growth Prompts<")
  expect(html).not.toContain(">Daily Oracle<")
  expect(html).not.toContain(">Analytics Signals<")
  expect(html).not.toContain(">Channel Knowledge<")
  expect(html).not.toContain(">Brain Learning Lab<")
  expect(html).not.toContain(">Tool Handoffs<")
  expect(html).not.toContain(">Advanced Health<")
 })

 it("shows the ambient context rail without requiring any selection", () => {
  const html = renderHub()

  expect(html).toContain("What the Brain currently knows")
  expect(html).toContain("Your channel")
  // Goal lives inside the channel panel rather than owning a panel of its own.
  expect(html).toContain("Goal ·")
 })

 it("opens with the Brain's own read instead of an empty chat box", () => {
  const html = renderHub()

  // With no channel evidence the Brain must name what it is missing rather than
  // emit a confident generic greeting.
  expect(html).toContain("Let&#x27;s get me enough to be useful")
  expect(html).toContain("Needs channel data")
  expect(html).toContain("Why this recommendation")
 })

 it("renders each piece of context once, never in both the chat and the rail", () => {
  const html = renderHub()

  // The opening read is narrative and belongs to the conversation; the rail holds
  // structured state. Duplicating either is what previously made the page endless.
  const briefingHeadings = html.match(/Here&#x27;s what I&#x27;m seeing|Let&#x27;s get me enough to be useful/g) || []
  expect(briefingHeadings).toHaveLength(1)

  const railLabel = html.match(/What the Brain currently knows/g) || []
  expect(railLabel).toHaveLength(1)
 })

 it("keeps journal capture available as a bounded workspace action", () => {
  const html = renderHub()

  // Journal capture is an inline affordance in the composer, not a mode/tab.
  expect(html).toContain("AI Journal")
 })

 it("keeps internal diagnostics out of the creator workspace", () => {
  const html = renderHub()

  expect(html).not.toContain("Brain diagnostics")
  expect(html).not.toContain("IndexedDB")
  expect(html).not.toContain("localStorage")
  expect(html).not.toContain("VT-SYNC")
  expect(html).not.toContain("manifest")
 })

 it.each([
  ["model", "Full Brain"],
  ["repaired_model", "Refined Answer"],
  ["basic_guidance", "Basic Guidance"],
 ] as const)("renders an accessible, wrapping %s generation badge", (path, label) => {
  const html = renderToStaticMarkup(<BrainGenerationBadge path={path} />)

  expect(html).toContain(label)
  expect(html).toContain('role="status"')
  expect(html).toContain(`aria-label="${label} response status"`)
  expect(html).toContain('title="How this answer was prepared"')
  expect(html).toContain("whitespace-normal")
  expect(html).not.toMatch(/provider|account|credit|consent|internal error/i)
 })
})
