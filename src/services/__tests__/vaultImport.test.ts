// @vitest-environment jsdom
import { describe, expect, it } from "vitest"
import { createPendingVaultImport, inferVaultAssetKind, updatePendingVaultImport } from "../vaultImport"

describe("Vault import preparation", () => {
 it("infers the canonical Vault kind from the browser file type", () => {
  expect(inferVaultAssetKind(new File(["x"], "shot.png", { type: "image/png" }))).toBe("image")
  expect(inferVaultAssetKind(new File(["x"], "clip.mp4", { type: "video/mp4" }))).toBe("video")
  expect(inferVaultAssetKind(new File(["x"], "mix.wav", { type: "audio/wav" }))).toBe("audio")
  expect(inferVaultAssetKind(new File(["x"], "notes.md", { type: "text/markdown" }))).toBe("document")
 

 it("updates a staged draft without changing its temporary identity", () => {
  const file = new File(["x"], "clip.mp4", { type: "video/mp4" })
  const pending = createPendingVaultImport(file, ["imported"], "pending-9")
  const updated = updatePendingVaultImport(pending, {
   name: "Opening Charge.mp4",
   kind: "video",
   tags: ["imported", "b-roll"],
  })

  expect(updated).toMatchObject({
   id: "pending-9",
   name: "Opening Charge.mp4",
   kind: "video",
   tags: ["imported", "b-roll"],
  })
 })
})

 it("prepares a staged import without creating a canonical Vault identity", () => {
  const file = new File(["hello"], "notes.txt", { type: "text/plain" })
  const prepared = createPendingVaultImport(
   file,
   ["research", "imported"],
   "pending-1",
   { width: 1200, height: 800 },
  )

  expect(prepared).toMatchObject({
   id: "pending-1",
   name: "notes.txt",
   kind: "document",
   mimeType: "text/plain",
   size: 5,
   tags: ["research", "imported"],
   metadata: { width: 1200, height: 800 },
  })
 })
})
