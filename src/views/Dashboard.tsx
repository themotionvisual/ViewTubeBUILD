import DashboardRebuild from "./dashboard/DashboardRebuild"
import DashboardLegacy from "./DashboardLegacy"

const dashboardV9Enabled = import.meta.env.VITE_DASHBOARD_V9 !== "false"

export default dashboardV9Enabled ? DashboardRebuild : DashboardLegacy
