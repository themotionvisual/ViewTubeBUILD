import { describe, expect, it } from "vitest"
import {
  readRowDate,
  readRowMetric,
  sortDailyDescending,
  sumRowMetric,
} from "../dashboardSelectors"

describe("readRowDate", () => {
  it("accepts every date key the sources use", () => {
    const expected = new Date("2026-09-01").getTime()
    expect(readRowDate({ date: "2026-09-01" })).toBe(expected)
    expect(readRowDate({ day: "2026-09-01" })).toBe(expected)
    expect(readRowDate({ Date: "2026-09-01" })).toBe(expected)
    expect(readRowDate({ Day: "2026-09-01" })).toBe(expected)
  })

  it("returns 0 rather than NaN for missing or unparseable dates", () => {
    expect(readRowDate({})).toBe(0)
    expect(readRowDate({ date: "" })).toBe(0)
    expect(readRowDate({ date: "not a date" })).toBe(0)
  })
})

describe("sortDailyDescending", () => {
  it("orders newest first", () => {
    const sorted = sortDailyDescending([
      { date: "2026-09-01" },
      { date: "2026-09-03" },
      { date: "2026-09-02" },
    ])
    expect(sorted.map((row) => row.date)).toEqual(["2026-09-03", "2026-09-02", "2026-09-01"])
  })

  it("does not mutate its input", () => {
    const rows = [{ date: "2026-09-01" }, { date: "2026-09-03" }]
    const snapshot = [...rows]
    sortDailyDescending(rows)
    expect(rows).toEqual(snapshot)
  })

  it("sorts undated rows last without throwing", () => {
    const sorted = sortDailyDescending([{}, { date: "2026-09-01" }])
    expect(sorted[0]?.date).toBe("2026-09-01")
  })
})

describe("readRowMetric", () => {
  it("takes the first key that carries a usable number", () => {
    expect(readRowMetric({ watchTime: 5 }, "watchTime", "estimatedMinutesWatched")).toBe(5)
    expect(readRowMetric({ estimatedMinutesWatched: 7 }, "watchTime", "estimatedMinutesWatched")).toBe(7)
  })

  it("skips empty, null and undefined values instead of reading them as 0", () => {
    expect(readRowMetric({ views: "", impressions: 3 }, "views", "impressions")).toBe(3)
    expect(readRowMetric({ views: null, impressions: 3 }, "views", "impressions")).toBe(3)
  })

  it("preserves a genuine zero", () => {
    expect(readRowMetric({ views: 0, impressions: 9 }, "views", "impressions")).toBe(0)
  })

  it("returns 0 when nothing matches, and tolerates a blank alias", () => {
    expect(readRowMetric({}, "views")).toBe(0)
    expect(readRowMetric({ views: 4 }, "views", "")).toBe(4)
  })
})

describe("sumRowMetric", () => {
  it("sums across rows using whichever alias each row carries", () => {
    expect(
      sumRowMetric(
        [{ watchTime: 10 }, { estimatedMinutesWatched: 5 }, {}],
        "watchTime",
        "estimatedMinutesWatched",
      ),
    ).toBe(15)
  })

  it("is 0 for an empty set", () => {
    expect(sumRowMetric([], "views")).toBe(0)
  })
})
