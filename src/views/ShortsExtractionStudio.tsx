import React, { useMemo, useState } from "react"
import { Clapperboard, Crop, Download, Film, ListVideo, LogIn, Scissors, Sparkles, Workflow } from "lucide-react"
import { SuperToolRail } from "../components/SuperToolRail"
import { useBrain } from "../context/useBrain"
import { listSuperToolsByIds } from "../services/superToolRegistry"
import { createSuperToolActionPacket } from "../services/superToolActionPackets"
import SuperToolPrototypeWorkspace, {
 type PrototypeWorkspaceConfig,
} from "./supertools/SuperToolPrototypeWorkspace"

const SHORTS_TOOL_IDS = [
 "shorts-extraction-studio",
 "motion-scene-builder",
 "caption-and-fx-pipeline",
 "workflow-chain-builder",
] as const

const layoutPresets = [
 { id: "center-crop", label: "Center Crop", ratio: "9:16", note: "Fast vertical crop for talking-head or single-subject footage." },
 { id: "smart-follow", label: "Smart Follow", ratio: "9:16", note: "Subject-aware frame intent for long-form highlight extraction." },
 { id: "split-context", label: "Split Context", ratio: "9:16", note: "Top subject, bottom proof/context block for educational shorts." },
 { id: "caption-led", label: "Caption Led", ratio: "9:16", note: "Large caption-first framing for silent autoplay behavior." },
]

const modules = [
 {
  title: "Source Clip Intake",
  icon: <LogIn size={20} />,
  tone: "bg-[#00F0FF]",
  body: "Registers the source video, stream, transcript, chapter, retention spike, or manual clip target before any cut is trusted.",
  controls: ["source title", "timecode", "transcript", "evidence"],
  outputKind: "source clip intake packet",
  integrations: ["VT_E1", "Vault", "Retention Autopsy"],
  selfImprovementSignal: "records missing source evidence before cutting begins",
 },
 {
  title: "Highlight Detector",
  icon: <Sparkles size={20} />,
  tone: "bg-[#CCFF00]",
  body: "Finds candidate short moments from transcripts, retention spikes, chapter beats, hooks, and high-density proof sections.",
  controls: ["hook density", "retention spike", "chapter beat", "proof moment"],
  outputKind: "ranked highlight candidates",
  integrations: ["Transcript", "Performance Hub", "Brain context"],
  selfImprovementSignal: "tracks which detected moments become selected shorts",
 },
 {
  title: "Shorts Cutter",
  icon: <Scissors size={20} />,
  tone: "bg-[#FF4FD8] text-white",
  body: "Creates exact vertical cut ranges with start/end handles, safe margins, caption timing, and export notes.",
  controls: ["start handle", "end handle", "safe margin", "caption timing"],
  outputKind: "short cut plan",
  integrations: ["VT_E1 timeline", "Caption FX", "Workflow Chain"],
  selfImprovementSignal: "records trim assumptions and export blockers",
 },
 {
  title: "Repost Trimmer",
  icon: <Clapperboard size={20} />,
  tone: "bg-[#00F0FF]",
  body: "Applies micro-trims, opening/ending offsets, alternate captions, and packaging deltas for repost variants.",
  controls: ["trim seconds", "opening offset", "ending offset", "variant note"],
  outputKind: "repost variant plan",
  integrations: ["Packaging Lab", "Cinematic Analytics", "Brain signal"],
  selfImprovementSignal: "learns which repost deltas need later measurement",
 },
 {
  title: "Vertical Layout Lab",
  icon: <Crop size={20} />,
  tone: "bg-[#FFEA5A]",
  body: "Tests center crop, smart follow, split context, and caption-led 9:16 framing before VT_E1 handoff.",
  controls: ["layout preset", "ratio", "subject framing", "caption zone"],
  outputKind: "vertical layout spec",
  integrations: ["Motion Scene Builder", "VT_E1", "Template Forge"],
  selfImprovementSignal: "records framing decisions that need render review",
 },
 {
  title: "VT_E1 Handoff",
  icon: <Workflow size={20} />,
  tone: "bg-[#CCFF00]",
  body: "Packages the clip, trim plan, layout spec, captions, export notes, and provenance for editor execution.",
  controls: ["handoff target", "export type", "artifact id", "next agent note"],
  outputKind: "VT_E1 handoff packet",
  integrations: ["VT_E1", "Workflow Chain", "Vault artifact"],
  selfImprovementSignal: "checks that every shorts output has a receiving editor workflow",
 },
]

const shortsPrototypeConfig: PrototypeWorkspaceConfig = {
 toolId: "shorts-extraction-studio",
 title: "Shorts Studio Prototype",
 description: "Early vertical-edit workspace for source clips, highlight candidates, cut handles, preview framing, and VT_E1 handoff.",
 lanes: [
  { id: "source-clip-rail", title: "Source Clip Rail", description: "Long-form inputs and evidence", tone: "bg-[#00F0FF]" },
  { id: "highlight-candidates", title: "Highlight Candidates", description: "Ranked moments worth cutting", tone: "bg-[#CCFF00]" },
  { id: "cutter-handles", title: "Cutter Handles", description: "Start, end, margin, caption timing", tone: "bg-[#FF4FD8] text-white" },
  { id: "vertical-preview", title: "Vertical Preview", description: "9:16 layout and caption zone", tone: "bg-[#FFEA5A]" },
  { id: "vt-e1-handoff", title: "VT_E1 Handoff", description: "Export packet and editor target", tone: "bg-[#CCFF00]" },
 ],
 cards: [
  {
   id: "source-episode",
   laneId: "source-clip-rail",
   title: "Long-form source episode",
   summary: "Register source title, timecode, transcript note, and retention clue before cutting.",
   owner: "Editor",
   status: "active",
   priority: "high",
   chips: ["source title", "timecode"],
   controls: ["transcript", "evidence"],
   output: "source clip intake packet",
   integrations: ["Vault", "Retention Autopsy"],
   handoffTarget: "Highlight Detector",
  },
  {
   id: "highlight-proof-moment",
   laneId: "highlight-candidates",
   title: "Proof moment candidate",
   summary: "A dense explanation section can become a standalone short with a faster hook.",
   status: "queued",
   priority: "high",
   chips: ["hook density", "proof"],
   controls: ["retention spike", "chapter beat"],
   output: "ranked highlight candidate",
   integrations: ["Brain context"],
   handoffTarget: "Shorts Cutter",
  },
  {
   id: "cut-handles",
   laneId: "cutter-handles",
   title: "Trim handle pass",
   summary: "Set clean start/end handles, safe margins, and caption timing before preview.",
   status: "blocked",
   priority: "urgent",
   blocker: "Exact source range needs confirmation",
   chips: ["start handle", "safe margin"],
   controls: ["end handle", "caption timing"],
   output: "short cut plan",
   integrations: ["VT_E1 timeline"],
   handoffTarget: "Vertical Preview",
  },
  {
   id: "vertical-preview-card",
   laneId: "vertical-preview",
   title: "Caption-led vertical frame",
   summary: "Preview a 9:16 composition with safe text zone and subject framing.",
   status: "ready",
   priority: "high",
   chips: ["9:16", "caption zone"],
   controls: ["layout preset", "subject framing"],
   output: "vertical layout spec",
   integrations: ["Motion Scene Builder"],
   handoffTarget: "VT_E1 Handoff",
  },
  {
   id: "handoff-packet",
   laneId: "vt-e1-handoff",
   title: "Editor handoff packet",
   summary: "Bundle cut, layout, captions, export type, and provenance for VT_E1.",
   status: "queued",
   priority: "medium",
   chips: ["JSON", "MP4", "provenance"],
   controls: ["artifact id", "next agent note"],
   output: "VT_E1 handoff packet",
   integrations: ["Workflow Chain", "Vault"],
   handoffTarget: "VT_E1",
  },
 ],
 controls: ["select clip", "move cut stage", "mark blocked", "mark launch ready"],
 evidence: ["source title", "timecode", "transcript or retention evidence", "layout preset"],
 handoffTargets: ["VT_E1", "Caption FX", "Workflow Chain"],
}

interface ShortsExtractionStudioProps {
 embedded?: boolean
}

const ShortsExtractionStudio: React.FC<ShortsExtractionStudioProps> = ({ embedded = false }) => {
 const { emitSignal } = useBrain()
 const [sourceTitle, setSourceTitle] = useState("")
 const [sourceTimecode, setSourceTimecode] = useState("")
 const [evidenceNote, setEvidenceNote] = useState("")
 const [selectedPreset, setSelectedPreset] = useState(layoutPresets[0].id)
 const [trimSeconds, setTrimSeconds] = useState(0.33)
 const [exportTarget, setExportTarget] = useState("VT_E1 JSON + MP4")
 const [handoffNote, setHandoffNote] = useState("")
 const [status, setStatus] = useState<string | null>(null)

 const tools = useMemo(() => listSuperToolsByIds([...SHORTS_TOOL_IDS]), [])
 const activePreset = layoutPresets.find((preset) => preset.id === selectedPreset) || layoutPresets[0]

 const handleCreateWorkflow = async () => {
  const title = sourceTitle.trim() || "Long-form to Shorts extraction"
  const result = createSuperToolActionPacket({
   toolId: "shorts-extraction-studio",
   moduleId: "vt-e1-handoff",
   title: `${title} shorts handoff`,
   summary: `Saved a ${activePreset.label} ${activePreset.ratio} shorts handoff with ${trimSeconds}s repost trim and ${exportTarget} export target.`,
   inputs: {
    sourceTitle: title,
    sourceTimecode: sourceTimecode.trim(),
    evidenceNote: evidenceNote.trim(),
    preset: activePreset,
    trimSeconds,
    exportTarget,
    handoffNote: handoffNote.trim(),
   },
   outputs: {
    cutPlan: `${trimSeconds}s trim with ${activePreset.label} layout`,
    verticalLayout: activePreset,
    exportTarget,
    vtE1Handoff: handoffNote.trim() || "Send to VT_E1 render bridge",
   },
   confidence: evidenceNote.trim() ? "medium" : "low",
   evidence: [title, sourceTimecode.trim(), evidenceNote.trim()].filter(Boolean),
   missingInputs: [
    sourceTimecode.trim() ? null : "source timecode",
    evidenceNote.trim() ? null : "transcript or retention evidence",
   ].filter(Boolean) as string[],
   handoffTargets: ["editor:motion-scene-builder", "editor:caption-and-fx-pipeline", "editor:VT_E1", "brain:brain-command-center"],
   workflowTitle: `${title} Shorts Pipeline`,
   workflowGoal: "Extract, trim, reframe, caption, and hand off a short-form clip candidate.",
   workflowSteps: [
    {
     title: "Select source segment",
     surface: "editor",
     toolId: "shorts-extraction-studio",
     details: sourceTimecode.trim() || "Choose the long-form source, transcript beat, or retention spike.",
    },
    {
     title: "Cut highlight candidate",
     surface: "editor",
     toolId: "shorts-extraction-studio",
     details: `Apply ${trimSeconds}s repost trim and define export handles.`,
    },
    {
     title: "Reframe vertical layout",
     surface: "editor",
     toolId: "motion-scene-builder",
     details: `Use ${activePreset.label} ${activePreset.ratio} framing.`,
    },
    {
     title: "Apply captions and FX",
     surface: "editor",
     toolId: "caption-and-fx-pipeline",
     details: "Style captions, punch-ins, timing beats, and sound/FX notes.",
    },
    {
     title: "Record Brain learning",
     surface: "brain",
     toolId: "brain-command-center",
     details: evidenceNote.trim() || "Save why the clip was chosen and what result should be measured.",
    },
   ],
   tags: ["shorts-extraction-studio", selectedPreset, "vt-e1-handoff"],
  })
  await emitSignal("SHORTS_EXTRACTION_STUDIO", "SHORTS_WORKFLOW_CREATED", {
   generationId: result.recordId,
   workflowId: result.chain.id,
   sourceTitle: title,
   preset: selectedPreset,
   trimSeconds,
   actionPacketId: result.packet.id,
  })
  setStatus("Shorts workflow created and sent to Workflow Chain Builder.")
 }

 return (
  <div className="mx-auto flex max-w-[1600px] flex-col gap-8 pb-24">
   {!embedded ? (
    <>
     <section className="rounded-[24px] border-[5px] border-black bg-[#111] px-8 py-8 text-white shadow-[12px_12px_0px_0px_#CCFF00]">
      <div className="text-[11px] font-black uppercase tracking-[0.35em] text-[#CCFF00]">
       Super-Tool 11
      </div>
      <h1 className="mt-3 text-5xl font-[1000] uppercase leading-none tracking-[-0.06em] md:text-6xl">
       Shorts Extraction Studio
      </h1>
      <p className="mt-4 max-w-4xl text-sm font-bold uppercase tracking-[0.12em] text-white/70">
       One unified tool for highlight extraction, Shorts cutting, repost trimming, vertical reframing, and editor handoff.
      </p>
     </section>

     <SuperToolRail
      title="Shorts Production Layer"
      subtitle="Extract, trim, reframe, caption, hand off, and learn"
      tools={tools}
      accentClassName="bg-[#CCFF00]"
      note="This replaces Creator Vault OS as canonical Tool 11. Vault storage remains a supporting utility, not the Tool 11 identity."
     />
    </>
   ) : null}

   <section className="grid gap-8 xl:grid-cols-[1fr_0.9fr]">
    <div className="rounded-[22px] border-[4px] border-black bg-white shadow-[8px_8px_0px_0px_black]">
     <div className="border-b-[4px] border-black bg-[#00F0FF] px-6 py-5">
      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/55">
       Toolbox Modules
      </div>
      <div className="text-3xl font-[1000] uppercase tracking-[-0.05em]">
       Extraction Pipeline
      </div>
     </div>
     <div className="grid gap-4 p-6 md:grid-cols-2">
      {modules.map((module) => (
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
    </div>

    <div className="rounded-[22px] border-[4px] border-black bg-white shadow-[8px_8px_0px_0px_black]">
     <div className="border-b-[4px] border-black bg-[#FF4FD8] px-6 py-5 text-white">
      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/70">
       Clip Setup
      </div>
      <div className="text-3xl font-[1000] uppercase tracking-[-0.05em]">
       Create Handoff
      </div>
     </div>
     <div className="grid gap-4 p-6">
      <label className="flex flex-col gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-black/60">
       Source title or project
       <input
        value={sourceTitle}
        onChange={(event) => setSourceTitle(event.target.value)}
        className="h-12 rounded-[14px] border-[4px] border-black bg-white px-4 text-sm font-bold text-black"
        placeholder="Long-form episode, stream, or source video"
       />
      </label>
      <label className="flex flex-col gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-black/60">
       Source timecode
       <input
        value={sourceTimecode}
        onChange={(event) => setSourceTimecode(event.target.value)}
        className="h-12 rounded-[14px] border-[4px] border-black bg-white px-4 text-sm font-bold text-black"
        placeholder="00:01:24-00:02:04 or chapter/clip range"
       />
      </label>
      <label className="flex flex-col gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-black/60">
       Transcript or retention evidence
       <textarea
        value={evidenceNote}
        onChange={(event) => setEvidenceNote(event.target.value)}
        className="min-h-24 rounded-[14px] border-[4px] border-black bg-white px-4 py-3 text-sm font-bold leading-6 text-black"
        placeholder="Why this clip is worth cutting: hook, proof moment, retention spike, comment request"
       />
      </label>
      <label className="flex flex-col gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-black/60">
       Vertical layout preset
       <select
        value={selectedPreset}
        onChange={(event) => setSelectedPreset(event.target.value)}
        className="h-12 rounded-[14px] border-[4px] border-black bg-white px-4 text-sm font-bold uppercase tracking-[0.08em] text-black"
       >
        {layoutPresets.map((preset) => (
         <option key={preset.id} value={preset.id}>
          {preset.label}
         </option>
        ))}
       </select>
      </label>
      <div className="rounded-[16px] border-[4px] border-black bg-[#f8f7f1] p-4">
       <div className="text-[10px] font-black uppercase tracking-[0.18em] text-black/55">
        Active preset
       </div>
       <div className="mt-1 text-2xl font-[1000] uppercase tracking-[-0.05em]">{activePreset.label}</div>
       <p className="mt-2 text-sm font-bold leading-6 text-black/70">{activePreset.note}</p>
      </div>
      <label className="flex flex-col gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-black/60">
       Repost trim seconds
       <input
        type="number"
        min={0}
        max={2}
        step={0.01}
        value={trimSeconds}
        onChange={(event) => setTrimSeconds(Number(event.target.value))}
        className="h-12 rounded-[14px] border-[4px] border-black bg-white px-4 text-sm font-bold text-black"
       />
      </label>
      <label className="flex flex-col gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-black/60">
       Export target
       <select
        value={exportTarget}
        onChange={(event) => setExportTarget(event.target.value)}
        className="h-12 rounded-[14px] border-[4px] border-black bg-white px-4 text-sm font-bold uppercase tracking-[0.08em] text-black"
       >
        <option value="VT_E1 JSON + MP4">VT_E1 JSON + MP4</option>
        <option value="VT_E1 JSON only">VT_E1 JSON only</option>
        <option value="MP4 only">MP4 only</option>
        <option value="Storyboard handoff">Storyboard handoff</option>
       </select>
      </label>
      <label className="flex flex-col gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-black/60">
       VT_E1 handoff note
       <textarea
        value={handoffNote}
        onChange={(event) => setHandoffNote(event.target.value)}
        className="min-h-24 rounded-[14px] border-[4px] border-black bg-white px-4 py-3 text-sm font-bold leading-6 text-black"
        placeholder="Editor target, caption/FX instruction, render note, or next agent reminder"
       />
      </label>
      <button
       type="button"
       onClick={handleCreateWorkflow}
       className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] border-[4px] border-black bg-[#111] px-5 text-xs font-black uppercase tracking-[0.14em] text-[#CCFF00] shadow-[5px_5px_0px_0px_black] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
      >
       <Workflow size={16} />
       Create Shorts Workflow
      </button>
      {status ? (
       <div className="rounded-[14px] border-[3px] border-black bg-[#FFEA5A] px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-black/70">
        {status}
       </div>
      ) : null}
     </div>
    </div>
   </section>

   <div className="max-sm:-mx-16 sm:mx-0">
    <SuperToolPrototypeWorkspace config={shortsPrototypeConfig} />
   </div>

   <section className="rounded-[22px] border-[4px] border-black bg-[#f8f7f1] shadow-[8px_8px_0px_0px_black]">
    <div className="border-b-[4px] border-black bg-[#FFEA5A] px-6 py-5">
     <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/55">
      Agent Self-Improvement Loop
     </div>
     <div className="text-3xl font-[1000] uppercase tracking-[-0.05em]">
      Cut Evidence and Handoff Notes
     </div>
    </div>
    <div className="grid gap-4 p-6 md:grid-cols-5">
     {[
      { label: "Inputs Used", value: sourceTitle.trim() ? "source title, preset, trim seconds" : "preset and trim seconds only" },
      { label: "Inferred", value: `${activePreset.label} ${activePreset.ratio} short with ${trimSeconds}s repost trim` },
      { label: "Missing", value: sourceTitle.trim() ? "exact timecode and transcript evidence" : "source title, exact timecode, transcript evidence" },
      { label: "Handoff", value: "VT_E1 -> captions/FX -> Brain learning" },
      { label: "Improve Next", value: "connect measured retention spikes and render proof" },
     ].map((item) => (
      <article key={item.label} className="rounded-[16px] border-[4px] border-black bg-white p-4 shadow-[4px_4px_0px_0px_black]">
       <div className="text-[10px] font-black uppercase tracking-[0.18em] text-black/50">{item.label}</div>
       <p className="mt-2 text-xs font-black uppercase leading-5 tracking-[0.08em] text-black/75">{item.value}</p>
      </article>
     ))}
    </div>
   </section>

   <section className="grid gap-8 xl:grid-cols-3">
    {[
     { label: "Input", value: "Long-form video, stream, clip, transcript, retention spike", icon: <Film size={18} /> },
     { label: "Output", value: "Shorts cut plan, trim handles, 9:16 layout, caption/FX handoff", icon: <ListVideo size={18} /> },
     { label: "Export", value: "VT_E1 render bridge, MP4/JSON/SVG notes, workflow provenance", icon: <Download size={18} /> },
    ].map((item) => (
     <article key={item.label} className="rounded-[20px] border-[4px] border-black bg-white p-5 shadow-[7px_7px_0px_0px_black]">
      <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.18em] text-black/55">
       {item.icon}
       {item.label}
      </div>
      <p className="mt-3 text-lg font-[1000] uppercase leading-tight tracking-[-0.04em] text-black">{item.value}</p>
     </article>
    ))}
   </section>
  </div>
 )
}

export default ShortsExtractionStudio
