import React from "react";
import ProjectKanbanWorkspace from "../components/projects/ProjectKanbanWorkspace";
import { ProjectStudio } from "../components/ProjectStudio";
import StoryboardStudio from "./StoryboardStudio";
import PublishingScheduleArchitect from "./PublishingScheduleArchitect";

/**
 * User-facing Projects workspace.
 *
 * The project board and publishing calendar are the primary planning surfaces.
 * Both work against the existing persisted Brain project records: board-specific
 * lane/order/filter metadata stays isolated in the project workspace store,
 * while schedule dates write directly to each project's publishDate field.
 * Internal Project Command and Publishing Architect workbenches are deliberately
 * not mounted here; creator workflows expose projects, dates, progress, and
 * actions instead of system architecture.
 */
const ProjectCalendarPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 max-w-[1800px] mx-auto pb-24">
      <div id="project-kanban" className="scroll-mt-24">
        <ProjectKanbanWorkspace />
      </div>

      <div id="publishing-schedule" className="scroll-mt-24">
        <PublishingScheduleArchitect collapsible isOpenInitial paletteIndex={3} />
      </div>

      <ProjectStudio />
      <StoryboardStudio collapsible isOpenInitial={false} paletteIndex={1} />
    </div>
  );
};

export default ProjectCalendarPage;
