import { describe, expect, it } from "vitest"
import { findLargestFittingFontSize, fitThumbnailTitle, formatCommentTimestamp } from "./commentResponderUtils"

const now = new Date("2026-07-05T16:20:00")

describe("formatCommentTimestamp", () => {
  it("renders the requested exact comment date and recent window", () => {
    expect(formatCommentTimestamp("2026-07-05T15:00:00", now)).toEqual({
      absolute: "7/5/26 3:00PM", dateLabel: "7/5/26 3:00", meridiem: "PM", relative: "NOW",
    })
  })

  it("uses yesterday, weeks, months, and years after a date boundary", () => {
    expect(formatCommentTimestamp("2026-07-04T16:20:00", now).relative).toBe("YESTERDAY")
    expect(formatCommentTimestamp("2026-06-21T16:20:00", now).relative).toBe("2 WEEKS AGO")
    expect(formatCommentTimestamp("2026-05-01T16:20:00", now).relative).toBe("2 MONTHS AGO")
    expect(formatCommentTimestamp("2024-07-05T16:20:00", now).relative).toBe("2 YEARS AGO")
  })

  it("uses calendar dates across DST and never renders a negative age", () => {
    expect(formatCommentTimestamp("2026-03-08T23:30:00", new Date("2026-03-09T00:30:00")).relative).toBe("YESTERDAY")
    expect(formatCommentTimestamp("2026-07-06T16:20:00", now).relative).toBe("NOW")
  })
})

describe("fitThumbnailTitle", () => {
  const measure = (value: string, fontSize: number) => value.length * fontSize

  it("enlarges and balances a short title across the default two bands", () => {
    expect(fitThumbnailTitle("SHORT TITLE", 180, measure)).toEqual({
      lines: ["SHORT", "TITLE"],
      fontSize: 15,
    })
  })

  it("keeps both title bands for a single-word title", () => {
    expect(fitThumbnailTitle("WATERLOO", 180, measure)).toEqual({
      lines: ["WATERLOO", "\u00a0"],
      fontSize: 15,
    })
  })

  it("splits a longer title at the most even word boundary", () => {
    const layout = fitThumbnailTitle("TYPES OF NAPOLEON'S CAVALRY", 140, measure)
    expect(layout.lines).toEqual(["TYPES OF", "NAPOLEON'S CAVALRY"])
    expect(layout.fontSize).toBeGreaterThanOrEqual(7)
  })

  it("chooses the largest size that keeps a very long title to two lines", () => {
    const layout = fitThumbnailTitle("THIS TITLE WOULD PREVIOUSLY WRAP ACROSS THREE COMPLETE LINES", 250, measure)
    expect(layout.lines).toHaveLength(2)
    expect(layout.fontSize).toBeGreaterThanOrEqual(7)
    for (const line of layout.lines) expect(measure(line, layout.fontSize)).toBeLessThanOrEqual(250)
  })
})

describe("findLargestFittingFontSize", () => {
  it("returns the largest quarter-pixel size that fits the rendered box", () => {
    expect(findLargestFittingFontSize((fontSize) => fontSize <= 13.4)).toBe(13.25)
  })

  it("uses the minimum only when no larger size fits", () => {
    expect(findLargestFittingFontSize(() => false, { min: 6, max: 14 })).toBe(6)
  })
})
