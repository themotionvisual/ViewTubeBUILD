import React, { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useBrain } from "../context/useBrain"
import { CustomIcon } from "../components/CustomIcon"
import { DailyAdviceWidget } from "../components/DailyAdviceWidget"
import { getMetricSummary, getMasterRows } from "../services/analyticsSelectors"

const formatHumanNumber = (value: unknown): string => {
 const parsed = Number(value)
 if (!Number.isFinite(parsed) || parsed < 0) return "---"
 if (parsed === 0) return "0"
 if (parsed >= 1_000_000) return `${(parsed / 1_000_000).toFixed(1)}M`
 if (parsed >= 1_000) return `${(parsed / 1_000).toFixed(1)}K`
 return Math.round(parsed).toLocaleString()
}

const formatRelativeTime = (timestamp?: number | null) => {
 if (!timestamp) return "Never"
 const diffMs = Date.now() - timestamp
 const minutes = Math.max(1, Math.round(diffMs / 60000))
 if (minutes < 60) return `${minutes}m ago`
 const hours = Math.round(minutes / 60)
 if (hours < 24) return `${hours}h ago`
 const days = Math.round(hours / 24)
 return `${days}d ago`
}

const toHighResYouTubeAvatar = (url?: string | null) => {
 if (!url) return ""
 if (url.includes("googleusercontent.com")) {
  return url
   .replace(/=s\d+-c-k-c0x00ffffff-no-rj/, "=s800-c-k-c0x00ffffff-no-rj")
   .replace(/=s\d+-c-k-c0x00ffffff-no-nd-rj/, "=s800-c-k-c0x00ffffff-no-nd-rj")
   .replace(/=s\d+$/, "=s800")
 }
 return url
}

const Dashboard: React.FC = () => {
 const { brain, authState, lastSyncComplete } = useBrain()
 const navigate = useNavigate()
 const [currentTime, setCurrentTime] = useState(new Date())

 useEffect(() => {
  const timer = setInterval(() => setCurrentTime(new Date()), 60000)
  return () => clearInterval(timer)
 }, [])

 const subsTotal = Number(authState.subscriberCount || 0) || 0
 const summary28d = useMemo(
  () => getMetricSummary("28d", "api"),
  [lastSyncComplete],
 )
 const canonicalRows = useMemo(
  () => getMasterRows("lifetime", "api"),
  [lastSyncComplete],
 )

 const views28d = summary28d.totals.views
 const hours28d = summary28d.totals.watchHours
 const revenue28d = summary28d.totals.revenue
 const subscribers28d = summary28d.totals.subscribersGained
 const resolvedSubscribers = Math.max(0, Math.round(subsTotal + subscribers28d))

 const statBlocks = [
  { label: "Views", value: formatHumanNumber(views28d) },
  { label: "Subscribers", value: resolvedSubscribers.toLocaleString() },
  { label: "Hours", value: hours28d.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
  {
   label: "Revenue",
   value: `$${revenue28d.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  },
 ]

 const today = new Date()
 today.setHours(0, 0, 0, 0)

 const upcomingDays = useMemo(() => {
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())

  return Array.from({ length: 14 }).map((_, i) => {
   const d = new Date(startOfWeek)
   d.setDate(startOfWeek.getDate() + i)
   const dateStr = d.toISOString().split("T")[0]
   const tasks = brain.calendarState?.dayTasks?.[dateStr] || []
   const isToday = d.getTime() === today.getTime()
   return { date: d, dateStr, tasks, isToday }
  })
 }, [brain.calendarState?.dayTasks, today])

 const week1 = upcomingDays.slice(0, 7)
 const week2 = upcomingDays.slice(7, 14)
 const todayTasks = upcomingDays.find((d) => d.isToday)?.tasks || []

 const recentUploads = [...canonicalRows]
  .sort(
   (a, b) =>
    new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime(),
  )
  .slice(0, 3)

 const topPerformer = [...canonicalRows].sort(
  (a, b) => (b.metrics.views?.value || 0) - (a.metrics.views?.value || 0),
 )[0]

 const quickActions = [
  { label: "Publish Video", to: "/studio", iconName: "video" },
  { label: "Design Thumbnail", to: "/studio", iconName: "image" },
  { label: "Manage Projects", to: "/project-calendar", iconName: "calendar" },
  { label: "Performance", to: "/performance", iconName: "analytics" },
  { label: "Shorts Studio", to: "/shorts", iconName: "sparkles" },
  { label: "Studio Hub", to: "/studio", iconName: "layers" },
  { label: "Schedule", to: "/project-calendar", iconName: "calendar" },
  { label: "Settings", to: "/settings", iconName: "settings" },
  {
   label: "Reference Studio V2",
   to: "/reference-studio-v2",
   iconName: "settings",
  },
 ]

 const avatarUrl = toHighResYouTubeAvatar(authState.channelThumbnail)

 return (
  <div className="w-full p-8 pb-24 max-w-[1700px] mx-auto">
   <div className="flex flex-col xl:flex-row items-stretch gap-6 w-full">
    <div className="w-48 h-48 rounded-full border-[3px] border-black bg-white shadow-[6px_6px_0px_0px_black] shrink-0 flex items-center justify-center overflow-hidden rotate-[-2deg] self-center xl:self-start">
     {avatarUrl ?
      <img
       src={avatarUrl}
       alt="Channel Avatar"
       className="w-full h-full object-cover"
       referrerPolicy="no-referrer"
      />
     : <span className="text-4xl font-[1000] text-black/20 uppercase">OS</span>}
    </div>

    <div className="grid grid-cols-2 grid-rows-2 gap-3 flex-1 min-w-[280px] xl:h-[320px]">
     {statBlocks.map((s, idx) => (
      <div
       key={idx}
       className="bg-white border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_0px_black] overflow-hidden hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_black] transition-all cursor-default">
       <div className="h-10 bg-[#F16A7C] border-b-[3px] border-black px-3 flex items-center">
        <span className="text-xl font-[1000] uppercase tracking-tight text-black leading-none">
         {s.label}
        </span>
       </div>
       <div className="bg-[#F2F2F2] px-4 py-3 h-[calc(100%-40px)] flex items-center">
        <span className="text-4xl font-[1000] uppercase tracking-tighter text-black truncate">
         {s.value}
        </span>
       </div>
      </div>
     ))}
    </div>

    <div className="flex flex-col flex-1 gap-4 min-w-[340px] xl:h-[320px]">
     <div className="bg-white border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_0px_black] overflow-hidden h-full">
      <div className="h-10 bg-[#FFB570] border-b-[3px] border-black px-4 flex items-center justify-between">
       <div className="flex items-center gap-2">
        <CustomIcon name="calendar" size={20} />
        <h3 className="text-xl font-[1000] uppercase tracking-tight text-black">
         Calendar
        </h3>
       </div>
       <h3 className="text-sm font-[1000] uppercase tracking-tight text-black leading-none truncate">
        {currentTime.toLocaleDateString(undefined, {
         month: "2-digit",
         day: "2-digit",
         year: "2-digit",
        })}
       </h3>
      </div>

      <div className="bg-[#F2F2F2] p-3 flex flex-col gap-2 h-[calc(100%-40px)]">
       <div className="grid grid-cols-7 gap-1 px-1 mb-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
         <div
          key={i}
          className="text-center text-[10px] font-black uppercase text-black/40">
          {day}
         </div>
        ))}
       </div>

       <div className="grid grid-cols-7 gap-1">
        {week1.map((d) => (
         <div
          key={d.dateStr}
          title={`${d.tasks.length} tasks`}
          style={{
           backgroundColor:
            d.isToday ? "#FFB570"
            : d.tasks.length > 0 ? "#FFD8B3"
            : undefined,
          }}
          className={`aspect-square flex flex-col items-center justify-center rounded-xl border transition-all ${
           d.isToday ? "border-black text-black shadow-[3px_3px_0px_0px_black]"
           : d.tasks.length > 0 ?
            "border-black shadow-[1px_1px_0px_0px_black] hover:bg-white cursor-pointer"
           : "bg-gray-50 border-gray-200 text-black/30 w-full max-w-[48px] mx-auto"
          } w-full`}>
          <span
           className={`text-sm md:text-lg font-[1000] ${d.isToday ? "text-black" : ""}`}>
           {d.date.getDate()}
          </span>
          {d.tasks.length > 0 && !d.isToday && (
           <div className="w-1 h-1 rounded-full bg-black -mb-2 mt-0.5" />
          )}
         </div>
        ))}
       </div>

       <div className="grid grid-cols-7 gap-1">
        {week2.map((d) => (
         <div
          key={d.dateStr}
          title={`${d.tasks.length} tasks`}
          style={{
           backgroundColor:
            d.isToday ? "#FFB570"
            : d.tasks.length > 0 ? "#FFD8B3"
            : undefined,
          }}
          className={`aspect-square flex flex-col items-center justify-center rounded-xl border transition-all ${
           d.isToday ? "border-black text-black shadow-[3px_3px_0px_0px_black]"
           : d.tasks.length > 0 ?
            "border-black shadow-[1px_1px_0px_0px_black] hover:bg-white cursor-pointer"
           : "bg-gray-50 border-gray-200 text-black/30 w-full max-w-[48px] mx-auto"
          } w-full`}>
          <span
           className={`text-sm md:text-lg font-[1000] ${d.isToday ? "text-black" : ""}`}>
           {d.date.getDate()}
          </span>
          {d.tasks.length > 0 && !d.isToday && (
           <div className="w-1 h-1 rounded-full bg-black -mb-2 mt-0.5" />
          )}
         </div>
        ))}
       </div>
      </div>
     </div>
    </div>

    <div className="bg-white border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_0px_black] overflow-hidden flex-1 min-w-[250px] xl:h-[320px]">
     <div className="h-10 bg-[#FFB570] border-b-[3px] border-black px-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
       <CustomIcon name="zap" size={22} />
       <h3 className="text-xl font-[1000] uppercase tracking-tight text-black">
        To Do
       </h3>
      </div>
      <button
       onClick={() => navigate("/project-calendar")}
       className="bg-white border-2 border-black rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_black] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
       Add Task
      </button>
     </div>

     <div className="bg-[#F2F2F2] p-4 flex flex-col gap-3 h-[calc(100%-40px)]">
      {todayTasks.length > 0 ?
       todayTasks.map((t: any) => (
        <div key={t.id} className="flex gap-3 group items-center">
         <div
          className={`shrink-0 border-2 rounded-md transition-colors w-4 h-4 ${t.completed ? "" : "bg-transparent"}`}
          style={{
           borderColor: "#FFB570",
           backgroundColor: t.completed ? "#FFB570" : undefined,
          }}
         />
         <span
          className={`text-xs font-bold uppercase ${t.completed ? "text-black/30 line-through" : "text-black"}`}>
          {t.text}
         </span>
        </div>
       ))
      : <div className="w-full py-8 flex flex-col items-center justify-center border-2 border-dashed border-black/20 rounded-xl bg-gray-50">
        <span className="text-[10px] font-black uppercase text-black/40 tracking-widest text-center">
         Schedule Clear
        </span>
       </div>
      }
     </div>
    </div>
   </div>

   <div className="mt-8">
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
     <div className="bg-white border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_0px_black] overflow-hidden">
      <div className="h-10 bg-[#FFB570] border-b-[3px] border-black px-4 flex items-center justify-between">
       <span className="text-xl font-[1000] uppercase tracking-tight text-black">
        Connection
       </span>
       <span
        className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border-2 border-black"
        style={{
         backgroundColor: authState.isAuthenticated ? "#4FFF5B" : "#FF8AAF",
        }}>
        {authState.isAuthenticated ? "Linked" : "Offline"}
       </span>
      </div>
      <div className="bg-[#F2F2F2] p-4 flex flex-col gap-3">
       <div className="text-2xl font-[1000] uppercase tracking-tighter text-black">
        {authState.isAuthenticated ? "YouTube Connected" : "Not Connected"}
       </div>
       <div className="text-[10px] font-black uppercase tracking-widest text-black/50">
        Last Sync:{" "}
        {formatRelativeTime(
         lastSyncComplete ? new Date(lastSyncComplete).getTime() : null,
        )}
       </div>
      </div>
     </div>

     <div className="bg-white border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_0px_black] overflow-hidden">
      <div className="h-10 bg-[#FFB570] border-b-[3px] border-black px-4 flex items-center">
       <span className="text-xl font-[1000] uppercase tracking-tight text-black">
        Top Performer
       </span>
      </div>
      <div className="bg-[#F2F2F2] p-4 flex flex-col gap-3">
       {topPerformer ?
        <>
         <div className="text-lg font-[1000] uppercase tracking-tighter text-black line-clamp-2">
          {topPerformer.title}
         </div>
         <div className="text-3xl font-[1000] uppercase tracking-tighter text-black">
          {formatHumanNumber(topPerformer.metrics.views?.value || 0)} views
         </div>
        </>
       : <div className="text-sm font-black uppercase tracking-widest text-black/60">
         No video data yet
        </div>
       }
      </div>
     </div>

     <div className="bg-white border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_0px_black] overflow-hidden">
      <div className="h-10 bg-[#FFB570] border-b-[3px] border-black px-4 flex items-center">
       <span className="text-xl font-[1000] uppercase tracking-tight text-black">
        Recent Uploads
       </span>
      </div>
      <div className="bg-[#F2F2F2] p-4 flex flex-col gap-2">
       {recentUploads.length > 0 ?
        recentUploads.map((video) => (
         <div key={video.videoId} className="flex items-center gap-3">
          <div className="w-12 h-8 rounded-lg border-2 border-black overflow-hidden bg-gray-100">
           {video.thumbnailUrl ?
            <img
             src={video.thumbnailUrl}
             alt={video.title}
             className="w-full h-full object-cover"
            />
           : <img
             src={`https://img.youtube.com/vi/${video.videoId}/0.jpg`}
             alt={video.title}
             className="w-full h-full object-cover"
            />
           }
          </div>
          <div className="flex-1">
           <div className="text-xs font-black uppercase tracking-widest text-black line-clamp-1">
            {video.title}
           </div>
           <div className="text-[10px] font-black uppercase tracking-widest text-black/40">
            {new Date(video.uploadDate).toLocaleDateString()}
           </div>
          </div>
         </div>
        ))
       : <div className="text-[10px] font-black uppercase tracking-widest text-black/40">
         No uploads in cache
        </div>
       }
      </div>
     </div>
    </div>
   </div>

   <div className="mt-8">
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
     {quickActions.map((action, index) => {
      const rowBg = (action as any).color || (index < 4 ? "#4FFF5B" : "#579AFF")
      const iconBg = index < 4 ? "#B9FFBE" : "#BBD4FF"
      return (
       <button
        key={action.label}
        onClick={() => navigate(action.to)}
        className="border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_0px_black] overflow-hidden flex items-stretch text-left hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_black] transition-all">
        <div
         className="w-16 border-r-[3px] border-black flex items-center justify-center"
         style={{ backgroundColor: iconBg }}>
         <CustomIcon name={action.iconName} size={24} />
        </div>
        <div
         className="flex-1 px-3 py-3 flex flex-col justify-center"
         style={{ backgroundColor: rowBg }}>
         <span className="text-base font-[1000] uppercase tracking-tighter text-black leading-none">
          {action.label}
         </span>
        </div>
       </button>
      )
     })}
    </div>
   </div>

   <DailyAdviceWidget />
  </div>
 )
}

export default Dashboard
