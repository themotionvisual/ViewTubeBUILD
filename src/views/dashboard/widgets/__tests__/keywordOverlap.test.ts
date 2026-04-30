import { describe, expect, it } from "vitest"
import {
  buildKeywordConstellationDataset,
  buildKeywordSelectionSummary,
  tokenizeTitleKeywords,
  type KeywordMetricMode,
} from "../keywordOverlap"

const makeRow = (title: string, views: number, likes: number, shares: number, comments: number) => ({
  title,
  metrics: {
    views: { value: views },
    likes: { value: likes },
    shares: { value: shares },
    comments: { value: comments },
  },
})

describe("tokenizeTitleKeywords", () => {
  it("normalizes punctuation/case and removes stopwords", () => {
    expect(tokenizeTitleKeywords("The BEST, Battle of THE Nile!!")).toEqual(["best", "battle", "nile"])
  })

  it("deduplicates repeated keywords per title", () => {
    expect(tokenizeTitleKeywords("Cavalry cavalry CAVALRY tactics")).toEqual(["cavalry", "tactics"])
  })
})

describe("buildKeywordConstellationDataset", () => {
  const rows = [
    makeRow("Napoleon cavalry tactics", 1000, 80, 18, 12),
    makeRow("Napoleon cavalry charge", 1200, 90, 20, 10),
    makeRow("Napoleon infantry tactics", 1100, 70, 16, 8),
    makeRow("Cavalry infantry drill", 900, 65, 14, 9),
    makeRow("Infantry tactics strategy", 1300, 75, 22, 11),
    makeRow("Napoleon strategy empire", 1400, 95, 24, 13),
    makeRow("Brunswick black lancers", 2544, 52, 8, 1),
    makeRow("The black brunswickers", 7523, 335, 12, 9),
    makeRow("Charge of the polish lancers", 4265, 137, 9, 5),
  ]

  it("returns deterministic top nodes in every metric mode", () => {
    const modes: KeywordMetricMode[] = ["views", "likes", "shares", "comments", "engagement_matrix"]
    modes.forEach((mode) => {
      const dataset = buildKeywordConstellationDataset(rows, mode)
      expect(dataset.nodes.length).toBeGreaterThanOrEqual(3)
      expect(dataset.nodes[0].rank).toBe(1)
      expect(dataset.nodes.every((node) => node.videoCount >= 2)).toBe(true)
    })
  })

  it("switching mode changes ranking order for at least one pair", () => {
    const viewsOrder = buildKeywordConstellationDataset(rows, "views").nodes.map((node) => node.word)
    const commentsOrder = buildKeywordConstellationDataset(rows, "comments").nodes.map((node) => node.word)
    expect(viewsOrder.join("|")).not.toBe(commentsOrder.join("|"))
  })

  it("engagement matrix values are finite and non-negative", () => {
    const dataset = buildKeywordConstellationDataset(rows, "engagement_matrix")
    dataset.nodes.forEach((node) => {
      expect(Number.isFinite(node.engagementMatrixValue)).toBe(true)
      expect(node.engagementMatrixValue).toBeGreaterThanOrEqual(0)
    })
  })
})

describe("buildKeywordSelectionSummary", () => {
  const rows = [
    makeRow("Black Brunswickers at Somosierrra", 7523, 335, 12, 9),
    makeRow("Brunswick black legion", 6935, 305, 11, 8),
    makeRow("Charge of polish lancers", 4265, 137, 9, 5),
    makeRow("Brunswick siege order", 2544, 52, 8, 1),
  ]

  it("single keyword selection matches all containing videos", () => {
    const summary = buildKeywordSelectionSummary(rows, ["black"], "views")
    expect(summary).not.toBeNull()
    expect(summary?.videoCount).toBe(2)
  })

  it("two keyword selection matches AND combination", () => {
    const summary = buildKeywordSelectionSummary(rows, ["brunswick", "black"], "views")
    expect(summary).not.toBeNull()
    expect(summary?.videoCount).toBe(1)
  })

  it("selection is capped logically at 3 keywords", () => {
    const summary = buildKeywordSelectionSummary(rows, ["brunswick", "black", "legion", "extra"], "views")
    expect(summary).not.toBeNull()
    expect(summary?.keywords.length).toBe(3)
  })
})
