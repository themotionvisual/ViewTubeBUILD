import React from "react"
import { ChartColumnBig, Database, RefreshCw } from "lucide-react"
import {
 ANALYTICS_SYNC_REGISTRY,
 type AnalyticsSyncAction,
} from "../../services/analyticsSyncRegistry"
import { CSV_MAJOR_FAMILY_STYLES } from "../../services/csvTaxonomy"

type SyncOptions = {
 batchMode?: "initial" | "next"
 enrichmentMode?: "core" | "video_metrics" | "traffic" | "segments" | "all"
}

type ChannelDataSyncControlsProps = {
 isSyncing: boolean
 lastSyncComplete: string | null
 globalSyncData: (options?: SyncOptions) => Promise<void>
}

type ActionButtonConfig = {
 action: AnalyticsSyncAction
 label: string
 description: string
 tone: string
 icon: React.ReactNode
}

type ActionGroupConfig = {
 id: string
 label: string
 description: string
 familyTone: string
 actions: ActionButtonConfig[]
}

const buttonStateClass = (isSyncing: boolean): string =>
 isSyncing
  ? "opacity-50 cursor-not-allowed translate-x-[2px] translate-y-[2px] shadow-[2px_2px_0px_0px_black]"
  : "active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_black] hover:-translate-y-0.5"

const actionClass =
 "min-h-[68px] w-full border-[3px] border-black rounded-2xl px-3 py-3 font-[1000] uppercase tracking-tight text-[11px] leading-[1.05] flex flex-col items-center justify-center gap-2 text-center transition-all shadow-[4px_4px_0px_0px_black]"

const ACTIONS_BY_KEY = new Map(
 ANALYTICS_SYNC_REGISTRY.map((row) => [row.action, row] as const),
)

const buildButton = (
 action: AnalyticsSyncAction,
 label: string,
 description: string,
 tone: string,
 icon: React.ReactNode,
): ActionButtonConfig => ({
 action,
 label,
 description,
 tone,
 icon,
})

const ACTION_GROUPS: ActionGroupConfig[] = [
 {
  id: "core_sync",
  label: "Core Sync",
  description: "Start here for the main channel hard-number sync.",
  familyTone: CSV_MAJOR_FAMILY_STYLES.video_data.pillClass,
  actions: [
   buildButton(
    "core_video_data",
    "Sync Core Video Data",
    "Pulls baseline channel and video analytics.",
    "bg-[#4FFF5B] text-black",
    <RefreshCw size={18} strokeWidth={3} />,
   ),
   buildButton(
    "core_video_data",
    "Load Next 250 Videos",
    "Extends the synced video batch deeper into the channel catalog.",
    "bg-[#CCFF00] text-black",
    <Database size={16} strokeWidth={3} />,
   ),
  ],
 },
 {
  id: "expand_data",
  label: "Expand Data",
  description: "Adds more metric depth after the baseline sync is ready.",
  familyTone: CSV_MAJOR_FAMILY_STYLES.daily_metrics.pillClass,
  actions: [
   buildButton(
    "video_metrics",
    "Sync More Video Metrics",
    "Adds richer per-video and format coverage.",
    "bg-[#24D3FF] text-black",
    <ChartColumnBig size={15} strokeWidth={3} />,
   ),
   buildButton(
    "daily_metrics",
    "Sync Daily Metrics",
    "Adds day-by-day channel performance rows.",
    "bg-[#FFFF61] text-black",
    <ChartColumnBig size={15} strokeWidth={3} />,
   ),
   buildButton(
    "traffic",
    "Sync Traffic",
    "Adds traffic source overview and supported detail cuts.",
    "bg-[#4FFF5B] text-black",
    <Database size={15} strokeWidth={3} />,
   ),
  ],
 },
 {
  id: "audience_geo",
  label: "Audience & Geography",
  description: "Adds audience, geography, and surface-specific breakdowns.",
  familyTone: CSV_MAJOR_FAMILY_STYLES.audience.pillClass,
  actions: [
   buildButton(
    "geography",
    "Sync Geography",
    "Adds country, city, and related geography slices.",
    "bg-[#579AFF] text-white",
    <Database size={15} strokeWidth={3} />,
   ),
   buildButton(
    "audience",
    "Sync Audience",
    "Adds age, gender, and audience composition data.",
    "bg-[#FFB570] text-black",
    <Database size={15} strokeWidth={3} />,
   ),
   buildButton(
    "surfaces_discovery",
    "Sync Surfaces & Discovery",
    "Adds playback and discovery-style breakdowns where available.",
    "bg-[#40C6E9] text-black",
    <Database size={15} strokeWidth={3} />,
   ),
  ],
 },
 {
  id: "advanced",
  label: "Advanced",
  description: "Use only when you need deeper or slower enrichment passes.",
  familyTone: CSV_MAJOR_FAMILY_STYLES.revenue_monetization.pillClass,
  actions: [
   buildButton(
    "revenue_monetization",
    "Sync Revenue & Monetization",
    "Adds revenue-specific and ad-type analytics where supported.",
    "bg-[#B14AED] text-white",
    <Database size={15} strokeWidth={3} />,
   ),
   buildButton(
    "deep_data",
    "Sync All Deep Data",
    "Runs the broad current deep-data enrichment path.",
    "bg-[#FF7AF5] text-black",
    <Database size={15} strokeWidth={3} />,
   ),
  ],
 },
]

export const ChannelDataSyncControls: React.FC<ChannelDataSyncControlsProps> = ({
 isSyncing,
 lastSyncComplete,
 globalSyncData,
}) => {
 const runAction = (config: ActionButtonConfig) => {
  if (config.label === "Load Next 250 Videos") {
   return globalSyncData({ batchMode: "next" })
  }
  const row = ACTIONS_BY_KEY.get(config.action)
  return globalSyncData({
   batchMode: row?.batchMode,
   enrichmentMode: row?.enrichmentMode,
  })
 }

 return (
  <div className="border-[4px] border-black rounded-[28px] bg-white p-4 md:p-5 shadow-[6px_6px_0px_0px_black]">
   <div className="flex flex-col gap-2 border-b-[3px] border-black pb-4">
    <div className="flex items-center justify-between gap-3">
     <div>
      <p className="text-[11px] font-[1000] uppercase tracking-[0.24em] text-black/45">
       Channel Data Actions
      </p>
      <p className="mt-2 text-[24px] font-[1000] uppercase leading-none">
       Sync, expand, and enrich channel statistics
      </p>
     </div>
     <div className="hidden xl:flex items-center rounded-full border-[3px] border-black bg-[#F4F1EB] px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-black/55">
      {lastSyncComplete ? "Connected sync paths ready" : "Start with core sync"}
     </div>
    </div>
    <p className="text-[12px] font-bold leading-5 text-black/65 max-w-[980px]">
     Use the core sync first, then add the exact families you need. CSV uploads can still enrich metrics that the main sync path does not expose directly.
    </p>
   </div>

   <div className="mt-4 grid grid-cols-1 xl:grid-cols-4 gap-4">
    {ACTION_GROUPS.map((group) => (
     <div key={group.id} className="border-[3px] border-black rounded-2xl bg-[#F8F8F8] p-3">
      <div className="flex flex-col gap-2">
       <span className={`inline-flex w-fit items-center rounded-full border-[2px] border-black px-2 py-1 text-[8px] font-black uppercase tracking-[0.18em] ${group.familyTone}`}>
        {group.label}
       </span>
       <p className="text-[11px] font-bold leading-5 text-black/70 min-h-[40px]">
        {group.description}
       </p>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-2">
       {group.actions.map((action) => (
        <button
         key={`${group.id}-${action.label}`}
         onClick={() => runAction(action)}
         disabled={isSyncing}
         title={action.description}
         className={`${actionClass} ${action.tone} ${buttonStateClass(isSyncing)}`}>
         {action.action === "core_video_data" && action.label === "Sync Core Video Data" && isSyncing ? (
          <RefreshCw size={18} strokeWidth={3} className="animate-spin" />
         ) : (
          action.icon
         )}
         <span>{action.label}</span>
         <span className="text-[9px] font-bold normal-case tracking-normal leading-4 opacity-75">
          {action.description}
         </span>
        </button>
       ))}
      </div>
     </div>
    ))}
   </div>
  </div>
 )
}
