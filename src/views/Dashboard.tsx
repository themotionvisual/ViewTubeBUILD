import React from "react"
import DashboardRebuild from "./dashboard/DashboardRebuild"

const DashboardLegacy = React.lazy(() => import("./DashboardLegacy"))

const dashboardV9Enabled = import.meta.env.VITE_DASHBOARD_V9 !== "false"

const Dashboard: React.FC = () => (
  dashboardV9Enabled
    ? <DashboardRebuild />
    : <React.Suspense fallback={null}><DashboardLegacy /></React.Suspense>
)

export default Dashboard
