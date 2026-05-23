import type { ChartSpec40 } from "./chartSpec40"

export type ChartLifecycleStage = "incubator" | "candidate" | "production"

export interface ChartRegistryEntry {
  chartId: string
  stage: ChartLifecycleStage
  sourceRoute: string
  targetRoute: "/performance"
  analyticsReady: boolean
  notes: string
}

export const CHART_REGISTRY_40: ChartRegistryEntry[] = [
  {
    chartId: "top-performers-trio",
    stage: "production",
    sourceRoute: "/performance",
    targetRoute: "/performance",
    analyticsReady: true,
    notes: "Core launch chart. Keep stable and verify on each sync change.",
  },
  {
    chartId: "video-value-matrix",
    stage: "candidate",
    sourceRoute: "/reference-studio",
    targetRoute: "/performance",
    analyticsReady: true,
    notes: "Validated in studio; safe for controlled promotion.",
  },
  {
    chartId: "algorithm-trigger-matrix",
    stage: "candidate",
    sourceRoute: "/reference-studio",
    targetRoute: "/performance",
    analyticsReady: true,
    notes: "Depends on impressions+CTR consistency checks.",
  },
  {
    chartId: "narrative-dna",
    stage: "incubator",
    sourceRoute: "/reference-studio",
    targetRoute: "/performance",
    analyticsReady: false,
    notes: "Exploratory semantics; keep in sunset incubator for now.",
  },
  {
    chartId: "hook-to-binge-funnel",
    stage: "incubator",
    sourceRoute: "/legacy/research-lab",
    targetRoute: "/performance",
    analyticsReady: false,
    notes: "Needs stronger metric contract before promotion.",
  },
]

export const getChartLifecycleStage = (
  chartId: string,
): ChartLifecycleStage => {
  const entry = CHART_REGISTRY_40.find((item) => item.chartId === chartId)
  return entry?.stage ?? "incubator"
}

export const enrichSpecWithLifecycle = (spec: ChartSpec40) => ({
  ...spec,
  lifecycle: getChartLifecycleStage(spec.id),
})
