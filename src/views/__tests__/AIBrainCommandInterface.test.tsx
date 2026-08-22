import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { MemoryRouter } from "react-router-dom"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { GlobalDataContext, fallbackContext } from "../../context/GlobalDataContextTypes"
import { buildCreatorBrainPromptCards } from "../../services/aiBrainCommandInterface"
import AIBrainCommandInterface, {
 BrainGenerationBadge,
 BrainFeedbackControls,
 BrainPromptLibrary,
 promptCardSummary,
 shouldSendBrainComposerKey,
 UserMessage,
} from "../AIBrainCommandInterface"

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
  expect(html).toContain("Prompt Library")
  expect(html).not.toContain("Ask ViewTube Copilot Anything")
  expect(html).not.toContain("views pending sign-in")

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
  // Current goal context stays in the channel panel while an unanswered goal
  // check is a dedicated actionable module in the rail.
  expect(html).toContain("Goal ·")
  expect(html).toContain("Goal check")
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

 it("keeps every guided prompt available independently of chat history", () => {
  const cards = buildCreatorBrainPromptCards()
  const html = renderToStaticMarkup(
   <BrainPromptLibrary cards={cards} onPrompt={() => undefined} />,
  )

  expect(cards.length).toBeGreaterThanOrEqual(12)
  // Every card renders, whatever the count, and ids are unique.
  expect(new Set(cards.map((card) => card.id)).size).toBe(cards.length)
  cards.forEach((card) => expect(html).toContain(card.label))
  expect(html).toContain('aria-labelledby="brain-prompt-library-title"')
  expect(html).toContain("Analyze Channel Niche")
  expect(html).toContain("Revenue Levers")
  expect(html).toContain("Best Video Autopsy")
  expect(html).toContain("Run Daily Oracle")
  // The newly added creator-requested prompts are present.
  expect(html).toContain("Pinned Comments")
  expect(html).toContain("10 Video Ideas")
  expect(html).toContain("Shorts Funnel Plan")
  expect(html).toContain("sm:grid-cols-2")
  expect(html).toContain("xl:grid-cols-3")
  expect(html).toContain("line-clamp-2")
  expect(html).toContain("border-b-[2px]")
  // Cards are selectable (aria-pressed) and preview before sending, not instant-send.
  expect(html).toContain('aria-pressed="false"')
  expect(html).toContain("Tap a prompt above to preview it before sending.")
  // Card bodies show the short summary (the full prompt lives in the title tooltip
  // and the preview panel, not dumped into the card body).
  expect(html).toContain("A fresh, on-brand thumbnail concept for your next video.")
  // One button per card (nothing selected, so no preview action buttons yet).
  expect((html.match(/type="button"/g) || [])).toHaveLength(cards.length)
  expect(promptCardSummary(cards[0])).toBe("Find your niche and fuzzy edges.")
  expect(html).toContain("Find your niche and fuzzy edges.")
 })

 it("exposes persistent response rating states instead of inert icon buttons", () => {
  const message = { id: "response-1", role: "model", text: "Answer", response: undefined } as const
  const html = renderToStaticMarkup(
   <BrainFeedbackControls message={message} onFeedback={async () => undefined} />,
  )

  expect(html).toContain('aria-label="Rate this response"')
  expect(html).toContain('aria-pressed="false"')
  expect(html).toContain('role="status"')
  expect(html).toContain("Rate answer")
 })

 it("renders creator prompts as cyan split-row messages", () => {
  const html = renderToStaticMarkup(<UserMessage text="Plan my next upload." />)

  expect(html).toContain("bg-[#36E0F6]")
  expect(html).toContain("grid-cols-[84px_minmax(0,1fr)]")
  expect(html).toContain("text-[14px]")
  expect(html).toContain("You:")
 })

 it("sends the composer with Enter while ignoring IME composition", () => {
  expect(shouldSendBrainComposerKey({ key: "Enter", isComposing: false })).toBe(true)
  expect(shouldSendBrainComposerKey({ key: "Enter", isComposing: true })).toBe(false)
  expect(shouldSendBrainComposerKey({ key: "Escape", isComposing: false })).toBe(false)
 })

 it("keeps prompt and channel-context launchers reachable on smaller screens", () => {
  const html = renderHub()

  expect(html).toContain('aria-label="Open prompt library"')
  expect(html).toContain('aria-label="Open channel context"')
  expect(html).not.toContain(">Growth prompts<")
 })

 it("uses one themed scrollbar for the Brain conversation", () => {
  const html = renderHub()

  expect(html).toContain("brain-chat-scrollbar")
  expect(html).toContain('aria-label="Brain conversation"')
  expect(html).toContain('aria-label="Prompt library"')
  expect(html).toContain('aria-label="Channel context"')
  expect(html).not.toContain("custom-scrollbar")
 })

 it("mounts the conversation directly against its panel instead of adding a second content mat", () => {
  const html = renderHub()

  expect(html).not.toContain("grid min-h-0 flex-1 gap-2 bg-white p-2")
  expect(html).toContain("grid min-h-0 flex-1 bg-white")
  expect(html).toContain("xl:grid-cols-[minmax(0,1.45fr)_minmax(520px,1fr)]")
  expect(html).toContain("pt-5")
  expect(html).toContain("brain-chat-scrollbar")
  expect(html).toContain('aria-label="Open AI Journal"')
  expect(html).not.toContain("shrink-0 border-t-[4px] border-black bg-[#f8f8f4]")
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
  expect(html).toContain('tabindex="0"')
  expect(html).toContain(`aria-label="${label} response status"`)
  expect(html).toContain("response was prepared")
  expect(html).toContain("whitespace-normal")
  expect(html).not.toMatch(/provider|account|credit|consent|internal error/i)
 })
})
