import type { ChartCardDefinition, ChartCardSize, ChartClassKey } from "../referenceStudio/chartSystem"
import type { ChartSpec40 } from "./chartSpec40"

const SUPPORTED_RENDERERS = new Set<ChartClassKey>([
  "annotation",
  "area",
  "bar",
  "bubble",
  "calendar",
  "candlestick",
  "column",
  "combo",
  "diff",
  "donut",
  "gantt",
  "gauge",
  "geo",
  "histogram",
  "intervals",
  "line",
  "maps",
  "org",
  "pie",
  "sankey",
  "scatter",
  "steppedArea",
  "table",
  "timelines",
  "treemap",
  "trendlines",
  "vega",
  "waterfall",
  "wordtree",
])

const resolveRenderer = (key: ChartClassKey): ChartClassKey => {
  if (SUPPORTED_RENDERERS.has(key)) return key
  return "table"
}

const resolveSize = (size: ChartCardSize): ChartCardSize => {
  if (size === "full" || size === "half" || size === "third") return size
  return "half"
}

export const toChartCard40 = (spec: ChartSpec40): ChartCardDefinition => {
  const renderer = resolveRenderer(spec.rendererKey)
  return {
    key: renderer,
    renderer,
    size: resolveSize(spec.sizeClass),
    title: spec.title,
    note: `${spec.insightType.toUpperCase()} · ${spec.pack.toUpperCase()}`,
  }
}

