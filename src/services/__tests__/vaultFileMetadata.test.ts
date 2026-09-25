// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest"
import { extractVaultFileMetadata } from "../vaultFileMetadata"

describe("extractVaultFileMetadata", () => {
 it("always records stable browser file facts", async () => {
  const file = new File(["hello"], "reference.txt", { type: "text/plain", lastModified: 1234 })
  const metadata = await extractVaultFileMetadata(file)

  expect(metadata).toMatchObject({
   byteSize: 5,
   mimeType: "text/plain",
   extension: "txt",
   lastModified: 1234,
  })
 })

 it("adds visual dimensions returned by the media probe", async () => {
  const file = new File(["x"], "frame.png", { type: "image/png" })
  const probe = vi.fn().mockResolvedValue({ width: 1920, height: 1080 })

  const metadata = await extractVaultFileMetadata(file, probe)

  expect(metadata).toMatchObject({
   width: 1920,
   height: 1080,
   aspectRatio: 1920 / 1080,
  })
  expect(probe).toHaveBeenCalledWith(file)
 })

 it("adds video duration returned by the media probe", async () => {
  const file = new File(["x"], "clip.mp4", { type: "video/mp4" })
  const probe = vi.fn().mockResolvedValue({ width: 1080, height: 1920, duration: 12.5 })

  const metadata = await extractVaultFileMetadata(file, probe)

  expect(metadata).toMatchObject({
   width: 1080,
   height: 1920,
   durationSeconds: 12.5,
  })
 })
})
