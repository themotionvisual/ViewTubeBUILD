// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest"
import { resetContentBuildRepositoryForTests } from "./asset-engine/ContentBuildRepository"
import {
  buildLongformDailyComparisonWindow,
  buildLongformOptimizationDailyComparison,
  fetchAndRecordLongformOptimizationDailyComparison,
} from "./longformOptimizationComparison"

describe("Longform Optimizer 7+7 daily comparison", () => {
  beforeEach(() => {
    localStorage.clear()
    resetContentBuildRepositoryForTests()
  })

  it("builds seven days before, a change marker, and seven days after without inventing future data", () => {
    const window = buildLongformDailyComparisonWindow(
      Date.parse("2026-09-10T15:00:00.000Z"),
      new Date("2026-09-15T12:00:00.000Z"),
    )

    expect(window.startDate).toBe("2026-09-03")
    expect(window.changeDate).toBe("2026-09-10")
    expect(window.targetEndDate).toBe("2026-09-17")
    expect(window.queryEndDate).toBe("2026-09-14")

    const comparison = buildLongformOptimizationDailyComparison({
      videoId: "video-1",
      changeAt: Date.parse("2026-09-10T15:00:00.000Z"),
      now: new Date("2026-09-15T12:00:00.000Z"),
      rows: [
        { day: "2026-09-03", views: 100 },
        { day: "2026-09-09", views: 160 },
        { day: "2026-09-11", views: 220 },
        { day: "2026-09-14", views: 280 },
      ],
    })

    expect(comparison.days).toHaveLength(15)
    expect(comparison.days[0]).toMatchObject({ relativeDay: -7, phase: "before", date: "2026-09-03" })
    expect(comparison.days[7]).toMatchObject({ relativeDay: 0, phase: "change", date: "2026-09-10" })
    expect(comparison.days[14]).toMatchObject({ relativeDay: 7, phase: "after", date: "2026-09-17", pending: true })
    expect(comparison.status).toBe("partial")
  })

  it("records one video-scoped canonical analytics checkpoint and keeps before/after summaries separate", async () => {
    const fetchReport = vi.fn().mockResolvedValue({
      columnHeaders: [
        { name: "day" },
        { name: "views" },
        { name: "estimatedMinutesWatched" },
        { name: "averageViewPercentage" },
        { name: "likes" },
        { name: "comments" },
        { name: "estimatedRevenue" },
      ],
      rows: [
        ["2026-09-03", 100, 400, 55, 12, 2, 3],
        ["2026-09-04", 110, 420, 56, 13, 2, 4],
        ["2026-09-05", 120, 440, 57, 14, 3, 4],
        ["2026-09-06", 130, 460, 58, 15, 3, 5],
        ["2026-09-07", 140, 480, 59, 16, 4, 5],
        ["2026-09-08", 150, 500, 60, 17, 4, 6],
        ["2026-09-09", 160, 520, 61, 18, 5, 6],
        ["2026-09-11", 220, 650, 62, 24, 7, 9],
        ["2026-09-12", 230, 680, 63, 25, 8, 10],
        ["2026-09-13", 240, 710, 64, 26, 8, 11],
        ["2026-09-14", 250, 740, 65, 27, 9, 12],
        ["2026-09-15", 260, 770, 66, 28, 9, 13],
        ["2026-09-16", 270, 800, 67, 29, 10, 14],
        ["2026-09-17", 280, 830, 68, 30, 10, 15],
      ],
    })

    const result = await fetchAndRecordLongformOptimizationDailyComparison({
      videoId: "video-1",
      contentBuildId: "cb:video:video-1",
      channelId: "channel-1",
      changeAt: Date.parse("2026-09-10T15:00:00.000Z"),
      now: new Date("2026-09-19T12:00:00.000Z"),
      fetchReport,
    })

    expect(fetchReport).toHaveBeenCalledWith(
      expect.objectContaining({
        startDate: "2026-09-03",
        endDate: "2026-09-17",
        dimensions: ["day"],
        filters: ["video==video-1"],
      }),
      expect.stringContaining("Longform Optimizer"),
    )
    expect(result.status).toBe("ready")
    expect(result.before.daysObserved).toBe(7)
    expect(result.after.daysObserved).toBe(7)
    expect(result.after.viewsAverage).toBeGreaterThan(result.before.viewsAverage!)
    expect(result.contentBuildEventId).toBeTruthy()
  })
})
