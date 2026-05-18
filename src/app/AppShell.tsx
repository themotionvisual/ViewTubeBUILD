import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { TopBar } from "../components/TopBar";
import { DashboardProvider } from "../context/DashboardContext";
import {
  ENTITLEMENT_CHANGED_EVENT,
  entitlementStatesEqual,
  readCurrentEntitlement,
  syncEntitlementIfDrifted,
  type EntitlementState,
} from "../services/billingEntitlement";

interface AppShellProps {
  children: React.ReactNode;
}

const EntitlementContext = createContext<EntitlementState | null>(null);

export const useEntitlement = (): EntitlementState => {
  const context = useContext(EntitlementContext);
  if (!context) return readCurrentEntitlement();
  return context;
};

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const location = useLocation();
  const [entitlement, setEntitlement] = useState<EntitlementState>(() => readCurrentEntitlement());
  const [sidebarHidden, setSidebarHidden] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("vt_sidebar_hidden") === "1";
  });

  useEffect(() => {
    const sync = () => {
      const next = syncEntitlementIfDrifted();
      setEntitlement((previous) =>
        entitlementStatesEqual(previous, next) ? previous : next,
      );
    };
    const onEntitlementChanged = (event: Event) => {
      const detail = (event as CustomEvent<EntitlementState>).detail;
      if (!detail) {
        sync();
        return;
      }
      setEntitlement((previous) =>
        entitlementStatesEqual(previous, detail) ? previous : detail,
      );
    };
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(ENTITLEMENT_CHANGED_EVENT, onEntitlementChanged as EventListener);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(ENTITLEMENT_CHANGED_EVENT, onEntitlementChanged as EventListener);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("vt_sidebar_hidden", sidebarHidden ? "1" : "0");
  }, [sidebarHidden]);

  const isLarge = entitlement.tier === "large";
  const isFree = entitlement.tier === "free";
  const isEditorSurface =
    location.pathname === "/editor" || location.pathname === "/editor-v1";
  const tokenText =
    isLarge ? "UNLIMITED" : `${Math.max(0, Math.floor(entitlement.creditBalance)).toLocaleString()} CREDITS`;

  return (
    <DashboardProvider>
      <div className="flex flex-col h-screen w-screen bg-[#f3f4f6] overflow-hidden font-sans">
        <TopBar
          sidebarHidden={sidebarHidden}
          onToggleSidebar={() => setSidebarHidden((value) => !value)}
        />
        <div className="flex flex-1 h-0 w-full overflow-visible relative">
          {!sidebarHidden ? <Sidebar onHide={() => setSidebarHidden(true)} /> : null}
          <main
            className={`flex-1 h-full overflow-y-auto overflow-x-hidden relative ${
              isEditorSurface ? "p-2 pb-2" : "p-8 pb-96"
            }`}
          >
            <EntitlementContext.Provider value={entitlement}>{children}</EntitlementContext.Provider>
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
};
