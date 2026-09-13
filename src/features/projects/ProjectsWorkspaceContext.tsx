import React, { createContext, useContext } from "react"
import type { Project } from "../../types"

type ProjectsWorkspaceContextValue = {
 activeProjectId: string
 activeProject: Project | null
 setActiveProjectId: (projectId: string) => void
}

const ProjectsWorkspaceContext = createContext<ProjectsWorkspaceContextValue | null>(null)

export const ProjectsWorkspaceProvider = ProjectsWorkspaceContext.Provider

export const useProjectsWorkspace = () => useContext(ProjectsWorkspaceContext)

export default ProjectsWorkspaceContext
