import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { TopBar } from "../components/TopBar";
import { DashboardProvider } from "../context/DashboardContext";
import { useIsMobile } from "../hooks/use-mobile";
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
  const isMobile = useIsMobile();
  const [entitlement, setEntitlement] = useState<EntitlementState>(() => readCurrentEntitlement());
  const [sidebarHidden, setSidebarHidden] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    // On phones we always start collapsed regardless of the previously stored desktop preference.
    if (window.matchMedia("(max-width: 767px)").matches) return true;
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
    // Only persist the toggle on desktop — on mobile the drawer state is transient.
    if (!window.matchMedia("(max-width: 767px)").matches) {
      localStorage.setItem("vt_sidebar_hidden", sidebarHidden ? "1" : "0");
    }
  }, [sidebarHidden]);

  // Collapse the drawer whenever the route changes on mobile so tapping a link
  // in the drawer navigates and dismisses instead of leaving the overlay open.
  useEffect(() => {
    if (isMobile) setSidebarHidden(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, isMobile]);

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
          {/* Sidebar: inline column on md+, overlay drawer on mobile */}
          {!sidebarHidden && !isMobile ? (
            <Sidebar onHide={() => setSidebarHidden(true)} />
          ) : null}
          {isMobile && !sidebarHidden ? (
            <>
              <div
                role="button"
                aria-label="Close navigation"
                onClick={() => setSidebarHidden(true)}
                className="fixed inset-0 z-[110] bg-black/50"
              />
              <div className="fixed left-0 top-0 bottom-0 w-[240px] z-[115] bg-[#f3f4f6] border-r-[3px] border-black shadow-[6px_0_0_0_rgba(0,0,0,0.15)]">
                <Sidebar onHide={() => setSidebarHidden(true)} />
              </div>
            </>
          ) : null}
          <main
            className={`flex-1 h-full overflow-y-auto overflow-x-hidden relative ${
              isEditorSurface
                // Editor iframe wants every pixel. On mobile we drop the
                // outer padding to zero so the timeline + preview + rail
                // actually fit inside a phone held sideways.
                ? "p-0 md:p-2"
                : "p-3 pb-24 sm:p-6 md:p-8 md:pb-96"
            }`}
          >
            <EntitlementContext.Provider value={entitlement}>{children}</EntitlementContext.Provider>
          </main>
          {location.pathname === "/" && sidebarHidden && !isMobile && (
            <div className="absolute bottom-4 left-4 z-50 flex gap-3 text-[10px] text-gray-500 font-semibold bg-white/80 backdrop-blur-sm px-2 py-1 rounded border border-black/10">
              <a href="/privacy.html" className="hover:text-black underline">Privacy Policy</a>
              <span>•</span>
              <a href="/terms.html" className="hover:text-black underline">Terms of Service</a>
            </div>
          )}
        </div>
      </div>
    </DashboardProvider>
  );
};
