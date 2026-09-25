// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import { createLocalVaultAsset, listVaultAssets } from "../vaultAdapter"
import {
 createCaptionAsset,
 captionLinesToSrt,
 captionLinesToVtt,
 transcriptToScriptAsset,
} from "../vaultCaptions"

describe("Vault captions", () => {
 beforeEach(() => localStorage.clear())

 it("creates a linked caption artifact from a source media asset", () => {
  const source = createLocalVaultAsset({ name: "Interview", kind: "video", tags: [] })
  const caption = createCaptionAsset(source, [
   { id: "1", startMs: 0, endMs: 1500, text: "Hello there." },
  ])

  expect(caption.kind).toBe("document")
  expect(caption.metadata?.parentAssetIds).toEqual([source.id])
  expect(caption.metadata?.captionFormat).toBe("timed-lines")
 })

 it("serializes real SRT and VTT text", () => {
  const lines = [{ id: "1", startMs: 1000, endMs: 2500, text: "Opening line" }]
  expect(captionLinesToSrt(lines)).toContain("00:00:01,000 --> 00:00:02,500")
  expect(captionLinesToVtt(lines)).toContain("WEBVTT")
  expect(captionLinesToVtt(lines)).toContain("00:00:01.000 --> 00:00:02.500")
 })

 it("creates a linked Script derivative from captions", () => {
  const source = createLocalVaultAsset({ name: "Interview Captions", kind: "document", tags: ["captions"] })
  const script = transcriptToScriptAsset(source, [
   { id: "1", startMs: 0, endMs: 1200, text: "First line." },
   { id: "2", startMs: 1300, endMs: 2400, text: "Second line." },
  ])

  expect(script.name).toContain("Script")
  expect(script.metadata?.parentAssetIds).toContain(source.id)
  expect(script.metadata?.scriptText).toBe("First line.\nSecond line.")
  expect(listVaultAssets().map((a) => a.id)).toContain(script.id)
 })
})
