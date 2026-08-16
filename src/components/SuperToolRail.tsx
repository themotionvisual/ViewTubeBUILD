import React from "react"
import type { SuperToolDefinition } from "@/types"

interface SuperToolRailProps {
 title: string
 subtitle: string
 tools: SuperToolDefinition[]
 accentClassName?: string
 note?: string
}

export const SuperToolRail: React.FC<SuperToolRailProps> = ({
 title,
 subtitle,
 tools,
 accentClassName = "bg-[#CCFF00]",
 note,
}) => {
 if (!tools.length) return null

 return (
  <section className="border-[4px] border-black rounded-[22px] overflow-hidden bg-white shadow-[10px_10px_0px_0px_black]">
   <div className={`${accentClassName} border-b-[4px] border-black px-6 py-5`}>
    <div className="text-[11px] font-black uppercase tracking-[0.3em] text-black/60">
     Super-Tool OS
    </div>
    <h3 className="text-3xl font-[1000] uppercase tracking-[-0.05em] text-black">
     {title}
    </h3>
    <p className="mt-2 text-[11px] font-black uppercase tracking-[0.18em] text-black/70">
     {subtitle}
    </p>
   </div>

   <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
    {tools.map((tool) => (
     <article
      key={tool.id}
      className="flex h-full flex-col rounded-[18px] border-[4px] border-black bg-[#f7f4ea] shadow-[6px_6px_0px_0px_black]"
     >
      <div className="border-b-[4px] border-black bg-white px-4 py-3">
       <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/55">
        {tool.category} · {tool.surface}
       </div>
       <div className="mt-1 text-xl font-[1000] uppercase leading-none tracking-[-0.04em]">
        {tool.title}
       </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
       <p className="text-sm font-bold leading-5 text-black/75">{tool.summary}</p>
       <div className="text-[10px] font-black uppercase tracking-[0.18em] text-black/60">
        Source of truth: {tool.sourceOfTruth}
       </div>
       <div className="text-[10px] font-black uppercase tracking-[0.18em] text-black/60">
        Brain hook: {tool.brainHook}
       </div>
       <div className="mt-auto flex items-center justify-between gap-3 pt-3">
        <div className="rounded-[10px] border-[3px] border-black bg-[#FF4FD8] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white">
         {tool.status.replace("-", " ")}
        </div>
        <div className="text-right text-[10px] font-black uppercase tracking-[0.16em] text-black/55">
         {tool.routes.join(" · ")}
        </div>
       </div>
      </div>
     </article>
    ))}
   </div>

   {note ? (
    <div className="border-t-[4px] border-black bg-[#111] px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white/80">
     {note}
    </div>
   ) : null}
  </section>
 )
}
