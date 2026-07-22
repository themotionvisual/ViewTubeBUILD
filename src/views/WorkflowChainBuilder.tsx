import React, { useMemo, useState } from "react"
import { Blocks, CheckCircle2, CircleDot, Link2, Network, Plus, Workflow, XCircle } from "lucide-react"
import { AssistantCommandContextBanner } from "../components/AssistantCommandContextBanner"
import { SuperToolRail } from "../components/SuperToolRail"
import { useBrain } from "../context/useBrain"
import { listSuperTools, listSuperToolsByIds } from "../services/superToolRegistry"
import {
 attachArtifactToWorkflow,
 createWorkflowChain,
 createWorkflowStep,
 listWorkflowChains,
 updateWorkflowStep,
} from "../services/workflowEngine"
import type { SuperToolId, SuperToolSurface, WorkflowChain, WorkflowStepStatus } from "../types"
import SuperToolPrototypeWorkspace, {
 type PrototypeWorkspaceConfig,
} from "./supertools/SuperToolPrototypeWorkspace"

const WORKFLOW_TOOL_IDS = [
 "workflow-chain-builder",
 "brain-command-center",
 "project-command-kanban",
 "creator-vault-os",
] as const

const chainTemplates = [
 {
  id: "idea-to-publish",
  title: "Idea To Publish",
  goal: "Move one idea from concept to package, edit, publish, and audience follow-up.",
  steps: [
   ["Generate concept", "studio", "creator-canvas-os", "Create angle, hook, proof, and CTA."],
   ["Package the upload", "studio", "packaging-lab-pro", "Draft title, thumbnail direction, and description."],
   ["Plan production", "projects", "project-command-kanban", "Assign timeline, blockers, and publish checklist."],
   ["Build or edit scenes", "editor", "motion-scene-builder", "Create visual beats and export-ready scenes."],
   ["Review performance", "analytics", "retention-autopsy-experiment-engine", "Compare outcome against retention and traffic expectations."],
  ],
 },
 {
  id: "analytics-to-experiment",
  title: "Analytics To Experiment",
  goal: "Turn one performance problem into a measurable content experiment.",
  steps: [
   ["Diagnose signal", "analytics", "cinematic-analytics-lab", "Find the metric, segment, and affected video set."],
   ["Autopsy retention", "analytics", "retention-autopsy-experiment-engine", "Name the likely drop-off cause and evidence."],
   ["Rewrite packaging", "studio", "packaging-lab-pro", "Create alternate title, thumbnail, or hook direction."],
   ["Schedule test", "projects", "project-command-kanban", "Assign owner, date, and measurable success criteria."],
   ["Feed Brain", "brain", "brain-command-center", "Record what changed and what should be remembered."],
  ],
 },
 {
  id: "vault-to-editor",
  title: "Vault To Editor",
  goal: "Move selected reusable assets into a timeline-ready editor workflow.",
  steps: [
   ["Collect assets", "vault", "creator-vault-os", "Group media, tags, and provenance in the Vault."],
   ["Dock to timeline", "editor", "timeline-asset-vault-dock", "Expose selected files to the editor surface."],
   ["Build motion kit", "editor", "template-and-foley-forge", "Create reusable motion, sound, and template pieces."],
   ["Apply captions and FX", "editor", "caption-and-fx-pipeline", "Attach text, timing, and effect passes."],
   ["Save outputs", "vault", "creator-vault-os", "Persist exports, JSON, and reusable artifacts."],
  ],
 },
] as const

const statusTone: Record<WorkflowStepStatus, string> = {
 pending: "bg-white text-black",
 active: "bg-[#00F0FF] text-black",
 complete: "bg-[#CCFF00] text-black",
 blocked: "bg-[#FF4FD8] text-white",
 skipped: "bg-[#111] text-white",
}

const workflowModules = [
 {
  title: "Chain Templates",
  icon: <Blocks size={20} />,
  tone: "bg-[#CCFF00]",
  body: "Starts from reusable idea-to-publish, analytics-to-experiment, and vault-to-editor chains.",
  controls: ["template", "custom title", "custom goal", "primary tool"],
  outputKind: "workflow template seed",
  integrations: ["SuperTool registry", "Project Command", "Brain Command"],
  selfImprovementSignal: "records which templates create useful workflows",
 },
 {
  title: "Step Builder",
  icon: <Workflow size={20} />,
  tone: "bg-[#00F0FF]",
  body: "Creates ordered steps with owner surface, target tool, details, and status controls.",
  controls: ["step title", "surface", "tool id", "status"],
  outputKind: "ordered workflow steps",
  integrations: ["Workflow engine", "Data Transparency", "Project board"],
  selfImprovementSignal: "tracks repeated blocked or skipped steps",
 },
 {
  title: "Handoff State",
  icon: <Network size={20} />,
  tone: "bg-[#FFEA5A]",
  body: "Keeps each chain's current state, owner surface, blockers, and next receiving tool visible.",
  controls: ["active", "complete", "blocked", "skipped"],
  outputKind: "handoff state map",
  integrations: ["Brain signals", "Project Command", "Agent dispatch"],
  selfImprovementSignal: "checks whether handoffs have a clear receiver and next action",
 },
 {
  title: "Artifact Attachments",
  icon: <Link2 size={20} />,
  tone: "bg-[#FF4FD8] text-white",
  body: "Attaches generation, vault, export, or manual artifact ids so chain history stays inspectable.",
  controls: ["artifact id", "provenance", "chain id", "source"],
  outputKind: "artifact provenance link",
  integrations: ["Vault", "GenerationRecord", "VT_E1 exports"],
  selfImprovementSignal: "records when handoffs lack artifacts",
 },
 {
  title: "Blocker/Provenance Tracking",
  icon: <XCircle size={20} />,
  tone: "bg-[#111] text-white",
  body: "Captures why a step is blocked, what evidence produced the chain, and what tomorrow's agent should inspect.",
  controls: ["blocker reason", "source evidence", "next agent note", "review date"],
  outputKind: "blocker and provenance packet",
  integrations: ["Brain memory", "Daily Brief", "Workflow provenance"],
  selfImprovementSignal: "turns stalled chains into tomorrow inspection targets",
 },
]

const workflowPrototypeConfig: PrototypeWorkspaceConfig = {
 toolId: "workflow-chain-builder",
 title: "Workflow Chain Prototype",
 description: "Early chain-building layout for templates, ordered steps, artifact links, blockers, provenance, and next-agent notes.",
 lanes: [
  { id: "chain-template-builder", title: "Chain Template Builder", description: "Reusable chain starts", tone: "bg-[#CCFF00]" },
  { id: "step-lane", title: "Step Lane", description: "Ordered tool handoffs", tone: "bg-[#00F0FF]" },
  { id: "artifact-drawer", title: "Artifact Drawer", description: "Generation, vault, export ids", tone: "bg-[#FFEA5A]" },
  { id: "blocker-provenance", title: "Blocker/Provenance Tracker", description: "Why work stopped and what to inspect", tone: "bg-[#FF4FD8] text-white" },
 ],
 cards: [
  {
   id: "template-idea-to-publish",
   laneId: "chain-template-builder",
   title: "Idea-to-publish template",
   summary: "Start from concept, package, project, editor, analytics, and Brain review.",
   status: "active",
   priority: "high",
   chips: ["template", "publish"],
   controls: ["custom title", "primary tool"],
   output: "workflow template seed",
   integrations: ["SuperTool registry"],
   handoffTarget: "Step Lane",
  },
  {
   id: "step-packaging",
   laneId: "step-lane",
   title: "Packaging step",
   summary: "Route title, thumbnail, and description decisions into the chain.",
   status: "queued",
   priority: "medium",
   chips: ["studio", "packaging"],
   controls: ["status", "tool id"],
   output: "ordered workflow step",
   integrations: ["Project board"],
   handoffTarget: "Artifact Drawer",
  },
  {
   id: "artifact-generation",
   laneId: "artifact-drawer",
   title: "Generation artifact link",
   summary: "Attach packet, Vault asset, render export, or manual artifact id.",
   status: "ready",
   priority: "high",
   chips: ["artifact id", "provenance"],
   controls: ["chain id", "source"],
   output: "artifact provenance link",
   integrations: ["Vault", "GenerationRecord"],
   handoffTarget: "Blocker/Provenance Tracker",
  },
  {
   id: "blocker-agent-note",
   laneId: "blocker-provenance",
   title: "Next-agent blocker note",
   summary: "Record blocker reason, source evidence, review date, and tomorrow inspection target.",
   status: "blocked",
   priority: "urgent",
   blocker: "Missing owner or source artifact",
   chips: ["blocker reason", "next agent note"],
   controls: ["source evidence", "review date"],
   output: "blocker and provenance packet",
   integrations: ["Brain memory", "Daily Brief"],
   handoffTarget: "Brain Command",
  },
 ],
 controls: ["choose template", "move step", "attach artifact", "mark blocked"],
 evidence: ["template id", "artifact id", "blocker reason", "next agent note"],
 handoffTargets: ["Brain Command", "Project Command", "Vault"],
}

interface WorkflowChainBuilderProps {
 embedded?: boolean
}

const WorkflowChainBuilder: React.FC<WorkflowChainBuilderProps> = ({ embedded = false }) => {
 const { emitSignal } = useBrain()
 const [selectedTemplateId, setSelectedTemplateId] = useState<string>(chainTemplates[0].id)
 const [customTitle, setCustomTitle] = useState("")
 const [customGoal, setCustomGoal] = useState("")
 const [artifactId, setArtifactId] = useState("")
 const [blockerReason, setBlockerReason] = useState("")
 const [nextAgentNote, setNextAgentNote] = useState("")
 const [selectedChainId, setSelectedChainId] = useState<string | null>(null)
 const [refreshTick, setRefreshTick] = useState(0)
 const [status, setStatus] = useState<string | null>(null)

 const workflows = useMemo(() => listWorkflowChains(), [refreshTick])
 const superTools = useMemo(() => listSuperTools(), [])
 const railTools = useMemo(() => listSuperToolsByIds([...WORKFLOW_TOOL_IDS]), [])
 const selectedTemplate = chainTemplates.find((template) => template.id === selectedTemplateId) || chainTemplates[0]
 const selectedChain = workflows.find((workflow) => workflow.id === selectedChainId) || workflows[0] || null

 const surfaceCounts = workflows.reduce<Record<string, number>>((acc, workflow) => {
  workflow.steps.forEach((step) => {
   acc[step.ownerSurface] = (acc[step.ownerSurface] || 0) + 1
  })
  return acc
 }, {})

 const handleCreateChain = async () => {
  const title = customTitle.trim() || selectedTemplate.title
  const goal = customGoal.trim() || selectedTemplate.goal
  const steps = selectedTemplate.steps.map(([stepTitle, surface, toolId, details]) =>
   createWorkflowStep(
    stepTitle,
    surface as SuperToolSurface,
    toolId as SuperToolId,
    details,
   ),
  )
  const chain = createWorkflowChain({
   title,
   goal,
   primaryToolId: "workflow-chain-builder",
   steps,
   provenance: [`workflow-chain-builder.template.${selectedTemplate.id}`],
  })
  await emitSignal("WORKFLOW_CHAIN_BUILDER", "CHAIN_CREATED", {
   chainId: chain.id,
   title: chain.title,
   templateId: selectedTemplate.id,
   steps: chain.steps.length,
   selfImprovement: {
    inputsUsed: ["template", customTitle.trim() ? "custom title" : null, customGoal.trim() ? "custom goal" : null].filter(Boolean),
    inferred: `Created ${selectedTemplate.title} chain with ${chain.steps.length} steps.`,
    missing: ["artifact attachments are optional until outputs exist"],
    handedOffTo: chain.steps.map((step) => `${step.ownerSurface}:${step.toolId}`),
    improveNext: workflowModules.map((module) => module.selfImprovementSignal),
   },
  })
  setSelectedChainId(chain.id)
  setCustomTitle("")
  setCustomGoal("")
  setStatus(`Created workflow: ${chain.title}`)
  setRefreshTick((value) => value + 1)
 }

 const handleStepStatus = async (chain: WorkflowChain, stepId: string, nextStatus: WorkflowStepStatus) => {
  const selectedStep = chain.steps.find((step) => step.id === stepId)
  const blockerDetails =
   nextStatus === "blocked" ?
    [
     selectedStep?.details || "",
     blockerReason.trim() ? `Blocker: ${blockerReason.trim()}` : "Blocker: reason not specified",
     nextAgentNote.trim() ? `Next agent note: ${nextAgentNote.trim()}` : "Next agent note: not specified",
    ]
     .filter(Boolean)
     .join("\n")
   : undefined
  const updated = updateWorkflowStep(chain.id, stepId, nextStatus, blockerDetails)
  if (!updated) return
  await emitSignal("WORKFLOW_CHAIN_BUILDER", "STEP_STATUS_CHANGED", {
   chainId: chain.id,
   stepId,
   nextStatus,
   blockerReason: nextStatus === "blocked" ? blockerReason.trim() : null,
   nextAgentNote: nextStatus === "blocked" ? nextAgentNote.trim() : null,
  })
  setSelectedChainId(chain.id)
  setStatus(`Step marked ${nextStatus}.`)
  if (nextStatus === "blocked") {
   setBlockerReason("")
   setNextAgentNote("")
  }
  setRefreshTick((value) => value + 1)
 }

 const handleAttachArtifact = async () => {
  if (!selectedChain || !artifactId.trim()) return
  const updated = attachArtifactToWorkflow(
   selectedChain.id,
   artifactId.trim(),
   `workflow-chain-builder.manual-artifact.${artifactId.trim()}`,
  )
  if (!updated) return
  await emitSignal("WORKFLOW_CHAIN_BUILDER", "ARTIFACT_ATTACHED", {
   chainId: selectedChain.id,
   artifactId: artifactId.trim(),
  })
  setArtifactId("")
  setStatus("Artifact attached to selected workflow.")
  setRefreshTick((value) => value + 1)
 }

 return (
  <div className="mx-auto flex max-w-[1600px] flex-col gap-8 pb-24">
   <AssistantCommandContextBanner targetToolId="workflow-chain-builder" />
   {!embedded ? (
    <>
     <section className="rounded-[24px] border-[5px] border-black bg-[#111] px-8 py-8 text-white shadow-[12px_12px_0px_0px_#00F0FF]">
      <div className="text-[11px] font-black uppercase tracking-[0.35em] text-[#CCFF00]">
       Super-Tool 15
      </div>
      <h1 className="mt-3 text-5xl font-[1000] uppercase leading-none tracking-[-0.06em] md:text-6xl">
       Workflow Chain Builder
      </h1>
      <p className="mt-4 max-w-4xl text-sm font-bold uppercase tracking-[0.12em] text-white/70">
       Resumable creator workflows with explicit handoffs, blockers, provenance, artifacts, and Brain feedback.
      </p>
     </section>

     <SuperToolRail
      title="Workflow Glue Layer"
      subtitle="Idea, analytics, vault, editor, publish, and follow-up chains"
      tools={railTools}
      accentClassName="bg-[#00F0FF]"
      note="Workflow Chain Builder owns handoffs and progress. It should reuse sibling tools rather than becoming a shadow version of them."
     />
    </>
   ) : null}

   <section className="rounded-[22px] border-[4px] border-black bg-white shadow-[8px_8px_0px_0px_black]">
    <div className="border-b-[4px] border-black bg-[#00F0FF] px-6 py-5">
     <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/55">
      Toolbox Modules
     </div>
     <div className="text-3xl font-[1000] uppercase tracking-[-0.05em]">
      Workflow Construction
     </div>
    </div>
    <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
     {workflowModules.map((module) => (
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

   <div className="max-sm:-mx-16 sm:mx-0">
    <SuperToolPrototypeWorkspace config={workflowPrototypeConfig} />
   </div>

   <section className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
    <div className="rounded-[22px] border-[4px] border-black bg-white shadow-[8px_8px_0px_0px_black]">
     <div className="border-b-[4px] border-black bg-[#CCFF00] px-6 py-5">
      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/55">
       Chain Factory
      </div>
      <div className="text-3xl font-[1000] uppercase tracking-[-0.05em]">
       Create Workflow
      </div>
     </div>
     <div className="grid gap-4 p-6">
      <label className="flex flex-col gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-black/60">
       Template
       <select
        value={selectedTemplateId}
        onChange={(event) => setSelectedTemplateId(event.target.value)}
        className="h-12 rounded-[14px] border-[4px] border-black bg-white px-4 text-sm font-bold uppercase tracking-[0.08em] text-black"
       >
        {chainTemplates.map((template) => (
         <option key={template.id} value={template.id}>
          {template.title}
         </option>
        ))}
       </select>
      </label>
      <label className="flex flex-col gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-black/60">
       Custom title
       <input
        value={customTitle}
        onChange={(event) => setCustomTitle(event.target.value)}
        className="h-12 rounded-[14px] border-[4px] border-black bg-white px-4 text-sm font-bold uppercase tracking-[0.08em] text-black"
        placeholder={selectedTemplate.title}
       />
      </label>
      <label className="flex flex-col gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-black/60">
       Custom goal
       <textarea
        value={customGoal}
        onChange={(event) => setCustomGoal(event.target.value)}
        className="min-h-28 rounded-[14px] border-[4px] border-black bg-white px-4 py-3 text-sm font-bold leading-6 text-black"
        placeholder={selectedTemplate.goal}
       />
      </label>
      <div className="rounded-[16px] border-[4px] border-black bg-[#f8f7f1] p-4">
       <div className="text-[10px] font-black uppercase tracking-[0.18em] text-black/55">
        Template steps
       </div>
       <div className="mt-3 grid gap-2">
        {selectedTemplate.steps.map((step) => {
         const [title, surface, toolId] = step
         return (
          <div key={`${title}-${toolId}`} className="flex items-center justify-between gap-3 rounded-[12px] border-[3px] border-black bg-white px-3 py-2">
           <span className="text-xs font-black uppercase tracking-[0.08em]">{title}</span>
           <span className="text-[10px] font-black uppercase tracking-[0.14em] text-black/50">
            {surface} · {toolId}
           </span>
          </div>
         )
        })}
       </div>
      </div>
      <button
       type="button"
       onClick={handleCreateChain}
       className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] border-[4px] border-black bg-[#FF4FD8] px-5 text-xs font-black uppercase tracking-[0.14em] text-white shadow-[5px_5px_0px_0px_black] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
      >
       <Plus size={16} />
       Create Chain
      </button>
      {status ? (
       <div className="rounded-[14px] border-[3px] border-black bg-[#FFEA5A] px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-black/70">
        {status}
       </div>
      ) : null}
     </div>
    </div>

    <div className="grid gap-8">
     <div className="rounded-[22px] border-[4px] border-black bg-[#111] text-white shadow-[8px_8px_0px_0px_#CCFF00]">
      <div className="border-b-[4px] border-black bg-[#00F0FF] px-6 py-5 text-black">
       <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/55">
        Chain Coverage
       </div>
       <div className="text-3xl font-[1000] uppercase tracking-[-0.05em]">
        Workflow Map
       </div>
      </div>
      <div className="grid gap-4 p-6 md:grid-cols-3">
       {[
        { label: "Chains", value: workflows.length, icon: <Workflow size={18} /> },
        { label: "Tools", value: superTools.length, icon: <Blocks size={18} /> },
        { label: "Surfaces", value: Object.keys(surfaceCounts).length, icon: <Network size={18} /> },
       ].map((metric) => (
        <div key={metric.label} className="rounded-[16px] border-[4px] border-white/20 bg-black/40 px-5 py-4">
         <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/55">
          {metric.icon}
          {metric.label}
         </div>
         <div className="mt-2 text-4xl font-[1000] leading-none tracking-[-0.04em] text-[#CCFF00]">
          {metric.value}
         </div>
        </div>
       ))}
      </div>
     </div>

     <div className="rounded-[22px] border-[4px] border-black bg-white shadow-[8px_8px_0px_0px_black]">
      <div className="border-b-[4px] border-black bg-[#FFEA5A] px-6 py-5">
       <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/55">
        Artifact Provenance
       </div>
       <div className="text-2xl font-[1000] uppercase tracking-[-0.04em]">
        Attach Output
       </div>
      </div>
      <div className="grid gap-3 p-5 md:grid-cols-[1fr_auto]">
       <input
        value={artifactId}
        onChange={(event) => setArtifactId(event.target.value)}
        className="h-12 rounded-[14px] border-[4px] border-black bg-white px-4 text-sm font-bold text-black"
        placeholder="Paste generation, vault, or export artifact id"
       />
       <button
        type="button"
        onClick={handleAttachArtifact}
        disabled={!selectedChain}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] border-[4px] border-black bg-[#111] px-5 text-xs font-black uppercase tracking-[0.14em] text-[#CCFF00] shadow-[5px_5px_0px_0px_black] disabled:opacity-50"
       >
        <Link2 size={16} />
        Attach
       </button>
      </div>
      <div className="border-t-[4px] border-black p-5">
       <div className="text-[10px] font-black uppercase tracking-[0.18em] text-black/55">
        Selected chain artifacts
       </div>
       <div className="mt-3 flex flex-wrap gap-2">
        {selectedChain?.artifactIds?.length ? (
         selectedChain.artifactIds.map((id) => (
          <span key={id} className="rounded-[9px] border-[3px] border-black bg-[#f8f7f1] px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em]">
           {id}
          </span>
         ))
        ) : (
         <span className="rounded-[9px] border-[3px] border-dashed border-black/35 bg-[#f8f7f1] px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-black/50">
          No artifact ids attached yet.
         </span>
        )}
       </div>
      </div>
     </div>
    </div>
   </section>

   <section className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
    <div className="rounded-[22px] border-[4px] border-black bg-white shadow-[8px_8px_0px_0px_black]">
     <div className="border-b-[4px] border-black bg-[#FF4FD8] px-6 py-5 text-white">
      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/70">
       Saved Chains
      </div>
      <div className="text-3xl font-[1000] uppercase tracking-[-0.05em]">
       Select Chain
      </div>
     </div>
     <div className="grid gap-3 p-5">
      {workflows.length ?
       workflows.map((workflow) => (
        <button
         key={workflow.id}
         type="button"
         onClick={() => setSelectedChainId(workflow.id)}
         className={`rounded-[16px] border-[4px] border-black px-4 py-3 text-left transition-transform hover:translate-x-1 ${
          selectedChain?.id === workflow.id ? "bg-[#CCFF00]" : "bg-[#f8f7f1]"
         }`}
        >
         <div className="flex items-center justify-between gap-3">
          <div className="text-lg font-[1000] uppercase tracking-[-0.03em]">{workflow.title}</div>
          <div className={`rounded-[9px] border-[3px] border-black px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${statusTone[workflow.status]}`}>
           {workflow.status}
          </div>
         </div>
         <p className="mt-2 text-xs font-bold leading-5 text-black/65">{workflow.goal}</p>
        </button>
       ))
      : (
       <div className="rounded-[16px] border-[4px] border-dashed border-black/35 bg-[#f8f7f1] px-5 py-8 text-center text-[11px] font-black uppercase tracking-[0.2em] text-black/55">
        No workflow chains yet. Create one from a template above.
       </div>
      )}
     </div>
    </div>

    <div className="rounded-[22px] border-[4px] border-black bg-white shadow-[8px_8px_0px_0px_black]">
     <div className="border-b-[4px] border-black bg-[#CCFF00] px-6 py-5">
      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/55">
       Chain Execution
      </div>
      <div className="text-3xl font-[1000] uppercase tracking-[-0.05em]">
       Step Controls
      </div>
     </div>
     <div className="grid gap-4 p-5">
      {selectedChain ? (
       <div className="grid gap-3 rounded-[16px] border-[4px] border-black bg-[#FFEA5A] p-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-black/60">
         Blocker reason
         <textarea
          value={blockerReason}
          onChange={(event) => setBlockerReason(event.target.value)}
          className="min-h-24 rounded-[14px] border-[4px] border-black bg-white px-4 py-3 text-sm font-bold leading-6"
          placeholder="What is blocking this step?"
         />
        </label>
        <label className="flex flex-col gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-black/60">
         Next agent note
         <textarea
          value={nextAgentNote}
          onChange={(event) => setNextAgentNote(event.target.value)}
          className="min-h-24 rounded-[14px] border-[4px] border-black bg-white px-4 py-3 text-sm font-bold leading-6"
          placeholder="What should the next agent inspect or do?"
         />
        </label>
       </div>
      ) : null}
      {selectedChain ?
       selectedChain.steps.map((step, index) => (
        <article key={step.id} className="rounded-[16px] border-[4px] border-black bg-[#f8f7f1]">
         <div className="flex flex-col gap-3 border-b-[3px] border-black bg-white px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div>
           <div className="text-[10px] font-black uppercase tracking-[0.18em] text-black/55">
            Step {index + 1} · {step.ownerSurface} · {step.toolId || "manual"}
           </div>
           <div className="mt-1 text-xl font-[1000] uppercase tracking-[-0.04em]">{step.title}</div>
          </div>
          <div className={`rounded-[9px] border-[3px] border-black px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${statusTone[step.status]}`}>
           {step.status}
          </div>
         </div>
         <div className="grid gap-3 p-4">
          <p className="text-sm font-bold leading-6 text-black/70">{step.details}</p>
          <div className="flex flex-wrap gap-2">
           {[
            ["active", <CircleDot size={14} />],
            ["complete", <CheckCircle2 size={14} />],
            ["blocked", <XCircle size={14} />],
            ["skipped", <XCircle size={14} />],
           ].map(([nextStatus, icon]) => (
            <button
             key={nextStatus as string}
             type="button"
             onClick={() => handleStepStatus(selectedChain, step.id, nextStatus as WorkflowStepStatus)}
             className="inline-flex h-10 items-center gap-2 rounded-[12px] border-[3px] border-black bg-white px-3 text-[10px] font-black uppercase tracking-[0.14em] shadow-[3px_3px_0px_0px_black] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
             {icon}
             {nextStatus as string}
            </button>
           ))}
          </div>
         </div>
        </article>
       ))
      : (
       <div className="rounded-[16px] border-[4px] border-dashed border-black/35 bg-[#f8f7f1] px-5 py-8 text-center text-[11px] font-black uppercase tracking-[0.2em] text-black/55">
        Select or create a workflow chain to control steps.
       </div>
      )}
    </div>
   </div>
  </section>

   <section className="rounded-[22px] border-[4px] border-black bg-[#f8f7f1] shadow-[8px_8px_0px_0px_black]">
    <div className="border-b-[4px] border-black bg-[#FFEA5A] px-6 py-5">
     <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/55">
      Agent Self-Improvement Loop
     </div>
     <div className="text-3xl font-[1000] uppercase tracking-[-0.05em]">
      Chain Provenance and Tomorrow Notes
     </div>
    </div>
    <div className="grid gap-4 p-6 md:grid-cols-5">
     {[
      { label: "Inputs Used", value: selectedTemplate.title },
      { label: "Inferred", value: selectedChain ? `${selectedChain.title} has ${selectedChain.steps.length} steps` : "No chain selected" },
      { label: "Missing", value: selectedChain?.artifactIds?.length ? "No missing artifact link detected" : "Attach artifact ids when outputs exist" },
      { label: "Handoff", value: selectedChain?.steps.map((step) => step.toolId || step.ownerSurface).join(" -> ") || "No handoff chain selected" },
      { label: "Improve Next", value: "Review blocked steps and artifactless handoffs tomorrow" },
     ].map((item) => (
      <article key={item.label} className="rounded-[16px] border-[4px] border-black bg-white p-4 shadow-[4px_4px_0px_0px_black]">
       <div className="text-[10px] font-black uppercase tracking-[0.18em] text-black/50">{item.label}</div>
       <p className="mt-2 text-xs font-black uppercase leading-5 tracking-[0.08em] text-black/75">{item.value}</p>
      </article>
     ))}
    </div>
   </section>
  </div>
 )
}

export default WorkflowChainBuilder
