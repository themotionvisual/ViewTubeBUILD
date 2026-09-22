import React, { useState } from "react"
import { FolderKanban, Plus } from "lucide-react"
import { useBrain } from "../../context/useBrain"
import { VT_SPECTRUM_PALETTE_06 } from "../../styles/toolboxPalette"
import { SubToolboxActions } from "../subtoolbox/SubToolboxLayouts"
import { SubToolboxButton, SubToolboxSegmentedToggle } from "../subtoolbox/SubToolboxPrimitives"
import ProjectsToolboxModule from "./ProjectsToolboxModule"
import ProjectBuilder from "./ProjectBuilder"
import ProjectCreationDialog from "./ProjectCreationDialog"
import { useProjectsWorkspace } from "./ProjectsWorkspaceContext"

const ProjectBuilderModule: React.FC = () => {
  const { brain } = useBrain()
  const { builderScope, setBuilderScope } = useProjectsWorkspace()
  const [showCreate, setShowCreate] = useState(false)
  const projects = Array.isArray(brain.projects) ? brain.projects : []
  const activeProject = projects.find((project) => project.id === brain.activeProjectId) || projects[0] || null
  const storedIndex = Number(activeProject?.plan?.projectPaletteIndex)
  const legacyColorIndex = activeProject?.color ? VT_SPECTRUM_PALETTE_06.findIndex((color) => color.toLowerCase() === activeProject.color?.toLowerCase()) : -1
  const paletteIndex = Number.isFinite(storedIndex) ? storedIndex : legacyColorIndex >= 0 ? legacyColorIndex : 0

  const headerActions = (
    <SubToolboxActions className="flex-wrap">
      <SubToolboxSegmentedToggle
        level="l1"
        value={builderScope}
        onValueChange={(value) => setBuilderScope(value as "channel" | "project")}
        ariaLabel="Choose Project Builder scope"
        options={[
          { value: "channel", label: "Channel" },
          { value: "project", label: "Project" },
        ]}
      />
      <SubToolboxButton
        level="l1"
        size="compact"
        tone="accent"
        icon={<Plus size={14} />}
        onClick={() => setShowCreate(true)}
      >
        New Project
      </SubToolboxButton>
    </SubToolboxActions>
  )

  return (
    <>
      <ProjectsToolboxModule
        title="Project Builder"
        subtitle="Channel planning and one continuous content build from idea through publishing"
        icon={<FolderKanban />}
        paletteIndex={paletteIndex}
        headerActions={headerActions}
      >
        <ProjectBuilder onCreateProject={() => setShowCreate(true)} />
      </ProjectsToolboxModule>

      <ProjectCreationDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => setBuilderScope("project")}
      />
    </>
  )
}

export default ProjectBuilderModule
