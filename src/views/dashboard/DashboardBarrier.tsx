import React from "react"
import "./toolboxWidgetSystem.css"
import "./widgetArchetypeResponsive.css"
import "./widgetScrollbar.css"

/**
 * DashboardBarrier — Invisible CSS containment wrapper that injects the
 * canonical ToolboxUI design tokens and styles from external CSS.
 *
 * The responsive archetype layer is intentionally imported after the legacy
 * toolbox sheet while cascade ownership is migrated in controlled batches.
 */
export const DashboardBarrier: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="dashboard-barrier" style={{ isolation:"isolate", contain:"layout style paint" }}>
    {children}
  </div>
)
