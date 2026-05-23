import type { CsvMajorFamily } from "../types"
import { CSV_MAJOR_FAMILY_STYLES } from "./csvTaxonomy"

export type ChannelDataSourceGuideRow = {
 id: string
 title: string
 bestFor: string
 needsLogin: "Yes" | "No" | "Optional"
 speed: "Fast" | "Medium" | "Delayed" | "Manual"
 adds: string
 whenToUse: string
}

export type ChannelDataGuideAvailability =
 | "api"
 | "public"
 | "reporting"
 | "csv_only"

export type ChannelDataGuideEntry = {
 id: string
 title: string
 majorFamily: CsvMajorFamily
 breakdownLabel: string
 recommendedDateWindows: string[]
 metrics: string[]
 availability: ChannelDataGuideAvailability[]
 uploadRecommendation: "Upload ZIP" | "Upload folder" | "Single CSV works, but weaker detection"
 needsCsv: boolean
 notes: string
 children?: ChannelDataGuideEntry[]
}

export type ChannelDataGuideFamily = {
 id: string
 title: string
 majorFamily: CsvMajorFamily
 rows: ChannelDataGuideEntry[]
}

export const CHANNEL_DATA_SOURCE_GUIDE: ChannelDataSourceGuideRow[] = [
 {
  id: "fast_api_sync",
  title: "Fast API Sync",
  bestFor: "Core video metrics, daily metrics, traffic, audience, and geography.",
  needsLogin: "Yes",
  speed: "Fast",
  adds: "The quickest hard-number sync path for charts and most table rows.",
  whenToUse: "Use first when you want channel data loaded directly from connected YouTube analytics.",
 },
 {
  id: "public_channel_video_data",
  title: "Public Channel / Video Data",
  bestFor: "Channel metadata, video metadata, and public lifetime counts.",
  needsLogin: "No",
  speed: "Fast",
  adds: "Public views, subscriber count, video count, titles, and identifiers.",
  whenToUse: "Useful when connected analytics is missing or when only public channel data is available.",
 },
 {
  id: "reporting_bulk_history",
  title: "Reporting / Bulk History",
  bestFor: "Broad warehouse-style history and slower deep exports.",
  needsLogin: "Yes",
  speed: "Delayed",
  adds: "Large bulk report families and deeper historical coverage once reporting jobs are ready.",
  whenToUse: "Use when you want breadth over speed. First report availability can take up to 48 hours.",
 },
 {
  id: "csv_uploads",
  title: "CSV Uploads",
  bestFor: "Studio-only metrics, exact breakdown exports, and upload-based enrichment.",
  needsLogin: "Optional",
  speed: "Manual",
  adds: "Impressions, CTR, stayed to watch, retention variants, and breakdown-specific table shapes.",
  whenToUse: "Use when the fast sync path does not expose the exact metrics or breakdown you need.",
 },
]

export const CHANNEL_DATA_DOWNLOAD_STEPS: string[] = [
 "Open YouTube Studio.",
 "Go to Analytics.",
 "Switch to Advanced mode.",
 "Choose the date range first.",
 "Choose the breakdown type you want to export.",
 "Choose or confirm the metrics shown in the table.",
 "Download the CSV or Google Sheets export from the top right.",
 "Prefer uploading the ZIP or full extracted folder into ViewTube.",
]

export const CHANNEL_DATA_MISSING_REASON_NOTES: string[] = [
 "Impressions, click-through rate, and stayed-to-watch percentages often require CSV uploads.",
 "New, casual, regular, and returning viewer stats are limited by YouTube's retention window.",
 "Some traffic source detail tables are not available from the fast API sync path and may need CSV or reporting exports.",
]

const contentRows: ChannelDataGuideEntry[] = [
 {
  id: "content_all",
  title: "All Videos",
  majorFamily: "video_data",
  breakdownLabel: "Content",
  recommendedDateWindows: ["Lifetime", "365 days", "90 days", "28 days", "7 days"],
  metrics: ["Views", "Engaged views", "Watch time", "Revenue", "Subscribers", "Average view duration"],
  availability: ["api", "public", "csv_only"],
  uploadRecommendation: "Upload ZIP",
  needsCsv: false,
  notes: "Best baseline export for matching uploaded content rows to synced channel video data.",
 },
 {
  id: "content_shorts",
  title: "Shorts",
  majorFamily: "video_data",
  breakdownLabel: "Content",
  recommendedDateWindows: ["Lifetime", "365 days", "90 days", "28 days", "7 days"],
  metrics: ["Views", "Engaged views", "Stayed to watch", "Watch time", "Subscribers"],
  availability: ["api", "csv_only"],
  uploadRecommendation: "Upload ZIP",
  needsCsv: true,
  notes: "Stayed-to-watch percentages are commonly CSV-enriched.",
 },
 {
  id: "content_long_form",
  title: "Long-form",
  majorFamily: "video_data",
  breakdownLabel: "Content",
  recommendedDateWindows: ["Lifetime", "365 days", "90 days", "28 days", "7 days"],
  metrics: ["Views", "Impressions", "CTR", "Watch time", "End screen rates", "Card rates"],
  availability: ["api", "csv_only"],
  uploadRecommendation: "Upload ZIP",
  needsCsv: true,
  notes: "Impressions and CTR often need CSV uploads to match Studio output.",
 },
 {
  id: "content_type",
  title: "Content type",
  majorFamily: "video_data",
  breakdownLabel: "Content type",
  recommendedDateWindows: ["Lifetime", "365 days", "90 days", "28 days", "7 days"],
  metrics: ["Engaged views", "Views", "Watch time", "Average view duration", "Subscribers"],
  availability: ["api", "csv_only"],
  uploadRecommendation: "Upload ZIP",
  needsCsv: false,
  notes: "Useful for Shorts vs videos vs other high-level format splits.",
 },
]

const dailyRows: ChannelDataGuideEntry[] = [
 {
  id: "daily_channel_metrics",
  title: "Daily Channel Metrics",
  majorFamily: "daily_metrics",
  breakdownLabel: "Date",
  recommendedDateWindows: ["Lifetime", "365 days", "90 days", "28 days", "7 days", "Custom"],
  metrics: ["Views", "Engaged views", "Watch time", "Revenue", "Subscribers", "Average view duration"],
  availability: ["api", "csv_only"],
  uploadRecommendation: "Upload ZIP",
  needsCsv: false,
  notes: "Use date-based exports when you need the exact daily table shape from YouTube Studio or want to verify the synced day-by-day channel history.",
 },
]

const trafficRows: ChannelDataGuideEntry[] = [
 {
  id: "traffic_overview",
  title: "Overview",
  majorFamily: "traffic",
  breakdownLabel: "Traffic source",
  recommendedDateWindows: ["Lifetime", "365 days", "90 days", "28 days", "7 days"],
  metrics: ["Views", "Watch time", "Average view duration", "Impressions", "CTR"],
  availability: ["api", "reporting", "csv_only"],
  uploadRecommendation: "Upload ZIP",
  needsCsv: true,
  notes: "Best traffic export for impressions, CTR, and source totals.",
 },
 {
  id: "traffic_search",
  title: "YouTube Search",
  majorFamily: "traffic",
  breakdownLabel: "Traffic source",
  recommendedDateWindows: ["Lifetime", "365 days", "90 days", "28 days", "7 days"],
  metrics: ["Search terms", "Views", "Watch time", "Average view duration"],
  availability: ["api", "reporting", "csv_only"],
  uploadRecommendation: "Upload ZIP",
  needsCsv: false,
  notes: "Search-term detail is often easiest to preserve through the CSV package.",
 },
 {
  id: "traffic_external",
  title: "External",
  majorFamily: "traffic",
  breakdownLabel: "Traffic source",
  recommendedDateWindows: ["Lifetime", "365 days", "90 days", "28 days", "7 days"],
  metrics: ["External source title", "Views", "Watch time", "Average view duration"],
  availability: ["api", "reporting", "csv_only"],
  uploadRecommendation: "Upload ZIP",
  needsCsv: false,
  notes: "Good for exact referring domains and external source tables.",
 },
 {
  id: "traffic_suggested",
  title: "Suggested Videos",
  majorFamily: "traffic",
  breakdownLabel: "Traffic source",
  recommendedDateWindows: ["Lifetime", "365 days", "90 days", "28 days", "7 days"],
  metrics: ["Suggested video title", "Views", "Watch time", "Average view duration"],
  availability: ["api", "reporting", "csv_only"],
  uploadRecommendation: "Upload ZIP",
  needsCsv: false,
  notes: "Useful when you need title-level suggested source detail.",
 },
 {
  id: "traffic_shorts_feed",
  title: "Shorts Feed",
  majorFamily: "traffic",
  breakdownLabel: "Traffic source",
  recommendedDateWindows: ["Lifetime", "365 days", "90 days", "28 days", "7 days"],
  metrics: ["Shorts content link", "Views", "Watch time", "Average view duration"],
  availability: ["api", "csv_only"],
  uploadRecommendation: "Upload ZIP",
  needsCsv: false,
  notes: "Often needed for Shorts-linked traffic detail.",
 },
 {
  id: "traffic_youtube_features",
  title: "YouTube Features / Pages",
  majorFamily: "traffic",
  breakdownLabel: "Traffic source",
  recommendedDateWindows: ["Lifetime", "365 days", "90 days", "28 days", "7 days"],
  metrics: ["Browse features", "Channel pages", "Other YouTube features", "Views", "Watch time"],
  availability: ["api", "csv_only"],
  uploadRecommendation: "Upload ZIP",
  needsCsv: false,
  notes: "Good for page-level and browse traffic comparisons.",
 },
]

const geographyRows: ChannelDataGuideEntry[] = [
 {
  id: "geography_countries",
  title: "Countries",
  majorFamily: "geography",
  breakdownLabel: "Geography",
  recommendedDateWindows: ["Lifetime", "365 days", "90 days", "28 days", "7 days"],
  metrics: ["Views", "Watch time", "Average view duration", "Revenue"],
  availability: ["api", "reporting", "csv_only"],
  uploadRecommendation: "Upload ZIP",
  needsCsv: false,
  notes: "Country-level geography is one of the main synced hard-number views.",
 },
 {
  id: "geography_cities",
  title: "Cities",
  majorFamily: "geography",
  breakdownLabel: "Cities",
  recommendedDateWindows: ["365 days", "90 days", "28 days", "7 days"],
  metrics: ["Views", "Watch time", "Average view duration"],
  availability: ["api", "csv_only"],
  uploadRecommendation: "Upload ZIP",
  needsCsv: false,
  notes: "City exports are more specific and useful for deeper geography drilldowns.",
 },
]

const audienceRows: ChannelDataGuideEntry[] = [
 {
  id: "audience_age",
  title: "Age",
  majorFamily: "audience",
  breakdownLabel: "Audience",
  recommendedDateWindows: ["90 days", "28 days", "7 days"],
  metrics: ["Views %", "Watch time %", "Average view duration"],
  availability: ["api", "csv_only"],
  uploadRecommendation: "Upload ZIP",
  needsCsv: false,
  notes: "Age splits are often easier to verify from CSV exports.",
 },
 {
  id: "audience_gender",
  title: "Gender",
  majorFamily: "audience",
  breakdownLabel: "Audience",
  recommendedDateWindows: ["90 days", "28 days", "7 days"],
  metrics: ["Views %", "Watch time %", "Average view duration"],
  availability: ["api", "csv_only"],
  uploadRecommendation: "Upload ZIP",
  needsCsv: false,
  notes: "Gender exports usually mirror the age export format.",
 },
 {
  id: "audience_age_gender",
  title: "Age × Gender",
  majorFamily: "audience",
  breakdownLabel: "Audience",
  recommendedDateWindows: ["90 days", "28 days", "7 days"],
  metrics: ["Views %", "Watch time %", "Average view duration"],
  availability: ["api", "csv_only"],
  uploadRecommendation: "Upload ZIP",
  needsCsv: false,
  notes: "Combined demographic splits are most reliable when preserved from CSV.",
 },
 {
  id: "audience_new_returning",
  title: "New / Returning",
  majorFamily: "audience",
  breakdownLabel: "Audience",
  recommendedDateWindows: ["90 days"],
  metrics: ["New viewers", "Returning viewers", "Casual viewers", "Regular viewers"],
  availability: ["csv_only"],
  uploadRecommendation: "Upload ZIP",
  needsCsv: true,
  notes: "These viewer classifications are limited by YouTube's shorter rolling retention windows.",
 },
 {
  id: "audience_watch_behavior",
  title: "Watch behavior",
  majorFamily: "audience",
  breakdownLabel: "Audience",
  recommendedDateWindows: ["90 days", "28 days", "7 days"],
  metrics: ["Subscribers", "Non-subscribers", "Organic", "Paid", "Watch time"],
  availability: ["csv_only"],
  uploadRecommendation: "Upload ZIP",
  needsCsv: true,
  notes: "Behavior-based audience exports are primarily upload-driven.",
 },
 {
  id: "audience_devices",
  title: "Devices",
  majorFamily: "audience",
  breakdownLabel: "Device type",
  recommendedDateWindows: ["Lifetime", "365 days", "90 days", "28 days", "7 days"],
  metrics: ["Views", "Watch time", "Average view duration"],
  availability: ["api", "reporting", "csv_only"],
  uploadRecommendation: "Upload ZIP",
  needsCsv: false,
  notes: "Device and operating-system splits can come from API or reporting, but CSV keeps Studio parity.",
 },
 {
  id: "audience_retention",
  title: "Retention",
  majorFamily: "audience",
  breakdownLabel: "Audience retention",
  recommendedDateWindows: ["Lifetime", "90 days", "28 days", "7 days"],
  metrics: ["Absolute audience retention", "Relative retention", "Started watching", "Stopped watching"],
  availability: ["csv_only"],
  uploadRecommendation: "Upload ZIP",
  needsCsv: true,
  notes: "Single-video and segment retention exports remain CSV-first.",
 },
]

const surfacesRows: ChannelDataGuideEntry[] = [
 {
  id: "surface_playback_location",
  title: "Playback location",
  majorFamily: "surfaces_discovery",
  breakdownLabel: "Playback location",
  recommendedDateWindows: ["Lifetime", "365 days", "90 days", "28 days", "7 days"],
  metrics: ["Views", "Watch time", "Average view duration"],
  availability: ["api", "reporting", "csv_only"],
  uploadRecommendation: "Upload folder",
  needsCsv: false,
  notes: "Good for watch page vs embedded playback comparisons.",
 },
 {
  id: "surface_subscription_status",
  title: "Subscription status",
  majorFamily: "surfaces_discovery",
  breakdownLabel: "Audience",
  recommendedDateWindows: ["Lifetime", "365 days", "90 days", "28 days", "7 days"],
  metrics: ["Subscribers", "Views", "Watch time"],
  availability: ["api", "csv_only"],
  uploadRecommendation: "Upload folder",
  needsCsv: false,
  notes: "Useful for subscriber vs non-subscriber performance breakdowns.",
 },
 {
  id: "surface_subscription_source",
  title: "Subscription source",
  majorFamily: "surfaces_discovery",
  breakdownLabel: "Audience",
  recommendedDateWindows: ["365 days", "90 days", "28 days"],
  metrics: ["Subscribers gained", "Subscribers lost"],
  availability: ["csv_only"],
  uploadRecommendation: "Upload folder",
  needsCsv: true,
  notes: "Often only preserved through Studio exports.",
 },
 {
  id: "surface_sharing_service",
  title: "Sharing service",
  majorFamily: "surfaces_discovery",
  breakdownLabel: "Sharing service",
  recommendedDateWindows: ["365 days", "90 days", "28 days", "7 days"],
  metrics: ["Shares", "Views", "Watch time"],
  availability: ["reporting", "csv_only"],
  uploadRecommendation: "Upload folder",
  needsCsv: true,
  notes: "Good for social/share destination breakdowns.",
 },
 {
  id: "surface_playlists",
  title: "Playlists",
  majorFamily: "surfaces_discovery",
  breakdownLabel: "Playlist",
  recommendedDateWindows: ["Lifetime", "365 days", "90 days", "28 days", "7 days"],
  metrics: ["Playlist views", "Playlist watch time", "Views per playlist start"],
  availability: ["api", "reporting", "csv_only"],
  uploadRecommendation: "Upload folder",
  needsCsv: false,
  notes: "Playlist performance can enrich both discovery and revenue interpretation.",
 },
 {
  id: "surface_posts",
  title: "Posts",
  majorFamily: "surfaces_discovery",
  breakdownLabel: "Post",
  recommendedDateWindows: ["90 days", "28 days", "7 days"],
  metrics: ["Views", "Clicks", "Engagement"],
  availability: ["csv_only"],
  uploadRecommendation: "Upload folder",
  needsCsv: true,
  notes: "Community-post analytics are Studio-first today.",
 },
 {
  id: "surface_cards",
  title: "Cards",
  majorFamily: "surfaces_discovery",
  breakdownLabel: "Cards",
  recommendedDateWindows: ["Lifetime", "365 days", "90 days", "28 days", "7 days"],
  metrics: ["Card impressions", "Card clicks", "Card click-through rate"],
  availability: ["api", "reporting", "csv_only"],
  uploadRecommendation: "Upload folder",
  needsCsv: false,
  notes: "Card-type detail is often easier to preserve from CSV or reporting.",
 },
 {
  id: "surface_end_screens",
  title: "End screens",
  majorFamily: "surfaces_discovery",
  breakdownLabel: "End screens",
  recommendedDateWindows: ["Lifetime", "365 days", "90 days", "28 days", "7 days"],
  metrics: ["End screen impressions", "End screen clicks", "End screen click-through rate"],
  availability: ["api", "reporting", "csv_only"],
  uploadRecommendation: "Upload folder",
  needsCsv: false,
  notes: "Useful for long-form CTA performance.",
 },
 {
  id: "surface_subtitles_cc",
  title: "Subtitles / CC",
  majorFamily: "surfaces_discovery",
  breakdownLabel: "Subtitles / CC",
  recommendedDateWindows: ["365 days", "90 days", "28 days", "7 days"],
  metrics: ["Views", "Watch time", "Language usage"],
  availability: ["reporting", "csv_only"],
  uploadRecommendation: "Upload folder",
  needsCsv: true,
  notes: "Subtitle and translation usage remain specialized exports.",
 },
 {
  id: "surface_translation_language",
  title: "Translation / language",
  majorFamily: "surfaces_discovery",
  breakdownLabel: "Language",
  recommendedDateWindows: ["365 days", "90 days", "28 days", "7 days"],
  metrics: ["Views", "Watch time", "Language-specific usage"],
  availability: ["csv_only"],
  uploadRecommendation: "Upload folder",
  needsCsv: true,
  notes: "Video language and translated metadata are best captured from Studio CSVs.",
 },
]

const revenueRows: ChannelDataGuideEntry[] = [
 {
  id: "revenue_source",
  title: "Revenue source",
  majorFamily: "revenue_monetization",
  breakdownLabel: "Revenue source",
  recommendedDateWindows: ["Lifetime", "365 days", "90 days", "28 days", "7 days"],
  metrics: ["Estimated revenue", "Estimated ad revenue", "Premium revenue", "RPM"],
  availability: ["api", "csv_only"],
  uploadRecommendation: "Upload ZIP",
  needsCsv: false,
  notes: "Revenue source splits are best used after core metrics are already synced.",
 },
 {
  id: "ad_type",
  title: "Ad type",
  majorFamily: "revenue_monetization",
  breakdownLabel: "Ad type",
  recommendedDateWindows: ["365 days", "90 days", "28 days", "7 days"],
  metrics: ["Ad impressions", "Playback-based CPM", "Estimated ad revenue"],
  availability: ["api", "csv_only"],
  uploadRecommendation: "Upload folder",
  needsCsv: false,
  notes: "Some ad-type detail remains easier to validate through CSV exports.",
 },
]

export const CHANNEL_DATA_GUIDE_FAMILIES: ChannelDataGuideFamily[] = [
 { id: "content", title: "Content", majorFamily: "video_data", rows: contentRows },
 { id: "daily_metrics", title: "Daily Metrics", majorFamily: "daily_metrics", rows: dailyRows },
 { id: "traffic", title: "Traffic", majorFamily: "traffic", rows: trafficRows },
 { id: "geography", title: "Geography", majorFamily: "geography", rows: geographyRows },
 { id: "audience", title: "Audience", majorFamily: "audience", rows: audienceRows },
 {
  id: "surfaces_discovery",
  title: "Surfaces & Discovery",
  majorFamily: "surfaces_discovery",
  rows: surfacesRows,
 },
 {
  id: "revenue_monetization",
  title: "Revenue & Monetization",
  majorFamily: "revenue_monetization",
  rows: revenueRows,
 },
]

export const getChannelDataFamilyStyle = (majorFamily: CsvMajorFamily) =>
 CSV_MAJOR_FAMILY_STYLES[majorFamily]
