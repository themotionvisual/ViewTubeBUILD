import React from "react"
import { useNavigate } from "react-router-dom"
import { DashboardCanvas } from "./DashboardCanvas"
import { useDashboardData } from "./useDashboardData"
import { recordDiagnostic } from "../../services/diagnostics"

// Module-scope marker — tells us when DashboardRebuild's own chunk loaded,
// distinct from parent Dashboard. Bisects the download-waterfall from
// Dashboard → DashboardRebuild → DashboardCanvas.
recordDiagnostic("info", "boot-timing", "DashboardRebuild module executed")

const DashboardRebuild: React.FC = () => {
  const navigate = useNavigate()
  const before = typeof performance !== "undefined" ? performance.now() : Date.now()
  const data = useDashboardData()
  const after = typeof performance !== "undefined" ? performance.now() : Date.now()
  const cost = Math.round(after - before)
  // First-render cost of useDashboardData — mostly the getMasterRows /
  // getMetricSummary calls which iterate every cached CSV row. If this is
  // multi-second, it's a synchronous main-thread bottleneck.
  React.useEffect(() => {
    recordDiagnostic("info", "boot-timing", `useDashboardData first-run ${cost}ms`)
  }, [cost])
  return <DashboardCanvas data={data} onNavigate={(to) => navigate(to)} />
}

export default DashboardRebuild
