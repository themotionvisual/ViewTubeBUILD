// src/context/GlobalDataContext.tsx
import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { WorkspaceBrain, AppTool } from '../types';

interface GlobalDataContextProps {
  brain: WorkspaceBrain;
  updateBrain: (updates: Partial<WorkspaceBrain>) => void;
  registerProvider: (tool: AppTool) => void;
  unregisterProvider: (tool: AppTool) => void;
  setSeoState: (updates: Partial<WorkspaceBrain['seoState']>) => void;
  setStoryboardState: (updates: Partial<WorkspaceBrain['storyboardState']>) => void;
  setThumbnailState: (updates: Partial<WorkspaceBrain['thumbnailState']>) => void;
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
    pacingHealth: 'Excellent'
  },
  thumbnailState: {
    selectedStyle: 'Cinematic',
    activeImageUrl: null
  },
  analyticalConstraints: {
    provenFormats: [],
    forbiddenTopics: []
  },
  channelyticsState: {
    csvFiles: [],
    allData: [],
    analyticsResult: null
  },
  projects: [
    {
      id: 'p1',
      name: 'Channel Trailer v2',
      status: 'scripting',
      color: '#CCFF00',
      publishDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split('T')[0],
      tasks: [
        { id: 't1', text: 'Finalize Script', completed: false, dueDate: new Date().toISOString().split('T')[0] }
      ]
    }
  ],
  calendarState: {
    dayTasks: {}
  }
};

const GlobalDataContext = createContext<GlobalDataContextProps | undefined>(undefined);

export const GlobalDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [brain, setBrain] = useState<WorkspaceBrain>(defaultBrain);

  const updateBrain = (updates: Partial<WorkspaceBrain>) => {
    setBrain((prev) => ({ ...prev, ...updates }));
  };

  const registerProvider = (tool: AppTool) => {
    setBrain((prev) => {
      if (prev.activeProviders.includes(tool)) return prev;
      return { ...prev, activeProviders: [...prev.activeProviders, tool] };
    });
  };

  const unregisterProvider = (tool: AppTool) => {
    setBrain((prev) => ({
      ...prev,
      activeProviders: prev.activeProviders.filter(p => p !== tool)
    }));
  };

  const setSeoState = (updates: Partial<WorkspaceBrain['seoState']>) => {
    setBrain((prev) => ({
      ...prev,
      seoState: { ...prev.seoState, ...updates }
    }));
  };

  const setStoryboardState = (updates: Partial<WorkspaceBrain['storyboardState']>) => {
    setBrain((prev) => ({
      ...prev,
      storyboardState: { ...prev.storyboardState, ...updates }
    }));
  };

  const setThumbnailState = (updates: Partial<WorkspaceBrain['thumbnailState']>) => {
    setBrain((prev) => ({
      ...prev,
      thumbnailState: { ...prev.thumbnailState, ...updates }
    }));
  };

  return (
    <GlobalDataContext.Provider value={{
      brain,
      updateBrain,
      registerProvider,
      unregisterProvider,
      setSeoState,
      setStoryboardState,
      setThumbnailState
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
