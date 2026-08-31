import React, { createContext, useCallback, useContext, useState, ReactNode } from 'react';
import { loadDashboardLayout } from '../views/dashboard/storage';
import type { DashboardLayoutState } from '../views/dashboard/types';

interface DashboardContextType {
  editMode: boolean;
  setEditMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  isLocked: boolean;
  setIsLocked: (val: boolean | ((prev: boolean) => boolean)) => void;
  pickerOpen: boolean;
  setPickerOpen: (val: boolean | ((prev: boolean) => boolean)) => void;
  exportLayout: () => void;
  importLayout: () => void;
  resetLayout: () => void;
  toggleLock: () => void;
  toggleWidget: (widgetId: string) => void;
  showAllWidgets: () => void;
  hideAllWidgets: () => void;
  applyPreset: (presetId: string) => void;
  getLayout: () => DashboardLayoutState;
  registerActions: (actions: {
    exportLayout: () => void;
    importLayout: () => void;
    resetLayout: () => void;
    toggleLock: () => void;
    toggleWidget?: (widgetId: string) => void;
    showAllWidgets?: () => void;
    hideAllWidgets?: () => void;
    applyPreset?: (presetId: string) => void;
    getLayout?: () => DashboardLayoutState;
  }) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [editMode, setEditMode] = useState(false);
  const [isLocked, setIsLocked] = useState(() => loadDashboardLayout().locked);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [actions, setActions] = useState<{
    exportLayout: () => void;
    importLayout: () => void;
    resetLayout: () => void;
    toggleLock: () => void;
    toggleWidget?: (widgetId: string) => void;
    showAllWidgets?: () => void;
    hideAllWidgets?: () => void;
    applyPreset?: (presetId: string) => void;
    getLayout?: () => DashboardLayoutState;
  } | null>(null);

  const registerActions = useCallback((newActions: {
    exportLayout: () => void;
    importLayout: () => void;
    resetLayout: () => void;
    toggleLock: () => void;
    toggleWidget?: (widgetId: string) => void;
    showAllWidgets?: () => void;
    hideAllWidgets?: () => void;
    applyPreset?: (presetId: string) => void;
    getLayout?: () => DashboardLayoutState;
  }) => {
    setActions(newActions);
  }, []);

  return (
    <DashboardContext.Provider
      value={{
        editMode,
        setEditMode,
        isLocked,
        setIsLocked,
        pickerOpen,
        setPickerOpen,
        exportLayout: () => actions?.exportLayout(),
        importLayout: () => actions?.importLayout(),
        resetLayout: () => actions?.resetLayout(),
        toggleLock: () => actions?.toggleLock(),
        toggleWidget: (id: string) => actions?.toggleWidget?.(id),
        showAllWidgets: () => actions?.showAllWidgets?.(),
        hideAllWidgets: () => actions?.hideAllWidgets?.(),
        applyPreset: (presetId: string) => actions?.applyPreset?.(presetId),
        getLayout: () => actions?.getLayout?.() || loadDashboardLayout(),
        registerActions,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

// Context and its hook intentionally share one module so provider fallback behavior stays synchronized.
// eslint-disable-next-line react-refresh/only-export-components
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    return {
      editMode: false,
      setEditMode: () => {},
      isLocked: false,
      setIsLocked: () => {},
      pickerOpen: false,
      setPickerOpen: () => {},
      exportLayout: () => {},
      importLayout: () => {},
      resetLayout: () => {},
      toggleLock: () => {},
      toggleWidget: () => {},
      showAllWidgets: () => {},
      hideAllWidgets: () => {},
      applyPreset: () => {},
      getLayout: () => loadDashboardLayout(),
      registerActions: () => {},
    };
  }
  return context;
};
