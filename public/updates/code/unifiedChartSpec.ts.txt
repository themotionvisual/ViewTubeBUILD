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
 chartType: string;
 headerColorClass: string;
 rendererFamily: UnifiedRendererFamily;
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
   chartType: "TopPerformersTrio",
   headerColorClass: "bg-[#00CCFF]",
   rendererFamily: "GoogleChart",
   axisHints: ["rank", "video"],
   metricHints: ["revenue", "watch time", "subscribers gained"],
  },
  "video-value-matrix": {
   id: "video-value-matrix",
   title: "Video Value Matrix",
   subtitle: "CTR x Retention x Views",
   chartType: "BubbleChart",
   headerColorClass: "bg-[#FF3399]",
   rendererFamily: "GoogleChart",
   axisHints: ["ctr", "retention"],
   metricHints: ["impressions", "views", "ctr", "avp"],
  },
  "shorts-retention": {
   id: "shorts-retention",
   title: "Shorts Retention",
   subtitle: "AVD% x Duration",
   chartType: "ScatterChart",
   headerColorClass: "bg-[#CCFF00]",
   rendererFamily: "GoogleChart",
   axisHints: ["duration", "avg % viewed"],
   metricHints: ["avd", "avp", "watch time"],
  },
  packaging: {
   id: "packaging",
   title: "Packaging",
   subtitle: "CTR x Impressions",
   chartType: "BubbleChart",
   headerColorClass: "bg-[#FFDD00]",
   rendererFamily: "GoogleChart",
   axisHints: ["impressions", "ctr"],
   metricHints: ["ctr", "impressions", "views"],
  },
  "engagement-map": {
   id: "engagement-map",
   title: "Engagement Map",
   subtitle: "Top 50 Recent by Likes",
   chartType: "LineChart",
   headerColorClass: "bg-[#FFB158]",
   rendererFamily: "GoogleChart",
   axisHints: ["videos (sorted)", "engagement metrics"],
   metricHints: ["likes", "comments", "shares", "subscribers"],
  },
  "keyword-engine": {
   id: "keyword-engine",
   title: "Keyword Engine",
   subtitle: "Title Words x Performance",
   chartType: "BarChart",
   headerColorClass: "bg-[#FF7497]",
   rendererFamily: "GoogleChart",
   axisHints: ["keyword", "avg views"],
   metricHints: ["views", "title words"],
  },
  "performance-stack": {
   id: "performance-stack",
   title: "Performance Stack",
   subtitle: "Viral DNA Pulse",
   chartType: "SteppedAreaChart",
   headerColorClass: "bg-[#B14AED]",
   rendererFamily: "GoogleChart",
   axisHints: ["video", "stacked metrics"],
   metricHints: ["views", "ctr", "retention"],
  },
  "algorithm-trigger": {
   id: "algorithm-trigger",
   title: "Algorithm Trigger",
   subtitle: "Impressions x CTR Momentum",
   chartType: "ScatterChart",
   headerColorClass: "bg-[#00CCFF]",
   rendererFamily: "Custom",
   axisHints: ["ctr", "impressions"],
   metricHints: ["ctr", "impressions", "views"],
  },
  "device-immersion": {
   id: "device-immersion",
   title: "Device Immersion",
   subtitle: "Consumption Environment",
   chartType: "BarChart",
   headerColorClass: "bg-[#FFB158]",
   rendererFamily: "Custom",
   axisHints: ["device", "share"],
   metricHints: ["views", "watch time"],
  },
  "global-footprint": {
   id: "global-footprint",
   title: "Global Footprint",
   subtitle: "Regional Distribution",
   chartType: "GeoChart",
   headerColorClass: "bg-[#B14AED]",
   rendererFamily: "Custom",
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
