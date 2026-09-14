import React, { useMemo } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Boxes } from "lucide-react"
import {
 MOUNTABLE_SUPER_TOOL_IDS,
 superToolRoute,
} from "../app/superToolViewRegistry"
import { getSuperTool } from "../services/superToolRegistry"
import { SUPER_TOOL_RUNTIME_PLAN_RECORDS } from "../services/superToolRuntimePlanRegistry"
import { getToolboxPaletteColors } from "../styles/toolboxPalette"
import type { SuperToolDefinition, SuperToolSurface } from "../types"

/**
 * Index of every internal super-tool this build can open (`/tools`).
 *
 * Driven entirely by the registries — a tool added to the view registry shows
 * up here without touching this file.
 */

const SURFACE_ORDER: SuperToolSurface[] = [
 "studio",
 "projects",
 "editor",
 "analytics",
 "brain",
 "workflow",
 "vault",
 "dashboard",
]

const SURFACE_LABEL: Record<SuperToolSurface, string> = {
 studio: "Studio",
 projects: "Projects",
 editor: "Editor",
 analytics: "Analytics",
 brain: "Brain",
 workflow: "Workflow",
 vault: "Vault",
 dashboard: "Dashboard",
}

const SuperToolIndex: React.FC = () => {
 const grouped = useMemo(() => {
  const tools = MOUNTABLE_SUPER_TOOL_IDS.map((id) => getSuperTool(id)).filter(
   (tool): tool is SuperToolDefinition => Boolean(tool),
  )
  return SURFACE_ORDER.map((surface) => ({
   surface,
   tools: tools.filter((tool) => tool.surface === surface),
  })).filter((group) => group.tools.length > 0)
 }, [])

 return (
  <div className="mx-auto flex max-w-[1500px] flex-col gap-8 pb-24">
   <header className="mt-4 px-2 text-center">
    <h2 className="text-6xl font-[1000] uppercase leading-none tracking-[-0.06em] text-black md:text-7xl">
     INTERNAL <span className="text-[#FA618A]">TOOLS</span>
    </h2>
    <p className="mt-4 text-[10px] font-black uppercase tracking-[0.4em] text-black/30">
     {MOUNTABLE_SUPER_TOOL_IDS.length} super-tool prototypes · lab surfaces
    </p>
   </header>

   <div className="rounded-[22px] border-[4px] border-black bg-[#FFEA5A] px-6 py-5 shadow-[8px_8px_0px_0px_black]">
    <p className="text-xs font-black uppercase leading-relaxed tracking-[0.08em] text-black/75">
     These are working prototypes. They read and write real Brain signals, Vault artifacts and
     workflow chains — but their boards are still seeded with example rows, so treat anything
     that looks like channel data as sample content until the tool says otherwise.
    </p>
   </div>

   {grouped.map((group, groupIndex) => (
    <section key={group.surface} className="flex flex-col gap-4">
     <div className="flex items-baseline gap-3 border-b-[4px] border-black pb-3">
      <h3 className="text-3xl font-[1000] uppercase tracking-[-0.03em]">
       {SURFACE_LABEL[group.surface]}
      </h3>
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">
       {group.tools.length} {group.tools.length === 1 ? "tool" : "tools"}
      </span>
     </div>

     <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {group.tools.map((tool, toolIndex) => {
       const plan = SUPER_TOOL_RUNTIME_PLAN_RECORDS[tool.id]
       const palette = getToolboxPaletteColors(groupIndex * 3 + toolIndex)
       return (
        <Link
         key={tool.id}
         to={superToolRoute(tool.id)}
         className="group flex h-full flex-col overflow-hidden rounded-[18px] border-[4px] border-black bg-white shadow-[6px_6px_0px_0px_black] transition-transform hover:-translate-x-[2px] hover:-translate-y-[2px]">
         <div
          className="flex items-center gap-3 border-b-[4px] border-black px-4 py-3"
          style={{ backgroundColor: palette.header }}>
          <span className="grid size-9 shrink-0 place-items-center rounded-lg border-[3px] border-black bg-white">
           <Boxes size={16} strokeWidth={3} />
          </span>
          <span className="min-w-0 flex-1 truncate text-base font-[1000] uppercase tracking-[-0.02em]">
           {tool.title}
          </span>
          <ArrowRight
           size={18}
           strokeWidth={3}
           className="shrink-0 transition-transform group-hover:translate-x-1"
          />
         </div>
         <div className="flex flex-1 flex-col gap-3 p-4">
          <p className="text-xs font-bold leading-relaxed text-black/70">{tool.summary}</p>
          <div className="mt-auto flex flex-wrap gap-2">
           <span className="rounded border-[2px] border-black bg-[#F6F6F9] px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em]">
            {tool.category}
           </span>
           {plan ? (
            <span className="rounded border-[2px] border-black bg-white px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-black/60">
             Agent {String(plan.agentNumber).padStart(2, "0")}
            </span>
           ) : null}
          </div>
          {plan?.nextStep ? (
           <p className="border-t-[2px] border-black/10 pt-2 text-[9px] font-black uppercase leading-relaxed tracking-[0.08em] text-black/40">
            Next: {plan.nextStep}
           </p>
          ) : null}
         </div>
        </Link>
       )
      })}
     </div>
    </section>
   ))}
  </div>
 )
}

export default SuperToolIndex
