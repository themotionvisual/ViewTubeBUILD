import type {
 AuthState,
 AIBrainConversationTurn,
 AIBrainEvidencePack,
 AIBrainEvidenceSignal,
 AIBrainEvidenceVideo,
 AIBrainAnswerModule,
 BrainCommandAction,
 BrainMemorySchema,
 BrainOnboardingBootstrapRun,
 BrainQuestionSet,
 ChannelEvidencePacket,
 ChannelKnowledgeModel,
 CreatorBrainLearningQuestion,
 CreatorBrainPromptCard,
 CreatorBrainResponse,
 CreatorBrainResponseSection,
 CreatorGrowthContext,
 SuperToolId,
 ToolContextPack,
 WorkspaceBrain,
} from "../types"
import type { ChannelConnectionSnapshot } from "./connectionState"
import {
 buildVtSyncBrainContext,
 getVtSyncSnapshot,
 applyVtSyncPrivacyFilters,
 type VtSyncSnapshot,
 type VtSyncSyncManifest,
 type VtSyncVideoItem,
} from "../features/vt-sync-local"
import {
 VT_SYNC_CATEGORY_OPTIONS,
 VT_SYNC_DISABLED_UNVALIDATED_CATEGORY_OPTIONS,
} from "../features/vt-sync-local/upstream/syncCategoryRegistry"
import { VT_SYNC_TABLE_DEFINITIONS } from "../features/vt-sync-local/upstream/tableRegistry"
import {
 buildAssistantIntelligenceSnapshot,
 queueAssistantCommand,
} from "./assistantIntelligenceSystem"
import {
 listBrainCommandActions,
 resolveBrainCommandRoute,
} from "./superToolActionPackets"
import { listGenerationRecords } from "./generationStore"
import { listWorkflowChains } from "./workflowEngine"
import { isReviewOnlyBrainCommandAction } from "./brainOwnershipPolicy"
import { scoreVideoPerformance } from "./brain/videoPerformanceScore"
import { getSuperTool, listPublicSuperTools } from "./superToolRegistry"

export type AIBrainSourceStatus =
 | "ready"
 | "partial"
 | "missing"
 | "disabled"

export type AIBrainToolRoute = {
 toolId: SuperToolId
 title: string
 route: string
 surface: string
 sourceOfTruth: string
 status: AIBrainSourceStatus
}

export type AIBrainDiagnosticSummary = {
 runId: string | null
 status: "complete" | "partial" | "failed" | "missing"
 startedAt: string | null
 completedAt: string | null
 completedBundles: number
 failedBundles: number
 partialBundles: number
 totalRows: number | null
 diagnostics: Array<Record<string, unknown>>
 warnings: string[]
 hiddenCategoryCount: number
 coverage: {
  stableCategories: number
  hiddenUnvalidatedCategories: number
  tableContracts: number
  datasetsWithFreshness: number
  staleDatasets: number
  failedDatasets: number
  missingDatasets: number
 }
}

export type AIBrainChatHandoff = {
 action: BrainCommandAction
 recordId: string
 workflowId: string
 route: string
 targetTitle: string
 reviewOnly: boolean
}

export type AIBrainContextSnapshot = {
 generatedAt: string
 route: "/ai-brain"
 channel: {
  connected: boolean
  label: string
  handle: string | null
  subscribers: number | null
  totalViews: number | null
 }
 brain: {
  coreConcept: string
  targetNiche: string
  identityAndAspirations: string
  contentDNA: string
  performanceLedger: string
  futureStateMap: string
  journalEntries: number
  pendingFollowUps: number
  pendingMicroPolls: number
  goals: number
  dayTasks: number
  activeProjects: number
 }
 inferredProfile: {
  status: "ready" | "partial" | "missing"
  summary: string
  niche: string | null
  nicheConfidence: string | null
  contentPillars: string[]
  topicClusters: string[]
  successDrivers: string[]
  topEvidenceVideos: Array<{
   title: string
   views?: number | null
   publishedAt?: string | null
  }>
  videoCount: number
  evidenceFingerprint: string | null
  contextBlock: string | null
 }
 evidencePack: AIBrainEvidencePack
 sourceStatuses: Array<{
  id: string
  label: string
  status: AIBrainSourceStatus
  detail: string
 }>
 vtSync: {
  source: VtSyncSnapshot["source"]
  snapshotId: string
  capturedAt: string
  channelName: string | null
  videos: number
  dailyRows: number
  trafficRows: number
  diagnostics: AIBrainDiagnosticSummary
  brainContextSummary: string
  warnings: string[]
 }
 tools: AIBrainToolRoute[]
 commands: {
  total: number
  assistant: number
  manual: number
  queued: number
  recent: BrainCommandAction[]
 }
 generations: {
  total: number
  recent: Array<{
   id: string
   toolId: string
   status: string
   summary: string
  }>
 }
 workflows: {
  total: number
  active: number
  blocked: number
 }
 promptOps: {
  promptScore: number
  contextBudget: {
   system: number
   brain: number
   vtSync: number
   tools: number
   outputReserve: number
  }
  safetyRules: string[]
 }
 conversations: {
  recentFacts: string[]
  answeredQuestions: string[]
 }
}

export type AIBrainContextInput = {
 brain: WorkspaceBrain
 authState: AuthState
 channelConnection: ChannelConnectionSnapshot
 brainMemory?: BrainMemorySchema | null
 vtSyncSnapshot?: VtSyncSnapshot
 brainOnboardingSnapshot?: {
  run?: BrainOnboardingBootstrapRun | null
  evidencePacket?: ChannelEvidencePacket | null
  knowledgeModel?: ChannelKnowledgeModel | null
  questionSet?: BrainQuestionSet | null
  toolContextPack?: ToolContextPack | null
 } | null
 recentConversationTurns?: AIBrainConversationTurn[]
 creatorGrowthContext?: CreatorGrowthContext | null
 requestText?: string
 now?: Date
}

export type CreatorBrainTabId =
 | "ask"
 | "oracle"
 | "journal"
 | "prompts"
 | "analytics"
 | "knowledge"
 | "learning"
 | "handoffs"
 | "advanced"

const CREATOR_FACING_ROUTES = new Set([
 "/",
 "/studio",
 "/storyboard-studio",
 "/thumbnail-studio",
 "/projects",
 "/project-calendar",
 "/vault",
 "/graphs",
 "/performance",
 "/local-analytics",
 "/vt-sync-local",
 "/editor",
 "/settings",
])

export const buildCreatorBrainPromptCards = (): CreatorBrainPromptCard[] => [
 {
  id: "analyze-channel-niche",
  label: "Analyze Channel Niche",
  prompt: "Based on my channel metrics, titles, tags, and videos, what is my clearest niche and where is it still fuzzy?",
  category: "strategy",
  color: "#4FFF5B",
 },
 {
  id: "niche-growth-ideas",
  label: "Niche Growth Ideas",
  prompt: "What topics or niche angles should I test next to grow views without drifting away from my channel identity?",
  category: "ideas",
  color: "#FFFF61",
 },
 {
  id: "analyze-formats",
  label: "Analyze Formats",
  prompt: "Which content formats appear strongest for views, subscribers, retention, and revenue, and what should I double down on?",
  category: "analytics",
  color: "#40C6E9",
 },
 {
  id: "seo-script-drafter",
  label: "SEO Script Drafter",
  prompt: "Draft a search-aware video concept with title angles, hook, description, and tags based on my channel style.",
  category: "seo",
  color: "#FF83EA",
 },
 {
  id: "format-strategy",
  label: "Format Strategy",
  prompt: "Build a practical format strategy for my next five uploads using what the Brain knows about my channel.",
  category: "publishing",
  color: "#FFB570",
 },
 {
  id: "clarify-channel-goals",
  label: "Clarify Channel Goals",
  prompt: "Ask me the most important questions you need answered to understand my goals, content style, audience, and channel direction.",
  category: "goals",
  color: "#B191FF",
 },
 {
  id: "revenue-levers",
  label: "Revenue Levers",
  prompt: "What are my fastest practical revenue improvements over the next 30 days based on the available channel data?",
  category: "revenue",
  color: "#70FFCB",
 },
 {
  id: "audience-language",
  label: "Audience Language",
  prompt: "What does my audience seem to care about, and what language should I use to make future videos feel more relevant?",
  category: "audience",
  color: "#FFE357",
 },
 {
  id: "why-views-changed",
  label: "Why Views Changed",
  prompt: "Explain why my views may be rising or falling and give me the next three moves to continue the momentum or rebound.",
  category: "analytics",
  color: "#40C6E9",
 },
 {
  id: "best-video-autopsy",
  label: "Best Video Autopsy",
  prompt: "Break down why my most successful video worked and give me a replication plan for the next upload.",
  category: "analytics",
  color: "#4FFF5B",
 },
 {
  id: "title-thumbnail-test",
  label: "Title/Thumbnail Test",
  prompt: "Give me a title and thumbnail test plan for the next video based on my strongest channel patterns.",
  category: "publishing",
  color: "#FFB570",
 },
 {
  id: "daily-oracle",
  label: "Run Daily Oracle",
  prompt: "Run my Daily Oracle and give me one priority, one quick win, and one measurable action for today.",
  category: "goals",
  color: "#FFFF61",
 },
]

export const sanitizeCreatorBrainMarkdown = (value: string): string =>
 value
  .replace(/```[a-z]*\n?/gi, "")
  .replace(/^\s{0,3}#{1,6}\s*/gm, "")
  .replace(/\*\*(.*?)\*\*/g, "$1")
  .replace(/`([^`]+)`/g, "$1")
  .replace(/^\s*[-*]\s+/gm, "")
  .replace(/^\s*(profile confidence|growth read|audience signal|best next action|content opportunity|seo queue|what the brain learned)\s*:?\s*$/gim, "")
  .replace(/\b[A-Z0-9_]{3,}_[A-Z0-9_]+\b/g, (match) => match.toLowerCase().replace(/_/g, " "))
  .replace(/\bVT-SYNC\b/gi, "your channel data")
  .replace(/\bsync bundles?\b/gi, "data areas")
  .replace(/\bbundles?\b/gi, "data areas")
  .replace(/\bmanifest\b/gi, "channel data summary")
  .replace(/\bdiagnostics?\b/gi, "channel data notes")
  .replace(/\bIndexedDB\b/g, "saved Brain memory")
  .replace(/\blocalStorage\b/g, "saved Brain memory")
  .replace(/\bAPI\b/g, "channel data")
  .replace(/\bfunctions?\b/gi, "tools")
  .replace(/\btechnical\b/gi, "channel")
  .replace(/\bfailed\b/gi, "incomplete")
  .replace(/\berror\b/gi, "gap")
  .replace(/\bsync process\b/gi, "channel data")
  .replace(/\s+\n/g, "\n")
  .replace(/\n{3,}/g, "\n\n")
  .trim()

const countRecordValues = (value: unknown): number => {
 if (!value || typeof value !== "object") return 0
 return Object.values(value as Record<string, unknown>).filter((entry) => Boolean(entry)).length
}

const safeArrayLength = (value: unknown): number => (Array.isArray(value) ? value.length : 0)

const sumRowsWritten = (bundles: Array<Record<string, unknown>>): number | null => {
 if (!bundles.length) return null
 return bundles.reduce((total, bundle) => {
  const rows = bundle.rows_written ?? bundle.rowsWritten ?? bundle.rows
  return typeof rows === "number" && Number.isFinite(rows) ? total + rows : total
 }, 0)
}

const hasMetricFailures = (bundle: Record<string, unknown>): boolean =>
 Array.isArray(bundle.metrics_failed) && bundle.metrics_failed.length > 0

export const buildVtSyncDiagnosticsSummary = (
 manifest?: VtSyncSyncManifest | null,
 snapshot?: Pick<VtSyncSnapshot, "datasetFreshness"> | null,
): AIBrainDiagnosticSummary => {
 const completed = Array.isArray(manifest?.bundles_completed) ? manifest.bundles_completed : []
 const failed = Array.isArray(manifest?.bundles_failed) ? manifest.bundles_failed : []
 const diagnostics = Array.isArray(manifest?.diagnostics) ? manifest.diagnostics : []
 const partialBundles = completed.filter(hasMetricFailures).length
 const totalRows = sumRowsWritten([...completed, ...failed])
 const freshnessValues = Object.values(snapshot?.datasetFreshness || {})
 const staleDatasets = freshnessValues.filter((entry) => entry.status === "stale").length
 const failedDatasets = freshnessValues.filter((entry) => entry.status === "failed").length
 const missingDatasets = VT_SYNC_TABLE_DEFINITIONS.length - freshnessValues.length
 const hiddenCategoryCount = diagnostics.filter((entry) => entry.status === "disabled_unvalidated").length
 const warnings: string[] = []
 if (!manifest) warnings.push("No VT-SYNC sync manifest is loaded.")
 if (failed.length) warnings.push(`${failed.length} sync bundles failed.`)
 if (partialBundles) warnings.push(`${partialBundles} completed bundles reported failed metrics and must be treated as partial.`)
 if (missingDatasets > 0) warnings.push(`${missingDatasets} table contracts do not have freshness records yet.`)
 if (hiddenCategoryCount) warnings.push(`${hiddenCategoryCount} requested categories are hidden until validated.`)

 const status =
  !manifest ? "missing"
  : failed.length > 0 ? "failed"
  : partialBundles > 0 || manifest.stop_reason !== "completed" ? "partial"
  : "complete"

 return {
  runId: manifest?.run_id || null,
  status,
  startedAt: manifest?.started_at || null,
  completedAt: manifest?.completed_at || null,
  completedBundles: completed.length,
  failedBundles: failed.length,
  partialBundles,
  totalRows,
  diagnostics,
  warnings,
  hiddenCategoryCount,
  coverage: {
   stableCategories: VT_SYNC_CATEGORY_OPTIONS.length,
   hiddenUnvalidatedCategories: VT_SYNC_DISABLED_UNVALIDATED_CATEGORY_OPTIONS.length,
   tableContracts: VT_SYNC_TABLE_DEFINITIONS.length,
   datasetsWithFreshness: freshnessValues.length,
   staleDatasets,
   failedDatasets,
   missingDatasets: Math.max(0, missingDatasets),
  },
 }
}

const sourceStatus = (
 id: string,
 label: string,
 count: number,
 detail: string,
): AIBrainContextSnapshot["sourceStatuses"][number] => ({
 id,
 label,
 status: count > 0 ? "ready" : "missing",
 detail,
})

export const resolveAIBrainToolRoute = (
 toolId: SuperToolId,
 commandActionId?: string | null,
): AIBrainToolRoute => {
 const tool = getSuperTool(toolId)
 return {
  toolId,
  title: tool?.title || toolId,
  route: resolveBrainCommandRoute(toolId, commandActionId),
  surface: tool?.surface || "brain",
  sourceOfTruth: tool?.sourceOfTruth || "Super-tool registry",
  status: tool ? "ready" : "missing",
 }
}

export const listCreatorFacingBrainRoutes = (): AIBrainToolRoute[] =>
 listPublicSuperTools()
  .filter((tool) => tool.status !== "planned")
  .map((tool): AIBrainToolRoute | null => {
   const route = tool.routes.find((candidate) => CREATOR_FACING_ROUTES.has(candidate.split("?")[0]))
   if (!route) return null
   return {
    toolId: tool.id,
    title: tool.title,
    route,
    surface: tool.surface,
    sourceOfTruth: tool.sourceOfTruth,
    status: "ready",
   }
  })
  .filter((tool): tool is AIBrainToolRoute => Boolean(tool))

const profileList = (items?: Array<{ label?: string; summary?: string }>): string[] =>
 (items || [])
  .map((item) => item.summary || item.label || "")
  .map((value) => value.trim())
  .filter(Boolean)

const PROFILE_STOP_WORDS = new Set([
 "about",
 "after",
 "again",
 "all",
 "and",
 "are",
 "best",
 "but",
 "can",
 "channel",
 "does",
 "for",
 "from",
 "get",
 "how",
 "into",
 "just",
 "more",
 "new",
 "not",
 "now",
 "part",
 "that",
 "the",
 "this",
 "video",
 "videos",
 "what",
 "when",
 "why",
 "with",
 "you",
 "your",
])

const cleanProfileText = (value: unknown): string => String(value || "").replace(/\s+/g, " ").trim()

export const BRAIN_CHAT_PROMPT_VERSION = "brain-chat-v2" as const

const evidenceIntentForText = (text: string): AIBrainEvidencePack["intent"] => {
 const lower = text.toLowerCase()
 if (/\b(transcript|captions?|spoken|what (?:i|we) said|script breakdown|retention drop)\b/.test(lower)) return "content_analysis"
 if (/\b(revenue|income|rpm|cpm|money|sponsor)\b/.test(lower)) return "revenue"
 if (/\b(seo|keyword|search|title|description|tags?)\b/.test(lower)) return "seo"
 if (/\b(audience|viewer|community|comments?|demographic)\b/.test(lower)) return "audience"
 if (/\b(analytics|views|ctr|retention|traffic|impression|perform|success|best)\b/.test(lower)) return "analytics"
 if (/\b(publish|schedule|upload|calendar|consistency)\b/.test(lower)) return "publishing"
 return "strategy"
}

const optionalVideoMetric = (
 video: VtSyncVideoItem,
 key: keyof NonNullable<VtSyncVideoItem["metrics"]>,
): number | null => {
 const value = video.metrics?.[key]
 return typeof value === "number" && Number.isFinite(value) ? value : null
}

const evidenceVideo = (video: VtSyncVideoItem): AIBrainEvidenceVideo => ({
 id: video.id,
 evidenceId: `video:${video.id}`,
 title: cleanProfileText(video.title) || "Untitled video",
 publishedAt: cleanProfileText(video.publishedAt) || null,
 format: cleanProfileText(video.format) || null,
 descriptionSnippet: cleanProfileText(video.descriptionSnippet).slice(0, 320) || null,
 tags: (video.tags || []).map(cleanProfileText).filter(Boolean).slice(0, 8),
 metrics: {
  views: optionalVideoMetric(video, "views"),
  watchTime: optionalVideoMetric(video, "watchTime"),
  subscribers: optionalVideoMetric(video, "subscribersGained") ?? optionalVideoMetric(video, "subscribers"),
  revenue: optionalVideoMetric(video, "revenue"),
  ctr: optionalVideoMetric(video, "ctr"),
  averagePercentageViewed: optionalVideoMetric(video, "averagePercentageViewed"),
 },
})

const signalEvidence = (
 rows: VtSyncSnapshot["searchTerms"] | VtSyncSnapshot["trafficSources"],
 prefix: "search" | "traffic",
): AIBrainEvidenceSignal[] => rows
 .map((row) => {
  const value = cleanProfileText(row.term || row.source || row.title)
  if (!value) return null
  const stableValue = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 64)
  return {
   evidenceId: `${prefix}:${stableValue || "unknown"}`,
   label: prefix === "search" ? "YouTube search term" : "Traffic source",
   value,
   views: typeof row.views === "number" && Number.isFinite(row.views) ? row.views : null,
  }
 })
 .filter((row): row is AIBrainEvidenceSignal => Boolean(row))
 .sort((left, right) => (right.views ?? -1) - (left.views ?? -1))
 .slice(0, 5)

export const buildAIBrainEvidencePack = (
 requestText: string,
 snapshot: VtSyncSnapshot = getVtSyncSnapshot(),
): AIBrainEvidencePack => {
 snapshot = applyVtSyncPrivacyFilters(snapshot)
 const intent = evidenceIntentForText(requestText)
 const videos = snapshot.videos || []
 const topVideos = [...videos]
  .sort((left, right) => profileVideoScore(right) - profileVideoScore(left))
  .slice(0, 5)
  .map(evidenceVideo)
 const recentVideos = [...videos]
  .sort((left, right) => cleanProfileText(right.publishedAt).localeCompare(cleanProfileText(left.publishedAt)))
  .slice(0, 5)
  .map(evidenceVideo)
 const includeSearch = intent === "seo" || intent === "strategy"
 const includeTraffic = intent === "analytics" || intent === "audience" || intent === "strategy"
 const searchTerms = includeSearch ? signalEvidence(snapshot.searchTerms || [], "search") : []
 const trafficSources = includeTraffic ? signalEvidence(snapshot.trafficSources || [], "traffic") : []
 const metricKeys: Array<keyof NonNullable<VtSyncVideoItem["metrics"]>> = [
  "views",
  "watchTime",
  "subscribersGained",
  "revenue",
  "ctr",
  "averagePercentageViewed",
 ]
 const availableMetrics = metricKeys.filter((key) =>
  videos.some((video) => optionalVideoMetric(video, key) !== null),
 )
 const transcriptRouteRequired = intent === "content_analysis"
 const missingInputs = [
  cleanProfileText(snapshot.channelDescription) ? "" : "channel description",
  videos.length ? "" : "synced video inventory",
  availableMetrics.length ? "" : "video-level performance metrics",
  intent === "seo" && searchTerms.length === 0 ? "YouTube search terms" : "",
  (intent === "analytics" || intent === "audience") && trafficSources.length === 0 ? "traffic-source evidence" : "",
  transcriptRouteRequired ? "video transcript in chat; use Content Analysis for transcript-backed claims" : "",
 ].filter(Boolean)
 const evidenceIds = Array.from(new Set([
  cleanProfileText(snapshot.channelDescription) ? "channel:description" : "",
  ...topVideos.map((video) => video.evidenceId),
  ...recentVideos.map((video) => video.evidenceId),
  ...searchTerms.map((row) => row.evidenceId),
  ...trafficSources.map((row) => row.evidenceId),
 ])).filter(Boolean)
 const stopReason = cleanProfileText(snapshot.syncManifest?.stop_reason)
 const dataStatus = snapshot.source === "empty"
  ? "missing" as const
  : stopReason === "completed"
   ? "ready" as const
   : "partial" as const

 return {
  promptVersion: BRAIN_CHAT_PROMPT_VERSION,
  intent,
  channelId: snapshot.channelId || null,
  channelName: snapshot.channelName || null,
  channelDescription: cleanProfileText(snapshot.channelDescription).slice(0, 800) || null,
  capturedAt: cleanProfileText(snapshot.capturedAt) || null,
  dataStatus,
  topVideos,
  recentVideos,
  searchTerms,
  trafficSources,
  availableMetrics,
  missingInputs,
  evidenceIds,
  transcriptRouteRequired,
 }
}

const tokenizeProfileText = (value: unknown): string[] =>
 cleanProfileText(value)
  .toLowerCase()
  .replace(/[^a-z0-9# ]+/g, " ")
  .split(/\s+/)
  .map((token) => token.replace(/^#+/, ""))
  .filter((token) => token.length > 2 && !PROFILE_STOP_WORDS.has(token) && !/^\d+$/.test(token))

const profileMetric = (video: VtSyncVideoItem, key: keyof NonNullable<VtSyncVideoItem["metrics"]>): number => {
 const value = video.metrics?.[key]
 return typeof value === "number" && Number.isFinite(value) ? value : 0
}

const profileVideoScore = (video: VtSyncVideoItem, now?: number): number =>
 scoreVideoPerformance(
  {
   views: profileMetric(video, "views"),
   watchTime: profileMetric(video, "watchTime"),
   subscribers: profileMetric(video, "subscribersGained") + Math.abs(profileMetric(video, "subscribers")),
   revenue: profileMetric(video, "revenue"),
   ctr: profileMetric(video, "ctr"),
   retention: profileMetric(video, "averagePercentageViewed"),
   publishedAt: video.publishedAt,
  },
  now,
 )

const addProfileScore = (
 scores: Map<string, number>,
 term: string,
 score: number,
): void => {
 const key = cleanProfileText(term).toLowerCase()
 if (!key || PROFILE_STOP_WORDS.has(key)) return
 scores.set(key, (scores.get(key) || 0) + score)
}

const readableList = (values: string[], fallback = "your strongest recurring signals"): string => {
 const clean = values.map(cleanProfileText).filter(Boolean)
 if (!clean.length) return fallback
 if (clean.length === 1) return clean[0]
 return `${clean.slice(0, -1).join(", ")} and ${clean.at(-1)}`
}

const buildVtSyncFallbackProfile = (
 snapshot: VtSyncSnapshot,
): AIBrainContextSnapshot["inferredProfile"] => {
 snapshot = applyVtSyncPrivacyFilters(snapshot)
 const videos = snapshot.videos || []
 const videoCount = videos.length
 if (videoCount === 0) {
  return {
   status: "missing",
   summary: "No inferred channel profile is available yet.",
   niche: null,
   nicheConfidence: null,
   contentPillars: [],
   topicClusters: [],
   successDrivers: [],
   topEvidenceVideos: [],
   videoCount: 0,
   evidenceFingerprint: null,
   contextBlock: null,
  }
 }

 const scores = new Map<string, number>()
 tokenizeProfileText(snapshot.channelDescription).forEach((term) => addProfileScore(scores, term, 4))
 videos.forEach((video) => {
  const performanceWeight = 1 + Math.min(8, profileVideoScore(video) / 10)
  ;[...(video.tags || []), ...(video.topics || [])].forEach((phrase) => {
   addProfileScore(scores, phrase, 8 * performanceWeight)
   tokenizeProfileText(phrase).forEach((term) => addProfileScore(scores, term, 3 * performanceWeight))
  })
  addProfileScore(scores, video.category || "", 4 * performanceWeight)
  tokenizeProfileText(video.title).forEach((term) => addProfileScore(scores, term, 2.25 * performanceWeight))
  tokenizeProfileText(video.descriptionSnippet).forEach((term) => addProfileScore(scores, term, 0.9 * performanceWeight))
 })
 ;(snapshot.searchTerms || []).slice(0, 80).forEach((row) => {
  const views = typeof row.views === "number" ? row.views : 0
  tokenizeProfileText(row.term || row.source || row.title).forEach((term) => addProfileScore(scores, term, 2 + Math.log10(views + 1)))
 })

 const ranked = Array.from(scores.entries())
  .sort((left, right) => right[1] - left[1])
  .map(([term]) => term)
 const clusters = ranked.slice(0, 10)
 const primary = clusters.slice(0, 3)
 const secondary = clusters.slice(3, 7)
 const topVideos = [...videos]
  .sort((left, right) => profileVideoScore(right) - profileVideoScore(left))
  .slice(0, 6)
 const viewsKnown = videos.some((video) => typeof video.metrics?.views === "number")
 const confidence = clusters.length >= 5 && videoCount >= 20 ? "medium" : "low"
 const niche =
  primary.length > 0
   ? `Your clearest current niche appears to be ${readableList(primary)}. The fuzzy edges are ${readableList(secondary, "not yet distinct enough to name")} because the Brain still needs confirmed audience intent, comments, transcripts, and creator goals to separate adjacent lanes.`
   : `The Brain can see ${videoCount.toLocaleString()} synced videos, but the available titles, tags, and descriptions are not specific enough to name a clear niche yet.`
 const contentPillars = [
  primary.slice(0, 2),
  clusters.slice(2, 4),
  clusters.slice(4, 6),
 ]
  .filter((group) => group.length > 0)
  .map((group, index) => `Pillar ${index + 1}: ${readableList(group)}.`)
 const successDrivers = topVideos.length
  ? [
    `Top-performing evidence comes from ${readableList(topVideos.slice(0, 4).map((video) => video.title))}.`,
    viewsKnown ? "Performance weighting used video-level views and any available watch time, subscribers, revenue, CTR, and retention fields." : "Video metadata is available, but performance metrics are incomplete, so this profile is still partial.",
   ]
  : ["No top evidence videos were available to compare."]
 const summary = `${niche} Evidence came from ${videoCount.toLocaleString()} synced videos, channel description, titles, tags, descriptions, categories, search terms, and available performance metrics.`

 return {
  status: confidence === "medium" ? "partial" : "partial",
  summary,
  niche,
  nicheConfidence: confidence,
  contentPillars,
  topicClusters: clusters,
  successDrivers,
  topEvidenceVideos: topVideos.map((video) => ({
   title: video.title,
   views: video.metrics?.views ?? null,
   publishedAt: video.publishedAt || null,
  })),
  videoCount,
  evidenceFingerprint: [
   snapshot.snapshotId,
   videoCount,
   clusters.slice(0, 8).join("|"),
   topVideos.map((video) => video.id).join("|"),
  ].join("::"),
  contextBlock: [
   `Inferred channel niche: ${niche}`,
   `Topic clusters: ${clusters.slice(0, 10).join(", ") || "unknown"}.`,
   `Content pillars: ${contentPillars.join(" ") || "unknown"}`,
   `Success evidence: ${successDrivers.join(" ")}`,
  ].join("\n"),
 }
}

const buildInferredProfileSnapshot = (
 input: AIBrainContextInput,
 vtSyncSnapshot: VtSyncSnapshot,
): AIBrainContextSnapshot["inferredProfile"] => {
 const knowledge = input.brainOnboardingSnapshot?.knowledgeModel || null
 const pack = input.brainOnboardingSnapshot?.toolContextPack || null
 const evidence = input.brainOnboardingSnapshot?.evidencePacket || null
 const sourceVideoCount = evidence?.sourceCounts?.videos ?? vtSyncSnapshot.videos.length
 if (!knowledge && !pack) {
  return buildVtSyncFallbackProfile(vtSyncSnapshot)
 }

 return {
  status: knowledge?.confidence === "high" ? "ready" : "partial",
  summary: knowledge?.summary || pack?.summary || "The Brain has a partial inferred channel profile.",
  niche: knowledge?.niche?.[0]?.summary || null,
  nicheConfidence: knowledge?.niche?.[0]?.confidence || null,
  contentPillars: profileList(knowledge?.contentPillars),
  topicClusters: (knowledge?.topicClusters || []).map((item) => item.label).filter(Boolean),
  successDrivers: profileList(knowledge?.successDrivers),
  topEvidenceVideos: (knowledge?.topEvidenceVideos || []).map((video) => ({
   title: video.title,
   views: video.views,
   publishedAt: video.publishedAt,
  })),
  videoCount: sourceVideoCount,
  evidenceFingerprint: knowledge?.evidenceFingerprint || pack?.evidenceFingerprint || null,
  contextBlock: pack?.contextBlock || null,
 }
}

export const buildAIBrainContextSnapshot = ({
 brain,
 authState,
 channelConnection,
 brainMemory,
 vtSyncSnapshot,
 brainOnboardingSnapshot,
 recentConversationTurns = [],
 requestText = "",
 now = new Date(),
}: AIBrainContextInput): AIBrainContextSnapshot => {
 const snapshot = applyVtSyncPrivacyFilters(vtSyncSnapshot || getVtSyncSnapshot())
 const vtSyncBrainContext = buildVtSyncBrainContext(snapshot)
 const evidencePack = buildAIBrainEvidencePack(requestText, snapshot)
 const inferredProfile = buildInferredProfileSnapshot({
  brain,
  authState,
  channelConnection,
  brainMemory,
  vtSyncSnapshot: snapshot,
  brainOnboardingSnapshot,
  now,
 }, snapshot)
 const commands = listBrainCommandActions()
 const generations = listGenerationRecords()
 const workflows = listWorkflowChains()
 const journalEntries = safeArrayLength(brain.journalEntries)
 const pendingFollowUps = Array.isArray(brain.journalFollowUps) ?
  brain.journalFollowUps.filter((item) => !item.answer).length
 : 0
 const pendingMicroPolls = Array.isArray(brain.microPolls) ?
  brain.microPolls.filter((item) => !item.answer).length
 : 0
 const dayTasks = countRecordValues(brain.calendarState?.dayTasks)
 const diagnostics = buildVtSyncDiagnosticsSummary(snapshot.syncManifest, snapshot)
 const tools = listCreatorFacingBrainRoutes()
 const assistantCommands = commands.filter((command) => command.source === "assistant").length
 const manualCommands = commands.length - assistantCommands
 const recentFacts = recentConversationTurns
  .flatMap((turn) => turn.digest?.keyFacts || [])
  .map(sanitizeCreatorBrainMarkdown)
  .slice(0, 8)
 const answeredQuestions = recentConversationTurns
  .flatMap((turn) => turn.questionAnswers || [])
  .map((answer) => `${answer.question} Answer: ${answer.answer}`)
  .slice(0, 8)

 return {
  generatedAt: now.toISOString(),
  route: "/ai-brain",
  channel: {
   connected: channelConnection.isConnected,
   label: authState.channelName || brain.channelProfile?.name || channelConnection.title || "Not connected",
   handle: authState.channelHandle || brain.channelProfile?.channelHandle || null,
   subscribers: authState.subscriberCount ?? brain.recentMetrics?.currentSubscribers ?? null,
   totalViews: authState.totalViews ?? brain.recentMetrics?.lifetimeViews ?? null,
  },
  brain: {
   coreConcept: brain.coreConcept || "",
   targetNiche: brain.targetNiche || "",
   identityAndAspirations: brainMemory?.identityAndAspirations || brain.identityAndAspirations || "",
   contentDNA: brainMemory?.contentDNA || brain.contentDNA || "",
   performanceLedger: brainMemory?.performanceLedger || brain.performanceLedger || "",
   futureStateMap: brainMemory?.futureStateMap || brain.futureStateMap || "",
   journalEntries,
   pendingFollowUps,
   pendingMicroPolls,
   goals: safeArrayLength((brain as unknown as { goalTargets?: unknown[] }).goalTargets),
   dayTasks,
   activeProjects: safeArrayLength(brain.projects),
  },
  inferredProfile,
  evidencePack,
  sourceStatuses: [
   sourceStatus("brain-memory", "Brain Memory", countRecordValues(brainMemory || brain), "Canonical creator memory and reflection state."),
   sourceStatus("ai-journal", "AI Journal", journalEntries, `${journalEntries} journal entries.`),
   sourceStatus("goals", "Goals", safeArrayLength((brain as unknown as { goalTargets?: unknown[] }).goalTargets), "Dashboard goals and creator targets."),
   sourceStatus("daily-tasks", "Daily Tasks", dayTasks, `${dayTasks} calendar task buckets with entries.`),
   {
    id: "vt-sync",
    label: "Channel Data",
    status: snapshot.source === "empty" ? "missing" : diagnostics.status === "complete" ? "ready" : "partial",
    detail: `${snapshot.videos.length} videos and ${snapshot.dailyMetrics.length} daily metric rows available for creator guidance.`,
   },
   sourceStatus("commands", "Brain Commands", commands.length, `${commands.length} reviewed command records.`),
   sourceStatus("generations", "Generation Records", generations.length, `${generations.length} saved generation records.`),
   sourceStatus("workflows", "Workflow Chains", workflows.length, `${workflows.length} workflow chains.`),
  ],
  vtSync: {
   source: snapshot.source,
   snapshotId: snapshot.snapshotId,
   capturedAt: snapshot.capturedAt,
   channelName: snapshot.channelName || null,
   videos: snapshot.videos.length,
   dailyRows: snapshot.dailyMetrics.length,
   trafficRows: snapshot.trafficSources.length + snapshot.searchTerms.length,
   diagnostics,
   brainContextSummary: vtSyncBrainContext.summary,
   warnings: vtSyncBrainContext.warnings,
  },
  tools,
  commands: {
   total: commands.length,
   assistant: assistantCommands,
   manual: manualCommands,
   queued: commands.filter((command) => command.status === "queued").length,
   recent: commands.slice(0, 8),
  },
  generations: {
   total: generations.length,
   recent: generations.slice(0, 8).map((record) => ({
    id: record.id,
    toolId: record.toolId,
    status: record.status,
    summary: record.outputText || String(record.metadata?.moduleId || record.model || ""),
   })),
  },
  workflows: {
   total: workflows.length,
   active: workflows.filter((workflow) => workflow.status === "active").length,
   blocked: workflows.filter((workflow) => workflow.status === "blocked").length,
  },
  promptOps: {
   promptScore: diagnostics.status === "complete" ? 84 : diagnostics.status === "partial" ? 72 : 61,
   contextBudget: {
    system: 16,
    brain: 24,
    vtSync: 24,
    tools: 16,
    outputReserve: 20,
   },
   safetyRules: [
    "Queue reviewed commands instead of executing tool mutations.",
    "Use connected YouTube channel data for creator guidance.",
    "Name missing evidence instead of guessing.",
    "Keep prompt, reflection, and memory ownership under Brain OS.",
   ],
  },
  conversations: {
   recentFacts,
   answeredQuestions,
  },
 }
}

/**
 * Route a creator question to a response mode.
 *
 * Ordering matters: a question's *primary* intent is its verb and object, not the
 * metrics it happens to name. "Which formats are best for views and revenue?" is a
 * formats question, so content-creation and packaging intents are checked before
 * revenue/analytics — otherwise an incidental "revenue" or "views" hijacks the mode
 * and every question collapses to the same answer. Word boundaries also allow plural
 * forms ("formats", "titles") so they don't silently fall through.
 */
const responseModeForText = (text: string): CreatorBrainResponse["mode"] => {
 const lower = text.toLowerCase()
 if (/\b(daily oracle|quick win|today'?s priority|today)\b/.test(lower)) return "goal_coach"
 if (/\b(best|most successful|top)\b.*\b(video|upload)\b/.test(lower)) return "analytics_diagnosis"
 if (/\b(thumbnail|packaging|hook|click-?through)\b/.test(lower)) return "seo_keyword_plan"
 if (/\b(ideas?|topics?|angles?|formats?|series|episodes?|double down)\b/.test(lower)) return "video_idea_sprint"
 if (/\b(niche|positioning|channel identity)\b/.test(lower)) return "strategy_brief"
 if (/\b(seo|keywords?|search|titles?|descriptions?|tags?)\b/.test(lower)) return "seo_keyword_plan"
 if (/\b(revenue|income|rpm|cpm|money|monetiz\w*|sponsor)\b/.test(lower)) return "revenue_levers"
 if (/\b(retention|watch ?time|analytics|views|ctr|traffic|impressions?)\b/.test(lower)) return "analytics_diagnosis"
 if (/\b(journal|reflect|voice|style)\b/.test(lower)) return "journal_reflection"
 if (/\b(goals?|target|milestone|on pace|pace)\b/.test(lower)) return "goal_coach"
 if (/\b(publish|schedule|upload|calendar|consistency)\b/.test(lower)) return "publishing_checklist"
 return "strategy_brief"
}

const titleForMode = (mode: CreatorBrainResponse["mode"]): string => ({
 strategy_brief: "Channel Strategy Read",
 analytics_diagnosis: "Analytics Diagnosis",
 seo_keyword_plan: "SEO and Keyword Plan",
 video_idea_sprint: "Video Idea Sprint",
 journal_reflection: "Journal Reflection",
 goal_coach: "Goal Coach",
 publishing_checklist: "Publishing Checklist",
 revenue_levers: "Revenue Levers",
}[mode])

const cleanModuleBody = (value: string): string =>
 sanitizeCreatorBrainMarkdown(value)
  .replace(/\bprofile confidence\b/gi, "channel read")
  .replace(/\bgrowth read\b/gi, "growth plan")
  .replace(/\bcontent opportunity\b/gi, "video opportunity")
  .replace(/\bwhat the brain learned\b/gi, "saved context")
  .replace(/\bbest next action\b/gi, "what to do next")
  .replace(/\bseo queue\b/gi, "title and search plan")

const moduleFor = (
 id: string,
 title: string,
 body: string,
 tone: CreatorBrainResponseSection["tone"],
 source: AIBrainAnswerModule["source"] = "growth",
): AIBrainAnswerModule => ({
 id,
 title,
 body: cleanModuleBody(body),
 tone,
 source,
})

const compactCount = (value: number): string => {
 if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
 if (Math.abs(value) >= 1_000) return `${Math.round(value / 1_000)}K`
 return value.toLocaleString()
}

/**
 * A creator-readable stat line built only from metrics that actually exist.
 *
 * Average percentage viewed above 100 means the average viewer watched more than
 * once, which is common on Shorts. Reporting that as "2,167% viewed" is noise, so it
 * is stated as replays instead.
 */
const videoStatLine = (video: AIBrainEvidenceVideo): string => {
 const parts: string[] = []
 if (video.metrics.views !== null) parts.push(`${compactCount(video.metrics.views)} views`)
 if (video.metrics.ctr !== null) parts.push(`${video.metrics.ctr.toFixed(1)}% CTR`)
 const viewed = video.metrics.averagePercentageViewed
 if (viewed !== null) {
  parts.push(viewed > 100 ? `${(viewed / 100).toFixed(1)}x replays` : `${Math.round(viewed)}% viewed`)
 }
 return parts.join(" · ")
}

/**
 * The evidence behind an answer, as ranked rows rather than prose. Returns null when
 * there is no video evidence, so the module can never invent a ranking.
 */
export const buildEvidenceRankingModule = (
 evidencePack: AIBrainEvidencePack,
): AIBrainAnswerModule | null => {
 const videos = evidencePack.topVideos.slice(0, 3)
 if (!videos.length) return null
 return {
  id: "video-evidence-ranking",
  title: "What I ranked this on",
  body: "",
  tone: "blue",
  source: "analytics",
  kind: "idea_scorecard",
  code: `Top ${videos.length}`,
  data: {
   items: videos.map((video) => ({
    title: video.title,
    detail: videoStatLine(video),
   })),
  },
 }
}

const formatIntentModules = (input: {
 mode: CreatorBrainResponse["mode"]
 body: string
 keyInsight: string
 action?: string
 snapshot: AIBrainContextSnapshot
 evidencePack: AIBrainEvidencePack
 requestText: string
}): AIBrainAnswerModule[] => {
 const { mode, body, keyInsight, action, snapshot, evidencePack, requestText } = input
 const clusters = snapshot.inferredProfile.topicClusters.slice(0, 3)
 const pillars = snapshot.inferredProfile.contentPillars.slice(0, 3)
 const topVideo = evidencePack.topVideos[0]
 const strongestLane = clusters[0] || pillars[0] || snapshot.inferredProfile.niche || "the clearest viewer promise in your channel data"
 const titleExample = topVideo?.title ? `"${topVideo.title}"` : "your strongest comparable upload"
 const asksProjection = /\b(project|projection|pace|forecast|goal path|30[- ]day)\b/i.test(requestText)
 const asksOracle = /\b(daily oracle|quick win|today's priority|today)\b/i.test(requestText)
 const asksBestVideo = /\b(best|most successful|top)\b.*\b(video|upload)\b/i.test(requestText)
 const asksPackaging = /\b(title|thumbnail|ctr|packaging|hook)\b/i.test(requestText)
 const asksSeries = /\b(series|episodes|schedule|recurring)\b/i.test(requestText)
 const asksRevenue = mode === "revenue_levers" || /\b(revenue|rpm|monetiz|income|money)\b/i.test(requestText)
 if (asksOracle) {
  return [
   moduleFor(
    "daily-priority",
    "Daily Priority",
    `Focus today's work on ${strongestLane}. One focused move beats checking every metric or changing several creative variables at once.`,
    "green",
    "oracle",
   ),
   moduleFor(
    "quick-win",
    "Quick Win",
    topVideo?.title
     ? `Use ${titleExample} as the reference and improve one related title, hook, pinned comment, Short, or community prompt today.`
     : `Pick one upcoming upload and make its viewer payoff obvious in the title, opening hook, and thumbnail promise.`,
    "yellow",
    "oracle",
   ),
   moduleFor(
    "measurable-action",
    "Measurable Action",
    "Before tomorrow, finish one asset you can judge: one rewritten title, one thumbnail variant, one Short cutdown, one hook draft, or one publish-ready outline.",
    "pink",
    "oracle",
   ),
  ]
 }

 const evidenceRanking = buildEvidenceRankingModule(evidencePack)

 if (asksBestVideo) {
  return [
   moduleFor(
    "best-video-autopsy",
    "Best Video Autopsy",
    topVideo?.title
     ? `${titleExample}${topVideo.metrics.views !== null ? ` is the strongest available video signal here with ${topVideo.metrics.views.toLocaleString()} views.` : " is the strongest available video signal here."} Treat it as the control sample for topic, promise, pacing, and packaging.`
     : "I need more complete video performance evidence before naming a true winner, but the right analysis is still the same: compare topic, promise, title clarity, thumbnail, hook, retention, and subscriber conversion.",
    "blue",
    "analytics",
   ),
   moduleFor(
    "why-it-worked",
    "Why It Worked",
    `Look for the viewer payoff behind ${titleExample}: what problem it solved, what curiosity it opened, what visual promise it made, and how quickly the video delivered on that promise.`,
    "yellow",
    "analytics",
   ),
   moduleFor(
    "repeat-this-pattern",
    "Repeat This Pattern",
    `Make one new upload that repeats the same viewer payoff and structure, but changes the specific topic angle so it feels like a sequel, not a copy.`,
    "green",
    "growth",
   ),
   ...(evidenceRanking ? [evidenceRanking] : []),
  ]
 }

 const modules: AIBrainAnswerModule[] = [
  moduleFor("what-to-do-next", "What To Do Next", action || keyInsight, "green"),
 ]

 if (mode === "analytics_diagnosis" || /\b(why|analytics|views|subscribers|watch time|retention)\b/i.test(requestText)) {
  modules.push(moduleFor(
   "why-this-is-happening",
   "Why This Is Happening",
   body || `The useful signal is which videos, promises, and topics repeatedly create views, subscribers, comments, and watch time. Start with ${strongestLane} and compare it against recent uploads.`,
   "blue",
   "analytics",
  ))
  // Show the ranked videos the read is standing on, not just the claim.
  if (evidenceRanking) modules.push(evidenceRanking)
 }

 if (asksBestVideo || mode === "strategy_brief" || mode === "video_idea_sprint") {
  modules.push(moduleFor(
   "repeat-this-pattern",
   "Repeat This Pattern",
   `Use ${titleExample} as the control sample. Keep the same viewer payoff and structure, then change the topic angle so it feels fresh rather than copied.`,
   "pink",
   "analytics",
  ))
 }

 if (asksPackaging || mode === "seo_keyword_plan" || mode === "publishing_checklist") {
  modules.push(moduleFor(
   "title-thumbnail-test",
   "Title/Thumbnail Test",
   `Test one clear promise around ${strongestLane}: a direct benefit title, a curiosity title, and a thumbnail that shows the outcome before the viewer clicks.`,
   "orange",
   "seo",
  ))
 }

 if (asksProjection || mode === "goal_coach") {
  modules.push(moduleFor(
   "thirty-day-goal-path",
   "30-Day Goal Path",
   "Pick one 30-day target for views, subscribers, watch time, revenue, output, CTR, comments, or RPM. Then every recommendation should either increase discovery, improve conversion, or make publishing more consistent.",
   "yellow",
   "oracle",
  ))
 }

 if (asksSeries) {
  modules.push(moduleFor(
   "series-opportunity",
   "Series Opportunity",
   `Build a named series around ${strongestLane}. Viewers should know what they get every time they see the series.`,
   "pink",
   "journal",
  ))
 }

 if (asksRevenue) {
  modules.push(moduleFor(
   "revenue-lever",
   "Revenue Lever",
   "Separate revenue growth into three levers: better earning topics, stronger viewer retention, and clearer paths from video to offer, product, membership, sponsor, or next watch.",
   "yellow",
   "analytics",
  ))
 }

 if (modules.length < 2) {
  modules.push(moduleFor(
   "audience-clue",
   "Audience Clue",
   `The next upload should make the audience promise obvious: who it is for, what they get, and why ${strongestLane} matters now.`,
   "blue",
   "analytics",
  ))
 }

 return modules.slice(0, 4)
}

const splitSentences = (value: string): string[] => {
 const clean = sanitizeCreatorBrainMarkdown(value)
 const sentences = clean.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [clean]
 return sentences.map((sentence) => sentence.trim()).filter(Boolean)
}

const isVagueNicheAnswer = (value: string): boolean => {
 const lower = value.toLowerCase()
 return (
  lower.includes("identify your niche") ||
  lower.includes("must look past") ||
  lower.includes("focus on the signal") ||
  lower.includes("what niche name would you") ||
  lower.includes("still fuzzy")
 )
}

export const buildBrainLearningQuestions = (
 snapshot: AIBrainContextSnapshot,
): CreatorBrainLearningQuestion[] => {
 const questions: CreatorBrainLearningQuestion[] = []
 const hasInferredNiche = Boolean(snapshot.inferredProfile.niche && snapshot.inferredProfile.videoCount > 0)
 if (hasInferredNiche) {
  const lanes = snapshot.inferredProfile.topicClusters.slice(0, 3).join(", ")
  questions.push({
   id: "confirm-inferred-lane",
   question: `I’m seeing your strongest lanes as ${lanes || "the profile signals above"}. Which one should the Brain prioritize first?`,
   reason: "The Brain inferred your channel profile from synced YouTube evidence and needs owner priority, not a blank niche label.",
   category: "channel_fact",
   confidence: snapshot.inferredProfile.nicheConfidence === "high" ? "medium" : "low",
  })
 } else if (!snapshot.brain.targetNiche && !snapshot.brain.coreConcept) {
  questions.push({
   id: "confirm-niche",
   question: "What niche name would you actually use for your channel right now?",
   reason: "The Brain should not flatten your channel into a generic label.",
   category: "channel_fact",
   confidence: "low",
  })
 }
 if (snapshot.brain.goals === 0) {
  questions.push({
   id: "primary-goal",
   question: "Which result matters most this month: views, subscribers, revenue, watch time, consistency, or a better creative workflow?",
   reason: "Your primary goal changes how the Brain ranks strategy advice.",
   category: "creator_goal",
   confidence: "medium",
  })
 }
 if (!snapshot.brain.contentDNA) {
  questions.push({
   id: "content-style",
   question: "What should your videos feel like to the right viewer: practical, cinematic, funny, premium, fast, calm, or something else?",
   reason: "Content style helps the Brain personalize hooks, scripts, thumbnails, and edits.",
   category: "content_style",
   confidence: "low",
  })
 }
 return questions.slice(0, 2)
}

/**
 * Distinctive words from a phrase, for loose matching. A title is "referenced" if
 * the answer mentions the title itself or one of its distinctive words, so we don't
 * demand an exact quote to count an answer as grounded.
 */
const distinctiveWords = (phrase: string): string[] =>
 cleanProfileText(phrase)
  .toLowerCase()
  .replace(/[^a-z0-9 ]+/g, " ")
  .split(/\s+/)
  .filter((word) => word.length >= 5 && !PROFILE_STOP_WORDS.has(word))

/**
 * The anti-generic guarantee.
 *
 * When the channel has concrete evidence (a real top video, topic clusters, search
 * terms), an answer must reference at least one of those specifics rather than
 * reading like advice that would fit any channel. When there is no evidence, the
 * answer must instead name what is missing. This is what stops the Brain from
 * repeating the same anecdote to every creator.
 */
export const bindResponseToEvidence = (
 keyInsight: string,
 body: string,
 snapshot: AIBrainContextSnapshot,
 evidencePack: AIBrainEvidencePack,
): { keyInsight: string; body: string } => {
 const topVideo = evidencePack.topVideos[0]?.title || snapshot.inferredProfile.topEvidenceVideos[0]?.title || ""
 const clusters = snapshot.inferredProfile.topicClusters.slice(0, 5).filter(Boolean)
 const searchTerms = evidencePack.searchTerms.map((term) => term.value).filter(Boolean)
 const specifics = [topVideo, ...clusters, ...searchTerms].filter(Boolean)
 const combined = `${keyInsight} ${body}`.toLowerCase()

 if (specifics.length) {
  const alreadyGrounded = specifics.some((specific) => {
   const lower = specific.toLowerCase()
   if (combined.includes(lower)) return true
   return distinctiveWords(specific).some((word) => combined.includes(word))
  })
  if (alreadyGrounded) return { keyInsight, body }

  const anchor = topVideo
   ? `Working from your channel, "${topVideo}" is the strongest signal I have to build on.`
   : `Working from your channel, ${readableList(clusters.length ? clusters : searchTerms)} is where the clearest signal sits.`
  return { keyInsight, body: `${anchor}\n\n${body}`.trim() }
 }

 // No specifics available: make sure the answer admits it instead of bluffing.
 const missing = evidencePack.missingInputs[0]
 if (missing && !/\b(connect|sync|don'?t have|need|missing|once i|tell me)\b/i.test(combined)) {
  const note = `I don't have ${missing} yet, so treat this as general guidance until we connect it.`
  return { keyInsight, body: `${body}\n\n${note}`.trim() }
 }
 return { keyInsight, body }
}

export const formatCreatorBrainResponse = (
 rawText: string,
 snapshot: AIBrainContextSnapshot,
 options: {
  requestText?: string
  evidencePack?: AIBrainEvidencePack
 } = {},
): CreatorBrainResponse => {
 const evidencePack = options.evidencePack || snapshot.evidencePack
 const clean = sanitizeCreatorBrainMarkdown(rawText)
 // Route by the creator's question. Falling back to the generated body only when no
 // request text is available; otherwise the answer's own wording (e.g. a niche reply
 // mentioning "views") would hijack the mode and make every answer look the same.
 const mode = responseModeForText(
  options.requestText?.trim() || `${rawText} ${snapshot.brain.targetNiche} ${snapshot.brain.coreConcept}`,
 )
 const shouldUseProfileLead = Boolean(snapshot.inferredProfile.niche && isVagueNicheAnswer(clean))
 const confidence =
  snapshot.inferredProfile.status === "ready" ? "high"
  : snapshot.inferredProfile.status === "partial" && snapshot.inferredProfile.videoCount > 0 ? "medium"
  : snapshot.vtSync.diagnostics.status === "complete" && snapshot.brain.journalEntries > 0 ? "high"
  : snapshot.vtSync.source === "empty" ? "low"
  : "medium"
 const evidenceExamples = evidencePack.topVideos.slice(0, 2).map((video) =>
  `“${video.title}”${video.metrics.views !== null ? ` (${video.metrics.views.toLocaleString()} views)` : ""}`,
 )
 let body = clean || "Tell me the decision you are trying to make, and I’ll use the channel evidence available here to give you a practical next move."
 if (shouldUseProfileLead) {
  body = [
   snapshot.inferredProfile.niche,
   evidenceExamples.length
    ? `The clearest examples in the current channel data are ${readableList(evidenceExamples)}.`
    : "The available titles and channel description point in that direction, but the performance evidence is still incomplete.",
   "Start with the lane that best matches where you want the channel to go, then use it to shape the next title, thumbnail promise, and opening hook.",
  ].join("\n\n")
 }
 let questionSeen = false
 body = body.replace(/\?/g, () => {
  if (questionSeen) return "."
  questionSeen = true
  return "?"
 })
 const provisionalKeyInsight = splitSentences(body)[0] || body
 const grounded = bindResponseToEvidence(provisionalKeyInsight, body, snapshot, evidencePack)
 body = grounded.body
 const sentences = splitSentences(body)
 const keyInsight = sentences[0] || body
 const actions = sentences
  .slice(1)
  .filter((sentence) => /\b(try|build|make|focus|publish|update|test|use|open|start|review|choose|compare|repeat)\b/i.test(sentence))
  .slice(0, 1)
 const requestText = options.requestText || ""
 const explicitlyRequestsQuestions = /\b(ask me|question me|what do you need|clarify with me)\b/i.test(requestText)
 const needsMissingContextQuestion = evidencePack.dataStatus === "missing" && !snapshot.brain.targetNiche && !snapshot.brain.coreConcept
 const questions = !questionSeen && (explicitlyRequestsQuestions || needsMissingContextQuestion)
  ? buildBrainLearningQuestions(snapshot).slice(0, 1)
  : []
 const modules = formatIntentModules({
  mode,
  body,
  keyInsight,
  action: actions[0],
  snapshot,
  evidencePack,
  requestText,
 })

 return {
  id: `creator_response_${Date.now()}`,
  mode,
  body,
  evidenceIds: evidencePack.evidenceIds,
  nextAction: actions[0],
  headline: titleForMode(mode),
  keyInsight,
  evidenceChips: [],
  sections: modules.map((item) => ({
   id: item.id,
   title: item.title,
   body: item.body,
   tone: item.tone,
  })),
  modules,
  actions,
  learningSummary: evidencePack.evidenceIds.length
   ? `This reply used ${evidencePack.evidenceIds.length} current channel evidence sources.`
   : "This reply avoided making channel claims because current evidence is unavailable.",
  questions,
  confidence,
 }
}

export const buildCreatorBrainLocalFallback = (
 requestText: string,
 snapshot: AIBrainContextSnapshot,
): string => {
 const lower = requestText.toLowerCase()
 const evidencePack = snapshot.evidencePack
 const topVideo = evidencePack.topVideos[0]
 const topVideoText = topVideo?.title
  ? `"${topVideo.title}"${topVideo.metrics.views !== null ? ` is the strongest available video signal here with ${topVideo.metrics.views.toLocaleString()} views` : " is the strongest available video signal here"}`
  : "I do not have enough ranked video evidence loaded in this view to name a true winner"
 const clusters = snapshot.inferredProfile.topicClusters.slice(0, 3).filter(Boolean)
 const pillars = snapshot.inferredProfile.contentPillars.slice(0, 3).filter(Boolean)
 const lane = clusters[0] || pillars[0] || snapshot.inferredProfile.niche || "your clearest repeatable viewer promise"
 const laneList = clusters.length ? readableList(clusters) : lane

 if (/\b(daily oracle|quick win|today's priority|today)\b/.test(lower)) {
  return [
   `Today’s priority is to make one measurable improvement around ${lane}.`,
   topVideo?.title
    ? `Quick win: use ${topVideoText} as the reference and create one related title, hook, Short cutdown, pinned comment, or community prompt.`
    : "Quick win: choose one upcoming upload and make the viewer payoff clearer in the title, opening hook, and thumbnail promise.",
   "Measurable action: finish one asset before tomorrow, such as one rewritten title, one thumbnail direction, one Short outline, one hook draft, or one publish-ready outline.",
  ].join(" ")
 }

 if (/\b(best|most successful|top)\b.*\b(video|upload)\b/.test(lower)) {
  return [
   topVideoText + ".",
   "Do not only copy the topic. Break down why it worked: viewer promise, title clarity, thumbnail expectation, first 30 seconds, pacing, and the reason someone would share or comment.",
   "The next useful move is to make a sequel-style upload that repeats the same viewer payoff while changing the specific topic angle.",
  ].join(" ")
 }

 // Everything else routes through the same classifier the headline uses, so the
 // body and headline can never disagree and different questions get different bodies.
 const mode = responseModeForText(requestText)

 if (mode === "video_idea_sprint") {
  return [
   `For your next tests, pull ideas straight from ${laneList}${topVideo?.title ? `, using "${topVideo.title}" as the proven template` : ""}.`,
   "Pick three angles on that lane: a beginner entry point, a surprising counter-take, and a direct answer to a question your audience keeps asking.",
   "Test one idea at a time so you can see which angle your viewers and the algorithm actually reward.",
  ].join(" ")
 }

 if (mode === "seo_keyword_plan") {
  return [
   `Package the next video around ${lane} with one clear viewer promise.`,
   "Create three title angles: direct benefit, curiosity gap, and specific outcome. Pair each with a thumbnail that shows the result before the viewer reads the full title.",
   "The best test is the version a new viewer can understand in under two seconds.",
  ].join(" ")
 }

 if (mode === "revenue_levers") {
  return [
   "Separate revenue growth into audience growth, retention, and revenue efficiency.",
   `Use ${lane} to create videos that attract the right viewer for longer sessions, then add a clearer path to the next watch, product, membership, sponsor, or offer.`,
   "For the next 30 days, track revenue alongside views, RPM, watch time, and subscriber conversion so the channel does not chase low-value traffic.",
  ].join(" ")
 }

 if (mode === "analytics_diagnosis") {
  return [
   topVideo?.title
    ? `To read your view trend, compare recent uploads against ${topVideoText}.`
    : "To read your view trend, compare your recent uploads against your strongest past uploads.",
   `Walk the funnel in order: impressions and click-through decide who arrives, the first 30 seconds and pacing decide who stays, and how well the topic fits ${lane} decides who subscribes.`,
   "Change one variable at a time so you can tell which link in that chain actually moved.",
  ].join(" ")
 }

 if (mode === "goal_coach") {
  return [
   "Pick one primary 30-day result before changing the content plan.",
   "Use views for discovery, subscribers for audience fit, watch time for video quality, revenue for business strength, and output for workflow consistency.",
   `The best first goal is the one that helps ${lane} become repeatable, not just bigger.`,
  ].join(" ")
 }

 if (mode === "publishing_checklist") {
  return [
   `Build a publishing rhythm around ${lane} that you can actually sustain.`,
   "Decide the one format you can ship on schedule, then protect that slot before adding Shorts, community posts, or extras.",
   "A cadence the audience can predict beats occasional bursts the algorithm cannot learn from.",
  ].join(" ")
 }

 if (mode === "journal_reflection") {
  return [
   `Reflect on what makes ${lane} yours: the angle, tone, or promise only your channel delivers.`,
   "Write down the one thing your best videos have in common so future recommendations protect it instead of diluting it.",
  ].join(" ")
 }

 // strategy_brief: niche-specific when the creator asks about positioning, else general.
 if (/\b(niche|positioning|identity|fuzzy|clearest|position)\b/.test(lower)) {
  return [
   `Your clearest current lane appears to be ${laneList}.`,
   "The fuzzy part is deciding which lane should lead the next 30 days instead of letting every strong topic compete for the channel identity.",
   `Prioritize ${lane} for the next test cycle, then judge it by views, subscriber conversion, comments, and watch time.`,
  ].join(" ")
 }

 return [
  `Start with ${lane} and turn it into one concrete creator action.`,
  "The most useful next move is to improve one upcoming upload, not ask the Brain for a broad diagnosis.",
  "Choose one video idea, title, thumbnail, hook, or 30-day goal and I can turn it into a practical plan.",
 ].join(" ")
}

export const buildAIBrainSystemPrompt = (input: AIBrainContextInput): string => {
 const snapshot = buildAIBrainContextSnapshot(input)
 const assistantSnapshot = buildAssistantIntelligenceSnapshot(input)
 const creatorPromptContext = {
  channel: snapshot.channel,
  brain: snapshot.brain,
  inferredProfile: snapshot.inferredProfile,
  conversations: snapshot.conversations,
  creatorGrowthContext: input.creatorGrowthContext || null,
  creatorData: {
   videos: snapshot.vtSync.videos,
   dailyRows: snapshot.vtSync.dailyRows,
   trafficRows: snapshot.vtSync.trafficRows,
   dataNote:
    snapshot.vtSync.source === "empty"
     ? "More channel history will make the advice sharper."
     : "Use available channel history for creator growth advice without discussing internal data plumbing.",
  },
 }
 return [
  "IDENTITY: You are ViewTube Copilot inside the ViewTube Brain Hub.",
  "ROLE: You help a YouTube creator understand their channel, goals, content style, analytics, audience, revenue, SEO, planning, publishing, and next best actions.",
  "OPERATING RULES:",
  "1. Speak to the creator, not to developers. Be practical, specific, and useful.",
  "2. Use Brain memory, AI Journal, goals, daily tasks, connected channel analytics, generation records, workflows, and command history as context.",
  "3. If an inferred channel profile exists, use it as the starting point before asking onboarding questions. Ask the creator to confirm priorities, not to define the niche from scratch.",
  "4. If evidence is missing, say what you need in normal creator language. Do not pretend missing analytics are zero.",
  "5. You may prepare reviewed command handoffs, but you cannot sync, upload, delete, publish, render, or mutate YouTube directly.",
  "6. Do not use raw markdown markers, code fences, backticks, JSON blocks, internal tool ids, or developer-facing labels in the final answer.",
  "7. Vary the answer shape based on intent: strategy brief, analytics diagnosis, SEO plan, idea sprint, journal reflection, goal coach, publishing checklist, or revenue levers.",
  "8. End with 1-2 intentional questions only when the answer would improve if the Brain knew more about the creator or channel.",
  "9. Do not mention sync failures, bundles, manifests, APIs, functions, databases, internal diagnostics, or implementation details to the creator.",
  "10. Keep every answer focused on YouTube success: stronger content, better titles and thumbnails, views, subscribers, comments, likes, watch time, revenue, consistency, output, publishing, SEO, and audience fit.",
  snapshot.inferredProfile.contextBlock ? `\nINFERRED CHANNEL PROFILE:\n${snapshot.inferredProfile.contextBlock}` : "",
  "",
  "CREATOR-SAFE BRAIN CONTEXT:",
  JSON.stringify(creatorPromptContext, null, 2),
  "",
  "ASSISTANT SYSTEM REGISTRY:",
  assistantSnapshot,
 ].join("\n")
}

export const queueAIBrainReviewedAction = async (input: {
 request: string
 response?: string
 channelId?: string | null
 priority?: BrainCommandAction["priority"]
 confidence?: BrainCommandAction["confidence"]
}): Promise<AIBrainChatHandoff> => {
 const queued = await queueAssistantCommand(input)
 const target = resolveAIBrainToolRoute(queued.targetToolId, queued.action.id)
 return {
  action: queued.action,
  recordId: queued.recordId,
  workflowId: queued.workflowId,
  route: target.route,
  targetTitle: target.title,
  reviewOnly: isReviewOnlyBrainCommandAction(queued.action),
 }
}
