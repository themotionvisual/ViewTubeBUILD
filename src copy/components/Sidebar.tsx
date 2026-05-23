import React, { useEffect, useRef } from "react"
import { useBrain } from "../context/useBrain"
import { NavLink, useNavigate } from "react-router-dom"
import { SidebarChatbot } from "./SidebarChatbot"
import Icons from "./Icons"

interface SidebarProps {
 onHide?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ onHide }) => {
 const navigate = useNavigate()
 const { authState, setAuthState, login, globalSyncData, isSyncing } = useBrain()
 const clickTimesRef = useRef<number[]>([])

 useEffect(() => {
  const handleSync = (event: Event) => {
   const data = (
    event as CustomEvent<{
     profile?: {
      name?: string
      channelHandle?: string | null
      profilePictureUrl?: string
      subscriberCount?: string | number
      totalViews?: string | number
     }
    }>
   ).detail
   if (data && data.profile) {
    setAuthState({
     channelName: data.profile.name,
     channelHandle: data.profile.channelHandle || null,
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
    { id: "DASHBOARD", path: "/", label: "Dashboard", color: "#FF83EA" },
    { id: "STUDIO", path: "/studio", label: "Studio", color: "#FF8AAF" },
    { id: "PROJECTS", path: "/projects", label: "Projects", color: "#FFB570" },
    { id: "ANALYTICS", path: "/performance", label: "Analytics", color: "#FFFF61" },
    { id: "EDITOR", path: "/editor", label: "Editor", color: "#4FFF5B" },
    { id: "SETTINGS", path: "/settings", label: "Settings", color: "#40C6E9" },
    { id: "USER_GUIDE", path: "/user-guide", label: "User Guide", color: "#579AFF" },
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
  <aside className="w-[220px] bg-[#f3f4f6] h-screen flex flex-col py-4 pl-3 pr-4 z-50 overflow-y-auto overflow-x-visible custom-scrollbar">

   {/* Stacked Navigation */}
   <nav className="mb-6 z-10 shrink-0 overflow-visible">
    <div className="flex flex-col gap-[4px]">
     {tools.map((t) => (
      <NavLink
       key={t.id}
       to={t.path}
       className="transition-all relative w-[calc(100%+20px)] -ml-[20px] overflow-visible">
       {({ isActive }) => (
        <div
         className={`flex items-center justify-center w-full h-[30px] border-[2px] border-black rounded-[14px] transition-all ${
          isActive
           ? "translate-x-[8px] shadow-[3px_0px_0px_0px_black]"
           : "translate-x-0 hover:translate-x-[4px] hover:shadow-[2px_0px_0px_0px_black]"
         }`}
         style={{
          backgroundColor: t.color,
          color: "#000000",
          padding: "0 12px",
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
      className={`transition-all relative w-[calc(100%+20px)] -ml-[20px] outline-none ${
       isSyncing
        ? "opacity-50 cursor-not-allowed"
        : ""
      }`}
     >
      <div
       className={`flex items-center justify-center w-full h-[30px] border-[2px] border-black rounded-[14px] transition-all ${
        isSyncing
         ? "translate-x-0"
         : "translate-x-0 hover:translate-x-[4px] hover:shadow-[2px_0px_0px_0px_black]"
       }`}
       style={{
        backgroundColor: "#CC00FF",
        color: "#000000",
        padding: "0 12px",
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

   <div className="mt-auto pr-1 pb-2 shrink-0">
    <button
     type="button"
     onClick={onHide}
     className="w-full h-[34px] border-[2px] border-black rounded-[10px] bg-white text-[11px] font-black uppercase tracking-wide shadow-[2px_2px_0px_0px_black] hover:translate-y-[1px] hover:shadow-none transition-all"
    >
     Hide Sidebar
    </button>
   </div>

   {/* Sidebar Chatbot Slot */}
   <div className="shrink-0 mt-2">
     <SidebarChatbot />
   </div>
   </aside>
 )
}
