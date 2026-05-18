// src/types.ts

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

export type CsvUploadType = "auto" | CsvTag

export interface CsvFileWithTag {
 id: string
 name: string
 tag: CsvTag
 file?: File
 data?: any[]
 dateRange?: string
 featureName?: string
 analyticsWindow?: "7d" | "28d" | "90d" | "365d" | "lifetime"
 exportKind?: "table_data" | "totals" | "chart" | "unknown"
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
 channelName: string | null
 channelHandle: string | null
 channelThumbnail: string | null
 subscriberCount: number | null
 totalViews: number | null
 videoCount: number | null
 fastAnalytics?: {
  lifetimeRevenue: number
  lifetimeWatchMinutes: number
  lifetimeViews: number
  subscribers28d: number
  lastSyncedAt: string
 }
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
  activeImageUrl: string | null
  prompt?: string
 }

 // 5. Analytical Constraints
 analyticalConstraints: {
  provenFormats: string[]
  forbiddenTopics: string[]
 }

 // 6. Channelytics & Data
 channelyticsState: {
  csvFiles: CsvFileWithTag[]
  allData: any[]
  analyticsResult: AnalyticsResult | null
  oraclePromptVersion?: ChannelOraclePromptVersion
  syncBatch?: VideoSyncBatchState
  syncStatus?: ChannelAnalysisSyncStatus
 }

 researchLabState: {
  csvFiles: CsvFileWithTag[]
  allData: any[] // Store the parsed CSV rows persistently
  analyticsResult: AnalyticsResult | null
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
  dayTasks: Record<string, DayTask[]> // dateString -> tasks
 }
 channelHub: {
  toDos: { id: string; text: string; completed: boolean }[]
  goals: { id: string; text: string; category: string; completed: boolean }[]
 }

 // 8. AI Journal & Creator Knowledge
 journalEntries: JournalEntry[]
 journalFollowUps: JournalFollowUp[]
 microPolls: MicroPoll[]
 creatorPreferences: Record<string, string | boolean>
 lastSyncDate: string | null
 retentionCache: VideoRetentionCache
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
}
