import React, { useMemo, useState } from "react"
import { Brain, CheckCircle2, Database, Lightbulb, Network, RefreshCw, ShieldCheck, Workflow, Zap } from "lucide-react"
import { AssistantCommandContextBanner } from "../components/AssistantCommandContextBanner"
import { SuperToolRail } from "../components/SuperToolRail"
import { SidebarChatbot } from "../components/SidebarChatbot"
import { useBrain } from "../context/useBrain"
import { listGenerationRecords } from "../services/generationStore"
import { listSuperToolsByIds } from "../services/superToolRegistry"
import {
 createBrainCommandAction,
 createSuperToolActionPacket,
 filterBrainCommandActions,
 listBrainCommandActions,
 type BrainCommandFilter,
} from "../services/superToolActionPackets"
import { listWorkflowChains } from "../services/workflowEngine"
import type { SuperToolId } from "../types"
import SuperToolPrototypeWorkspace, {
 type PrototypeWorkspaceConfig,
} from "./supertools/SuperToolPrototypeWorkspace"

const COMMAND_TOOL_IDS = [
 "brain-command-center",
 "workflow-chain-builder",
 "retention-autopsy-experiment-engine",
] as const

const confidenceRows = [
 {
  label: "Observed facts",
  value: "High",
  body: "Use channel sync, saved generations, workflows, and explicit creator notes before making claims.",
 },
 {
  label: "Repeated patterns",
  value: "Medium",
  body: "Treat recurring tags, topics, retention signals, and workflow outcomes as useful but revisable guidance.",
 },
 {
  label: "Creator intent",
  value: "Low",
  body: "Ask thoughtful questions instead of pretending certainty about private motivation or personality.",
 },
]

const commandModules = [
 {
  title: "Brain Signals",
  icon: <Brain size={20} />,
  tone: "bg-[#CCFF00]",
  body: "Reads tool events, user notes, channel context, and workflow outcomes as the canonical signal stream.",
  controls: ["signal type", "source tool", "confidence", "channel scope"],
  outputKind: "brain signal envelope",
  integrations: ["useBrain", "GenerationRecord", "WorkflowChain"],
  selfImprovementSignal: "records which signals are useful enough to become durable memory",
 },
 {
  title: "Priorities",
  icon: <Lightbulb size={20} />,
  tone: "bg-[#FFEA5A]",
  body: "Ranks launch blockers, creator goals, unfinished workflows, and high-confidence opportunities without hiding evidence.",
  controls: ["priority lane", "urgency", "evidence", "owner"],
  outputKind: "priority routing packet",
  integrations: ["Project Command", "Daily Brief", "Workflow Chain"],
  selfImprovementSignal: "learns which priorities repeatedly unblock work",
 },
 {
  title: "Assistant Chat",
  icon: <Zap size={20} />,
  tone: "bg-[#FF4FD8] text-white",
  body: "Acts as the user-facing representation of the deeper Brain while routing accepted advice into real tools.",
  controls: ["question", "tool route", "confidence", "accepted action"],
  outputKind: "assistant answer and handoff",
  integrations: ["SidebarChatbot", "ToolContextPack", "Brain memory"],
  selfImprovementSignal: "records accepted, rejected, and corrected assistant advice",
 },
 {
  title: "Confidence Boundaries",
  icon: <ShieldCheck size={20} />,
  tone: "bg-[#00F0FF]",
  body: "Separates observed facts, repeated patterns, and private-intent hypotheses before advice is shown.",
  controls: ["fact level", "pattern level", "hypothesis level", "missing data"],
  outputKind: "confidence boundary strip",
  integrations: ["Brain onboarding", "Analytics sync", "Vault evidence"],
  selfImprovementSignal: "prevents private-intent overclaims and stale evidence reuse",
 },
 {
  title: "Agent Dispatch",
  icon: <Workflow size={20} />,
  tone: "bg-[#CCFF00]",
  body: "Assigns non-overlapping scopes to the next agents and keeps handoffs grounded in artifacts.",
  controls: ["agent scope", "target tool", "artifact", "success check"],
  outputKind: "multi-agent dispatch packet",
  integrations: ["Workflow Chain", "Project Command", "Data Transparency"],
  selfImprovementSignal: "tracks whether dispatched scopes overlap or stall",
 },
 {
  title: "Memory Updates",
  icon: <Database size={20} />,
  tone: "bg-[#FFEA5A]",
  body: "Collects tomorrow memory, durable memory candidates, skipped checks, and documents that need updates.",
  controls: ["candidate", "evidence", "expires", "doc target"],
  outputKind: "memory update queue",
  integrations: ["Daily Brief", "Docs registry", "Brain reflection"],
  selfImprovementSignal: "keeps tomorrow's run from rediscovering the same context",
 },
]

const brainPrototypeConfig: PrototypeWorkspaceConfig = {
 toolId: "brain-command-center",
 title: "Brain Command Prototype",
 description: "Early operating layout for signal intake, priorities, confidence boundaries, agent dispatch, and memory candidates.",
 lanes: [
  { id: "signal-inbox", title: "Signal Inbox", description: "Tool, user, and workflow events", tone: "bg-[#CCFF00]" },
  { id: "priority-board", title: "Priority Board", description: "Launch blockers and next best actions", tone: "bg-[#FFEA5A]" },
  { id: "confidence-boundaries", title: "Confidence Boundaries", description: "Facts, patterns, hypotheses", tone: "bg-[#00F0FF]" },
  { id: "agent-dispatch", title: "Agent Dispatch Queue", description: "Non-overlapping scopes", tone: "bg-[#FF4FD8] text-white" },
  { id: "memory-candidates", title: "Memory Candidates", description: "Tomorrow notes and durable context", tone: "bg-[#CCFF00]" },
 ],
 cards: [
  {
   id: "signal-workflow-blocked",
   laneId: "signal-inbox",
   title: "Blocked workflow signal",
   summary: "A project or chain has stopped and needs routing with source evidence.",
   status: "active",
   priority: "urgent",
   chips: ["workflow", "blocker"],
   controls: ["signal type", "source tool"],
   output: "brain signal envelope",
   integrations: ["useBrain", "WorkflowChain"],
   handoffTarget: "Priority Board",
  },
  {
   id: "priority-launch-blocker",
   laneId: "priority-board",
   title: "Launch blocker priority",
   summary: "Rank the blocker against unfinished launch-critical work.",
   status: "queued",
   priority: "high",
   chips: ["urgency", "owner"],
   controls: ["priority lane", "evidence"],
   output: "priority routing packet",
   integrations: ["Project Command", "Daily Brief"],
   handoffTarget: "Agent Dispatch",
  },
  {
   id: "confidence-private-intent",
   laneId: "confidence-boundaries",
   title: "Creator intent boundary",
   summary: "Keep private-motivation claims low confidence unless the user states them.",
   status: "ready",
   priority: "high",
   chips: ["low confidence", "missing data"],
   controls: ["fact level", "hypothesis level"],
   output: "confidence boundary strip",
   integrations: ["Brain onboarding", "Vault evidence"],
   handoffTarget: "Assistant Chat",
  },
  {
   id: "dispatch-ui-agent",
   laneId: "agent-dispatch",
   title: "UI prototype agent",
   summary: "Assign one agent to prototype modules without touching analytics or auth.",
   status: "active",
   priority: "medium",
   chips: ["non-overlap", "scope"],
   controls: ["target tool", "success check"],
   output: "multi-agent dispatch packet",
   integrations: ["Workflow Chain", "Data Transparency"],
   handoffTarget: "Workflow Chain Builder",
  },
  {
   id: "memory-next-brief",
   laneId: "memory-candidates",
   title: "Tomorrow inspection note",
   summary: "Remember which prototypes passed smoke and which need deeper real actions.",
   status: "queued",
   priority: "medium",
   chips: ["tomorrow", "docs"],
   controls: ["candidate", "doc target"],
   output: "memory update queue",
   integrations: ["Daily Brief", "Docs registry"],
   handoffTarget: "Daily Brief",
  },
 ],
 controls: ["select signal", "route priority", "mark confidence", "dispatch agent"],
 evidence: ["workflow state", "generation record", "user correction", "source artifact"],
 handoffTargets: ["Workflow Chain", "Project Command", "Daily Brief"],
}

interface BrainCommandCenterProps {
 embedded?: boolean
}

const BrainCommandCenter: React.FC<BrainCommandCenterProps> = ({ embedded = false }) => {
 const { getBrainMemory, emitSignal, reflectAndCompress, channelIdentity } = useBrain()
 const [note, setNote] = useState("")
 const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("high")
 const [confidence, setConfidence] = useState<"high" | "medium" | "low">("medium")
 const [targetToolId, setTargetToolId] = useState<SuperToolId>("workflow-chain-builder")
 const [sourceEvidence, setSourceEvidence] = useState("")
 const [status, setStatus] = useState<string | null>(null)
 const [commandRefresh, setCommandRefresh] = useState(0)
 const [commandFilter, setCommandFilter] = useState<BrainCommandFilter>("all")
 const memory = getBrainMemory()

 const tools = useMemo(() => listSuperToolsByIds([...COMMAND_TOOL_IDS]), [])
 const workflows = useMemo(() => listWorkflowChains(), [])
 const generations = useMemo(() => listGenerationRecords(), [])
 const commandActions = useMemo(() => listBrainCommandActions(), [commandRefresh])
 const visibleCommandActions = useMemo(
  () => filterBrainCommandActions(commandActions, commandFilter),
  [commandActions, commandFilter],
 )

 const activeWorkflows = workflows.filter((workflow) => workflow.status === "active").length
 const blockedWorkflows = workflows.filter((workflow) => workflow.status === "blocked").length
 const recentTools = Array.from(new Set(generations.slice(0, 12).map((record) => record.toolId))).slice(0, 5)

 const nextActions = [
  {
   title: "Run one reflection pass",
   body: "Compress recent tool activity into the permanent Brain before routing more work.",
   icon: <RefreshCw size={20} />,
   tone: "bg-[#CCFF00]",
  },
  {
   title: blockedWorkflows ? "Clear blocked chains" : "Promote one chain",
   body:
    blockedWorkflows ?
     "Resolve the blocked workflow first so downstream tools do not inherit stale assumptions."
    : "Pick one pending idea-to-publish chain and move the first step into active execution.",
   icon: <Workflow size={20} />,
   tone: "bg-[#FFEA5A]",
  },
  {
   title: "Verify Brain evidence",
   body: "Keep source boundaries visible: synced facts, inferred patterns, and missing inputs should stay separate.",
   icon: <ShieldCheck size={20} />,
   tone: "bg-[#00F0FF]",
  },
 ]

 const handleSaveNote = async () => {
  if (!note.trim()) return
  setStatus("Saving command note...")
  const commandAction = createBrainCommandAction({
   priority,
   confidence,
   sourceEvidence: sourceEvidence
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean),
   targetToolId,
   note: note.trim(),
  })
  const packetResult = createSuperToolActionPacket({
   toolId: "brain-command-center",
   moduleId: "memory-updates",
   title: `${priority} Brain command action`,
   summary: `Queued a ${priority} priority Brain command for ${targetToolId} with ${confidence} confidence.`,
   inputs: {
    note: note.trim(),
    priority,
    confidence,
    sourceEvidence,
    targetToolId,
   },
   outputs: {
    commandActionId: commandAction.id,
    targetToolId,
    status: commandAction.status,
   },
   confidence,
   evidence: commandAction.sourceEvidence,
   missingInputs: commandAction.sourceEvidence.length ? [] : ["source evidence"],
   handoffTargets: [`workflow:${targetToolId}`, "brain:brain-command-center"],
   workflowTitle: `${targetToolId} Brain command dispatch`,
   workflowGoal: "Route the command note into an explicit next tool action with confidence boundaries.",
   workflowSteps: [
    {
     title: "Review Brain command",
     surface: "brain",
     toolId: "brain-command-center",
     details: note.trim(),
    },
    {
     title: "Execute target tool action",
     surface: targetToolId === "workflow-chain-builder" ? "workflow" : "studio",
     toolId: targetToolId,
     details: `Priority ${priority}; confidence ${confidence}.`,
    },
   ],
   tags: ["brain-command-action", priority, confidence],
  })
  await emitSignal("BRAIN_COMMAND_CENTER", "COMMAND_NOTE", {
   commandActionId: commandAction.id,
   generationId: packetResult.recordId,
   workflowId: packetResult.chain.id,
   note: note.trim(),
   source: "brain-command-center",
   channelId: channelIdentity.channelId,
   priority,
   confidence,
   sourceEvidence: commandAction.sourceEvidence,
   targetToolId,
   selfImprovement: {
    inputsUsed: ["manual command note", "current channel identity", "priority", "confidence", "target tool"],
    inferred: "creator correction or priority signal should update Brain routing",
    missing: commandAction.sourceEvidence.length ? [] : ["source artifact if not included in note"],
    handedOffTo: ["brain:brain-command-center", `workflow:${targetToolId}`],
    improveNext: commandModules.map((module) => module.selfImprovementSignal),
   },
  })
  setNote("")
  setSourceEvidence("")
  setCommandRefresh((value) => value + 1)
  setStatus("Command note saved to the Brain signal loop.")
 }

 const handleReflect = async () => {
  setStatus("Running reflection...")
  try {
   await reflectAndCompress()
   setStatus("Reflection cycle complete. Refresh if you want to reload the displayed memory snapshot.")
  } catch (error) {
   const message = error instanceof Error ? error.message : String(error)
   setStatus(`Reflection failed: ${message}`)
  }
 }

 return (
  <div className="mx-auto flex max-w-[1600px] flex-col gap-8 pb-24">
   <AssistantCommandContextBanner targetToolId="brain-command-center" />
   {!embedded ? (
    <>
     <section className="rounded-[24px] border-[5px] border-black bg-[#111] px-8 py-8 text-white shadow-[12px_12px_0px_0px_#FF4FD8]">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
       <div>
        <div className="text-[11px] font-black uppercase tracking-[0.35em] text-[#CCFF00]">
         Super-Tool 14
        </div>
        <h1 className="mt-3 text-5xl font-[1000] uppercase leading-none tracking-[-0.06em] md:text-6xl">
         Brain Command Center
        </h1>
        <p className="mt-4 max-w-4xl text-sm font-bold uppercase tracking-[0.12em] text-white/70">
         The operating surface for daily priorities, confidence boundaries, reflection loops, and cross-tool routing.
        </p>
       </div>
       <button
        type="button"
        onClick={handleReflect}
        className="inline-flex h-14 items-center justify-center gap-3 rounded-[14px] border-[4px] border-black bg-[#CCFF00] px-5 text-sm font-black uppercase tracking-[0.12em] text-black shadow-[6px_6px_0px_0px_white] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
       >
        <Zap size={18} />
        Force Reflection
       </button>
      </div>
     </section>

     <SuperToolRail
      title="Command Orchestration Layer"
      subtitle="Brain, workflow, and retention feedback loops"
      tools={tools}
      accentClassName="bg-[#FF4FD8]"
      note="This surface reads the canonical Brain and routes work; it does not create a second Brain or duplicate analytics stores."
     />
    </>
   ) : null}

   <section className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
    <div className="rounded-[22px] border-[4px] border-black bg-white shadow-[8px_8px_0px_0px_black]">
     <div className="border-b-[4px] border-black bg-[#CCFF00] px-6 py-5">
      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/55">
       Current Brain State
      </div>
      <div className="text-3xl font-[1000] uppercase tracking-[-0.05em]">
       Operator Snapshot
      </div>
     </div>
     <div className="grid gap-4 p-6 md:grid-cols-2">
      {[
       ["Identity", memory.identityAndAspirations],
       ["Content DNA", memory.contentDNA],
       ["Performance Ledger", memory.performanceLedger],
       ["Future State", memory.futureStateMap],
      ].map(([label, body]) => (
       <article key={label} className="rounded-[16px] border-[4px] border-black bg-[#f8f7f1] p-4">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-black/50">{label}</div>
        <p className="mt-2 text-sm font-bold leading-6 text-black/75">{body}</p>
       </article>
      ))}
     </div>
    </div>

    <div className="grid gap-8">
     <div className="rounded-[22px] border-[4px] border-black bg-[#111] text-white shadow-[8px_8px_0px_0px_#CCFF00]">
      <div className="border-b-[4px] border-black bg-[#00F0FF] px-6 py-5 text-black">
       <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/55">
        Command Metrics
       </div>
       <div className="text-3xl font-[1000] uppercase tracking-[-0.05em]">
        Live Loop
       </div>
      </div>
      <div className="grid gap-4 p-6">
       {[
        { label: "Active chains", value: activeWorkflows, icon: <Workflow size={18} /> },
        { label: "Blocked chains", value: blockedWorkflows, icon: <Network size={18} /> },
        { label: "Saved generations", value: generations.length, icon: <Database size={18} /> },
       ].map((metric) => (
        <div key={metric.label} className="flex items-center justify-between rounded-[16px] border-[4px] border-white/20 bg-black/40 px-5 py-4">
         <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.18em] text-white/65">
          {metric.icon}
          {metric.label}
         </div>
         <div className="text-4xl font-[1000] leading-none tracking-[-0.04em] text-[#CCFF00]">
          {metric.value}
         </div>
        </div>
       ))}
      </div>
     </div>

     <div className="rounded-[22px] border-[4px] border-black bg-white shadow-[8px_8px_0px_0px_black]">
      <div className="border-b-[4px] border-black bg-[#FFEA5A] px-6 py-5">
       <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/55">
        Recent Tool Signals
       </div>
       <div className="text-2xl font-[1000] uppercase tracking-[-0.04em]">
        Generation Sources
       </div>
      </div>
      <div className="flex flex-wrap gap-2 p-5">
       {recentTools.length ?
        recentTools.map((tool) => (
         <span key={tool} className="rounded-[10px] border-[3px] border-black bg-[#f8f7f1] px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em]">
          {tool}
         </span>
        ))
       : (
        <div className="rounded-[14px] border-[3px] border-dashed border-black/35 bg-[#f8f7f1] px-4 py-6 text-[10px] font-black uppercase tracking-[0.18em] text-black/55">
         No saved generation records yet.
        </div>
       )}
      </div>
     </div>
   </div>
  </section>

   <section className="rounded-[22px] border-[4px] border-black bg-white shadow-[8px_8px_0px_0px_black]">
    <div className="border-b-[4px] border-black bg-[#FF4FD8] px-6 py-5 text-white">
     <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/70">
      Toolbox Modules
     </div>
     <div className="text-3xl font-[1000] uppercase tracking-[-0.05em]">
      Brain Command Construction
     </div>
    </div>
    <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
     {commandModules.map((module) => (
      <article key={module.title} className="rounded-[18px] border-[4px] border-black bg-[#f8f7f1] shadow-[5px_5px_0px_0px_black]">
       <div className={`${module.tone} flex items-center gap-3 border-b-[4px] border-black px-4 py-3`}>
        {module.icon}
        <div className="text-lg font-[1000] uppercase tracking-[-0.04em]">{module.title}</div>
       </div>
       <div className="grid gap-4 p-4">
        <p className="text-sm font-bold leading-6 text-black/70">{module.body}</p>
        <div className="flex flex-wrap gap-2">
         {module.controls.map((control) => (
          <span key={control} className="rounded-[9px] border-[3px] border-black bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em]">
           {control}
          </span>
         ))}
        </div>
        <div className="grid gap-3 md:grid-cols-2">
         <div className="rounded-[12px] border-[3px] border-black bg-white p-3">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-black/45">Output</div>
          <div className="mt-1 text-xs font-black uppercase leading-5 tracking-[0.08em]">{module.outputKind}</div>
         </div>
         <div className="rounded-[12px] border-[3px] border-black bg-white p-3">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-black/45">Improves By</div>
          <div className="mt-1 text-xs font-black uppercase leading-5 tracking-[0.08em]">{module.selfImprovementSignal}</div>
         </div>
        </div>
        <div className="flex flex-wrap gap-2">
         {module.integrations.map((integration) => (
          <span key={integration} className="rounded-[9px] border-[3px] border-black bg-[#CCFF00] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em]">
           {integration}
          </span>
         ))}
        </div>
       </div>
      </article>
     ))}
    </div>
   </section>

   <section className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
    <div className="rounded-[22px] border-[4px] border-black bg-white shadow-[8px_8px_0px_0px_black]">
     <div className="border-b-[4px] border-black bg-[#CCFF00] px-6 py-5">
      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/55">
       User-Facing Brain Proxy
      </div>
      <div className="text-3xl font-[1000] uppercase tracking-[-0.05em]">
       Ultimate AI Assistant
      </div>
     </div>
     <div className="grid gap-4 p-6">
      <p className="text-sm font-bold leading-6 text-black/70">
       This assistant is the interactive face of the deeper Brain system. It should answer through Brain context, channel evidence, tool routes, and confidence boundaries instead of becoming a separate generic chatbot.
      </p>
      <div className="grid gap-3">
       {[
        "Ask channel and app strategy questions from the same Brain context.",
        "Turn accepted advice into workflow handoffs instead of loose chat.",
        "Emit user-message signals so the Brain learns what the creator is trying to do.",
       ].map((item) => (
        <div key={item} className="rounded-[14px] border-[3px] border-black bg-[#f8f7f1] px-4 py-3 text-[10px] font-black uppercase tracking-[0.14em] text-black/65">
         {item}
        </div>
       ))}
      </div>
     </div>
    </div>
    <div className="min-h-[420px] rounded-[22px] border-[4px] border-black bg-[#f8f7f1] p-5 shadow-[8px_8px_0px_0px_black]">
     <SidebarChatbot />
    </div>
   </section>

  <section className="grid gap-8 xl:grid-cols-3">
    {nextActions.map((action) => (
     <article key={action.title} className="rounded-[20px] border-[4px] border-black bg-white shadow-[7px_7px_0px_0px_black]">
      <div className={`${action.tone} flex items-center gap-3 border-b-[4px] border-black px-5 py-4`}>
       {action.icon}
       <div className="text-xl font-[1000] uppercase tracking-[-0.04em]">{action.title}</div>
      </div>
      <p className="p-5 text-sm font-bold leading-6 text-black/70">{action.body}</p>
     </article>
    ))}
  </section>

   <div className="max-sm:-mx-16 sm:mx-0">
    <SuperToolPrototypeWorkspace config={brainPrototypeConfig} />
   </div>

   <section className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
    <div className="rounded-[22px] border-[4px] border-black bg-white shadow-[8px_8px_0px_0px_black]">
     <div className="border-b-[4px] border-black bg-[#FF4FD8] px-6 py-5 text-white">
      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/70">
       Confidence Rules
      </div>
      <div className="text-3xl font-[1000] uppercase tracking-[-0.05em]">
       Evidence Boundary
      </div>
     </div>
     <div className="grid gap-3 p-5">
      {confidenceRows.map((row) => (
       <div key={row.label} className="rounded-[16px] border-[3px] border-black bg-[#f8f7f1] px-4 py-3">
        <div className="flex items-center justify-between gap-3">
         <div className="text-[10px] font-black uppercase tracking-[0.18em] text-black/55">{row.label}</div>
         <div className="rounded-[9px] border-[3px] border-black bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em]">
          {row.value}
         </div>
        </div>
        <p className="mt-2 text-xs font-bold leading-5 text-black/70">{row.body}</p>
       </div>
      ))}
     </div>
    </div>

    <div className="rounded-[22px] border-[4px] border-black bg-white shadow-[8px_8px_0px_0px_black]">
     <div className="border-b-[4px] border-black bg-[#00F0FF] px-6 py-5">
      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/55">
       Manual Brain Correction
      </div>
      <div className="text-3xl font-[1000] uppercase tracking-[-0.05em]">
       Command Note
      </div>
     </div>
     <div className="grid gap-4 p-6">
      <textarea
       value={note}
       onChange={(event) => setNote(event.target.value)}
       className="min-h-32 rounded-[16px] border-[4px] border-black bg-[#f8f7f1] p-4 text-sm font-bold leading-6 outline-none"
       placeholder="Correct a Brain assumption, add a priority, or explain what the next agent should remember."
      />
      <div className="grid gap-3 md:grid-cols-3">
       <label className="flex flex-col gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-black/60">
        Priority
        <select value={priority} onChange={(event) => setPriority(event.target.value as "low" | "medium" | "high" | "urgent")} className="h-12 rounded-[14px] border-[4px] border-black bg-white px-4 text-sm font-bold uppercase tracking-[0.08em]">
         <option value="high">High</option>
         <option value="urgent">Urgent</option>
         <option value="medium">Medium</option>
         <option value="low">Low</option>
        </select>
       </label>
       <label className="flex flex-col gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-black/60">
        Confidence
        <select value={confidence} onChange={(event) => setConfidence(event.target.value as "high" | "medium" | "low")} className="h-12 rounded-[14px] border-[4px] border-black bg-white px-4 text-sm font-bold uppercase tracking-[0.08em]">
         <option value="medium">Medium</option>
         <option value="high">High</option>
         <option value="low">Low</option>
        </select>
       </label>
       <label className="flex flex-col gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-black/60">
        Target tool
        <select value={targetToolId} onChange={(event) => setTargetToolId(event.target.value as SuperToolId)} className="h-12 rounded-[14px] border-[4px] border-black bg-white px-4 text-sm font-bold uppercase tracking-[0.08em]">
         <option value="workflow-chain-builder">Workflow Chain Builder</option>
         <option value="project-command-kanban">Project Command Kanban</option>
         <option value="creator-canvas-os">Creator Canvas OS</option>
         <option value="shorts-extraction-studio">Shorts Extraction Studio</option>
         <option value="retention-autopsy-experiment-engine">Retention Autopsy</option>
        </select>
       </label>
      </div>
      <textarea
       value={sourceEvidence}
       onChange={(event) => setSourceEvidence(event.target.value)}
       className="min-h-24 rounded-[16px] border-[4px] border-black bg-white p-4 text-sm font-bold leading-6 outline-none"
       placeholder="Source evidence, one item per line: artifact id, workflow id, metric, user correction, or doc reference"
      />
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
       <button
        type="button"
        onClick={handleSaveNote}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] border-[4px] border-black bg-[#111] px-5 text-xs font-black uppercase tracking-[0.14em] text-[#CCFF00] shadow-[5px_5px_0px_0px_black] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
       >
        <CheckCircle2 size={16} />
        Save Brain Signal
       </button>
       {status ? (
        <div className="text-[10px] font-black uppercase tracking-[0.16em] text-black/55">{status}</div>
       ) : null}
     </div>
    </div>
   </div>
  </section>

   <section className="rounded-[22px] border-[4px] border-black bg-white shadow-[8px_8px_0px_0px_black]">
    <div className="border-b-[4px] border-black bg-[#CCFF00] px-6 py-5">
     <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/55">
      Brain Command Queue
     </div>
     <div className="text-3xl font-[1000] uppercase tracking-[-0.05em]">
      Action Records
     </div>
    </div>
    <div className="flex flex-wrap gap-2 border-b-[4px] border-black bg-[#f8f7f1] px-5 py-4">
     {(["all", "assistant", "manual"] as const).map((filter) => (
      <button
       key={filter}
       type="button"
       onClick={() => setCommandFilter(filter)}
       className={`rounded-[10px] border-[3px] border-black px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] shadow-[3px_3px_0px_0px_black] ${
        commandFilter === filter ? "bg-[#111] text-[#CCFF00]" : "bg-white text-black"
       }`}
      >
       {filter}
      </button>
     ))}
    </div>
    <div className="grid gap-3 p-5 md:grid-cols-2">
     {visibleCommandActions.length ? (
      visibleCommandActions.slice(0, 6).map((action) => (
       <article key={action.id} className="rounded-[16px] border-[4px] border-black bg-[#f8f7f1] p-4">
        <div className="flex items-center justify-between gap-3">
         <div className="text-[10px] font-black uppercase tracking-[0.16em] text-black/55">
          {(action.source || "manual").toUpperCase()} · {action.priority} · {action.confidence} · {action.status}
         </div>
         <div className="rounded-[9px] border-[3px] border-black bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em]">
          {action.targetToolId}
         </div>
        </div>
        <p className="mt-3 text-sm font-bold leading-6 text-black/70">{action.assistantRequest || action.note}</p>
        <div className="mt-3 flex flex-wrap gap-2">
         {action.generationId ? (
          <span className="rounded-[9px] border-[3px] border-black bg-[#CCFF00] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em]">
           Gen {action.generationId.slice(0, 8)}
          </span>
         ) : null}
         {action.workflowId ? (
          <span className="rounded-[9px] border-[3px] border-black bg-[#00F0FF] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em]">
           Flow {action.workflowId.slice(0, 8)}
          </span>
         ) : null}
         {action.targetRoute ? (
          <a
           href={action.targetRoute}
           className="rounded-[9px] border-[3px] border-black bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] underline decoration-[2px] underline-offset-2"
          >
           Open Command
          </a>
         ) : null}
        </div>
       </article>
      ))
     ) : (
      <div className="rounded-[16px] border-[4px] border-dashed border-black/35 bg-[#f8f7f1] px-5 py-8 text-[11px] font-black uppercase tracking-[0.2em] text-black/55 md:col-span-2">
       No {commandFilter === "all" ? "Brain command" : commandFilter} actions queued yet.
      </div>
     )}
    </div>
   </section>

   <section className="rounded-[22px] border-[4px] border-black bg-[#f8f7f1] shadow-[8px_8px_0px_0px_black]">
    <div className="border-b-[4px] border-black bg-[#FFEA5A] px-6 py-5">
     <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/55">
      Agent Self-Improvement Loop
     </div>
     <div className="text-3xl font-[1000] uppercase tracking-[-0.05em]">
      Tomorrow Memory
     </div>
    </div>
    <div className="grid gap-4 p-6 md:grid-cols-5">
     {[
      { label: "Inputs Used", value: "Brain memory, generations, workflows, command notes" },
      { label: "Inferred", value: blockedWorkflows ? "Blocked chains need priority routing" : "No blocked workflow pressure detected" },
      { label: "Missing", value: "External evidence or artifact id when notes are manual" },
      { label: "Handoff", value: "Brain -> Workflow Chain -> Project Command" },
      { label: "Improve Next", value: "Promote useful command notes into durable memory candidates" },
     ].map((item) => (
      <article key={item.label} className="rounded-[16px] border-[4px] border-black bg-white p-4 shadow-[4px_4px_0px_0px_black]">
       <div className="text-[10px] font-black uppercase tracking-[0.18em] text-black/50">{item.label}</div>
       <p className="mt-2 text-xs font-black uppercase leading-5 tracking-[0.08em] text-black/75">{item.value}</p>
      </article>
     ))}
    </div>
   </section>

   <section className="rounded-[20px] border-[4px] border-black bg-[#f8f7f1] p-5 shadow-[7px_7px_0px_0px_black]">
    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.18em] text-black/60">
     <Brain size={18} />
     AI engineering guardrail
    </div>
    <p className="mt-2 text-sm font-bold leading-6 text-black/75">
     Command Center outputs should be evaluated on clarity, grounding, safety, robustness, and context budget. It should route work, expose evidence, and trigger reflection without becoming a hidden autonomous agent.
    </p>
   </section>
  </div>
 )
}

export default BrainCommandCenter
