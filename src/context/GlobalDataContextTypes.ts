import { createContext } from "react"
import type { ReactNode } from "react"
import { getBrainMemory } from "../services/brain"
import type {
 WorkspaceBrain,
 AppTool,
 AuthState,
 ChannelAnalysisSyncStatus,
 VideoSyncBatchState,
 BrainMemorySchema,
 Project,
 ChannelBootPhase,
 ChannelIdentitySnapshot,
 InitialDashboardHydrationStatus,
} from "../types"
import type { AnalyticsSyncAction } from "../services/analytics/SyncPipeline"
import type { ChannelConnectionSnapshot } from "../services/connectionState"

export interface GlobalDataContextProps {
 brain: WorkspaceBrain
 updateBrain: (updates: Partial<WorkspaceBrain>) => void
 registerProvider: (tool: AppTool) => void
 unregisterProvider: (tool: AppTool) => void
 setSeoState: (updates: Partial<WorkspaceBrain["seoState"]>) => void
 setStoryboardState: (
  updates: Partial<WorkspaceBrain["storyboardState"]>,
 ) => void
 setThumbnailState: (updates: Partial<WorkspaceBrain["thumbnailState"]>) => void
 addProject: (project: Project) => void
 updateProject: (id: string, updates: Partial<Project>) => void
 deleteProject: (id: string) => void
 setActiveProject: (id: string | null) => void
 setCalendarState: (updates: Partial<WorkspaceBrain["calendarState"]>) => void
 setChannelHub: (updates: Partial<WorkspaceBrain["channelHub"]>) => void
 setVideoFlags: (
  videoId: string,
  flags: {
   excludeAnalysis?: boolean
   includeOnly?: boolean
   priorityAnalysis?: boolean
  },
 ) => void
 authState: AuthState
 setAuthState: (updates: Partial<AuthState>) => void
 researchLabState: WorkspaceBrain["researchLabState"]
 setResearchLabState: (
  updates: Partial<WorkspaceBrain["researchLabState"]>,
 ) => void
 login: () => void | Promise<void>
 logout: () => void
 connectChannel: () => Promise<void>
 disconnectChannel: () => void
 addJournalEntry: (content: string, category: any) => {
  id: string
  content: string
  category: any
  timestamp: number
 }
 addFollowUp: (id: string, q: string) => void
 answerFollowUp: (id: string, a: string) => void
 answerMicroPoll: (id: string, opt: string) => void
 answerMicroPollRaw?: (id: string, opt: string) => void
 setMicroPolls: (p: any[]) => void
 isSyncing: boolean
 isAuthorizing: boolean
 lastSyncComplete: string | null
 syncStatus: ChannelAnalysisSyncStatus
 syncBatch: VideoSyncBatchState
 activeSyncAction: AnalyticsSyncAction | null
 activeSyncButtonId: string | null
 channelConnection: ChannelConnectionSnapshot
 channelIdentity: ChannelIdentitySnapshot
 channelBootPhase: ChannelBootPhase
 initialDashboardHydrationStatus: InitialDashboardHydrationStatus
 globalSyncData: (options?: {
 batchMode?: "initial" | "next"
  syncAction?: AnalyticsSyncAction
  syncButtonId?: string
  enrichmentMode?: "core" | "video_metrics" | "traffic" | "segments" | "all"
 }) => Promise<void>
 syncChannelData: (options?: {
  batchMode?: "initial" | "next"
  syncAction?: AnalyticsSyncAction
  syncButtonId?: string
  enrichmentMode?: "core" | "video_metrics" | "traffic" | "segments" | "all"
 }) => Promise<void>
 syncMetrics: (force?: boolean) => Promise<void>
 emitSignal: (toolId: string, action: string, payload: any) => Promise<void>
 consultBrain: (toolId: string, requestDetails?: any) => Promise<any>
 getBrainMemory: () => BrainMemorySchema
 reflectAndCompress: () => Promise<void>
 aiModel: string
 setAiModel: (modelId: string) => void
 fetchAndCacheRetention: (videoId: string) => Promise<any[] | null>
}

export const GlobalDataContext = createContext<GlobalDataContextProps | undefined>(
 undefined,
)

export const STORAGE_KEY = "vt_workspace_brain"
export const AUTH_STORAGE_KEY = "vt_auth_state"

export const defaultBrain: WorkspaceBrain = {
 activeProviders: [],
 activeProjectId: null,
 projects: [],
 channelProfile: null,
 recentMetrics: null,
 csvFiles: [],
 coreConcept: "",
 targetNiche: "",
 seoState: {
  winningTitle: null,
  winningKeywords: [],
  descriptionDraft: "",
  results: [],
 },
 storyboardState: {
  scenes: [],
  estimatedDuration: 0,
  pacingHealth: "Warning",
 },
 thumbnailState: {
  selectedStyle: "default",
  colorPalette: "standard",
  conceptDraft: "",
  variations: [],
 },
 analyticalConstraints: {
  provenFormats: [],
  forbiddenTopics: [],
 },
 calendarState: {
  events: [],
  viewMode: "month",
  selectedEventId: null,
 },
 performanceHubState: {
  analyticsWindow: "lifetime",
  syncSourceMode: "both",
  storageMode: "both",
  tableDataset: "master",
  tableSearch: "",
  tableTag: "all",
  selectedRowIds: [],
 },
 researchLabState: {
  activeQuery: "",
  results: [],
  history: [],
 },
 channelHub: {
  competitors: [],
  nicheInsights: [],
  opportunityGaps: [],
 },
 videoFlags: {},
 channelyticsState: {
  allData: [],
  topPerformers: [],
  retentionBenchmarks: [],
  deepSegments: null as any,
 },
 journalEntries: [],
 journalFollowUps: [],
 microPolls: [],
 creatorPreferences: {},
 lastSyncDate: null,
 retentionCache: {},
}

export const defaultAuthState: AuthState = {
 isAuthenticated: false,
 channelHandle: null,
 channelName: null,
 channelThumbnail: null,
 subscriberCount: null,
 totalViews: null,
 videoCount: null,
 syncedAt: null,
}

export const defaultSyncStatus: ChannelAnalysisSyncStatus = {
 phase: "idle",
 startedAt: null,
 completedAt: null,
 lastError: null,
 stages: [],
}

export const defaultSyncBatch: VideoSyncBatchState = {
 initialLimit: 500,
 incrementSize: 250,
 cursor: 0,
 hasMore: false,
 lastBatchCount: 0,
}

export const fallbackContext: GlobalDataContextProps = {
 brain: defaultBrain,
 updateBrain: () => {},
 registerProvider: () => {},
 unregisterProvider: () => {},
 setSeoState: () => {},
 setStoryboardState: () => {},
 setThumbnailState: () => {},
 setCalendarState: () => {},
 setChannelHub: () => {},
 setVideoFlags: () => {},
 addProject: () => {},
 updateProject: () => {},
 deleteProject: () => {},
 setActiveProject: () => {},
 authState: defaultAuthState,
 setAuthState: () => {},
 researchLabState: defaultBrain.researchLabState,
 setResearchLabState: () => {},
 login: () => {},
 logout: () => {},
 connectChannel: async () => {},
 disconnectChannel: () => {},
 isSyncing: false,
 isAuthorizing: false,
 lastSyncComplete: null,
 syncStatus: defaultSyncStatus,
 syncBatch: defaultSyncBatch,
 activeSyncAction: null,
 activeSyncButtonId: null,
 channelConnection: {
  state: "disconnected",
  hasSession: false,
  isVerified: false,
  isConnected: false,
  isSyncing: false,
  hasLocalData: false,
  title: "Not connected",
  subtitle: "Channel not connected",
  helper: "Open popup login once, then every verified surface shares the same session.",
  topBarLabel: "Connect Channel",
  sidebarLabel: "Connect YouTube",
  settingsLabel: "Connect Channel",
  statusLabel: "Not connected",
  channelName: "Not connected",
  handleText: "",
 },
 channelIdentity: {
  channelId: null,
  name: null,
  handle: null,
  avatarUrl: null,
  subscriberCount: null,
  totalViews: null,
  videoCount: null,
  isVerified: false,
  isPartial: true,
  lastHydratedAt: null,
 },
 channelBootPhase: "idle",
 initialDashboardHydrationStatus: {
  identityReady: false,
  lifetimeReady: false,
  inventoryReady: false,
  lastUpdatedAt: null,
 },
 globalSyncData: async () => {},
 syncChannelData: async () => {},
 syncMetrics: async () => {},
 addJournalEntry: (content: string, category: any) => ({
  id: "fallback-journal-entry",
  content,
  category,
  timestamp: Date.now(),
 }),
 addFollowUp: () => {},
 answerFollowUp: () => {},
 answerMicroPoll: () => {},
 answerMicroPollRaw: () => {},
 setMicroPolls: () => {},
 emitSignal: async () => {},
 consultBrain: async () => ({}),
 getBrainMemory: getBrainMemory as () => BrainMemorySchema,
 reflectAndCompress: async () => {},
 aiModel: 'gemini-3.1-flash-lite',
 setAiModel: () => {},
 fetchAndCacheRetention: async () => null,
}

export const defaultChannelIdentity: ChannelIdentitySnapshot = {
 channelId: null,
 name: null,
 handle: null,
 avatarUrl: null,
 subscriberCount: null,
 totalViews: null,
 videoCount: null,
 isVerified: false,
 isPartial: true,
 lastHydratedAt: null,
}

export const defaultInitialDashboardHydrationStatus: InitialDashboardHydrationStatus = {
 identityReady: false,
 lifetimeReady: false,
 inventoryReady: false,
 lastUpdatedAt: null,
}
