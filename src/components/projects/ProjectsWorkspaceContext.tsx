import React, { createContext, useContext, useMemo, useState } from "react"
import { useBrain } from "../../context/useBrain"

export type ProjectBuilderScope = "channel" | "project"
export type ProjectBoardView = "board" | "calendar"

type ProjectsWorkspaceContextValue = {
 builderScope: ProjectBuilderScope
 setBuilderScope: (scope: ProjectBuilderScope) => void
 boardView: ProjectBoardView
 setBoardView: (view: ProjectBoardView) => void
 openProject: (projectId: string) => void
 openCalendar: () => void
}

const ProjectsWorkspaceContext = createContext<ProjectsWorkspaceContextValue | null>(null)

export const ProjectsWorkspaceProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
 const { brain, setActiveProject } = useBrain()
 const [builderScope, setBuilderScope] = useState<ProjectBuilderScope>(
  Array.isArray(brain.projects) && brain.projects.length ? "project" : "channel",
 )
 const [boardView, setBoardView] = useState<ProjectBoardView>("board")

 const value = useMemo<ProjectsWorkspaceContextValue>(() => ({
  builderScope,
  setBuilderScope,
  boardView,
  setBoardView,
  openProject: (projectId: string) => {
   setActiveProject(projectId)
   setBuilderScope("project")
   if (typeof document !== "undefined") {
    window.requestAnimationFrame(() => {
     document.getElementById("project-builder")?.scrollIntoView({ behavior: "smooth", block: "start" })
    })
   }
  },
  openCalendar: () => {
   setBoardView("calendar")
   if (typeof document !== "undefined") {
    window.requestAnimationFrame(() => {
     document.getElementById("project-board")?.scrollIntoView({ behavior: "smooth", block: "start" })
    })
   }
  },
 }), [boardView, builderScope, setActiveProject])

 return <ProjectsWorkspaceContext.Provider value={value}>{children}</ProjectsWorkspaceContext.Provider>
}

export const useProjectsWorkspace = () => {
 const context = useContext(ProjectsWorkspaceContext)
 if (!context) throw new Error("useProjectsWorkspace must be used inside ProjectsWorkspaceProvider")
 return context
}
