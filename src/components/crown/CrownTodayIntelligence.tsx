import React, { useEffect, useMemo, useState } from "react"
import { AlertTriangle, CheckCircle2, CircleDot, GitCommitHorizontal, RefreshCw, ShieldAlert, Sparkles } from "lucide-react"
import { CROWN_TODAY_CHANGES, CROWN_TODAY_SIGNALS, CROWN_TODAY_SUMMARY, CROWN_TODAY_TOP_ACTIONS, type CrownPriority } from "../../data/crownTodayIntelligence"

interface ReleaseMetadata {
  app?: string
  commit?: string
  branch?: string
  environment?: string
  deployedAt?: string | null
  url?: string | null
}

const cardClass = "rounded-[18px] border-[4px] border-black bg-white shadow-[8px_8px_0_0_#000]"
const priorityTone: Record<CrownPriority, string> = {
  critical: "#fa618a",
  blocked: "#ffa85c",
  needs_decision: "#ffda47",
  verify: "#36e0f6",
  ready: "#c0f240",
  watch: "#ffefae",
}

const label = (priority: CrownPriority) => priority.replaceAll("_", " ")

export const CrownTodayIntelligence: React.FC = () => {
  const [release, setRelease] = useState<ReleaseMetadata | null>(null)
  const [releaseState, setReleaseState] = useState<"loading" | "ready" | "unavailable">("loading")

  useEffect(() => {
    let active = true
    fetch("/api/release", { credentials: "same-origin" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`release metadata ${response.status}`)
        return response.json() as Promise<ReleaseMetadata>
      })
      .then((payload) => {
        if (!active) return
        setRelease(payload)
        setReleaseState("ready")
      })
      .catch(() => {
        if (!active) return
        setReleaseState("unavailable")
      })
    return () => { active = false }
  }, [])

  const headline = useMemo(() => {
    if (CROWN_TODAY_SUMMARY.critical > 0) return `${CROWN_TODAY_SUMMARY.critical} critical item${CROWN_TODAY_SUMMARY.critical === 1 ? "" : "s"} need attention`
    if (CROWN_TODAY_SUMMARY.blocked > 0) return `${CROWN_TODAY_SUMMARY.blocked} blocked system path${CROWN_TODAY_SUMMARY.blocked === 1 ? "" : "s"}`
    if (CROWN_TODAY_SUMMARY.needsVerification > 0) return `${CROWN_TODAY_SUMMARY.needsVerification} mission${CROWN_TODAY_SUMMARY.needsVerification === 1 ? "" : "s"} need verification`
    return "No urgent Crown signals"
  }, [])

  return (
    <section className="mt-4 space-y-4" aria-label="Crown Today executive intelligence">
      <div className="grid gap-4 xl:grid-cols-[1.25fr_.75fr]">
        <article className={`${cardClass} overflow-hidden`}>
          <div className="border-b-[4px] border-black bg-[#c0f240] p-5">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.15em]"><Sparkles size={15} /> Executive brief</div>
            <h2 className="mt-2 text-3xl font-black uppercase leading-none">{headline}</h2>
            <p className="mt-3 max-w-3xl text-sm font-bold">Prioritized from committed Crown missions, decisions, verification receipts and release evidence. Today never promotes plans or commits into runtime success.</p>
          </div>
          <div className="grid grid-cols-2 gap-0 sm:grid-cols-4">
            {[
              ["Critical", CROWN_TODAY_SUMMARY.critical, "#fa618a"],
              ["Blocked", CROWN_TODAY_SUMMARY.blocked, "#ffa85c"],
              ["Decisions", CROWN_TODAY_SUMMARY.needsDecision, "#ffda47"],
              ["Verify", CROWN_TODAY_SUMMARY.needsVerification, "#36e0f6"],
            ].map(([name, value, tone], index) => <div key={String(name)} className={`p-4 ${index % 2 ? "border-l-[2px]" : ""} ${index > 1 ? "border-t-[2px] sm:border-t-0" : ""} sm:border-l-[2px] sm:first:border-l-0 border-black`} style={{ backgroundColor: String(tone) }}><div className="text-[9px] font-black uppercase tracking-[.13em]">{name}</div><div className="mt-1 text-3xl font-black">{value}</div></div>)}
          </div>
        </article>

        <article className={`${cardClass} p-5`}>
          <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><GitCommitHorizontal size={18} /><h3 className="text-lg font-black uppercase">Running build</h3></div>{releaseState === "loading" ? <RefreshCw className="animate-spin" size={16} /> : releaseState === "ready" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}</div>
          {releaseState === "ready" && release ? <div className="mt-4 space-y-2 text-xs font-bold"><div className="rounded-xl border-[2px] border-black bg-[#d7fff2] p-3"><div className="text-[9px] font-black uppercase text-black/50">Environment</div><div className="mt-1 font-black uppercase">{release.environment || "unknown"}</div></div><div className="break-all">Commit: {release.commit || "unknown"}</div><div>Branch: {release.branch || "unknown"}</div><div>Deployed: {release.deployedAt || "not reported"}</div></div> : <p className="mt-4 text-xs font-bold leading-5">{releaseState === "loading" ? "Reading the server-owned release identity…" : "Live release metadata is unavailable. Crown keeps the state unknown instead of guessing."}</p>}
          <div className="mt-4 rounded-xl border-[2px] border-black bg-[#ffefae] p-3 text-[10px] font-black uppercase">Build identity ≠ GitHub main ≠ live verification</div>
        </article>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
        <article className={`${cardClass} p-5`}>
          <div className="flex items-center gap-2"><ShieldAlert size={19} /><h3 className="text-xl font-black uppercase">Priority queue</h3></div>
          <div className="mt-4 grid gap-3">
            {CROWN_TODAY_SIGNALS.slice(0, 6).map((signal, index) => <div key={signal.id} className="rounded-xl border-[2px] border-black p-3" style={{ backgroundColor: priorityTone[signal.priority] }}><div className="flex items-start justify-between gap-3"><div><div className="text-[9px] font-black uppercase tracking-[.13em]">#{index + 1} · {label(signal.priority)} · {signal.source}</div><div className="mt-1 text-sm font-black uppercase">{signal.title}</div></div><CircleDot size={16} className="shrink-0" /></div><p className="mt-2 text-xs font-bold leading-5">{signal.detail}</p></div>)}
          </div>
        </article>

        <div className="grid gap-4">
          <article className={`${cardClass} p-5`}>
            <h3 className="text-xl font-black uppercase">Next 3 actions</h3>
            <div className="mt-4 space-y-3">{CROWN_TODAY_TOP_ACTIONS.map((item, index) => <div key={item.id} className="rounded-xl border-[2px] border-black p-3"><div className="text-[9px] font-black uppercase text-black/45">Action {index + 1} · {label(item.priority)}</div><div className="mt-1 text-sm font-black">{item.action}</div><p className="mt-2 text-[11px] font-bold leading-4 text-black/65">{item.reason}</p></div>)}</div>
          </article>
          <article className={`${cardClass} p-5`}>
            <h3 className="text-lg font-black uppercase">What changed</h3>
            <div className="mt-3 space-y-2">{CROWN_TODAY_CHANGES.map((item) => <div key={item.id} className="border-l-[4px] border-black pl-3"><div className="text-[10px] font-black uppercase">{item.title}</div><div className="mt-1 text-xs font-bold text-black/65">{item.detail}</div></div>)}</div>
          </article>
        </div>
      </div>

      <div className={`${cardClass} bg-[#f1dcff] p-4 text-xs font-black`}>
        Task authority remains the canonical Task Index. Today ranks only evidence currently available to the runtime; missing Task Index state is surfaced as missing evidence, never synthesized into a fake status.
      </div>
    </section>
  )
}
