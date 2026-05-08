import { describe, it, expect } from "vitest"
import {
 API_CAPABILITY_REGISTRY,
 evaluateToolCapabilityStatus,
 validateAnalyticsVideoRequest,
} from "../youtube/apiCapabilityRegistry"

describe("apiCapabilityRegistry", () => {
 it("has a non-empty capability matrix", () => {
  expect(API_CAPABILITY_REGISTRY.capabilities.length).toBeGreaterThan(0)
 })

 it("validates supported video analytics metrics", () => {
  const result = validateAnalyticsVideoRequest([
   "views",
   "estimatedMinutesWatched",
   "averageViewDuration",
  ])
  expect(result.ok).toBe(true)
 })

 it("blocks unsupported video-dimension metrics before network calls", () => {
  const result = validateAnalyticsVideoRequest([
   "views",
   "uniqueViewers",
   "newViewers",
  ])
  expect(result.ok).toBe(false)
  if (!result.ok) {
   expect(result.reasonCode).toBe("metric_not_supported_for_video_dimension")
  }
 })

 it("evaluates tool capability by account context", () => {
  expect(evaluateToolCapabilityStatus("performance-hub", "creator")).toBe(
   "partial",
  )
  expect(evaluateToolCapabilityStatus("data-transparency-center", "creator")).toBe(
   "blocked",
  )
  expect(
   evaluateToolCapabilityStatus("data-transparency-center", "content_owner"),
  ).toBe("full")
 })
})
