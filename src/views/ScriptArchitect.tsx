import React, { useMemo, useState } from "react"
import { AlertTriangle, ClipboardCopy, NotebookPen, ShieldCheck } from "lucide-react"
import { generateScriptBlueprint } from "../services/gemini"
import { createSuperToolActionPacket } from "../services/superToolActionPackets"
import type { ScriptBlueprint } from "../types"
import { ToolboxScaffold, SubToolbox, StandardTextArea } from "../components/Toolbox"
import { StandardInput } from "../components/StandardInput"
import { StandardDropdown } from "../components/StandardDropdown"
import { useBrain } from "../context/useBrain"
import { PostActionReflection } from "../components/PostActionReflection"

interface ScriptArchitectProps {
 globalScript?: string
 embedded?: boolean
 collapsible?: boolean
 isOpenInitial?: boolean
 paletteIndex?: number
}

const FORMAT_OPTIONS = [
 { label: "Long-form explainer", value: "long-form explainer" },
 { label: "Tutorial", value: "tutorial" },
 { label: "Video essay", value: "video essay" },
 { label: "Listicle / ranked", value: "listicle" },
 { label: "Series episode", value: "series episode" },
 { label: "Shorts sequence", value: "shorts sequence" },
]

const RISK_TONE: Record<string, string> = {
 low: "bg-[#57F15C]",
 medium: "bg-[#FFEA5A]",
 high: "bg-[#FF4FD8] text-white",
}

const formatClock = (seconds: number) => {
 const safe = Math.max(0, Math.round(seconds))
 const mins = Math.floor(safe / 60)
 const secs = safe % 60
 return `${mins}:${String(secs).padStart(2, "0")}`
}

const ScriptArchitect: React.FC<ScriptArchitectProps> = ({
 globalScript,
 embedded = false,
 collapsible = false,
 isOpenInitial = true,
 paletteIndex,
}) => {
 const { brain, emitSignal } = useBrain()

 const [angle, setAngle] = useState(globalScript || "")
 const [targetViewer, setTargetViewer] = useState("")
 const [proofPoints, setProofPoints] = useState("")
 const [transitionNotes, setTransitionNotes] = useState("")
 const [format, setFormat] = useState("long-form explainer")
 const [beatCount, setBeatCount] = useState(6)
 const [runtimeTargetMinutes, setRuntimeTargetMinutes] = useState(8)

 const [blueprint, setBlueprint] = useState<ScriptBlueprint | null>(null)
 const [loading, setLoading] = useState(false)
 const [status, setStatus] = useState<string | null>(null)
 const [isOpen, setIsOpen] = useState(isOpenInitial)

 const runtimeTargetSeconds = Math.round(runtimeTargetMinutes * 60)

 const runtimeDrift = useMemo(() => {
  if (!blueprint) return 0
  return blueprint.runtimeEstimate - runtimeTargetSeconds
 }, [blueprint, runtimeTargetSeconds])

 const fullScript = useMemo(() => {
  if (!blueprint) return ""
  return blueprint.beats
   .map(
    (beat, index) =>
     `${index + 1}. ${beat.label.toUpperCase()} (${formatClock(beat.durationEstimate)})\n${beat.script}\n\nTRANSITION: ${beat.transition}`,
   )
   .join("\n\n---\n\n")
 }, [blueprint])

 const handleGenerate = async () => {
  if (!angle.trim()) {
   alert("Add the chosen angle or concept first.")
   return
  }
  setLoading(true)
  setStatus(null)
  try {
   const result = await generateScriptBlueprint(
    {
     angle: angle.trim(),
     targetViewer: targetViewer.trim(),
     proofPoints: proofPoints.trim(),
     format,
     beatCount,
     runtimeTargetMinutes,
     transitionNotes: transitionNotes.trim(),
    },
    brain,
   )
   setBlueprint(result)
  } catch (e) {
   console.error("[ScriptArchitect] generation failed", e)
   alert("Failed to build the script structure. Please try again.")
  } finally {
   setLoading(false)
  }
 }

 const handleCopyScript = async () => {
  if (!fullScript) return
  try {
   await navigator.clipboard.writeText(fullScript)
   setStatus("Full script copied to clipboard.")
  } catch {
   setStatus("Clipboard blocked by the browser. Select the beats manually.")
  }
 }

 const handleSavePacket = async () => {
  if (!blueprint) return
  const inputs = {
   angle: angle.trim(),
   targetViewer: targetViewer.trim(),
   proofPoints: proofPoints.trim(),
   transitionNotes: transitionNotes.trim(),
   format,
   beatCount,
   runtimeTargetMinutes,
  }
  const confidence =
   blueprint.missingProof.length === 0 && blueprint.weakTransitions.length === 0
    ? "high"
    : blueprint.missingProof.length > 2 || blueprint.weakTransitions.length > 2
      ? "low"
      : "medium"

  const result = createSuperToolActionPacket({
   toolId: "creator-canvas-os",
   moduleId: "script-architect",
   title: `${blueprint.title} script beat packet`,
   summary: `Structured ${blueprint.beats.length} beats for ${blueprint.title} at ${formatClock(blueprint.runtimeEstimate)} against a ${formatClock(runtimeTargetSeconds)} target, with proof order and transition risks recorded.`,
   inputs,
   outputs: {
    promise: blueprint.promise,
    beats: blueprint.beats,
    proofOrder: blueprint.proofOrder,
    runtimeEstimate: blueprint.runtimeEstimate,
    storyboardHandoff: blueprint.storyboardHandoff,
   },
   confidence,
   evidence: [inputs.angle, ...blueprint.proofOrder].filter(Boolean),
   missingInputs: [
    inputs.targetViewer ? null : "target viewer",
    inputs.proofPoints ? null : "proof points",
    ...blueprint.missingProof,
   ].filter(Boolean) as string[],
   handoffTargets: [
    "editor:motion-scene-builder",
    "projects:project-command-kanban",
    "workflow:workflow-chain-builder",
   ],
   workflowTitle: `${blueprint.title} script to scenes`,
   workflowGoal:
    "Move a locked beat structure into scene planning, production milestones, and editor handoff.",
   workflowSteps: [
    {
     title: "Convert beats to scenes",
     surface: "editor",
     toolId: "motion-scene-builder",
     details:
      blueprint.storyboardHandoff.join(" | ") ||
      `Break ${blueprint.beats.length} beats into scene, asset, and motion prompts.`,
    },
    {
     title: "Schedule production",
     surface: "projects",
     toolId: "project-command-kanban",
     details: `Plan filming and edit milestones for a ${formatClock(blueprint.runtimeEstimate)} runtime.`,
    },
    {
     title: "Track script revisions",
     surface: "workflow",
     toolId: "workflow-chain-builder",
     details:
      blueprint.weakTransitions.length > 0
       ? `Resolve weak transitions: ${blueprint.weakTransitions.join("; ")}`
       : "Keep the beat order connected to packaging and retention follow-up.",
    },
   ],
   tags: ["script-architect", confidence, format],
  })

  await emitSignal("SCRIPT_ARCHITECT", "SCRIPT_BEAT_PACKET_CREATED", result)
  setStatus("Script beat packet saved with Vault artifact, workflow chain, and storyboard handoff.")
 }

 return (
  <ToolboxScaffold
   title="SCRIPT ARCHITECT"
   subtitle="Turn a chosen angle into beats, proof order, transitions + storyboard-ready scene packets"
   icon={<NotebookPen size={40} strokeWidth={3} className="text-black" />}
   headerColor="bg-[#00F0FF]"
   iconBoxColor="bg-[#CCFF00]"
   paletteIndex={paletteIndex}
   collapsible={collapsible}
   isOpen={isOpen}
   onToggle={() => setIsOpen(!isOpen)}
   embedded={embedded}
   helpText="Give it the angle you already picked plus the proof you actually have. It returns an ordered beat structure with durations, transitions, and a list of every claim you still need to back up."
   shellClassName="animate-fade-in"
   contentClassName={embedded ? "p-0" : "p-8"}>
   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    {/* Inputs */}
    <div className="lg:col-span-1 space-y-6 flex flex-col h-full">
     <SubToolbox
      title="Structure Inputs"
      icon={<NotebookPen size={20} strokeWidth={3} />}
      collapsible
      isOpenInitial={true}>
      <div className="p-6 space-y-6 bg-white">
       <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-black/50 ml-1">
         Chosen Angle / Concept
        </label>
        <StandardTextArea
         value={angle}
         onChange={(e) => setAngle(e.target.value)}
         placeholder="THE ANGLE YOU ALREADY PICKED, NOT THE RAW TOPIC..."
         minHeight="120px"
         className="uppercase focus:bg-gray-50"
        />
       </div>

       <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-black/50 ml-1">
         Target Viewer
        </label>
        <StandardInput
         value={targetViewer}
         onChange={(e) => setTargetViewer(e.target.value)}
         placeholder="WHO THIS IS FOR"
        />
       </div>

       <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-black/50 ml-1">
         Proof Points You Have
        </label>
        <StandardTextArea
         value={proofPoints}
         onChange={(e) => setProofPoints(e.target.value)}
         placeholder="RESULTS, EXAMPLES, DEMOS, RECEIPTS, SOURCES..."
         minHeight="110px"
         className="uppercase focus:bg-gray-50"
        />
       </div>

       <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
         <label className="text-[10px] font-black uppercase tracking-widest text-black/50 ml-1">
          Beat Count
         </label>
         <StandardInput
          type="number"
          min={3}
          max={14}
          value={beatCount}
          onChange={(e) =>
           setBeatCount(Math.min(14, Math.max(3, Number(e.target.value) || 3)))
          }
         />
        </div>
        <div className="space-y-2">
         <label className="text-[10px] font-black uppercase tracking-widest text-black/50 ml-1">
          Runtime (Min)
         </label>
         <StandardInput
          type="number"
          min={1}
          max={90}
          value={runtimeTargetMinutes}
          onChange={(e) =>
           setRuntimeTargetMinutes(Math.min(90, Math.max(1, Number(e.target.value) || 1)))
          }
         />
        </div>
       </div>

       <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-black/50 ml-1">
         Format
        </label>
        <StandardDropdown options={FORMAT_OPTIONS} value={format} onChange={setFormat} />
       </div>

       <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-black/50 ml-1">
         Transition / Constraint Notes
        </label>
        <StandardTextArea
         value={transitionNotes}
         onChange={(e) => setTransitionNotes(e.target.value)}
         placeholder="SPONSOR SLOT, RECURRING SEGMENT, TONE LIMITS, MUST-HIT MOMENTS..."
         minHeight="90px"
         className="uppercase focus:bg-gray-50"
        />
       </div>

       <button
        onClick={handleGenerate}
        disabled={loading || !angle.trim()}
        className="w-full bg-[#00F0FF] border-[4px] border-black p-4 font-black uppercase text-xl rounded-xl shadow-[4px_4px_0px_0px_black] hover:shadow-none hover:translate-y-0.5 transition-all disabled:opacity-50">
        {loading ? "STRUCTURING BEATS..." : "BUILD SCRIPT STRUCTURE"}
       </button>
      </div>
     </SubToolbox>
    </div>

    {/* Output */}
    <div className="lg:col-span-1 space-y-6 flex flex-col h-full">
     {loading ? (
      <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-[4px] border-dashed border-black/20 rounded-[32px] bg-gray-50">
       <div className="w-20 h-20 bg-[#00F0FF] border-[4px] border-black rounded-full animate-ping mb-8 shadow-[6px_6px_0px_0px_black]"></div>
       <p className="font-black text-2xl text-black/40 uppercase tracking-widest animate-pulse">
        Ordering Proof + Beats...
       </p>
      </div>
     ) : blueprint ? (
      <div className="space-y-8">
       {/* Summary */}
       <div className="bg-white border-[4px] border-black rounded-[24px] shadow-[8px_8px_0px_0px_black] overflow-hidden">
        <div className="bg-[#00F0FF] p-6 border-b-[4px] border-black">
         <h2 className="text-3xl font-[1000] uppercase tracking-tighter text-black leading-none">
          {blueprint.title}
         </h2>
         <p className="text-sm font-black text-black/60 mt-2 uppercase tracking-widest">
          {blueprint.promise}
         </p>
        </div>
        <div className="grid grid-cols-3 divide-x-[4px] divide-black border-b-[4px] border-black">
         <div className="p-4 text-center">
          <div className="text-[10px] font-black uppercase tracking-widest text-black/40">
           Beats
          </div>
          <div className="text-3xl font-[1000]">{blueprint.beats.length}</div>
         </div>
         <div className="p-4 text-center">
          <div className="text-[10px] font-black uppercase tracking-widest text-black/40">
           Runtime
          </div>
          <div className="text-3xl font-[1000]">{formatClock(blueprint.runtimeEstimate)}</div>
         </div>
         <div className="p-4 text-center">
          <div className="text-[10px] font-black uppercase tracking-widest text-black/40">
           Vs Target
          </div>
          <div
           className={`text-3xl font-[1000] ${Math.abs(runtimeDrift) > runtimeTargetSeconds * 0.15 ? "text-[#FF4FD8]" : "text-black"}`}>
           {runtimeDrift >= 0 ? "+" : "-"}
           {formatClock(Math.abs(runtimeDrift))}
          </div>
         </div>
        </div>
        {blueprint.proofOrder.length > 0 ? (
         <div className="p-6">
          <h3 className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mb-3">
           Proof Order
          </h3>
          <ol className="space-y-2">
           {blueprint.proofOrder.map((proof, index) => (
            <li
             key={index}
             className="flex gap-3 text-sm font-bold uppercase text-black leading-snug">
             <span className="font-[1000] text-black/30">{index + 1}</span>
             <span>{proof}</span>
            </li>
           ))}
          </ol>
         </div>
        ) : null}
       </div>

       {/* Beats */}
       {blueprint.beats.map((beat, index) => (
        <div
         key={beat.id}
         className="bg-white border-[4px] border-black rounded-[24px] shadow-[8px_8px_0px_0px_black] overflow-hidden">
         <div className="bg-[#CCFF00] p-6 border-b-[4px] border-black flex justify-between items-start gap-4">
          <div>
           <h3 className="text-2xl font-[1000] uppercase tracking-tighter text-black leading-none">
            {beat.label}
           </h3>
           <p className="text-xs font-black text-black/60 mt-2 uppercase tracking-widest">
            {beat.purpose}
           </p>
          </div>
          <div className="text-right shrink-0">
           <div className="text-3xl font-black text-black/20">#{index + 1}</div>
           <div className="text-xs font-black uppercase tracking-widest text-black/60">
            {formatClock(beat.durationEstimate)}
           </div>
          </div>
         </div>

         <div className="p-6 space-y-5">
          <div className="bg-gray-50 p-5 rounded-xl border-[4px] border-black">
           <h4 className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mb-2">
            Script
           </h4>
           <p className="text-base font-bold text-black leading-relaxed">{beat.script}</p>
          </div>

          <div className="bg-[#57F15C]/20 p-4 rounded-xl border-[3px] border-black">
           <h4 className="text-[10px] font-black text-black/50 uppercase tracking-[0.2em] mb-1">
            Proof In This Beat
           </h4>
           <p className="text-sm font-black text-black uppercase">{beat.proof}</p>
          </div>

          <div className="bg-[#FFEA5A]/30 p-4 rounded-xl border-[3px] border-black">
           <h4 className="text-[10px] font-black text-black/50 uppercase tracking-[0.2em] mb-1">
            Transition Out
           </h4>
           <p className="text-sm font-black text-black uppercase">{beat.transition}</p>
          </div>

          <div className="flex items-center gap-3">
           <span
            className={`px-3 py-1 border-[3px] border-black rounded-lg text-[10px] font-black uppercase tracking-widest ${RISK_TONE[beat.retentionRisk] || RISK_TONE.medium}`}>
            {beat.retentionRisk} risk
           </span>
           <span className="text-xs font-bold text-black/60 uppercase">{beat.riskNote}</span>
          </div>
         </div>
        </div>
       ))}

       {/* Self-audit */}
       {blueprint.weakTransitions.length > 0 || blueprint.missingProof.length > 0 ? (
        <div className="bg-white border-[4px] border-black rounded-[24px] shadow-[8px_8px_0px_0px_black] overflow-hidden">
         <div className="bg-[#FF4FD8] p-5 border-b-[4px] border-black flex items-center gap-3">
          <AlertTriangle size={24} strokeWidth={3} className="text-white" />
          <h3 className="text-xl font-[1000] uppercase tracking-tighter text-white">
           Fix Before Filming
          </h3>
         </div>
         <div className="p-6 space-y-5">
          {blueprint.weakTransitions.length > 0 ? (
           <div>
            <h4 className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mb-2">
             Weak Transitions
            </h4>
            <ul className="space-y-2">
             {blueprint.weakTransitions.map((item, index) => (
              <li key={index} className="text-sm font-bold uppercase text-black leading-snug">
               • {item}
              </li>
             ))}
            </ul>
           </div>
          ) : null}
          {blueprint.missingProof.length > 0 ? (
           <div>
            <h4 className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mb-2">
             Claims Without Proof
            </h4>
            <ul className="space-y-2">
             {blueprint.missingProof.map((item, index) => (
              <li key={index} className="text-sm font-bold uppercase text-black leading-snug">
               • {item}
              </li>
             ))}
            </ul>
           </div>
          ) : null}
         </div>
        </div>
       ) : null}

       {/* Storyboard handoff */}
       {blueprint.storyboardHandoff.length > 0 ? (
        <div className="bg-white border-[4px] border-black rounded-[24px] shadow-[8px_8px_0px_0px_black] overflow-hidden">
         <div className="bg-[#00F0FF] p-5 border-b-[4px] border-black flex items-center gap-3">
          <ShieldCheck size={24} strokeWidth={3} className="text-black" />
          <h3 className="text-xl font-[1000] uppercase tracking-tighter text-black">
           Storyboard Handoff
          </h3>
         </div>
         <ul className="p-6 space-y-2">
          {blueprint.storyboardHandoff.map((item, index) => (
           <li key={index} className="text-sm font-bold uppercase text-black leading-snug">
            • {item}
           </li>
          ))}
         </ul>
        </div>
       ) : null}

       {/* Actions */}
       <div className="flex flex-col md:flex-row gap-4">
        <button
         onClick={handleCopyScript}
         className="flex-1 inline-flex items-center justify-center gap-2 bg-white border-[4px] border-black p-4 font-black uppercase text-sm rounded-xl shadow-[4px_4px_0px_0px_black] hover:shadow-none hover:translate-y-0.5 transition-all">
         <ClipboardCopy size={18} strokeWidth={3} /> Copy Full Script
        </button>
        <button
         onClick={handleSavePacket}
         className="flex-1 bg-[#CCFF00] border-[4px] border-black p-4 font-black uppercase text-sm rounded-xl shadow-[4px_4px_0px_0px_black] hover:shadow-none hover:translate-y-0.5 transition-all">
         Save Beat Packet + Handoff
        </button>
       </div>

       {status ? (
        <div className="rounded-xl border-[3px] border-black bg-[#FFEA5A] px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-black/70">
         {status}
        </div>
       ) : null}

       <div className="animate-in slide-in-from-bottom-4 duration-700">
        <PostActionReflection toolId="SCRIPT_ARCHITECT" />
       </div>
      </div>
     ) : (
      <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-[4px] border-dashed border-black/20 rounded-[32px] bg-gray-50 p-8 text-center">
       <NotebookPen size={80} className="text-black/20 mb-6" />
       <h3 className="text-3xl font-[1000] text-black/40 uppercase tracking-tighter mb-2">
        Angle In, Beats Out
       </h3>
       <p className="text-black/30 font-bold max-w-md uppercase">
        Drop the angle you already chose on the left. You get an ordered beat structure with
        proof placement, transitions, runtime, and every claim you still need to back up.
       </p>
      </div>
     )}
    </div>
   </div>
  </ToolboxScaffold>
 )
}

export default ScriptArchitect
