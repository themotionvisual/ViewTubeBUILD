import { describe, expect, it } from "vitest"
import { resolveVaultTranscriptVideoId } from "../vaultTranscriptTask"

describe("resolveVaultTranscriptVideoId", () => {
 it("prefers an explicit YouTube video id on asset metadata", () => {
  expect(resolveVaultTranscriptVideoId({
   asset: { metadata: { youtubeVideoId: "asset-yt" } },
   contentBuildVideoId: "build-yt",
  })).toBe("asset-yt")
 })

 it("falls back to common video id metadata and ContentBuild YouTube binding", () => {
  expect(resolveVaultTranscriptVideoId({
   asset: { metadata: { videoId: "metadata-yt" } },
   contentBuildVideoId: "build-yt",
  })).toBe("metadata-yt")
  expect(resolveVaultTranscriptVideoId({
   asset: { metadata: {} },
   contentBuildVideoId: "build-yt",
  })).toBe("build-yt")
 })

 it("returns null when the asset cannot resolve to YouTube", () => {
  expect(resolveVaultTranscriptVideoId({ asset: { metadata: {} } })).toBeNull()
 })
})
