import React, { useEffect, useMemo, useState } from "react"
import { Boxes, CalendarDays, Workflow } from "lucide-react"
import { useBrain } from "../../context/useBrain"
import type { Project } from "../../types"
import { VT_SPECTRUM_PALETTE_06 } from "../../styles/toolboxPalette"
import { syncProjectToContentBuild } from "../../services/asset-engine/ProjectContentBuildBridge"
import { ensureVideoPackageForProject } from "../../services/video-package/ProjectVideoPackageBridge"
import { SubToolbox } from "../Toolbox"
import { SubToolboxGrid, SubToolboxSection, SubToolboxStack } from "../subtoolbox/SubToolboxLayouts"
import {
  SubToolboxButton,
  SubToolboxInput,
  SubToolboxSegmentedToggle,
  SubToolboxSelect,
  SubToolboxStatePanel,
  SubToolboxSurface,
  SubToolboxTag,
} from "../subtoolbox/SubToolboxPrimitives"
import ChannelPlanningSubtoolboxes from "./ChannelPlanningSubtoolboxes"
import ProjectPlanningSubtoolboxes from "./ProjectPlanningSubtoolboxes"
import { ProjectStudioProjectFields } from "./ProjectStudioCanonicalControls"
import ContentAssetEngine from "./ContentAssetEngine"
import ProjectBuildCommand from "./ProjectBuildCommand"
import ProjectBriefSubtoolbox from "./ProjectBriefSubtoolbox"
import ProjectPackagingSubtoolbox from "./ProjectPackagingSubtoolbox"
import ProjectAssetEngineSimple from "./ProjectAssetEngineSimple"
import ProjectScheduleContextSubtoolbox from "./ProjectScheduleContextSubtoolbox"
import { useProjectsWorkspace } from "./ProjectsWorkspaceContext"

type AssetMode = "simple" | "full"

type ProjectBuilderProps = {
  onCreateProject: () => void
}

const ProjectBuilder: React.FC<ProjectBuilderProps> = ({ onCreateProject }) => {
  const { brain, updateProject, setActiveProject, channelIdentity } = useBrain()
  const { builderScope: scope, setBuilderScope: setScope } = useProjectsWorkspace()
  const projects = Array.isArray(brain.projects) ? brain.projects : []
  const [assetMode, setAssetMode] = useState<AssetMode>("simple")

  const activeProject = useMemo(
    () => projects.find((project) => project.id === brain.activeProjectId) || projects[0] || null,
    [brain.activeProjectId, projects],
  )

  useEffect(() => {
    if (!brain.activeProjectId && activeProject) setActiveProject(activeProject.id)
  }, [activeProject, brain.activeProjectId, setActiveProject])

  useEffect(() => {
    if (!activeProject) return
    const build = syncProjectToContentBuild(activeProject, {
      channelId: channelIdentity.channelId || null,
      sourceToolId: "project-builder",
    })
    const scopedProject = activeProject.contentBuildId === build.id
      ? activeProject
      : { ...activeProject, contentBuildId: build.id }
    ensureVideoPackageForProject(scopedProject, {
      channelId: channelIdentity.channelId || null,
      sourceToolId: "project-builder",
    })
    if (activeProject.contentBuildId !== build.id) {
      updateProject(activeProject.id, { contentBuildId: build.id })
    }
  }, [activeProject, channelIdentity.channelId, updateProject])

  const patchPlan = (field: string, value: unknown) => {
    if (!activeProject) return
    updateProject(activeProject.id, {
      plan: {
        concept: activeProject.plan?.concept || activeProject.concept || "",
        niche: activeProject.plan?.niche || activeProject.niche || brain.targetNiche || "",
        ...(activeProject.plan || {}),
        [field]: value,
      },
    })
  }

  return (
    <SubToolboxStack density="comfortable">
      <SubToolboxSurface tone="subtle">
        {scope === "project" ? (
          <SubToolboxSection label="Active project">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
              <SubToolboxSelect
                value={activeProject?.id || ""}
                onChange={(event) => setActiveProject(event.target.value)}
                aria-label="Active project"
              >
                {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
              </SubToolboxSelect>
              <SubToolboxButton tone="accent" onClick={onCreateProject}>New</SubToolboxButton>
            </div>
          </SubToolboxSection>
        ) : (
          <SubToolboxSection label="Channel scope">
            <SubToolboxStatePanel state="ready" message="Channel tasks and goals use the connected channel profile plus AI Brain context." />
          </SubToolboxSection>
        )}
      </SubToolboxSurface>

      {scope === "channel" ? (
        <ChannelPlanningSubtoolboxes />
      ) : !activeProject ? (
        <SubToolboxStatePanel
          state="empty"
          message="Create a project to start a content build."
          action={<SubToolboxButton tone="accent" onClick={onCreateProject}>Create project</SubToolboxButton>}
        />
      ) : (
        <>
          <ProjectBuildCommand project={activeProject} />

          <SubToolbox title="PROJECT IDENTITY" subtitle="Name, schedule, format and visual identity" icon={<CalendarDays />} collapsible isOpenInitial openUnits={4}>
            <SubToolboxStack density="comfortable">
              <SubToolboxGrid minItemWidth="wide" density="dense">
                <SubToolboxSection label="Project name">
                  <SubToolboxInput value={activeProject.name} onChange={(event) => updateProject(activeProject.id, { name: event.target.value })} />
                </SubToolboxSection>
                <SubToolboxSection label="Publish target">
                  <SubToolboxInput type="date" value={activeProject.publishDate || ""} onChange={(event) => updateProject(activeProject.id, { publishDate: event.target.value })} />
                </SubToolboxSection>
                <SubToolboxSection label="Format">
                  <SubToolboxSelect value={String(activeProject.plan?.format || "long")} onChange={(event) => patchPlan("format", event.target.value)}>
                    <option value="long">Long-form video</option>
                    <option value="short">YouTube Short</option>
                    <option value="live">Live / Premiere</option>
                    <option value="other">Other</option>
                  </SubToolboxSelect>
                </SubToolboxSection>
                <SubToolboxSection label="Status">
                  <SubToolboxSelect value={activeProject.status || "ideation"} onChange={(event) => updateProject(activeProject.id, { status: event.target.value })}>
                    <option value="ideation">Ideation</option>
                    <option value="planned">Planned</option>
                    <option value="scripting">Scripting</option>
                    <option value="production">Production</option>
                    <option value="review">Review</option>
                    <option value="ready">Ready</option>
                    <option value="published">Published</option>
                  </SubToolboxSelect>
                </SubToolboxSection>
              </SubToolboxGrid>

              <SubToolboxSection label="Project color / module identity">
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 xl:grid-cols-12">
                  {VT_SPECTRUM_PALETTE_06.map((color, index) => (
                    <SubToolboxTag
                      key={color}
                      selected={activeProject.plan?.projectPaletteIndex === index}
                      onClick={() => {
                        updateProject(activeProject.id, { color })
                        patchPlan("projectPaletteIndex", index)
                      }}
                      style={{ backgroundColor: color, minHeight: 34 }}
                    >
                      {index + 1}
                    </SubToolboxTag>
                  ))}
                </div>
              </SubToolboxSection>
            </SubToolboxStack>
          </SubToolbox>

          <ProjectScheduleContextSubtoolbox project={activeProject} />

          <SubToolboxGrid minItemWidth="wide" density="comfortable">
            <ProjectBriefSubtoolbox
              project={activeProject}
              targetNiche={brain.targetNiche}
              onUpdate={(updates) => updateProject(activeProject.id, updates)}
            />
            <ProjectPackagingSubtoolbox
              project={activeProject}
              onUpdate={(updates) => updateProject(activeProject.id, updates)}
            />
          </SubToolboxGrid>

          <SubToolbox title="VIDEO PACKAGE" subtitle="Working YouTube metadata and script" icon={<Boxes />} collapsible isOpenInitial openUnits={6}>
            <ProjectStudioProjectFields
              title={activeProject.videoTitle || ""}
              tags={activeProject.tags || ""}
              description={activeProject.description || ""}
              status={activeProject.status || "ideation"}
              showStatus={false}
              script={activeProject.script || ""}
              notes={activeProject.notes || ""}
              onChange={(field, value) => updateProject(activeProject.id, { [field]: value } as Partial<Project>)}
            />
          </SubToolbox>

          <ProjectPlanningSubtoolboxes />

          <SubToolbox title="ASSET ENGINE" subtitle="Simple lifecycle controls or the complete ContentBuild asset system" icon={<Workflow />} collapsible isOpenInitial openUnits={6}>
            <SubToolboxStack density="comfortable">
              <SubToolboxSection label="Asset Engine depth">
                <SubToolboxSegmentedToggle
                  value={assetMode}
                  onValueChange={(value) => setAssetMode(value as AssetMode)}
                  ariaLabel="Choose Asset Engine depth"
                  options={[
                    { value: "simple", label: "Simple" },
                    { value: "full", label: "Full" },
                  ]}
                />
              </SubToolboxSection>

              {assetMode === "simple" ? <ProjectAssetEngineSimple project={activeProject} /> : <ContentAssetEngine />}
            </SubToolboxStack>
          </SubToolbox>
        </>
      )}
    </SubToolboxStack>
  )
}

export default ProjectBuilder
