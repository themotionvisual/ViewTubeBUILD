import React, { useEffect, useMemo, useState } from "react"
import { Boxes, CalendarDays, FolderKanban, Gauge, Plus, Workflow } from "lucide-react"
import { useBrain } from "../../context/useBrain"
import { VT_SPECTRUM_PALETTE_06 } from "../../styles/toolboxPalette"
import { SubToolbox } from "../Toolbox"
import { SubToolboxGrid, SubToolboxSection, SubToolboxStack } from "../subtoolbox/SubToolboxLayouts"
import {
  SubToolboxBadge,
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
import ProjectCreationDialog from "./ProjectCreationDialog"

type BuilderScope = "channel" | "project"
type AssetMode = "simple" | "full"

const lifecycle = [
  ["IDEA", "idea"],
  ["RESEARCH", "research"],
  ["SCRIPT", "script"],
  ["PRODUCE", "produce"],
  ["PACKAGE", "package"],
  ["PUBLISH", "publish"],
  ["LEARN", "learn"],
] as const

const ProjectBuilder: React.FC = () => {
  const { brain, updateProject, setActiveProject } = useBrain()
  const projects = Array.isArray(brain.projects) ? brain.projects : []
  const [scope, setScope] = useState<BuilderScope>(projects.length ? "project" : "channel")
  const [assetMode, setAssetMode] = useState<AssetMode>("simple")
  const [showCreate, setShowCreate] = useState(false)

  const activeProject = useMemo(
    () => projects.find((project) => project.id === brain.activeProjectId) || projects[0] || null,
    [brain.activeProjectId, projects],
  )

  useEffect(() => {
    if (!brain.activeProjectId && activeProject) setActiveProject(activeProject.id)
  }, [activeProject, brain.activeProjectId, setActiveProject])

  const completion = useMemo(() => {
    if (!activeProject) return { complete: 0, total: 8, percent: 0 }
    const checks = [
      activeProject.concept || activeProject.plan?.concept,
      activeProject.videoTitle,
      activeProject.script,
      activeProject.thumbnailUrl,
      activeProject.description,
      activeProject.tags,
      activeProject.publishDate,
      (activeProject.tasks || []).length > 0,
    ]
    const complete = checks.filter(Boolean).length
    return { complete, total: checks.length, percent: Math.round((complete / checks.length) * 100) }
  }, [activeProject])

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

  const simpleStageState = (stage: string) => {
    if (!activeProject) return "EMPTY"
    switch (stage) {
      case "idea": return (activeProject.concept || activeProject.plan?.concept) ? "READY" : "EMPTY"
      case "research": return (activeProject.plan?.references?.length || 0) > 0 ? "READY" : "OPEN"
      case "script": return activeProject.script?.trim() ? "READY" : "OPEN"
      case "produce": return (activeProject.storyboard?.length || 0) > 0 ? "IN PROGRESS" : "OPEN"
      case "package": return activeProject.videoTitle && activeProject.thumbnailUrl ? "READY" : "OPEN"
      case "publish": return activeProject.publishDate && activeProject.description && activeProject.tags ? "READY" : "OPEN"
      case "learn": return activeProject.status === "published" || activeProject.status === "completed" ? "CONNECTED" : "WAITING"
      default: return "OPEN"
    }
  }

  return (
    <>
      <SubToolboxStack density="comfortable">
        <SubToolboxSurface tone="subtle">
          <SubToolboxGrid minItemWidth="wide" density="dense">
            <SubToolboxSection label="Workspace">
              <SubToolboxSegmentedToggle
                value={scope}
                onValueChange={(value) => setScope(value as BuilderScope)}
                ariaLabel="Choose Project Builder scope"
                options={[
                  { value: "channel", label: "Channel" },
                  { value: "project", label: "Project" },
                ]}
              />
            </SubToolboxSection>

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
                  <SubToolboxButton tone="accent" icon={<Plus size={16} />} onClick={() => setShowCreate(true)}>New</SubToolboxButton>
                </div>
              </SubToolboxSection>
            ) : (
              <SubToolboxSection label="Channel scope">
                <SubToolboxStatePanel state="ready" message="Channel tasks and goals use the connected channel profile plus AI Brain context." />
              </SubToolboxSection>
            )}
          </SubToolboxGrid>
        </SubToolboxSurface>

        {scope === "channel" ? (
          <ChannelPlanningSubtoolboxes />
        ) : !activeProject ? (
          <SubToolboxStatePanel
            state="empty"
            message="Create a project to start a content build."
            action={<SubToolboxButton tone="accent" icon={<Plus size={16} />} onClick={() => setShowCreate(true)}>Create project</SubToolboxButton>}
          />
        ) : (
          <>
            <SubToolbox
              title={activeProject.name.toUpperCase()}
              subtitle="One project identity from idea through publishing and learning"
              icon={<FolderKanban />}
              collapsible
              isOpenInitial
              openUnits={4}
            >
              <SubToolboxStack density="comfortable">
                <div
                  className="grid gap-3 rounded-[var(--vt-subtoolbox-radius,10px)] p-3 md:grid-cols-[minmax(0,1fr)_auto]"
                  style={{ backgroundColor: `${activeProject.color || VT_SPECTRUM_PALETTE_06[0]}22`, border: `3px solid ${activeProject.color || VT_SPECTRUM_PALETTE_06[0]}` }}
                >
                  <div className="min-w-0">
                    <div className="text-[22px] font-[1000] uppercase leading-none tracking-[-0.04em]">{activeProject.videoTitle || activeProject.name}</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <SubToolboxBadge>{activeProject.status || "ideation"}</SubToolboxBadge>
                      <SubToolboxBadge>{completion.percent}% build</SubToolboxBadge>
                      <SubToolboxBadge>{activeProject.contentBuildId ? "ContentBuild linked" : "ContentBuild pending"}</SubToolboxBadge>
                      {activeProject.publishDate ? <SubToolboxBadge>{activeProject.publishDate}</SubToolboxBadge> : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gauge size={22} />
                    <strong className="text-[20px] font-[1000]">{completion.complete}/{completion.total}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
                  {lifecycle.map(([label, id]) => (
                    <SubToolboxSurface key={id} tone="subtle" className="min-w-0 p-2 text-center">
                      <div className="truncate text-[10px] font-[1000] uppercase">{label}</div>
                      <div className="mt-1 text-[8px] font-black uppercase opacity-50">{simpleStageState(id)}</div>
                    </SubToolboxSurface>
                  ))}
                </div>
              </SubToolboxStack>
            </SubToolbox>

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
                  <SubToolboxSection label="Thumbnail">
                    <SubToolboxInput value={activeProject.thumbnailUrl || ""} onChange={(event) => updateProject(activeProject.id, { thumbnailUrl: event.target.value })} placeholder="Thumbnail asset / URL…" />
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

            <SubToolbox title="VIDEO PACKAGE" subtitle="Working YouTube package and script" icon={<Boxes />} collapsible isOpenInitial openUnits={6}>
              <ProjectStudioProjectFields
                title={activeProject.videoTitle || ""}
                tags={activeProject.tags || ""}
                description={activeProject.description || ""}
                status={activeProject.status || "ideation"}
                script={activeProject.script || ""}
                notes={activeProject.notes || ""}
                onChange={(field, value) => updateProject(activeProject.id, { [field]: value })}
              />
            </SubToolbox>

            <ProjectPlanningSubtoolboxes />

            <SubToolbox title="ASSET ENGINE" subtitle="Simple lifecycle view or the complete ContentBuild asset system" icon={<Workflow />} collapsible isOpenInitial openUnits={6}>
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

                {assetMode === "simple" ? (
                  <SubToolboxGrid minItemWidth="compact" density="dense">
                    {lifecycle.map(([label, id]) => (
                      <SubToolboxSurface key={id} tone="subtle">
                        <div className="flex items-center justify-between gap-2">
                          <strong className="text-[11px] font-[1000] uppercase">{label}</strong>
                          <SubToolboxBadge>{simpleStageState(id)}</SubToolboxBadge>
                        </div>
                      </SubToolboxSurface>
                    ))}
                  </SubToolboxGrid>
                ) : (
                  <ContentAssetEngine />
                )}
              </SubToolboxStack>
            </SubToolbox>
          </>
        )}
      </SubToolboxStack>

      <ProjectCreationDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => setScope("project")}
      />
    </>
  )
}

export default ProjectBuilder
