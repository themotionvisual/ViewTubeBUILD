import React, { useEffect, useRef } from "react"
import { useBrain } from "../context/GlobalDataContext"
import { NavLink, useNavigate } from "react-router-dom"
import { SidebarChatbot } from "./SidebarChatbot"
import Icons from "./Icons"

export const Sidebar: React.FC = () => {
 const navigate = useNavigate()
 const { authState, setAuthState, login, globalSyncData, isSyncing } = useBrain()
 const clickTimesRef = useRef<number[]>([])

 useEffect(() => {
  const handleSync = (event: Event) => {
   const data = (
    event as CustomEvent<{
     profile?: {
      name?: string
      profilePictureUrl?: string
      subscriberCount?: string | number
      totalViews?: string | number
     }
    }>
   ).detail
   if (data && data.profile) {
    setAuthState({
     channelName: data.profile.name,
     channelThumbnail: data.profile.profilePictureUrl,
     subscriberCount: Number(data.profile.subscriberCount || 0),
     totalViews: Number(data.profile.totalViews || 0),
    })
   }
  }

  window.addEventListener("yt_analytics_synced", handleSync as EventListener)
  return () =>
   window.removeEventListener(
    "yt_analytics_synced",
    handleSync as EventListener,
   )
 }, [setAuthState])

 const tools = [
  { id: "DASHBOARD", path: "/", label: "Dashboard", color: "#FF8AAF" },
  { id: "STUDIO", path: "/studio", label: "Studio", color: "#FFB570" },
  { id: "CALENDAR", path: "/project-calendar", label: "Calendar", color: "#FFFF61" },
  { id: "SHORTS", path: "/shorts", label: "Shorts", color: "#4FFF5B" },
  { id: "PERFORMANCE", path: "/performance", label: "Performance", color: "#579AFF" },
  { id: "TRUST", path: "/data-transparency", label: "Trust", color: "#96F5A6" },
  { id: "SETTINGS", path: "/settings", label: "Settings", color: "#579AFF" },
 ]

 const handleHiddenAnalyticsClick = () => {
  const now = Date.now()
  const windowMs = 1800
  clickTimesRef.current = [...clickTimesRef.current.filter((ts) => now - ts <= windowMs), now]
  if (clickTimesRef.current.length >= 5) {
   clickTimesRef.current = []
   navigate("/studio/internal-analytics")
  }
 }

 return (
  <aside className="w-[236px] bg-[#f3f4f6] h-screen flex flex-col py-4 pr-4 pl-3 z-50 overflow-y-auto custom-scrollbar">
   {/* Brand Header */}
   <div className="mb-8 flex flex-col gap-2 relative">
    <h1 className="text-4xl font-[1000] uppercase tracking-tighter leading-none flex items-center gap-1">
     <span className="text-black">VIEW</span>
     <span className="text-[#00CCFF]">TUBE</span>
    </h1>
    <button
     type="button"
     onClick={handleHiddenAnalyticsClick}
     aria-label="Hidden internal analytics access trigger"
     className="absolute left-[76px] top-[16px] h-4 w-4 rounded-full bg-transparent border-0 cursor-default"
    />
   </div>

   {/* Stacked Navigation */}
   <nav className="mb-6 z-10 shrink-0">
    <div className="flex flex-col gap-3">
     {tools.map((t) => (
      <NavLink
       key={t.id}
       to={t.path}
       className={({ isActive }) =>
        `transition-all relative w-[calc(100%+18px)] -ml-[18px] border-[4px] border-black rounded-r-2xl rounded-l-none shadow-[4px_4px_0px_0px_black] ${
         isActive ? "translate-x-2" : "hover:translate-x-1"
        }`
       }>
       {() => (
        <div
         className="flex items-center w-full h-11"
         style={{
          backgroundColor: t.color,
          color: "#000000",
          padding: "0 14px",
          borderRadius: "0 16px 16px 0",
         }}
        >
         <span className="font-[1000] uppercase text-sm tracking-tighter leading-none whitespace-nowrap">
          {t.label}
         </span>
        </div>
       )}
      </NavLink>
     ))}
    </div>
   </nav>

   {/* Master Data Sync & Connect */}
   <div className="mb-6 shrink-0">
    {!authState.isAuthenticated ? (
     <button
      onClick={login}
      className="flex items-center justify-center w-full bg-[#FF83EA] border-[4px] border-black rounded-xl p-3 text-xs font-[1000] uppercase tracking-tighter text-black transition-all hover:bg-white"
     >
      Connect YouTube
     </button>
    ) : (
     <button
      onClick={() => {
       void globalSyncData()
      }}
      disabled={isSyncing}
      className={`flex items-center justify-center w-full border-[4px] border-black rounded-xl p-3 text-xs font-[1000] uppercase tracking-tighter text-black transition-all ${
       isSyncing ? 'bg-gray-300 opacity-50 cursor-not-allowed' : 'bg-[#CCFF00] hover:bg-white'
      }`}
     >
      {isSyncing ? (
       <>
        <Icons.RefreshCw size={16} className="animate-spin mr-2" />
        Syncing...
       </>
      ) : (
       <>
        <Icons.RefreshCw size={16} className="mr-2" />
        Sync Data
       </>
      )}
     </button>
    )}
   </div>

   {/* Sidebar Chatbot Slot */}
   <div className="flex-1 min-h-0 mt-2">
     <SidebarChatbot />
   </div>

   <NavLink
   to="/reference-studio/toolbox-system"
   className={({ isActive }) =>
     `mt-6 mb-2 w-[calc(100%+18px)] -ml-[18px] border-[4px] border-black rounded-r-2xl rounded-l-none transition-all shadow-[4px_4px_0px_0px_black] ${
      isActive ? "translate-x-2" : "hover:translate-x-1"
     }`
    }>
    {() => (
     <div
      className="w-full h-11 px-3 flex items-center font-[1000] uppercase tracking-tighter text-[12px]"
      style={{
       backgroundColor: "#CC00FF",
       color: "#000",
       borderRadius: "0 16px 16px 0",
      }}
     >
      Reference Studio
     </div>
    )}
   </NavLink>
  </aside>
 )
}
