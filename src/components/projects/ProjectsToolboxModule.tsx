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
  {/*
   * A tool mounted here renders its body only: this module owns the level-0
   * frame, header and collapse. Tools opt in with chrome="none" rather than
   * having their shell stripped from the outside.
   *
   * This wrapper used to carry eight `!important` arbitrary-variant overrides.
   * Measured in Chromium, two of them matched nothing anywhere on the page
   * (`[&>div>header:first-child]:!hidden` and the legacy-header selector, whose
   * attribute no source sets), and the rest could only reach a direct child —
   * so the nested frames inside Project Studio and Storyboard Studio kept their
   * headers, and Storyboard Studio showed its title twice.
   */}
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
