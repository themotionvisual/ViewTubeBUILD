import {
  UNIFIED_CHART_SPECS,
  type UnifiedChartSpec,
} from "../../chartSystem/unifiedChartSpec"
import type { ChartCapabilityStatus40 } from "./capability"
import type { ChartSpec40 } from "./chartSpec40"
import { CHART_REGISTRY_40 } from "./chartRegistry"

export type OnboardingStatus40 =
  | "ready_for_rollout"
  | "not_ready_contract"
  | "not_ready_data"

export interface PerformanceHubChartBinding40 {
  chartId: string
  title: string
  pack: ChartSpec40["pack"]
  rendererKey: ChartSpec40["rendererKey"]
  rendererFamily: UnifiedChartSpec["rendererFamily"] | "Unknown"
  unifiedSpecId?: string
  lifecycleStage: "incubator" | "candidate" | "production"
  analyticsReady: boolean
  onboardingStatus: OnboardingStatus40
  metricAdapterKeys: string[]
  missingContractTerms: string[]
  fallbackBehavior: "block" | "limited" | "render_empty"
  sourceRoute: string
  notes: string
}

const REQUIRED_UNIFIED_KEYS: Array<keyof UnifiedChartSpec> = [
  "id",
  "title",
  "family",
  "chartType",
  "rendererFamily",
  "metrics",
  "axes",
  "dataRequirements",
  "styleTokens",
]

const getFallbackBehavior = (
  capability: ChartCapabilityStatus40,
): PerformanceHubChartBinding40["fallbackBehavior"] => {
  if (capability.readiness === "unavailable") return "block"
  if (capability.readiness === "limited") return "limited"
  return "render_empty"
}

const getUnifiedSpecByAnyKey = (
  chart: ChartSpec40,
): UnifiedChartSpec | undefined => {
  const direct = (UNIFIED_CHART_SPECS as Record<string, UnifiedChartSpec>)[chart.id]
  if (direct) return direct
  const normalized = chart.title.trim().toLowerCase()
  return Object.values(UNIFIED_CHART_SPECS).find(
    (spec) => spec.title.trim().toLowerCase() === normalized,
  )
}

export const buildChartBinding40 = (
  chart: ChartSpec40,
  capability: ChartCapabilityStatus40,
): PerformanceHubChartBinding40 => {
  const unified = getUnifiedSpecByAnyKey(chart)
  const registry = CHART_REGISTRY_40.find((item) => item.chartId === chart.id)
  const missingContractTerms = REQUIRED_UNIFIED_KEYS.filter((key) => {
    if (!unified) return true
    const value = unified[key]
    if (Array.isArray(value)) return value.length === 0
    return value == null || value === ""
  })
  const hasContract = missingContractTerms.length === 0
  const analyticsReady = registry?.analyticsReady ?? false

  let onboardingStatus: OnboardingStatus40 = "ready_for_rollout"
  if (!hasContract) onboardingStatus = "not_ready_contract"
  else if (!analyticsReady || capability.readiness === "unavailable") {
    onboardingStatus = "not_ready_data"
  }

  return {
    chartId: chart.id,
    title: chart.title,
    pack: chart.pack,
    rendererKey: chart.rendererKey,
    rendererFamily: unified?.rendererFamily ?? "Unknown",
    unifiedSpecId: unified?.id,
    lifecycleStage: registry?.stage ?? "incubator",
    analyticsReady,
    onboardingStatus,
    metricAdapterKeys: [...chart.requiredMetricsHard, ...chart.requiredMetricsSoft],
    missingContractTerms,
    fallbackBehavior: getFallbackBehavior(capability),
    sourceRoute: registry?.sourceRoute ?? "/reference-studio",
    notes:
      registry?.notes ??
      "No registry entry found. Add chartRegistry entry before production promotion.",
  }
}

