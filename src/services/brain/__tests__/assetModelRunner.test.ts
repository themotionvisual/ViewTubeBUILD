// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest"

const { generateSchemaJsonObject } = vi.hoisted(() => ({
 generateSchemaJsonObject: vi.fn(),
}))

vi.mock("../../gemini", () => ({
 generateSchemaJsonObject,
}))

import {
 geminiAssetModelRunner,
 resolveAssetModelResolution,
} from "../assetModelRunner"

describe("resolveAssetModelResolution", () => {
 it("records the creator preference and the provider-selected model separately", () => {
  expect(resolveAssetModelResolution(
   "gemini-3.1-pro-preview",
   "gemini-3.1-flash-lite",
  )).toEqual({
   capability: "text",
   requested: "gemini-3.1-pro-preview",
   served: "gemini-3.1-flash-lite",
   substituted: true,
   reason: "capability_policy_override",
  })
 })

 it("marks an unchanged provider selection as honoured", () => {
  expect(resolveAssetModelResolution(
   "gemini-3.1-flash-lite",
   "gemini-3.1-flash-lite",
  ).reason).toBe("honoured")
 })
})

describe("geminiAssetModelRunner", () => {
 it("delegates schema JSON generation to the canonical provider service", async () => {
  generateSchemaJsonObject.mockResolvedValueOnce({
   output: { body: "Draft" },
   requestedModel: "gemini-3.1-pro-preview",
   servedModel: "gemini-3.1-flash-lite",
  })

  const schema = { type: "OBJECT" } as any
  const result = await geminiAssetModelRunner<{ body: string }>({
   systemInstruction: "system",
   userText: "user",
   schema,
  })

  expect(generateSchemaJsonObject).toHaveBeenCalledWith({
   systemInstruction: "system",
   userText: "user",
   responseSchema: schema,
   capability: "text",
  })
  expect(result.output).toEqual({ body: "Draft" })
  expect(result.model?.requested).toBe("gemini-3.1-pro-preview")
  expect(result.model?.served).toBe("gemini-3.1-flash-lite")
 })
})
