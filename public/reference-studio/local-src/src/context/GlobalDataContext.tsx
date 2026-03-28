// src/context/GlobalDataContext.tsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { WorkspaceBrain, AppTool, Project, AuthState } from '../types';
import { authService } from '../services/authService';
import { startAutoSync, stopAutoSync } from '../services/analyticsSync';

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
  authState: AuthState;
  setAuthState: (updates: Partial<AuthState>) => void;
  researchLabState: WorkspaceBrain['researchLabState'];
  setResearchLabState: (updates: Partial<WorkspaceBrain['researchLabState']>) => void;
  login: () => void;
  logout: () => void;
}

const defaultBrain: WorkspaceBrain = {
  activeProviders: [],
  coreConcept: '',
  targetNiche: '',
  activeProjectId: null,
  seoState: { keywordSuggestions: [], titleSuggestions: [], descriptionSuggestions: [], tagSuggestions: [] },
  storyboardState: { scenes: [] },
  thumbnailState: { backgroundUrl: '', overlays: [], textElements: [] },
  projects: [],
  calendarState: { dayTasks: {} },
  channelHub: { dailyGoal: '', monthlyMilestones: [] },
  channelyticsState: { csvFiles: [], allData: [], analyticsResult: undefined },
  researchLabState: { csvFiles: [], allData: [], analyticsResult: null }
};

const defaultAuthState: AuthState = {
  isAuthenticated: false,
  channelName: null,
  channelThumbnail: null,
  subscriberCount: null,
  totalViews: null
};

const loadPersistedBrain = (): WorkspaceBrain => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...defaultBrain, ...JSON.parse(saved) };
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

export const GlobalDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [brain, setBrain] = useState<WorkspaceBrain>(loadPersistedBrain);
  const [authState, setAuthStateRaw] = useState<AuthState>(loadPersistedAuth);

  useEffect(() => {
    try {
      const { channelyticsState, researchLabState, ...persistable } = brain;
      const toSave = {
        ...persistable,
        channelyticsState: { csvFiles: [], allData: channelyticsState.allData, analyticsResult: channelyticsState.analyticsResult },
        researchLabState: { csvFiles: [], allData: researchLabState.allData, analyticsResult: researchLabState.analyticsResult }
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

  useEffect(() => {
    if (authState.isAuthenticated) {
      startAutoSync(30); // Sync every 30 minutes
    } else {
      stopAutoSync();
    }
    return () => stopAutoSync();
  }, [authState.isAuthenticated]);

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

  const login = useCallback(() => {
    authService.login();
  }, []);

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
      authState,
      setAuthState,
      researchLabState: brain.researchLabState,
      login,
      logout
    }}>
      {children}
    </GlobalDataContext.Provider>
  );
};

export const useBrain = () => {
  const context = useContext(GlobalDataContext);
  if (!context) {
    throw new Error('useBrain must be used within a GlobalDataProvider');
  }
  return context;
};
