// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest"
import { createLocalVaultAsset, listVaultAssets } from "../vaultAdapter"
import { listVaultTasks } from "../vaultTaskCenter"
import { runVaultTranscriptTask } from "../vaultTranscriptTask"

describe("runVaultTranscriptTask", () => {
 beforeEach(() => localStorage.clear())

 it("creates a linked transcript asset from real acquisition output", async () => {
  const source = createLocalVaultAsset({ name: "Published Video", kind: "video", tags: [] })
  const acquire = vi.fn().mockResolvedValue({
   ok: true,
   transcript: {
    status: "available",
    source: "manual_subtitles",
    languageCode: "en",
    text: "Opening line.\nSecond line.",
   },
  })

  const result = await runVaultTranscriptTask({
   asset: source,
   videoId: "yt-123",
   acquire,
  })

  expect(result.asset?.metadata?.parentAssetIds).toEqual([source.id])
  expect(result.asset?.metadata?.transcriptText).toContain("Opening line.")
  expect(listVaultAssets().map((asset) => asset.id)).toContain(result.asset?.id)
  expect(listVaultTasks()[0]).toMatchObject({
   type: "transcript",
   status: "completed",
   targetAssetId: source.id,
  })
 })

 it("records a failed durable transcript task when acquisition has no transcript", async () => {
  const source = createLocalVaultAsset({ name: "Video", kind: "video", tags: [] })
  const acquire = vi.fn().mockResolvedValue({
   ok: true,
   transcript: { status: "missing", source: "unknown" },
  })

  const result = await runVaultTranscriptTask({
   asset: source,
   videoId: "yt-404",
   acquire,
  })

  expect(result.asset).toBeNull()
  expect(result.task.status).toBe("failed")
  expect(result.task.targetAssetId).toBe(source.id)
 })
})
