import React, { useMemo, useState } from "react"
import {
 CalendarDays,
 ChevronDown,
 ChevronLeft,
 ChevronRight,
 ChevronUp,
 Clock3,
 List,
 Search,
 SlidersHorizontal,
 X,
} from "lucide-react"
import { useBrain } from "../context/useBrain"
import type { Project } from "../types"
import {
 hydrateProjectWorkspace,
 readProjectWorkspace,
 type ProjectPriority,
 type ProjectWorkspaceMeta,
} from "../features/projects/projectWorkspace"

type ScheduleView = "month" | "week" | "agenda"

type PublishingScheduleArchitectProps = {
 collapsible?: boolean
 isOpenInitial?: boolean
 paletteIndex?: number
}

const priorityTone: Record<ProjectPriority, string> = {
 low: "#D6D6D6",
 medium: "#00CCFF",
 high: "#FFEA5A",
 urgent: "#FF4FD8",
}

const DAY_MS = 86_400_000

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

const addDays = (date: Date, amount: number) => {
 const next = new Date(date)
 next.setDate(next.getDate() + amount)
 return startOfDay(next)
}

const startOfWeek = (date: Date) => {
 const next = startOfDay(date)
 next.setDate(next.getDate() - next.getDay())
 return next
}

const dateKey = (date: Date) => {
 const year = date.getFullYear()
 const month = String(date.getMonth() + 1).padStart(2, "0")
 const day = String(date.getDate()).padStart(2, "0")
 return `${year}-${month}-${day}`
}

const parseDateKey = (value?: string) => {
 if (!value) return null
 const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
 if (!match) return null
 const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
 return Number.isNaN(date.getTime()) ? null : startOfDay(date)
}

const formatDay = (date: Date) => date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })
const formatMonth = (date: Date) => date.toLocaleDateString(undefined, { month: "long", year: "numeric" })

const projectLabel = (project: Project) => project.videoTitle || project.name

const ProjectScheduleCard: React.FC<{
 project: Project
 meta?: ProjectWorkspaceMeta
 compact?: boolean
 onClear?: () => void
}> = ({ project, meta, compact = false, onClear }) => (
 <article className="rounded-[8px] border-[2px] border-black bg-white shadow-[2px_2px_0_rgba(0,0,0,.16)]">
  <div className="flex min-w-0 items-stretch">
   <div
    className="w-2 shrink-0 border-r-[2px] border-black"
    style={{ backgroundColor: project.color || priorityTone[meta?.priority || "medium"] }}
   />
   <div className={`min-w-0 flex-1 ${compact ? "px-2 py-1.5" : "px-2.5 py-2"}`}>
    <div className="truncate text-[10px] font-[1000] uppercase leading-tight">{projectLabel(project)}</div>
    {!compact ? (
     <div className="mt-1 flex flex-wrap gap-1 text-[7px] font-black uppercase text-black/45">
      <span>{meta?.priority || "medium"}</span>
      <span>•</span>
      <span>{meta?.lane?.replace("-", " ") || project.status || "project"}</span>
     </div>
    ) : null}
   </div>
   {onClear ? (
    <button type="button" onClick={onClear} aria-label={`Unschedule ${projectLabel(project)}`} className="w-7 shrink-0 border-l-[2px] border-black hover:bg-black/5">
     <X size={12} className="mx-auto" />
    </button>
   ) : null}
  </div>
 </article>
)

const PublishingScheduleArchitect: React.FC<PublishingScheduleArchitectProps> = ({ collapsible = false, isOpenInitial = true }) => {
 const { brain, updateProject } = useBrain()
 const projects = useMemo(() => Array.isArray(brain.projects) ? brain.projects : [], [brain.projects])
 const workspace = useMemo(() => hydrateProjectWorkspace(readProjectWorkspace(), projects), [projects])
 const [view, setView] = useState<ScheduleView>("month")
 const [cursor, setCursor] = useState(() => startOfDay(new Date()))
 const [query, setQuery] = useState("")
 const [showBacklog, setShowBacklog] = useState(true)
 const [isOpen, setIsOpen] = useState(isOpenInitial)

 const todayKey = dateKey(new Date())
 const normalizedQuery = query.trim().toLowerCase()

 const visibleProjects = useMemo(() => projects.filter((project) => {
  if (!normalizedQuery) return true
  const meta = workspace.projects[project.id]
  return [project.name, project.videoTitle, project.description, meta?.owner, ...(meta?.tags || [])]
   .filter(Boolean)
   .join(" ")
   .toLowerCase()
   .includes(normalizedQuery)
 }), [normalizedQuery, projects, workspace.projects])

 const scheduledProjects = useMemo(() => visibleProjects
  .filter((project) => Boolean(parseDateKey(project.publishDate)))
  .sort((a, b) => String(a.publishDate).localeCompare(String(b.publishDate))), [visibleProjects])

 const unscheduledProjects = useMemo(() => visibleProjects
  .filter((project) => !parseDateKey(project.publishDate))
  .sort((a, b) => {
   const aMeta = workspace.projects[a.id]
   const bMeta = workspace.projects[b.id]
   const rank = { urgent: 0, high: 1, medium: 2, low: 3 } as const
   return rank[aMeta?.priority || "medium"] - rank[bMeta?.priority || "medium"]
  }), [visibleProjects, workspace.projects])

 const projectsForDate = (key: string) => scheduledProjects.filter((project) => project.publishDate?.slice(0, 10) === key)

 const monthDays = useMemo(() => {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
  const gridStart = startOfWeek(first)
  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index))
 }, [cursor])

 const weekDays = useMemo(() => {
  const first = startOfWeek(cursor)
  return Array.from({ length: 7 }, (_, index) => addDays(first, index))
 }, [cursor])

 const agendaProjects = useMemo(() => {
  const cursorStart = startOfDay(cursor).getTime()
  return scheduledProjects.filter((project) => {
   const parsed = parseDateKey(project.publishDate)
   return parsed ? parsed.getTime() >= cursorStart : false
  }).slice(0, 40)
 }, [cursor, scheduledProjects])

 const scheduleProject = (projectId: string, publishDate: string) => {
  updateProject(projectId, { publishDate } as Partial<Project>)
 }

 const clearProjectDate = (projectId: string) => {
  updateProject(projectId, { publishDate: "" } as Partial<Project>)
 }

 const goPrevious = () => {
  if (view === "month") setCursor((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1))
  else if (view === "week") setCursor((date) => addDays(date, -7))
  else setCursor((date) => addDays(date, -14))
 }

 const goNext = () => {
  if (view === "month") setCursor((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1))
  else if (view === "week") setCursor((date) => addDays(date, 7))
  else setCursor((date) => addDays(date, 14))
 }

 const title = view === "month"
  ? formatMonth(cursor)
  : view === "week"
   ? `${formatDay(weekDays[0])} – ${formatDay(weekDays[6])}`
   : `From ${formatDay(cursor)}`

 const content = (
  <div className="overflow-hidden rounded-[14px] border-[4px] border-black bg-white shadow-[8px_8px_0_rgba(0,0,0,.16)]">
   <header className="border-b-[4px] border-black bg-[#FFEA5A] px-3 py-3 sm:px-4">
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
     <div>
      <div className="text-[19px] font-[1000] uppercase leading-none tracking-[-0.04em]">Publishing Calendar</div>
      <div className="mt-1 text-[9px] font-black uppercase tracking-[0.08em] text-black/55">Schedule real projects without leaving the Projects workspace</div>
     </div>
     <div className="flex flex-wrap gap-2">
      <button type="button" onClick={() => setCursor(startOfDay(new Date()))} className="h-9 rounded-[7px] border-[2px] border-black bg-white px-3 text-[9px] font-black uppercase shadow-[2px_2px_0_black]">Today</button>
      <button type="button" onClick={() => setShowBacklog((value) => !value)} className="flex h-9 items-center gap-1.5 rounded-[7px] border-[2px] border-black bg-white px-3 text-[9px] font-black uppercase shadow-[2px_2px_0_black]">
       <List size={14} /> {showBacklog ? "Hide backlog" : "Show backlog"}
      </button>
     </div>
    </div>
   </header>

   <div className="grid gap-2 border-b-[3px] border-black bg-white p-2 lg:grid-cols-[minmax(180px,1fr)_auto_auto]">
    <label className="flex h-9 items-center gap-2 rounded-[7px] border-[2px] border-black px-2">
     <Search size={14} />
     <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search scheduled projects" className="min-w-0 flex-1 bg-transparent text-[10px] font-bold outline-none" />
    </label>
    <div className="grid grid-cols-3 overflow-hidden rounded-[7px] border-[2px] border-black">
     {(["month", "week", "agenda"] as const).map((option, index) => (
      <button
       key={option}
       type="button"
       onClick={() => setView(option)}
       className={`h-9 px-3 text-[9px] font-black uppercase ${index ? "border-l-[2px] border-black" : ""} ${view === option ? "bg-black text-white" : "bg-white"}`}
      >
       {option}
      </button>
     ))}
    </div>
    <div className="grid grid-cols-[36px_minmax(120px,1fr)_36px] overflow-hidden rounded-[7px] border-[2px] border-black">
     <button type="button" onClick={goPrevious} className="border-r-[2px] border-black"><ChevronLeft size={15} className="mx-auto" /></button>
     <div className="flex h-9 min-w-0 items-center justify-center px-3 text-center text-[9px] font-black uppercase">{title}</div>
     <button type="button" onClick={goNext} className="border-l-[2px] border-black"><ChevronRight size={15} className="mx-auto" /></button>
    </div>
   </div>

   <div className={`grid min-h-[520px] ${showBacklog ? "xl:grid-cols-[minmax(0,1fr)_280px]" : "grid-cols-1"}`}>
    <main className={`${showBacklog ? "xl:border-r-[3px] xl:border-black" : ""} min-w-0`}>
     {view === "month" ? (
      <div className="overflow-x-auto">
       <div className="min-w-[840px]">
        <div className="grid grid-cols-7 border-b-[2px] border-black bg-black text-white">
         {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <div key={day} className="px-2 py-1.5 text-center text-[8px] font-black uppercase">{day}</div>)}
        </div>
        <div className="grid grid-cols-7">
         {monthDays.map((day) => {
          const key = dateKey(day)
          const dayProjects = projectsForDate(key)
          const isCurrentMonth = day.getMonth() === cursor.getMonth()
          return (
           <section key={key} className={`min-h-[118px] border-b-[1.5px] border-r-[1.5px] border-black p-1.5 ${isCurrentMonth ? "bg-white" : "bg-black/[0.035]"}`}>
            <div className="mb-1 flex items-center justify-between">
             <span className={`flex h-6 min-w-6 items-center justify-center rounded-[5px] px-1 text-[9px] font-black ${key === todayKey ? "bg-black text-white" : isCurrentMonth ? "text-black" : "text-black/30"}`}>{day.getDate()}</span>
             {dayProjects.length ? <span className="text-[7px] font-black text-black/40">{dayProjects.length}</span> : null}
            </div>
            <div className="grid gap-1">
             {dayProjects.slice(0, 3).map((project) => <ProjectScheduleCard key={project.id} project={project} meta={workspace.projects[project.id]} compact onClear={() => clearProjectDate(project.id)} />)}
             {dayProjects.length > 3 ? <div className="px-1 text-[7px] font-black uppercase text-black/40">+{dayProjects.length - 3} more</div> : null}
            </div>
           </section>
          )
         })}
        </div>
       </div>
      </div>
     ) : null}

     {view === "week" ? (
      <div className="overflow-x-auto">
       <div className="grid min-w-[840px] grid-cols-7">
        {weekDays.map((day) => {
         const key = dateKey(day)
         const dayProjects = projectsForDate(key)
         return (
          <section key={key} className="min-h-[500px] border-r-[2px] border-black last:border-r-0">
           <header className={`border-b-[2px] border-black px-2 py-2 text-center ${key === todayKey ? "bg-black text-white" : "bg-[#f5f5f5]"}`}>
            <div className="text-[8px] font-black uppercase">{day.toLocaleDateString(undefined, { weekday: "short" })}</div>
            <div className="text-[16px] font-[1000]">{day.getDate()}</div>
           </header>
           <div className="grid gap-2 p-2">
            {dayProjects.map((project) => <ProjectScheduleCard key={project.id} project={project} meta={workspace.projects[project.id]} onClear={() => clearProjectDate(project.id)} />)}
            {!dayProjects.length ? <div className="rounded-[7px] border-[2px] border-dashed border-black/15 px-2 py-6 text-center text-[8px] font-black uppercase text-black/25">Open</div> : null}
           </div>
          </section>
         )
        })}
       </div>
      </div>
     ) : null}

     {view === "agenda" ? (
      <div className="p-2 sm:p-3">
       {agendaProjects.length ? (
        <div className="grid gap-2">
         {agendaProjects.map((project) => {
          const parsed = parseDateKey(project.publishDate)!
          const daysAway = Math.round((parsed.getTime() - startOfDay(new Date()).getTime()) / DAY_MS)
          return (
           <div key={project.id} className="grid gap-2 rounded-[10px] border-[3px] border-black p-2 md:grid-cols-[130px_minmax(0,1fr)]">
            <div className="flex items-center gap-2 rounded-[7px] border-[2px] border-black bg-[#FFEA5A] px-2 py-2">
             <CalendarDays size={15} />
             <div>
              <div className="text-[9px] font-[1000] uppercase">{formatDay(parsed)}</div>
              <div className="text-[7px] font-black uppercase text-black/45">{daysAway === 0 ? "Today" : daysAway > 0 ? `${daysAway} days away` : `${Math.abs(daysAway)} days ago`}</div>
             </div>
            </div>
            <ProjectScheduleCard project={project} meta={workspace.projects[project.id]} onClear={() => clearProjectDate(project.id)} />
           </div>
          )
         })}
        </div>
       ) : <div className="flex min-h-[360px] items-center justify-center text-[10px] font-black uppercase text-black/30">No upcoming scheduled projects</div>}
      </div>
     ) : null}
    </main>

    {showBacklog ? (
     <aside className="min-w-0 bg-[#f7f7f7]">
      <header className="border-b-[3px] border-black bg-[#00CCFF] px-3 py-2">
       <div className="flex items-center justify-between gap-2">
        <div>
         <div className="text-[11px] font-[1000] uppercase">Unscheduled</div>
         <div className="text-[8px] font-bold text-black/50">Assign a publish date</div>
        </div>
        <span className="flex h-7 min-w-7 items-center justify-center rounded-[6px] border-[2px] border-black bg-white px-1 text-[9px] font-black">{unscheduledProjects.length}</span>
       </div>
      </header>
      <div className="grid max-h-[620px] gap-2 overflow-y-auto p-2">
       {unscheduledProjects.map((project) => {
        const meta = workspace.projects[project.id]
        return (
         <article key={project.id} className="overflow-hidden rounded-[9px] border-[2px] border-black bg-white shadow-[2px_2px_0_rgba(0,0,0,.12)]">
          <div className="flex items-stretch border-b-[2px] border-black">
           <div className="w-2 border-r-[2px] border-black" style={{ backgroundColor: priorityTone[meta?.priority || "medium"] }} />
           <div className="min-w-0 flex-1 px-2.5 py-2">
            <div className="truncate text-[10px] font-[1000] uppercase">{projectLabel(project)}</div>
            <div className="mt-0.5 text-[7px] font-black uppercase text-black/40">{meta?.lane?.replace("-", " ") || project.status || "project"} • {meta?.priority || "medium"}</div>
           </div>
          </div>
          <label className="flex items-center gap-2 p-2">
           <Clock3 size={13} />
           <input
            type="date"
            aria-label={`Schedule ${projectLabel(project)}`}
            min={todayKey}
            onChange={(event) => event.target.value && scheduleProject(project.id, event.target.value)}
            className="h-8 min-w-0 flex-1 rounded-[6px] border-[2px] border-black bg-white px-2 text-[9px] font-black outline-none"
           />
          </label>
         </article>
        )
       })}
       {!unscheduledProjects.length ? <div className="rounded-[8px] border-[2px] border-dashed border-black/20 px-3 py-8 text-center text-[8px] font-black uppercase text-black/30">Everything has a publish date</div> : null}
      </div>
     </aside>
    ) : null}
   </div>

   <footer className="grid gap-0 border-t-[3px] border-black bg-white sm:grid-cols-3">
    <div className="flex items-center gap-2 border-b-[2px] border-black px-3 py-2 sm:border-b-0 sm:border-r-[2px]"><CalendarDays size={14} /><span className="text-[8px] font-black uppercase">{scheduledProjects.length} scheduled</span></div>
    <div className="flex items-center gap-2 border-b-[2px] border-black px-3 py-2 sm:border-b-0 sm:border-r-[2px]"><List size={14} /><span className="text-[8px] font-black uppercase">{unscheduledProjects.length} unscheduled</span></div>
    <div className="flex items-center gap-2 px-3 py-2"><SlidersHorizontal size={14} /><span className="text-[8px] font-black uppercase">Dates write back to project records</span></div>
   </footer>
  </div>
 )

 if (!collapsible) return content

 return (
  <section className="overflow-hidden rounded-[14px] border-[4px] border-black bg-white">
   <button type="button" onClick={() => setIsOpen((value) => !value)} className="flex w-full items-center justify-between bg-[#FFEA5A] px-3 py-2 text-left">
    <div>
     <div className="text-[12px] font-[1000] uppercase">Publishing Calendar</div>
     <div className="text-[8px] font-black uppercase text-black/45">Calendar · week · agenda · unscheduled backlog</div>
    </div>
    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
   </button>
   {isOpen ? <div className="border-t-[4px] border-black">{content}</div> : null}
  </section>
 )
}

export default PublishingScheduleArchitect
