import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Crown } from "lucide-react";
import { Sidebar } from "../components/Sidebar";
import {
  ENTITLEMENT_CHANGED_EVENT,
  getCurrentEntitlement,
  type EntitlementState,
} from "../services/billingEntitlement";

interface AppShellProps {
  children: React.ReactNode;
}

const readEntitlement = (): EntitlementState => getCurrentEntitlement();

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [entitlement, setEntitlement] = useState<EntitlementState>(() => readEntitlement());

  useEffect(() => {
    const sync = () => setEntitlement(readEntitlement());
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
        <div className="sticky top-2 z-30 mb-4 flex justify-end pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-2 border-[3px] border-black rounded-xl bg-white px-3 py-2 shadow-[4px_4px_0px_0px_black]">
            <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.08em]">
              {isLarge ? <Crown size={14} /> : <Sparkles size={14} />}
              {entitlement.tier}
            </div>
            <div className="h-4 w-[2px] bg-black" />
            <div className="text-[10px] font-black uppercase tracking-[0.08em]">{tokenText}</div>
            {!isLarge && (
              <Link
                to="/settings?panel=billing"
                className={`text-[10px] font-black uppercase border-[2px] border-black rounded-md px-2 py-1 shadow-[2px_2px_0px_0px_black] ${
                  isFree ? "bg-[#FF8AAF]" : "bg-[#CCFF00]"
                }`}
              >
                {isFree ? "Upgrade" : "Top Up"}
              </Link>
            )}
          </div>
        </div>
        {children}
      </main>
    </div>
  );
};
