import React from "react"
import ProjectKanbanWorkspace from "./ProjectKanbanWorkspace"

/** Transitional adapter while ProjectKanbanWorkspace is decomposed into canonical T1/T2 primitives. */
const EmbeddedProjectKanbanWorkspace: React.FC = () => (
 <div
  data-vt-project-kanban-embedded="true"
  className="min-w-0 [&>div]:overflow-visible [&>div]:rounded-none [&>div]:border-0 [&>div]:shadow-none [&>div>header:first-child]:hidden"
 >
  <ProjectKanbanWorkspace />
 </div>
)

export default EmbeddedProjectKanbanWorkspace
