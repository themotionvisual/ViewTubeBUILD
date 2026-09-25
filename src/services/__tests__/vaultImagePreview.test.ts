// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest"
import { extractVaultImagePreview } from "../vaultImagePreview"

describe("extractVaultImagePreview", () => {
 it("returns null for non-image files", async () => {
  const file = new File(["x"], "clip.mp4", { type: "video/mp4" })
  expect(await extractVaultImagePreview(file)).toBeNull()
 })

 it("uses the injected capture implementation for image files", async () => {
  const file = new File(["x"], "photo.png", { type: "image/png" })
  const capture = vi.fn().mockResolvedValue("data:image/jpeg;base64,preview")
  const result = await extractVaultImagePreview(file, capture)

  expect(result).toBe("data:image/jpeg;base64,preview")
  expect(capture).toHaveBeenCalledWith(file)
 })
})
