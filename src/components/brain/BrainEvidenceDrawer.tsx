import React from "react"
import { Info } from "lucide-react"
import type { AIBrainEvidencePack } from "../../types"

const numberText = (value: number | null | undefined): string =>
 typeof value === "number" && Number.isFinite(value) ? value.toLocaleString() : ""

/**
 * "Why this recommendation" — expands to the real channel evidence behind an
 * answer. Native <details> so it is keyboard accessible with no JS, and creator-safe
 * only: video titles, search terms, and traffic sources, never internal ids or
 * storage/sync language.
 *
 * `compact` renders the trigger as a small square icon button (for the answer's
 * feedback row) instead of a full-width labeled bar.
 */
export const BrainEvidenceDrawer: React.FC<{
 evidencePack: AIBrainEvidencePack
 summaryLabel?: string
 className?: string
 compact?: boolean
}> = ({ evidencePack, summaryLabel = "Why this recommendation", className = "", compact = false }) => {
 const topVideos = evidencePack.topVideos.slice(0, 4)
 const searchTerms = evidencePack.searchTerms.slice(0, 4)
 const trafficSources = evidencePack.trafficSources.slice(0, 4)
 const missing = evidencePack.missingInputs.slice(0, 4)
 const hasAnything = topVideos.length || searchTerms.length || trafficSources.length || missing.length
 if (!hasAnything) return null

 return (
  <details
   className={`group ${compact ? "relative" : "overflow-hidden rounded-[10px] border-[2px] border-black bg-white"} ${className}`}
  >
   {compact ? (
    <summary
     className="grid h-7 w-7 cursor-pointer list-none place-items-center rounded-[6px] border-[2px] border-black bg-white transition hover:bg-[#FFDA47]"
     title={summaryLabel}
     aria-label={summaryLabel}
    >
     <Info size={13} />
    </summary>
   ) : (
    <summary className="cursor-pointer list-none border-b-[2px] border-black bg-[#f8f8f4] px-3 py-2 text-[10px] font-black uppercase tracking-[0.1em] hover:bg-[#FFDA47]">
     {summaryLabel}
    </summary>
   )}
   <div
    className={`grid gap-3 ${
     compact
      ? "absolute right-0 z-20 mt-1 w-[280px] rounded-[10px] border-[2px] border-black bg-white p-3 shadow-[4px_4px_0_0_#000]"
      : "p-3"
    }`}
   >
    {topVideos.length ? (
     <section>
      <h4 className="text-[9px] font-black uppercase tracking-[0.16em] text-black/45">Videos this used</h4>
      <ul className="mt-1 grid gap-1">
       {topVideos.map((video) => (
        <li key={video.evidenceId} className="text-xs font-bold leading-5 text-black/75">
         {video.title}
         {numberText(video.metrics.views) ? (
          <span className="text-black/45"> · {numberText(video.metrics.views)} views</span>
         ) : null}
        </li>
       ))}
      </ul>
     </section>
    ) : null}

    {searchTerms.length ? (
     <section>
      <h4 className="text-[9px] font-black uppercase tracking-[0.16em] text-black/45">Search terms bringing viewers</h4>
      <ul className="mt-1 flex flex-wrap gap-1.5">
       {searchTerms.map((term) => (
        <li
         key={term.evidenceId}
         className="rounded-[8px] border-[2px] border-black bg-[#36E0F6] px-2 py-0.5 text-[10px] font-black uppercase"
        >
         {term.value}
        </li>
       ))}
      </ul>
     </section>
    ) : null}

    {trafficSources.length ? (
     <section>
      <h4 className="text-[9px] font-black uppercase tracking-[0.16em] text-black/45">Where views come from</h4>
      <ul className="mt-1 flex flex-wrap gap-1.5">
       {trafficSources.map((source) => (
        <li
         key={source.evidenceId}
         className="rounded-[8px] border-[2px] border-black bg-[#C0F240] px-2 py-0.5 text-[10px] font-black uppercase"
        >
         {source.value}
        </li>
       ))}
      </ul>
     </section>
    ) : null}

    {missing.length ? (
     <section>
      <h4 className="text-[9px] font-black uppercase tracking-[0.16em] text-black/45">Would sharpen this</h4>
      <ul className="mt-1 grid gap-1">
       {missing.map((item) => (
        <li key={item} className="text-xs font-bold leading-5 text-black/60">{item}</li>
       ))}
      </ul>
     </section>
    ) : null}
   </div>
  </details>
 )
}

export default BrainEvidenceDrawer
