import React, { useMemo, useState } from "react"
import {
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  CircleDot,
  Code2,
  Crown,
  FileCheck2,
  FileStack,
  GitBranch,
  ListChecks,
  Network,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react"
import { CrownCodeReader, CrownReleaseReader } from "../components/crown/CrownCodeRelease"
import { CrownLiveBrain } from "../components/crown/CrownLiveBrain"
import { CrownLiveServices } from "../components/crown/CrownLiveServices"
import { CROWN_LIFECYCLE, CROWN_MISSIONS, CROWN_SNAPSHOT_META, type CrownMissionSnapshot } from "../data/crownControlRoomSnapshot"
import { CROWN_ARTIFACTS, CROWN_DECISIONS, CROWN_EXECUTION, CROWN_TASK_AUTHORITY, CROWN_VERIFICATION } from "../data/crownControlRoomRecords"

const DOMAIN_COLORS: Record<CrownMissionSnapshot["domain"], string> = {
  Observatory: "#36e0f6",
  Citadel: "#fa618a",
  Brain: "#b14aed",
  Forge: "#ffa85c",
  Compass: "#ffda47",
  System: "#c0f240",
}

const STATUS_LABELS = {
  draft: "Draft",
  planned: "Planned",
  verification: "Verification",
  partial: "Partial",
  complete: "Complete",
  blocked: "Blocked",
} as const

const SECTIONS = [
  ["today", "Today", Sparkles],
  ["missions", "Missions", Crown],
  ["tasks", "Tasks", ListChecks],
  ["artifacts", "Artifacts", FileStack],
  ["decisions", "Decisions", ScrollText],
  ["execution", "Execution", Workflow],
  ["verification", "Verification", FileCheck2],
  ["code", "Code", Code2],
  ["services", "Services", Network],
  ["brain", "Brain", BrainCircuit],
  ["release", "Release", GitBranch],
] as const

type SectionId = typeof SECTIONS[number][0]
const cardClass = "rounded-[18px] border-[4px] border-black bg-white shadow-[8px_8px_0_0_#000]"

const StatusPill: React.FC<{ mission: CrownMissionSnapshot }> = ({ mission }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full border-[2px] border-black bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-[.12em]">
    {mission.status === "complete" ? <CheckCircle2 size={12} /> : mission.status === "blocked" ? <AlertTriangle size={12} /> : <CircleDot size={12} />}
    {STATUS_LABELS[mission.status]}
  </span>
)

const MissionCard: React.FC<{ mission: CrownMissionSnapshot; compact?: boolean }> = ({ mission, compact = false }) => (
  <article className={`${cardClass} overflow-hidden`}>
    <header className="flex items-start justify-between gap-3 border-b-[4px] border-black p-4" style={{ backgroundColor: DOMAIN_COLORS[mission.domain] }}>
      <div><div className="text-[10px] font-black uppercase tracking-[.16em]">{mission.domain}</div><h3 className="mt-1 text-xl font-black uppercase leading-[.95]">{mission.title}</h3></div>
      <StatusPill mission={mission} />
    </header>
    <div className="p-4">
      <p className="text-sm font-bold leading-5">{mission.objective}</p>
      {!compact ? <>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border-[2px] border-black bg-[#f4f4ef] p-3"><div className="text-[9px] font-black uppercase tracking-[.14em] text-black/50">Desired-state owner</div><div className="mt-1 text-xs font-black uppercase">{mission.owner}</div></div>
          <div className="rounded-xl border-[2px] border-black bg-[#f4f4ef] p-3"><div className="text-[9px] font-black uppercase tracking-[.14em] text-black/50">Execution owner</div><div className="mt-1 text-xs font-black uppercase">{mission.executionOwner}</div></div>
        </div>
        <div className="mt-4"><div className="text-[10px] font-black uppercase tracking-[.14em]">Evidence</div><div className="mt-2 flex flex-wrap gap-2">{mission.evidence.map((item) => <span key={item} className="rounded-lg border-[2px] border-black bg-[#d7fff2] px-2 py-1 text-[10px] font-black">{item}</span>)}</div></div>
        <div className="mt-4"><div className="text-[10px] font-black uppercase tracking-[.14em]">Remaining blockers</div><ul className="mt-2 space-y-1 text-xs font-bold">{mission.blockers.map((item) => <li key={item} className="flex gap-2"><AlertTriangle size={14} className="mt-[1px] shrink-0" />{item}</li>)}</ul></div>
      </> : null}
    </div>
  </article>
)

const ReaderHeader: React.FC<{ title: string; note: string; tone?: string }> = ({ title, note, tone = "#ffefae" }) => (
  <div className={`${cardClass} p-5`}>
    <h2 className="text-2xl font-black uppercase">{title}</h2>
    <p className="mt-3 text-sm font-bold leading-5">{note}</p>
    <div className="mt-4 rounded-xl border-[2px] border-black p-3 text-xs font-black uppercase" style={{ backgroundColor: tone }}>Repository-backed · read only</div>
  </div>
)

const CrownControlRoom: React.FC = () => {
  const [section, setSection] = useState<SectionId>("today")
  const [domain, setDomain] = useState<"All" | CrownMissionSnapshot["domain"]>("All")
  const visibleMissions = useMemo(() => domain === "All" ? CROWN_MISSIONS : CROWN_MISSIONS.filter((mission) => mission.domain === domain), [domain])
  const blockerCount = CROWN_MISSIONS.reduce((sum, mission) => sum + mission.blockers.length, 0)
  const completeCount = CROWN_MISSIONS.filter((mission) => mission.status === "complete").length

  return (
    <main className="min-h-full bg-[#efefe8] px-3 py-4 text-black sm:px-5 sm:py-6 lg:px-7">
      <section className={`${cardClass} overflow-hidden`}>
        <div className="grid gap-0 lg:grid-cols-[1.45fr_.55fr]">
          <div className="bg-[#c0f240] p-5 sm:p-7"><div className="inline-flex items-center gap-2 rounded-full border-[2px] border-black bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[.14em]"><Crown size={14} /> Crown Control Room</div><h1 className="mt-4 max-w-4xl text-4xl font-black uppercase leading-[.86] sm:text-6xl">Creator intent → verified execution</h1><p className="mt-4 max-w-3xl text-sm font-bold leading-6 sm:text-base">Read-only governance across mission, task, artifact, execution, code, services, Brain and release evidence.</p></div>
          <div className="border-t-[4px] border-black bg-black p-5 text-white lg:border-l-[4px] lg:border-t-0"><div className="text-[10px] font-black uppercase tracking-[.16em] text-white/50">Runtime contract</div><div className="mt-3 text-2xl font-black uppercase">Read only</div><div className="mt-4 space-y-2 text-xs font-bold text-white/80"><div>Source: {CROWN_SNAPSHOT_META.source}</div><div>Schema: {CROWN_SNAPSHOT_META.schemaVersion}</div><div>No Task Index writes</div><div>No deploy / billing / OAuth authority</div></div></div>
        </div>
      </section>

      <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[["Missions", CROWN_MISSIONS.length, "#36e0f6"],["Verified complete", completeCount, "#c0f240"],["Open blockers", blockerCount, "#fa618a"],["Domains", new Set(CROWN_MISSIONS.map((mission) => mission.domain)).size, "#ffda47"]].map(([label, value, color]) => <div key={String(label)} className={`${cardClass} p-4`} style={{ backgroundColor: String(color) }}><div className="text-[10px] font-black uppercase tracking-[.14em]">{label}</div><div className="mt-1 text-4xl font-black">{value}</div></div>)}
      </section>

      <nav className="mt-5 flex gap-2 overflow-x-auto pb-2" aria-label="Crown Control Room sections">
        {SECTIONS.map(([id, label, Icon]) => <button key={id} type="button" onClick={() => setSection(id)} className={`inline-flex shrink-0 items-center gap-2 rounded-xl border-[3px] border-black px-3 py-2 text-[11px] font-black uppercase shadow-[4px_4px_0_0_#000] transition-transform active:translate-x-[2px] active:translate-y-[2px] ${section === id ? "bg-[#c0f240]" : "bg-white"}`}><Icon size={15} strokeWidth={3} /> {label}</button>)}
      </nav>

      {section === "today" ? <section className="mt-4 grid gap-4 lg:grid-cols-[1fr_.9fr]"><div className={`${cardClass} p-5`}><div className="flex items-center gap-2"><ShieldCheck size={20} /><h2 className="text-xl font-black uppercase">System state</h2></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border-[3px] border-black bg-[#d7fff2] p-4"><div className="text-[10px] font-black uppercase">Kingdom</div><div className="mt-1 text-lg font-black uppercase">Desired state</div><p className="mt-2 text-xs font-bold">Mission, product meaning, acceptance, UX, artifacts and tradeoffs.</p></div><div className="rounded-xl border-[3px] border-black bg-[#f1dcff] p-4"><div className="text-[10px] font-black uppercase">Republic</div><div className="mt-1 text-lg font-black uppercase">Executable state</div><p className="mt-2 text-xs font-bold">Repo truth, work orders, code, tests, services, preview and production receipts.</p></div></div><div className="mt-5 text-[10px] font-black uppercase tracking-[.14em]">Lifecycle</div><div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">{CROWN_LIFECYCLE.map((step, index) => <div key={step} className="rounded-xl border-[2px] border-black bg-white p-3"><span className="text-[9px] font-black text-black/40">0{index + 1}</span><div className="mt-1 text-xs font-black uppercase">{step}</div></div>)}</div></div><div className="grid gap-4"><MissionCard mission={CROWN_MISSIONS[0]} compact /><div className={`${cardClass} bg-[#fa618a] p-5`}><div className="flex items-center gap-2"><AlertTriangle size={20} /><h2 className="text-xl font-black uppercase">Truth rule</h2></div><p className="mt-3 text-sm font-black">Plans ≠ code. Code ≠ integration. Integration ≠ verified runtime. Preview ≠ production.</p></div></div></section> : null}

      {section === "missions" ? <section className="mt-4"><div className="mb-4 flex flex-wrap gap-2">{["All", "Observatory", "Citadel", "Brain", "Forge", "Compass", "System"].map((item) => <button key={item} type="button" onClick={() => setDomain(item as typeof domain)} className={`rounded-full border-[2px] border-black px-3 py-1.5 text-[10px] font-black uppercase ${domain === item ? "bg-black text-white" : "bg-white"}`}>{item}</button>)}</div><div className="grid gap-4 xl:grid-cols-2">{visibleMissions.map((mission) => <MissionCard key={mission.id} mission={mission} />)}</div></section> : null}

      {section === "tasks" ? <section className="mt-4 grid gap-4 lg:grid-cols-[.75fr_1.25fr]"><ReaderHeader title="Tasks" note="Task status remains owned by the canonical external Task Index; Crown only shows references." tone="#ffda47" /><div className={`${cardClass} p-5`}><div className="text-[10px] font-black uppercase tracking-[.14em]">Canonical authority</div><div className="mt-2 break-all text-sm font-black">{CROWN_TASK_AUTHORITY.authority}</div><p className="mt-3 text-xs font-bold leading-5">{CROWN_TASK_AUTHORITY.note}</p><div className="mt-5 grid gap-3 sm:grid-cols-2">{CROWN_MISSIONS.map((mission) => <div key={mission.id} className="rounded-xl border-[2px] border-black p-3"><div className="text-[10px] font-black uppercase">{mission.domain}</div><div className="mt-1 text-xs font-black">{mission.id}</div><div className="mt-2 text-[11px] font-bold text-black/60">Task refs: {mission.taskIds.length ? mission.taskIds.join(", ") : "none recorded"}</div></div>)}</div></div></section> : null}

      {section === "artifacts" ? <section className="mt-4 grid gap-4 lg:grid-cols-[.75fr_1.25fr]"><ReaderHeader title="Artifacts" note="Committed Crown artifact records with provenance and verification state." tone="#36e0f6" /><div className="grid gap-3">{CROWN_ARTIFACTS.map((artifact) => <article key={artifact.id} className={`${cardClass} p-4`}><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-black uppercase">{artifact.title}</h3><span className="rounded-full border-[2px] border-black bg-[#d7fff2] px-2 py-1 text-[9px] font-black uppercase">{artifact.status}</span></div><div className="mt-2 break-all text-xs font-bold">{artifact.source}</div><div className="mt-2 text-[10px] font-black uppercase text-black/50">{artifact.id} · {artifact.verified ? "verified reference" : "not runtime verified"}</div></article>)}</div></section> : null}

      {section === "decisions" ? <section className="mt-4 grid gap-4 lg:grid-cols-[.75fr_1.25fr]"><ReaderHeader title="Decisions" note="Decision records preserve the evidence and rationale behind chosen paths." tone="#f1dcff" /><div className="grid gap-3">{CROWN_DECISIONS.map((decision) => <article key={decision.id} className={`${cardClass} p-5`}><div className="flex flex-wrap justify-between gap-2"><h3 className="max-w-3xl text-lg font-black uppercase leading-tight">{decision.question}</h3><span className="rounded-full border-[2px] border-black bg-[#c0f240] px-2 py-1 text-[9px] font-black uppercase">{decision.state}</span></div><p className="mt-4 text-sm font-bold leading-5">{decision.recommendation}</p><div className="mt-4 text-[10px] font-black uppercase text-black/50">{decision.id} · {decision.evidenceCount} evidence statements · {decision.missionId}</div></article>)}</div></section> : null}

      {section === "execution" ? <section className="mt-4 grid gap-4 lg:grid-cols-[.75fr_1.25fr]"><ReaderHeader title="Execution" note="Work-order presence proves an execution packet exists, not that implementation succeeded." tone="#ffa85c" /><div className="grid gap-3">{CROWN_EXECUTION.map((item) => <article key={item.record} className={`${cardClass} p-4`}><div className="text-[10px] font-black uppercase tracking-[.14em]">Work order recorded</div><div className="mt-2 text-sm font-black">{item.missionId}</div><div className="mt-2 break-all text-[11px] font-bold text-black/55">{item.record}</div></article>)}</div></section> : null}

      {section === "verification" ? <section className="mt-4 grid gap-4 lg:grid-cols-[.75fr_1.25fr]"><ReaderHeader title="Verification" note="Receipts remain distinct from work orders so planned execution is never promoted to proven behavior." tone="#c0f240" /><div className="grid gap-3">{CROWN_VERIFICATION.map((item) => <article key={item.record} className={`${cardClass} p-4`}><div className="flex items-center justify-between gap-2"><div className="text-[10px] font-black uppercase tracking-[.14em]">{item.kind}</div><span className="rounded-full border-[2px] border-black bg-[#ffefae] px-2 py-1 text-[9px] font-black uppercase">{item.state}</span></div><div className="mt-2 text-sm font-black">{item.missionId}</div><div className="mt-2 break-all text-[11px] font-bold text-black/55">{item.record}</div></article>)}</div></section> : null}

      {section === "code" ? <CrownCodeReader /> : null}
      {section === "services" ? <CrownLiveServices /> : null}
      {section === "brain" ? <CrownLiveBrain /> : null}
      {section === "release" ? <CrownReleaseReader /> : null}
    </main>
  )
}

export default CrownControlRoom
