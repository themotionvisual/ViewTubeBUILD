import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { AdaptiveNavigationShell } from "../components/navigation/AdaptiveNavigationShell";
import { usePreserveOrientationPosition } from "../hooks/usePreserveOrientationPosition";
import { DashboardProvider } from "../context/DashboardContext";
import { EntitlementProvider } from "../context/EntitlementProvider";
import {
  ENTITLEMENT_CHANGED_EVENT,
  applyPlanToEntitlement,
  entitlementStatesEqual,
  readCurrentEntitlement,
  syncEntitlementIfDrifted,
  type EntitlementState,
} from "../services/billingEntitlement";
import type { SubscriptionPlanId } from "../services/subscriptionPlans";
import { useUnifiedAccount } from "../context/UnifiedAccountContext";

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  // Global mobile orientation-position preservation: remember which visual
  // module / toolbox / row the user was looking at before rotation, and
  // restore it to ~10px below the top of the newly-sized viewport after.
  usePreserveOrientationPosition();

  const location = useLocation();
  const account = useUnifiedAccount();
  const [legacyEntitlement, setLegacyEntitlement] = useState<EntitlementState>(() => readCurrentEntitlement());

  const entitlement = useMemo<EntitlementState>(() => {
    if (!account.serverEnabled) return legacyEntitlement;
    const current = readCurrentEntitlement();
    const planId = (account.snapshot.billing.planId || "basic") as SubscriptionPlanId;
    const planned = applyPlanToEntitlement(current, planId);
    const status = account.snapshot.billing.status === "past_due"
      ? "past_due"
      : account.snapshot.billing.status === "active" || account.snapshot.billing.status === "trialing"
        ? "active"
        : account.snapshot.billing.status === "unavailable"
          ? current.status
          : "inactive";
    const creditBalance = Math.max(0, Number(account.snapshot.ai.availableCredits || 0));
    return {
      ...planned,
      status,
      creditBalance,
      tokenBalance: creditBalance,
    };
  }, [
    account.serverEnabled,
    account.snapshot.ai.availableCredits,
    account.snapshot.billing.planId,
    account.snapshot.billing.status,
    legacyEntitlement,
  ]);

  useEffect(() => {
    if (account.serverEnabled) return;
    const sync = () => {
      const next = syncEntitlementIfDrifted();
      setLegacyEntitlement((previous) =>
        entitlementStatesEqual(previous, next) ? previous : next,
      );
    };
    const onEntitlementChanged = (event: Event) => {
      const detail = (event as CustomEvent<EntitlementState>).detail;
      if (!detail) {
        sync();
        return;
      }
      setLegacyEntitlement((previous) =>
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
  }, [account.serverEnabled]);

  const isEditorSurface =
    location.pathname === "/editor" || location.pathname === "/editor-v1";

  return (
    <EntitlementProvider value={entitlement}>
     <DashboardProvider>
      <AdaptiveNavigationShell entitlement={entitlement} isEditorSurface={isEditorSurface}>
       {children}
      </AdaptiveNavigationShell>
     </DashboardProvider>
    </EntitlementProvider>
  );
};
