import { describe, expect, it } from "vitest"
import {
  buildKeywordClustersFromMasterRows,
  buildKeywordCombinationStats,
  buildKeywordSelectionSummary,
  getKeywordRankValue,
  keywordMetricSupportsTotal,
  tokenizeTitleKeywords,
  toggleKeywordSelection,
} from "../keywordVennAnalysis"

const makeRow = (
  title: string,
  metrics: Partial<{
    views: number
    impressions: number
    engagedViews: number
    avdSeconds: number
    avp: number
    rpm: number
    subscribersGained: number
    likes: number
    comments: number
    shares: number
    revenue: number
  }>,
) => ({
  title,
  videoId: title.replace(/\s+/g, "-").toLowerCase(),
  metrics: {
    views: { value: metrics.views ?? 0 },
    impressions: { value: metrics.impressions ?? 0 },
    engagedViews: { value: metrics.engagedViews ?? 0 },
    avdSeconds: { value: metrics.avdSeconds ?? 0 },
    avp: { value: metrics.avp ?? 0 },
    rpm: { value: metrics.rpm ?? 0 },
    subscribersGained: { value: metrics.subscribersGained ?? 0 },
    likes: { value: metrics.likes ?? 0 },
    comments: { value: metrics.comments ?? 0 },
    shares: { value: metrics.shares ?? 0 },
    revenue: { value: metrics.revenue ?? 0 },
  },
})

describe("tokenizeTitleKeywords", () => {
  it("removes stop words, punctuation, and duplicate tokens", () => {
    expect(
      tokenizeTitleKeywords("The BEST, Battle of THE Nile!! Battle"),
    ).toEqual(["best", "battle", "nile"])
  })
})

describe("buildKeywordClustersFromMasterRows", () => {
  const rows = [
    makeRow("Alder cavalry tactics", {
      views: 1000,
      impressions: 1500,
      engagedViews: 650,
      avdSeconds: 90,
      avp: 55,
      rpm: 2.5,
      subscribersGained: 12,
      likes: 80,
      comments: 12,
      shares: 18,
      revenue: 4.5,
    }),
    makeRow("Alder cavalry charge", {
      views: 1200,
      impressions: 1700,
      engagedViews: 720,
      avdSeconds: 120,
      avp: 62,
      rpm: 3.5,
      subscribersGained: 15,
      likes: 92,
      comments: 10,
      shares: 20,
      revenue: 5.25,
    }),
    makeRow("Alder infantry tactics", {
      views: 1100,
      impressions: 1600,
      engagedViews: 700,
      avdSeconds: 105,
      avp: 58,
      rpm: 2.2,
      subscribersGained: 11,
      likes: 75,
      comments: 8,
      shares: 16,
      revenue: 4.1,
    }),
  ]

  it("sums volume metrics for keyword clusters", () => {
    const clusters = buildKeywordClustersFromMasterRows(rows, "views", {
      minSupport: 2,
    })
    const alder = clusters.find((item) => item.word === "alder")
    expect(alder?.videoCount).toBe(3)
    expect(alder?.metrics.views).toBe(3300)
    expect(alder?.metrics.likes).toBe(247)
  })

  it("averages duration/rate metrics for keyword clusters", () => {
    const clusters = buildKeywordClustersFromMasterRows(rows, "averageViewDuration", {
      minSupport: 2,
    })
    const cavalry = clusters.find((item) => item.word === "cavalry")
    expect(cavalry?.metrics.averageViewDuration).toBe(105)
    expect(cavalry?.metrics.averageViewPercentage).toBe(58.5)
    expect(cavalry?.metrics.rpm).toBe(3)
  })

  it("uses one resolver for distinct Average and Total leaders", () => {
    const leaderRows = [
      makeRow("broad alpha", { views: 100 }),
      makeRow("broad beta", { views: 100 }),
      makeRow("broad gamma", { views: 100 }),
      makeRow("focused alpha", { views: 130 }),
      makeRow("focused beta", { views: 130 }),
    ]
    const total = buildKeywordClustersFromMasterRows(leaderRows, "views", {
      minSupport: 2,
      rankingMode: "total",
    })
    const average = buildKeywordClustersFromMasterRows(leaderRows, "views", {
      minSupport: 2,
      rankingMode: "average",
    })

    expect(total[0]?.word).toBe("broad")
    expect(average[0]?.word).toBe("focused")
    expect(getKeywordRankValue(total[0], "views", "total")).toBe(300)
    expect(getKeywordRankValue(average[0], "views", "average")).toBe(130)
  })

  it("keeps rate metrics Average-only in both control modes", () => {
    const clusters = buildKeywordClustersFromMasterRows(rows, "averageViewPercentage", {
      minSupport: 2,
    })
    const cavalry = clusters.find((item) => item.word === "cavalry")
    expect(cavalry).toBeDefined()
    expect(getKeywordRankValue(cavalry!, "averageViewPercentage", "average")).toBe(58.5)
    expect(getKeywordRankValue(cavalry!, "averageViewPercentage", "total")).toBe(58.5)
    expect(keywordMetricSupportsTotal("averageViewPercentage")).toBe(false)
    expect(keywordMetricSupportsTotal("views")).toBe(true)
  })
})

describe("buildKeywordCombinationStats", () => {
  const rows = [
    makeRow("Black Guardians at Somosierra", {
      views: 7523,
      engagedViews: 4200,
      likes: 335,
      comments: 9,
      shares: 12,
      avdSeconds: 118,
      avp: 64,
      rpm: 4.2,
      subscribersGained: 22,
      revenue: 12.4,
    }),
    makeRow("guardian black legion", {
      views: 6935,
      engagedViews: 3800,
      likes: 305,
      comments: 8,
      shares: 11,
      avdSeconds: 126,
      avp: 69,
      rpm: 4.6,
      subscribersGained: 20,
      revenue: 10.3,
    }),
    makeRow("Black legion tactics", {
      views: 4200,
      engagedViews: 2400,
      likes: 144,
      comments: 6,
      shares: 7,
      avdSeconds: 84,
      avp: 51,
      rpm: 3.1,
      subscribersGained: 9,
      revenue: 6.2,
    }),
  ]

  it("returns single, pair, and triple combinations in selection order", () => {
    const combinations = buildKeywordCombinationStats(
      rows,
      ["black", "guardian", "legion"],
      "views",
    )

    expect(combinations.map((item) => item.keywords.join("|"))).toEqual([
      "black",
      "guardian",
      "legion",
      "black|guardian",
      "black|legion",
      "guardian|legion",
      "black|guardian|legion",
    ])

    const triple = combinations.find(
      (item) => item.keywords.join("|") === "black|guardian|legion",
    )
    expect(triple?.videoCount).toBe(1)
    expect(triple?.metrics.views).toBe(6935)
  })

  it("selection summary matches the exact current selection", () => {
    const summary = buildKeywordSelectionSummary(
      rows,
      ["black", "guardian"],
      "likes",
    )
    expect(summary?.videoCount).toBe(2)
    expect(summary?.metrics.likes).toBe(640)
  })
})

describe("toggleKeywordSelection", () => {
  it("drops the least-recently selected keyword when adding a fourth", () => {
    expect(
      toggleKeywordSelection(["types", "alderian", "alder"], "cavalry"),
    ).toEqual(["alderian", "alder", "cavalry"])
  })
})
