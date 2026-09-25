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
  expect(source).toContain("Loading Your YouTube Video Catalog…")
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

  expect(tokenSource).toContain("height: 80")
  expect(tokenSource).toContain("height: 56")
  expect(tokenSource).toContain("height: 48")
  expect(tokenSource).toContain("height: 32")
  expect(tokenSource).toContain("TOOLBOX_MOBILE_HEADER_DNA")
  expect(tokenSource).toContain("TOOLBOX_SHELL_GUTTER")
  expect(tokenSource).toContain("MINI_SUBTOOLBOX_DNA")
  expect(toolboxCss).toContain("--vt-toolbox-header-height: 56px")
  expect(toolboxCss).toContain("--vt-subtoolbox-header-height: 44px")
  expect(toolboxCss).toContain("max-height: 1.64em")
  expect(toolboxCss).toContain("line-height: .82 !important")
  expect(toolboxCss).toContain("--vt-toolbox-shell-gutter:6px")
  expect(toolboxCss).toContain("--vt-toolbox-shell-gutter:5px")
 })

 it("uses Studio Hub primitives for all visible buttons, fields, tags, and publishing controls", () => {
  expect(source).toContain("SubToolboxTopTitleDropdown")
  expect(source.match(/<SubToolboxTopTitleDropdown/g)).toHaveLength(3)
  expect(source).toContain("SubToolboxRemovableTag")
  expect(source).toContain("SubToolboxSelectableTag")
  expect(source).toContain("SubToolboxTagEditor")
  expect(source).toContain("SubToolboxLabeledInput")
  expect(source).toContain("SubToolboxLabeledTextArea")
  expect(source).toContain("SubToolboxVideoSelector")
  expect(source).toContain("SubToolboxIconButton")
  expect(source).toContain("SubToolboxLinkButton")
  expect(source).not.toContain("<button")
  expect(source).not.toContain("<textarea")
  expect(source).not.toContain("SubToolboxDropdownTopTitleControl")
 })

 it("uses canonical generic state, alert, output, and data-table primitives", () => {
  expect(source).toContain("SubToolboxAlert")
  expect(source).toContain("SubToolboxStatePanel")
  expect(source).toContain("SubToolboxOutputCard")
  expect(source).toContain("SubToolboxDataTable")
  expect(source).toContain('state="ready"')
  expect(source).toContain('state="error"')
  expect(source).toContain('state="empty"')
  expect(source).not.toContain("<table")
  expect(source).not.toContain('border-[6px] border-black')
  expect(source).not.toContain('bg-[#ffb158]/20 border-[4px]')
  expect(source).not.toContain('bg-[#00ff99]/20 border-[4px]')
 })

 it("uses the canonical rich L0 video selector family", () => {
  expect(source).toContain("SubToolboxVideoSelector")
  expect(source).toContain('level="l0"')
  expect(source).toContain('searchIcon={<Search')
  expect(source).not.toContain('title="Choose Video"')
  expect(source).not.toContain("SubToolboxSplitDropdown")
 })

 it("keeps selected metadata independent from the filtered catalog", () => {
  expect(source).toContain("allVideos.find((v) => v.videoId === selectedVideoId)")
 })

 it("does not turn playlist membership failure into video metadata failure", () => {
  expect(source).toContain("Video details loaded, but playlist membership sync failed.")
 })
})