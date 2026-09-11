import React from "react";
import { ProjectStudio } from "../components/ProjectStudio";
import StoryboardStudio from "./StoryboardStudio";
import ProjectCommandKanban from "./ProjectCommandKanban";
import PublishingScheduleArchitect from "./PublishingScheduleArchitect";

/**
 * Projects surface.
 *
 * Project Command Kanban and Publishing Schedule Architect are mounted here
 * because that is where the super-tool registry routes them ("/projects"). Both
 * render as collapsed house toolboxes so the page reads as one stack of modules
 * rather than three competing heroes.
 */
const ProjectCalendarPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-8 max-w-[1600px] mx-auto pb-24">
      <ProjectStudio />
      <StoryboardStudio collapsible isOpenInitial={false} paletteIndex={1} />

      <div id="project-kanban" className="scroll-mt-24">
        <ProjectCommandKanban collapsible isOpenInitial={false} paletteIndex={2} />
      </div>

      <div id="publishing-schedule" className="scroll-mt-24">
        <PublishingScheduleArchitect collapsible isOpenInitial={false} paletteIndex={3} />
      </div>
    </div>
  );
};

export default ProjectCalendarPage;
