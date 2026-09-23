// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("../../gemini", () => ({
 getActiveModel: vi.fn(() => "gemini-3.1-flash-lite"),
 getAiClient: vi.fn(),
 executeWithRetry: vi.fn(),
 cleanJsonString: vi.fn((value: string) => value),
}))

import { resolveAssetModelResolution } from "../assetModelRunner"

beforeEach(() => {
 localStorage.clear()
})

describe("resolveAssetModelResolution", () => {
 it("records the creator preference and the provider-selected model separately", () => {
  localStorage.setItem("vt_ai_model", "gemini-3.1-pro-preview")
  expect(resolveAssetModelResolution()).toEqual({
   capability: "text",
   requested: "gemini-3.1-pro-preview",
   served: "gemini-3.1-flash-lite",
   substituted: true,
   reason: "capability_policy_override",
  })
 })

 it("uses the current default preference when no creator preference is stored", () => {
  expect(resolveAssetModelResolution().requested).toBe("gemini-3.1-flash")
 })
})
