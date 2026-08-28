import React, { useMemo, useState } from "react"
import { BookOpen, ChevronDown, ChevronUp, Cpu, Zap } from "lucide-react"
import {
 type GuideArticleDefinition,
 type GuidePageDepth,
 GUIDE_PAGES,
} from "../../content/guide-v2"

const depthMeta: Record<GuidePageDepth, { label: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number }>; className: string }> = {
 quick: { label: "Quick", icon: Zap, className: "bg-[#CCFF00]" },
 learn: { label: "Learn", icon: BookOpen, className: "bg-[#40C6E9]" },
 technical: { label: "Technical", icon: Cpu, className: "bg-[#E5E7EB]" },
}

export const GuideArticlePanel: React.FC<{ article: GuideArticleDefinition }> = ({ article }) => {
 const page = useMemo(() => GUIDE_PAGES.find((entry) => entry.id === article.pageId), [article.pageId])
 const [depth, setDepth] = useState<GuidePageDepth>("quick")
 const [expanded, setExpanded] = useState(false)
 if (!page) return null

 const availableDepths = page.depths
 const technical = article.technical || []

 return (
  <article id={`guide-${page.id}`} className="scroll-mt-28 overflow-hidden rounded-2xl border-[4px] border-black bg-white shadow-[6px_6px_0_0_#000]">
   <div className="flex flex-wrap items-center justify-between gap-3 border-b-[4px] border-black bg-[#F3F4F6] p-4">
    <div>
     <p className="text-[10px] font-black uppercase tracking-[.18em] text-black/45">{page.domain} guide</p>
     <h3 className="text-2xl font-black uppercase leading-none">{page.title}</h3>
    </div>
    <button
     onClick={() => setExpanded((value) => !value)}
     className="inline-flex items-center gap-2 rounded-xl border-[3px] border-black bg-white px-3 py-2 text-xs font-black uppercase shadow-[3px_3px_0_0_#000]"
    >
     {expanded ? "Collapse" : "Open guide"}
     {expanded ? <ChevronUp size={16} strokeWidth={3} /> : <ChevronDown size={16} strokeWidth={3} />}
    </button>
   </div>
   <div className="p-4">
    <div className="flex flex-wrap gap-2">
     {availableDepths.map((item) => {
      const meta = depthMeta[item]
      const Icon = meta.icon
      return (
       <button
        key={item}
        onClick={() => { setDepth(item); setExpanded(true) }}
        className={`inline-flex items-center gap-2 rounded-lg border-[3px] border-black px-3 py-2 text-xs font-black uppercase ${depth === item ? meta.className : "bg-white"}`}
       >
        <Icon size={14} strokeWidth={3} /> {meta.label}
       </button>
      )
     })}
    </div>
    <p className="mt-4 text-base font-bold leading-relaxed text-black/75">{article.quick}</p>

    {expanded && depth === "learn" && (
     <div className="mt-5 grid gap-3 lg:grid-cols-2">
      {article.learn.map((block) => <ArticleBlock key={block.heading} block={block} />)}
     </div>
    )}

    {expanded && depth === "technical" && (
     <div className="mt-5 grid gap-3 lg:grid-cols-2">
      {technical.length
       ? technical.map((block) => <ArticleBlock key={block.heading} block={block} technical />)
       : <div className="rounded-xl border-[3px] border-black bg-[#F3F4F6] p-4 text-sm font-bold">No technical notes are required for this guide yet.</div>}
     </div>
    )}
   </div>
  </article>
 )
}

const ArticleBlock: React.FC<{ block: GuideArticleDefinition["learn"][number]; technical?: boolean }> = ({ block, technical }) => (
 <section className={`rounded-xl border-[3px] border-black p-4 ${technical ? "bg-[#F3F4F6]" : "bg-white"}`}>
  <h4 className="text-lg font-black uppercase leading-none">{block.heading}</h4>
  <p className="mt-2 text-sm font-bold leading-relaxed text-black/70">{block.body}</p>
  {block.steps?.length ? (
   <ol className="mt-3 space-y-2 pl-5 text-sm font-bold">
    {block.steps.map((step) => <li key={step} className="list-decimal">{step}</li>)}
   </ol>
  ) : null}
  {block.callout ? (
   <div className="mt-3 rounded-lg border-[2px] border-black bg-[#FFD84D] p-3 text-xs font-black uppercase leading-snug">{block.callout}</div>
  ) : null}
 </section>
)
