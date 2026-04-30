import React, { createContext, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  const tokenText =
    isLarge ? "UNLIMITED" : `${Math.max(0, Math.floor(entitlement.tokenBalance)).toLocaleString()} TOKENS`;

  return (
    <div className="flex h-screen w-screen bg-[#f3f4f6] overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden p-8 relative pb-96">

        <EntitlementContext.Provider value={entitlement}>{children}</EntitlementContext.Provider>
      </main>
    </div>
  );
};
