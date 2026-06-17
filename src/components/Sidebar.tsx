import React from "react"
import { useBrain } from "../context/useBrain"
import { NavLink, useNavigate, useLocation } from "react-router-dom"
import { SidebarChatbot } from "./SidebarChatbot"
import Icons from "./Icons"
import { getAccessToken } from "../services/auth/authSession"

interface SidebarProps {
 onHide?: () => void
 onNavigate?: () => void
 mobile?: boolean
}

export const Sidebar: React.FC<SidebarProps> = ({ onHide, onNavigate, mobile = false }) => {
 const navigate = useNavigate()
 const location = useLocation()
 const isHomepage = location.pathname === "/"
 const { channelConnection, connectChannel, syncChannelData } = useBrain()

 const tools = [
    { id: "DASHBOARD", path: "/", label: "Dashboard", color: "#FF83EA" },
    { id: "STUDIO", path: "/studio", label: "Studio", color: "#FFB26B" },
    { id: "PROJECTS", path: "/projects", label: "Projects", color: "#FFB570" },
    { id: "ANALYTICS", path: "/performance", label: "Analytics", color: "#68F55C" },
    { id: "EDITOR", path: "/editor", label: "Editor", color: "#6D86FF" },
    { id: "SETTINGS", path: "/settings", label: "Settings", color: "#59BFFF" },
    { id: "USER_GUIDE", path: "/user-guide", label: "User Guide", color: "#8D9CFF" },
  ]

 const handleToolNavigate = () => {
  onNavigate?.()
 }

 const handleConnectOrSync = async () => {
  if (channelConnection.state === "syncing" || channelConnection.state === "authorizing") return
  // If connected but token is expired, go straight to reconnect so the popup
  // opens synchronously within this user-gesture call frame (avoids popup block).
  if (channelConnection.isConnected && !getAccessToken()) {
   await connectChannel()
   return
  }
  if (channelConnection.isConnected) {
   await syncChannelData({ batchMode: "initial" })
   return
  }
  await connectChannel()
 }

 if (mobile) {
  return (
   <aside className="h-full rounded-[34px] border-[3px] border-black bg-[#f3f3ef] shadow-[7px_7px_0_0_#000] overflow-y-auto custom-scrollbar">
    <div className="sticky top-0 z-10 bg-[#f3f3ef] rounded-t-[31px]">
      <div className="px-6 pt-6 pb-4 flex items-center justify-between gap-4">
        <button
          onClick={() => {
            navigate("/")
            onNavigate?.()
          }}
          className="text-left leading-none"
          aria-label="Go to Dashboard"
        >
          <span className="text-[30px] font-[1000] tracking-[-0.08em] uppercase text-black">VIEW</span>
          <span className="text-[30px] font-[1000] tracking-[-0.03em] uppercase text-[#59BFFF]">TUBE</span>
        </button>
        <button
          type="button"
          onClick={onHide}
          className="h-16 w-16 shrink-0 rounded-full border-[3px] border-black bg-white shadow-[4px_4px_0_0_#000] flex items-center justify-center text-black"
          aria-label="Close navigation"
        >
          <Icons.X size={28} />
        </button>
      </div>
      <div className="border-b-[3px] border-black" />
    </div>

    <nav className="px-5 py-5 space-y-4">
      {tools.map((t) => (
       <NavLink
        key={t.id}
        to={t.path}
        onClick={handleToolNavigate}
        className="block"
       >
        {({ isActive }) => (
         <div
          className={`min-h-[86px] rounded-full border-[3px] border-black px-6 flex items-center justify-center text-center shadow-[6px_6px_0_0_#000] transition-transform ${
           isActive ? "translate-y-[1px] shadow-[3px_3px_0_0_#000]" : ""
          }`}
          style={{ backgroundColor: t.color }}
         >
          <span className="text-[20px] font-[1000] uppercase tracking-[-0.02em] text-black">
            {t.label}
          </span>
         </div>
        )}
       </NavLink>
      ))}

      <button
       type="button"
       onClick={handleConnectOrSync}
       disabled={channelConnection.state === "syncing" || channelConnection.state === "authorizing"}
       className="w-full min-h-[86px] rounded-full border-[3px] border-black px-6 flex items-center justify-center text-center shadow-[6px_6px_0_0_#000] bg-[#D946EF] disabled:opacity-65 disabled:cursor-not-allowed"
      >
       <span className="text-[20px] font-[1000] uppercase tracking-[-0.02em] text-black">
        {channelConnection.sidebarLabel}
       </span>
      </button>

    </nav>
   </aside>
  )
 }

 return (
  <aside className="w-[220px] bg-[#f3f4f6] h-full flex flex-col py-4 pl-3 pr-4 z-50 overflow-y-auto overflow-x-visible custom-scrollbar">

   {/* Stacked Navigation */}
   <nav className="mb-6 z-10 shrink-0 overflow-visible">
   <div className="flex flex-col gap-[4px]">
     {tools.map((t) => (
      <NavLink
       key={t.id}
       to={t.path}
       onClick={handleToolNavigate}
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
     <button
      type="button"
      onClick={() => {
       handleConnectOrSync().catch((error: any) => {
        console.warn("[Sidebar] Connect/sync action failed:", error)
       })
      }}
      disabled={channelConnection.state === "syncing" || channelConnection.state === "authorizing"}
      className="relative w-[calc(100%+20px)] -ml-[20px] overflow-visible disabled:opacity-70 disabled:cursor-not-allowed"
     >
      <div
       className="flex items-center justify-center w-full h-[30px] border-[2px] border-black rounded-[14px] transition-all bg-[#D946EF] hover:translate-x-[4px] hover:shadow-[2px_0px_0px_0px_black]"
       style={{
        color: "#000000",
        padding: "0 12px",
       }}
      >
       <span className="font-[800] uppercase text-sm tracking-tighter leading-none whitespace-nowrap">
        {channelConnection.sidebarLabel}
       </span>
      </div>
     </button>
    </div>
   </nav>

   <div className="mt-auto pr-1 pb-2 shrink-0">
    <button
     type="button"
     onClick={onHide}
     className="w-full h-[34px] border-[2px] border-black rounded-[10px] bg-white text-[11px] font-black uppercase tracking-wide shadow-[2px_2px_0px_0px_black] hover:translate-y-[1px] hover:shadow-none transition-all mb-3"
    >
     Hide Sidebar
    </button>
    {isHomepage && (
     <div className="flex justify-center gap-3 text-[10px] text-gray-500 font-semibold mt-2">
      <a href="/privacy.html" className="hover:text-black underline">Privacy Policy</a>
      <span>•</span>
      <a href="/terms.html" className="hover:text-black underline">Terms of Service</a>
     </div>
    )}
   </div>

   {/* Sidebar Chatbot Slot */}
   <div className="shrink-0 mt-2">
     <SidebarChatbot />
   </div>
   </aside>
 )
}
