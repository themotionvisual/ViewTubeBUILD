import React, { createContext, useCallback, useContext, useState, ReactNode } from 'react';
import { loadDashboardLayout } from '../views/dashboard/storage';

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
  registerActions: (actions: {
    exportLayout: () => void;
    importLayout: () => void;
    resetLayout: () => void;
    toggleLock: () => void;
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
  } | null>(null);

  const registerActions = useCallback((newActions: {
    exportLayout: () => void;
    importLayout: () => void;
    resetLayout: () => void;
    toggleLock: () => void;
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
      registerActions: () => {},
    };
  }
  return context;
};
