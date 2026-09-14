import { describe, expect, it } from "vitest"
import {
 ANALYTICS_WINDOWS,
 COMPARABLE_WINDOWS,
 WINDOW_DAYS,
 isAnalyticsWindow,
 latestCompleteAnalyticsDate,
 resolveWindowRange,
 windowDayCount,
} from "./windows"

const at = (iso: string) => new Date(`${iso}T00:00:00Z`)

describe("analytics window vocabulary", () => {
 it("orders windows widest first so fallback degrades to a longer window", () => {
  expect(ANALYTICS_WINDOWS).toEqual(["lifetime", "365d", "90d", "28d", "7d"])
  expect(COMPARABLE_WINDOWS).not.toContain("lifetime")
 })

 it("recognises only the canonical window keys", () => {
  expect(isAnalyticsWindow("28d")).toBe(true)
  // The non-canonical keys coreLifetimeSync used to emit.
  expect(isAnalyticsWindow("day28")).toBe(false)
  expect(isAnalyticsWindow("last28")).toBe(false)
 })

 it("reports a day count for comparable windows and none for lifetime", () => {
  expect(windowDayCount("7d")).toBe(7)
  expect(windowDayCount("lifetime")).toBeNull()
 })
})

describe("latestCompleteAnalyticsDate", () => {
 it("is yesterday in UTC — today's analytics row is always partial", () => {
  expect(latestCompleteAnalyticsDate(new Date("2026-07-15T23:59:00Z")))
   .toEqual(at("2026-07-14"))
 })

 it("does not drift with the local clock time of day", () => {
  expect(latestCompleteAnalyticsDate(new Date("2026-07-15T00:00:01Z")))
   .toEqual(latestCompleteAnalyticsDate(new Date("2026-07-15T23:59:59Z")))
 })
})

describe("resolveWindowRange", () => {
 const endDate = at("2026-07-15")

 it("builds inclusive current ranges of exactly the window length", () => {
  COMPARABLE_WINDOWS.forEach((window) => {
   const range = resolveWindowRange({ window, endDate })
   const days =
    (at(range.endDate).getTime() - at(range.startDate).getTime()) / 86_400_000 + 1
   expect(days).toBe(WINDOW_DAYS[window])
   expect(range.endDate).toBe("2026-07-15")
   expect(range.coverage).toBe("complete")
  })
 })

 it("builds inclusive nonoverlapping current and previous ranges", () => {
  expect(resolveWindowRange({ window: "7d", period: "current", endDate })).toEqual({
   startDate: "2026-07-09",
   endDate: "2026-07-15",
   coverage: "complete",
  })
  expect(resolveWindowRange({ window: "7d", period: "previous", endDate })).toEqual({
   startDate: "2026-07-02",
   endDate: "2026-07-08",
   coverage: "complete",
  })
 })

 it("defaults to the current period", () => {
  expect(resolveWindowRange({ window: "28d", endDate }))
   .toEqual(resolveWindowRange({ window: "28d", period: "current", endDate }))
 })

 it("ends at the last complete analytics day when no end date is given", () => {
  const now = new Date("2026-07-15T12:00:00Z")
  expect(resolveWindowRange({ window: "7d", endDate: latestCompleteAnalyticsDate(now) }))
   .toEqual({ startDate: "2026-07-08", endDate: "2026-07-14", coverage: "complete" })
 })

 it("starts lifetime at the channel publish date", () => {
  expect(resolveWindowRange({
   window: "lifetime",
   endDate,
   channelPublishedAt: "2019-03-02T08:00:00Z",
  })).toEqual({
   startDate: "2019-03-02",
   endDate: "2026-07-15",
   coverage: "complete",
  })
 })

 it("falls back to the YouTube epoch when publishedAt is missing or unusable", () => {
  expect(resolveWindowRange({ window: "lifetime", endDate }).startDate).toBe("2005-04-23")
  expect(resolveWindowRange({ window: "lifetime", endDate, channelPublishedAt: "not-a-date" }).startDate)
   .toBe("2005-04-23")
 })

 it("marks a window partial when the channel did not exist for all of it", () => {
  expect(resolveWindowRange({
   window: "365d",
   endDate,
   channelPublishedAt: "2026-06-01",
  })).toEqual({
   startDate: "2026-06-01",
   endDate: "2026-07-15",
   coverage: "partial",
  })
 })

 it("marks a comparison partial when the channel did not yet exist", () => {
  expect(resolveWindowRange({
   window: "7d",
   period: "previous",
   endDate,
   channelPublishedAt: "2026-07-12",
  })).toEqual({
   startDate: "2026-07-12",
   endDate: "2026-07-08",
   coverage: "partial",
  })
 })
})
