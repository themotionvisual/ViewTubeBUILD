import type { ChartCardSize, ChartClassKey } from "../referenceStudio/chartSystem"

export type ChartPack40 =
  | "revenue"
  | "growth"
  | "retention"
  | "audience"
  | "packaging"
  | "experimental"

export type MetricKey40 =
  | "views"
  | "watchHours"
  | "revenue"
  | "subscribers"
  | "ctr"
  | "impressions"
  | "likes"
  | "comments"
  | "shares"
  | "avd"
  | "avp"
  | "engagedViews"
  | "country"
  | "device"
  | "trafficSource"
  | "contentType"

export type ChartReadiness40 = "ready" | "limited" | "unavailable"

export type ChartInsightType40 = "hero" | "wide" | "small" | "experimental"

export interface ChartSpec40 {
  id: string
  title: string
  sizeClass: ChartCardSize
  pack: ChartPack40
  rendererKey: ChartClassKey
  requiredMetricsHard: MetricKey40[]
  requiredMetricsSoft: MetricKey40[]
  insightType: ChartInsightType40
  standalone: boolean
}

export const CHART_PACK_LABELS_40: Record<ChartPack40, string> = {
  revenue: "Revenue Pack",
  growth: "Growth Pack",
  retention: "Retention Pack",
  audience: "Audience Pack",
  packaging: "Packaging / Discovery Pack",
  experimental: "Experimental Insights Pack",
}

export const CHART_SPECS_40: ChartSpec40[] = [
  { id: "video-value-matrix", title: "Video Value Matrix", sizeClass: "half", pack: "packaging", rendererKey: "bubble", requiredMetricsHard: ["ctr", "views", "avp"], requiredMetricsSoft: ["impressions", "contentType"], insightType: "hero", standalone: true },
  { id: "algorithm-trigger-matrix", title: "Algorithm Trigger Matrix", sizeClass: "half", pack: "packaging", rendererKey: "scatter", requiredMetricsHard: ["ctr", "impressions"], requiredMetricsSoft: ["views"], insightType: "hero", standalone: true },
  { id: "top-performers-trio", title: "Top Performers Trio", sizeClass: "full", pack: "revenue", rendererKey: "donut", requiredMetricsHard: ["revenue", "watchHours", "subscribers"], requiredMetricsSoft: ["contentType"], insightType: "hero", standalone: true },
  { id: "global-footprint", title: "Global Footprint", sizeClass: "half", pack: "audience", rendererKey: "geo", requiredMetricsHard: ["views", "country"], requiredMetricsSoft: ["revenue"], insightType: "hero", standalone: true },
  { id: "discovery-radar", title: "Discovery Radar", sizeClass: "half", pack: "packaging", rendererKey: "steppedArea", requiredMetricsHard: ["views", "trafficSource"], requiredMetricsSoft: ["watchHours"], insightType: "hero", standalone: true },
  { id: "golden-ratio-dashboard", title: "Golden Ratio Dashboard", sizeClass: "third", pack: "experimental", rendererKey: "gauge", requiredMetricsHard: ["ctr", "avp", "views"], requiredMetricsSoft: ["watchHours", "subscribers"], insightType: "hero", standalone: true },
  { id: "retention-triangle", title: "Retention Triangle", sizeClass: "half", pack: "retention", rendererKey: "bubble", requiredMetricsHard: ["views", "avd"], requiredMetricsSoft: ["avp", "contentType"], insightType: "hero", standalone: true },
  { id: "geo-high-cpm", title: "Geography of High CPMs", sizeClass: "half", pack: "revenue", rendererKey: "maps", requiredMetricsHard: ["country", "revenue"], requiredMetricsSoft: ["views"], insightType: "hero", standalone: true },
  { id: "engagement-scatter", title: "Engagement Scatter", sizeClass: "half", pack: "audience", rendererKey: "scatter", requiredMetricsHard: ["likes", "comments"], requiredMetricsSoft: ["shares", "views"], insightType: "hero", standalone: true },
  { id: "viral-trajectory", title: "Viral Trajectory", sizeClass: "half", pack: "growth", rendererKey: "line", requiredMetricsHard: ["views", "day"], requiredMetricsSoft: ["ctr", "impressions"], insightType: "hero", standalone: true },

  { id: "views-revenue-dual", title: "Views + Revenue Dual Timeline", sizeClass: "full", pack: "revenue", rendererKey: "combo", requiredMetricsHard: ["views", "revenue", "day"], requiredMetricsSoft: ["watchHours"], insightType: "wide", standalone: false },
  { id: "subs-ctr-dual", title: "Subscribers + CTR Dual Timeline", sizeClass: "full", pack: "growth", rendererKey: "trendlines", requiredMetricsHard: ["subscribers", "ctr", "day"], requiredMetricsSoft: ["impressions"], insightType: "wide", standalone: false },
  { id: "daily-performance-stack", title: "Daily Performance Stack", sizeClass: "half", pack: "growth", rendererKey: "area", requiredMetricsHard: ["views", "watchHours", "day"], requiredMetricsSoft: ["revenue"], insightType: "wide", standalone: false },
  { id: "seasonal-rpm-pulse", title: "Seasonal RPM Pulse", sizeClass: "half", pack: "revenue", rendererKey: "line", requiredMetricsHard: ["revenue", "views", "day"], requiredMetricsSoft: ["watchHours"], insightType: "wide", standalone: false },
  { id: "ad-format-dominance", title: "Ad Format Dominance Over Time", sizeClass: "half", pack: "revenue", rendererKey: "area", requiredMetricsHard: ["revenue", "day"], requiredMetricsSoft: ["contentType"], insightType: "wide", standalone: false },
  { id: "premium-standard-monetization", title: "Premium vs Standard Monetization", sizeClass: "half", pack: "revenue", rendererKey: "bar", requiredMetricsHard: ["revenue", "views"], requiredMetricsSoft: ["watchHours"], insightType: "wide", standalone: false },
  { id: "viewer-loyalty-index", title: "Viewer Loyalty Index", sizeClass: "half", pack: "audience", rendererKey: "combo", requiredMetricsHard: ["views", "watchHours", "day"], requiredMetricsSoft: ["avd"], insightType: "wide", standalone: false },
  { id: "publish-time-momentum", title: "Publish Time vs Momentum Heatmap", sizeClass: "half", pack: "growth", rendererKey: "calendar", requiredMetricsHard: ["views", "day"], requiredMetricsSoft: ["ctr"], insightType: "wide", standalone: false },
  { id: "best-upload-grid", title: "Best Upload Day/Hour Grid", sizeClass: "half", pack: "growth", rendererKey: "calendar", requiredMetricsHard: ["views", "day"], requiredMetricsSoft: ["watchHours"], insightType: "wide", standalone: false },
  { id: "source-retention-timeline", title: "Source-Specific Retention Timeline", sizeClass: "half", pack: "retention", rendererKey: "steppedArea", requiredMetricsHard: ["trafficSource", "avd"], requiredMetricsSoft: ["views"], insightType: "wide", standalone: false },
  { id: "thumbnail-ab-pulse", title: "Thumbnail A/B Pulse Timeline", sizeClass: "half", pack: "packaging", rendererKey: "line", requiredMetricsHard: ["ctr", "impressions", "day"], requiredMetricsSoft: ["views"], insightType: "wide", standalone: false },
  { id: "momentum-tracker", title: "Momentum Tracker", sizeClass: "half", pack: "growth", rendererKey: "diff", requiredMetricsHard: ["views", "day"], requiredMetricsSoft: ["watchHours", "subscribers"], insightType: "wide", standalone: false },

  { id: "packaging-score-tile", title: "Packaging Score Tile", sizeClass: "third", pack: "packaging", rendererKey: "gauge", requiredMetricsHard: ["ctr", "impressions", "avp"], requiredMetricsSoft: ["views"], insightType: "small", standalone: false },
  { id: "title-stats-mini", title: "Title Stats Mini", sizeClass: "third", pack: "packaging", rendererKey: "histogram", requiredMetricsHard: ["views", "ctr"], requiredMetricsSoft: ["impressions"], insightType: "small", standalone: false },
  { id: "keyword-engine-mini", title: "Keyword Engine Mini", sizeClass: "third", pack: "packaging", rendererKey: "wordtree", requiredMetricsHard: ["views"], requiredMetricsSoft: ["likes", "comments"], insightType: "small", standalone: false },
  { id: "device-immersion-mini", title: "Device Immersion Mini", sizeClass: "third", pack: "audience", rendererKey: "bar", requiredMetricsHard: ["device", "views"], requiredMetricsSoft: ["avd"], insightType: "small", standalone: false },
  { id: "os-revenue-mix-mini", title: "OS Revenue Mix Mini", sizeClass: "third", pack: "audience", rendererKey: "pie", requiredMetricsHard: ["device", "revenue"], requiredMetricsSoft: ["views"], insightType: "small", standalone: false },
  { id: "content-breakdown-mini", title: "Content Breakdown Mini", sizeClass: "third", pack: "growth", rendererKey: "donut", requiredMetricsHard: ["contentType", "views"], requiredMetricsSoft: ["watchHours"], insightType: "small", standalone: false },
  { id: "duration-sweet-spot-mini", title: "Duration Sweet Spot Mini", sizeClass: "third", pack: "retention", rendererKey: "scatter", requiredMetricsHard: ["avd", "views"], requiredMetricsSoft: ["watchHours"], insightType: "small", standalone: false },
  { id: "revenue-efficiency-mini", title: "Revenue Efficiency Mini", sizeClass: "third", pack: "revenue", rendererKey: "waterfall", requiredMetricsHard: ["revenue", "watchHours"], requiredMetricsSoft: ["views"], insightType: "small", standalone: false },
  { id: "end-screen-actions-mini", title: "End Screen Actions Mini", sizeClass: "third", pack: "retention", rendererKey: "waterfall", requiredMetricsHard: ["engagedViews", "views"], requiredMetricsSoft: ["subscribers"], insightType: "small", standalone: false },
  { id: "solo-impressions-funnel-mini", title: "Solo Impressions Funnel Mini", sizeClass: "third", pack: "packaging", rendererKey: "waterfall", requiredMetricsHard: ["impressions", "ctr", "views"], requiredMetricsSoft: ["watchHours"], insightType: "small", standalone: false },

  { id: "narrative-dna", title: "Narrative DNA", sizeClass: "half", pack: "experimental", rendererKey: "vega", requiredMetricsHard: ["views", "watchHours", "likes"], requiredMetricsSoft: ["comments", "shares"], insightType: "experimental", standalone: false },
  { id: "hook-to-binge-funnel", title: "Hook-to-Binge Funnel", sizeClass: "half", pack: "retention", rendererKey: "waterfall", requiredMetricsHard: ["views", "engagedViews", "avd"], requiredMetricsSoft: ["subscribers"], insightType: "experimental", standalone: false },
  { id: "playback-cpm-density", title: "Playback CPM vs Ad Impression Density", sizeClass: "half", pack: "revenue", rendererKey: "scatter", requiredMetricsHard: ["revenue", "impressions", "views"], requiredMetricsSoft: ["watchHours"], insightType: "experimental", standalone: false },
  { id: "interaction-density-index", title: "Interaction Density Index", sizeClass: "half", pack: "audience", rendererKey: "bar", requiredMetricsHard: ["likes", "comments", "views"], requiredMetricsSoft: ["shares", "subscribers"], insightType: "experimental", standalone: false },
  { id: "long-tail-shelf-life", title: "Long-Tail Shelf Life Curve", sizeClass: "half", pack: "retention", rendererKey: "line", requiredMetricsHard: ["views", "day"], requiredMetricsSoft: ["watchHours", "trafficSource"], insightType: "experimental", standalone: false },
  { id: "series-consistency-box", title: "Series Consistency Box Plot", sizeClass: "half", pack: "experimental", rendererKey: "intervals", requiredMetricsHard: ["views", "watchHours"], requiredMetricsSoft: ["revenue"], insightType: "experimental", standalone: false },
  { id: "audience-overlap-live-vod-shorts", title: "Audience Overlap (Live vs VOD vs Shorts)", sizeClass: "half", pack: "audience", rendererKey: "sankey", requiredMetricsHard: ["contentType", "views"], requiredMetricsSoft: ["watchHours", "subscribers"], insightType: "experimental", standalone: false },
  { id: "conversion-power-of-views", title: "Conversion Power of Views", sizeClass: "half", pack: "growth", rendererKey: "scatter", requiredMetricsHard: ["views", "subscribers"], requiredMetricsSoft: ["ctr"], insightType: "experimental", standalone: false },
]
