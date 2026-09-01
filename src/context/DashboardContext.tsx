import React, { createContext, useCallback, useContext, useState, ReactNode } from 'react';
import { loadDashboardLayout } from '../views/dashboard/storage';
import type { DashboardLayoutState } from '../views/dashboard/types';
import type {
  DashboardMoveDirection,
  DashboardResizeDirection,
  DashboardVisibilityChanges,
} from '../views/dashboard/dashboardMiniLayout';

interface DashboardRegisteredActions {
  exportLayout: () => void;
  importLayout: () => void;
  resetLayout: () => void;
  toggleLock: () => void;
  toggleWidget?: (widgetId: string) => void;
  toggleWidgetCollapse?: (widgetId: string) => void;
  moveWidget?: (widgetId: string, direction: DashboardMoveDirection) => void;
  resizeWidget?: (widgetId: string, direction: DashboardResizeDirection) => void;
  applyWidgetVisibility?: (changes: DashboardVisibilityChanges) => void;
  showAllWidgets?: () => void;
  hideAllWidgets?: () => void;
  applyPreset?: (presetId: string) => void;
  getLayout?: () => DashboardLayoutState;
}

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
  toggleWidgetCollapse: (widgetId: string) => void;
  moveWidget: (widgetId: string, direction: DashboardMoveDirection) => void;
  resizeWidget: (widgetId: string, direction: DashboardResizeDirection) => void;
  applyWidgetVisibility: (changes: DashboardVisibilityChanges) => void;
  showAllWidgets: () => void;
  hideAllWidgets: () => void;
  applyPreset: (presetId: string) => void;
  getLayout: () => DashboardLayoutState;
  registerActions: (actions: DashboardRegisteredActions) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [editMode, setEditMode] = useState(false);
  const [isLocked, setIsLocked] = useState(() => loadDashboardLayout().locked);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [actions, setActions] = useState<DashboardRegisteredActions | null>(null);

  const registerActions = useCallback((newActions: DashboardRegisteredActions) => {
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
        toggleWidgetCollapse: (id: string) => actions?.toggleWidgetCollapse?.(id),
        moveWidget: (id: string, direction: DashboardMoveDirection) => actions?.moveWidget?.(id, direction),
        resizeWidget: (id: string, direction: DashboardResizeDirection) => actions?.resizeWidget?.(id, direction),
        applyWidgetVisibility: (changes: DashboardVisibilityChanges) => actions?.applyWidgetVisibility?.(changes),
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
      toggleWidgetCollapse: () => {},
      moveWidget: () => {},
      resizeWidget: () => {},
      applyWidgetVisibility: () => {},
      showAllWidgets: () => {},
      hideAllWidgets: () => {},
      applyPreset: () => {},
      getLayout: () => loadDashboardLayout(),
      registerActions: () => {},
    };
  }
  return context;
};
