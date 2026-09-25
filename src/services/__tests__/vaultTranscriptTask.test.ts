// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest"
import { createLocalVaultAsset, listVaultAssets } from "../vaultAdapter"
import { createVaultTask, listVaultTasks, updateVaultTask } from "../vaultTaskCenter"
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

 it("reuses an existing failed task when retrying transcript acquisition", async () => {
  const source = createLocalVaultAsset({ name: "Retry Video", kind: "video", tags: [] })
  const task = createVaultTask({
   type: "transcript",
   label: "Transcript · Retry Video",
   targetAssetId: source.id,
  })
  updateVaultTask(task.id, { status: "failed", progress: 100, detail: "Offline" })
  const acquire = vi.fn().mockResolvedValue({
   ok: true,
   transcript: {
    status: "available",
    source: "auto_subtitles",
    text: "Recovered transcript.",
   },
  })

  const result = await runVaultTranscriptTask({
   asset: source,
   videoId: "yt-retry",
   taskId: task.id,
   acquire,
  })

  expect(result.task.id).toBe(task.id)
  expect(listVaultTasks()).toHaveLength(1)
  expect(result.task.status).toBe("completed")
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
