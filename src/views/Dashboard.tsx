import React from "react"
import DashboardRebuild from "./dashboard/DashboardRebuild"
import { recordDiagnostic } from "../services/diagnostics"

// Module-scope marker: this fires when the Dashboard chunk actually parses
// and executes — distinct from when React commits its element. The gap
// between "hydrating" (boot-timing) and this line is chunk download + parse.
recordDiagnostic("info", "boot-timing", "Dashboard module executed")

const DashboardLegacy = React.lazy(() => import("./DashboardLegacy"))

const dashboardV9Enabled = import.meta.env.VITE_DASHBOARD_V9 !== "false"

const Dashboard: React.FC = () => {
  // First render marker — the gap from "Dashboard module executed" to here
  // is React reconciliation work in providers above; the gap from here to
  // "route committed" is the child tree's own render + commit cost.
  React.useEffect(() => {
    recordDiagnostic("info", "boot-timing", "Dashboard first commit")
  }, [])
  return dashboardV9Enabled
    ? <DashboardRebuild />
    : <React.Suspense fallback={null}><DashboardLegacy /></React.Suspense>
}

export default Dashboard
