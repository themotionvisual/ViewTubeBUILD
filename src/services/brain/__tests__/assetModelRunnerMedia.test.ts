// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest"

const { generateSchemaJsonObject } = vi.hoisted(() => ({
 generateSchemaJsonObject: vi.fn(),
}))

vi.mock("../../gemini", () => ({
 generateSchemaJsonObject,
}))

import { geminiAssetModelRunner } from "../assetModelRunner"

describe("geminiAssetModelRunner media parity", () => {
 it("delegates inline media attachments to the provider owner", async () => {
  generateSchemaJsonObject.mockResolvedValueOnce({
   output: { body: "Draft", intent: "update" },
   requestedModel: "gemini-3.1-flash",
   servedModel: "gemini-3.1-flash-lite",
  })

  await geminiAssetModelRunner({
   systemInstruction: "system",
   userText: "user",
   schema: { type: "OBJECT" } as any,
   mediaAttachments: ["data:image/png;base64,ZmFrZQ=="],
  })

  expect(generateSchemaJsonObject).toHaveBeenCalledWith(
   expect.objectContaining({
    mediaAttachments: ["data:image/png;base64,ZmFrZQ=="],
   }),
  )
 })
})
