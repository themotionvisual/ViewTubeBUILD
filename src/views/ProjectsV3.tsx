import React, { useState, useMemo } from "react"
import { useBrain } from "../context/GlobalDataContext"
import { CustomIcon } from "../components/CustomIcon"
import {
 Calendar,
 Plus,
 ChevronLeft,
 ChevronRight,
 Target,
 Trash2,
 Layout,
 CheckSquare,
 AlignLeft,
 Zap,
 X,
 Activity,
 TrendingUp,
 Tag,
 Cloud,
 Clock,
} from "lucide-react"
import type { Project } from "../types"
import { performSync } from "../services/analyticsSync"
import { nexusSyncService } from "../services/nexusSyncService"

const PROJECT_COLORS = [
 "#FF87F3",
 "#CCFF00",
 "#00CCFF",
 "#FF3366",
 "#9933FF",
 "#FF9900",
]

const ProjectsV3: React.FC = () => {
 const { brain, updateBrain, addProject, deleteProject } = useBrain()
 const [selectedDate, setSelectedDate] = useState<string>(
  new Date().toISOString().split("T")[0],
 )
 const [activeTab, setActiveTab] = useState<string>("channel")
 const [showNewProjectModal, setShowNewProjectModal] = useState(false)
 const [newProjectName, setNewProjectName] = useState("")
 const [newDayTask, setNewDayTask] = useState("")
 const [isPushing, setIsPushing] = useState<string | null>(null)
 const [syncLoading, setSyncLoading] = useState(false)

 const projects = brain.projects || []
 const dayTasks = brain.calendarState?.dayTasks || {}
 const activeProject = projects.find((p) => p.id === activeTab) || null

 // Load actual YouTube videos from cache for the calendar
 const ytVideos = useMemo(() => {
  try {
   const cache = JSON.parse(localStorage.getItem("yt_analytics_cache") || "{}")
   return (cache.videos || []) as any[]
  } catch {
   return []
  }
 }, [])

 // Calendar Generation Logic (Upgraded 120-Day Velocity)
 const calendarData = useMemo(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 4-month range: past 1, current, next 2
  const startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  startDate.setDate(startDate.getDate() - startDate.getDay()) // Back to Sunday

  const endDate = new Date(today.getFullYear(), today.getMonth() + 3, 0)
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay())) // Forward to Saturday

  const weeks = []
  let currentDate = new Date(startDate)

  while (currentDate <= endDate) {
   const week = []
   for (let i = 0; i < 7; i++) {
    const dateString = currentDate.toISOString().split("T")[0]
    const isToday = dateString === today.toISOString().split("T")[0]
    const isCurrentMonth = currentDate.getMonth() === today.getMonth()

    // Find events/tasks for this day
    const dayProjectTasks = projects.flatMap((p) =>
     p.tasks
      .filter((t) => t.dueDate === dateString)
      .map((t) => ({ ...t, projectId: p.id, color: p.color })),
    )
    const dayPublishEvents = projects.filter(
     (p) => p.publishDate === dateString,
    )
    const manualTasks = dayTasks[dateString] || []

    // Actual YT Videos on this day
    const dayYtVideos = ytVideos.filter(
     (v) => v.publishedAt?.split("T")[0] === dateString,
    )

    week.push({
     id: dateString,
     date: new Date(currentDate),
     isToday,
     isCurrentMonth,
     hasEvent:
      dayProjectTasks.length > 0 ||
      dayPublishEvents.length > 0 ||
      manualTasks.length > 0 ||
      dayYtVideos.length > 0,
     dateString,
     allTasks: [
      ...dayPublishEvents.map((p) => ({
       id: `pub-${p.id}`,
       text: `PUBLISH: ${p.name}`,
       color: p.color,
       completed: false,
       isPublish: true,
      })),
      ...dayYtVideos.map((v) => ({
       id: `yt-${v.videoId}`,
       text: `LIVE: ${v.title}`,
       color: "#00CCFF",
       completed: true,
       isYtLive: true,
      })),
      ...dayProjectTasks.map((t) => ({ ...t, isProjectTask: true })),
      ...manualTasks,
     ],
    })
    currentDate.setDate(currentDate.getDate() + 1)
   }
   weeks.push(week)
  }
  return weeks
 }, [projects, dayTasks, ytVideos])

 const months = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
 ]

 const handleCreateProject = () => {
  if (!newProjectName.trim()) return
  const newProject: Project = {
   id: `p-${Date.now()}`,
   name: newProjectName,
   videoTitle: newProjectName,
   status: "ideation",
   color: PROJECT_COLORS[brain.projects.length % PROJECT_COLORS.length],
   publishDate: selectedDate,
   tasks: [],
   storyboard: [],
   script: "",
   description: "",
   notes: "",
   tags: "",
   thumbnailUrl: "",
   plan: {
    topic: "",
    description: "",
    length: "",
    audience: "",
    vision: "",
    hook: "",
   },
  }
  addProject(newProject)
  setActiveTab(newProject.id)
  setNewProjectName("")
  setShowNewProjectModal(false)
 }

 const handleOrchestrate753 = (project: Project) => {
  if (!project.publishDate) return

  const pubDate = new Date(project.publishDate)
  const intervals = [
   {
    days: 7,
    text: `HOOK TEASER SHORT: ${project.name} (Question/Curiosity focus)`,
    color: "#FF3399",
   },
   {
    days: 5,
    text: `THE DEBATE SHORT: ${project.name} (Controversial detail)`,
    color: "#CCFF00",
   },
   {
    days: 3,
    text: `THE HYPE SHORT: ${project.name} (High-action/Loop focus)`,
    color: "#00CCFF",
   },
  ]

  const newDayTasks = { ...dayTasks }

  intervals.forEach((interval) => {
   const targetDate = new Date(pubDate)
   targetDate.setDate(pubDate.getDate() - interval.days)
   const dateStr = targetDate.toISOString().split("T")[0]

   const newTask: any = {
    id: `strat-753-${project.id}-${interval.days}`,
    text: interval.text,
    completed: false,
    projectId: project.id,
    color: interval.color,
   }

   newDayTasks[dateStr] = [...(newDayTasks[dateStr] || []), newTask]
  })

  // Update project to mark strategy as generated
  const updatedProjects = projects.map((p) =>
   p.id === project.id ? { ...p, shortsStrategyGenerated: true } : p,
  )

  updateBrain({
   projects: updatedProjects,
   calendarState: {
    ...brain.calendarState,
    dayTasks: newDayTasks,
   },
  })
  alert(`7-5-3 Strategy Orchestrated for ${project.name}!`)
 }

 const handleAddManualTask = () => {
  if (!newDayTask.trim()) return
  const newTask: any = {
   id: crypto.randomUUID(),
   text: newDayTask,
   completed: false,
   projectId: "manual",
   color: "#FF3399",
  }

  const updatedDayTasks = {
   ...dayTasks,
   [selectedDate]: [...(dayTasks[selectedDate] || []), newTask],
  }

  updateBrain({
   calendarState: {
    ...brain.calendarState,
    dayTasks: updatedDayTasks,
   },
  })
  setNewDayTask("")
 }

 const toggleTask = (date: string, taskId: string) => {
  if (taskId.startsWith("pub-")) return

  if (dayTasks[date]?.some((t: any) => t.id === taskId)) {
   const updated = dayTasks[date].map((t: any) =>
    t.id === taskId ? { ...t, completed: !t.completed } : t,
   )
   updateBrain({
    calendarState: {
     ...brain.calendarState,
     dayTasks: { ...dayTasks, [date]: updated },
    },
   })
   return
  }

  const [prefix, pId, tId] = taskId.split("-")
  if (prefix === "ptask") {
   const updatedProjects = projects.map((p) => {
    if (p.id === pId) {
     return {
      ...p,
      tasks: p.tasks.map((t) =>
       t.id === tId ? { ...t, completed: !t.completed } : t,
      ),
     }
    }
    return p
   })
   updateBrain({ projects: updatedProjects })
  }
 }

 const handlePushToCalendar = async (publishEvent: any) => {
  const project = projects.find((p) => `pub-${p.id}` === publishEvent.id)
  if (!project) return

  setIsPushing(publishEvent.id)
  try {
   await nexusSyncService.pushToCalendar(project)
   alert(`${project.name} pushed to Google Calendar!`)
  } catch (e: any) {
   console.error(e)
   alert(`Calendar Push failed: ${e.message}`)
  } finally {
   setIsPushing(null)
  }
 }

 const renderCellBackground = (tasks: any[]) => {
  if (tasks.length === 0) return null
  const colors = tasks.map((t) => t.color || "#000000").slice(0, 4)
  const count = colors.length

  if (count === 1)
   return (
    <div className="absolute inset-0" style={{ backgroundColor: colors[0] }} />
   )

  return (
   <svg
    className="absolute inset-0 w-full h-full"
    viewBox="0 0 100 100"
    preserveAspectRatio="none">
    {count === 2 && (
     <>
      <polygon points="0,0 100,0 0,100" fill={colors[0]} />
      <polygon points="100,0 100,100 0,100" fill={colors[1]} />
     </>
    )}
    {count === 3 && (
     <>
      <rect x="0" y="0" width="100" height="33" fill={colors[0]} />
      <rect x="0" y="33" width="100" height="34" fill={colors[1]} />
      <rect x="0" y="67" width="100" height="33" fill={colors[2]} />
     </>
    )}
    {count >= 4 && (
     <>
      <polygon points="0,0 50,0 50,50 0,50" fill={colors[0]} />
      <polygon points="50,0 100,0 100,50 50,50" fill={colors[1]} />
      <polygon points="0,50 50,50 50,100 0,100" fill={colors[2]} />
      <polygon points="50,50 100,50 100,100 50,100" fill={colors[3]} />
     </>
    )}
    <line
     x1="0"
     y1="0"
     x2="100"
     y2="100"
     stroke="black"
     strokeWidth="2"
     opacity="0.2"
    />
   </svg>
  )
 }

 const selectedDayData = calendarData
  .flat()
  .find((d) => d.dateString === selectedDate)

 return (
  <div className="max-w-[1400px] mx-auto pb-40 animate-fade-in px-4">
   <div className="w-full bg-white border-[5px] border-black rounded-2xl shadow-[12px_12px_0px_0px_black] overflow-hidden flex flex-col transition-all duration-700">
    <header className="bg-[#CCFF00] h-[80px] border-b-[5px] border-black flex items-center justify-between px-0 overflow-hidden">
     <div className="flex items-center h-full">
      <div className="bg-black h-full w-[80px] flex items-center justify-center border-r-[5px] border-black flex-shrink-0">
       <CustomIcon name="!!!TRAFIC" size={48} className="text-[#CCFF00]" />
      </div>
      <h1 className="text-[50px] font-[1000] uppercase tracking-tighter text-black pl-8 leading-none">
       PROJECT PLANNING
      </h1>
     </div>

     <div className="flex items-center gap-6 pr-6">
      <button
       onClick={async () => {
        setSyncLoading(true)
        try {
         await performSync(true)
        } catch (e) {
         console.error(e)
        }
        setSyncLoading(false)
       }}
       disabled={syncLoading}
       className="bg-black text-[#CCFF00] px-6 py-2.5 rounded-xl border-[3px] border-black font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_0px_white] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-3">
       {syncLoading ? (
        <Activity size={16} className="animate-spin" />
       ) : (
        <TrendingUp size={16} />
       )}
       Neural Sync
      </button>
      <button
       onClick={() => setShowNewProjectModal(true)}
       className="bg-black text-[#CCFF00] border-[3px] border-black px-6 py-2 rounded-xl font-[1000] uppercase text-sm tracking-tighter shadow-[4px_4px_0px_0px_#CCFF00] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2">
       <Plus size={18} />
       NEW PROJECT
      </button>
     </div>
    </header>

    <div className="p-8">
     <div className="flex gap-4 mb-10 overflow-x-auto pb-4 custom-scrollbar">
      <button
       onClick={() => setActiveTab("channel")}
       className={`px-8 py-3 rounded-2xl font-[1000] uppercase text-xl tracking-tighter border-[4px] border-black transition-all shadow-[6px_6px_0px_0px_black] active:shadow-none flex items-center gap-3 ${activeTab === "channel" ? "bg-black text-[#CCFF00] shadow-none translate-x-1 translate-y-1" : "bg-white text-black hover:bg-gray-50"}`}>
       <Layout size={24} />
       CHANNEL HUB
      </button>
      {projects.map((p) => (
       <div
        key={p.id}
        role="button"
        tabIndex={0}
        onClick={() => setActiveTab(p.id)}
        style={{
         backgroundColor: activeTab === p.id ? "black" : "white",
         color: activeTab === p.id ? p.color : "black",
         borderColor: "black",
        }}
        className={`px-8 py-3 rounded-2xl font-[1000] uppercase text-xl tracking-tighter border-[4px] transition-all shadow-[6px_6px_0px_0px_black] active:shadow-none whitespace-nowrap group relative flex items-center cursor-pointer ${activeTab === p.id ? "shadow-none translate-x-1 translate-y-1" : "hover:bg-gray-50"}`}>
        {p.name}
        <button
         onClick={(e) => {
          e.stopPropagation()
          deleteProject(p.id)
          if (activeTab === p.id) setActiveTab("channel")
         }}
         className="ml-4 opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity">
         <Trash2 size={16} />
        </button>
       </div>
      ))}
     </div>

     <main className="min-h-[600px] relative">
      {activeTab === "channel" ? (
       <section className="bg-[#FF87F3] border-[6px] border-black rounded-[48px] shadow-[12px_12px_0px_0px_black] overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="p-10 flex items-center gap-6 border-b-[5px] border-black">
         <div className="bg-white border-[4px] border-black rounded-[24px] p-4 shadow-[6px_6px_0px_0px_black]">
          <Target size={40} />
         </div>
         <h2 className="text-6xl font-[1000] uppercase tracking-tighter italic leading-none">
          CHANNEL HUB
         </h2>
        </div>
        <div className="p-10 grid grid-cols-2 gap-10 bg-white">
         <div className="space-y-6">
          <div className="bg-[#FF87F3] border-[4px] border-black p-6 rounded-3xl flex justify-between items-center shadow-[6px_6px_0px_0px_black]">
           <h4 className="text-2xl font-[1000] uppercase tracking-tighter italic">
            CHANNEL TO-DO LIST
           </h4>
           <button className="bg-black text-[#CCFF00] px-6 py-2 rounded-xl font-black uppercase text-xs hover:scale-105 transition-transform">
            AI SYNC
           </button>
          </div>
          <div className="min-h-[350px] border-[4px] border-black rounded-[32px] p-8 bg-white shadow-[8px_8px_0px_0px_black]">
           <input
            value={newDayTask}
            onChange={(e) => setNewDayTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddManualTask()}
            placeholder="New global task..."
            className="w-full border-[3px] border-black rounded-2xl p-4 font-black text-sm mb-6 outline-none focus:border-[#FF87F3]"
           />
           <div className="space-y-3">
            {(dayTasks[selectedDate] || []).map((task: any) => (
             <div
              key={task.id}
              className="flex items-center gap-3 p-3 bg-gray-50 border-2 border-black rounded-xl">
              <CheckSquare size={16} />
              <span className="font-bold uppercase text-xs">{task.text}</span>
             </div>
            ))}
            {(!dayTasks[selectedDate] ||
             dayTasks[selectedDate].length === 0) && (
             <div className="opacity-20 flex flex-col items-center justify-center py-10">
              <AlignLeft size={32} />
              <p className="font-black text-xs mt-2 uppercase">
               No active pulses
              </p>
             </div>
            )}
           </div>
          </div>
         </div>
         <div className="space-y-6">
          <div className="bg-[#CCFF00] border-[4px] border-black p-6 rounded-3xl flex justify-between items-center shadow-[6px_6px_0px_0px_black]">
           <h4 className="text-2xl font-[1000] uppercase tracking-tighter italic">
            CHANNEL GOALS
           </h4>
           <button className="bg-black text-[#CCFF00] px-6 py-2 rounded-xl font-black uppercase text-xs hover:scale-105 transition-transform">
            SET TARGETS
           </button>
          </div>
          <div className="min-h-[350px] border-[4px] border-black border-dashed rounded-[32px] p-10 bg-white flex flex-col items-center justify-center opacity-30 shadow-[8px_8px_0px_0px_black]">
           <div className="font-[1000] text-6xl mb-4 text-black/10">+</div>
           <p className="font-black uppercase tracking-[0.2em] text-sm">
            Add High-Level Metric
           </p>
          </div>
         </div>
        </div>
       </section>
      ) : (
       <section className="bg-white border-[6px] border-black rounded-[48px] shadow-[16px_16px_0px_0px_black] min-h-[600px] flex overflow-hidden">
        <div className="flex-1 p-10 border-r-[6px] border-black flex flex-col overflow-hidden">
         <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
           <div className="bg-[#CCFF00] border-[4px] border-black rounded-2xl p-3 shadow-[4px_4px_0px_0px_black]">
            <Calendar size={32} />
           </div>
           <div>
            <h2 className="text-4xl font-[1000] uppercase tracking-tighter italic">
             Production Grid
            </h2>
            <p className="text-[10px] font-black uppercase opacity-30 tracking-[0.2em]">
             120-Day Velocity Horizon
            </p>
           </div>
          </div>
          <div className="flex gap-4">
           <button className="bg-black text-white p-3 rounded-xl border-[3px] border-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all shadow-[4px_4px_0px_0px_black]">
            <ChevronLeft size={20} />
           </button>
           <button className="bg-black text-white p-3 rounded-xl border-[3px] border-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all shadow-[4px_4px_0px_0px_black]">
            <ChevronRight size={20} />
           </button>
          </div>
         </div>

         <div className="flex-1 overflow-x-auto custom-scrollbar pb-4">
          <div className="min-w-max flex gap-3 px-2">
           <div className="flex flex-col gap-3 mt-8 mr-6 opacity-20">
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
             <div
              key={d}
              className="h-10 flex items-center justify-end text-[10px] font-black uppercase">
              {d}
             </div>
            ))}
           </div>

           {calendarData.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-3">
             <div className="h-5 text-[10px] font-black uppercase opacity-20 text-center tracking-widest">
              {week[0].date.getDate() <= 7
               ? months[week[0].date.getMonth()]
               : ""}
             </div>
             {week.map((day) => (
              <div
               key={day.id}
               onClick={() => setSelectedDate(day.dateString)}
               className={`w-10 h-10 rounded-xl border-[3px] border-black relative overflow-hidden transition-all cursor-pointer group
                                                                ${day.isToday ? "scale-125 shadow-[6px_6px_0px_0px_black] z-10 border-[#FF3399]" : "hover:scale-110"}
                                                                ${selectedDate === day.dateString ? "ring-4 ring-[#CCFF00] ring-offset-4" : ""}
                                                                ${!day.isCurrentMonth ? "opacity-10 grayscale" : ""}
                                                                ${!day.hasEvent ? "bg-gray-50" : ""}
                                                            `}>
               {renderCellBackground(day.allTasks)}
               {day.isToday && !day.hasEvent && (
                <div className="absolute inset-0 bg-black/5 animate-pulse" />
               )}
               <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/10 flex items-center justify-center pointer-events-none transition-opacity">
                <span className="text-[10px] font-black text-black drop-shadow-md">
                 {day.date.getDate()}
                </span>
               </div>
              </div>
             ))}
            </div>
           ))}
          </div>
         </div>
        </div>

        <div className="w-[450px] bg-white p-10 flex flex-col overflow-hidden border-l-[6px] border-black">
         {activeProject && (
          <div className="bg-[#FF3399] border-[6px] border-black p-8 rounded-[28px] shadow-[12px_12px_0px_0px_black] mb-10 shrink-0 text-white">
           <div className="flex justify-between items-start mb-6">
            <div>
             <h4 className="text-3xl font-[1000] uppercase tracking-tighter italic leading-none">
              {activeProject.name}
             </h4>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
              Project Intelligence
             </span>
            </div>
            {!activeProject.shortsStrategyGenerated && (
             <button
              onClick={() => handleOrchestrate753(activeProject)}
              className="bg-[#CCFF00] text-black px-4 py-2 rounded-xl border-[3px] border-black font-black uppercase text-[10px] shadow-[4px_4px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2">
              <Zap size={14} />
              Shorts Strategy
             </button>
            )}
           </div>
           <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/20 p-4 rounded-2xl border-2 border-white/20">
             <span className="block text-[8px] font-black uppercase opacity-60 mb-1">
              Status
             </span>
             <span className="text-xs font-black uppercase tracking-widest">
              {activeProject.status}
             </span>
            </div>
            <div className="bg-black/20 p-4 rounded-2xl border-2 border-white/20">
             <span className="block text-[8px] font-black uppercase opacity-60 mb-1">
              Due
             </span>
             <span className="text-xs font-black uppercase tracking-widest">
              {activeProject.publishDate || "---"}
             </span>
            </div>
           </div>
          </div>
         )}

         <div className="bg-[#ccff00] border-[6px] border-black p-8 rounded-[28px] shadow-[12px_12px_0px_0px_black] mb-10 shrink-0">
          <div className="flex items-center gap-4 mb-2">
           <div className="bg-black text-[#ccff00] p-3 rounded-2xl border-4 border-black">
            <Clock size={24} />
           </div>
           <h4 className="text-3xl font-[1000] uppercase tracking-tighter italic">
            {new Date(selectedDate).toLocaleDateString(undefined, {
             month: "short",
             day: "numeric",
             year: "numeric",
            })}
           </h4>
          </div>
          <p className="font-bold opacity-60 uppercase tracking-widest text-[10px]">
           Sector Activity Report
          </p>
         </div>

         <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-4">
          {selectedDayData?.allTasks.length === 0 ? (
           <div className="h-full flex flex-col items-center justify-center text-center opacity-20 space-y-4">
            <Calendar size={64} className="text-black" />
            <p className="font-black uppercase tracking-tighter text-2xl italic">
             Quiet Sector
            </p>
            <p className="font-bold text-sm">No production pulses detected.</p>
           </div>
          ) : (
           selectedDayData?.allTasks.map((task: any) => (
            <div
             key={task.id}
             className={`flex items-center gap-4 p-4 rounded-2xl border-4 border-black transition-all group
                                                        ${task.completed ? "bg-gray-100 opacity-50" : "bg-white shadow-[6px_6px_0px_0px_black] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_black]"}
                                                    `}>
             <button
              disabled={task.isPublish || task.isYtLive}
              onClick={() => toggleTask(selectedDate, task.id)}
              style={{
               backgroundColor: task.completed
                ? "black"
                : task.color || "white",
              }}
              className={`w-8 h-8 rounded-lg border-[3px] border-black flex items-center justify-center shrink-0
                                                            ${task.isPublish || task.isYtLive ? "cursor-not-allowed cursor-help" : "cursor-pointer"}
                                                        `}
              title={
               task.isPublish
                ? "Fixed Publish Event"
                : task.isYtLive
                  ? "Verified YouTube Upload"
                  : "Toggle Task Status"
              }>
              {task.isYtLive ? (
               <CheckSquare size={16} className="text-[#CCFF00]" />
              ) : task.completed ? (
               <X size={20} className="text-white" />
              ) : (
               task.isPublish && <Zap size={14} className="text-black" />
              )}
             </button>
             <div className="flex-1 min-w-0">
              <p
               className={`font-black uppercase tracking-tighter text-sm truncate ${task.completed ? "line-through" : ""}`}>
               {task.text}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
               <Tag size={10} className="opacity-40" />
               <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
                {task.isYtLive
                 ? "Live on YT"
                 : task.isPublish
                   ? "Milestone"
                   : task.isProjectTask
                     ? "Asset Goal"
                     : "Custom Task"}
               </span>
              </div>
             </div>
             {task.isPublish && (
              <button
               onClick={() => handlePushToCalendar(task)}
               disabled={isPushing === task.id}
               className="bg-[#00d2ff] text-black px-3 py-1.5 rounded-xl border-2 border-black font-[1000] uppercase text-[10px] shadow-[4px_4px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2 group">
               {isPushing === task.id ? (
                <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
               ) : (
                <Cloud
                 size={14}
                 className="group-hover:scale-125 transition-transform"
                />
               )}
               Sync
              </button>
             )}
            </div>
           ))
          )}
         </div>

         <div className="mt-8 pt-6 border-t-4 border-black flex gap-2 shrink-0">
          <input
           type="text"
           value={newDayTask}
           onChange={(e) => setNewDayTask(e.target.value)}
           onKeyDown={(e) => e.key === "Enter" && handleAddManualTask()}
           placeholder="INITIATE NEW TASK..."
           className="flex-1 bg-gray-50 border-4 border-black px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs focus:ring-4 focus:ring-[#ccff00] outline-none placeholder:text-black/20"
          />
          <button
           onClick={handleAddManualTask}
           className="bg-[#ccff00] text-black p-4 rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_black] active:shadow-none active:translate-y-[4px] transition-all hover:bg-black hover:text-[#ccff00]">
           <Plus size={24} />
          </button>
         </div>
        </div>
       </section>
      )}
     </main>
    </div>
   </div>

   {/* New Project Modal */}
   {showNewProjectModal && (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-8 animate-in fade-in duration-300">
     <div className="bg-white border-[6px] border-black rounded-[48px] shadow-[24px_24px_0px_0px_#CCFF00] w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-500">
      <div className="bg-[#CCFF00] p-8 border-b-[6px] border-black flex justify-between items-center">
       <h2 className="text-4xl font-[1000] uppercase tracking-tighter italic">
        Initialize Project
       </h2>
       <button
        onClick={() => setShowNewProjectModal(false)}
        className="bg-black text-white p-2 rounded-xl border-[3px] border-black hover:scale-110 transition-transform">
        <X size={32} />
       </button>
      </div>
      <div className="p-12 space-y-10">
       <div className="space-y-4">
        <label className="text-xs font-[1000] uppercase tracking-[0.3em] text-black/40 px-2">
         Project Identity
        </label>
        <input
         autoFocus
         placeholder="Enter Project Name..."
         className="w-full text-5xl font-[1000] uppercase tracking-tighter border-none outline-none placeholder:opacity-10 py-4"
         value={newProjectName}
         onChange={(e) => setNewProjectName(e.target.value)}
         onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
        />
        <div className="h-2 bg-black w-full" />
       </div>

       <div className="flex gap-6">
        <button
         onClick={handleCreateProject}
         className="flex-1 bg-black text-[#CCFF00] border-[4px] border-black py-6 rounded-[32px] font-[1000] text-3xl uppercase tracking-tighter shadow-[8px_8px_0px_0px_#CCFF00] hover:shadow-none hover:translate-y-1 transition-all">
         ACTIVATE
        </button>
        <button
         onClick={() => setShowNewProjectModal(false)}
         className="flex-1 bg-white border-[4px] border-black py-6 rounded-[32px] font-[1000] text-3xl uppercase tracking-tighter shadow-[8px_8px_0px_0px_black] hover:shadow-none hover:translate-y-1 transition-all">
         CANCEL
        </button>
       </div>
      </div>
     </div>
    </div>
   )}
  </div>
 )
}

export default ProjectsV3
