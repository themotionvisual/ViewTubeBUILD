import React from "react"
import "./widget-entry.css"

/**
 * DashboardBarrier — containment boundary for the Dashboard/Widget design system.
 *
 * The Widget system owns its stylesheet entry point independently of Toolbox,
 * Subtoolbox and page CSS. Keep this boundary as a low-specificity scope root;
 * do not use it to escalate selector specificity or add new !important rules.
 */
export const DashboardBarrier: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="dashboard-barrier vtw-dashboard" style={{ isolation:"isolate", contain:"layout style paint" }}>
    {children}
  </div>
)
