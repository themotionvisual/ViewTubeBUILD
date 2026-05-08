import type { CanonicalAnalyticsView } from "../referenceStudio/useCanonicalAnalytics"

export interface PromotionSnapshot {
  totalRows: number
  topRows: number
  totals: {
    views: number
    watchHours: number
    revenue: number
    subscribers: number
  }
}

export const buildPromotionSnapshot = (
  analytics: CanonicalAnalyticsView,
): PromotionSnapshot => {
  const totals = analytics.topRows.reduce(
    (acc, row) => {
      acc.views += row.views
      acc.watchHours += row.watchHours
      acc.revenue += row.revenue
      acc.subscribers += row.subscribers
      return acc
    },
    { views: 0, watchHours: 0, revenue: 0, subscribers: 0 },
  )

  return {
    totalRows: analytics.rows.length,
    topRows: analytics.topRows.length,
    totals,
  }
}
