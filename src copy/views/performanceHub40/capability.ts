import type { CanonicalAnalyticsView } from "../referenceStudio/useCanonicalAnalytics"
import type { ChartReadiness40, ChartSpec40, MetricKey40 } from "./chartSpec40"

const hasMetric = (
  analytics: CanonicalAnalyticsView,
  metric: MetricKey40,
): boolean => {
  const summary = analytics.summary
  const topRows = analytics.topRows
  switch (metric) {
    case "views":
      return summary.totals.views > 0
    case "watchHours":
      return summary.totals.watchHours > 0
    case "revenue":
      return summary.totals.revenue > 0
    case "subscribers":
      return summary.totals.subscribersGained !== 0
    case "ctr":
      return summary.averages.ctr > 0
    case "impressions":
      return topRows.some((row) => row.ctr > 0)
    case "likes":
      return topRows.some((row) => row.likes > 0)
    case "comments":
      return topRows.some((row) => row.comments > 0)
    case "shares":
      return topRows.some((row) => row.shares > 0)
    case "avd":
      return summary.averages.avd > 0
    case "avp":
      return summary.averages.avp > 0
    case "engagedViews":
      return topRows.some((row) => row.views > 0 && row.avp > 0)
    case "country":
      return topRows.length > 0
    case "device":
      return topRows.length > 0
    case "trafficSource":
      return analytics.timelineSeries.length > 0
    case "contentType":
      return analytics.formatBreakdown.length > 0
    default:
      return false
  }
}

export interface ChartCapabilityStatus40 {
  readiness: ChartReadiness40
  missingHard: MetricKey40[]
  missingSoft: MetricKey40[]
}

export const evaluateChartCapability40 = (
  chart: ChartSpec40,
  analytics: CanonicalAnalyticsView,
): ChartCapabilityStatus40 => {
  const missingHard = chart.requiredMetricsHard.filter((metric) => !hasMetric(analytics, metric))
  const missingSoft = chart.requiredMetricsSoft.filter((metric) => !hasMetric(analytics, metric))

  if (missingHard.length > 0) {
    return {
      readiness: "unavailable",
      missingHard,
      missingSoft,
    }
  }

  if (missingSoft.length > 0) {
    return {
      readiness: "limited",
      missingHard,
      missingSoft,
    }
  }

  return {
    readiness: "ready",
    missingHard,
    missingSoft,
  }
}

