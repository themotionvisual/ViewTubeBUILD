import React from "react"
import { Info } from "lucide-react"
import type { AIBrainEvidencePack } from "../../types"

const numberText = (value: number | null | undefined): string =>
 typeof value === "number" && Number.isFinite(value) ? value.toLocaleString() : ""

/**
 * Creator-facing "Why this recommendation?" surface.
 *
 * It intentionally explains channel evidence in creator language instead of
 * exposing storage keys, internal IDs, model traces, or sync implementation.
 * Optional confidence/inference metadata lets every Brain surface use the
 * same trust UI without changing the canonical evidence-pack schema.
 */
export const BrainEvidenceDrawer: React.FC<{
 evidencePack: AIBrainEvidencePack
 summaryLabel?: string
 className?: string
 compact?: boolean
 confidence?: "low" | "medium" | "high" | number | null
 inference?: boolean
 caveats?: string[]
}> = ({
 evidencePack,
 summaryLabel = "Why this recommendation",
 className = "",
 compact = false,
 confidence = null,
 inference = true,
 caveats = [],
}) => {
 const topVideos = evidencePack.topVideos.slice(0, 4)
 const searchTerms = evidencePack.searchTerms.slice(0, 4)
 const trafficSources = evidencePack.trafficSources.slice(0, 4)
 const missing = evidencePack.missingInputs.slice(0, 4)
 const sourceCount = topVideos.length + searchTerms.length + trafficSources.length
 const hasAnything = sourceCount || missing.length || caveats.length
 if (!hasAnything) return null

 const confidenceText = typeof confidence === "number"
  ? `${Math.round(Math.max(0, Math.min(1, confidence)) * 100)}% confidence`
  : confidence
   ? `${confidence} confidence`
   : ""

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
    <summary className="cursor-pointer list-none border-b-[2px] border-black bg-[#f8f8f4] px-3 py-2 hover:bg-[#FFDA47]">
     <span className="flex flex-wrap items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.08em]">
      <span>{summaryLabel}</span>
      {sourceCount ? <span className="rounded-full border-[1.5px] border-black bg-[#36E0F6] px-1.5 py-0.5">{sourceCount} sources</span> : null}
      {confidenceText ? <span className="rounded-full border-[1.5px] border-black bg-[#C0F240] px-1.5 py-0.5">{confidenceText}</span> : null}
      <span className="rounded-full border-[1.5px] border-black bg-[#FFDA47] px-1.5 py-0.5">{inference ? "inference" : "measured"}</span>
     </span>
    </summary>
   )}
   <div
    className={`grid gap-3 ${
     compact
      ? "absolute right-0 z-20 mt-1 w-[300px] max-w-[calc(100vw-24px)] rounded-[10px] border-[2px] border-black bg-white p-3 shadow-[4px_4px_0_0_#000]"
      : "p-3"
    }`}
   >
    <p className="text-[9px] font-bold leading-4 text-black/55">
     {inference
      ? "Brain combined the evidence below to reach this conclusion. It is an interpretation, not a directly measured fact."
      : "This statement is directly represented by the channel evidence below."}
    </p>

    {topVideos.length ? (
     <section>
      <h4 className="text-[9px] font-black uppercase tracking-[0.16em] text-black/45">Primary video evidence</h4>
      <ul className="mt-1 grid gap-1">
       {topVideos.map((video) => (
        <li key={video.evidenceId} className="rounded-[7px] border-[1.5px] border-black/15 bg-[#f8f8f4] px-2 py-1 text-xs font-bold leading-5 text-black/75">
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
      <h4 className="text-[9px] font-black uppercase tracking-[0.16em] text-black/45">Search evidence</h4>
      <ul className="mt-1 flex flex-wrap gap-1.5">
       {searchTerms.map((term) => (
        <li key={term.evidenceId} className="rounded-[8px] border-[2px] border-black bg-[#36E0F6] px-2 py-0.5 text-[10px] font-black uppercase">{term.value}</li>
       ))}
      </ul>
     </section>
    ) : null}

    {trafficSources.length ? (
     <section>
      <h4 className="text-[9px] font-black uppercase tracking-[0.16em] text-black/45">Traffic-source evidence</h4>
      <ul className="mt-1 flex flex-wrap gap-1.5">
       {trafficSources.map((source) => (
        <li key={source.evidenceId} className="rounded-[8px] border-[2px] border-black bg-[#C0F240] px-2 py-0.5 text-[10px] font-black uppercase">{source.value}</li>
       ))}
      </ul>
     </section>
    ) : null}

    {missing.length ? (
     <section className="rounded-[8px] border-[2px] border-black bg-[#FFDA47]/30 p-2">
      <h4 className="text-[9px] font-black uppercase tracking-[0.16em] text-black/55">Missing evidence that would sharpen this</h4>
      <ul className="mt-1 grid gap-1">
       {missing.map((item) => <li key={item} className="text-xs font-bold leading-5 text-black/60">{item}</li>)}
      </ul>
     </section>
    ) : null}

    {caveats.length ? (
     <section className="rounded-[8px] border-[2px] border-black bg-[#FF7497]/20 p-2">
      <h4 className="text-[9px] font-black uppercase tracking-[0.16em] text-black/55">Caveats</h4>
      <ul className="mt-1 grid gap-1">
       {caveats.slice(0, 4).map((item) => <li key={item} className="text-xs font-bold leading-5 text-black/60">{item}</li>)}
      </ul>
     </section>
    ) : null}
   </div>
  </details>
 )
}

export default BrainEvidenceDrawer
