import React from "react"
import { Plus } from "lucide-react"
import { SubToolboxButton, SubToolboxInput, SubToolboxSelect, SubToolboxStatePanel, SubToolboxSurface, SubToolboxTextArea } from "../subtoolbox/SubToolboxPrimitives"
import { SubToolboxGrid, SubToolboxSection, SubToolboxStack } from "../subtoolbox/SubToolboxLayouts"

export const ProjectStudioProjectFields: React.FC<{
  title: string; tags: string; description: string; status: string; script: string; notes: string
  showStatus?: boolean
  onChange: (field: "videoTitle" | "tags" | "description" | "status" | "script" | "notes", value: string) => void
}> = ({ title, tags, description, status, script, notes, showStatus = true, onChange }) => (
  <SubToolboxStack density="comfortable">
    <SubToolboxSection label="Project identity"><SubToolboxGrid minItemWidth="wide" density="dense">
      <SubToolboxInput value={title} onChange={(event) => onChange("videoTitle", event.target.value)} placeholder="Video title…" aria-label="Video title" />
      <SubToolboxInput value={tags} onChange={(event) => onChange("tags", event.target.value)} placeholder="Search tags…" aria-label="Search tags" />
      {showStatus ? <SubToolboxSelect value={status} onChange={(event) => onChange("status", event.target.value)} aria-label="Project status"><option value="ideation">Ideation</option><option value="planning">Planning</option><option value="production">Production</option><option value="editing">Editing</option><option value="ready">Ready</option><option value="published">Published</option></SubToolboxSelect> : null}
    </SubToolboxGrid></SubToolboxSection>
    <SubToolboxSection label="Description"><SubToolboxTextArea value={description} onChange={(event) => onChange("description", event.target.value)} placeholder="Project description…" /></SubToolboxSection>
    <SubToolboxSection label="Script"><SubToolboxTextArea height="fill" value={script} onChange={(event) => onChange("script", event.target.value)} placeholder="Start writing your script…" /></SubToolboxSection>
    <SubToolboxSection label="Notes"><SubToolboxTextArea value={notes} onChange={(event) => onChange("notes", event.target.value)} placeholder="Project notes…" /></SubToolboxSection>
  </SubToolboxStack>
)

export const ProjectStudioEmptyProjectState: React.FC = () => <SubToolboxSurface tone="subtle"><SubToolboxStatePanel state="empty" message="No project is selected. Create or select a project from the Project Board to begin production planning." action={<SubToolboxButton tone="neutral" icon={<Plus size={14} />} disabled>Project Board</SubToolboxButton>} /></SubToolboxSurface>
