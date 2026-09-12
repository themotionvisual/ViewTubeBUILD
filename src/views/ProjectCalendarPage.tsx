import React from "react";
import ProjectKanbanWorkspace from "../components/projects/ProjectKanbanWorkspace";
import { ProjectStudio } from "../components/ProjectStudio";
import StoryboardStudio from "./StoryboardStudio";
import PublishingScheduleArchitect from "./PublishingScheduleArchitect";

/**
 * User-facing Projects workspace.
 *
 * The Kanban board is the primary project-management surface. It works against
 * the existing persisted Brain project records while its lane/order/filter
 * metadata is isolated in the projects workspace store. The older internal
 * Project Command workbench is intentionally not mounted here anymore: creator
 * workflows should expose projects and actions, not system/tool architecture.
 *
 * ProjectStudio and the publishing scheduler remain below the board while the
 * calendar/scheduling phase is rebuilt against the same shared project model.
 */
const ProjectCalendarPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 max-w-[1800px] mx-auto pb-24">
      <div id="project-kanban" className="scroll-mt-24">
        <ProjectKanbanWorkspace />
      </div>

      <ProjectStudio />
      <StoryboardStudio collapsible isOpenInitial={false} paletteIndex={1} />

      <div id="publishing-schedule" className="scroll-mt-24">
        <PublishingScheduleArchitect collapsible isOpenInitial={false} paletteIndex={3} />
      </div>
    </div>
  );
};

export default ProjectCalendarPage;
