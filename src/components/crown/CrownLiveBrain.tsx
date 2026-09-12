import React from "react"
import { BrainCircuit, FolderKanban, Layers3, MessageSquareText, Sparkles } from "lucide-react"
import { useBrain } from "../../context/useBrain"

const cardClass = "rounded-[18px] border-[4px] border-black bg-white shadow-[8px_8px_0_0_#000]"

const Metric: React.FC<{ label: string; value: string | number; detail: string }> = ({ label, value, detail }) => (
  <article className={`${cardClass} p-4`}>
    <div className="text-[9px] font-black uppercase tracking-[.14em] text-black/50">{label}</div>
    <div className="mt-1 text-3xl font-black">{value}</div>
    <p className="mt-2 text-xs font-bold leading-5 text-black/65">{detail}</p>
  </article>
)

export const CrownLiveBrain: React.FC = () => {
  const { brain, authState, aiModel, channelBootPhase, initialDashboardHydrationStatus } = useBrain()
  const activeProject = brain.projects.find((project) => project.id === brain.activeProjectId)
  const providerCount = brain.activeProviders.length
  const memorySignals = brain.journalEntries.length + brain.journalFollowUps.length + brain.microPolls.length
  const contextSignals = [brain.channelProfile, brain.recentMetrics, brain.coreConcept, brain.targetNiche].filter(Boolean).length
  const hydrationReady = [initialDashboardHydrationStatus.identityReady, initialDashboardHydrationStatus.lifetimeReady, initialDashboardHydrationStatus.inventoryReady].filter(Boolean).length

  return (
    <section className="mt-4 grid gap-4 lg:grid-cols-[.72fr_1.28fr]">
      <div className={`${cardClass} p-5`}>
        <div className="flex items-center gap-2"><BrainCircuit size={20} /><h2 className="text-2xl font-black uppercase">Brain</h2></div>
        <p className="mt-3 text-sm font-bold leading-5">Live read-only state from the current Workspace Brain context. This view reports available context, projects, providers and model selection without writing memory or triggering tools.</p>
        <div className="mt-4 rounded-xl border-[2px] border-black bg-[#f1dcff] p-3 text-xs font-black uppercase">Live Brain context · read only</div>
        <div className="mt-5 space-y-2 text-xs font-bold"><div className="flex gap-2"><Sparkles size={15} /> Model: {aiModel}</div><div className="flex gap-2"><Layers3 size={15} /> Boot phase: {channelBootPhase}</div><div className="flex gap-2"><MessageSquareText size={15} /> Dashboard hydration: {hydrationReady}/3 core stages ready</div></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Metric label="Projects" value={brain.projects.length} detail={activeProject ? `Active: ${activeProject.name || activeProject.videoTitle || activeProject.id}` : "No active project selected."} />
        <Metric label="Providers" value={providerCount} detail={providerCount ? brain.activeProviders.join(" · ") : "No active Brain providers are registered."} />
        <Metric label="Memory signals" value={memorySignals} detail="Journal entries, follow-ups and micro-polls currently present in Workspace Brain state." />
        <Metric label="Context coverage" value={`${contextSignals}/4`} detail="Channel profile, recent metrics, core concept and target niche context currently available." />
        <Metric label="Auth bridge" value={authState.isAuthenticated ? "ready" : "offline"} detail={authState.channelName || authState.channelHandle || "No legacy Brain auth/channel identity is currently populated."} />
        <Metric label="Creative state" value={brain.storyboardState.scenes.length} detail={`Storyboard scenes. Thumbnail variations: ${brain.thumbnailState.variations?.length ?? 0}. SEO results: ${brain.seoState.results.length}.`} />
      </div>
      <div className={`${cardClass} p-5 lg:col-span-2`}>
        <div className="flex items-center gap-2"><FolderKanban size={18} /><h3 className="text-lg font-black uppercase">Current context summary</h3></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border-[2px] border-black bg-[#d7fff2] p-3"><div className="text-[9px] font-black uppercase text-black/45">Core concept</div><div className="mt-1 text-xs font-black">{brain.coreConcept || "Not set"}</div></div>
          <div className="rounded-xl border-[2px] border-black bg-[#ffefae] p-3"><div className="text-[9px] font-black uppercase text-black/45">Target niche</div><div className="mt-1 text-xs font-black">{brain.targetNiche || "Not set"}</div></div>
          <div className="rounded-xl border-[2px] border-black bg-[#f1dcff] p-3"><div className="text-[9px] font-black uppercase text-black/45">Research results</div><div className="mt-1 text-xs font-black">{brain.researchLabState.results?.length ?? 0}</div></div>
          <div className="rounded-xl border-[2px] border-black bg-[#ffd9e3] p-3"><div className="text-[9px] font-black uppercase text-black/45">Calendar events</div><div className="mt-1 text-xs font-black">{brain.calendarState.events?.length ?? 0}</div></div>
        </div>
      </div>
    </section>
  )
}

export default CrownLiveBrain
