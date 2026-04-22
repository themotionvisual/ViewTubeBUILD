import React from "react"
import "./toolboxWidgetSystem.css"

/**
 * DashboardBarrier — Invisible CSS containment wrapper that injects the
 * canonical ToolboxUI design tokens and styles from external CSS.
 */

export const DashboardBarrier: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div
      className="dashboard-barrier"
      style={{
        isolation: "isolate",
        contain: "layout style paint",
      }}
    >
      {children}
    </div>
  )
}

