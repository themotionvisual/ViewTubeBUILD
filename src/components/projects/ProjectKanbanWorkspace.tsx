import React, { useEffect, useMemo, useState } from "react"
import {
 DndContext,
 KeyboardSensor,
 PointerSensor,
 closestCorners,
 useDroppable,
 useSensor,
 useSensors,
 type DragEndEvent,
} from "@dnd-kit/core"
import {
 SortableContext,
 sortableKeyboardCoordinates,
 useSortable,
 verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
 Archive,
 CalendarDays,
 CheckCircle2,
 ChevronLeft,
 ChevronRight,
 CircleAlert,
 GripVertical,
 MoreHorizontal,
 Plus,
 Search,
 SlidersHorizontal,
 Tag,
 UserRound,
 X,
} from "lucide-react"
import { useBrain } from "../../context/useBrain"
import type { Project } from "../../types"
import {
 PROJECT_LANES,
 hydrateProjectWorkspace,
 patchProjectMeta,
 readProjectWorkspace,
 statusForLane,
 writeProjectWorkspace,
 type ProjectLaneId,
 type ProjectPriority,
 type ProjectWorkspaceMeta,
 type ProjectWorkspaceState,
} from "../../features/projects/projectWorkspace"

const laneTone: Record<ProjectLaneId, string> = {
 ideas: "#00CCFF",
 planned: "#FFEA5A",
 "in-progress": "#CCFF00",
 review: "#FF9F43",
 ready: "#8CFFB0",
 blocked: "#FF4FD8",
 published: "#D6D6D6",
}

const priorityLabel: Record<ProjectPriority, string> = {
 low: "Low",
 medium: "Medium",
 high: "High",
 urgent: "Urgent",
}

const projectTaskProgress = (project: Project) => {
 const tasks = Array.isArray(project.tasks) ? project.tasks : []
 if (!tasks.length) return null
 const complete = tasks.filter((task) => task.completed).length
 return { complete, total: tasks.length, percent: Math.round((complete / tasks.length) * 100) }
}

const ProjectCard: React.FC<{
 project: Project
 meta: ProjectWorkspaceMeta
 onOpen: () => void
 onMove: (direction: -1 | 1) => void
}> = ({ project, meta, onOpen, onMove }) => {
 const sortable = useSortable({ id: project.id, data: { projectId: project.id, lane: meta.lane } })
 const style = {
  transform: CSS.Transform.toString(sortable.transform),
  transition: sortable.transition,
  opacity: sortable.isDragging ? 0.45 : 1,
 }
 const progress = projectTaskProgress(project)
 const laneIndex = PROJECT_LANES.findIndex((lane) => lane.id === meta.lane)

 return (
  <article
   ref={sortable.setNodeRef}
   style={style}
   className="rounded-[10px] border-[3px] border-black bg-white shadow-[4px_4px_0_rgba(0,0,0,0.18)]"
  >
   <div className="flex items-stretch border-b-[2px] border-black">
    <button
     type="button"
     aria-label={`Drag ${project.name}`}
     className="flex w-8 shrink-0 touch-none items-center justify-center border-r-[2px] border-black bg-black/5 cursor-grab active:cursor-grabbing"
     {...sortable.attributes}
     {...sortable.listeners}
    >
     <GripVertical size={15} />
    </button>
    <button type="button" onClick={onOpen} className="min-w-0 flex-1 px-3 py-2 text-left">
     <div className="truncate text-[12px] font-[1000] uppercase leading-tight tracking-[-0.02em]">{project.name}</div>
     {project.videoTitle && project.videoTitle !== project.name ? (
      <div className="mt-0.5 truncate text-[9px] font-bold text-black/45">{project.videoTitle}</div>
     ) : null}
    </button>
    <button type="button" onClick={onOpen} aria-label={`Open ${project.name}`} className="w-8 border-l-[2px] border-black bg-white hover:bg-black/5">
     <MoreHorizontal size={16} className="mx-auto" />
    </button>
   </div>

   <button type="button" onClick={onOpen} className="w-full px-3 py-2 text-left">
    <div className="flex flex-wrap gap-1.5">
     <span className="rounded-[5px] border-[1.5px] border-black bg-black px-1.5 py-0.5 text-[8px] font-black uppercase text-white">
      {priorityLabel[meta.priority]}
     </span>
     {meta.tags.slice(0, 2).map((tag) => (
      <span key={tag} className="rounded-[5px] border-[1.5px] border-black bg-white px-1.5 py-0.5 text-[8px] font-black uppercase">
       {tag}
      </span>
     ))}
    </div>

    <div className="mt-2 grid gap-1 text-[9px] font-bold text-black/55">
     {project.publishDate ? (
      <div className="flex items-center gap-1.5"><CalendarDays size={11} /> {project.publishDate}</div>
     ) : null}
     {meta.owner ? (
      <div className="flex items-center gap-1.5"><UserRound size={11} /> {meta.owner}</div>
     ) : null}
    </div>

    {progress ? (
     <div className="mt-2">
      <div className="mb-1 flex justify-between text-[8px] font-black uppercase text-black/45">
       <span>Tasks</span><span>{progress.complete}/{progress.total}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full border-[1.5px] border-black bg-white">
       <div className="h-full bg-black" style={{ width: `${progress.percent}%` }} />
      </div>
     </div>
    ) : null}
   </button>

   <div className="grid grid-cols-2 border-t-[2px] border-black">
    <button
     type="button"
     disabled={laneIndex <= 0}
     onClick={() => onMove(-1)}
     className="flex h-7 items-center justify-center border-r-[1px] border-black text-[9px] font-black uppercase disabled:opacity-20"
    >
     <ChevronLeft size={13} /> Move
    </button>
    <button
     type="button"
     disabled={laneIndex >= PROJECT_LANES.length - 1}
     onClick={() => onMove(1)}
     className="flex h-7 items-center justify-center border-l-[1px] border-black text-[9px] font-black uppercase disabled:opacity-20"
    >
     Move <ChevronRight size={13} />
    </button>
   </div>
  </article>
 )
}

const BoardLane: React.FC<{
 lane: (typeof PROJECT_LANES)[number]
 projects: Project[]
 state: ProjectWorkspaceState
 onOpen: (projectId: string) => void
 onMove: (projectId: string, direction: -1 | 1) => void
}> = ({ lane, projects, state, onOpen, onMove }) => {
 const droppable = useDroppable({ id: `lane:${lane.id}`, data: { lane: lane.id } })
 return (
  <section className="flex min-h-[420px] min-w-[248px] flex-1 flex-col overflow-hidden rounded-[12px] border-[3px] border-black bg-[#f5f5f5]">
   <header className="border-b-[3px] border-black px-3 py-2" style={{ backgroundColor: laneTone[lane.id] }}>
    <div className="flex items-center justify-between gap-2">
     <h3 className="text-[12px] font-[1000] uppercase tracking-[-0.02em]">{lane.label}</h3>
     <span className="flex h-6 min-w-6 items-center justify-center rounded-[6px] border-[2px] border-black bg-white px-1 text-[9px] font-black">
      {projects.length}
     </span>
    </div>
    <p className="mt-0.5 text-[8px] font-bold text-black/55">{lane.description}</p>
   </header>
   <div ref={droppable.setNodeRef} className={`flex flex-1 flex-col gap-2 p-2 ${droppable.isOver ? "bg-black/5" : ""}`}>
    <SortableContext items={projects.map((project) => project.id)} strategy={verticalListSortingStrategy}>
     {projects.map((project) => (
      <ProjectCard
       key={project.id}
       project={project}
       meta={state.projects[project.id]}
       onOpen={() => onOpen(project.id)}
       onMove={(direction) => onMove(project.id, direction)}
      />
     ))}
    </SortableContext>
    {projects.length === 0 ? (
     <div className="flex min-h-24 items-center justify-center rounded-[8px] border-[2px] border-dashed border-black/25 px-4 text-center text-[9px] font-black uppercase text-black/30">
      Drop project here
     </div>
    ) : null}
   </div>
  </section>
 )
}

const ProjectKanbanWorkspace: React.FC = () => {
 const { brain, addProject, updateProject } = useBrain()
 const projects = useMemo(() => Array.isArray(brain.projects) ? brain.projects : [], [brain.projects])
 const [workspace, setWorkspace] = useState<ProjectWorkspaceState>(() => hydrateProjectWorkspace(readProjectWorkspace(), projects))
 const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
 const [showCreate, setShowCreate] = useState(false)
 const [newName, setNewName] = useState("")
 const [newDate, setNewDate] = useState("")
 const [newPriority, setNewPriority] = useState<ProjectPriority>("medium")
 const sensors = useSensors(
  useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
 )

 useEffect(() => {
  setWorkspace((current) => hydrateProjectWorkspace(current, projects))
 }, [projects])

 useEffect(() => {
  writeProjectWorkspace(workspace)
 }, [workspace])

 const patchWorkspace = (updater: (current: ProjectWorkspaceState) => ProjectWorkspaceState) => {
  setWorkspace((current) => updater(current))
 }

 const moveProject = (projectId: string, lane: ProjectLaneId, order?: number) => {
  const current = workspace.projects[projectId]
  if (!current) return
  const laneProjects = projects
   .filter((project) => workspace.projects[project.id]?.lane === lane && project.id !== projectId)
   .sort((a, b) => (workspace.projects[a.id]?.order ?? 0) - (workspace.projects[b.id]?.order ?? 0))
  const nextOrder = order ?? laneProjects.length
  patchWorkspace((state) => patchProjectMeta(state, projectId, { lane, order: nextOrder }))
  updateProject(projectId, { status: statusForLane(lane) } as Partial<Project>)
 }

 const moveByDirection = (projectId: string, direction: -1 | 1) => {
  const meta = workspace.projects[projectId]
  if (!meta) return
  const index = PROJECT_LANES.findIndex((lane) => lane.id === meta.lane)
  const next = PROJECT_LANES[index + direction]
  if (next) moveProject(projectId, next.id)
 }

 const handleDragEnd = (event: DragEndEvent) => {
  const projectId = String(event.active.id)
  const overId = event.over?.id ? String(event.over.id) : ""
  if (!overId) return
  const targetLane = overId.startsWith("lane:")
   ? overId.replace("lane:", "") as ProjectLaneId
   : workspace.projects[overId]?.lane
  if (!targetLane) return
  const targetOrder = overId.startsWith("lane:") ? undefined : workspace.projects[overId]?.order
  moveProject(projectId, targetLane, targetOrder)
 }

 const filteredProjects = useMemo(() => {
  const query = workspace.query.trim().toLowerCase()
  return projects.filter((project) => {
   const meta = workspace.projects[project.id]
   if (!meta) return false
   if (!workspace.showArchived && meta.archived) return false
   if (workspace.showArchived && !meta.archived) return false
   if (workspace.priorityFilter !== "all" && meta.priority !== workspace.priorityFilter) return false
   if (workspace.ownerFilter !== "all" && meta.owner !== workspace.ownerFilter) return false
   if (!query) return true
   const haystack = [project.name, project.videoTitle, project.description, meta.owner, ...meta.tags].filter(Boolean).join(" ").toLowerCase()
   return haystack.includes(query)
  })
 }, [projects, workspace])

 const owners = useMemo(() => Array.from(new Set(Object.values(workspace.projects).map((meta) => meta.owner).filter(Boolean))).sort(), [workspace.projects])
 const selectedProject = projects.find((project) => project.id === selectedProjectId) || null
 const selectedMeta = selectedProject ? workspace.projects[selectedProject.id] : null

 const createProject = () => {
  const name = newName.trim()
  if (!name) return
  const id = `p-${Date.now()}`
  const project = {
   id,
   name,
   videoTitle: name,
   status: "ideation",
   color: "#00CCFF",
   publishDate: newDate,
   tasks: [],
   script: "",
   description: "",
   tags: "",
   storyboard: [],
  } as Project
  addProject(project)
  setWorkspace((current) => {
   const hydrated = hydrateProjectWorkspace(current, [...projects, project])
   return patchProjectMeta(hydrated, id, { priority: newPriority, lane: "ideas" })
  })
  setNewName("")
  setNewDate("")
  setNewPriority("medium")
  setShowCreate(false)
  setSelectedProjectId(id)
 }

 return (
  <div className="w-full overflow-hidden rounded-[14px] border-[4px] border-black bg-white shadow-[8px_8px_0_rgba(0,0,0,0.16)]">
   <header className="border-b-[4px] border-black bg-[#00CCFF] px-3 py-3 sm:px-4">
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
     <div>
      <div className="text-[19px] font-[1000] uppercase leading-none tracking-[-0.04em]">Project Board</div>
      <div className="mt-1 text-[9px] font-black uppercase tracking-[0.08em] text-black/55">Move real projects from idea to published</div>
     </div>
     <div className="flex flex-wrap gap-2">
      <button type="button" onClick={() => setWorkspace((state) => ({ ...state, showArchived: !state.showArchived }))} className="flex h-9 items-center gap-1.5 rounded-[7px] border-[2px] border-black bg-white px-3 text-[9px] font-black uppercase shadow-[2px_2px_0_black]">
       <Archive size={14} /> {workspace.showArchived ? "Active" : "Archived"}
      </button>
      <button type="button" onClick={() => setShowCreate(true)} className="flex h-9 items-center gap-1.5 rounded-[7px] border-[2px] border-black bg-black px-3 text-[9px] font-black uppercase text-white shadow-[2px_2px_0_rgba(0,0,0,.25)]">
       <Plus size={14} /> New Project
      </button>
     </div>
    </div>
   </header>

   <div className="grid gap-2 border-b-[3px] border-black bg-white p-2 md:grid-cols-[minmax(180px,1fr)_140px_150px_auto]">
    <label className="flex h-9 items-center gap-2 rounded-[7px] border-[2px] border-black px-2">
     <Search size={14} />
     <input value={workspace.query} onChange={(event) => setWorkspace((state) => ({ ...state, query: event.target.value }))} placeholder="Search projects" className="min-w-0 flex-1 bg-transparent text-[10px] font-bold outline-none" />
    </label>
    <label className="flex h-9 items-center rounded-[7px] border-[2px] border-black px-2">
     <SlidersHorizontal size={13} className="mr-1" />
     <select value={workspace.priorityFilter} onChange={(event) => setWorkspace((state) => ({ ...state, priorityFilter: event.target.value as ProjectWorkspaceState["priorityFilter"] }))} className="min-w-0 flex-1 bg-transparent text-[9px] font-black uppercase outline-none">
      <option value="all">All priorities</option>
      <option value="urgent">Urgent</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
     </select>
    </label>
    <label className="flex h-9 items-center rounded-[7px] border-[2px] border-black px-2">
     <UserRound size={13} className="mr-1" />
     <select value={workspace.ownerFilter} onChange={(event) => setWorkspace((state) => ({ ...state, ownerFilter: event.target.value }))} className="min-w-0 flex-1 bg-transparent text-[9px] font-black uppercase outline-none">
      <option value="all">All owners</option>
      {owners.map((owner) => <option key={owner} value={owner}>{owner}</option>)}
     </select>
    </label>
    <button type="button" onClick={() => setWorkspace((state) => ({ ...state, query: "", priorityFilter: "all", ownerFilter: "all" }))} className="h-9 rounded-[7px] border-[2px] border-black px-3 text-[9px] font-black uppercase hover:bg-black hover:text-white">Clear</button>
   </div>

   <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
    <div className="overflow-x-auto p-2 sm:p-3">
     <div className="flex min-w-max gap-2">
      {PROJECT_LANES.map((lane) => {
       const laneProjects = filteredProjects
        .filter((project) => workspace.projects[project.id]?.lane === lane.id)
        .sort((a, b) => (workspace.projects[a.id]?.order ?? 0) - (workspace.projects[b.id]?.order ?? 0))
       return <BoardLane key={lane.id} lane={lane} projects={laneProjects} state={workspace} onOpen={setSelectedProjectId} onMove={moveByDirection} />
      })}
     </div>
    </div>
   </DndContext>

   {!filteredProjects.length ? (
    <div className="border-t-[3px] border-black p-8 text-center">
     <CheckCircle2 size={28} className="mx-auto mb-2" />
     <div className="text-[12px] font-[1000] uppercase">No matching projects</div>
     <div className="mt-1 text-[9px] font-bold text-black/45">Create a project or clear the current filters.</div>
    </div>
   ) : null}

   {showCreate ? (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 p-4" role="dialog" aria-modal="true" aria-label="Create project">
     <div className="w-full max-w-md rounded-[12px] border-[4px] border-black bg-white shadow-[10px_10px_0_black]">
      <div className="flex items-center justify-between border-b-[3px] border-black bg-[#CCFF00] px-4 py-3">
       <h3 className="text-[15px] font-[1000] uppercase">New Project</h3>
       <button type="button" onClick={() => setShowCreate(false)}><X size={18} /></button>
      </div>
      <div className="grid gap-3 p-4">
       <label className="grid gap-1 text-[9px] font-black uppercase">Project name<input autoFocus value={newName} onChange={(event) => setNewName(event.target.value)} className="h-10 rounded-[7px] border-[2px] border-black px-3 text-[11px] normal-case outline-none focus:shadow-[2px_2px_0_black]" /></label>
       <label className="grid gap-1 text-[9px] font-black uppercase">Target publish date<input type="date" value={newDate} onChange={(event) => setNewDate(event.target.value)} className="h-10 rounded-[7px] border-[2px] border-black px-3 text-[11px] outline-none" /></label>
       <label className="grid gap-1 text-[9px] font-black uppercase">Priority<select value={newPriority} onChange={(event) => setNewPriority(event.target.value as ProjectPriority)} className="h-10 rounded-[7px] border-[2px] border-black px-3 text-[10px] font-black uppercase outline-none"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></label>
       <button type="button" onClick={createProject} disabled={!newName.trim()} className="mt-1 h-10 rounded-[7px] border-[2px] border-black bg-black text-[10px] font-black uppercase text-white disabled:opacity-30">Create project</button>
      </div>
     </div>
    </div>
   ) : null}

   {selectedProject && selectedMeta ? (
    <div className="fixed inset-0 z-[110] flex justify-end bg-black/35" role="dialog" aria-modal="true" aria-label={`${selectedProject.name} project details`}>
     <aside className="h-full w-full max-w-[430px] overflow-y-auto border-l-[4px] border-black bg-white shadow-[-8px_0_0_rgba(0,0,0,.15)]">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b-[3px] border-black px-4 py-3" style={{ backgroundColor: laneTone[selectedMeta.lane] }}>
       <div>
        <div className="text-[9px] font-black uppercase text-black/55">Project details</div>
        <h3 className="text-[16px] font-[1000] uppercase leading-tight">{selectedProject.name}</h3>
       </div>
       <button type="button" onClick={() => setSelectedProjectId(null)} className="flex h-8 w-8 items-center justify-center rounded-[6px] border-[2px] border-black bg-white"><X size={16} /></button>
      </div>
      <div className="grid gap-4 p-4">
       <label className="grid gap-1 text-[9px] font-black uppercase">Title<input value={selectedProject.name} onChange={(event) => updateProject(selectedProject.id, { name: event.target.value } as Partial<Project>)} className="h-10 rounded-[7px] border-[2px] border-black px-3 text-[11px] normal-case outline-none" /></label>
       <div className="grid grid-cols-2 gap-2">
        <label className="grid gap-1 text-[9px] font-black uppercase">Status<select value={selectedMeta.lane} onChange={(event) => moveProject(selectedProject.id, event.target.value as ProjectLaneId)} className="h-10 rounded-[7px] border-[2px] border-black px-2 text-[9px] font-black uppercase outline-none">{PROJECT_LANES.map((lane) => <option key={lane.id} value={lane.id}>{lane.label}</option>)}</select></label>
        <label className="grid gap-1 text-[9px] font-black uppercase">Priority<select value={selectedMeta.priority} onChange={(event) => patchWorkspace((state) => patchProjectMeta(state, selectedProject.id, { priority: event.target.value as ProjectPriority }))} className="h-10 rounded-[7px] border-[2px] border-black px-2 text-[9px] font-black uppercase outline-none"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></label>
       </div>
       <label className="grid gap-1 text-[9px] font-black uppercase">Owner<div className="relative"><UserRound size={14} className="absolute left-3 top-3" /><input value={selectedMeta.owner} onChange={(event) => patchWorkspace((state) => patchProjectMeta(state, selectedProject.id, { owner: event.target.value }))} placeholder="Unassigned" className="h-10 w-full rounded-[7px] border-[2px] border-black pl-9 pr-3 text-[10px] normal-case outline-none" /></div></label>
       <label className="grid gap-1 text-[9px] font-black uppercase">Publish date<input type="date" value={selectedProject.publishDate || ""} onChange={(event) => updateProject(selectedProject.id, { publishDate: event.target.value } as Partial<Project>)} className="h-10 rounded-[7px] border-[2px] border-black px-3 text-[10px] outline-none" /></label>
       <label className="grid gap-1 text-[9px] font-black uppercase">Description<textarea value={selectedProject.description || ""} onChange={(event) => updateProject(selectedProject.id, { description: event.target.value } as Partial<Project>)} rows={5} className="rounded-[7px] border-[2px] border-black p-3 text-[10px] font-medium normal-case outline-none" /></label>
       <label className="grid gap-1 text-[9px] font-black uppercase"><span className="flex items-center gap-1"><Tag size={12} /> Tags</span><input value={selectedMeta.tags.join(", ")} onChange={(event) => patchWorkspace((state) => patchProjectMeta(state, selectedProject.id, { tags: event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean) }))} placeholder="history, longform, sponsor" className="h-10 rounded-[7px] border-[2px] border-black px-3 text-[10px] normal-case outline-none" /></label>
       {selectedMeta.lane === "blocked" ? <div className="flex gap-2 rounded-[8px] border-[2px] border-black bg-[#FF4FD8] p-3 text-[9px] font-black uppercase text-white"><CircleAlert size={16} className="shrink-0" /> This project is blocked. Update its description or tasks with the recovery action, then move it back into production.</div> : null}
       <button type="button" onClick={() => { patchWorkspace((state) => patchProjectMeta(state, selectedProject.id, { archived: true })); setSelectedProjectId(null) }} className="flex h-10 items-center justify-center gap-2 rounded-[7px] border-[2px] border-black bg-white text-[9px] font-black uppercase hover:bg-black hover:text-white"><Archive size={14} /> Archive project</button>
      </div>
     </aside>
    </div>
   ) : null}
  </div>
 )
}

export default ProjectKanbanWorkspace
