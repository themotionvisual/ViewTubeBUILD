import { beforeEach, describe, expect, it, vi } from "vitest"

const providerGenerateContent = vi.hoisted(() => vi.fn())
const unifiedServerEnabled = vi.hoisted(() => vi.fn())
const unifiedAccountSnapshot = vi.hoisted(() => vi.fn())

vi.mock("@google/genai", () => ({
 GoogleGenAI: class {
  models = {
   generateContent: providerGenerateContent,
   generateContentStream: vi.fn(),
  }
 },
 Type: new Proxy({}, { get: (_target, key) => String(key) }),
 ThinkingLevel: {},
 GenerateContentResponse: class {},
}))

vi.mock("../account/accountCoordinator", () => ({
 consumeUnifiedAiCredits: vi.fn(),
 fetchUnifiedAccountSnapshot: unifiedAccountSnapshot,
 isUnifiedAccountServerEnabled: unifiedServerEnabled,
}))

import { getAiClient } from "../gemini"

const createStorage = () => {
 const values = new Map<string, string>()
 return {
  getItem: vi.fn((key: string) => values.get(key) || null),
  setItem: vi.fn((key: string, value: string) => values.set(key, value)),
  removeItem: vi.fn((key: string) => values.delete(key)),
  clear: vi.fn(() => values.clear()),
 }
}

describe("Gemini custom-key access", () => {
 beforeEach(() => {
  const storage = createStorage()
  storage.setItem("yt_api_key", "creator-owned-test-key")
  storage.setItem("vt_auth_state", JSON.stringify({ isAuthenticated: true }))
  vi.stubGlobal("localStorage", storage)
  providerGenerateContent.mockReset()
  unifiedServerEnabled.mockReturnValue(true)
  unifiedAccountSnapshot.mockResolvedValue({
   authentication: { status: "authenticated" },
   billing: { planId: "beta" },
   ai: { availableCredits: 0 },
  })
  providerGenerateContent.mockResolvedValue({
   text: "creator-specific answer",
   modelVersion: "gemini-2.5-flash",
   usageMetadata: { promptTokenCount: 20, candidatesTokenCount: 10 },
  })
 })

 it("lets an authenticated creator use their own key without ViewTube credits", async () => {
  const client = getAiClient()

  await expect(client.models.generateContent({
   model: "gemini-3.1-flash",
   contents: "What language does my audience use?",
  })).resolves.toMatchObject({ text: "creator-specific answer" })

  expect(providerGenerateContent).toHaveBeenCalledTimes(1)
 })

 it("still blocks a signed-out creator from using a custom key", async () => {
  unifiedAccountSnapshot.mockResolvedValue({
   authentication: { status: "signed_out" },
   billing: { planId: "beta" },
   ai: { availableCredits: 0 },
  })
  const client = getAiClient()

  await expect(client.models.generateContent({
   model: "gemini-3.1-flash",
   contents: "Help with my channel",
  })).rejects.toThrow("requires a signed-in ViewTube account")

  expect(providerGenerateContent).not.toHaveBeenCalled()
 })
})
