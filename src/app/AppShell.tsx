import React, { createContext, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Sparkles, Crown } from "lucide-react";
import { Sidebar } from "../components/Sidebar";
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

  useEffect(() => {
    const sync = () => {
      const next = syncEntitlementIfDrifted();
      setEntitlement((previous) =>
        entitlementStatesEqual(previous, next) ? previous : next,
      );
    };
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(ENTITLEMENT_CHANGED_EVENT, sync as EventListener);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(ENTITLEMENT_CHANGED_EVENT, sync as EventListener);
    };
  }, []);

  const isLarge = entitlement.tier === "large";
  const isFree = entitlement.tier === "free";
  const isEditorSurface =
    location.pathname === "/editor-v1" || location.pathname === "/internal/editor-v1-legacy";
  const tokenText =
    isLarge ? "UNLIMITED" : `${Math.max(0, Math.floor(entitlement.creditBalance)).toLocaleString()} CREDITS`;

  return (
    <div className="flex h-screen w-screen bg-[#f3f4f6] overflow-hidden font-sans">
      <Sidebar />
      <main
        className={`flex-1 h-full overflow-y-auto overflow-x-hidden relative ${
          isEditorSurface ? "p-2 pb-2" : "p-8 pb-96"
        }`}
      >

        <EntitlementContext.Provider value={entitlement}>{children}</EntitlementContext.Provider>
      </main>
    </div>
  );
};
