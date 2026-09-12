import React from "react";
import ProjectKanbanWorkspace from "../components/projects/ProjectKanbanWorkspace";
import { ProjectStudio } from "../components/ProjectStudio";
import StoryboardStudio from "./StoryboardStudio";
import PublishingScheduleArchitect from "./PublishingScheduleArchitect";

/**
 * Creator-facing Projects page.
 *
 * Each major project tool remains its own toolbox module. We deliberately do
 * not turn the tools into page-level tabs: Board, Scheduling, Project Studio,
 * and Storyboard retain their own headers, colored identities, collapse
 * controls, borders, shadows, and independent toolbox composition.
 */
const ProjectCalendarPage: React.FC = () => {
  return (
    <div className="mx-auto flex max-w-[1800px] flex-col gap-4 pb-24">
      <section id="project-kanban" className="scroll-mt-[86px]" aria-label="Project board toolbox">
        <ProjectKanbanWorkspace />
      </section>

      <section id="publishing-schedule" className="scroll-mt-[86px]" aria-label="Publishing schedule toolbox">
        <PublishingScheduleArchitect collapsible isOpenInitial paletteIndex={3} />
      </section>

      <section id="project-studio" className="scroll-mt-[86px]" aria-label="Project studio toolbox">
        <ProjectStudio />
      </section>

      <section id="storyboard-studio" className="scroll-mt-[86px]" aria-label="Storyboard studio toolbox">
        <StoryboardStudio collapsible isOpenInitial={false} paletteIndex={1} />
      </section>
    </div>
  );
};

export default ProjectCalendarPage;
