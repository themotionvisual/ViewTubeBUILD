import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  registerActions: (actions: {
    exportLayout: () => void;
    importLayout: () => void;
    resetLayout: () => void;
  }) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [editMode, setEditMode] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [actions, setActions] = useState<{
    exportLayout: () => void;
    importLayout: () => void;
    resetLayout: () => void;
  } | null>(null);

  const registerActions = (newActions: {
    exportLayout: () => void;
    importLayout: () => void;
    resetLayout: () => void;
  }) => {
    setActions(newActions);
  };

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
        registerActions,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

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
      registerActions: () => {},
    };
  }
  return context;
};
