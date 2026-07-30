import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { BrainKpiModule } from "../BrainAnswerModules"
import type { AIBrainAnswerModule } from "../../../types"

const render = (module: AIBrainAnswerModule) => renderToStaticMarkup(<BrainKpiModule module={module} />)

describe("BrainKpiModule", () => {
 it("renders a metric row with values and deltas when the module carries metrics", () => {
  const html = render({
   id: "metric-pulse",
   title: "Metric Pulse",
   body: "Reach improved while click-through slipped.",
   tone: "blue",
   source: "analytics",
   code: "28D",
   data: {
    metrics: [
     { label: "Views", value: 284000, change: 18 },
     { label: "CTR", value: null, displayValue: "4.2%", change: -0.8 },
     { label: "AVD", value: null, displayValue: "6:14" },
    ],
   },
  })

  expect(html).toContain("Metric Pulse")
  expect(html).toContain("28D")
  expect(html).toContain("284K") // compacted
  expect(html).toContain("4.2%")
  expect(html).toContain("+18%")
  expect(html).toContain("-0.8%")
  // The prose still appears beneath the figures.
  expect(html).toContain("Reach improved")
 })

 it("renders ranked evidence rows with position numbers", () => {
  const html = render({
   id: "video-evidence-ranking",
   title: "What I ranked this on",
   body: "",
   tone: "blue",
   source: "analytics",
   code: "Top 3",
   data: {
    items: [
     { title: "Napoleon's Cavalry", detail: "480K views · 5.0% CTR" },
     { title: "Forging a Knife", detail: "210K views" },
    ],
   },
  })

  expect(html).toContain("What I ranked this on")
  expect(html).toContain("Napoleon&#x27;s Cavalry")
  expect(html).toContain("480K views")
  // Position markers 1 and 2 for the two rows.
  expect(html).toContain(">1<")
  expect(html).toContain(">2<")
 })

 it("renders a sparkline for a trend module's points", () => {
  const html = render({
   id: "views-trend",
   title: "Views Trend",
   body: "Momentum is building.",
   tone: "green",
   source: "analytics",
   kind: "trend_chart",
   data: { points: [{ label: "w1", value: 10 }, { label: "w2", value: 14 }, { label: "w3", value: 22 }] },
  })

  expect(html).toContain("Views Trend")
  expect(html).toContain("<svg")
  expect(html).toContain("<path")
 })

 it("shows a missing-evidence note instead of inventing data", () => {
  const html = render({
   id: "revenue-forecast",
   title: "Revenue Forecast",
   body: "",
   tone: "yellow",
   source: "analytics",
   data: { missingReason: "Revenue data is not connected yet." },
  })

  expect(html).toContain("Revenue data is not connected yet.")
 })

 it("falls back to plain prose when there is no structured payload", () => {
  const html = render({
   id: "plain",
   title: "Next Move",
   body: "Turn your best lane into a repeatable format.",
   tone: "green",
   source: "growth",
  })

  expect(html).toContain("Next Move")
  expect(html).toContain("Turn your best lane")
 })
})
