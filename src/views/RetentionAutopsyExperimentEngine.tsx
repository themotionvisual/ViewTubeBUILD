import React, { useMemo, useState } from "react"
import { AlertTriangle, BarChart3, CheckCircle2, FlaskConical, LineChart, ListChecks, Plus, Workflow, Zap } from "lucide-react"
import { SuperToolRail } from "../components/SuperToolRail"
import { useBrain } from "../context/useBrain"
import { listSuperToolsByIds } from "../services/superToolRegistry"
import { createWorkflowChain, createWorkflowStep, listWorkflowChains } from "../services/workflowEngine"
import type { SuperToolId } from "../types"
import SuperToolPrototypeWorkspace, {
 type PrototypeWorkspaceConfig,
} from "./supertools/SuperToolPrototypeWorkspace"

type RetentionVideoSignal = {
 id: string
 title: string
 retention: number
 ctr: number
 views: number
 durationSeconds: number
 source: string
 confidence: "high" | "medium" | "low"
 evidence: string[]
}

type ExperimentRecord = {
 id: string
 videoId: string
 title: string
 hypothesis: string
 intervention: string
 metric: string
 status: "queued" | "running" | "review"
 createdAt: number
 evidence: string[]
}

const RETENTION_EXPERIMENT_STORAGE_KEY = "vt_retention_experiments_v1"

const TOOL_IDS = [
 "retention-autopsy-experiment-engine",
 "cinematic-analytics-lab",
 "brain-command-center",
 "workflow-chain-builder",
] as const

const toolModules = [
 {
  title: "Retention Curve Intake",
  icon: <LineChart size={20} />,
  tone: "bg-[#00F0FF]",
  body: "Pulls saved retention reports, yt_analytics_cache rows, or demo placeholders with confidence labels.",
  controls: ["video selector", "source type", "confidence", "missing-data flag"],
  outputKind: "retention evidence queue",
  integrations: ["Performance Hub", "yt_analytics_cache", "Retention CSV import"],
  selfImprovementSignal: "records which videos lack measured retention curves",
 },
 {
  title: "Drop-off Autopsy",
  icon: <AlertTriangle size={20} />,
  tone: "bg-[#FF4FD8] text-white",
  body: "Classifies hook cliffs, hidden gems, mid-video sags, and missing-data states using concrete failure modes.",
  controls: ["autopsy type", "severity", "metric", "evidence"],
  outputKind: "failure-mode diagnosis",
  integrations: ["Cinematic Analytics", "Packaging Lab", "Creator Canvas"],
  selfImprovementSignal: "compares diagnoses against later experiment results",
 },
 {
  title: "Hypothesis Builder",
  icon: <Zap size={20} />,
  tone: "bg-[#FFEA5A]",
  body: "Converts the diagnosis into a testable claim, intervention, metric, and confidence boundary.",
  controls: ["hypothesis", "intervention", "metric", "confidence"],
  outputKind: "testable hypothesis packet",
  integrations: ["Project Command", "Brain Command", "GenerationRecord"],
  selfImprovementSignal: "flags hypotheses that are not measurable yet",
 },
 {
  title: "Experiment Queue",
  icon: <FlaskConical size={20} />,
  tone: "bg-[#CCFF00]",
  body: "Queues packaging, hook, edit, or schedule experiments and creates workflow chains with owners.",
  controls: ["experiment status", "owner", "date", "success criterion"],
  outputKind: "queued experiment record",
  integrations: ["Workflow Chain", "Project Command", "Packaging Lab"],
  selfImprovementSignal: "records whether queued experiments get executed or stall",
 },
 {
  title: "Confidence/Evidence Board",
  icon: <ListChecks size={20} />,
  tone: "bg-[#00F0FF]",
  body: "Shows source evidence, confidence, skipped checks, and next-agent notes for every recommendation.",
  controls: ["evidence chips", "confidence", "skipped scope", "next check"],
  outputKind: "evidence and confidence strip",
  integrations: ["Brain signal", "Vault artifact", "Workflow provenance"],
  selfImprovementSignal: "prevents retention claims without source evidence",
 },
]

const retentionPrototypeConfig: PrototypeWorkspaceConfig = {
 toolId: "retention-autopsy-experiment-engine",
 title: "Retention Engine Prototype",
 description: "Early retention workspace for video selection, curve review, autopsy reasoning, hypotheses, and queued experiments.",
 lanes: [
  { id: "video-queue", title: "Video Queue", description: "Retention targets and confidence", tone: "bg-[#00F0FF]" },
  { id: "retention-curve", title: "Retention Curve Mock", description: "Hook, sag, payoff shape", tone: "bg-[#CCFF00]" },
  { id: "autopsy-board", title: "Autopsy Board", description: "Failure mode diagnosis", tone: "bg-[#FF4FD8] text-white" },
  { id: "hypothesis-builder", title: "Hypothesis Builder", description: "Testable claim and intervention", tone: "bg-[#FFEA5A]" },
  { id: "experiment-queue", title: "Experiment Queue", description: "Owner, metric, and workflow handoff", tone: "bg-[#CCFF00]" },
 ],
 cards: [
  {
   id: "video-hook-cliff",
   laneId: "video-queue",
   title: "High CTR, weak retention",
   summary: "Video earns the click but likely fails the opening promise.",
   status: "active",
   priority: "urgent",
   chips: ["CTR", "retention"],
   controls: ["video selector", "confidence"],
   output: "retention evidence queue",
   integrations: ["Performance Hub"],
   handoffTarget: "Retention Curve",
  },
  {
   id: "curve-first-drop",
   laneId: "retention-curve",
   title: "First 30% drop",
   summary: "Mock curve highlights a hook cliff before the first proof beat.",
   status: "queued",
   priority: "high",
   chips: ["curve", "hook"],
   controls: ["metric", "threshold"],
   output: "curve diagnosis",
   integrations: ["Cinematic Analytics"],
   handoffTarget: "Autopsy Board",
  },
  {
   id: "autopsy-promise-mismatch",
   laneId: "autopsy-board",
   title: "Promise mismatch",
   summary: "Opening setup delays the payoff promised by title and thumbnail.",
   status: "blocked",
   priority: "urgent",
   blocker: "Need exact retention curve or transcript evidence",
   chips: ["hook cliff", "opening"],
   controls: ["severity", "evidence"],
   output: "failure-mode diagnosis",
   integrations: ["Packaging Lab", "Creator Canvas"],
   handoffTarget: "Hypothesis Builder",
  },
  {
   id: "hypothesis-proof-earlier",
   laneId: "hypothesis-builder",
   title: "Move proof earlier",
   summary: "Test whether the first proof beat inside 15 seconds improves average view percentage.",
   status: "ready",
   priority: "high",
   chips: ["hypothesis", "metric"],
   controls: ["intervention", "confidence"],
   output: "testable hypothesis packet",
   integrations: ["Project Command"],
   handoffTarget: "Experiment Queue",
  },
  {
   id: "experiment-packaging",
   laneId: "experiment-queue",
   title: "Hook rewrite experiment",
   summary: "Queue a measurable rewrite and route it to projects and Brain learning.",
   status: "queued",
   priority: "high",
   chips: ["queued", "workflow"],
   controls: ["owner", "success criterion"],
   output: "queued experiment record",
   integrations: ["Workflow Chain", "Brain Command"],
   handoffTarget: "Project Command",
  },
 ],
 controls: ["select video", "move diagnosis", "mark blocker", "mark experiment ready"],
 evidence: ["retention report", "yt_analytics_cache", "CTR", "confidence label"],
 handoffTargets: ["Packaging Lab", "Project Command", "Brain Command"],
}

const safeNumber = (value: unknown, fallback = 0): number => {
 const parsed =
  typeof value === "number" ? value
  : typeof value === "string" ? Number(value.replace(/,/g, "").replace("%", ""))
  : Number.NaN
 return Number.isFinite(parsed) ? parsed : fallback
}

const canUseStorage = () => typeof window !== "undefined" && typeof localStorage !== "undefined"

const readJson = <T,>(key: string, fallback: T): T => {
 if (!canUseStorage()) return fallback
 try {
  const raw = localStorage.getItem(key)
  return raw ? (JSON.parse(raw) as T) : fallback
 } catch {
  return fallback
 }
}

const writeExperiments = (experiments: ExperimentRecord[]) => {
 if (!canUseStorage()) return
 localStorage.setItem(RETENTION_EXPERIMENT_STORAGE_KEY, JSON.stringify(experiments))
}

const readRetentionReports = (): RetentionVideoSignal[] => {
 const reports = readJson<Record<string, any>>("vt_retention_reports", {})
 return Object.entries(reports).map(([videoId, report], index) => ({
  id: videoId,
  title: String(report?.title || report?.videoTitle || `Retention report ${index + 1}`),
  retention: safeNumber(report?.hookScore || report?.retention || report?.averageRetention, 55),
  ctr: safeNumber(report?.ctr || report?.thumbnailCtr, 3.5),
  views: safeNumber(report?.views, 0),
  durationSeconds: safeNumber(report?.durationSeconds, 600),
  source: "vt_retention_reports",
  confidence: "medium",
  evidence: ["Dashboard RetentionSimWidget saved report"],
 }))
}

const readYouTubeCacheSignals = (): RetentionVideoSignal[] => {
 const cache = readJson<any>("yt_analytics_cache", null)
 const videos = Array.isArray(cache?.videos) ? cache.videos : []
 return videos.slice(0, 80).map((video: any, index: number) => {
  const title = String(video?.title || video?.snippet?.title || `Video ${index + 1}`)
  const videoId = String(video?.videoId || video?.id || `yt-cache-${index}`)
  const stats = video?.statistics || video?.analytics || video
  const durationSeconds = safeNumber(video?.durationSeconds || video?.durationSec || stats?.durationSeconds, 600)
  const views = safeNumber(stats?.views || stats?.viewCount || stats?.lifetimeViews, 0)
  const ctr = safeNumber(stats?.ctr || stats?.impressionClickThroughRate || stats?.thumbnailCtr, 0)
  const retention = safeNumber(
   stats?.averageViewPercentage ||
    stats?.retention ||
    stats?.retentionPercent ||
    stats?.averagePercentageViewed,
   0,
  )
  return {
   id: videoId,
   title,
   retention,
   ctr,
   views,
   durationSeconds,
   source: "yt_analytics_cache",
   confidence: retention > 0 ? "high" : "low",
   evidence: [
    "yt_analytics_cache video inventory",
    retention > 0 ? "retention/average view percentage present" : "retention unavailable; using missing-data diagnosis",
   ],
  }
 })
}

const buildDemoSignals = (): RetentionVideoSignal[] => [
 {
  id: "demo-hook-cliff",
  title: "Demo: strong idea with early hook cliff",
  retention: 38,
  ctr: 6.2,
  views: 12800,
  durationSeconds: 540,
  source: "demo_fallback",
  confidence: "low",
  evidence: ["No measured retention data found; demo row shows the intended diagnosis model"],
 },
 {
  id: "demo-hidden-gem",
  title: "Demo: low CTR but strong retention",
  retention: 72,
  ctr: 1.9,
  views: 4200,
  durationSeconds: 720,
  source: "demo_fallback",
  confidence: "low",
  evidence: ["No measured retention data found; demo row shows packaging experiment logic"],
 },
]

const classifyAutopsy = (video: RetentionVideoSignal) => {
 if (video.retention <= 0) {
  return {
   label: "Retention data missing",
   severity: "blocked",
   hypothesis: "This video needs a retention deep sync or CSV import before the tool can make a measured diagnosis.",
   intervention: "Run retention deep sync or import audience-retention CSV, then return to this tool.",
   metric: "retention_curve_point_count",
   color: "bg-[#111] text-white",
  }
 }
 if (video.ctr >= 4 && video.retention < 45) {
  return {
   label: "Hook cliff",
   severity: "urgent",
   hypothesis: "Packaging earns the click, but the opening likely fails to deliver the promised payoff fast enough.",
   intervention: "Rewrite the first 15 seconds, move proof earlier, and add a visual pattern interrupt before the first explanation block.",
   metric: "first_30_percent_drop",
   color: "bg-[#FF4FD8] text-white",
  }
 }
 if (video.ctr < 3 && video.retention >= 60) {
  return {
   label: "Hidden gem",
   severity: "high-value",
   hypothesis: "The content holds viewers once they arrive, so the biggest lift likely comes from title and thumbnail packaging.",
   intervention: "Create a packaging A/B candidate with a clearer promise, stronger contrast, and more specific curiosity gap.",
   metric: "impression_click_through_rate",
   color: "bg-[#CCFF00] text-black",
  }
 }
 if (video.retention < 55) {
  return {
   label: "Mid-video sag",
   severity: "medium",
   hypothesis: "The video probably needs a second-act re-hook, tighter pacing, or a stronger transition into the main proof section.",
   intervention: "Add a re-hook at the 30-45 percent mark and cut any setup that repeats the opening promise.",
   metric: "average_view_percentage",
   color: "bg-[#FFEA5A] text-black",
  }
 }
 return {
  label: "Retention strength",
  severity: "watch",
  hypothesis: "This video appears to have reusable retention structure worth mining for future scripts and edits.",
  intervention: "Extract the opening pattern, pacing rhythm, and payoff sequence into Creator Canvas OS and VT_E1 guidance.",
  metric: "average_view_percentage",
  color: "bg-[#00F0FF] text-black",
 }
}

interface RetentionAutopsyExperimentEngineProps {
 embedded?: boolean
}

const RetentionAutopsyExperimentEngine: React.FC<RetentionAutopsyExperimentEngineProps> = ({
 embedded = false,
}) => {
 const { emitSignal } = useBrain()
 const [refreshTick, setRefreshTick] = useState(0)
 const [selectedVideoId, setSelectedVideoId] = useState<string>("")
 const [status, setStatus] = useState<string | null>(null)

 const tools = useMemo(() => listSuperToolsByIds([...TOOL_IDS]), [])
 const workflows = useMemo(() => listWorkflowChains(), [refreshTick])
 const experiments = useMemo(
  () => readJson<ExperimentRecord[]>(RETENTION_EXPERIMENT_STORAGE_KEY, []),
  [refreshTick],
 )
 const signals = useMemo(() => {
  const merged = [...readRetentionReports(), ...readYouTubeCacheSignals()]
  const unique = new Map<string, RetentionVideoSignal>()
  merged.forEach((video) => unique.set(video.id, video))
  const rows = Array.from(unique.values())
  return rows.length ? rows : buildDemoSignals()
 }, [refreshTick])

 const selectedVideo = signals.find((video) => video.id === selectedVideoId) || signals[0]
 const selectedAutopsy = selectedVideo ? classifyAutopsy(selectedVideo) : null
 const measuredCount = signals.filter((video) => video.retention > 0 && video.source !== "demo_fallback").length
 const urgentCount = signals.filter((video) => classifyAutopsy(video).severity === "urgent").length
 const hiddenGemCount = signals.filter((video) => classifyAutopsy(video).severity === "high-value").length

 const handleQueueExperiment = async () => {
  if (!selectedVideo || !selectedAutopsy) return
  const experiment: ExperimentRecord = {
   id: crypto.randomUUID(),
   videoId: selectedVideo.id,
   title: `${selectedAutopsy.label}: ${selectedVideo.title}`,
   hypothesis: selectedAutopsy.hypothesis,
   intervention: selectedAutopsy.intervention,
   metric: selectedAutopsy.metric,
   status: "queued",
   createdAt: Date.now(),
   evidence: selectedVideo.evidence,
  }
  writeExperiments([experiment, ...experiments])
  const chain = createWorkflowChain({
   title: experiment.title,
   goal: `Run a retention experiment and measure ${experiment.metric}.`,
   primaryToolId: "retention-autopsy-experiment-engine",
   steps: [
    createWorkflowStep("Confirm evidence", "analytics", "retention-autopsy-experiment-engine", selectedAutopsy.hypothesis),
    createWorkflowStep("Rewrite intervention", "studio", "packaging-lab-pro", selectedAutopsy.intervention),
    createWorkflowStep("Schedule experiment", "projects", "project-command-kanban", "Assign date, owner, and success criteria."),
    createWorkflowStep("Record learning", "brain", "brain-command-center", "Feed measured result back into the Brain."),
   ],
   provenance: [`retention-autopsy.${selectedVideo.source}.${selectedVideo.id}`],
  })
  await emitSignal("RETENTION_AUTOPSY_EXPERIMENT_ENGINE", "EXPERIMENT_QUEUED", {
   experimentId: experiment.id,
   workflowId: chain.id,
   videoId: selectedVideo.id,
   metric: experiment.metric,
   confidence: selectedVideo.confidence,
   evidence: selectedVideo.evidence,
   selfImprovement: {
    inputsUsed: [selectedVideo.source, "selected video", "classified autopsy"],
    inferred: selectedAutopsy.hypothesis,
    missing: selectedVideo.retention > 0 ? [] : ["measured retention curve"],
    handedOffTo: ["studio:packaging-lab-pro", "projects:project-command-kanban", "brain:brain-command-center"],
    improveNext: toolModules.map((module) => module.selfImprovementSignal),
   },
  })
  setStatus("Experiment queued and workflow chain created.")
  setRefreshTick((value) => value + 1)
 }

 return (
  <div className="mx-auto flex max-w-[1600px] flex-col gap-8 pb-24">
   {!embedded ? (
    <>
     <section className="rounded-[24px] border-[5px] border-black bg-[#111] px-8 py-8 text-white shadow-[12px_12px_0px_0px_#CCFF00]">
      <div className="text-[11px] font-black uppercase tracking-[0.35em] text-[#CCFF00]">
       Super-Tool 13
      </div>
      <h1 className="mt-3 text-5xl font-[1000] uppercase leading-none tracking-[-0.06em] md:text-6xl">
       Retention Autopsy and Experiment Engine
      </h1>
      <p className="mt-4 max-w-4xl text-sm font-bold uppercase tracking-[0.12em] text-white/70">
       Diagnose drop-off failure modes, queue measurable interventions, and send retention learning into Brain and workflow loops.
      </p>
     </section>

     <SuperToolRail
      title="Retention Experiment Layer"
      subtitle="Performance Hub evidence, intervention planning, workflow handoff, Brain learning"
      tools={tools}
      accentClassName="bg-[#CCFF00]"
      note="This tool owns diagnosis and experiment logic. Performance Hub remains the analytics source of truth."
     />
    </>
   ) : null}

   <section className="grid gap-8 xl:grid-cols-4">
    {[
     { label: "Videos inspected", value: signals.length, icon: <BarChart3 size={18} />, tone: "bg-[#00F0FF]" },
     { label: "Measured retention", value: measuredCount, icon: <LineChart size={18} />, tone: "bg-[#CCFF00]" },
     { label: "Hook cliffs", value: urgentCount, icon: <AlertTriangle size={18} />, tone: "bg-[#FF4FD8] text-white" },
     { label: "Queued experiments", value: experiments.length, icon: <FlaskConical size={18} />, tone: "bg-[#FFEA5A]" },
    ].map((metric) => (
     <article key={metric.label} className="rounded-[20px] border-[4px] border-black bg-white shadow-[7px_7px_0px_0px_black]">
      <div className={`${metric.tone} flex items-center gap-3 border-b-[4px] border-black px-5 py-4`}>
       {metric.icon}
       <div className="text-[10px] font-black uppercase tracking-[0.18em]">{metric.label}</div>
      </div>
      <div className="px-5 py-4 text-5xl font-[1000] leading-none tracking-[-0.05em]">{metric.value}</div>
     </article>
   ))}
  </section>

   <section className="rounded-[22px] border-[4px] border-black bg-white shadow-[8px_8px_0px_0px_black]">
    <div className="border-b-[4px] border-black bg-[#00F0FF] px-6 py-5">
     <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/55">
      Toolbox Modules
     </div>
     <div className="text-3xl font-[1000] uppercase tracking-[-0.05em]">
      Retention Experiment Construction
     </div>
    </div>
    <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
     {toolModules.map((module) => (
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
        <div className="rounded-[12px] border-[3px] border-black bg-white p-3">
         <div className="text-[10px] font-black uppercase tracking-[0.16em] text-black/45">Output</div>
         <div className="mt-1 text-xs font-black uppercase leading-5 tracking-[0.08em]">{module.outputKind}</div>
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
    <SuperToolPrototypeWorkspace config={retentionPrototypeConfig} />
   </div>

   <section className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
    <div className="rounded-[22px] border-[4px] border-black bg-white shadow-[8px_8px_0px_0px_black]">
     <div className="border-b-[4px] border-black bg-[#00F0FF] px-6 py-5">
      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/55">
       Evidence Queue
      </div>
      <div className="text-3xl font-[1000] uppercase tracking-[-0.05em]">
       Select Video
      </div>
     </div>
     <div className="grid max-h-[720px] gap-3 overflow-auto p-5">
      {signals.map((video) => {
       const autopsy = classifyAutopsy(video)
       const selected = selectedVideo?.id === video.id
       return (
        <button
         key={video.id}
         type="button"
         onClick={() => setSelectedVideoId(video.id)}
         className={`rounded-[16px] border-[4px] border-black px-4 py-3 text-left transition-transform hover:translate-x-1 ${
          selected ? "bg-[#CCFF00]" : "bg-[#f8f7f1]"
         }`}
        >
         <div className="flex items-start justify-between gap-3">
          <div>
           <div className="text-[10px] font-black uppercase tracking-[0.18em] text-black/55">
            {video.source} · {video.confidence} confidence
           </div>
           <div className="mt-1 text-lg font-[1000] uppercase tracking-[-0.03em]">{video.title}</div>
          </div>
          <div className={`rounded-[9px] border-[3px] border-black px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${autopsy.color}`}>
           {autopsy.label}
          </div>
         </div>
         <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-black/60">
          <span>Retention {video.retention || "n/a"}%</span>
          <span>CTR {video.ctr || "n/a"}%</span>
          <span>{video.views.toLocaleString()} views</span>
         </div>
        </button>
       )
      })}
     </div>
    </div>

    <div className="grid gap-8">
     <div className="rounded-[22px] border-[4px] border-black bg-white shadow-[8px_8px_0px_0px_black]">
      <div className="border-b-[4px] border-black bg-[#FF4FD8] px-6 py-5 text-white">
       <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/70">
        Autopsy
       </div>
       <div className="text-3xl font-[1000] uppercase tracking-[-0.05em]">
        Diagnosis and Intervention
       </div>
      </div>
      {selectedVideo && selectedAutopsy ? (
       <div className="grid gap-5 p-6">
        <div className="rounded-[18px] border-[4px] border-black bg-[#f8f7f1] p-5">
         <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
           <div className="text-[10px] font-black uppercase tracking-[0.18em] text-black/55">
            {selectedVideo.source} · {selectedVideo.confidence} confidence
           </div>
           <h2 className="mt-1 text-3xl font-[1000] uppercase leading-none tracking-[-0.05em]">
            {selectedVideo.title}
           </h2>
          </div>
          <div className={`rounded-[12px] border-[4px] border-black px-4 py-2 text-xs font-black uppercase tracking-[0.14em] ${selectedAutopsy.color}`}>
           {selectedAutopsy.label}
          </div>
         </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
         <article className="rounded-[16px] border-[4px] border-black bg-white p-5">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-black/55">
           <AlertTriangle size={16} />
           Hypothesis
          </div>
          <p className="mt-3 text-sm font-bold leading-6 text-black/75">{selectedAutopsy.hypothesis}</p>
         </article>
         <article className="rounded-[16px] border-[4px] border-black bg-white p-5">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-black/55">
           <Zap size={16} />
           Intervention
          </div>
          <p className="mt-3 text-sm font-bold leading-6 text-black/75">{selectedAutopsy.intervention}</p>
         </article>
        </div>
        <div className="rounded-[16px] border-[4px] border-black bg-[#FFEA5A] p-5">
         <div className="text-[10px] font-black uppercase tracking-[0.18em] text-black/55">
          Evidence
         </div>
         <div className="mt-3 flex flex-wrap gap-2">
          {selectedVideo.evidence.map((item) => (
           <span key={item} className="rounded-[10px] border-[3px] border-black bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em]">
            {item}
           </span>
          ))}
         </div>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
         <button
          type="button"
          onClick={handleQueueExperiment}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] border-[4px] border-black bg-[#111] px-5 text-xs font-black uppercase tracking-[0.14em] text-[#CCFF00] shadow-[5px_5px_0px_0px_black] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
         >
          <Plus size={16} />
          Queue Experiment
         </button>
         {status ? (
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-black/55">{status}</div>
         ) : null}
        </div>
       </div>
      ) : null}
     </div>

     <div className="rounded-[22px] border-[4px] border-black bg-[#111] text-white shadow-[8px_8px_0px_0px_#00F0FF]">
      <div className="border-b-[4px] border-black bg-[#CCFF00] px-6 py-5 text-black">
       <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/55">
        Experiment Ledger
       </div>
       <div className="text-3xl font-[1000] uppercase tracking-[-0.05em]">
        Queued Tests
       </div>
      </div>
      <div className="grid gap-3 p-5">
       {experiments.length ? (
        experiments.slice(0, 6).map((experiment) => (
         <article key={experiment.id} className="rounded-[16px] border-[4px] border-white/20 bg-black/45 p-4">
          <div className="flex items-center justify-between gap-3">
           <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/55">
            {experiment.status} · {experiment.metric}
           </div>
           <CheckCircle2 size={16} className="text-[#CCFF00]" />
          </div>
          <div className="mt-2 text-lg font-[1000] uppercase leading-tight tracking-[-0.03em] text-white">
           {experiment.title}
          </div>
          <p className="mt-2 text-xs font-bold leading-5 text-white/65">{experiment.intervention}</p>
         </article>
        ))
       ) : (
        <div className="rounded-[16px] border-[4px] border-dashed border-white/25 bg-black/35 px-5 py-8 text-center text-[11px] font-black uppercase tracking-[0.2em] text-white/50">
         No experiments queued yet.
        </div>
       )}
      </div>
     </div>
    </div>
   </section>

   <section className="grid gap-8 xl:grid-cols-3">
    <article className="rounded-[20px] border-[4px] border-black bg-white shadow-[7px_7px_0px_0px_black]">
     <div className="flex items-center gap-3 border-b-[4px] border-black bg-[#00F0FF] px-5 py-4">
      <LineChart size={20} />
      <div className="text-xl font-[1000] uppercase tracking-[-0.04em]">Data Gate</div>
     </div>
     <p className="p-5 text-sm font-bold leading-6 text-black/70">
      High-confidence diagnosis requires measured retention curves, average view percentage, or retention CSV imports. Demo rows are marked low confidence.
     </p>
    </article>
    <article className="rounded-[20px] border-[4px] border-black bg-white shadow-[7px_7px_0px_0px_black]">
     <div className="flex items-center gap-3 border-b-[4px] border-black bg-[#FFEA5A] px-5 py-4">
      <Workflow size={20} />
      <div className="text-xl font-[1000] uppercase tracking-[-0.04em]">Workflow Link</div>
     </div>
     <p className="p-5 text-sm font-bold leading-6 text-black/70">
      Every queued experiment creates a workflow chain that hands off to packaging, projects, and Brain Command Center.
     </p>
    </article>
    <article className="rounded-[20px] border-[4px] border-black bg-white shadow-[7px_7px_0px_0px_black]">
     <div className="flex items-center gap-3 border-b-[4px] border-black bg-[#CCFF00] px-5 py-4">
      <ListChecks size={20} />
      <div className="text-xl font-[1000] uppercase tracking-[-0.04em]">Current Chains</div>
     </div>
     <p className="p-5 text-sm font-bold leading-6 text-black/70">
      {workflows.length} workflow chains are currently saved. Use Workflow Chain Builder to advance or block the experiment steps.
     </p>
   </article>
  </section>

   <section className="rounded-[22px] border-[4px] border-black bg-[#f8f7f1] shadow-[8px_8px_0px_0px_black]">
    <div className="border-b-[4px] border-black bg-[#FFEA5A] px-6 py-5">
     <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/55">
      Agent Self-Improvement Loop
     </div>
     <div className="text-3xl font-[1000] uppercase tracking-[-0.05em]">
      Retention Evidence Trail
     </div>
    </div>
    <div className="grid gap-4 p-6 md:grid-cols-5">
     {[
      { label: "Inputs Used", value: selectedVideo ? `${selectedVideo.source}, selected video, analytics signal` : "No video selected" },
      { label: "Inferred", value: selectedAutopsy?.hypothesis || "No diagnosis yet" },
      { label: "Missing", value: selectedVideo?.retention ? "No critical retention input missing" : "Measured retention curve or CSV import" },
      { label: "Handoff", value: "Packaging -> Projects -> Brain" },
      { label: "Improve Next", value: "Execute queued tests and compare measured outcomes" },
     ].map((item) => (
      <article key={item.label} className="rounded-[16px] border-[4px] border-black bg-white p-4 shadow-[4px_4px_0px_0px_black]">
       <div className="text-[10px] font-black uppercase tracking-[0.18em] text-black/50">{item.label}</div>
       <p className="mt-2 text-xs font-black uppercase leading-5 tracking-[0.08em] text-black/75">{item.value}</p>
      </article>
     ))}
    </div>
   </section>

   {hiddenGemCount > 0 ? (
    <section className="rounded-[20px] border-[4px] border-black bg-[#CCFF00] p-5 shadow-[7px_7px_0px_0px_black]">
     <div className="text-[10px] font-black uppercase tracking-[0.2em] text-black/60">
      Fastest opportunity
     </div>
     <p className="mt-2 text-xl font-[1000] uppercase leading-tight tracking-[-0.04em]">
      {hiddenGemCount} video{hiddenGemCount === 1 ? "" : "s"} look like hidden gems: strong retention with weak CTR. Prioritize packaging experiments before script rewrites.
     </p>
    </section>
   ) : null}
  </div>
 )
}

export default RetentionAutopsyExperimentEngine
