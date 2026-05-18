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
} from "../types"

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
 login: () => void
 logout: () => void
 addJournalEntry: (content: string, category: any) => void
 addFollowUp: (id: string, q: string) => void
 answerFollowUp: (id: string, a: string) => void
 answerMicroPoll: (id: string, opt: string) => void
 setMicroPolls: (p: any[]) => void
 isSyncing: boolean
 lastSyncComplete: string | null
 syncStatus: ChannelAnalysisSyncStatus
 syncBatch: VideoSyncBatchState
 globalSyncData: (options?: { batchMode?: "initial" | "next" }) => Promise<void>
 syncMetrics: (force?: boolean) => Promise<void>
 emitSignal: (toolId: string, action: string, payload: any) => Promise<void>
 consultBrain: (toolId: string, requestDetails?: any) => Promise<any>
 getBrainMemory: () => BrainMemorySchema
 reflectAndCompress: () => Promise<void>
 aiModel: string
 setAiModel: (modelId: string) => void
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
 calendarState: {
  events: [],
  viewMode: "month",
  selectedEventId: null,
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
 channelyticsState: {
  allData: [],
  topPerformers: [],
  retentionBenchmarks: [],
  deepSegments: null as any,
 },
 retentionCache: {},
}

export const defaultAuthState: AuthState = {
 isAuthenticated: false,
 channelHandle: null,
 channelName: null,
 channelThumbnail: null,
 subscriberCount: 0,
 totalViews: 0,
 videoCount: 0,
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
 isSyncing: false,
 lastSyncComplete: null,
 syncStatus: defaultSyncStatus,
 syncBatch: defaultSyncBatch,
 globalSyncData: async () => {},
 syncMetrics: async () => {},
 addJournalEntry: () => {},
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
}
