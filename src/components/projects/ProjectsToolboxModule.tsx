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
 * Projects tools historically shipped with their own framed presentation shell.
 * When mounted here that produced a Toolbox -> module-shell -> tool composition.
 * The Projects page owns the presentation shell now: the immediate child is
 * deliberately flattened while all of the tool's functional interior UI stays intact.
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
   className="min-w-0 [&>div]:!rounded-none [&>div]:!border-0 [&>div]:!shadow-none"
   data-vt-project-toolbox-content="true"
   data-vt-project-level="main-toolbox"
  >
   {children}
  </div>
 </Toolbox>
)

export default ProjectsToolboxModule