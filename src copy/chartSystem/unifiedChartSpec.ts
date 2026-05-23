export type UnifiedChartId =
 | "top-performers-trio"
 | "video-value-matrix"
 | "shorts-retention"
 | "packaging"
 | "engagement-map"
 | "keyword-engine"
 | "performance-stack"
 | "algorithm-trigger"
 | "device-immersion"
 | "global-footprint";

export type UnifiedRendererFamily = "GoogleChart" | "Recharts" | "Custom";

export interface UnifiedChartSpec {
 id: UnifiedChartId;
 title: string;
 subtitle: string;
 family: string;
 chartType: string;
 headerColorClass: string;
 rendererFamily: UnifiedRendererFamily;
 metrics: string[];
 axes: string[];
 dataRequirements: string[];
 styleTokens: string[];
 axisHints: string[];
 metricHints: string[];
}

export const CHART_THEME = Object.freeze({
 borderPx: 4,
 heavyBorderPx: 6,
 palette: Object.freeze({
  cyan: "#00CCFF",
  lime: "#CCFF00",
  yellow: "#FFDD00",
  orange: "#FFB158",
  pink: "#FF7497",
  magenta: "#FF3399",
  violet: "#B14AED",
  black: "#000000",
 }),
});

export const RESEARCH_LAB_HEADER_COLORS = Object.freeze([
 CHART_THEME.palette.cyan,
 CHART_THEME.palette.lime,
 CHART_THEME.palette.yellow,
 "#FF9900",
 CHART_THEME.palette.pink,
 CHART_THEME.palette.violet,
]);

export const UNIFIED_CHART_SPECS: Record<UnifiedChartId, UnifiedChartSpec> =
 Object.freeze({
  "top-performers-trio": {
   id: "top-performers-trio",
   title: "Top Performers Trio",
   subtitle: "Combined Insights",
   family: "revenue",
   chartType: "TopPerformersTrio",
   headerColorClass: "bg-[#00CCFF]",
   rendererFamily: "GoogleChart",
   metrics: ["revenue", "watchHours", "subscribers"],
   axes: ["rank", "video"],
   dataRequirements: ["revenue", "watchHours", "subscribers", "contentType"],
   styleTokens: ["#00CCFF", "#CCFF00", "#FFDD00", "#FF3399"],
   axisHints: ["rank", "video"],
   metricHints: ["revenue", "watch time", "subscribers gained"],
  },
  "video-value-matrix": {
   id: "video-value-matrix",
   title: "Video Value Matrix",
   subtitle: "CTR x Retention x Views",
   family: "packaging",
   chartType: "BubbleChart",
   headerColorClass: "bg-[#FF3399]",
   rendererFamily: "GoogleChart",
   metrics: ["ctr", "retention", "views", "impressions"],
   axes: ["ctr", "retention"],
   dataRequirements: ["ctr", "views", "avp", "impressions"],
   styleTokens: ["#FF3399", "#00CCFF", "#CCFF00"],
   axisHints: ["ctr", "retention"],
   metricHints: ["impressions", "views", "ctr", "avp"],
  },
  "shorts-retention": {
   id: "shorts-retention",
   title: "Shorts Retention",
   subtitle: "AVD% x Duration",
   family: "retention",
   chartType: "ScatterChart",
   headerColorClass: "bg-[#CCFF00]",
   rendererFamily: "GoogleChart",
   metrics: ["avd", "avp", "watchHours"],
   axes: ["duration", "avg % viewed"],
   dataRequirements: ["avd", "views", "watchHours"],
   styleTokens: ["#CCFF00", "#00CCFF", "#FF7497"],
   axisHints: ["duration", "avg % viewed"],
   metricHints: ["avd", "avp", "watch time"],
  },
  packaging: {
   id: "packaging",
   title: "Packaging",
   subtitle: "CTR x Impressions",
   family: "packaging",
   chartType: "BubbleChart",
   headerColorClass: "bg-[#FFDD00]",
   rendererFamily: "GoogleChart",
   metrics: ["ctr", "impressions", "views"],
   axes: ["impressions", "ctr"],
   dataRequirements: ["ctr", "impressions", "views"],
   styleTokens: ["#FFDD00", "#FF7497", "#00CCFF"],
   axisHints: ["impressions", "ctr"],
   metricHints: ["ctr", "impressions", "views"],
  },
  "engagement-map": {
   id: "engagement-map",
   title: "Engagement Map",
   subtitle: "Top 50 Recent by Likes",
   family: "audience",
   chartType: "LineChart",
   headerColorClass: "bg-[#FFB158]",
   rendererFamily: "GoogleChart",
   metrics: ["likes", "comments", "shares", "subscribers"],
   axes: ["videos (sorted)", "engagement metrics"],
   dataRequirements: ["likes", "comments", "shares"],
   styleTokens: ["#FFB158", "#FF7497", "#00CCFF"],
   axisHints: ["videos (sorted)", "engagement metrics"],
   metricHints: ["likes", "comments", "shares", "subscribers"],
  },
  "keyword-engine": {
   id: "keyword-engine",
   title: "Keyword Engine",
   subtitle: "Title Words x Performance",
   family: "packaging",
   chartType: "BarChart",
   headerColorClass: "bg-[#FF7497]",
   rendererFamily: "GoogleChart",
   metrics: ["views", "title words"],
   axes: ["keyword", "avg views"],
   dataRequirements: ["views"],
   styleTokens: ["#FF7497", "#00CCFF", "#CCFF00"],
   axisHints: ["keyword", "avg views"],
   metricHints: ["views", "title words"],
  },
  "performance-stack": {
   id: "performance-stack",
   title: "Performance Stack",
   subtitle: "Viral DNA Pulse",
   family: "growth",
   chartType: "SteppedAreaChart",
   headerColorClass: "bg-[#B14AED]",
   rendererFamily: "GoogleChart",
   metrics: ["views", "ctr", "retention"],
   axes: ["video", "stacked metrics"],
   dataRequirements: ["views", "watchHours", "ctr"],
   styleTokens: ["#B14AED", "#00CCFF", "#FF7497"],
   axisHints: ["video", "stacked metrics"],
   metricHints: ["views", "ctr", "retention"],
  },
  "algorithm-trigger": {
   id: "algorithm-trigger",
   title: "Algorithm Trigger",
   subtitle: "Impressions x CTR Momentum",
   family: "packaging",
   chartType: "ScatterChart",
   headerColorClass: "bg-[#00CCFF]",
   rendererFamily: "Custom",
   metrics: ["ctr", "impressions", "views"],
   axes: ["ctr", "impressions"],
   dataRequirements: ["ctr", "impressions"],
   styleTokens: ["#00CCFF", "#FF7497", "#CCFF00"],
   axisHints: ["ctr", "impressions"],
   metricHints: ["ctr", "impressions", "views"],
  },
  "device-immersion": {
   id: "device-immersion",
   title: "Device Immersion",
   subtitle: "Consumption Environment",
   family: "audience",
   chartType: "BarChart",
   headerColorClass: "bg-[#FFB158]",
   rendererFamily: "Custom",
   metrics: ["views", "watch time"],
   axes: ["device", "share"],
   dataRequirements: ["device", "views"],
   styleTokens: ["#FFB158", "#00CCFF", "#CCFF00"],
   axisHints: ["device", "share"],
   metricHints: ["views", "watch time"],
  },
  "global-footprint": {
   id: "global-footprint",
   title: "Global Footprint",
   subtitle: "Regional Distribution",
   family: "audience",
   chartType: "GeoChart",
   headerColorClass: "bg-[#B14AED]",
   rendererFamily: "Custom",
   metrics: ["views", "revenue", "cpm"],
   axes: ["country", "volume"],
   dataRequirements: ["country", "views"],
   styleTokens: ["#B14AED", "#00CCFF", "#FF7497"],
   axisHints: ["country", "volume"],
   metricHints: ["views", "revenue", "cpm"],
  },
 });

const BY_TITLE: Record<string, UnifiedChartSpec> = Object.values(
 UNIFIED_CHART_SPECS,
).reduce((acc, spec) => {
 acc[spec.title.toLowerCase()] = spec;
 return acc;
}, {} as Record<string, UnifiedChartSpec>);

export const getChartSpecById = (id: UnifiedChartId): UnifiedChartSpec =>
 UNIFIED_CHART_SPECS[id];

export const getChartSpecByTitle = (
 title: string,
): UnifiedChartSpec | undefined => BY_TITLE[title.trim().toLowerCase()];
