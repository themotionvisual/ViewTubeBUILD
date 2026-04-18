export type WidgetPromotionState = "prototype" | "ready-for-prod" | "needs-backend"

export type WidgetDataDependency =
 | "youtube_data_v3"
 | "youtube_analytics_v2"
 | "youtube_reporting"
 | "google_search_console"
 | "csv"
 | "google_sheets"
 | "none"

export interface WidgetBackendStatus {
 state: WidgetPromotionState
 dependencies: WidgetDataDependency[]
 fallbackMode: "mock" | "canonical_selectors" | "csv_only" | "hybrid"
 notes: string
}

export interface WidgetSpec {
 id: string
 title: string
 category: "dashboard-core" | "growth" | "distribution" | "ops" | "audio" | "community"
 source: "widget-preview"
 status: WidgetBackendStatus
}

export const WIDGET_LAB_SPECS: WidgetSpec[] = [
 {
  id: "milestone",
  title: "Milestone Tracker",
  category: "dashboard-core",
  source: "widget-preview",
  status: {
   state: "ready-for-prod",
   dependencies: ["youtube_analytics_v2", "csv", "google_sheets"],
   fallbackMode: "hybrid",
   notes: "Progress-bar logic validated in preview; ready for typed widget conversion.",
  },
 },
 {
  id: "engagement-grade",
  title: "Engagement Grade",
  category: "growth",
  source: "widget-preview",
  status: {
   state: "ready-for-prod",
   dependencies: ["youtube_analytics_v2", "csv", "google_sheets"],
   fallbackMode: "hybrid",
   notes: "A+/grade card maps cleanly to canonical summary metrics.",
  },
 },
 {
  id: "consistency-heatmap",
  title: "Consistency Heatmap",
  category: "dashboard-core",
  source: "widget-preview",
  status: {
   state: "ready-for-prod",
   dependencies: ["youtube_data_v3", "youtube_analytics_v2", "csv", "google_sheets"],
   fallbackMode: "hybrid",
   notes: "Long/Short/Both color semantics locked and should be preserved.",
  },
 },
 {
  id: "audience-stack",
  title: "Audience Stack",
  category: "distribution",
  source: "widget-preview",
  status: {
   state: "needs-backend",
   dependencies: ["youtube_data_v3", "google_search_console"],
   fallbackMode: "mock",
   notes: "Cross-platform audience totals require external connectors.",
  },
 },
 {
  id: "settings-brutalist",
  title: "Settings Brutalist",
  category: "ops",
  source: "widget-preview",
  status: {
   state: "prototype",
   dependencies: ["none"],
   fallbackMode: "mock",
   notes: "Keep as UX prototype while settings schema stabilizes.",
  },
 },
 {
  id: "reddit-strategist",
  title: "Reddit Strategist",
  category: "distribution",
  source: "widget-preview",
  status: {
   state: "needs-backend",
   dependencies: ["google_search_console", "csv"],
   fallbackMode: "mock",
   notes: "Requires policy-safe outbound posting workflow and draft queue.",
  },
 },
 {
  id: "audiophonic-engine",
  title: "Audiophonic Engine",
  category: "audio",
  source: "widget-preview",
  status: {
   state: "needs-backend",
   dependencies: ["none"],
   fallbackMode: "mock",
   notes: "Awaiting audio processing service selection and vault persistence.",
  },
 },
 {
  id: "thumbnail-ab",
  title: "Thumbnail A/B Simulator",
  category: "growth",
  source: "widget-preview",
  status: {
   state: "prototype",
   dependencies: ["youtube_analytics_v2", "csv"],
   fallbackMode: "mock",
   notes: "Great concept; needs deterministic visual-attention scoring backend.",
  },
 },
 {
  id: "copyright-risk",
  title: "Copyright Risk Scan",
  category: "ops",
  source: "widget-preview",
  status: {
   state: "needs-backend",
   dependencies: ["none"],
   fallbackMode: "mock",
   notes: "Oscilloscope UX validated; actual matching service not wired.",
  },
 },
 {
  id: "community-architect",
  title: "Community Post Architect",
  category: "community",
  source: "widget-preview",
  status: {
   state: "prototype",
   dependencies: ["youtube_data_v3", "youtube_analytics_v2"],
   fallbackMode: "mock",
   notes: "Poll-style card ready for integration with post generator.",
  },
 },
]
