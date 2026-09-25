// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import { createLocalVaultAsset, searchVaultAssets } from "../vaultAdapter"

describe("Vault structured metadata filters", () => {
 beforeEach(() => localStorage.clear())

 it("filters by lifecycle, mime type, dimensions, duration and byte size", () => {
  createLocalVaultAsset({
   name: "Wide Final",
   kind: "video",
   mimeType: "video/mp4",
   tags: [],
   metadata: {
    lifecycle: "FINAL",
    width: 1920,
    height: 1080,
    durationSec: 42,
    byteSize: 8_000_000,
   },
  })
  createLocalVaultAsset({
   name: "Small Draft",
   kind: "video",
   mimeType: "video/webm",
   tags: [],
   metadata: {
    lifecycle: "DRAFT",
    width: 720,
    height: 1280,
    durationSec: 12,
    byteSize: 1_000_000,
   },
  })

  expect(searchVaultAssets({
   lifecycle: "FINAL",
   mimeType: "video/mp4",
   minWidth: 1280,
   minHeight: 720,
   minDurationSec: 30,
   maxBytes: 10_000_000,
  }).map((asset) => asset.name)).toEqual(["Wide Final"])
 })
})
