import { describe, expect, it } from "vitest"
import { detectCsvImportProfile } from "../csvImportDetector"

const detect = (row: Record<string, unknown>, path = "/Users/cwb/Downloads/files/Table data.csv") =>
 detectCsvImportProfile([row], path)

describe("csvImportDetector", () => {
 it("detects traffic overview exports", () => {
  const result = detect({
   "Traffic source": "Browse features",
   Views: "1,200",
   "Watch time (hours)": "42.5",
  })

  expect(result.detectedCategory).toBe("traffic_overview")
  expect(result.mergeTargetDataset).toBe("traffic")
  expect(result.mergeKeyStrategy).toBe("traffic_source")
 })

 it("detects YouTube search traffic detail exports", () => {
  const result = detect({
   "Traffic source": "YT_SEARCH.napoleon history",
   "Source type": "YT_SEARCH",
   "Source title": "napoleon history",
   Views: "200",
  })

  expect(result.detectedCategory).toBe("traffic_youtube_search")
  expect(result.mergeKeyStrategy).toBe("traffic_source_detail")
 })

 it("detects external, suggested, features, and shorts traffic detail exports", () => {
  expect(
   detect({
    "Traffic source": "EXT_URL.google.com",
    "Source type": "EXT_URL",
    "Source title": "google.com",
    Views: "100",
   }).detectedCategory,
  ).toBe("traffic_external")

  expect(
   detect({
    "Traffic source": "YT_RELATED.ABCD1234",
    "Source type": "YT_RELATED",
    "Source title": "Suggested video",
    Views: "100",
   }).detectedCategory,
  ).toBe("traffic_suggested_videos")

  expect(
   detect({
    "Traffic source": "YT_CHANNEL.My channel page",
    "Source type": "YT_CHANNEL",
    "Source title": "Channel page",
    Views: "100",
   }).detectedCategory,
  ).toBe("traffic_youtube_features")

  expect(
   detect({
    "Traffic source": "SHORTS_CONTENT_LINKS.shortId",
    "Source type": "SHORTS_CONTENT_LINKS",
    "Source title": "Shorts linked video",
    Views: "100",
   }).detectedCategory,
  ).toBe("traffic_shorts_feed")
 })

 it("detects content all, shorts, and longform exports", () => {
  expect(
   detect({
    Content: "abc123",
    "Video title": "Mixed content row",
    "Video publish time": "2026-05-01",
    Duration: "0:42",
    Views: "100",
   }).detectedCategory,
  ).toBe("content_channel_all")

  expect(
   detect({
    Content: "short123",
    "Video title": "Shorts row",
    "Video publish time": "2026-05-01",
    Duration: "0:12",
    Views: "100",
    "Stayed to watch (%)": "68.5",
   }).detectedCategory,
  ).toBe("content_shorts")

  expect(
   detect({
    Content: "long123",
    "Video title": "Longform row",
    "Video publish time": "2026-05-01",
    Duration: "12:34",
    Views: "100",
    "End screen element click rate (%)": "1.2",
    "Card click rate (%)": "0.4",
   }).detectedCategory,
  ).toBe("content_longform")
 })

 it("detects geography, audience growth, demographics, and retention exports", () => {
  expect(
   detect({ Cities: "Paris", "City name": "Paris", Views: "100" }).detectedCategory,
  ).toBe("geography_city")

  expect(
   detect({ Geography: "France", Views: "100", "Watch time (hours)": "5" }).detectedCategory,
  ).toBe("geography_country")

  expect(
   detect({ Date: "2026-05-01", "Monthly audience": "4000", "New viewers": "500" }).detectedCategory,
  ).toBe("audience_growth")

  expect(
   detect({ "Viewer age": "18-24", "Viewer gender": "Female", "Views (%)": "12" }).detectedCategory,
  ).toBe("audience_demographics")

  expect(
   detect({ "Video position (%)": "10", "Absolute audience retention (%)": "75" }).detectedCategory,
  ).toBe("audience_retention_single_video")

  expect(
   detect({
    "Video position (%)": "10",
    "Started watching": "22",
    "Stopped watching": "11",
    "Number of times each moment was seen": "120",
   }).detectedCategory,
  ).toBe("audience_retention_segment")
 })

 it("keeps unknown files diagnosable but outside merge", () => {
  const result = detect({ Random: "value", Other: "thing" })

  expect(result.detectedCategory).toBe("unknown")
  expect(result.mergeTargetDataset).toBe("ignore")
  expect(result.warnings.length).toBeGreaterThan(0)
 })
})
