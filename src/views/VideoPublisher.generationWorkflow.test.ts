import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const source = readFileSync(new URL("./VideoPublisher.tsx", import.meta.url), "utf8")

describe("Video Publisher generation workflow boundary", () => {
 it("prepares one canonical GenerationRequest and closes it with a ToolReceipt", () => {
  expect(source).toContain("prepareGenerationRequest")
  expect(source).toContain("recordToolReceipt")
  expect(source).not.toContain("recordContentBuildToolInput")
  expect(source).not.toContain("recordContentBuildToolOutput")
 })

 it("keeps the packaging outputs attached to the request lineage", () => {
  expect(source).toContain("generationRequest.request")
  expect(source).toContain("versionIds:")
  expect(source).toContain("variantGroupId:")
  expect(source).toContain("outputAssetIds:")
 })
})
