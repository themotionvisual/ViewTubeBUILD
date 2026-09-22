import React from "react"
import { Toolbox } from "../Toolbox"

type ProjectsToolboxModuleProps = {
 title: string
 subtitle: string
 icon: React.ReactNode
 paletteIndex: number
 children: React.ReactNode
 isOpenInitial?: boolean
 headerActions?: React.ReactNode
}

/** Canonical level-0 Projects toolbox: one exterior shell, then subtoolboxes/components. */
const ProjectsToolboxModule: React.FC<ProjectsToolboxModuleProps> = ({
 title,
 subtitle,
 icon,
 paletteIndex,
 children,
 isOpenInitial = true,
 headerActions,
}) => (
 <Toolbox
  variant="scaffold"
  title={title}
  subtitle={subtitle}
  icon={icon}
  paletteIndex={paletteIndex}
  collapsible
  isOpenInitial={isOpenInitial}
  headerActions={headerActions}
  contentClassName="bg-white p-0"
  outerClassName="w-full"
 >
  <div
   className="min-w-0"
   data-vt-project-toolbox-content="true"
   data-vt-project-level="main-toolbox"
  >
   {children}
  </div>
 </Toolbox>
)

export default ProjectsToolboxModule
