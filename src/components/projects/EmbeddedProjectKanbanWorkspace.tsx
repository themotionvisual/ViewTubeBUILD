import React from "react"
import ProjectKanbanWorkspace from "./ProjectKanbanWorkspace"

/**
 * Transitional embedded adapter for the Projects page.
 *
 * ProjectKanbanWorkspace predates the canonical Projects T0 shell and still owns
 * a feature-local 4px frame plus a duplicate Project Board header. The parent
 * ProjectsToolboxModule is the sole T0 authority, so this adapter neutralizes
 * only that legacy exterior while preserving the board's DnD, filters, cards,
 * dialogs and inspector behavior unchanged.
 *
 * MIGRATE: remove this adapter after ProjectKanbanWorkspace is decomposed into
 * canonical T1/T2 primitives directly.
 */
const EmbeddedProjectKanbanWorkspace: React.FC = () => (
 <div
  data-vt-project-kanban-embedded="true"
  className="min-w-0 [&>div]:overflow-visible [&>div]:rounded-none [&>div]:border-0 [&>div]:shadow-none [&>div>header:first-child]:hidden"
 >
  <ProjectKanbanWorkspace />
 </div>
)

export default EmbeddedProjectKanbanWorkspace
