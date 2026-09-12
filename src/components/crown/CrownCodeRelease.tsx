import React from "react"
import { AlertTriangle, CheckCircle2, Code2, GitBranch, Rocket, ShieldCheck } from "lucide-react"
import { CROWN_CODE_SNAPSHOT, CROWN_RELEASE_SNAPSHOT, type CrownReleaseState } from "../../data/crownCodeReleaseSnapshot"

const cardClass = "rounded-[18px] border-[4px] border-black bg-white shadow-[8px_8px_0_0_#000]"

const stateTone: Record<CrownReleaseState, string> = {
  planned: "#ffefae",
  merged: "#c0f240",
  preview_unavailable: "#ffa85c",
  deployed: "#36e0f6",
  live_verified: "#d7fff2",
  blocked: "#fa618a",
}

export const CrownCodeReader: React.FC = () => (
  <section className="mt-4 grid gap-4 lg:grid-cols-[.72fr_1.28fr]">
    <div className={`${cardClass} p-5`}>
      <div className="flex items-center gap-2"><Code2 size={20} /><h2 className="text-2xl font-black uppercase">Code</h2></div>
      <p className="mt-3 text-sm font-bold leading-5">Read-only repository evidence. Crown records the committed code state, but never treats a commit as proof of deployment or live behavior.</p>
      <div className="mt-4 rounded-xl border-[2px] border-black bg-[#d7fff2] p-3 text-xs font-black uppercase">GitHub snapshot · read only</div>
      <div className="mt-5 space-y-2 text-xs font-bold">
        <div>Repository: {CROWN_CODE_SNAPSHOT.repository}</div>
        <div>Branch: {CROWN_CODE_SNAPSHOT.branch}</div>
        <div className="break-all">Head: {CROWN_CODE_SNAPSHOT.headSha}</div>
        <div>Captured: {CROWN_CODE_SNAPSHOT.capturedAt}</div>
      </div>
    </div>
    <div className={`${cardClass} p-5`}>
      <div className="flex items-center gap-2"><GitBranch size={18} /><h3 className="text-lg font-black uppercase">Recent merged work</h3></div>
      <div className="mt-4 grid gap-3">
        {CROWN_CODE_SNAPSHOT.recentMerges.map((item) => <article key={item.pr} className="rounded-xl border-[2px] border-black bg-white p-3"><div className="text-[9px] font-black uppercase text-black/45">PR #{item.pr} · {item.state}</div><div className="mt-1 text-sm font-black">{item.title}</div></article>)}
      </div>
      <div className="mt-4 rounded-xl border-[2px] border-black bg-[#ffefae] p-3 text-xs font-black">{CROWN_CODE_SNAPSHOT.truthRule}</div>
    </div>
  </section>
)

export const CrownReleaseReader: React.FC = () => {
  const steps = [CROWN_RELEASE_SNAPSHOT.commit, CROWN_RELEASE_SNAPSHOT.pullRequest, CROWN_RELEASE_SNAPSHOT.preview, CROWN_RELEASE_SNAPSHOT.production, CROWN_RELEASE_SNAPSHOT.live]
  return (
    <section className="mt-4 grid gap-4 lg:grid-cols-[.72fr_1.28fr]">
      <div className={`${cardClass} p-5`}>
        <div className="flex items-center gap-2"><Rocket size={20} /><h2 className="text-2xl font-black uppercase">Release</h2></div>
        <p className="mt-3 text-sm font-bold leading-5">A release is only complete when the evidence chain reaches independently verified live production. Preview, deployment and live verification remain separate states.</p>
        <div className="mt-4 rounded-xl border-[2px] border-black bg-[#fa618a] p-3 text-xs font-black uppercase">Current release chain is not live-verified</div>
      </div>
      <div className="grid gap-3">
        {steps.map((step, index) => <article key={`${index}-${step.state}`} className={`${cardClass} p-4`} style={{ backgroundColor: stateTone[step.state] }}><div className="flex items-center justify-between gap-3"><div><div className="text-[9px] font-black uppercase tracking-[.14em]">Step {index + 1}</div><div className="mt-1 text-base font-black uppercase">{"label" in step ? step.label : index === 0 ? "Commit" : "Pull request"}</div></div>{step.state === "merged" || step.state === "live_verified" ? <CheckCircle2 size={20} /> : step.state === "blocked" || step.state === "preview_unavailable" ? <AlertTriangle size={20} /> : <ShieldCheck size={20} />}</div>{"detail" in step ? <p className="mt-3 text-xs font-bold leading-5">{step.detail}</p> : null}<div className="mt-3 text-[10px] font-black uppercase">{step.state.replaceAll("_", " ")}</div></article>)}
      </div>
    </section>
  )
}
