import React, { useMemo, useState } from "react"
import { BookOpen, ChevronDown, ChevronUp, Cpu, Zap } from "lucide-react"
import {
 type GuideArticleDefinition,
 type GuidePageDepth,
 GUIDE_PAGES,
} from "../../content/guide-v2"
import { getToolboxPaletteColors } from "../../styles/toolboxPalette"

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
 const palette = getToolboxPaletteColors(Math.max(0, GUIDE_PAGES.findIndex((entry) => entry.id === page.id)))

 return (
  <article id={`guide-${page.id}`} className="scroll-mt-28 overflow-hidden rounded-[14px] border-[4px] border-black bg-white shadow-[4px_4px_0_0_#000]">
   <div className="flex min-w-0 items-stretch border-b-[4px] border-black" style={{ backgroundColor: palette.header }}>
    <span className="flex w-12 shrink-0 items-center justify-center border-r-[3px] border-black text-black" style={{ backgroundColor: palette.icon }}><BookOpen size={20} strokeWidth={3} /></span>
    <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-2 px-3 py-2">
    <div className="min-w-0">
     <p className="text-[10px] font-black uppercase tracking-[.18em] text-black/45">{page.domain} guide</p>
     <h3 className="truncate text-lg font-black uppercase leading-none sm:text-xl">{page.title}</h3>
    </div>
    <button
     onClick={() => setExpanded((value) => !value)}
     className="inline-flex items-center gap-1.5 rounded-lg border-[3px] border-black bg-white px-2.5 py-1.5 text-[10px] font-black uppercase shadow-[2px_2px_0_0_#000]"
    >
     {expanded ? "Collapse" : "Open guide"}
     {expanded ? <ChevronUp size={16} strokeWidth={3} /> : <ChevronDown size={16} strokeWidth={3} />}
    </button>
    </div>
   </div>
   <div className="grid gap-2 p-3 lg:grid-cols-[auto_1fr] lg:items-center">
    <div className="flex flex-wrap gap-1.5">
     {availableDepths.map((item) => {
      const meta = depthMeta[item]
      const Icon = meta.icon
      return (
       <button
        key={item}
        onClick={() => { setDepth(item); setExpanded(true) }}
        className={`inline-flex items-center gap-1.5 rounded-md border-[2px] border-black px-2 py-1.5 text-[10px] font-black uppercase ${depth === item ? meta.className : "bg-white"}`}
       >
        <Icon size={14} strokeWidth={3} /> {meta.label}
       </button>
      )
     })}
    </div>
    <p className="text-sm font-bold leading-snug text-black/70">{article.quick}</p>

    {expanded && depth === "learn" && (
     <div className="grid gap-2 lg:col-span-2 lg:grid-cols-2">
      {article.learn.map((block) => <ArticleBlock key={block.heading} block={block} />)}
     </div>
    )}

    {expanded && depth === "technical" && (
     <div className="grid gap-2 lg:col-span-2 lg:grid-cols-2">
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
 <section className={`rounded-lg border-[3px] border-black p-3 ${technical ? "bg-[#F3F4F6]" : "bg-white"}`}>
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
