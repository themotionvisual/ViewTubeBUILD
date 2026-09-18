import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const source = readFileSync(resolve(process.cwd(), "src/views/VideoManager.tsx"), "utf8")
const toolboxCss = readFileSync(resolve(process.cwd(), "src/styles/toolbox-system.css"), "utf8")
const tokenSource = readFileSync(resolve(process.cwd(), "src/components/subtoolbox/tokens.ts"), "utf8")

describe("Video Manager canonical Studio Hub contract", () => {
 it("keeps the normal workspace available while disconnected", () => {
  expect(source).not.toContain("if (!connected) {\n  return")
  expect(source).toContain("CONNECT YOUR YOUTUBE CHANNEL TO LOAD VIDEOS")
  expect(source).toContain("RECONNECT YOUR YOUTUBE CHANNEL TO LOAD VIDEOS")
 })

 it("keeps the normal workspace mounted while the connected catalog loads", () => {
  expect(source).toContain('const catalogLoading = connected && videoListLoadState === "loading"')
  expect(source).toContain("selectedVideo || !connected || catalogLoading")
  expect(source).toContain("LOADING YOUR YOUTUBE VIDEO CATALOG…")
  expect(source).not.toContain("Connecting Video Catalog...")
 })

 it("does not enable data-bound edits before a video is selected", () => {
  expect(source).toContain("disabled={!connected || !selectedVideo}")
  expect(source).toContain("disabled={connected ? saving || !selectedVideoId : auth.loading}")
 })

 it("locks the fixed-height two-line mobile header contract", () => {
  expect(tokenSource).toContain("export const TOOLBOX_HEADER_DNA")
  expect(tokenSource).toContain("titleLineHeight: 0.82")
  expect(tokenSource).toContain("titleMaxLines: 2")
  expect(tokenSource).toContain("iconSize: 34")
  expect(tokenSource).toContain("iconStroke: 3.1")
  expect(tokenSource).toContain("contentEdgeInset: 4")

  expect(tokenSource).toContain("height: 56")
  expect(tokenSource).toContain("height: 48")
  expect(tokenSource).toContain("height: 38")
  expect(tokenSource).toContain("height: 32")
  expect(toolboxCss).toContain("height: 56px !important")
  expect(toolboxCss).toContain("max-height: 56px !important")
  expect(toolboxCss).toContain("--vt-subtoolbox-header-height: 44px")
  expect(toolboxCss).toContain("height: 44px !important")
  expect(toolboxCss).toContain("max-height: 44px !important")
  expect(toolboxCss).toContain("height: 48px !important")
  expect(toolboxCss).toContain("-webkit-line-clamp: 2")
  expect(toolboxCss).toContain("line-height: .82 !important")
  expect(toolboxCss).toContain("padding-left: max(4px, var(--vt-subtoolbox-content-inline-inset, 4px)) !important")
  expect(toolboxCss).toContain("--vt-toolbox-content-padding: 4px")
  expect(toolboxCss).toContain("--vt-toolbox-content-gap: 4px")
 })

 it("uses the canonical split-left selector family", () => {
  expect(source).toContain("SubToolboxSplitDropdown")
  expect(source).toContain("SubToolboxSplitButton")
  expect(source).toContain('from "../studio-ui"')
 })

 it("keeps selected metadata independent from the filtered catalog", () => {
  expect(source).toContain("allVideos.find((v) => v.videoId === selectedVideoId)")
 })

 it("does not turn playlist membership failure into video metadata failure", () => {
  expect(source).toContain("Video details loaded, but playlist membership sync failed.")
 })
})