// src/context/GlobalDataContext.tsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type {
  WorkspaceBrain,
  AppTool,
  Project,
  AuthState,
  ChannelAnalysisSyncStatus,
  VideoSyncBatchState,
} from '../types';
import { authService } from '../services/authService';

const STORAGE_KEY = 'vt_workspace_brain';
const AUTH_STORAGE_KEY = 'vt_auth_state';

interface GlobalDataContextProps {
  brain: WorkspaceBrain;
  updateBrain: (updates: Partial<WorkspaceBrain>) => void;
  registerProvider: (tool: AppTool) => void;
  unregisterProvider: (tool: AppTool) => void;
  setSeoState: (updates: Partial<WorkspaceBrain['seoState']>) => void;
  setStoryboardState: (updates: Partial<WorkspaceBrain['storyboardState']>) => void;
  setThumbnailState: (updates: Partial<WorkspaceBrain['thumbnailState']>) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setCalendarState: (updates: Partial<WorkspaceBrain['calendarState']>) => void;
  setChannelHub: (updates: Partial<WorkspaceBrain['channelHub']>) => void;
  setActiveProject: (id: string | null) => void;
  setVideoFlags: (
    videoId: string,
    flags: { excludeAnalysis?: boolean; includeOnly?: boolean; priorityAnalysis?: boolean },
  ) => void;
  authState: AuthState;
  setAuthState: (updates: Partial<AuthState>) => void;
  researchLabState: WorkspaceBrain['researchLabState'];
  setResearchLabState: (updates: Partial<WorkspaceBrain['researchLabState']>) => void;
  login: () => void;
  logout: () => void;
  isSyncing: boolean;
  lastSyncComplete: string | null;
  syncStatus: ChannelAnalysisSyncStatus;
  syncBatch: VideoSyncBatchState;
  globalSyncData: (options?: { batchMode?: 'initial' | 'next' }) => Promise<void>;
}

const defaultBrain: WorkspaceBrain = {
  activeProviders: [],
  coreConcept: '',
  targetNiche: '',
  seoState: {
    winningTitle: null,
    winningKeywords: [],
    descriptionDraft: '',
    results: []
  },
  storyboardState: {
    scenes: [],
    estimatedDuration: 0,
    pacingHealth: 'Warning'
  },
  thumbnailState: {
    selectedStyle: 'default',
    activeImageUrl: null,
    prompt: ''
  },
  analyticalConstraints: {
    provenFormats: [],
    forbiddenTopics: []
  },
  projects: [],
  calendarState: { dayTasks: {} },
  channelHub: { toDos: [], goals: [] },
  channelyticsState: { csvFiles: [], allData: [], analyticsResult: null },
  researchLabState: { csvFiles: [], allData: [], analyticsResult: null },
  videoFlags: {}
};

const defaultAuthState: AuthState = {
  isAuthenticated: false,
  channelName: null,
  channelThumbnail: null,
  subscriberCount: null,
  totalViews: null
};

const defaultSyncStatus: ChannelAnalysisSyncStatus = {
  phase: 'idle',
  startedAt: null,
  completedAt: null,
  lastError: null,
  stages: [],
};

const defaultSyncBatch: VideoSyncBatchState = {
  initialLimit: 500,
  incrementSize: 250,
  cursor: 0,
  hasMore: true,
  lastBatchCount: 0,
};

const loadPersistedBrain = (): WorkspaceBrain => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<WorkspaceBrain> & {
        channelHub?: Partial<WorkspaceBrain['channelHub']>;
      };

      return {
        ...defaultBrain,
        ...parsed,
        activeProviders: Array.isArray(parsed.activeProviders) ? parsed.activeProviders : defaultBrain.activeProviders,
        projects: Array.isArray(parsed.projects) ? parsed.projects : defaultBrain.projects,
        seoState: {
          ...defaultBrain.seoState,
          ...(parsed.seoState || {}),
          winningKeywords: Array.isArray(parsed.seoState?.winningKeywords) ? parsed.seoState.winningKeywords : [],
          results: Array.isArray(parsed.seoState?.results) ? parsed.seoState.results : []
        },
        storyboardState: {
          ...defaultBrain.storyboardState,
          ...(parsed.storyboardState || {}),
          scenes: Array.isArray(parsed.storyboardState?.scenes) ? parsed.storyboardState.scenes : []
        },
        thumbnailState: {
          ...defaultBrain.thumbnailState,
          ...(parsed.thumbnailState || {})
        },
        analyticalConstraints: {
          ...defaultBrain.analyticalConstraints,
          ...(parsed.analyticalConstraints || {}),
          provenFormats: Array.isArray(parsed.analyticalConstraints?.provenFormats) ? parsed.analyticalConstraints.provenFormats : [],
          forbiddenTopics: Array.isArray(parsed.analyticalConstraints?.forbiddenTopics) ? parsed.analyticalConstraints.forbiddenTopics : []
        },
        calendarState: {
          ...defaultBrain.calendarState,
          ...(parsed.calendarState || {}),
          dayTasks: parsed.calendarState?.dayTasks || {}
        },
        channelHub: {
          ...defaultBrain.channelHub,
          ...(parsed.channelHub || {}),
          toDos: Array.isArray(parsed.channelHub?.toDos) ? parsed.channelHub.toDos : [],
          goals: Array.isArray(parsed.channelHub?.goals) ? parsed.channelHub.goals : []
        },
        channelyticsState: {
          ...defaultBrain.channelyticsState,
          ...(parsed.channelyticsState || {}),
          csvFiles: Array.isArray(parsed.channelyticsState?.csvFiles) ? parsed.channelyticsState.csvFiles : [],
          allData: Array.isArray(parsed.channelyticsState?.allData) ? parsed.channelyticsState.allData : [],
          analyticsResult: parsed.channelyticsState?.analyticsResult || null
        },
        researchLabState: {
          ...defaultBrain.researchLabState,
          ...(parsed.researchLabState || {}),
          csvFiles: Array.isArray(parsed.researchLabState?.csvFiles) ? parsed.researchLabState.csvFiles : [],
          allData: Array.isArray(parsed.researchLabState?.allData) ? parsed.researchLabState.allData : [],
          analyticsResult: parsed.researchLabState?.analyticsResult || null
        },
        videoFlags: parsed.videoFlags || {}
      };
    }
  } catch (e) {
    console.warn('[Brain] Failed to load persisted state:', e);
  }
  return defaultBrain;
};

const loadPersistedAuth = (): AuthState => {
  try {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (saved) {
      return { ...defaultAuthState, ...JSON.parse(saved), isAuthenticated: authService.isAuthenticated() };
    }
  } catch (e) {
    console.warn('[Auth] Failed to load persisted state:', e);
  }
  return { ...defaultAuthState, isAuthenticated: authService.isAuthenticated() };
};

const GlobalDataContext = createContext<GlobalDataContextProps | undefined>(undefined);
const fallbackContext: GlobalDataContextProps = {
  brain: defaultBrain,
  updateBrain: () => {},
  registerProvider: () => {},
  unregisterProvider: () => {},
  setSeoState: () => {},
  setStoryboardState: () => {},
  setThumbnailState: () => {},
  addProject: () => {},
  updateProject: () => {},
  deleteProject: () => {},
  setCalendarState: () => {},
  setChannelHub: () => {},
  setActiveProject: () => {},
  setVideoFlags: () => {},
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
};

export const GlobalDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [brain, setBrain] = useState<WorkspaceBrain>(loadPersistedBrain);
  const [authState, setAuthStateRaw] = useState<AuthState>(loadPersistedAuth);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncComplete, setLastSyncComplete] = useState<string | null>(
    localStorage.getItem("yt_analytics_last_sync") || null
  );
  const [syncStatus, setSyncStatus] = useState<ChannelAnalysisSyncStatus>(defaultSyncStatus);
  const [syncBatch, setSyncBatch] = useState<VideoSyncBatchState>(() => {
    try {
      const raw = localStorage.getItem("vt_video_sync_batch_state");
      if (!raw) return defaultSyncBatch;
      return { ...defaultSyncBatch, ...(JSON.parse(raw) as Partial<VideoSyncBatchState>) };
    } catch {
      return defaultSyncBatch;
    }
  });

  const globalSyncData = useCallback(async (options?: { batchMode?: 'initial' | 'next' }) => {
    setIsSyncing(true);
    try {
      const { performSync } = await import('../services/analyticsSync');
      await performSync(true, { batchMode: options?.batchMode || 'initial' });
      setLastSyncComplete(new Date().toISOString());
      try {
        const raw = localStorage.getItem("vt_video_sync_batch_state");
        if (raw) {
          setSyncBatch({ ...defaultSyncBatch, ...(JSON.parse(raw) as Partial<VideoSyncBatchState>) });
        }
      } catch {
        // no-op
      }
    } catch (e) {
      console.warn("Global sync failed:", e);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    const onStatus = (event: Event) => {
      const detail = (event as CustomEvent<ChannelAnalysisSyncStatus>).detail;
      if (!detail) return;
      setSyncStatus(detail);
    };
    window.addEventListener("vt_channel_sync_status", onStatus as EventListener);
    return () => {
      window.removeEventListener("vt_channel_sync_status", onStatus as EventListener);
    };
  }, []);

  useEffect(() => {
    // Keep last sync timestamp in sync with any cache reset actions.
    const onLocalDataChanged = () => {
      try {
        setLastSyncComplete(localStorage.getItem("yt_analytics_last_sync") || null);
      } catch {
        setLastSyncComplete(null);
      }
    };
    window.addEventListener("vt_local_data_changed", onLocalDataChanged);
    window.addEventListener("storage", onLocalDataChanged);
    return () => {
      window.removeEventListener("vt_local_data_changed", onLocalDataChanged);
      window.removeEventListener("storage", onLocalDataChanged);
    };
  }, []);

  useEffect(() => {
    try {
      const persistable = { ...brain };
      const toSave = {
        ...persistable,
        channelyticsState: { csvFiles: [], allData: [], analyticsResult: null },
        researchLabState: { csvFiles: [], allData: [], analyticsResult: null }
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.warn('[Brain] Failed to persist state:', e);
    }
  }, [brain]);

  useEffect(() => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
    } catch (e) {
      console.warn('[Auth] Failed to persist state:', e);
    }
  }, [authState]);

  const updateBrain = useCallback((updates: Partial<WorkspaceBrain>) => {
    setBrain((prev) => ({ ...prev, ...updates }));
  }, []);

  const registerProvider = useCallback((tool: AppTool) => {
    setBrain((prev) => {
      if (prev.activeProviders.includes(tool)) return prev;
      return { ...prev, activeProviders: [...prev.activeProviders, tool] };
    });
  }, []);

  const unregisterProvider = useCallback((tool: AppTool) => {
    setBrain((prev) => {
      const filtered = prev.activeProviders.filter(p => p !== tool);
      if (filtered.length === prev.activeProviders.length) return prev;
      return { ...prev, activeProviders: filtered };
    });
  }, []);

  const setSeoState = useCallback((updates: Partial<WorkspaceBrain['seoState']>) => {
    setBrain((prev) => ({
      ...prev,
      seoState: { ...prev.seoState, ...updates }
    }));
  }, []);

  const setStoryboardState = useCallback((updates: Partial<WorkspaceBrain['storyboardState']>) => {
    setBrain((prev) => ({
      ...prev,
      storyboardState: { ...prev.storyboardState, ...updates }
    }));
  }, []);

  const setThumbnailState = useCallback((updates: Partial<WorkspaceBrain['thumbnailState']>) => {
    setBrain((prev) => ({
      ...prev,
      thumbnailState: { ...prev.thumbnailState, ...updates }
    }));
  }, []);

  const addProject = useCallback((project: Project) => {
    setBrain((prev) => ({
      ...prev,
      projects: [...prev.projects, project]
    }));
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setBrain((prev) => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  }, []);

  const deleteProject = useCallback((id: string) => {
    setBrain((prev) => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id)
    }));
  }, []);

  const setActiveProject = useCallback((id: string | null) => {
    setBrain((prev) => ({
      ...prev,
      activeProjectId: id
    }));
  }, []);

  const setVideoFlags = useCallback((videoId: string, flags: { excludeAnalysis?: boolean; includeOnly?: boolean; priorityAnalysis?: boolean }) => {
    setBrain((prev) => ({
      ...prev,
      videoFlags: {
        ...prev.videoFlags,
        [videoId]: {
          ...(prev.videoFlags[videoId] || {}),
          ...flags
        }
      }
    }));
  }, []);

  const setCalendarState = useCallback((updates: Partial<WorkspaceBrain['calendarState']>) => {
    setBrain((prev) => ({
      ...prev,
      calendarState: { ...prev.calendarState, ...updates }
    }));
  }, []);

  const setChannelHub = useCallback((updates: Partial<WorkspaceBrain['channelHub']>) => {
    setBrain((prev) => ({
      ...prev,
      channelHub: { ...prev.channelHub, ...updates }
    }));
  }, []);

  const setResearchLabState = useCallback((updates: Partial<WorkspaceBrain['researchLabState']>) => {
    setBrain((prev) => ({
      ...prev,
      researchLabState: { ...prev.researchLabState, ...updates }
    }));
  }, []);

  const setAuthState = useCallback((updates: Partial<AuthState>) => {
    setAuthStateRaw((prev) => ({ ...prev, ...updates }));
  }, []);

  const login = useCallback(async () => {
    try {
      await authService.login();
      setAuthStateRaw(prev => ({ ...prev, isAuthenticated: true }));
      // Automatically sync all data upon login
      globalSyncData();
    } catch (err) {
      console.warn("User aborted login or auth failed", err);
    }
  }, [globalSyncData]);

  const logout = useCallback(() => {
    setAuthStateRaw(defaultAuthState);
    authService.logout();
  }, []);

  return (
    <GlobalDataContext.Provider value={{
      brain,
      updateBrain,
      registerProvider,
      unregisterProvider,
      setSeoState,
      setStoryboardState,
      setThumbnailState,
      addProject,
      updateProject,
      deleteProject,
      setCalendarState,
      setChannelHub,
      setResearchLabState,
      setActiveProject,
      setVideoFlags,
      authState,
      setAuthState,
      researchLabState: brain.researchLabState,
      login,
      logout,
      isSyncing,
      lastSyncComplete,
      syncStatus,
      syncBatch,
      globalSyncData
    }}>
      {children}
    </GlobalDataContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useBrain = () => {
  const context = useContext(GlobalDataContext);
  if (!context) {
    console.warn('useBrain fallback used (likely HMR boundary mismatch). Reloading the page will restore provider state.');
    return fallbackContext;
  }
  return context;
};
