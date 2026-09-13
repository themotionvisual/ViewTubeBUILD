import React, { useEffect, useMemo, useState } from "react"
import { CalendarDays, Columns3, FolderKanban, PanelsTopLeft, Plus, Workflow } from "lucide-react"
import ProjectKanbanWorkspace from "../components/projects/ProjectKanbanWorkspace"
import ProjectsToolboxModule from "../components/projects/ProjectsToolboxModule"
import ContentAssetEngine from "../components/projects/ContentAssetEngine"
import { ProjectStudio } from "../components/ProjectStudio"
import StoryboardStudio from "./StoryboardStudio"
import PublishingScheduleArchitect from "./PublishingScheduleArchitect"
import { useBrain } from "../context/useBrain"

/** Projects is a project-centric toolbox workspace: choose the working project once, then use the tools below. */
const ProjectCalendarPage: React.FC = () => {
 const { brain } = useBrain()
 const projects = useMemo(() => Array.isArray(brain.projects) ? brain.projects : [], [brain.projects])
 const [activeProjectId, setActiveProjectId] = useState(() => projects[0]?.id || "")

 useEffect(() => {
  if (!projects.length) {
   setActiveProjectId("")
   return
  }
  if (!projects.some((project) => project.id === activeProjectId)) setActiveProjectId(projects[0].id)
 }, [activeProjectId, projects])

 const activeProject = projects.find((project) => project.id === activeProjectId) || null
 const tasks = activeProject?.tasks || []
 const completedTasks = tasks.filter((task) => task.completed).length
 const progress = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0

 return (
  <div className="mx-auto flex max-w-[1800px] flex-col gap-6 pb-24">
   <div className="sticky top-[72px] z-30 grid min-w-0 gap-2 rounded-[12px] border-[4px] border-black bg-white p-2 shadow-[6px_6px_0_rgba(0,0,0,.16)] md:grid-cols-[minmax(220px,1fr)_auto]" data-vt-project-workspace-bar="true">
    <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(180px,1fr)_auto_auto_auto] sm:items-center">
     <label className="flex h-11 min-w-0 items-center overflow-hidden rounded-[8px] border-[3px] border-black bg-white">
      <span className="flex h-full shrink-0 items-center border-r-[3px] border-black bg-[#00CCFF] px-3 text-[9px] font-[1000] uppercase">Project</span>
      <select
       value={activeProjectId}
       onChange={(event) => setActiveProjectId(event.target.value)}
       disabled={!projects.length}
       className="h-full min-w-0 flex-1 bg-white px-3 text-[10px] font-[1000] uppercase outline-none disabled:text-black/30"
       aria-label="Active project"
      >
       {!projects.length ? <option value="">No projects yet</option> : null}
       {projects.map((project) => <option key={project.id} value={project.id}>{project.videoTitle || project.name}</option>)}
      </select>
     </label>
     <div className="flex h-11 items-center justify-between gap-2 rounded-[8px] border-[3px] border-black px-3 text-[9px] font-black uppercase sm:justify-center">
      <span className="text-black/45">Status</span><span>{activeProject?.status || "—"}</span>
     </div>
     <div className="flex h-11 items-center justify-between gap-2 rounded-[8px] border-[3px] border-black px-3 text-[9px] font-black uppercase sm:justify-center">
      <span className="text-black/45">Publish</span><span>{activeProject?.publishDate || "Unscheduled"}</span>
     </div>
     <div className="flex h-11 min-w-[120px] items-center gap-2 rounded-[8px] border-[3px] border-black px-3">
      <div className="min-w-0 flex-1">
       <div className="mb-1 flex justify-between text-[8px] font-black uppercase"><span>Progress</span><span>{progress}%</span></div>
       <div className="h-2 overflow-hidden rounded-full border-[1.5px] border-black bg-white"><div className="h-full bg-black" style={{ width: `${progress}%` }} /></div>
      </div>
     </div>
    </div>
    <button
     type="button"
     onClick={() => document.getElementById("project-kanban")?.scrollIntoView({ behavior: "smooth", block: "start" })}
     className="flex h-11 items-center justify-center gap-2 rounded-[8px] border-[3px] border-black bg-[#CCFF00] px-4 text-[9px] font-[1000] uppercase shadow-[3px_3px_0_black] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
    >
     <Plus size={14} /> Manage projects
    </button>
   </div>

   <section id="project-kanban" className="scroll-mt-[140px]">
    <ProjectsToolboxModule title="Project Board" subtitle="Move projects from idea to published" icon={<Columns3 />} paletteIndex={0}>
     <ProjectKanbanWorkspace />
    </ProjectsToolboxModule>
   </section>

   <section id="content-asset-engine" className="scroll-mt-[140px]">
    <ProjectsToolboxModule title="Content Asset Engine" subtitle="Choose a content build and manage its complete asset pipeline" icon={<Workflow />} paletteIndex={1} isOpenInitial={false}>
     <ContentAssetEngine />
    </ProjectsToolboxModule>
   </section>

   <section id="publishing-schedule" className="scroll-mt-[140px]">
    <ProjectsToolboxModule title="Publishing Schedule" subtitle="Plan deadlines, production dates and publishing" icon={<CalendarDays />} paletteIndex={3}>
     <PublishingScheduleArchitect collapsible={false} isOpenInitial paletteIndex={3} />
    </ProjectsToolboxModule>
   </section>

   <section id="project-studio" className="scroll-mt-[140px]">
    <ProjectsToolboxModule title="Project Studio" subtitle="Build and manage the working project" icon={<FolderKanban />} paletteIndex={6} isOpenInitial={false}>
     <ProjectStudio />
    </ProjectsToolboxModule>
   </section>

   <section id="storyboard-studio" className="scroll-mt-[140px]">
    <ProjectsToolboxModule title="Storyboard Studio" subtitle="Plan scenes, sequences and visual structure" icon={<PanelsTopLeft />} paletteIndex={9} isOpenInitial={false}>
     <StoryboardStudio embedded collapsible={false} isOpenInitial paletteIndex={1} />
    </ProjectsToolboxModule>
   </section>
  </div>
 )
}

export default ProjectCalendarPage
