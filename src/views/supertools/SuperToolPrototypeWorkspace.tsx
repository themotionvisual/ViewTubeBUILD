import React, { useMemo, useState } from "react"
import { ArrowLeft, ArrowRight, CheckCircle2, CircleDot, OctagonAlert, PanelsTopLeft } from "lucide-react"
import {
 StandardTextArea,
 SubToolbox,
 ToolboxScaffold,
} from "../../components/Toolbox"
import type { SuperToolId } from "../../types"

export type PrototypeCardStatus = "queued" | "active" | "blocked" | "ready" | "complete"
export type PrototypeCardPriority = "low" | "medium" | "high" | "urgent"

export type PrototypeWorkspaceLane = {
 id: string
 title: string
 description: string
 tone: string
}

export type PrototypeWorkspaceCard = {
 id: string
 laneId: string
 title: string
 summary: string
 owner?: string
 deadline?: string
 dependency?: string
 blocker?: string
 status?: PrototypeCardStatus
 priority?: PrototypeCardPriority
 chips?: string[]
 evidence?: string[]
 controls?: string[]
 output?: string
 integrations?: string[]
 handoffTarget?: string
}

export type PrototypeWorkspaceConfig = {
 toolId: SuperToolId
 title: string
 description: string
 lanes: PrototypeWorkspaceLane[]
 cards: PrototypeWorkspaceCard[]
 controls: string[]
 evidence: string[]
 handoffTargets: string[]
}

type PrototypeControlTone = "pink" | "orange" | "yellow" | "green" | "cyan" | "blue" | "purple"

type PrototypeSubToolboxBlueprint = {
 title: string
 iconName: string
 paletteIndex: number
 open?: boolean
 kind: "input" | "select" | "upload" | "actions" | "status"
 prompt?: string
 options?: string[]
 rows: string[]
 actionLabel?: string
 tone?: PrototypeControlTone
}

type PrototypeToolboxBlueprint = {
 title: string
 subtitle: string
 iconName: string
 paletteIndex: number
 modeTabs: string[]
 subToolboxes: PrototypeSubToolboxBlueprint[]
 primaryAction: string
 secondaryAction: string
 inspectorTitle: string
 inspectorRows: string[]
}

const blueprint = (
 title: string,
 subtitle: string,
 iconName: string,
 paletteIndex: number,
 modeTabs: string[],
 subToolboxes: PrototypeSubToolboxBlueprint[],
 primaryAction: string,
 secondaryAction: string,
 inspectorTitle: string,
 inspectorRows: string[],
): PrototypeToolboxBlueprint => ({
 title,
 subtitle,
 iconName,
 paletteIndex,
 modeTabs,
 subToolboxes,
 primaryAction,
 secondaryAction,
 inspectorTitle,
 inspectorRows,
})

const PROTOTYPE_BLUEPRINTS: Partial<Record<SuperToolId, PrototypeToolboxBlueprint>> = {
 "creator-canvas-os": blueprint(
  "Creator Canvas",
  "Studio",
  "!!!IDEA",
  2,
  ["Studio", "Script", "Storyboard"],
  [
   { title: "Idea", iconName: "!!!IDEA", paletteIndex: 2, open: true, kind: "input", prompt: "Raw idea, audience request, or source reference", rows: ["Viewer promise", "Reference links", "Goal tags"] },
   { title: "Angle", iconName: "compass", paletteIndex: 3, open: true, kind: "select", options: ["Proof first", "Contrarian", "Tutorial", "Story"], rows: ["Stakes level", "Audience segment", "Format fit"] },
   { title: "Hook", iconName: "zap", paletteIndex: 0, kind: "actions", rows: ["First proof", "Curiosity gap", "Opening risk"], actionLabel: "Forge Hook", tone: "pink" },
   { title: "Script", iconName: "!!!TEXT", paletteIndex: 5, kind: "input", prompt: "Beat notes and proof order", rows: ["Runtime target", "Transitions", "CTA position"] },
   { title: "Board", iconName: "image", paletteIndex: 6, kind: "status", rows: ["Scene count", "Asset needs", "Motion style", "VT_E1 target"] },
  ],
  "Build Idea",
  "Storyboard",
  "Storyboard Packet",
  ["Angle set", "Hook variants", "Script beats", "VT_E1 handoff"],
 ),
 "audience-loop-studio": blueprint(
  "Audience Loop",
  "Inbox",
  "headset",
  3,
  ["Inbox", "Replies", "Requests"],
  [
   { title: "Stream", iconName: "comment", paletteIndex: 3, open: true, kind: "input", prompt: "Paste or sync comment samples", rows: ["Source video", "Language", "Moderation filter"] },
   { title: "Cluster", iconName: "search", paletteIndex: 4, open: true, kind: "select", options: ["Praise", "Confusion", "Objection", "Request"], rows: ["Confidence", "Examples", "Outlier flag"] },
   { title: "Reply", iconName: "!!!TEXT", paletteIndex: 5, kind: "input", prompt: "Creator-voice reply draft", rows: ["Tone", "Risk level", "Accepted action"] },
   { title: "Post", iconName: "calendar", paletteIndex: 0, kind: "actions", rows: ["Poll", "Teaser", "Follow-up"], actionLabel: "Draft Post", tone: "cyan" },
  ],
  "Mine Request",
  "Draft Reply",
  "Feedback Evidence",
  ["Comment sample", "Sentiment cluster", "Reply tone", "Content demand"],
 ),
 "packaging-lab-pro": blueprint(
  "Packaging Lab",
  "Titles",
  "image",
  0,
  ["Titles", "Visuals", "Tests"],
  [
   { title: "Titles", iconName: "!!!TEXT", paletteIndex: 0, open: true, kind: "input", prompt: "Title candidate or promise", rows: ["Clarity", "Curiosity", "Specificity"] },
   { title: "Thumb", iconName: "image", paletteIndex: 4, open: true, kind: "upload", rows: ["Subject", "Emotion", "Contrast", "Proof cue"] },
   { title: "Desc", iconName: "notes", paletteIndex: 5, kind: "input", prompt: "First three description lines", rows: ["CTA order", "Chapters", "Keyword fit"] },
   { title: "Batch", iconName: "test-tube", paletteIndex: 6, kind: "actions", rows: ["Variant count", "Success metric", "Test window"], actionLabel: "Queue Test", tone: "green" },
  ],
  "Score Pack",
  "Queue Test",
  "Packaging Scorecard",
  ["Promise clarity", "Visual contrast", "Audience fit", "Trust risk"],
 ),
 "project-command-kanban": blueprint(
  "Project Command",
  "Board",
  "!!!COLLECTION",
  5,
  ["Board", "Blockers", "Launch"],
  [
   { title: "Project", iconName: "folder", paletteIndex: 5, open: true, kind: "input", prompt: "Project or launch target", rows: ["Owner", "Priority", "Next action"] },
   { title: "State", iconName: "sliders", paletteIndex: 6, open: true, kind: "select", options: ["Idea Backlog", "In Progress", "Blocked", "Launch Ready"], rows: ["Lane", "Deadline", "Handoff owner"] },
   { title: "Block", iconName: "warning", paletteIndex: 0, kind: "input", prompt: "Blocker note or missing dependency", rows: ["Severity", "Recovery action", "Next agent note"] },
   { title: "Launch", iconName: "check", paletteIndex: 3, kind: "actions", rows: ["Assets", "Packaging", "Metadata"], actionLabel: "Ready", tone: "green" },
  ],
  "Persist Board",
  "Escalate",
  "Project Inspector",
  ["Owner", "Deadline", "Dependency", "Launch state"],
 ),
 "series-and-theme-generator": blueprint(
  "Series Generator",
  "Clusters",
  "!!!COLLECTION",
  4,
  ["Clusters", "Branches", "Franchise"],
  [
   { title: "Theme", iconName: "grid", paletteIndex: 4, open: true, kind: "input", prompt: "Topic lane or recurring format", rows: ["Audience need", "Boundary", "Cluster size"] },
   { title: "Tree", iconName: "branch", paletteIndex: 5, open: true, kind: "select", options: ["Deeper", "Broader", "Contrarian", "Beginner"], rows: ["Branch depth", "Demand signal", "Priority"] },
   { title: "Cadence", iconName: "calendar", paletteIndex: 2, kind: "status", rows: ["Publish rhythm", "Production load", "Backlog", "Risk"] },
   { title: "Map", iconName: "layers", paletteIndex: 0, kind: "actions", rows: ["Format family", "Visual motif", "Success signal"], actionLabel: "Map Series", tone: "pink" },
  ],
  "Build Arc",
  "Branch",
  "Franchise Handoff",
  ["Series promise", "Sequel tree", "Cadence fit", "Format rules"],
 ),
 "publishing-schedule-architect": blueprint(
  "Publishing Architect",
  "Calendar",
  "calendar",
  3,
  ["Backlog", "Calendar", "Recovery"],
  [
   { title: "Backlog", iconName: "layers", paletteIndex: 3, open: true, kind: "select", options: ["Long-form", "Shorts", "Series", "Experiment"], rows: ["Ready work", "Blocked work", "Priority"] },
   { title: "Window", iconName: "calendar", paletteIndex: 5, open: true, kind: "input", prompt: "Publish window or deadline", rows: ["Spacing", "Sponsor pressure", "Seasonality"] },
   { title: "Ready", iconName: "check", paletteIndex: 4, kind: "status", rows: ["Asset state", "Edit state", "Metadata", "Follow-up"] },
   { title: "Recover", iconName: "warning", paletteIndex: 0, kind: "actions", rows: ["Missed date", "Scope cut", "Next publish"], actionLabel: "Recover", tone: "orange" },
  ],
  "Place Date",
  "Recover",
  "Schedule Inspector",
  ["Backlog", "Capacity", "Launch window", "Readiness"],
 ),
 "shorts-extraction-studio": blueprint(
  "Shorts Studio",
  "Source",
  "video",
  5,
  ["Source", "Cut", "Handoff"],
  [
   { title: "Source", iconName: "video", paletteIndex: 5, open: true, kind: "input", prompt: "Long-form source, stream, or clip", rows: ["Timecode", "Transcript", "Retention clue"] },
   { title: "Find", iconName: "sparkles", paletteIndex: 4, open: true, kind: "select", options: ["Proof moment", "Hook spike", "Question", "Clip request"], rows: ["Hook density", "Chapter beat", "Rank"] },
   { title: "Cut", iconName: "scissors", paletteIndex: 0, kind: "actions", rows: ["Start handle", "End handle", "Safe margin"], actionLabel: "Set Cut", tone: "pink" },
   { title: "Export", iconName: "download", paletteIndex: 6, kind: "status", rows: ["JSON", "MP4", "Caption FX", "VT_E1"] },
  ],
  "Create Cut",
  "Send VT_E1",
  "Shorts Handoff",
  ["Source evidence", "Trim plan", "Vertical layout", "Export packet"],
 ),
 "cinematic-analytics-lab": blueprint(
  "Cinematic Analytics",
  "Metrics",
  "analytics",
  6,
  ["Metrics", "Compare", "Present"],
  [
   { title: "Metric", iconName: "database", paletteIndex: 6, open: true, kind: "select", options: ["Views", "CTR", "Retention", "Revenue"], rows: ["Dimension", "Date range", "Formula"] },
   { title: "Stage", iconName: "chart", paletteIndex: 4, open: true, kind: "status", rows: ["Baseline", "Segment", "Outlier rule", "Confidence"] },
   { title: "Anomaly", iconName: "warning", paletteIndex: 0, kind: "actions", rows: ["Traffic shift", "Missing data", "Revenue spike"], actionLabel: "Flag", tone: "pink" },
   { title: "Present", iconName: "presentation", paletteIndex: 5, kind: "input", prompt: "Insight claim or creator summary", rows: ["Chart style", "Source strip", "Action"] },
  ],
  "Build Insight",
  "Present",
  "Insight Artifact",
  ["Metric source", "Comparison set", "Anomaly", "Recommended action"],
 ),
 "retention-autopsy-experiment-engine": blueprint(
  "Retention Engine",
  "Queue",
  "analytics",
  5,
  ["Queue", "Autopsy", "Experiment"],
  [
   { title: "Video", iconName: "video", paletteIndex: 5, open: true, kind: "select", options: ["Hook cliff", "Hidden gem", "Mid sag", "Strong hold"], rows: ["Source", "Confidence", "Views"] },
   { title: "Curve", iconName: "chart", paletteIndex: 6, open: true, kind: "status", rows: ["First 30%", "Average view", "Drop point", "Missing data"] },
   { title: "Cause", iconName: "warning", paletteIndex: 0, kind: "input", prompt: "Likely failure mode", rows: ["Hypothesis", "Intervention", "Metric"] },
   { title: "Queue", iconName: "test-tube", paletteIndex: 4, kind: "actions", rows: ["Owner", "Date", "Success criterion"], actionLabel: "Queue Test", tone: "green" },
  ],
  "Queue Test",
  "Send Brain",
  "Experiment Inspector",
  ["Retention source", "Failure mode", "Hypothesis", "Workflow handoff"],
 ),
 "brain-command-center": blueprint(
  "Brain Command",
  "Signals",
  "sparkles",
  0,
  ["Signals", "Assistant", "Agents"],
  [
   { title: "Input", iconName: "database", paletteIndex: 0, open: true, kind: "input", prompt: "Signal, user note, workflow, or channel fact", rows: ["Source tool", "Channel scope", "Confidence"] },
   { title: "Tools", iconName: "wrench", paletteIndex: 5, open: true, kind: "select", options: ["Project", "Workflow", "Analytics", "Studio"], rows: ["Target", "Success check", "Artifact"] },
   { title: "Memory", iconName: "brain", paletteIndex: 4, kind: "status", rows: ["Immediate", "Recent", "Long-term", "Candidate"] },
   { title: "Agent", iconName: "sparkles", paletteIndex: 2, kind: "actions", rows: ["Dispatch", "Boundary", "Next action"], actionLabel: "Dispatch", tone: "purple" },
  ],
  "Route Signal",
  "Reflect",
  "Agent Architecture",
  ["Input", "Tools", "Memory", "Knowledge", "Output"],
 ),
 "workflow-chain-builder": blueprint(
  "Workflow Chain",
  "Template",
  "!!!COLLECTION",
  6,
  ["Template", "Steps", "Blockers"],
  [
   { title: "Template", iconName: "layers", paletteIndex: 6, open: true, kind: "select", options: ["Idea to publish", "Analytics to experiment", "Vault to editor"], rows: ["Custom title", "Goal", "Primary tool"] },
   { title: "Steps", iconName: "workflow", paletteIndex: 5, open: true, kind: "status", rows: ["Surface", "Tool id", "Status", "Owner"] },
   { title: "Artifact", iconName: "link", paletteIndex: 2, kind: "input", prompt: "Generation, Vault, export, or manual artifact id", rows: ["Provenance", "Source", "Chain id"] },
   { title: "Blocker", iconName: "warning", paletteIndex: 0, kind: "actions", rows: ["Reason", "Evidence", "Next agent note"], actionLabel: "Block Step", tone: "pink" },
  ],
  "Preview Chain",
  "Preview Attach",
  "Workflow Inspector",
  ["Template", "Steps", "Artifact ids", "Blocker notes"],
 ),
}

const statusTone: Record<PrototypeCardStatus, string> = {
 queued: "bg-white text-black",
 active: "bg-[#00F0FF] text-black",
 blocked: "bg-[#FF4FD8] text-white",
 ready: "bg-[#CCFF00] text-black",
 complete: "bg-[#111] text-white",
}

const priorityTone: Record<PrototypeCardPriority, string> = {
 low: "bg-white text-black",
 medium: "bg-[#FFEA5A] text-black",
 high: "bg-[#00F0FF] text-black",
 urgent: "bg-[#FF4FD8] text-white",
}

export const PrototypeMetricChip: React.FC<{
 label: string
 tone?: string
}> = ({ label, tone = "bg-white text-black" }) => (
 <span className={`rounded-[9px] border-[3px] border-black px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${tone}`}>
  {label}
 </span>
)

export const PrototypeToolbar: React.FC<{
 controls: string[]
}> = ({ controls }) => (
 <div className="flex flex-wrap gap-2">
  {controls.map((control) => (
   <PrototypeMetricChip key={control} label={control} tone="bg-[#f8f7f1] text-black" />
  ))}
 </div>
)

const PrototypeModeTabs: React.FC<{
 tabs: string[]
 activeTab: string
 onSelect: (tab: string) => void
}> = ({ tabs, activeTab, onSelect }) => (
 <div className="flex h-full flex-wrap items-center gap-2">
  {tabs.map((tab) => (
   <button
    key={tab}
    type="button"
    onClick={() => onSelect(tab)}
    className={`h-11 rounded-[14px] border-[3px] border-black px-4 text-[10px] font-black uppercase tracking-[0.14em] shadow-[3px_3px_0px_0px_black] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none ${
     activeTab === tab ? "bg-black text-white" : "bg-white text-black"
    }`}
   >
    {tab}
   </button>
  ))}
 </div>
)

export const PrototypePanel: React.FC<{
 config: PrototypeWorkspaceConfig
 blueprint: PrototypeToolboxBlueprint
 children?: React.ReactNode
}> = ({ config, blueprint, children }) => {
 const [activeTab, setActiveTab] = useState(blueprint.modeTabs[0] || "Workspace")

 return (
 <section
  data-super-tool-prototype={config.toolId}
  data-prototype-layout="toolbox-shell"
  className="w-full min-w-0"
 >
  <ToolboxScaffold
   title={blueprint.title}
   subtitle={activeTab}
   iconName={blueprint.iconName}

   embedded
   contentClassName="bg-white p-4 sm:p-6"
	   headerActions={
	    <PrototypeModeTabs tabs={blueprint.modeTabs} activeTab={activeTab} onSelect={setActiveTab} />
	   }
	  >
	   {children ? (
	    <div
	     data-prototype-workspace-surface={config.toolId}
	     className="mb-6 min-w-0 overflow-hidden rounded-[22px] border-[4px] border-black bg-[#f8f7f1] shadow-[6px_6px_0px_0px_black]"
	    >
	     {children}
	    </div>
	   ) : null}
	  </ToolboxScaffold>
	 </section>
	 )
}

export const PrototypeCard: React.FC<{
 card: PrototypeWorkspaceCard
 selected: boolean
 onSelect: () => void
 onDragStart?: () => void
}> = ({ card, selected, onSelect, onDragStart }) => (
 <button
  type="button"
  onClick={onSelect}
  draggable={Boolean(onDragStart)}
  onDragStart={onDragStart}
  className={`w-full cursor-grab rounded-[16px] border-[4px] border-black bg-white p-4 text-left shadow-[4px_4px_0px_0px_black] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:cursor-grabbing ${
   selected ? "outline outline-[4px] outline-offset-2 outline-[#FF4FD8]" : ""
  }`}
 >
  <div className="flex items-start justify-between gap-3">
   <div>
    <div className="text-lg font-[1000] uppercase leading-tight tracking-[-0.04em]">{card.title}</div>
   </div>
   <CircleDot size={18} className={selected ? "text-[#FF4FD8]" : "text-black/35"} />
  </div>
  <div className="mt-3 flex flex-wrap gap-2">
   {card.owner ? <PrototypeMetricChip label={`Owner ${card.owner}`} tone="bg-[#00F0FF] text-black" /> : null}
   {card.deadline ? <PrototypeMetricChip label={card.deadline} tone="bg-[#FFEA5A] text-black" /> : null}
   {card.status ? <PrototypeMetricChip label={card.status} tone={statusTone[card.status]} /> : null}
   {card.priority ? <PrototypeMetricChip label={card.priority} tone={priorityTone[card.priority]} /> : null}
   {card.chips?.map((chip) => <PrototypeMetricChip key={chip} label={chip} tone="bg-[#f8f7f1] text-black" />)}
  </div>
  {(card.dependency || card.blocker) ? (
   <div className="mt-3 grid gap-2 md:grid-cols-2">
    {card.dependency ? (
     <div className="rounded-[12px] border-[3px] border-black bg-[#f8f7f1] p-3">
      <div className="text-[10px] font-black uppercase tracking-[0.16em] text-black/45">Dependency</div>
      <p className="mt-1 text-xs font-bold leading-5 tracking-normal">{card.dependency}</p>
     </div>
    ) : null}
    {card.blocker ? (
     <div className="rounded-[12px] border-[3px] border-black bg-[#FF4FD8] p-3 text-white">
      <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/70">Blocker</div>
      <p className="mt-1 text-xs font-bold leading-5 tracking-normal">{card.blocker}</p>
     </div>
    ) : null}
   </div>
  ) : null}
 </button>
)

export const PrototypeColumn: React.FC<{
 lane: PrototypeWorkspaceLane
 cards: PrototypeWorkspaceCard[]
 selectedCardId: string
 onSelectCard: (cardId: string) => void
 onDropCard?: (laneId: string) => void
 onDragStartCard?: (cardId: string) => void
}> = ({ lane, cards, selectedCardId, onSelectCard, onDropCard, onDragStartCard }) => (
 <div
  className="min-h-[430px] rounded-[18px] border-[4px] border-black bg-[#f8f7f1] shadow-[5px_5px_0px_0px_black]"
  onDragOver={(event) => {
   if (!onDropCard) return
   event.preventDefault()
  }}
  onDrop={(event) => {
   if (!onDropCard) return
   event.preventDefault()
   onDropCard(lane.id)
  }}
 >
  <div className={`${lane.tone} flex items-center justify-between gap-3 border-b-[4px] border-black px-4 py-3`}>
   <div className="text-xl font-[1000] uppercase tracking-[-0.04em]">{lane.title}</div>
   <PrototypeMetricChip label={`${cards.length}`} tone="bg-white text-black" />
  </div>
  <div className="grid gap-3 p-4">
   {cards.length ? (
    cards.map((card) => (
     <PrototypeCard
      key={card.id}
      card={card}
      selected={card.id === selectedCardId}
      onSelect={() => onSelectCard(card.id)}
      onDragStart={() => onDragStartCard?.(card.id)}
     />
    ))
   ) : (
    <div className="rounded-[14px] border-[3px] border-dashed border-black/35 bg-white px-4 py-8 text-center text-[10px] font-black uppercase tracking-[0.18em] text-black/45">
     Empty
    </div>
   )}
  </div>
 </div>
)

const laneStatus = (laneTitle: string): PrototypeCardStatus => {
 const normalized = laneTitle.toLowerCase()
 if (normalized.includes("blocked")) return "blocked"
 if (normalized.includes("ready")) return "ready"
 if (normalized.includes("published") || normalized.includes("complete")) return "complete"
 if (normalized.includes("progress") || normalized.includes("active")) return "active"
 return "queued"
}

const findLaneId = (lanes: PrototypeWorkspaceLane[], matcher: (lane: PrototypeWorkspaceLane) => boolean, fallbackId: string) =>
 lanes.find(matcher)?.id || fallbackId

const cardsForLane = (cards: PrototypeWorkspaceCard[], laneId: string) =>
 cards.filter((card) => card.laneId === laneId)

const firstCard = (cards: PrototypeWorkspaceCard[], laneId: string) =>
 cards.find((card) => card.laneId === laneId)

const BlueprintBlock: React.FC<{
 label: string
 title: string
 tone?: string
 children?: React.ReactNode
}> = ({ title, tone = "bg-white", children }) => (
 <SubToolbox
  title={title}
  icon={<PanelsTopLeft />}
 isOpenInitial
 openUnits={3}
 overflowVisible
 shellClassName="[&_h3]:!text-[clamp(1.35rem,2.4vw,2.25rem)] [&_h3]:!tracking-[-0.04em]"
>
  {children ? <div className="grid gap-3">{children}</div> : null}
 </SubToolbox>
)

const MiniControlGrid: React.FC<{ items: string[] }> = ({ items }) => (
 <div className="grid gap-2">
  {items.map((item) => (
   <div key={item} className="rounded-[10px] border-[3px] border-black bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em]">
    {item}
   </div>
  ))}
 </div>
)

const MiniCardStack: React.FC<{
 cards: PrototypeWorkspaceCard[]
 onSelectCard?: (id: string) => void
 selectedCardId?: string
 compact?: boolean
}> = ({ cards, onSelectCard, selectedCardId, compact = false }) => {
 const [localSelectedId, setLocalSelectedId] = useState(cards[0]?.id || "")
 const activeCardId = selectedCardId || localSelectedId

 return (
  <div className="grid gap-3">
   {cards.map((card) => {
    const active = card.id === activeCardId
    return (
     <button
      key={card.id}
      type="button"
      onClick={() => {
       setLocalSelectedId(card.id)
       onSelectCard?.(card.id)
      }}
      className={`rounded-[14px] border-[3px] border-black bg-white p-3 text-left transition-transform hover:translate-x-0.5 hover:translate-y-0.5 ${
       active ? "outline outline-[4px] outline-offset-2 outline-[#FF4FD8]" : ""
      }`}
     >
      <div className={`${compact ? "text-sm" : "text-base"} font-[1000] uppercase leading-tight tracking-[-0.03em]`}>
       {card.title}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
       {card.status ? <PrototypeMetricChip label={card.status} tone={statusTone[card.status]} /> : null}
       {card.priority ? <PrototypeMetricChip label={card.priority} tone={priorityTone[card.priority]} /> : null}
       {card.chips?.slice(0, 3).map((chip) => <PrototypeMetricChip key={chip} label={chip} />)}
      </div>
     </button>
    )
   })}
  </div>
 )
}

const TextRows: React.FC<{ rows: Array<string | undefined> }> = ({ rows }) => (
 <div className="grid gap-2">
  {rows.filter(Boolean).map((row) => (
   <div key={row} className="rounded-[10px] border-[3px] border-black bg-[#f8f7f1] px-3 py-2 text-xs font-black uppercase leading-5 tracking-[0.08em]">
    {row}
   </div>
  ))}
 </div>
)

const TimelineStrip: React.FC<{ cards: PrototypeWorkspaceCard[] }> = ({ cards }) => (
 <div className="grid gap-3 md:grid-cols-4">
  {cards.map((card, index) => (
   <div key={card.id} className="rounded-[14px] border-[4px] border-black bg-white p-3">
    <div className="rounded-[10px] border-[3px] border-black bg-[#00F0FF] px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em]">
     Scene {index + 1}
    </div>
    <div className="mt-2 text-sm font-[1000] uppercase leading-tight">{card.title}</div>
   </div>
  ))}
 </div>
)

const SOURCE_ASPECT_RATIO = "16 / 9"
const EXPORT_ASPECT_RATIO = "9 / 16"
const NINE_BY_SIXTEEN_WIDTH_IN_SIXTEEN_BY_NINE_PERCENT = 31.640625
const CENTERED_NINE_BY_SIXTEEN_LEFT_PERCENT = (100 - NINE_BY_SIXTEEN_WIDTH_IN_SIXTEEN_BY_NINE_PERCENT) / 2
const RIGHT_ALIGNED_NINE_BY_SIXTEEN_LEFT_PERCENT = 100 - NINE_BY_SIXTEEN_WIDTH_IN_SIXTEEN_BY_NINE_PERCENT

const ExactAspectFrame: React.FC<{
 ratio: string
 className?: string
 style?: React.CSSProperties
 children: React.ReactNode
}> = ({ ratio, className = "", style, children }) => (
 <div
  className={`relative w-full min-w-0 shrink-0 overflow-hidden ${className}`}
  style={{ ...style, aspectRatio: ratio }}
 >
  {children}
 </div>
)

const PhonePreview: React.FC<{ title: string; caption: string }> = ({ title, caption }) => (
 <ExactAspectFrame
  ratio={EXPORT_ASPECT_RATIO}
  className="mx-auto max-w-[260px] rounded-[28px] border-[6px] border-black bg-[#111] p-4 text-white shadow-[7px_7px_0px_0px_black]"
 >
  <div className="flex h-full flex-col justify-between">
   <div className="rounded-[14px] border-[3px] border-white bg-[#00F0FF] px-3 py-2 text-center text-xs font-black uppercase tracking-[0.12em] text-black">
    Vertical Preview
   </div>
   <div className="grid gap-3">
    <div className="rounded-[16px] border-[3px] border-white bg-[#FF4FD8] p-4 text-2xl font-[1000] uppercase leading-none tracking-[-0.04em]">
     {title}
    </div>
    <div className="rounded-[14px] border-[3px] border-white bg-[#CCFF00] px-3 py-2 text-center text-[10px] font-black uppercase tracking-[0.16em] text-black">
     {caption}
    </div>
   </div>
  </div>
 </ExactAspectFrame>
)

const renderProjectKanban = (
 config: PrototypeWorkspaceConfig,
 cards: PrototypeWorkspaceCard[],
 selectedCard: PrototypeWorkspaceCard | undefined,
 selectedCardId: string,
 selectedLane: PrototypeWorkspaceLane | undefined,
 selectedIndex: number,
 setSelectedCardId: (id: string) => void,
 onDragStartCard: (id: string) => void,
 onDropCard: (laneId: string) => void,
 moveSelected: (offset: number) => void,
 markBlocked: () => void,
 markReady: () => void,
) => (
	 <div className="grid gap-5 p-5">
	  <div className="overflow-x-auto pb-2">
	   <div className="grid min-w-[1480px] grid-cols-5 gap-4">
	    {config.lanes.map((lane) => (
	     <PrototypeColumn
	      key={lane.id}
	      lane={lane}
	      cards={cardsForLane(cards, lane.id)}
	      selectedCardId={selectedCardId}
	      onSelectCard={setSelectedCardId}
	      onDragStartCard={onDragStartCard}
	      onDropCard={onDropCard}
	     />
	    ))}
	   </div>
	  </div>
  <div className="rounded-[18px] border-[4px] border-black bg-[#111] p-4 text-white">
   <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
    <div className="flex flex-wrap gap-2">
     <PrototypeMetricChip label={selectedCard ? `Selected: ${selectedCard.title}` : "No card selected"} tone="bg-[#00F0FF] text-black" />
     <PrototypeMetricChip label={selectedLane ? `Lane: ${selectedLane.title}` : "No lane"} tone="bg-[#CCFF00] text-black" />
     {selectedCard?.handoffTarget ? (
      <PrototypeMetricChip label={`Handoff: ${selectedCard.handoffTarget}`} tone="bg-white text-black" />
     ) : null}
    </div>
    <div className="flex flex-wrap gap-2">
     <button
      type="button"
      onClick={() => moveSelected(-1)}
      disabled={!selectedCard || selectedIndex <= 0}
      className="inline-flex h-11 items-center gap-2 rounded-[12px] border-[3px] border-black bg-white px-4 text-[10px] font-black uppercase tracking-[0.14em] text-black disabled:opacity-40"
     >
      <ArrowLeft size={14} />
      Move Left
     </button>
     <button
      type="button"
      onClick={() => moveSelected(1)}
      disabled={!selectedCard || selectedIndex >= config.lanes.length - 1}
      className="inline-flex h-11 items-center gap-2 rounded-[12px] border-[3px] border-black bg-[#00F0FF] px-4 text-[10px] font-black uppercase tracking-[0.14em] text-black disabled:opacity-40"
     >
      Move Right
      <ArrowRight size={14} />
     </button>
     <button
      type="button"
      onClick={markBlocked}
      disabled={!selectedCard}
      className="inline-flex h-11 items-center gap-2 rounded-[12px] border-[3px] border-black bg-[#FF4FD8] px-4 text-[10px] font-black uppercase tracking-[0.14em] text-white disabled:opacity-40"
     >
      <OctagonAlert size={14} />
      Mark Blocked
     </button>
     <button
      type="button"
      onClick={markReady}
      disabled={!selectedCard}
      className="inline-flex h-11 items-center gap-2 rounded-[12px] border-[3px] border-black bg-[#CCFF00] px-4 text-[10px] font-black uppercase tracking-[0.14em] text-black disabled:opacity-40"
     >
      <CheckCircle2 size={14} />
      Mark Launch Ready
     </button>
    </div>
   </div>
  </div>
 </div>
)

const renderCreatorCanvas = (config: PrototypeWorkspaceConfig, cards: PrototypeWorkspaceCard[]) => {
 const idea = firstCard(cards, "idea-intake")
 const angle = firstCard(cards, "angle-forge")
 const hook = firstCard(cards, "hook-lab")
 const storyboard = cardsForLane(cards, "storyboard-strip")
 return (
  <div className="grid gap-5 p-5">
   <div className="grid gap-5 xl:grid-cols-[0.8fr_1.15fr_1.05fr]">
    <BlueprintBlock label="Toolbox rail" title="Idea intake queue" tone="bg-[#CCFF00]">
     <MiniControlGrid items={["Source idea", "Viewer promise", "Reference links", "Goal tags"]} />
     <div className="mt-3">
      <MiniCardStack cards={idea ? [idea] : []} compact />
     </div>
    </BlueprintBlock>
   <BlueprintBlock label="Central canvas" title="Angle and hook forge" tone="bg-white">
     <div className="grid gap-3 md:grid-cols-2">
      <div className="rounded-[14px] border-[4px] border-black bg-[#FFEA5A] p-4">
       <div className="text-[10px] font-black uppercase tracking-[0.16em] text-black/55">Angle lane</div>
       <MiniControlGrid items={["Proof first", "Contrarian", "Tutorial", "Story"]} />
      </div>
      <div className="rounded-[14px] border-[4px] border-black bg-[#FF4FD8] p-4 text-white">
       <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/70">Hook lab</div>
       <MiniControlGrid items={["Hook A", "Hook B", "Hook C"]} />
      </div>
     </div>
     <div className="mt-4 rounded-[14px] border-[4px] border-black bg-[#f8f7f1] p-4">
      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-black/50">Script beat editor</div>
      <TextRows rows={["Cold open proof beat", "Problem / stakes", "Main proof sequence", "Payoff and CTA"]} />
     </div>
    </BlueprintBlock>
    <BlueprintBlock label="Output inspector" title="Storyboard bridge" tone="bg-[#00F0FF]">
     <TextRows rows={["Scene count", "Asset needs", "Motion style", "VT_E1 target"]} />
     <div className="mt-3 rounded-[14px] border-[4px] border-black bg-white p-4">
      <div className="text-[10px] font-black uppercase tracking-[0.16em] text-black/45">Next packet</div>
      <MiniControlGrid items={["Scene strip", "Asset list", "Editor target"]} />
     </div>
    </BlueprintBlock>
   </div>
   <TimelineStrip cards={[idea, angle, hook, storyboard[0]].filter(Boolean) as PrototypeWorkspaceCard[]} />
  </div>
 )
}

const renderAudienceLoop = (cards: PrototypeWorkspaceCard[]) => (
 <div className="grid gap-5 p-5 xl:grid-cols-[0.85fr_1.1fr_1fr]">
  <BlueprintBlock label="Live inbox" title="Comment stream" tone="bg-[#FFEA5A]">
   <MiniCardStack cards={cardsForLane(cards, "comment-stream")} compact />
   <div className="mt-4">
    <MiniControlGrid items={["Language filter", "Moderation flag", "Sample size", "Source video"]} />
   </div>
  </BlueprintBlock>
  <div className="grid gap-5">
   <BlueprintBlock label="Pattern map" title="Sentiment matrix" tone="bg-white">
   <div className="grid gap-3 md:grid-cols-2">
     {["Praise", "Confusion", "Objections", "Requests"].map((item, index) => (
      <div key={item} className={`${index === 1 ? "bg-[#FFEA5A]" : index === 3 ? "bg-[#CCFF00]" : "bg-[#f8f7f1]"} rounded-[14px] border-[4px] border-black p-4`}>
       <div className="text-lg font-[1000] uppercase">{item}</div>
      </div>
     ))}
    </div>
   </BlueprintBlock>
   <BlueprintBlock label="Request miner" title="Content demand queue" tone="bg-[#CCFF00]">
    <MiniCardStack cards={cardsForLane(cards, "request-miner")} compact />
   </BlueprintBlock>
  </div>
  <BlueprintBlock label="Creator response" title="Reply and community composer" tone="bg-[#00F0FF]">
   <div className="rounded-[14px] border-[4px] border-black bg-white p-4">
    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-black/50">Draft reply</div>
    <StandardTextArea placeholder="Reply draft" minHeight="130px" />
   </div>
   <div className="mt-4 rounded-[14px] border-[4px] border-black bg-[#FF4FD8] p-4 text-white">
    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/70">Community post draft</div>
    <StandardTextArea placeholder="Community post" minHeight="130px" />
   </div>
  </BlueprintBlock>
 </div>
)

const renderPackagingLab = (cards: PrototypeWorkspaceCard[]) => (
 <div className="grid gap-5 p-5">
  <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
   <BlueprintBlock label="Title system" title="Variant scoring table" tone="bg-white">
    <div className="grid gap-2">
     {["Promise", "Curiosity", "Specificity", "Trust risk"].map((header) => (
      <div key={header} className="grid grid-cols-[1fr_90px_90px] gap-2 rounded-[12px] border-[3px] border-black bg-[#f8f7f1] px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em]">
       <span>{header}</span>
       <span>Score</span>
       <span>Status</span>
      </div>
     ))}
    </div>
   </BlueprintBlock>
   <BlueprintBlock label="Thumbnail direction" title="Visual board" tone="bg-[#FFEA5A]">
    <div className="grid grid-cols-2 gap-3">
     {["Subject", "Emotion", "Contrast", "Proof cue"].map((item) => (
      <div key={item} className="aspect-video rounded-[14px] border-[4px] border-black bg-white p-3 text-sm font-[1000] uppercase">
       {item}
      </div>
     ))}
    </div>
   </BlueprintBlock>
  </div>
  <div className="grid gap-5 xl:grid-cols-3">
   <BlueprintBlock label="Description editor" title="Opening metadata" tone="bg-[#00F0FF]">
    <TextRows rows={["Line 1: promise", "Line 2: proof", "Line 3: CTA/context"]} />
   </BlueprintBlock>
   <BlueprintBlock label="Experiment batch" title="Variant queue" tone="bg-[#CCFF00]">
    <MiniCardStack cards={cardsForLane(cards, "experiment-batch")} compact />
   </BlueprintBlock>
   <BlueprintBlock label="Scorecard" title="Final packaging decision" tone="bg-[#FF4FD8] text-white">
    <MiniCardStack cards={cardsForLane(cards, "scorecard")} compact />
   </BlueprintBlock>
  </div>
 </div>
)

const renderSeriesGenerator = (cards: PrototypeWorkspaceCard[]) => (
 <div className="grid gap-5 p-5">
  <div className="grid gap-5 xl:grid-cols-[1.1fr_1fr]">
   <BlueprintBlock label="Theme cluster map" title="Topic constellation" tone="bg-[#CCFF00]">
    <div className="grid min-h-[260px] grid-cols-3 gap-3">
     {["Core promise", "Audience need", "Repeat format", "Proof lane", "Contrarian branch", "Sequel cue"].map((node, index) => (
      <div key={node} className={`${index === 0 ? "col-span-2 bg-[#00F0FF]" : "bg-white"} rounded-[999px] border-[4px] border-black px-4 py-5 text-center text-xs font-black uppercase tracking-[0.1em]`}>
       {node}
      </div>
     ))}
    </div>
   </BlueprintBlock>
   <BlueprintBlock label="Sequel tree" title="Branch planner" tone="bg-white">
    <div className="grid gap-3">
     {["Setup episode", "Deep dive branch", "Broader audience branch", "Contrarian branch"].map((step, index) => (
      <div key={step} className="flex items-center gap-3">
       <div className="grid size-10 place-items-center rounded-full border-[3px] border-black bg-[#FFEA5A] text-sm font-black">{index + 1}</div>
       <div className="flex-1 rounded-[12px] border-[3px] border-black bg-[#f8f7f1] px-4 py-3 text-sm font-black uppercase">{step}</div>
      </div>
     ))}
    </div>
   </BlueprintBlock>
  </div>
  <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
   <BlueprintBlock label="Cadence fit panel" title="Capacity vs rhythm" tone="bg-[#FFEA5A]">
    <MiniControlGrid items={["Publish rhythm", "Production load", "Backlog depth", "Risk score"]} />
   </BlueprintBlock>
   <BlueprintBlock label="Franchise map" title="Durable format operating map" tone="bg-[#FF4FD8] text-white">
    <MiniCardStack cards={cardsForLane(cards, "franchise-map")} compact />
   </BlueprintBlock>
  </div>
 </div>
)

const renderPublishingArchitect = (cards: PrototypeWorkspaceCard[]) => (
 <div className="grid gap-5 p-5 xl:grid-cols-[0.8fr_1.2fr_0.9fr]">
  <BlueprintBlock label="Backlog queue" title="Priority stack" tone="bg-[#FFEA5A]">
   <MiniCardStack cards={cardsForLane(cards, "backlog-queue")} compact />
  </BlueprintBlock>
  <BlueprintBlock label="Calendar window" title="Publishing board" tone="bg-white">
   <div className="grid grid-cols-7 gap-2">
    {Array.from({ length: 14 }).map((_, index) => (
     <div key={index} className={`${index === 3 ? "bg-[#CCFF00]" : index === 8 ? "bg-[#FF4FD8] text-white" : "bg-[#f8f7f1]"} min-h-20 rounded-[12px] border-[3px] border-black p-2 text-[10px] font-black uppercase`}>
      Day {index + 1}
     </div>
    ))}
   </div>
  </BlueprintBlock>
  <div className="grid gap-5">
   <BlueprintBlock label="Campaign lane" title="Pressure tracker" tone="bg-[#CCFF00]">
    <MiniCardStack cards={cardsForLane(cards, "campaign-lane")} compact />
   </BlueprintBlock>
   <BlueprintBlock label="Readiness / recovery" title="Gate checklist" tone="bg-[#FF4FD8] text-white">
    <MiniControlGrid items={["Assets", "Metadata", "Edit state", "Follow-up"]} />
   </BlueprintBlock>
  </div>
 </div>
)

const FrameMapperPreview: React.FC = () => {
 const cropWidth = NINE_BY_SIXTEEN_WIDTH_IN_SIXTEEN_BY_NINE_PERCENT
 const keyframes = [
  { frame: 0, seconds: "0.00s", cropLeft: CENTERED_NINE_BY_SIXTEEN_LEFT_PERCENT, marker: 50, label: "Center hold" },
  { frame: 60, seconds: "2.00s", cropLeft: CENTERED_NINE_BY_SIXTEEN_LEFT_PERCENT, marker: 50, label: "Center" },
  { frame: 90, seconds: "3.00s", cropLeft: 0, marker: 0, label: "Pan left edge" },
  { frame: 150, seconds: "5.00s", cropLeft: RIGHT_ALIGNED_NINE_BY_SIXTEEN_LEFT_PERCENT, marker: 100, label: "Cut right proof" },
 ]

 return (
  <div className="grid gap-4">
   <div className="rounded-[16px] border-[4px] border-black bg-[#111] p-4 text-white shadow-[4px_4px_0px_0px_black]">
    <div className="mb-3 flex flex-wrap gap-2">
     <PrototypeMetricChip label="Source 16:9" tone="bg-white text-black" />
     <PrototypeMetricChip label="Export 9:16" tone="bg-[#CCFF00] text-black" />
     <PrototypeMetricChip label="30 FPS" tone="bg-[#00F0FF] text-black" />
    </div>
    <ExactAspectFrame ratio={SOURCE_ASPECT_RATIO} className="rounded-[16px] border-[4px] border-white bg-[#2b2b2b]">
     <div className="absolute inset-0 grid grid-cols-6 grid-rows-3 opacity-35">
      {Array.from({ length: 18 }).map((_, index) => (
       <div key={index} className="border border-white/35" />
      ))}
     </div>
     <div className="absolute inset-0 bg-[linear-gradient(110deg,#00F0FF_0%,#00F0FF_16%,#FFEA5A_16%,#FFEA5A_34%,#FF4FD8_34%,#FF4FD8_52%,#CCFF00_52%,#CCFF00_70%,#f8f7f1_70%,#f8f7f1_100%)] opacity-80" />
     <ExactAspectFrame
      ratio={EXPORT_ASPECT_RATIO}
      className="absolute top-0 h-full border-x-[5px] border-[#CCFF00] bg-black/20 shadow-[0_0_0_999px_rgba(0,0,0,0.32)]"
      style={{
       left: `${CENTERED_NINE_BY_SIXTEEN_LEFT_PERCENT}%`,
       width: `${cropWidth}%`,
      }}
     >
      <div className="absolute inset-2 rounded-[12px] border-[3px] border-white" />
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-[10px] border-[3px] border-black bg-[#CCFF00] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-black">
       Visible 9:16
      </div>
     </ExactAspectFrame>
     {keyframes.map((keyframe) => (
      <div
       key={keyframe.frame}
       className="absolute top-3 h-7 w-7 -translate-x-1/2 rounded-full border-[3px] border-black bg-[#FF4FD8] text-center text-[10px] font-black leading-5 text-white"
       style={{ left: `${keyframe.marker}%` }}
      >
       {keyframe.frame}
      </div>
     ))}
    </ExactAspectFrame>
   </div>

   <div className="rounded-[16px] border-[4px] border-black bg-white p-4">
    <div className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-black/50">Frame scrubber and keyframes</div>
    <div className="relative h-16 rounded-[14px] border-[4px] border-black bg-[#f8f7f1]">
     <div className="absolute left-4 right-4 top-1/2 h-2 -translate-y-1/2 rounded-full border-[2px] border-black bg-[#00F0FF]" />
     {keyframes.map((keyframe) => (
      <div key={keyframe.frame} className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${6 + (keyframe.frame / 150) * 88}%` }}>
       <div className="grid size-9 place-items-center rounded-full border-[3px] border-black bg-[#CCFF00] text-[10px] font-black">
        {keyframe.frame}
       </div>
      </div>
     ))}
    </div>
    <div className="mt-3 grid gap-2 md:grid-cols-4">
     {keyframes.map((keyframe) => (
      <div key={keyframe.frame} className="rounded-[12px] border-[3px] border-black bg-[#f8f7f1] p-3">
       <div className="text-[10px] font-black uppercase tracking-[0.14em] text-black/45">Frame {keyframe.frame}</div>
       <div className="text-sm font-[1000] uppercase leading-tight">{keyframe.label}</div>
       <div className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-black/55">{keyframe.seconds} / crop left {Math.round(keyframe.cropLeft)}%</div>
      </div>
     ))}
    </div>
   </div>
  </div>
 )
}

const FrameMapPacketPreview: React.FC = () => (
 <div className="rounded-[16px] border-[4px] border-black bg-[#111] p-4 text-white shadow-[4px_4px_0px_0px_black]">
  <div className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-white/55">VT_E1 import packet</div>
  <pre className="overflow-x-auto rounded-[12px] border-[3px] border-white bg-black p-3 text-[10px] font-black leading-5 text-[#CCFF00]">
{`{
  "sourceAspect": "16:9",
  "exportAspect": "9:16",
  "fps": 30,
  "cropWindow": { "width": 0.31640625 },
  "frameMap": [
    { "frame": 0, "cropLeft": 0.341797, "ease": "hold" },
    { "frame": 60, "cropLeft": 0.341797, "ease": "linear" },
    { "frame": 90, "cropLeft": 0, "ease": "linear" },
    { "frame": 150, "cropLeft": 0.683594, "ease": "hardCut" }
  ]
}`}
  </pre>
 </div>
)

const renderShortsStudio = (cards: PrototypeWorkspaceCard[]) => (
 <div className="grid gap-5 p-5 xl:grid-cols-[0.65fr_1.35fr_0.75fr]">
  <BlueprintBlock label="Source clip rail" title="Clips" tone="bg-[#00F0FF]">
   <MiniCardStack cards={[...cardsForLane(cards, "source-clip-rail"), ...cardsForLane(cards, "highlight-candidates")]} compact />
  </BlueprintBlock>
  <BlueprintBlock label="Frame mapper" title="Frame map" tone="bg-white">
   <FrameMapperPreview />
   <div className="mt-4 grid gap-3 md:grid-cols-2">
    <MiniCardStack cards={cardsForLane(cards, "cutter-handles")} compact />
    <MiniCardStack cards={cardsForLane(cards, "vt-e1-handoff")} compact />
   </div>
  </BlueprintBlock>
  <div className="grid gap-5">
   <PhonePreview title="Proof moment" caption="Caption safe zone" />
   <FrameMapPacketPreview />
  </div>
 </div>
)

const renderCinematicAnalytics = (cards: PrototypeWorkspaceCard[]) => (
 <div className="grid gap-5 p-5 xl:grid-cols-[0.75fr_1.25fr_0.9fr]">
  <BlueprintBlock label="Metric selector" title="Canonical controls" tone="bg-[#00F0FF]">
   <MiniControlGrid items={["Metric", "Dimension", "Date range", "Formula"]} />
   <div className="mt-3">
    <MiniCardStack cards={cardsForLane(cards, "metric-selector")} compact />
   </div>
  </BlueprintBlock>
  <BlueprintBlock label="Comparison stage" title="Chart and contrast surface" tone="bg-white">
   <div className="grid h-72 grid-cols-8 items-end gap-2 rounded-[14px] border-[4px] border-black bg-[#f8f7f1] p-4">
    {[30, 70, 45, 90, 58, 35, 82, 64].map((height, index) => (
     <div key={index} className="rounded-t-[10px] border-[3px] border-black bg-[#CCFF00]" style={{ height: `${height}%` }} />
    ))}
   </div>
  </BlueprintBlock>
  <div className="grid gap-5">
   <BlueprintBlock label="Anomaly cards" title="Review queue" tone="bg-[#FF4FD8] text-white">
    <MiniCardStack cards={cardsForLane(cards, "anomaly-cards")} compact />
   </BlueprintBlock>
   <BlueprintBlock label="Insight artifact preview" title="Claim and action" tone="bg-[#FFEA5A]">
    <MiniCardStack cards={cardsForLane(cards, "insight-preview")} compact />
   </BlueprintBlock>
  </div>
 </div>
)

const RetentionCurveVisual: React.FC = () => {
 const points = [
  [0, 92],
  [12, 78],
  [24, 61],
  [36, 42],
  [48, 39],
  [60, 36],
  [72, 33],
  [84, 31],
  [100, 29],
 ]
 const toPoint = ([x, y]: number[]) => `${36 + x * 2.5},${282 - y * 2.45}`
 const path = points.map(toPoint).join(" ")

 return (
  <div className="grid gap-4">
   <div className="rounded-[16px] border-[4px] border-black bg-[#f8f7f1] p-4 shadow-[4px_4px_0px_0px_black]">
    <div className="mb-3 flex flex-wrap gap-2">
     <PrototypeMetricChip label="Avg retention 40.09%" tone="bg-[#CCFF00] text-black" />
     <PrototypeMetricChip label="Drop 30-45%" tone="bg-[#FF4FD8] text-white" />
     <PrototypeMetricChip label="499 views" tone="bg-white text-black" />
    </div>
    <svg viewBox="0 0 320 320" className="h-[340px] w-full rounded-[14px] border-[3px] border-black bg-white">
     {[70, 125, 180, 235].map((y) => (
      <line key={`y-${y}`} x1="36" x2="292" y1={y} y2={y} stroke="#d4d4d4" strokeWidth="2" />
     ))}
     {[86, 136, 186, 236].map((x) => (
      <line key={`x-${x}`} x1={x} x2={x} y1="36" y2="286" stroke="#d4d4d4" strokeWidth="2" />
     ))}
     <rect x="112" y="36" width="54" height="250" fill="#FF4FD8" opacity="0.2" />
     <text x="116" y="58" className="fill-black text-[10px] font-black uppercase tracking-[0.16em]">Re-hook</text>
     <polyline points={path} fill="none" stroke="#111" strokeWidth="8" strokeLinejoin="round" strokeLinecap="round" />
     <polyline points={path} fill="none" stroke="#00F0FF" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
     {points.map(([x, y], index) => (
      <circle key={`${x}-${y}`} cx={36 + x * 2.5} cy={282 - y * 2.45} r={index === 3 ? 10 : 7} fill={index === 3 ? "#FF4FD8" : "#CCFF00"} stroke="#111" strokeWidth="4" />
     ))}
     <text x="38" y="28" className="fill-black text-[11px] font-black uppercase">100%</text>
     <text x="38" y="306" className="fill-black text-[11px] font-black uppercase">0%</text>
     <text x="40" y="318" className="fill-black text-[11px] font-black uppercase">0:00</text>
     <text x="250" y="318" className="fill-black text-[11px] font-black uppercase">7:20</text>
    </svg>
   </div>
   <div className="grid gap-3 md:grid-cols-3">
    <div className="rounded-[12px] border-[3px] border-black bg-[#FFEA5A] p-3 text-xs font-black uppercase">Hook holds, middle falls</div>
    <div className="rounded-[12px] border-[3px] border-black bg-white p-3 text-xs font-black uppercase">Likely pacing issue</div>
    <div className="rounded-[12px] border-[3px] border-black bg-[#CCFF00] p-3 text-xs font-black uppercase">Test a 30-45% re-hook</div>
   </div>
  </div>
 )
}

const renderRetentionEngine = (cards: PrototypeWorkspaceCard[]) => (
 <div className="grid gap-5 p-5 xl:grid-cols-[0.8fr_1.2fr] 2xl:grid-cols-[0.75fr_1.25fr_0.95fr]">
  <BlueprintBlock label="Video queue" title="Video" tone="bg-[#00F0FF]">
   <MiniCardStack cards={cardsForLane(cards, "video-queue")} compact />
   <div className="rounded-[14px] border-[3px] border-black bg-[#CCFF00] p-3 text-xs font-black uppercase">
    Selected: Guardians Alder 720p
   </div>
   <MiniControlGrid items={["Retention 40.09%", "CTR N/A", "499 views", "Source: yt_analytics_cache"]} />
  </BlueprintBlock>
  <BlueprintBlock label="Retention analytics" title="Curve" tone="bg-white">
   <RetentionCurveVisual />
  </BlueprintBlock>
  <div className="grid gap-5 xl:col-span-2 2xl:col-span-1">
   <BlueprintBlock label="Autopsy" title="Diagnosis" tone="bg-[#FF4FD8] text-white">
    <MiniCardStack cards={cardsForLane(cards, "autopsy-board")} compact />
    <TextRows rows={["Middle section loses viewers", "Opening promise may repeat", "Re-hook needs visual proof"]} />
   </BlueprintBlock>
   <BlueprintBlock label="Experiment queue" title="Intervention" tone="bg-[#CCFF00]">
    <MiniCardStack cards={[...cardsForLane(cards, "hypothesis-builder"), ...cardsForLane(cards, "experiment-queue")]} compact />
    <MiniControlGrid items={["Add re-hook", "Cut repeated setup", "Compare next upload", "Save experiment"]} />
   </BlueprintBlock>
  </div>
 </div>
)

const renderBrainCommand = (cards: PrototypeWorkspaceCard[]) => (
  <div className="grid gap-5 p-5 xl:grid-cols-[0.85fr_1.15fr] 2xl:grid-cols-[0.8fr_1.15fr_0.9fr]">
  <BlueprintBlock label="Signal inbox" title="Signals" tone="bg-[#CCFF00]">
   <MiniCardStack cards={cardsForLane(cards, "signal-inbox")} compact />
  </BlueprintBlock>
  <div className="grid gap-5">
   <BlueprintBlock label="Priority board" title="Routing" tone="bg-[#FFEA5A]">
    <MiniCardStack cards={cardsForLane(cards, "priority-board")} compact />
   </BlueprintBlock>
   <BlueprintBlock label="Assistant chat surface" title="Chat" tone="bg-white">
    <TextRows rows={["What should I fix before upload?", "Highest-confidence priority: repair the hook cliff.", "Create a re-hook experiment for the next edit."]} />
   </BlueprintBlock>
   <BlueprintBlock label="Agent dispatch queue" title="Agents" tone="bg-[#FF4FD8] text-white">
    <MiniCardStack cards={cardsForLane(cards, "agent-dispatch")} compact />
   </BlueprintBlock>
  </div>
  <BlueprintBlock label="Confidence boundaries" title="Confidence" tone="bg-[#00F0FF]">
   <MiniCardStack cards={cardsForLane(cards, "confidence-boundaries")} compact />
   <div className="mt-4">
    <MiniCardStack cards={cardsForLane(cards, "memory-candidates")} compact />
   </div>
  </BlueprintBlock>
 </div>
)

const renderWorkflowChain = (cards: PrototypeWorkspaceCard[]) => (
 <div className="grid gap-5 p-5 xl:grid-cols-[0.85fr_1.15fr] 2xl:grid-cols-[0.85fr_1.2fr_0.95fr]">
  <BlueprintBlock label="Chain template builder" title="Template" tone="bg-[#CCFF00]">
   <MiniCardStack cards={cardsForLane(cards, "chain-template-builder")} compact />
   <div className="mt-4">
    <MiniControlGrid items={["Idea to publish", "Analytics to experiment", "Vault to editor"]} />
   </div>
  </BlueprintBlock>
  <BlueprintBlock label="Step lane" title="Workflow" tone="bg-white">
   <div className="grid gap-3">
    {["Creator Canvas", "Packaging Lab", "Project Command", "VT_E1", "Analytics Review"].map((step, index) => (
     <div key={step} className="grid grid-cols-[44px_1fr_auto] items-center gap-3 rounded-[14px] border-[4px] border-black bg-[#f8f7f1] p-3">
      <div className="grid size-10 place-items-center rounded-full border-[3px] border-black bg-[#00F0FF] text-sm font-black">{index + 1}</div>
      <div className="text-sm font-[1000] uppercase">{step}</div>
      <PrototypeMetricChip label={index === 2 ? "active" : "pending"} tone={index === 2 ? "bg-[#CCFF00]" : "bg-white"} />
     </div>
    ))}
   </div>
  </BlueprintBlock>
  <div className="grid gap-5 xl:col-span-2 xl:grid-cols-2 2xl:col-span-1 2xl:grid-cols-1">
   <BlueprintBlock label="Artifact drawer" title="Outputs" tone="bg-[#FFEA5A]">
    <MiniCardStack cards={cardsForLane(cards, "artifact-drawer")} compact />
   </BlueprintBlock>
   <BlueprintBlock label="Blocker/Provenance Tracker" title="Blockers" tone="bg-[#FF4FD8] text-white">
    <MiniCardStack cards={cardsForLane(cards, "blocker-provenance")} compact />
   </BlueprintBlock>
  </div>
 </div>
)

const SuperToolPrototypeWorkspace: React.FC<{
 config: PrototypeWorkspaceConfig
}> = ({ config }) => {
 const [cards, setCards] = useState(config.cards)
 const [selectedCardId, setSelectedCardId] = useState(config.cards[0]?.id || "")
 const [draggingCardId, setDraggingCardId] = useState<string | null>(null)

 const selectedCard = cards.find((card) => card.id === selectedCardId) || cards[0]
 const selectedLane = config.lanes.find((lane) => lane.id === selectedCard?.laneId) || config.lanes[0]
 const selectedIndex = selectedCard ? config.lanes.findIndex((lane) => lane.id === selectedCard.laneId) : -1
 const blockedLaneId = useMemo(
  () => findLaneId(config.lanes, (lane) => lane.title.toLowerCase().includes("blocked"), config.lanes[0]?.id || ""),
  [config.lanes],
 )
 const readyLaneId = useMemo(
  () =>
   findLaneId(
    config.lanes,
    (lane) => lane.title.toLowerCase().includes("ready") || lane.title.toLowerCase().includes("published"),
    config.lanes[config.lanes.length - 1]?.id || "",
   ),
  [config.lanes],
 )

 const updateSelectedCard = (laneId: string, status?: PrototypeCardStatus, patch: Partial<PrototypeWorkspaceCard> = {}) => {
  if (!selectedCard) return
  const lane = config.lanes.find((item) => item.id === laneId)
  setCards((current) =>
   current.map((card) =>
    card.id === selectedCard.id ?
     {
      ...card,
      ...patch,
      laneId,
      status: status || (lane ? laneStatus(lane.title) : card.status),
     }
    : card,
   ),
  )
 }

 const moveSelected = (offset: number) => {
  if (!selectedCard || selectedIndex < 0) return
  const nextLane = config.lanes[Math.min(Math.max(selectedIndex + offset, 0), config.lanes.length - 1)]
  updateSelectedCard(nextLane.id)
 }

 const markBlocked = () => {
  updateSelectedCard(blockedLaneId, "blocked", {
   blocker: selectedCard?.blocker || "Missing input",
  })
 }

 const markReady = () => {
  updateSelectedCard(readyLaneId, "ready")
 }

 const moveDraggedCardToLane = (laneId: string) => {
  if (!draggingCardId) return
  const lane = config.lanes.find((item) => item.id === laneId)
  setCards((current) =>
   current.map((card) =>
    card.id === draggingCardId ?
     {
      ...card,
      laneId,
      status: lane ? laneStatus(lane.title) : card.status,
     }
    : card,
   ),
  )
  setSelectedCardId(draggingCardId)
  setDraggingCardId(null)
 }

 const blueprint = PROTOTYPE_BLUEPRINTS[config.toolId] || {
  title: config.title,
  subtitle: "Workspace",
  iconName: "zap",
  paletteIndex: 4,
  modeTabs: ["Workspace", "Board", "Output"],
  subToolboxes: [],
  primaryAction: "Build",
  secondaryAction: "Handoff",
  inspectorTitle: "Workspace Inspector",
  inspectorRows: config.controls,
 }

 const renderInterior = () => {
  if (config.toolId === "project-command-kanban") {
   return renderProjectKanban(
    config,
    cards,
    selectedCard,
    selectedCard?.id || "",
    selectedLane,
    selectedIndex,
    setSelectedCardId,
    setDraggingCardId,
    moveDraggedCardToLane,
    moveSelected,
    markBlocked,
    markReady,
   )
  }
  if (config.toolId === "creator-canvas-os") return renderCreatorCanvas(config, cards)
  if (config.toolId === "audience-loop-studio") return renderAudienceLoop(cards)
  if (config.toolId === "packaging-lab-pro") return renderPackagingLab(cards)
  if (config.toolId === "series-and-theme-generator") return renderSeriesGenerator(cards)
  if (config.toolId === "publishing-schedule-architect") return renderPublishingArchitect(cards)
  if (config.toolId === "shorts-extraction-studio") return renderShortsStudio(cards)
  if (config.toolId === "cinematic-analytics-lab") return renderCinematicAnalytics(cards)
  if (config.toolId === "retention-autopsy-experiment-engine") return renderRetentionEngine(cards)
  if (config.toolId === "brain-command-center") return renderBrainCommand(cards)
  if (config.toolId === "workflow-chain-builder") return renderWorkflowChain(cards)
  return (
   <div className="grid gap-5 p-5">
    <PrototypeToolbar controls={config.controls} />
    <MiniCardStack cards={cards} selectedCardId={selectedCardId} onSelectCard={setSelectedCardId} />
   </div>
  )
 }

	 return (
	  <PrototypePanel config={config} blueprint={blueprint}>
	   {renderInterior()}
	  </PrototypePanel>
	 )
}

export default SuperToolPrototypeWorkspace
