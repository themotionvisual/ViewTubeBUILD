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
   { id: "PROJECTS", path: "/projects", label: "Projects", color: "#FFFF61" },
   { id: "PROJECT_CALENDAR", path: "/project-calendar", label: "Project Calendar", color: "#40C6E9" },
   { id: "ANALYTICS", path: "/performance", label: "Analytics", color: "#4FFF5B" },
   { id: "EDITOR", path: "/editor-v1", label: "Editor", color: "#579AFF" },
   { id: "SETTINGS", path: "/settings", label: "Settings", color: "#CC00FF" },
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
    <div className="flex flex-col gap-[4px]">
     {tools.map((t) => (
      <NavLink
       key={t.id}
       to={t.path}
       className={({ isActive }) =>
        `transition-all relative w-[calc(100%+40px)] -ml-[40px] border-[2px] border-black rounded-r-[14px] rounded-l-none ${
         isActive ? "translate-x-4" : "hover:translate-x-1"
        }`
       }>
       {() => (
        <div
         className="flex items-center justify-end w-full h-[26px]"
         style={{
          backgroundColor: t.color,
          color: "#000000",
          padding: "0 14px",
          borderRadius: "0 10px 10px 0",
         }}
        >
         <span className="font-[800] uppercase text-sm tracking-tighter leading-none whitespace-nowrap">
          {t.label}
         </span>
        </div>
       )}
      </NavLink>
     ))}

     {/* Connect YouTube (Moved up into Main Nav) */}
     <button
      onClick={() => (!authState.isAuthenticated ? login() : void globalSyncData())}
      disabled={isSyncing}
      className={`transition-all relative w-[calc(100%+40px)] -ml-[40px] border-[2px] border-black rounded-r-[14px] rounded-l-none outline-none ${
       isSyncing ? "opacity-50 cursor-not-allowed" : "hover:translate-x-1"
      }`}
     >
      <div
       className="flex items-center justify-end w-full h-[26px]"
       style={{
        backgroundColor: "#CC00FF",
        color: "#000000",
        padding: "0 14px",
        borderRadius: "0 10px 10px 0",
       }}
      >
       <span className="font-[800] uppercase text-sm tracking-tighter leading-none whitespace-nowrap flex items-center">
        {isSyncing ? (
         <>
          <Icons.RefreshCw size={14} className="animate-spin mr-1.5" />
          Syncing...
         </>
        ) : (
         <>
          {authState.isAuthenticated && <Icons.RefreshCw size={14} className="mr-1.5" />}
          {!authState.isAuthenticated ? "Connect YouTube" : "Sync Data"}
         </>
        )}
       </span>
      </div>
     </button>
    </div>
   </nav>

   {/* Sidebar Chatbot Slot */}
   <div className="flex-1 min-h-0 mt-2">
     <SidebarChatbot />
   </div>

   <NavLink
   to="/reference-studio/toolbox-system"
   className={({ isActive }) =>
     `mt-6 mb-2 w-[calc(100%+40px)] -ml-[40px] border-[2px] border-black rounded-r-[14px] rounded-l-none transition-all ${
      isActive ? "translate-x-4" : "hover:translate-x-1"
     }`
    }>
    {() => (
     <div
      className="w-full h-[26px] px-3 flex items-center font-[800] uppercase tracking-tighter text-[12px]"
      style={{
       backgroundColor: "#CC00FF",
       color: "#000",
       borderRadius: "0 10px 10px 0",
      }}
     >
      Reference Studio
     </div>
    )}
   </NavLink>
    <NavLink
    to="/data-transparency"
    className={({ isActive }) =>
      `mb-6 w-[calc(100%+40px)] -ml-[40px] border-[2px] border-black rounded-r-[14px] rounded-l-none transition-all ${
       isActive ? "translate-x-4" : "hover:translate-x-1"
      }`
     }>
     {() => (
      <div
       className="w-full h-[26px] px-3 flex items-center font-[800] uppercase tracking-tighter text-[12px]"
       style={{
        backgroundColor: "#40C6E9",
        color: "#000",
        borderRadius: "0 10px 10px 0",
       }}
      >
       Data Transparency
      </div>
     )}
    </NavLink>
   </aside>
 )
}
