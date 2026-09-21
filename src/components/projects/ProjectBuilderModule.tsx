import React from "react"
import { FolderKanban } from "lucide-react"
import { useBrain } from "../../context/useBrain"
import ProjectsToolboxModule from "./ProjectsToolboxModule"
import ProjectBuilder from "./ProjectBuilder"

const ProjectBuilderModule: React.FC = () => {
  const { brain } = useBrain()
  const projects = Array.isArray(brain.projects) ? brain.projects : []
  const activeProject = projects.find((project) => project.id === brain.activeProjectId) || projects[0] || null
  const storedIndex = Number(activeProject?.plan?.projectPaletteIndex)
  const legacyColorIndex = activeProject?.color ? VT_SPECTRUM_PALETTE_06.findIndex((color) => color.toLowerCase() === activeProject.color?.toLowerCase()) : -1
  const paletteIndex = Number.isFinite(storedIndex) ? storedIndex : legacyColorIndex >= 0 ? legacyColorIndex : 0

  return (
    <ProjectsToolboxModule
      title="Project Builder"
      subtitle="Channel planning and one continuous content build from idea through publishing"
      icon={<FolderKanban />}
      paletteIndex={paletteIndex}
    >
      <ProjectBuilder />
    </ProjectsToolboxModule>
  )
}

export default ProjectBuilderModule
