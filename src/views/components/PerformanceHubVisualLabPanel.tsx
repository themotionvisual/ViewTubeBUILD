import React from "react"
import { ShortsRetentionToolboxContent } from "../../components/ShortsRetentionToolboxContent"
import type { AnalyticsWindow } from "../../services/analytics/DataStore"

type PerformanceHubVisualLabPanelProps = {
 isActive: boolean
 windowValue: AnalyticsWindow
 reloadNonce: number
 children: React.ReactNode
}

const PerformanceHubVisualLabPanel: React.FC<PerformanceHubVisualLabPanelProps> = ({
 isActive,
 windowValue,
 reloadNonce,
 children,
}) => (
 <div className="space-y-6">
  <ShortsRetentionToolboxContent
   isActive={isActive}
   windowValue={windowValue}
   reloadNonce={reloadNonce}
  />
  {children}
 </div>
)

export default PerformanceHubVisualLabPanel
