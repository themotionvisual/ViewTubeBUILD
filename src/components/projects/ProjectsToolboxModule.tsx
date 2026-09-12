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

/** Canonical level-0 Projects toolbox. Internal tool UI remains content; this shell owns main-toolbox geometry. */
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
  contentClassName="bg-white p-[10px]"
  outerClassName="w-full"
 >
  <div className="min-w-0" data-vt-project-toolbox-content="true">
   {children}
  </div>
 </Toolbox>
)

export default ProjectsToolboxModule
