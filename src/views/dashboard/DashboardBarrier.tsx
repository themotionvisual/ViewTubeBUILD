import React from "react"
import "./toolboxWidgetSystem.css"
import "./widgetControlOwnership.css"
import "./widgetArchetypeResponsive.css"
import "./widgetShellOwnership.css"
import "./widgetScrollbar.css"
import "./widgetMobileContract.css"

/**
 * DashboardBarrier — containment boundary for dashboard design tokens.
 * Cascade ownership now migrates through explicit low-specificity layers rather
 * than adding stronger `.dashboard-barrier` selectors or new `!important`s.
 */
export const DashboardBarrier: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="dashboard-barrier" style={{ isolation:"isolate", contain:"layout style paint" }}>
    {children}
  </div>
)
