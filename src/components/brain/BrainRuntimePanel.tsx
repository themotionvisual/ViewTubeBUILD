import React from "react"
import {
 Activity,
 Boxes,
 Brain,
 FileStack,
 GitBranch,
 Layers3,
 ReceiptText,
 Sparkles,
 Workflow,
} from "lucide-react"

import type {
 BrainRuntimeSnapshot,
} from "../../services/brain/BrainRuntimeSnapshot"

export interface BrainRuntimePanelProps {
 snapshot: BrainRuntimeSnapshot
 embedded?: boolean
}

const INK = "#26324A"

const titleCase = (value: string | null | undefined): string =>
 String(value || "")
  .replace(/[._-]+/g, " ")
  .replace(/\b\w/g, match => match.toUpperCase())

const modelLabel = (value: string | null | undefined): string => {
 if (!value) return ""
 return value
  .replace(/^gemini[-_ ]*/i, "Gemini ")
  .replace(/[-_]+/g, " ")
  .replace(/\bpro\b/i, "Pro")
  .trim()
}

const compactId = (value: string | null | undefined): string => {
 if (!value) return "—"
 if (value.length <= 18) return value
 return `${value.slice(0, 8)}…${value.slice(-6)}`
}

const formatLatency = (latencyMs: number | null): string => {
 if (latencyMs === null) return "—"
 if (latencyMs < 1000) return `${latencyMs}ms`
 return `${(latencyMs / 1000).toFixed(latencyMs >= 10000 ? 0 : 1)}s`
}

const RuntimeCell: React.FC<{
 label: string
 value: React.ReactNode
 detail: React.ReactNode
 icon: React.ReactNode
 accent: string
}> = ({ label, value, detail, icon, accent }) => (
 <article
  className="min-w-0 overflow-hidden rounded-[9px] border-[2px] bg-white"
  style={{ borderColor: INK }}
 >
  <div
   className="flex min-h-7 items-center gap-1.5 border-b-[2px] px-2 py-1"
   style={{ backgroundColor: accent, borderColor: INK }}
  >
   <span className="grid h-5 w-5 shrink-0 place-items-center rounded-[5px] bg-white/75" aria-hidden="true">
    {icon}
   </span>
   <span className="min-w-0 break-words text-[9px] font-[1000] uppercase tracking-[0.1em] md:truncate" style={{ color: INK }}>
    {label}
   </span>
  </div>
  <div className="grid min-h-[54px] content-center gap-0.5 px-2 py-1.5" style={{ color: INK }}>
   <div className="min-w-0 break-words text-[11px] font-[1000] leading-4 md:truncate">{value}</div>
   <div className="text-[9px] font-bold leading-[12px] opacity-65 md:line-clamp-2">{detail}</div>
  </div>
 </article>
)

const RuntimePill: React.FC<{
 label: string
 value: React.ReactNode
}> = ({ label, value }) => (
 <span
  className="inline-flex min-h-6 items-center gap-1 rounded-[6px] border px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.06em]"
  style={{ borderColor: `${INK}55`, color: INK, backgroundColor: "#ffffffb8" }}
 >
  <span className="opacity-55">{label}</span>
  <strong className="text-[9px]">{value}</strong>
 </span>
)

export const BrainRuntimePanel: React.FC<BrainRuntimePanelProps> = ({ snapshot, embedded = false }) => {
 const { project, build, generation, brain, outcomes, lifecycle } = snapshot
 const request = generation.latestRequest
 const receipt = generation.latestReceipt
 const trace = brain.latestTrace

 return (
  <section
   aria-label="Live Brain runtime"
   data-vt-brain-runtime-shell={embedded ? "flat" : "card"}
   className={embedded
    ? "overflow-visible bg-[#F8FAFC]"
    : "overflow-hidden rounded-[11px] border-[2px] bg-[#F8FAFC] shadow-[3px_3px_0_0_rgba(38,50,74,0.16)]"}
   style={embedded ? undefined : { borderColor: INK }}
  >
   <header
    className="flex flex-wrap items-center justify-between gap-2 border-b-[2px] px-2.5 py-1.5"
    style={{ borderColor: INK, backgroundColor: "#36E0F6" }}
   >
    <div className="flex min-w-0 items-center gap-2">
     <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[7px] bg-white/80" aria-hidden="true">
      <Brain size={16} strokeWidth={2.5} />
     </span>
     <div className="min-w-0">
      <h2 className="max-md:whitespace-normal md:truncate text-[11px] font-[1000] uppercase leading-4 tracking-[0.11em]" style={{ color: INK }}>
       LIVE BRAIN RUNTIME
      </h2>
      <p className="max-md:whitespace-normal md:truncate text-[9px] font-bold leading-3 opacity-65" style={{ color: INK }}>
       Project → ContentBuild → Context → Generation → Receipt → learning
      </p>
     </div>
    </div>
    <div className="flex flex-wrap gap-1">
     <RuntimePill label="Capabilities" value={brain.capabilityCount} />
     <RuntimePill label="Outcomes" value={outcomes.total} />
     <RuntimePill label="Accepted" value={`${outcomes.acceptanceRate}%`} />
    </div>
   </header>

   <div className="grid grid-cols-2 gap-1.5 p-2 md:grid-cols-3 xl:grid-cols-6">
    <RuntimeCell
     label="Project"
     icon={<Sparkles size={13} strokeWidth={2.5} />}
     accent="#FFDA47"
     value={project?.name || "No active project"}
     detail={project ? `${titleCase(project.status)} · ${compactId(project.id)}` : "Brain is operating channel-wide."}
    />
    <RuntimeCell
     label="ContentBuild"
     icon={<Boxes size={13} strokeWidth={2.5} />}
     accent="#A8DC4A"
     value={build ? `${titleCase(build.stage)} · r${build.revision}` : "No build bound"}
     detail={build
      ? `${build.assetCount} assets · ${build.versionCount} versions · ${build.variantGroupCount} variant groups`
      : "Open or create a Project to bind durable work."}
    />
    <RuntimeCell
     label="Context"
     icon={<FileStack size={13} strokeWidth={2.5} />}
     accent="#34CDEA"
     value={request ? `Revision ${request.contextRevision}` : "No context yet"}
     detail={request
      ? `${request.requestedSlotCount} slots · ${request.selectedAssetCount} selected · ${request.evidenceCount} evidence refs`
      : "A generative tool has not prepared context yet."}
    />
    <RuntimeCell
     label="Generation"
     icon={<Workflow size={13} strokeWidth={2.5} />}
     accent="#8C68E8"
     value={request ? titleCase(request.toolId) : "No request yet"}
     detail={request
      ? `${titleCase(request.mode)} ${titleCase(request.targetSlot)} · ${generation.requestCount} total requests`
      : "GenerationRequest history will appear here."}
    />
    <RuntimeCell
     label="Receipt"
     icon={<ReceiptText size={13} strokeWidth={2.5} />}
     accent="#F36BB5"
     value={receipt ? `${receipt.outputAssetCount} outputs` : "No receipt yet"}
     detail={receipt
      ? `${receipt.versionCount} versions · ${receipt.variantGroupId ? "variant group linked" : "no variant group"} · ${generation.receiptCount} receipts`
      : "Tool outputs have not closed a generation request."}
    />
    <RuntimeCell
     label="Brain Trace"
     icon={<Activity size={13} strokeWidth={2.5} />}
     accent="#50C878"
     value={trace?.modelServed ? modelLabel(trace.modelServed) : (trace ? titleCase(trace.status) : "No trace yet")}
     detail={trace
      ? `${titleCase(trace.kind)} · ${trace.evidenceReturned} evidence · ${trace.gradeAverage ?? "—"} grade · ${formatLatency(trace.latencyMs)}`
      : "Model, evidence, grading, repair, and latency will appear here."}
    />
   </div>

   <footer
    className="flex flex-wrap items-center gap-1 border-t px-2 py-1.5"
    style={{ borderColor: `${INK}44`, color: INK, backgroundColor: "#EEF2F7" }}
   >
    <RuntimePill label="Selected" value={build?.selectedSlotCount || 0} />
    <RuntimePill label="Relations" value={build?.relationCount || 0} />
    <RuntimePill label="Events" value={build?.eventCount || 0} />
    <RuntimePill label="YouTube" value={titleCase(build?.youtubeStatus || "unbound")} />
    <RuntimePill label="Trace" value={trace ? titleCase(trace.status) : "none"} />
    <RuntimePill label="Evidence gaps" value={trace?.evidenceMissing || 0} />
    <RuntimePill label="Repairs" value={trace?.repairAttempts || 0} />
    <RuntimePill label="Publish events" value={lifecycle.publishEventCount} />
    <RuntimePill label="Analytics" value={lifecycle.analyticsCheckpointCount} />
    <RuntimePill label="Latest" value={titleCase(lifecycle.latestEventType || "no build event")} />
    <span className="ml-auto hidden items-center gap-1 text-[8px] font-black uppercase tracking-[0.06em] opacity-50 md:inline-flex">
     <GitBranch size={11} aria-hidden="true" />
     <span>{compactId(receipt?.requestId || request?.id)}</span>
     <Layers3 size={11} aria-hidden="true" />
     <span>{brain.traceCount} traces</span>
    </span>
   </footer>
  </section>
 )
}

export default BrainRuntimePanel
