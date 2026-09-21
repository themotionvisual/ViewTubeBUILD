import React, { useEffect, useState } from "react"
import { Plus, X } from "lucide-react"
import { useBrain } from "../../context/useBrain"
import type { Project } from "../../types"
import { VT_SPECTRUM_PALETTE_06 } from "../../styles/toolboxPalette"
import { syncProjectToContentBuild } from "../../services/asset-engine/ProjectContentBuildBridge"
import type { ProjectPriority } from "../../features/projects/projectWorkspace"
import { SubToolboxGrid, SubToolboxSection, SubToolboxStack } from "../subtoolbox/SubToolboxLayouts"
import {
  SubToolboxButton,
  SubToolboxInput,
  SubToolboxSelect,
  SubToolboxStatePanel,
  SubToolboxSurface,
  SubToolboxTag,
} from "../subtoolbox/SubToolboxPrimitives"

export type ProjectCreationDialogProps = {
  open: boolean
  onClose: () => void
  onCreated?: (project: Project, priority: ProjectPriority) => void
}

const today = () => new Date().toISOString().slice(0, 10)

const ProjectCreationDialog: React.FC<ProjectCreationDialogProps> = ({ open, onClose, onCreated }) => {
  const { brain, addProject, setActiveProject, channelIdentity } = useBrain()
  const [name, setName] = useState("")
  const [videoTitle, setVideoTitle] = useState("")
  const [concept, setConcept] = useState("")
  const [publishDate, setPublishDate] = useState(today)
  const [format, setFormat] = useState<"long" | "short" | "live" | "other">("long")
  const [priority, setPriority] = useState<ProjectPriority>("medium")
  const [paletteIndex, setPaletteIndex] = useState(0)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!open) return
    setError("")
  }, [open])

  if (!open) return null

  const reset = () => {
    setName("")
    setVideoTitle("")
    setConcept("")
    setPublishDate(today())
    setFormat("long")
    setPriority("medium")
    setPaletteIndex(0)
    setError("")
  }

  const close = () => {
    reset()
    onClose()
  }

  const create = () => {
    const projectName = name.trim()
    if (!projectName) {
      setError("Give the project a name before creating it.")
      return
    }

    const id = `p-${Date.now()}`
    const project: Project = {
      id,
      name: projectName,
      videoTitle: videoTitle.trim() || projectName,
      concept: concept.trim(),
      color: VT_SPECTRUM_PALETTE_06[paletteIndex],
      publishDate,
      status: "ideation",
      tasks: [],
      script: "",
      description: "",
      tags: "",
      notes: "",
      storyboard: [],
      plan: {
        concept: concept.trim(),
        niche: brain.targetNiche || "",
        format,
        projectPaletteIndex: paletteIndex,
      },
    }

    try {
      const build = syncProjectToContentBuild(project, {
        channelId: channelIdentity.channelId || null,
        sourceToolId: "project-builder",
      })
      const canonicalProject: Project = { ...project, contentBuildId: build.id }
      addProject(canonicalProject)
      setActiveProject(canonicalProject.id)
      onCreated?.(canonicalProject, priority)
      close()
    } catch (cause) {
      console.error("Unable to initialize project ContentBuild", cause)
      setError("The project could not be initialized. Try again.")
    }
  }

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/45 p-3 sm:p-6" role="dialog" aria-modal="true" aria-label="Create project">
      <SubToolboxSurface className="max-h-[92vh] w-full max-w-[760px] overflow-y-auto">
        <div className="flex items-center justify-between gap-3 border-b-[var(--vt-subtoolbox-stroke,3px)] border-black px-4 py-3">
          <div>
            <div className="text-[20px] font-[1000] uppercase leading-none tracking-[-0.04em]">Create Project</div>
            <div className="mt-1 text-[10px] font-black uppercase opacity-50">Project + ContentBuild + Asset Engine identity</div>
          </div>
          <SubToolboxButton size="compact" tone="neutral" icon={<X size={15} />} onClick={close}>Close</SubToolboxButton>
        </div>

        <SubToolboxStack density="comfortable" className="p-4">
          <SubToolboxSection label="Project identity">
            <SubToolboxGrid minItemWidth="wide" density="dense">
              <SubToolboxInput autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Project name…" aria-label="Project name" />
              <SubToolboxInput value={videoTitle} onChange={(event) => setVideoTitle(event.target.value)} placeholder="Working video title (optional)…" aria-label="Working video title" />
            </SubToolboxGrid>
          </SubToolboxSection>

          <SubToolboxSection label="Initial idea">
            <SubToolboxInput value={concept} onChange={(event) => setConcept(event.target.value)} placeholder="One-line concept, subject or promise…" aria-label="Project concept" />
          </SubToolboxSection>

          <SubToolboxGrid minItemWidth="compact" density="dense">
            <SubToolboxSection label="Format">
              <SubToolboxSelect value={format} onChange={(event) => setFormat(event.target.value as typeof format)} aria-label="Project format">
                <option value="long">Long-form video</option>
                <option value="short">YouTube Short</option>
                <option value="live">Live / Premiere</option>
                <option value="other">Other</option>
              </SubToolboxSelect>
            </SubToolboxSection>
            <SubToolboxSection label="Target publish date">
              <SubToolboxInput type="date" value={publishDate} onChange={(event) => setPublishDate(event.target.value)} aria-label="Target publish date" />
            </SubToolboxSection>
            <SubToolboxSection label="Priority">
              <SubToolboxSelect value={priority} onChange={(event) => setPriority(event.target.value as ProjectPriority)} aria-label="Project priority">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </SubToolboxSelect>
            </SubToolboxSection>
          </SubToolboxGrid>

          <SubToolboxSection label="Project color / module header">
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 xl:grid-cols-12">
              {VT_SPECTRUM_PALETTE_06.map((color, index) => (
                <SubToolboxTag
                  key={color}
                  selected={paletteIndex === index}
                  onClick={() => setPaletteIndex(index)}
                  aria-label={`Select project color ${index + 1}`}
                  style={{ backgroundColor: color, minHeight: 38 }}
                >
                  {index + 1}
                </SubToolboxTag>
              ))}
            </div>
          </SubToolboxSection>

          {error ? <SubToolboxStatePanel state="error" message={error} /> : null}

          <SubToolboxButton size="action" tone="accent" icon={<Plus size={18} />} disabled={!name.trim()} onClick={create}>
            Initialize Project
          </SubToolboxButton>
        </SubToolboxStack>
      </SubToolboxSurface>
    </div>
  )
}

export default ProjectCreationDialog
