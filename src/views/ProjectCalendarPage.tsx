import React from "react"
import { CalendarDays, Columns3, FolderKanban, PanelsTopLeft, Target, Workflow } from "lucide-react"
import EmbeddedProjectKanbanWorkspace from "../components/projects/EmbeddedProjectKanbanWorkspace"
import ProjectsToolboxModule from "../components/projects/ProjectsToolboxModule"
import ContentAssetEngine from "../components/projects/ContentAssetEngine"
import ChannelPlanningSubtoolboxes from "../components/projects/ChannelPlanningSubtoolboxes"
import EmbeddedProjectStudio from "../components/projects/EmbeddedProjectStudio"
import StoryboardStudio from "./StoryboardStudio"
import EmbeddedPublishingSchedule from "../components/projects/EmbeddedPublishingSchedule"

/** Projects is a toolbox workspace: each creator tool is an independent level-0 Toolbox module. */
const ProjectCalendarPage: React.FC = () => (
 <div className="mx-auto flex max-w-[1800px] flex-col gap-6 pb-24">
  <section id="project-kanban" className="scroll-mt-[86px]">
   <ProjectsToolboxModule title="Project Board" subtitle="Move projects from idea to published" icon={<Columns3 />} paletteIndex={0}>
    <EmbeddedProjectKanbanWorkspace />
   </ProjectsToolboxModule>
  </section>

  <section id="channel-planning" className="scroll-mt-[86px]">
   <ProjectsToolboxModule title="Channel Planning" subtitle="Turn your channel profile and AI Brain knowledge into focused tasks and measurable goals" icon={<Target />} paletteIndex={2}>
    <ChannelPlanningSubtoolboxes />
   </ProjectsToolboxModule>
  </section>

  <section id="content-asset-engine" className="scroll-mt-[86px]">
   <ProjectsToolboxModule title="Content Asset Engine" subtitle="Choose a content build and manage its complete asset pipeline" icon={<Workflow />} paletteIndex={1} isOpenInitial={false}>
    <ContentAssetEngine />
   </ProjectsToolboxModule>
  </section>

  <section id="publishing-schedule" className="scroll-mt-[86px]">
   <ProjectsToolboxModule title="Publishing Schedule" subtitle="Plan deadlines, production dates and publishing" icon={<CalendarDays />} paletteIndex={3}>
    <EmbeddedPublishingSchedule />
   </ProjectsToolboxModule>
  </section>

  <section id="project-studio" className="scroll-mt-[86px]">
   <ProjectsToolboxModule title="Project Studio" subtitle="Build and manage the working project" icon={<FolderKanban />} paletteIndex={6} isOpenInitial={false}>
    <EmbeddedProjectStudio />
   </ProjectsToolboxModule>
  </section>

  <section id="storyboard-studio" className="scroll-mt-[86px]">
   <ProjectsToolboxModule title="Storyboard Studio" subtitle="Plan scenes, sequences and visual structure" icon={<PanelsTopLeft />} paletteIndex={9} isOpenInitial={false}>
    <StoryboardStudio embedded collapsible={false} isOpenInitial paletteIndex={1} />
   </ProjectsToolboxModule>
  </section>
 </div>
)

export default ProjectCalendarPage
