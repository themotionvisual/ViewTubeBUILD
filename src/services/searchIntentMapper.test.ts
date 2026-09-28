import { describe, expect, it } from "vitest"
import {
 buildSearchIntentClusters,
 classifySearchIntent,
 resolveSearchIntentDatasetState,
 type SearchIntentTermInput,
} from "./searchIntentMapper"

describe("Search Intent Mapper backend", () => {
 it("classifies inspectable EXPLAIN, COMPARE, and DISCOVER intent rules", () => {
  expect(classifySearchIntent("why did napoleon invade russia")).toBe("EXPLAIN")
  expect(classifySearchIntent("napoleon vs wellington strategy")).toBe("COMPARE")
  expect(classifySearchIntent("napoleon cavalry documentary")).toBe("DISCOVER")
 })

 it("distinguishes missing, withheld, zero, stale, and error search-term states", () => {
  expect(resolveSearchIntentDatasetState({ rows: [], freshnessStatus: null, searchTrafficViews: 0 })).toBe("missing")
  expect(resolveSearchIntentDatasetState({ rows: [], freshnessStatus: "synced", searchTrafficViews: 240 })).toBe("withheld")
  expect(resolveSearchIntentDatasetState({ rows: [], freshnessStatus: "synced", searchTrafficViews: 0 })).toBe("zero")
  expect(resolveSearchIntentDatasetState({ rows: [], freshnessStatus: "stale", searchTrafficViews: 20 })).toBe("stale")
  expect(resolveSearchIntentDatasetState({ rows: [], freshnessStatus: "failed", searchTrafficViews: 20 })).toBe("error")
 })

 it("clusters observed terms by intent and computes coverage only from explicit video criteria", () => {
  const rows: SearchIntentTermInput[] = [
   {
    term: "why napoleon lost waterloo",
    views: 120,
    videoId: "waterloo",
    source: "youtube_analytics_v2:search_terms",
    observedAt: "2026-09-26",
   },
   {
    term: "napoleon austerlitz strategy",
    views: 80,
    source: "youtube_analytics_v2:search_terms",
    observedAt: "2026-09-26",
   },
   {
    term: "napoleon vs wellington strategy",
    views: 60,
    source: "youtube_analytics_v2:search_terms",
    observedAt: "2026-09-26",
   },
   {
    term: "napoleon cavalry documentary",
    views: 40,
    source: "youtube_analytics_v2:search_terms",
    observedAt: "2026-09-26",
   },
  ]

  const result = buildSearchIntentClusters(rows, [
   { videoId: "waterloo", title: "Why Napoleon Lost Waterloo" },
   { videoId: "austerlitz", title: "Napoleon Austerlitz Strategy", tags: ["austerlitz", "strategy"] },
  ])

  expect(result.map((cluster) => cluster.intent)).toEqual(["EXPLAIN", "COMPARE", "DISCOVER"])
  const explain = result.find((cluster) => cluster.intent === "EXPLAIN")!
  expect(explain.observedViews).toBe(200)
  expect(explain.coveragePct).toBe(100)
  expect(explain.terms.every((term) => term.coverage === "matched")).toBe(true)

  const compare = result.find((cluster) => cluster.intent === "COMPARE")!
  expect(compare.coveragePct).toBe(0)
  expect(compare.unansweredCount).toBe(1)
  expect(compare.terms[0].coverage).toBe("unanswered")
 })

 it("preserves source/date evidence references for every observed term", () => {
  const [cluster] = buildSearchIntentClusters([
   {
    term: "how napoleon used artillery",
    views: 45,
    source: "youtube_analytics_v2:search_terms",
    observedAt: "2026-09-25",
   },
  ], [])

  expect(cluster.evidenceIds).toHaveLength(1)
  expect(cluster.evidenceIds[0]).toContain("youtube_analytics_v2:search_terms")
  expect(cluster.evidenceIds[0]).toContain("2026-09-25")
  expect(cluster.terms[0].observedViews).toBe(45)
 })
})
