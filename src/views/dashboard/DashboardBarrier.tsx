import React from "react"
import "./widget-entry.css"

/**
 * DashboardBarrier — containment boundary for dashboard design tokens.
 * Cascade ownership now migrates through explicit low-specificity layers rather
 * than adding stronger `.dashboard-barrier` selectors or new `!important`s.
 *
 * All dashboard CSS entry points are imported here in canonical order. Widget
 * implementations must not import shared CSS lazily because a late stylesheet
 * can reorder layers and restore desktop spans/heights over the phone contract.
 */
export const DashboardBarrier: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="dashboard-barrier vtw-dashboard" style={{ isolation:"isolate", contain:"layout style paint" }}>
    {children}
  </div>
)
