import React from "react"
import { Calendar, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import {
  SubToolboxButton,
  SubToolboxInput,
  SubToolboxSelect,
  SubToolboxStatePanel,
  SubToolboxSurface,
  SubToolboxTextArea,
} from "../subtoolbox/SubToolboxPrimitives"
import { SubToolboxGrid, SubToolboxSection, SubToolboxStack } from "../subtoolbox/SubToolboxLayouts"

export const ProjectStudioCalendarControls: React.FC<{
  dateDisplayMode: "Hover" | "Some" | "All"
  onCycleDateDisplay: () => void
  onPrevious: () => void
  onNext: () => void
}> = ({ dateDisplayMode, onCycleDateDisplay, onPrevious, onNext }) => (
  <SubToolboxGrid minItemWidth="compact" density="dense">
    <SubToolboxButton tone="neutral" onClick={onCycleDateDisplay} icon={<Calendar size={14} />}>
      Dates: {dateDisplayMode}
    </SubToolboxButton>
    <SubToolboxButton tone="neutral" onClick={onPrevious} icon={<ChevronLeft size={14} />}>Previous</SubToolboxButton>
    <SubToolboxButton tone="neutral" onClick={onNext} icon={<ChevronRight size={14} />}>Next</SubToolboxButton>
  </SubToolboxGrid>
)

export const ProjectStudioDayTaskComposer: React.FC<{
  value: string
  onChange: (value: string) => void
  onAdd: () => void
}> = ({ value, onChange, onAdd }) => (
  <SubToolboxGrid minItemWidth="wide" density="dense">
    <SubToolboxInput
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => { if (event.key === "Enter") onAdd() }}
      placeholder="Add manual task…"
      aria-label="Add task to selected day"
    />
    <SubToolboxButton tone="ink" onClick={onAdd} icon={<Plus size={14} />}>Add task</SubToolboxButton>
  </SubToolboxGrid>
)

export const ProjectStudioProjectFields: React.FC<{
  title: string
  tags: string
  description: string
  status: string
  script: string
  notes: string
  onChange: (field: "videoTitle" | "tags" | "description" | "status" | "script" | "notes", value: string) => void
}> = ({ title, tags, description, status, script, notes, onChange }) => (
  <SubToolboxStack density="comfortable">
    <SubToolboxSection label="Project identity">
      <SubToolboxGrid minItemWidth="wide" density="dense">
        <SubToolboxInput value={title} onChange={(event) => onChange("videoTitle", event.target.value)} placeholder="Video title…" aria-label="Video title" />
        <SubToolboxInput value={tags} onChange={(event) => onChange("tags", event.target.value)} placeholder="Search tags…" aria-label="Search tags" />
        <SubToolboxSelect value={status} onChange={(event) => onChange("status", event.target.value)} aria-label="Project status">
          <option value="ideation">Ideation</option>
          <option value="planning">Planning</option>
          <option value="production">Production</option>
          <option value="editing">Editing</option>
          <option value="ready">Ready</option>
          <option value="published">Published</option>
        </SubToolboxSelect>
      </SubToolboxGrid>
    </SubToolboxSection>
    <SubToolboxSection label="Description"><SubToolboxTextArea value={description} onChange={(event) => onChange("description", event.target.value)} placeholder="Project description…" /></SubToolboxSection>
    <SubToolboxSection label="Script"><SubToolboxTextArea height="fill" value={script} onChange={(event) => onChange("script", event.target.value)} placeholder="Start writing your script…" /></SubToolboxSection>
    <SubToolboxSection label="Notes"><SubToolboxTextArea value={notes} onChange={(event) => onChange("notes", event.target.value)} placeholder="Project notes…" /></SubToolboxSection>
  </SubToolboxStack>
)

export const ProjectStudioEmptyProjectState: React.FC<{ onCreate: () => void }> = ({ onCreate }) => (
  <SubToolboxSurface tone="subtle">
    <SubToolboxStatePanel
      state="empty"
      message="No project is selected. Choose a project or create one to edit its production plan."
      action={<SubToolboxButton tone="accent" icon={<Plus size={14} />} onClick={onCreate}>New project</SubToolboxButton>}
    />
  </SubToolboxSurface>
)
