// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest"
import { extractVaultVideoThumbnail } from "../vaultVideoThumbnail"

describe("extractVaultVideoThumbnail", () => {
 it("returns null for non-video files", async () => {
  const file = new File(["x"], "image.png", { type: "image/png" })
  expect(await extractVaultVideoThumbnail(file)).toBeNull()
 })

 it("uses the injected capture implementation for video files", async () => {
  const file = new File(["x"], "clip.mp4", { type: "video/mp4" })
  const capture = vi.fn().mockResolvedValue("data:image/jpeg;base64,thumb")
  const result = await extractVaultVideoThumbnail(file, capture)

  expect(result).toBe("data:image/jpeg;base64,thumb")
  expect(capture).toHaveBeenCalledWith(file)
 })
})
