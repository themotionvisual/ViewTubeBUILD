import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const source = readFileSync(resolve(process.cwd(), "src/views/VideoManager.tsx"), "utf8")

describe("Video Manager canonical Studio Hub contract", () => {
 it("keeps the normal workspace available while disconnected", () => {
  expect(source).not.toContain("if (!connected) {\n  return")
  expect(source).toContain("CONNECT YOUR YOUTUBE CHANNEL TO LOAD VIDEOS")
  expect(source).toContain("RECONNECT YOUR YOUTUBE CHANNEL TO LOAD VIDEOS")
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
