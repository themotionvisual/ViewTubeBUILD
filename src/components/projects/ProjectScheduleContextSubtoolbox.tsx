import React, { useMemo } from "react"
import { CalendarDays, Clock3, ListChecks } from "lucide-react"
import { useBrain } from "../../context/useBrain"
import type { Project } from "../../types"
import { SubToolbox } from "../Toolbox"
import { SubToolboxGrid, SubToolboxSection, SubToolboxStack } from "../subtoolbox/SubToolboxLayouts"
import { SubToolboxBadge, SubToolboxButton, SubToolboxStatePanel, SubToolboxSurface } from "../subtoolbox/SubToolboxPrimitives"
import { useProjectsWorkspace } from "./ProjectsWorkspaceContext"

const dateValue = (value?: string) => value ? new Date(`${value}T12:00:00`).getTime() : Number.POSITIVE_INFINITY

const ProjectScheduleContextSubtoolbox: React.FC<{ project: Project }> = ({ project }) => {
 const { brain } = useBrain()
 const { openCalendar } = useProjectsWorkspace()

 const nearbyProjects = useMemo(() => {
  const projects = Array.isArray(brain.projects) ? brain.projects : []
  const target = dateValue(project.publishDate)
  return projects
   .filter(candidate => candidate.id !== project.id && candidate.publishDate)
   .sort((a, b) => Math.abs(dateValue(a.publishDate) - target) - Math.abs(dateValue(b.publishDate) - target))
   .slice(0, 3)
 }, [brain.projects, project.id, project.publishDate])

 const deadlines = useMemo(() => (project.tasks || [])
  .filter(task => Boolean(task.dueDate))
  .slice()
  .sort((a, b) => dateValue(a.dueDate) - dateValue(b.dueDate))
  .slice(0, 4), [project.tasks])

 return <SubToolbox
  title="SCHEDULE CONTEXT"
  subtitle="Project target, nearest deadlines and nearby publishing work"
  icon={<CalendarDays />}
  collapsible
  isOpenInitial
  openUnits={4}
 >
  <SubToolboxStack density="comfortable">
   <SubToolboxGrid minItemWidth="compact" density="dense">
    <SubToolboxSurface tone="accent">
     <div className="grid gap-1 p-2">
      <span className="text-[9px] font-black uppercase opacity-50">Publish target</span>
      <strong className="text-[15px] font-[1000] uppercase">{project.publishDate || "UNSCHEDULED"}</strong>
     </div>
    </SubToolboxSurface>
    <SubToolboxSurface tone="subtle">
     <div className="grid gap-1 p-2">
      <span className="text-[9px] font-black uppercase opacity-50">Project deadlines</span>
      <strong className="text-[15px] font-[1000] uppercase">{deadlines.length}</strong>
     </div>
    </SubToolboxSurface>
   </SubToolboxGrid>

   <SubToolboxGrid minItemWidth="wide" density="dense">
    <SubToolboxSection label="Nearest project deadlines">
     {deadlines.length ? <SubToolboxStack density="dense">
      {deadlines.map(task => <SubToolboxSurface key={task.id} tone="subtle">
       <div className="flex items-center justify-between gap-3 p-1">
        <span className={`text-[11px] font-black ${task.completed ? "line-through opacity-40" : ""}`}>{task.text}</span>
        <SubToolboxBadge><Clock3 size={10} className="mr-1 inline"/>{task.dueDate}</SubToolboxBadge>
       </div>
      </SubToolboxSurface>)}
     </SubToolboxStack> : <SubToolboxStatePanel state="empty" message="No dated project tasks yet." />}
    </SubToolboxSection>

    <SubToolboxSection label="Nearby scheduled projects">
     {nearbyProjects.length ? <SubToolboxStack density="dense">
      {nearbyProjects.map(candidate => <SubToolboxSurface key={candidate.id} tone="subtle">
       <div className="flex items-center justify-between gap-3 p-1">
        <span className="text-[11px] font-black">{candidate.videoTitle || candidate.name}</span>
        <SubToolboxBadge>{candidate.publishDate}</SubToolboxBadge>
       </div>
      </SubToolboxSurface>)}
     </SubToolboxStack> : <SubToolboxStatePanel state="empty" message="No nearby scheduled projects." />}
    </SubToolboxSection>
   </SubToolboxGrid>

   <SubToolboxButton tone="accent" icon={<ListChecks size={15}/>} onClick={openCalendar}>Open Full Calendar</SubToolboxButton>
  </SubToolboxStack>
 </SubToolbox>
}

export default ProjectScheduleContextSubtoolbox
