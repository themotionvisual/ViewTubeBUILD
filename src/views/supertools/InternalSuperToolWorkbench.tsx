import React, { useMemo, useState } from "react"
import type { LucideIcon } from "lucide-react"
import { CheckCircle2, Database, Sparkles, Workflow } from "lucide-react"
import { AssistantCommandContextBanner } from "../../components/AssistantCommandContextBanner"
import { SuperToolRail } from "../../components/SuperToolRail"
import { useBrain } from "../../context/useBrain"
import {
 createGenerationRecord,
 listGenerationRecords,
 updateGenerationRecord,
} from "../../services/generationStore"
import { listSuperToolsByIds } from "../../services/superToolRegistry"
import { ingestGenerationArtifacts } from "../../services/vaultAdapter"
import {
 createWorkflowChain,
 createWorkflowStep,
 listWorkflowChains,
} from "../../services/workflowEngine"
import type {
 GenerationArtifact,
 SuperToolId,
 SuperToolSurface,
} from "../../types"
import SuperToolPrototypeWorkspace, {
 type PrototypeWorkspaceConfig,
} from "./SuperToolPrototypeWorkspace"

type ToolModuleCard = {
 id?: string
 title: string
 body: string
 purpose?: string
 controls?: string[]
 outputKind?: string
 integrations?: string[]
 selfImprovementSignal?: string
 tone: string
 icon: LucideIcon
}

type ToolMode = {
 id: string
 label: string
 description: string
}

type ToolMetricCard = {
 label: string
 value: string
 icon: LucideIcon
 tone: string
}

type WorkflowSeed = {
 title: string
 surface: SuperToolSurface
 toolId: SuperToolId
 details: string
}

export interface InternalWorkbenchConfig {
 toolId: SuperToolId
 toolNumber: string
 title: string
 subtitle: string
 railTitle: string
 railSubtitle: string
 railNote: string
 accentClassName: string
 heroShadowClassName: string
 modeLabel: string
 sourceLabel: string
 sourcePlaceholder: string
 objectiveLabel: string
 objectivePlaceholder: string
 notesLabel: string
 notesPlaceholder: string
 modules: ToolModuleCard[]
 prototype?: PrototypeWorkspaceConfig
 modes: ToolMode[]
 metrics: ToolMetricCard[]
 sisterToolIds: SuperToolId[]
 outputLanes: Array<{ label: string; value: string }>
 buildPacket: (input: {
  source: string
  objective: string
  notes: string
  mode: ToolMode
  brainContext: any
  workflowCount: number
 }) => {
  title: string
  summary: string
  packet: Record<string, unknown>
  workflowTitle: string
  workflowGoal: string
  workflowSteps: WorkflowSeed[]
 }
}

interface InternalSuperToolWorkbenchProps {
 config: InternalWorkbenchConfig
 embedded?: boolean
 children?: React.ReactNode
}

const buildArtifact = (
 recordId: string,
 title: string,
 packet: Record<string, unknown>,
): GenerationArtifact => ({
 id: crypto.randomUUID(),
 kind: "json",
 label: `${title} packet`,
 sourceRecordId: recordId,
 metadata: packet,
})

const buildSelfImprovementTrail = (
 modules: ToolModuleCard[],
 input: {
  source: string
  objective: string
  notes: string
  sourceLabel: string
  objectiveLabel: string
  notesLabel: string
 },
 built: ReturnType<InternalWorkbenchConfig["buildPacket"]>,
) => ({
 inputsUsed: [
  input.source ? input.sourceLabel : null,
  input.objective ? input.objectiveLabel : null,
  input.notes ? input.notesLabel : null,
 ].filter(Boolean),
 inferred: built.summary,
 missing: [
  input.source ? null : input.sourceLabel,
  input.objective ? null : input.objectiveLabel,
  input.notes ? null : input.notesLabel,
 ].filter(Boolean),
 handedOffTo: built.workflowSteps.map((step) => `${step.surface}:${step.toolId}`),
 improveNext: modules
  .map((module) => module.selfImprovementSignal)
  .filter(Boolean)
  .slice(0, 6),
})

const ClaritySectionHeader: React.FC<{
 kicker: string
 title: string
 body: string
 tone?: string
}> = ({ kicker, title, body, tone = "bg-white" }) => (
 <div className={`rounded-[18px] border-[4px] border-black ${tone} p-5 shadow-[5px_5px_0px_0px_black]`}>
  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/50">
   {kicker}
  </div>
  <div className="mt-1 text-3xl font-[1000] uppercase leading-none tracking-[-0.05em]">
   {title}
  </div>
  <p className="mt-2 max-w-4xl text-sm font-bold leading-6 text-black/70">
   {body}
  </p>
 </div>
)

const InternalSuperToolWorkbench: React.FC<InternalSuperToolWorkbenchProps> = ({
 config,
 embedded = false,
 children,
}) => {
 const { consultBrain, emitSignal } = useBrain()
 const [selectedModeId, setSelectedModeId] = useState(config.modes[0]?.id || "")
 const [source, setSource] = useState("")
 const [objective, setObjective] = useState("")
 const [notes, setNotes] = useState("")
 const [status, setStatus] = useState<string | null>(null)
 const [refreshTick, setRefreshTick] = useState(0)
 const [latestChainId, setLatestChainId] = useState<string | null>(null)

 const tools = useMemo(() => listSuperToolsByIds(config.sisterToolIds), [config.sisterToolIds])
 const generations = useMemo(
  () => listGenerationRecords().filter((record) => record.toolId === config.toolId),
  [refreshTick, config.toolId],
 )
 const workflows = useMemo(
  () => listWorkflowChains().filter((chain) => chain.primaryToolId === config.toolId),
  [refreshTick, config.toolId],
 )
 const selectedMode =
  config.modes.find((mode) => mode.id === selectedModeId) || config.modes[0]
 const latestWorkflow =
  workflows.find((chain) => chain.id === latestChainId) || workflows[0] || null
 const latestGeneration = generations[0] || null

 const handleCreatePacket = async () => {
  setStatus("Consulting Brain and building persisted super-tool packet...")
  const brainContext = await consultBrain(config.toolId, {
   source,
   objective,
   notes,
   mode: selectedMode.id,
  }).catch(() => null)

  const built = config.buildPacket({
   source: source.trim(),
   objective: objective.trim(),
   notes: notes.trim(),
   mode: selectedMode,
   brainContext,
   workflowCount: workflows.length,
  })
  const selfImprovement = buildSelfImprovementTrail(
   config.modules,
   {
    source: source.trim(),
    objective: objective.trim(),
    notes: notes.trim(),
    sourceLabel: config.sourceLabel,
    objectiveLabel: config.objectiveLabel,
    notesLabel: config.notesLabel,
   },
   built,
  )
  const outputPacket = {
   ...built.packet,
   selfImprovement,
  }

  const record = createGenerationRecord({
   toolId: config.toolId,
   provider: "mock",
   model: "viewtube-supertool-shell-v1",
   prompt: JSON.stringify({
    source: source.trim(),
    objective: objective.trim(),
    notes: notes.trim(),
    mode: selectedMode.id,
   }),
   status: "running",
   artifacts: [],
   metadata: {
    source: source.trim(),
    objective: objective.trim(),
    mode: selectedMode.id,
    selfImprovement,
   },
  })

  const artifact = buildArtifact(record.id, config.title, outputPacket)
  updateGenerationRecord(record.id, {
   status: "complete",
   outputText: built.summary,
   outputJson: outputPacket,
   artifacts: [artifact],
   usage: {
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
   },
   estimatedCostCents: 0,
  })

  ingestGenerationArtifacts([artifact], {
   toolId: config.toolId,
   generationId: record.id,
   tags: [config.toolId, selectedMode.id, "internal-super-tool"],
  })

  const chain = createWorkflowChain({
   title: built.workflowTitle,
   goal: built.workflowGoal,
   primaryToolId: config.toolId,
   steps: built.workflowSteps.map((step) =>
    createWorkflowStep(step.title, step.surface, step.toolId, step.details),
   ),
   provenance: [
    `${config.toolId}.internal-workbench.${selectedMode.id}`,
    ...selfImprovement.handedOffTo,
   ],
  })

  await emitSignal(config.toolId, "INTERNAL_PACKET_CREATED", {
   generationId: record.id,
   workflowId: chain.id,
   mode: selectedMode.id,
   source: source.trim(),
   objective: objective.trim(),
   selfImprovement,
  })

  setLatestChainId(chain.id)
  setRefreshTick((value) => value + 1)
  setStatus(`${config.title} packet saved, vault artifact created, and workflow chain queued.`)
 }

 return (
  <div className="mx-auto flex max-w-[1600px] flex-col gap-8 pb-24">
   <AssistantCommandContextBanner targetToolId={config.toolId} />
   {!embedded ? (
    <>
     <section
      className={`rounded-[24px] border-[5px] border-black bg-[#111] px-8 py-8 text-white ${config.heroShadowClassName}`}
     >
      <div className="text-[11px] font-black uppercase tracking-[0.35em] text-[#CCFF00]">
       Super-Tool {config.toolNumber}
      </div>
      <h1 className="mt-3 text-5xl font-[1000] uppercase leading-none tracking-[-0.06em] md:text-6xl">
       {config.title}
      </h1>
      <p className="mt-4 max-w-4xl text-sm font-bold uppercase tracking-[0.12em] text-white/70">
       {config.subtitle}
      </p>
     </section>

     <SuperToolRail
      title={config.railTitle}
      subtitle={config.railSubtitle}
      tools={tools}
      accentClassName={config.accentClassName}
      note={config.railNote}
     />
    </>
   ) : null}

   <ClaritySectionHeader
    kicker="Overview"
    title="What This Tool Does"
    body={config.subtitle}
    tone="bg-white"
   />

   <section className="grid gap-8 xl:grid-cols-4">
    {config.metrics.map((metric) => (
     <article
      key={metric.label}
      className="rounded-[20px] border-[4px] border-black bg-white shadow-[7px_7px_0px_0px_black]"
     >
      <div className={`${metric.tone} flex items-center gap-3 border-b-[4px] border-black px-5 py-4`}>
       <metric.icon size={18} />
       <div className="text-[10px] font-black uppercase tracking-[0.18em]">
        {metric.label}
       </div>
      </div>
      <div className="px-5 py-4 text-lg font-[1000] uppercase leading-tight tracking-[-0.04em]">
       {metric.value}
      </div>
     </article>
    ))}
   </section>

   <ClaritySectionHeader
    kicker="Builder Map"
    title="Core Modules And Save Path"
    body="These cards explain the tool's functional modules and the builder action that saves a GenerationRecord, Vault artifact, WorkflowChain, and Brain signal."
    tone="bg-[#CCFF00]"
   />

   <section className="grid gap-8 xl:grid-cols-[1fr_0.9fr]">
    <div className="rounded-[22px] border-[4px] border-black bg-white shadow-[8px_8px_0px_0px_black]">
     <div className={`border-b-[4px] border-black px-6 py-5 ${config.accentClassName}`}>
      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/55">
       Sub-Toolboxes
      </div>
      <div className="text-3xl font-[1000] uppercase tracking-[-0.05em]">
       Core Modules
      </div>
     </div>
     <div className="grid gap-4 p-6 md:grid-cols-2">
      {config.modules.map((module) => (
       <article
        key={module.id || module.title}
        className="rounded-[18px] border-[4px] border-black bg-[#f8f7f1] shadow-[5px_5px_0px_0px_black]"
       >
        <div className={`${module.tone} flex items-center gap-3 border-b-[4px] border-black px-4 py-3`}>
         <module.icon size={20} />
         <div className="text-lg font-[1000] uppercase tracking-[-0.04em]">
          {module.title}
         </div>
        </div>
        <div className="grid gap-4 p-4">
         <p className="text-sm font-bold leading-6 text-black/70">
          {module.purpose || module.body}
         </p>
         {module.controls?.length ? (
          <div>
           <div className="text-[10px] font-black uppercase tracking-[0.18em] text-black/50">
            Controls
           </div>
           <div className="mt-2 flex flex-wrap gap-2">
            {module.controls.map((control) => (
             <span
              key={control}
              className="rounded-[9px] border-[3px] border-black bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em]"
             >
              {control}
             </span>
            ))}
           </div>
          </div>
         ) : null}
         <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-[12px] border-[3px] border-black bg-white p-3">
           <div className="text-[10px] font-black uppercase tracking-[0.16em] text-black/45">
            Output
           </div>
           <div className="mt-1 text-xs font-black uppercase leading-5 tracking-[0.08em]">
            {module.outputKind || module.body}
           </div>
          </div>
          <div className="rounded-[12px] border-[3px] border-black bg-white p-3">
           <div className="text-[10px] font-black uppercase tracking-[0.16em] text-black/45">
            Improves By
           </div>
           <div className="mt-1 text-xs font-black uppercase leading-5 tracking-[0.08em]">
            {module.selfImprovementSignal || "Records missing inputs and handoff clarity."}
           </div>
          </div>
         </div>
         {module.integrations?.length ? (
          <div>
           <div className="text-[10px] font-black uppercase tracking-[0.18em] text-black/50">
            Integrations
           </div>
           <div className="mt-2 flex flex-wrap gap-2">
            {module.integrations.map((integration) => (
             <span
              key={integration}
              className="rounded-[9px] border-[3px] border-black bg-[#CCFF00] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em]"
             >
              {integration}
             </span>
            ))}
           </div>
          </div>
         ) : null}
        </div>
       </article>
      ))}
     </div>
    </div>

    <div className="rounded-[22px] border-[4px] border-black bg-white shadow-[8px_8px_0px_0px_black]">
     <div className="border-b-[4px] border-black bg-[#111] px-6 py-5 text-white">
      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/60">
       Evidence + Save Path
      </div>
      <div className="text-3xl font-[1000] uppercase tracking-[-0.05em]">
       Save Builder Packet
      </div>
     </div>
     <div className="grid gap-4 p-6">
      <label className="flex flex-col gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-black/60">
       {config.modeLabel}
       <select
        value={selectedMode.id}
        onChange={(event) => setSelectedModeId(event.target.value)}
        className="h-12 rounded-[14px] border-[4px] border-black bg-white px-4 text-sm font-bold uppercase tracking-[0.08em] text-black"
       >
        {config.modes.map((mode) => (
         <option key={mode.id} value={mode.id}>
          {mode.label}
         </option>
        ))}
       </select>
      </label>

      <div className="rounded-[16px] border-[4px] border-black bg-[#f8f7f1] p-4">
       <div className="text-[10px] font-black uppercase tracking-[0.18em] text-black/55">
        Active mode
       </div>
       <div className="mt-1 text-2xl font-[1000] uppercase tracking-[-0.05em]">
        {selectedMode.label}
       </div>
       <p className="mt-2 text-sm font-bold leading-6 text-black/70">
        {selectedMode.description}
       </p>
      </div>

      <label className="flex flex-col gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-black/60">
       {config.sourceLabel}
       <input
        value={source}
        onChange={(event) => setSource(event.target.value)}
        className="h-12 rounded-[14px] border-[4px] border-black bg-white px-4 text-sm font-bold text-black"
        placeholder={config.sourcePlaceholder}
       />
      </label>

      <label className="flex flex-col gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-black/60">
       {config.objectiveLabel}
       <input
        value={objective}
        onChange={(event) => setObjective(event.target.value)}
        className="h-12 rounded-[14px] border-[4px] border-black bg-white px-4 text-sm font-bold text-black"
        placeholder={config.objectivePlaceholder}
       />
      </label>

      <label className="flex flex-col gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-black/60">
       {config.notesLabel}
       <textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        className="min-h-28 rounded-[14px] border-[4px] border-black bg-white px-4 py-3 text-sm font-bold leading-6 text-black"
        placeholder={config.notesPlaceholder}
       />
      </label>

      <button
       type="button"
       onClick={handleCreatePacket}
       className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] border-[4px] border-black bg-[#FF4FD8] px-5 text-xs font-black uppercase tracking-[0.14em] text-white shadow-[5px_5px_0px_0px_black] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
      >
       <Sparkles size={16} />
       Build Persisted Packet
      </button>

      {status ? (
       <div className="rounded-[14px] border-[3px] border-black bg-[#FFEA5A] px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-black/70">
        {status}
       </div>
      ) : null}
     </div>
    </div>
   </section>

   {config.prototype ? (
    <div className="max-sm:-mx-16 sm:mx-0">
     <SuperToolPrototypeWorkspace config={config.prototype} />
    </div>
   ) : null}

   {children}

   <ClaritySectionHeader
    kicker="Evidence + Save Path"
    title="Latest Output And Workflow Handoff"
    body="This section proves whether a tool action actually saved a packet, created a reusable artifact, queued a workflow, and left enough provenance for the next builder pass."
    tone="bg-[#00F0FF]"
   />

   <section className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
    <div className="rounded-[22px] border-[4px] border-black bg-white shadow-[8px_8px_0px_0px_black]">
     <div className="border-b-[4px] border-black bg-[#00F0FF] px-6 py-5">
      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/55">
       Latest Persisted Output
      </div>
      <div className="text-3xl font-[1000] uppercase tracking-[-0.05em]">
       Packet Snapshot
      </div>
     </div>
     <div className="grid gap-4 p-6">
      {latestGeneration ? (
       <>
        <div className="rounded-[16px] border-[4px] border-black bg-[#f8f7f1] p-4">
         <div className="text-[10px] font-black uppercase tracking-[0.18em] text-black/55">
          Summary
         </div>
         <p className="mt-2 text-sm font-bold leading-6 text-black/75">
          {latestGeneration.outputText || "Latest generation has no summary yet."}
         </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
         <div className="rounded-[16px] border-[4px] border-black bg-white p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-black/55">
           Generation status
          </div>
          <div className="mt-2 text-2xl font-[1000] uppercase tracking-[-0.05em]">
           {latestGeneration.status}
          </div>
         </div>
         <div className="rounded-[16px] border-[4px] border-black bg-white p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-black/55">
           Persisted artifacts
          </div>
          <div className="mt-2 text-2xl font-[1000] uppercase tracking-[-0.05em]">
           {latestGeneration.artifacts.length}
          </div>
         </div>
        </div>
       </>
      ) : (
       <div className="rounded-[16px] border-[4px] border-dashed border-black/35 bg-[#f8f7f1] px-4 py-8 text-[10px] font-black uppercase tracking-[0.18em] text-black/55">
        No persisted packet yet for this tool.
       </div>
      )}
     </div>
    </div>

    <div className="rounded-[22px] border-[4px] border-black bg-[#111] text-white shadow-[8px_8px_0px_0px_#CCFF00]">
     <div className="border-b-[4px] border-black bg-[#CCFF00] px-6 py-5 text-black">
      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/55">
       Workflow Handoff
      </div>
      <div className="text-3xl font-[1000] uppercase tracking-[-0.05em]">
       Next-Step Chain
      </div>
     </div>
     <div className="grid gap-4 p-6">
      {latestWorkflow ? (
       <>
        <div className="rounded-[16px] border-[4px] border-white/15 bg-black/35 p-4">
         <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/55">
          Chain title
         </div>
         <div className="mt-2 text-2xl font-[1000] uppercase tracking-[-0.05em] text-[#CCFF00]">
          {latestWorkflow.title}
         </div>
         <p className="mt-2 text-sm font-bold leading-6 text-white/75">
          {latestWorkflow.goal}
         </p>
        </div>
        <div className="grid gap-3">
         {latestWorkflow.steps.map((step) => (
          <div
           key={step.id}
           className="rounded-[14px] border-[3px] border-white/20 bg-black/40 px-4 py-3"
          >
           <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-black uppercase tracking-[0.1em] text-white">
             {step.title}
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/55">
             {step.ownerSurface} · {step.toolId}
            </div>
           </div>
           <p className="mt-2 text-xs font-bold leading-5 text-white/70">
            {step.details}
           </p>
          </div>
         ))}
        </div>
       </>
      ) : (
       <div className="rounded-[16px] border-[4px] border-dashed border-white/20 bg-black/40 px-4 py-8 text-[10px] font-black uppercase tracking-[0.18em] text-white/55">
        No workflow chain created yet.
       </div>
      )}
     </div>
    </div>
   </section>

   <section className="rounded-[22px] border-[4px] border-black bg-[#f8f7f1] shadow-[8px_8px_0px_0px_black]">
    <div className="border-b-[4px] border-black bg-[#FFEA5A] px-6 py-5">
     <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/55">
      Builder Evidence
     </div>
     <div className="text-3xl font-[1000] uppercase tracking-[-0.05em]">
      Provenance And Tomorrow Notes
     </div>
    </div>
    <div className="grid gap-4 p-6 md:grid-cols-5">
     {[
      {
       label: "Inputs Used",
       value:
        [source && config.sourceLabel, objective && config.objectiveLabel, notes && config.notesLabel]
         .filter(Boolean)
         .join(", ") || "Waiting for builder input",
      },
      {
       label: "Inferred",
       value: latestGeneration?.outputText || "No packet inference saved yet",
      },
      {
       label: "Missing",
       value:
        [!source && config.sourceLabel, !objective && config.objectiveLabel, !notes && config.notesLabel]
         .filter(Boolean)
         .join(", ") || "Required fields covered",
      },
      {
       label: "Handoff",
       value:
        latestWorkflow?.steps.map((step) => step.toolId || step.ownerSurface).join(" -> ") ||
        "No workflow chain yet",
      },
      {
       label: "Improve Next",
       value:
        config.modules
         .map((module) => module.selfImprovementSignal)
         .filter(Boolean)
         .slice(0, 2)
         .join(" / ") || "Clarify evidence and skipped stages",
      },
     ].map((item) => (
      <article
       key={item.label}
       className="rounded-[16px] border-[4px] border-black bg-white p-4 shadow-[4px_4px_0px_0px_black]"
      >
       <div className="text-[10px] font-black uppercase tracking-[0.18em] text-black/50">
        {item.label}
       </div>
       <p className="mt-2 text-xs font-black uppercase leading-5 tracking-[0.08em] text-black/75">
        {item.value}
       </p>
      </article>
     ))}
    </div>
   </section>

   <section className="grid gap-8 xl:grid-cols-3">
    {config.outputLanes.map((item) => (
     <article
      key={item.label}
      className="rounded-[20px] border-[4px] border-black bg-white p-5 shadow-[7px_7px_0px_0px_black]"
     >
      <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.18em] text-black/55">
       {item.label === "Input" ? (
        <Database size={18} />
       ) : item.label === "Output" ? (
        <CheckCircle2 size={18} />
       ) : (
        <Workflow size={18} />
       )}
       {item.label}
      </div>
      <p className="mt-3 text-lg font-[1000] uppercase leading-tight tracking-[-0.04em] text-black">
       {item.value}
      </p>
     </article>
    ))}
   </section>
  </div>
 )
}

export default InternalSuperToolWorkbench
