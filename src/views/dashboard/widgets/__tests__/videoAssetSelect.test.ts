import { describe, expect, it } from "vitest"
import { buildVideoAssetOptions, VIDEO_ASSET_PLACEHOLDER_KEY } from "../videoAssetOptions"

const asset = (videoId: string, title: string) => ({
 channelId: "channel-1",
 videoId,
 title,
 thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
 publishedAt: "2026-01-01T00:00:00Z",
 durationSeconds: 60,
 format: "long" as const,
})

describe("buildVideoAssetOptions", () => {
 it("drops malformed and duplicate IDs while assigning a stable placeholder key", () => {
  const options = buildVideoAssetOptions([
   asset("video-1", "First"),
   asset("video-1", "Duplicate"),
   asset("", "Malformed"),
  ])
  expect(options.map((option) => option.key)).toEqual([VIDEO_ASSET_PLACEHOLDER_KEY, "video-1"])
 })

 it("filters the complete catalog before applying the result limit", () => {
  const assets = Array.from({ length: 70 }, (_, index) => asset(`video-${index}`, `Ordinary ${index}`))
  assets.push(asset("target-71", "Needle title"))
  const options = buildVideoAssetOptions(assets, "needle", 50)
  expect(options.map((option) => option.val)).toEqual(["", "target-71"])
 })

 it("never produces analytics fallback rows or blank selectable keys", () => {
  const options = buildVideoAssetOptions([asset("real-video", "Real video")])
  expect(options.some((option) => option.lbl.startsWith("Analytics Row"))).toBe(false)
  expect(options.slice(1).every((option) => Boolean(option.key && option.val))).toBe(true)
 })
})
