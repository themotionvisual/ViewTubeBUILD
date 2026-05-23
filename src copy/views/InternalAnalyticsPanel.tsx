import React, { useMemo } from "react"
import DataDashboard from "../components/DataDashboard"
import SimpleAnalyticsChart from "../components/SimpleAnalyticsChart"
import { SystemStatisticsSubToolbox } from "../components/SystemStatisticsSubToolbox"
import { canonicalRowsToMasterTableRows, getMasterRows } from "../services/analyticsSelectors"

const InternalAnalyticsPanel: React.FC = () => {
 const [refreshCount, setRefreshCount] = React.useState(0)

 const masterTableRows = useMemo(
  () => canonicalRowsToMasterTableRows(getMasterRows("lifetime", "api")),
  [refreshCount],
 )

 React.useEffect(() => {
  const handleSync = () => setRefreshCount((c) => c + 1)
  window.addEventListener("yt_analytics_synced", handleSync)
  return () => window.removeEventListener("yt_analytics_synced", handleSync)
 }, [])

 return (
  <div className="max-w-[1500px] mx-auto pb-24 px-4 space-y-6">
   <div className="mt-4 px-2 flex flex-col items-center gap-3">
    <h2 className="text-5xl md:text-6xl font-[1000] uppercase tracking-[calc(-0.06em)] leading-none text-black text-center">
     INTERNAL <span className="text-[#00CCFF]">ANALYTICS</span>
    </h2>
    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-black/40 text-center">
     Hidden panel: canonical dashboard, simple analytics, and coverage reference
    </p>
   </div>

   <SimpleAnalyticsChart />
   <DataDashboard />

   <div className="w-full">
    <SystemStatisticsSubToolbox masterTableRows={masterTableRows} />
   </div>
  </div>
 )
}

export default InternalAnalyticsPanel
