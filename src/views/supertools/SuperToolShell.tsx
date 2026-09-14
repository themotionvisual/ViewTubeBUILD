import React, { useState } from "react"
import { Boxes, Share2 } from "lucide-react"
import { SubToolbox, ToolboxScaffold } from "../../components/Toolbox"
import type { SuperToolDefinition } from "../../types"

/**
 * House chrome for the internal super-tools that own bespoke interiors.
 *
 * The four prototype-workspace tools (Shorts, Workflow Chain, Brain Command,
 * Retention Autopsy) each painted the same black hero plus a SuperToolRail
 * above their own sections. That header is the part that looked foreign next
 * to the rest of the app, so it moves here: one ToolboxScaffold, the sister
 * tools folded into a sub-toolbox, and the hub prop shape every other module
 * takes. The interiors are untouched and convert section by section.
 */
export interface SuperToolMountProps {
 embedded?: boolean
 collapsible?: boolean
 isOpenInitial?: boolean
 paletteIndex?: number
}

export interface SuperToolShellProps extends SuperToolMountProps {
 toolNumber: string
 title: string
 subtitle: string
 icon?: React.ReactNode
 accentClassName?: string
 railTitle: string
 railSubtitle: string
 railNote: string
 sisterTools: SuperToolDefinition[]
 headerActions?: React.ReactNode
 children: React.ReactNode
}

export const SuperToolShell: React.FC<SuperToolShellProps> = ({
 toolNumber,
 title,
 subtitle,
 icon,
 accentClassName = "bg-[#CCFF00]",
 railTitle,
 railSubtitle,
 railNote,
 sisterTools,
 headerActions,
 embedded = false,
 collapsible = false,
 isOpenInitial = true,
 paletteIndex,
 children,
}) => {
 const [isOpen, setIsOpen] = useState(isOpenInitial)

 return (
  <ToolboxScaffold
   title={title}
   subtitle={subtitle}
   icon={icon || <Boxes />}
   paletteIndex={paletteIndex}
   headerColor={accentClassName}
   collapsible={collapsible}
   isOpen={collapsible ? isOpen : true}
   onToggle={() => setIsOpen((open) => !open)}
   embedded={embedded}
   headerActions={headerActions}
   helpText={`Super-tool ${toolNumber}. ${subtitle} ${railNote}`}
   contentClassName={embedded ? "p-0" : "p-4 sm:p-6 lg:p-8"}>
   <div className="flex w-full flex-col gap-8">
    {children}

    {sisterTools.length ?
     <SubToolbox
      title="Sister Tools"
      icon={<Share2 />}
      collapsible
      isOpenInitial={false}
      helpText={`${railTitle}. ${railSubtitle} ${railNote}`}>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
       {sisterTools.map((tool) => (
        <article key={tool.id} className="rounded-[12px] border-[3px] border-black bg-white px-3 py-2">
         <div className="text-[9px] font-black uppercase tracking-[0.18em] text-black/50">
          {tool.category} · {tool.surface}
         </div>
         <div className="mt-1 text-sm font-[1000] uppercase leading-tight tracking-[-0.02em]">{tool.title}</div>
         <p className="mt-1 text-xs font-bold leading-5 text-black/70">{tool.summary}</p>
        </article>
       ))}
      </div>
     </SubToolbox>
    : null}
   </div>
  </ToolboxScaffold>
 )
}

export default SuperToolShell
