import React, { useEffect, useState } from "react"
import { FolderKanban } from "lucide-react"
import { useBrain } from "../../context/useBrain"
import { SubToolbox } from "../Toolbox"
import { SubToolboxGrid, SubToolboxStack } from "../subtoolbox/SubToolboxLayouts"
import { SubToolboxBadge, SubToolboxSelect, SubToolboxStatePanel, SubToolboxSurface } from "../subtoolbox/SubToolboxPrimitives"
import { ProjectStudioEmptyProjectState, ProjectStudioProjectFields } from "./ProjectStudioCanonicalControls"
import { useProjectsWorkspace } from "../../features/projects/ProjectsWorkspaceContext"

const ProjectStudioCanonical: React.FC = () => {
  const { brain, updateProject } = useBrain()
  const workspace = useProjectsWorkspace()
  const [localProjectId, setLocalProjectId] = useState("")
  const activeProjectId = workspace?.activeProjectId || localProjectId
  const activeProject = brain.projects.find((project) => project.id === activeProjectId) || null

  useEffect(() => {
    if (!activeProjectId && brain.projects[0]) {
      if (workspace) workspace.setActiveProjectId(brain.projects[0].id)
      else setLocalProjectId(brain.projects[0].id)
    }
  }, [activeProjectId, brain.projects, workspace])

  const selectProject = (projectId: string) => {
    if (workspace) workspace.setActiveProjectId(projectId)
    else setLocalProjectId(projectId)
  }

  return (
    <SubToolboxStack density="comfortable">
      <SubToolbox title="PROJECT SELECTOR" subtitle="Choose the project whose production plan you want to edit" icon={<FolderKanban />} paletteIndex={6} collapsible isOpenInitial>
        {brain.projects.length ? (
          <SubToolboxGrid minItemWidth="wide" density="dense">
            <SubToolboxSelect value={activeProjectId} onChange={(event) => selectProject(event.target.value)} aria-label="Active project">
              {brain.projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
            </SubToolboxSelect>
            {activeProject ? <SubToolboxSurface tone="accent"><div className="flex items-center justify-between gap-3"><strong className="text-[12px] font-black uppercase">{activeProject.name}</strong><SubToolboxBadge>{activeProject.status}</SubToolboxBadge></div></SubToolboxSurface> : null}
          </SubToolboxGrid>
        ) : <SubToolboxStatePanel state="empty" message="No projects exist yet. Create one from the Project Board to begin production planning." />}
      </SubToolbox>

      {activeProject ? (
        <SubToolbox title="PROJECT DETAILS" subtitle="Canonical project metadata, writing and production fields" icon={<FolderKanban />} paletteIndex={7} collapsible isOpenInitial openUnits={6}>
          <ProjectStudioProjectFields
            title={activeProject.videoTitle || activeProject.name}
            tags={activeProject.tags || ""}
            description={activeProject.description || ""}
            status={activeProject.status || "ideation"}
            script={activeProject.script || ""}
            notes={activeProject.notes || ""}
            onChange={(field, value) => updateProject(activeProject.id, { [field]: value })}
          />
        </SubToolbox>
      ) : <ProjectStudioEmptyProjectState onCreate={() => undefined} />}
    </SubToolboxStack>
  )
}

export default ProjectStudioCanonical
