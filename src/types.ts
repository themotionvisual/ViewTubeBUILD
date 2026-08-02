
// src/types.ts

export type SyncPhase = "IDLE" | "PHASE_1" | "PHASE_2" | "PHASE_3" | "COMPLETE";

export interface RetentionDataPoint {
 elapsedVideoTimeRatio: number
 audienceWatchRatio: number
 relativeRetentionPerformance: number
}


export interface VideoRetentionCache {
 [videoId: string]: RetentionDataPoint[]
}

export type AppTool =
 | "STORYBOARD_STUDIO"
 | "SEO_GENERATOR"
 | "VIDEO_PUBLISHER"
 | "THUMBNAIL_STUDIO"
 | "CHANNELYTICS"
 | "RESEARCH_LAB"
 | "IDEAS_VAULT"
 | "LAUNCH_CALENDAR"

export interface DayTask {
 id: string
 text: string
 completed: boolean
 isPublishEvent?: boolean
 dueDate?: string
}

export const AspectRatio = {
 SQUARE: "1:1",
 PORTRAIT_2_3: "2:3",
 LANDSCAPE_3_2: "3:2",
 PORTRAIT_3_4: "3:4",
 LANDSCAPE_4_3: "4:3",
 PORTRAIT_9_16: "9:16",
 LANDSCAPE_16_9: "16:9",
 CINEMATIC_21_9: "21:9",
} as const
export type AspectRatio = (typeof AspectRatio)[keyof typeof AspectRatio]

export const ImageSize = {
 SIZE_1K: "1K",
 SIZE_2K: "2K",
 SIZE_4K: "4K",
} as const
export type ImageSize = (typeof ImageSize)[keyof typeof ImageSize]

// --- Analytics / Channelytics Types ---

export type CsvTag =
 | "shorts"
 | "long"
 | "combined"
 | "mixed"
 | "single_long_video"
 | "single_short_video"
 | "geo"
 | "audience"
 | "traffic"
 | "external"
 | "search"
 | "daily"
 | "other"
 | "unknown"

export type CsvMajorFamily =
 | "video_data"
 | "daily_metrics"
 | "search_intelligence"
 | "traffic"
 | "geography"
 | "audience"
 | "surfaces_discovery"
 | "revenue_monetization"
 | "unknown"

export type CsvUploadType = "auto" | CsvTag | Exclude<CsvMajorFamily, "unknown">

export type CsvDetectedCategory =
 | "content_performance"
 | "content_channel_all"
 | "video_content_all"
 | "video_statistics"
 | "top_videos_by_subscriber_status"
 | "content_shorts"
 | "video_content_shorts"
 | "content_longform"
 | "video_content_longform"
 | "video_content_type"
 | "daily_metrics"
 | "daily_channel_metrics"
 | "weekly_statistics"
 | "monthly_statistics"
 | "window_statistics"
 | "traffic_report"
 | "traffic_overview"
 | "traffic_youtube_search"
 | "traffic_external"
 | "traffic_youtube_features"
 | "traffic_suggested_videos"
 | "traffic_shorts_feed"
 | "youtube_search_terms"
 | "suggested_videos_related"
 | "external_sources"
 | "shorts_content_links"
 | "audience_demographics"
 | "audience_growth"
 | "audience_age"
 | "audience_gender"
 | "audience_age_gender"
 | "audience_size_growth"
 | "audience_new_returning"
 | "audience_watch_behavior"
 | "audience_retention_single_video"
 | "audience_retention_segment"
 | "audience_retention_curve"
 | "audience_retention_activity"
 | "geography"
 | "geography_country"
 | "geography_city"
 | "audience_devices"
 | "audience_operating_system"
 | "audience_device_operating_system"
 | "surface_playback_location"
 | "surface_subscription_status"
 | "surface_subscription_source"
 | "surface_sharing_service"
 | "surface_playlist"
 | "surface_post"
 | "surface_card"
 | "surface_card_type"
 | "surface_end_screen"
 | "surface_end_screen_type"
 | "surface_subtitles_cc"
 | "surface_translation_use"
 | "surface_video_info_language"
 | "monetization_revenue_source"
 | "monetization_ad_type"
 | "monetization_daily_ad_type"
 | "retention_curve"
 | "stw_procedure"
 | "reflection_rate_checks"
 | "unknown"

export type CsvMergeTargetDataset =
 | "master"
 | "traffic"
 | "geography"
 | "audience"
 | "retention"
 | "daily"
 | "video_master"
 | "video_content_breakdown"
 | "daily_metrics"
 | "traffic_summary"
 | "traffic_detail"
 | "geography_country"
 | "geography_city"
 | "audience_demographics"
 | "audience_growth"
 | "audience_behavior"
 | "audience_devices"
 | "audience_retention"
 | "surfaces_discovery"
 | "monetization"
 | "ignore"

export type CsvMergeKeyStrategy =
 | "video_id_title_date"
 | "traffic_source"
 | "traffic_source_detail"
 | "geography_key"
 | "audience_dimension"
 | "video_position"
 | "date"
 | "video_identity"
 | "daily_date"
 | "traffic_summary_source"
 | "traffic_detail_source_title"
 | "country_name"
 | "city_name_plus_country_if_present"
 | "age_band"
 | "gender"
 | "age_gender_pair"
 | "retention_position"
 | "surface_dimension_member"
 | "monetization_dimension_member"
 | "package_only"
 | "none"

export type CsvCapabilitySource =
 | "analytics_api"
 | "reporting_api"
 | "data_api"
 | "csv_only"

export type CsvFreshnessClass =
 | "stable"
 | "ninety_day_limited"
 | "single_video"
 | "bulk_delayed"
 | "manual_only"

export type CsvSubtableId =
 | "all_videos"
 | "video_statistics"
 | "shorts"
 | "long_form"
 | "content_type"
 | "daily_channel_metrics"
 | "weekly_statistics"
 | "monthly_statistics"
 | "window_statistics"
 | "all_traffic_sources"
 | "youtube_search_terms"
 | "external_sources"
 | "suggested_videos"
 | "shorts_feed_links"
 | "youtube_features"
 | "countries"
 | "cities"
 | "age"
 | "gender"
 | "age_gender"
 | "size_growth"
 | "new_returning"
 | "watch_behavior"
 | "devices"
 | "operating_system"
 | "device_operating_system"
 | "retention"
 | "playback_location"
 | "subscription_status"
 | "subscription_source"
 | "sharing_service"
 | "playlists"
 | "posts"
 | "cards"
 | "card_types"
 | "end_screens"
 | "end_screen_types"
 | "subtitles_cc"
 | "translation_use"
 | "video_info_language"
 | "revenue_source"
 | "ad_type"
 | "daily_ad_type"
 | "top_videos_by_subscriber_status"
 | "unknown"

export type CsvPackageMemberRole =
 | "table_data"
 | "chart_data"
 | "totals"
 | "retention_member"
 | "loose_table_data"
 | "unknown"

export interface CsvPackageMember {
 fileName: string
 relativePath: string
 exportKind: "table_data" | "totals" | "chart" | "unknown"
 role: CsvPackageMemberRole
 category: CsvDetectedCategory
}

export interface CsvImportPackage {
 packageId: string
 packageName: string
 packageFingerprint: string
 sourceGroup: string
 category: CsvDetectedCategory
 majorFamily: CsvMajorFamily
 mergeTargetDataset: CsvMergeTargetDataset
 mergeKeyStrategy: CsvMergeKeyStrategy
 memberRole: CsvPackageMemberRole
 members: CsvPackageMember[]
 capabilitySources: CsvCapabilitySource[]
 freshnessClass: CsvFreshnessClass
 channelLabel?: string
 dateRange?: string
}

export interface CsvMergeDirective {
 packageId: string
 packageFingerprint: string
 majorFamily: CsvMajorFamily
 subtableId: CsvSubtableId
 mergeTargetDataset: CsvMergeTargetDataset
 mergeKeyStrategy: CsvMergeKeyStrategy
 memberRole: CsvPackageMemberRole
 capabilitySources: CsvCapabilitySource[]
 freshnessClass: CsvFreshnessClass
 sourcePriority: "primary" | "auxiliary" | "fallback"
 isPrimaryMergeSource: boolean
 isAuxiliaryMember: boolean
}

export interface CsvFileWithTag {
 id: string
 name: string
 tag: CsvTag
 file?: File
 byteSize?: number
 data?: any[]
 detectedCategory?: CsvDetectedCategory
 detectionConfidence?: "high" | "medium" | "low"
 signatureId?: string
 detectionWarnings?: string[]
 sourceGroup?: string
 mergeTargetDataset?: CsvMergeTargetDataset
 mergeKeyStrategy?: CsvMergeKeyStrategy
 majorFamily?: CsvMajorFamily
 subtableId?: CsvSubtableId
 capabilitySources?: CsvCapabilitySource[]
 freshnessClass?: CsvFreshnessClass
 packageId?: string
 packageName?: string
 packageFingerprint?: string
 channelLabel?: string
 packageVariant?: string
 packageMemberRole?: CsvPackageMemberRole
 dateRange?: string
 featureName?: string
 analyticsWindow?: "7d" | "28d" | "90d" | "365d" | "lifetime"
 exportKind?: "table_data" | "totals" | "chart" | "unknown"
 mergeDirective?: CsvMergeDirective
 packageMemberCount?: number
 packageHasPrimaryTableData?: boolean
 packageHasAuxiliaryMembers?: boolean
}

export interface AnalyticsDatasetSourcePolicy {
 id: string
 label: string
 sourceType:
  | "youtube_data_api"
  | "youtube_analytics_api"
  | "youtube_reporting_api"
  | "studio_csv"
 speedClass: "fast" | "medium" | "bulk_delayed" | "manual_csv_only"
 requiresOAuth: boolean
 bestFor: string
 guidance: string
}

export interface AnalyticsDatasetFamilyRegistryRow {
 majorFamily: CsvMajorFamily
 label: string
 subtableIds: CsvSubtableId[]
 syncActionLabels: string[]
 sourcePriority: AnalyticsDatasetSourcePolicy["sourceType"][]
 csvOnlyGaps: string[]
}

export interface PerformanceHubTableSchema {
 datasetId: string
 label: string
 defaultSort?: { column: string; dir: "asc" | "desc" }
 columns: string[]
}

export interface ChartScopeStatus {
 rawApiRows: number
 rawCsvRows: number
 mergedRows: number
 includeOnlyRows: number
 excludedRows: number
 finalChartRows: number
 includeOnlyActive: boolean
}

export interface ChartConfig {
 id?: string
 title: string
 subtitle?: string
 type: string // LineChart, BarChart, etc.
 provider: "google" | "recharts"
 xAxisKey: string
 dataKeys: string[]
 zAxisKey?: string
 options?: any
 data?: () => any[] // For dynamic Google Charts data
 videoCount?: number
 sortType?: "recent" | "highest_rated" | "alphabetical"
 durationType?: "shorts" | "long" | "combined"
 isEngagementRanker?: boolean
 requiredMetrics?: string[]
 missingMetrics?: string[]
 tier?: "A" | "B"
 insight?: {
  title: string
  statPair: string
  reveal: string
 }
}

export interface AnalysisSection {
 title: string
 content: string
 chartSuggestion?: ChartConfig
}

export interface KeywordComparisonTable {
 headers: string[]
 rows: string[][]
}

export interface MiniSpreadsheet {
 title: string
 headers: string[]
 rows: string[][]
}

export interface AnalyticsResult {
 title?: string
 executiveSummary: string
 stats: Record<string, string | number>
 sections: AnalysisSection[]
 keywordComparisonTable?: KeywordComparisonTable
 miniSpreadsheets?: MiniSpreadsheet[]
 meta?: {
  oraclePromptVersion?: ChannelOraclePromptVersion
  inputBytes?: number
  generatedAt?: string
  warnings?: string[]
 }
}

export type ChannelOraclePromptVersion = "creative_oracle_v1"

export interface ChannelOracleInput {
 schemaVersion: "channel_oracle_input_v1"
 analyticsWindow: "7d" | "28d" | "90d" | "365d" | "lifetime"
 generatedAt: string
 fullChannelStats: {
  views: number
  watchHours: number
  subscribers: number
  revenue: number
  rpm: number
  ctr: number
 }
 channelLevel: {
  trafficSources?: unknown
  geography?: unknown
  demographics?: unknown
  dailyMetrics?: unknown
 }
 topVideos: Array<Record<string, unknown>>
}

export interface VideoSyncBatchState {
 initialLimit: number
 incrementSize: number
 cursor: number
 hasMore: boolean
 lastBatchCount: number
}

export type ChannelAnalysisSyncPhase =
 | "idle"
 | "syncing"
 | "partial"
 | "complete"
 | "error"

export interface ChannelAnalysisSyncStatus {
 phase: ChannelAnalysisSyncPhase
 startedAt: string | null
 completedAt: string | null
 lastError: string | null
 stages: string[]
}

export interface ChatMessage {
 role: "user" | "model"
 text: string
 isThinking?: boolean
}

export type SeoResult = {
 id?: string
 timestamp?: number
 concept?: string
 niche?: string
 analysis: string
 filenames: { video: string; thumbnail: string }
 titleSets: { title: string; thumbnailPrompt: string; thumbnailText: string }[]
 description: string
 tags: string
 category: string
 pinnedComment: string[]
 communityPost: string[]
 shortsScript: string
 educationMoments: string
 social: { twitter: string; email: string }
 groundingUrls?: string[]
}

export interface KeywordAnalysisResult {
 lsiKeywords: string[]
 longTailKeywords: string[]
 searchIntent: {
  query: string
  intent: "Informational" | "Transactional" | "Navigational" | "Commercial"
  contentAngle: string
 }[]
 viralHooks: string[]
 trendData: {
  month: string
  google: number
  youtube: number
 }[]
 keywordMetrics: {
  keyword: string
  volume: number
  difficulty: number
  relevance: number
 }[]
 demographics: {
  group: string
  percentage: number
 }[]
 contentFormats: {
  format: string
  percentage: number
 }[]
 sentimentAnalysis: {
  emotion: string
  score: number
 }[]
 retentionForecast: {
  timePoint: string
  retention: number
 }[]
 competitorScores: {
  aspect: string
  score: number
 }[]
 ctrPowerWords: {
  word: string
  score: number
 }[]
 formatRoi: {
  format: string
  effort: number
  impact: number
 }[]
 marketAnalysis: string
}

export interface TagSuggestion {
 tag: string
 score: number
 searchVolume: number
 competition: number
 rank: number
 tripleKeyword: boolean
}

export interface MediaAnalysisResult {
 analysis: string
 strategicAnalysis?: string
 suggestions?: string[]
 retentionCurve?: {
  timePoint: string
  retention: number
 }[]
}

export type ContentAnalysisMode = "new" | "published"

export type ContentAnalysisSource =
 | "upload_video"
 | "upload_audio"
 | "upload_script"
 | "upload_still"
 | "published_video"
 | "transcript"
 | "retention_measurement"
 | "retention_prediction"
 | "channel_history"

export interface PublishedVideoContext {
 videoId: string
 title: string
 publishedAt?: string
 thumbnail?: string
 durationSeconds?: number
 channelTitle?: string
 selectedAt: string
}

export interface TranscriptAcquisitionResult {
 status: "available" | "missing" | "error"
 source:
  | "manual_subtitles"
  | "auto_subtitles"
  | "server_audio_fallback"
  | "uploaded_script"
  | "unknown"
 languageCode?: string
 text?: string
 warning?: string
 error?: string
}

export interface AudioAcquisitionResult {
 status: "available" | "skipped" | "error"
 mimeType?: string
 fileName?: string
 byteSize?: number
 base64?: string
 error?: string
}

export interface RetentionMeasurementResult {
 sampledPoints: RetentionDataPoint[]
 introDropoffSummary: string
 plateauSummary: string
 outroSummary: string
 relativePerformanceSummary: string
 measuredAt: string
}

export interface RetentionPredictionResult {
 summary: string
 confidence: "low" | "medium" | "high"
 likelyDropoffMoments: string[]
 likelySpikeMoments: string[]
 basis: string[]
}

export interface ToolInspiredPromptPack {
 publisherPrompt: string
 managerPrompt: string
 hookPrompt: string
 thumbnailPrompt: string
 tacticsPrompt: string
}

export interface PredictionAccuracyRecord {
 videoId: string
 mode: ContentAnalysisMode
 predictedAt: string
 comparedAt?: string
 summary: string
 score?: number
 notes?: string
}

export interface ContentAnalysisResult extends MediaAnalysisResult {
 mode: ContentAnalysisMode
 sourcesUsed: ContentAnalysisSource[]
 publishedVideo?: PublishedVideoContext
 transcript?: TranscriptAcquisitionResult
 audio?: AudioAcquisitionResult
 retentionMeasurement?: RetentionMeasurementResult
 retentionPrediction?: RetentionPredictionResult
 channelHistorySummary?: string
 inspiredPrompts?: ToolInspiredPromptPack
 predictionAccuracySeed?: PredictionAccuracyRecord
}

export interface HookResult {
 styleName: string
 explanation: string
 script: string
 timeline: { time: string; audio: string; visuals: string }[]
 assemblyInstructions: string
}

export interface PollBlueprint {
 question: string
 options: string[]
 strategy: string
}

export interface ShortsConcept {
 hook: string
 script: string
 visuals: string
 bridgeStrategy: string
}

export interface Tactic {
 title: string
 action: string
 whyItWorks: string
}

export interface Trend {
 title: string
 description: string
 niche: string
 strategy: string
}

export interface CreatorStrategyInput {
 niche: string
 videoLength: string
 topic: string
 audience: string
 timeAvailable: string
 tools: string
 systemInstructionId: string
 avoidTopics: string
}

export interface ThumbnailHistoryItem {
 id: string
 url: string
 prompt: string
 timestamp: number
}

export interface Scene {
 id: string
 name: string
 text: string
 broll: string
 imageUrl: string | null
 voiceoverUrl?: string | null // NEW: Voiceover support
 emotionScore: number
 durationEstimate: number
}

export type AlgorithmDiagnosis = {
 clusterCenter: string
 nicheAuthority: number
 audienceDNA: { interest: string; overlap: number }[]
 hiddenStory: string
}

export type DailyBrief = {
 algorithmSentiment: "positive" | "neutral" | "negative"
 mainPriority: string
 actionSteps: string[]
 estimatedImpact: string
}

export interface JournalEntry {
 id: string
 category:
  | "site"
  | "self"
  | "content"
  | "style"
  | "goals"
  | "community"
  | "plans"
  | "projects"
  | "other"
 content: string
 timestamp: number
}

export interface JournalFollowUp {
 id: string
 entryId: string
 question: string
 answer?: string
 timestamp: number
}

export interface MicroPoll {
 id: string
 question: string
 type: "binary" | "short"
 answer?: string
 timestamp: number
}

export interface AuthState {
 isAuthenticated: boolean
 channelId?: string | null
 channelName: string | null
 channelHandle: string | null
 channelThumbnail: string | null
 subscriberCount: number | null
 totalViews: number | null
 videoCount: number | null
 syncedAt?: string | null
 fastAnalytics?: {
  lifetimeRevenue: number
  lifetimeWatchMinutes: number
  lifetimeViews: number
  subscribers28d: number
  lastSyncedAt: string
 }
}

export type ChannelBootPhase =
 | "idle"
 | "oauth"
 | "identity"
 | "lifetime"
 | "inventory"
 | "syncing"
 | "ready"
 | "error"

export interface ChannelIdentitySnapshot {
 channelId: string | null
 name: string | null
 handle: string | null
 avatarUrl: string | null
 subscriberCount: number | null
 totalViews: number | null
 videoCount: number | null
 isVerified: boolean
 isPartial: boolean
 lastHydratedAt: string | null
}

export interface InitialDashboardHydrationStatus {
 identityReady: boolean
 lifetimeReady: boolean
 inventoryReady: boolean
 lastUpdatedAt: string | null
}

export interface ProjectPlan {
 concept: string
 niche: string
 [key: string]: any
}

export interface Project {
 id: string
 name: string
 color?: string
 publishDate?: string
 tasks?: DayTask[]
 videoTitle?: string
 script?: string
 tags?: string
 description?: string
 status: "active" | "archived" | "completed" | string
 notes?: string
 plan?: ProjectPlan
 storyboard?: Scene[]
 thumbnailUrl?: string
 niche?: string
 concept?: string
 updatedAt?: number
}

export interface AIPatchPlan {
  operations: any[]
}

export interface OracleState {
  analysis: any
  suggestions: any[]
}

export interface WorkspaceBrain {
 // Global Tracking
 activeProviders: AppTool[]
 activeProjectId: string | null
 projects: Project[]
 channelProfile: any | null
 recentMetrics: any | null
 csvFiles: any[]
 identityAndAspirations?: string
 contentDNA?: string
 performanceLedger?: string
 futureStateMap?: string
 strategicAdvice?: string

 // 1. The Core Idea
 coreConcept: string
 targetNiche: string

 // 2. Metadata & SEO (from SeoGenerator)
 seoState: {
  winningTitle: string | null
  winningKeywords: string[]
  descriptionDraft: string
  results: SeoResult[]
 }

 // 3. Narrative & Visuals (from StoryboardStudio)
 storyboardState: {
  scenes: Scene[]
  estimatedDuration: number
  pacingHealth: "Excellent" | "Warning" | "Critical"
 }

 // 4. Packaging (from ThumbnailStudio)
 thumbnailState: {
  selectedStyle: string
  activeImageUrl?: string | null
  prompt?: string
  colorPalette?: string
  conceptDraft?: string
  variations?: any[]
 }

 // 5. Analytical Constraints
 analyticalConstraints: {
  provenFormats: string[]
  forbiddenTopics: string[]
 }

 // 6. Channelytics & Data
 channelyticsState: {
  csvFiles?: CsvFileWithTag[]
  allData: any[]
  analyticsResult?: AnalyticsResult | null
  oraclePromptVersion?: ChannelOraclePromptVersion
  syncBatch?: VideoSyncBatchState
  syncStatus?: ChannelAnalysisSyncStatus
  topPerformers?: any[]
  retentionBenchmarks?: any[]
  deepSegments?: any
 }

 performanceHubState: {
  analyticsWindow: "7d" | "28d" | "90d" | "365d" | "lifetime"
  syncSourceMode: "api_analytics" | "uploads" | "both"
  storageMode: "sync" | "storage" | "both"
  tableDataset: string
  tableSearch: string
  tableTag: string
  selectedRowIds: string[]
 }

 researchLabState: {
  csvFiles?: CsvFileWithTag[]
  allData?: any[] // Store the parsed CSV rows persistently
  analyticsResult?: AnalyticsResult | null
  activeQuery?: string
  results?: any[]
  history?: any[]
 }

 videoFlags: Record<
  string,
  {
   excludeAnalysis?: boolean
   includeOnly?: boolean
   priorityAnalysis?: boolean
  }
 >

 // 7. Project & Calendar Management
 calendarState: {
  dayTasks?: Record<string, DayTask[]> // dateString -> tasks
  events?: any[]
  viewMode?: string
  selectedEventId?: string | null
 }
 channelHub: {
  toDos?: { id: string; text: string; completed: boolean }[]
  goals?: { id: string; text: string; category: string; completed: boolean }[]
  competitors?: any[]
  nicheInsights?: any[]
  opportunityGaps?: any[]
 }

 // 8. AI Journal & Creator Knowledge
 journalEntries: JournalEntry[]
 journalFollowUps: JournalFollowUp[]
 microPolls: MicroPoll[]
 creatorPreferences: Record<string, string | boolean>
 lastSyncDate: string | null
 retentionCache: VideoRetentionCache
 sitewideBrainContext?: string
 onboarding?: {
  lastRunId?: string
  channelId?: string | null
  status?: BrainOnboardingBootstrapRun["status"]
  completedAt?: string | null
 }
}

// Product + Data Architecture Contracts
export type MasterTableType =
 | "master_channel_identity"
 | "master_video_core"
 | "master_audience"
 | "master_geography"
 | "master_traffic"
 | "master_device_playback"
 | "master_retention"
 | "master_monetization"
 | "master_external_signals"
 | "master_formula_metrics"
 | "master_coverage_registry"

export type IngestMode = "connected" | "import" | "hybrid" | "public_handle"

export type MetricAccuracyClass =
 | "exact"
 | "derived_exact"
 | "estimated"
 | "unavailable"

// --- Brain Types ---
export interface BrainSignal {
 id: string
 toolId: string
 action: string
 payload: any
 timestamp: number
}

export interface ContextPacket {
 identityAndAspirations: string
 contentDNA: string
 performanceLedger: string
 futureStateMap: string
 learnedPreferences: string
 strategicAdvice?: string
 sitewideBrainContext?: string
 toolContextPack?: ToolContextPack
}

export interface BrainMemorySchema {
 identityAndAspirations: string
 contentDNA: string
 performanceLedger: string
 futureStateMap: string
 interactionCount: number
 lastReflection: number
 tools: string[]
 strategicAdvice?: string
 sitewideBrainContext?: string
 onboarding?: {
  lastRunId?: string
  channelId?: string | null
  status?: BrainOnboardingBootstrapRun["status"]
  completedAt?: string | null
 }
}

export type BrainConfidenceLevel = "high" | "medium" | "low"

export type AIBrainLearningCategory =
 | "correction"
 | "channel_fact"
 | "creator_goal"
 | "content_style"
 | "audience_insight"
 | "analytics_insight"
 | "preference"
 | "anti_pattern"
 | "feature_request"
 | "answer_quality"
 | "sync_observation"
 | "tool_workflow"

export type AIBrainLearningStatus =
 | "captured"
 | "reflected"
 | "promoted"
 | "dismissed"

export interface AIBrainReflectionStep {
 id: string
 label: string
 result: string
 confidence: BrainConfidenceLevel
 assumptions: string[]
 potentialErrors: string[]
 decision: "proceed" | "ask_user" | "backtrack" | "promote" | "hold"
}

export interface AIBrainReflectionTrace {
 id: string
 learningEntryId: string
 createdAt: string
 overallConfidence: BrainConfidenceLevel
 weakestStep: string
 steps: AIBrainReflectionStep[]
 backtracks: string[]
 finalConclusion: string
}

export interface AIBrainLearningEntry {
 id: string
 channelId: string | null
 category: AIBrainLearningCategory
 source:
  | "copilot"
  | "feedback"
  | "journal"
  | "micro_poll"
  | "vt_sync"
  | "generation"
  | "daily_oracle"
  | "command_handoff"
  | "system"
 summary: string
 detail: string
 evidence: string[]
 confidence: BrainConfidenceLevel
 status: AIBrainLearningStatus
 createdAt: string
 updatedAt: string
 recurrenceCount: number
 relatedEntryIds: string[]
 promotionTarget?: "brain_memory" | "channel_knowledge" | "tool_context_pack"
 reflectionTrace?: AIBrainReflectionTrace
 metadata?: Record<string, unknown>
}

export interface AIBrainSkillResource {
 id: string
 title: string
 sourceSkill: "self-improvement" | "self-improving-agent" | "self-reflecting-chain"
 summary: string
 runtimeRules: string[]
 docPath: string
 status: "active"
}

export interface AIBrainPromotionCandidate {
 entryId: string
 target: "brain_memory" | "channel_knowledge" | "tool_context_pack"
 reason: string
 allowed: boolean
 confidence: BrainConfidenceLevel
 blockedBy: string[]
}

export interface AIBrainFeedbackSignal {
 messageId: string
 rating: "helpful" | "not_useful" | "inaccurate" | "save_insight" | "ask_follow_up"
 userNote?: string
 createdAt: string
}

export interface AIBrainConversationDigest {
 id: string
 channelId: string | null
 createdAt: string
 userIntent: string
 answerMode:
  | "strategy_brief"
  | "analytics_diagnosis"
  | "seo_keyword_plan"
  | "video_idea_sprint"
  | "journal_reflection"
  | "goal_coach"
  | "publishing_checklist"
  | "revenue_levers"
  | "creator_asset_draft"
  | "audience_insight"
 keyFacts: string[]
 unresolvedQuestions: string[]
 learningEntryIds: string[]
}

export interface CreatorBrainPromptCard {
 id: string
 label: string
 prompt: string
 category:
  | "strategy"
  | "analytics"
  | "seo"
  | "ideas"
  | "goals"
  | "revenue"
  | "publishing"
  | "audience"
 color: string
}

export interface CreatorBrainLearningQuestion {
 id: string
 question: string
 reason: string
 category: AIBrainLearningCategory
 confidence: BrainConfidenceLevel
}

export interface CreatorBrainResponseSection {
 id: string
 title: string
 body: string
 tone: "green" | "yellow" | "pink" | "blue" | "orange" | "white"
}

export type AIBrainEvidenceIntent =
 | "strategy"
 | "analytics"
 | "seo"
 | "audience"
 | "revenue"
 | "publishing"
 | "content_analysis"
 | "content_generation"

export interface AIBrainEvidenceVideo {
 id: string
 evidenceId: string
 title: string
 publishedAt: string | null
 format: string | null
 descriptionSnippet: string | null
 tags: string[]
 metrics: {
  views: number | null
  watchTime: number | null
  subscribers: number | null
  revenue: number | null
  ctr: number | null
  averagePercentageViewed: number | null
 }
}

export interface AIBrainEvidenceSignal {
 evidenceId: string
 label: string
 value: string
 views: number | null
}

export interface AIBrainEvidencePack {
 promptVersion: "brain-chat-v2"
 intent: AIBrainEvidenceIntent
 channelId: string | null
 channelName: string | null
 channelDescription: string | null
 capturedAt: string | null
 dataStatus: "ready" | "partial" | "missing"
 topVideos: AIBrainEvidenceVideo[]
 recentVideos: AIBrainEvidenceVideo[]
 searchTerms: AIBrainEvidenceSignal[]
 trafficSources: AIBrainEvidenceSignal[]
 availableMetrics: string[]
 missingInputs: string[]
 evidenceIds: string[]
 transcriptRouteRequired: boolean
}

export interface AIBrainAnswerModule {
 id: string
 code?: string
 title: string
 body: string
 tone: CreatorBrainResponseSection["tone"]
 actionLabel?: string
 source?: "growth" | "analytics" | "journal" | "oracle" | "seo" | "memory" | "question"
 kind?:
  | "executive_snapshot"
  | "metric_comparison"
  | "trend_chart"
  | "retention_curve"
  | "audience_mix"
  | "recommendation_stack"
  | "action_table"
  | "idea_scorecard"
  | "packaging_board"
  | "keyword_cluster"
  | "search_table"
  | "funnel"
  | "timeline"
  | "revenue_lens"
  | "question"
  | "handoff"
 data?: AIBrainAnswerModuleData
}

export interface AIBrainAnswerModuleData {
 metrics?: Array<{ label: string; value: number | null; displayValue?: string; change?: number | null }>
 points?: Array<{ label: string; value: number | null }>
 rows?: Array<Record<string, string | number | null>>
 labels?: string[]
 items?: Array<{ title: string; detail?: string; score?: number | null; status?: string }>
 questionId?: string
 route?: string
 routeLabel?: string
 missingReason?: string
}

export interface BrainResponseCitation {
 id: string
 title: string
 url: string
 source: "wikipedia" | "google" | "viewtube" | "youtube"
 accessedAt: string
}

export interface BrainAnswerEvaluation {
 id: string
 createdAt: string
 scores: {
  creatorSpecificity: number
  evidenceCoverage: number
  goalAlignment: number
  actionability: number
  novelty: number
 }
 passed: boolean
 repairReasons: string[]
 unsupportedNumbers: string[]
 similarTurnIds: string[]
}

export interface CreatorInitialInsightDefinition {
 id: string
 title: string
 trigger: string
 requiredEvidence: string[]
 outputFormat: string
 optionalHandoff?: string
}

export interface CreatorInitialInsight {
 id: string
 title: string
 priority: number
 reason: string
 modules: AIBrainAnswerModule[]
 handoffLabel?: string
}

/**
 * A concrete next move the Brain surfaces on its own. Both scores are 1-5 and are
 * always shown to the creator: the Brain should only raise actions with a strong
 * result-to-effort ratio.
 */
export interface BrainQuickAction {
 id: string
 title: string
 body: string
 effort: number
 reward: number
 route?: string
 routeLabel?: string
}

export interface CreatorBrainResponse {
 id: string
 mode: AIBrainConversationDigest["answerMode"]
 body: string
 evidenceIds: string[]
 nextAction?: string
 headline: string
 keyInsight: string
 evidenceChips: string[]
 sections?: CreatorBrainResponseSection[]
 modules?: AIBrainAnswerModule[]
 actions: string[]
 learningSummary: string
 questions: CreatorBrainLearningQuestion[]
 confidence: BrainConfidenceLevel
 generationPath?: BrainGenerationPath
 fallbackReason?: BrainFallbackReason
}

export interface AIBrainQuestionAnswer {
 id: string
 questionId: string
 channelId: string | null
 question: string
 answer: string
 category: AIBrainLearningCategory
 createdAt: string
 learningEntryId?: string
}

export interface AIBrainConversationTurn {
 id: string
 threadId: string
 channelId: string | null
 createdAt: string
 updatedAt?: string
 status?: AIBrainConversationTurnStatus
 userText: string
 assistantText: string
 response?: CreatorBrainResponse
 answerModules: AIBrainAnswerModule[]
 questionAnswers: AIBrainQuestionAnswer[]
 feedback?: AIBrainFeedbackSignal
 learningEntryIds: string[]
 digest?: AIBrainConversationDigest
 citations?: BrainResponseCitation[]
 evaluation?: BrainAnswerEvaluation
 metadata?: Record<string, unknown>
}

export type AIBrainConversationTurnStatus =
 | "pending"
 | "complete"
 | "fallback"
 | "interrupted"

export interface AIBrainConversationThread {
 id: string
 channelId: string | null
 createdAt: string
 updatedAt: string
 title: string
 turnIds: string[]
 selectedTurnId?: string
 rollingSummary?: string
 latestDigest?: AIBrainConversationDigest
}

export interface BrainThreadRepository {
 beginTurn(input: { channelId?: string | null; userText: string; metadata?: Record<string, unknown> }): Promise<AIBrainConversationTurn>
 completeTurn(input: {
  turnId: string
  status: Exclude<AIBrainConversationTurnStatus, "pending">
  assistantText: string
  response?: CreatorBrainResponse
  answerModules?: AIBrainAnswerModule[]
  citations?: BrainResponseCitation[]
  evaluation?: BrainAnswerEvaluation
  learningEntryIds?: string[]
  metadata?: Record<string, unknown>
 }): Promise<AIBrainConversationTurn>
 resumeThread(channelId?: string | null): Promise<{ thread: AIBrainConversationThread; turns: AIBrainConversationTurn[] }>
}

export interface NicheKnowledgeSource {
 id: string
 title: string
 url: string
 source: "wikipedia" | "google"
 excerpt: string
 accessedAt: string
 expiresAt: string
}

export interface NicheKnowledgeProfile {
 id: string
 channelId: string | null
 canonicalNiche: string
 evidenceFingerprint: string
 createdAt: string
 updatedAt: string
 evergreenExpiresAt: string
 currentExpiresAt?: string
 summary: string
 terminology: string[]
 majorSubtopics: string[]
 adjacentTopics: string[]
 audienceQuestions: string[]
 sources: NicheKnowledgeSource[]
 status: "ready" | "partial" | "missing"
}

export interface NicheKnowledgeRefreshPolicy {
 evergreenTtlMs: number
 currentTtlMs: number
 refreshOnFingerprintChange: boolean
}

export interface BrainMemoryClaim {
 id: string
 channelId: string | null
 scope: "creator" | "channel" | "analytics" | "answer_policy" | "workflow"
 category: AIBrainLearningCategory
 value: string
 evidence: string[]
 confidence: BrainConfidenceLevel
 source: AIBrainLearningEntry["source"]
 createdAt: string
 updatedAt: string
 validFrom: string
 validTo?: string | null
 confirmationState: "explicit" | "inferred" | "confirmed" | "rejected"
 status: "active" | "superseded" | "undone"
 supersedesClaimId?: string
 supersededByClaimId?: string
 learningEntryIds: string[]
}

export interface BrainReflectionDecision {
 learningEntryId: string
 decision: "promote" | "hold" | "ask_user" | "backtrack" | "supersede"
 confidence: BrainConfidenceLevel
 reason: string
 affectedContextPacks: string[]
 claimId?: string
}

export interface BrainContextBudget {
 maximumCharacters: number
 systemCharacters: number
 evidenceCharacters: number
 memoryCharacters: number
 knowledgeCharacters: number
 conversationCharacters: number
 omittedSections: string[]
}

export interface BrainCapabilityDefinition {
 id: string
 label: string
 description: string
 intents: AIBrainEvidenceIntent[]
 maximumInvocationsPerTurn: number
 requiresChannelData?: boolean
 requiresCurrentResearch?: boolean
}

export interface BrainOrchestratorRequest {
 channelId?: string | null
 userText: string
 allowModel?: boolean
 metadata?: Record<string, unknown>
}

export type BrainGenerationPath = "model" | "repaired_model" | "basic_guidance"

export type BrainFallbackReason =
 | "model_disabled"
 | "provider_error"
 | "validation_failed"
 | "repair_failed"

export interface BrainRepairOutcome {
 attempted: boolean
 succeeded: boolean
 reasons: string[]
 evaluationId?: string
}

export interface BrainOrchestratorResult {
 turn: AIBrainConversationTurn
 response: CreatorBrainResponse
 modules: AIBrainAnswerModule[]
 capabilities: string[]
 contextBudget: BrainContextBudget
 repaired: boolean
 generationPath: BrainGenerationPath
 fallbackReason?: BrainFallbackReason
 repairOutcome: BrainRepairOutcome
}

export type CreatorGrowthCapabilityStatus = "ready" | "partial" | "missing"

export interface CreatorGrowthContext {
 profileConfidenceScore: number
 currentGoal: string
 inferredNiche: string
 contentPillars: string[]
 topPerformerPatterns: string[]
 audiencePromise: string
 memoryChanges: string[]
 newUploadFitChecklist: string[]
 dailyOracleActions: string[]
 journalProfileUpdates: string[]
 goalAwareRecommendations: string[]
 seoOpportunityQueue: string[]
 unresolvedQuestions: string[]
 recentConversationFacts: string[]
 capabilities: Array<{
  id:
   | "profile_confidence"
   | "creator_confirmation"
   | "top_performer_patterns"
   | "audience_promise"
   | "memory_change_log"
   | "new_upload_fit"
   | "daily_oracle"
   | "journal_profile_updates"
   | "goal_aware_recommendations"
   | "seo_opportunity_queue"
  label: string
  status: CreatorGrowthCapabilityStatus
  summary: string
 }>
}

export type BrainOnboardingStage =
 | "idle"
 | "core_sync"
 | "evidence_pack"
 | "knowledge_model"
 | "question_set"
 | "context_pack"
 | "complete"
 | "failed"

export interface BrainEvidenceItem {
 id: string
 source:
  | "channel_profile"
  | "channel_lifetime_metrics"
  | "video_metadata"
  | "video_lifetime_metrics"
  | "comments"
  | "transcripts"
  | "media_analysis"
  | "system"
 label: string
 summary: string
 confidence: BrainConfidenceLevel
 videoId?: string
 sourcePath?: string
 observedAt: string
}

export interface ChannelEvidencePacket {
 id: string
 runId: string
 channelId: string | null
 createdAt: string
 sourceSnapshotId?: string | null
 evidenceFingerprint?: string
 sourceCounts: {
  videos: number
  shorts: number
  longForm: number
  tags: number
  descriptions: number
  thumbnails: number
  comments: number
  transcripts: number
  mediaAnalyses: number
 }
 skippedInputs: Array<{
  source: string
  reason: string
  consentRequired?: boolean
 }>
 evidence: BrainEvidenceItem[]
 audienceEvidence?: BrainAudienceEvidencePacket
}

export type BrainAudienceEvidenceVideoFormat = "long" | "short" | "unknown"

export interface BrainAudienceEvidenceVideoTarget {
 videoId: string
 title: string
 format: BrainAudienceEvidenceVideoFormat
 reason:
  | "top_long"
  | "top_short"
  | "recent_top_long"
  | "recent_top_short"
 views: number | null
 publishedAt: string | null
}

export interface BrainAudienceEvidenceComment {
 id: string
 videoId: string
 author: string | null
 text: string
 likeCount: number | null
 publishedAt: string | null
 replyCount: number | null
 replies: Array<{
  id: string
  author: string | null
  text: string
  likeCount: number | null
  publishedAt: string | null
 }>
}

export interface BrainAudienceEvidenceActivity {
 id: string
 type: string
 title: string
 text: string | null
 publishedAt: string | null
}

export interface BrainAudienceEvidencePacket {
 id: string
 channelId: string | null
 createdAt: string
 targets: BrainAudienceEvidenceVideoTarget[]
 comments: BrainAudienceEvidenceComment[]
 activities: BrainAudienceEvidenceActivity[]
 coverage: {
  selectedVideos: number
  commentThreadsPerVideoCap: number
  activityCap: number
  commentsCollected: number
  repliesCollected: number
  activitiesCollected: number
  missing: string[]
 }
}

export interface ChannelKnowledgeHypothesis {
 id: string
 label: string
 summary: string
 confidence: BrainConfidenceLevel
 evidenceIds: string[]
}

export interface ChannelKnowledgeModel {
 id: string
 runId: string
 channelId: string | null
 createdAt: string
 updatedAt: string
 sourceSnapshotId?: string | null
 evidenceFingerprint?: string
 niche: ChannelKnowledgeHypothesis[]
 secondaryNiches?: ChannelKnowledgeHypothesis[]
 contentPillars?: ChannelKnowledgeHypothesis[]
 topicClusters?: ChannelKnowledgeHypothesis[]
 searchLanguage?: ChannelKnowledgeHypothesis[]
 contentFormats: ChannelKnowledgeHypothesis[]
 audience: ChannelKnowledgeHypothesis[]
 visualIdentity: ChannelKnowledgeHypothesis[]
 creatorCommunication: ChannelKnowledgeHypothesis[]
 growthOpportunities: ChannelKnowledgeHypothesis[]
 successDrivers?: ChannelKnowledgeHypothesis[]
 topEvidenceVideos?: Array<{
  videoId: string
  title: string
  views?: number | null
  watchTime?: number | null
  revenue?: number | null
  subscribers?: number | null
  publishedAt?: string | null
  evidenceId?: string
 }>
 contradictions: ChannelKnowledgeHypothesis[]
 summary: string
 confidence: BrainConfidenceLevel
}

export interface BrainQuestion {
 id: string
 question: string
 category: "universal" | "personalized"
 reason: string
 confidence: BrainConfidenceLevel
 evidenceIds: string[]
}

export interface BrainQuestionSet {
 id: string
 runId: string
 channelId: string | null
 createdAt: string
 universalQuestions: BrainQuestion[]
 personalizedQuestions: BrainQuestion[]
}

export interface ToolContextPack {
 id: string
 runId: string
 channelId: string | null
 createdAt: string
 sourceSnapshotId?: string | null
 evidenceFingerprint?: string
 promptVersion: string
 summary: string
 contextBlock: string
 evidenceIds: string[]
 confidence: BrainConfidenceLevel
 unavailableInputs: string[]
}

export interface BrainGenerationRecord {
 id: string
 runId: string
 channelId: string | null
 toolId: string
 promptVersion: string
 model: string
 inputSummary: string
 outputSummary: string
 sourceEvidenceIds: string[]
 createdAt: string
 tokenUsage?: {
  input?: number
  output?: number
  total?: number
 }
 costUsd?: number
}

export interface BrainOnboardingBootstrapRun {
 id: string
 channelId: string | null
 status: "running" | "complete" | "failed" | "skipped"
 stage: BrainOnboardingStage
 startedAt: string
 completedAt: string | null
 firstRun: boolean
 guardKey: string
 sourceSnapshotId?: string | null
 evidenceFingerprint?: string
 diagnostics: string[]
 sourceCounts: ChannelEvidencePacket["sourceCounts"]
 evidencePacketId?: string
 knowledgeModelId?: string
 questionSetId?: string
 toolContextPackId?: string
 generationRecordIds: string[]
 error?: string
}

// --- Super-Tool OS Types ---

export type SuperToolSurface =
 | "studio"
 | "projects"
 | "editor"
 | "vault"
 | "analytics"
 | "dashboard"
 | "brain"
 | "workflow"

export type SuperToolId =
 | "creator-canvas-os"
 | "audience-loop-studio"
 | "packaging-lab-pro"
 | "project-command-kanban"
 | "series-and-theme-generator"
 | "publishing-schedule-architect"
 | "motion-scene-builder"
 | "timeline-asset-vault-dock"
 | "template-and-foley-forge"
 | "caption-and-fx-pipeline"
 | "shorts-extraction-studio"
 | "creator-vault-os"
 | "cinematic-analytics-lab"
 | "retention-autopsy-experiment-engine"
 | "brain-command-center"
 | "workflow-chain-builder"

export type AIProviderId = "gemini" | "openai" | "mock"

export type GenerationStatus =
 | "pending"
 | "running"
 | "complete"
 | "error"
 | "cancelled"

export type ToolRunStatus =
 | "queued"
 | "running"
 | "complete"
 | "error"
 | "blocked"

export type WorkflowStepStatus =
 | "pending"
 | "active"
 | "complete"
 | "blocked"
 | "skipped"

export type VaultAssetKind =
 | "image"
 | "video"
 | "audio"
 | "font"
 | "document"
 | "json"
 | "template"
 | "generated"
 | "other"

export interface GenerationArtifact {
 id: string
 kind: VaultAssetKind
 label: string
 url?: string | null
 mimeType?: string | null
 sourceRecordId?: string | null
 metadata?: Record<string, unknown>
}

export interface GenerationRecord {
 id: string
 toolId: SuperToolId
 provider: AIProviderId
 model: string
 prompt: string
 status: GenerationStatus
 createdAt: number
 updatedAt: number
 outputText?: string
 outputJson?: Record<string, unknown> | unknown[] | null
 estimatedCostCents?: number | null
 usage?: {
  promptTokens?: number
  completionTokens?: number
  totalTokens?: number
 } | null
 error?: string | null
 artifacts: GenerationArtifact[]
 metadata?: Record<string, unknown>
}

export interface ToolRun {
 id: string
 toolId: SuperToolId
 status: ToolRunStatus
 startedAt: number
 updatedAt: number
 generationId?: string | null
 workflowId?: string | null
 summary: string
 metadata?: Record<string, unknown>
 error?: string | null
}

export interface WorkflowStep {
 id: string
 title: string
 status: WorkflowStepStatus
 ownerSurface: SuperToolSurface
 details?: string
 toolId?: SuperToolId | null
 artifactIds?: string[]
}

export interface WorkflowChain {
 id: string
 title: string
 goal: string
 status: WorkflowStepStatus
 createdAt: number
 updatedAt: number
 projectId?: string | null
 primaryToolId?: SuperToolId | null
 stepIds: string[]
 steps: WorkflowStep[]
 artifactIds: string[]
 provenance: string[]
}

export interface VaultAsset {
 id: string
 name: string
 kind: VaultAssetKind
 source: "local" | "drive" | "generated" | "project" | "imported"
 createdAt: number
 updatedAt: number
 projectId?: string | null
 projectName?: string | null
 toolId?: SuperToolId | null
 generationId?: string | null
 driveFileId?: string | null
 folderId?: string | null
 url?: string | null
 previewUrl?: string | null
 mimeType?: string | null
 tags: string[]
 metadata?: Record<string, unknown>
}

export interface StoryNode {
 id: string
 title: string
 beat: "hook" | "context" | "proof" | "pivot" | "payoff" | "cta" | "custom"
 summary: string
 sourceIds: string[]
 linkedSceneIds?: string[]
}

export interface PublishPlan {
 id: string
 projectId?: string | null
 title: string
 publishDate?: string | null
 targetPlatforms: string[]
 checklist: string[]
 packagingAssetIds: string[]
 notes?: string
}

export interface MotionTemplate {
 id: string
 name: string
 category: "caption" | "transition" | "background" | "scene" | "fx" | "audio-reactive"
 summary: string
 editorRoute: "/editor"
 tags: string[]
}

export interface InsightArtifact {
 id: string
 title: string
 toolId: SuperToolId
 createdAt: number
 metricKeys: string[]
 summary: string
 confidence: "high" | "medium" | "low"
 provenance: string[]
}

export interface BrainSignalEnvelope {
 id: string
 toolId: SuperToolId
 action: string
 createdAt: number
 generationId?: string | null
 workflowId?: string | null
 payload: Record<string, unknown>
}

export interface SuperToolDefinition {
 id: SuperToolId
 title: string
 surface: SuperToolSurface
 category: string
 summary: string
 routes: string[]
 brainHook: string
 sourceOfTruth: string
 status: "live-shell" | "integrating" | "planned"
 visibility: "public" | "internal_only"
}
