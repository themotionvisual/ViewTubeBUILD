import React, { useState } from "react"
import { CalendarDays, Columns3 } from "lucide-react"
import EmbeddedProjectKanbanWorkspace from "./EmbeddedProjectKanbanWorkspace"
import EmbeddedPublishingSchedule from "./EmbeddedPublishingSchedule"
import { SubToolboxSection, SubToolboxStack } from "../subtoolbox/SubToolboxLayouts"
import { SubToolboxSegmentedToggle, SubToolboxSurface } from "../subtoolbox/SubToolboxPrimitives"
import { useProjectsWorkspace } from "./ProjectsWorkspaceContext"

type BoardView="board"|"calendar"

const ProjectBoardWorkspace:React.FC = () => {
 const [view,setView]=useState<BoardView>("board")
 const {openProject}=useProjectsWorkspace()
 return <SubToolboxStack density="comfortable">
  <SubToolboxSurface tone="subtle">
   <SubToolboxSection label="Project Board view">
    <SubToolboxSegmentedToggle
     value={view}
     onValueChange={value=>setView(value as BoardView)}
     ariaLabel="Choose Project Board view"
     options={[
      {value:"board",label:<span className="inline-flex items-center gap-2"><Columns3 size={14}/> Board</span>},
      {value:"calendar",label:<span className="inline-flex items-center gap-2"><CalendarDays size={14}/> Calendar</span>},
     ]}
    />
   </SubToolboxSection>
  </SubToolboxSurface>
  {view==="board"?<EmbeddedProjectKanbanWorkspace/>:<EmbeddedPublishingSchedule onOpenProject={openProject}/>}
 </SubToolboxStack>
}

export default ProjectBoardWorkspace
