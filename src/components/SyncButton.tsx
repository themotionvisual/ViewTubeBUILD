import React, { useState } from "react"
import { useBrain } from "../context/GlobalDataContext"
import { StandardButton } from "./StandardButton"

export const SyncButton: React.FC = () => {
 const { brain, syncMetrics } = useBrain()
 const [isSyncing, setIsSyncing] = useState(false)

 const handleSync = async (force: boolean = false) => {
  setIsSyncing(true)
  try {
   await syncMetrics(force)
  } finally {
   setIsSyncing(false)
  }
 }

 const today = new Date().toISOString().slice(0, 10)
 const isSyncedToday = brain.lastSyncDate === today

 return (
  <div className="border-4 border-black shadow-[4px_4px_0px_0px_black] bg-white p-3 flex flex-col gap-2">
   <div className="text-lg font-black uppercase">Analytics Sync</div>
   <p className="text-sm font-bold">
    Last Synced: {brain.lastSyncDate || "Never"}
    {isSyncedToday && " (Today)"}
   </p>
   <StandardButton
    accentColor="#fff070"
    onClick={() => handleSync(false)}
    disabled={isSyncing || isSyncedToday}>
    {isSyncing ?
     "Syncing..."
    : isSyncedToday ?
     "Synced Today"
    : "Sync Now"}
   </StandardButton>
   {!isSyncedToday && (
    <StandardButton
     accentColor="#ff8fb3"
     onClick={() => handleSync(true)}
     disabled={isSyncing}>
     {isSyncing ? "Force Syncing..." : "Force Sync (API Quota Risk)"}
    </StandardButton>
   )}
   {isSyncing && (
    <div className="flex items-center justify-center mt-2">
     <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
     <span className="ml-2 text-xs font-bold">Fetching data...</span>
    </div>
   )}
  </div>
 )
}
