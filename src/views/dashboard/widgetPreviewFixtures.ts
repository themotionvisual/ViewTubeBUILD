/**
 * Governed, non-personal preview fixtures for dashboard widgets.
 *
 * These values are deliberately generic. They exist only to demonstrate a
 * widget's visual/interaction model when real creator data is unavailable.
 * Never present them as the connected creator's metrics, comments or advice.
 */

export const SETTINGS_DATA_PREVIEW_ITEMS = [
  { label: "EXAMPLE CHANNEL", value: "Connected creator profile" },
  { label: "EXAMPLE ANALYTICS", value: "Views · CTR · watch time" },
  { label: "EXAMPLE SYNC", value: "Freshness + dataset status" },
] as const

export const SETTINGS_AI_PREVIEW_ITEMS = [
  { label: "EXAMPLE EVIDENCE", value: "Performance + audience signals" },
  { label: "EXAMPLE ADVICE", value: "Prioritized creator action" },
  { label: "EXAMPLE PROJECT CONTEXT", value: "Active content + package state" },
] as const

export const OPPORTUNITY_RADAR_PREVIEW_CANDIDATES = [
  { id: "preview-momentum", title: "Example breakout topic", views: 48000, ageDays: 18, performance: .86, recency: .78, completeness: .75, score: .83 },
  { id: "preview-evergreen", title: "Example evergreen follow-up", views: 33000, ageDays: 122, performance: .67, recency: .44, completeness: 1, score: .65 },
  { id: "preview-refresh", title: "Example refresh candidate", views: 14000, ageDays: 280, performance: .34, recency: .23, completeness: .75, score: .36 },
] as const

export const COMMENT_RESPONDER_PREVIEW = {
  videoTitle: "Example video",
  author: "@sampleviewer",
  comment: "This explanation helped a lot. Could you make a follow-up on the next part?",
  likes: 12,
  replies: 2,
} as const

export const REVENUE_CHART_PREVIEW_WEEKS = [
  { month: "Jan", week: "W1", revenue: 420, grossRevenue: 480 },
  { month: "Jan", week: "W2", revenue: 580, grossRevenue: 640 },
  { month: "Jan", week: "W3", revenue: 760, grossRevenue: 840 },
  { month: "Jan", week: "W4", revenue: 690, grossRevenue: 770 },
  { month: "Feb", week: "W1", revenue: 810, grossRevenue: 900 },
  { month: "Feb", week: "W2", revenue: 930, grossRevenue: 1030 },
] as const
