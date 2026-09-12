import React from "react"
import { CalendarDays, Columns3, FolderKanban, PanelsTopLeft, Workflow } from "lucide-react"
import ProjectKanbanWorkspace from "../components/projects/ProjectKanbanWorkspace"
import ProjectsToolboxModule from "../components/projects/ProjectsToolboxModule"
import ContentAssetEngine from "../components/projects/ContentAssetEngine"
import { ProjectStudio } from "../components/ProjectStudio"
import StoryboardStudio from "./StoryboardStudio"
import PublishingScheduleArchitect from "./PublishingScheduleArchitect"

/** Projects is a toolbox workspace: each creator tool is an independent level-0 Toolbox module. */
const ProjectCalendarPage: React.FC = () => (
 <div className="mx-auto flex max-w-[1800px] flex-col gap-6 pb-24">
  <section id="project-kanban" className="scroll-mt-[86px]">
   <ProjectsToolboxModule title="Project Board" subtitle="Move projects from idea to published" icon={<Columns3 />} paletteIndex={0}>
    <ProjectKanbanWorkspace />
   </ProjectsToolboxModule>
  </section>

  <section id="content-asset-engine" className="scroll-mt-[86px]">
   <ProjectsToolboxModule title="Content Asset Engine" subtitle="Choose a content build and manage its complete asset pipeline" icon={<Workflow />} paletteIndex={1} isOpenInitial={false}>
    <ContentAssetEngine />
   </ProjectsToolboxModule>
  </section>

  <section id="publishing-schedule" className="scroll-mt-[86px]">
   <ProjectsToolboxModule title="Publishing Schedule" subtitle="Plan deadlines, production dates and publishing" icon={<CalendarDays />} paletteIndex={3}>
    <PublishingScheduleArchitect collapsible={false} isOpenInitial paletteIndex={3} />
   </ProjectsToolboxModule>
  </section>

  <section id="project-studio" className="scroll-mt-[86px]">
   <ProjectsToolboxModule title="Project Studio" subtitle="Build and manage the working project" icon={<FolderKanban />} paletteIndex={6} isOpenInitial={false}>
    <ProjectStudio />
   </ProjectsToolboxModule>
  </section>

  <section id="storyboard-studio" className="scroll-mt-[86px]">
   <ProjectsToolboxModule title="Storyboard Studio" subtitle="Plan scenes, sequences and visual structure" icon={<PanelsTopLeft />} paletteIndex={9} isOpenInitial={false}>
    <StoryboardStudio collapsible={false} isOpenInitial paletteIndex={1} />
   </ProjectsToolboxModule>
  </section>
 </div>
)

export default ProjectCalendarPage
