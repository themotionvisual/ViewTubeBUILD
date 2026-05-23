import React, { useState, useEffect } from "react"
import { Edit3, Lock, LockOpen, Layers, RotateCcw, Download, Upload, Settings, Play, UserCircle2, Sparkles, ChevronDown } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { DashboardData } from "./useDashboardData"
import { useEntitlement } from "../../app/AppShell"
import { useBrain } from "../../context/useBrain"
import { AIModelSelector } from "../../components/ui/AIModelSelector"

interface DashboardHeaderProps {
 dashboardControls: {
  editMode: boolean
  setEditMode: (updater: (prev: boolean) => boolean) => void
  locked: boolean
  toggleLock: () => void
  openPicker: () => void
  resetLayout: () => void
  handleExport: () => void
  handleImportClick: () => void
 }
 data: DashboardData
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ dashboardControls, data }) => {
 const navigate = useNavigate()
 const entitlement = useEntitlement()
 const { authState, login, logout, globalSyncData } = useBrain()
 const [title, setTitle] = useState(() => localStorage.getItem("vt-dashboard-title") || "WIDGET LAB")
 const [isEditingTitle, setIsEditingTitle] = useState(false)
 const [isDropdownOpen, setIsDropdownOpen] = useState(false)
 const [isControlsOpen, setIsControlsOpen] = useState(false)

 useEffect(() => {
  localStorage.setItem("vt-dashboard-title", title)
 }, [title])

 const handleTitleBlur = () => {
  setIsEditingTitle(false)
  if (!title.trim()) setTitle("WIDGET LAB")
 }

 const renderControls = () => (
  <div className="relative">
   <button 
    onClick={() => setIsControlsOpen(!isControlsOpen)}
    className="flex items-center gap-2 bg-white border-[2px] border-black rounded-[6px] px-3 py-2 shadow-[2px_2px_0_0_#000] hover:-translate-y-[1px] hover:shadow-[3px_3px_0_0_#000] active:translate-y-[1px] active:shadow-[1px_1px_0_0_#000] transition-all">
    <Settings size={14} className="text-black" />
    <span className="font-black text-[10px] tracking-widest uppercase">Layout Options</span>
    <ChevronDown size={14} strokeWidth={3} className="ml-0.5 opacity-50" />
   </button>
   
   {isControlsOpen && (
    <div className="absolute left-0 top-[calc(100%+8px)] w-[200px] bg-white border-[3px] border-black shadow-[4px_4px_0_0_#000] rounded-[8px] z-50 flex flex-col overflow-hidden">
     <div className="flex flex-col p-2 gap-1 bg-white">
      <button onClick={() => { setIsControlsOpen(false); dashboardControls.setEditMode((prev) => !prev); }} className="flex items-center gap-2 text-left px-3 py-2 font-black text-[10px] uppercase tracking-wider hover:bg-[#C9F830] border-2 border-transparent hover:border-black rounded transition-colors">
       <Edit3 size={14} /> {dashboardControls.editMode ? "Exit Edit Mode" : "Rearrange Widgets"}
      </button>
      <button onClick={() => { setIsControlsOpen(false); dashboardControls.toggleLock(); }} className="flex items-center gap-2 text-left px-3 py-2 font-black text-[10px] uppercase tracking-wider hover:bg-[#C9F830] border-2 border-transparent hover:border-black rounded transition-colors">
       {dashboardControls.locked ? <Lock size={14} /> : <LockOpen size={14} />} {dashboardControls.locked ? "Unlock Layout" : "Lock Layout"}
      </button>
      <button onClick={() => { setIsControlsOpen(false); dashboardControls.openPicker(); }} className="flex items-center gap-2 text-left px-3 py-2 font-black text-[10px] uppercase tracking-wider hover:bg-[#C9F830] border-2 border-transparent hover:border-black rounded transition-colors">
       <Layers size={14} /> Add Widgets
      </button>
      <button onClick={() => { setIsControlsOpen(false); dashboardControls.handleExport(); }} className="flex items-center gap-2 text-left px-3 py-2 font-black text-[10px] uppercase tracking-wider hover:bg-[#C9F830] border-2 border-transparent hover:border-black rounded transition-colors">
       <Download size={14} /> Export Layout
      </button>
      <button onClick={() => { setIsControlsOpen(false); dashboardControls.handleImportClick(); }} className="flex items-center gap-2 text-left px-3 py-2 font-black text-[10px] uppercase tracking-wider hover:bg-[#C9F830] border-2 border-transparent hover:border-black rounded transition-colors">
       <Upload size={14} /> Import Layout
      </button>
     </div>
     <div className="border-t-[2px] border-black p-2 bg-[#eee]">
      <button onClick={() => { setIsControlsOpen(false); dashboardControls.resetLayout(); }} className="flex items-center justify-center gap-2 w-full px-3 py-2 font-black text-[11px] uppercase tracking-wider bg-white border-[2px] border-black shadow-[2px_2px_0_0_#000] rounded hover:bg-[#FF1744] hover:text-white transition-colors">
       <RotateCcw size={14} /> Reset Layout
      </button>
     </div>
    </div>
   )}
  </div>
 )

 const avatar = data.avatarUrl || ""
 const rawHandle =
  data.brain?.channelProfile?.channelHandle || data.authState?.channelHandle || ""
 const normalizedHandle = String(rawHandle || "").trim().replace(/^@/, "")
 const handleText = normalizedHandle ? `@${normalizedHandle}` : "@connect-channel"
 const channelName = data.brain?.channelProfile?.name || data.authState?.channelName || "Your Channel"
 const creditsLeft = Math.max(0, Math.floor(entitlement.creditBalance || 0))
 const creditCap = Math.max(1, Math.floor(entitlement.rolloverCap || entitlement.monthlyCreditGrant || 1))
 const meterPct = entitlement.tier === "large" ? 100 : Math.max(0, Math.min(100, Math.round((creditsLeft / creditCap) * 100)))

 const renderKpiCards = () => (
  <div className="flex items-center gap-1.5 flex-1 px-4 justify-center">
   {data.statBlocks28d.map((stat, idx) => {
    const bars = Array.from({ length: 7 }, (_, i) => {
     const seed = ((idx * 7 + i + 1) * 17) % 100
     return 40 + (seed % 50)
    })
    
    let cleanTrend = stat.trend || ""
    if (cleanTrend) {
     const match = cleanTrend.match(/([+-]?)(\d+(\.\d+)?)%/)
     if (match) {
       const sign = match[1]
       const val = parseFloat(match[2])
       cleanTrend = val >= 100 ? `${sign}${Math.round(val).toString().slice(0, 4)}%` : `${sign}${val.toFixed(1).slice(0, 4)}%`
     }
    }
    return (
     <div key={idx} className="flex flex-col bg-white border-[2px] border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] overflow-hidden w-[110px] h-[64px] flex-shrink-0">
      <div style={{ background: stat.color }} className="border-b-[2px] border-black h-[14px] flex items-center justify-center">
       <span className="text-[7.5px] font-black uppercase tracking-widest text-black leading-none">{stat.label}</span>
      </div>
      <div className="flex items-baseline justify-center gap-1.5 px-1 pt-0.5">
       <div className="text-[14px] font-black tracking-tighter text-black leading-none">
        {stat.value.endsWith("K") ? <>{stat.value.slice(0, -1)}<span className="text-[0.65em]">K</span></> : stat.value.endsWith("M") ? <>{stat.value.slice(0, -1)}<span className="text-[0.65em]">M</span></> : stat.value}
       </div>
       {stat.trend && <span style={{ color: stat.trend.includes("▲") ? "#008B00" : "#D32F2F" }} className="text-[8.5px] font-black leading-none">{cleanTrend}</span>}
      </div>
      <div className="flex items-end gap-[1.5px] px-1 h-[14px] mt-auto">
       {bars.map((h, i) => (
        <div key={i} style={{ flex: 1, height: `${Math.min(100, h * 1.5)}%`, background: stat.color, opacity: 0.3 + (h / 100) * 0.7, borderRadius: "1px 1px 0 0", border: "1px solid rgba(0,0,0,0.15)", borderBottom: "none" }} />
       ))}
      </div>
     </div>
    )
   })}
  </div>
 )

 const renderTokenSettings = () => (
  <div className="relative">
   <button
    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
    className="flex items-center gap-2 bg-white border-[2px] border-black rounded-[6px] px-3 py-1 shadow-[2px_2px_0_0_#000] hover:-translate-y-[1px] hover:shadow-[3px_3px_0_0_#000] active:translate-y-[1px] active:shadow-[1px_1px_0_0_#000] transition-all ml-2">
    <Sparkles size={12} className="text-black" />
    <div className="flex flex-col gap-1">
     <span className="font-black text-[9px] tracking-widest uppercase">
      {entitlement.subscriptionPlanId.replace(/_/g, " ")} |{" "}
      {entitlement.tier === "large" ? "UNLIMITED" : `${creditsLeft.toLocaleString()} CREDITS`}
     </span>
     <div className="w-[132px] h-[7px] border border-black rounded-full bg-white overflow-hidden">
      <div
       style={{
        width: `${meterPct}%`,
        height: "100%",
        background: entitlement.tier === "large" ? "#4FFF5B" : meterPct > 65 ? "#4FFF5B" : meterPct > 30 ? "#FFE357" : "#FF8AAF",
        transition: "width 280ms ease",
       }}
      />
     </div>
    </div>
    {entitlement.tier !== "large" ? (
     <div className="bg-[#FF1744] text-white font-black text-[8px] px-2 py-0.5 rounded border border-black tracking-widest leading-none">UPGRADE</div>
    ) : null}
    <ChevronDown size={12} strokeWidth={3} className="ml-0.5 opacity-50" />
   </button>
   
   {isDropdownOpen && (
    <div className="absolute right-0 top-[calc(100%+8px)] w-[240px] bg-white border-[3px] border-black shadow-[4px_4px_0_0_#000] rounded-[8px] z-50 flex flex-col overflow-hidden">
     <div className="p-4 border-b-[2px] border-black bg-[#eee] flex items-center gap-3">
      <div className="w-10 h-10 rounded-full border-[2.5px] border-black bg-white overflow-hidden shadow-[2px_2px_0_0_#000]">
       {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : <UserCircle2 size={24} />}
      </div>
     <div className="flex flex-col">
       <span className="font-black text-[12px] uppercase leading-tight tracking-tight whitespace-nowrap overflow-hidden text-ellipsis w-[140px]">{channelName}</span>
       <span className="font-black text-[9px] opacity-60 uppercase leading-tight">{handleText}</span>
       <div className="mt-1 flex items-center gap-2">
        <div className="w-[86px] h-[6px] border border-black rounded-full bg-white overflow-hidden">
         <div
          style={{
           width: `${meterPct}%`,
           height: "100%",
           background: entitlement.tier === "large" ? "#4FFF5B" : meterPct > 65 ? "#4FFF5B" : meterPct > 30 ? "#FFE357" : "#FF8AAF",
           transition: "width 280ms ease",
          }}
         />
        </div>
        <span className="font-black text-[8px] uppercase tracking-wider">
         {entitlement.tier === "large" ? "UNL" : `${meterPct}%`}
        </span>
       </div>
     </div>
     </div>
     <div className="flex flex-col p-2 gap-1 bg-white">
      <button
       onClick={async () => {
        setIsDropdownOpen(false)
        if (!authState.isAuthenticated) {
         await login()
         return
        }
        navigate("/account#workspace-data")
       }}
       className="text-left px-3 py-2 font-black text-[10px] uppercase tracking-wider hover:bg-[#C9F830] border-2 border-transparent hover:border-black rounded transition-colors">
       Connect Channel
      </button>
      <button
       onClick={async () => {
        setIsDropdownOpen(false)
        if (!authState.isAuthenticated) {
         await login()
         return
        }
        await globalSyncData({ batchMode: "initial" })
       }}
       className="text-left px-3 py-2 font-black text-[10px] uppercase tracking-wider hover:bg-[#C9F830] border-2 border-transparent hover:border-black rounded transition-colors">
       Run Sync
      </button>
      <div className="h-[2px] bg-black/10 my-1 mx-2"></div>
      <button
       onClick={() => {
        setIsDropdownOpen(false)
        navigate("/account#account-profile")
       }}
       className="text-left px-3 py-2 font-black text-[10px] uppercase tracking-wider hover:bg-[#C9F830] border-2 border-transparent hover:border-black rounded transition-colors">
       Account Settings
      </button>
      <button
       onClick={() => {
        setIsDropdownOpen(false)
        navigate("/account#billing-meter")
       }}
       className="text-left px-3 py-2 font-black text-[10px] uppercase tracking-wider hover:bg-[#FF83EA] border-2 border-transparent hover:border-black rounded transition-colors">
       Billing & Meter
      </button>
      <button
       onClick={() => {
        setIsDropdownOpen(false)
        navigate("/account#api-keys")
       }}
       className="text-left px-3 py-2 font-black text-[10px] uppercase tracking-wider hover:bg-[#24D3FF] border-2 border-transparent hover:border-black rounded transition-colors">
       API Keys
      </button>
     </div>
     <div className="border-t-[2px] border-black p-2 bg-[#eee]">
      <button
       onClick={() => {
        setIsDropdownOpen(false)
        logout()
       }}
       className="w-full text-center px-3 py-2 font-black text-[11px] uppercase tracking-wider bg-white border-[2px] border-black shadow-[2px_2px_0_0_#000] rounded hover:bg-[#FF1744] hover:text-white transition-colors">
       Sign Out
      </button>
     </div>
    </div>
   )}
  </div>
 )

 return (
  <div className="dashboard-header mb-4">
   <div className="dashboard-header-bar flex items-center justify-between px-4">
    {/* Controls Zone */}
    <div className="flex items-center gap-2">
     {renderControls()}
     <div className="h-6 w-[2px] bg-black/10 mx-1"></div>
     <AIModelSelector compact />
    </div>

    {/* KPI Row */}
    {renderKpiCards()}

    {/* Identity Zone & Token Settings */}
    <div className="flex items-center gap-3">
     <div className="flex flex-col justify-center text-right">
      <a href={normalizedHandle ? `https://youtube.com/@${normalizedHandle}` : "https://youtube.com"} target="_blank" rel="noreferrer" className="font-black text-[14px] uppercase tracking-[-0.02em] leading-none hover:underline cursor-pointer decoration-2 underline-offset-2">
       {channelName}
      </a>
      <div className="font-black text-[10px] opacity-60 leading-none mt-1">{handleText}</div>
     </div>
     <div className="w-10 h-10 rounded-full border-[2.5px] border-black bg-white overflow-hidden flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
      {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : <UserCircle2 size={24} strokeWidth={1.5} />}
     </div>
     
     <div className="w-[2px] h-6 bg-black/20 mx-1"></div>
     
     {renderTokenSettings()}
    </div>
   </div>

    {/* Ticker Strip */}
    <div className="dashboard-header-ticker relative mt-4 h-10 border-t-2 border-black bg-white">
     <div className="bg-black text-[#C9F830] font-black text-[10px] uppercase tracking-[0.1em] px-3 h-full flex items-center flex-shrink-0 z-10 shadow-[2px_0_0_0_#000] absolute left-0 top-0">
      LIVE
     </div>
     <div className="flex-1 overflow-hidden relative h-full flex justify-center items-center w-full">
      <div className="flex items-center justify-center gap-8 px-4 w-full">
       <span className="text-[#FFE357] font-black text-[11px] tracking-wide uppercase">📈 TRENDING</span>
       <span className="text-black font-black text-[11px]">YouTube rolls out AI-powered auto-dubbing</span>
       <span className="text-[#FF83EA] font-black text-[11px] tracking-wide uppercase ml-4">🎯 MILESTONE</span>
       <span className="text-black font-black text-[11px]">Passed 25,000 subscribers!</span>
       <span className="text-[#C9F830] font-black text-[11px] tracking-wide uppercase ml-4">💬 COMMENT</span>
       <span className="text-black font-black text-[11px]">"This tutorial saved my life!"</span>
      </div>
     </div>
    <button className="bg-black text-white px-3 h-full border-l-[3px] border-black flex items-center hover:bg-gray-900 transition-colors flex-shrink-0 z-10 absolute right-0 top-0" title="Configure Ticker">
     <Settings size={12} />
    </button>
   </div>
  </div>
 )
}
