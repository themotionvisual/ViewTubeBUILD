import React from "react"
import { Toolbox } from "../Toolbox"

type ProjectsToolboxModuleProps = {
 title: string
 subtitle: string
 icon: React.ReactNode
 paletteIndex: number
 children: React.ReactNode
 isOpenInitial?: boolean
}

/**
 * Canonical level-0 Projects toolbox.
 *
 * The level-0 Toolbox owns the only tool title/header and exterior geometry.
 * Legacy project tools may still render a presentation wrapper and a first header;
 * those are presentation-only and are flattened here while their functional
 * controls, subtoolboxes, boards, calendars and dialogs remain intact.
 */
const ProjectsToolboxModule: React.FC<ProjectsToolboxModuleProps> = ({
 title,
 subtitle,
 icon,
 paletteIndex,
 children,
 isOpenInitial = true,
}) => (
 <Toolbox
  variant="scaffold"
  title={title}
  subtitle={subtitle}
  icon={icon}
  paletteIndex={paletteIndex}
  collapsible
  isOpenInitial={isOpenInitial}
  contentClassName="bg-white p-0"
  outerClassName="w-full"
 >
  <div
   className="min-w-0 [&>div]:!rounded-none [&>div]:!border-0 [&>div]:!shadow-none [&>div>header:first-child]:!hidden"
   data-vt-project-toolbox-content="true"
   data-vt-project-level="main-toolbox"
  >
   {children}
  </div>
 </Toolbox>
)

export default ProjectsToolboxModule
