import React from "react"
import { Columns3, PanelsTopLeft } from "lucide-react"
import EmbeddedProjectKanbanWorkspace from "../components/projects/EmbeddedProjectKanbanWorkspace"
import EmbeddedPublishingSchedule from "../components/projects/EmbeddedPublishingSchedule"
import ProjectBuilderModule from "../components/projects/ProjectBuilderModule"
import ProjectsToolboxModule from "../components/projects/ProjectsToolboxModule"
import StoryboardStudio from "./StoryboardStudio"

/**
 * Projects is deliberately narrow:
 * - Project Builder owns channel/project planning and the content itself.
 * - Project Board owns pipeline position plus the page's only publishing calendar.
 * - Storyboard Studio remains a specialist production tool during migration.
 */
const ProjectCalendarPage: React.FC = () => (
 <div className="mx-auto flex max-w-[1800px] flex-col gap-6 pb-24">
  <section id="project-builder" className="scroll-mt-[86px]">
   <ProjectBuilderModule />
  </section>

  <section id="project-board" className="scroll-mt-[86px]">
   <ProjectsToolboxModule
    title="Project Board"
    subtitle="Move projects through the production pipeline and schedule publishing"
    icon={<Columns3 />}
    paletteIndex={7}
   >
    <div className="grid gap-4">
     <EmbeddedProjectKanbanWorkspace />
     <EmbeddedPublishingSchedule />
    </div>
   </ProjectsToolboxModule>
  </section>

  <section id="storyboard-studio" className="scroll-mt-[86px]">
   <ProjectsToolboxModule
    title="Storyboard Studio"
    subtitle="Plan scenes, sequences and visual structure"
    icon={<PanelsTopLeft />}
    paletteIndex={9}
    isOpenInitial={false}
   >
    <StoryboardStudio embedded collapsible={false} isOpenInitial paletteIndex={1} />
   </ProjectsToolboxModule>
  </section>
 </div>
)

export default ProjectCalendarPage
