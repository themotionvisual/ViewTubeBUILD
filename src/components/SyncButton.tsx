import React, { useState } from "react"
import { useBrain } from "../context/GlobalDataContext"

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
   <button
    className={`w-full p-2 text-sm font-black uppercase border-2 border-black ${
     isSyncing ?
      "bg-gray-400 text-gray-700 cursor-not-allowed"
     : "bg-[#fff070] hover:bg-[#ffeb3b]"
    }`}
    onClick={() => handleSync(false)}
    disabled={isSyncing || isSyncedToday}>
    {isSyncing ?
     "Syncing..."
    : isSyncedToday ?
     "Synced Today"
    : "Sync Now"}
   </button>
   {!isSyncedToday && (
    <button
     className={`w-full p-2 text-sm font-black uppercase border-2 border-black mt-1 ${
      isSyncing ?
       "bg-gray-400 text-gray-700 cursor-not-allowed"
      : "bg-[#ff8fb3] hover:bg-[#ff6b9e]"
     }`}
     onClick={() => handleSync(true)}
     disabled={isSyncing}>
     {isSyncing ? "Force Syncing..." : "Force Sync (API Quota Risk)"}
    </button>
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
