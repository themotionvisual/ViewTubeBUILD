import React, { useState } from "react"
import { Clapperboard, Compass, GitBranch, Lightbulb, NotebookPen, ShieldCheck } from "lucide-react"
import { useBrain } from "../context/useBrain"
import { createSuperToolActionPacket } from "../services/superToolActionPackets"
import InternalSuperToolWorkbench, {
 type InternalWorkbenchConfig,
} from "./supertools/InternalSuperToolWorkbench"

const config: InternalWorkbenchConfig = {
 toolId: "creator-canvas-os",
 toolNumber: "01",
 title: "Creator Canvas OS",
 subtitle:
  "Turn raw ideas into angle, hook, script, and storyboard-ready creator packets with Brain-aware continuity.",
 railTitle: "Studio Ideation Layer",
 railSubtitle: "Idea intake, angle shaping, hook design, script structure, storyboard handoff",
 railNote:
  "This tool owns ideation and script shaping. It should hand work to Projects, Packaging, and VT_E1 instead of imitating them.",
 accentClassName: "bg-[#CCFF00]",
 heroShadowClassName: "shadow-[12px_12px_0px_0px_#CCFF00]",
 modeLabel: "Canvas mode",
 sourceLabel: "Source idea",
 sourcePlaceholder: "Topic, clip, audience question, or rough concept",
 objectiveLabel: "Creator objective",
 objectivePlaceholder: "Explain, entertain, convert, serialize, or launch a new lane",
 notesLabel: "Constraints and notes",
 notesPlaceholder: "Target viewer, proof points, format, runtime, objections, and desired payoff",
 modules: [
  {
   id: "idea-intake",
   title: "Idea Intake",
   body: "Captures raw concept seeds, audience prompts, reference links, and creator goals without forcing them into a script too early.",
   purpose: "Capture raw concept seeds, audience prompts, reference links, and creator goals before the idea is forced into a script.",
   controls: ["source idea", "viewer promise", "reference links", "goal tags"],
   outputKind: "normalized idea brief",
   integrations: ["Brain context", "Vault references", "Audience Loop"],
   selfImprovementSignal: "records which source types produced usable angles",
   tone: "bg-[#CCFF00]",
   icon: Lightbulb,
  },
  {
   id: "angle-forge",
   title: "Angle Forge",
   body: "Generates sharper perspectives, stakes, promises, and audience-fit framing so the same topic can produce multiple viable videos.",
   purpose: "Generate sharper perspectives, stakes, promises, and audience-fit framing from the same core topic.",
   controls: ["angle count", "stakes level", "audience segment", "format fit"],
   outputKind: "ranked angle set",
   integrations: ["Packaging Lab Pro", "Series Generator", "Brain memory"],
   selfImprovementSignal: "compares chosen angles against later packaging and retention results",
   tone: "bg-[#FFEA5A]",
   icon: Compass,
  },
  {
   id: "hook-lab",
   title: "Hook Lab",
   body: "Shapes curiosity gaps, opening proof beats, CTA positioning, and the first fifteen seconds of creator intent.",
   purpose: "Shape curiosity gaps, proof beats, and the first fifteen seconds so the opening matches the click promise.",
   controls: ["hook style", "first proof", "CTA position", "opening risk"],
   outputKind: "hook variants and opening beat",
   integrations: ["Retention Autopsy", "Packaging Lab Pro", "VT_E1"],
   selfImprovementSignal: "tracks which hook risks need retention validation",
   tone: "bg-[#FF4FD8] text-white",
   icon: Clapperboard,
  },
  {
   id: "script-architect",
   title: "Script Architect",
   body: "Turns the chosen angle into beats, proof order, transitions, and storyboard-ready scene packets.",
   purpose: "Turn the chosen angle into beats, proof order, transitions, and storyboard-ready scene packets.",
   controls: ["beat count", "proof order", "runtime target", "transition notes"],
   outputKind: "script beat packet",
   integrations: ["Project Command", "VT_E1", "Workflow Chain Builder"],
   selfImprovementSignal: "flags weak transitions and missing proof for tomorrow's pass",
   tone: "bg-[#00F0FF]",
   icon: NotebookPen,
  },
  {
   id: "storyboard-bridge",
   title: "Storyboard Bridge",
   body: "Converts script beats into scene, shot, asset, and motion prompts for downstream editor work.",
   purpose: "Convert stable script beats into scene, shot, asset, and motion prompts for downstream editor work.",
   controls: ["scene count", "asset needs", "motion style", "VT_E1 target"],
   outputKind: "storyboard handoff packet",
   integrations: ["Motion Scene Builder", "Timeline Dock", "Vault"],
   selfImprovementSignal: "records missing media and scene assumptions before editor handoff",
   tone: "bg-[#00F0FF]",
   icon: GitBranch,
  },
 {
  id: "provenance-strip",
   title: "Provenance Strip",
   body: "Keeps every generated idea tied to source evidence, confidence, skipped inputs, and next-agent notes.",
   purpose: "Keep every generated idea tied to source evidence, confidence, skipped inputs, and next-agent notes.",
   controls: ["evidence source", "confidence", "skipped checks", "next agent note"],
   outputKind: "evidence and handoff strip",
   integrations: ["GenerationRecord", "Vault artifact", "Brain signal"],
   selfImprovementSignal: "forces each packet to name evidence and missing context",
   tone: "bg-[#FFEA5A]",
  icon: ShieldCheck,
  },
 ],
 prototype: {
  toolId: "creator-canvas-os",
  title: "Creator Canvas Prototype",
  description: "Early working layout for idea intake, angle shaping, hooks, script beats, and storyboard handoff.",
  lanes: [
   { id: "idea-intake", title: "Idea Intake Queue", description: "Raw prompts and audience asks", tone: "bg-[#CCFF00]" },
   { id: "angle-forge", title: "Angle Forge Lanes", description: "Promise, stakes, format, audience fit", tone: "bg-[#FFEA5A]" },
   { id: "hook-lab", title: "Hook Variants", description: "First proof, curiosity, pattern break", tone: "bg-[#FF4FD8] text-white" },
   { id: "storyboard-strip", title: "Storyboard Strip", description: "Scene beats ready for VT_E1", tone: "bg-[#00F0FF]" },
  ],
  cards: [
   {
    id: "idea-audience-request",
    laneId: "idea-intake",
    title: "Audience-request concept",
    summary: "Turn a repeated viewer question into a normalized idea packet.",
    owner: "Creator",
    status: "queued",
    priority: "high",
    chips: ["viewer promise", "source link"],
    controls: ["goal tag", "format fit"],
    output: "normalized idea brief",
    integrations: ["Audience Loop", "Brain"],
    handoffTarget: "Packaging Lab",
   },
   {
    id: "angle-contrarian",
    laneId: "angle-forge",
    title: "Contrarian angle",
    summary: "Test a sharper perspective without breaking trust or specificity.",
    owner: "Studio",
    status: "active",
    priority: "medium",
    chips: ["stakes", "audience segment"],
    controls: ["angle count", "risk filter"],
    output: "ranked angle set",
    integrations: ["Series Generator", "Brain memory"],
    handoffTarget: "Hook Lab",
   },
   {
    id: "hook-first-proof",
    laneId: "hook-lab",
    title: "First 15 seconds",
    summary: "Move the strongest proof beat before the explanation block.",
    status: "active",
    priority: "urgent",
    chips: ["proof first", "retention risk"],
    controls: ["hook style", "opening beat"],
    output: "hook variants",
    integrations: ["Retention Engine"],
    handoffTarget: "Script Architect",
   },
   {
    id: "storyboard-scene-beats",
    laneId: "storyboard-strip",
    title: "VT_E1 scene beats",
    summary: "Convert approved script beats into scene, asset, and motion prompts.",
    status: "ready",
    priority: "high",
    chips: ["asset needs", "scene count"],
    controls: ["motion style", "editor target"],
    output: "storyboard handoff packet",
    integrations: ["VT_E1", "Vault"],
    handoffTarget: "Motion Scene Builder",
   },
  ],
  controls: ["select idea", "move lane", "mark blocked", "mark launch ready"],
  evidence: ["source idea", "audience signal", "proof points", "skipped checks visible"],
  handoffTargets: ["Packaging Lab", "Project Command", "VT_E1"],
 },
 modes: [
  {
   id: "idea",
   label: "Idea Expansion",
   description: "Start with a raw concept and widen it into multiple creator-ready angles.",
  },
  {
   id: "hook",
   label: "Hook First",
   description: "Work backwards from the promised click so the opening earns the audience immediately.",
  },
  {
   id: "storyboard",
   label: "Storyboard Bridge",
   description: "Convert script structure into scene-ready beats for downstream VT_E1 work.",
  },
 ],
 metrics: [
  { label: "Owns", value: "Angles, hooks, scripts", icon: Lightbulb, tone: "bg-[#CCFF00]" },
  { label: "Hands off to", value: "Projects, Packaging, VT_E1", icon: Compass, tone: "bg-[#00F0FF]" },
  { label: "Persistence", value: "Generation + workflow + vault", icon: NotebookPen, tone: "bg-[#FFEA5A]" },
  { label: "Boundary", value: "Not the final editor", icon: Clapperboard, tone: "bg-[#FF4FD8] text-white" },
 ],
 sisterToolIds: [
  "creator-canvas-os",
  "packaging-lab-pro",
  "project-command-kanban",
  "motion-scene-builder",
  "brain-command-center",
 ],
 outputLanes: [
  { label: "Input", value: "Idea seeds, audience signals, references, creator goals" },
  { label: "Output", value: "Angle packet, hook draft, script beats, storyboard bridge" },
  { label: "Handoff", value: "Projects planning, packaging, motion scene execution" },
 ],
 buildPacket: ({ source, objective, notes, mode, brainContext, workflowCount }) => ({
  title: source || "Creator Canvas Packet",
  summary: `Built ${mode.label.toLowerCase()} packet for ${source || "untitled concept"} with ${objective || "open-ended creator objective"} and persisted it for project, packaging, and storyboard handoff.`,
  packet: {
   ownership: "idea intake, angles, hooks, scripts, storyboard-ready beats",
   mode: mode.label,
   source: source || "Untitled concept",
   objective: objective || "Clarify creator value and audience payoff",
   creatorNotes: notes || "No extra notes provided.",
   brainSignals: {
    strategicAdvice: brainContext?.strategicAdvice || null,
    contextBlock: brainContext?.toolContextPack?.summary || null,
   },
   deliverables: [
    "core angle",
    "hook options",
    "proof order",
    "scene-ready script beats",
   ],
   sequencingAdvice: [
    "lock the promise before expanding the explanation",
    "surface the strongest proof inside the opening",
    "handoff only once the story beat order is stable",
   ],
   workflowCount,
  },
  workflowTitle: `${source || "Concept"} ideation chain`,
  workflowGoal: "Move a creator concept from raw idea into project, packaging, and storyboard-ready structure.",
  workflowSteps: [
   {
    title: "Lock angle",
    surface: "studio",
    toolId: "creator-canvas-os",
    details: "Confirm the thesis, audience, and promise.",
   },
   {
    title: "Draft packaging direction",
    surface: "studio",
    toolId: "packaging-lab-pro",
    details: "Translate the chosen angle into title and thumbnail direction.",
   },
   {
    title: "Plan execution",
    surface: "projects",
    toolId: "project-command-kanban",
    details: "Turn the approved idea into milestones and blockers.",
   },
   {
    title: "Bridge to scenes",
    surface: "editor",
    toolId: "motion-scene-builder",
    details: "Convert the beat order into scene-planning targets.",
   },
  ],
 }),
}

const CreatorCanvasDeepActions: React.FC = () => {
 const { emitSignal } = useBrain()
 const [sourceIdea, setSourceIdea] = useState("")
 const [targetViewer, setTargetViewer] = useState("")
 const [proofPoints, setProofPoints] = useState("")
 const [format, setFormat] = useState("long-form explainer")
 const [sceneCount, setSceneCount] = useState(5)
 const [assetNeeds, setAssetNeeds] = useState("")
 const [confidence, setConfidence] = useState<"high" | "medium" | "low">("medium")
 const [status, setStatus] = useState<string | null>(null)

 const buildCommonInputs = () => ({
  sourceIdea: sourceIdea.trim() || "Untitled idea",
  targetViewer: targetViewer.trim(),
  proofPoints: proofPoints.trim(),
  format,
  sceneCount,
  assetNeeds: assetNeeds.trim(),
 })

 const saveIdeaPacket = async () => {
  const inputs = buildCommonInputs()
  const result = createSuperToolActionPacket({
   toolId: "creator-canvas-os",
   moduleId: "idea-intake",
   title: `${inputs.sourceIdea} idea packet`,
   summary: `Saved an idea intake packet for ${inputs.sourceIdea} with target viewer, proof, format, and confidence boundaries.`,
   inputs,
   outputs: {
    normalizedIdea: inputs.sourceIdea,
    targetViewer: inputs.targetViewer || "not specified",
    proofPointList: inputs.proofPoints,
    recommendedFormat: format,
   },
   confidence,
   evidence: [inputs.sourceIdea, inputs.proofPoints].filter(Boolean),
   missingInputs: [
    inputs.targetViewer ? null : "target viewer",
    inputs.proofPoints ? null : "proof points",
   ].filter(Boolean) as string[],
   handoffTargets: ["studio:packaging-lab-pro", "projects:project-command-kanban", "brain:brain-command-center"],
   workflowTitle: `${inputs.sourceIdea} idea development`,
   workflowGoal: "Move the normalized idea into packaging, project planning, and Brain memory.",
   workflowSteps: [
    {
     title: "Package core promise",
     surface: "studio",
     toolId: "packaging-lab-pro",
     details: "Turn the normalized idea into title, thumbnail, and description direction.",
    },
    {
     title: "Plan production",
     surface: "projects",
     toolId: "project-command-kanban",
     details: "Create milestones, blockers, and launch-readiness notes for the idea.",
    },
    {
     title: "Record creator direction",
     surface: "brain",
     toolId: "brain-command-center",
     details: "Store the idea confidence, audience target, and evidence boundaries.",
    },
   ],
   tags: ["idea-intake", confidence],
  })
  await emitSignal("CREATOR_CANVAS_OS", "IDEA_ACTION_PACKET_CREATED", result)
  setStatus("Idea action packet saved with Vault, workflow, and Brain handoff.")
 }

 const saveStoryboardHandoff = async () => {
  const inputs = buildCommonInputs()
  const result = createSuperToolActionPacket({
   toolId: "creator-canvas-os",
   moduleId: "storyboard-bridge",
   title: `${inputs.sourceIdea} storyboard handoff`,
   summary: `Saved a storyboard handoff for ${inputs.sourceIdea} with ${sceneCount} planned scenes and VT_E1 asset notes.`,
   inputs,
   outputs: {
    sceneCount,
    storyboardTarget: "VT_E1 / Motion Scene Builder",
    assetNeeds: inputs.assetNeeds || "not specified",
    format,
   },
   confidence,
   evidence: [inputs.sourceIdea, inputs.assetNeeds, `${sceneCount} scenes`].filter(Boolean),
   missingInputs: [
    inputs.assetNeeds ? null : "asset needs",
    sceneCount > 0 ? null : "scene count",
   ].filter(Boolean) as string[],
   handoffTargets: ["editor:motion-scene-builder", "vault:creator-vault-os", "workflow:workflow-chain-builder"],
   workflowTitle: `${inputs.sourceIdea} storyboard to editor`,
   workflowGoal: "Convert the idea into editor-ready scene planning and asset collection.",
   workflowSteps: [
    {
     title: "Create scene plan",
     surface: "editor",
     toolId: "motion-scene-builder",
     details: `Draft ${sceneCount} scenes for the selected format.`,
    },
    {
     title: "Collect assets",
     surface: "vault",
     toolId: "creator-vault-os",
     details: inputs.assetNeeds || "Identify missing images, clips, audio, and brand assets.",
    },
    {
     title: "Track editor handoff",
     surface: "workflow",
     toolId: "workflow-chain-builder",
     details: "Keep storyboard, asset, and scene work connected to the workflow chain.",
    },
   ],
   tags: ["storyboard-bridge", confidence],
  })
  await emitSignal("CREATOR_CANVAS_OS", "STORYBOARD_ACTION_PACKET_CREATED", result)
  setStatus("Storyboard handoff packet saved with VT_E1 workflow target.")
 }

 return (
  <section className="rounded-[22px] border-[4px] border-black bg-white shadow-[8px_8px_0px_0px_black]">
   <div className="border-b-[4px] border-black bg-[#CCFF00] px-6 py-5">
    <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/55">
     Deeper Local Actions
    </div>
    <div className="text-3xl font-[1000] uppercase tracking-[-0.05em]">
     Idea Intake + Storyboard Bridge
    </div>
   </div>
   <div className="grid gap-4 p-6 lg:grid-cols-2">
    <label className="flex flex-col gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-black/60">
     Source idea
     <input value={sourceIdea} onChange={(event) => setSourceIdea(event.target.value)} className="h-12 rounded-[14px] border-[4px] border-black bg-white px-4 text-sm font-bold" placeholder="Smoke test creator idea" />
    </label>
    <label className="flex flex-col gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-black/60">
     Target viewer
     <input value={targetViewer} onChange={(event) => setTargetViewer(event.target.value)} className="h-12 rounded-[14px] border-[4px] border-black bg-white px-4 text-sm font-bold" placeholder="Viewer segment or audience need" />
    </label>
    <label className="flex flex-col gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-black/60">
     Proof points
     <textarea value={proofPoints} onChange={(event) => setProofPoints(event.target.value)} className="min-h-28 rounded-[14px] border-[4px] border-black bg-white px-4 py-3 text-sm font-bold leading-6" placeholder="Evidence, examples, objections, or repeated audience signal" />
    </label>
    <label className="flex flex-col gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-black/60">
     Asset needs
     <textarea value={assetNeeds} onChange={(event) => setAssetNeeds(event.target.value)} className="min-h-28 rounded-[14px] border-[4px] border-black bg-white px-4 py-3 text-sm font-bold leading-6" placeholder="Clips, screenshots, B-roll, graphics, audio, or VT_E1 needs" />
    </label>
    <label className="flex flex-col gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-black/60">
     Format
     <select value={format} onChange={(event) => setFormat(event.target.value)} className="h-12 rounded-[14px] border-[4px] border-black bg-white px-4 text-sm font-bold uppercase tracking-[0.08em]">
      <option value="long-form explainer">Long-form explainer</option>
      <option value="shorts sequence">Shorts sequence</option>
      <option value="tutorial">Tutorial</option>
      <option value="series episode">Series episode</option>
     </select>
    </label>
    <div className="grid gap-4 md:grid-cols-2">
     <label className="flex flex-col gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-black/60">
      Scene count
      <input type="number" min={1} max={24} value={sceneCount} onChange={(event) => setSceneCount(Number(event.target.value))} className="h-12 rounded-[14px] border-[4px] border-black bg-white px-4 text-sm font-bold" />
     </label>
     <label className="flex flex-col gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-black/60">
      Confidence
      <select value={confidence} onChange={(event) => setConfidence(event.target.value as "high" | "medium" | "low")} className="h-12 rounded-[14px] border-[4px] border-black bg-white px-4 text-sm font-bold uppercase tracking-[0.08em]">
       <option value="medium">Medium</option>
       <option value="high">High</option>
       <option value="low">Low</option>
      </select>
     </label>
    </div>
    <div className="flex flex-col gap-3 lg:col-span-2 md:flex-row">
     <button type="button" onClick={saveIdeaPacket} className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] border-[4px] border-black bg-[#FF4FD8] px-5 text-xs font-black uppercase tracking-[0.14em] text-white shadow-[5px_5px_0px_0px_black]">
      Save Idea Action Packet
     </button>
     <button type="button" onClick={saveStoryboardHandoff} className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] border-[4px] border-black bg-[#111] px-5 text-xs font-black uppercase tracking-[0.14em] text-[#CCFF00] shadow-[5px_5px_0px_0px_black]">
      Save Storyboard Handoff
     </button>
    </div>
    {status ? (
     <div className="rounded-[14px] border-[3px] border-black bg-[#FFEA5A] px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-black/70 lg:col-span-2">
      {status}
     </div>
    ) : null}
   </div>
  </section>
 )
}

const CreatorCanvasOS: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => (
 <InternalSuperToolWorkbench config={config} embedded={embedded}>
  <CreatorCanvasDeepActions />
 </InternalSuperToolWorkbench>
)

export default CreatorCanvasOS
