import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const source = readFileSync(
 new URL("./useCommunityPostController.ts", import.meta.url),
 "utf8",
)

describe("Community Post governed asset boundary", () => {
 it("routes generation through creatorAssets instead of direct Gemini generation", () => {
  expect(source).toContain("generateCommunityPostDraft")
  expect(source).not.toContain("refineCommunityPost")
 })

 it("records creator decisions for generated assets", () => {
  expect(source).toContain("recordAssetOutcome")
  expect(source).toContain('kind: "edited"')
  expect(source).toContain('kind: "accepted"')
  expect(source).toContain('kind: "exported"')
 })
})
